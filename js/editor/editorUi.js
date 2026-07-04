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

import {outputComponents, createSideTab, multiSwitchButtonSet, toastMessage} from "../ui.js"
import {createDefaultOf, defaultSimilarOptions, setSimilarOptions, addButtonToAnimate,createDropdown, createOptGroup} from "./components/components.js"
import {tabGrid, setGridInput, setCornerBorder, clientDragHandler, addToCurrentDrag, findEndOffset} from "./grid.js"
import {topicObject, nt4Client, getStructValue, subscribedTopics} from "../coms.js"
import {vh} from "../../lib/util.js"

let nonSupportedTypes = {
    "basicSubscription": false,
    "basicLogger": false,
    "numberLine": ["string", "boolean"],
    "radialGauge": ["string", "boolean"],
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


// Binders

function bindEditOpener() {
    $(".editTabs").on("click", () => {
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
        $(".gridSquare").toggleClass("gridSquareEditing")

        setTimeout(() => {
            $("#connect").css("pointer-events", "")

        }, 1000);

        if ($(".editTabs").hasClass("editingTabs")) {

            $("body").on("pointermove.gridReact ", (event) => {
                if ($(".gridSquare").length > 600) {
                    $(".gridSquare").css("width", "95%").css("height", "95%")
                    return
                }
                let $eq = $(".gridSquare").eq(0)

                let clientDrag = clientDragHandler(event, $eq)

                //jquery ommited for preformance reasons
                let elements = document.getElementsByClassName("gridSquare")
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
            $("*").removeClass("removeShake").off("pointerdown.remove").off("pointermove.dragComponent")//.off("pointerdown.editHandler")
            $(".trashCan").removeClass("trashActive")

            $("body").off("pointermove.gridReact")

            if ($(".connectionText").text() == "Connected") {
                // window.location.reload();
            }

        }

    })

}

function bindComponentAdders() {
    $(".ioComponents").children().off().on("pointerdown.addComponent ", (event) => {
        $("*").removeClass("removeShake").off("pointerdown.remove")
        $(".trashCan").removeClass("trashActive")



        let componentType = $(event.currentTarget)[0].classList[0];

        // toastMessage(componentType)

        let jQueryReference

        if ($(event.currentTarget).parent().hasClass("outputComponents")) {
            jQueryReference = createDefaultOf(componentType, ".dashboardHolder", outputComponents.fullpath)
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

        let elements = $($(".currentTab").attr("data-page")).children()

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
            $(event.currentTarget).remove()
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
            val.removeAttr("disabled")
        } else {
            val.attr("disabled", "disabled").val("")
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
    $(".optionAdder").on("submit.addDiv", () => {
        let $sbO = $("<div>").addClass("sidebarOption").insertBefore(".optionAdder").attr("data-name", $(".newOptionName").val()).attr("data-value", $(".newOptionValue").val()).attr("data-hex", $(".hex").val()).css("border-color", $(".hex").val())
        $("<button>").addClass("sideBarEmojiButton").addClass("hamburger").text("☰").appendTo($sbO)
        $("<p>").text($(".newOptionName").val() + ":" + $(".newOptionValue").val()).appendTo($sbO)
        $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {
            $(event.currentTarget).parent().remove()

        }
        )

        $(".newOptionName").val("")
        $(".newOptionValue").val("")
        addOptionDragHandler($sbO)

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

function bindComponentRepositioner() {
    $(".reposistionComponent").on("pointerdown.reposComponent", (event) => {
        $(".sideBar").off("pointerup.setEdit pointermove.setEdit")

        setCornerBorder(0, 0, 0, 0, 0, true)
        let currentDrag = clientDragHandler(event, editComponent.currentTarget)
        // console.log(editComponent.currentTarget.attr("data-componentType"))
        addToCurrentDrag(editComponent.currentTarget, currentDrag.x, currentDrag.y, editComponent.currentTarget.attr("data-componentType"))
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

        console.log(name, tab)

        let $ct = $("<div>").addClass("tab")
            .addClass("tabsEditActivated")
            .css("background-color", $(".fullScreen").css("background-color"))
            .addClass("tabConnection")
            .addClass("userTab")
            .addClass("pTAB" + tab)
            .attr("data-page", "." + tab)
            .text(name)
            .insertBefore(".tabCreator")

        createSideTab(name, "." + tab)

        // <div class="uiTestTab page" style="display: grid;">/
        bindEditorResetter($ct)

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
        $(".inputComponents").css("display", "flex")
        $(".sideBarUnderline").removeClass("sideBarUnderline")
        $(".openInput").addClass("sideBarUnderline")
    })
}

//Needs refactoring
function bindEditMenu(element, valueType) {

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
        } else if (inputBeingBound.attr("data-editing") == "data-hideNav") {
            bindHideNav(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-recordconditions") {
            bindRecordConditions(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") !== "na") {
            bindOtherData(inputBeingBound)
        }

    }

    if (valueType == "double") {
        let min = $(".doubleSidebar").find(".min")
        let max = $(".doubleSidebar").find(".max")
        let val = $(".doubleSidebar").find(".value")

        if (min.val() != "" && max.val() != "") {
            val.removeAttr("disabled")
        } else {
            val.attr("disabled", "disabled").val("")
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
        }
        if (editComponent.currentTarget.children(".editThisName").length > 0) {
            nameInputText = editComponent.currentTarget.children(".editThisName").text()
        }


        inputBeingBound.val(nameInputText).off(`focus.selectText`).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

        inputBeingBound.off("input.typing  blur.typing").on("input.typing blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget
            $comp.children(".buttonWord").remove()

            if ($comp.children(".editThisName").length > 0) {
                $comp.children(".editThisName").text($ct.val())
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
        } else if (editComponent.currentTarget.hasClass("axis") || editComponent.currentTarget.hasClass("verticalAxis")) {
            boundEditing = editComponent.currentTarget.children(".axisKnob, .verticalAxisKnob").attr(inputBeingBound.attr('data-editing'))
        } else if (editComponent.currentTarget.hasClass("numberLine")) {
            if (inputBeingBound.hasClass("max")) {
                if (editComponent.currentTarget.attr("data-deriveAttributes") == "true") {

                } else {
                    boundEditing = editComponent.currentTarget.find(".numberLineHasValue").eq(0).attr(inputBeingBound.attr("data-editing"))
                    let meter = editComponent.currentTarget.find(".numberLineHasValue").eq(0)
                    setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))
                }
            } else if (inputBeingBound.hasClass("min")) {
                if (editComponent.currentTarget.attr("data-deriveAttributesMin") == "true") {

                } else {
                    boundEditing = editComponent.currentTarget.find(".numberLineHasValue").eq(0).attr(inputBeingBound.attr("data-editing"))
                    let meter = editComponent.currentTarget.find(".numberLineHasValue").eq(0)
                    setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))
                }
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
                $comp.attr("data-" + $ct.attr('data-editing'), $ct.val())
            } else if (editComponent.currentTarget.hasClass("axis") || editComponent.currentTarget.hasClass("verticalAxis")) {

                $comp.children(".axisKnob, .verticalAxisKnob").attr($ct.attr('data-editing'), $ct.val())
            } else if ($comp.hasClass("numberLine")) {
                if (inputBeingBound.attr("data-editing") == "max") {
                    if ($ct.val().length == 0) {
                        $comp.attr("data-deriveAttributes", "true")
                        $comp.find(".numberLineHasValue").attr("max", "0")
                        return
                    } else {
                        $comp.attr("data-deriveAttributes", "false")
                    }
                }
                if (inputBeingBound.attr("data-editing") == "min") {
                    if ($ct.val().length == 0) {
                        $comp.attr("data-deriveAttributesMin", "true")
                        $comp.find(".numberLineHasValue").attr("min", "0")
                        return
                    } else {
                        $comp.attr("data-deriveAttributesMin", "false")
                    }
                }



                let meter = $comp.find(".numberLineHasValue")
                meter.attr($ct.attr("data-editing"), $ct.val())

                setExampleMeter(meter.attr("min"), meter.attr("max"), meter.attr("low"), meter.attr("high"), meter.attr("optimum"))

                if ($ct.val().length == 0) {
                    meter.removeAttr($ct.attr("data-editing"))
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



            if (editComponent.currentTarget.hasClass("basicLogger") || editComponent.currentTarget.hasClass("numberLine") || editComponent.currentTarget.hasClass("radialGauge")) {
                editComponent.currentTarget.css("border-color", $ct.val()).attr("data-color", $ct.val())
                editComponent.currentTarget[0].style.setProperty("--accent", $ct.val());

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
            } else if ($(event.target).val() == "X-Axis") {
                editComponent.currentTarget.removeClass("verticalAxis").addClass("axis").attr("data-componentType", "axis")
                editComponent.currentTarget.find(".verticalAxisKnob").removeClass("verticalAxisKnob").addClass("axisKnob")

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
            } else if ($(event.target).val() == "WebM") {
                editComponent.currentTarget.attr("data-videoFormat", "WebM")
            }
        })
    }


    function bindRecordConditions() {
        if (editComponent.currentTarget.hasClass("cameraComponent")) {

            let conditions = JSON.parse(editComponent.currentTarget.attr("data-recordconditions"));
            $(".sidebarCondition").remove();

            for (let i = 0; i < conditions.length; i++) {
                console.log(conditions, conditions[i], JSON.stringify(conditions[i]), recordMap, recordMap.get(JSON.stringify(conditions[i])))
                createConditionSidebarButton(recordMap.get(JSON.stringify(conditions[i])), JSON.stringify(conditions[i]), false)
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
                if (JSON.parse(editComponent.currentTarget.attr("data-value"))) {
                    multiSwitchButtonSet(inputBeingBound, "True")
                    editComponent.currentTarget.attr("data-initialvalue", "true")
                } else {
                    multiSwitchButtonSet(inputBeingBound, "False")
                    editComponent.currentTarget.attr("data-initialvalue", "false")

                }
            } else {
                if (JSON.parse(editComponent.currentTarget.attr("data-initialvalue"))) {
                    multiSwitchButtonSet(inputBeingBound, "True")
                } else {
                    multiSwitchButtonSet(inputBeingBound, "False")
                }
            }
        }, 1);

        inputBeingBound.find(".multiSwitchButton").off("pointerdown.setInitial").on("pointerdown.setInitial", (event) => {
            let oldBG = editComponent.currentTarget.css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')

            if ($(event.target).val() == "False") {
                editComponent.currentTarget.css("background-color", oldBG + ", 0)").removeClass("toggledOn").attr("data-value", "false").attr("data-initialvalue", "false")
            } else if ($(event.target).val() == "True") {
                editComponent.currentTarget.css("background-color", oldBG + ", 0.6)").addClass("toggledOn").attr("data-value", "true").attr("data-initialvalue", "true")
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

        $(".sideBar").off("pointerup.setEdit pointermove.setEdit").on("pointerup.setEdit pointermove.setEdit", () => {
            bindStrings(inputBeingBound)

        })

        $(".optionAdder").off("submit.setComponent").on("submit.setComponent", () => {
            setTimeout(() => {
                bindStrings(inputBeingBound)

            }, 1);
            return false
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

        //defaults selection to all text for easy deletion
        inputBeingBound.val(boundEditing).on(`focus.selectText`, (event) => setTimeout(() => $(event.currentTarget)[0].setSelectionRange(0, $(event.currentTarget).val().length), 100))

        inputBeingBound.off("input.typing blur.typing").on("input.typing blur.typing", (event) => {
            let $ct = $(event.currentTarget)
            let $comp = editComponent.currentTarget

            $comp.attr($ct.attr('data-editing'), $ct.val())
        })
    }

    

    function bindStrings(inputBeingBound) {
        let eDCT = editComponent.currentTarget
        let sidebarOptions = inputBeingBound.children(".sidebarOption")
        let componentsOptions = []

        for (let j = 0; j < sidebarOptions.length; j++) {
            let newOption = {}
            newOption.name = sidebarOptions.eq(j).attr("data-name")
            newOption.value = sidebarOptions.eq(j).attr("data-value")
            newOption.color = sidebarOptions.eq(j).attr("data-hex")
            componentsOptions.push(newOption)
        }

        // if (componentsOptions.length < 1) return

        let newComponent
        // console.log(JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0)
        // console.log(JSON.parse(eDCT.attr("data-persist")))
        // console.log(eDCT)

        if (editComponent.currentTarget.hasClass("buttonOptGroup")) {

            newComponent = createOptGroup(eDCT.attr("data-topic"), $(".currentTab").attr("data-page"), eDCT.attr("data-color"), JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions")), JSON.parse(eDCT.attr("data-persist"))).div
                .css("grid-area", eDCT.css("grid-area"))
                .attr("data-row", eDCT.attr("data-row"))
                .attr("data-column", eDCT.attr("data-column"))
                .attr("data-endRow", eDCT.attr("data-endRow"))
                .attr("data-endColumn", eDCT.attr("data-endColumn"))
                .attr("data-componentOptions", JSON.stringify(componentsOptions))

        } else {
            newComponent = createDropdown(eDCT.attr("data-topic"), $(".currentTab").attr("data-page"), eDCT.attr("data-color"), JSON.parse(eDCT.attr("data-persist")) ? eDCT.attr("data-index") : 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions")), JSON.parse(eDCT.attr("data-persist"))).div
                .css("grid-area", eDCT.css("grid-area"))
                .attr("data-row", eDCT.attr("data-row"))
                .attr("data-column", eDCT.attr("data-column"))
                .attr("data-endRow", eDCT.attr("data-endRow"))
                .attr("data-endColumn", eDCT.attr("data-endColumn"))
                .attr("data-componentOptions", JSON.stringify(componentsOptions))
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
            console.log(currentlyNonAllowedTypes)
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

        outputComponents.changing = false;

        $(".typeHiddenTopic").removeClass("typeHiddenTopic")

        $("." + $(".sideBarUnderline").attr("data-sidebarClass")).css("display", "flex")

        $(".currentDrag").remove()
        $(".feauxComponent").remove()
        $("*").off("pointermove.dragComponent").off("pointerup.dragComponent").off("pointerdown.dragComponent")
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

export function addEditHandler(element, valueType, specificClass = false, specificHideClass = false) {
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

            $(".allComponentOptions").css("display", "")
            $(".ioComponents").css("display", "none")
            $(".specificComponent").css("display", "none")
            $(".specificHideComponent").css("display", "")
            $(".editSidebar").css("display", "none")

            if (specificClass) {
                $(specificClass).css("display", "")
            }

            if (specificHideClass) {
                $(specificHideClass).css("display", "none")
            }

            $(".sideBarNav").children()

            let startString = element.attr("data-componentType")

            startString = startString.charAt(0).toUpperCase() + startString.slice(1)

            $(".addButtons").css("display", "none")
            $(".editNavButtons").css("display", "")
            $(".editNavName").text(startString)

            bindEditMenu($ct, valueType, specificClass)

            let gridPoses = findEndOffset(element.attr('data-row'), element.attr('data-column'), element.attr('data-endRow'), element.attr('data-endColumn'))

            setCornerBorder(gridPoses.row, gridPoses.column, gridPoses.endRow, gridPoses.endColumn, $(".currentTab").attr("data-page"), true)

            $("." + valueType + "Sidebar").css("display", 'flex')
        }, 10);

    })
}

//Init

export function initEditor() {
    bindEditOpener();
    bindComponentAdders();
    bindTrashCan()
    bindMinMaxHandlers()
    bindConditionalHandlers()
    bindComponentRepositioner();
    bindComponentFillOption();
    bindSidebarNav();
    handleTabDrag();
    handleOptionDrag()
    bindOptionAdder();
    bindTabCreator();
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
    if (topic.type.includes("struct") && !schemasPassed) return;
    let split = topic.name.split("/")
    split.shift();

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
 
            createFolder(split[i], i,true)

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
                    if(type.includes("enum")){
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
                //If last in topic, make the button for it, unless its a struct then it will be treated as a folder
                if (split[0] == "CameraPublisher" && split[i] == "streams") {
                    createButton("Stream", i, topic.name, "stream", split[i - 1])
                }

                createButton(split[i].split(":")[0], i, topic.name)
                continue
            }

            createFolder(split[i], i)
        }
    }
    function createButton(split, i, fullpath = "", topictype = topic.type, altDisplayName = false) {
        let parentDiv
        if (i == 0) parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
        else parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))

        parentDiv.addClass(topictype + "Topic")

        let src = ""
        let typeString

        let image = $("<img>").addClass("noClick").appendTo(parentDiv)
        let h1 = $("<h1>").addClass("noClick").text(split).appendTo(parentDiv)
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

                console.log(subscribedTopics[0])

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
                editComponent.currentTarget.attr("data-topic", fullpath).attr("data-subscriptionindex", subscribedTopics[editComponent.currentTarget.attr('data-topic').split("|")[0]].length - 1).find(".editThisName").text(split.split(":")[0])

                if (altDisplayName) {
                    editComponent.currentTarget.find(".editThisName").text(altDisplayName)
                }

                //If this topic currently exists on the server,
                if (nt4Client.serverTopics.get(fullpath.split("|")[0])) {
                    let val = "null"

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

                } else {
                    //If it does not exist on the server, put a blank string. 
                    if (newSubscriptionReference[0].topicChangeHandler) {
                        newSubscriptionReference[0].topicChangeHandler(fullpath.split("|")[0], "")
                    }

                    newSubscriptionReference[0].valueHandeler("")
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


            } else {
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

    function createFolder(split, i, isSchema=false) {
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
        optimum = max / 2
    }

    console.log(min, max, range)

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


