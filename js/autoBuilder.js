// MIT License

// Copyright (c) 2025 Tigerbots

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
const svgNS = "http://www.w3.org/2000/svg";
 
import { nt4Client } from "./ui.js"

import { getHtmlFileName } from "./ui.js";


let paths = {}

if (localStorage.getItem(getHtmlFileName() + "paths") == null) {
    localStorage.setItem(getHtmlFileName() + "paths", JSON.stringify({}))
    
} else {
    paths = JSON.parse(localStorage.getItem(getHtmlFileName() + "paths"))
}

for (let i in paths) {
    $("<div>").addClass("selectOption").insertBefore('.saveManager').text(i).val(paths[i]).on("mousedown touchstart", (event) => {
        setFromString($(event.currentTarget).val())
        $(".poseSelectorTitle").text(i)

    })
}

function alongPath(angle, radius, xposLocal = 750, yposLocal = 750,) {
    //stolen from 3dNgyn.js from 3dsnake that i made
    angle -= 90
    var Y = yposLocal + ((Math.sin(angle * Math.PI / 180) * radius));
    var X = xposLocal + (Math.cos(angle * Math.PI / 180) * radius)
    // console.log(" " + X + "," + Y + " ")
    return {
        point: " " + X + "," + Y + " ",
        x: X,
        y: Y,
    }
}

multiSwitchButtonEvent()
function multiSwitchButtonEvent() {
    $(".multiSwitchButton").off()
    $(".multiSwitchButton").on("click", (event) => {
        let leftOffset = $(event.target).offset().left - $(event.target).parent().offset().left
        $(event.target).parent().find(".multiSliding").css("margin-left", leftOffset + "px")
        $(event.target).parent().attr("data-value", $(event.target).val())
    })
}


let $pbt = $(".poseBTN")
let currentTimeout = false
let currentDragFrom = ""
let currentDragTo = ""
let currentDragStarted
let startDragX = 0
let mouseIsDown = false
let initalLeft

populateCommands()
function populateCommands() {
    // $(".commandHolder").empty()
    let commands = $(".autoCommand")
    for (let i = 0; i < commands.length; i++) {
        let currentCommand = {
            name:commands.eq(i).attr("data-displayName"),
            value:commands.eq(i).attr("data-value")
        }

        let newElem = $("<h2>").addClass("commandOptionNamed").text(currentCommand.name).appendTo('.commandHolder').on('click', () => {
            $(".poseSelectorTitle").text("Saved")

            let $cr = $("<div>").addClass("ordered").text(currentCommand.value).appendTo(".orderHolder").on("mousedown touchstart", (event) => {
                let $ct = event.currentTarget
                currentTimeout = setTimeout(() => {
                    currentDragFrom = $ct

                    if (event.pageX == null) {
                        startDragX = event.changedTouches[0].pageX
                    } else {
                        startDragX = event.pageX
                    }
                    initalLeft = $(currentDragFrom).offset().left
                    $($ct).addClass("orderedPhase").css("left", startDragX - ($($ct).width() / 2) + "px")
                    $($ct).next().addClass("orderedGap")
                    setTimeout(() => {
                        $(".ordered").addClass("orderedTransition")

                    }, 10);
                    $(".ordered").css("background-color", "#7300ff55")

                }, 200);
                currentDragStarted = false
                mouseIsDown = true

            }).on("mouseup touchend", (event) => {
                clearTimeout(currentTimeout)

                if (currentDragStarted) {

                    $(".ordered").removeClass("orderedTransition")

                    $(currentDragFrom).removeClass("orderedPhase")
                    $(".orderedGap").removeClass("orderedGap").removeClass("orderedGapLeft")
                    $(".orderedGapLeft").removeClass("orderedGap").removeClass("orderedGapLeft")

                    mouseIsDown = false

                    $(".ordered").css("left", "0px")

                    currentDragFrom = ""
                    currentDragTo = ""
                    $(".ordered").css("background-color", "rgb(12, 12, 12)")

                } else {
                    $(".ordered").removeClass("orderedTransition").css("left", "0px").removeClass("orderedGap").removeClass("orderedLeft").removeClass("orderedPhase")
                }
            }).on("click", (event) => {
                event.preventDefault()
                if (!currentDragStarted) {
                    $($cr).remove()
                }
            }).on("touchcancel", () => {
                clearTimeout(currentTimeout)
            })
            $(".orderHolder").scrollLeft($(".orderHolder")[0].scrollWidth)
            if ($(".multiSwitch").attr("data-value") == "Sync") {
                $cr.text(currentCommand.value + "+")
            }


        })

        if (!$(".commands").hasClass("commandName")) {
            newElem.text(currentCommand.value).removeClass("commandOptionNamed").addClass("commandOption")
        }
        commands.eq(i).remove()
    }

}

