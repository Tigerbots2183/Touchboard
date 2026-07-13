// import { NT4_Client } from "../../../lib/nt4.js";
import { pxToCq, clamp, toastMessage } from "../../ui.js";
import { nt4Client } from "../../coms.js";
import { WebGPULineGraph } from "../../../lib/gpuDrawer.js"
import { renderFuncs } from "../../renderer.js";

// let canvas = document.getElementById("testMain");

export const CONVERSIONRATE = 1000000.0


export async function initGraph(graph) {
    let allTopicFuncs = []

    let canvas = graph.find(".graphCanvasPrimary")[0]

    let startTimestamp = graph.find(".bottomTicks").attr("data-absmin")

    let renderer = new WebGPULineGraph()


    let testScale = findNiceScale(absAsBackup(graph.find(".leftTicks"), "min"), absAsBackup(graph.find(".leftTicks"), "max"))

    setTickScale(testScale, graph.find(".leftTicks"))

    let testSync
    if (graph.attr("data-linkAxis") == "true") {
        testSync = findRelativeScale(absAsBackup(graph.find(".rightTicks"), "min"), (absAsBackup(graph.find(".rightTicks"), "max")), testScale)
    } else {
        testSync = findNiceScale(absAsBackup(graph.find(".rightTicks"), "min"), (absAsBackup(graph.find(".rightTicks"), "max")))
    }

    let viewableZoomedUnitsX = 10;
    let viewableZoomedUnitsY = false;

    let offsetX = 0
    let offsetY = 0

    graph.find(".linkButton").on("click", () => {
        toastMessage(JSON.stringify(renderer.getMinMaxInView()));
    })

    setAbsMinMax(setTickScale(testSync, graph.find(".rightTicks")))

    let initiatedScrollAxis = ''
    let currentResetTimeout;

    graph.find(".graphHolder").on("wheel", (event) => {
        zoomAndPanHandler(event, graph)
    })

    dragPseudoEvent(graph.find(".graphHolder"), (event) => {
        zoomAndPanHandler(event, graph)
    })


    await renderer.initialize(canvas)

    renderer.setCamera(0, 0, $(canvas).width(), $(canvas).height())

    // renderer.createLine("SinTest", "#ffa600", 3)
    // renderer.createLine("OdomFrequency", "#8400ff", 3)
    renderer.createLine("Audio FileR", "#ffffff", 8)
    renderer.createLine("Audio FileL", "#ffffff", 8)
1

    bindSuperSlider(graph.find(".bottomSuperSlider"), graph.find(".bottomTicks"), undefined, undefined, undefined, graph)
    bindSuperSlider(graph.find(".leftSuperSlider"), graph.find(".leftTicks"), "y", graph.find(".rightTicks"), graph.find(".rightSuperSlider"), graph)
    bindSuperSlider(graph.find(".rightSuperSlider"), graph.find(".rightTicks"), "y", graph.find(".leftTicks"), graph.find(".leftSuperSlider"), graph)

    let sizeObserver = new ResizeObserver(resizeHandler)

    sizeObserver.observe(graph[0])

    renderFuncs.set(graph, drawGraph)

    addMusicDropHandler(graph)

    function resizeHandler() {
        console.log("Resize Observed")

        $(canvas).attr("width", $(canvas).width()).attr("height", $(canvas).height())

        let bottomTicks = graph.children(".bottomTicks")
        let rightTicks = graph.children(".rightTicks")
        let leftTicks = graph.children(".leftTicks")

        resizeTicks(bottomTicks)
        resizeTicks(rightTicks)
        resizeTicks(leftTicks)

        function resizeTicks(element) {
            element.attr("data-graphWidth", pxToCq($($(".currentTab").attr("data-page")), element.parent().children(".graphHolder").width()).cqh)
            element.attr("data-graphHeight", pxToCq($($(".currentTab").attr("data-page")), element.parent().children(".graphHolder").height()).cqh)
        }


    }

    function zoomAndPanHandler(event, graph) {
        let isTrackpad = detectTrackPad(event.originalEvent)

        let tolerance = 4

        let bottomTicks = graph.children(".bottomTicks")
        let rightTicks = graph.children(".rightTicks")
        let leftTicks = graph.children(".leftTicks")

        let bottomSlider = graph.children(".bottomSuperSlider")
        let rightSlider = graph.children(".rightSuperSlider")
        let leftSlider = graph.children(".leftSuperSlider")

        let holder = graph.children(".graphHolder")

        if (isNaN(viewableZoomedUnitsX)) {
            console.warn("Escaped NaN on viewableZoomedUnitsX")
            viewableZoomedUnitsX = parseFloat(bottomTicks.attr("data-absMax")) - parseFloat(bottomTicks.attr("data-absMin"))
        }

        let pointer = {
            absX: event.pageX,
            absY: event.pageY,
            x: event.pageX - holder.offset().left,
            y: event.pageY - holder.offset().top,
            xP: 0,
            yP: 0
        }


        pointer.xP = clamp(pointer.x / holder.width())
        pointer.yP = clamp((holder.height() - pointer.y) / holder.height())

        if (event.ctrlKey && !event.isPseudoEvent) {
            graphZoomY()
        } else if ((event.originalEvent.deltaY > tolerance || event.originalEvent.deltaY < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "ZOOMX") && !event.isPseudoEvent && bottomTicks.attr("data-max") == "false") {
            initiatedScrollAxis = "ZOOMX"
            graphZoomXFromRight()
        } else if ((event.originalEvent.deltaY > tolerance || event.originalEvent.deltaY < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "ZOOMX") && !event.isPseudoEvent) {
            initiatedScrollAxis = "ZOOMX"
            graphZoomXFromMouse()
        }
        else if ((event.originalEvent.deltaX > tolerance || event.originalEvent.deltaX < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETX") && !event.isPseudoEvent) {
            initiatedScrollAxis = "OFFSETX"
            graphOffsetX()
        }
        // Panning drag tolerance logic
        let dragTolerance = tolerance * 8;
        let isXDrag = Math.abs(event.deltaX) > dragTolerance;
        let isYDrag = Math.abs(event.deltaY) > dragTolerance;

        if (isXDrag && isYDrag) {
            initiatedScrollAxis = "OFFSETXY";
            graphOffsetX();
            graphOffsetY();
        } else if (isXDrag && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETX" || initiatedScrollAxis === "OFFSETXY")) {
            initiatedScrollAxis = initiatedScrollAxis || "OFFSETX";
            graphOffsetX();
            if (initiatedScrollAxis === "OFFSETXY") graphOffsetY();
        } else if (isYDrag && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETY" || initiatedScrollAxis === "OFFSETXY")) {
            initiatedScrollAxis = initiatedScrollAxis || "OFFSETY";
            graphOffsetY();
            if (initiatedScrollAxis === "OFFSETXY") graphOffsetX();
        }

        // If currently locked to X but Y breaks tolerance, unlock both
        if (initiatedScrollAxis === "OFFSETX" && isYDrag) {
            initiatedScrollAxis = "OFFSETXY";
            graphOffsetY();
        }
        // If currently locked to Y but X breaks tolerance, unlock both
        if (initiatedScrollAxis === "OFFSETY" && isXDrag) {
            initiatedScrollAxis = "OFFSETXY";
            graphOffsetX();
        }

        clearTimeout(currentResetTimeout);

        currentResetTimeout = setTimeout(() => {
            initiatedScrollAxis = '';
        }, 50);

        function graphZoomXFromRight() {
            event.preventDefault()

            if (isTrackpad) {
                viewableZoomedUnitsX += event.originalEvent.deltaY
            } else {
                viewableZoomedUnitsX += event.originalEvent.deltaY / 64
            }

            if (viewableZoomedUnitsX <= 0.5) {
                viewableZoomedUnitsX = 0.5
            }

            let absMax = parseFloat(bottomTicks.attr("data-absMax"))
            let absMin = parseFloat(bottomTicks.attr("data-absMin"))

            let oldRange = parseFloat(bottomTicks.attr("data-max")) - parseFloat(bottomTicks.attr("data-min"));
            let absoluteRange = absMax - absMin;

            if (oldRange >= absoluteRange - 0.05 && viewableZoomedUnitsX > oldRange && bottomTicks.attr("data-min") !== "false") {
                setTickAttributes(bottomTicks, bottomSlider, "false", "false");
                triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "flushAnimaiton");
                return;
            }

            let offset = absMax - viewableZoomedUnitsX

            if (offset <= absMin) {
                offset = absMin
                viewableZoomedUnitsX = absoluteRange
            }

            setTickAttributes(bottomTicks, bottomSlider, offset)

            let xscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

            setTickScale(xscale, bottomTicks)
        }

        function graphZoomXFromMouse() {
            event.preventDefault()

            if (isTrackpad) {
                viewableZoomedUnitsX += event.originalEvent.deltaY
            } else {
                viewableZoomedUnitsX += event.originalEvent.deltaY / 64
            }

            if (viewableZoomedUnitsX <= 0.05) {
                viewableZoomedUnitsX = 0.05
            }

            if (bottomTicks.attr("data-max") != "false") {
                let oldValMax = parseFloat(bottomTicks.attr("data-max"))
                let oldValMin = parseFloat(bottomTicks.attr("data-min"))

                let absMax = parseFloat(bottomTicks.attr("data-absMax"))
                let absMin = parseFloat(bottomTicks.attr("data-absMin"))

                let oldRange = oldValMax - oldValMin;
                let absoluteRange = absMax - absMin;

                if (oldRange >= absoluteRange - 0.05 && viewableZoomedUnitsX > oldRange) {
                    setTickAttributes(bottomTicks, bottomSlider, "false", "false");
                    triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "flushAnimaiton");
                    return;
                }

                let center = (pointer.xP * oldRange) + oldValMin;

                let min = center - (viewableZoomedUnitsX * pointer.xP)
                let max = center + (viewableZoomedUnitsX * (1 - pointer.xP))

                if (absMax <= max && absMin >= min) {
                    min = absMin
                    max = absMax
                    viewableZoomedUnitsX = absoluteRange;
                } else if (absMax < max) {
                    max = absMax
                    min = absMax - viewableZoomedUnitsX
                } else if (absMin > min) {
                    min = absMin
                    max = absMin + viewableZoomedUnitsX
                }

                setTickAttributes(bottomTicks, bottomSlider, min, max)

            }

            let xscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

            setTickScale(xscale, bottomTicks)
        }

        function graphZoomY() {
            event.preventDefault()

            let oldLeftValMax = absAsBackup(leftTicks, "max")
            let oldLeftValMin = absAsBackup(leftTicks, "min")

            let absLeftMax = parseFloat(leftTicks.attr("data-absMax"))
            let absLeftMin = parseFloat(leftTicks.attr("data-absMin"))

            let oldRange = oldLeftValMax - oldLeftValMin;
            let absoluteRange = absLeftMax - absLeftMin;

            let center = (pointer.yP * oldRange) + oldLeftValMin;

            if (viewableZoomedUnitsY == false) {
                viewableZoomedUnitsY = oldRange;
            } else if (isTrackpad) {
                viewableZoomedUnitsY += viewableZoomedUnitsY += (event.originalEvent.deltaY * viewableZoomedUnitsY) *.005 * 64

            } else {
                viewableZoomedUnitsY += (event.originalEvent.deltaY * viewableZoomedUnitsY) *.005
            }

            if (oldRange >= absoluteRange - 0.05 && viewableZoomedUnitsY > oldRange) {
                setTickAttributes(leftTicks, leftSlider, "false", "false");

                triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "upFlushAnimaiton");
                triggerGraphEffector(graph.find(".secondaryGraphEffectorOverlay"), "downFlushAnimaiton");

                viewableZoomedUnitsY = (absLeftMax - absLeftMin);

                return;
            }

            if (viewableZoomedUnitsY < 0.005) {
                viewableZoomedUnitsY = 0.005
            }

            let min = center - (viewableZoomedUnitsY * pointer.yP)
            let max = center + (viewableZoomedUnitsY * (1 - pointer.yP))

            if (absLeftMax <= max && absLeftMin >= min) {
                min = absLeftMin
                max = absLeftMax
                viewableZoomedUnitsY = absoluteRange;
            } else if (absLeftMax < max) {
                max = absLeftMax
                min = absLeftMax - viewableZoomedUnitsY
            } else if (absLeftMin > min) {
                min = absLeftMin
                max = absLeftMin + viewableZoomedUnitsY
            }

            let primaryAxisScale = findNiceScale(min, max)

            let scale = setTickScale(primaryAxisScale, leftTicks)

            setMinMax(scale, leftSlider)

            scale.element.attr("data-idealMin", scale.minimum).attr("data-idealMax", scale.maximum)

            let secondaryAxisScale
            if (graph.attr("data-linkAxis") == "true") {
                secondaryAxisScale = findRelativeScale(absAsBackup(rightTicks, "idealMin"), (absAsBackup(rightTicks, "idealMax")), primaryAxisScale)
            } else {
                secondaryAxisScale = findNiceScale(absAsBackup(rightTicks, "min"), (absAsBackup(rightTicks, "max")))
            }

            setMinMax(setTickScale(secondaryAxisScale, rightTicks))
        }

        function graphOffsetX() {
            event.preventDefault()

            if (event.isPseudoEvent) {
                offsetX = (clamp(event.deltaXfromLastMove / holder.width(), -1) * viewableZoomedUnitsX)
            } else {
                offsetX = - event.originalEvent.deltaX / 100
            }


            let oldMax = absAsBackup(bottomTicks, "max")

            let absMin = parseFloat(bottomTicks.attr("data-absMin"))

            if (oldMax - offsetX - viewableZoomedUnitsX < absMin) {

                return
            }

            if (oldMax > parseFloat(bottomTicks.attr("data-absmax"))) {
                lockToX(absMin)
                return
            }



            setTickAttributes(bottomTicks, bottomSlider, oldMax - offsetX - viewableZoomedUnitsX, oldMax - offsetX)

            let yscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

            setTickScale(yscale, bottomTicks)
        }

        function graphOffsetY() {
            event.preventDefault()

            let currentTicks = leftTicks
            let currentSlider = leftSlider

            let secondaryTicks = rightTicks
            let secondarySlider = rightSlider

            viewableZoomedUnitsY = absAsBackup(currentTicks, "max") - absAsBackup(currentTicks, "min")

            if (event.isPseudoEvent) {
                offsetY = - (clamp(event.deltaYfromLastMove / holder.height(), -1) * viewableZoomedUnitsY)
            } else {
                offsetY = - event.originalEvent.deltaY
            }

            let oldMax = absAsBackup(currentTicks, "max")

            let absMin = parseFloat(currentTicks.attr("data-absMin"))
            let absMax = parseFloat(currentTicks.attr("data-absMax"))

            if (absMin > absAsBackup(currentTicks, "min")) {
                currentTicks.attr("data-min", absMin)
                return
            }

            if (absMax < absAsBackup(currentTicks, "max")) {
                currentTicks.attr("data-max", absMax)
                return
            }


            if (oldMax - offsetY - viewableZoomedUnitsY < absMin) {
                offsetY = 0
            }

            if (oldMax - offsetY > absMax) {
                offsetY = 0
            }

            setTickAttributes(currentTicks, currentSlider, oldMax - offsetY - viewableZoomedUnitsY, oldMax - offsetY)

            let xScale = findNiceScale(absAsBackup(currentTicks, "min"), absAsBackup(currentTicks, "max"))

            setTickScale(xScale, currentTicks)


            let secondaryAxisScale
            if (graph.attr("data-linkAxis") == "true") {
                secondaryAxisScale = findRelativeScale(absAsBackup(secondaryTicks, "idealMin"), (absAsBackup(secondaryTicks, "idealMax")), xScale)
            } else {
                secondaryAxisScale = findNiceScale(absAsBackup(secondaryTicks, "min"), (absAsBackup(secondaryTicks, "max")))
            }

            // setTickAttributes(secondaryAxisScale, secondaryTicks,)
            setMinMax(setTickScale(secondaryAxisScale, secondaryTicks), secondarySlider)
        }

        function lockToX(absMin) {
            if (absMin > parseFloat(bottomTicks.attr("data-absMax")) - viewableZoomedUnitsX) {
                viewableZoomedUnitsX = parseFloat(bottomTicks.attr("data-absMax")) - absMin
            }


            triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "flushAnimaiton")

            setTickAttributes(bottomTicks, bottomSlider, false, "false")

            offsetX = 0
            initiatedScrollAxis = 'paused'

            clearTimeout(currentResetTimeout);

            currentResetTimeout = setTimeout(() => {
                initiatedScrollAxis = ''
            }, 100);

            return
        }

    }

    function bindSuperSlider(superSlider, ticks, delta = "x", secondaryTicks, secondarySlider, graph) {
        let bottomSlider = superSlider.children(".bottomSlider");
        let topSlider = superSlider.children(".topSlider");
        let midSlider = superSlider.children(".midSlider");

        const updateSliderState = (sliderElement, newMin, newMax) => {
            if (newMin !== null) {
                ticks.attr("data-min", newMin);
                sliderElement.attr("data-min", newMin);
            }
            if (newMax !== null) {
                ticks.attr("data-max", newMax);
                sliderElement.attr("data-max", newMax);
            }
            setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph);

            if (delta === "x") {
                viewableZoomedUnitsX = absAsBackup(sliderElement, "max") - absAsBackup(sliderElement, "min");
            } else {
                viewableZoomedUnitsY = absAsBackup(sliderElement, "max") - absAsBackup(sliderElement, "min");
            }
        };

        dragPseudoEvent(bottomSlider.children(".sliderThumb"), (event) => {
            $(canvas).attr("width", $(canvas).width()).attr("height", $(canvas).height());
            let subSlider = event.boundElement.parent();
            let slider = subSlider.parent();

            let deltaPercentage;
            if (delta === "x") {
                deltaPercentage = event.deltaXfromLastMove / subSlider.width();
            } else {
                deltaPercentage = -event.deltaYfromLastMove / subSlider.height();
            }

            let absMin = parseFloat(slider.attr("data-absMin"));
            let absMax = parseFloat(slider.attr("data-absMax"));

            let newValue = deltaPercentage * (absMax - absMin);
            let oldValue = absAsBackup(slider, "min");
            let finalValue = clamp(oldValue + newValue, absMin, absAsBackup(slider, "max") - 0.05);

            if (oldValue + newValue <= absMin) {
                // Auto-scale mode uses WebGL bounds
                let bounds = renderer.getMinMaxInView();
                updateSliderState(slider, "false", null); // triggers setCanvasesToTicks auto-scaling

                if (delta === "x") {
                    triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "revFlushAnimaiton");
                } else {
                    triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "downFlushAnimaiton");
                }
            } else {
                updateSliderState(slider, finalValue, null);
            }
        }, false);

        dragPseudoEvent(topSlider.children(".sliderThumb"), (event) => {
            let subSlider = event.boundElement.parent();
            let slider = subSlider.parent();

            let deltaPercentage;
            if (delta === "x") {
                deltaPercentage = event.deltaXfromLastMove / subSlider.width();
            } else {
                deltaPercentage = -event.deltaYfromLastMove / subSlider.height();
            }

            let absMin = parseFloat(slider.attr("data-absMin"));
            let absMax = parseFloat(slider.attr("data-absMax"));

            let newValue = deltaPercentage * (absMax - absMin);
            let oldValue = absAsBackup(slider, "max");
            let finalValue = clamp(newValue + oldValue, absAsBackup(slider, "min") + 0.05, absMax);

            if (oldValue + newValue >= absMax) {
                // Auto-scale mode uses WebGL bounds
                let bounds = renderer.getMinMaxInView();
                updateSliderState(slider, null, "false");

                if (delta === "x") {
                    triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "flushAnimaiton");
                } else {
                    triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "upFlushAnimaiton");
                }
            } else {
                updateSliderState(slider, null, finalValue);
            }
        }, false);

        dragPseudoEvent(midSlider.children(".sliderThumb"), (event) => {
            let subSlider = event.boundElement.parent();
            let slider = subSlider.parent();

            let deltaPercentage;
            if (delta === "x") {
                deltaPercentage = event.deltaXfromLastMove / subSlider.width();
            } else {
                deltaPercentage = -event.deltaYfromLastMove / subSlider.height();
            }

            let absMin = parseFloat(slider.attr("data-absMin"));
            let absMax = parseFloat(slider.attr("data-absMax"));

            let newValue = deltaPercentage * (absMax - absMin);
            let oldMin = absAsBackup(slider, "min");
            let oldMax = absAsBackup(slider, "max");

            if (oldMin + newValue <= absMin || oldMax + newValue >= absMax) {
                if (oldMax + newValue >= absMax) {
                    if (delta === "x") {
                        triggerGraphEffector(graph.find(".primaryGraphEffectorOverlay"), "flushAnimaiton");
                    }

                    if (absMin > parseFloat(ticks.attr("data-absMax")) - viewableZoomedUnitsX) {
                        viewableZoomedUnitsX = parseFloat(ticks.attr("data-absMax")) - absMin;
                    }

                    updateSliderState(slider, null, "false");
                    offsetX = 0;
                }
                return;
            }
            updateSliderState(slider, oldMin + newValue, oldMax + newValue);
        }, false);
    }

    function drawGraph(graph) {
        setCanvasesToTicks(graph, renderer)

        if(startTimestamp == 0){
            if(nt4Client.getServerTime_us() / CONVERSIONRATE > 0){
                graph.find(".bottomTicks").attr("data-absmin", nt4Client.getServerTime_us() / CONVERSIONRATE)
                graph.find(".bottomSuperSlider").attr("data-absmin", nt4Client.getServerTime_us() / CONVERSIONRATE)
                startTimestamp = nt4Client.getServerTime_us() / CONVERSIONRATE
            }
        }

        let allTopics = []

        for (let i = 0; i < allTopicFuncs.length; i++) {
            allTopics.push(allTopicFuncs[i]())
        }

        drawData(graph, renderer, allTopics)
        renderer.render()
        let absMax = (nt4Client.getServerTime_us() / CONVERSIONRATE)
        graph.find(".bottomTicks").attr("data-absmax", absMax)
        graph.find(".bottomSuperSlider").attr("data-absmax", absMax)
        graph.find(".superSliderBottom").attr("max", absMax)
        graph.find(".superSliderTop").attr("max", absMax)

        if (graph.find(".bottomTicks").attr("data-max") == "false" && graph.find(".bottomTicks").attr("data-min") != "false") {
            let min = (nt4Client.getServerTime_us() / CONVERSIONRATE) - viewableZoomedUnitsX
            let absMin = 0

            graph.find(".bottomTicks").attr("data-min", min)
            graph.find(".bottomTicks").attr("data-absmax", absMax)

            graph.find(".bottomSuperSlider").attr("data-min", min)
            graph.find(".bottomSuperSlider").attr("data-absmax", absMax)


            graph.find(".superSliderBottom").attr("max", absMax).attr("min", absMin).val(min)
            graph.find(".superSliderTop").attr("max", absMax).attr("min", absMin)

        }


        let yscale = findNiceScale(absAsBackup(graph.find(".bottomTicks"), "min"), absAsBackup(graph.find(".bottomTicks"), "max"))

        setTickScale(yscale, graph.find(".bottomTicks"))
    }

    function addMusicDropHandler(graph) {
        let audio = graph.children("#audio")[0];
        let linkedMusic = false;

        graph.on("drop", (event) => {
            event.preventDefault()

            event = event.originalEvent

            let files = event.dataTransfer.files;

            if (files.length > 0) {

                handleFile(files[0])

            }

        })

        function handleFile(file) {
            if (!file.type.startsWith("audio/")) {
                return false
            }

            let reader = new FileReader();

            reader.onload = (event) => {
                audio.src = event.target.result;
                audio.play().catch(error => {
                    console.warn("Playback Failed", error)
                })

                graphSong()
            }

            reader.readAsDataURL(file)
        }

        function graphSong() {
            if (linkedMusic) {
                return
            }

            let songData = []
            let songDataRev = [];

            let context = new AudioContext();
            let audioSrc = context.createMediaElementSource(audio)
            let analyser = context.createAnalyser()

            analyser.fftSize = 2048
            audioSrc.connect(analyser)
            analyser.connect(context.destination)

            let dataArray = new Float32Array(analyser.fftSize)

            allTopicFuncs.push(getAmplitude, getRevAmplitude)

            function convertToAmplitude() {
                analyser.getFloatTimeDomainData(dataArray)

                let sumSquares = 0;

                for (let amplitude of dataArray) {
                    sumSquares += amplitude * amplitude
                }

                return Math.sqrt(sumSquares / analyser.fftSize);
            }

            setInterval(sendAmplitude, 1)
            let currentTimestamp = nt4Client.getServerTime_us()

            function sendAmplitude() {

                currentTimestamp = nt4Client.getServerTime_us() / CONVERSIONRATE
                songData.push(currentTimestamp, convertToAmplitude())
                songDataRev.push(currentTimestamp, convertToAmplitude() * -1)


                // console.log(songValues, audio.src)
                // drawNewData(graph, "Audio File", songKeys, songValuesLow, currentTimestamp)

                // drawNewData(graph, "Audio File", songKeys, songValues, currentTimestamp)

                // {name:"SinTest", keyArray:sinTestKeys, valArray:sinTestValues, timestamp:timestamp}

            }


            function getAmplitude() {

                let tempSongData = structuredClone(songData)
                songData = []

                return { name: "Audio FileR", dataArray: tempSongData, timestamp: currentTimestamp }
            }

            function getRevAmplitude() {

                let tempSongDataRev = structuredClone(songDataRev)
                songDataRev = []

                return { name: "Audio FileL", dataArray: tempSongDataRev, timestamp: currentTimestamp }
            }

            linkedMusic = true
        }
    }

    return { renderer: renderer, allTopicFuncs: allTopicFuncs };
}


function setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph) {
    let scale = findNiceScale(absAsBackup(ticks, "min"), absAsBackup(ticks, "max"))

    setTickScale(scale, ticks)

    if (delta === "y") {

        let secondaryAxisScale
        if (graph.attr("data-linkAxis") == "true") {
            secondaryAxisScale = findRelativeScale(absAsBackup(secondaryTicks, "idealMin"), (absAsBackup(secondaryTicks, "idealMax")), scale)
        } else {
            secondaryAxisScale = findNiceScale(absAsBackup(secondaryTicks, "min"), (absAsBackup(secondaryTicks, "max")))
        }

        setMinMax(setTickScale(secondaryAxisScale, secondaryTicks))

        let absMin = parseFloat(secondaryTicks.attr("data-absMin"))
        let absMax = parseFloat(secondaryTicks.attr("data-absMax"))
        let min = clamp(parseFloat(secondaryTicks.attr("data-min")), absMin, absMax)
        let max = clamp(parseFloat(secondaryTicks.attr("data-max")), absMin, absMax)


        secondarySlider.attr("data-absMin", absMin).attr("data-absMax", absMax).attr("data-min", min)

        if (secondarySlider.attr("data-max") !== "false") {
            secondarySlider.attr("data-max", max)
        }

    }
}


