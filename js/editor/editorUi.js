// MIT License
// Copyright (c) 2026 Tigerbots
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

import { outputComponents, createSideTab, multiSwitchButtonSet, setSelectOpener, cq, v, toastMessage } from "../ui.js"
import { createDefaultOf, defaultSimilarOptions, setSimilarOptions, addButtonToAnimate, createDropdown, createOptGroup, globalGraphRef, generateCssIfStatement, rebindAllComponents, setupNewGraphHandeler } from "./components/components.js"
import { tabGrid, setGridInput, setCornerBorder, clientDragHandler, addToCurrentDrag, findEndOffset, grid } from "./grid.js"
import { topicObject, nt4Client, getStructValue, subscribedTopics, compatabilityYear, subscribeOrQueue, isConnected } from "../coms.js"
import { vh, hslToHex } from "../../lib/util.js"
import { outputComponentTypes } from "../save.js"
import { CONVERSIONRATE, startTimeChanged } from "./components/graph.js"


let nonSupportedTypes = {
    "basicSubscription": false,
    "basicLogger": false,
    "numberLine": ["string", "boolean"],
    "radialGauge": ["string", "boolean"],
    "graph": ["string", "boolean"],
    "colorCoder": ["number"]
}

let editComponent = {
    currentTarget: false,
    valueType: false,
}

let dragInfo = {
    initialY: 0,
    currentY: 0,
    phased: false,
    margined: false,
}

let tabDragInfo = {
    initialY: 0,
    currentY: 0,
    phased: false,
    margined: false,
}

let editTouched = false;

// Binders

function bindEditOpener() {
    $(".editTabs").off("pointerdown.touchcheck").on("pointerdown.touchcheck", (event) => {

        if (event.pointerType !== "mouse") {
            editTouched = true;

        } else {
            editTouched = false
        }
    })


    $(".editTabs").off("click.editOpener").on("click.editOpener", () => {
        $(".tabCreator").removeClass("tabCreatorOpen")

        $(".tabCreator").css("overflow-x", "hidden")
        $(".nameInput").val("")
        $(".addTab").text("+").css("font-size", "").css("line-height", "")

        $("#connect").css("pointer-events", "none")

        $(".tabHidden").toggleClass("hideSideTab")

        $(".editTabs").toggleClass("editingTabs");
        $("body").toggleClass("bodyEdit")
        $(".tab").toggleClass("tabsEditActivated")
        $(".addTab").toggleClass("tabsEditActivated")
        $(".tabManager").toggleClass("tabsEditActivated")
        $(".tabCreator").toggleClass("tabsEditActivated")

        $(".onlyOnEdit").toggleClass("onlyEditShowing")

        $(".gridUnderlay").toggleClass("gridUnderlayEditing")
        $(".gridUnderlayVisual").toggleClass("gridUnderlayVisualEditing")

        $(".gridSquare").toggleClass("gridSquareEditing")

        let currentPage$ = $($(".currentTab").attr("data-page"))


        setTimeout(() => {
            tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)

            if (editTouched) {
                // toastMessage("caught")
                $(".gridSquareVisual").css("scale", "97%");
            }
        }, 300);

        setTimeout(() => {
            $("#connect").css("pointer-events", "")

        }, 1000);


        intervalFor(() => {
            $(".dashboardHolder").attr("data-vhCminDif", v(.01).vh / cq($($(".currentTab").attr('data-page')), 1).cqmin)
            $(".dashboardHolder").attr("data-vwCminDif", v(.01).vw / cq($($(".currentTab").attr('data-page')), 1).cqmin)

        }, 10, 1000)

        if ($(".editTabs").hasClass("editingTabs")) {

            $("body").off("pointermove.gridReact").on("pointermove.gridReact", (event) => {
                if ($(".gridSquareVisual").length > 600 || editTouched) {

                    $(".gridSquareVisual").css("scale", "97%");
                    return
                }

                let $eq = $(".gridSquareVisual").eq(0)

                let clientDrag = clientDragHandler(event, $eq)

                //jquery ommited for preformance reasons
                let elements = document.getElementsByClassName("gridSquareVisual")
                for (let i = 0; i < elements.length; i++) {
                    let $eq = elements[i]

                    let offset = $eq.getBoundingClientRect()

                    let dist = Math.hypot(offset.left - clientDrag.x, offset.top - clientDrag.y)
                    let distVal = (0.0125 * (dist) + 95)

                    if (distVal > 100) {
                        distVal = 100
                    }

                    $eq.style.transform = 'scale(' + distVal + '%)'
                }

            })
        } else {
            // $("*").removeClass("removeShake").off("pointerdown.remove").off("pointermove.dragComponent")//.off("pointerdown.editHandler")
            $(".dashboardHolder, .dashboardHolder *").removeClass("removeShake").off("pointerdown.remove pointermove.dragComponent");

            $(".removeShake").removeClass("removeShake").off("pointerdown.remove pointermove.dragComponent");

            $(".trashCan").removeClass("trashActive")

            $("body").off("pointermove.gridReact")

            if ($(".connectionText").text() == "Connected") {
                // window.location.reload();
            }

            rebindAllComponents();
            setSelectOpener();
        }

    })


}

function intervalFor(func, interval, timeout) {
    let newInterval = setInterval(func, interval);

    setTimeout(() => {
        clearInterval(newInterval)
    }, timeout);
}

function bindComponentAdders() {
    $(".ioComponents").children().off().on("click.addComponent ", (event) => {
        $("*").removeClass("removeShake").off("pointerdown.remove")
        $(".trashCan").removeClass("trashActive")



        let componentType = $(event.currentTarget)[0].classList[0];

        // toastMessage(componentType)

        let jQueryReference

        if ($(event.currentTarget).parent().hasClass("outputComponents")) {
            jQueryReference = createDefaultOf(componentType, ".dashboardHolder", outputComponents.fullpath)
        } else if (outputComponents.tunable) {
            jQueryReference = createDefaultOf("tunableInterface", ".dashboardHolder", outputComponents.fullpath, componentType)

            let dragRef = createDefaultOf("tunableInterface", ".dashboardHolder", "esc-UNDEFINED-esc").addClass("currentDrag")

            let clientDrag = clientDragHandler(event, dragRef)
            dragRef.remove()

            addToCurrentDrag(jQueryReference, clientDrag.x, clientDrag.y, componentType)

            return
        } else {
            jQueryReference = createDefaultOf(componentType, ".dashboardHolder", "esc-UNDEFINED-esc")
        }

        // console.log(subscribedTopics)

        //When fill is enabled, the element takes 100% of current container width, since it starts with no container, 
        //Current drag is exempt from this 100%, but that class wont be added to later, so we make a new element with
        //that class to put into the mouse position handler and add the offset for the center of the element. 
        let dragRef = createDefaultOf(componentType, ".dashboardHolder", "esc-UNDEFINED-esc").addClass("currentDrag")

        let clientDrag = clientDragHandler(event, dragRef)

        dragRef.remove()

        addToCurrentDrag(jQueryReference, clientDrag.x, clientDrag.y, componentType)


    })
}

function bindTrashCan() {
    $(".trashCan").on(" pointerdown.activateTrashCan", () => {
        $(".trashCan").toggleClass("trashActive")


        // $(".currentDrag").remove()
        // $("*").off("pointermove.dragComponent").off("pointerup.dragComponent").off("pointerdown.dragComponent")

        setCornerBorder(0, 0, 0, 0, 0, true)

        let elements = $($(".currentTab").attr("data-page")).children().add($(".tunableInterface").children())

        for (let i = 0; i < elements.length; i++) {
            let $eq = elements.eq(i)

            if ($(".trashCan").hasClass("trashActive")) {
                $eq.addClass("removeShake")
            } else {
                $eq.off("pointerdown.remove")
                $eq.removeClass("removeShake")

            }

        }

        $(".removeShake").on("pointerdown.remove ", (event) => {
            if ($(event.currentTarget).hasClass("graph")) {
                globalGraphRef[$(event.currentTarget).attr("data-graphKey")].renderer.destroy()
            }

            let $ct = $(event.currentTarget)
            let index = $ct.attr("data-subscriptionIndex")
            if ($ct.hasClass("tunableInterface")) {
                index = $ct.children().eq(0).attr("data-subscriptionIndex")
            }

            if ($ct.attr('data-topics') !== undefined && $ct.attr("data-subscriptionIndexes") !== undefined) {
                let topics = JSON.parse($ct.attr('data-topics'))
                let indexes = JSON.parse($ct.attr("data-subscriptionIndexes"))

                for (let i = 0; i < topics.length; i++) {
                    subscribedTopics[topics[i].split("|")[0]][indexes[topics[i]]] = false;
                }
            } else {
                subscribedTopics[$ct.attr('data-topic').split("|")[0]][index] = false
            }

            if($ct.parent().hasClass("tunableInterface")){
               $ct.parent().remove() 
            }

            $ct.remove()

        })
    })
}

function bindMinMaxHandlers() {
    $(".editSidebar").find(" .numberTextInput").on("blur", (event) => {
        //Use parentQueries to ensure selecting right element (as always)

        let $currentInput = $(event.currentTarget)

        let min = $currentInput.parent().parent().find(".min")
        let max = $currentInput.parent().parent().find(".max")
        let val = $currentInput.parent().parent().find(".value")
        $currentInput.parent().parent().find(".step")
        if (min.val() != "" && max.val() != "") {
            // val.removeAttr("disabled")
        } else {
            // val.attr("disabled", "disabled").val("")
        }

        if (parseFloat(val.val()) > parseFloat(max.val())) {
            val.val(max.val())
            max.css("animation-name", 'warn')

            setTimeout(() => {
                max.css("animation-name", "")
            }, 2000);
        } else if (parseFloat(val.val()) < parseFloat(min.val())) {
            val.val(min.val())
            min.css("animation-name", 'warn')

            setTimeout(() => {
                min.css("animation-name", "")
            }, 2000);
        }

        if (parseFloat(min.val()) >= parseFloat(max.val())) {
            if ($currentInput.hasClass("min")) {
                max.css("animation-name", 'warn')

                setTimeout(() => {
                    max.css("animation-name", "")
                }, 2000);

                min.val(max.val() - 1)
            } else {
                min.css("animation-name", 'warn')

                setTimeout(() => {
                    min.css("animation-name", "")
                }, 2000);

                max.val(parseFloat(min.val()) + 1)
            }

        }

    })
}

