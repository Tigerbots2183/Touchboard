// import "./nt4.js"

//TODO:
// Fix removing the last tab still displaying the removed tab 
// Fix the row and column buttons not being bound by defualt
// Fix changing topic for a struct


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


// A few things of note, 
//
//Due to the fact that these buttons may actuate mechanisims, persistance is based on when
//touchboard is connected, not on network tables built in feature
//
//Removal of a component may not clear its value, if this becomes an issue it can, but currently
//it will be difficult to track if multiple components have input on one topic.
//
//Multiple topics may be bound to one component, but as of now they will NOT update each other.
//So usage of multiple is not recommnded besides action and one shot buttons. 

let subscribedTopics = {
    //"Topic": [{jQueryReference :$, parentRefernce: $, valueHandler: function()/false}]
}

const isObject = (val) => val !== null && typeof val === 'object';

var toastOpen = false
var toastTimeout;

export function toastMessage(message, color = "#7300ff") {

    $(".toast").css("background-color", color).css("display", "inherit")
    $(".toast").offset()
    if (!toastOpen) {
        document.querySelector(".toast").classList.toggle("toasted")
        $("#toastMessage").text(message)
        toastOpen = true
        toastTimeout = setTimeout(() => {
            if (toastOpen) {
                document.querySelector(".toast").classList.toggle("toasted")
                setTimeout(() => {
                    $(".toast").css("display", "none")
                }, 400);
                toastOpen = false
            }
        }, 3000);
    } else {
        $("#toastMessage").text(message)
        clearTimeout(toastTimeout)
        toastTimeout = setTimeout(() => {
            if (toastOpen) {
                document.querySelector(".toast").classList.toggle("toasted")
                setTimeout(() => {
                    $(".toast").css("display", "none")
                }, 400);
                toastOpen = false
            }
        }, 2000);
    }
}


const MathUtils = {

    _getFactor(n1, n2) {
        const s1 = n1.toString();
        const s2 = n2.toString();

        const d1 = (s1.split('.')[1] || '').length;
        const d2 = (s2.split('.')[1] || '').length;

        return Math.pow(10, Math.max(d1, d2));
    },

    add(n1, n2) {
        const factor = this._getFactor(n1, n2);
        return (Math.round(n1 * factor) + Math.round(n2 * factor)) / factor;
    },

    subtract(n1, n2) {
        const factor = this._getFactor(n1, n2);
        return (Math.round(n1 * factor) - Math.round(n2 * factor)) / factor;
    }
};

import { NT4_Client } from "../lib/nt4.js";
import { serialize, deserialize } from "../lib/msgpack.js";
import { goToNextSong } from "./jukebox.js";
import { setFromString, moveTo, lineTo } from "./autoBuilder.js";
import { drawNewData, CONVERSIONRATE } from "./graph.js";

//if removing jukebox, get rid of the gotonextsong() in the handle data callback function, remove from html, and remove import
export function getHtmlFileName() {
    let path = window.location.pathname;
    let segments = path.split('/'); // Split the path by the '/' character
    let fileName = segments.pop();
    // Get the last element of the array, which is the filename
    return fileName.slice(0, -5);
}

document.body.addEventListener("drop", (event) => { event.preventDefault(); event.stopPropagation() }, false)
document.body.addEventListener("dragover", (event) => { event.preventDefault() }, false)

export function clamp(num, min = 0, max = 1) { return Math.min(Math.max(num, min), max) };

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