function setCanvasesToTicks(graph, renderer) {
    let graphHolder = graph.children(".graphHolder");
    let primaryCanvas = graphHolder.children(".graphCanvasPrimary");
    let secondaryCanvas = graphHolder.children(".graphCanvasSecondary");


    let xTicks = graph.children(".bottomTicks")
    let primaryTicks = graph.children(".leftTicks")

    let primarySlider = graph.children(".leftSuperSlider")


    let secondaryTicks = graph.children(".rightTicks")

    //For simplicity transformations are made to make the graph up positive. 


    setCanvasToTick(primaryTicks, primarySlider, primaryCanvas)
    // setCanvasToTick(secondaryTicks, secondaryCanvas)


    function setCanvasToTick(ticks, slider, canvas) {
        canvas.attr("data-xViewWidth", (absAsBackup(xTicks, "max") - absAsBackup(xTicks, "min")))
        canvas.attr("data-xViewMax", absAsBackup(xTicks, "max"))
        canvas.attr("data-xViewMin", absAsBackup(xTicks, "min"))

        let max = absAsBackup(ticks, "max")
        let min = absAsBackup(ticks, "min")

        let overriddenMin = false;
        let overriddenMax = false;


        if (ticks.attr("data-max") == "false") {
            max = renderer.getMinMaxInView().max
            overriddenMax = true
        }

        if (ticks.attr("data-min") == "false") {
            min = renderer.getMinMaxInView().min
            overriddenMin = true
        }

        if (overriddenMin || overriddenMax) {
            let newscale = findNiceScale(min, max)
            setAbsMinMax(setTickScale(newscale, ticks))

            if (overriddenMax) {
                slider.attr("data-absmax", max);
                slider.attr("data-max", 'false');
            }

            if (overriddenMin) {
                slider.attr("data-absmin", min);
                slider.attr("data-min", 'false');
            }
        }

        canvas.attr("data-yViewHeight", (max - min))
        canvas.attr("data-yViewMax", max)
        canvas.attr("data-yViewMin", min)


    }
}

