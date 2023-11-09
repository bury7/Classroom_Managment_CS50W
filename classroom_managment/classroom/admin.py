from django.contrib import admin
from .models import *
from django import forms

class ClassroomAdminForm(forms.ModelForm):
    class Meta:
        model = Classroom
        exclude = ()

    def clean_students(self):
        students = self.cleaned_data.get('students')
        teacher = self.cleaned_data.get('teacher')

        if teacher in students.all():
            raise forms.ValidationError("Teachers cannot enroll themselves as students.")
        
        return students


class ClassroomAdmin(admin.ModelAdmin):
    form = ClassroomAdminForm
    filter_horizontal = ("students", "assignments")

class AssignmentAdmin(admin.ModelAdmin):
    filter_horizontal = ("files", "links", "submits")

class SubmitAdmin(admin.ModelAdmin):
    filter_horizontal = ("files", "links", "comments")

admin.site.register(User)
admin.site.register(Classroom, ClassroomAdmin)
admin.site.register(Assignment, AssignmentAdmin)
admin.site.register(Submit, SubmitAdmin)
admin.site.register(Links)
admin.site.register(File)
admin.site.register(Comment)



