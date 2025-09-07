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

import { nt4Client } from "./ui.js"

let tracks = []

let songGetter = $(".songSetter")
for(let i = 0; i < songGetter.length; i++){
    let currentSong = songGetter.eq(i)
    tracks[tracks.length] = {
        name: currentSong.attr("data-displayName"),
        coverArtSRC: currentSong.attr("data-coverSrc"),
        robotFileName: currentSong.attr("data-robotFileName"),
        played:false
    }
}  

let currentPlaybackArr = tracks

makeTracks(0, tracks)

function makeTracks(offset = 0, tracks) {
    $(".songSelector").empty()

    if (tracks.length - offset > 6) {
        $(".nextSongList").css("display", 'block').on("click", () => {
            makeTracks(offset + 6, currentPlaybackArr)
        })
    } else {
        $(".nextSongList").css("display", 'none').on("click", () => {
        })
    }

    if (offset > 0) {
        $(".prevSongList").css("display", 'block').on("click", () => {
            makeTracks(offset - 6, currentPlaybackArr)
        })
    } else {
        $(".prevSongList").css("display", 'none')
    }

    for (let i = offset; i < offset + 6; i++) {
        if (tracks[i] == null) {
            let trackDiv$ = $("<div>").addClass("track").css("grid-area", (i - offset) + "E").appendTo(".songSelector")
            continue
        }
        let trackDiv$ = $("<div>").addClass("track").css("grid-area", (i - offset) + "E").appendTo(".songSelector").on("click", () => {
            trackPress(tracks[i])
        })

        $("<img>").addClass("coverArt").attr("src", tracks[i].coverArtSRC).appendTo(trackDiv$).on("click", () => {
            trackPress(tracks[i]);
        });
        let nameHolder$ = $("<div>").addClass("nameHolder").appendTo(trackDiv$);
        $("<h1>").addClass("name").text(tracks[i].name).appendTo(nameHolder$)
    }
}

function trackPress(track) {
    $(".currentTrack").text(track.name);
    $(".discArt").attr("src", track.coverArtSRC);
    $(".hideableBar").css("display", "flex")

    if ($("#connect")[0].checked) {
        nt4Client.publishTopic("/touchboard/currentMusicFile", "string")
        nt4Client.addSample("/touchboard/currentMusicFile", track.robotFileName);

        nt4Client.publishTopic("/touchboard/newFile", "boolean")
        nt4Client.addSample("/touchboard/newFile", true);
    }

}

$(".stopPlayback").on('click', () => {
    nt4Client.publishTopic("/touchboard/goToNextSong", "boolean")
    nt4Client.addSample("/touchboard/goToNextSong", false);
    $(".hideableBar").css("display", "none")
    nt4Client.publishTopic("/touchboard/stopMusic", "boolean")
    nt4Client.addSample("/touchboard/stopMusic", true);

})

$(".playPause").on("click", (event) => {
    let $ct = $(event.currentTarget);
    if ($ct.attr("data-state") === "playing") {
        //Was playing, now switch icon to play icon and pause the music
        $ct.attr("data-state", "paused")
        $ct.text("▶").css("line-height", "13vh").css("transform", "translateX(15%)").css("font-size", "7vh")
        $(".discArt").css("animation-play-state", "paused")

        nt4Client.publishTopic("/touchboard/pauseMusic", "boolean")
        nt4Client.addSample("/touchboard/pauseMusic", true);

    } else {
        $ct.text("⏸").css("line-height", "12vh").css("transform", "translateX(0%)").css("font-size", "8vh")
        $ct.attr("data-state", "playing")
        $(".discArt").css("animation-play-state", "running")

        nt4Client.publishTopic("/touchboard/playMusic", "boolean")
        nt4Client.addSample("/touchboard/playMusic", true);
    }
})

$(".shuffleButton").on("click", (event) => {
    let $ct = $(event.currentTarget);
    nt4Client.publishTopic("/touchboard/goToNextSong", "boolean")

    if ($ct.attr("data-state") === "once") {
        //was play once, change Icon, and shuffle.
        $ct.text("🔀").css("transform", "translateX(0%)");
        $ct.attr("data-state", 'shuffle')
        currentPlaybackArr = shuffleArray(tracks, $(".currentTrack").text());
        makeTracks(0, currentPlaybackArr)
        nt4Client.addSample("/touchboard/goToNextSong", true);


    } else if ($ct.attr("data-state") === "shuffle") {
        //was shuffle, change Icon, and order.
        $ct.text("⮆").css("transform", "translateX(0%)");
        $ct.attr("data-state", 'ordered')
        currentPlaybackArr = tracks;
        makeTracks(0, tracks);
        nt4Client.addSample("/touchboard/goToNextSong", true);

    } else if ($ct.attr("data-state") === "ordered") {
        //was ordered, change Icon, and play once.
        $ct.text("⏺").css("transform", "translateX(0%)");
        $ct.attr("data-state", 'once')

        nt4Client.addSample("/touchboard/goToNextSong", false);
        }
})

$(".restartPlayback").on("click", () => {
    nt4Client.publishTopic("/touchboard/restartMusic", "boolean")
    nt4Client.addSample("/touchboard/restartMusic", true);
})

function shuffleArray(array, firstName) {
    array = structuredClone(array)
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements at index i and j
        [array[i], array[j]] = [array[j], array[i]];
    }

    for (let i = 0; i < array.length; i++) {
        if (array[i].name === firstName) {
            [array[i], array[0]] = [array[0], array[i]];
        }
    }

    return array;
}

$(".nextSong").on("click", ()=>{
    goToNextSong()
})

$(".prevSong").on("click",()=>{
    goToPrevSong()

})

export function goToNextSong(){
    for(let i = 0; i < currentPlaybackArr.length-1; i++){
        if (currentPlaybackArr[i].name === $(".currentTrack").text()) {
            trackPress(currentPlaybackArr[(i+1)])
            return
        }
    }
    $(".hideableBar").css("display", "none")
    nt4Client.publishTopic("/touchboard/stopMusic", "boolean")
    nt4Client.addSample("/touchboard/stopMusic", true);
}

function goToPrevSong(){
    for(let i = 1; i < currentPlaybackArr.length; i++){
        if (currentPlaybackArr[i].name === $(".currentTrack").text()) {
            trackPress(currentPlaybackArr[(i-1)])
            return
        }
    }
    $(".hideableBar").css("display", "none")
    nt4Client.publishTopic("/touchboard/stopMusic", "boolean")
    nt4Client.addSample("/touchboard/stopMusic", true);
}

$(".teamNumber").on("click", ()=>{
    $(".setTeamNumberOrIp").toggleClass("showTeamSet")
    
})