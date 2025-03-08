import matplotlib.pyplot as plt
import numpy as np

def plot_loss(history):
    plt.plot(history.history['loss'], label='loss')
    plt.plot(history.history['val_loss'], label='val_loss')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.show()

def display_generated_music(generated_sequence, note_to_int):
    int_to_note = {number: note for number, note in enumerate(note_to_int)}
    generated_notes = [int_to_note[note] for note in generated_sequence]
    
    print("Generated Music Sequence:")
    for note in generated_notes:
        print(note)