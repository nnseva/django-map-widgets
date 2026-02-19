import django.contrib.gis.db.models.fields
import django.contrib.gis.geos.polygon
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mapbox", "0003_interactivelinestringfield"),
    ]

    operations = [
        migrations.CreateModel(
            name="InteractivePolygonField",
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
                    "area",
                    django.contrib.gis.db.models.fields.PolygonField(
                        help_text="Use map widget to draw the polygon", srid=4326
                    ),
                ),
                (
                    "area_has_default",
                    django.contrib.gis.db.models.fields.PolygonField(
                        default=django.contrib.gis.geos.polygon.Polygon(
                            (
                                (
                                    -104.9903,
                                    39.7392,
                                ),
                                (
                                    -104.9803,
                                    39.7392,
                                ),
                                (
                                    -104.9803,
                                    39.7492,
                                ),
                                (
                                    -104.9903,
                                    39.7492,
                                ),
                                (
                                    -104.9903,
                                    39.7392,
                                ),
                            ),
                            srid=4326,
                        ),
                        srid=4326,
                    ),
                ),
                (
                    "area_optional",
                    django.contrib.gis.db.models.fields.PolygonField(
                        blank=True, null=True, srid=4326
                    ),
                ),
            ],
            options={
                "verbose_name": "Interactive PolygonField Widget",
                "verbose_name_plural": "Interactive PolygonField Widget",
            },
        ),
    ]
