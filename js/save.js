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

import * as components from "./editor/components/components.js"
import {tabGrid, setGridInput} from "./editor/grid.js"
import {createSideTab} from "./ui.js"
import { bindEditorResetter } from "./editor/editorUi.js"

//Save
export function saveLayoutToJSON() {
    let tabs = $(".tab")

    let json = {}

    // example layout:

    // {
    //     .uiTestTab:{
    //         tabTitle:"Ui Test",
    //         components:[
    //             {
    //                 type:
    //                 row:
    //                 col:
    //                 endrow:
    //                 endcol:
    //                 similarOptions:
    //                 parameters...
    //             }
    //         ]
    //     }
    // }

    for (let i = 0; i < tabs.length; i++) {
        let tab = $(tabs.eq(i).attr("data-page"))

        let editableComponents = tab.children(".editableComponent");

        let components = []

        for (let j = 0; j < editableComponents.length; j++) {
            let component = {}
            let comp$ = editableComponents.eq(j)
            let componentType = comp$.attr("data-componentType")



            component = {
                type: componentType,
                row: comp$.attr("data-row"),
                col: comp$.attr("data-column"),
                endrow: comp$.attr("data-endrow"),
                endcol: comp$.attr("data-endcolumn"),
                area: comp$.css("grid-area"),
                topic: comp$.attr('data-topic'),
                similarOptions: JSON.parse(comp$.attr("data-defaultsimilaroptions"))
            }

            components.push({ ...component, ...(getComponentSpecificAsObject(comp$)) })
        }

        let state = "tabVisible"

        if (tabs.eq(i).hasClass("tabMinimized")) {
            state = "tabMinimized"
        } else if (tabs.eq(i).hasClass("tabHidden")) {
            state = "tabHidden"
        }

        json[tabs.eq(i).attr("data-page")] = {
            tabTitle: tabs.eq(i).text(),
            tabRows: tab.attr("rows"),
            tabColumns: tab.attr("columns"),
            "state": state,
            "components": components,
        }
    }

    return JSON.stringify(json)
}

