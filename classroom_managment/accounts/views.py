from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib import messages
from classroom.models import User
from django.urls import reverse
from .forms import *
from classroom_management.settings import MEDIA_ROOT
import os
import json
import re


def register_user(request):
    if request.user.is_authenticated:
        messages.warning(request, "You are already logged in. If you want to create a new account, you need to log out.")
        return redirect(reverse("classroom:index"))
    
    if request.method == "POST":

        if not (username := request.POST.get("username")):
            messages.error(request, "Missing username.")
            return render(request, "accounts/register.html", {})
        
        if not (firstname := request.POST.get("firstname")):
            messages.error(request, "Missing first name.")
            return render(request, "accounts/register.html", {})
        
        if not (lastname := request.POST.get("lastname")):
            messages.error(request, "Missing last name.")
            return render(request, "accounts/register.html", {})

        if not (email := request.POST.get("email")):
            messages.error(request, "Missing email.")
            return render(request, "accounts/register.html", {})
        
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
            messages.error(request, "Email incorrect.")
            return render(request, "accounts/register.html", {})
        
        if not (phone := request.POST.get("phone")):
            messages.error(request, "Missing phone number.")
            return render(request, "accounts/register.html", {})
        
        if not re.match(r"^\d{3}-\d{2}-\d{3}$", phone):
            messages.error(request, "Phone number incorrect.")
            return render(request, "accounts/register.html", {})
        
        if not (password := request.POST.get("password")):
            messages.error(request, "Missing password.")
            return render(request, "accounts/register.html", {})

        if not (confirmation := request.POST.get("confirmation")):
            messages.error(request, "Missing password confrimation.")
            return render(request, "accounts/register.html", {})
        
        if password != confirmation:
            messages.error(request, "Passwords must match.")
            return render(request, "accounts/register.html", {})

        if not (role := request.POST.get("role")):
            messages.error(request, "Missing role.")
            return render(request, "accounts/register.html", {})
        
        try:
            user = User.objects.create_user(username=username, first_name=firstname.capitalize(), last_name=lastname.capitalize(), email=email, phone=phone, password=password, role=role)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already taken.")
            return render(request, "network/register.html", {})
        
        messages.success(request, "Successfully created account.")
        return redirect(reverse("accounts:login"))

    return render(request, "accounts/register.html", {})


def login_user(request):
    if request.user.is_authenticated:
        messages.warning(request, "You are already logged in.")
        return redirect(reverse("classroom:index"))
    
    if request.method == "POST":
        
        if not (username := request.POST.get("username")):
            messages.error(request, "Missing username.")
            return render(request, "accounts/login.html", {})
        
        if not (password := request.POST.get("password")):
            messages.error(request, "Missing password.")
            return render(request, "accounts/login.html", {})
        
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "You successfully logged in your account.")
            return redirect(reverse("classroom:index"))
        else:
            messages.error(request, "Invalid username and/or password.")
            return render(request, "accounts/login.html", {})

    return render(request, "accounts/login.html", {})


def logout_user(request):
    logout(request)
    messages.success(request, "You successfully logged out of your account.")
    return redirect(reverse("classroom:index"))


def user_show(request):
    if not request.user.is_authenticated:
        messages.warning(request, "You are not logged in.")
        return redirect(reverse("classroom:index"))
    
    return render(request, "accounts/user.html", {
        "form": ProfilePictureForm(),
    })  


@csrf_exempt
def update_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    user = request.user

    data = json.loads(request.body.decode('utf-8'))

    if not (firstname := data.get("first_name")):
        return JsonResponse({"details": "Missing first name."}, status=400)
        
    if not (lastname := data.get("last_name")):
        return JsonResponse({"details": "Missing last name"}, status=400)
        
    if not (email := data.get("email")):
        return JsonResponse({"details": "Missing email."}, status=400)
    
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
        return JsonResponse({"details": "Email incorrect."}, status=400)
    
    if not (phone := data.get("phone")):
        return JsonResponse({"details": "Missing phone number."}, status=400)
        
    if not re.match(r"^\d{3}-\d{2}-\d{3}$", phone):
        return JsonResponse({"details": "Phone number incorrect."}, status=400)
    
    user.first_name = firstname
    user.last_name = lastname
    user.email = email
    user.phone = phone 
    user.save() 

    return JsonResponse({"details": "Succesfuly updated information.", 
                        "data": {
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "email": user.email,
                            "phone": user.phone,
                            }}, status=201)


@csrf_exempt
def update_user_picutre(request):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    user = request.user

    if form := ProfilePictureForm(request.POST, request.FILES):
        if form.is_valid():
            if picture := form.cleaned_data["profile_picture"]:
                if user.profile_picture:
                    url = user.profile_picture.url.replace("/media","")
                    os.remove(MEDIA_ROOT + url)
                user.profile_picture = picture
                user.save()
                return JsonResponse({"details": "Succesfuly added profile picture.", 
                                "data": {
                                    "profile_picture": user.profile_picture.url,
                                    }}, status=201)
            

@csrf_exempt
def delete_user_picutre(request):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    user = request.user
    
    url = user.profile_picture.url.replace("/media","")
    os.remove(MEDIA_ROOT + url)

    user.profile_picture = None
    user.save()

    return JsonResponse({"details": "Succesfuly deleted profile picture.",
                         "data": {"id": user.id,}}, status=200)

