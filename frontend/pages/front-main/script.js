/* filepath: /c:/Users/Matt/Desktop/piano visualizer/frontend/pages/front-main/script.js */
class PianoVisualizer {
    constructor() {
        this.piano = document.getElementById('piano');
        this.midiInput = document.getElementById('midiInput');
        this.startButton = document.getElementById('startMIDI');
        this.keys = new Map();
        this.midiOutput = null;
        
        this.initializeMIDI();
        this.initializePiano();
        this.setupMIDI();
        this.setupKeyboardInput();
    }

    async initializeMIDI() {
        try {
            await MIDI.loadPlugin({
                soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
                instrument: "acoustic_grand_piano",
                onprogress: (state, progress) => {
                    console.log(`Loading soundfont: ${progress}%`);
                }
            });
            
            MIDI.setVolume(0, 127); // Set volume for channel 0
            console.log('MIDI.js initialized successfully');
        } catch (error) {
            console.error('Error initializing MIDI.js:', error);
        }
    }

    setupKeyboardInput() {
        const keyMap = {
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
            'k': 72
        };

        document.addEventListener('keydown', (e) => {
            if (keyMap[e.key] && !e.repeat) {
                this.keyDown(keyMap[e.key]);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (keyMap[e.key]) {
                this.keyUp(keyMap[e.key]);
            }
        });
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
                // Adjust black key positioning based on the pattern
                const blackKeyOffset = patternIndex === 1 ? -15 : // Bb
                                     patternIndex === 4 ? -15 : // C#
                                     patternIndex === 6 ? -15 : // D#
                                     patternIndex === 9 ? -15 : // F#
                                     patternIndex === 11 ? -15 : -15; // G#
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
    }

    isBlackKey(note) {
        // Updated pattern to match standard piano layout starting from A
        const octavePattern = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1];
        const patternIndex = (note - 21) % 12;
        return octavePattern[patternIndex] === 1;
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
        
        if (command === 0x90 && velocity > 0) { // Note On
            this.keyDown(note, velocity);
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) { // Note Off
            this.keyUp(note);
        } else if (command === 0xB0 && note === 64) { // Sustain pedal
            this.handleSustain(velocity >= 64);
        }
    }

    handleSustain(isDown) {
        if (isDown) {
            MIDI.sustain = true;
        } else {
            MIDI.sustain = false;
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

    keyDown(note, velocity = 100) {
        const key = this.keys.get(note);
        if (key) {
            key.classList.add('active');
            this.createNoteTrail(note);
            
            // Play note using MIDI.js
            MIDI.noteOn(0, note, velocity, 0);
            
            if (this.midiOutput) {
                this.midiOutput.send([0x90, note, velocity]);
            }
        }
    }

    keyUp(note) {
        const key = this.keys.get(note);
        if (key) {
            key.classList.remove('active');
            
            // Stop note using MIDI.js
            MIDI.noteOff(0, note, 0);
            
            if (this.midiOutput) {
                this.midiOutput.send([0x80, note, 0]);
            }
        }
    }

    // Add this missing method
    midiNoteToName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor((midiNote - 12) / 12);
        const noteIndex = (midiNote - 12) % 12;
        return `${noteNames[noteIndex]}${octave}`;
    }
}

// Initialize the piano visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoVisualizer();
});