function bindOptionAdder() {
    $(".optionAdder").on("submit.addDiv", (e) => {


        let hex = $(e.currentTarget).children(".hex")
        let $sbO = $("<div>").addClass("sidebarOption").insertBefore(".optionAdder").attr("data-name", $(".newOptionName").val()).attr("data-value", $(".newOptionValue").val()).attr("data-hex", hex.val()).css("border-color", hex.val())
        $("<button>").addClass("sideBarEmojiButton").addClass("hamburger").text("☰").appendTo($sbO)
        $("<p>").text($(".newOptionName").val() + ":" + $(".newOptionValue").val()).appendTo($sbO)
        $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {
            $(event.currentTarget).parent().remove()

        }
        )

        $(".newOptionName").val("")
        $(".newOptionValue").val("")
        addOptionDragHandler($sbO)

        let colors = JSON.parse(editComponent.currentTarget.attr("data-componentoptions"))

        $(".stringHex").val(getNextLineColor(colors))

        return false
    })
}

function bindConditionalHandlers() {
    $(".conditionPlus").on("click.addDiv", () => {
        createConditionSidebarButton()

    })

    $(".conditionAdder").on("submit.addDiv", () => {
        return false
    })

}

function bindCoderAdderHandlers() {
    // $(".conditionPlus").on("click.addDiv", () => {
    //     createConditionSidebarButton()

    // })

    $(".coderAdder").on("submit.addDiv", () => {
        createColorCoderSidebarButton();

        $(".newCoderValue").val("")

        return false;
    })
}

function bindGraphLineAdderHandlers() {
    // $(".conditionPlus").on("click.addDiv", () => {
    //     createConditionSidebarButton()

    // })

    $(".graphAdder").on("submit.addDiv", () => {
        createGraphTopicSidebarButton();

        $(".newGraphLineHex").val(getNextLineColor(JSON.parse(editComponent.currentTarget.attr("data-lineProperties"))))

        return false;
    })
}

// AI function that finds the next color given a object that has existing ones. 
function getNextLineColor(lineProperties, saturation = 75, lightness = 50) {
    // 1. Extract valid hex colors from lineProperties
    const hexColors = Object.values(lineProperties || {})
        .map(item => item?.color)
        .filter(color => typeof color === 'string' && /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color));

    // If no lines exist yet, return a strong starting color
    if (hexColors.length === 0) {
        return hslToHex(210, saturation, lightness); // Vibrant Blue
    }

    // 2. Convert existing hex colors to hue angles (0 - 360) and sort them
    const hues = hexColors
        .map(hex => hexToHue(hex))
        .sort((a, b) => a - b);

    // 3. Find the largest angular gap between consecutive hues (including wrap-around at 360°)
    let maxGap = -1;
    let newHue = 0;

    for (let i = 0; i < hues.length; i++) {
        const current = hues[i];
        // For the last item, wrap around the 360° circle to the first item
        const next = i === hues.length - 1 ? hues[0] + 360 : hues[i + 1];
        const gap = next - current;

        if (gap > maxGap) {
            maxGap = gap;
            newHue = (current + gap / 2) % 360;
        }
    }

    return hslToHex(Math.round(newHue), saturation, lightness);
}

// --- Helper Functions ---

function hexToHue(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (delta === 0) return 0; // Neutral gray/black/white

    let hue = 0;
    if (max === r) {
        hue = ((g - b) / delta) % 6;
    } else if (max === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);
    return hue < 0 ? hue + 360 : hue;

}

function bindComponentRepositioner() {
    $(".reposistionComponent").on("pointerdown.reposComponent", (event) => {
        $(".sideBar").off("pointerup.setEdit pointermove.setEdit")
        let currentEditComponent = editComponent.currentTarget


        if (currentEditComponent.attr("data-row") == undefined && currentEditComponent.parent().hasClass("tunableInterface")) {
            currentEditComponent = editComponent.currentTarget.parent()
        }

        setCornerBorder(0, 0, 0, 0, 0, true)
        let currentDrag = clientDragHandler(event, currentEditComponent)
        // console.log(editComponent.currentTarget.attr("data-componentType"))
        addToCurrentDrag(currentEditComponent, currentDrag.x, currentDrag.y, currentEditComponent.attr("data-componentType"))
    })
}

function bindComponentFillOption() {
    $(".fillSpaceCheckbox").on("input", () => {
        defaultSimilarOptions.fill = $(".fillSpaceCheckbox")[0].checked
        setSimilarOptions(editComponent.currentTarget, defaultSimilarOptions)
    })
}

function bindTabCreator() {
    $(".addTab").on("pointerdown.addTab", () => {
        $(".tabCreator").toggleClass("tabCreatorOpen")
        if (!$(".tabCreator").hasClass("tabCreatorOpen")) {
            $(".tabCreator").css("overflow-x", "hidden")
            $(".addTab").text("+").css("font-size", "").css("line-height", "")
        }
        setTimeout(() => {
            if ($(".tabCreator").hasClass("tabCreatorOpen")) {
                $(".tabCreator").css("overflow-x", "initial")
                $(".addTab").text("✗").css("font-size", "4cqh").css("line-height", "6cqh")

            }
        }, 300);
    })

    $(".tabCreatorForm").on("submit", () => {

        let name = $(".nameInput").val()
        let tab = $(".nameInput").val().replace(/[^a-zA-Z]/g, '-') + "B" + Math.random().toString().slice(2)

        // console.log(name, tab)

        let $ct = $("<div>").addClass("tab")
            .addClass("tabsEditActivated")
            .css("background-color", $(".fullScreen").css("background-color"))
            .addClass("tabConnection")
            .addClass("tabVisible")
            .addClass("userTab")
            .addClass("pTAB" + tab)
            .attr("data-page", "." + tab)
            .text(name)
            .insertBefore(".tabCreator")


        // <div class="uiTestTab page" style="display: grid;">/
        bindEditorResetter($ct)

        if (window.innerWidth / window.innerHeight < 4 / 3) {
            $(".manager").addClass("managerOpen")

            setTimeout(() => {
                createSideTab(name, "." + tab)
            }, 400);

            setTimeout(() => {
                $(".manager").removeClass("managerOpen")
            }, 1200);
        } else {
            createSideTab(name, "." + tab)
        }

        let currentPage$ = $("<div>").addClass("page").addClass(tab).css("display", "grid").attr("data-displaytype", "grid").attr("rows", "4").attr("columns", "9").insertAfter(".autonomus")


        $(".page, .pageF").css("display", "none")
        $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
        $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
        if ($ct.attr("data-displaytype") == null) {
            currentPage$.css("display", "grid")
        } else {
            currentPage$.css("display", $ct.attr("data-displaytype"))
        }

        tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)
        setGridInput(currentPage$)

        $(".tabCreator").removeClass("tabCreatorOpen")

        $(".tabCreator").css("overflow-x", "hidden")
        $(".nameInput").val("")
        $(".addTab").text("+").css("font-size", "").css("line-height", "")

        return false
    })

    $(".nameInput").on("invalid", (event) => {
        event.preventDefault()
        $(".tabCreator").removeClass("tabCreatorOpen")

        $(".tabCreator").css("overflow-x", "hidden")
        $(".nameInput").val("")
        $(".addTab").text("+").css("font-size", "").css("line-height", "")
    })

    $(".nameInput").on("input", () => {
        if ($(".nameInput").val().length > 0) {
            $(".addTab").text("✓")
        } else {
            $(".addTab").text("✗")
        }
    })
}

function bindSidebarNav() {
    $(".openOutput").on("pointerdown", () => {
        $(".ioComponents").css("display", "none")
        $(".editSidebar").css("display", "none")
        $(".outputTopics").css("display", "flex")
        $(".sideBarUnderline").removeClass("sideBarUnderline")
        $(".openOutput").addClass("sideBarUnderline")
    })

    $(".openInput").on("pointerdown", () => {
        $(".ioComponents").css("display", "none")
        $(".editSidebar").css("display", "none")
        $(".inputComponents").css("display", "flex").children().css("display", "")
        $(".sideBarUnderline").removeClass("sideBarUnderline")
        $(".openInput").addClass("sideBarUnderline")

        outputComponents.topic = ""
        outputComponents.changing = false
        outputComponents.changingValidTypes = ["all"]
        outputComponents.changingSidebar = ""
        outputComponents.tunable = false
        outputComponents.finding = false


    })
}

