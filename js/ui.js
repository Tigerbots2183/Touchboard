// import "./nt4.js"
import {initEditor} from "./editor/editorUi.js"
import {saveLayoutToJSON, loadLayoutFromJson} from "./save.js"
import { getHtmlFileName, nt4Client} from "./coms.js";
import { setGridInput, tabGrid } from "./editor/grid.js";
import { renderFrame } from "./renderer.js"

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



// const isObject = (val) => val !== null && typeof val === 'object';

let toastOpen = false
let toastTimeout;

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

document.addEventListener('dragstart', (event) => {
    event.preventDefault();
});

export function clamp(num, min = 0, max = 1) { return Math.min(Math.max(num, min), max) };

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

export function setSelectOpener() {
    $(".select").not(".sideBarSelect").off("pointerdown.selectOpener").on("pointerdown.selectOpener", (event) => {
        if (!$(event.target).hasClass("textInput") && !$(event.target).hasClass("delete") && !$(event.target).hasClass("save") && !$(event.target).hasClass("saveManager")) {
            $(event.currentTarget).toggleClass("selectOpen")

        }
    })
}

export let outputComponents = {
    topic: "",
    changing: false,
    changingValidTypes: ["all"],
    changingSidebar: "",
}

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
        // if ($(".editTabs").hasClass("editingTabs")) return


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
        $(".gridUnderlay").empty()
        $(".setGridRow").addClass("hiddenClickless")
        $(".setGridColumn").addClass("hiddenClickless")

        t$.parent().remove()
    })
}



export function multiSwitchButtonSet(element, optionValue) {
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


function bindImportExport() {
    $(".exportBtn").on("click", () => {
        toastMessage("Layout Copied")
        navigator.clipboard.writeText(saveLayoutToJSON())

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
}


// captureMJPEG($(".cameraComponent"))







// $(".testbtn2").on("click", () => {
//     localStorage.setItem("layout", prompt("Input Json"));
//     clear = true;
//     window.location.reload();
// })







export function createSideTab(name, page, state = "") {
    let div = $("<div>").addClass("sideTab").attr("data-page", page).addClass("sTAB" + page.slice(1)).css("background-color", "white").addClass(state)

    setTimeout(() => {
        div.offset()
        div.css("background-color", "")
    }, 0);

    // div.css("background-color", "")

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


// function mapDragHandler() {
//     let map = $(".map");

//     clientDragHandler()
// }

function bindConnectionToggle() {
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
}

function bindTeamNumberToggle() {
    $(".setTeam").on("click", () => {
        let currentTeamOrIp = $(".teamNumberInput").val().toString().replace(/\s/g, "");
        if (currentTeamOrIp.length > 0) {
            //If team number, set ip to 10.XXX.YY.2
            if (currentTeamOrIp.includes(".")) {
                localStorage.setItem(getHtmlFileName() + "teamNumber", currentTeamOrIp)
            } else if (currentTeamOrIp.includes("localhost")) {
                localStorage.setItem(getHtmlFileName() + "teamNumber", "localhost")
            } else if (currentTeamOrIp.length <= 5) {
                let madeIp = "10."

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
}

















function bindTabManagerOpener() {
    $(".tabManager").on("click", () => {
        $(".manager").toggleClass("managerOpen")
    })
}

function autoSaveOnExit() {
    $(document).on('visibilitychange', () => {
        if (document.visibilityState === "hidden") {
            if (clear) {
                return
            }

            let layout = saveLayoutToJSON()

            localStorage.setItem("layout", layout)
        }

    })
}

function setSavedLayout() {
    if (localStorage.getItem("layout")) {
        loadLayoutFromJson(localStorage.getItem("layout"))
    } else {
        localStorage.setItem("layout", JSON.stringify({".TeleopB29257671233746385":{"tabTitle":"Teleop","tabRows":"4","tabColumns":"9","state":"tabVisible","components":[]},".AutoB909642247728146":{"tabTitle":"Auto","tabRows":"4","tabColumns":"9","state":"tabVisible","components":[]}}))

        loadLayoutFromJson(localStorage.getItem("layout"))
    }
}

function bindTeamNumberMenuOpener() {
    //If no team is currently set, open the team setter ui. 
    if (localStorage.getItem(getHtmlFileName() + "teamNumber") == null) {
        $(".connectionText").text("No Team")
        $(".setTeamNumberOrIp").toggleClass("showTeamSet")
        $("#connect")[0].checked = false
    }

    $(".teamNumber").on("click", () => {
        $(".setTeamNumberOrIp").toggleClass("showTeamSet")

    })
}

function setCurrentState() {
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
}

function bindFullScreen() {
    $(".fullScreen").on("click", () => {
        document.querySelector("html").requestFullscreen();
    })
}

function bindSelectCloser() {
    $("html").on("click", (event) => {
        if (!$(event.target).hasClass("selectTitle") && !$(event.target).hasClass("textInput") && !$(event.target).hasClass("delete") && !$(event.target).hasClass("save") && !$(event.target).hasClass("saveManager")) {
            $(".select").removeClass("selectOpen").scrollTop(0)
        }
    })
}

init()

function init() {
    document.body.addEventListener("drop", (event) => { event.preventDefault(); event.stopPropagation() }, false)
    document.body.addEventListener("dragover", (event) => { event.preventDefault() }, false)

    if (localStorage.getItem(getHtmlFileName() + "currentPath") == null) {
        localStorage.setItem(getHtmlFileName() + "currentPath", "")
    }


    //GenUi
    bindFullScreen();
    setSelectOpener();
    bindSelectCloser();
    bindConnectionToggle();
    bindTeamNumberToggle();
    bindTabChanger();
    bindTabManagerOpener();
    bindImportExport();

    //EditorUI
    initEditor();

    //Util
    autoSaveOnExit();
    setSavedLayout();
    bindTeamNumberMenuOpener();
    setCurrentState()

    window.requestAnimationFrame(renderFrame)

}