// import { NT4_Client } from "../../../lib/nt4.js";
import { pxToCq, clamp } from "../../ui.js";
import { nt4Client } from "../../coms.js";
import { WebGPULineGraph } from "../../../lib/gpuDrawer.js"


// let canvas = document.getElementById("testMain");

export function initGraph(graph) {
    let canvas = graph.find("graphCanvasPrimary")[0]

    let renderer = new WebGPULineGraph()

    renderer.initialize(canvas)
    renderer.setCamera(0, 0, $(canvas).width(), $(canvas).height())

    let testScale = findNiceScale(absAsBackup($(".leftTicks"), "min"), absAsBackup($(".leftTicks"), "max"))

    setTickScale(testScale, $(".leftTicks"))

    let testSync
    if ($(".graph").attr("data-linkAxis") == "true") {
        testSync = findRelativeScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")), testScale)
    } else {
        testSync = findNiceScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")))
    }


}


// $(canvas).attr("width", $(canvas).width()).attr("height", $(canvas).height())
// console.log(canvas)

// renderer.initialize(canvas)
// renderer.setCamera(0,0, $(canvas).width(), $(canvas).height())


// let testScale = findNiceScale(absAsBackup($(".leftTicks"), "min"), absAsBackup($(".leftTicks"), "max"))

// setTickScale(testScale, $(".leftTicks"))
// setTickScale(findDependantScale($(".rightTicks").attr("data-min"), $(".rightTicks").attr("data-max"), testScale), $(".rightTicks"))
// let testSync = findRelativeScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")), testScale)


// let testSync
// if ($(".graph").attr("data-linkAxis") == "true") {
//     testSync = findRelativeScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")), testScale)
// } else {
//     testSync = findNiceScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")))
// }




// let testSync = findNiceScale($(".rightTicks").attr("data-min"), ($(".rightTicks").attr("data-max")))

let viewableZoomedUnitsX = 14;
let viewableZoomedUnitsY = false;

let offsetX = 0
let offsetY = 0


// setAbsMinMax(setTickScale(testSync, $(".rightTicks")))

export const CONVERSIONRATE = 1000000.0

// let sinTest = {}

//Test interval

// setTimeout(() => {
//     requestAnimationFrame(draw)
// }, 3000)


let allTopicFuncs = []//[runSinTest]

function runSinTest() {
    let currentTimestamp = nt4Client.getServerTime_us() / CONVERSIONRATE

    let sinTestData = []

    sinTestData.push(currentTimestamp, Math.sin(nt4Client.getServerTime_us() / 1000000.0))
    // sinTestValues.push()

    return { name: "SinTest", dataArray: sinTestData, timestamp: currentTimestamp }
}


// (async () => {
//     await renderer.initialize(canvas)

//     renderer.createLine("SinTest", "#00ffb3", 10)
//     renderer.createLine("OdomFrequency", "#8400ff", 3)
//     renderer.createLine("Audio FileR", "#ffffff", 8)
//     renderer.createLine("Audio FileL", "#ffffff", 8)
// })()



function draw() {
    setCanvasesToTicks($(".graph"))

    // let odomTopic = drawOdom()
    // // console.log(odomTopic)
    // let currentTimestamp = nt4Client.getServerTime_us()

    // sinTestKeys.push(currentTimestamp.toString())
    // sinTestValues.push(Math.sin(nt4Client.getServerTime_us() / 1000000.0))
    // // sinTestValues.push(1)

    //topics[ topic {axis, name"", keyArray[], valArray[],}, ]
    // drawNewData($(".graph"), "test", sinTestKeys, sinTestValues, currentTimestamp)
    let allTopics = []

    for (let i = 0; i < allTopicFuncs.length; i++) {
        allTopics.push(allTopicFuncs[i]())
    }

    drawData($(".graph"), renderer, allTopics)//[ odomTopic, {name:"sinTest", keyArray:sinTestKeys, valArray:sinTestValues, timestamp:currentTimestamp}])
    renderer.render()
    let absMax = (nt4Client.getServerTime_us() / 1000000.0)
    $(".bottomTicks").attr("data-absmax", absMax)
    $(".bottomSuperSlider").attr("data-absmax", absMax)
    $(".superSliderBottom").attr("max", absMax)
    $(".superSliderTop").attr("max", absMax)

    if ($(".bottomTicks").attr("data-max") == "false" && $(".bottomTicks").attr("data-min") != "false") {
        let min = (nt4Client.getServerTime_us() / 1000000.0) - viewableZoomedUnitsX
        let absMin = 0

        $(".bottomTicks").attr("data-min", min)
        $(".bottomTicks").attr("data-absmax", absMax)

        $(".bottomSuperSlider").attr("data-min", min)
        $(".bottomSuperSlider").attr("data-absmax", absMax)


        $(".superSliderBottom").attr("max", absMax).attr("min", absMin).val(min)
        $(".superSliderTop").attr("max", absMax).attr("min", absMin)

    }


    let yscale = findNiceScale(absAsBackup($(".bottomTicks"), "min"), absAsBackup($(".bottomTicks"), "max"))

    setTickScale(yscale, $(".bottomTicks"))
    requestAnimationFrame(draw)
}