//Needs refactoring
function bindEditMenu(element, valueType, customEdit = false) {

    let inputs = $("." + valueType + "Sidebar").find(".isEdit, .isntEdit").val("")

    let recordMap = new Map();

    recordMap.set(JSON.stringify({ "fmsAttached": true }), "FMS + Connected")
    recordMap.set(JSON.stringify({ "fmsAttached": true, "enabled": true }), "FMS + Enabled")
    recordMap.set(JSON.stringify({ "dsAttached": true }), "DS + Connected")
    recordMap.set(JSON.stringify({ "dsAttached": true, "enabled": true }), "DS + Enabled")


    for (let i = 0; i < inputs.length; i++) {
        let inputBeingBound = inputs.eq(i)
        //Loops through all inputs and sets the event listeners for each
        if (inputBeingBound.attr('data-editing') == "text") {
            bindName(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-keys") {
            bindColorCoderKeys(inputBeingBound)
        } else if (inputBeingBound.hasClass("numberTextInput")) {
            bindNumbers(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "color") {
            bindColors(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "axisDirection") {
            bindAxisDirection(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-videoFormat") {
            bindFormat(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "optionArray") {
            bindMultiAdder(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "changeTopic") {
            bindChangeSubscriptionTopic(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-persist") {
            bindPersistantCheckbox(inputBeingBound)
        } else if (inputBeingBound.hasClass("multiSwitch")) {
            bindToggleMultiSwitch(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-snapBack") {
            bindSnapBack(inputBeingBound)
        } else if (inputBeingBound.attr('data-editing') == "data-autoSend") {
            bindAutoSend(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-hideNav") {
            bindHideNav(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-recordconditions") {
            bindRecordConditions(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "graphTopics") {
            bindGraphTopics(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-topic") {
            bindTopic(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") !== "na") {
            bindOtherData(inputBeingBound)
        }

    }

    if (valueType == "double") {
        let min = $(".doubleSidebar").find(".min")
        let max = $(".doubleSidebar").find(".max")
        let val = $(".doubleSidebar").find(".value")

        if (min.val() != "" && max.val() != "") {
            // val.removeAttr("disabled")
        } else {
            // val.attr("disabled", "disabled").val("")
        }
    }

    function bindSnapBack(inputBeingBound) {
        if (editComponent.currentTarget.hasClass("axis") || editComponent.currentTarget.hasClass("verticalAxis")) {
            inputBeingBound.prop("checked", JSON.parse(editComponent.currentTarget.attr("data-snapBack")))

            inputBeingBound.off("input.snapBack").on("input.snapBack", (event) => {
                let $ct = $(event.currentTarget)

                editComponent.currentTarget.attr("data-snapBack", JSON.stringify($ct.prop("checked")))
            })
        }
    }


    function bindAutoSend(inputBeingBound) {
        if (editComponent.currentTarget.attr("data-autoSend")) {

            inputBeingBound.prop("checked", JSON.parse(editComponent.currentTarget.attr("data-autoSend")))

            inputBeingBound.off("input.autoSend").on("input.autoSend", (event) => {
                let $ct = $(event.currentTarget)

                let allComponents = $(".editableComponent")
                for (let i = 0; i < allComponents.length; i++) {
                    let currentComponent = allComponents.eq(i)

                    if (currentComponent.attr("data-topic") == editComponent.currentTarget.attr("data-topic")) {
                        currentComponent.attr("data-autoSend", JSON.stringify($ct.prop("checked")))

                    }
                }

                nt4Client.publishedTopics.get(editComponent.currentTarget.attr("data-topic")).autoSend = $ct.prop("checked");
                // editComponent.currentTarget.attr("data-autoSend", JSON.stringify($ct.prop("checked")))
            })

        }
    }

    function bindHideNav(inputBeingBound) {
        if (editComponent.currentTarget.hasClass("cameraComponent")) {
            inputBeingBound.prop("checked", JSON.parse(editComponent.currentTarget.attr("data-hideNav")))

            inputBeingBound.off("input.hideNav").on("input.hideNav", (event) => {
                let $ct = $(event.currentTarget)

                editComponent.currentTarget.attr("data-hideNav", JSON.stringify($ct.prop("checked")))
            })
        }
    }

    function bindName(inputBeingBound) {
        //defaults selection to all text for easy deletion
        let nameInputText = editComponent.currentTarget.text()
        if (editComponent.currentTarget.hasClass("animatedButton")) {
            nameInputText = editComponent.currentTarget.clone().children().remove().end().text()
        } else if (editComponent.currentTarget.children(".editThisName").length > 0) {
            nameInputText = editComponent.currentTarget.children(".editThisName").text()
        } else {
            nameInputText = getDataName(editComponent.currentTarget)
        }

        inputBeingBound.val(nameInputText).off(`focus.selectText`).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

        inputBeingBound.off("input.typing  blur.typing").on("input.typing blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget
            $comp.children(".buttonWord").remove()

            if ($comp.children(".editThisName").length > 0) {
                $comp.children(".editThisName").text($ct.val())
            } else if ($comp.attr("data-componentType") == "buttonOptGroup" || $comp.attr("data-componentType") == "select") {
                editDataName($ct.val(), $comp);
            } else {
                $comp.text($ct.val())
            }

            if ($comp.hasClass("animatedButton")) {
                addButtonToAnimate($comp)
            }
        })


    }

    function bindNumbers(inputBeingBound) {
        let boundEditing
        if (editComponent.currentTarget.hasClass("numberComponent")) {
            boundEditing = editComponent.currentTarget.attr("data-" + inputBeingBound.attr("data-editing"))

            if (inputBeingBound.attr("data-editing") == "value") {
                boundEditing = editComponent.currentTarget.attr("data-initialValue" + inputBeingBound.attr("data-editing"))
            }
        } else if (editComponent.currentTarget.hasClass("graph")) {
            if (inputBeingBound.attr("data-editing") == "width") {
                boundEditing = editComponent.currentTarget.attr("data-width")
            }
        } else if (editComponent.currentTarget.hasClass("axis") || editComponent.currentTarget.hasClass("verticalAxis")) {
            boundEditing = editComponent.currentTarget.children(".axisKnob, .verticalAxisKnob").attr(inputBeingBound.attr('data-editing'))

            if (inputBeingBound.attr("data-editing") == "value") {
                boundEditing = editComponent.currentTarget.children(".axisKnob, .verticalAxisKnob").val()
            }
        } else if (editComponent.currentTarget.hasClass("numberLine")) {
            if (inputBeingBound.hasClass("max")) {

                boundEditing = editComponent.currentTarget.attr("data-maxNumber")
                let meter = editComponent.currentTarget.find(".numberLineHasValue").eq(0)
                setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))
            } else if (inputBeingBound.hasClass("min")) {
                boundEditing = editComponent.currentTarget.attr("data-minNumber")
                let meter = editComponent.currentTarget.find(".numberLineHasValue").eq(0)
                setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))
            } else {
                boundEditing = editComponent.currentTarget.find(".numberLineHasValue").eq(0).attr(inputBeingBound.attr("data-editing"))
                let meter = editComponent.currentTarget.find(".numberLineHasValue").eq(0)
                setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))
            }
        } else if (editComponent.currentTarget.hasClass("radialGauge")) {
            boundEditing = editComponent.currentTarget.find(".gauge").eq(0).attr("data-" + inputBeingBound.attr("data-editing"))
            let gauge = editComponent.currentTarget.find(".gauge")

            let whichMax = gauge.attr("data-maxNumber")

            if (!whichMax) {
                whichMax = gauge.attr("data-maxDeg")
            }

            setExampleMeter(gauge.attr("data-minNumber"), whichMax, gauge.attr("data-low"), gauge.attr("data-high"), gauge.attr("data-optimum"))

        }



        inputBeingBound.val(boundEditing)

        inputBeingBound.off("blur.typing").on("blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget

            if (editComponent.currentTarget.hasClass("numberComponent")) {
                if ($ct.attr('data-editing') == "value") {
                    $comp.attr("data-initial" + $ct.attr('data-editing'), $ct.val())
                }
                $comp.attr("data-" + $ct.attr('data-editing'), $ct.val())
            } else if ($comp.hasClass("graph")) {
                $comp.attr("data-" + $ct.attr('data-editing'), $ct.val())
                if ($ct.attr('data-editing') == "width") {
                    customEdit.graphManager.renderer.editLineWidth(customEdit.topics[0], $ct.val())
                }
            } else if (editComponent.currentTarget.hasClass("axis") || editComponent.currentTarget.hasClass("verticalAxis")) {
                if ($ct.attr("data-editing") == "value") {
                    $comp.attr("data-value", $ct.val()).children(".axisKnob, .verticalAxisKnob").val($ct.val())
                    return
                }
                $comp.children(".axisKnob, .verticalAxisKnob").attr($ct.attr('data-editing'), $ct.val())
            } else if ($comp.hasClass("numberLine")) {
                let subticks = editComponent.currentTarget.find(".numberLineTick");
                let max = editComponent.currentTarget.attr("max")
                let min = editComponent.currentTarget.attr("min")
                let step = (max - min) / (subticks.length - 1)

                for (let i = 0; i < subticks.length; i++) {
                    let subtick = subticks.eq(i);
                    let text = parseFloat(((step * i) + parseFloat(min)).toFixed(3));
                    // subtick.text(text)
                    subtick.text(text)
                }
                if (inputBeingBound.attr("data-editing") == "max") {
                    if ($ct.val().length == 0) {
                        $comp.removeAttr("data-maxNumber")
                        $comp.find(".numberLineHasValue").attr("max", "0")
                        return
                    } else {
                        $comp.attr("data-maxNumber", $ct.val())
                    }
                }
                if (inputBeingBound.attr("data-editing") == "min") {
                    if ($ct.val().length == 0) {
                        $comp.removeAttr("data-minNumber")
                        $comp.find(".numberLineHasValue").attr("min", "0")
                        return
                    } else {
                        $comp.attr("data-minNumber", $ct.val())
                    }
                }



                let meter = $comp.find(".numberLineHasValue")
                let meterHolder = $comp.find(".meterHolder")
                meter.attr($ct.attr("data-editing"), $ct.val())

                setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))

                if ($ct.val().length == 0) {
                    meter.removeAttr($ct.attr("data-editing"))
                }

                for (let I = 0; I < meter.length; I++) {
                    let currentMeter = meter.eq(I)

                    let subticks = meterHolder.eq(I).find(".numberLineTick")

                    let minNumber = 0
                    if (currentMeter.attr("min")) minNumber = currentMeter.attr("min");
                    let maxNumber = 0;
                    if (currentMeter.attr("max")) maxNumber = currentMeter.attr("max");


                    let step = (maxNumber - minNumber) / (subticks.length - 1)
                    for (let i = 0; i < subticks.length; i++) {
                        let subtick = subticks.eq(i);

                        let text = parseFloat(((step * i) + parseFloat(minNumber)).toFixed(3));

                        subtick.text(text)
                    }
                }


            } else if ($comp.hasClass("radialGauge")) {
                let gauge = $comp.find(".gauge")

                gauge.attr("data-" + $ct.attr('data-editing'), $ct.val())

                let whichMax = gauge.attr("data-maxNumber")

                if (!whichMax) {
                    whichMax = gauge.attr("data-maxDeg")
                }
                setExampleMeter(gauge.attr("data-minNumber"), whichMax, gauge.attr("data-low"), gauge.attr("data-high"), gauge.attr("data-optimum"))

                let subticks = editComponent.currentTarget.find(".subTick")

                let minNumber = 0
                if (gauge.attr("data-minNumber")) minNumber = gauge.attr("data-minNumber");

                let step = (whichMax - minNumber) / (subticks.length - 1)
                for (let i = 0; i < subticks.length; i++) {
                    let subtick = subticks.eq(i);

                    let text = parseFloat(((step * i) + parseFloat(minNumber)).toFixed(3));

                    subtick.attr("data-text", text)
                }

                if ($ct.val().length == 0) {
                    if ($ct.attr("data-editing") == "minNumber") {
                        gauge.attr("data-minNumber", "0")
                        return
                    }
                    gauge.removeAttr("data-" + $ct.attr("data-editing"))
                }
            }
        })
    }

    function bindColors(inputBeingBound) {
        inputBeingBound.val(editComponent.currentTarget.attr("data-color"))

        inputBeingBound.off("input.coloring").on("input.coloring", (event) => {
            let $ct = $(event.currentTarget)

            if (editComponent.currentTarget.hasClass("basicLogger") || editComponent.currentTarget.hasClass("colorCoder") || editComponent.currentTarget.hasClass("numberLine") || editComponent.currentTarget.hasClass("radialGauge")) {
                editComponent.currentTarget.css("border-color", $ct.val()).attr("data-color", $ct.val())
                editComponent.currentTarget[0].style.setProperty("--accent", $ct.val());

            } else if (editComponent.currentTarget.hasClass("graph")) {
                if (customEdit.hasOwnProperty("graphManager") && customEdit.hasOwnProperty("topics")) {
                    customEdit.graphManager.renderer.editLineColor(customEdit.topics[0], $ct.val())
                    editComponent.currentTarget.attr("data-color", $ct.val())
                }
            } else if (valueType == 'boolean' || valueType == "subscription") {
                editComponent.currentTarget.css("background-color", $ct.val() + "3f").css("border-color", $ct.val()).attr("data-color", $ct.val())

                if (editComponent.currentTarget.hasClass("toggleButton") && !(editComponent.currentTarget.hasClass("toggledOn"))) {
                    editComponent.currentTarget.css("background-color", $ct.val() + "00").css("border-color", $ct.val()).attr("data-color", $ct.val())
                }
            } else if (valueType == "double") {
                editComponent.currentTarget.css("--thumbColor", $ct.val()).attr("data-color", $ct.val())
            }
        })
    }

    function bindPersistantCheckbox(inputBeingBound) {
        if (editComponent.currentTarget.hasClass("toggleButton") || editComponent.currentTarget.hasClass("buttonOptGroup") || editComponent.currentTarget.hasClass("select") || editComponent.currentTarget.hasClass("numberComponent")) {
            inputBeingBound.prop("checked", JSON.parse(editComponent.currentTarget.attr("data-persist")))

            inputBeingBound.off("input.persitant").on("input.persitant", (event) => {
                let $ct = $(event.currentTarget)
                if ($ct.prop("checked") && editComponent.currentTarget.hasClass("toggleButton")) {
                    $(".initalToggleEdit").css("display", "none")
                } else {
                    $(".initalToggleEdit").css("display", "")
                }
                editComponent.currentTarget.attr("data-persist", JSON.stringify($ct.prop("checked")))
            })
        }


    }

    function bindAxisDirection(inputBeingBound) {
        setTimeout(() => {
            if (editComponent.currentTarget.hasClass("verticalAxis")) {
                multiSwitchButtonSet(inputBeingBound, "Y-Axis")
            } else {
                multiSwitchButtonSet(inputBeingBound, "X-Axis")
            }
        }, 1);

        inputBeingBound.find(".multiSwitchButton").off("pointerdown.axisDirection").on("pointerdown.axisDirection", (event) => {
            if ($(event.target).val() == "Y-Axis") {
                editComponent.currentTarget.removeClass("axis").addClass("verticalAxis").attr("data-componentType", "verticalAxis")
                editComponent.currentTarget.find(".axisKnob").removeClass("axisKnob").addClass("verticalAxisKnob")
                multiSwitchButtonSet(inputBeingBound, "Y-Axis")

            } else if ($(event.target).val() == "X-Axis") {
                editComponent.currentTarget.removeClass("verticalAxis").addClass("axis").attr("data-componentType", "axis")
                editComponent.currentTarget.find(".verticalAxisKnob").removeClass("verticalAxisKnob").addClass("axisKnob")
                multiSwitchButtonSet(inputBeingBound, "X-Axis")


            }
        })
    }

    function bindFormat(inputBeingBound) {
        setTimeout(() => {
            if (editComponent.currentTarget.attr("data-videoFormat") == "Mp4") {
                multiSwitchButtonSet(inputBeingBound, "Mp4")
            } else {
                multiSwitchButtonSet(inputBeingBound, "WebM")
            }
        }, 1);

        inputBeingBound.find(".multiSwitchButton").off("pointerdown.axisDirection").on("pointerdown.axisDirection", (event) => {
            if ($(event.target).val() == "Mp4") {
                editComponent.currentTarget.attr("data-videoFormat", "Mp4")
                multiSwitchButtonSet(inputBeingBound, "Mp4")

            } else if ($(event.target).val() == "WebM") {
                editComponent.currentTarget.attr("data-videoFormat", "WebM")
                multiSwitchButtonSet(inputBeingBound, "Mp4")

            }
        })
    }


    function bindRecordConditions() {
        if (editComponent.currentTarget.hasClass("cameraComponent")) {

            let conditions = JSON.parse(editComponent.currentTarget.attr("data-recordconditions"));
            $(".sidebarCondition").remove();

            for (let i = 0; i < conditions.length; i++) {
                // console.log(conditions, conditions[i], JSON.stringify(conditions[i]), recordMap, recordMap.get(JSON.stringify(conditions[i])))
                createConditionSidebarButton(recordMap.get(JSON.stringify(conditions[i])), JSON.stringify(conditions[i]), false)
            }
        }
    }

    function bindColorCoderKeys() {
        if (editComponent.currentTarget.hasClass("colorCoder")) {

            let conditions = JSON.parse(editComponent.currentTarget.attr("data-keys"));
            $(".sidebarCondition").remove();

            for (let key of Object.keys(conditions)) {
                if (key == "else") continue;
                createColorCoderSidebarButton(key, conditions[key], false)
            }
            // for (let i = 0; i < conditions.length; i++) {
            //     // console.log(conditions, conditions[i], JSON.stringify(conditions[i]), recordMap, recordMap.get(JSON.stringify(conditions[i])))
            //     createConditionSidebarButton(JSON.stringify(conditions[i])), JSON.stringify(conditions[i]), false)
            // }
        }
    }

    function bindGraphTopics() {
        if (editComponent.currentTarget.hasClass("graph")) {
            $(".sidebarTopics").remove();

            let topics = JSON.parse(editComponent.currentTarget.attr("data-topics"))
            let lineProperties = JSON.parse(editComponent.currentTarget.attr("data-lineproperties"))
            $(".newGraphLineHex").val(getNextLineColor(lineProperties))
            for (let i = 0; i < topics.length; i++) {
                createGraphTopicSidebarButton(topics[i], lineProperties[topics[i]].width, lineProperties[topics[i]].color, false)
            }
        }

    }


    function bindToggleMultiSwitch(inputBeingBound) {
        if (editComponent.currentTarget.attr("data-componenttype") != "toggleButton") return

        setTimeout(() => {
            let persist = false
            if (editComponent.currentTarget.attr("data-persist") != undefined) {
                persist = JSON.parse(editComponent.currentTarget.attr("data-persist"))
            }

            if (persist) {
                // if (JSON.parse(editComponent.currentTarget.attr("data-value"))) {
                //     multiSwitchButtonSet(inputBeingBound, "True")
                //     editComponent.currentTarget.attr("data-initialvalue", "true")
                // } else {
                //     multiSwitchButtonSet(inputBeingBound, "False")
                //     editComponent.currentTarget.attr("data-initialvalue", "false")

                // }
                inputBeingBound.parent().css("display", "none")
            } else {
                if (JSON.parse(editComponent.currentTarget.attr("data-initialvalue"))) {
                    multiSwitchButtonSet(inputBeingBound, "True")
                } else {
                    multiSwitchButtonSet(inputBeingBound, "False")
                }
                inputBeingBound.parent().css("display", "")
            }
        }, 1);

        inputBeingBound.find(".multiSwitchButton").off("pointerdown.setInitial").on("pointerdown.setInitial", (event) => {
            let oldBG = editComponent.currentTarget.css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')

            if ($(event.target).val() == "False") {
                editComponent.currentTarget.attr("data-initialvalue", "false")
                if (!isConnected) {
                    editComponent.currentTarget.attr("data-value", "false").css("background-color", oldBG + ", 0)").removeClass("toggledOn")
                }
                multiSwitchButtonSet(inputBeingBound, "False")


            } else if ($(event.target).val() == "True") {
                editComponent.currentTarget.attr("data-initialvalue", "true")
                if (!isConnected) {
                    editComponent.currentTarget.attr("data-value", "true").css("background-color", oldBG + ", 0.6)").addClass("toggledOn")
                }
                multiSwitchButtonSet(inputBeingBound, "True")

            }
        })
    }

    function bindMultiAdder(inputBeingBound) {
        let foundComponentOptions = JSON.parse(editComponent.currentTarget.attr("data-componentOptions"))

        $(".multiAdder").children(".sidebarOption").remove()

        for (let j = 0; j < foundComponentOptions.length; j++) {

            if (foundComponentOptions[j].name == "" || foundComponentOptions[j].value == "") continue

            let $sbO = $("<div>").addClass("sidebarOption").insertBefore(".optionAdder").attr("data-name", foundComponentOptions[j].name).attr("data-value", foundComponentOptions[j].value).attr("data-hex", foundComponentOptions[j].color).css("border-color", foundComponentOptions[j].color)
            $("<button>").addClass("sideBarEmojiButton").addClass("hamburger").text("☰").appendTo($sbO)
            $("<p>").text(foundComponentOptions[j].name + ":" + foundComponentOptions[j].value).appendTo($sbO)
            $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO)
            $(".newOptionName").val("")
            $(".newOptionValue").val("")
            addOptionDragHandler($sbO)
        }

        $(".trashOption").off("pointerdown.remove").on("pointerdown.remove", (event) => {
            // bindStrings(inputBeingBound)
            $(event.currentTarget).parent().remove()

        })

        $(".sideBar").off("pointerup.setEdit").on("pointerup.setEdit", () => {
            bindStrings(inputBeingBound)

        })

        $(".optionAdder").off("submit.setComponent").on("submit.setComponent", () => {
            setTimeout(() => {
                bindStrings(inputBeingBound)

            }, 1);
            return false
        })
    }

    function bindTopic(inputBeingBound) {

        //bind components attribute which is found by the current input being bounds data-editing attribute.
        let boundEditing = editComponent.currentTarget.attr(inputBeingBound.attr("data-editing"))

        if (boundEditing !== undefined) {
            boundEditing = boundEditing.replace("/touchboard/", "")
        }

        if (boundEditing === "esc-UNDEFINED-esc" || boundEditing === "/touchboard/esc-UNDEFINED-esc") {
            boundEditing = ""
        }

        if (inputBeingBound.hasClass("isntEdit")) {
            inputBeingBound.text(boundEditing)
        }

        //defaults selection to all text for easy deletion
        inputBeingBound.val(boundEditing).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

        inputBeingBound.off("blur.typing").on("blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget

            if ($ct.val() == "" || $ct.val() == "/touchboard/") {
                $comp.attr('data-topic', "esc-UNDEFINED-esc")
                return
            }


            swapSubscriptionTopic("/touchboard/" + $ct.val(), { type: editComponent.currentTarget.attr("data-type") })

            if (nt4Client.publishedTopics.get($ct.val()) && !(editComponent.currentTarget.attr("data-componenttype") == "oneShotButton" || editComponent.currentTarget.attr("data-componenttype") == "actionButton")) {
                let allComponents = $(".editableComponent")
                for (let i = 0; i < allComponents.length; i++) {
                    let currentComponent = allComponents.eq(i)

                    if (currentComponent.attr("data-autoSend") == "true" && currentComponent.attr("data-topic") == "/touchboard/" + $ct.val()) {
                        editComponent.currentTarget.attr("data-autoSend", "true")

                        inputBeingBound.parent().parent().find(".autoSend").prop("checked", true)
                    };

                }
            }

            $comp.attr($ct.attr('data-editing'), "/touchboard/" + $ct.val())
        })
    }

    function bindOtherData(inputBeingBound) {

        //bind components attribute which is found by the current input being bounds data-editing attribute.
        let boundEditing = editComponent.currentTarget.attr(inputBeingBound.attr("data-editing"))

        if (boundEditing === "esc-UNDEFINED-esc") {
            boundEditing = ""
        }

        if (inputBeingBound.hasClass("isntEdit")) {
            inputBeingBound.text(boundEditing)
        }

        //defaults selection to all text 
        // for easy deletion
        inputBeingBound.val(boundEditing).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

        inputBeingBound.off("input.typing blur.typing").on("input.typing blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget

            $comp.attr($ct.attr('data-editing'), $ct.val())
        })
    }

    // function bindValue(inputBeingBound){
    //             //bind components attribute which is found by the current input being bounds data-editing attribute.
    //     let boundEditing = editComponent.currentTarget.val()

    //     //defaults selection to all text 
    //     // for easy deletion
    //     inputBeingBound.val(boundEditing).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

    //     inputBeingBound.off("input.typing blur.typing").on("input.typing blur.typing", (event) => {
    //         let $ct = $(event.currentTarget)
    //         let $comp = editComponent.currentTarget

    //         $comp.val($ct.val())
    //     })
    // }


    function bindStrings(inputBeingBound) {
        let eDCT = editComponent.currentTarget
        let sidebarOptions = inputBeingBound.children(".sidebarOption")
        let componentsOptions = []
        let colors = {}
        for (let j = 0; j < sidebarOptions.length; j++) {
            colors[j] = {}
            colors[j].color = sidebarOptions.eq(j).attr("data-hex")
            let newOption = {}
            newOption.name = sidebarOptions.eq(j).attr("data-name")
            newOption.value = sidebarOptions.eq(j).attr("data-value")
            newOption.color = sidebarOptions.eq(j).attr("data-hex")
            componentsOptions.push(newOption)
        }

        let newComponent
        // console.log(JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0)
        // console.log(JSON.parse(eDCT.attr("data-persist")))
        // console.log(eDCT)

        if (editComponent.currentTarget.hasClass("buttonOptGroup")) {
            newComponent = createOptGroup(getDataName(eDCT), eDCT.attr("data-topic"), false, JSON.parse(eDCT.attr("data-autoSend")), eDCT.attr("data-color"), JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions")), JSON.parse(eDCT.attr("data-persist"))).div
                .css("grid-area", eDCT.css("grid-area"))
                .attr("data-row", eDCT.attr("data-row"))
                .attr("data-column", eDCT.attr("data-column"))
                .attr("data-endRow", eDCT.attr("data-endRow"))
                .attr("data-endColumn", eDCT.attr("data-endColumn"))
                .attr("data-componentOptions", JSON.stringify(componentsOptions))

        } else {
            newComponent = createDropdown(getDataName(eDCT), eDCT.attr("data-topic"), false, JSON.parse(eDCT.attr("data-autoSend")), eDCT.attr("data-color"), JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions")), JSON.parse(eDCT.attr("data-persist"))).div
                .css("grid-area", eDCT.css("grid-area"))
                .attr("data-row", eDCT.attr("data-row"))
                .attr("data-column", eDCT.attr("data-column"))
                .attr("data-endRow", eDCT.attr("data-endRow"))
                .attr("data-endColumn", eDCT.attr("data-endColumn"))
                .attr("data-componentOptions", JSON.stringify(componentsOptions))
        }

        if(editComponent.currentTarget.hasClass("tunableInterfaced")){
            newComponent.appendTo(editComponent.currentTarget.parent()).addClass("tunableInterfaced").removeClass("editableComponent")
        }else{
            newComponent.appendTo($(".currentTab").attr("data-page"))
        }


        editComponent.currentTarget.remove()

        editComponent.currentTarget = newComponent
        editComponent.valueType = "string"

    }

    function bindChangeSubscriptionTopic(inputBeingBound) {
        inputBeingBound.val("Change")

        inputBeingBound.off("pointerdown.changeTopic").on("pointerdown.changeTopic", () => {
            outputComponents.changing = true

            $(".typeHiddenTopic").removeClass("typeHiddenTopic");

            let currentlyNonAllowedTypes = nonSupportedTypes[element.attr("data-componentType")]
            // console.log(currentlyNonAllowedTypes)
            if (currentlyNonAllowedTypes) {
                for (let i = 0; i < currentlyNonAllowedTypes.length; i++) {
                    $("." + currentlyNonAllowedTypes[i] + "Topic").addClass("typeHiddenTopic")
                }
            }


            outputComponents.changingSidebar = $("." + valueType + "Sidebar")
            outputComponents.changingSidebar.css("display", "none")
            $(".outputTopics").css("display", "flex")
        })

    }

}

export function bindEditorResetter(element) {
    element.on("pointerdown.resetEditor", () => {
        $(".addButtons").css("display", "")
        $(".sideBar").off("pointerup.setEdit pointermove.setEdit")
        $(".editNavButtons").css("display", "none")
        setCornerBorder(0, 0, 0, 0, 0, true)
        $(".allComponentOptions").css("display", "none")
        $(".specificComponent").css("display", "none")
        $(".editSidebar").css("display", "none")
        $(".ioComponents").css("display", "none")
        $(".outputComponents").css("display", "none")
        $(".inputComponents").children().css("display", "")

        outputComponents.topic = ""
        outputComponents.changing = false
        outputComponents.changingValidTypes = ["all"]
        outputComponents.changingSidebar = ""
        outputComponents.tunable = false
        outputComponents.finding = false

        $(".typeHiddenTopic").removeClass("typeHiddenTopic")

        $("." + $(".sideBarUnderline").attr("data-sidebarClass")).css("display", "flex")

        $(".currentDrag").remove()
        $(".feauxComponent").remove()
        $("*").off("pointermove.dragComponent").off("pointerup.dragComponent").off("pointerdown.dragComponent")


        grid.row = 0
        grid.column = 0
        grid.endRow = 0;
        grid.endColumn = 0;
        grid.rowReverse = false
        grid.columnReverse = false
        grid.columnOffset = 1
        grid.rowOffset = 1
        grid.sizingStarted = false;
        grid.skipNextDown = false;
    })
}

//Event Handelers

function handleTabDrag() {

    //phasedTab
    //marginedTab
    //transitioning

    $(".manager").on("pointermove.drag", (event) => {
        if (!tabDragInfo.phased) return

        tabDragInfo.phased.css("top", event.pageY - vh(6.5 / 2) + "px")
    })

    $(".manager").on("pointerup.sidebarDrag pointerleave.sidebarDrag", () => {
        tabDragInfo = {
            initialY: 0,
            currentY: 0,
            phased: false,
            margined: false,
        }
        $(".sideTab").css("transition-duration", "").css("top", "")
        $(".sectionTitle").css("transition-duration", "")
        $(".marginedTab").removeClass("marginedTab")
        $(".phasedTab").removeClass("phasedTab")
    })

    $(".manager").off("pointerdown.startDrag").on("pointerdown.startDrag", (event) => {

        if (!$(event.target).hasClass("ham")) {
            return
        }

        let $pr = $(event.target).parent()

        tabDragInfo.phased = $pr

        $pr.addClass('phasedTab').css("top", event.pageY - vh(6.5 / 2) + "px")

        tabDragInfo.margined = $pr.next()

        tabDragInfo.margined.addClass("marginedTab").offset()

        $(".sideTab").css("transition-duration", "300ms")
        $(".sectionTitle").css("transition-duration", "300ms")
    })

    $(".manager").off("pointermove.drag").on("pointermove.drag", (event) => {
        let $hov = $(document.elementsFromPoint(event.pageX, event.pageY)).not(".phasedTab").filter(".sideTab, .sectionTitle").eq(0)

        if (!tabDragInfo.phased) return

        tabDragInfo.phased.css("top", event.pageY - vh(6.5 / 2) + "px")

        if ($hov.is(tabDragInfo.phased.prev())) {
            if ($hov.hasClass("marginedTab") || $hov.hasClass("transitioning") || $hov.hasClass("immoveable")) {
                return
            }

            if ($hov.hasClass("sideTab") || $hov.hasClass("sectionTitle")) {
                let transitioner = $(".marginedTab").removeClass("marginedTab").addClass("transitioning")

                setTimeout(() => {
                    transitioner.removeClass("transitioning")
                }, 300);

                $hov.addClass("marginedTab")

                tabDragInfo.phased.insertBefore($hov)

                $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).add(tabDragInfo.phased).removeClass("tabVisible").removeClass("tabHidden").removeClass("tabMinimized").offset()
                $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).add(tabDragInfo.phased).addClass(tabDragInfo.phased.prevAll(".sectionTitle").eq(0).attr("data-classset"))

                if (!tabDragInfo.phased.hasClass("sectionTitle") && !$hov.hasClass("sectionTitle")) {

                    $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).insertBefore($(".pTAB" + $hov.attr("data-page").slice(1)))
                }
            }
        } else {
            if ($hov.next().hasClass("marginedTab") || $hov.next().hasClass("transitioning") || $hov.hasClass("classificationTab")) {
                return
            }

            if ($hov.hasClass("sideTab") || $hov.hasClass("sectionTitle")) {
                let transitioner = $(".marginedTab").removeClass("marginedTab").addClass("transitioning")

                setTimeout(() => {
                    transitioner.removeClass("transitioning")
                }, 300);

                $hov.next().addClass("marginedTab")

                tabDragInfo.phased.insertAfter($hov)

                $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).add(tabDragInfo.phased).removeClass("tabVisible").removeClass("tabHidden").removeClass("tabMinimized").offset()
                $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).add(tabDragInfo.phased).addClass(tabDragInfo.phased.prevAll(".sectionTitle").eq(0).attr("data-classset"))

                if (!tabDragInfo.phased.hasClass("sectionTitle") && !$hov.hasClass("sectionTitle")) {

                    $(".pTAB" + tabDragInfo.phased.attr("data-page").slice(1)).insertAfter($(".pTAB" + $hov.attr("data-page").slice(1)))
                }

            }
        }
    })
}

