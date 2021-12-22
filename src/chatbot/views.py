import asyncio
import os
from django.conf import settings
from django.http.response import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import tensorflow as tf
from tensorflow.keras.models import load_model
import pickle
import numpy as np

from keras.models import Model
from keras.layers import Input
from keras.models import load_model
import string
from pyvi import ViTokenizer
import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

# TO-DO: su dung Async
from asgiref.sync import sync_to_async

# MODEL_FILE_NAME = 'watermark_model.h5'
# TOKEN_FILE_NAME = 'tokenizer.pickle'
# FILE_MODEL = os.path.join(settings.BASE_DIR, MODEL_FILE_NAME)
# FILE_TOKENIZER = os.path.join(settings.BASE_DIR, TOKEN_FILE_NAME)

# FILE_MODEL = os.path.join(settings.BASE_DIR, MODEL_FILE_NAME)
# FILE_TOKENIZER = os.path.join(settings.BASE_DIR, TOKEN_FILE_NAME)

MODEL_FILE_NAME = 'NLP_LSTM_model_Encoder_Decoder.h5'
WORD2INDEX_FILE_NAME = 'word2index.pkl'
INDEX2WORD_FILE_NAME = 'index2word.pkl'

FILE_MODEL = os.path.join(settings.BASE_DIR, MODEL_FILE_NAME)
FILE_WORD2INDEX = os.path.join(settings.BASE_DIR, WORD2INDEX_FILE_NAME)
FILE_INDEX2WORD = os.path.join(settings.BASE_DIR, INDEX2WORD_FILE_NAME)

def text_process(mess):
    # chuyển về chữ thường
    mess = mess.lower()
    
    # xóa dấu câu
    mess = [char for char in mess if char not in string.punctuation]
    mess = ''.join(mess)
    
    # replace whitespace
    mess = mess.replace("   ", " ")
    mess = mess.replace("  ", " ")
    
    # Word Segmentation
    mess = ViTokenizer.tokenize(mess)
    
    return mess

# hepler function


@sync_to_async
def predict_response(question_input):
    try:
        model = load_model(FILE_MODEL)
        with open(FILE_WORD2INDEX, 'rb') as f:
            word2index = pickle.load(f)

        with open(FILE_INDEX2WORD, 'rb') as f:
            index2word = pickle.load(f)

        # Load model
        latent_dim = 128
        embed = model.layers[2] # Embedding

        encoder_inputs = model.input[0]   # input_1
        encoder_outputs, state_h_enc, state_c_enc = model.layers[3].output   # lstm_1
        encoder_states = [state_h_enc, state_c_enc]
        encoder_model = Model(encoder_inputs, encoder_states)

        decoder_inputs = model.input[1]   # input_2
        decoder_state_input_h = Input(shape=(latent_dim,), name='input_3')
        decoder_state_input_c = Input(shape=(latent_dim,), name='input_4')
        decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
        decoder_lstm = model.layers[4]
        decoder_outputs, state_h_dec, state_c_dec = decoder_lstm(embed(decoder_inputs), initial_state=decoder_states_inputs)
        decoder_states = [state_h_dec, state_c_dec]
        decoder_dense = model.layers[5]
        decoder_outputs = decoder_dense(decoder_outputs)
        decoder_model = Model([decoder_inputs] + decoder_states_inputs, [decoder_outputs] + decoder_states)


        MAX_LEN = 20
        question_input = text_process(question_input)

        question_inp = [question_input]

        question = []

        # chuyển câu trong question thành vector
        for x in question_inp:
            tmp = []
            for y in x.split():
                try:
                    tmp.append(word2index[y])
                except:
                    tmp.append(word2index['<OUT>'])
            question.append(tmp)
            
        # độ dài vector bằng MAX_LEN
        question = pad_sequences(question, MAX_LEN, padding='post')

        # chuyển câu hỏi cho encoder LSTM để nhận final encoder states của the encoder LSTM
        state = encoder_model.predict(question)
        
        # Tạo chuỗi mục tiêu trống có độ dài 1, tạo đầu vào là index của <SOS>
        empty_target_seq = np.zeros((1, 1))
        
        empty_target_seq[0, 0] = word2index['<SOS>']
        
        # điều kiện dừng decode
        run = True

        answer = ''

        while run:
            # Trả về prediction từ state của encoder và index từ trước đó
            prediction, prediction_h, prediction_c = decoder_model.predict([empty_target_seq] + state)
            
            # Từ prediction tạo ra tìm index với max probability
            token_word_index = np.argmax(prediction[0, -1, :])
            
            # Nối từ tương ứng với index vào word
            word = index2word[token_word_index] + ' '

            # Nếu word không phải EOS thì nối vào answer
            if(word != '<EOS> '):
                answer += word
                
            # Nếu word là EOS hoặc số từ vượt quá MAX_LEN thì dừng predict
            if(word == '<EOS> ' or len(answer.split()) > MAX_LEN):
                run = False

            # Khởi tạo lại empty_target_seq và đặt token_word_index thành đầu ra của current time step.
            # Sau đó nó sẽ chuyển làm đầu vào của next time step.
            empty_target_seq = np.zeros((1, 1))  
            empty_target_seq[0, 0] = token_word_index
            
            # Update states
            state = [prediction_h, prediction_c]

        result = f"{answer}"
    except:
        print('Failed to predict')
        result = 'Error'
    return result
# api


async def get_answer(request):
    result = {
        'status': 0,
        'error_message': 'Only suppot POST method'
    }
    if (request.method == 'POST'):
        body = json.loads(request.body)
        print('Body', body)
        task = asyncio.ensure_future(predict_response(body['message']))
        await asyncio.wait([task])
        reponse = task.result()

        # Lay model va du doan
        result = {
            'status': 1,
            'message': reponse}
    return HttpResponse(json.dumps(result))


# Create your views here.

# Decorator chắn chắn rằng khi render views thì sẽ gửi csrftoken cho client
@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')
