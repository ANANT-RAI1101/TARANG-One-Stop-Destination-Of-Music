
const search = document.querySelector(".searchicon");
const pop = document.querySelector(".popup");

search.addEventListener("click", function () {
    if (document.querySelector(".popup").classList.contains("show")) {
        document.querySelector(".popup").classList.remove("show")
    }
    else {
        document.querySelector(".popup").classList.add("show")
    }

});

const closebttn = document.querySelector(".closebtn");
closebttn.addEventListener("click", function () {
    document.querySelector(".popup").classList.remove("show")
    document.querySelector(".left").style.left = "-120%"
})

let songs = [];
let currentSong = new Audio();
let isPlaying = false;
let currentSongName = "";
let activebtn = null;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


function playMusic(song) {
    currentSong.src = `/${currFolder}/${song}`;
    currentSong.play();
    currentSong.play().catch((err) => {
        console.error("Playback failed:", err);
        alert("⚠️ Unable to play this song. It might be missing or blocked by your browser.");

        document.querySelector(".cd").classList.remove("spin");
        document.querySelector(".playControl img").src = "assets/play.svg";
        if (activebtn) {
            activebtn.querySelector("img").src = "assets/play.svg";
        }
        songs.indexOf(currentSongName)
    });
    document.querySelector(".songinfo").innerHTML = currentSongName
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

// search of songs
document.querySelector(".popupsearch").addEventListener("click", function () {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const songElements = document.querySelectorAll(".songlist div");

    songElements.forEach(songEl => {
        const songName = songEl.textContent.toLowerCase();
        if (songName.includes(input)) {
            songEl.style.display = "flex";
            document.querySelector(".popup").classList.remove("show")

        } else {
            songEl.style.display = "none";
        }
    });
});




// loading songs
async function loadsong(folder) {

    currFolder = folder;
    let songUL = document.querySelector(".songlist");
    songUL.innerHTML = "";
    songs = [];

    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = element.getAttribute("href").replace(/\\/g, "/");

        // Ignore the parent directory link
        if (href === "../") continue;

        // Extract only the filename, no folder information
        let filename = href.split("/").pop();  // get only the file name

        if (filename.endsWith(".mp3")) {
            songs.push(filename);  // Push only the filename
        }
    }


    let x = 1;
    for (const song of songs) {
        songUL.innerHTML += `<div>  <span class="song-title">${x}. ${song}</span> <button class="play-btn" data-song="${song}">
                    <img src="assets/play.svg" alt="Play" width="20">
                </button></div>` ;

        x++;
    }
    setupPlayButtons();
    return songs;
}
async function defaultsongs() {
    songUL = ""
    await loadsong("music_assest/Top Shuffled Songs")

}

// showing albums
async function displayalbums() {
    let cardContainer = document.querySelector(".playlistcontainer");

    let a = await fetch(`music_assest/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/music_assest") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/music_assest/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
          <img src="/music_assest/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await loadsong(`music_assest/${item.currentTarget.dataset.folder}`)

        })
    })



}
function setupPlayButtons() {
    activebtn = document.querySelector(".play-btn");
    document.querySelectorAll(".play-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent bubbling
            const song = e.currentTarget.getAttribute("data-song");
            document.querySelectorAll(".play-btn img").forEach(img => {
                img.src = "assets/play.svg";

            });
            if (currentSongName !== song) {
                playMusic(song);  // Start playing the new song
                currentSongName = song;
                isPlaying = true;
                document.querySelector(".cd").classList.add("spin");  // Add spin effect to CD
                e.currentTarget.querySelector("img").src = "assets/pause.svg";  // Change to pause icon
                document.querySelector(".playControl img").src = "assets/pause.svg";
                document.querySelector(".songinfo").innerHTML = decodeURI(currentSongName)
                activebtn = e.currentTarget;
                let bttn = document.querySelector(".playControl");
                bttn.setAttribute("data-song", decodeURI(currentSongName)); //changing the data-song attribute of main play btn
            }
            else {
                // If the song is already loaded, toggle play/pause
                if (isPlaying) {
                    currentSong.pause();  // Pause the song
                    isPlaying = false;  // Mark the song as paused
                    document.querySelector(".cd").classList.remove("spin");  // Remove spin effect
                    e.currentTarget.querySelector("img").src = "assets/play.svg";  // Change to play icon
                    document.querySelector(".playControl img").src = "assets/play.svg";
                } else {
                    currentSong.play();  // Play the song
                    isPlaying = true;  // Mark the song as playing
                    document.querySelector(".cd").classList.add("spin");  // Add spin effect to CD
                    e.currentTarget.querySelector("img").src = "assets/pause.svg";  // Change to pause icon
                    document.querySelector(".playControl img").src = "assets/pause.svg";
                }
            }



        });

    });
}

// showing songs

async function main() {
    await defaultsongs()
    await displayalbums();


}

let bttn = document.querySelector(".playControl")
bttn.addEventListener("click", (e) => {
    let play_song = e.currentTarget.getAttribute("data-song");
    e.stopPropagation();

    if (!currentSong.src || currentSongName !== bttn.getAttribute("data-song")) {
        currentSongName = play_song
        playMusic(currentSongName);
        isPlaying = true;
        document.querySelector(".cd").classList.add("spin");
        if (activebtn) {
            activebtn.querySelector("img").src = "assets/pause.svg"
        }
        document.querySelector(".playControl img").src = "assets/pause.svg"
        return;

    }

    if (isPlaying) {
        currentSong.pause();
        isPlaying = false;
        document.querySelector(".cd").classList.remove("spin");
        if (activebtn) {
            activebtn.querySelector("img").src = "assets/play.svg"
        }
        document.querySelector(".playControl img").src = "assets/play.svg"

    }


    else {
        currentSong.play();
        isPlaying = true;
        document.querySelector(".cd").classList.add("spin");
        if (activebtn) {
            activebtn.querySelector("img").src = "assets/pause.svg"
        }
        document.querySelector(".playControl img").src = "assets/pause.svg"

    }
})

// time updation
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".seekcircle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

})

// listener for seek bar
document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekcircle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
})

document.querySelector(".prvControl").addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSongName);
    if ((index - 1) >= 0) {
        currentSongName = songs[index - 1];
        playMusic(currentSongName);
        bttn.setAttribute("data-song", decodeURI(currentSongName))
    }
    document.querySelectorAll(".play-btn").forEach(btn => {
        if (btn.getAttribute("data-song") === currentSongName) {
            btn.querySelector("img").src = "assets/pause.svg";
            bttn.querySelector("img").src = "assets/pause.svg";
            activebtn = btn;
        }
        else {
            btn.querySelector("img").src = "assets/play.svg";
        }
    });
})

// Add an event listener to next
document.querySelector(".aftControl").addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSongName);
    if ((index + 1) < songs.length) {
        currentSongName = songs[index + 1];
        playMusic(currentSongName);
        bttn.setAttribute("data-song", decodeURI(currentSongName))
    }
    document.querySelectorAll(".play-btn").forEach(btn => {
        if (btn.getAttribute("data-song") === currentSongName) {
            btn.querySelector("img").src = "assets/pause.svg";
            bttn.querySelector("img").src = "assets/pause.svg";
            activebtn = btn;
        }
        else {
            btn.querySelector("img").src = "assets/play.svg";
        }
    });
})

// volume listener
document.querySelector(".range input").addEventListener("input", (e) => {
    const volumeValue = parseInt(e.target.value) / 100;
    currentSong.volume = volumeValue
})

// hamburger event listener
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})
document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
})


main();