function drawData(graph, renderer, topics) {

    //topics[ topic {axis, hue, name"", keyArray[], valArray[],}, ]

    let graphHolder = graph.children(".graphHolder");
    let primaryCanvas = graphHolder.children(".graphCanvasPrimary")
    let secondaryCanvas = graphHolder.children(".graphCanvasSecondary")

    syncCamAndDraw(primaryCanvas)


    function syncCamAndDraw(canvas) {
        let currentBounds = {}

        currentBounds.minX = parseFloat(canvas.attr("data-xViewMin"))
        currentBounds.width = parseFloat(canvas.attr("data-xViewWidth"))
        currentBounds.maxX = parseFloat(canvas.attr("data-xViewMax"))

        currentBounds.minY = parseFloat(canvas.attr("data-yViewMin"))
        currentBounds.height = parseFloat(canvas.attr("data-yViewHeight"))
        currentBounds.maxY = parseFloat(canvas.attr("data-yViewMax"))



        for (let i in topics) {
            renderer.addData(topics[i].name, topics[i].dataArray);
            topics[i].dataArray = [];

        }


        renderer.setCamera(currentBounds.maxX - (currentBounds.width / 2), currentBounds.minY + (currentBounds.height / 2), (canvas.width() / canvas.height()) / (currentBounds.width / 2), 1 / (currentBounds.height / 2))
    }

}



