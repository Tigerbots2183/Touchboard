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

    let testspan = $("<span>").css("height", "1cqh").css("width", "1cqw").appendTo(container)

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
    jQueryReference.on("mousedown touchstart", (event) => {

        event.preventDefault()
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

$(".tab").on("mousedown touchstart", (event) => {
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


$(".select").on("touchdown mousedown", (event) => {
    if (!$(event.target).hasClass("textInput") && !$(event.target).hasClass("delete") && !$(event.target).hasClass("save") && !$(event.target).hasClass("saveManager")) {
        $(event.currentTarget).toggleClass("selectOpen")
    }
})
// $(".selectOption").on("touchdown mousedown", (event) => {
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
                $($uiElements.eq(i)).on("touchstart mousedown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                    $uiElements.eq(i).attr("data-value", "true")
                    event.preventDefault()
                }).on("mouseup touchend mouseleave touchcancel", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), false)
                    $uiElements.eq(i).attr("data-value", "false");
                    event.preventDefault()
                })
            } else if ($uiElements.eq(i).hasClass("toggleButton")) {
                $uiElements.eq(i).on("touchstart mousedown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), !(JSON.parse($uiElements.eq(i).attr("data-value"))))
                    $uiElements.eq(i).toggleClass("toggledOn")
                    let oldBG = $uiElements.eq(i).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')

                    if ($uiElements.eq(i).hasClass("toggledOn")) {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0.6)")
                    } else {
                        $uiElements.eq(i).css("background-color", oldBG + ", 0)")

                    }
                    $uiElements.eq(i).attr("data-value", !(JSON.parse($uiElements.eq(i).attr("data-value"))))
                    event.preventDefault()
                })
            } else if ($uiElements.eq(i).hasClass("oneShotButton")) {
                nt4Client.subscribe(["/touchboard/" + $uiElements.eq(i).attr("data-topic")])
                $uiElements.eq(i).on("touchstart mousedown", (event) => {
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), true)
                    event.preventDefault()
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

                $uiElements.eq(i).children(".numberPlus").on("mousedown touchstart", (event) => {
                    event.preventDefault()
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
                $uiElements.eq(i).children(".numberMinus").on("mousedown touchstart", (event) => {
                    event.preventDefault()
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
                    event.preventDefault()

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
                $uiElements.eq(i).children(".selectOption").on("mousedown", (event) => {
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

                }).on("mouseup touchend", (event) => {
                    let $ct = $(event.target)
                    $uiElements.eq(i).attr("data-value", 0)
                    $(event.currentTarget).val(0)
                    nt4Client.addSample("/touchboard/" + $ct.parent().attr("data-topic"), parseFloat($ct.parent().attr("data-value")))
                })
            } else if ($uiElements.eq(i).hasClass("basicSubscription")) {

                nt4Client.subscribe([$uiElements.eq(i).attr('data-topic')])

                $uiElements.eq(i).addClass($uiElements.eq(i).attr('data-topic').replaceAll("/", "Sl-Sl-Sl-"))
            } else if ($uiElements.eq(i).hasClass("buttonOptGroup")) {
                $uiElements.eq(i).children(".optGroupButton").on("mousedown", (event) => {

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

        $("body").on("mousemove touchmove", (event) => {
            if($(".gridSquare").length > 600){
                $(".gridSquare").css("width", "95%").css("height", "95%")
                return
            }

            let clientDrag = {
                x: 0,
                y: 0
            }

            let $eq = $(".gridSquare").eq(0)

            if (event.pageX == null) {
                clientDrag.x = event.changedTouches[0].pageX - ($eq.width()/2)
                clientDrag.y = event.changedTouches[0].pageY - ($eq.width()/2)
            } else {
                clientDrag.x = event.pageX - ($eq.width()/2)
                clientDrag.y = event.pageY - ($eq.width()/2)
            }

            //jquery ommited for preformance reasons
            let elements = document.getElementsByClassName("gridSquare")
            for (let i = 0; i < elements.length; i++) {
                let $eq = elements[i]

                let offset = $eq.getBoundingClientRect()

                let dist = Math.hypot(offset.left-clientDrag.x,  offset.top - clientDrag.y)
                let distVal = (0.0125 * (dist) + 95)

                $eq.style.transform = 'scale(' + distVal + '%)'
                
            }

        })
    } else {
        $("html").off()
    }

})

$(".sideBar").children().off().on("mousedown touchstart", (event) => {
    let ct = $(event.currentTarget)
    if (ct.hasClass("actionButton")) {
        let jQueryReference = createActionButton("Action Button", "esc-UNDEFINED-esc", ".dashboardHolder")

        let clientDrag = {
            x: 0,
            y: 0
        }

        if (event.pageX == null) {
            clientDrag.x = event.changedTouches[0].pageX - (jQueryReference.width() / 2)
            clientDrag.y = event.changedTouches[0].pageY - (jQueryReference.height() / 2)
        } else {
            clientDrag.x = event.pageX - (jQueryReference.width() / 2)
            clientDrag.y = event.pageY - (jQueryReference.height() / 2)
        }

        addToCurrentDrag(jQueryReference, clientDrag.x, clientDrag.y)
    }



})

function addToCurrentDrag(jQueryReference, initalX, initalY) {
    jQueryReference.css("position", "absolute").addClass("currentDrag")

    jQueryReference.css("top", initalY).css('left', initalX)

    $("html").on("mousemove touchmove", (event) => {
        let clientDrag = {
            x: 0,
            y: 0,
            rawX:0,
            rawY:0,
        }

        if (event.pageX == null) {
            clientDrag.rawX = event.changedTouches[0].pageX
            clientDrag.rawY = event.changedTouches[0].pageY
            clientDrag.x = event.changedTouches[0].pageX - (jQueryReference.width() / 2)
            clientDrag.y = event.changedTouches[0].pageY - (jQueryReference.height() / 2)
        } else {
            clientDrag.rawX = event.pageX
            clientDrag.rawY = event.pageY
            clientDrag.x = event.pageX - (jQueryReference.width() / 2)
            clientDrag.y = event.pageY - (jQueryReference.height() / 2)
        }

        jQueryReference.css("top", clientDrag.y).css('left', clientDrag.x)

        let elementsFromPoint = document.elementsFromPoint(clientDrag.rawX, clientDrag.rawY)

        for(let i = 0; i < elementsFromPoint.length; i++){
            let $eq = $(elementsFromPoint[i])
            if($eq.hasClass("gridSquare")){
                // console.log($eq.attr("data-row") + "|" + $eq.attr("data-column"))
                $(".feauxComponent").remove()
                createActionButton(jQueryReference.text(), jQueryReference.attr("data-topic"), $(".currentTab").attr("data-page"))
                .addClass("feauxComponent")
                .css("grid-column", $eq.attr("data-column"))
                .css("grid-row", $eq.attr("data-row"))
                break
            }
        }

    })
}

function createActionButton(displayName, topic, append = false) {
    let actionButton = $("<button>")
        .addClass("actionButton")
        .attr("data-type", "boolean")
        .attr("data-topic", topic)
        .attr("data-value", false)
        .text(displayName)

    if(append){
        actionButton.appendTo(append)
    }

    addButtonToAnimate(actionButton)

    return actionButton
}



/* <button class="actionButton" data-type="boolean" data-topic="TestActionButton"
            data-value="false">Action Button</button>
        <!--One shots must have the topic in their classes to trigger animation after the bot gets the signal-->
        <button class="oneShotButton OneShotTest" data-type="boolean" data-topic="OneShotTest" data-value="false">One
            Shot Button</button>
        <!-- Toggles also work in if you want in reverse, set data-value to true and add toggledOn to the classes -->
        <button class="toggleButton" data-type="boolean" data-topic="TestToggleButton"
            data-value="false">Toggle Button</button>

        <!--Set max, min, step, and initial value for the axis, it will snap back after released to inital value-->
        <div class="axis" data-topic="TestAxis" data-value="0" data-type="double">
            <h1 class="axisLabel">Axis</h1>
            <input class="axisKnob" type="range" min="0" max="0" value="0">
        </div>

        <div class="verticalAxis" data-topic="TestAxis" data-value="0" data-type="double">
            <h1 class="axisLabel">Y-Axis</h1>
            <input class="verticalAxisKnob" type="range" min="0" max="0" value="0">
        </div>

        <!-- The value that is sent to the bot is defined in the select option data-value, the text is displayed on the ui -->
        <div class="select" data-value="points" data-topic="DropdownTest" data-type="string">
            <h1 class="selectTitle">Points</h1>

        </div>

        <div class="buttonOptGroup" data-type="string" data-topic="testBOG" data-value="L2">
            <button class="animatedButton optGroupButton toggledOn"
                style="background-color: rgba(0, 81, 255, 0); border-color: rgb(0, 47, 255)" data-value="Val1">Value
                1</button>
            <button class="animatedButton optGroupButton"
                style="background-color: rgba(255, 0, 0, 0); border-color: rgb(255, 0, 0)" data-value="Val2">Value
                2</button>
            <button class="animatedButton optGroupButton"
                style="background-color: rgba(247, 0, 255, 0); border-color: rgb(255, 0, 225) " data-value="Val3">Value
                3</button>

        </div>

        <!-- set max, min. and value in the parent element.  -->
        <div class="numberComponent" data-topic='TestAdder' data-type="double" data-step="0.1" data-min="-1"
            data-max="1" data-value="0" data-persist="true">
            <p class="numberTitle">Test Adder</p>
            <button class="numberMinus animatedButton">-</button>
            <input class="numberTextInput" type="number" value="0"> <!-- value must match data-value -->
            <button class="numberPlus animatedButton">+</button>
        </div>

        <div class="basicSubscription" data-topic=""><!-- must be the full path -->
            <h1 class="bSTopic">Topic:</h1>
            <h1 class="bSValue">Value</h1>
        </div>
    </div> */



tabGrid(30, 15, ".uiTestTab")

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

    for (let i = 0; i < columns * rows; i++) {
        //added 1 to be consitent with css namings.
        $("<div>").addClass("gridSquare").appendTo(".gridUnderlay").attr("data-column", (i % columns) +1 ).attr("data-row", (Math.floor(i/columns)) +1)
    }

}

