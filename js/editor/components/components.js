// MIT License
// Copyright (c) 2025 Tigerbots
// https://github.com/Tigerbots2183

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// 

import { changeSimilarInputs, addEditHandler } from "../editorUi.js"
import { toastMessage } from "../../ui.js"
import { connectionDate, subscribedTopics, nt4Client, getStructValue } from "../../coms.js"
import { objectIncludes } from "../../../lib/util.js"
import { addToRender } from "../../renderer.js"
import { initGraph } from "./graph.js"

export let defaultSimilarOptions = {
    fill: false,
}

export function createActionButton(displayName, topic, append = false, hex = "#2b00ff", similarOptions = defaultSimilarOptions) {
    let actionButton = $("<button>")
        .addClass("actionButton")
        .addClass("editableComponent")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .attr("data-color", hex)
        .attr("data-componentType", "actionButton")
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))
        .text(displayName)
        .css("background-color", hex + "3f")


    if (append) {
        actionButton.appendTo(append)
    }

    setSimilarOptions(actionButton, similarOptions)
    addButtonToAnimate(actionButton)
    addEditHandler(actionButton, "boolean")

    return actionButton
}

export function createOneShotButton(displayName, topic, append = false, hex = "#fff200", similarOptions = defaultSimilarOptions) {
    let oneShotButton = $("<button>")
        .addClass("oneShotButton")
        .addClass(topic)
        .addClass("editableComponent")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .attr("data-color", hex)
        .attr("data-componentType", "oneShotButton")
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))
        .css("background-color", hex + "3f")
        .css("border-color", hex)
        .text(displayName)

    if (append) {
        oneShotButton.appendTo(append)
    }

    setSimilarOptions(oneShotButton, similarOptions)
    addButtonToAnimate(oneShotButton)
    addEditHandler(oneShotButton, "boolean")

    return oneShotButton
}

export function createToggleButton(displayName, topic, append = false, hex = "#ff7300", value = false, similarOptions = defaultSimilarOptions, persist) {
    let toggleButton = $("<button>")
        .addClass("editableComponent")
        .addClass("toggleButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-color", hex)
        .attr("data-componentType", "toggleButton")

        .attr("data-persist", "false")
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))
        .css("border-color", hex)
        .text(displayName)

    if (JSON.parse(value)) {

        toggleButton.addClass("toggledOn").css("background-color", hex + "99").attr("data-value", "true").attr("data-initialvalue", "true")
    } else {
        toggleButton.css("background-color", hex + "00").attr("data-value", "false").attr("data-initialvalue", "false")
    }

    if (persist) {
        toggleButton.attr("data-persist", "true")
    }

    if (append) {
        toggleButton.appendTo(append)
    }

    setSimilarOptions(toggleButton, similarOptions)
    addButtonToAnimate(toggleButton)
    addEditHandler(toggleButton, "boolean", ".toggleSpecific")

    return toggleButton
}

export function createAxis(displayName, topic, append = false, vertical = false, hex = "#8a2be2", value = 0, min = -1, max = 1, step = 0.01, snapBack = true, similarOptions = defaultSimilarOptions) {
    let axis = {
        div: $('<div>').attr("data-snapBack", "false").attr("data-defaultSimilarOptions", JSON.stringify(similarOptions)).addClass("editableComponent"),
        label: $("<h1>").addClass("axisLabel").addClass("editThisName"),
        knob: $("<input>")
    }

    if (snapBack) {
        axis.div.attr("data-snapBack", "true")
    }

    axis.div[0].style.setProperty('--thumbColor', hex)
    axis.label.appendTo(axis.div)
    axis.knob.appendTo(axis.div)

    if (!vertical) {
        axis.div.addClass("axis").attr("data-componentType", "axis")
        axis.knob.addClass("axisKnob")
    } else {
        axis.div.addClass("verticalAxis").attr("data-componentType", "verticalAxis")
        axis.knob.addClass('verticalAxisKnob')
    }

    axis.div.attr("data-topic", topic)
        .attr("data-value", 0)
        .attr('data-type', "double")
        .attr('data-color', hex)

    axis.knob.attr("type", "range")
        .attr("min", min)
        .attr("max", max)
        .attr("step", step)
        .attr("value", value)

    axis.label.text(displayName)

    if (append) {
        axis.div.appendTo(append)
    }

    setSimilarOptions(axis.div, similarOptions)
    addEditHandler(axis.div, "double", ".axisSpecific")

    return axis
}

export function createNumberComponent(title, topic, append = false, hex = 0, value = 0, min = -1, max = 1, step = 0.1, persist = false, similarOptions = defaultSimilarOptions) {

    let numberComponent = {
        div: $("<div>").addClass("numberComponent").addClass("editableComponent").attr("data-type", 'double').attr("data-step", step).attr("data-min", min).attr("data-max", max).attr("data-value", value).attr("data-initialValue", value).attr("data-persist", "false").attr("data-topic", topic).attr("data-componentType", "numberComponent").attr("data-defaultSimilarOptions", JSON.stringify(similarOptions)),
    }

    if (persist) numberComponent.div.attr("data-persist", "true")

    numberComponent["title"] = $("<p>").addClass("numberTitle").addClass("editThisName").text(title).appendTo(numberComponent.div)
    numberComponent["minus"] = $("<button>").addClass("numberMinus").addClass("animatedButton").text("-").appendTo(numberComponent.div)
    numberComponent["input"] = $("<input>").addClass("numberTextInput").attr("type", "number").attr("value", value).appendTo(numberComponent.div)
    numberComponent["plus"] = $("<button>").addClass("numberPlus").addClass("animatedButton").text("+").appendTo(numberComponent.div)

    if (append) {
        numberComponent.div.appendTo(append)
    }

    setSimilarOptions(numberComponent.div, similarOptions)
    addEditHandler(numberComponent.div, "double", ".numberComponentSpecific")

    return numberComponent

    //    <button class="numberMinus animatedButton">-</button>
    //    <input class="numberTextInput" type="number" value="0"> <!-- value must match data-value -->
    //    <button class="numberPlus animatedButton">+</button>
    // </div>

}