$(".commandTitle").on("click", () => {
    $(".commands").toggleClass("commandName")
    populateCommands()
})


startMovin()
function startMovin(initX, initY) {
    $("html").on("touchmove mousemove", (event) => {
        if (currentDragFrom !== "") {
            let x
            let y
            if (x == null) {
                if (event.pageX == null) {
                    y = event.changedTouches[0].pageY
                    x = event.changedTouches[0].pageX
                } else {
                    y = event.pageY
                    x = event.pageX
                }
            }
            let $cL = $(document.elementsFromPoint($(currentDragFrom).offset().left, $(currentDragFrom).offset().top))
            let $cR = $(document.elementsFromPoint($(currentDragFrom).offset().left + $(currentDragFrom).width(), $(currentDragFrom).offset().top))
            let $cG = $("eee")
            for (let i = 0; i < $cR.length; i++) {
                if ($cR.eq(i).hasClass("ordered") && !($cR.eq(i).hasClass("orderedPhase"))) {
                    $cG = $cR.eq(i)
                    break
                }
            }
            let $ce = $("eee")
            for (let i = 0; i < $cL.length; i++) {
                if ($cL.eq(i).hasClass("ordered") && !($cL.eq(i).hasClass("orderedPhase"))) {
                    $ce = $cL.eq(i)
                    break
                }
            }
            if (mouseIsDown) {
                $(".orderedPhase").css("left", x - ($(".orderedPhase").width() / 2) + "px")
            }
            if ($ce.hasClass("ordered") && currentDragFrom !== "") {
                currentDragStarted = true


                currentDragTo = $ce
                if (initalLeft < $(currentDragTo).offset().left) {

                    $(".orderedGap").removeClass("orderedGap")

                    $(currentDragFrom).insertAfter(currentDragTo)
                    if ($ce.next().hasClass("orderedPhase")) {
                        $ce.next().next().addClass("orderedGap")
                    } else {
                        $ce.next().addClass("orderedGap")
                    }
                    // $(currentDragFrom).css("background-color", "yellow")
                    // $(currentDragTo).css("background-color", "blue")
                    setTimeout(() => {
                        initalLeft = $(currentDragFrom).offset().left

                    }, 30);

                } else if (initalLeft > $(currentDragTo).offset().left && $(currentDragFrom).offset().left + $(currentDragFrom).width() < $(currentDragTo).offset().left + $(currentDragTo).width()) {

                    $(currentDragFrom).insertBefore(currentDragTo)

                    $(".orderedGap").removeClass("orderedGap")
                    $cG.addClass("orderedGap")
                    // $(currentDragFrom).css("background-color", "yellow")
                    // $(currentDragTo).css("background-color", "purple")
                    setTimeout(() => {
                        initalLeft = $(currentDragFrom).offset().left

                    }, 30);

                }
                // console.log($(currentDragTo).offset().left+ $(".ordered").width() + " > " + $(currentDragFrom).offset().left)

                // currentDragTo = ""
            }
        }
    })

}


for (let i = 0; i < $pbt.length; i++) {
    let eq$ = $pbt.eq(i)

    eq$.on("mousedown touchstart", (event) => {
        event.preventDefault()

        let $cr = $("<div>").addClass("ordered").text(eq$.attr("data-pose")).appendTo(".orderHolder").on("mousedown touchstart", (event) => {
            let $ct = event.currentTarget
            currentTimeout = setTimeout(() => {
                currentDragFrom = $ct

                if (event.pageX == null) {
                    startDragX = event.changedTouches[0].pageX
                } else {
                    startDragX = event.pageX
                }
                initalLeft = $(currentDragFrom).offset().left
                $($ct).addClass("orderedPhase").css("left", startDragX - ($($ct).width() / 2) + "px")
                $($ct).next().addClass("orderedGap")
                setTimeout(() => {
                    $(".ordered").addClass("orderedTransition")

                }, 10);
                $(".ordered").css("background-color", "#7300ff55")

            }, 200);
            currentDragStarted = false
            mouseIsDown = true

        }).on("mouseup touchend mouseleave", (event) => {
            clearTimeout(currentTimeout)

            if (currentDragStarted) {

                $(".ordered").removeClass("orderedTransition")

                $(currentDragFrom).removeClass("orderedPhase")
                $(".orderedGap").removeClass("orderedGap").removeClass("orderedGapLeft")
                $(".orderedGapLeft").removeClass("orderedGap").removeClass("orderedGapLeft")

                mouseIsDown = false

                $(".ordered").css("left", "0px")

                currentDragFrom = ""
                currentDragTo = ""
                $(".ordered").css("background-color", "rgb(12, 12, 12)")

            } else {
                $(".ordered").removeClass("orderedTransition").css("left", "0px").removeClass("orderedGap").removeClass("orderedLeft").removeClass("orderedPhase")
            }
        }).on("click", (event) => {
            event.preventDefault()
            if (!currentDragStarted) {
                $($cr).remove()
            }
        }).on("touchcancel", () => {
            clearTimeout(currentTimeout)
        })
        $(".orderHolder").scrollLeft($(".orderHolder")[0].scrollWidth)

        // if($(".multiSwitch").attr("data-value") == "Simultaneous"){
        //     $cr.text(eq$.attr("data-pose") + "S")
        // }

        eq$.css("fill", "#7300ff")
        eq$.offset()
        setTimeout(() => {
            eq$.css('fill', "#333333").css("transition", '500ms ease fill')
            setTimeout(() => {
                eq$.css("transition", '')
            }, 500);
        }, 10);
    })

}


