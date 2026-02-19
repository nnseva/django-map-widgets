from django import forms
from mapbox.models import (
    InteractiveLineStringField,
    InteractiveMultiPolygonField,
    InteractivePointField,
    InteractivePolygonField,
    StaticPointField,
)

from mapwidgets import (
    MapboxLineStringFieldWidget,
    MapboxMultiPolygonFieldWidget,
    MapboxPolygonFieldWidget,
    MapboxPointFieldStaticWidget,
    MapboxPointFieldWidget,
)


class InteractivePointFieldViewForm(forms.ModelForm):
    class Meta:
        model = InteractivePointField
        fields = ("name", "location")
        widgets = {
            "location": MapboxPointFieldWidget,
        }


class StaticPointFieldViewForm(forms.ModelForm):
    class Meta:
        model = StaticPointField
        fields = ("name", "location", "location_has_default")
        widgets = {
            "location": MapboxPointFieldStaticWidget,
            "location_has_default": MapboxPointFieldStaticWidget(
                settings={"enableMagnificPopup": False}
            ),
        }


class InteractiveLineStringFieldViewForm(forms.ModelForm):
    class Meta:
        model = InteractiveLineStringField
        fields = ("name", "route")
        widgets = {
            "route": MapboxLineStringFieldWidget,
        }


class InteractivePolygonFieldViewForm(forms.ModelForm):
    class Meta:
        model = InteractivePolygonField
        fields = ("name", "area")
        widgets = {
            "area": MapboxPolygonFieldWidget,
        }


class InteractiveMultiPolygonFieldViewForm(forms.ModelForm):
    class Meta:
        model = InteractiveMultiPolygonField
        fields = ("name", "areas")
        widgets = {
            "areas": MapboxMultiPolygonFieldWidget,
        }
