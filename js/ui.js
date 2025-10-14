// import "./nt4.js"
import { NT4_Client } from "../lib/nt4.js";
import { goToNextSong } from "./jukebox.js";
import { setFromString } from "./autoBuilder.js";
//if removing jukebox, get rid of the gotonextsong() in the handle data callback function, remove from html, and remove import
export function getHtmlFileName() {
    let path = window.location.pathname;
    let segments = path.split('/'); // Split the path by the '/' character
    let fileName = segments.pop();
    // Get the last element of the array, which is the filename
    return fileName.slice(0, -5);
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
            let $word = $("<div>").appendTo($ab.eq(i)).css('display', 'flex');
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
    $(".select").not(".sideBarSelect").off().on(" pointerdown", (event) => {
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
    doNothing,
    doNothing,
    handleNewData,
    onConnectCb,
    onDisconnectCb
);

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

function handleNewData(topic, timestamp, value) {
    console.log(topic.name)
    // console.log(value)
    let topicSplit = topic.name.split("/")
    let topicName = topicSplit[topicSplit.length - 1]
    // console.log(topicSplit)

    if (topicName == "musicIsFinished") {
        if (value == true) {
            goToNextSong()
        }
    }
    if ($("." + topic.name.replaceAll("/", "Sl-Sl-Sl-")).hasClass("basicSubscription")) {
        console.log(value)
        $("." + (topic.name.replaceAll("/", "Sl-Sl-Sl-"))).children(".bSValue").text(JSON.stringify(value))
    } else if ($("." + topicName).hasClass("oneShotButton")) {
        oneShotAnimation("." + topicName)
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
                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value"))
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

                $uiElements.eq(i).addClass($uiElements.eq(i).attr('data-topic').replaceAll("/", "Sl-Sl-Sl-"))
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


$(".sideBar").children().off().on("pointerdown ", (event) => {
    $("*").removeClass("removeShake")
    $(".trashCan").removeClass("trashActive")

    let componentType = $(event.currentTarget)[0].classList[0];

    let jQueryReference = createDefaultOf(componentType, ".dashboardHolder", "esc-UNDEFINED-esc")

    let clientDrag = clientDragHandler(event, jQueryReference)

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

        console.log("end")

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

                let newComponent = createDefaultOf(componentType, $(".currentTab").attr("data-page"))
                    .css("grid-column", parseInt(grid.column))
                    .css("grid-row", parseInt(grid.row))
                    .attr("data-row", parseInt(grid.row))
                    .attr("data-column", parseInt(grid.column))

                if (grid.endColumn) {
                    newComponent
                        .css("grid-column-end", parseInt(grid.endColumn) + grid.columnOffset)
                        .css("grid-row-end", parseInt(grid.endRow) + grid.rowOffset)
                        .attr("data-endRow", grid.endRow)
                        .attr("data-endColumn", grid.endColumn)
                    setCornerBorder(parseInt(grid.row), parseInt(grid.column), parseInt(grid.endRow) + grid.rowOffset, parseInt(grid.endColumn) + grid.columnOffset, $(".currentTab").attr("data-page"))

                }

                jQueryReference.remove()
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
        jQueryDimensions = {
            height: jQueryReference.outerHeight(true) / 2,
            width: jQueryReference.outerWidth(true) / 2,
        }

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

function createDefaultOf(component, append, topic = "esc-UNSET-esc") {
    if (component == "actionButton") {
        return createActionButton("Action Button", topic, append)
    } else if (component == "oneShotButton") {
        return createOneShotButton("One Shot Button", topic, append)
    } else if (component == "toggleButton") {
        return createToggleButton("Toggle Button", topic, append, false)
    } else if (component == "axis") {
        return createAxis("Axis", topic, append, false).div
    } else if (component == "verticalAxis") {
        return createAxis("Y-Axis", topic, append, true).div
    } else if (component == "select") {
        return createDropdown(topic, append, 0, [{name:"Dropdown", value:""}]).div
    } else if (component == "buttonOptGroup") {
        return createOptGroup(topic, append, 0, [{name:"Value 1", value:""}, {name:"Value 2", value:""}]).div
    } else if (component == "numberComponent") {
        return createNumberComponent("Number", topic, append).div
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
        cornerBorder.appendTo(append)
    }

    return cornerBorder
}

function createActionButton(displayName, topic, append = false) {
    let actionButton = $("<button>")
        .addClass("actionButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .text(displayName)

    if (append) {
        actionButton.appendTo(append)
    }

    addButtonToAnimate(actionButton)

    return actionButton
}

function createOneShotButton(displayName, topic, append = false) {
    let oneShotButton = $("<button>")
        .addClass("oneShotButton")
        .addClass(topic)
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .text(displayName)

    if (append) {
        oneShotButton.appendTo(append)
    }

    addButtonToAnimate(oneShotButton)

    return oneShotButton
}

function createToggleButton(displayName, topic, append = false, value = false) {
    let toggleButton = $("<button>")
        .addClass("toggleButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", value)
        .text(displayName)

    if (value) {
        toggleButton.addClass("toggledOn")
    }

    if (append) {
        toggleButton.appendTo(append)
    }

    addButtonToAnimate(toggleButton)

    return toggleButton
}

function createAxis(displayName, topic, append = false, vertical = false, value = 0, min = -1, max = 1, step = 0.01, snapBack = true) {
    let axis = {
        div: $('<div>'),
        label: $("<h1>").addClass("axisLabel"),
        knob: $("<input>")
    }

    axis.label.appendTo(axis.div)
    axis.knob.appendTo(axis.div)

    if (!vertical) {
        axis.div.addClass("axis")
        axis.knob.addClass("axisKnob")
    } else {
        axis.div.addClass("verticalAxis")
        axis.knob.addClass('verticalAxisKnob')
    }

    axis.div.attr("data-topic", topic)
        .attr("data-value", 0)
        .attr('data-type', "double")

    axis.knob.attr("type", "range")
        .attr("min", min)
        .attr("max", max)
        .attr("step", step)
        .attr("value", value)

    axis.label.text(displayName)

    if (append) {
        axis.div.appendTo(append)
    }

    return axis
}


function createDropdown(topic, append = false, initalOptionIndex = 0, options = []) {

 

    let dropdown = {
        div: $("<div>").addClass("select").attr("data-value", options[initalOptionIndex].value).attr("data-topic", topic).attr("data-type", "string"),
        
    }

    dropdown["title"] = $("<h1>").appendTo(dropdown.div).addClass("selectTitle").text(options[initalOptionIndex].name)

    let $aO = []
    for (let i = 0; i < options.length; i++) {
        $aO.push($("<h1>").appendTo(dropdown.div).addClass("selectOption").text(options[i].name).attr("data-value", options.value));
    }

    dropdown["options"] = $aO

    if (append) {
        dropdown.div.appendTo(append)
    }

    setSelectOpener()

    return dropdown
}

function createOptGroup(topic, append, initalOptionIndex = 0, options = []){


    let optDiv = $("<div>").addClass("buttonOptGroup").attr("data-topic", topic).attr("data-type", "string")

    let optGroup = {
        div: optDiv,
    }

    let $aO = []

    for(let i =0; i < options.length; i++){
        let hue = (i * (360/options.length))
        console.log(hue)
        let newButton = $("<button>").addClass("animatedButton").addClass("optGroupButton").attr("data-value", options[i].value).text(options[i].name).appendTo(optDiv).css("border-color", "hsla(" + hue + ", 100%, 50%, 1)").css("background-color", "hsla(" + hue + ", 100%, 50%, 0)")
        if(i == initalOptionIndex){
            newButton.addClass("toggledOn").css("background-color", "hsla(" + hue + ", 100%, 50%, 0.6)")
        }
        $aO.push(newButton)
    }

    optGroup["options"] = $aO

    if(append) {
        optGroup.div.appendTo(append)
    }

    return optGroup

}
function createNumberComponent(title, topic, append = false, value = 0, min = -1, max = 1, step = 0.1, persist = false){

   let numberComponent = {
    div:$("<div>").addClass("numberComponent").attr("data-type", 'double').attr("data-step", step).attr("data-min", min).attr("data-max", max).attr("data-value", value).attr("data-persist", persist).attr("data-topic", topic),
   }

   numberComponent["title"] = $("<p>").addClass("numberTitle").text(title).appendTo(numberComponent.div)
   numberComponent["minus"] = $("<button>").addClass("numberMinus").addClass("animatedButton").text("-").appendTo(numberComponent.div)
   numberComponent["input"] = $("<input>").addClass("numberTextInput").attr("type", "number").attr("value", value).appendTo(numberComponent.div)
   numberComponent["plus"] = $("<button>").addClass("numberPlus").addClass("animatedButton").text("+").appendTo(numberComponent.div)

   if(append){
    numberComponent.div.appendTo(append)
   }

   return numberComponent
  
//    <button class="numberMinus animatedButton">-</button>
//    <input class="numberTextInput" type="number" value="0"> <!-- value must match data-value -->
//    <button class="numberPlus animatedButton">+</button>
// </div>

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
                } else if (minValues.current == min){
                    minElement.push($eq)
                }

                if (minValues.currentEnd > min) {
                    min = minValues.currentEnd
                    minElement = [$eq]
                }else if (minValues.currentEnd == min){
                    minElement.push($eq)
                }
            }
            if (minElement && min == val + 1) {
                console.log(minElement)
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



$(".trashCan").on(" pointerdown", (event) => {
    $(".trashCan").toggleClass("trashActive")
    let elements = $($(".currentTab").attr("data-page")).children()

    for (let i = 0; i < elements.length; i++) {
        let $eq = elements.eq(i)

        if ($(".trashCan").hasClass("trashActive")) {
            $eq.addClass("removeShake")
        } else {
            $eq.off("pointerdown.remove",)
            $eq.removeClass("removeShake")

        }

    }

    $(".removeShake").on("pointerdown.remove ", (event) => {
        $(event.currentTarget).remove()
    })
})