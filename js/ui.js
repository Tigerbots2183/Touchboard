// import "./nt4.js"

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
import { serialize, deserialize } from "../lib/msgpack.js";
import { goToNextSong } from "./jukebox.js";
import { setFromString, moveTo, lineTo } from "./autoBuilder.js";

//if removing jukebox, get rid of the gotonextsong() in the handle data callback function, remove from html, and remove import
export function getHtmlFileName() {
    let path = window.location.pathname;
    let segments = path.split('/'); // Split the path by the '/' character
    let fileName = segments.pop();
    // Get the last element of the array, which is the filename
    return fileName.slice(0, -5);
}

function clamp(num, min = 0, max = 1){ return Math.min(Math.max(num, min), max) };

let defaultSimilarOptions = {
    fill: false,
}

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}
function pxTovh(pixels) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    return ((pixels / h) * 100);
}
function pxTovw(pixels) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

    return ((pixels / w) * 100);
}
function pxTovmin(pixels) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const smallerDimension = Math.min(viewportWidth, viewportHeight);
    return (pixels / smallerDimension) * 100;
}

function pxTovmax(pixels) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const largerDimension = Math.max(viewportWidth, viewportHeight);
    return (pixels / largerDimension) * 100;
}


function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function vmin(percent) {
    return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
    return Math.max(vh(percent), vw(percent));
}

function cq(container, percent) {

    let testspan = $("<span>").css("height", "1cqh").css("width", "1cqw").css("position", "absolute").appendTo(container)

    let cqValues = {
        cqw: testspan.width() * percent,
        cqh: testspan.height() * percent,
        cqmax: Math.max(testspan.height() * percent, testspan.width() * percent),
        cqmin: Math.min(testspan.height() * percent, testspan.width() * percent),
    }

    testspan.remove()

    return cqValues;
}

function pxToCq(container, pixels) {

    let cqValues = {
        cqw: (pixels / cq(container, 1).cqw),
        cqh: (pixels / cq(container, 1).cqh),
        cqmax: (pixels / cq(container, 1).cqmax),
        cqmin: (pixels / cq(container, 1).cqmin),
    }

    return cqValues
}

let subscribedTopics = {
    //"Topic": [{jQueryReference :$, parentRefernce: $, valueHandler: function()/false}]
}

if (localStorage.getItem(getHtmlFileName() + "currentPath") == null) {
    localStorage.setItem(getHtmlFileName() + "currentPath", "")
}


$(".fullScreen").on("click", () => {
    document.querySelector("html").requestFullscreen();


})
$("html").on("click", (event) => {
    if (!$(event.target).hasClass("selectTitle") && !$(event.target).hasClass("textInput") && !$(event.target).hasClass("delete") && !$(event.target).hasClass("save") && !$(event.target).hasClass("saveManager")) {
        $(".select").removeClass("selectOpen").scrollTop(0)
    }
})
// setAnimatable()
// function setAnimatable(){
let $ab = $(".animatedButton, .oneShotButton")
for (let i = 0; i < $ab.length; i++) {


    let text = $ab.eq(i).text()
    $ab.eq(i).text(" ")

    if (typeof text === "string") {
        text = text.split(" ")
        for (let j = 0; j < text.length; j++) {
            let $word = $("<div>").appendTo($ab.eq(i)).css('display', 'flex').addClass("buttonWord");
            for (let I = 0; I < text[j].length; I++) {
                $("<p>").text(text[j][I]).addClass('funkyLetter').appendTo($word)
            }
        }


    }
}
// }