$('.startPos').on("input", () => {
    // console.log($(".startPos").val())
    drawPath()

})

let finishedPath = ""

const observer = new MutationObserver(drawPath)
observer.observe(document.getElementById("orderHolder"), { attributes: true, childList: true, subtree: true })

function drawPath() {
    let aPSVG = $(".autoMap")
    $(".currentPath").remove()
    let pathElm = $(document.createElementNS(svgNS, 'path')).appendTo(aPSVG).addClass("currentPath")
    pathElm.css("stroke", '#ffffffee')
    pathElm.css("fill", 'none')

    pathElm.css("stroke-width", "30")
    finishedPath = ""

    moveTo($(".startPos").val(), 330)
    $(".orderHolder").offset()
    let $oH = document.getElementsByClassName("ordered")

    for (let i = 0; i < $oH.length; i++) {
        let $eq = $($oH[i])
        let $po = $("#pose" + $eq.text())
        if ($po.attr("data-x")) {
            lineTo(parseFloat($po.attr("data-x")) + (179.749980769 / 2), parseFloat($po.attr("data-y")) + (179.749980769 / 2))

        }

    }
    pathElm.attr("d", finishedPath)


}


function moveTo(x, y) {
    finishedPath = finishedPath + ` M ${x} ${y} `
}
function lineTo(x, y) {
    finishedPath = finishedPath + ` L ${x} ${y} `

}
function cubicBezier(startControlX, startControlY, endControlX, endControlY, endX, endY) {
    finishedPath = finishedPath + ` C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${endX} ${endY}`
}
function cubicBezierContinued(endControlX, endControlY, endX, endY) {
    finishedPath = finishedPath + ` S ${endControlX} ${endControlY}, ${endX} ${endY}`

}
function quadBezier(controlX, controlY, endX, endY) {
    finishedPath = finishedPath + ` Q ${controlX} ${controlY}, ${endX} ${endY}`
}
function quadBezierContinued(endX, endY) {
    finishedPath = finishedPath + ` T ${endX} ${endY}`
}
function arc(endX, endY, rx, sweep) {
    finishedPath = finishedPath + ` A ${rx} ${rx} 0 0 ${sweep} ${endX} ${endY}`
}

$(".send").on("click", () => {
    let $oH = document.getElementsByClassName("ordered")
    let finalString = ""
    // console.log($oH)
    for (let i = 0; i < $oH.length; i++) {
        let $eq = $($oH[i])
        finalString = finalString + $eq.text() + "-"
    }
    finalString = finalString.slice(0, -1)
    localStorage.setItem(getHtmlFileName() + "currentPath", finalString)

    console.log(finalString)
    if ($("#connect")[0].checked) {
        nt4Client.publishTopic("/touchboard/posePlotterFinalString", "string")
        nt4Client.addSample("/touchboard/posePlotterFinalString", finalString);
        $(".connectionText").text("Sending Path!")

        setTimeout(() => {
            $(".connectionText").text("Connected")
        }, 3000);
    } else {
        $(".connectionText").text("Not Connected!")
        setTimeout(() => {
            $(".connectionText").text("Offline")
        }, 3000);
    }

})

// setFromString("3+-I-4S-0+-LM-T-3+-K-4S-0+-LB-T-3+-L-4S-0")