export function createDropdown(topic, append = false, hex = 0, initialOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions, persist = false) {



    let dropdown = {
        div: $("<div>").addClass("editableComponent").attr("data-persist", "false").attr('data-index', initialOptionIndex).addClass("select").attr("data-topic", topic).attr("data-type", "string").attr("data-componentType", "select").attr("data-componentOptions", JSON.stringify(options)).attr("data-defaultSimilarOptions", JSON.stringify(similarOptions)),

    }


    if (persist) {
        dropdown.div.attr("data-persist", "true")
    }

    if (options.length !== 0) {
        dropdown.div.attr("data-value", options[initialOptionIndex].value).css("background-color", options[initialOptionIndex].color + "6b")
        dropdown["title"] = $("<h1>").appendTo(dropdown.div).addClass("selectTitle").text(options[initialOptionIndex].name)
    } else {
        dropdown["title"] = $("<h1>").appendTo(dropdown.div).addClass("selectTitle").text("Dropdown")

    }



    let $aO = []
    for (let i = 0; i < options.length; i++) {
        $aO.push($("<h1>").appendTo(dropdown.div).addClass("selectOption").text(options[i].name).attr("data-index", i).attr("data-value", options[i].value).attr("data-hex", options[i].color).css("background-color", options[i].color));
    }

    dropdown["options"] = $aO

    if (append) {
        dropdown.div.appendTo(append)
    }

    setSimilarOptions(dropdown.div, similarOptions)
    addEditHandler(dropdown.div, "string")

    return dropdown
}

export function createOptGroup(topic, append, hex = 0, initialOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions, persist = false) {


    let optDiv = $("<div>").addClass("editableComponent").attr("data-index", initialOptionIndex).addClass("buttonOptGroup").attr("data-topic", topic).attr("data-type", "string").attr("data-componentOptions", JSON.stringify(options)).attr("data-componentType", "buttonOptGroup").attr("data-defaultSimilarOptions", JSON.stringify(similarOptions)).attr("data-persist", "false")

    if (persist) {
        optDiv.attr("data-persist", "true")
    }

    console.log(options)

    let optGroup = {
        div: optDiv,
    }

    let $aO = []

    for (let i = 0; i < options.length; i++) {
        let color =
        {
            border: "hsla(" + (i * (360 / options.length)) + ", 100%, 50%, 1)",
            background: "hsla(" + (i * (360 / options.length)) + ", 100%, 50%, 0)"
        }

        if (options[i].color) {
            color = {
                border: options[i].color,
                background: options[i].color + "00",
                backgroundOn: options[i].color + "99"
            }
        }

        let newButton = $("<button>").addClass("animatedButton").addClass("optGroupButton").attr("data-value", options[i].value).attr("data-index", i).text(options[i].name).appendTo(optDiv).css("border-color", color.border).css("background-color", color.background)

        if (i == initialOptionIndex) {
            newButton.addClass("toggledOn").css("background-color", color.backgroundOn)
        }
        $aO.push(newButton)
    }

    optGroup["options"] = $aO

    if (append) {
        optGroup.div.appendTo(append)
    }
    setSimilarOptions(optGroup.div, similarOptions)
    addEditHandler(optDiv, "string")

    return optGroup

}


////////////////////////////////////////////////
////////////////Output Components///////////////
////////////////////////////////////////////////


export function createBasicSubscription(displayName, topic, append = false, hex = false, similarOptions = defaultSimilarOptions) {

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]
    }

    let basicSubscription = $("<div>")
        .addClass("editableComponent")
        .addClass("basicSubscription")
        .attr("data-topic", topic)
        .attr("data-color", "#9d00ff")
        .attr("data-componentType", "basicSubscription")
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

    if (hex) {
        basicSubscription.css("background-color", hex + "42").attr("data-color", hex)

    }
    $("<h1>").addClass("bSTopic").addClass("editThisName").text(displayName).appendTo(basicSubscription)
    $("<h1>").addClass("bsColon").text(":").appendTo(basicSubscription)
    let topicReference = $("<h1>").addClass("bSValue").text("null").appendTo(basicSubscription)

    if (append) {
        basicSubscription.appendTo(append)
    }

    setSimilarOptions(basicSubscription, similarOptions)
    addEditHandler(basicSubscription, "subscription")

    if (topic == "esc-UNSET-esc") return basicSubscription



    let basicSubscriptionHandler = (value) => {
        if (typeof value === 'number') {

            addToRender(topicReference[0], { "updating": "text", "newValue": value.toFixed(3).replace(".000", "") })

        } else {

            addToRender(topicReference[0], { "updating": "text", "newValue": value })
        }
    }


    let subscribedReference = {
        'jQueryReference': topicReference,
        'parentReference': basicSubscription,
        'valueHandeler': basicSubscriptionHandler,
    }

    if (topic.includes("|")) {
        if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
            subscribedTopics[topic.split("|")[0]] = []
        }
        subscribedReference.structPath = topic
        subscribedTopics[topic.split("|")[0]].push(subscribedReference)
        basicSubscription.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

    } else {
        if (!subscribedTopics.hasOwnProperty(topic)) {
            subscribedTopics[topic] = []
        }
        subscribedTopics[topic].push(subscribedReference)
        basicSubscription.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    }

    // console.log(topic, nt4Client.serverTopics.get(topic.split("|")[0]))
    if (nt4Client.serverTopics.get(topic)) {
        basicSubscriptionHandler(nt4Client.serverTopics.get(topic).value)
    } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
        let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
        basicSubscriptionHandler(getStructValue(topic, topicRef.value))
    }

    // console.log(topic)

    return basicSubscription

}

