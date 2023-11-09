from django.urls import path
from . import views

app_name="classroom"

urlpatterns = [
    path('', views.index, name="index"),
    
    path('classlists/', views.class_list, name="class_list"),
    path('classlists/<int:id>/assignmentslist', views.assignments_list, name="assignments_list"),

    path('create/', views.create_classroom, name="create"),
    
    path('classrooms/<int:id>', views.classroom_view, name="classroom_view"),

    path('classrooms/<int:id>/edit', views.classroom_edit, name="classroom_edit"),
    path('classrooms/<int:id>/delete', views.classroom_delete, name="classroom_delete"),

    path('classrooms/<int:id>/create/material', views.create_material, name="create_material"),
    path('classrooms/<int:id>/create/material/<int:assignment_id>/files', views.create_material_files, name="create_material_files"),

    path('classrooms/<int:id>/create/assignment', views.create_assignment, name="create_material"),
    path('classrooms/<int:id>/create/assignment/<int:assignment_id>/files', views.create_assignment_files, name="create_assignment_files"),

    path('classrooms/connect/<str:identifier>', views.classroom_connect, name="classroom_connect"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>', views.assignment_view, name="assignment_view"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/links/delete', views.delete_link_assignment, name="delete_link_assignment"),
    path('classrooms/<int:id>/assignments/<int:assignment_id>/files/delete', views.delete_file_assignment, name="delete_file_assignment"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/delete', views.delete_assignment, name="delete_assignment"),
    path('classrooms/<int:id>/assignments/<int:assignment_id>/edit', views.edit_assignment, name="edit_assignment"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/create/submit', views.save_submit, name="save_submit"),
    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/<int:submit_id>/files', views.save_submit_files, name="save_submit_files"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/student', views.submit_list, name="submit_list"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/<int:submit_id>/edit', views.submit_edit, name="save_submit_edit"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/<int:submit_id>/links/delete', views.delete_link_submit, name="delete_link_submit"),
    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/<int:submit_id>/files/delete', views.delete_file_submit, name="delete_files_submit"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/teacher', views.submit_list_teacher, name="submit_list_teacher"),

    path('classrooms/<int:id>/assignments/<int:assignment_id>/submits/grade_student', views.grade_student, name="grade_student"),
]