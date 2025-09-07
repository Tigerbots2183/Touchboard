// import "./nt4.js"
import { NT4_Client } from "../lib/nt4.js";
import { goToNextSong } from "./jukebox.js";
import {setFromString} from "./autoBuilder.js";
//if removing jukebox, get rid of the gotonextsong() in the handle data callback function, remove from html, and remove import
export function getHtmlFileName() {
    let path = window.location.pathname;
    let segments = path.split('/'); // Split the path by the '/' character
    let fileName = segments.pop();
     // Get the last element of the array, which is the filename
    return fileName.slice(0, -5);
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

$(".animatedButton").on("mousedown touchstart", (event) => {

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

$(".tab").on("mousedown touchstart", (event) => {
    let $ct = $(event.currentTarget)
    $(".page, .pageF").css("display", "none")
    $(".tab").removeClass("currentTab").css("background-color", "rgb(12, 12, 12)")
    $ct.addClass("currentTab").css("background-color", "rgb(32, 32, 32)")
    if ($ct.attr("data-displaytype") == null) {
        $($ct.attr("data-page")).css("display", "grid")
    }else{
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
                if($uiElements.eq(i).hasClass("basicSubscription")){
                    continue
                }

                nt4Client.publishTopic("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-type"))
                if ($uiElements.eq(i).attr("data-value")) {
                    if ($uiElements.eq(i).attr("data-type") === "string") {
                        nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                    } else if ($uiElements.eq(i).attr("data-type") === "double") {
                        if($uiElements.eq(i).attr("data-persist") == "true"){
                            nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), parseFloat(localStorage.getItem(getHtmlFileName() + $uiElements.eq(i).attr("data-topic"))))
                        }else{
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

                    if($uiElements.eq(i).hasClass("toggledOn")){
                        $uiElements.eq(i).css("background-color", oldBG + ", 0.6)")
                    }else{
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
            } else if ($uiElements.eq(i).hasClass("axis") || $uiElements.eq(i).hasClass("verticalAxis") ) {


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
            } else if ($uiElements.eq(i).hasClass("basicSubscription")){

                nt4Client.subscribe([$uiElements.eq(i).attr('data-topic')])

                $uiElements.eq(i).addClass($uiElements.eq(i).attr('data-topic').replaceAll("/", "Sl-Sl-Sl-"))
            } else if ($uiElements.eq(i).hasClass("buttonOptGroup")) {
                $uiElements.eq(i).children(".optGroupButton").on("mousedown", (event) => {
                    
                    let cI = $uiElements.eq(i).children(".optGroupButton")
                    for(let j = 0; j < cI.length; j++){
                        cI.eq(j).css("background-color",  cI.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0)").removeClass("toggledOn")
                    }
                    let oldBG = $(event.target).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1')
                    let $ct = $(event.target).addClass("toggledOn").css("background-color", oldBG + ", 0.6)")

                    $uiElements.eq(i).attr("data-value", $ct.attr("data-value"))
                    nt4Client.addSample("/touchboard/" + $uiElements.eq(i).attr("data-topic"), $uiElements.eq(i).attr("data-value"))

                })

                let cH = $uiElements.eq(i).children(".optGroupButton")
                for(let j = 0; j < cH.length; j++){
                    if(cH.eq(j).hasClass("toggledOn")){
                        cH.eq(j).css("background-color",  cH.eq(j).css("background-color").replace(/^([^,]*,[^,]*,[^,]*),.*$/, '$1') + ", 0.6)");
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