export function createBasicLogger(displayName, topic, append = false, hex = "#0c0c0c", similarOptions = defaultSimilarOptions) {


    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]

    }

    let basicLogger = $("<div>")
        .addClass("editableComponent")
        .addClass("basicLogger")
        .attr("data-topic", topic)
        .attr("data-componentType", "basicLogger")
        .css("border-color", hex)
        .attr("data-color", hex)
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

    $("<h1>").addClass("basicLoggerTitle").addClass("editThisName").text(displayName).appendTo(basicLogger)

    let loggerValues = $("<div>").addClass("basicLoggerValues").appendTo(basicLogger)

    let pauser = $("<h1>").addClass("basicLoggerPauser").text("⏸").appendTo(basicLogger).on("pointerdown", (event) => {
        let $ct = $(event.currentTarget);

        basicLogger.offset()

        $ct.toggleClass("paused")
        $ct.parent().children(".showAll").toggleClass("showAllOpen")
        $ct.text("⏸").css("font-size", "3.5cqh")
        if ($ct.hasClass("paused")) {
            $ct.text("▶").css("font-size", "2.5cqh")
            return
        }
        $(loggerValues).empty()

        let storedValues = subscribedTopics[basicLogger.attr("data-topic")][parseInt(basicLogger.attr("data-subscriptionIndex"))].storedValues
        let storedAmount = 100

        if (storedValues.length < 100) {
            storedAmount = storedValues.length
        }

        for (let i = storedAmount; i > 0; i--) {

            let currentValue = storedValues[storedValues.length - i].split("esc-timestampmarker-esc")

            let basicallyLogged = document.createElement("div")
            basicallyLogged.classList.add("basicallyLogged")
            loggerValues[0].appendChild(basicallyLogged)

            let valuer = document.createElement("h1")
            valuer.textContent = currentValue[0]
            basicallyLogged.appendChild(valuer)

            let timestamper = document.createElement("h1")
            timestamper.classList.add("basicLoggerTimestamp")
            timestamper.textContent = currentValue[1]
            basicallyLogged.appendChild(timestamper)
        }

    })

    $("<h1>").addClass("showAll").text("⏿").appendTo(basicLogger).on("pointerdown", () => {
        let storedValues = subscribedTopics[basicLogger.attr("data-topic")][parseInt(basicLogger.attr("data-subscriptionIndex"))].storedValues

        console.log(basicLogger.attr("data-topic"))

        $(loggerValues).empty()

        for (let i = 0; i < storedValues.length; i++) {
            let currentValue = storedValues[i].split("esc-timestampmarker-esc")

            let basicallyLogged = document.createElement("div")
            basicallyLogged.classList.add("basicallyLogged")
            loggerValues[0].appendChild(basicallyLogged)

            let valuer = document.createElement("h1")
            valuer.textContent = currentValue[0]
            basicallyLogged.appendChild(valuer)


            let timestamper = document.createElement("h1")
            timestamper.classList.add("basicLoggerTimestamp")
            timestamper.textContent = currentValue[1]
            basicallyLogged.appendChild(timestamper)
        }
    })

    if (append) {
        basicLogger.appendTo(append)
    }

    setSimilarOptions(basicLogger, similarOptions)
    addEditHandler(basicLogger, "subscription")

    if (topic == "esc-UNSET-esc") return basicLogger

    let basicLoggerHandler = (value, timestamp) => {
        // console.log(value, "basicSubscriptionHandler")
        // let basicallyLogged = $("<div>").addClass("basicallyLogged").appendTo(loggerValues)
        // $("<h1>").text(value).appendTo(basicallyLogged)
        // $("<h1>").text(timestamp).addClass("basicLoggerTimestamp").appendTo(basicallyLogged)

        // loggerValues.scrollTop(loggerValues[0].scrollHeight)

        //well try native instead of jquery for preformance
        let $topic = basicLogger.attr("data-topic")

        if (subscribedTopics[$topic]) {
            if (subscribedTopics[$topic][parseInt(basicLogger.attr("data-subscriptionIndex"))]) {
                subscribedTopics[$topic][parseInt(basicLogger.attr("data-subscriptionIndex"))].storedValues.push(value + "esc-timestampmarker-esc" + timestamp)

            }
        }

        if (pauser.hasClass("paused")) return

        let foundChildren = loggerValues.children()

        if (foundChildren.length > 100) {
            foundChildren[0].remove()
        }



        let basicallyLogged = document.createElement("div")
        basicallyLogged.classList.add("basicallyLogged")
        loggerValues[0].appendChild(basicallyLogged)

        let valuer = document.createElement("h1")
        valuer.textContent = value
        basicallyLogged.appendChild(valuer)


        let timestamper = document.createElement("h1")
        timestamper.classList.add("basicLoggerTimestamp")
        timestamper.textContent = timestamp
        basicallyLogged.appendChild(timestamper)

        loggerValues.scrollTop(loggerValues[0].scrollHeight)

    }

    let topicChangeHandler = (newTopic, val) => {
        $(loggerValues).empty()

        subscribedTopics[newTopic][parseInt(basicLogger.attr("data-subscriptionIndex"))]["storedValues"] = [val + "esc-timestampmarker-esc "]

    }


    let subscribedReference = {
        'jQueryReference': false,
        'parentReference': basicLogger,
        'storedValues': [],
        'valueHandeler': basicLoggerHandler,
        'topicChangeHandler': topicChangeHandler
    }

    if (topic.includes("|")) {
        if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
            subscribedTopics[topic.split("|")[0]] = []
        }
        subscribedReference.structPath = topic
        subscribedTopics[topic.split("|")[0]].push(subscribedReference)
        basicLogger.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

    } else {
        if (!subscribedTopics.hasOwnProperty(topic)) {
            subscribedTopics[topic] = []
        }
        subscribedTopics[topic].push(subscribedReference)
        basicLogger.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    }

    // console.log(topic, nt4Client.serverTopics.get(topic.split("|")[0]))
    if (nt4Client.serverTopics.get(topic)) {
        basicLoggerHandler(nt4Client.serverTopics.get(topic).value)
    } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
        let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
        basicLoggerHandler(getStructValue(topic, topicRef.value))
    }

    // console.log(topic)

    return basicLogger
}

