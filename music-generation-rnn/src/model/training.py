import tensorflow as tf
from rnn_model import RNNModel
from data.dataset import Dataset
from data.preprocessing import preprocess_data

def train_model(model, dataset, epochs=100, batch_size=64):
    for epoch in range(epochs):
        for batch in dataset.get_batches(batch_size):
            x, y = preprocess_data(batch)
            loss = model.train_on_batch(x, y)
            print(f'Epoch {epoch + 1}/{epochs}, Loss: {loss}')

def save_model(model, filepath):
    model.save(filepath)

if __name__ == "__main__":
    dataset = Dataset('path/to/midi/files')
    model = RNNModel()
    model.build_model()
    train_model(model, dataset)
    save_model(model, 'path/to/save/model')