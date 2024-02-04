from django.urls import path, include
from . import views

urlpatterns = [
    path("upload/", views.upload_image, name="upload"),
    path("generate/<int:drawing_id>", views.generate_image, name="generate"),
]