export function createNumberLine(displayName, topic, append = false, hex = "#0c0c0c", maxNumber, minNumber, low, high, optimum, similarOptions = defaultSimilarOptions) {


    let numberLine = $("<div>").addClass("numberLine")
        .attr("data-topic", topic)
        .addClass("editableComponent")
        .attr("data-componentType", "numberLine")
        .css("border-color", hex)
        .attr("data-color", hex)
        .attr("data-deriveAttributes", 'true')
        .attr("data-deriveAttributesMin", 'true')
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

    if (append) {
        numberLine.appendTo(append)
    }

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]

    }

    $("<h1>").text(displayName).addClass('numberLineTitle').addClass("editThisName").appendTo(numberLine)

    let numberLineMeterHolder = $("<div>").addClass("numberLineMeters").appendTo(numberLine)

    function createNewMeter() {
        let newMeter = $("<div>").addClass("meterHolder").appendTo(numberLineMeterHolder)

        $("<div>").addClass("numberLineNoValue").appendTo(newMeter)
        $("<meter>").addClass("numberLineHasValue").appendTo(newMeter).attr("max", "0").attr("min", "0")

        if (maxNumber) {
            newMeter.attr("data-maxNumber", maxNumber)
        }
        if (minNumber) {
            newMeter.attr("data-minNumber", minNumber)
        }
        if (low) {
            newMeter.attr("data-low", low)
        }
        if (high) {
            newMeter.attr("data-high", high)
        }
        if (optimum) {
            newMeter.attr("data-optimum", optimum)
        }

        return newMeter
    }




    setSimilarOptions(numberLine, similarOptions)
    addEditHandler(numberLine, "subscription", ".numberLineSpecific")

    if (topic == "esc-UNSET-esc") return numberLine

    let numberLineHandler = (value) => {
        if (Array.isArray(value)) {

        } else {
            let meters = numberLineMeterHolder.children().eq(0).children('.numberLineHasValue')

            if (meters.length == 0) {
                meters = createNewMeter()
            }

            //Supports arrays
            for (let i = 0; i < meters.length; i++) {
                let meter = meters.eq(i)

                if (numberLine.attr("data-deriveAttributes") == "true") {
                    if (Math.round(value) > parseFloat(meter.attr("max"))) {
                        addToRender(meter[0], {"updating": "attribute", "attrName": "max", "newValue": Math.round(value)})
                        
                        let meterTopTextChAvgLength = (("0" + Math.round(value / 4) + "" + Math.round(value / 2) + "" + Math.round(value * 0.75) + "" + Math.round(parseFloat(value))).length) / 5

                        addToRender(meter[0], {"updating": "attribute", "attrName": "data-avgch", "newValue":  meterTopTextChAvgLength})
                    }
                }
                if (numberLine.attr("data-deriveAttributesMin") == "true") {
                    if (Math.round(value) < parseFloat(meter.attr("min"))) {
                        addToRender(meter[0], {"updating": "attribute", "attrName": "min", "newValue": Math.round(value)})

                        let meterTopTextChAvgLength = (("0" + Math.round(value / 4) + "" + Math.round(value / 2) + "" + Math.round(value * 0.75) + "" + Math.round(parseFloat(value))).length) / 5

                        addToRender(meter[0], {"updating": "attribute", "attrName": "data-avgch", "newValue":  meterTopTextChAvgLength})
                    }
                }

                addToRender(meter[0], {"updating": "attribute", "attrName": "value", "newValue":  value})

            }
        }
    }

    let topicChangeHandler = () => {
        numberLineMeterHolder.empty()
    }

    let subscribedReference = {
        'jQueryReference': false,
        'parentReference': numberLine,
        'valueHandeler': numberLineHandler,
        'topicChangeHandler': topicChangeHandler
    }

    if (topic.includes("|")) {
        if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
            subscribedTopics[topic.split("|")[0]] = []
        }
        subscribedReference.structPath = topic
        subscribedTopics[topic.split("|")[0]].push(subscribedReference)
        numberLine.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

    } else {
        if (!subscribedTopics.hasOwnProperty(topic)) {
            subscribedTopics[topic] = []
        }
        subscribedTopics[topic].push(subscribedReference)
        numberLine.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    }

    // console.log(topic, nt4Client.serverTopics.get(topic.split("|")[0]))
    if (nt4Client.serverTopics.get(topic)) {
        numberLineHandler(nt4Client.serverTopics.get(topic).value)
    } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
        let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
        numberLineHandler(getStructValue(topic, topicRef.value))
    }


    return numberLine
}

export function createRadialGauge(displayName, topic, append, hex = "#0c0c0c", maxDeg = 360, subTickCount = 5, maxNumber, minNumber = 0, low, high, optimum, degOffset = 0, similarOptions = defaultSimilarOptions,) {
    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]

    }

    let radialGauge = $("<div>").addClass("radialGauge")
        .attr("data-topic", topic)
        .addClass("editableComponent")
        .attr("data-componentType", "radialGauge")
        .css("border-color", hex)
        .attr("data-color", hex)
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))


    if (append) {
        radialGauge.appendTo(append)
    }

    $("<h1>").addClass("radialGaugeTitle").addClass("editThisName").text(displayName).appendTo(radialGauge)

    let gauge = $("<div>").addClass("gauge").attr("data-maxDeg", maxDeg).attr("data-offsetDeg", degOffset).appendTo(radialGauge)
    let min
    let whichMax
    if (maxNumber) {
        whichMax = maxNumber
        gauge.attr("data-maxNumber", maxNumber)
    } else {
        whichMax = maxDeg
    }
    if (minNumber) {
        min = minNumber
        gauge.attr("data-minNumber", minNumber)
    } else {
        min = 0;
        gauge.attr("data-minNumber", 0)

    }
    if (low) {
        gauge.attr("data-low", low)
    }
    if (high) {
        gauge.attr("data-high", high)
    }
    if (optimum) {
        gauge.attr("data-optimum", optimum)
    }


    let pointer = $("<div>").addClass("pointer").appendTo(gauge)

    let subTicks = $("<div>").addClass("subTicks").appendTo(pointer)


    let step = (whichMax - min) / (subTickCount - 1)

    for (let i = 0; i < subTickCount; i++) {
        let text = parseFloat(((step * i) + parseFloat(min)).toFixed(3));
        console.log(minNumber)

        $("<div>").addClass("subTick").appendTo(subTicks).attr("data-text", text)
    }

    setSimilarOptions(radialGauge, similarOptions)
    addEditHandler(radialGauge, "subscription", ".radialGaugeSpecific")

    if (topic == "esc-UNSET-esc") return radialGauge

    let gaugeHandler = (value) => {
        

   
        // gauge[0].style.setProperty("--gaugeColor", )
        addToRender(gauge[0],  {"updating": "rawProperty", "propName": "--gaugeColor", "newValue": emulateMeterColors(gauge.attr("data-minNumber"), gauge.attr("data-maxNumber"), gauge.attr("data-low"), gauge.attr("data-high"), gauge.attr("data-optimum"), value)})

        if (gauge.attr("data-maxNumber")) {
            addToRender(gauge[0], {"updating": "removeAttribute", "attrName": "data-valDeg"})

            let min = parseFloat(gauge.attr("data-minNumber"))
            let range = parseFloat(gauge.attr("data-maxNumber")) - min

            value = ((value - min) % range) + min

            addToRender(gauge[0], {"updating": "attribute", "attrName": "data-valNumber", "newValue":  value})        

            return
        }
        addToRender(gauge[0], {"updating": "attribute", "attrName": "data-valDeg", "newValue":  value})        
    }

    let subscribedReference = {
        'jQueryReference': false,
        'parentReference': radialGauge,
        'valueHandeler': gaugeHandler,
    }

    if (topic.includes("|")) {
        if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
            subscribedTopics[topic.split("|")[0]] = []
        }
        subscribedReference.structPath = topic
        subscribedTopics[topic.split("|")[0]].push(subscribedReference)
        radialGauge.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

    } else {
        if (!subscribedTopics.hasOwnProperty(topic)) {
            subscribedTopics[topic] = []
        }
        subscribedTopics[topic].push(subscribedReference)
        radialGauge.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    }

    // console.log(topic, nt4Client.serverTopics.get(topic.split("|")[0]))
    if (nt4Client.serverTopics.get(topic)) {
        gaugeHandler(nt4Client.serverTopics.get(topic).value)
    } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
        let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
        gaugeHandler(getStructValue(topic, topicRef.value))
    }


    return radialGauge
}

