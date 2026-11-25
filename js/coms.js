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

import { NT4_Client } from "../lib/nt4.js";
import { topicToSidebar } from "./editor/editorUi.js";
import { setSelectOpener, toastMessage } from "./ui.js";
import { rebindAllComponents, decodeFMSControlData } from "./editor/components/components.js";
import { setConversionRate, setStartTime, startTimeQueue } from "./editor/components/graph.js";
// import { MathUtils } from "../lib/util.js";
// import { renderFrame, isFrameScheduled } from "./renderer.js";

let sidebaredStructs = []

export let compatabilityYear = 2027;

let queueValueSends = false;

export let isConnected = false;

let queuedTopics = [];

let allSubscribedTopics = [];

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
    onDisconnectCb,
    onDataSent
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


    if (topic.name == "/DriverStation/ControlWord") {
        setCompatabilityMode(2027)
        subscribeOrQueue("/DriverStation/ControlWord")

    }
    // So most topics are sent to the sidebar when they are created, but we cannot decode structs
    // without their values being sent, so if the topic is a struct, and the array of sidebared structs
    // does not have the topic, then send the topic to the sidebar.
    if (topic.type.includes("struct") && !sidebaredStructs.includes(topic.name.split("|")[0])) {
        if (topic.type.includes("[]")) return;
        topicToSidebar(topic, true)
        sidebaredStructs.push(topic.name.split("|")[0])
    }

}

function doNothing() { }

function handleNewData(topic, timestamp, value) {
    //Protos are not supported, and structschemas show no useful data to user. 
    if (topic.name == "/Robot/ProgramStartTime") {
        setStartTime(value / 1000)
    }

    if (topic.name == "/FMSInfo/FMSControlData") {
        setCompatabilityMode(2026)
    }

    if (topic.type.includes("proto") || topic.type.includes("structschema")) return


    let topicSplit = topic.name.split("/")

    topicSplit.shift()

    let currentPath = topicObject

    for (let i = 0; i < topicSplit.length; i++) {
        if (i >= topicSplit.length - 1) {
            // console.log(currentPath, topicName, value)

            try {
                currentPath[topicSplit[i]]["value"] = value
            } catch {
            }

            continue
        }

        if (currentPath[topicSplit[i]]) {
            currentPath = currentPath[topicSplit[i]]
        }
    }


    if (topic.name.includes("/FMSInfo/FMSControlData")) {
        // console.log("FMSControlData decoded: ", decodeFMSControlData(value));

        if (!decodeFMSControlData(value).enabled) {
            queueValueSends = true;
        } else if (queueValueSends && decodeFMSControlData(value).enabled) {
            for (let [key, value] of nt4Client.publishedTopics) {

                if (value.autoSend) {
                    if (value.value == undefined) continue

                    nt4Client.addSample(key, value.value)

                } else {
                    // console.log(value)
                }
            }

            queueValueSends = false;
        }
    }
    else if (topic.name.includes("/DriverStation/ControlWord")) {
        if (!value["enabled:1"].value) {
            queueValueSends = true;
        } else if (queueValueSends && value["enabled:1"].value) {
            for (let [key, value] of nt4Client.publishedTopics) {
                if (value.autoSend) {
                    if (value.value == undefined) continue

                    nt4Client.addSample(key, value.value)

                } else {
                    // console.log(value)
                }
            }

            queueValueSends = false;
        }

    }

    //Random data that the user shouldnt see usually has . in it
    // if (topic.name.includes(".") && ! topic.name.includes(".type")) return

    //If the value is currently used by a component, send the value to the component handler.
    if (subscribedTopics.hasOwnProperty(topic.name)) {

        for (let i = 0; i < subscribedTopics[topic.name].length; i++) {
            let foundValue = value;

            if (!subscribedTopics[topic.name][i]) continue; //Pass if value is null
            // console.log(subscribedTopics[topic.name][i])
            if (value == undefined) return;

            if (topic.type.includes("struct") && (subscribedTopics[topic.name][i].structPath != undefined)) {
                if(subscribedTopics[topic.name][i].structPath.split("|")[1].length > 0){
                    foundValue = getStructValue(subscribedTopics[topic.name][i].structPath, value)
                }
            } 

            subscribedTopics[topic.name][i].valueHandeler(foundValue, timestamp, topic) // Send value to topic handler
        }
    }

    // if (!isFrameScheduled.scheduled) {
    //     // window.requestAnimationFrame(renderFrame);
    //     isFrameScheduled.scheduled = true;
    // }

}

export function getStructValue(structTopic, value) {
    //Structtopic must have the full path, with the stuct path following the "|"
    let path = structTopic.split("|")[1];
    let pathArr = path.split("/")

    if (value == undefined) return;


    for (let i = 0; i < pathArr.length; i++) {
        let key = pathArr[i];
        if (value.hasOwnProperty(key)) {
            value = value[key]
        }
    }

    return value.value;
}

export function subscribeOrQueue(topic) {
    topic = topic.split('|')[0].trim()

    if (allSubscribedTopics.includes(topic)) return
    if (nt4Client.subscriptions.get(topic)) return;

    allSubscribedTopics.push(topic)

    if (isConnected) {
        nt4Client.subscribe([topic], false)
    } else {
        queuedTopics.push(topic)
    }
}

