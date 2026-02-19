from django.urls import reverse_lazy
from django.views.generic import FormView, ListView, UpdateView
from mapbox.forms import (
    InteractiveLineStringFieldViewForm,
    InteractiveMultiPolygonFieldViewForm,
    InteractivePointFieldViewForm,
    InteractivePolygonFieldViewForm,
    StaticPointFieldViewForm,
)
from mapbox.models import (
    InteractiveLineStringField,
    InteractiveMultiPolygonField,
    InteractivePointField,
    InteractivePolygonField,
    StaticPointField,
)


class InteractivePointFieldListView(ListView):
    queryset = InteractivePointField.objects.all().order_by("-updated_at")
    template_name = "mapbox/pointfield/interactive/list.html"
    context_object_name = "pointfield_objs"


class InteractivePointFieldEditView(UpdateView):
    form_class = InteractivePointFieldViewForm
    model = InteractivePointField
    template_name = "mapbox/pointfield/interactive/edit.html"
    context_object_name = "obj"
    success_url = reverse_lazy("mapbox:pointfield_interactive_list")


class InteractivePointFieldAddView(FormView):
    template_name = "mapbox/pointfield/interactive/add.html"
    form_class = InteractivePointFieldViewForm
    success_url = reverse_lazy("mapbox:list")

    def form_valid(self, form):
        form.save()
        return super(InteractivePointFieldAddView, self).form_valid(form)


class StaticPointFieldListView(ListView):
    queryset = StaticPointField.objects.all().order_by("-updated_at")
    template_name = "mapbox/pointfield/static/list.html"
    context_object_name = "pointfield_objs"


class StaticPointFieldEditView(UpdateView):
    form_class = StaticPointFieldViewForm
    model = StaticPointField
    template_name = "mapbox/pointfield/static/edit.html"
    context_object_name = "obj"
    success_url = reverse_lazy("mapbox:pointfield_static_list")


class InteractiveLineStringFieldListView(ListView):
    queryset = InteractiveLineStringField.objects.all().order_by("-updated_at")
    template_name = "mapbox/linestringfield/interactive/list.html"
    context_object_name = "linestringfield_objs"


class InteractiveLineStringFieldEditView(UpdateView):
    form_class = InteractiveLineStringFieldViewForm
    model = InteractiveLineStringField
    template_name = "mapbox/linestringfield/interactive/edit.html"
    context_object_name = "obj"
    success_url = reverse_lazy("mapbox:linestringfield_interactive_list")


class InteractiveLineStringFieldAddView(FormView):
    template_name = "mapbox/linestringfield/interactive/add.html"
    form_class = InteractiveLineStringFieldViewForm
    success_url = reverse_lazy("mapbox:linestringfield_interactive_list")

    def form_valid(self, form):
        form.save()
        return super(InteractiveLineStringFieldAddView, self).form_valid(form)


class InteractivePolygonFieldListView(ListView):
    queryset = InteractivePolygonField.objects.all().order_by("-updated_at")
    template_name = "mapbox/polygonfield/interactive/list.html"
    context_object_name = "polygonfield_objs"


class InteractivePolygonFieldEditView(UpdateView):
    form_class = InteractivePolygonFieldViewForm
    model = InteractivePolygonField
    template_name = "mapbox/polygonfield/interactive/edit.html"
    context_object_name = "obj"
    success_url = reverse_lazy("mapbox:polygonfield_interactive_list")


class InteractivePolygonFieldAddView(FormView):
    template_name = "mapbox/polygonfield/interactive/add.html"
    form_class = InteractivePolygonFieldViewForm
    success_url = reverse_lazy("mapbox:polygonfield_interactive_list")

    def form_valid(self, form):
        form.save()
        return super(InteractivePolygonFieldAddView, self).form_valid(form)


class InteractiveMultiPolygonFieldListView(ListView):
    queryset = InteractiveMultiPolygonField.objects.all().order_by("-updated_at")
    template_name = "mapbox/multipolygonfield/interactive/list.html"
    context_object_name = "multipolygonfield_objs"


class InteractiveMultiPolygonFieldEditView(UpdateView):
    form_class = InteractiveMultiPolygonFieldViewForm
    model = InteractiveMultiPolygonField
    template_name = "mapbox/multipolygonfield/interactive/edit.html"
    context_object_name = "obj"
    success_url = reverse_lazy("mapbox:multipolygonfield_interactive_list")


class InteractiveMultiPolygonFieldAddView(FormView):
    template_name = "mapbox/multipolygonfield/interactive/add.html"
    form_class = InteractiveMultiPolygonFieldViewForm
    success_url = reverse_lazy("mapbox:multipolygonfield_interactive_list")

    def form_valid(self, form):
        form.save()
        return super(InteractiveMultiPolygonFieldAddView, self).form_valid(form)
