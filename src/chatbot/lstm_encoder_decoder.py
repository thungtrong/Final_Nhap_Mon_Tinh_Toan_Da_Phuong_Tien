import os
from django.conf import settings
import pickle
from keras.models import Model
from keras.layers import Input
from tensorflow.keras.models import load_model

MODEL_FILE_NAME = 'Chatbot_LSTM_Encoder_Decoder.h5'
WORD2INDEX_FILE_NAME = 'word2index.pkl'
INDEX2WORD_FILE_NAME = 'index2word.pkl'

FILE_MODEL = os.path.join(settings.BASE_DIR, MODEL_FILE_NAME)
FILE_WORD2INDEX = os.path.join(settings.BASE_DIR, WORD2INDEX_FILE_NAME)
FILE_INDEX2WORD = os.path.join(settings.BASE_DIR, INDEX2WORD_FILE_NAME)

model = load_model(FILE_MODEL)
with open(FILE_WORD2INDEX, 'rb') as f:
    word2index = pickle.load(f)

with open(FILE_INDEX2WORD, 'rb') as f:
    index2word = pickle.load(f)

# Load model
latent_dim = 128
embed = model.layers[2]  # Embedding

encoder_inputs = model.input[0]   # input_1
encoder_outputs, state_h_enc, state_c_enc = model.layers[3].output   # lstm_1
encoder_states = [state_h_enc, state_c_enc]
encoder_model = Model(encoder_inputs, encoder_states)

decoder_inputs = model.input[1]   # input_2
decoder_state_input_h = Input(shape=(latent_dim,), name='input_3')
decoder_state_input_c = Input(shape=(latent_dim,), name='input_4')
decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
decoder_lstm = model.layers[4]
decoder_outputs, state_h_dec, state_c_dec = decoder_lstm(
    embed(decoder_inputs), initial_state=decoder_states_inputs)
decoder_states = [state_h_dec, state_c_dec]
decoder_dense = model.layers[5]
decoder_outputs = decoder_dense(decoder_outputs)
decoder_model = Model([decoder_inputs] + decoder_states_inputs,
                      [decoder_outputs] + decoder_states)
