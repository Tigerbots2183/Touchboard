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

import { NT4_Client } from "../lib/nt4.js";
import { topicToSidebar } from "./editor/editorUi.js";
import { setSelectOpener } from "./ui.js";
import { MathUtils } from "../lib/util.js";
import { renderFrame, isFrameScheduled} from "./renderer.js";

let sidebaredStructs = []

export let connectionDate = "";

export let topicObject = {
    "esc-esc-$-esc-esc": $(".outputTopics")
}



export let subscribedTopics = {
    //"Topic": [{jQueryReference :$, parentRefernce: $, valueHandler: function()/false}]
}

export let nt4Client = new NT4_Client(localStorage.getItem(getHtmlFileName() + "teamNumber"),
    "Touchboard" + Math.random().toString().slice(2),
    topicAnnounce,
    doNothing,
    handleNewData,
    onConnectCb,
    onDisconnectCb
);

export function getHtmlFileName() {
    let path = window.location.pathname;
    let segments = path.split('/'); // Split the path by the '/' character
    let fileName = segments.pop();
    // Get the last element of the array, which is the filename
    return fileName.slice(0, -5);
}

function topicAnnounce(topic) {
    topicToSidebar(topic)
}

function doNothing() { }


function handleNewData(topic, timestamp, value) {
    //Protos are not supported, and structschemas show no useful data to user. 
    if (topic.type.includes("proto") || topic.type.includes("structschema")) return

    // So most topics are sent to the sidebar when they are created, but we cannot decode structs
    // without their values being sent, so if the topic is a struct, and the array of sidebared structs
    // does not have the topic, then send the topic to the sidebar.
    if (topic.type.includes("struct") && !sidebaredStructs.includes(topic.name.split("|")[0])) {
        if (topic.type.includes("[]")) return;

        topicToSidebar(topic, true)
        sidebaredStructs.push(topic.name.split("|")[0])
    }

    let topicSplit = topic.name.split("/")

    topicSplit.shift()

    let currentPath = topicObject

    for (let i = 0; i < topicSplit.length; i++) {
        if (i >= topicSplit.length - 1) {
            // console.log(currentPath, topicName, value)

            try {
                currentPath[topicSplit[i]]["value"] = value
            } catch {
                console.log(topic)
            }

            continue
        }

        if (currentPath[topicSplit[i]]) {
            currentPath = currentPath[topicSplit[i]]
        }
    }

    //Random data that the user shouldnt see usually has . in it
    if (topic.name.includes(".")) return

    //If the value is currently used by a component, send the value to the component handler.
    if (subscribedTopics.hasOwnProperty(topic.name)) {
        let foundValue = value;

        for (let i = 0; i < subscribedTopics[topic.name].length; i++) {
            if (!subscribedTopics[topic.name][i]) continue; //Pass if value is null
            // console.log(subscribedTopics[topic.name][i])

            if (topic.type.includes("struct")) {
                foundValue = getStructValue(subscribedTopics[topic.name][i].structPath, value)
                console.warn(topic.name, value, foundValue)
            }

            subscribedTopics[topic.name][i].valueHandeler(foundValue, timestamp) // Send value to topic handler
        }
    }

    if (!isFrameScheduled.scheduled) {
        window.requestAnimationFrame(renderFrame);
        isFrameScheduled.scheduled = true;
    }

}

export function getStructValue(structTopic, value) {
    //Structtopic must have the full path, with the stuct path following the "|"
    let path = structTopic.split("|")[1];
    let pathArr = path.split("/")


    for (let i = 0; i < pathArr.length; i++) {
        let key = pathArr[i];
        if (value.hasOwnProperty(key)) {
            value = value[key]
        }
    }

    return value.value;
}