function detectTrackPad(e) {
    let isTrackpad = false;
    if (e.wheelDeltaY) {
        if (e.wheelDeltaY === (e.deltaY * -3)) {
            isTrackpad = true;
        }
    }
    else if (e.deltaMode === 0) {
        isTrackpad = true;
    }

    return isTrackpad

    // console.log(isTrackpad ? "Trackpad detected" : "Mousewheel detected");
}

function triggerGraphEffector(graphEffector, animationClass) {
    if (graphEffector.hasClass("graphEffector" + animationClass)) return

    graphEffector.removeClass("graphEffector" + animationClass)
    graphEffector.offset()
    graphEffector.addClass("graphEffector" + animationClass)

    setTimeout(() => {
        graphEffector.removeClass("graphEffector" + animationClass)

    }, 1000);

}

function setMinMax(scaleObject, slider = false) {
    scaleObject.element.attr("data-min", scaleObject.minimum).attr("data-max", scaleObject.maximum)

    let absMin = scaleObject.element.attr("data-absMin")
    let absMax = scaleObject.element.attr("data-absMax")



    if (slider) {
        slider.attr("data-min", clamp(scaleObject.minimum, absMin, absMax))
        slider.attr("data-max", clamp(scaleObject.maximum, absMin, absMax))
    }

}