//For string output components
function handleOptionDrag() {

    $(".multiAdder").on("pointermove.drag", (event) => {
        if (!dragInfo.phased) return

        dragInfo.phased.css("top", event.pageY - vh(4.5 / 2) + "px")
    })

    $(".sideBar").on("pointerup.sidebarDrag pointerleave.sidebarDrag", () => {
        dragInfo = {
            initialY: 0,
            currentY: 0,
            phased: false,
            margined: false,
        }
        $(".sidebarOption").css("transition-duration", "").css("top", "")
        $(".optionAdder").css("transition-duration", "")
        $(".marginedOption").removeClass("marginedOption")
        $(".phasedOption").removeClass("phasedOption")
    })
}

//For string output components
function addOptionDragHandler($element) {
    $element.children(".hamburger").off("pointerdown.startDrag").on("pointerdown.startDrag", (event) => {

        //i was like, you know what, ima not use event.current target, ima use $element inside the lambda like a normal person
        //and guess what
        //it would select like half the elements in the div
        //currenttarget my beloved 

        let $pr = $(event.currentTarget).parent()

        dragInfo.phased = $pr

        $pr.addClass('phasedOption').css("top", event.pageY - vh(4.5 / 2) + "px")

        dragInfo.margined = $pr.next()

        dragInfo.margined.addClass("marginedOption").offset()

        $(".sidebarOption").css("transition-duration", "300ms")
        $(".optionAdder").css("transition-duration", "300ms")
    })

    $element.off("pointermove.drag").on("pointermove.drag", (event) => {
        let $hov = $(document.elementsFromPoint(event.pageX, event.pageY)).not(".phasedOption").filter(".sidebarOption, .optionAdder").eq(0)

        if (!dragInfo.phased) return

        dragInfo.phased.css("top", event.pageY - vh(4.5 / 2) + "px")

        if ($hov.is(dragInfo.phased.prev())) {
            if ($hov.hasClass("marginedOption") || $hov.hasClass("transitioning")) {
                return
            }

            if ($hov.hasClass("sidebarOption") || $hov.hasClass("optionAdder")) {
                let transitioner = $(".marginedOption").removeClass("marginedOption").addClass("transitioning")

                setTimeout(() => {
                    transitioner.removeClass("transitioning")
                }, 300);

                $hov.addClass("marginedOption")

                dragInfo.phased.insertBefore($hov)
            }
        } else {
            if ($hov.next().hasClass("marginedOption") || $hov.next().hasClass("transitioning")) {
                return
            }

            if ($hov.hasClass("sidebarOption") || $hov.hasClass("optionAdder")) {
                let transitioner = $(".marginedOption").removeClass("marginedOption").addClass("transitioning")

                setTimeout(() => {
                    transitioner.removeClass("transitioning")
                }, 300);

                $hov.next().addClass("marginedOption")

                dragInfo.phased.insertAfter($hov)

            }
        }
    })

}