function onConnectCb() {
    //on everything this is NOT on callback

    setTimeout(() => {
        setInterval(() => {
            // console.log(nt4Client.serverTopics)
            // console.log(nt4Client.schemas)
        }, 1000)

        setSelectOpener()

        $(".tabConnection").removeClass("tabConnection")

        $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

        $("html").css("background-color", "rgb(32, 32, 32)")
        $(".tab").css("background-color", "rgb(12, 12, 12)")
        $(".addTab").css("background-color", "rgb(32, 32, 32)")
        $(".tabManager").css("background-color", "rgb(32, 32, 32)")
        $(".tabCreator").css("background-color", "rgb(32, 32, 32)")

        $(".tabNav").css("background-color", "rgb(12, 12, 12)")
        $(".currentTab").css("background-color", "rgb(32, 32, 32)")
        nt4Client.publishTopic("/touchboard/posePlotterFinalString", "string")

        nt4Client.addSample("/touchboard/posePlotterFinalString", localStorage.getItem(getHtmlFileName() + "currentPath"))

        nt4Client.publishTopic("/touchboard/musicIsFinished", "boolean")

        nt4Client.addSample("/touchboard/musicIsFinished", true)

        nt4Client.subscribe([""], true, true)

        const now = new Date(); // Creates a date object with the current date and time

        const year = now.getFullYear();   // e.g., 2024
        const month = now.getMonth() + 1; // getMonth() is 0-indexed (0=Jan), so add 1
        const day = now.getDate();        // Day of the month (1-31)
        const hours = now.getHours();      // 24-hour format (0-23)
        const minutes = now.getMinutes();  // 0-59
        const seconds = now.getSeconds();  // 0-59

        connectionDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

        let $uiElements = $(".page").children().add($(".btnHolder").children())

        for (let i = 0; i < $uiElements.length; i++) {
            if ($uiElements.eq(i).attr("data-topic")) {
                if ($uiElements.eq(i).hasClass("basicSubscription")) {
                    continue
                }

                nt4Client.publishTopic("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-type"))
                if ($uiElements.eq(i).attr("data-value")) {
                    if ($uiElements.eq(i).attr("data-type") === "string") {
                        nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))
                        // console.log($uiElements.eq(i).attr("data-value"))
                    } else if ($uiElements.eq(i).attr("data-type") === "double") {
                        nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), parseFloat($uiElements.eq(i).attr("data-value")))
                        console.log($uiElements.eq(i).attr("data-value"))
                    } else {
                        nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), JSON.parse($uiElements.eq(i).attr("data-value")))

                    }
                }
            }
        }
        let editTabs = $(".editTabs")
        for (let i = 0; i < $uiElements.length; i++) {
            if ($uiElements.eq(i).hasClass("actionButton")) {
                $($uiElements.eq(i)).on(" pointerdown", () => {
                    if (editTabs.hasClass("editingTabs")) return
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                    $uiElements.eq(i).attr("data-value", "true")
                }).on("pointerup   mouseleave touchcancel", () => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), false)
                    $uiElements.eq(i).attr("data-value", "false");
                })
            } else if ($uiElements.eq(i).hasClass("toggleButton")) {
                $uiElements.eq(i).on(" pointerdown", () => {
                    if (editTabs.hasClass("editingTabs")) return

                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), !(JSON.parse($uiElements.eq(i).attr("data-value"))))
                    $uiElements.eq(i).toggleClass("toggledOn")
                    console.log($uiElements.eq(i));
                    let oldBG = $uiElements.eq(i).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')

                    if ($uiElements.eq(i).hasClass("toggledOn")) {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0.6)")
                    } else {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0)")

                    }
                    $uiElements.eq(i).attr("data-value", JSON.stringify(!(JSON.parse($uiElements.eq(i).attr("data-value")))))
                })
            } else if ($uiElements.eq(i).hasClass("oneShotButton")) {

                nt4Client.subscribe(["/touchboard/" + $uiElements.eq(i).attr("data-topic")])
                $uiElements.eq(i).on(" pointerdown", () => {
                    if (editTabs.hasClass("editingTabs")) return

                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                })
            } else if ($uiElements.eq(i).hasClass("numberComponent")) {
                // if ($uiElements.eq(i).attr('data-persist') == "true") {
                //     if (localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic")) == null) {
                //         localStorage.setItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))
                //     } else {
                //         let currentPersitant = localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"));
                //         $uiElements.eq(i).attr("data-value", currentPersitant)
                //         $uiElements.eq(i).children(".numberTextInput").attr("value", currentPersitant)
                //     }
                // }

                $uiElements.eq(i).children(".numberPlus").on("pointerdown ", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let $ct = $(event.currentTarget)
                    let max = parseFloat($ct.parent().attr("data-max"))
                    let step = parseFloat($ct.parent().attr("data-step"))
                    let $numberTarget = $ct.parent().children(".numberTextInput")
                    let currentVal = MathUtils.add($numberTarget.val(), step)
                    if (currentVal <= max) {
                        $numberTarget.val(currentVal)
                        $ct.parent().attr("data-value", $numberTarget.val())
                        nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                        // if ($ct.parent().attr('data-persist') == "true") {
                        //     localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $numberTarget.val())
                        // }
                    }
                })
                $uiElements.eq(i).children(".numberMinus").on("pointerdown ", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let $ct = $(event.currentTarget)
                    let min = parseFloat($ct.parent().attr("data-min"))
                    let step = parseFloat($ct.parent().attr("data-step"))
                    let $numberTarget = $ct.parent().children(".numberTextInput")
                    let currentVal = MathUtils.subtract($numberTarget.val(), step)
                    if (currentVal >= min) {
                        $numberTarget.val(currentVal)
                        $ct.parent().attr("data-value", $numberTarget.val())
                        nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                        // if ($ct.parent().attr('data-persist') == "true") {
                        //     localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $numberTarget.val())
                        // }
                    }
                })
                $uiElements.eq(i).children(".numberTextInput").on("blur", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let $ct = $(event.currentTarget)
                    let max = parseFloat($ct.parent().attr("data-max"))
                    let min = parseFloat($ct.parent().attr("data-min"))

                    if ($ct.val() > max) {
                        $ct.val(max)
                    } else if ($ct.val() < min) {
                        $ct.val(min)
                    }
                    $ct.parent().attr("data-value", $ct.val())
                    nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                    // if ($ct.parent().attr('data-persist') == "true") {
                    //     localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $ct.val())
                    // }
                })
            } else if ($uiElements.eq(i).hasClass("select")) {

                $uiElements.eq(i).children(".selectOption").on("pointerdown", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value")).css("background-color", $ct.attr("data-hex") + "6b").attr("data-index", $ct.attr("data-index"))
                    $uiElements.eq(i).children(".selectTitle").text($ct.text())
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                })
            } else if ($uiElements.eq(i).hasClass("axis") || $uiElements.eq(i).hasClass("verticalAxis")) {

                $uiElements.eq(i).attr("data-value", 0)
                $uiElements.eq(i).children(".axisKnob, .verticalAxisKnob").val(0)

                $uiElements.eq(i).children(".axisKnob, .verticalAxisKnob").on("input", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", $ct.val())
                    nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))

                }).on("pointerup  ", (event) => {
                    if (JSON.parse($uiElements.eq(i).attr("data-snapBack"))) {
                        let $ct = $(event.target)
                        $uiElements.eq(i).attr("data-value", 0)
                        $(event.currentTarget).val(0)
                        nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                    }
                })
            }
            // else if ($uiElements.eq(i).hasClass("basicSubscription")) {

            //     nt4Client.subscribe([$uiElements.eq(i).attr('data-topic')])

            //     $uiElements.eq(i).addClass($uiElements.eq(i).attr('data-topic').replaceAll("/", "esc-Sl-esc").replaceAll(".", "esc-period-esc"))
            // } 
            else if ($uiElements.eq(i).hasClass("buttonOptGroup")) {

                $uiElements.eq(i).children(".optGroupButton").on("pointerdown", (event) => {
                    if (editTabs.hasClass("editingTabs")) return

                    let cI = $uiElements.eq(i).children(".optGroupButton")
                    for (let j = 0; j < cI.length; j++) {
                        cI.eq(j).css("background-color", cI.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0)").removeClass("toggledOn")
                    }
                    let oldBG = $(event.target).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')
                    let $ct = $(event.target).addClass("toggledOn").css("background-color", oldBG + ", 0.6)")

                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value")).attr("data-index", $ct.attr("data-index"))
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                })

                let cH = $uiElements.eq(i).children(".optGroupButton")
                for (let j = 0; j < cH.length; j++) {
                    if (cH.eq(j).hasClass("toggledOn")) {
                        cH.eq(j).css("background-color", cH.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0.6)");
                        $uiElements.eq(i).attr("data-value", cH.eq(j).attr("data-value")).attr("data-index", cH.eq(j).attr("data-index"))
                    }
                }
            }
        }

        // console.log(nt4Client.subscriptions)



        $(".connectionText").text("Connected")

    }, 1000);

}

function onDisconnectCb() {
    if ($("#connect").is(":checked")) {
        $(".fullScreen").css("background-color", "rgb(128, 32, 32)")


        $("html").css("background-color", "rgb(128, 32, 32)")
        $(".tab").css("background-color", "rgb(64, 12, 12)")
        $(".addTab").css("background-color", "rgb(128, 32, 32)")
        $(".tabCreator").css("background-color", "rgb(128, 32, 32)")

        $(".tabNav").css("background-color", "rgb(64, 12, 12)")
        $(".currentTab").css("background-color", "rgb(128, 32, 32)")

        setTimeout(() => {
            window.location.reload()

        }, 1000);
    }
}