function setAbsMinMax(scaleObject) {
    scaleObject.element.attr("data-absmin", scaleObject.minimum).attr("data-absmax", scaleObject.maximum)
}

function niceNum(localRange, round) {
    let exponent; /** exponent of localRange */
    let fraction; /** fractional part of localRange */
    let niceFraction; /** nice, rounded fraction */

    exponent = Math.floor(Math.log10(localRange));
    fraction = localRange / Math.pow(10, exponent);

    if (round) {
        if (fraction < 1.5)
            niceFraction = 1;
        else if (fraction < 3)
            niceFraction = 2;
        else if (fraction < 7)
            niceFraction = 5;
        else
            niceFraction = 10;
    } else {
        if (fraction <= 1)
            niceFraction = 1;
        else if (fraction <= 2)
            niceFraction = 2;
        else if (fraction <= 5)
            niceFraction = 5;
        else
            niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
}

function absAsBackup(element, attr) {
    let val = element.attr("data-" + attr)
    if ((val == "false" || val === undefined) && attr.includes("ideal")) {
        element.attr("data-" + attr, parseFloat(element.attr("data-abs" + attr.slice(5, 10))))

        return parseFloat(element.attr("data-abs" + attr.slice(5, 10)))


    }

    if (val == "false" || isNaN(parseFloat(val))) {
        return parseFloat(element.attr("data-abs" + attr))
    }

    return parseFloat(val)
}

function setTickAttributes(ticks, slider, min = false, max = false, absMin = false, absMax = false) {

    if (min) {
        ticks.attr("data-min", min)
        slider.attr("data-min", min)

        ticks.attr("data-idealMin", min)

    }

    if (max) {
        ticks.attr("data-max", max)
        slider.attr("data-max", max)

        ticks.attr("data-idealMax", max)

    }

    if (absMin) {
        ticks.attr("data-absMin", absMin)
        slider.attr("data-absMin", absMin)
    }

    if (absMax) {
        ticks.attr("data-absMax", absMax)
        slider.attr("data-absMax", absMax)
    }

}


function findNiceScale(minimum, maximum, precision = 8) {
    var minPoint;
    var maxPoint;
    var maxTicks = 9;
    var tickSpacing;
    var range;
    var niceMin;
    var niceMax;


    minimum = parseFloat(minimum)
    maximum = parseFloat(maximum)
    //Found from stack overflow

    /**
     * Instantiates a new instance of the NiceScale class.
     *
     *  min the minimum data point on the axis
     *  max the maximum data point on the axis
     */
    function niceScale(min, max) {
        minPoint = min;
        maxPoint = max;
        calculate();


        niceMax = parseFloat(niceMax.toFixed(precision));
        niceMin = parseFloat(niceMin.toFixed(precision));
        tickSpacing = parseFloat(tickSpacing.toFixed(precision));

        let amountOfTicks = (niceMax - niceMin) / tickSpacing

        amountOfTicks = parseFloat(amountOfTicks.toFixed(precision));

        return {
            amountOfTicksNeeded: amountOfTicks,
            tickSpacing: tickSpacing,
            niceMinimum: niceMin,
            niceMaximum: niceMax,
            minimum: minimum,
            maximum: maximum,
            precision: precision,
        };
    }



    /**
     * Calculate and update values for tick spacing and nice
     * minimum and maximum data points on the axis.
     */
    function calculate() {
        range = niceNum(maxPoint - minPoint, false);
        tickSpacing = niceNum(range / (maxTicks - 1), true);
        niceMin =
            Math.ceil(minPoint / tickSpacing) * tickSpacing;
        niceMax =
            Math.ceil(maxPoint / tickSpacing) * tickSpacing;
    }

    return niceScale(minimum, maximum)
}

function findRelativeScale(min, max, niceScale, displacement = 1) {
    let numTicks = niceScale.amountOfTicksNeeded;
    let precision = niceScale.precision;

    let idealMin = parseFloat(min);
    let idealMax = parseFloat(max);

    let scaledMin = idealMin * displacement;
    let scaledMax = idealMax * displacement;

    let range = scaledMax - scaledMin;
    let tickSpacing = range / (numTicks > 1 ? numTicks - 1 : 1);

    const exponent = Math.floor(Math.log10(tickSpacing));
    const powerOf10 = Math.pow(10, exponent);
    const fractionalSpacing = tickSpacing / powerOf10;

    let niceFractional;
    if (fractionalSpacing < 1.75) niceFractional = 1.5;
    else if (fractionalSpacing < 2.75) niceFractional = 2.5;
    else if (fractionalSpacing < 3.5) niceFractional = 3;
    else if (fractionalSpacing < 4.5) niceFractional = 4;
    else if (fractionalSpacing < 7.5) niceFractional = 5;
    else niceFractional = 10;

    let niceSpacing = (niceFractional * powerOf10) / displacement;

    let niceMin = (Math.floor(scaledMin / niceSpacing) * niceSpacing) / displacement;
    let actualNiceMax = niceMin + ((numTicks - 1) * niceSpacing);

    let fullRange = (niceScale.maximum - niceScale.minimum);
    let ratioPadding = (niceScale.niceMinimum - niceScale.minimum) / fullRange;
    let ratioVisible = (niceScale.niceMaximum - niceScale.niceMinimum) / fullRange;

    let newRange = ratioVisible > 0 ? (actualNiceMax - niceMin) / ratioVisible : 0;
    let newMinimum = niceMin - (newRange * ratioPadding);
    let newMaximum = newMinimum + newRange;

    return {
        amountOfTicksNeeded: numTicks,
        tickSpacing: niceSpacing,
        niceMinimum: niceMin,
        niceMaximum: actualNiceMax,
        precision: precision,
        minimum: newMinimum,
        maximum: newMaximum,
        idealMin: idealMin,
        idealMax: idealMax
    };
}

function setTickScale(foundNiceScale, element) {

    // element.attr("data-min", foundNiceScale.minimum)
    // element.attr("data-max", foundNiceScale.maximum)
    element.attr("data-tickMin", foundNiceScale.niceMinimum)
    element.attr("data-tickMax", foundNiceScale.niceMaximum)
    element.attr("data-tickSpacing", foundNiceScale.tickSpacing)
    element.attr("data-amountOfTicks", foundNiceScale.amountOfTicksNeeded)
    element.attr("data-graphWidth", pxToCq($($(".currentTab").attr("data-page")), element.parent().children(".graphHolder").width()).cqh)
    element.attr("data-graphHeight", pxToCq($($(".currentTab").attr("data-page")), element.parent().children(".graphHolder").height()).cqh)

    if (foundNiceScale.hasOwnProperty("idealMin")) {
        element.attr("data-idealMin", foundNiceScale.idealMin)
        element.attr("data-idealMax", foundNiceScale.idealMax)
    }

    let children = element.children()



    for (let i = 0; i < children.length; i++) {
        let eq = children.eq(i)

        //set text from computed css text 
        if (children.length - 1 - i > foundNiceScale.amountOfTicksNeeded - 1) {
            eq.text("")
            //Display all text for debuh
            // eq.text(parseFloat((foundNiceScale.niceMinimum + ((children.length - 1 - i) * foundNiceScale.tickSpacing)).toFixed(foundNiceScale.precision)));

            eq[0].style.setProperty("--lineColor", "transparent")
            continue
        }


        eq[0].style.setProperty("--lineColor", "inherit")

        if (isNaN(parseFloat(foundNiceScale.niceMinimum + ((children.length - 1 - i) * foundNiceScale.tickSpacing)))) {
            eq.text("")
        } else {
            eq.text(parseFloat((foundNiceScale.niceMinimum + ((children.length - 1 - i) * foundNiceScale.tickSpacing)).toFixed(foundNiceScale.precision)));
        }
    }

    foundNiceScale.element = element

    return foundNiceScale

}

function dragPseudoEvent($elementBound, fn, fireEndOnLeave = true, executeFnOnLeave = false, storeNativeEvents = false) {
    //storeNativeEvents prevents logging of event argument

    let pseudoEvent = {
        isPseudoEvent: true,
        pseudoEventType: "drag",
        originalEvent: {},
        preventDefault: () => { },
    }

    let startDrag = false

    $elementBound.on("pointerdown", (event) => {
        startDrag = true

        pseudoEvent.boundElement = $elementBound;

        pseudoEvent.pageX = event.pageX
        pseudoEvent.pageY = event.pageY

        pseudoEvent.startPageX = event.pageX
        pseudoEvent.startPageY = event.pageY

        pseudoEvent.dirSwitchPageX = event.pageX
        pseudoEvent.dirSwitchPageY = event.pageY

        pseudoEvent.deltaAbs = 0
        pseudoEvent.deltaX = 0
        pseudoEvent.deltaY = 0

        if (storeNativeEvents) {
            pseudoEvent.startEvent = event
        }

        pseudoEvent.startCtrlKey = event.ctrlKey
        pseudoEvent.startShiftKey = event.shiftKey

        pseudoEvent.ctrlKey = event.ctrlKey
        pseudoEvent.shiftKey = event.shiftKey
    })

    let moveFunc = (event) => {
        if (Math.sign(parseFloat((event.pageX - pseudoEvent.pageX))) == Math.sign(parseFloat(pseudoEvent.deltaXfromLastMove))) {

        } else {
            pseudoEvent.dirSwitchPageX = parseFloat(event.pageX)

        }

        if (Math.sign(parseFloat((event.pageY - pseudoEvent.pageY))) == Math.sign(parseFloat(pseudoEvent.deltaYfromLastMove))) {

        } else {
            pseudoEvent.dirSwitchPageY = parseFloat(event.pageY)

        }

        pseudoEvent.deltaXfromLastMove = parseFloat((event.pageX - pseudoEvent.pageX))
        pseudoEvent.deltaYfromLastMove = parseFloat((event.pageY - pseudoEvent.pageY))

        pseudoEvent.deltaX = event.pageX - pseudoEvent.dirSwitchPageX
        pseudoEvent.deltaY = event.pageY - pseudoEvent.dirSwitchPageY

        pseudoEvent.deltaAbs = Math.sqrt(pseudoEvent.deltaX ** 2 + pseudoEvent.deltaY ** 2)

        pseudoEvent.ctrlKey = event.ctrlKey
        pseudoEvent.shiftKey = event.shiftKey

        pseudoEvent.pageX = event.pageX
        pseudoEvent.pageY = event.pageY

        if (startDrag) {
            if (storeNativeEvents) {
                pseudoEvent.moveEvent = event
            }

            fn(pseudoEvent)
            return
        }
        if (storeNativeEvents) {
            pseudoEvent.dragglessMoveEvent = event
        }
    }

    let endFunc = () => {
        startDrag = false

        pseudoEvent.pageX = 0
        pseudoEvent.pageY = 0

        pseudoEvent.startPageX = 0
        pseudoEvent.startPageY = 0

        pseudoEvent.dirSwitchPageX = 0
        pseudoEvent.dirSwitchPageY = 0

        pseudoEvent.deltaAbs = 0
        pseudoEvent.deltaX = 0
        pseudoEvent.deltaY = 0

        pseudoEvent.startEvent = false
        pseudoEvent.moveEvent = false
        pseudoEvent.dragglessMoveEvent = false

        pseudoEvent.startCtrlKey = false
        pseudoEvent.startShiftKey = false

        pseudoEvent.ctrlKey = false
        pseudoEvent.shiftKey = false

        if (executeFnOnLeave) {
            fn(pseudoEvent)
        }
    }

    if (fireEndOnLeave) {
        $elementBound.on("pointerup pointercancel pointerleave", endFunc)
        $elementBound.on("pointermove", moveFunc)

    } else {
        let randomEventNamespacePC = "pointerup." + Math.random().toString().slice(2, 9) + " pointercancel." + Math.random().toString().slice(2, 9)
        let randomEventNamespaceM = "pointermove." + Math.random().toString().slice(2, 9);

        $("html").on(randomEventNamespacePC, endFunc)
        $("html").on(randomEventNamespaceM, moveFunc)

    }



}

function runSinTest() {
    let currentTimestamp = nt4Client.getServerTime_us() / CONVERSIONRATE

    let sinTestData = []

    sinTestData.push(currentTimestamp, Math.sin(nt4Client.getServerTime_us() / CONVERSIONRATE))
    // sinTestValues.push()

    return { name: "SinTest", dataArray: sinTestData, timestamp: currentTimestamp }
}