export function addEditHandler(element, valueType, specificClass = false, specificHideClass = false, customEdit = false) {
    element.on("pointerdown.editHandler", (event) => {
        if (!$(".editTabs").hasClass("editingTabs")) { return }
        // allow for blur event to execute
        $(".sideBar").off("pointerup.setEdit pointermove.setEdit")

        setTimeout(() => {

            if ($(".trashCan").hasClass("trashActive")) return

            let $ct = $(event.currentTarget)

            editComponent.currentTarget = $ct
            editComponent.valueType = valueType

            changeSimilarInputs(JSON.parse(editComponent.currentTarget.attr("data-defaultSimilarOptions")))

            $(".hideTunable").css("display", "")
            $(".allComponentOptions").css("display", "")
            $(".ioComponents").css("display", "none")
            $(".specificComponent").css("display", "none")
            $(".specificHideComponent").css("display", "")
            $(".editSidebar").css("display", "none")
            $(".showTunable").css("display", "none")

            $(".topicInput").removeAttr("disabled")

            if (specificClass) {
                $(specificClass).css("display", "")
            }

            if (specificHideClass) {
                $(specificHideClass).css("display", "none")
            }


            if ($ct.hasClass("tunableInterface") || $ct.hasClass("tunableInterfaced")) {
                $(".hideTunable").css("display", "none")
                $(".topicInput").attr("disabled", "disabled")
                $(".showTunable").css("display", "")

            }

            $(".sideBarNav").children()

            let startString = element.attr("data-componentType")

            startString = startString.charAt(0).toUpperCase() + startString.slice(1)

            $(".addButtons").css("display", "none")
            $(".editNavButtons").css("display", "")

            if (startString.includes("ColorCoder")) {
                startString = "ColorCoder"
            }

            $(".editNavName").text(startString)

            bindEditMenu($ct, valueType, customEdit)

            if (element.parent().hasClass("tunableInterface")) {
                element = element.parent()
            }
            let gridPoses = findEndOffset(element.attr('data-row'), element.attr('data-column'), element.attr('data-endRow'), element.attr('data-endColumn'))

            setCornerBorder(gridPoses.row, gridPoses.column, gridPoses.endRow, gridPoses.endColumn, $(".currentTab").attr("data-page"), true)

            $("." + valueType + "Sidebar").css("display", 'flex')
        }, 10);

    })
}

