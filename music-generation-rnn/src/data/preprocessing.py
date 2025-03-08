import numpy as np

def normalize_data(data):
    return (data - np.min(data)) / (np.max(data) - np.min(data))

def encode_notes(notes):
    unique_notes = sorted(set(notes))
    note_to_int = {note: number for number, note in enumerate(unique_notes)}
    encoded = [note_to_int[note] for note in notes]
    return encoded, note_to_int

def decode_notes(encoded, int_to_note):
    return [int_to_note[number] for number in encoded]