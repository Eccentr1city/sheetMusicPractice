note_names = ['C2', 'C#2', 'Db2', 'D2', 'D#2', 'Eb2', 'E2', 'F2', 'F#2', 'Gb2', 'G2', 'G#2', 'Ab2', 'A2', 'A#2', 'Bb2', 'B2', 'C3', 'C#3', 'Db3', 'D3', 'D#3', 'Eb3', 'E3', 'F3', 'F#3', 'Gb3', 'G3', 'G#3', 'Ab3', 'A3', 'A#3', 'Bb3', 'B3', 'C4', 'C#4', 'Db4', 'D4', 'D#4', 'Eb4', 'E4', 'F4', 'F#4', 'Gb4', 'G4', 'G#4', 'Ab4', 'A4', 'A#4', 'Bb4', 'B4', 'C5', 'C#5', 'Db5', 'D5', 'D#5', 'Eb5', 'E5', 'F5', 'F#5', 'Gb5', 'G5', 'G#5', 'Ab5', 'A5', 'A#5', 'Bb5', 'B5'];
const notes = {
    'C2': 65.41,	
    'C#2': 69.30,
    'Db2': 69.30,
    'D2': 73.42,
    'D#2': 77.78,
    'Eb2': 77.78,
    'E2': 82.41,
    'F2': 87.31,
    'F#2': 92.50,
    'Gb2': 92.50,
    'G2': 98.00,
    'G#2': 103.83,
    'Ab2': 103.83,
    'A2': 110.00,
    'A#2': 116.54,
    'Bb2': 116.54,
    'B2': 123.47,

    'C3': 130.81,
    'C#3': 138.59,
    'Db3': 138.59,
    'D3': 146.83,
    'D#3': 155.56,
    'Eb3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3': 185.00,
    'Gb3': 185.00,
    'G3': 196.00,
    'G#3': 207.65,
    'Ab3': 207.65,
    'A3': 220.00,
    'A#3': 233.08,
    'Bb3': 233.08,
    'B3': 246.94,

    'C4': 261.63,
    'C#4': 277.18,
    'Db4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'Eb4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'Gb4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'Ab4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'Bb4': 466.16,
    'B4': 493.88,

    'C5': 523.25,
    'C#5': 554.37,
    'Db5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'Eb5': 622.25,
    'E5': 659.25,
    'F5': 698.46,
    'F#5': 739.99,
    'Gb5': 739.99,
    'G5': 783.99,
    'G#5': 830.61,
    'Ab5': 830.61,
    'A5': 880.00,
    'A#5': 932.33,
    'Bb5': 932.33,
    'B5': 987.77
};

function generateNote(low, high) {
    // return random note between a low note and high note, inclusive
    range = note_names.slice(note_names.indexOf(low), note_names.indexOf(high)+1)
    return range[Math.floor(Math.random() * range.length)];
}

current_note = '';
playing_sound = false;
playing_timeout = setTimeout(playing_sound = false, 3000);
function playSound(freq) {
    clearTimeout(playing_timeout);
    playing_sound = true;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
  
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
  
    // connect oscillator to gain node
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, context.currentTime);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(1, context.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 3);
    oscillator.stop(context.currentTime + 3);
    playing_timeout = setTimeout(done_playing, 3000);
}

function done_playing(){
    playing_sound = false;
}
  
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 8192
analyser.smoothingTimeConstant = 0.85;
const dataArray = new Float32Array(analyser.frequencyBinCount);
analyzing = false

function updateFrequency() {
    if(analyzing){
        requestAnimationFrame(updateFrequency);
        analyser.getFloatFrequencyData(dataArray);
        dominantFrequency = getNextDominantFrequency(dataArray);
        document.getElementById("frequency").innerHTML = "Dominant Frequency: " + Math.round(dominantFrequency[0]) + " Hz";
        document.getElementById("amplitude").innerHTML = "Amplitude: " + Math.round(dominantFrequency[1]*100)/100;

        if(dominantFrequency[1] > -65){
            closest_note = closestNote(dominantFrequency[0])
            if(closest_note[1]/notes[closest_note[0]] < 0.1){
                document.getElementById("note").innerHTML = "Note: " + closest_note[0]
            }
        }else{
            document.getElementById("note").innerHTML = "Note: "
        };
    };
}
updateFrequency()

function getNextDominantFrequency(dataArray, currentMax = Infinity) {
    let maxAmplitude = -Infinity;
    let maxIndex = -1;
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxAmplitude && dataArray[i] < currentMax) {
            maxAmplitude = dataArray[i];
            maxIndex = i;
        }
    }
    const binWidth = audioContext.sampleRate / analyser.fftSize;
    return [maxIndex * binWidth, maxAmplitude];
}

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    updateFrequency();
    })
    .catch(error => console.error(error));