function addExplainers() {
    let comp$ = $(".needsExplanation");

    $(".explanation").on("click", () => {
        $(".explanation").css("display", "none")
        $(".explanation").children(".editThisText").text("")
    })

    for (let i = 0; i < comp$.length; i++) {
        let currentComp$ = comp$.eq(i);
        let currentExplanation = "";

        if (currentComp$.attr("data-explaining") === "autoTriggerBinder") {
            currentExplanation = "When enabled, the value of this component will be sent to the robot, and any binders will trigger on connection and when the robot is enabled. When disabled, the binders will only activate once the value is changed, and the value will be inaccessable before that."
        }


        let currentTimeout;

        currentComp$.on("pointerdown.explain", (event) => {
            let explanation$ = $(".explanation");
            // let determinantWidth = currentComp$.attr("data-parent") == "true" ? currentComp$.parent().width() : currentComp$.width();
            explanation$.children(".editThisText").text(currentExplanation)
            explanation$.css("display", "block").css("left", currentComp$.offset().left).css("top", currentComp$.offset().top + currentComp$.height())

            explanation$.children(".progress").removeClass("progressAnimating")
            explanation$.offset()
            explanation$.children(".progress").addClass("progressAnimating")

            clearTimeout(currentTimeout)

            currentTimeout = setTimeout(() => {
                $(".explanation").css("display", "none")
                $(".explanation").children(".editThisText").text("")
            }, 10000);
        })
    }
}

//Init

export function initEditor() {
    bindEditOpener();
    bindComponentAdders();
    bindTrashCan()
    bindMinMaxHandlers()
    bindConditionalHandlers()
    bindCoderAdderHandlers()
    bindGraphLineAdderHandlers()
    bindComponentRepositioner();
    bindComponentFillOption();
    bindSidebarNav();
    handleTabDrag();
    handleOptionDrag()
    bindOptionAdder();
    bindTabCreator();
    bindTopicFinder();
    addExplainers();
    bindEditorResetter($(".editNavBack, .trashCan, .editTabs, .tab, .addTab, .tabCreator")) //Multi use

}

export function changeSimilarInputs(similarOptions) {
    if (similarOptions.fill) {
        $(".fillSpaceCheckbox")[0].checked = true

    } else {
        $(".fillSpaceCheckbox")[0].checked = false

    }
}

