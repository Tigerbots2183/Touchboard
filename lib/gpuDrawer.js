export class WebGPULineGraph {
    // Static tracker for ALL instances
    static totalAllocatedBytes = 0;
    static allLineCount = 0;
    static instanceCount = 0;
    static allInstances = {};
    static sharedDevice;
    static mbCap = 9000;

    constructor() {
        this.device = null;
        this.context = null;
        this.canvas = null;
        this.pipeline = null;
        this.bindGroupLayout = null;

        this.camera = { x: 0, y: 0, zoomX: 1.0, zoomY: 1.0 };
        this.lines = new Map();
        this.lineList = [];

        this.pointBuffer = null;
        this.uniformBuffer = null;
        this.lineMetaBuffer = null;
        this.bindGroup = null;

        this.maxPointsTotal = 0;
        this.metaChunkSize = 256;

        this.key = "graph" + (WebGPULineGraph.instanceCount);
        WebGPULineGraph.allInstances[this.key] = this;
        // console.log(WebGPULineGraph.allInstances)
    }
    async initialize(canvas) {
        if (!WebGPULineGraph.sharedDevice) { WebGPULineGraph.sharedDevice = await setupSharedDevice() };


        this.device = WebGPULineGraph.sharedDevice;
        this.canvas = canvas;
        this.context = canvas.getContext('webgpu');

        const format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: format,
            alphaMode: 'premultiplied',
        });

        const maxBytes = Math.min(this.device.limits.maxStorageBufferBindingSize / (WebGPULineGraph.instanceCount + 1), this.device.limits.maxBufferSize / (WebGPULineGraph.instanceCount + 1));
        const safeMaxBytes = Math.min(maxBytes, WebGPULineGraph.mbCap * 1024 * 1024);
        this.maxPointsTotal = Math.floor(safeMaxBytes / 8);
        this.metaChunkSize = this.device.limits.minStorageBufferOffsetAlignment || 256;

        // --- Memory Tracking ---
        const pointBytes = this.maxPointsTotal * 8;
        const uniformBytes = 32;
        const metaBytes = 16 * this.metaChunkSize;
        const totalInstanceBytes = pointBytes + uniformBytes + metaBytes;

        // Create Buffers
        this.pointBuffer = this.device.createBuffer({ size: pointBytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
        this.uniformBuffer = this.device.createBuffer({ size: uniformBytes, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.lineMetaBuffer = this.device.createBuffer({ size: metaBytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });

        // Update Global Stats
        WebGPULineGraph.totalAllocatedBytes += totalInstanceBytes;

        // console.log(totalInstanceBytes / 1024 / 1024)

        WebGPULineGraph.instanceCount++;
        this.updateMemoryUI();

        // console.log(this.maxPointsTotal * 8 / 1024 / 1024, "Before Resize", this.key);

        if (WebGPULineGraph.instanceCount > 0) {
            await WebGPULineGraph.remakeAllBuffers();
        }

        // console.log(totalInstanceBytes / 1024 / 1024)


        await this.createPipeline(format);
    }

    destroy() {
        console.log("Destroying graph instance...");

        // 1. Destroy Buffers
        if (this.pointBuffer) this.pointBuffer.destroy();
        if (this.uniformBuffer) this.uniformBuffer.destroy();
        if (this.lineMetaBuffer) this.lineMetaBuffer.destroy();

        WebGPULineGraph.instanceCount--;

        delete WebGPULineGraph.allInstances[this.key]

        if (WebGPULineGraph.instanceCount > 0) {
            WebGPULineGraph.remakeAllBuffers();
            WebGPULineGraph.reallocateAllMemory();
        }


        // 4. Nullify to prevent use
        this.device = null;
        this.context = null;

    }


    updateMemoryUI() {
        const mb = (WebGPULineGraph.totalAllocatedBytes / (1024 * 1024)).toFixed(2);
        // document.getElementById('mem-total').innerText = `Total VRAM: ${mb} MB`;
        // document.getElementById('mem-detail').innerText = `${WebGPULineGraph.instanceCount} Graphs Active`;

        console.log("Graphs Active:", WebGPULineGraph.instanceCount)
        console.log("Vram Usage:", mb)
    }

    static remakeAllBuffers() {
        //this ai loves leaking memory
        WebGPULineGraph.allLineCount = 0
        WebGPULineGraph.totalAllocatedBytes = 0;

        for (let graph in WebGPULineGraph.allInstances) {
            WebGPULineGraph.allInstances[graph].remakeBuffer();
        }

    }

    async remakeBuffer() {
        this.pointBuffer.destroy()
        const maxBytes = Math.min(this.device.limits.maxStorageBufferBindingSize / (WebGPULineGraph.instanceCount), this.device.limits.maxBufferSize / (WebGPULineGraph.instanceCount));
        const safeMaxBytes = Math.min(maxBytes, WebGPULineGraph.mbCap * 1024 * 1024);
        this.maxPointsTotal = Math.floor(safeMaxBytes / 8);

        const pointBytes = this.maxPointsTotal * 8;

        this.pointBuffer = this.device.createBuffer({ size: pointBytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
        // console.log(this.maxPointsTotal * 8 / 1024 / 1024, "After Resize", this.key);
        WebGPULineGraph.totalAllocatedBytes += pointBytes;

        WebGPULineGraph.allLineCount += this.lines.size

        this.updateMemoryUI();
    }

    // ... [Previous createPipeline code remains exactly the same] ...
    async createPipeline(format) {
        const shaderCode = `
            struct Camera { pos: vec2<f32>, zoom: vec2<f32>, screen: vec2<f32>, padding: vec2<f32> };
            struct LineMeta { color: vec4<f32>, width: f32, start_offset: u32, capacity: u32, head_index: u32, logical_length: u32 };
            @group(0) @binding(0) var<uniform> camera: Camera;
            @group(0) @binding(1) var<storage, read> points: array<vec2<f32>>;
            @group(0) @binding(2) var<storage, read> lines: array<LineMeta>;
            struct VertexOutput { @builtin(position) position: vec4<f32>, @location(0) color: vec4<f32>, @location(1) uv: vec2<f32>, @location(2) width: f32 };
            var<private> quad_pos: array<vec2<f32>, 6> = array<vec2<f32>, 6>(vec2(-1.0, -1.0), vec2( 1.0, -1.0), vec2(-1.0,  1.0), vec2(-1.0,  1.0), vec2( 1.0, -1.0), vec2( 1.0,  1.0));
            fn get_point(props: LineMeta, logical_idx: u32) -> vec2<f32> { let idx = (props.head_index + logical_idx) % props.capacity + props.start_offset; return points[idx]; }
            @vertex fn vs_main(@builtin(vertex_index) v_idx: u32, @builtin(instance_index) i_idx: u32) -> VertexOutput {
                let props = lines[0]; 
                let lod_step = max(1u, u32(1.0 / (camera.zoom.x * 2.0))); 
                let l_curr = i_idx * lod_step;
                let l_next = min(l_curr + lod_step, props.logical_length - 1u);
                let l_prev = select(l_curr - lod_step, 0u, l_curr < lod_step);
                let l_next2 = min(l_next + lod_step, props.logical_length - 1u);
                let s_curr = (get_point(props, l_curr) - camera.pos) * camera.zoom * camera.screen.y; 
                let s_next = (get_point(props, l_next) - camera.pos) * camera.zoom * camera.screen.y;
                let s_prev = (get_point(props, l_prev) - camera.pos) * camera.zoom * camera.screen.y;
                let s_next2 = (get_point(props, l_next2) - camera.pos) * camera.zoom * camera.screen.y;
                let dir_prev = normalize(s_curr - s_prev); let dir_curr = normalize(s_next - s_curr); let dir_next = normalize(s_next2 - s_next);
                let t_in  = select(dir_prev, dir_curr, length(s_curr - s_prev) < 0.1);
                let t_out = select(dir_curr, dir_next, length(s_next - s_curr) < 0.1);
                let t_next_seg = select(dir_next, dir_curr, length(s_next2 - s_next) < 0.1);
                let n_in = vec2(-t_in.y, t_in.x); let n_out = vec2(-t_out.y, t_out.x); let n_next = vec2(-t_next_seg.y, t_next_seg.x);
                let p_local = quad_pos[v_idx];
                var center_pos: vec2<f32>; var miter: vec2<f32>; var ref_normal: vec2<f32>;
                if (p_local.x < 0.0) { center_pos = s_curr; miter = normalize(n_in + n_out); ref_normal = n_out; } else { center_pos = s_next; miter = normalize(n_out + n_next); ref_normal = n_out; }
                let miter_dot = dot(miter, ref_normal); let use_miter = miter_dot > 0.1; 
                var expansion: vec2<f32>; if (use_miter) { let miter_len = 1.0 / miter_dot; let safe_len = min(miter_len, 5.0); expansion = miter * safe_len; } else { expansion = ref_normal; }
                let half_width = (props.width * 0.5) + 0.5; let final_offset = expansion * p_local.y * half_width; let final_pos_px = center_pos + final_offset;
                let ndc_x = (final_pos_px.x / camera.screen.y) / (camera.screen.x / camera.screen.y); let ndc_y = final_pos_px.y / camera.screen.y;
                var out: VertexOutput; out.position = vec4(ndc_x, ndc_y, 0.0, 1.0); out.color = props.color; out.uv = p_local; out.width = props.width; return out;
            }
            @fragment fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
                let dist = abs(in.uv.y); let px_w = in.width * 0.5; let alpha = 1.0 - smoothstep(px_w - 0.5, px_w + 0.5, dist * (px_w + 0.5)); return vec4(in.color.rgb, in.color.a * alpha);
            }
        `;
        const module = this.device.createShaderModule({ code: shaderCode });
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
                { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage', hasDynamicOffset: true } }
            ]
        });
        this.pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout] }),
            vertex: { module, entryPoint: 'vs_main' },
            fragment: { module, entryPoint: 'fs_main', targets: [{ format: format, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } }] },
            primitive: { topology: 'triangle-list' }
        });
    }

    createLine(name, color, width) {
        if (this.lines.has(name)) return;

        if (typeof color === "string") {
            color = color.replace(/^#/, '');

            // Parse the r, g, b values
            let r = parseInt(color.substring(0, 2), 16);
            let g = parseInt(color.substring(2, 4), 16);
            let b = parseInt(color.substring(4, 6), 16);

            console.log(r, g, b)

            color =  [r / 255, g / 255, b / 255,1];

        }

        this.lines.set(name, { id: this.lines.size, name, color, width, head: 0, length: 0, capacity: 0, startOffset: 0 });
        this.lineList = Array.from(this.lines.values());
        WebGPULineGraph.allLineCount++
        WebGPULineGraph.reallocateAllMemory();
    }

    static reallocateAllMemory() {
        //ai lowkey gave me a memory leak so I had to fix
        console.log("Reallocating Vram")
        for (let graph in WebGPULineGraph.allInstances) {
            WebGPULineGraph.allInstances[graph].reallocateMemory();
        }
        // for(let graph in WebGPULineGraph.allInstances){
        //     // console.log(WebGPULineGraph.allInstances[graph].lines.values())
        //     for (const line of WebGPULineGraph.allInstances[graph].lines.values()) {
        //         console.log( line.capacity)
        //     }
        // }
    }

    reallocateMemory() {
        if (this.lines.size === 0) return;

        const ptsPerLine = Math.floor(this.maxPointsTotal / WebGPULineGraph.allLineCount);
        let offset = 0;
        for (const line of this.lines.values()) {
            line.capacity = ptsPerLine; line.startOffset = offset; line.head = 0; line.length = 0; offset += ptsPerLine;
        }
        console.log(`Rebalancing: ${WebGPULineGraph.allLineCount} lines. New Capacity: ${ptsPerLine} pts/line`);

    }

    addData(name, rawData) {
        const line = this.lines.get(name); if (!line) return;
        const count = rawData.length / 2; const dataF32 = new Float32Array(rawData);
        const writeIdx = line.head; const space = line.capacity - writeIdx; const absOffset = line.startOffset + writeIdx;
        if (count <= space) { this.device.queue.writeBuffer(this.pointBuffer, absOffset * 8, dataF32); }
        else { const chunk1 = space; this.device.queue.writeBuffer(this.pointBuffer, absOffset * 8, dataF32.subarray(0, chunk1 * 2)); this.device.queue.writeBuffer(this.pointBuffer, line.startOffset * 8, dataF32.subarray(chunk1 * 2)); }
        line.head = (line.head + count) % line.capacity; line.length = Math.min(line.length + count, line.capacity);
    }

    setCamera(x, y, zx, zy) { this.camera.x = x; this.camera.y = y; this.camera.zoomX = zx; this.camera.zoomY = zy; }

    render() {
        if (!this.device || !this.pipeline) return;
        const w = this.canvas.width; const h = this.canvas.height;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([this.camera.x, this.camera.y, this.camera.zoomX, this.camera.zoomY, w, h, 0, 0]));
        for (let i = 0; i < this.lineList.length; i++) {
            const line = this.lineList[i]; let readHead = (line.length < line.capacity) ? 0 : line.head;
            const meta = new ArrayBuffer(48); const f32 = new Float32Array(meta); const u32 = new Uint32Array(meta);
            f32[0] = line.color[0]; f32[1] = line.color[1]; f32[2] = line.color[2]; f32[3] = line.color[3];
            f32[4] = line.width; u32[5] = line.startOffset; u32[6] = line.capacity; u32[7] = readHead; u32[8] = line.length;
            this.device.queue.writeBuffer(this.lineMetaBuffer, i * this.metaChunkSize, meta);
        }
        const enc = this.device.createCommandEncoder();
        const pass = enc.beginRenderPass({ colorAttachments: [{ view: this.context.getCurrentTexture().createView(), clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0 }, loadOp: 'clear', storeOp: 'store' }] });
        pass.setPipeline(this.pipeline);
        if (!this.bindGroup) {
            this.bindGroup = this.device.createBindGroup({ layout: this.bindGroupLayout, entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }, { binding: 1, resource: { buffer: this.pointBuffer } }, { binding: 2, resource: { buffer: this.lineMetaBuffer, offset: 0, size: this.metaChunkSize } }] });
        }
        for (let i = 0; i < this.lineList.length; i++) {
            const line = this.lineList[i]; if (line.length < 2) continue;
            pass.setBindGroup(0, this.bindGroup, [i * this.metaChunkSize]);
            const lodStep = Math.max(1, Math.floor(1.0 / (this.camera.zoomX * 2.0)));
            const instances = Math.floor((line.length - 1) / lodStep);
            if (instances > 0) { pass.draw(6, instances, 0, 0); }
        }
        pass.end(); this.device.queue.submit([enc.finish()]);
    }
}
     async function setupSharedDevice() {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) throw new Error("No WebGPU Adapter");
            return await adapter.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
        }