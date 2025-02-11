/* filepath: /c:/Users/Matt/Desktop/piano visualizer/frontend/pages/front-main/script.js */
class PianoVisualizer {
    constructor() {
        this.piano = document.getElementById('piano');
        this.midiInput = document.getElementById('midiInput');
        this.startButton = document.getElementById('startMIDI');
        this.instrumentSelect = document.getElementById('instrument');
        this.keys = new Map();
        this.initialized = false;
        this.isMouseDown = false;
        this.lastPlayedNote = null;
        this.sustainPedal = false;
        this.activeNotes = new Set();
        this.sustainedNotes = new Set();
        this.getLogout = document.getElementById('Logout');
        
        this.keyMap = {
            'a': 60, // Middle C
            'w': 61,
            's': 62,
            'e': 63,
            'd': 64,
            'f': 65,
            't': 66,
            'g': 67,
            'y': 68,
            'h': 69,
            'u': 70,
            'j': 71,
            'k': 72  // C5
        };

        this.initializePiano();
        this.setupEventListeners();
        this.setupKeyboardInput();
        this.setupInstrumentChange();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', async () => {
            if (!this.initialized) {
                await this.initializeMIDI();
                this.setupMIDI();
                this.initialized = true;
                this.startButton.textContent = 'Connect MIDI Device';
            } else {
                this.setupMIDI();
            }
        });

        this.instrumentSelect.addEventListener('change', async (e) => {
            if (this.initialized) {
                await this.changeInstrument(e.target.value);
            }
        });

        this.getLogout.addEventListener('click', () => {
            window.location.href = '../../auth/index.html';
        });
    }

    async initializeMIDI() {
        try {
            await MIDI.loadPlugin({
                soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
                instrument: this.instrumentSelect.value,
                onprogress: (state, progress) => {
                    console.log(`Loading soundfont: ${progress}%`);
                }
            });
            MIDI.setVolume(0, 127);
            console.log('MIDI.js initialized successfully');
        } catch (error) {
            console.error('Error initializing MIDI.js:', error);
        }
    }

    keyDown(note, velocity = 100) {
        if (!this.initialized) return;
        
        const key = this.keys.get(note);
        if (key && !key.classList.contains('active')) {
            key.classList.add('active');
            this.activeNotes.add(note);
            this.createNoteTrail(note);
            
            // Start the new note
            MIDI.noteOn(0, note, velocity, 0);
        }
    }

    keyUp(note) {
        if (!this.initialized) return;
        
        const key = this.keys.get(note);
        if (key) {
            key.classList.remove('active');
            this.activeNotes.delete(note);
            
            // Always turn off the note, regardless of sustain pedal
            MIDI.noteOff(0, note, 0);
            
            // If sustain pedal is pressed, add to sustained notes
            if (this.sustainPedal) {
                this.sustainedNotes.add(note);
            }
        }
    }

    async changeInstrument(instrument) {
        try {
            await MIDI.loadPlugin({
                soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
                instrument: instrument,
                onprogress: (state, progress) => {
                    console.log(`Loading ${instrument}: ${progress}%`);
                }
            });
        } catch (error) {
            console.error('Error changing instrument:', error);
        }
    }

    initializePiano() {
        // Piano layout pattern for one octave (0 = white key, 1 = black key)
        // Starting from A (note 21): A, Bb, B, C, C#, D, D#, E, F, F#, G, G#
        const octavePattern = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1];
        const whiteKeysContainer = document.createElement('div');
        whiteKeysContainer.className = 'white-keys';
        const blackKeysContainer = document.createElement('div');
        blackKeysContainer.className = 'black-keys';

        let whiteKeyIndex = 0;

        // Create 88 piano keys (standard piano) - starting from A0 (MIDI note 21)
        for (let i = 21; i <= 108; i++) {
            const key = document.createElement('div');
            key.dataset.note = i;

            // Calculate position in octave pattern
            const patternIndex = (i - 21) % 12;
            const isBlack = octavePattern[patternIndex] === 1;

            if (isBlack) {
                key.className = 'key black-key';
                // Replace the complex offset calculation with:
                const blackKeyOffset = -15;
                key.style.left = `${whiteKeyIndex * 45 + blackKeyOffset}px`;
                blackKeysContainer.appendChild(key);
            } else {
                key.className = 'key white-key';
                key.style.left = `${whiteKeyIndex * 45}px`;
                whiteKeysContainer.appendChild(key);
                whiteKeyIndex++;
            }
            this.keys.set(i, key);
        }

        this.piano.appendChild(whiteKeysContainer);
        this.piano.appendChild(blackKeysContainer);

        // Add mouse events to each key
        this.keys.forEach((key, note) => {
            key.addEventListener('mousedown', (e) => {
                // Only respond to left mouse button (button 0)
                if (e.button === 0) {
                    this.isMouseDown = true;
                    this.lastPlayedNote = note;
                    this.keyDown(note);
                }
            });

            key.addEventListener('mouseenter', (e) => {
                // Only trigger if left mouse button is held down
                if (this.isMouseDown && e.buttons === 1 && this.lastPlayedNote !== note) {
                    this.lastPlayedNote = note;
                    this.keyDown(note);
                }
            });

            key.addEventListener('mouseleave', (e) => {
                // Only trigger if it was the last played note
                if (this.lastPlayedNote === note && e.buttons === 1) {
                    this.keyUp(note);
                }
            });
        });

        // Add global mouse up handler
        document.addEventListener('mouseup', (e) => {
            // Only respond to left mouse button
            if (e.button === 0 && this.isMouseDown && this.lastPlayedNote !== null) {
                this.keyUp(this.lastPlayedNote);
                this.isMouseDown = false;
                this.lastPlayedNote = null;
            }
        });
    }

    async setupMIDI() {
        this.startButton.addEventListener('click', async () => {
            try {
                if (!navigator.requestMIDIAccess) {
                    throw new Error('Web MIDI API not supported');
                }

                const midi = await navigator.requestMIDIAccess({ sysex: true });
                this.handleMIDISuccess(midi);
            } catch (error) {
                console.error('MIDI Access Error:', error);
                alert('Failed to access MIDI devices');
            }
        });
    }

    handleMIDISuccess(midi) {
        // Handle MIDI inputs
        const inputs = midi.inputs.values();
        this.midiInput.innerHTML = '';
        this.midiInput.disabled = false;

        // Handle MIDI outputs
        const outputs = Array.from(midi.outputs.values());
        this.midiOutput = outputs[0]; // Get first available MIDI output
        
        for (const input of inputs) {
            const option = document.createElement('option');
            option.value = input.id;
            option.text = input.name;
            this.midiInput.add(option);
            
            input.onmidimessage = (message) => this.handleMIDIMessage(message);
        }
    }

    handleMIDIMessage(message) {
        const [command, note, velocity] = message.data;
        
        // Handle sustain pedal
        if (command === 0xB0 && note === 64) {
            this.handleSustainPedal(velocity >= 64);
            return;
        }
        
        // Note On with velocity > 0
        if (command === 0x90 && velocity > 0) {
            this.keyDown(note, velocity);
        } 
        // Note Off or Note On with velocity 0
        else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            this.keyUp(note);
        }
    }

    handleSustainPedal(isDown) {
        this.sustainPedal = isDown;
        
        if (!isDown) {
            // Release all sustained notes
            this.sustainedNotes.forEach(note => {
                const key = this.keys.get(note);
                if (key) {
                    key.classList.remove('active');
                    MIDI.noteOff(0, note, 0);
                }
            });
            this.sustainedNotes.clear();
        }
    }

    createNoteTrail(note) {
        const key = this.keys.get(note);
        if (!key) return;

        const isBlack = key.classList.contains('black-key');
        const keyRect = key.getBoundingClientRect();
        
        const trail = document.createElement('div');
        trail.className = `note-trail ${isBlack ? 'black' : ''}`;
        trail.style.left = `${keyRect.left}px`;
        trail.style.width = `${keyRect.width}px`;
        
        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        trail.appendChild(particle);

        let trailsContainer = document.getElementById('note-trails');
        if (!trailsContainer) {
            trailsContainer = document.createElement('div');
            trailsContainer.id = 'note-trails';
            document.body.appendChild(trailsContainer);
        }
        
        trailsContainer.appendChild(trail);
        
        // Remove trail after animation
        trail.addEventListener('animationend', () => {
            trail.remove();
        });
    }

    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            if (this.keyMap[e.key.toLowerCase()] && !e.repeat) {
                this.keyDown(this.keyMap[e.key.toLowerCase()]);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.keyMap[e.key.toLowerCase()]) {
                this.keyUp(this.keyMap[e.key.toLowerCase()]);
            }
        });
    }

    setupInstrumentChange() {
        const instrumentSelect = document.getElementById('instrument');
        instrumentSelect.addEventListener('change', async (e) => {
            const loadingText = document.createElement('span');
            loadingText.textContent = ' Loading...';
            instrumentSelect.parentNode.appendChild(loadingText);
            
            await MIDI.loadPlugin({
                soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
                instrument: e.target.value,
                onprogress: (state, progress) => {
                    console.log(`Loading ${e.target.value}: ${progress}%`);
                }
            });

            instrumentSelect.parentNode.removeChild(loadingText);
        });
    }

    setupInstrumentControls() {
        // Add these HTML elements to your page
        const controls = document.createElement('div');
        controls.className = 'instrument-controls';
        controls.innerHTML = `
            <select id="instrument">
                <option value="acoustic_grand_piano">Grand Piano</option>
                <option value="bright_acoustic_piano">Bright Piano</option>
                <option value="electric_piano_1">Electric Piano</option>
                <option value="harpsichord">Harpsichord</option>
                <option value="choir_aahs">Choir</option>
                <option value="violin">Violin</option>
            </select>
            <input type="range" id="volume" min="0" max="127" value="100">
            <input type="range" id="reverb" min="0" max="127" value="0">
            <button id="recordMIDI">Record</button>
        `;
        this.piano.parentNode.insertBefore(controls, this.piano);

        // Handle instrument changes
        const instrumentSelect = document.getElementById('instrument');
        instrumentSelect.addEventListener('change', async (e) => {
            const instrument = e.target.value;
            await this.changeInstrument(instrument);
        });

        // Handle volume changes
        const volumeSlider = document.getElementById('volume');
        volumeSlider.addEventListener('input', (e) => {
            MIDI.setVolume(0, parseInt(e.target.value));
        });

        // Handle reverb
        const reverbSlider = document.getElementById('reverb');
        reverbSlider.addEventListener('input', (e) => {
            MIDI.setEffects([
                {
                    type: 'reverb',
                    wet: parseInt(e.target.value) / 127
                }
            ]);
        });

        // Handle MIDI recording
        let recording = false;
        let recordedNotes = [];
        let startTime;

        document.getElementById('recordMIDI').addEventListener('click', () => {
            if (!recording) {
                recording = true;
                recordedNotes = [];
                startTime = Date.now();
                document.getElementById('recordMIDI').textContent = 'Stop Recording';
            } else {
                recording = false;
                this.saveRecording(recordedNotes);
                document.getElementById('recordMIDI').textContent = 'Record';
            }
        });
    }

    async changeInstrument(instrument) {
        try {
            await MIDI.loadPlugin({
                soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
                instrument: instrument,
                onprogress: (state, progress) => {
                    console.log(`Loading ${instrument}: ${progress}%`);
                }
            });
            this.currentInstrument = instrument;
        } catch (error) {
            console.error('Error changing instrument:', error);
        }
    }

    saveRecording(notes) {
        // Convert recorded notes to MIDI file format
        const midiData = {
            track: notes,
            duration: Date.now() - startTime
        };

        // Create download link
        const blob = new Blob([JSON.stringify(midiData)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recorded_midi.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

}

// Initialize the piano visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoVisualizer();
});