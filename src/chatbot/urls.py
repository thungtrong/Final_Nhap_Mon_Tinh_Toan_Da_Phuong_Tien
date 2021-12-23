from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('chatbot/', views.chatbot, name='chatbot'),
    path('chatbot/api/get_answer', views.get_answer, name='get answer'),
]
