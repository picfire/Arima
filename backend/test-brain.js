const tf = require('@tensorflow/tfjs-node');

// Create a simple tensor
const tensor = tf.tensor([1, 2, 3, 4]);

console.log('Tensor created:');
tensor.print();

// Check TensorFlow version
console.log('TensorFlow version:', tf.version.tfjs);