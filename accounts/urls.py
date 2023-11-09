from django.urls import path
from . import views

app_name="accounts"

urlpatterns = [
    path('register/', views.register_user, name="register"),
    path('login/', views.login_user, name="login"),
    path('logout/', views.logout_user, name="logout"),
    path('user/', views.user_show, name="user"),
    path('update/', views.update_user, name="update"),
    path('update/picture/', views.update_user_picutre, name="update_picture"),
    path('delete/picture/', views.delete_user_picutre, name="delete_picture"),
]