export function pxToCq(container, pixels) {

    let cqValues = {
        cqw: (pixels / cq(container, 1).cqw),
        cqh: (pixels / cq(container, 1).cqh),
        cqmax: (pixels / cq(container, 1).cqmax),
        cqmin: (pixels / cq(container, 1).cqmin),
    }

    return cqValues
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



function addButtonToAnimate(jQueryReference) {
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

// $(".tab").on("pointerdown ", (event) => {
//     let $ct = $(event.currentTarget)
//     $(".page, .pageF").css("display", "none")
//     $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
//     $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
//     if ($ct.attr("data-displaytype") == null) {
//         $($ct.attr("data-page")).css("display", "grid")
//     } else {
//         $($ct.attr("data-page")).css("display", $ct.attr("data-displaytype"))

//     }

//     let currentPage$ = $($ct.attr("data-page"))

//     if (!$($ct.attr("data-page")).hasClass("pageF")) {
//         tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)
//         setGridInput(currentPage$)
//     }
// })


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
    $(".select").not(".sideBarSelect").off("pointerdown.selectOpener").on("pointerdown.selectOpener", (event) => {
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
    "Touchboard" + Math.random().toString().slice(2),
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
// type: [topics...]

function topicToSidebar(topic, schemasPassed = false) {
    if (topic.type.includes("proto") || topic.type.includes("structschema")) return
    if (topic.type.includes("struct") && !schemasPassed) return;
    let actualName = topic.name;
    let split = topic.name.split("/")
    split.shift();

    let currentPath = topicObject
    // console.log(topicObject)
    //decodes topic path into an object and makes them appear in the sdiebar
    for (let i = 0; i < split.length; i++) {
        // if(i == 0 && split[i] == "touchboard") continue
        if (currentPath[split[i]] && i < split.length - 1) {

            currentPath = currentPath[split[i]]

            continue
        } else if (i >= split.length - 1 && topic.type.includes('struct')) {
            //If last in topic- and struct, make a folder

            createFolder(split[i], i)

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
                        console.log(createButton(name, i, name, type, topic.structName + "/" + name))

                        continue;
                    } else {
                        createFolder(name, i, name, type);
                        topic.structName += "/" + name
                        decodeStruct(type);
                        continue;
                    }
                }
            }
        } else {

            if (i >= split.length - 1 && !topic.type.includes('struct')) {
                //If last in topic, make the button for it, unless its a struct then it will be treated as a folder
                createButton(split[i], i)
                continue
            }

            createFolder(split[i], i)
        }
    }
    function createButton(split, i, topicname = topic.name, topictype = topic.type, fullpath = "") {
        let parentDiv
        if (i == 0) parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"])
        else parentDiv = $("<div>").addClass("topicPathDiv").appendTo(currentPath["esc-esc-$-esc-esc"].children(".subPaths"))


        let src = ""
        let typeString

        let image = $("<img>").appendTo(parentDiv)
        let h1 = $("<h1>").text(split).appendTo(parentDiv)
        currentPath[split] = topic
        currentPath[split]["esc-esc-$-esc-esc"] = parentDiv

        let $allOf = $(parentDiv).add(image).add(h1)

        if (topictype.includes('string')) {
            src = "TextIcon.png"
            typeString = 'string'
        }
        // else if (topic.type.includes('struct')) {
        //     src = "StructIcon.png"
        //     typeString = 'struct'
        //     // parentDiv.css("display", "none")
        // }
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
            if (outputComponents.changing) {
                outputComponents.changingSidebar.css("display", "flex")

                console.log(subscribedTopics)

                if (!subscribedTopics.hasOwnProperty(topicname)) {
                    subscribedTopics[topicname] = []
                }

                let newSubscriptionReference = subscribedTopics[editComponent.currentTarget.attr('data-topic')].slice(editComponent.currentTarget.attr("data-subscriptionIndex"), parseInt(editComponent.currentTarget.attr("data-subscriptionIndex")) + 1)
                subscribedTopics[topicname].push(newSubscriptionReference[0])

                console.log(subscribedTopics)

                subscribedTopics[editComponent.currentTarget.attr('data-topic')][editComponent.currentTarget.attr("data-subscriptionIndex")] = false

                editComponent.currentTarget.attr("data-topic", topicname).attr("data-subscriptionindex", subscribedTopics[editComponent.currentTarget.attr('data-topic')].length - 1).find(".editThisName").text(split)




                if (nt4Client.serverTopics.get(topicname)) {
                    let val = "null"
                    if (nt4Client.serverTopics.get(topicname).value) {
                        val = nt4Client.serverTopics.get(topicname).value
                    }
                    if (newSubscriptionReference[0].topicChangeHandler) {
                        newSubscriptionReference[0].topicChangeHandler(topicname, val)
                    }

                    newSubscriptionReference[0].valueHandeler(val)
                } else {
                    if (newSubscriptionReference[0].topicChangeHandler) {
                        newSubscriptionReference[0].topicChangeHandler(topicname, "")
                    }

                    newSubscriptionReference[0].valueHandeler("")
                }



                outputComponents.changingSidebar.find(".topicShower").text(topicname)
                outputComponents.changingSidebar.find(".nameInput").val(split)


                setTimeout(() => {
                    outputComponents.changing = false
                }, 100);

                console.log(subscribedTopics)
            } else {
                $("." + typeString + "OutputComponents").css("display", "flex")
            }
            console.log(topic.name)

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

    function createFolder(split, i) {
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

        let h1 = $("<h1>").text(split).appendTo(parentDiv)

        //This will be where the actual sidebar buttons are stored
        let subDiv = $("<div>").addClass("subPaths").appendTo(parentDiv)

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


function doNothing() { }



$("#connect").on("click", () => {
    if (!$("#connect").is(":checked")) {
        $(".connectionText").text("Offline")
        localStorage.setItem(getHtmlFileName() + "connect", "false")
        $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

        $("html").css("background-color", "rgb(32, 32, 32)")
        $(".tab").css("background-color", "rgb(12, 12, 12)")
        $(".addTab").css("background-color", "rgb(32, 32, 32)")
        $(".tabManager").css("background-color", "rgb(32, 32, 32)")
        $(".tabCreator").css("background-color", "rgb(32, 32, 32)")

        $(".tabNav").css("background-color", "rgb(12, 12, 12)")
        $(".currentTab").css("background-color", "rgb(32, 32, 32)")
        nt4Client.disconnect()

    } else {
        $(".connectionText").text("Connecting")
        localStorage.setItem(getHtmlFileName() + "connect", "true")
        $(".fullScreen").css("background-color", "")

        $("html").css("background-color", "")
        $(".tab").css("background-color", "")
        $(".addTab").css("background-color", "")
        $(".tabManager").css("background-color", "")
        $(".tabCreator").css("background-color", "")


        $(".tabNav").css("background-color", "")
        $(".currentTab").css("background-color", "")
        nt4Client.disconnect()

        nt4Client.connect()
        $(".tabConnection").removeClass("tabConnection")
    }
})


let OdometryFrequencyKeys = []
let OdometryFrequencyValues = []
let currentodomts

export function drawOdom() {

    let kr = new Float32Array(OdometryFrequencyKeys)
    let vr = new Float32Array(OdometryFrequencyValues)

    OdometryFrequencyKeys = []
    OdometryFrequencyValues = []

    return { name: "OdomFrequency", keyArray: kr, valArray: vr, timestamp: currentodomts / CONVERSIONRATE }
}

let sidebaredStructs = []

function handleNewData(topic, timestamp, value, RawValue) {

    if (topic.type.includes("proto") || topic.type.includes("structschema")) return

    if (topic.type.includes("struct") && !sidebaredStructs.includes(topic.name.split("|")[0])) {
        if (topic.type.includes("[]")) return;

        topicToSidebar(topic, true)
        sidebaredStructs.push(topic.name.split("|")[0])
    }

    let topicSplit = topic.name.split("/")
    let topicName = topicSplit[topicSplit.length - 1]

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



    // if (topic.name.includes("OdometryFrequency") && timestamp % 10 == 0) {
    //     OdometryFrequencyKeys.push(timestamp / CONVERSIONRATE)
    //     OdometryFrequencyValues.push(value - 250)
    //     currentodomts = timestamp
    // }

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

    if (topic.type.includes("struct")) {
        console.log(topic, value)
        console.log(subscribedTopics)

    }

    if (subscribedTopics.hasOwnProperty(topic.name)) {
        let foundValue = value;

        for (let i = 0; i < subscribedTopics[topic.name].length; i++) {
            if (!subscribedTopics[topic.name][i]) continue; //Pass if value is null
            // console.log(subscribedTopics[topic.name][i])

            if (topic.type.includes("struct")) {
                console.log(topic, value)
                foundValue = getStructValue(subscribedTopics[topic.name][i].structPath, value)
            }

            subscribedTopics[topic.name][i].valueHandeler(foundValue, timestamp) // Send value to topic handler
        }
    }
}

// setInterval(() => {
//     console.log(nt4Client.serverTopics)

//     console.log(subscribedTopics)

// }, 1000);

function getStructValue(structTopic, value) {
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

setTimeout(() => {
    console.log(topicObject)
    console.log(nt4Client.schemas)

    console.log(nt4Client.serverTopics)
}, 5000);

// function structAsFolder(topic, timestamp, value){

// }

nt4Client.subscribe(["/touchboard/musicIsFinished"])

// let $reefBtns = $(".reefPFHolder").children()

// for (let i = 0; i < $reefBtns.length; i++) {
//     let hue = i * (180 / (($reefBtns.length - 1) / 2))
//     if (i % 2 !== 0) {
//         hue = (i - 1) * (180 / (($reefBtns.length - 1) / 2))

//     }

//     $reefBtns.eq(i).css("background-color", "hsl(" + hue + " 100 25").css("border-color", "hsl(" + hue + " 100 50").css("grid-area", $reefBtns.eq(i).attr("data-topic").slice(0, 2))
// }

function onConnectCb() {
    //on everything this is NOT on callback

    setTimeout(() => {
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
                $($uiElements.eq(i)).on(" pointerdown", (event) => {
                    if (editTabs.hasClass("editingTabs")) return
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                    $uiElements.eq(i).attr("data-value", "true")
                }).on("pointerup   mouseleave touchcancel", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), false)
                    $uiElements.eq(i).attr("data-value", "false");
                })
            } else if ($uiElements.eq(i).hasClass("toggleButton")) {
                $uiElements.eq(i).on(" pointerdown", (event) => {
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
                $uiElements.eq(i).on(" pointerdown", (event) => {
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
        $("*").removeClass("removeShake").off("pointerdown.remove").off("pointermove.dragComponent")//.off("pointerdown.editHandler")
        $(".trashCan").removeClass("trashActive")

        if ($(".connectionText").text() == "Connected") {
            window.location.reload();
        }

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

function addToCurrentDrag(jQueryReference, initialX, initialY, componentType) {
    $(".currentDrag").remove()
    jQueryReference.css("position", "absolute").addClass("currentDrag")

    jQueryReference.css("top", initialY).css('left', initialX)

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
                $(".currentDrag").remove()

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

// tabGrid(9, 4, ".uiTestTab")// <-- perfect for defailt
// tabGrid(18, 8, '.uiTestTab')

function tabGrid(columns, rows, tab) {
    let $tab = $(tab)

    //set the css grid to max square size and center it
    let cqval = setGridSize($tab, columns, rows)
    $(".gridUnderlay").css("grid-template-rows", "repeat(" + rows + " ," + cqval + "cqmin)").css("grid-template-columns", "repeat(" + columns + " ," + cqval + "cqmin)")

    $(window).off("resize").on("resize", () => {
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

function createActionButton(displayName, topic, append = false, hex = "#2b00ff", similarOptions = defaultSimilarOptions) {
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

function createOneShotButton(displayName, topic, append = false, hex = "#fff200", similarOptions = defaultSimilarOptions) {
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

function createToggleButton(displayName, topic, append = false, hex = "#ff7300", value = false, similarOptions = defaultSimilarOptions, persist) {
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

function createAxis(displayName, topic, append = false, vertical = false, hex = "#8a2be2", value = 0, min = -1, max = 1, step = 0.01, snapBack = true, similarOptions = defaultSimilarOptions) {
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

function createNumberComponent(title, topic, append = false, hex = 0, value = 0, min = -1, max = 1, step = 0.1, persist = false, similarOptions = defaultSimilarOptions) {

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

function createDropdown(topic, append = false, hex = 0, initialOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions, persist = false) {



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

function createOptGroup(topic, append, hex = 0, initialOptionIndex = 0, options = [], similarOptions = defaultSimilarOptions, persist = false) {


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

function createBasicSubscription(displayName, topic, append = false, hex = false, similarOptions = defaultSimilarOptions) {

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }
    }
    // console.log(topicClass)

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



    let basicSubscriptionHandler = (value, timestamp) => {
        // console.log(value, "basicSubscriptionHandler")
        topicReference.text(value.toFixed(3))
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

function createBasicLogger(displayName, topic, append = false, hex = "#0c0c0c", similarOptions = defaultSimilarOptions) {

    let topicClass = topic.replaceAll(".", "esc-period-esc").replaceAll("/", "esc-Sl-esc")

    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }
    }
    // console.log(topicClass)

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

    let showAll = $("<h1>").addClass("showAll").text("⏿").appendTo(basicLogger).on("pointerdown", () => {
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

function createNumberLine(displayName, topic, append = false, hex = "#0c0c0c", maxNumber, minNumber, low, high, optimum, similarOptions = defaultSimilarOptions) {


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
            if (numberLine.attr("data-deriveAttributesMin") == "true") {
                if (Math.round(value) < parseFloat(meter.attr("min"))) {
                    meter.attr("min", Math.round(value))

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

function createRadialGauge(displayName, topic, append, hex = "#0c0c0c", maxDeg = 360, subTickCount = 5, maxNumber, minNumber, low, high, optimum, degOffset = 0, similarOptions = defaultSimilarOptions,) {
    if (displayName == null) {
        let topicSplit = topic.split("/")
        displayName = topicSplit[topicSplit.length - 1]

        if (displayName == "value" && topicSplit.length > 1) {
            displayName = topicSplit[topicSplit.length - 2]
        }
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

    if (topic == "esc-UNSET-esc") return radialGauge

    let gaugeHandler = (value) => {
        let whichMax = gauge.attr("data-maxNumber")

        if (!whichMax) {
            gauge.attr("data-maxDeg")
        }

        gauge[0].style.setProperty("--gaugeColor", emulateMeterColors(gauge.attr("data-minNumber"), whichMax, gauge.attr("data-low"), gauge.attr("data-high"), gauge.attr("data-optimum"), value))

        if (gauge.attr("data-maxNumber")) {
            gauge.removeAttr("data-valDeg")

            let min = parseFloat( gauge.attr("data-minNumber") )
            let range = parseFloat( gauge.attr("data-maxNumber") ) - min

            value = ((value - min) % range) + min

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

// setGridInput(".uiTestTab")

function setGridInput(tab) {

    if (tab.hasClass("pageF")) {
        $(".setGridRow").addClass("hiddenClickless")
        $(".setGridColumn").addClass("hiddenClickless")

        return
    } else {
        let rows = tab.attr("rows")
        let columns = tab.attr("columns")
        $(".setGridRow").removeClass("hiddenClickless").attr("data-value", rows).children(".numberTextInput").val(rows).attr("value", rows)
        $(".setGridColumn").removeClass("hiddenClickless").attr("data-value", columns).children(".numberTextInput").val(columns).attr("value", columns)


    }

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



        currentSetting.children(".numberPlus").off("pointerdown.RCA").on("pointerdown.RCA ", (event) => {
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
        currentSetting.children(".numberMinus").off("pointerdown.RCA").on("pointerdown.RCA", (event) => {
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
        currentSetting.children(".numberTextInput").off("blur.RCA").on("blur.RCA", (event) => {
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
    initialY: 0,
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

// 
bindEditorResetter($(".editNavBack, .trashCan, .editTabs, .tab, .addTab, .tabCreator"))

function bindEditorResetter(element) {
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

        $("." + $(".sideBarUnderline").attr("data-sidebarClass")).css("display", "flex")

        $(".currentDrag").remove()
        $(".feauxComponent").remove()
        $("*").off("pointermove.dragComponent").off("pointerup.dragComponent").off("pointerdown.dragComponent")
    })
}
bindTabChanger()

function bindTabChanger() {
    $(".tabNav").on("pointerdown ", (event) => {
        let $ct = $(event.target)

        if (!$ct.hasClass("tab")) {
            return
        }

        $(".page, .pageF").css("display", "none")
        $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
        $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
        if ($ct.attr("data-displaytype") == null) {
            $($ct.attr("data-page")).css("display", "grid")
        } else {
            $($ct.attr("data-page")).css("display", $ct.attr("data-displaytype"))

        }

        let currentPage$ = $($ct.attr("data-page"))

        setGridInput(currentPage$)
        if (!$($ct.attr("data-page")).hasClass("pageF")) {
            tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)
        }

    })

    $(".manager").on("click.changeTab", (event) => {
        if ($(".editTabs").hasClass("editingTabs")) return


        let $ct = $(event.target)

        if (!$ct.hasClass("sideTab")) {
            return
        }

        $(".page, .pageF").css("display", "none")
        $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")

        $(".manager").removeClass("managerOpen")
        $(".pTAB" + $ct.attr("data-page").slice(1)).addClass("currentTab").css("background-color", "rgb(32, 32, 32)")

        console.log(".pTAB" + $ct.attr("data-page").slice(1))

        if ($ct.attr("data-displaytype") == null) {
            $($ct.attr("data-page")).css("display", "grid")
        } else {
            $($ct.attr("data-page")).css("display", $ct.attr("data-displaytype"))

        }

        let currentPage$ = $($ct.attr("data-page"))

        setGridInput(currentPage$)
        if (!$($ct.attr("data-page")).hasClass("pageF")) {
            tabGrid(parseFloat(currentPage$.attr("columns")), parseFloat(currentPage$.attr("rows")), currentPage$)
        }

    })

    $(".manager").on("pointerdown.removeTab", (event) => {
        let t$ = $(event.target)

        console.log(t$)

        if (!t$.hasClass("removeTab")) return

        $(t$.parent().attr("data-page")).remove()
        $(".pTAB" + t$.parent().attr("data-page").slice(1)).remove()

        t$.parent().remove()
    })
}

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
        } else if (inputBeingBound.attr("data-editing") == "data-persist") {
            bindPersistantCheckbox(inputBeingBound)
        } else if (inputBeingBound.hasClass("multiSwitch")) {
            bindToggleMultiSwitch(inputBeingBound)
        } else if (inputBeingBound.attr("data-editing") == "data-snapBack") {
            bindSnapBack(inputBeingBound)
        }
        else {
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
                type: 'video/mp4' //TODO: unhardcode this let the ppl use mp4 if they want 
            })

            let downloadUrl = URL.createObjectURL(blob)

            let filename = cameraComponent.attr("data-usTimestamp") + "" + cameraComponent.attr("data-streamTopic")

            let $a = $("<a>").css("display", "none").attr("href", downloadUrl)
            $a[0].download = "video.mp4"//TODO: unhardcode this let the ppl use mp4 if they want 

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

$(".exportBtn").on("click", () => {
    toastMessage("Layout Copied")
    navigator.clipboard.writeText(saveLayoutToJSON())

})
// $(".testbtn2").on("click", () => {
//     localStorage.setItem("layout", prompt("Input Json"));
//     clear = true;
//     window.location.reload();
// })
function saveLayoutToJSON() {
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

function loadLayoutFromJson(json) {
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
    }
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
            return createActionButton(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "oneShotButton":
            return createOneShotButton(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "toggleButton":
            return createToggleButton(component.displayName, component.topic, false, component.color, component.value, component.similarOptions, component.persist)
        case "axis":
            return createAxis(component.displayName, component.topic, false, false, component.color, component.value, component.min, component.max, component.step, component.snapBack, component.similarOptions).div
        case "verticalAxis":
            return createAxis(component.displayName, component.topic, false, true, component.color, component.value, component.min, component.max, component.step, component.snapBack, component.similarOptions).div
        case "select":
            return createDropdown(component.topic, false, 0, component.index, JSON.parse(component.componentOptions), component.similarOptions, component.persist).div
        case "buttonOptGroup":
            return createOptGroup(component.topic, false, 0, component.index, JSON.parse(component.componentOptions), component.similarOptions, component.persist).div
        case "numberComponent":
            return createNumberComponent(component.displayName, component.topic, false, 0, component.value, component.min, component.max, component.step, component.persist, component.similarOptions).div
        case "basicSubscription":
            return createBasicSubscription(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "basicLogger":
            return createBasicLogger(component.displayName, component.topic, false, component.color, component.similarOptions)
        case "numberLine":
            return createNumberLine(component.displayName, component.topic, false, component.color, component.max, component.min, component.low, component.high, component.optimum, component.similarOptions)
        case "radialGauge":
            return createRadialGauge(component.displayName, component.topic, false, component.color, component.maxDeg, 5, component.max, component.min, component.low, component.high, component.optimum, component.offsetDeg, component.similarOptions)
    }
}

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


let tabDragInfo = {
    initialY: 0,
    currentY: 0,
    phased: false,
    margined: false,
}

handleTabDrag()

function handleTabDrag() {

    //phasedTab
    //marginedTab
    //transitioning

    $(".manager").on("pointermove.drag", (event) => {
        if (!tabDragInfo.phased) return

        tabDragInfo.phased.css("top", event.pageY - vh(6.5 / 2) + "px")
    })

    $(".manager").on("pointerup.sidebarDrag pointerleave.sidebarDrag", (event) => {
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



$(".tabManager").on("click", () => {
    $(".manager").toggleClass("managerOpen")
})


function createSideTab(name, page, state = "") {
    let div = $("<div>").addClass("sideTab").attr("data-page", page).addClass("sTAB" + page.slice(1)).addClass(state)

    if (state == "") {
        div.insertBefore(".titleMinimized")
    }
    else {
        console.log(".insert" + state.slice(3))
        div.insertBefore(".insert" + state.slice(3))
    }

    let ham = $("<h1>").addClass("ham").addClass("onlyOnEdit").text("☰").appendTo(div)
    $("<h1>").addClass("tabName").text(name).appendTo(div)
    let x = $("<h1>").addClass("removeTab").addClass("onlyOnEdit").text("❌").appendTo(div)

    if ($(".editTabs").hasClass("editingTabs")) {
        ham.addClass("onlyEditShowing")
        x.addClass("onlyEditShowing")

    }

    if (state == "tabHidden") {
        div.addClass("hideSideTab")
    }
}

let clear = false

$(document).on('visibilitychange', () => {
    if (document.visibilityState === "hidden") {
        if (clear) {
            return
        }

        let layout = saveLayoutToJSON()

        localStorage.setItem("layout", layout)
    }

})


if (localStorage.getItem("layout")) {
    loadLayoutFromJson(localStorage.getItem("layout"))
} else {
    localStorage.setItem("layout", JSON.stringify({}))

    loadLayoutFromJson(localStorage.getItem("layout"))
}

function mapDragHandler() {
    let map = $(".map");

    clientDragHandler()
}

if (localStorage.getItem(getHtmlFileName() + "connect") === "true") {
    $("#connect")[0].checked = true
    $(".connectionText").text("Retrying")
    $(".tabConnection").removeClass("tabConnection")

    nt4Client.connect()

} else {
    $(".fullScreen").css("background-color", "rgb(32, 32, 32)")

    $("html").css("background-color", "rgb(32, 32, 32)")
    $(".tab").css("background-color", "rgb(12, 12, 12)")
    $(".addTab").css("background-color", "rgb(32, 32, 32)")
    $(".tabManager").css("background-color", "rgb(32, 32, 32)")

    $(".tabCreator").css("background-color", "rgb(32, 32, 32)")

    $(".tabNav").css("background-color", "rgb(12, 12, 12)")
    $(".currentTab").css("background-color", "rgb(32, 32, 32)")
    nt4Client.disconnect()

}

$(".teamNumber").on("click", () => {
    $(".setTeamNumberOrIp").toggleClass("showTeamSet")

})

$(".importBtn").on("click", () => {
    $(".importJson").toggleClass("showTeamSet")
    $(".manager").removeClass("managerOpen")

})

$(".doImport").on("click", () => {
    let json = $(".importBox").val()

    localStorage.setItem("layout", json);
    clear = true;
    window.location.reload();
})

$(".cancelImport").on("click", () => {
    $(".importJson").removeClass("showTeamSet")

})