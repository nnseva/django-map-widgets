from django.contrib.gis.db import models
from django.contrib.gis.geos import LineString, Point
from django.urls import reverse

from demo.db import BaseModel

DEFAULT_LOCATION_POINT = Point(-104.8803, 39.7392)
DEFAULT_LOCATION_LINE = LineString(
    (-104.9903, 39.7392),
    (-104.9803, 39.7492),
    (-104.9703, 39.7592),
    srid=4326,
)


class InteractivePointField(BaseModel):
    name = models.CharField(max_length=255)
    location = models.PointField(help_text="Use map widget to point the location")
    location_has_default = models.PointField(default=DEFAULT_LOCATION_POINT)
    location_optional = models.PointField(blank=True, null=True)

    class Meta:
        verbose_name = "Interactive PointField Widget"
        verbose_name_plural = "Interactive PointField Widget"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("mapbox:pointfield_interactive_edit", args=(self.id,))


class StaticPointField(InteractivePointField):
    class Meta:
        proxy = True
        verbose_name = "Static PointField Widget"
        verbose_name_plural = "Static PointField Widget"

    def get_absolute_url(self):
        return reverse("mapbox:pointfield_static_edit", args=(self.id,))


class InteractiveLineStringField(BaseModel):
    name = models.CharField(max_length=255)
    route = models.LineStringField(
        help_text="Use map widget to draw the route",
        srid=4326,
    )
    route_has_default = models.LineStringField(default=DEFAULT_LOCATION_LINE, srid=4326)
    route_optional = models.LineStringField(blank=True, null=True, srid=4326)

    class Meta:
        verbose_name = "Interactive LineStringField Widget"
        verbose_name_plural = "Interactive LineStringField Widget"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("mapbox:linestringfield_interactive_edit", args=(self.id,))
