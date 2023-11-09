import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
import os
from classroom_management.settings import MEDIA_ROOT


class User(AbstractUser):
    phone = models.CharField(max_length=14)
    role = models.CharField(max_length=10, choices=(('teacher', 'Teacher'),('student', 'Student'),))
    profile_picture = models.ImageField(null=True, blank=True, upload_to="profile_pictures/")
    


class File(models.Model):
    file = models.FileField(upload_to="uploads/")

    
    def __str__(self) -> str:
        return f"{self.id}. {self.file.url}"

    def delete(self, *args, **kwargs):
        file = self.file.url.replace("/media","")
        if os.path.isfile(file):
            os.remove(MEDIA_ROOT + file)

        super(File, self).delete(*args, **kwargs)
        
    def short_url(self):
        return str(self.file).replace("uploads/", "")


class Links(models.Model):
    url = models.URLField(max_length=1000)


    def __str__(self) -> str:
        return f"{self.id}. {self.url}"
    


class Comment(models.Model):
    comment = models.CharField(max_length=10000)

    def __str__(self) -> str:
        return f"{self.id}. {self.comment}"


class Submit(models.Model):
    name = models.CharField(max_length=500) 
    message = models.CharField(max_length=10000, blank=True, null=True)
    links = models.ManyToManyField(Links, related_name="link_to_submit", blank=True,)
    files = models.ManyToManyField(File, related_name="file_to_submit", blank=True,)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(blank=True, null=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_submits")
    grade = models.IntegerField(blank=True, null=True)
    comments = models.ManyToManyField(Comment, related_name="comment_to_submit", blank=True,)

    def __str__(self) -> str:
        return self.name
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "message": self.message,
            "links": [link.url for link in self.links.all()],
            "links_and_id": [{"link": link.url, "id": link.id} for link in self.links.all()],
            "files": [file.file.url for file in self.files.all()],
            "files_and_id": [{"file": file.file.url, "id": file.id} for file in self.files.all()],
            "created_at": self.created_at,
            "changed_at": self.changed_at,
            "grade": self.grade,
            "comments": [comment.comment for comment in self.comments.all()],
        }
    


class Assignment(models.Model):
    name = models.CharField(max_length=500)
    description = models.CharField(max_length=10000, blank=True, null=True)
    type = models.CharField(max_length=30, choices=(('material', 'Material'),('assignment', 'Assignment'),))
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(blank=True, null=True)
    links = models.ManyToManyField(Links, related_name="link_to_assignment", blank=True,)
    files = models.ManyToManyField(File, related_name="file_to_assignment", blank=True,)
    submits = models.ManyToManyField(Submit, related_name="submits_to_assignment", blank=True,)

    def deadline_str(self):
        return str(self.deadline)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "deadline": str(self.deadline),
            "links": [link.url for link in self.links.all()],
            "links_and_id": [{"link": link.url, "id": link.id} for link in self.links.all()],
            "files": [file.file.url for file in self.files.all()],
            "files_and_id": [{"file": file.file.url, "id": file.id} for file in self.files.all()],
        }
    

    def __str__(self) -> str:
        return f"{self.id}. {self.name} {self.type}"

    
class Classroom(models.Model):
    identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=500)
    theme = models.CharField(max_length=500, blank=True, null=True)
    link = models.URLField(max_length=1000, blank=True, null=True)
    description = models.CharField(max_length=10000, blank=True, null=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teach_classes")
    students = models.ManyToManyField(User, related_name="enrolled_classes", blank=True,)
    assignments = models.ManyToManyField(Assignment, related_name="classrooms", blank=True)
   

    def __str__(self) -> str:
        return f"{self.id}. {self.name}"
    
    
    def save(self, *args, **kwargs):
        if not self.identifier:
            self.identifier = uuid.uuid4()
        super(Classroom, self).save(*args, **kwargs)
    

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "teacher": self.teacher.first_name + " " + self.teacher.last_name,
            "students": [student.first_name + " " + student.last_name for student in self.students.all()],
        }
    
  