export function topicToSidebar(topic, schemasPassed = false) {
    if (topic.type.includes("proto") || topic.type.includes("structschema")) return
    if (topic.type.includes("struct") && !schemasPassed) {
        return
    };
    // if (topic.name.split("/")[1].includes("to    uchboard")) return;

    let split = topic.name.split("/")

    if (topic.name[0] == "/") {
        split.shift();
    }

    let currentPath = topicObject
    // console.log(topicObject)
    //decodes topic path into an object and makes them appear in the sidebar
    for (let i = 0; i < split.length; i++) {
        // if(i == 0 && split[i] == "touchboard") continue
        if (currentPath[split[i]] && i < split.length - 1) {

            currentPath = currentPath[split[i]]

            continue
        } else if (i >= split.length - 1 && topic.type.includes('struct')) {
            //If last in topic (at the final path of string)- and topics type is a struct, make a folder for said struct

            createFolder(split[i], i, true)

            let finalTypes = Object.keys(nt4Client.typeLengths)
            let type = topic.type.slice(7)
            // console.log(type)

            let schemas = nt4Client.schemas
            topic.structName = topic.name + "|"
            decodeStruct(type);
            continue;
            // let currentType = type);
            function decodeStruct(type) {
                let currentSchema;

                if (schemas.get(type)) {
                    currentSchema = schemas.get(type)
                } else {
                    return
                }

                let loopStartPath = currentPath
                let loopStartName = topic.structName

                for (let [name, type] of currentSchema) {
                    currentPath = loopStartPath
                    topic.structName = loopStartName


                    if (name == "esc-esc-length-esc-esc") continue;
                    if (finalTypes.includes(type)) {

                        let nameSplitArray = topic.structName.split("/");
                        if (name == "value" && nameSplitArray.length > 1) {
                            let displayName = nameSplitArray[nameSplitArray.length - 1]
                            createButton(name.split(":")[0], i, topic.structName + "/" + name, type, displayName.split(":")[0])

                            continue
                        }
                        createButton(name.split(":")[0], i, topic.structName + "/" + name, type)

                        continue;
                    }
                    if (type.includes("enum")) {
                        createButton(name.split(":")[0], i, topic.structName + "/" + name, "enum")
                    }
                    else {
                        createFolder(name, i, true);
                        topic.structName += "/" + name
                        decodeStruct(type);
                        continue;
                    }
                }
            }
        } else {

            if (i >= split.length - 1 && !topic.type.includes('struct')) {
                if (currentPath.hasOwnProperty(split[i])) {
                    continue
                }
                //If last in topic, make the button for it, unless its a struct then it will be treated as a folder
                if (split[0] == "CameraPublisher" && split[i] == "streams") {
                    createButton("Stream", i, topic.name, "stream", split[i - 1], true)
                }

                if (split[i - 1] == "Tunables") {
                    createButton(split[i].split(":")[0], i, topic.name, "tunable")
                    continue
                }

                createButton(split[i].split(":")[0], i, topic.name)
                continue
            }
            if (split[i - 1] == "Tunables") {
                createButton(split[i].split(":")[0], i, topic.name, "chooser", false, true)
            }
            createFolder(split[i], i)
        }
    }
    function createButton(split, i, fullpath = "", topictype = topic.type, altDisplayName = false, underline = false) {
        let parentDiv
        if (i == 0) parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
        else parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))

        parentDiv.addClass(topictype + "Topic")

        let src = ""
        let typeString

        let image = $("<img>").addClass("noClick").appendTo(parentDiv)
        let h1 = $("<h1>").addClass("noClick").text(split).appendTo(parentDiv)

        if (underline) {
            h1.css("text-decoration", 'underline')
        }

        currentPath[split] = topic
        currentPath[split]["esc-esc-$-esc-esc"] = parentDiv

        let $allOf = $(parentDiv).add(image).add(h1)

        if (topictype.includes('string') || topictype.includes('char') || topictype.includes('enum')) {
            src = "TextIcon.png"
            typeString = 'string'
        }
        // else if (topic.type.includes('struct')) {
        //     src = "StructIcon.png"
        //     typeString = 'struct'
        //     // parentDiv.css("display", "none")
        // }
        else if (topictype.includes("stream")) {
            src = "StreamIcon.png"
            typeString = "stream"
        }
        else if (topictype.includes('int')) {
            src = "IntIcon.png"
            typeString = 'int'
        }
        else if (topictype.includes('double') || topictype.includes('float64')) {
            src = "DoubleIcon.png"
            typeString = 'double'
        }
        else if (topictype.includes('float')) {
            src = "FloatIcon.png"
            typeString = 'float'
        }
        else if (topictype.includes('bool')) {
            src = "BoolIcon.png"
            typeString = 'bool'
        } else if (topictype.includes("tunable")) {
            src = "TunableIcon.png"
            typeString = topic.type
        } else if (topictype.includes("chooser")) {
            src = "ChooserIcon.png"
            typeString = topic.type
        }

        if (topictype.includes("[]")) {
            src = "Array" + src
            typeString = "array" + typeString
            parentDiv.css("display", "none")

        }

        $allOf.off("click.openOutputComponents").on("click.openOutputComponents", () => {
            $(".ioComponents").css("display", "none")
            $(".editSidebar").css("display", "none")

            //If the changetopic button is pressed on an output component
            if (outputComponents.changing) {
                outputComponents.changingSidebar.css("display", "flex")

                // console.log(subscribedTopics[0])
                swapSubscriptionTopic(fullpath, topic, split.split(":")[0])

                if (altDisplayName) {
                    editComponent.currentTarget.find(".editThisName").text(altDisplayName)
                    editDataName(editComponent.currentTarget, altDisplayName)
                }

                //Sets the name and path of the sidebar
                outputComponents.changingSidebar.find(".topicShower").text(fullpath)
                outputComponents.changingSidebar.find(".nameInput").val(split.split(":")[0])

                if (altDisplayName) {
                    outputComponents.changingSidebar.find(".nameInput").find(".editThisName").text(altDisplayName)
                }

                setTimeout(() => {
                    outputComponents.changing = false
                }, 100);


            } else if (outputComponents.finding) {
                outputComponents.changingSidebar.css("display", "flex")

                $(".newGraphLineTopic").val(fullpath)
                $(".graphTopicFinderP").text(fullpath)


                setTimeout(() => {
                    outputComponents.finding = false
                }, 100);

            } else {
                if (topictype == 'tunable' || topictype == 'chooser') {
                    let inputComp$ = $(".inputComponents").children().css("display", "")
                    $(".inputComponents").css("display", 'flex')

                    let notDisplayed = 0

                    for (let i = 0; i < inputComp$.length; i++) {

                        if (inputComp$.eq(i).attr("data-type") !== typeString) {
                            inputComp$.eq(i).css("display", "none")
                            notDisplayed++
                        }

                        if (notDisplayed >= inputComp$.length) $(".inputComponents").css("display", "none");

                    }

                    $("." + topic.type + "OutputComponents").css("display", "flex")

                    if (topic.type == "boolean") {
                        $(".actionButton").css("display", "none")
                        $(".oneShotButton").css("display", "none")
                    }

                    outputComponents.tunable = true;
                }

                $("." + typeString + "OutputComponents").css("display", "flex")
            }

            //Object that holds sidebar data, set the current topic to that.
            outputComponents.topic = topic

            if (topic.type.includes("struct")) {
                // outputComponents.topic.name = fullpath
                outputComponents.fullpath = fullpath
            } else {
                outputComponents.fullpath = topic.name

            }

        })

        image.attr("src", "./js/Icons/" + src)

        return parentDiv
    }

    function createFolder(split, i, isSchema = false) {
        //creates a folder in the side bar and a object in the topic object 
        let parentDiv

        //esc-esc-$-esc-esc is the parent div, it is stored in the topic object. So if you are in a 
        //folder of a folder, the objects closest esc-esc-$-esc-esc is the closed folders jquery reference
        if (i == 0) {
            //Top level does not have a subpaths container for the folders and topic buttons
            parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
        }
        else {
            parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))
        }
        //Create the folder name and the dropdown icon
        let h2Holder = $("<div>").addClass("h2Holder").appendTo(parentDiv)
        let h2 = $("<h2>").text("▲").appendTo(h2Holder)
        if (isSchema) {
            h2.text("⮝")
        }

        let h1 = $("<h1>").text(split).appendTo(parentDiv)

        //This will be where the actual sidebar buttons are stored
        $("<div>").addClass("subPaths").appendTo(parentDiv)

        let currentTimeout

        //Click handler to expand the current 
        h1.add(h2).add(h2Holder).on("click.open", (event) => {
            let $ct = $(event.currentTarget).parent()
            // console.log($ct)
            clearTimeout(currentTimeout)
            $ct.toggleClass("openTopic")
            $ct.children(".h2Holder").children("h2").toggleClass("openArrow")

            if ($ct.hasClass("openTopic")) {
                $ct.css("max-height", ($ct.children(".subPaths").outerHeight() + vh(5) + "px"))
                currentTimeout = setTimeout(() => {
                    $ct.css("max-height", "unset")
                }, 300);
            } else {
                $ct.css("max-height", $ct.children(".subPaths").outerHeight() + vh(5) + "px")
                $ct.offset()

                $ct.css("max-height", "5vh")

            }
        })

        //Since we made a folder, this will be the container for subfolders and topic buttons
        //earlier we mentioned that esc-esc-$-esc-esc is the objects reference for the parent 
        //in topic object. 
        currentPath[split] = {
            "esc-esc-$-esc-esc": parentDiv
        }

        //Traverse down for the next loop.
        currentPath = currentPath[split]
    }
    // console.log(topicObject)

}

function swapSubscriptionTopic(fullpath, topic, newName = false) {

    //If the current topic does not have a subscription handler array, make one
    if (!subscribedTopics.hasOwnProperty(fullpath.split("|")[0])) {
        subscribedTopics[fullpath.split("|")[0]] = []
    }

    //Javascript nonsense to swap the value without referenceing. 
    let newSubscriptionReference = subscribedTopics[(editComponent.currentTarget.attr('data-topic').split("|")[0])].slice(editComponent.currentTarget.attr("data-subscriptionIndex"), parseInt(editComponent.currentTarget.attr("data-subscriptionIndex")) + 1)

    //Store the struct path for later decoding when the value is updated
    if (fullpath != "") {
        newSubscriptionReference[0].structPath = fullpath
    }

    //Move the subsciption clone to the acutal array. 
    subscribedTopics[fullpath.split("|")[0]].push(newSubscriptionReference[0])

    //Replace old handler with false
    subscribedTopics[editComponent.currentTarget.attr('data-topic').split("|")[0]][editComponent.currentTarget.attr("data-subscriptionIndex")] = false

    //Set components topic, its subscription index, and its name 
    editComponent.currentTarget.attr("data-topic", fullpath).attr("data-subscriptionindex", subscribedTopics[editComponent.currentTarget.attr('data-topic').split("|")[0]].length - 1)

    if (newName) {
        editComponent.currentTarget.find(".editThisName").text(newName)
        editDataName(newName, editComponent.currentTarget)
    }

    //If this topic currently exists on the server,
    if (nt4Client.serverTopics.get(fullpath.split("|")[0])) {
        let val = "null"
        nt4Client.subscribe([fullpath.split("|")[0]])


        //If this topic has a value, assign val to it. 
        if (nt4Client.serverTopics.get(fullpath.split("|")[0]).value) {
            val = nt4Client.serverTopics.get(fullpath.split("|")[0]).value
        }

        if (topic.type.includes("struct")) {
            //If it is struct, we must decode the js object that the struct has the value stored in
            //This sets the inital value once it changes. 
            newSubscriptionReference[0].valueHandeler(getStructValue(fullpath, val))

            if (newSubscriptionReference[0].topicChangeHandler) {
                newSubscriptionReference[0].topicChangeHandler(fullpath.split("|")[0], getStructValue(fullpath, val))
            }
        } else {
            //Else assign inital value. 
            newSubscriptionReference[0].valueHandeler(val)

            if (newSubscriptionReference[0].topicChangeHandler) {
                newSubscriptionReference[0].topicChangeHandler(fullpath.split("|")[0], val)
            }
        }

    } else if (outputComponentTypes.includes(editComponent.currentTarget.attr("data-componenttype"))) {
        nt4Client.subscribe([fullpath.split("|")[0]])
    } else {
        nt4Client.subscribe([fullpath.split("|")[0]])
        //If it does not exist on the server, put a blank string. 
        if (newSubscriptionReference[0].topicChangeHandler) {
            newSubscriptionReference[0].topicChangeHandler(fullpath.split("|")[0], "")
        }

        newSubscriptionReference[0].valueHandeler("")
    }
}

