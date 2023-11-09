from django import forms
from .models import Assignment

class DeadlineForm(forms.ModelForm):
    class Meta:
        model = Assignment
        fields = ['deadline']
        widgets = {
            'deadline': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
        }
