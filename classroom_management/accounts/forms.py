from classroom.models import User
from django import forms

class ProfilePictureForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("profile_picture",)
        labels = {
            "profile_picture": "",
        }