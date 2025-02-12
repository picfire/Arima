const tf = require('@tensorflow/tfjs-node');

// Create a simple sequential model
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));

// Compile the model with a meanSquaredError loss and a SGD optimizer.
model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

// Generate some synthetic data for training.
// For example: learning the function y = 2x
const xs = tf.tensor2d([0, 1, 2, 3, 4], [5, 1]);
const ys = tf.tensor2d([0, 2, 4, 6, 8], [5, 1]);

console.log('Starting training...');
model.fit(xs, ys, {
  epochs: 100,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
    }
  }
}).then(() => {
  console.log('Training complete');
  
  // Save the model if necessary
  model.save('file://./models/tf-model')
    .then(() => console.log('Model saved'));
});