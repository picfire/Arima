const brain = require('brain.js');

// Create a simple network
const net = new brain.NeuralNetwork();

// Test with basic data
net.train([
    { input: [0], output: [0] },
    { input: [1], output: [1] }
]);

// Test prediction
const output = net.run([0]);
console.log('Test output:', output);