function addButtonToAnimate(jQueryReference) {
    jQueryReference.on("pointerdown ", (event) => {

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

$(".tab").on("pointerdown ", (event) => {
    let $ct = $(event.currentTarget)
    $(".page, .pageF").css("display", "none")
    $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
    $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
    if ($ct.attr("data-displaytype") == null) {
        $($ct.attr("data-page")).css("display", "grid")
    } else {
        $($ct.attr("data-page")).css("display", $ct.attr("data-displaytype"))

    }
})

function oneShotAnimation(elemClass) {
    //runs as callback in case input not recieved

    let $spawnedCircle
    let $ct = $(elemClass)



    $spawnedCircle = $("<div>").css("background-color", $ct.css("background-color")).appendTo("body").addClass("spawnedCircle").css("top", $ct.offset().top + $ct.height() / 2 + "px").css("left", $ct.offset().left + $ct.width() / 2 + "px")
    setTimeout(() => {
        $($spawnedCircle.remove())
    }, 3000);


    $spawnedCircle.offset()
    $spawnedCircle.addClass("spawnedBigCircle")
    let $foundP = $ct.find("p")
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
}
setSelectOpener()
function setSelectOpener() {
    $(".select").not(".sideBarSelect").off("pointerdown.selectOpener").on(" pointerdown.selectOpener", (event) => {
        if (!$(event.target).hasClass("textInput") && !$(event.target).hasClass("delete") && !$(event.target).hasClass("save") && !$(event.target).hasClass("saveManager")) {
            $(event.currentTarget).toggleClass("selectOpen")
        }
    })
}
// $(".selectOption").on("touchdown pointerdown", (event) => {
//     let $ct = $(event.target)

//     $(".select").attr("data-value", $ct.attr("data-value"))
//     $(".selectTitle").text($ct.text())
// })



// let daq = new SignalDAQNT4("localhost", ci, null, null, 
export var nt4Client = new NT4_Client(localStorage.getItem(getHtmlFileName() + "teamNumber"),
    "Touchboard",
    topicAnnounce,
    doNothing,
    handleNewData,
    onConnectCb,
    onDisconnectCb
);

let topicObject = {
    "esc-esc-$-esc-esc": $(".outputTopics")
}
let outputComponents = {
    topic: "",
    changing: false,
    changingValidTypes: ["all"],
    changingSidebar: "",
}

function topicAnnounce(topic) {
    // console.log(topic.name, topic) 
    topicToSidebar(topic)


}

function topicToSidebar(topic) {
    let split = topic.name.split("/")
    split.shift();

    let currentPath = topicObject
    console.log(topicObject)
    for (let i = 0; i < split.length; i++) {
        // if(i == 0 && split[i] == "touchboard") continue
        if (currentPath[split[i]]) {
            currentPath = currentPath[split[i]]

            continue
        } else {
            if (i >= split.length - 1) {
                let parentDiv
                if (i == 0) parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
                else parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))

                let src = ""
                let typeString

                let image = $("<img>").appendTo(parentDiv)
                let h1 = $("<h1>").text(split[i]).appendTo(parentDiv)
                currentPath[split[i]] = topic
                currentPath[split[i]]["esc-esc-$-esc-esc"] = parentDiv

                let $allOf = $(parentDiv).add(image).add(h1)

                if (topic.type.includes('string')) {
                    src = "TextIcon.png"
                    typeString = 'string'
                }
                else if (topic.type.includes('struct')) {
                    src = "StructIcon.png"
                    typeString = 'struct'
                }
                else if (topic.type.includes('int')) {
                    src = "IntIcon.png"
                    typeString = 'int'
                }
                else if (topic.type.includes('double') || topic.type.includes('float64')) {
                    src = "DoubleIcon.png"
                    typeString = 'double'
                }
                else if (topic.type.includes('float')) {
                    src = "FloatIcon.png"
                    typeString = 'float'
                }
                else if (topic.type.includes('bool')) {
                    src = "BoolIcon.png"
                    typeString = 'bool'
                }

                if (topic.type.includes("[]")) {
                    src = "Array" + src
                    typeString = "array" + typeString
                }

                $allOf.on("pointerdown.openOutputComponents", () => {
                    $(".ioComponents").css("display", "none")
                    $(".editSidebar").css("display", "none")
                    if (outputComponents.changing) {
                        outputComponents.changingSidebar.css("display", "flex")

                        console.log(subscribedTopics)



                        if (!subscribedTopics.hasOwnProperty(topic.name)) {
                            subscribedTopics[topic.name] = []
                        }

                        let newSubscriptionReference = subscribedTopics[editComponent.currentTarget.attr('data-topic')].slice(editComponent.currentTarget.attr("data-subscriptionIndex"), parseInt(editComponent.currentTarget.attr("data-subscriptionIndex")) + 1)
                        subscribedTopics[topic.name].push(newSubscriptionReference[0])

                        console.log(subscribedTopics)

                        subscribedTopics[editComponent.currentTarget.attr('data-topic')][editComponent.currentTarget.attr("data-subscriptionIndex")] = false

                        editComponent.currentTarget.attr("data-topic", topic.name).attr("data-subscriptionindex", subscribedTopics[editComponent.currentTarget.attr('data-topic')].length - 1).find(".editThisName").text(split[i])




                        if (nt4Client.serverTopics.get(topic.name)) {
                            let val = "null"
                            if (nt4Client.serverTopics.get(topic.name).value) {
                                val = nt4Client.serverTopics.get(topic.name).value
                            }
                            if (newSubscriptionReference[0].topicChangeHandler) {
                                newSubscriptionReference[0].topicChangeHandler(topic.name, val)
                            }

                            newSubscriptionReference[0].valueHandeler(val)
                        } else {
                            if (newSubscriptionReference[0].topicChangeHandler) {
                                newSubscriptionReference[0].topicChangeHandler(topic.name, "")
                            }

                            newSubscriptionReference[0].valueHandeler("")
                        }



                        outputComponents.changingSidebar.find(".topicShower").text(topic.name)
                        outputComponents.changingSidebar.find(".nameInput").val(split[i])


                        setTimeout(() => {
                            outputComponents.changing = false
                        }, 100);

                        console.log(subscribedTopics)
                    } else {
                        $("." + typeString + "OutputComponents").css("display", "flex")
                    }

                    outputComponents.topic = topic

                })

                image.attr("src", "./js/Icons/" + src)

                continue
            }
            let parentDiv
            if (i == 0) {
                parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
            }
            else {
                parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))
            }
            let h2Holder = $("<div>").addClass("h2Holder").appendTo(parentDiv)
            let h2 = $("<h2>").text("▲").appendTo(h2Holder)

            let h1 = $("<h1>").text(split[i]).appendTo(parentDiv)

            let subDiv = $("<div>").addClass("subPaths").appendTo(parentDiv)

            let currentTimeout

            h1.add(h2).add(h2Holder).on("pointerdown.open", (event) => {
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


            currentPath[split[i]] = {
                "esc-esc-$-esc-esc": parentDiv
            }
            currentPath = currentPath[split[i]]
        }
    }

    // console.log(topicObject)

}

function doNothing() { }

if (localStorage.getItem(getHtmlFileName() + "connect") === "true") {
    $("#connect")[0].checked = true
    $(".connectionText").text("Retrying")
    $(".tabConnection").removeClass("tabConnection")

    nt4Client.connect()

} else {
    $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

    $("html").css("background-color", "rgb(32, 32, 32)")
    $(".tab").css("background-color", "rgb(12, 12, 12)")
    $(".tabNav").css("background-color", "rgb(12, 12, 12)")
    $(".currentTab").css("background-color", "rgb(32, 32, 32)")
    nt4Client.disconnect()

}

$("#connect").on("click", () => {
    if (!$("#connect").is(":checked")) {
        $(".connectionText").text("Offline")
        localStorage.setItem(getHtmlFileName() + "connect", "false")
        $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

        $("html").css("background-color", "rgb(32, 32, 32)")
        $(".tab").css("background-color", "rgb(12, 12, 12)")
        $(".tabNav").css("background-color", "rgb(12, 12, 12)")
        $(".currentTab").css("background-color", "rgb(32, 32, 32)")
        nt4Client.disconnect()

    } else {
        $(".connectionText").text("Connecting")
        localStorage.setItem(getHtmlFileName() + "connect", "true")
        $(".fullScreen").css("background-color", "")

        $("html").css("background-color", "")
        $(".tab").css("background-color", "")
        $(".tabNav").css("background-color", "")
        $(".currentTab").css("background-color", "")
        nt4Client.disconnect()

        nt4Client.connect()
        $(".tabConnection").removeClass("tabConnection")
    }
})

let rawDecoder = new TextDecoder('utf-8')
let rawEncoder = new TextEncoder('utf-8')


function handleNewData(topic, timestamp, value, RawValue) {
    // console.log(topic.name)
    // console.log(value)
    // console.log(topic)
    let topicSplit = topic.name.split("/")
    let topicName = topicSplit[topicSplit.length - 1]
    // console.log(topicSplit)

    topicSplit.shift()

    let currentPath = topicObject

    for (let i = 0; i < topicSplit.length; i++) {
        if (i >= topicSplit.length - 1) {
            // console.log(currentPath, topicName, value)
            currentPath[topicSplit[i]]["value"] = value
            continue
        }

        if (currentPath[topicSplit[i]]) {
            currentPath = currentPath[topicSplit[i]]
        }
    }

    if (topic.type.includes("struct:") && topic.type.includes("Pose2d[]")) {
        for (let i = 0; i < value.length; i++) {
            // console.log(value[i].translation.x.value, value[i].translation.y.value)
        }
    }

    if (topic.type == "structschema") {
        // console.log(topic.name, rawDecoder.decode(value))
    }

    if (topic.name.includes('streams')) {
        console.log(topic, value)
    }

    if (topic.name.includes(".")) return

    if (topicName == "musicIsFinished") {
        if (value == true) {
            goToNextSong()
        }
    }
    // if ($("." + topic.name.replaceAll("/", "esc-Sl-esc")).hasClass("basicSubscription")) {
    //     // console.log(value)
    //     $("." + (topic.name.replaceAll("/", "esc-Sl-esc"))).children(".bSValue").text(JSON.stringify(value))
    // } else if ($("." + topicName).hasClass("oneShotButton")) {
    //     oneShotAnimation("." + topicName)
    // }
    // console.log(topic.name, topicSplit)
    // console.log(nt4Client.serverTopics, "test")

    // console.log(topic.name, subscribedTopics)
    if (subscribedTopics.hasOwnProperty(topic.name)) {

        for (let i = 0; i < subscribedTopics[topic.name].length; i++) {
            if (!subscribedTopics[topic.name][i]) continue;
            // console.log(subscribedTopics[topic.name][i])


            subscribedTopics[topic.name][i].valueHandeler(value, timestamp)
        }
    }

}

nt4Client.subscribe(["/touchboard/musicIsFinished"])

let $reefBtns = $(".reefPFHolder").children()

for (let i = 0; i < $reefBtns.length; i++) {
    let hue = i * (180 / (($reefBtns.length - 1) / 2))
    if (i % 2 !== 0) {
        hue = (i - 1) * (180 / (($reefBtns.length - 1) / 2))

    }

    $reefBtns.eq(i).css("background-color", "hsl(" + hue + " 100 25").css("border-color", "hsl(" + hue + " 100 50").css("grid-area", $reefBtns.eq(i).attr("data-topic").slice(0, 2))
}

function onConnectCb() {
    //on everything ts is NOT on callback

    setTimeout(() => {

        $(".tabConnection").removeClass("tabConnection")

        $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

        $("html").css("background-color", "rgb(32, 32, 32)")
        $(".tab").css("background-color", "rgb(12, 12, 12)")
        $(".tabNav").css("background-color", "rgb(12, 12, 12)")
        $(".currentTab").css("background-color", "rgb(32, 32, 32)")
        nt4Client.publishTopic("/touchboard/posePlotterFinalString", "string")

        nt4Client.addSample("/touchboard/posePlotterFinalString", localStorage.getItem(getHtmlFileName() + "currentPath"))

        nt4Client.publishTopic("/touchboard/musicIsFinished", "boolean")

        nt4Client.addSample("/touchboard/musicIsFinished", true)

        nt4Client.subscribe([""], true, true)

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

                    } else if ($uiElements.eq(i).attr("data-type") === "double") {
                        if ($uiElements.eq(i).attr("data-persist") == "true") {
                            nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), parseFloat(localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"))))
                        } else {
                            nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), parseFloat($uiElements.eq(i).attr("data-value")))
                        }

                    } else {
                        nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), JSON.parse($uiElements.eq(i).attr("data-value")))

                    }
                }
            }
        }

        for (let i = 0; i < $uiElements.length; i++) {
            if ($uiElements.eq(i).hasClass("actionButton")) {
                $($uiElements.eq(i)).on(" pointerdown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                    $uiElements.eq(i).attr("data-value", "true")
                }).on("pointerup   mouseleave touchcancel", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), false)
                    $uiElements.eq(i).attr("data-value", "false");
                })
            } else if ($uiElements.eq(i).hasClass("toggleButton")) {
                $uiElements.eq(i).on(" pointerdown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), !(JSON.parse($uiElements.eq(i).attr("data-value"))))
                    $uiElements.eq(i).toggleClass("toggledOn")
                    let oldBG = $uiElements.eq(i).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')

                    if ($uiElements.eq(i).hasClass("toggledOn")) {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0.6)")
                    } else {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0)")

                    }
                    $uiElements.eq(i).attr("data-value", !(JSON.parse($uiElements.eq(i).attr("data-value"))))
                })
            } else if ($uiElements.eq(i).hasClass("oneShotButton")) {
                nt4Client.subscribe(["/touchboard/" + $uiElements.eq(i).attr("data-topic")])
                $uiElements.eq(i).on(" pointerdown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                })
            } else if ($uiElements.eq(i).hasClass("numberComponent")) {
                if ($uiElements.eq(i).attr('data-persist') == "true") {
                    if (localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic")) == null) {
                        localStorage.setItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))
                    } else {
                        let currentPersitant = localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"));
                        $uiElements.eq(i).attr("data-value", currentPersitant)
                        $uiElements.eq(i).children(".numberTextInput").attr("value", currentPersitant)
                    }
                }
                nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), parseFloat(localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"))))

                $uiElements.eq(i).children(".numberPlus").on("pointerdown ", (event) => {
                    let $ct = $(event.currentTarget)
                    let max = parseFloat($ct.parent().attr("data-max"))
                    let step = parseFloat($ct.parent().attr("data-step"))
                    let $numberTarget = $ct.parent().children(".numberTextInput")
                    let currentVal = roundToNearestX(parseFloat($numberTarget.val()) + step, step)
                    if (currentVal <= max) {
                        $numberTarget.val(currentVal)
                        $ct.parent().attr("data-value", $numberTarget.val())
                        nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                        if ($ct.parent().attr('data-persist') == "true") {
                            localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $numberTarget.val())
                        }
                    }
                })
                $uiElements.eq(i).children(".numberMinus").on("pointerdown ", (event) => {
                    let $ct = $(event.currentTarget)
                    let min = parseFloat($ct.parent().attr("data-min"))
                    let step = parseFloat($ct.parent().attr("data-step"))
                    let $numberTarget = $ct.parent().children(".numberTextInput")
                    let currentVal = roundToNearestX((parseFloat($numberTarget.val()) - step), step)
                    if (currentVal >= min) {
                        $numberTarget.val(currentVal)
                        $ct.parent().attr("data-value", $numberTarget.val())
                        nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                        if ($ct.parent().attr('data-persist') == "true") {
                            localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $numberTarget.val())
                        }
                    }
                })
                $uiElements.eq(i).children(".numberTextInput").on("blur", (event) => {

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
                    if ($ct.parent().attr('data-persist') == "true") {
                        localStorage.setItem(getHtmlFileName() + $ct.parent().attr("data-topic"), $ct.val())
                    }
                })
            } else if ($uiElements.eq(i).hasClass("select")) {
                $uiElements.eq(i).children(".selectOption").on("pointerdown", (event) => {
                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value")).css("background-color", $ct.attr("data-hex") + "6b")
                    $uiElements.eq(i).children(".selectTitle").text($ct.text())
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                })
            } else if ($uiElements.eq(i).hasClass("axis") || $uiElements.eq(i).hasClass("verticalAxis")) {


                $uiElements.eq(i).attr("data-value", 0)
                $uiElements.eq(i).children(".axisKnob, .verticalAxisKnob").val(0)

                $uiElements.eq(i).children(".axisKnob, .verticalAxisKnob").on("input", (event) => {
                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", $ct.val())
                    nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))

                }).on("pointerup  ", (event) => {
                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", 0)
                    $(event.currentTarget).val(0)
                    nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                })
            } else if ($uiElements.eq(i).hasClass("basicSubscription")) {

                nt4Client.subscribe([$uiElements.eq(i).attr('data-topic')])

                $uiElements.eq(i).addClass($uiElements.eq(i).attr('data-topic').replaceAll("/", "esc-Sl-esc").replaceAll(".", "esc-period-esc"))
            } else if ($uiElements.eq(i).hasClass("buttonOptGroup")) {
                $uiElements.eq(i).children(".optGroupButton").on("pointerdown", (event) => {

                    let cI = $uiElements.eq(i).children(".optGroupButton")
                    for (let j = 0; j < cI.length; j++) {
                        cI.eq(j).css("background-color", cI.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0)").removeClass("toggledOn")
                    }
                    let oldBG = $(event.target).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')
                    let $ct = $(event.target).addClass("toggledOn").css("background-color", oldBG + ", 0.6)")

                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value"))
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                })

                let cH = $uiElements.eq(i).children(".optGroupButton")
                for (let j = 0; j < cH.length; j++) {
                    if (cH.eq(j).hasClass("toggledOn")) {
                        cH.eq(j).css("background-color", cH.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0.6)");
                        $uiElements.eq(i).attr("data-value", cH.eq(j).attr("data-value"))
                    }
                }
            }
        }

        console.log(nt4Client.subscriptions)



        $(".connectionText").text("Connected")

    }, 1000);

}