export function createCamera(displayName, topic, append, hideNav = false, videoFormat = "WebM", recordConditions = [], similarOptions = defaultSimilarOptions) {
    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]

    }

    let camera = $("<div>")
        .addClass("cameraComponent")
        .attr("data-topic", topic)
        .addClass("editableComponent")
        .attr("data-componentType", "camera")
        .attr("data-videoFormat", videoFormat)
        .attr("data-hideNav", JSON.stringify(hideNav))
        .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))
        .attr("data-recordConditions", JSON.stringify(recordConditions))

    $("<h1>").addClass("editThisName").text(displayName).appendTo(camera)
    let img = $("<img>").addClass("cameraStream").attr("crossOrigin", "anonymous").addClass("cameraPlaceholder").appendTo(camera)
    $("<canvas>").addClass("encoder").appendTo(camera)
    let cameraNav = $("<div>").addClass("cameraNav").appendTo(camera);
    $("<button>").addClass("record").text("🔴").appendTo(cameraNav)


    if (append) {
        camera.appendTo(append)
    }

    setSimilarOptions(camera, similarOptions)
    addEditHandler(camera, "subscription", ".cameraSpecific", ".hidestream")

    if (topic == "esc-UNSET-esc") return camera

    let setCaptureState = captureMJPEG(camera, topic, videoFormat)

    let cameraHandler = (value) => {
        let i = 0;

        // console.log(value[0])
        setSrc()

        function setSrc() {
            console.log(value[i])

            if (i > value.length - 1) {
                let str = value[i - 1].replace("mjpg:", "")
                console.log(str)
                console.log(str.substring(str.lastIndexOf(":") + 1))
                img.attr("src", "localhost:" + str.substring(str.lastIndexOf(":") + 1))
                return
            }

            //try each url in stream list 

            img.attr("src", value[i].replace("mjpg:", "")).off("error").on("error", () => {
                i++
                if (i > value.length) {
                    return
                }
                toastMessage("Camera Connection Failed, Retrying Attempt: " + i, "#FF0000")
                setSrc()
            })
        }

    }

    let disableDownloadCooldown = setTimeout(() => { }, 0);

    let recordConditionHandler = (value) => {
        let robotState = decodeFMSControlData(value)
        let conditions = JSON.parse(camera.attr("data-recordConditions"))
        console.log(conditions)

        for (let i in conditions) {
            if (objectIncludes(robotState, conditions[i])) {
                try {
                    clearTimeout(disableDownloadCooldown)
                } catch {

                }

                setCaptureState(true)
                return
            }

        }
        disableDownloadCooldown = setTimeout(() => {
            setCaptureState(false)
        }, 8000);
    }

    // let topicChangeHandler = (newTopic, val) => {

    // }

    let subscribedReference = {
        'jQueryReference': false,
        'parentReference': camera,
        'valueHandeler': cameraHandler,
        // 'topicChangeHandler': topicChangeHandler
    }

    let fmsReference = {
        'jQueryReference': false,
        'parentReference': camera,
        'valueHandeler': recordConditionHandler,
        // 'topicChangeHandler': topicChangeHandler
    }

    if (topic.includes("|")) {
        if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
            subscribedTopics[topic.split("|")[0]] = []
        }
        subscribedReference.structPath = topic
        subscribedTopics[topic.split("|")[0]].push(subscribedReference)
        camera.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

    } else {
        if (!subscribedTopics.hasOwnProperty(topic)) {
            subscribedTopics[topic] = []
        }
        subscribedTopics[topic].push(subscribedReference)
        camera.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    }

    if (!subscribedTopics.hasOwnProperty("/FMSInfo/FMSControlData")) {
        subscribedTopics["/FMSInfo/FMSControlData"] = []
    }
    subscribedTopics["/FMSInfo/FMSControlData"].push(fmsReference)

    if (nt4Client.serverTopics.get("/FMSInfo/FMSControlData")) {
        recordConditionHandler(nt4Client.serverTopics.get("/FMSInfo/FMSControlData").value)
    }

    if (nt4Client.serverTopics.get(topic)) {
        cameraHandler(nt4Client.serverTopics.get(topic).value)
    } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
        let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
        cameraHandler(getStructValue(topic, topicRef.value))
    }

    return camera

}