function createConditionSidebarButton(name = document.querySelector(".condition").selectedOptions[0].text, val = $(".condition").val().replaceAll(`'`, `"`), feedback = true) {
    let conditions = $(".sidebarCondition")

    for (let i = 0; i < conditions.length; i++) {
        if (val == conditions.eq(i).attr("data-value").replaceAll(`'`, `"`)) {
            return false
        }
    }

    let $sbO = $("<div>").addClass("sidebarOption").addClass("sidebarCondition").insertBefore(".conditionAdder").attr("data-name", name).attr("data-value", val)
    $("<p>").text(name).appendTo($sbO).css("max-width", "calc(100cqw - 0.25vh - 0.25vh - 4vh - 4vh)")

    if (feedback) {
        let currentConditions = JSON.parse($(editComponent.currentTarget).attr("data-recordConditions"))

        try {
            currentConditions.push(JSON.parse(val))

        }
        catch (Err) {
            console.error(Err)
            return false
        }
        $(editComponent.currentTarget).attr("data-recordConditions", JSON.stringify(currentConditions))
    }


    $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {

        let currentConditions = JSON.parse(editComponent.currentTarget.attr("data-recordConditions"))

        let removeIndex;

        for (let i = 0; i < currentConditions.length; i++) {
            if (currentConditions[i] == $(event.currentTarget).attr("data-value")) {
                removeIndex = i

                break;
            }
        }

        currentConditions.splice(removeIndex, 1)

        editComponent.currentTarget.attr("data-recordConditions", JSON.stringify(currentConditions))

        $(event.currentTarget).parent().remove()
    }
    )

    return false
}

function bindTopicFinder() {
    $(".graphTopicFinder").off("pointerdown.changeTopic").on("pointerdown.changeTopic", () => {
        outputComponents.finding = true

        $(".typeHiddenTopic").removeClass("typeHiddenTopic");

        let currentlyNonAllowedTypes = nonSupportedTypes[editComponent.currentTarget.attr("data-componentType")]
        // console.log(currentlyNonAllowedTypes)
        if (currentlyNonAllowedTypes) {
            for (let i = 0; i < currentlyNonAllowedTypes.length; i++) {
                $("." + currentlyNonAllowedTypes[i] + "Topic").addClass("typeHiddenTopic")
            }
        }


        outputComponents.changingSidebar = $("." + editComponent.valueType + "Sidebar")
        outputComponents.changingSidebar.css("display", "none")
        $(".outputTopics").css("display", "flex")
    })
}


function createGraphTopicSidebarButton(topic = $(document.querySelector(".newGraphLineTopic")).val(), width = $(document.querySelector(".newGraphLineWidth")).val(), color = document.querySelector(".newGraphLineHex").value, feedback = true) {
    let topics = $(".sidebarTopics")

    for (let i = 0; i < topics.length; i++) {
        if (topic == topics.eq(i).attr("data-topic").replaceAll(`'`, `"`)) {
            return false
        }
    }

    let $sbO = $("<div>").addClass("sidebarOption").addClass("sidebarTopics").insertBefore(".graphAdder").attr("data-topic", topic).attr("data-color", color)
    let hex = $("<input>").val(color).addClass("hex").attr("type", "color").attr("name", "GraphActiveEdit").appendTo($sbO)
    $("<p>").text(topic).appendTo($sbO).css("max-width", "calc(95cqw - 0.25vh - 0.25vh - 4vh - 4vh)")
    let widthPut = $("<input>").addClass("numberTextInput").val(width).attr("placeholder", "width").appendTo($sbO).css("max-width", "5cqw")



    if (feedback) {
        let graphManager = globalGraphRef[editComponent.currentTarget.attr("data-graphkey")]

        graphManager.renderer.createLine(topic, color, width)

        setupNewGraphHandeler(graphManager, editComponent.currentTarget, topic)

        let topicArray = JSON.parse(editComponent.currentTarget.attr("data-topics"))
        topicArray.push(topic)
        editComponent.currentTarget.attr("data-topics", JSON.stringify(topicArray))

        let lineProperties = JSON.parse(editComponent.currentTarget.attr("data-lineProperties"))
        lineProperties[topic] = {}
        lineProperties[topic]["width"] = width
        lineProperties[topic]["color"] = color
        editComponent.currentTarget.attr("data-lineProperties", JSON.stringify(lineProperties))

        subscribeOrQueue(topic)

    }

    widthPut.off("input.changeWidth").on("input.changeWidth", (event) => {
        let $ct = $(event.currentTarget)
        let eDCT = editComponent.currentTarget
        let val = $ct.val()
        let graphManager = globalGraphRef[eDCT.attr("data-graphkey")]
        let topic = $ct.parent().attr("data-topic")
        graphManager.renderer.editLineWidth(topic, val)

        let graphLineProperties = JSON.parse(eDCT.attr("data-lineProperties"))

        graphLineProperties[topic].width = val

        eDCT.attr("data-lineProperties", JSON.stringify(graphLineProperties))
    })


    hex.off("input.changeCol").on("input.changeCol", (event) => {
        let $ct = $(event.currentTarget)
        let eDCT = editComponent.currentTarget
        let val = $ct.val()
        let graphManager = globalGraphRef[eDCT.attr("data-graphkey")]
        let topic = $ct.parent().attr("data-topic")
        graphManager.renderer.editLineColor(topic, val)

        let graphLineProperties = JSON.parse(eDCT.attr("data-lineProperties"))

        graphLineProperties[topic].color = val

        eDCT.attr("data-lineProperties", JSON.stringify(graphLineProperties))
    })

    $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {
        let graphManager = globalGraphRef[editComponent.currentTarget.attr("data-graphkey")]
        graphManager.renderer.removeLine(topic)

        let topicArray = JSON.parse(editComponent.currentTarget.attr("data-topics"))
        let topicArrayIndex = topicArray.indexOf(topic);

        let indexes = JSON.parse(editComponent.currentTarget.attr("data-subscriptionIndexes"))
        if (topicArrayIndex !== -1) {
            subscribedTopics[topicArray[topicArrayIndex].split("|")[0]][indexes[topicArray[topicArrayIndex]]] = false;
        }

        delete indexes[topicArray[topicArrayIndex]]
        editComponent.currentTarget.attr("data-subscriptionIndexes", JSON.stringify(indexes))

        topicArray = topicArray.filter(item => item !== topic);
        editComponent.currentTarget.attr("data-topics", JSON.stringify(topicArray))

        let lineProperties = JSON.parse(editComponent.currentTarget.attr("data-lineProperties"))
        delete lineProperties[topic]
        editComponent.currentTarget.attr("data-lineProperties", JSON.stringify(lineProperties))




        $sbO.remove()
    }

    )

    return false
}


function createColorCoderSidebarButton(value = $(document.querySelector(".newCoderValue")).val(), color = document.querySelector(".newHexCoder").value, feedback = true) {
    let conditions = $(".sidebarCondition")

    for (let i = 0; i < conditions.length; i++) {
        if (value == conditions.eq(i).attr("data-value").replaceAll(`'`, `"`)) {
            return false
        }
    }

    let $sbO = $("<div>").addClass("sidebarOption").addClass("sidebarCondition").insertBefore(".coderAdder").attr("data-value", value).attr("data-color", color)
    $("<div>").css("background-color", color).addClass("colorCoderSidebarDotShower").appendTo($sbO)
    $("<p>").text(value).appendTo($sbO).css("max-width", "calc(100cqw - 0.25vh - 0.25vh - 4vh - 4vh)")

    if (feedback) {
        let currentConditions = JSON.parse($(editComponent.currentTarget).attr("data-keys"))

        delete currentConditions["else"]
        try {
            currentConditions[value] = color

        }
        catch (Err) {
            console.error(Err)
            return false
        }

        currentConditions["else"] = "#000000"

        $(editComponent.currentTarget).attr("data-keys", JSON.stringify(currentConditions))

        $(editComponent.currentTarget).find(".colorCoderValue").css("background-color", generateCssIfStatement("--data-value", currentConditions))
    }


    $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {

        let currentConditions = JSON.parse(editComponent.currentTarget.attr("data-keys"))

        let removeIndex;

        for (let i = 0; i < currentConditions.length; i++) {
            if (currentConditions[i] == $(event.currentTarget).attr("data-value")) {
                removeIndex = i

                break;
            }
        }

        delete currentConditions[$(event.currentTarget).parent().attr("data-value")]

        editComponent.currentTarget.attr("data-keys", JSON.stringify(currentConditions))

        $(event.currentTarget).parent().remove()

        $(editComponent.currentTarget).find(".colorCoderValue").css("background-color", generateCssIfStatement("--data-value", currentConditions))

    }

    )

    return false
}

function setExampleMeter(min = 0, max = 100, low = "", high = "", optimum = "") {
    let meter = $(".exampleMeter")

    let yellow = "#FEB902"
    let red = "#D83B01"

    meter.empty()

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
        optimum = ((max - min) / 2) + min
    }

    // console.log(min, max, range)

    let division1 = $("<div>").addClass("exampleMeterDivision").appendTo(meter);
    let division2 = $("<div>").addClass("exampleMeterDivision").appendTo(meter);
    let division3 = $("<div>").addClass("exampleMeterDivision").appendTo(meter);

    if (low && high == "") {
        division3.css("display", "none")

        let division1Width = ((low - min) / range) * 100


        division1.css("width", division1Width + "%")
        division2.css("width", 100 - division1Width + "%")

        if (optimum < low) {
            division2.css("background-color", yellow)
        } else {
            division1.css("background-color", yellow)
        }

    }
    if (low == "" && high) {
        division3.css("display", "none")

        let division1Width = ((high - min) / range) * 100


        division1.css("width", division1Width + "%")
        division2.css("width", 100 - division1Width + "%")

        if (optimum < high) {
            division2.css("background-color", yellow)
        } else {
            division1.css("background-color", yellow)
        }

    }
    if (low && high) {
        if (high < low) {

            division3.css("display", "none")

            let division1Width = ((low - min) / range) * 100

            division1.css("width", division1Width + "%")
            division2.css("width", 100 - division1Width + "%")

            if (optimum < low) {
                division2.css("background-color", red)
            } else {
                division1.css("background-color", red)

            }
            return
        }

        let division1Width = ((low - min) / range) * 100
        let division2Width = (((high - low)) / range) * 100
        let division3Width = 100 - division2Width - division1Width

        division1.css("width", division1Width + "%")
        division2.css("width", division2Width + "%")
        division3.css("width", division3Width + "%")

        if (optimum < low) {
            division2.css("background-color", yellow)
            division3.css("background-color", red)
            return
        }
        if (optimum < high) {
            division1.css("background-color", yellow)
            division3.css("background-color", yellow)
            return
        }
        division1.css("background-color", red)
        division2.css("background-color", yellow)

    }

}

function editDataName(name, component) {
    let nameEditor = component;
    if (!component.hasClass("editThisDataName")) {
        nameEditor = component.find("editThisDataName")
    }

    if (name !== "") {
        nameEditor.attr("data-name", name)
    } else {
        nameEditor.removeAttr("data-name")
    }

    return component
}

function getDataName(component) {
    let nameGetter = component;
    if (!component.hasClass("editThisDataName")) {
        nameGetter = component.find("editThisDataName")
    }

    return nameGetter.attr("data-name")
}