function onDisconnectCb() {
    if ($("#connect").is(":checked")) {
        $(".fullScreen").css("background-color", "rgb(128, 32, 32)")


        $("html").css("background-color", "rgb(128, 32, 32)")
        $(".tab").css("background-color", "rgb(64, 12, 12)")
        $(".tabNav").css("background-color", "rgb(64, 12, 12)")
        $(".currentTab").css("background-color", "rgb(128, 32, 32)")
        setTimeout(() => {
            window.location.reload()

        }, 1000);
    }
}

if (localStorage.getItem(getHtmlFileName() + "teamNumber") == null) {
    $(".connectionText").text("No Team")
    $(".setTeamNumberOrIp").toggleClass("showTeamSet")
    $("#connect")[0].checked = false
}

$(".setTeam").on("click", () => {
    let currentTeamOrIp = $(".teamNumberInput").val().toString().replace(/\s/g, "");
    if (currentTeamOrIp.length > 0) {

        if (currentTeamOrIp.includes(".")) {
            localStorage.setItem(getHtmlFileName() + "teamNumber", currentTeamOrIp)
        } else if (currentTeamOrIp.includes("localhost")) {
            localStorage.setItem(getHtmlFileName() + "teamNumber", "localhost")
        } else if (currentTeamOrIp.length <= 5) {
            let madeIp = "10."
            //could probably code this better but in a rush
            if (currentTeamOrIp.length == 5) {
                madeIp = "10." + currentTeamOrIp.slice(0, 3) + "." + currentTeamOrIp.slice(3, 5) + ".2"
            } else if (currentTeamOrIp.length == 4) {
                madeIp = "10." + currentTeamOrIp.slice(0, 2) + "." + currentTeamOrIp.slice(2, 4) + ".2"
            } else if (currentTeamOrIp.length == 3) {
                madeIp = "10." + currentTeamOrIp.slice(0, 1) + "." + currentTeamOrIp.slice(1, 3) + ".2"
            } else if (currentTeamOrIp.length == 2) {
                madeIp = "10.0." + currentTeamOrIp.slice(0, 2) + ".2"
            } else if (currentTeamOrIp.length == 1) {
                madeIp = "10.0." + currentTeamOrIp.slice(0, 1) + ".2"

            }

            localStorage.setItem(getHtmlFileName() + "teamNumber", madeIp);
        }

    }
    window.location.reload()
})

function roundToNearestX(number, x) {

    if (x === 0) return 0;
    return Math.round(number / x) * x;
}