export function setFromString(string) {
    $(".orderHolder").empty()
    if (string == null){
        return

    }else if(string.length < 1){
        return
    }
    let stringArr = string.split("-")

    for (let i = 0; i < stringArr.length; i++) {

        let $cr = $("<div>").addClass("ordered").text(stringArr[i]).appendTo(".orderHolder").on("mousedown touchstart", (event) => {
            let $ct = event.currentTarget
            currentTimeout = setTimeout(() => {
                currentDragFrom = $ct

                if (event.pageX == null) {
                    startDragX = event.changedTouches[0].pageX
                } else {
                    startDragX = event.pageX
                }
                initalLeft = $(currentDragFrom).offset().left
                $($ct).addClass("orderedPhase").css("left", startDragX - ($($ct).width() / 2) + "px")
                $($ct).next().addClass("orderedGap")
                setTimeout(() => {
                    $(".ordered").addClass("orderedTransition")

                }, 10);
                $(".ordered").css("background-color", "#7300ff55")

            }, 200);
            currentDragStarted = false
            mouseIsDown = true

        }).on("mouseup touchend mouseleave", (event) => {
            clearTimeout(currentTimeout)

            if (currentDragStarted) {

                $(".ordered").removeClass("orderedTransition")

                $(currentDragFrom).removeClass("orderedPhase")
                $(".orderedGap").removeClass("orderedGap").removeClass("orderedGapLeft")
                $(".orderedGapLeft").removeClass("orderedGap").removeClass("orderedGapLeft")

                mouseIsDown = false

                $(".ordered").css("left", "0px")

                currentDragFrom = ""
                currentDragTo = ""
                $(".ordered").css("background-color", "rgb(12, 12, 12)")

            } else {
                $(".ordered").removeClass("orderedTransition").css("left", "0px").removeClass("orderedGap").removeClass("orderedLeft").removeClass("orderedPhase")
            }
        }).on("click", (event) => {
            event.preventDefault()
            if (!currentDragStarted) {
                $($cr).remove()
            }
        }).on("touchcancel", () => {
            clearTimeout(currentTimeout)
        })
        $(".orderHolder").scrollLeft($(".orderHolder")[0].scrollWidth)

        // if($(".multiSwitch").attr("data-value") == "Simultaneous"){
        //     $cr.text(eq$.attr("data-pose") + "S")
        // }

        $cr.css("fill", "#7300ff")
        $cr.offset()
        setTimeout(() => {
            $cr.css('fill', "#333333").css("transition", '500ms ease fill')
            setTimeout(() => {
                $cr.css("transition", '')
            }, 500);
        }, 10);
    }

}


$(".clear").on("click", () => {
    $(".orderHolder").empty()
    $(".poseSelectorTitle").text("Saved")

})

setFromString(localStorage.getItem(getHtmlFileName() + "currentPath"))

$('.save').on("mousedown touchstart", () => {
    let saveName = $(".saveName").val()

    if (saveName !== null) {
        let $oH = document.getElementsByClassName("ordered")
        let finalString = ""
        for (let i = 0; i < $oH.length; i++) {
            let $eq = $($oH[i])
            finalString = finalString + $eq.text() + "-"
        }
        finalString = finalString.slice(0, -1)

        paths = JSON.parse(localStorage.getItem(getHtmlFileName() + "paths"))

        paths[saveName] = finalString;

        localStorage.setItem(getHtmlFileName() + "paths", JSON.stringify(paths));

        $(".poseSelector").children('.selectOption').remove()


        for (let i in paths) {
            $("<div>").addClass("selectOption").insertBefore('.saveManager').text(i).val(paths[i]).on("mousedown touchstart", (event) => {
                setFromString($(event.currentTarget).val())
                $(".poseSelectorTitle").text(i)

            })
        }
    }

    setTimeout(() => {
        $(".saveName").val("")
        $(".poseSelector").removeClass("selectOpen")
       }, 1000);
})

$(".delete").off().on("click", () => {
    $(".selectOption").off().on("mousedown touchstart", (event) => {
        paths = JSON.parse(localStorage.getItem(getHtmlFileName() + "paths"))

        delete paths[$(event.currentTarget).text()]

        localStorage.setItem(getHtmlFileName() + "paths", JSON.stringify(paths));

        $(".poseSelector").children('.selectOption').remove()


        for (let i in paths) {
            $("<div>").addClass("selectOption").insertBefore('.saveManager').text(i).val(paths[i]).on("mousedown touchstart", (event) => {
                setFromString($(event.currentTarget).val())
                $(".poseSelectorTitle").text(i)

            })
        }

        $(".select").removeClass("selectOpen").scrollTop(0)

    })
})