function onConnectCb() {
    //on everything this is NOT on callback
    $(".connectionText").text("Connecting")

    setTimeout(() => {
        isConnected = true;

        setSelectOpener()

        $(".tabConnection").removeClass("tabConnection")

        $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

        $("html").css("background-color", "rgb(32, 32, 32)")
        $(".tab").css("background-color", "rgb(12, 12, 12)")
        $(".addTab").css("background-color", "rgb(32, 32, 32)")
        $(".tabManager").css("background-color", "rgb(32, 32, 32)")
        $(".tabCreator").css("background-color", "rgb(32, 32, 32)")
        $(".page").css("background-color", "")

        $(".tunableInterfaceLocked").removeClass("tunableInterfaceLocked")

        $(".tabNav").css("background-color", "rgb(12, 12, 12)")
        $(".currentTab").css("background-color", "rgb(32, 32, 32)")
        // nt4Client.publishTopic("/touchboard/posePlotterFinalString", "string")

        // nt4Client.addSample("/touchboard/posePlotterFinalString", localStorage.getItem(getHtmlFileName() + "currentPath"))

        // nt4Client.publishTopic("/touchboard/musicIsFinished", "boolean")

        // nt4Client.addSample("/touchboard/musicIsFinished", true)

        subscribeOrQueue("/FMSInfo/FMSControlData");

        nt4Client.subscribe(["/.schema"], true)

        // console.log(queuedTopics)
        nt4Client.subscribe(["/Robot/ProgramStartTime"], false)
        nt4Client.subscribe(queuedTopics, false)

        nt4Client.subscribeTopicsOnly([""], true)

        // nt4Client.subscribe([],)

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
            let $currentElement = $uiElements.eq(i)

            if ($currentElement.attr("data-topic")) {

                if ($currentElement.attr("data-topic") == "esc-UNDEFINED-esc" || $currentElement.attr("data-topic") == "esc-UNSET-esc") continue;
                if ($currentElement.attr("data-topic") == "/touchboard/esc-UNDEFINED-esc" || $currentElement.attr("data-topic") == "/touchboard/esc-UNSET-esc") continue;

                if ($currentElement.attr("data-type")) {
                    nt4Client.publishTopic($currentElement.attr("data-topic"), $currentElement.attr("data-type"))
                } else if ($currentElement.children().attr("data-type")) {
                    nt4Client.publishTopic($currentElement.attr("data-topic"), $currentElement.children().attr("data-type"))
                }
                // console.log($currentElement.attr("data-topic"), $currentElement.attr("data-value"), $currentElement)

                if ($currentElement.attr("data-value")) {
                    if ($currentElement.attr("data-autoSend")) {
                        if ($currentElement.attr("data-autoSend") == "false") {
                            continue
                        } else {
                            nt4Client.publishedTopics.get($currentElement.attr("data-topic")).autoSend = true
                        }
                    }

                    if ($currentElement.hasClass("tunableInterface")) {

                    }

                    if ($currentElement.attr("data-type") === "string") {
                        nt4Client.addSample($currentElement.attr("data-topic"), $currentElement.attr("data-value"))
                        // console.log($currentElement.attr("data-value"))
                    } else if ($currentElement.attr("data-type") === "double") {
                        nt4Client.addSample($currentElement.attr("data-topic"), parseFloat($currentElement.attr("data-value")))
                        // console.log($currentElement.attr("data-value"))
                    } else {
                        nt4Client.addSample($currentElement.attr("data-topic"), JSON.parse($currentElement.attr("data-value")))

                    }
                }
            }
        }
        // let editTabs = $(".editTabs")
        // for (let i = 0; i < $uiElements.length; i++) {
        //     if ($uiElements.eq(i).attr("data-topic") == "esc-UNDEFINED-esc" || $uiElements.eq(i).attr("data-topic") == "esc-UNSET-esc") { continue }

        rebindAllComponents();
        // }

        // console.log(nt4Client.subscriptions)



        $(".connectionText").text("Connected")
        // window.requestAnimationFrame(renderFrame);

    }, 1000);

}

function setCompatabilityMode(year) {
    compatabilityYear = year

    if (year == 2026) {
        for (let i = 0; i < startTimeQueue.length; i++) {
            startTimeQueue[i]();
        }
    }
}


function onDisconnectCb() {
    if ($("#connect").is(":checked")) {
        $(".fullScreen").css("background-color", "rgb(128, 32, 32)")

        $(".connectionText").text("Retrying")
        $("html").css("background-color", "rgb(128, 32, 32)")
        $(".tab").css("background-color", "rgb(64, 12, 12)")
        $(".addTab").css("background-color", "rgb(128, 32, 32)")
        $(".tabCreator").css("background-color", "rgb(128, 32, 32)")
        $(".tabManager").css("background-color", "rgb(128, 32, 32)")
        $(".tabNav").css("background-color", "rgb(64, 12, 12)")
        $(".currentTab").css("background-color", "rgb(128, 32, 32)")
        $(".page").css("background-color", "rgb(128, 32, 32)")


        // setTimeout(() => {
        //     window.location.reload()

        // }, 1000);
    }
    $(".tunableInterface").addClass("tunableInterfaceLocked")

    $(".outputTopics").empty()
    topicObject = {
        "esc-esc-$-esc-esc": $(".outputTopics")
    }

    sidebaredStructs = []

    isConnected = false;
}

function onDataSent(topic, timestamp, value) {
    // console.log(subscribedTopics[topic.name], value)
    if (subscribedTopics.hasOwnProperty(topic.name)) {
        let foundValue = value;

        for (let i = 0; i < subscribedTopics[topic.name].length; i++) {
            if (!subscribedTopics[topic.name][i]) continue; //Pass if value is null
            // console.log(subscribedTopics[topic.name][i])
            if (value == undefined) return;
            //To prevent loops for components that can send values, 
            if (!subscribedTopics[topic.name][i].allowLoopback) continue;

            if (topic.type.includes("struct")) {
                foundValue = getStructValue(subscribedTopics[topic.name][i].structPath, value)
            }

            subscribedTopics[topic.name][i].valueHandeler(foundValue, timestamp, topic) // Send value to topic handler
        }
    }
}

