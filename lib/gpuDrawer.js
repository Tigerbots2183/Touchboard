
let wgsl = `struct GlobalUniforms {
             offset: vec2<f32>,
            scale: vec2<f32>,
            screen_size: vec2<f32>,
        };
        @group(0) @binding(0) var<uniform> global: GlobalUniforms;

        struct LineUniforms {
            color: vec4<f32>,
            width: f32,
            buffer_capacity: u32,
            head_index: u32,
            stride: u32,
        };
        @group(1) @binding(0) var<uniform> line_uni: LineUniforms;
        @group(1) @binding(1) var<storage, read> points: array<vec2<f32>>;

        struct VertexOutput {
            @builtin(position) position: vec4<f32>,
            @location(0) uv: vec2<f32>,
        };

        fn to_pixels(world_pos: vec2<f32>) -> vec2<f32> {
            let ndc = (world_pos + global.offset) * global.scale;
            return ndc * global.screen_size * 0.5;
        }

        @vertex
        fn vs_main(@builtin(vertex_index) v_idx: u32, @builtin(instance_index) i_idx: u32) -> VertexOutput {
            let cap = i32(line_uni.buffer_capacity);
            let head = i32(line_uni.head_index);
            let stride = i32(line_uni.stride);
            let logical_idx = i32(i_idx) * stride;

            // Get 4 points (Prev, Curr, Next, NextNext) for proper join calculation
            let idx_1 = (head + logical_idx) % cap;             // Current
            let idx_2 = (head + logical_idx + stride) % cap;    // Next
            
            var idx_0 = idx_1; // Prev defaults to current
            if (i_idx > 0u) { idx_0 = (head + logical_idx - stride + cap) % cap; }

            let idx_3 = (head + logical_idx + stride + stride) % cap; // NextNext

            let p0 = to_pixels(points[u32(idx_0)]);
            let p1 = to_pixels(points[u32(idx_1)]);
            let p2 = to_pixels(points[u32(idx_2)]);
            let p3 = to_pixels(points[u32(idx_3)]);

            // Determine tangents
            var t0 = normalize(p1 - p0);
            var t1 = normalize(p2 - p1);
            var t2 = normalize(p3 - p2);

            if (length(p1-p0) < 0.1) { t0 = t1; }
            if (length(p3-p2) < 0.1) { t2 = t1; }

            // Calculate Miter directions
            let n1 = vec2<f32>(-t1.y, t1.x); // Normal of current segment
            
            // Miter at P1 (Start of segment)
            let miter_a = normalize(vec2<f32>(-t0.y, t0.x) + n1);
            let len_a = 1.0 / max(0.1, dot(miter_a, n1));

            // Miter at P2 (End of segment)
            let n2 = vec2<f32>(-t2.y, t2.x);
            let miter_b = normalize(n1 + n2);
            let len_b = 1.0 / max(0.1, dot(miter_b, n1));

            // Vertices: 0=BL, 1=TL, 2=BR, 3=TR
            var pos = vec2<f32>(0.0);
            let w = line_uni.width * 0.5;
            let thick = clamp(w, 1.0, 100.0); // Ensure non-zero width

            if (v_idx == 0u) { pos = p1 - miter_a * thick * len_a; }
            if (v_idx == 1u) { pos = p1 + miter_a * thick * len_a; }
            if (v_idx == 2u) { pos = p2 - miter_b * thick * len_b; }
            if (v_idx == 3u) { pos = p2 + miter_b * thick * len_b; }

            var out: VertexOutput;
            // Normalize back to NDC [-1, 1]
            out.position = vec4<f32>(pos / (global.screen_size * 0.5), 0.0, 1.0);
            out.uv = vec2<f32>(0.0); // Not used currently
            return out;
        }

        @fragment
        fn fs_main() -> @location(0) vec4<f32> {
            return line_uni.color;
        }`