export function createGraph(displayName, topics, append, similarOptions = defaultSimilarOptions){

    if (displayName == null) {
        let topicSplit = topics[0].split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }

        displayName = displayName.split(":")[0]
    }

    let graph = $("<div>").addClass("graph").attr("data-linkAxis", "false").attr("data-componentType", "graph").attr("draggable", "false")

    if(append){
        graph.appendTo(append)
    }

    let leftButtons = $("<div>").addClass("leftButtons").appendTo(graph);
    $("<div>").addClass("linkButton").text("🔗").appendTo(leftButtons)

    $("<h1>").addClass("editThisName").addClass("graphTitle").text(displayName).appendTo(graph)

    $("<div>").addClass("rightButtons").appendTo(graph);
    
    let leftSuperSlider = $("<div>").addClass("leftSuperSlider").addClass("verticalSuperSlider").attr("data-max", "false").attr("data-absMax", "3").attr("data-absMin", "-3").appendTo(graph)

    createSliderParts("mid", leftSuperSlider)
    createSliderParts("bottom", leftSuperSlider)
    createSliderParts("top", leftSuperSlider)

    let leftTicks = $("<div>").addClass("leftTicks").attr("data-max", "false").attr("data-min", "false").attr("data-absMax", "3").attr("data-absMin", "-3").appendTo(graph)
    createTicks(11, "Left", leftTicks)

    let rightSuperSlider = $("<div>").addClass("rightSuperSlider").addClass("verticalSuperSlider").attr("data-max", "false").attr("data-absMax", "1").attr("data-absMin", "-1").appendTo(graph)

    createSliderParts("mid", rightSuperSlider)
    createSliderParts("bottom", rightSuperSlider)
    createSliderParts("top", rightSuperSlider)

    let rightTicks = $("<div>").addClass("rightTicks").attr("data-max", "false").attr("data-min", "false").attr("data-absMax", "1").attr("data-absMin", "-1").appendTo(graph)
    createTicks(11, "Right", rightTicks)

    let bottomSuperSlider = $("<div>").addClass("bottomSuperSlider").attr("data-absMin", (nt4Client.getServerTime_us() / 1000000.0)-10).attr("data-absMax", (nt4Client.getServerTime_us() / 1000000.0)).appendTo(graph)

    createSliderParts("mid", bottomSuperSlider)
    createSliderParts("bottom", bottomSuperSlider)
    createSliderParts("top", bottomSuperSlider)

    let bottomTicks = $("<div>").addClass("bottomTicks").attr("data-max", "false").attr("data-absMax", (nt4Client.getServerTime_us() / 1000000.0) -10).attr("data-absMin", (nt4Client.getServerTime_us() / 1000000.0) ).appendTo(graph)

    createTicks(11, "Bottom", bottomTicks)

    let bottomDrawer = $("<div>").addClass("bottomDrawer").appendTo(graph);

    let audio = $("<audio>").attr("id", "audio").appendTo(graph)

    let graphHolder = $("<div>").addClass("graphHolder").appendTo(graph);

    let secondaryCanvas = $("<canvas>").addClass("graphCanvas").addClass("graphCanvasSecondary").attr("draggable", "false").appendTo(graphHolder)

    let primaryCanvas = $("<canvas>").addClass("graphCanvas").addClass("graphCanvasPrimary").attr("id", "testMain").appendTo(graphHolder)

    let graphEffector = $("<div>").addClass("graphEffectorOverlay").attr("draggable", "false").appendTo(graphHolder)

    setCanvasWidths(secondaryCanvas)
    setCanvasWidths(primaryCanvas)

    if(topics[0] !== "esc-UNDEFINED-esc" && topics[0] !== "esc-UNSET-esc"  ){
        console.log(topics[0])
        initGraph(graph)
    }

    function setCanvasWidths(canvas){
        canvas.attr("width", canvas.width()).attr("height", canvas.height())
    }

    function createTicks(amount, side, append){
        for(let i = 0; i < amount; i++){
            $("<div>").addClass("graph" + side + "Tick").text(i).appendTo(append)
        }
    }

    function createSliderParts(part, append){
        let newPart = $("<div>").addClass(part + "Slider").addClass("superSliderPart").appendTo(append)

        $("<div>").addClass("sliderThumb").appendTo(newPart)

        return newPart
    }

    setSimilarOptions(graph, similarOptions)
    addEditHandler(graph, "double")

    return graph
}

//Subscription Blank

// export function createBlank(displayName, topic, append, hex, ...similarOptions = defaultSimilarOptions) {
    // if (displayName == null) {
    //     let topicSplit = topic.split("/")
    //     displayName = topicSplit[topicSplit.length - 1]

    //     if (displayName == "value" && topicSplit.length > 1) {
    //         displayName = topicSplit[topicSplit.length - 2]
    //     }

    //     displayName = displayName.split(":")[0]
    // }

//     let blank = $("<div>")
//         .addClass("blankComponent")
//         .attr("data-topic", topic)
//         .addClass("editableComponent")
//         .attr("data-componentType", "blank")
//         .css("border-color", hex)
//         .attr("data-color", hex)
//         .attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

//     if (append) {
//         blank.appendTo(append)
//     }

//     setSimilarOptions(blank, similarOptions)
//     addEditHandler(blank, "subscription", ".blankSpecific")

//     if (topic == "esc-UNSET-esc") return blank

//     let blankHandler = (value) => {

//     }

//     let topicChangeHandler = (newTopic, val) => {

//     }

//     let subscribedReference = {
//         'jQueryReference': false,
//         'parentReference': blank,
//         'valueHandeler': blankHandler,
//         'topicChangeHandler': topicChangeHandler
//     }

//     if (topic.includes("|")) {
//         if (!subscribedTopics.hasOwnProperty(topic.split("|")[0])) {
//             subscribedTopics[topic.split("|")[0]] = []
//         }
//         subscribedReference.structPath = topic
//         subscribedTopics[topic.split("|")[0]].push(subscribedReference)
//         blank.attr("data-subscriptionIndex", subscribedTopics[topic.split("|")[0]].length - 1)

//     } else {
//         if (!subscribedTopics.hasOwnProperty(topic)) {
//             subscribedTopics[topic] = []
//         }
//         subscribedTopics[topic].push(subscribedReference)
//         blank.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

//     }

//     if (nt4Client.serverTopics.get(topic)) {
//         blankHandler(nt4Client.serverTopics.get(topic).value)
//     } else if (nt4Client.serverTopics.get(topic.split("|")[0])) {
//         let topicRef = nt4Client.serverTopics.get(topic.split("|")[0]);
//         blankHandler(getStructValue(topic, topicRef.value))
//     }

//     return blank

