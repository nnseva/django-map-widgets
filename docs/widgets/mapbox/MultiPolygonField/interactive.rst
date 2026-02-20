Interactive MultiPolygon Field Widget
=====================================

Preview
^^^^^^^

.. image:: /_static/images/mapbox_preview.png


Requirements
^^^^^^^^^^^^
**Access Token**: A Mapbox access token is required to use this widget. Please follow the instructions on the `MapBox Create Access Token <https://docs.mapbox.com/help/getting-started/access-tokens/>`_ page.


Key Features
^^^^^^^^^^^^

**Draw & Edit Multiple Polygons:** The widget allows users to draw and edit a MultiPolygon geometry on the map. Internally it collects multiple polygons from the draw layer.

**Place Autocomplete (Geocoding):** Built-in `Mapbox Geocoder <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding>`_ input for searching places.

**Use My Location Action:** Users can pan to their current location using the "Use My Location" action button.

**Auto Fit To Geometry:** The map view can automatically fit to the drawn/loaded multipolygon.


Settings
^^^^^^^^
``Default Settings``

.. code-block:: python

    MAP_WIDGETS = {
     "Mapbox": {
        "accessToken": "",
        "MultiPolygonField": {
            "interactive": {
                "mapOptions": {
                    "zoom": 12,
                    "style": "mapbox://styles/mapbox/streets-v11",
                    "scrollZoom": False,
                    "animate": False,
                    "center": get_default_center_coordinates(),
                },
                "geocoderOptions": {},
                "drawOptions": {},
                "polygonFitPadding": 40,
                "showZoomNavigation": True,
            },
        },
    }


* **accessToken**: `Mapbox Access Token <https://docs.mapbox.com/help/getting-started/access-tokens/>`_. (required)

* **mapOptions**: Mapbox `MapOptions <https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters>`_ parameters passed to the map initialization.

* **geocoderOptions**: `Mapbox Geocoder <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding>`_ option parameters. See the full list `here <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding/#geocodingoptions>`_.

* **drawOptions**: Options passed to Mapbox GL Draw.

* **polygonFitPadding**: Padding (in pixels) used while fitting the map bounds to the MultiPolygon. Default is ``40``.

* **showZoomNavigation**: Enable/Disable zoom in/out UI buttons on the map. Default is ``True``.

.. Note::
    More details about map widget settings usage can be found in the :ref:`settings guide <settings>`.


Usage
^^^^^

In the Django project settings file, the `MAP_WIDGETS` dictionary should be defined to customize the default settings for map widgets.

.. code-block:: python

    MAP_WIDGETS = {
     "Mapbox": {
        "accessToken": MapBoxAccessToken,
        "MultiPolygonField": {
            "interactive": {
                "mapOptions": {
                    "animate": False,
                },
                "drawOptions": {
                    # Mapbox GL Draw options
                },
            },
        },
    }

**Django Admin**

.. code-block:: python

    import mapwidgets


    class RegionAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.MultiPolygonField: {"widget": mapwidgets.MapboxMultiPolygonFieldWidget}
        }


**Django Forms**

.. code-block:: python

    from django.contrib.gis import forms
    import mapwidgets


    class RegionForm(forms.ModelForm):
        region = forms.MultiPolygonField(widget=mapwidgets.MapboxMultiPolygonFieldWidget)

        class Meta:
            model = Region
            fields = ("name", "region")
            widgets = {
                "region": mapwidgets.MapboxMultiPolygonFieldWidget,
            }


.. image:: /_static/images/mapbox_interactive.gif


Javascript Triggers
^^^^^^^^^^^^^^^^^^^

UI customization or event handling on the front-end can be managed using map widget jQuery triggers.

* **mapboxMultiPolygonFieldWidget:multiPolygonCreate**: Triggered when a multipolygon is created. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxMultiPolygonFieldWidget:multiPolygonChange**: Triggered when a multipolygon is changed. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxMultiPolygonFieldWidget:multiPolygonDelete**: Triggered when a multipolygon is deleted (all polygons cleared). (callback params: null, wrapElemSelector, djangoInput)

* **mapboxMultiPolygonFieldWidget:placeChanged**: Triggered when the place in the autocomplete input is changed. (callback params: place, lat, lng, wrapElemSelector, djangoInput)

.. code-block:: javascript

    (function ($) {
        $(document).on("mapboxMultiPolygonFieldWidget:multiPolygonCreate", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxMultiPolygonFieldWidget:multiPolygonChange", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxMultiPolygonFieldWidget:multiPolygonDelete", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxMultiPolygonFieldWidget:placeChanged", function (e, place, lat, lng, wrapElemSelector, djangoInput) {
            console.log(place, lat, lng);
        });
    })(jQuery)