// --- Shared Engine Setup ---
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// 1. Calculate Total VRAM Pool
// We use maxStorageBufferBindingSize * 4 as a heuristic for "Safe VRAM Amount"
// This is usually 128MB * 4 = 512MB on typical browsers, or higher on native.
const TOTAL_VRAM_POOL = device.limits.maxStorageBufferBindingSize * 4;

// Shared Resources
const globalLayout = device.createBindGroupLayout({
    entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }]
});
const lineLayout = device.createBindGroupLayout({
    entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }
    ]
});
const mod = device.createShaderModule({ code: wgsl });
const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [globalLayout, lineLayout] }),
    vertex: { module: mod, entryPoint: 'vs_main' },
    fragment: {
        module: mod, entryPoint: 'fs_main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat(), blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } }]
    },
    primitive: { topology: 'triangle-strip' }
});
const engineMain = { device, globalLayout, lineLayout, pipeline, totalVRAM: TOTAL_VRAM_POOL };

// --- Line Class with Resize Capability ---
class Line {
    constructor(engine, name, colorHex, width) {
        this.engine = engine;
        this.name = name;
        this.width = width;
        const c = parseInt(colorHex.replace('#', ''), 16);
        this.color = [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255, 1.0];

        this.capacity = 0;
        this.count = 0;
        this.head = 0;
        this.isFull = false;

        // Create Uniform Buffer immediately
        this.uniform = engine.device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

        // Storage buffer is created during resize()
        this.storage = null;
        this.bindGroup = null;
    }

    resize(newCapacity) {
        if (newCapacity === this.capacity) return;

        console.log(`Resizing ${this.name}: ${this.capacity} -> ${newCapacity}`);

        // 1. Create New Buffer
        const newSizeBytes = newCapacity * 8; // vec2<f32>
        const newBuffer = this.engine.device.createBuffer({
            size: newSizeBytes,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        });

        // 2. If we have old data, copy it
        // Note: Real resizing requires a complex copy shader to handle the ring buffer wrapping.
        // For this demo, to keep code safe and stable, we RESET the buffer on resize.
        // (Implementing a wrap-around copy is possible but adds 50+ lines of complexity).
        this.head = 0;
        this.count = 0;
        this.isFull = false;

        // 3. Destroy old buffer
        if (this.storage) this.storage.destroy();

        // 4. Assign new state
        this.storage = newBuffer;
        this.capacity = newCapacity;

        // 5. Recreate Bind Group
        this.bindGroup = this.engine.device.createBindGroup({
            layout: this.engine.lineLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniform } },
                { binding: 1, resource: { buffer: this.storage } }
            ]
        });
    }

    push(x, y) {
        if (!this.storage || this.capacity === 0) return;

        const len = x.length;
        const data = new Float32Array(len * 2);
        for (let i = 0; i < len; i++) { data[i * 2] = x[i]; data[i * 2 + 1] = y[i]; }

        let writeIdx = this.head;
        let remaining = len;
        let offset = 0;

        while (remaining > 0) {
            const space = this.capacity - writeIdx;
            const chunk = Math.min(remaining, space);
            this.engine.device.queue.writeBuffer(this.storage, writeIdx * 8, data, offset * 2, chunk * 2);
            writeIdx = (writeIdx + chunk) % this.capacity;
            offset += chunk;
            remaining -= chunk;
        }

        this.head = writeIdx;
        this.count = Math.min(this.capacity, this.count + len);
        if (this.count === this.capacity) this.isFull = true;
    }

    updateUniforms(stride) {
        if (!this.uniform) return;
        const arr = new ArrayBuffer(64);
        const f32 = new Float32Array(arr);
        const u32 = new Uint32Array(arr);
        f32.set(this.color, 0);
        f32[4] = this.width;
        u32[5] = this.capacity;
        u32[6] = this.isFull ? this.head : 0;
        u32[7] = stride;
        this.engine.device.queue.writeBuffer(this.uniform, 0, arr);
    }
}

