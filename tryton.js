function id(name) {
    return document.getElementById(name);
}
const NOTE_DELAY = 1250;
document.addEventListener("DOMContentLoaded", function() {

if (!window.hasOwnProperty("_paq")) {
    window._paq = [];
}

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
const trpcontainer = id("trojprzewroty");
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
let answer = [[0], 0];
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

function play_notes_mel(i) {
    if ((state%10)!=2) return;
    if (i < answer[0].length) {
        MIDI.noteOn(0, answer[0][i], 127, 0);
        MIDI.noteOff(0, answer[0][i], NOTE_DELAY);
        setTimeout(play_notes_mel, NOTE_DELAY, i+1);
    }
}
function play_notes_harm() {
    if ((state%10)!=2) return;
    MIDI.chordOn(0, answer[0], 127, 0);
    MIDI.chordOff(0, answer[0], NOTE_DELAY);
}
function play_notes() {
    if (chosen_option == 0) {
        play_notes_mel(0);
    } else if (chosen_option == 1) {
        play_notes_harm();
    } else if (chosen_option == 2) {
        play_notes_mel(0);
        setTimeout(play_notes_harm, NOTE_DELAY*answer[0].length);
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
    answer = [[base, base+diff], diff];
}
function int_round() {
    generate_interval();
    state = 2;
    play_notes();
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
id("int_again").addEventListener("click", play_notes);
id("int_reset").addEventListener("click", int_reset);

function int_answer(num) {
    return function() {
        if (state != 2) return;
        if (num == answer[1]) {
            answers[0]++;
            answers[1]++;
            show_score("int");
            state = 3;
            setTimeout(int_round, NOTE_DELAY*1.5);
        } else {
            id("int_wrongcorrect").textContent = ints[answer[1]];
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
        answer = [[base, base+4, base+7], type];
    } else if (type == 1) {
        answer = [[base, base+3, base+7], type];
    } else if (type == 2) {
        answer = [[base, base+3, base+6], type];
    } else if (type == 3) {
        answer = [[base, base+4, base+8], type];
    }
    console.log(`cheat: base${base} type${type}`);
}

function tri_round() {
    generate_triad();
    state = 12;
    play_notes();
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
    window._paq.push(["trackEvent", "startPractice", "triads"]);
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
id("tri_again").addEventListener("click", play_notes);
id("tri_reset").addEventListener("click", tri_reset);

function tri_answer(num) {
    return function() {
        if (state != 12) return;
        if (num == answer[1]) {
            answers[0]++;
            answers[1]++;
            show_score("tri");
            state = 13;
            setTimeout(tri_round, NOTE_DELAY*1.5);
        } else {
            id("tri_wrongcorrect").textContent = tris[answer[1]];
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

//////////////////////////////
// TRÓJDŹWIĘKI Z PRZEWROTAMI
//////////////////////////////

trps = [
    "durowy",
    "durowy w pierwszym przewrocie",
    "durowy w drugim przewrocie",
    "molowy",
    "molowy w pierwszym przewrocie",
    "molowy w drugim przewrocie",
    "zmniejszony",
    "zwiększony",
    "septymowy"
];


function trojprzewroty() {
    id("trp_start").classList.remove("unavailable");
    id("trp_again").classList.add("unavailable");
    id("trp_reset").classList.add("unavailable");
    id("trp_wrong").classList.add("hidden");
    answers = [0, 0];
    show_score("trp");
    mainmenu.classList.add("hiding");
    setTimeout(function() {
        mainmenu.classList.add("hidden");
        trpcontainer.classList.remove("hidden");
        trpcontainer.classList.remove("hiding");
    }, 250);
    state = 21;
}
trojprz_button.addEventListener("click", trojprzewroty);

const trptable = [
    [4, 7], // +
    [3, 8], // +3
    [5, 9], // +5
    [3, 7], // -
    [4, 9], // -3
    [5, 8], // -5
    [3, 6], // >
    [4, 8], // <
    [4, 7] // +7
]

function generate_trp() {
    let type = Math.floor((Math.random() * 9)); // 0-8
    let base = Math.floor((Math.random()*24)+48); // idk
    answer = [[
        base,
        base+trptable[type][0],
        base+trptable[type][1]
    ], type]
    if (type == 8) {
        answer[0].push(base+10); // septyma
    }
    console.log(`cheat: base${base} type${type} ans${answer}`);
}

function trp_round() {
    generate_trp();
    state = 22;
    play_notes();
}
function trp_start() {
    if (state != 21) return;
    answers = [0, 0];
    show_score("trp");
    state = 22;
    id("trp_start").classList.add("unavailable");
    id("trp_again").classList.remove("unavailable");
    id("trp_reset").classList.remove("unavailable");
    setTimeout(trp_round, 0);
    window._paq.push(["trackEvent", "startPractice", "trpads"]);
}
function trp_reset() {
    if (state != 22) return;
    answers = [0, 0];
    show_score("trp");
    state = 21;
    id("trp_start").classList.remove("unavailable");
    id("trp_again").classList.add("unavailable");
    id("trp_reset").classList.add("unavailable");
    id("trp_wrong").classList.add("hidden");
}
id("trp_start").addEventListener("click", trp_start);
id("trp_again").addEventListener("click", play_notes);
id("trp_reset").addEventListener("click", trp_reset);

function trp_answer(num) {
    return function() {
        if (state != 22) return;
        if (num == answer[1]) {
            answers[0]++;
            answers[1]++;
            show_score("trp");
            state = 23;
            setTimeout(trp_round, NOTE_DELAY*1);
        } else {
            id("trp_wrongcorrect").textContent = trps[answer[1]];
            id("trp_wrong").classList.remove("hidden");
            answers[1]++;
            show_score("trp");
            state = 23;
        }
    }
}
for (let i = 0; i < 9; i++) {
    id(`trp_${i}`).addEventListener("click", trp_answer(i));
}
function trp_next() {
    id("trp_wrong").classList.add("hidden");
    trp_round();
}
id("trp_next").addEventListener("click", trp_next);



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