//Scroll wheel Binder
$(".graphHolder").on("wheel", (event) => {
    zoomAndPanHandler(event, $(".graph"))
})


//drag binder
dragPsuedoEvent($(".graphHolder"), (event) => {
    zoomAndPanHandler(event, $(".graph"))
})

let initiatedScrollAxis = ''
let currentResetTimeout;


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

    if (event.ctrlKey && !event.isPsuedoEvent) {
        graphZoomY()
    } else if ((event.originalEvent.deltaY > tolerance || event.originalEvent.deltaY < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "ZOOMX") && !event.isPsuedoEvent && bottomTicks.attr("data-max") == "false") {
        initiatedScrollAxis = "ZOOMX"
        graphZoomXFromRight()
    } else if ((event.originalEvent.deltaY > tolerance || event.originalEvent.deltaY < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "ZOOMX") && !event.isPsuedoEvent) {
        initiatedScrollAxis = "ZOOMX"
        graphZoomXFromMouse()
    }
    else if ((event.originalEvent.deltaX > tolerance || event.originalEvent.deltaX < -tolerance) && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETX") && !event.isPsuedoEvent) {
        initiatedScrollAxis = "OFFSETX"
        graphOffsetX()
    }
    //These are triggered by the dragPseudoEvent which also executes this function. None of the other cases can be called though for multiple reasons. Pseudoevent dosent have origional event but the !event.isPsudeoEvent is there as a failsafe.
    else if (((event.deltaX > tolerance * 8) || event.deltaX < -(tolerance * 8)) && (event.deltaY > tolerance * 8 || event.deltaY < -(tolerance * 8)) && ((!initiatedScrollAxis || initiatedScrollAxis === "OFFSETXY") || initiatedScrollAxis == "OFFSETX" || initiatedScrollAxis == "OFFSETY")) {
        initiatedScrollAxis = "OFFSETXY"
        graphOffsetX()
        graphOffsetY()
    }
    else if ((event.deltaX > tolerance * 8) || event.deltaX < -(tolerance * 8) && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETX")) {
        initiatedScrollAxis = "OFFSETX"
        graphOffsetX()
    }
    else if ((event.deltaY > tolerance * 8) || event.deltaY < -(tolerance * 8) && (!initiatedScrollAxis || initiatedScrollAxis === "OFFSETY")) {
        initiatedScrollAxis = "OFFSETY"
        graphOffsetY()
    }

    clearTimeout(currentResetTimeout);

    currentResetTimeout = setTimeout(() => {
        initiatedScrollAxis = ''
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

        let offset = absMax - viewableZoomedUnitsX

        if (offset < absMin) {
            offset = absMin
            viewableZoomedUnitsX = absMax - absMin
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

            let range = oldValMax - oldValMin;

            let center = (pointer.xP * range) + oldValMin;

            let min = center - (viewableZoomedUnitsX * pointer.xP)
            let max = center + (viewableZoomedUnitsX * (1 - pointer.xP))

            if (absMax < max && absMin > min) {
                min = absMin
                max = absMax
                viewableZoomedUnitsX = range;
            } else if (absMax < max) {
                max = absMax - 1
                min = absMax - viewableZoomedUnitsX
            } else if (absMin > min) {
                min = absMin + 1
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

        let range = oldLeftValMax - oldLeftValMin;

        let center = (pointer.yP * range) + oldLeftValMin;

        if (viewableZoomedUnitsY == false) {
            viewableZoomedUnitsY = range;
        } else if (viewableZoomedUnitsY + event.originalEvent.deltaY < 0.005) {
            viewableZoomedUnitsY = 0.005
        } else if (isTrackpad) {
            viewableZoomedUnitsY += event.originalEvent.deltaY
        } else {
            viewableZoomedUnitsY += event.originalEvent.deltaY / 64
        }

        let min = center - (viewableZoomedUnitsY * pointer.yP)
        let max = center + (viewableZoomedUnitsY * (1 - pointer.yP))
        // console.log(viewableZoomedUnitsY)

        if (absLeftMax < max && absLeftMin > min) {
            min = absLeftMin
            max = absLeftMax
            viewableZoomedUnitsY = range;
        } else if (absLeftMax < max) {
            max = absLeftMax - 1
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

        if (event.isPsuedoEvent) {
            offsetX = (clamp(event.deltaXfromLastMove / holder.width(), -1) * viewableZoomedUnitsX)
        } else {
            offsetX = - event.originalEvent.deltaX
        }

        let oldMax = absAsBackup(bottomTicks, "max")

        let absMin = parseFloat(bottomTicks.attr("data-absMin"))

        if (oldMax - offsetX - viewableZoomedUnitsX < absMin) {
            offsetX = oldMax + absMin - viewableZoomedUnitsX
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

        if (event.isPsuedoEvent) {
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


        triggerGraphEffector(graph.find(".graphEffectorOverlay"), "flushAnimaiton")

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

// bindSuperSlider($(".bottomSuperSlider"), $(".bottomTicks"))
// bindSuperSlider($(".leftSuperSlider"), $(".leftTicks"), "y", $(".rightTicks"), $(".rightSuperSlider"), $(".graph"))
// bindSuperSlider($(".rightSuperSlider"), $(".rightTicks"), "y", $(".leftTicks"), $(".leftSuperSlider"), $(".graph"))


function bindSuperSlider(superSlider, ticks, delta = "x", secondaryTicks, secondarySlider, graph) {
    let bottomSlider = superSlider.children(".bottomSlider");
    let topSlider = superSlider.children(".topSlider");
    let midSlider = superSlider.children(".midSlider");

    dragPsuedoEvent(bottomSlider.children(".sliderThumb"), (event) => {


        let deltaPercentage;

        if (delta === "x") deltaPercentage = event.deltaXfromLastMove / event.boundElement.parent().width()
        else deltaPercentage = -event.deltaYfromLastMove / event.boundElement.parent().height()

        let slider = event.boundElement.parent().parent()

        let newValue = deltaPercentage * (parseFloat(slider.attr("data-absMax")) - parseFloat(slider.attr("data-absMin")))

        let oldValue = absAsBackup(slider, "min")

        let finalValue = clamp(oldValue + newValue, parseFloat(slider.attr("data-absMin")), absAsBackup(slider, "max") - 0.05)


        if (oldValue + newValue < parseFloat(slider.attr("data-absMin"))) {
            ticks.attr("data-min", "false")
            slider.attr("data-min", slider.attr("data-absMin"))

            setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)

            if (delta === "x") triggerGraphEffector($(".graph").find(".graphEffectorOverlay"), "revFlushAnimaiton");
            else triggerGraphEffector($(".graph").find(".graphEffectorOverlay"), "downFlushAnimaiton")

            return
        }

        setTickAttributes(ticks, slider, finalValue)
        setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)


        if (delta === "x") viewableZoomedUnitsX = absAsBackup(slider, "max") - absAsBackup(slider, "min");
        else viewableZoomedUnitsY = absAsBackup(slider, "max") - absAsBackup(slider, "min");

    }, false)

    dragPsuedoEvent(topSlider.children(".sliderThumb"), (event) => {

        let deltaPercentage;

        if (delta === "x") deltaPercentage = event.deltaXfromLastMove / event.boundElement.parent().width()
        else deltaPercentage = -event.deltaYfromLastMove / event.boundElement.parent().height()

        let slider = event.boundElement.parent().parent()

        let newValue = deltaPercentage * (parseFloat(slider.attr("data-absMax")) - parseFloat(slider.attr("data-absMin")))

        let oldValue = absAsBackup(slider, "max")

        let finalValue = clamp(newValue + oldValue, absAsBackup(slider, "min") + 0.05, parseFloat(slider.attr("data-absMax")))

        if (oldValue + newValue > parseFloat(slider.attr("data-absMax"))) {
            setTickAttributes(ticks, slider, false, "false")

            setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)

            if (delta === "x") triggerGraphEffector($(".graph").find(".graphEffectorOverlay"), "flushAnimaiton");
            else triggerGraphEffector($(".graph").find(".graphEffectorOverlay"), "upFlushAnimaiton")

            return
        }

        setTickAttributes(ticks, slider, false, finalValue)
        setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)

        if (delta === "x") viewableZoomedUnitsX = absAsBackup(slider, "max") - absAsBackup(slider, "min");
        else viewableZoomedUnitsY = absAsBackup(slider, "max") - absAsBackup(slider, "min");
    }, false)

    dragPsuedoEvent(midSlider.children(".sliderThumb"), (event) => {

        let deltaPercentage;

        if (delta === "x") deltaPercentage = event.deltaXfromLastMove / event.boundElement.parent().width()
        else deltaPercentage = -event.deltaYfromLastMove / event.boundElement.parent().height()

        let slider = event.boundElement.parent().parent()

        let newValue = deltaPercentage * (parseFloat(slider.attr("data-absMax")) - parseFloat(slider.attr("data-absMin")))
        let oldMin = absAsBackup(slider, "min")
        let oldMax = absAsBackup(slider, "max")

        let absMin = parseFloat(ticks.attr("data-absMin"))

        if (oldMin + newValue < parseFloat(slider.attr("data-absMin"))) {
            return
        }
        if (oldMax + newValue > parseFloat(slider.attr("data-absMax"))) {
            if (delta === "x") triggerGraphEffector($(".graph").find(".graphEffectorOverlay"), "flushAnimaiton");
            else return

            if (absMin > parseFloat(ticks.attr("data-absMax")) - viewableZoomedUnitsX) {
                viewableZoomedUnitsX = parseFloat(ticks.attr("data-absMax")) - absMin
            }

            setTickAttributes(ticks, slider, false, "false")
            setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)

            offsetX = 0
            return
        }

        setTickAttributes(ticks, slider, oldMin + newValue, oldMax + newValue)
        setNewTickScaleDelta(delta, ticks, secondaryTicks, secondarySlider, graph)
    }, false)
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

function detectTrackPad(e) {
    var isTrackpad = false;
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
            // eq.text(parseFloat((foundNiceScale.niceMinimum + ((children.length - 1 - i) * foundNiceScale.tickSpacing)).toFixed(foundNiceScale.percision)));

            eq[0].style.setProperty("--lineColor", "transparent")
            continue
        }


        eq[0].style.setProperty("--lineColor", "inherit")

        eq.text(parseFloat((foundNiceScale.niceMinimum + ((children.length - 1 - i) * foundNiceScale.tickSpacing)).toFixed(foundNiceScale.percision)));
    }

    foundNiceScale.element = element

    return foundNiceScale

}

function findNiceScale(minimum, maximum, percision = 8) {
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


        niceMax = parseFloat(niceMax.toFixed(percision));
        niceMin = parseFloat(niceMin.toFixed(percision));
        tickSpacing = parseFloat(tickSpacing.toFixed(percision));

        let amountOfTicks = (niceMax - niceMin) / tickSpacing

        amountOfTicks = parseFloat(amountOfTicks.toFixed(percision));

        return {
            amountOfTicksNeeded: amountOfTicks,
            tickSpacing: tickSpacing,
            niceMinimum: niceMin,
            niceMaximum: niceMax,
            minimum: minimum,
            maximum: maximum,
            percision: percision,
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

    let currentScale = niceScale(minimum, maximum)


    // console.log(startString, currentScale)

    return niceScale(minimum, maximum)


}

function findRelativeScale(min, max, niceScale, displacement = 1) {

    //this code is so cursed sometimes it goes way above tick count and i have to manually fix it this is why i dont use ai bc it makes stuff like this i had to do the last half manually
    //if someone can make this better please do bro I beg you

    let numTicks = niceScale.amountOfTicksNeeded
    let percision = niceScale.percision

    let idealMin = min
    let idealMax = max

    min = parseFloat(min) * displacement
    max = parseFloat(max) * displacement

    const range = max - min;
    const initialTickSpacing = range / (numTicks > 1 ? numTicks : 5);

    const exponent = Math.floor(Math.log10(initialTickSpacing));
    const powerOf10 = Math.pow(10, exponent);

    const fractionalSpacing = initialTickSpacing / powerOf10;

    let niceFractional;
    if (fractionalSpacing < 1.75) {
        niceFractional = 1.5;
    } else if (fractionalSpacing < 2.75) {
        niceFractional = 2.5;
    } else if (fractionalSpacing < 3.5) {
        niceFractional = 3;
    } else if (fractionalSpacing < 4.5) {
        niceFractional = 4;
    } else if (fractionalSpacing < 7.5) {
        niceFractional = 5; // Fallback to 5 if the range dictates
    } else {
        niceFractional = 10; // Increase power of 10
    }


    let niceSpacing = (niceFractional * powerOf10) / displacement;

    let tickCalc = 0

    // The new min is the largest multiple of niceSpacing less than or equal to the original min
    let niceMin = (Math.floor(min / niceSpacing) * niceSpacing) / displacement;


    // The new max is the smallest multiple of niceSpacing greater than or equal to the original max
    let niceMax = Math.ceil(max / niceSpacing) * niceSpacing;

    for (let i = 0; i < 11; i++) {

        if ((niceMin + (i * niceSpacing)) <= niceMax) {
            tickCalc = i + 1
        } else {
            break
        }
    }

    if (tickCalc > numTicks) {
        niceMin += niceSpacing
    } else if (numTicks > tickCalc) {
        niceMin -= niceSpacing
    }

    let actualNiceMax = (niceMin + ((numTicks) * niceSpacing))

    let fullRange = (niceScale.maximum - niceScale.minimum)
    let ratioPadding = (niceScale.niceMinimum - niceScale.minimum) / fullRange;
    let ratioVisible = (niceScale.niceMaximum - niceScale.niceMinimum) / fullRange;

    let newRange = (actualNiceMax - niceMin) / ratioVisible

    let newMinimum = niceMin - (newRange * ratioPadding)
    let newMaximum = newMinimum + newRange


    return {
        amountOfTicksNeeded: numTicks,
        tickSpacing: niceSpacing,
        niceMinimum: niceMin,
        niceMaximum: (niceMin + ((numTicks - 1) * niceSpacing)),
        percision: percision,
        minimum: newMinimum,
        maximum: newMaximum,
        idealMin: idealMin,
        idealMax: idealMax
    };


}

function niceNum(localRange, round) {
    var exponent; /** exponent of localRange */
    var fraction; /** fractional part of localRange */
    var niceFraction; /** nice, rounded fraction */

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

function triggerGraphEffector(graphEffector, animationClass) {
    if (graphEffector.hasClass("graphEffector" + animationClass)) return

    graphEffector.removeClass("graphEffector" + animationClass)
    graphEffector.offset()
    graphEffector.addClass("graphEffector" + animationClass)

    setTimeout(() => {
        graphEffector.removeClass("graphEffector" + animationClass)

    }, 1000);

}

export function dragPsuedoEvent($elementBound, fn, fireEndOnLeave = true, executeFnOnLeave = false, storeNativeEvents = false) {
    //storeNativeEvents prevents logging of event argument

    let psuedoEvent = {
        isPsuedoEvent: true,
        psudeoEventType: "drag",
        originalEvent: {},
        preventDefault: () => { },
    }

    let startDrag = false

    $elementBound.on("pointerdown", (event) => {
        startDrag = true

        psuedoEvent.boundElement = $elementBound;

        psuedoEvent.pageX = event.pageX
        psuedoEvent.pageY = event.pageY

        psuedoEvent.startPageX = event.pageX
        psuedoEvent.startPageY = event.pageY

        psuedoEvent.dirSwitchPageX = event.pageX
        psuedoEvent.dirSwitchPageY = event.pageY

        psuedoEvent.deltaAbs = 0
        psuedoEvent.deltaX = 0
        psuedoEvent.deltaY = 0

        if (storeNativeEvents) {
            psuedoEvent.startEvent = event
        }

        psuedoEvent.startCtrlKey = event.ctrlKey
        psuedoEvent.startShiftKey = event.shiftKey

        psuedoEvent.ctrlKey = event.ctrlKey
        psuedoEvent.shiftKey = event.shiftKey
    })

    let moveFunc = (event) => {
        if (Math.sign(parseFloat((event.pageX - psuedoEvent.pageX))) == Math.sign(parseFloat(psuedoEvent.deltaXfromLastMove))) {

        } else {
            psuedoEvent.dirSwitchPageX = parseFloat(event.pageX)

        }

        if (Math.sign(parseFloat((event.pageY - psuedoEvent.pageY))) == Math.sign(parseFloat(psuedoEvent.deltaYfromLastMove))) {

        } else {
            psuedoEvent.dirSwitchPageY = parseFloat(event.pageY)

        }

        psuedoEvent.deltaXfromLastMove = parseFloat((event.pageX - psuedoEvent.pageX))
        psuedoEvent.deltaYfromLastMove = parseFloat((event.pageY - psuedoEvent.pageY))

        psuedoEvent.deltaX = event.pageX - psuedoEvent.dirSwitchPageX
        psuedoEvent.deltaY = event.pageY - psuedoEvent.dirSwitchPageY

        psuedoEvent.deltaAbs = Math.sqrt(psuedoEvent.deltaX ** 2 + psuedoEvent.deltaY ** 2)

        psuedoEvent.ctrlKey = event.ctrlKey
        psuedoEvent.shiftKey = event.shiftKey

        psuedoEvent.pageX = event.pageX
        psuedoEvent.pageY = event.pageY

        if (startDrag) {
            if (storeNativeEvents) {
                psuedoEvent.moveEvent = event
            }

            fn(psuedoEvent)
            return
        }
        if (storeNativeEvents) {
            psuedoEvent.dragglessMoveEvent = event
        }
    }

    let endFunc = () => {
        startDrag = false

        psuedoEvent.pageX = 0
        psuedoEvent.pageY = 0

        psuedoEvent.startPageX = 0
        psuedoEvent.startPageY = 0

        psuedoEvent.dirSwitchPageX = 0
        psuedoEvent.dirSwitchPageY = 0

        psuedoEvent.deltaAbs = 0
        psuedoEvent.deltaX = 0
        psuedoEvent.deltaY = 0

        psuedoEvent.startEvent = false
        psuedoEvent.moveEvent = false
        psuedoEvent.dragglessMoveEvent = false

        psuedoEvent.startCtrlKey = false
        psuedoEvent.startShiftKey = false

        psuedoEvent.ctrlKey = false
        psuedoEvent.shiftKey = false

        if (executeFnOnLeave) {
            fn(psuedoEvent)
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

$(".linkButton").on("pointerdown", (event) => {
    let ct = $(event.currentTarget)
    let graph = ct.parent().parent()
    let leftTicks = graph.find(".leftTicks")
    let rightTicks = graph.find(".rightTicks")

    let leftSlider = graph.find(".leftSuperSlider")
    let rightSlider = graph.find(".rightSuperSlider")


    ct.toggleClass("linkButtonOn")

    let scale = findNiceScale(absAsBackup(leftTicks, "min"), absAsBackup(leftTicks, "max"))

    setTickScale(scale, leftTicks)

    let secondaryScale

    if (ct.hasClass("linkButtonOn")) {
        secondaryScale = findRelativeScale(rightTicks.attr("data-absMin"), rightTicks.attr("data-absMax"), scale)
        graph.attr("data-linkAxis", "true")
    } else {
        secondaryScale = findNiceScale(rightTicks.attr("data-absMin"), rightTicks.attr("data-absMax"))
        graph.attr("data-linkAxis", "false")

    }
    let setScale = setTickScale(secondaryScale, rightTicks)
    // setAbsMinMax()
    setTickAttributes(rightTicks, rightSlider, setScale.minimum, setScale.maximum, setScale.minimum, setScale.maximum)

})

// setTimeout(() => {
//     $(".graphCanvasPrimary").attr("width", $(".graphCanvasPrimary").width())
//     $(".graphCanvasPrimary").attr("height", $(".graphCanvasPrimary").height())
//     $(".graphCanvasSecondary").attr("width", $(".graphCanvasPrimary").width())
//     $(".graphCanvasSecondary").attr("height", $(".graphCanvasPrimary").height())
// }, 5000);


function setCanvasesToTicks(graph) {
    let graphHolder = graph.children(".graphHolder");
    let primaryCanvas = graphHolder.children(".graphCanvasPrimary");
    let secondaryCanvas = graphHolder.children(".graphCanvasSecondary");




    let xTicks = graph.children(".bottomTicks")
    let primaryTicks = graph.children(".leftTicks")
    let secondaryTicks = graph.children(".rightTicks")



    //For simplicity transformations are made to make the graph up positive. 

    setCanvasToTick(primaryTicks, primaryCanvas)
    // setCanvasToTick(secondaryTicks, secondaryCanvas)


    function setCanvasToTick(ticks, canvas) {
        let ccw = primaryCanvas.width()
        let cch = primaryCanvas.height()

        // canvas.attr("width", ccw)
        // canvas.attr("height", cch)
        let ctx = canvas[0].getContext("2d")
        let xtx = secondaryCanvas[0].getContext("2d")


        // if(canvas.attr("data-xViewWidth") === (absAsBackup(xTicks, "max") - absAsBackup(xTicks, "min")))

        let deltaX = absAsBackup(xTicks, "max") - parseFloat(canvas.attr("data-xViewMax"))
        let deltaPercent = 100 * (deltaX / parseFloat(canvas.attr("data-xViewWidth")));

        let xmin = absAsBackup(xTicks, "min")
        let xmax = absAsBackup(xTicks, "max")

        let ymin = absAsBackup(ticks, "min")
        let ymax = absAsBackup(ticks, "max")

        let absYMin = parseFloat(ticks.attr("data-absMin"))
        let absYMax = parseFloat(ticks.attr("data-absMax"))


        let absXMin = parseFloat(xTicks.attr("data-absMin"))
        let absXMax = parseFloat(xTicks.attr("data-absMax"))

        function ch(percent) {
            return (percent * cch) / 100
        }

        function chp(pixels) {
            return (pixels / cch) * 100
        }

        function cw(percent) {
            return (percent * ccw) / 100
        }

        function cwp(pixels) {
            return (pixels / ccw) * 100
        }


        canvas.attr("data-xViewWidth", (absAsBackup(xTicks, "max") - absAsBackup(xTicks, "min")))
        canvas.attr("data-xViewMax", absAsBackup(xTicks, "max"))
        canvas.attr("data-xViewMin", absAsBackup(xTicks, "min"))

        canvas.attr("data-yViewHeight", (absAsBackup(ticks, "max") - absAsBackup(ticks, "min")))
        canvas.attr("data-yViewMax", absAsBackup(ticks, "max"))
        canvas.attr("data-yViewMin", absAsBackup(ticks, "min"))

    }




}

// createTopicAttributes($(".graphCanvasPrimary"), "test")


// let strokestyle = { color: 0xff0000, width: (canvas.clientHeight / 100) * 0.3, cap: 'round' }


function drawData(graph, renderer, topics) {

    //topics[ topic {axis, hue, name"", keyArray[], valArray[],}, ]

    let graphHolder = graph.children(".graphHolder");
    let primaryCanvas = graphHolder.children(".graphCanvasPrimary")
    let secondaryCanvas = graphHolder.children(".graphCanvasSecondary")

    drawDataToCanvas(primaryCanvas)

    function drawDataToCanvas(canvas) {
        if (canvas.attr("data-drawInfo") !== undefined) {
            syncCamAndDraw(canvas, JSON.parse(canvas.attr("data-drawInfo")))
            return
        }

        let drawInfo = {}

        drawInfo.minX = parseFloat(canvas.attr("data-xViewMin"))
        drawInfo.width = parseFloat(canvas.attr("data-xViewWidth"))
        drawInfo.maxX = parseFloat(canvas.attr("data-xViewMax"))

        drawInfo.minY = parseFloat(canvas.attr("data-yViewMin"))
        drawInfo.height = parseFloat(canvas.attr("data-yViewHeight"))
        drawInfo.maxY = parseFloat(canvas.attr("data-yViewMax"))

        canvas.attr("data-drawInfo", JSON.stringify(drawInfo))
        // scanAndDraw(canvas, drawInfo)
    }

    function syncCamAndDraw(canvas, drawInfo) {
        let currentBounds = {}

        currentBounds.minX = parseFloat(canvas.attr("data-xViewMin"))
        currentBounds.width = parseFloat(canvas.attr("data-xViewWidth"))
        currentBounds.maxX = parseFloat(canvas.attr("data-xViewMax"))

        currentBounds.minY = parseFloat(canvas.attr("data-yViewMin"))
        currentBounds.height = parseFloat(canvas.attr("data-yViewHeight"))
        currentBounds.maxY = parseFloat(canvas.attr("data-yViewMax"))


        compareAndTransform(drawInfo, currentBounds)

        for (let i in topics) {
            //We need to scan in reverse since the current timestamp is the
            //only one we know is logged


            // let keys = new Float64Array(topics[i].keyArray)
            // let values = new Float64Array(topics[i].valArray)

            // console.log(keys)
            // console.log(keys[keys.length-1], values[values.length-1])

            // console.log(topics[i])

            // let startIndex = keys.indexOf(topics[i].timestamp)
            // console.log(topics[i].dataArray)
            renderer.addData(topics[i].name, topics[i].dataArray);

            // console.log(topics[i].keyArray, topics[i].valArray)

            // console.log(topics[i].keyArray[0], topics[].valArray[0], topics[i].name)

            // renderer.camera.x = -currentBounds.maxX + (currentBounds.width/2);
            // renderer.camera.y = currentBounds.minY + (currentBounds.height/2);

            renderer.setCamera(currentBounds.maxX - (currentBounds.width / 2), currentBounds.minY + (currentBounds.height / 2), (canvas.width() / canvas.height()) / (currentBounds.width / 2), 1 / (currentBounds.height / 2))

            console.log(currentBounds.maxX, currentBounds.maxY, currentBounds.width, currentBounds.height)
            console.log(renderer.camera.x, renderer.camera.y, 1 / renderer.camera.zoomX, 1 / renderer.camera.zoomY)
            // renderer.camera.viewX = currentBounds.width/2

            // renderer.camera.viewY=-currentBounds.height/2
            // let gx = graphics.position.x 
            // let gy = graphics.position.y 

            // graphics.moveTo(xValueToPixels(keys[startIndex] / CONVERSIONRATE) - gx, yValueToPixels(values[startIndex]) - gy).stroke(strokestyle);
            // graphics.lineTo(xValueToPixels(keys[startIndex-1] / CONVERSIONRATE) - gx, yValueToPixels(values[startIndex-1]) - gy)
            // let J = 0

            // for (let j = startIndex - 2; keys[j + 2] > xValueToPixels(drawInfo.minX); j--) {
            //     J = j
            //     // console.log(keys[j+2] / CONVERSIONRATE > drawInfo.minX,keys[j+2] / CONVERSIONRATE, drawInfo.minX)
            //     keys[j] = xValueToPixels(keys[j] / CONVERSIONRATE)
            //     values[j] = yValueToPixels(values[j])
            //     // graphics.lineTo(xValueToPixels(keys[j] / CONVERSIONRATE) - gx, yValueToPixels(values[j]) - gy)
            //     if (j <= 0) {
            //         break
            //     }
            // }

            // console.log(keys[J] / CONVERSIONRATE > drawInfo.minX,keys[J] / CONVERSIONRATE, drawInfo.minX, startIndex - J)




            // keys[startIndex] = xValueToPixels(keys[startIndex])
            // values[startIndex] = yValueToPixels(values[startIndex])
            // keys[startIndex - 1] = xValueToPixels(keys[startIndex - 1])
            // values[startIndex - 1] = yValueToPixels(values[startIndex - 1])

            // console.log(keys)

            //  keys[startIndex-] = xValueToPixels(keys[startIndex-2] / CONVERSIONRATE)
            // values[startIndex-1] = yValueToPixels(values[startIndex-2])
            // // for (let j = startIndex - 1; j >= 0; j--) {
            //     keys[j] = xValueToPixels(keys[j] / CONVERSIONRATE)
            //     values[j] = yValueToPixels(values[j])
            // }



            // console.log(keys)
            // console.log(keys)
            // console.log(topics[i].name, (360/topics.length ) * i)

            // renderer.draw(keys.slice(J, startIndex), values.slice(J, startIndex), 1.5, hsvToRgb((360 / topics.length) * i, 50, 50, 1))
            // graphics.lineTo(xValueToPixel(keys[startIndex-1] / CONVERSIONRATE) - gx, yValueToPixels(values[startIndex-1]) - gy).stroke(strokestyle)
            // graphics.lineTo(0,0).stroke(strokestyle)
            // for (let j = startIndex; keys[j] / CONVERSIONRATE > currentBounds.minX; j--) {
            //     // if(keys[j])
            // }
            // keys = null
            // values = null
        }

        canvas.attr("data-drawInfo", JSON.stringify(currentBounds))
        // console.log(renderer.camera)

        function compareAndTransform(oldBounds, newBounds) {
            if (compareFloat(oldBounds.width, newBounds.width)) {
                //Scale X code
            }

            if (compareFloat(oldBounds.height, newBounds.height)) {
                //Scale Y code
            }

            if (!compareFloat(oldBounds.minX, newBounds.minX)) {
                //Traslate X code

                let diffPixels = xValueToPixels(newBounds.minX) - xValueToPixels(oldBounds.minX)



            }

            if (compareFloat(oldBounds.minY, newBounds.minY)) {
                //Translate Y Code
            }
        }

        function xValueToPixels(value) {
            value = parseFloat(value)
            let percent = (value - parseFloat(canvas.attr("data-xViewMin"))) / parseFloat(canvas.attr("data-xViewWidth"))
            // console.log(percent)
            return percent * canvas.width()
        }
        function yValueToPixels(value) {
            value = parseFloat(value)
            let percent = (value - parseFloat(canvas.attr("data-yViewMin"))) / parseFloat(canvas.attr("data-yViewHeight"))
            return (percent * canvas.height() * -1) + canvas.height()
        }
    }


}

export function drawNewData(graph, topic, akeys, avalues, timestamp) {
    drawData(graph, [{ keyArray: akeys, valArray: avalues }], timestamp)
}

// export function drawNewData(graph, topic, akeys, avalues, timestamp) {

//     console.log(topic)

//     let attributeStart = "data-" + topic
//     let graphHolder = graph.children(".graphHolder");
//     let primaryAxis = graphHolder.children(".graphCanvasPrimary")
//     let secondaryAxis = graphHolder.children(".graphCanvasSecondary")

//     drawToAxis(primaryAxis)
//     // drawToAxis(secondaryAxis)


//     function drawToAxis(axis) {
//         // if (axis.attr(attributeStart + "Color")) {

//         // } else {
//         //     return
//         // }


//         // graphics.moveTo(0, 0).stroke({color:0xff0000, width: 40});
//         // graphics.lineTo(canvas.clientWidth, canvas.clientHeight)
//         // graphics.lineTo(900, 900);

//         // graphics.moveTo(canvas.clientWidth, canvas.clientHeight).lineTo(canvas.clientWidth, 990)

//         let keys = new Float64Array(akeys)
//         let values = new Float32Array(avalues)

//         let startIndex = keys.indexOf(timestamp)

//         // ctx.clearRect(0, 0, axis.width(), axis.height())
//         // ctx.moveTo(xValueToPixels(keys[startIndex] / CONVERSIONRATE), yValueToPixels(values[startIndex]))
//         graphics.clear()

//         graphics.stroke(strokestyle);
//         graphics.moveTo(xValueToPixels(keys[startIndex] / CONVERSIONRATE), yValueToPixels(values[startIndex])).stroke(strokestyle);

//         for (let i = startIndex; keys[i] / CONVERSIONRATE > parseFloat(axis.attr("data-xViewMin")); i--) {
//             // ctx.lineTo(xValueToPixels(keys[i] / CONVERSIONRATE), yValueToPixels(values[i]))

//             graphics.lineTo(xValueToPixels(keys[i] / CONVERSIONRATE), yValueToPixels(values[i])).stroke(strokestyle)
//         }

//         // axis.attr(attributeStart + "prevX", timestamp / CONVERSIONRATE)
//         // axis.attr(attributeStart + "prevY", data)

//         function xValueToPixels(value) {
//             value = parseFloat(value)
//             let percent = (value - parseFloat(axis.attr("data-xViewMin"))) / parseFloat(axis.attr("data-xViewWidth"))
//             // console.log(percent)
//             return percent * axis.width()
//         }
//         function yValueToPixels(value) {
//             value = parseFloat(value)
//             let percent = (value - parseFloat(axis.attr("data-yViewMin"))) / parseFloat(axis.attr("data-yViewHeight"))
//             return (percent * axis.height() * -1) + axis.height()
//         }

//     }


// }

function createTopicAttributes(axis, topic) {
    let attributeStart = "data-" + topic

    axis.attr(attributeStart + "Color", "red")

}

// addMusicDropHandler($(".graph"))

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
            // drawNewData($(".graph"), "Audio File", songKeys, songValuesLow, currentTimestamp)

            // drawNewData($(".graph"), "Audio File", songKeys, songValues, currentTimestamp)

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

function compareFloat(val1, val2) {
    return Math.abs(val1 - val2) < 0.00000001;
}

function hsvToRgb(h, s, v, a = 1) {
    let r, g, b;
    h /= 60; // Sector 0 to 5
    s; // Saturation 0 to 1
    v; // Value 0 to 1

    let i = Math.floor(h);
    let f = h - i; // Factorial part of h
    let p = v * (1 - s);
    let q = v * (1 - s * f);
    let t = v * (1 - s * (1 - f));

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    //   return {
    //     r: r ,
    //     g: g ,
    //     b: b ,
    //     a
    //   };
    return [r, g, b, a]
}