// }
// <div class="cameraComponent">
//  <h1>Camera Stream</h1>
//  <img src="http://192.168.0.48:1181/stream.mjpg" crossOrigin="anonymous" class="cameraStream">
//  <canvas class="encoder"></canvas>
//  <div class="cameraNav">
//      <button class="record emojiButton">🔴</button>
//  </div>
// </div> 


function captureMJPEG(cameraComponent, topic = "", videoFormat = "mp4") {
    videoFormat = videoFormat.toLowerCase();

    //VERY HACKY WAY OF RECORDING MJPEG STREAM
    //Media recorder can only record mp4 and webm streams
    //So we have to draw the current frame to a canvas
    //and record the canvas (its dumb i know)

    let mJpegStream = cameraComponent.children(".cameraStream")
    let encoder = cameraComponent.find(".encoder")
    let ctx = encoder[0].getContext("2d")

    let recordToggle = cameraComponent.find(".record")
    let cameraReflect = true
    let mediaRecorder
    let recordedBlob = []
    // let animationFrame

    mJpegStream.on("load", () => {
        encoder.attr("height", mJpegStream[0].naturalHeight).attr("width", mJpegStream[0].naturalWidth)
        mJpegStream.removeClass("cameraPlaceholder")

        let currentStream = encoder[0].captureStream(30); //TODO: unhardcode this

        let mType = ""
        let codec = ""

        if (videoFormat == "mp4") {
            if (MediaRecorder.isTypeSupported("video/mp4;codecs=hvc1")) {
                codec = "hvc1"
                mType = "video/mp4"
                console.log("Codec selected: " + "hvc1")
            } else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
                codec = "avc1"
                mType = "video/mp4"
                console.log("Codec selected: " + "avc1")
            } else {
                mType = "video/mp4"
                console.log("Codec fallback: Default")
            }
        } else if (videoFormat == "webm") {
            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                codec = "vp9"
                mType = "video/webm"
                console.log("Codec selected: " + "vp9")

            } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                codec = "vp8"
                mType = "video/webm"
                console.log("Codec selected: " + "vp8")

            } else {
                mType = "video/webm"
                console.log("Codec fallback: Default")
            }
        }
        console.log(videoFormat)

        let fullMimeType
        if (codec == "") {
            fullMimeType = `${mType}`;
        } else {
            fullMimeType = `${mType};codecs=${codec}`;
        }
        mediaRecorder = new MediaRecorder(currentStream, { mimeType: fullMimeType });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedBlob.push(event.data);
            }
        }

        mediaRecorder.onstop = () => {
            let blob = new Blob(recordedBlob, {
                type: mType
            })

            let downloadUrl = URL.createObjectURL(blob)

            // let filename = cameraComponent.attr("data-usTimestamp") + "" + cameraComponent.attr("data-streamTopic")

            let $a = $("<a>").css("display", "none").attr("href", downloadUrl)
            $a[0].download = connectionDate + "=" + topic.replaceAll("/", "+") + "." + videoFormat
            $("body").append($a)

            $a[0].click();

            recordedBlob = [];
            // cancelAnimationFrame(animationFrame);
        }
        if (cameraReflect) {
            ctx.translate(encoder[0].width, 0);
            ctx.scale(-1, 1);
        }
        drawToCanvas()

    })

    mJpegStream.on('error', () => {
        //TODO: put error message in component
    })

    function drawToCanvas() {
        ctx.drawImage(mJpegStream[0], 0, 0, encoder[0].width, encoder[0].height)
        requestAnimationFrame(drawToCanvas);
    }


    recordToggle.on("pointerdown", () => {
        recordToggle.toggleClass("recording")

        if (recordToggle.hasClass("recording")) {
            recordToggle.text("🎬")
            recordedBlob = []


            mediaRecorder.start()
        } else {
            recordToggle.text("🔴")
            mediaRecorder.stop()

        }
    })



    return (recording) => {
        if (recording) {
            recordToggle.addClass("recording")
            recordToggle.text("🎬")
            recordedBlob = []

            try {
                mediaRecorder.start()

            } catch (err) {

                if (!mJpegStream.complete) {
                    mJpegStream.on("load.bufferStart", () => {
                        mediaRecorder.start()
                        mJpegStream.off("load.bufferStart")
                        console.log("Recording Started")

                    })

                    console.log("Buffering Recording Start until load")
                }

                console.log("May Be Expected" + err)
            }
        } else {
            recordToggle.text("🔴")

            try {
                mediaRecorder.stop()
            } catch (err) {
                console.log("May Be Expected" + err)
            }

        }
    }

}

function decodeFMSControlData(state) {
    // Define the bitmask constants
    const ENABLED_FLAG = 1;
    const AUTO_FLAG = 2;
    const TEST_FLAG = 4;
    const EMERGENCY_STOP_FLAG = 8;
    const FMS_ATTACHED_FLAG = 16;
    const DS_ATTACHED_FLAG = 32;

    // Determine the operational mode
    let mode = "disabled";
    const isEnabled = (state & ENABLED_FLAG) !== 0;

    if (isEnabled) {
        if (state & AUTO_FLAG) {
            mode = "auto";
        } else if (state & TEST_FLAG) {
            mode = "test";
        } else {
            mode = "teleop";
        }
    }

    return {
        mode: mode,
        enabled: isEnabled, // True if mode is teleop, auto, or test
        fmsAttached: (state & FMS_ATTACHED_FLAG) !== 0,
        dsAttached: (state & DS_ATTACHED_FLAG) !== 0,
        eStopped: (state & EMERGENCY_STOP_FLAG) !== 0
    }
}

export function setSimilarOptions(element, similarOptions = JSON.parse($(element).attr("data-defaultSimilarOptions"))) {
    if (typeof similarOptions == "string") {
        JSON.parse(similarOptions)
    }

    if (similarOptions.fill) {
        element.addClass("fill")
        $(".fillSpaceCheckbox")[0].checked = true
    } else {
        element.removeClass("fill")
        $(".fillSpaceCheckbox")[0].checked = false

    }

    element.attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

    changeSimilarInputs(similarOptions)
}

