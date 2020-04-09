function id(name) {
    return document.getElementById(name);
}
const NOTE_DELAY = 1250;
document.addEventListener("DOMContentLoaded", function() {

let midi_loaded = false;
try {
    MIDI.loadPlugin({
        soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
        instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            document.querySelector(".overlay").classList.add("hidden");
            midi_loaded = true;
        }
    });
} catch (e) {
    console.error(e);
    document.querySelector(".overlay .text").textContent = "Wystąpił błąd!";
    window._paq.push(["trackEvent", "loadingError", "exception", e.toString()]);
}
const mainmenu = id("mainmenu");
const intcontainer = id("interwaly");
const int_button = id("b_inter");
const tricontainer = id("trojdzwieki");
const troj_button = id("b_troj");
const trojprz_button = id("b_trojprz");
const tonacje_button = id("b_ton");
const ints = [
    "pryma czysta",
    "sekunda mała",
    "sekunda wielka",
    "tercja mała",
    "tercja wielka",
    "kwarta czysta",
    "tryton",
    "kwinta czysta",
    "seksta mała",
    "seksta wielka",
    "septyma mała",
    "septyma wielka",
    "oktawa czysta"
];
let state = 0;
let chosen_option = 0;
let int = [];
let tri = [];
let answers = [0, 0];

function reset_buttons() {
    document.querySelectorAll(".pres_button").forEach(
        x=>x.classList.remove("pres_button_chosen")
    )
}
document.querySelectorAll(".pres_button_mel").forEach(x=>x.addEventListener("click", function() {
    reset_buttons();
    chosen_option = 0;
    document.querySelectorAll(".pres_button_mel").forEach(
        x=>x.classList.add("pres_button_chosen")
    )
}));
document.querySelectorAll(".pres_button_harm").forEach(x=>x.addEventListener("click", function() {
    reset_buttons();
    chosen_option = 1;
    document.querySelectorAll(".pres_button_harm").forEach(
        x=>x.classList.add("pres_button_chosen")
    )
}));
document.querySelectorAll(".pres_button_melharm").forEach(x=>x.addEventListener("click", function() {
    reset_buttons();
    chosen_option = 2;
    document.querySelectorAll(".pres_button_melharm").forEach(
        x=>x.classList.add("pres_button_chosen")
    )
}));

function show_score(prefix) {
    id(prefix+"_score_ok").textContent = answers[0];
    id(prefix+"_score_all").textContent = answers[1];
    if (answers[1] > 0) {
        id(prefix+"_score_percent").textContent = `(${Math.round((answers[0]/answers[1])*100)}%)`;
    } else {
        id(prefix+"_score_percent").textContent = '(0%)';
    }
}

/////////////////////
// INTERWAŁY
/////////////////////

function interwaly() {
    id("int_start").classList.remove("unavailable");
    id("int_again").classList.add("unavailable");
    id("int_reset").classList.add("unavailable");
    id("int_wrong").classList.add("hidden");
    answers = [0, 0];
    show_score("int");
    mainmenu.classList.add("hiding");
    setTimeout(function() {
        mainmenu.classList.add("hidden");
        intcontainer.classList.remove("hidden");
        intcontainer.classList.remove("hiding");
    }, 250);
    state = 1;
}
int_button.addEventListener("click", interwaly);

function generate_interval() {
    let diff = Math.floor((Math.random() * 13)); // 0-12
    let base = Math.floor((Math.random()*24)+48); // idk
    console.log(`cheat: base${base} diff${diff}`);
    int = [base, base+diff, diff];
}
function play_interval_mel() {
    MIDI.noteOn(0, int[0], 127, 0);
    MIDI.noteOff(0, int[0], NOTE_DELAY);
    setTimeout(function() {
        MIDI.noteOn(0, int[1], 127, 0);
        MIDI.noteOff(0, int[1], NOTE_DELAY);
    }, NOTE_DELAY);
}
function play_interval_harm() {
    MIDI.chordOn(0, [int[0], int[1]], 127, 0);
    MIDI.chordOff(0, [int[0], int[1]], NOTE_DELAY);
}
function play_interval() {
    if (state != 2) return;
    if (chosen_option == 0) {
        play_interval_mel();
    } else if (chosen_option == 1) {
        play_interval_harm();
    } else if (chosen_option == 2) {
        play_interval_mel();
        setTimeout(play_interval_harm, NOTE_DELAY*2);
    }
}
function int_round() {
    generate_interval();
    state = 2;
    play_interval();
}
function int_start() {
    if (state != 1) return;
    answers = [0, 0];
    show_score("tri");
    state = 2;
    id("int_start").classList.add("unavailable");
    id("int_again").classList.remove("unavailable");
    id("int_reset").classList.remove("unavailable");
    setTimeout(int_round, 0);
    window._paq.push(["trackEvent", "startPractice", "intervals"]);
}
function int_reset() {
    if (state != 2) return;
    answers = [0, 0];
    show_score("tri");
    state = 1;
    id("int_start").classList.remove("unavailable");
    id("int_again").classList.add("unavailable");
    id("int_reset").classList.add("unavailable");
    id("int_wrong").classList.add("hidden");
}
id("int_start").addEventListener("click", int_start);
id("int_again").addEventListener("click", play_interval);
id("int_reset").addEventListener("click", int_reset);

function int_answer(num) {
    return function() {
        if (state != 2) return;
        if (num == int[2]) {
            answers[0]++;
            answers[1]++;
            show_score("int");
            state = 3;
            setTimeout(int_round, NOTE_DELAY*1.5);
        } else {
            id("int_wrongcorrect").textContent = ints[int[2]];
            id("int_wrong").classList.remove("hidden");
            answers[1]++;
            show_score("int");
            state = 3;
        }
    }
}
for (let i = 0; i < 13; i++) {
    id(`int_${i}`).addEventListener("click", int_answer(i));
}
function int_next() {
    state = 2;
    id("int_wrong").classList.add("hidden");
    int_round();
}
id("int_next").addEventListener("click", int_next);


//////////////////////////////
// TRÓJDŹWIĘKI
//////////////////////////////

tris = ["durowy", "molowy", "zmniejszony", "zwiększony"];


function trojdzwieki() {
    window._paq.push(["trackEvent", "startPractice", "triads"]);
    id("tri_start").classList.remove("unavailable");
    id("tri_again").classList.add("unavailable");
    id("tri_reset").classList.add("unavailable");
    id("tri_wrong").classList.add("hidden");
    answers = [0, 0];
    show_score("tri");
    mainmenu.classList.add("hiding");
    setTimeout(function() {
        mainmenu.classList.add("hidden");
        tricontainer.classList.remove("hidden");
        tricontainer.classList.remove("hiding");
    }, 250);
    state = 11;
}
troj_button.addEventListener("click", trojdzwieki);

function generate_triad() {
    let type = Math.floor((Math.random() * 4)); // 0-3
    let base = Math.floor((Math.random()*24)+48); // idk
    if (type == 0) {
        tri = [[base, base+4, base+7], type];
    } else if (type == 1) {
        tri = [[base, base+3, base+7], type];
    } else if (type == 2) {
        tri = [[base, base+3, base+6], type];
    } else if (type == 3) {
        tri = [[base, base+4, base+8], type];
    }
    console.log(`cheat: base${base} type${type}`);
}
function play_triad_mel() {
    MIDI.noteOn(0, tri[0][0], 127, 0);
    MIDI.noteOff(0, tri[0][0], NOTE_DELAY);
    setTimeout(function() {
        MIDI.noteOn(0, tri[0][1], 127, 0);
        MIDI.noteOff(0, tri[0][1], NOTE_DELAY);
        setTimeout(function() {
            MIDI.noteOn(0, tri[0][2], 127, 0);
            MIDI.noteOff(0, tri[0][3], NOTE_DELAY);
        }, NOTE_DELAY);
    }, NOTE_DELAY);
}
function play_triad_harm() {
    MIDI.chordOn(0, tri[0], 127, 0);
    MIDI.chordOff(0, tri[0], NOTE_DELAY);
}
function play_triad() {
    if (state != 12) return;
    if (chosen_option == 0) {
        play_triad_mel();
    } else if (chosen_option == 1) {
        play_triad_harm();
    } else if (chosen_option == 2) {
        play_triad_mel();
        setTimeout(play_triad_harm, NOTE_DELAY*3);
    }
}
function tri_round() {
    generate_triad();
    state = 12;
    play_triad();
}
function tri_start() {
    if (state != 11) return;
    answers = [0, 0];
    show_score("tri");
    state = 12;
    id("tri_start").classList.add("unavailable");
    id("tri_again").classList.remove("unavailable");
    id("tri_reset").classList.remove("unavailable");
    setTimeout(tri_round, 0);
    window._paq.push(["trackEvent", "startPractice", "intervals"]);
}
function tri_reset() {
    if (state != 12) return;
    answers = [0, 0];
    show_score("tri");
    state = 11;
    id("tri_start").classList.remove("unavailable");
    id("tri_again").classList.add("unavailable");
    id("tri_reset").classList.add("unavailable");
    id("tri_wrong").classList.add("hidden");
}
id("tri_start").addEventListener("click", tri_start);
id("tri_again").addEventListener("click", play_triad);
id("tri_reset").addEventListener("click", tri_reset);

function tri_answer(num) {
    return function() {
        if (state != 12) return;
        if (num == tri[1]) {
            answers[0]++;
            answers[1]++;
            show_score("tri");
            state = 13;
            setTimeout(tri_round, NOTE_DELAY*1.5);
        } else {
            id("tri_wrongcorrect").textContent = tris[tri[1]];
            id("tri_wrong").classList.remove("hidden");
            answers[1]++;
            show_score("tri");
            state = 13;
        }
    }
}
for (let i = 0; i < 4; i++) {
    id(`tri_${i}`).addEventListener("click", tri_answer(i));
}
function tri_next() {
    id("tri_wrong").classList.add("hidden");
    tri_round();
}
id("tri_next").addEventListener("click", tri_next);


function backtomenu(e) {
    state = 0;
    let current = e.target.parentNode.parentNode;
    current.classList.add("hiding");
    setTimeout(function() {
        current.classList.add("hidden");
        mainmenu.classList.remove("hidden");
        mainmenu.classList.remove("hiding");
    }, 250);
}

document.querySelectorAll('.return')
        .forEach(a=>a.addEventListener("click", backtomenu));



});