$(".editTabs").on("click", () => {
    $("#connect").css("pointer-events", "none")

    $(".editTabs").toggleClass("editingTabs");
    $("body").toggleClass("bodyEdit")
    $(".gridUnderlay").toggleClass("gridUnderlayEditing")
    $(".gridSquare").toggleClass("gridSquareEditing")

    setTimeout(() => {
        $("#connect").css("pointer-events", "")

    }, 1000);

    if ($(".editTabs").hasClass("editingTabs")) {

        $("body").on("pointermove ", (event) => {
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
        $("html").off()
    }

})

let grid = {
    row: 0,
    column: 0,
    endRow: false,
    endColumn: false,
    rowReverse: false,
    columnReverse: false,
    rowOffset: 1,
    columnOffset: 1,
}
grid.endColumn = grid.column
grid.endRow = grid.row


$(".ioComponents").children().off().on("pointerdown.addComponent ", (event) => {
    $("*").removeClass("removeShake").off("pointerdown.remove")
    $(".trashCan").removeClass("trashActive")



    let componentType = $(event.currentTarget)[0].classList[0];

    let jQueryReference

    if ($(event.currentTarget).parent().hasClass("outputComponents")) {
        jQueryReference = createDefaultOf(componentType, ".dashboardHolder", outputComponents.topic.name)
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

function addToCurrentDrag(jQueryReference, initalX, initalY, componentType) {
    $(".currentDrag").remove()
    jQueryReference.css("position", "absolute").addClass("currentDrag")

    jQueryReference.css("top", initalY).css('left', initalX)

    $("html").off("pointermove.dragComponent").on("pointermove.dragComponent", (event) => {
        // console.log("Start" + grid.column + " " + grid.row + " ")
        // console.log("End" + grid.endColumn + " " + grid.endRow + " ")
        flipHandler()


        let clientDrag = clientDragHandler(event, jQueryReference);

        jQueryReference.css("top", clientDrag.y).css('left', clientDrag.x)

        let elementsFromPoint = document.elementsFromPoint(clientDrag.rawX, clientDrag.rawY)

        for (let i = 0; i < elementsFromPoint.length; i++) {
            let $eq = $(elementsFromPoint[i])
            if ($eq.hasClass("gridSquare")) {
                // console.log($eq.attr("data-row") + "|" + $eq.attr("data-column"))
                $(".feauxComponent").remove()


                if (grid.endColumn) {
                    grid.endColumn = parseInt($eq.attr("data-column"))
                    grid.endRow = parseInt($eq.attr("data-row"))

                    flipHandler()

                    setCornerBorder(grid.row, grid.column, parseInt($eq.attr("data-row")) + grid.rowOffset, parseInt($eq.attr("data-column")) + grid.columnOffset, $(".currentTab").attr("data-page"))
                    createDefaultOf(componentType, $(".currentTab").attr("data-page"))
                        .addClass("feauxComponent")
                        .css("grid-column", grid.column)
                        .css("grid-row", grid.row)
                        .css("grid-column-end", parseInt($eq.attr("data-column")) + grid.columnOffset)
                        .css("grid-row-end", parseInt($eq.attr("data-row")) + grid.rowOffset)


                } else {
                    grid.column = parseInt($eq.attr("data-column"))
                    grid.row = parseInt($eq.attr("data-row"))

                    createDefaultOf(componentType, $(".currentTab").attr("data-page"))
                        .addClass("feauxComponent")
                        .css("grid-column", parseInt($eq.attr("data-column")))
                        .css("grid-row", parseInt($eq.attr("data-row")))

                    flipHandler()

                    setCornerBorder(grid.row, grid.column, grid.row, grid.column, $(".currentTab").attr("data-page"))

                }
                break
            }
        }

    }).off("pointerup.dragComponent").on("pointerup.dragComponent", (event) => {

        let clientDrag = clientDragHandler(event)

        let elementsFromPoint = $(document.elementsFromPoint(clientDrag.rawX, clientDrag.rawY))

        for (let i = 0; i < elementsFromPoint.length; i++) {
            let $eq = $(elementsFromPoint[i])
            if ($eq.hasClass("gridSquare")) {
                grid.endColumn = parseInt($eq.attr("data-column")) //+ grid.columnOffset
                grid.endRow = parseInt($eq.attr("data-row")) //+ grid.rowOffset
            }
        }

        for (let i = 0; i < elementsFromPoint.length; i++) {
            let $eq = elementsFromPoint.eq(i)
            if ($eq.hasClass("page")) {

                // let newComponent = createDefaultOf(componentType, $(".currentTab").attr("data-page"))
                //     .css("grid-column", parseInt(grid.column))
                //     .css("grid-row", parseInt(grid.row))
                //     .attr("data-row", parseInt(grid.row))
                //     .attr("data-column", parseInt(grid.column))

                if (grid.endColumn) {
                    jQueryReference
                        .css("grid-column", parseInt(grid.column))
                        .css("grid-row", parseInt(grid.row))
                        .attr("data-row", parseInt(grid.row))
                        .attr("data-column", parseInt(grid.column))
                        .css("grid-column-end", parseInt(grid.endColumn) + grid.columnOffset)
                        .css("grid-row-end", parseInt(grid.endRow) + grid.rowOffset)
                        .attr("data-endRow", grid.endRow)
                        .attr("data-endColumn", grid.endColumn)
                        .css("position", '')
                        .css("top", "")
                        .css("left", "")
                        .removeClass("currentDrag")
                        .appendTo($(".currentTab").attr("data-page"))
                    setCornerBorder(parseInt(grid.row), parseInt(grid.column), parseInt(grid.endRow) + grid.rowOffset, parseInt(grid.endColumn) + grid.columnOffset, $(".currentTab").attr("data-page"))

                }

                // jQueryReference.remove()
                $("html").off("pointermove.dragComponent pointerup.dragComponent ")
                $(".page").off("pointerdown.dragComponent")
                $(".feauxComponent").remove()
                $(".cornerBorder").remove()
                grid.row = 0
                grid.column = 0
                grid.endRow = 0;
                grid.endColumn = 0;
                grid.rowReverse = false
                grid.columnReverse = false
                grid.columnOffset = 1
                grid.rowOffset = 1

                break
            }
        }
    })

    $(".page").off("pointerdown.dragComponent").on("pointerdown.dragComponent", (event) => {
        let clientDrag = clientDragHandler(event)

        let elementsFromPoint = $(document.elementsFromPoint(clientDrag.rawX, clientDrag.rawY))
        $(".feauxComponent").remove()

        for (let i = 0; i < elementsFromPoint.length; i++) {
            let $eq = $(elementsFromPoint[i])

            if ($eq.hasClass("gridSquare")) {

                createDefaultOf(componentType, $(".currentTab").attr("data-page"))
                    .addClass("feauxComponent")
                    .css("grid-column", $eq.attr("data-column"))
                    .css("grid-row", $eq.attr("data-row"))

                grid.column = $eq.attr("data-column")
                grid.row = $eq.attr("data-row")
                grid.endColumn = parseInt($eq.attr("data-column")) + 1
                grid.endRow = parseInt($eq.attr("data-row")) + 1

                setCornerBorder(grid.row, grid.column, grid.row, grid.column, $(".currentTab").attr("data-page"))

            }
        }
        //grid row start && grid row end
    })
}

tabGrid(9, 4, ".uiTestTab")// <-- perfect for defailt
// tabGrid(18, 8, '.uiTestTab')

function tabGrid(columns, rows, tab) {
    let $tab = $(tab)

    //set the css grid to max square size and center it
    let cqval = setGridSize($tab, columns, rows)
    $(".gridUnderlay").css("grid-template-rows", "repeat(" + rows + " ," + cqval + "cqmin)").css("grid-template-columns", "repeat(" + columns + " ," + cqval + "cqmin)")

    $(window).off().on("resize", () => {
        let cqval = setGridSize($tab, columns, rows)
        $(".gridUnderlay").css("grid-template-rows", "repeat(" + rows + " ," + cqval + "cqmin)").css("grid-template-columns", "repeat(" + columns + " ," + cqval + "cqmin)")

    })

    $tab.attr("rows", rows).attr("columns", columns)
    $tab.css("background-color", "rgba(0,0,0,0)")
    $tab.offset()

    setGridUnderlay(columns, rows)
    // setGridUnderlay(size, tab)
}

function setGridSize($tab, columns, rows) {
    $tab.children().addClass("resizeSized")

    $tab.css("display", "grid").css("grid-template-columns", "repeat(" + columns + " ,1fr").css("grid-template-rows", "repeat(" + rows + " ,1fr")
    $tab.offset()
    let frSpan = $("<span>").css('width', ' 100%').css("height", "100%").appendTo($tab)

    let widthFr = frSpan.width()
    let heightFr = frSpan.height()

    frSpan.remove()

    $tab.offset()

    let cqval = 0
    if (widthFr < heightFr) {
        $tab.css("display", "grid").css("grid-template-columns", "repeat(" + columns + " ,1fr")

        let widthSpan = $("<span>").css('width', ' 100%').appendTo($tab)

        $tab.css("grid-template-rows", "repeat(" + rows + " ," + pxToCq($tab, widthSpan.width()).cqmin + "cqmin)").css("grid-template-columns", "repeat(" + columns + " ," + pxToCq($tab, widthSpan.width()).cqmin + "cqmin)")
        cqval = pxToCq($tab, widthSpan.width()).cqmin
        widthSpan.remove()
    } else {
        $tab.css("display", "grid").css("grid-template-rows", "repeat(" + rows + " ,1fr")

        //find fractional unit size for current grid
        let widthSpan = $("<span>").css('height', ' 100%').appendTo($tab)

        //convert the fractional unit to view units to avoid resizing overflow. 
        $tab.css("grid-template-columns", "repeat(" + columns + " ," + pxToCq($tab, widthSpan.height()).cqmin + "cqmin)").css("grid-template-rows", "repeat(" + rows + " ," + pxToCq($tab, widthSpan.height()).cqmin + "cqmin)")
        cqval = pxToCq($tab, widthSpan.height()).cqmin
        widthSpan.remove()
    }

    $tab.children().removeClass("resizeSized")
    return cqval
}

function setGridUnderlay(columns, rows) {
    $(".gridSquare").remove()
    for (let i = 0; i < columns * rows; i++) {
        //added 1 to be consitent with css namings.
        $("<div>").addClass("gridSquare").appendTo(".gridUnderlay").attr("data-column", (i % columns) + 1).attr("data-row", (Math.floor(i / columns)) + 1)
    }

}

function clientDragHandler(event, jQueryReference) {

    let clientDrag = {
        x: 0,
        y: 0,
        rawX: 0,
        rawY: 0,
        isTouch: false,
    }

    let jQueryDimensions



    if (jQueryReference) {
        jQueryReference.offset()

        jQueryDimensions = {
            height: jQueryReference.outerHeight(true) / 2,
            width: jQueryReference.outerWidth(true) / 2,
        }
        // console.log(jQueryDimensions)
    }

    clientDrag.rawX = event.pageX
    clientDrag.rawY = event.pageY
    if (jQueryReference) {
        clientDrag.x = event.pageX - jQueryDimensions.width
        clientDrag.y = event.pageY - jQueryDimensions.height
    }



    return clientDrag
}

function flipHandler() {
    //Handle flipping of corners to maintain origin gridspace

    if (grid.endRow || grid.endColumn) {

        if (grid.rowReverse && grid.endRow >= grid.row) {
            grid.row--
            grid.rowOffset = 1
            grid.rowReverse = false
        }
        if (!grid.rowReverse && grid.endRow < grid.row) {
            grid.row++
            grid.rowOffset = 0
            grid.rowReverse = true
        }

        if (grid.columnReverse && grid.endColumn >= grid.column) {
            grid.column--
            grid.columnOffset = 1
            grid.columnReverse = false
        }
        if (!grid.columnReverse && grid.endColumn < grid.column) {
            grid.column++
            grid.columnOffset = 0;
            grid.columnReverse = true
        }
    }

}

function setCornerBorder(row = endRow, column = endColumn, endRow, endColumn, append = false, remove = true) {
    if (remove) {
        $(".cornerBorder").remove()
    }
    let cornerBorder = $("<div>").addClass("cornerBorder")
        .css("grid-row", row)
        .css("grid-column", column)
        .css("grid-column-end", endColumn)
        .css("grid-row-end", endRow)


    if (append) {
        if ($(append).children().length > 0) {
            cornerBorder.insertBefore($(append).children().eq(0));
        } else {
            cornerBorder.appendTo(append)
        }
    }

    return cornerBorder
}


let editComponent = {
    currentTarget: false,
    valueType: false,
}

function createDefaultOf(component, append, topic = "esc-UNSET-esc") {
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
    }
}

function createActionButton(displayName, topic, append = false, hex = "#2b00ff") {
    let actionButton = $("<button>")
        .addClass("actionButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .attr("data-color", hex)
        .attr("data-componentType", "actionButton")
        .attr("data-defaultSimilarOptions", JSON.stringify(defaultSimilarOptions))
        .text(displayName)

    if (append) {
        actionButton.appendTo(append)
    }

    setSimilarOptions(actionButton, defaultSimilarOptions)
    addButtonToAnimate(actionButton)
    addEditHandler(actionButton, "boolean")

    return actionButton
}

function createOneShotButton(displayName, topic, append = false, hex = "#fff200") {
    let oneShotButton = $("<button>")
        .addClass("oneShotButton")
        .addClass(topic)
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .attr("data-color", hex)
        .attr("data-componentType", "oneShotButton")
        .attr("data-defaultSimilarOptions", JSON.stringify(defaultSimilarOptions))
        .text(displayName)

    if (append) {
        oneShotButton.appendTo(append)
    }

    setSimilarOptions(oneShotButton, defaultSimilarOptions)
    addButtonToAnimate(oneShotButton)
    addEditHandler(oneShotButton, "boolean")

    return oneShotButton
}

function createToggleButton(displayName, topic, append = false, hex = "#ff7300", value = false) {
    let toggleButton = $("<button>")
        .addClass("toggleButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", value)
        .attr("data-color", hex)
        .attr("data-componentType", "toggleButton")
        .attr("data-defaultSimilarOptions", JSON.stringify(defaultSimilarOptions))
        .text(displayName)

    if (value) {
        toggleButton.addClass("toggledOn")
    }

    if (append) {
        toggleButton.appendTo(append)
    }

    setSimilarOptions(toggleButton, defaultSimilarOptions)
    addButtonToAnimate(toggleButton)
    addEditHandler(toggleButton, "boolean", ".toggleSpecific")

    return toggleButton
}

function createAxis(displayName, topic, append = false, vertical = false, hex = "#8a2be2", value = 0, min = -1, max = 1, step = 0.01, snapBack = true) {
    let axis = {
        div: $('<div>').attr("data-defaultSimilarOptions", JSON.stringify(defaultSimilarOptions)),
        label: $("<h1>").addClass("axisLabel").addClass("editThisName"),
        knob: $("<input>")
    }

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

    setSimilarOptions(axis.div, defaultSimilarOptions)
    addEditHandler(axis.div, "double", ".axisSpecific")

    return axis
}

function createNumberComponent(title, topic, append = false, hex = 0, value = 0, min = -1, max = 1, step = 0.1, persist = false) {

    let numberComponent = {
        div: $("<div>").addClass("numberComponent").attr("data-type", 'double').attr("data-step", step).attr("data-min", min).attr("data-max", max).attr("data-value", value).attr("data-persist", persist).attr("data-topic", topic).attr("data-componentType", "numberComponent").attr("data-defaultSimilarOptions", JSON.stringify(defaultSimilarOptions)),
    }

    numberComponent["title"] = $("<p>").addClass("numberTitle").addClass("editThisName").text(title).appendTo(numberComponent.div)
    numberComponent["minus"] = $("<button>").addClass("numberMinus").addClass("animatedButton").text("-").appendTo(numberComponent.div)
    numberComponent["input"] = $("<input>").addClass("numberTextInput").attr("type", "number").attr("value", value).appendTo(numberComponent.div)
    numberComponent["plus"] = $("<button>").addClass("numberPlus").addClass("animatedButton").text("+").appendTo(numberComponent.div)

    if (append) {
        numberComponent.div.appendTo(append)
    }

    setSimilarOptions(numberComponent.div, defaultSimilarOptions)
    addEditHandler(numberComponent.div, "double", ".numberComponentSpecific")

    return numberComponent

    //    <button class="numberMinus animatedButton">-</button>
    //    <input class="numberTextInput" type="number" value="0"> <!-- value must match data-value -->
    //    <button class="numberPlus animatedButton">+</button>
    // </div>

}

function createDropdown(topic, append = false, hex = 0, initalOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions) {



    let dropdown = {
        div: $("<div>").addClass("select").attr("data-value", options[initalOptionIndex].value).attr("data-topic", topic).attr("data-type", "string").attr("data-componentType", "select").attr("data-componentOptions", JSON.stringify(options)).css("background-color", options[initalOptionIndex].color + "6b").attr("data-defaultSimilarOptions", JSON.stringify(similarOptions)),

    }

    dropdown["title"] = $("<h1>").appendTo(dropdown.div).addClass("selectTitle").text(options[initalOptionIndex].name)

    let $aO = []
    for (let i = 0; i < options.length; i++) {
        $aO.push($("<h1>").appendTo(dropdown.div).addClass("selectOption").text(options[i].name).attr("data-value", options[i].value).attr("data-hex", options[i].color).css("background-color", options[i].color));
    }

    dropdown["options"] = $aO

    if (append) {
        dropdown.div.appendTo(append)
    }

    setSelectOpener()
    setSimilarOptions(dropdown.div, similarOptions)
    addEditHandler(dropdown.div, "string")

    return dropdown
}

function createOptGroup(topic, append, hex = 0, initalOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions) {


    let optDiv = $("<div>").addClass("buttonOptGroup").attr("data-topic", topic).attr("data-type", "string").attr("data-componentOptions", JSON.stringify(options)).attr("data-componentType", "buttonOptGroup").attr("data-defaultSimilarOptions", JSON.stringify(similarOptions))

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

        let newButton = $("<button>").addClass("animatedButton").addClass("optGroupButton").attr("data-value", options[i].value).text(options[i].name).appendTo(optDiv).css("border-color", color.border).css("background-color", color.background)

        if (i == initalOptionIndex) {
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

function createBasicSubscription(displayName, topic, append = false, hex = false, similarOptions = defaultSimilarOptions) {

    let topicClass = topic.replaceAll(".", "esc-period-esc").replaceAll("/", "esc-Sl-esc")

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]
    }
    // console.log(topicClass)

    let basicSubscription = $("<div>")
        .addClass("basicSubscription")
        .attr("data-topic", topic)
        .attr("data-color", "#9d00ff")
        .attr("data-componentType", "basicSubscription")

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

    if (!subscribedTopics.hasOwnProperty(topic)) {
        subscribedTopics[topic] = []
    }

    let basicSubscriptionHandler = (value, timestamp) => {
        // console.log(value, "basicSubscriptionHandler")
        topicReference.text(value)
    }


    let subscribedReference = {
        'jQueryReference': topicReference,
        'parentReference': basicSubscription,
        'valueHandeler': basicSubscriptionHandler,
    }

    subscribedTopics[topic].push(subscribedReference)

    basicSubscription.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    if (nt4Client.serverTopics.get(topic)) {
        basicSubscriptionHandler(nt4Client.serverTopics.get(topic).value)
    }

    // console.log(topic)

    return basicSubscription

}

function createBasicLogger(displayName, topic, append = false, hex = "#0c0c0c", similarOptions = defaultSimilarOptions) {

    let topicClass = topic.replaceAll(".", "esc-period-esc").replaceAll("/", "esc-Sl-esc")

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]
    }
    // console.log(topicClass)

    let basicLogger = $("<div>")
        .addClass("basicLogger")
        .attr("data-topic", topic)
        .attr("data-componentType", "basicLogger")
        .css("border-color", hex)
        .attr("data-color", hex)

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

    let showAll = $("<h1>").addClass("showAll").text("⏿").appendTo(basicLogger).on("pointerdown", () => {
        let storedValues = subscribedTopics[basicLogger.attr("data-topic")][parseInt(basicLogger.attr("data-subscriptionIndex"))].storedValues

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

    if (!subscribedTopics.hasOwnProperty(topic)) {
        subscribedTopics[topic] = []
    }

    let basicLoggerHandler = (value, timestamp) => {
        // console.log(value, "basicSubscriptionHandler")
        // let basicallyLogged = $("<div>").addClass("basicallyLogged").appendTo(loggerValues)
        // $("<h1>").text(value).appendTo(basicallyLogged)
        // $("<h1>").text(timestamp).addClass("basicLoggerTimestamp").appendTo(basicallyLogged)

        // loggerValues.scrollTop(loggerValues[0].scrollHeight)

        //well try native instead of jquery for preformance
        if (subscribedTopics[topic]) {
            if (subscribedTopics[topic][parseInt(basicLogger.attr("data-subscriptionIndex"))]) {
                subscribedTopics[topic][parseInt(basicLogger.attr("data-subscriptionIndex"))].storedValues.push(value + "esc-timestampmarker-esc" + timestamp)

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

    subscribedTopics[topic].push(subscribedReference)

    basicLogger.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    if (nt4Client.serverTopics.get(topic)) {
        basicLoggerHandler(nt4Client.serverTopics.get(topic).value)
    }

    // console.log(topic)

    return basicLogger
}

function createNumberLine(displayName, topic, append = false, hex = "#0c0c0c", similarOptions = defaultSimilarOptions) {


    let numberLine = $("<div>").addClass("numberLine")
        .attr("data-topic", topic)
        .attr("data-componentType", "numberLine")
        .css("border-color", hex)
        .attr("data-color", hex)
        .attr("data-deriveAttributes", 'true')


    if (append) {
        numberLine.appendTo(append)
    }

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]
    }

    $("<h1>").text(displayName).addClass('numberLineTitle').addClass("editThisName").appendTo(numberLine)

    let numberLineMeterHolder = $("<div>").addClass("numberLineMeters").appendTo(numberLine)

    createNewMeter()
    function createNewMeter() {
        let newMeter = $("<div>").addClass("meterHolder").appendTo(numberLineMeterHolder)

        $("<div>").addClass("numberLineNoValue").appendTo(newMeter)
        $("<meter>").addClass("numberLineHasValue").appendTo(newMeter).attr("max", "0").attr("min", "0")

        return newMeter
    }

    setSimilarOptions(numberLine, similarOptions)
    addEditHandler(numberLine, "subscription", ".numberLineSpecific")

    if (!subscribedTopics.hasOwnProperty(topic)) {
        subscribedTopics[topic] = []
    }

    let numberLineHandler = (value) => {
        if (Array.isArray(value)) {

        } else {
            let meter = numberLineMeterHolder.children().eq(0).children('.numberLineHasValue')

            if (meter.length == 0) {
                meter = createNewMeter()
            }

            if (numberLine.attr("data-deriveAttributes") == "true") {
                if (Math.round(value) > parseFloat(meter.attr("max"))) {
                    meter.attr("max", Math.round(value))

                    let meterTopTextChAvgLength = (("0" + Math.round(value / 4) + "" + Math.round(value / 2) + "" + Math.round(value * 0.75) + "" + Math.round(parseFloat(value))).length) / 5

                    meter.attr("data-avgch", meterTopTextChAvgLength)
                }


            }

            meter.attr("value", value)
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

    subscribedTopics[topic].push(subscribedReference)

    numberLine.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    if (nt4Client.serverTopics.get(topic)) {
        numberLineHandler(nt4Client.serverTopics.get(topic).value)
    }


    return numberLine
}

function createRadialGauge(displayName, topic, append, hex = "#0c0c0c", maxDeg = 360, subTickCount = 5, maxNumber, minNumber, low, high, optimum, degOffset = 0, similarOptions = defaultSimilarOptions,) {
    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]
    }
    let radialGauge = $("<div>").addClass("radialGauge")
        .attr("data-topic", topic)
        .attr("data-componentType", "radialGauge")
        .css("border-color", hex)
        .attr("data-color", hex)


    if (append) {
        radialGauge.appendTo(append)
    }

    $("<h1>").addClass("radialGaugeTitle").addClass("editThisName").text(displayName).appendTo(radialGauge)

    let gauge = $("<div>").addClass("gauge").attr("data-maxDeg", maxDeg).attr("data-offsetDeg", degOffset).appendTo(radialGauge)

    if (maxNumber) {
        gauge.attr("data-maxNumber", maxNumber)
    }
    if (minNumber) {
        gauge.attr("data-minNumber", minNumber)
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

    for (let i = 0; i < subTickCount; i++) {
        $("<div>").addClass("subTick").appendTo(subTicks)
    }

    setSimilarOptions(radialGauge, similarOptions)
    addEditHandler(radialGauge, "subscription", ".radialGaugeSpecific")

    if (!subscribedTopics.hasOwnProperty(topic)) {
        subscribedTopics[topic] = []
    }

    let gaugeHandler = (value) => {
        let whichMax = gauge.attr("data-maxNumber")

        if (!whichMax) {
            gauge.attr("data-maxDeg")
        }

        gauge[0].style.setProperty("--gaugeColor", emulateMeterColors(gauge.attr("data-minNumber"), whichMax, gauge.attr("data-low"), gauge.attr("data-high"), gauge.attr("data-optimum"), value))

        if (gauge.attr("data-maxNumber")) {
            gauge.removeAttr("data-valDeg")
            gauge.attr("data-valNumber", value)

            return
        }
        gauge.attr("data-valDeg", value)
    }

    let subscribedReference = {
        'jQueryReference': false,
        'parentReference': radialGauge,
        'valueHandeler': gaugeHandler,
    }

    subscribedTopics[topic].push(subscribedReference)

    radialGauge.attr("data-subscriptionIndex", subscribedTopics[topic].length - 1)

    if (nt4Client.serverTopics.get(topic)) {
        gaugeHandler(nt4Client.serverTopics.get(topic).value)
    }


    return radialGauge
}

setGridInput(".uiTestTab")

function setGridInput(tab) {

    for (let i = 0; i < 2; i++) {
        let currentSetting
        let current

        if (i == 0) {
            currentSetting = $(".setGridRow")
            current = 'Row'
        }
        else {
            currentSetting = $(".setGridColumn")
            current = "Column"
        }

        function findMin(currentMin, val, current) {
            let min = currentMin
            let minElement = []

            let components = $($(".currentTab").attr("data-page")).children()
            for (let i = 0; i < components.length; i++) {
                let $eq = components.eq(i)

                let minValues = {
                    current: parseInt($eq.attr("data-" + current.toLowerCase())),
                    currentEnd: parseInt($eq.attr("data-end" + current))
                }

                if (minValues.current > minValues.currentEnd) {
                    minValues.current--
                }

                if (minValues.current > min) {
                    min = minValues.current
                    minElement = [$eq]
                } else if (minValues.current == min) {
                    minElement.push($eq)
                }

                if (minValues.currentEnd > min) {
                    min = minValues.currentEnd
                    minElement = [$eq]
                } else if (minValues.currentEnd == min) {
                    minElement.push($eq)
                }
            }
            if (minElement && min == val + 1) {
                for (let i = 0; i < minElement.length; i++) {
                    let gridProperties = {
                        offsetX: 1,
                        offsetY: 1,
                    }

                    if (minElement[i].attr("data-endRow") < parseInt(minElement[i].attr("data-row"))) {
                        gridProperties.offsetY = 0
                    }

                    if (minElement[i].attr("data-endColumn") < parseInt(minElement[i].attr("data-column"))) {
                        gridProperties.offsetX = 0
                    }

                    let borderWarn = setCornerBorder(minElement[i].attr("data-row"), minElement[i].attr("data-column"), parseInt(minElement[i].attr("data-endRow")) + gridProperties.offsetY, parseInt(minElement[i].attr("data-endColumn")) + gridProperties.offsetX, $(".currentTab").attr("data-page"), false).css("animation-name", "cornerWash")
                    setTimeout(() => {
                        borderWarn.remove()
                    }, 1500);
                }
            }
            minElement = []
            return min
        }



        currentSetting.children(".numberPlus").on("pointerdown ", (event) => {
            let $ct = $(event.currentTarget)
            let max = parseFloat($ct.parent().attr("data-max"))
            let step = parseFloat($ct.parent().attr("data-step"))
            let $numberTarget = $ct.parent().children(".numberTextInput")
            let currentVal = roundToNearestX(parseFloat($numberTarget.val()) + step, step)
            if (currentVal <= max) {
                $numberTarget.val(currentVal)
                $ct.parent().attr("data-value", $numberTarget.val())

                tabGrid(parseInt($(".setGridColumn").attr("data-value")), parseInt($(".setGridRow").attr("data-value")), tab)
            }
        })
        currentSetting.children(".numberMinus").on("pointerdown ", (event) => {
            let $ct = $(event.currentTarget)





            let step = parseFloat($ct.parent().attr("data-step"))
            let $numberTarget = $ct.parent().children(".numberTextInput")
            let currentVal = roundToNearestX((parseFloat($numberTarget.val()) - step), step)

            let min = findMin(parseFloat($ct.parent().attr("data-min")), currentVal, current)

            if (currentVal >= min) {
                $numberTarget.val(currentVal)
                $ct.parent().attr("data-value", $numberTarget.val())

                tabGrid(parseInt($(".setGridColumn").attr("data-value")), parseInt($(".setGridRow").attr("data-value")), tab)

            }
        })
        currentSetting.children(".numberTextInput").on("blur", (event) => {
            event.preventDefault()

            let $ct = $(event.currentTarget)
            let max = parseFloat($ct.parent().attr("data-max"))

            let min = findMin(parseFloat($ct.parent().attr("data-min")), $ct.val() - 1, current)



            if ($ct.val() > max) {
                $ct.val(max)
            } else if ($ct.val() < min) {
                $ct.val(min)
            }
            $ct.parent().attr("data-value", $ct.val())

            tabGrid(parseInt($(".setGridColumn").attr("data-value")), parseInt($(".setGridRow").attr("data-value")), tab)
        })
    }
}

$(".trashCan").on(" pointerdown.activateTrashCan", (event) => {
    $(".trashCan").toggleClass("trashActive")
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

$(".editSidebar").find(" .numberTextInput").on("blur", (event) => {
    //Use parentQueries to ensure selecting right element (as always)

    let $currentInput = $(event.currentTarget)

    let min = $currentInput.parent().parent().find(".min")
    let max = $currentInput.parent().parent().find(".max")
    let val = $currentInput.parent().parent().find(".value")
    let step = $currentInput.parent().parent().find(".step")
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

let dragInfo = {
    initalY: 0,
    currentY: 0,
    phased: false,
    margined: false,
}

handleOptionDrag()

function handleOptionDrag() {

    $(".multiAdder").on("pointermove.drag", (event) => {
        if (!dragInfo.phased) return

        dragInfo.phased.css("top", event.pageY - vh(4.5 / 2) + "px")
    })

    $(".sideBar").on("pointerup.sidebarDrag pointerleave.sidebarDrag", (event) => {
        dragInfo = {
            initalY: 0,
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

function addOptionDragHandler($element) {
    $element.children(".hamburger").off("pointerdown.startDrag").on("pointerdown.startDrag", (event) => {

        //bro i was like, you know what, ima not use event.current target, ima use $element inside the lambda like a normal person
        //and guess what
        //it would select like half the elements in the div
        //currenttaget my beloved 

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

$(".optionAdder").on("submit.addDiv", () => {
    let $sbO = $("<div>").addClass("sidebarOption").insertBefore(".optionAdder").attr("data-name", $(".newOptionName").val()).attr("data-value", $(".newOptionValue").val()).attr("data-hex", $(".hex").val()).css("border-color", $(".hex").val())
    let $ham = $("<button>").addClass("sideBarEmojiButton").addClass("hamburger").text("☰").appendTo($sbO)
    $("<p>").text($(".newOptionName").val() + ":" + $(".newOptionValue").val()).appendTo($sbO)
    let clear = $("<div>").text("❌").addClass("sideBarEmojiButton").addClass("trashOption").appendTo($sbO).on("pointerdown.remove", (event) => {
        $(event.currentTarget).parent().remove()

    }
    )

    $(".newOptionName").val("")
    $(".newOptionValue").val("")
    addOptionDragHandler($sbO)

    return false
})

function addEditHandler(element, valueType, specificClass = false) {
    element.on("pointerdown.editHandler", (event) => {
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
            $(".editSidebar").css("display", "none")

            if (specificClass) {
                $(specificClass).css("display", "")
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

$(".editNavBack, .trashCan").on("pointerdown.resetEditor", () => {
    $(".addButtons").css("display", "")
    $(".sideBar").off("pointerup.setEdit pointermove.setEdit")
    $(".editNavButtons").css("display", "none")
    setCornerBorder(0, 0, 0, 0, 0, true)
    $(".allComponentOptions").css("display", "none")
    $(".specificComponent").css("display", "none")
    $(".editSidebar").css("display", "none")
    $(".ioComponents").css("display", "none")
    $(".outputComponents").css("display", "none")

    $("." + $(".sideBarUnderline").attr("data-sidebarClass")).css("display", "flex")


})

function bindEditMenu(element, valueType, specificClass = false) {

    let inputs = $("." + valueType + "Sidebar").find(".isEdit, .isntEdit").val("")


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
        } else if (inputBeingBound.attr("data-editing") == "optionArray") {
            bindMultiAdder(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "changeTopic") {
            bindChangeSubscriptionTopic(inputBeingBound)
        } else {
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

    function bindName(inputBeingBound) {
        //defaults selection to all text for easy deletion
        let nameInputText = editComponent.currentTarget.text()
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

                if ($ct.val().length == 0) {
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

    function bindMultiAdder(inputBeingBound) {
        let foundComponentOptions = JSON.parse(editComponent.currentTarget.attr("data-componentOptions"))

        $(".multiAdder").children(".sidebarOption").remove()

        for (let j = 0; j < foundComponentOptions.length; j++) {

            if (foundComponentOptions[j].name == "" || foundComponentOptions[j].value == "") continue

            let $sbO = $("<div>").addClass("sidebarOption").insertBefore(".optionAdder").attr("data-name", foundComponentOptions[j].name).attr("data-value", foundComponentOptions[j].value).attr("data-hex", foundComponentOptions[j].color).css("border-color", foundComponentOptions[j].color)
            let $ham = $("<button>").addClass("sideBarEmojiButton").addClass("hamburger").text("☰").appendTo($sbO)
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

        let oAC = $(".optionAdder").off("submit.setComponent").on("submit.setComponent", () => {
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

        if (editComponent.currentTarget.hasClass("buttonOptGroup")) {
            newComponent = createOptGroup(eDCT.attr("data-topic"), $(".currentTab").attr("data-page"), eDCT.attr("data-color"), 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions"))).div
                .css("grid-area", eDCT.css("grid-area"))
                .attr("data-row", eDCT.attr("data-row"))
                .attr("data-column", eDCT.attr("data-column"))
                .attr("data-endRow", eDCT.attr("data-endRow"))
                .attr("data-endColumn", eDCT.attr("data-endColumn"))
                .attr("data-componentOptions", JSON.stringify(componentsOptions))

        } else {
            newComponent = createDropdown(eDCT.attr("data-topic"), $(".currentTab").attr("data-page"), eDCT.attr("data-color"), 0, componentsOptions, JSON.parse(eDCT.attr("data-defaultsimilaroptions"))).div
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
        let eDCT = editComponent.currentTarget

        inputBeingBound.off("pointerdown.changeTopic").on("pointerdown.changeTopic", () => {
            outputComponents.changing = true
            outputComponents.changingSidebar = $("." + valueType + "Sidebar")
            outputComponents.changingSidebar.css("display", "none")
            $(".outputTopics").css("display", "flex")
        })

    }

}

function findEndOffset(row, column, endRow, endColumn) {
    let gridPoses = {
        "row": parseFloat(row),
        "column": parseFloat(column),
        "endRow": parseFloat(endRow),
        "endColumn": parseFloat(endColumn)
    }


    if (gridPoses.endRow >= gridPoses.row) {
        gridPoses.endRow++
    }

    if (gridPoses.endColumn >= gridPoses.column) {
        gridPoses.endColumn++
    }


    return gridPoses
}

$(".reposistionComponent").on("pointerdown.reposComponent", (event) => {
    $(".sideBar").off("pointerup.setEdit pointermove.setEdit")

    setCornerBorder(0, 0, 0, 0, 0, true)
    let currentDrag = clientDragHandler(event, editComponent.currentTarget)
    // console.log(editComponent.currentTarget.attr("data-componentType"))
    addToCurrentDrag(editComponent.currentTarget, currentDrag.x, currentDrag.y, editComponent.currentTarget.attr("data-componentType"))
})

function multiSwitchButtonSet(element, optionValue) {
    let children = element.children("input")
    let option

    for (let i = 0; i < children.length; i++) {
        if (children.eq(i).val() == optionValue) {
            option = children.eq(i)
            break
        }
    }
    let leftOffset = option.offset().left - option.parent().offset().left
    option.parent().find(".multiSliding").css("margin-left", leftOffset + "px")
    option.parent().attr("data-value", option.val())
}

function setSimilarOptions(element, similarOptions = JSON.parse($(element).attr("data-defaultSimilarOptions"))) {

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

function changeSimilarInputs(similarOptions) {
    if (similarOptions.fill) {
        $(".fillSpaceCheckbox")[0].checked = true

    } else {
        $(".fillSpaceCheckbox")[0].checked = false

    }

}

$(".fillSpaceCheckbox").on("input", () => {
    defaultSimilarOptions.fill = $(".fillSpaceCheckbox")[0].checked
    setSimilarOptions(editComponent.currentTarget, defaultSimilarOptions)
})

// captureMJPEG($(".cameraComponent"))

function captureMJPEG(cameraComponent) {

    //cameraComponent
    // <div class="cameraComponent">
    //     <h1>Camera Stream</h1>
    //     <img src="http://localhost:1181/stream.mjpg" class="cameraStream">
    //     <canvas class="encoder"></canvas>
    //     <div class="cameraNav">
    //         <button class="record emojiButton">🔴</button>
    //     </div>
    //</div>

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
    let animationFrame

    mJpegStream.on("load", () => {
        encoder.attr("height", mJpegStream[0].naturalHeight).attr("width", mJpegStream[0].naturalWidth)

        let currentStream = encoder[0].captureStream(30); //TODO: unhardcode this

        mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'video/webm; codecs=vp9' })

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedBlob.push(event.data);
            }
        }

        mediaRecorder.onstop = () => {
            let blob = new Blob(recordedBlob, {
                type: 'video/mp4' //TODO: unhardcode this let the ppl use mp4 if they want fr
            })

            let downloadUrl = URL.createObjectURL(blob)

            let filename = cameraComponent.attr("data-usTimestamp") + "" + cameraComponent.attr("data-streamTopic")

            let $a = $("<a>").css("display", "none").attr("href", downloadUrl)
            $a[0].download = "video.mp4"//TODO: unhardcode this let the ppl use mp4 if they want fr

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
        animationFrame = requestAnimationFrame(drawToCanvas);
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

}

$(".openOutput").on("pointerdown", (event) => {
    $(".ioComponents").css("display", "none")
    $(".editSidebar").css("display", "none")
    $(".outputTopics").css("display", "flex")
    $(".sideBarUnderline").removeClass("sideBarUnderline")
    $(".openOutput").addClass("sideBarUnderline")
})

$(".openInput").on("pointerdown", (event) => {
    $(".ioComponents").css("display", "none")
    $(".editSidebar").css("display", "none")
    $(".inputComponents").css("display", "flex")
    $(".sideBarUnderline").removeClass("sideBarUnderline")
    $(".openInput").addClass("sideBarUnderline")
})


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
absAsBackup($(".leftTicks"), "min")

let testScale = findNiceScale(absAsBackup($(".leftTicks"), "min"), absAsBackup($(".leftTicks"), "max"))

setTickScale(testScale, $(".leftTicks"))
// setTickScale(findDependantScale($(".rightTicks").attr("data-min"), $(".rightTicks").attr("data-max"), testScale), $(".rightTicks"))
let testSync = findRelativeScale(absAsBackup($(".rightTicks"), "min"), (absAsBackup($(".rightTicks"), "max")), testScale)
// let testSync = findNiceScale($(".rightTicks").attr("data-min"), ($(".rightTicks").attr("data-max")))

let viewableZoomedUnits = 14
let rightZoomedOffset = 0

let offsetY = 0

console.log(testSync)

setMinMax(setTickScale(testSync, $(".rightTicks")))



setInterval(() => {


    // $(".bottomTicks").attr("data-max", nt4Client.getServerTime_us() / 1000000.0)

    // $(".bottomTicks").attr("data-min", (nt4Client.getServerTime_us() / 1000000.0) - viewableZoomedUnits)
    if ($(".bottomTicks").attr("data-max") == "false") {
        $(".bottomTicks").attr("data-min", (nt4Client.getServerTime_us() / 1000000.0) - viewableZoomedUnits)
        $(".bottomTicks").attr("data-absmax", (nt4Client.getServerTime_us() / 1000000.0))
    }


    let yscale = findNiceScale(absAsBackup($(".bottomTicks"), "min"), absAsBackup($(".bottomTicks"), "max"))

    setTickScale(yscale, $(".bottomTicks"))

}, 1);


$(".graph").on("wheel", (event) => {
    zoomHandler(event, $(".graph"))
})

let initiatedScrollAxis = ''
let currentResetTimeout;

function zoomHandler(event, graph) {
    // console.log(event)
    // console.log(event)

    let tolerance = 4

    let bottomTicks = graph.children(".bottomTicks")
    let rightTicks = graph.children(".rightTicks")
    let leftTicks = graph.children(".leftTicks")
    let holder = graph.children(".graphHolder")

    let pointer = {
        absX:event.pageX,
        absY:event.pageY,
        x: event.pageX - holder.offset().left,
        y: event.pageY - holder.offset().top,
        xP:0,
        yP:0
    }


    pointer.xP = clamp(pointer.x / holder.width())
    pointer.yP = clamp(pointer.y / holder.height())

    if ((event.originalEvent.deltaY > tolerance || event.originalEvent.deltaY < -tolerance) && !initiatedScrollAxis) {
        initiatedScrollAxis = "Y"
    }
    else if ((event.originalEvent.deltaX > tolerance || event.originalEvent.deltaX < -tolerance) && !initiatedScrollAxis) {
        initiatedScrollAxis = "X"
    }

    if (event.ctrlKey) {
        initiatedScrollAxis = "Y"
    }

    if (initiatedScrollAxis == "Y" && offsetY == 0) {
        event.preventDefault()

        if (event.ctrlKey) { viewableZoomedUnits += event.originalEvent.deltaY / 50 }
        else { viewableZoomedUnits += event.originalEvent.deltaY }

        if (viewableZoomedUnits <= 0.5) {
            viewableZoomedUnits = 0.5
        }

        if (bottomTicks.attr("data-max") != "false") {
            let oldVal = parseFloat(bottomTicks.attr("data-max"))

            bottomTicks.attr("data-max", oldVal)
            bottomTicks.attr("data-min", oldVal - viewableZoomedUnits)
        }

        let yscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

        console.log(viewableZoomedUnits)

        setTickScale(yscale, bottomTicks)

        clearTimeout(currentResetTimeout);

        currentResetTimeout = setTimeout(() => {
            initiatedScrollAxis = ''
        }, 100);



    } else if(initiatedScrollAxis == "Y"){
        event.preventDefault()

        


        if (event.ctrlKey) { 
            viewableZoomedUnits += event.originalEvent.deltaY / 50 
        }
        else { 
            viewableZoomedUnits += event.originalEvent.deltaY
        }

        if (viewableZoomedUnits <= 0.05) {
            viewableZoomedUnits = 0.05
        }

        if (bottomTicks.attr("data-max") != "false") {
            let oldValMax = parseFloat(bottomTicks.attr("data-max"))
            let oldValMin = parseFloat(bottomTicks.attr("data-min"))

            let range = oldValMax - oldValMin;

            // let min = viewableZoomedUnits * (pointer.xP)
            // let max = viewableZoomedUnits * (1-pointer.xP)

            bottomTicks.attr("data-min", viewableZoomedUnits * (pointer.xP))
            bottomTicks.attr("data-max", viewableZoomedUnits * (1-pointer.xP))
        }
        console.log(viewableZoomedUnits)

        console.log(bottomTicks.attr("data-min"), bottomTicks.attr("data-max"))

        let yscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

        setTickScale(yscale, bottomTicks)

        clearTimeout(currentResetTimeout);

        currentResetTimeout = setTimeout(() => {
            initiatedScrollAxis = ''
        }, 100);

    }


    if (initiatedScrollAxis == "X") {
        event.preventDefault()

        if (event.ctrlKey) { offsetY = event.originalEvent.deltaX / -50 }
        else { offsetY = -event.originalEvent.deltaX }

        if (bottomTicks.attr("data-max") == "false") {
            bottomTicks.attr("data-max", bottomTicks.attr("data-absMax"))
            console.log(bottomTicks.attr("data-absMax"))
        }

        let oldVal = parseFloat(bottomTicks.attr("data-max"))

        if (oldVal > parseFloat(bottomTicks.attr("data-absmax"))) {
            bottomTicks.attr("data-max", "false")

            offsetY = 0
            initiatedScrollAxis = 'paused'

            clearTimeout(currentResetTimeout);

            currentResetTimeout = setTimeout(() => {
                initiatedScrollAxis = ''
            }, 1000);

            return
        }

        // console.log(oldVal)

        bottomTicks.attr("data-max", oldVal - offsetY)
        bottomTicks.attr("data-min", oldVal - offsetY - viewableZoomedUnits)

        let yscale = findNiceScale(absAsBackup(bottomTicks, "min"), absAsBackup(bottomTicks, "max"))

        setTickScale(yscale, bottomTicks)

        clearTimeout(currentResetTimeout);

        currentResetTimeout = setTimeout(() => {
            initiatedScrollAxis = ''
        }, 100);
    }
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


    let children = element.children()



    for (let i = 0; i < children.length; i++) {
        let eq = children.eq(i)

        //set text from computed css text 
        if (children.length - 1 - i > foundNiceScale.amountOfTicksNeeded - 1) {
            eq.text("")
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

    let numTicks = niceScale.amountOfTicksNeeded
    let percision = niceScale.percision

    min = parseFloat(min) * displacement
    max = parseFloat(max) * displacement

    if (min === max) {
        // Handle the edge case where the min and max are the same (e.g., all data points are identical)
        const range = Math.abs(min * 0.1) || 1; // Use 10% of the value, or 1 if value is 0
        min -= range;
        max += range;
    }

    const range = max - min;
    const initialTickSpacing = range / (numTicks > 1 ? numTicks : 5); // Ensure numTicks is at least 1 or 5 for safety

    // --- Step 1: Determine the exponent/power of 10 for the range
    const exponent = Math.floor(Math.log10(initialTickSpacing));
    const powerOf10 = Math.pow(10, exponent);

    // --- Step 2: Determine the "nice" fractional part of the tick spacing
    const fractionalSpacing = initialTickSpacing / powerOf10;

    // Nice numbers are 1, 2, or 5 (multiplied by a power of 10)
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

    // --- Step 3: Calculate the final "nice" tick spacing
    const niceSpacing = (niceFractional * powerOf10) / displacement;

    // --- Step 4: Calculate the new rounded min and max values
    // The new min is the largest multiple of niceSpacing less than or equal to the original min
    const niceMin = (Math.floor(min / niceSpacing) * niceSpacing) / displacement;

    // The new max is the smallest multiple of niceSpacing greater than or equal to the original max
    const niceMax = Math.ceil(max / niceSpacing) * niceSpacing;

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


    if (val == "false") {
        return element.attr("data-abs" + attr)
    }

    return val
}

function setMinMax(scaleObject) {
    scaleObject.element.attr("data-min", scaleObject.minimum).attr("data-max", scaleObject.maximum)
}