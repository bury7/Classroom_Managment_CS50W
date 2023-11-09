from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.http import JsonResponse
from django.contrib import messages
from django.urls import reverse
from .forms import DeadlineForm
from datetime import datetime
import json


def index(request):
    if not request.user.is_authenticated:
        return render(request, "classroom/greet.html", {})
    
    return render(request, "classroom/index.html", {})


@csrf_exempt
def class_list(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "GET":
        return JsonResponse({"details": "GET request required."}, status=400)

    if user.role == "student":
        classrooms = Classroom.objects.filter(students=user)
    elif user.role == "teacher":
        classrooms = Classroom.objects.filter(teacher=user)

    return JsonResponse([classroom.serialize() for classroom in classrooms], safe=False)



@csrf_exempt
def create_classroom(request):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    if not (name := data.get("name")):
        return JsonResponse({"details": "Missing classroom name."}, status=400)
    elif len(name) > 500:
        return JsonResponse({"details": "Name too long (maximum 500 characters)."}, status=400)
    
    if not (theme := data.get("theme")):
        theme = None
    elif len(theme) > 500:
        return JsonResponse({"details": "Theme too long (maximum 500 characters)."}, status=400)
    
    if not (link := data.get("link")):
        link = None
    elif len(link) > 1000:
        return JsonResponse({"details": "Link too long (maximum 1000 characters)."}, status=400)
    elif not link.startswith("http"):
        link = "https://" + link
    
    if not (description := data.get("description")):
        description = None
    elif len(description) > 10000:
        return JsonResponse({"details": "Description too long (maximum 10000 characters)."}, status=400)
    
        
    class_room = Classroom(name=name, teacher=request.user, theme=theme, link=link, description=description)
    class_room.save()

    return JsonResponse({"details": "Sucesfully created", 
                         "data": {"id": class_room.id}}, 
                         status=200)


def classroom_view(request, id):
    if not request.user.is_authenticated:
        messages.warning(request, "You are unauthorized.")
        return redirect(reverse("classroom:index"))
    
    try:
        classroom = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != classroom.teacher and request.user not in classroom.students.all():
        messages.warning(request, "You don't have access to this page!")
        return redirect(reverse("classroom:index"))
    
    relative_url = reverse('classroom:classroom_connect', args=[classroom.identifier])
    full_url = request.build_absolute_uri(relative_url)
    
    return render(request, "classroom/classroom.html", {
        "classroom": classroom,
        "full_url": full_url,
        "deadline_form": DeadlineForm(),
    })


@csrf_exempt
def classroom_edit(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    data = json.loads(request.body)

    if not (name := data.get("name")):
        return JsonResponse({"details": "Missing classroom name."}, status=400)
    elif len(name) > 500:
        return JsonResponse({"details": "Name too long (maximum 500 characters)."}, status=400)
    
    if not (theme := data.get("theme")):
        theme = None
    elif len(theme) > 500:
        return JsonResponse({"details": "Theme too long (maximum 500 characters)."}, status=400)
    
    if not (link := data.get("link")):
        link = None
    elif not link.startswith("http"):
        link = "https://" + link
    elif len(link) > 1000:
        return JsonResponse({"details": "Link too long (maximum 1000 characters)."}, status=400)

    if not (description := data.get("description")):
        description = None
    elif len(description) > 10000:
        return JsonResponse({"details": "Description too long (maximum 10000 characters)."}, status=400)
    
    class_room.name = name
    class_room.theme = theme
    class_room.description = description
    class_room.link = link
    class_room.save()

    return JsonResponse({"details": "Sucesfully edited", 
                         "data": {
                            "name": class_room.name,
                            "theme": class_room.theme,
                            "description": class_room.description,
                            "link": class_room.link,
                            }}, 
                         status=200)
     

@csrf_exempt
def classroom_delete(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    class_room.delete()

    return JsonResponse({"details": "Sucesfully deleted", 
                         "data": {"id": class_room.id}}, status=200)


def classroom_connect(request, identifier):
    if not request.user.is_authenticated:
        messages.warning(request, "Unauthorized.")
        return redirect("classroom:index")
    
    if request.method != "GET":
        messages.warning(request, "GET request required.")
        return redirect("classroom:index")
    
    if request.user.role != "student":
        messages.warning(request, "Teachers cannot add themselves to a course as a student.")
        return redirect("classroom:index")
    
    try:
        class_room = Classroom.objects.get(identifier=identifier)
    except Exception:
        return JsonResponse({"details": "Classroom with this identifier don't exist"}, status=400)

    if request.user in class_room.students.all():
        messages.warning(request, "You are already enrolled on course.")
        return redirect("classroom:classroom_view", id=int(class_room.id))

    class_room.students.add(request.user)
    messages.success(request, "You are successfully enrolled on course.")
    return redirect("classroom:classroom_view", id=int(class_room.id))
    

@csrf_exempt
def create_material(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    data = json.loads(request.body)

    if not (name := data.get("name")):
        return JsonResponse({"details": "Missing classroom name."}, status=400)
    elif len(name) > 500:
        return JsonResponse({"details": "Name too long (maximum 500 characters)."}, status=400)

    if not (description := data.get("description")):
        description = None
    elif len(description) > 10000:
        return JsonResponse({"details": "Description too long (maximum 10000 characters)."}, status=400)
    
    if not (links := data.get("links")):
        links = None
    else: 
        for link in links:
            if len(link) > 1000:
                return JsonResponse({"details": "link too long (maximum 1000 characters)."}, status=400)
        
    assignment = Assignment(name=name, description=description, type="material")

    assignment.save()

    if links:
        for link in links:
            url = Links(url=link)
            url.save()
            assignment.links.add(url)

    assignment.save()

    class_room.assignments.add(assignment)
    class_room.save()

    return JsonResponse({"details": "Sucesfully created", 
                         "data": {"assignment_id": assignment.id}}, status=200)

        
@csrf_exempt
def create_material_files(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    files = request.FILES.getlist('files')

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)    

    for file in files:
        file_ = File(file=file)
        file_.save()
        assignment.files.add(file_)
        assignment.save()
        
    return JsonResponse({"details": "Sucesfully created", 
                        "data": {"assignment_id": assignment.id}}, status=200)


@csrf_exempt
def assignments_list(request, id):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "GET":
        return JsonResponse({"details": "GET request required."}, status=400)

    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)


    assignment_list = []
    for assignment in class_room.assignments.order_by('-created_at').all():
        serialize = assignment.serialize()
        serialize["user_role"] = request.user.role
        assignment_list.append(serialize)

    return JsonResponse(assignment_list, safe=False)



@csrf_exempt
def create_assignment(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    data = json.loads(request.body)

    if not (name := data.get("name")):
        return JsonResponse({"details": "Missing classroom name."}, status=400)
    elif len(name) > 500:
        return JsonResponse({"details": "Name too long (maximum 500 characters)."}, status=400)

    if not (description := data.get("description")):
        description = None
    elif len(description) > 10000:
        return JsonResponse({"details": "Description too long (maximum 10000 characters)."}, status=400)
    
    if not (links := data.get("links")):
        links = None
    else: 
        for link in links:
            if len(link) > 1000:
                return JsonResponse({"details": "Link too long (maximum 1000 characters)."}, status=400)
            
    if not (deadline := data.get("deadline")):
        deadline = None
    else:
        deadline = datetime.strptime(deadline, "%Y-%m-%dT%H:%M")

        if datetime.now() > deadline:
            return JsonResponse({"details": "Deadline cannot be in the past"}, status=400)
    
        
    assignment = Assignment(name=name, description=description, type="assignment", deadline=deadline)

    assignment.save()

    if links:
        for link in links:
            url = Links(url=link)
            url.save()
            assignment.links.add(url)

    assignment.save()

    class_room.assignments.add(assignment)
    class_room.save()

    return JsonResponse({"details": "Sucesfully created", 
                         "data": {"assignment_id": assignment.id}}, status=200)

        
@csrf_exempt
def create_assignment_files(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    files = request.FILES.getlist('files')

    for file in files:
        file_ = File(file=file)
        file_.save()
        assignment.files.add(file_)
        assignment.save()
        
    return JsonResponse({"details": "Sucesfully created", 
                        "data": {"assignment_id": assignment.id}}, status=200)


def assignment_view(request, id, assignment_id):
    if not request.user.is_authenticated:
        messages.warning(request, "You are unauthorized.")
        return redirect(reverse("classroom:classroom_view",  args=[id]))
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher and request.user not in class_room.students.all():
        messages.warning(request, "You don't have access to this page!")
        return redirect(reverse("classroom:classroom_view", args=[id]))
    
    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        messages.warning(request, "Assignment not in current classroom")
        return redirect(reverse("classroom:classroom_view", args=[id]))

    has_submitted = assignment.submits.filter(student=request.user).exists()

    if has_submitted:
        grade = assignment.submits.filter(student=request.user).first().grade
    else:
        grade = None

    return render(request, "classroom/assignment.html", {
        "assignment": assignment,
        "has_submitted":has_submitted,
        "grade": grade,
    })


@csrf_exempt
def delete_link_assignment(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    data = json.loads(request.body)

    if not (links_id:= data.get("links")):
        return JsonResponse({"details": "Missing links id."}, status=400)
    else:
        if links_id :
            for link_id in links_id:
                try:
                    link = Links.objects.get(pk=link_id)
                except Exception:
                    return JsonResponse({"details": "Link with this id don't exist"}, status=400)

                if link not in assignment.links.all():
                    return JsonResponse({"details": "Link not in current assignment"}, status=400)
                
                link.delete()
            return JsonResponse({"details": "Sucesfully deleted", 
                            "data": {"id": links_id}}, status=200)
        
        return JsonResponse({"details": "Error"}, status=400)


@csrf_exempt
def delete_file_assignment(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    data = json.loads(request.body)

    if not (files_id := data.get("files")):
        return JsonResponse({"details": "Missing files id."}, status=400)
    else:
        if files_id :
            for file_id in files_id:
                try:
                    file = File.objects.get(pk=file_id)
                except Exception:
                    return JsonResponse({"details": "File with this id don't exist"}, status=400)

                if file not in assignment.files.all():
                    return JsonResponse({"details": "File not in current assignment"}, status=400)
                
                file.delete()
            return JsonResponse({"details": "Sucesfully deleted", 
                            "data": {"id": files_id}}, status=200)
        
        return JsonResponse({"details": "Error"}, status=400)
       

@csrf_exempt
def delete_assignment(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    assignment.delete()

    return JsonResponse({"details": "Sucesfully deleted", 
                         "data": {"id": assignment.id}}, status=200)


@csrf_exempt
def edit_assignment(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    data = json.loads(request.body)

    if not (name := data.get("name")):
        return JsonResponse({"details": "Missing classroom name."}, status=400)
    elif len(name) > 500:
        return JsonResponse({"details": "Name too long (maximum 500 characters)."}, status=400)

    if not (description := data.get("description")):
        description = None
    elif len(description) > 10000:
        return JsonResponse({"details": "Description too long (maximum 10000 characters)."}, status=400)
    
    if not (links := data.get("links")):
        links = None
    else: 
        for link in links:
            if len(link) > 1000:
                return JsonResponse({"details": "link too long (maximum 1000 characters)."}, status=400)
            
    if not (deadline := data.get("deadline")):
        deadline = None
    else:
        deadline = datetime.strptime(deadline, "%Y-%m-%dT%H:%M")

        if datetime.now() > deadline:
            return JsonResponse({"details": "Deadline cannot be in the past"}, status=400)
    
        
    assignment.name = name
    assignment.description = description
    assignment.deadline = deadline

    if links:
        for link in links:
            url = Links(url=link)
            url.save()
            assignment.links.add(url)

    assignment.save()

    return JsonResponse({"details": "Sucesfully edited", "data": assignment.serialize()}, status=200)


@csrf_exempt
def save_submit(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    data = json.loads(request.body)

    if not (message := data.get("message")):
        message = None
    elif len(message) > 10000:
        return JsonResponse({"details": "Message too long (maximum 10000 characters)."}, status=400)
    
    if not (links := data.get("links")):
        links = None
    else: 
        for link in links:
            if len(link) > 1000:
                return JsonResponse({"details": "Link too long (maximum 1000 characters)."}, status=400)


    submit = Submit(name=f"Submied by {request.user.first_name.capitalize()} {request.user.last_name.capitalize()} for {assignment.name}", 
                    message=message, student=request.user)

    submit.save()

    if links:
        for link in links:
            url = Links(url=link)
            url.save()
            submit.links.add(url)

    submit.save()

    assignment.submits.add(submit)

    return JsonResponse({"details": "Sucesfully created", "data": {"submit_id": submit.id}}, status=200)


@csrf_exempt
def save_submit_files(request, id, assignment_id, submit_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    try:
        submit = Submit.objects.get(pk=submit_id)
    except Exception:
        return JsonResponse({"details": "Submit with this id don't exist"}, status=400)
    
    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)
    

    files = request.FILES.getlist('files')

    if not submit.message and len(submit.links.all()) == 0 and len(files) == 0:
        submit.delete()
        return JsonResponse({"details": "You can't send blank submit"}, status=400)

    for file in files:
        file_ = File(file=file)
        file_.save()
        submit.files.add(file_)
        submit.save()
        
    return JsonResponse({"details": "Sucesfully created", 
                        "data": {"submit_id": submit.id}}, status=200)


@csrf_exempt
def submit_list(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "GET":
        return JsonResponse({"details": "GET request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    try:
        submit = Submit.objects.get(student=request.user)
    except Exception:
        return JsonResponse({"details": "Submit with this user don't exist"}, status=400)
    
    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    return JsonResponse({"details": "Sucesfully created", 
                        "data": submit.serialize()}, status=200)


@csrf_exempt
def submit_edit(request, id, assignment_id, submit_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    data = json.loads(request.body)

    if not (message := data.get("message")):
        message = None
    elif len(message) > 10000:
        return JsonResponse({"details": "Message too long (maximum 10000 characters)."}, status=400)
    
    if not (links := data.get("links")):
        links = None
    else: 
        for link in links:
            if len(link) > 1000:
                return JsonResponse({"details": "Link too long (maximum 1000 characters)."}, status=400)

    try:
        submit = Submit.objects.get(student=request.user)
    except Exception:
        return JsonResponse({"details": "Submit with this user don't exist"}, status=400)

    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    submit.message = message
    submit.changed_at = datetime.now()

    if links:
        for link in links:
            url = Links(url=link)
            url.save()
            submit.links.add(url)

    submit.save()

    return JsonResponse({"details": "Sucesfully edited", "data": {"submit_id": submit.id}}, status=200)


@csrf_exempt
def delete_link_submit(request, id, assignment_id, submit_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    try:
        submit = Submit.objects.get(pk=submit_id)
    except Exception:
        return JsonResponse({"details": "Submit with this id don't exist"}, status=400)

    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    data = json.loads(request.body)

    if not (links_id:= data.get("links")):
        return JsonResponse({"details": "Missing links id."}, status=400)
    else:
        if links_id :
            for link_id in links_id:
                try:
                    link = Links.objects.get(pk=link_id)
                except Exception:
                    return JsonResponse({"details": "Link with this id don't exist"}, status=400)

                if link not in submit.links.all():
                    return JsonResponse({"details": "Link not in current submit"}, status=400)
                
                link.delete()
            return JsonResponse({"details": "Sucesfully deleted", 
                            "data": {"id": links_id}}, status=200)
        
        return JsonResponse({"details": "Error"}, status=400)


@csrf_exempt
def delete_file_submit(request, id, assignment_id, submit_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "DELETE":
        return JsonResponse({"details": "DELETE request required."}, status=400)
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not  in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)
    
    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)
    
    try:
        submit = Submit.objects.get(pk=submit_id)
    except Exception:
        return JsonResponse({"details": "Submit with this id don't exist"}, status=400)

    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    data = json.loads(request.body)

    if not (files_id := data.get("files")):
        return JsonResponse({"details": "Missing files id."}, status=400)
    else:
        if files_id :
            for file_id in files_id:
                try:
                    file = File.objects.get(pk=file_id)
                except Exception:
                    return JsonResponse({"details": "File with this id don't exist"}, status=400)

                if file not in submit.files.all():
                    return JsonResponse({"details": "File not in current submit"}, status=400)
                
                file.delete()
            return JsonResponse({"details": "Sucesfully deleted", 
                            "data": {"id": files_id}}, status=200)
        
        return JsonResponse({"details": "Error"}, status=400)
    
    
@csrf_exempt
def submit_list(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "GET":
        return JsonResponse({"details": "GET request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user not in class_room.students.all():
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    try:
        submit = Submit.objects.get(student=request.user)
    except Exception:
        return JsonResponse({"details": "Submit with this user don't exist"}, status=400)
    
    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    return JsonResponse({"details": "Sucesfully created", 
                        "data": submit.serialize()}, status=200)


@csrf_exempt
def submit_list_teacher(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "GET":
        return JsonResponse({"details": "GET request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    
    return JsonResponse({"details": "Sucesfully created", 
                        "data": [submit.serialize() for submit in assignment.submits.all()]}, status=200)



@csrf_exempt
def grade_student(request, id, assignment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"details": "Unauthorized."}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"details": "POST request required."}, status=400)
    
    try:
        class_room = Classroom.objects.get(pk=id)
    except Exception:
        return JsonResponse({"details": "Classroom with this id don't exist"}, status=400)

    if request.user != class_room.teacher:
        return JsonResponse({"details": "You don't have access to this page!"}, status=400)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Exception:
        return JsonResponse({"details": "Assignment with this id don't exist"}, status=400)

    if assignment not in class_room.assignments.all():
        return JsonResponse({"details": "Assignment not in current classroom"}, status=400)

    data = json.loads(request.body)

    if not (submit_id := data.get("id")):
        return JsonResponse({"details": "Request don't include submit id."}, status=400)

    if not (comment := data.get("comment")):
        comment = None
    elif len(comment) > 10000:
        return JsonResponse({"details": "Message too long (maximum 10000 characters)."}, status=400)
    
    if not (grade := data.get("grade")):
        return JsonResponse({"details": "Grade is required."}, status=400)
    elif not 0 <= int(grade) <= 100:
        return JsonResponse({"details": "Incorrect grade value."}, status=400)

    if not comment and not grade:
        return JsonResponse({"details": "You can't send nothing"}, status=400)

    try:
        submit = Submit.objects.get(pk=submit_id)
    except Exception:
        return JsonResponse({"details": "Submit with this user don't exist"}, status=400)
    
    if submit not in assignment.submits.all():
        return JsonResponse({"details": "Submit not in current assignment"}, status=400)

    if comment:
        com = Comment(comment=comment)
        com.save()
        submit.comments.add(com)

    submit.grade = grade
    

    submit.save()

    return JsonResponse({"details": "Sucesfully graded", "data": {"submit_id": submit.id}}, status=200)


