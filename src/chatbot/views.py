import asyncio
from django.conf import settings
import os
from django.http.response import HttpResponse
from django.shortcuts import render
import json
from tensorflow.keras.models import load_model
import tensorflow as tf
import pickle
import numpy as np

# TO-DO: su dung Async
from asgiref.sync import sync_to_async

MODEL_FILE_NAME = 'watermark_model.h5'
TOKEN_FILE_NAME = 'tokenizer.pickle'
FILE_MODEL = os.path.join(settings.BASE_DIR, MODEL_FILE_NAME)
FILE_TOKENIZER = os.path.join(settings.BASE_DIR, TOKEN_FILE_NAME)

# hepler function


@sync_to_async
def predict_response(message):
    try:
        # graph = tf.compat.v1.get_default_graph()
        # with graph.as_default():
        neural_network = load_model(FILE_MODEL)
        with open(FILE_TOKENIZER, 'rb') as handle:
            tokenizer = pickle.load(handle)

            X = tokenizer.texts_to_matrix(
                np.array([message]), mode='binary')

            result = f"{neural_network.predict(X)}"

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
def index(request):
    return render(request, 'index.html')
