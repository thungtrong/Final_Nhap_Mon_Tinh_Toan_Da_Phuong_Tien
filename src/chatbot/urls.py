from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('api/get_answer', views.get_answer, name='get answer'),
]
