import os
import json
from data.dataset import Dataset
from model.rnn_model import RNNModel
from model.training import train_model

def main():
    # Load model configuration
    with open('configs/model_config.json') as config_file:
        config = json.load(config_file)

    # Load the dataset
    dataset = Dataset(config['data_path'])
    dataset.load_data()

    # Initialize the RNN model
    model = RNNModel(config['model_params'])
    model.build_model()

    # Train the model
    train_model(model, dataset, config['training_params'])

    # Generate music after training
    generated_music = model.generate_music()
    # Save or play the generated music as needed

if __name__ == '__main__':
    main()