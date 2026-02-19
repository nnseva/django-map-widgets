from django.urls import path
from mapbox.views import (
    InteractiveLineStringFieldAddView,
    InteractiveLineStringFieldEditView,
    InteractiveLineStringFieldListView,
    InteractivePointFieldAddView,
    InteractivePointFieldEditView,
    InteractivePointFieldListView,
    StaticPointFieldEditView,
    StaticPointFieldListView,
)

app_name = "mapbox"

urlpatterns = [
    path(
        "pointfield/interactive/",
        InteractivePointFieldListView.as_view(),
        name="pointfield_interactive_list",
    ),
    path(
        "pointfield/interactive/<int:pk>/",
        InteractivePointFieldEditView.as_view(),
        name="pointfield_interactive_edit",
    ),
    path(
        "pointfield/interactive/add/",
        InteractivePointFieldAddView.as_view(),
        name="pointfield_interactive_add",
    ),
    path(
        "pointfield/static/",
        StaticPointFieldListView.as_view(),
        name="pointfield_static_list",
    ),
    path(
        "pointfield/static/<int:pk>/",
        StaticPointFieldEditView.as_view(),
        name="pointfield_static_edit",
    ),
    path(
        "linestringfield/interactive/",
        InteractiveLineStringFieldListView.as_view(),
        name="linestringfield_interactive_list",
    ),
    path(
        "linestringfield/interactive/<int:pk>/",
        InteractiveLineStringFieldEditView.as_view(),
        name="linestringfield_interactive_edit",
    ),
    path(
        "linestringfield/interactive/add/",
        InteractiveLineStringFieldAddView.as_view(),
        name="linestringfield_interactive_add",
    ),
]
