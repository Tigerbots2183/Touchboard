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

import { toastMessage } from "./ui.js";

export let renderQueue = new Map();

export let isFrameScheduled = {"scheduled": false};
// renderQueue example

//KEY : *NON - jQuery Reference object to basic subscription value, not the main component, what needs to be edited on it*
//VALUE : [ 
// {
//  "updating": "text", 
//  "newValue": value.toFixed(3).replace(".000", "")
//  },
// {
//  "updating": "attribute", 
//  "attrName": ""
//  "newValue": value
//  },
//  {
//  "updating": "rawProperty",
//  "propName": ""
//  "newValue": value
//  }
//  {
//  "updating": "removeAttribute",
//  "attrName": ""
//  }
//]

export function addToRender(element, instruction){
    if(renderQueue.has(element)){
        let elementQueue = renderQueue.get(element);

        elementQueue.push(instruction);

        renderQueue.set(element, elementQueue);
    } else {
        renderQueue.set(element, [instruction])
    }
}


export function renderFrame(){

    let currentQueue = renderQueue;

    let queueCount = 0

    renderQueue = new Map()


    isFrameScheduled.scheduled = false;


    for(let [element, instructions] of currentQueue){

        queueCount++

        for(let i = 0; i < instructions.length; i++){
            let instruction = instructions[i]
            element = $(element);

            switch (instruction.updating) {
                case "text":
                    element.text(instruction.newValue)
                    break;
                case "attribute":
                    element.attr(instruction.attrName, instruction.newValue)
                    break;
                case "rawProperty":
                    element[0].style.setProperty(instruction.propName, instruction.newValue)
                    break;
                case "removeAttribute":
                    element.removeAttr(instruction.attrName)
                    break;
                default:
                    console.warn("Unknown Instruction for Renderer: " + instruction.updating + " -> " + instruction.newValue);
                    break;
            }
        }

    }

    // toastMessage(queueCount + "")

}