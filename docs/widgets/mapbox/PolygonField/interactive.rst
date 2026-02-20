Interactive Polygon Field Widget
================================

Preview
^^^^^^^

.. image:: /_static/images/mapbox_preview.png


Requirements
^^^^^^^^^^^^
**Access Token**: A Mapbox access token is required to use this widget. Please follow the instructions on the `MapBox Create Access Token <https://docs.mapbox.com/help/getting-started/access-tokens/>`_ page.


Key Features
^^^^^^^^^^^^

**Draw & Edit a Polygon:** The widget allows users to draw and edit a Polygon geometry on the map using Mapbox GL Draw.

**Place Autocomplete (Geocoding):** Built-in `Mapbox Geocoder <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding>`_ input for searching places.

**Use My Location Action:** Users can pan to their current location using the "Use My Location" action button.

**Auto Fit To Geometry:** The map view can automatically fit to the drawn/loaded polygon.


Settings
^^^^^^^^
``Default Settings``

.. code-block:: python

    MAP_WIDGETS = {
     "Mapbox": {
        "accessToken": "",
        "PolygonField": {
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

* **polygonFitPadding**: Padding (in pixels) used while fitting the map bounds to the Polygon. Default is ``40``.

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
        "PolygonField": {
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


    class AreaAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.PolygonField: {"widget": mapwidgets.MapboxPolygonFieldWidget}
        }


**Django Forms**

.. code-block:: python

    from django.contrib.gis import forms
    import mapwidgets


    class AreaForm(forms.ModelForm):
        area = forms.PolygonField(widget=mapwidgets.MapboxPolygonFieldWidget)

        class Meta:
            model = Area
            fields = ("name", "area")
            widgets = {
                "area": mapwidgets.MapboxPolygonFieldWidget,
            }


.. image:: /_static/images/mapbox_interactive.gif


Javascript Triggers
^^^^^^^^^^^^^^^^^^^

UI customization or event handling on the front-end can be managed using map widget jQuery triggers.

* **mapboxPolygonFieldWidget:polygonCreate**: Triggered when a polygon is created. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxPolygonFieldWidget:polygonChange**: Triggered when a polygon is changed. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxPolygonFieldWidget:polygonDelete**: Triggered when a polygon is deleted. (callback params: null, wrapElemSelector, djangoInput)

* **mapboxPolygonFieldWidget:placeChanged**: Triggered when the place in the autocomplete input is changed. (callback params: place, lat, lng, wrapElemSelector, djangoInput)

.. code-block:: javascript

    (function ($) {
        $(document).on("mapboxPolygonFieldWidget:polygonCreate", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxPolygonFieldWidget:polygonChange", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxPolygonFieldWidget:polygonDelete", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxPolygonFieldWidget:placeChanged", function (e, place, lat, lng, wrapElemSelector, djangoInput) {
            console.log(place, lat, lng);
        });
    })(jQuery)