function makeComponentFromJson(component) {
    // type: componentType,
    // row: comp$.attr("data-row"),
    // col: comp$.attr("data-column"),
    // endrow: comp$.attr("data-endrow"),
    // endcol: comp$.attr("data-endcolumn"),
    // area: comp$.css("grid-area"),
    // topic: comp$.attr('data-topic'),
    // similarOptions: comp$.attr("data-defaultsimilaroptions")
    switch (component.type) {
        case "actionButton":
            return components.createActionButton(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "oneShotButton":
            return components.createOneShotButton(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "toggleButton":
            return components.createToggleButton(component.displayName, component.topic, false, component.color, component.value, component.similarOptions, component.persist)
        case "axis":
            return components.createAxis(component.displayName, component.topic, false, false, component.color, component.value, component.min, component.max, component.step, component.snapBack, component.similarOptions).div
        case "verticalAxis":
            return components.createAxis(component.displayName, component.topic, false, true, component.color, component.value, component.min, component.max, component.step, component.snapBack, component.similarOptions).div
        case "select":
            return components.createDropdown(component.topic, false, 0, component.index, JSON.parse(component.componentOptions), component.similarOptions, component.persist).div
        case "buttonOptGroup":
            return components.createOptGroup(component.topic, false, 0, component.index, JSON.parse(component.componentOptions), component.similarOptions, component.persist).div
        case "numberComponent":
            return components.createNumberComponent(component.displayName, component.topic, false, 0, component.value, component.min, component.max, component.step, component.persist, component.similarOptions).div
        case "basicSubscription":
            return components.createBasicSubscription(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "basicLogger":
            return components.createBasicLogger(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "numberLine":
            return components.createNumberLine(component.displayName, component.topic, false, component.color, component.max, component.min, component.low, component.high, component.optimum, component.similarOptions)
        case "radialGauge":
            return components.createRadialGauge(component.displayName, component.topic, false, component.color, component.maxDeg, 5, component.max, component.min, component.low, component.high, component.optimum, component.offsetDeg, component.similarOptions)
        case "camera":
            return components.createCamera(component.displayName, component.topic, false, JSON.parse(component.hideNav), component.videoFormat, JSON.parse(component.recordConditionHandler), component.similarOptions)
    }
}

//Load
export function loadLayoutFromJson(json) {
    if (typeof json == "string") {
        json = JSON.parse(json)
    }

    for (let tab in json) {
        let components = json[tab].components;

        let $loadedTab = $("<div>").addClass("tab")
            .css("background-color", $(".fullScreen").css("background-color"))
            .addClass("tabConnection")
            .addClass("userTab")
            .addClass("pTAB" + tab.slice(1))
            .attr("data-page", tab)
            .text(json[tab].tabTitle)
            .insertBefore(".tabCreator")
            .addClass(json[tab].state)


        createSideTab(json[tab].tabTitle, tab, json[tab].state)

        // <div class="uiTestTab page" style="display: grid;">/
        bindEditorResetter($loadedTab)

        if (tab == ".autonomus") {
            $loadedTab.addClass("autoTab")
            $loadedTab.removeClass("userTab")
            $loadedTab.removeClass("tabConnection")

            continue
        }

        if ($(tab).length <= 0) {
            let page$ = $("<div>").addClass("page").addClass(tab.slice(1)).css("display", "grid").attr("rows", json[tab].tabRows).attr("columns", json[tab].tabColumns).insertAfter(".autonomus")

            for (let i = 0; i < components.length; i++) {
                makeComponentFromJson(components[i])
                    .attr("data-row", components[i].row)
                    .attr("data-column", components[i].col)
                    .attr("data-endrow", components[i].endrow)
                    .attr("data-endcolumn", components[i].endcol)
                    .css("grid-area", components[i].area)
                    .appendTo(page$)
            }
        } else {
            $(tab).css("display", "grid").attr("rows", json[tab].tabRows).attr("columns", json[tab].tabColumns).insertAfter(".autonomus")
        }


    }
    let $ct = $(".tabNav").children(".tab").eq(0)
    let currentPage$ = $($ct.attr("data-page"))
    $(".page, .pageF").css("display", "none")
    $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
    $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
    if ($ct.attr("data-displaytype") == null) {
        $(currentPage$).css("display", "grid")
        tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)

    } else {
        $(currentPage$).css("display", $ct.attr("data-displaytype"))
    }

    setGridInput(currentPage$)
    if (Object.keys(json).length == 0) {
        $(".setGridRow").addClass("hiddenClickless")
        $(".setGridColumn").addClass("hiddenClickless")
    }

}

function getComponentSpecificAsObject(comp$) {
    let componentType = comp$.attr("data-componenttype")

    let knob

    switch (componentType) {
        case "actionButton":
        case "oneShotButton":
            return {
                displayName: comp$.clone().children().remove().end().text(),
                color: comp$.attr("data-color")
            }
        case "toggleButton":
            let returning = {
                displayName: comp$.clone().children().remove().end().text(),
                color: comp$.attr("data-color"),
                //if persist
                value: comp$.attr("data-value"),
                initialValue: comp$.attr("data-initalValue")
                //else use initial value which needa be added
            }
            let persist = "false"
            if (comp$.attr("data-persist") !== undefined) {
                persist = comp$.attr("data-persist")

                if (!JSON.parse(persist)) {
                    returning.value = comp$.attr("data-initialvalue")
                }
            }

            returning["persist"] = persist

            return returning
        case "axis":
            knob = comp$.children(".axisKnob");
            return {
                displayName: comp$.find(".editThisName").text(),
                color: comp$.attr("data-color"),
                min: knob.attr("min"),
                max: knob.attr("max"),
                step: knob.attr("step"),
                value: comp$.attr("data-value"),
                snapBack: comp$.attr("data-snapBack")
            }
            break
        case "verticalAxis":
            knob = comp$.children(".verticalAxisKnob");
            return {
                displayName: comp$.find(".editThisName").text(),
                color: comp$.attr("data-color"),
                min: knob.attr("min"),
                max: knob.attr("min"),
                step: knob.attr("min"),
                value: comp$.attr("data-value"),
                snapBack: comp$.attr("data-snapBack")
            }
        case "select":
            return {
                componentOptions: comp$.attr("data-componentoptions"),
                index: JSON.parse(comp$.attr("data-persist")) ? comp$.attr("data-index") : 0,
                persist: comp$.attr("data-persist"),
            }
        case "buttonOptGroup":

            return {
                componentOptions: comp$.attr("data-componentoptions"),
                index: JSON.parse(comp$.attr("data-persist")) ? comp$.attr("data-index") : 0,
                persist: comp$.attr("data-persist"),
            }
        case "numberComponent":
            return {
                displayName: comp$.find(".editThisName").text(),
                step: comp$.attr('data-step'),
                min: comp$.attr('data-min'),
                max: comp$.attr('data-max'),
                value: JSON.parse(comp$.attr("data-persist")) ? comp$.attr("data-value") : comp$.attr("data-initialValue"),
                persist: comp$.attr('data-persist'),

            }
        case "basicLogger":
        case "basicSubscription":
            return {
                displayName: comp$.find(".editThisName").text(),
                color: comp$.attr("data-color")
            }
        case "radialGauge":
            let gauge = comp$.find(".gauge")
            return {
                displayName: comp$.find(".editThisName").text(),
                color: comp$.attr("data-color"),
                min: gauge.attr("data-minNumber"),
                max: gauge.attr("data-maxNumber"),
                maxDeg: gauge.attr("data-maxdeg"),
                offsetDeg: gauge.attr("data-offsetDeg"),
                low: gauge.attr("data-low"),
                high: gauge.attr("data-high"),
                optimum: gauge.attr("data-optimum")
            }
        case "numberLine":
            let meter = comp$.find(".numberLineHasValue")
            return {
                displayName: comp$.find(".editThisName").text(),
                color: comp$.attr("data-color"),
                min: meter.attr("min"),
                max: meter.attr("max"),
                low: meter.attr("low"),
                high: meter.attr("high"),
                optimum: meter.attr("optimum")
            }
        case "camera":
            return {
                displayName: comp$.find(".editThisName").text(),
                hideNav: comp$.attr("data-hideNav"),
                videoFormat: comp$.attr("data-videoFormat"),
                recordConditionHandler: comp$.attr("data-recordConditions")
            }
    }
}

