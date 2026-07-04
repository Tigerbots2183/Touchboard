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

import { pxToCq } from "../ui.js"
import { createDefaultOf } from "./components/components.js"
import { roundToNearestX } from "../../lib/util.js"

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

//Grid Setup

export function tabGrid(columns, rows, tab) {
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

//Grid Visuals
function setGridUnderlay(columns, rows) {
    $(".gridSquare").remove()
    for (let i = 0; i < columns * rows; i++) {
        //added 1 to be consitent with css namings.
        $("<div>").addClass("gridSquare").appendTo(".gridUnderlay").attr("data-column", (i % columns) + 1).attr("data-row", (Math.floor(i / columns)) + 1)
    }

}

export function setCornerBorder(row = endRow, column = endColumn, endRow, endColumn, append = false, remove = true) {
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

//Grid Event Handlers
export function setGridInput(tab) {

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

export function addToCurrentDrag(jQueryReference, initialX, initialY, componentType) {
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

export function clientDragHandler(event, jQueryReference) {

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


//Helpers

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

export function findEndOffset(row, column, endRow, endColumn) {
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