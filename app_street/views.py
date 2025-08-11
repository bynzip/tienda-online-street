from django.shortcuts import render
from django.http import HttpResponse

def inicio(request):
    return HttpResponse('Bienvenido al sistema de gestión de tareas')