function closestNote(frequency){
    closest_note = ''
    distance = Infinity
    for (const [note, value] of Object.entries(notes)) {
        if(Math.abs(value - frequency) < distance){
            closest_note = note
            distance = Math.abs(value - frequency)
        }
    }
    return [closest_note, distance]
}

const { Renderer, Stave, GhostNote, StaveNote, Voice, Formatter, Accidental } = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element with id="output".
const div = document.getElementById('note-display');
const renderer = new Renderer(div, Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(360, 200);
const context = renderer.getContext();
context.setFont('Arial', 10);

function newNote(){
    context.rect(0, 0, 500, 200, { stroke: 'none', fill: 'white' });
    treble = Math.random() < 0.5
    if(treble){
        new_note = generateNote('A3','B5');
        current_note = new_note;
        stave1 = new Stave(10, 0, 355);
        stave2 = new Stave(10, 80, 355);
        stave1.addClef('treble');
        stave2.addClef('bass');
        // Create the notes
        if(new_note[1] == '#'){
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[2]], duration: "w" }).addModifier(new Accidental("#")),
            ];
        }else if(new_note[1] == 'b'){
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[2]], duration: "w" }).addModifier(new Accidental("b")),
            ];
        }else{
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[1]], duration: "w" }),
            ];
        };
        
        // Create a voice in 4/4 and add above notes
        const voice = new Voice({ num_beats: 6, beat_value: 4 });
        voice.addTickables(drawNotes);

        // Format and justify the notes to 400 pixels.
        new Formatter().joinVoices([voice]).format([voice], 350);

        // Render voice
        stave1.setContext(context).draw();
        stave2.setContext(context).draw();
        voice.draw(context, stave1);
    }else{
        new_note = generateNote('F2','E4');
        current_note = new_note;
        stave1 = new Stave(10, 0, 355);
        stave2 = new Stave(10, 80, 355);
        stave1.addClef('treble');
        stave2.addClef('bass');
        // Create the notes
        if(new_note[1] == '#'){
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[2]], duration: "w", clef: 'bass' }).addModifier(new Accidental("#")),
            ];
        }else if(new_note[1] == 'b'){
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[2]], duration: "w", clef: 'bass' }).addModifier(new Accidental("b")),
            ];
        }else{
            drawNotes = [
                new GhostNote({ duration: "h" }),
                new StaveNote({ keys: [new_note[0].toLowerCase() + '/' + new_note[1]], duration: "w", clef: 'bass' }),
            ];
        };
        
        // Create a voice in 4/4 and add above notes
        const voice = new Voice({ num_beats: 6, beat_value: 4 });
        voice.addTickables(drawNotes);

        // Format and justify the notes to 400 pixels.
        new Formatter().joinVoices([voice]).format([voice], 350);

        // Render voice
        stave1.setContext(context).draw();
        stave2.setContext(context).draw();
        voice.draw(context, stave2);
    }
}
newNote();

correct_checks = 0;
max_checks = 50;
const progress = document.querySelector('.progress');
const bar = progress.querySelector('.bar');

function updateProgressBar(value, max) {
    const percentage = value / max * 120;
    bar.style.width = `${percentage}%`;
}
updateProgressBar(correct_checks, max_checks);


function checkNote(){
    if(!playing_sound){
        analyser.getFloatFrequencyData(dataArray);
        dominantFrequency = Infinity;
        if(correct_checks >= max_checks){
            correct_checks = 0;
            updateProgressBar(correct_checks, max_checks);
            newNote();
            return
        };
        for(let i = 1; i < 4; i+=1){
            dominantFrequency = getNextDominantFrequency(dataArray, dominantFrequency[1]);
            closest_note = closestNote(dominantFrequency[0])[0];
            if(dominantFrequency[1] > -65 && notes[closest_note] == notes[current_note]){
                correct_checks += 1/i ;
                updateProgressBar(correct_checks, max_checks);
                return
            };
        };
        if (correct_checks > 0){
            correct_checks -= 0.2;
            updateProgressBar(correct_checks, max_checks);
            return
        }; 
    };
};

const micToggle = document.getElementById('mic-toggle');
const micLabel = document.getElementById('mic-label');

function toggleMic() {
    const isMicOn = micToggle.checked;
    micLabel.textContent = isMicOn ? 'Microphone On' : 'Microphone Off';
    if(isMicOn){
        audioContext.resume();
        document.getElementById('mic-info').style.display = "block";
        document.getElementById('correctness_bar').style.display = "block";
        note_checker = setInterval(checkNote, 10);
        analyzing = true; 
        updateFrequency()
    }else{
        audioContext.suspend();
        document.getElementById('mic-info').style.display = "none";
        document.getElementById('correctness_bar').style.display = "none";
        clearInterval(note_checker);
        analyzing = false;
    };
}