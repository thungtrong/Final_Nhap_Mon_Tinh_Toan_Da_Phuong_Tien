from django.http.response import HttpResponse
from django.shortcuts import render
import json

# hepler function


def predict_response(message):
    pass

# api


def get_answer(request):
    result = {
        'status': 0,
        'error_message': 'Only suppot POST method'
    }
    if (request.method == 'POST'):
        body = json.loads(request.body)
        print('Body', body)
        # Lay model va du doan
        result = {
            'status': 1,
            'message': 'Cau tra loi'
        }
    return HttpResponse(json.dumps(result))


# Create your views here.
def index(request):
    return render(request, 'index.html')
