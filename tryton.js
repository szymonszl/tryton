function id(name) {
    return document.getElementById(name);
}
const NOTE_DELAY = 1250;
document.addEventListener("DOMContentLoaded", function() {
let midi_loaded = false;
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
const mainmenu = id("mainmenu");
const intcontainer = id("interwaly");
const int_button = id("b_inter");
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
let exitstate;
let chosen_option = 0;
let int = [];
let answers = [0, 0];

function interwaly() {
    id("int_start").classList.remove("unavailable");
    id("int_again").classList.add("unavailable");
    id("int_reset").classList.add("unavailable");
    answers = [0, 0];
    id("int_score_ok").textContent = answers[0];
    id("int_score_all").textContent = answers[1];
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
    play_interval();
}
function int_start() {
    if (state != 1) return;
    answers = [0, 0];
    state = 2;
    id("int_start").classList.add("unavailable");
    id("int_again").classList.remove("unavailable");
    id("int_reset").classList.remove("unavailable");
    exitstate = function() {
        answers = [0, 0];
        state = 0;
    }
    setTimeout(int_round, 0);
}
function int_reset() {
    if (state != 2) return;
    answers = [0, 0];
    state = 1;
    id("int_start").classList.remove("unavailable");
    id("int_again").classList.remove("unavailable");
    id("int_reset").classList.add("unavailable");
}
id("int_start").addEventListener("click", int_start);
id("int_again").addEventListener("click", play_interval);
id("int_reset").addEventListener("click", int_reset);
function reset_buttons() {
    id("int_mel").classList.remove("pres_button_chosen");
    id("int_harm").classList.remove("pres_button_chosen");
    id("int_melharm").classList.remove("pres_button_chosen");
}
id("int_mel").addEventListener("click", function() {
    reset_buttons();
    chosen_option = 0;
    id("int_mel").classList.add("pres_button_chosen");
})
id("int_harm").addEventListener("click", function() {
    reset_buttons();
    chosen_option = 1;
    id("int_harm").classList.add("pres_button_chosen");
})
id("int_melharm").addEventListener("click", function() {
    reset_buttons();
    chosen_option = 2;
    id("int_melharm").classList.add("pres_button_chosen");
})
function int_answer(num) {
    return function() {
        if (state != 2) return;
        if (num == int[2]) {
            answers[0]++;
            answers[1]++;
            id("int_score_ok").textContent = answers[0];
            id("int_score_all").textContent = answers[1];
            setTimeout(int_round, NOTE_DELAY*1.5);
        } else {
            id("wrongcorrect").textContent = ints[int[2]];
            id("int_wrong").classList.remove("hidden");
            answers[1]++;
            id("int_score_all").textContent = answers[1];
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
function backtomenu(e) {
    let current = e.target.parentNode.parentNode;
    current.classList.add("hiding");
    setTimeout(function() {
        current.classList.add("hidden");
        mainmenu.classList.remove("hidden");
        mainmenu.classList.remove("hiding");
    }, 250);
    exitstate();
}
document.querySelectorAll('.return')
        .forEach(a=>a.addEventListener("click", backtomenu));



});