import django.contrib.gis.db.models.fields
import django.contrib.gis.geos.linestring
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mapbox", "0002_staticpointfield_alter_interactivepointfield_options"),
    ]

    operations = [
        migrations.CreateModel(
            name="InteractiveLineStringField",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                (
                    "route",
                    django.contrib.gis.db.models.fields.LineStringField(
                        help_text="Use map widget to draw the route", srid=4326
                    ),
                ),
                (
                    "route_has_default",
                    django.contrib.gis.db.models.fields.LineStringField(
                        default=django.contrib.gis.geos.linestring.LineString(
                            (
                                -104.9903,
                                39.7392,
                            ),
                            (
                                -104.9803,
                                39.7492,
                            ),
                            (
                                -104.9703,
                                39.7592,
                            ),
                            srid=4326,
                        ),
                        srid=4326,
                    ),
                ),
                (
                    "route_optional",
                    django.contrib.gis.db.models.fields.LineStringField(
                        blank=True, null=True, srid=4326
                    ),
                ),
            ],
            options={
                "verbose_name": "Interactive LineStringField Widget",
                "verbose_name_plural": "Interactive LineStringField Widget",
            },
        ),
    ]
