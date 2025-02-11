const brain = require('brain.js');
const fs = require('fs');
const path = require('path');

class ModelTrainer {
    constructor() {
        this.network = new brain.NeuralNetwork({
            hiddenLayers: [10, 10]
        });
        
        // Ensure models directory exists
        const modelsDir = path.join(__dirname, 'models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir);
        }
    }

    trainModel() {
        const trainingData = [
            // C major jazz voicings
            { input: { note: 60/127 }, output: { maj7: 1, maj9: 0.8, maj13: 0.6 } },
            // D minor jazz voicings
            { input: { note: 62/127 }, output: { min7: 1, min9: 0.8, min11: 0.6 } },
            // G dominant jazz voicings
            { input: { note: 67/127 }, output: { dom7: 1, dom9: 0.8, dom13: 0.7 } }
        ];

        console.log('Starting training...');
        
        try {
            this.network.train(trainingData, {
                iterations: 2000,
                errorThresh: 0.005,
                log: true,
                logPeriod: 100
            });

            const modelData = this.network.toJSON();
            const modelPath = path.join(__dirname, 'models', 'trained-model.json');
            fs.writeFileSync(modelPath, JSON.stringify(modelData));
            console.log('Model trained and saved to:', modelPath);
        } catch (error) {
            console.error('Training error:', error);
        }
    }
}

// Run training
const trainer = new ModelTrainer();
trainer.trainModel();