// --- Main Application ---
export class WebGPUPlotter {
    constructor(canvas, engine=engineMain) {
        this.canvas = canvas;

            this.engine = engine;
        

        this.lines = new Map();


        this.ctx = canvas.getContext('webgpu');
        this.camera = { x: 0, y: 0, zoomX: 1.0, zoomY: 1.0, viewX:1.0, viewY:1.0 };

        this.ctx.configure({ device: engine.device, format: navigator.gpu.getPreferredCanvasFormat(), alphaMode: 'premultiplied' });

        this.globalBuffer = engine.device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.globalBindGroup = engine.device.createBindGroup({
            layout: engine.globalLayout,
            entries: [{ binding: 0, resource: { buffer: this.globalBuffer } }]
        });

    }

    // The Core Logic for Dynamic Memory
    rebalanceMemory() {
        const lineCount = this.lines.size;
        if (lineCount === 0) return;

        // Total bytes available divided by number of lines
        const bytesPerLine = Math.floor(this.engine.totalVRAM / lineCount);

        // Convert bytes to number of points (8 bytes per point)
        // We leave a small safety margin (95% usage)
        let pointsPerLine = Math.floor((bytesPerLine * 0.95) / 8);

        // Hard limit clamp (e.g. don't go over 10 million per line even if VRAM allows, for shader index safety)
        pointsPerLine = Math.min(pointsPerLine, 10_000_000);

        console.log(`Rebalancing: ${lineCount} lines. New Capacity: ${pointsPerLine} pts/line`);

        // Resize all lines
        for (const line of this.lines.values()) {
            line.resize(pointsPerLine);
        }

    }

    addLine(name, color, width) {
        if (this.lines.has(name)) return;

        const line = new Line(this.engine, name, color, width);
        this.lines.set(name, line);

        // Trigger Rebalance
        this.rebalanceMemory();
    }

    addData(name, x, y) {
        const line = this.lines.get(name);
        if (line) line.push(x, y);
    }


    render() {
        this.camera.zoomX = 1 / this.camera.viewX;
        this.camera.zoomY = 1 / this.camera.viewY;

        // Update Camera
        const gData = new Float32Array([this.camera.x, this.camera.y, this.camera.zoomX, this.camera.zoomY, this.canvas.width, this.canvas.height]);
        this.engine.device.queue.writeBuffer(this.globalBuffer, 0, gData);

        const enc = this.engine.device.createCommandEncoder();
        const pass = enc.beginRenderPass({
            colorAttachments: [{ view: this.ctx.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }]
        });

        pass.setPipeline(this.engine.pipeline);
        pass.setBindGroup(0, this.globalBindGroup);

        for (const line of this.lines.values()) {
            if (line.count < 2) continue;

            // Simple LOD
            let stride = 1;
            if (this.camera.zoomX < 0.05) stride = 4;
            if (this.camera.zoomX < 0.005) stride = 20;

            line.updateUniforms(stride);
            pass.setBindGroup(1, line.bindGroup);

            const instances = Math.floor((line.count - 1) / stride);
            if (instances > 0) pass.draw(4, instances);
        }

        pass.end();
        this.engine.device.queue.submit([enc.finish()]);
    }

    // setupInputs() {
    //     let drag = false, lx = 0, ly = 0;
    //     this.canvas.onmousedown = e => { drag = true; lx = e.clientX; ly = e.clientY; this.userInteracted = true; };
    //     window.onmouseup = () => drag = false;
    //     this.canvas.onmousemove = e => {
    //         if (!drag) return;
    //         this.camera.x += ((e.clientX - lx) / this.canvas.width * 2) / this.camera.zoomX;
    //         this.camera.y -= ((e.clientY - ly) / this.canvas.height * 2) / this.camera.zoomY;
    //         lx = e.clientX; ly = e.clientY;
    //     };
    //     this.canvas.onwheel = e => {
    //         e.preventDefault(); this.userInteracted = true;
    //         const s = e.deltaY > 0 ? 0.9 : 1.1;
    //         if (e.shiftKey) this.camera.zoomX *= s; else if (e.ctrlKey) this.camera.zoomY *= s; else { this.camera.zoomX *= s; this.camera.zoomY *= s; }
    //     };
    // }
}