export function addButtonToAnimate(jQueryReference) {
    let text = jQueryReference.addClass("animatedButton").text()
    console.log(jQueryReference.text())
    jQueryReference.css("color", "white").css("font-size", "0px")

    if (typeof text === "string") {
        text = text.split(" ")
        for (let j = 0; j < text.length; j++) {
            let $word = $("<div>").appendTo(jQueryReference).css('display', 'flex').addClass("buttonWord");
            for (let I = 0; I < text[j].length; I++) {
                $("<p>").text(text[j][I]).addClass('funkyLetter').appendTo($word)
            }
        }


    }
    jQueryReference.off("pointerdown.animateButton").on("pointerdown.animateButton", (event) => {

        let $spawnedCircle
        let $ct = $(event.currentTarget)



        //spawns a circle that represnts the touch
        if (event.pageX == null) {
            $spawnedCircle = $("<div>").css("background-color", $ct.css("background-color")).appendTo("body").addClass("spawnedCircle").css("top", event.changedTouches[0].pageY + "px").css("left", event.changedTouches[0].pageX + "px")
            setTimeout(() => {
                $($spawnedCircle.remove())
            }, 3000);
            $(event.currentTarget).attr("pageX", event.changedTouches[0].pageX).attr("pageY", event.changedTouches[0].pageY)

        } else {

            $spawnedCircle = $("<div>").css("background-color", $ct.css("background-color")).appendTo("body").addClass("spawnedCircle").css("top", event.pageY + "px").css("left", event.pageX + "px")
            setTimeout(() => {
                $($spawnedCircle.remove())
            }, 3000);
            $(event.currentTarget).attr("pageX", event.pageX).attr("pageY", event.pageY)

        }
        $spawnedCircle.offset()
        $spawnedCircle.addClass("spawnedBigCircle")
        let $foundP = $(event.currentTarget).find("p")
        // let $parent = $(event.currentTarget).children(".animatedButton")

        // text effects

        let hue = (0 / $foundP.length) * 360

        let effect = Math.floor(Math.random() * 6);
        for (let i = 0; i < $foundP.length; i++) {
            setTimeout(() => {
                if (effect == 0) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "streachUp")
                    // $score.css("animation-name", "streachUp")
                } else if (effect === 1) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "spinAround")
                    // $score.css("animation-name", "spinAround")
                } else if (effect === 2) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "rollAround")
                    // $score.css("animation-name", "rollAround")

                } else if (effect === 3) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "flipAround")
                    // $score.css("animation-name", "flipAround")

                } else if (effect === 4) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "jumpUp")
                    // $score.css("animation-name", "jumpUp")

                } else if (effect === 5) {
                    $foundP.eq(i).css("color", "hsl(" + hue + ", 100%, 50%").css("animation-name", "squash")
                    // $score.css("animation-name", "squash") 
                }

                hue = ((i + 1) / $foundP.length) * 360
                setTimeout(() => {
                    $foundP.eq(i).css("color", "white").css("animation-name", "")
                }, 200 + 50 * $foundP.length);

            }, 50 * i);


        }
    })
}

function emulateMeterColors(min = 0, max = 360, low = "", high = "", optimum = "", val) {
    let green = "#0E7C10"
    let yellow = "#FEB902"
    let red = "#D83B01"


    if (isNaN(parseFloat(min))) {
        min = 0
    }

    min = parseFloat(min)
    max = parseFloat(max)

    let range = (max - min)

    if (low != "") {
        low = parseFloat(low)
    }
    if (high != "") {
        high = parseFloat(high)
    }
    if (optimum != "") {
        optimum = parseFloat(optimum)
    } else {
        optimum = max / 2
    }


    val = parseFloat(((val - min) / range) * 100)

    let division1 = { percent: 0, color: green };
    let division2 = { percent: 0, color: green };;
    let division3 = { percent: 0, color: green };

    if (low && high == "") {
        division3.percent = 101

        division1.percent = ((low - min) / range) * 100
        division2.percent = 100

        if (optimum < low) {
            division2.color = yellow
        } else {
            division1.color = yellow
        }

        return getColor()
    }
    if (low == "" && high) {
        division3.percent = 101;

        division1.percent = ((high - min) / range) * 100
        division2.percent = 100

        if (optimum < high) {
            division2.color = yellow
        } else {
            division1.color = yellow
        }

    }
    if (low && high) {
        if (high < low) {
            division3.percent = 101;

            division1.percent = ((low - min) / range) * 100
            division2.percent = 100


            if (optimum < low) {
                division2.color = red
            } else {
                division1.color = red

            }

            return getColor()
        }

        division1.percent = ((low - min) / range) * 100
        division2.percent = (((high - low)) / range) * 100 + division1.percent
        division3.percent = 100


        if (optimum < low) {
            division2.color = yellow
            division3.color = red
            return getColor()
        }
        if (optimum < high) {
            division1.color = yellow
            division3.color = yellow
            return getColor()
        }
        division1.color = red
        division2.color = yellow

        return getColor()
    } else {
        return green
    }

    function getColor() {
        if (val <= division1.percent) {
            return division1.color
        } else if (val <= division2.percent) {
            return division2.color
        } else {
            return division3.color
        }
    }

}

export function createDefaultOf(component, append, topic = "esc-UNSET-esc") {
    console.log(component, append, topic)

    switch (component) {
        case "actionButton":
            return createActionButton("Action Button", topic, append)
        case "oneShotButton":
            return createOneShotButton("One Shot Button", topic, append)
        case "toggleButton":
            return createToggleButton("Toggle Button", topic, append)
        case "axis":
            return createAxis("Axis", topic, append, false).div
        case "verticalAxis":
            return createAxis("Y-Axis", topic, append, true).div
        case "select":
            return createDropdown(topic, append, 0, 0, [{ name: "Dropdown", value: "" }]).div
        case "buttonOptGroup":
            return createOptGroup(topic, append, 0, 0, []).div
        case "numberComponent":
            return createNumberComponent("Number", topic, append).div
        case "basicSubscription":
            return createBasicSubscription(undefined, topic, append)
        case "basicLogger":
            return createBasicLogger(undefined, topic, append)
        case "numberLine":
            return createNumberLine(undefined, topic, append)
        case "radialGauge":
            return createRadialGauge(undefined, topic, append)
        case "camera":
            return createCamera(undefined, topic, append)
        case "graph":
            return createGraph(undefined, [topic], append )
    }
}

