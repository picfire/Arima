#!/bin/bash

# Create a directory for the dataset if it doesn't exist
mkdir -p ../data

# Download the dataset (replace <dataset_url> with the actual URL)
curl -o ../data/music_dataset.zip <dataset_url>

# Unzip the dataset
unzip ../data/music_dataset.zip -d ../data/

# Remove the zip file after extraction
rm ../data/music_dataset.zip

echo "Dataset downloaded and extracted to ../data/"