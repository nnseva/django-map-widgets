Interactive LineString Field Widget
===================================

Preview
^^^^^^^

.. image:: /_static/images/mapbox_preview.png


Requirements
^^^^^^^^^^^^
**Access Token**: A Mapbox access token is required to use this widget. Please follow the instructions on the `MapBox Create Access Token <https://docs.mapbox.com/help/getting-started/access-tokens/>`_ page.


Key Features
^^^^^^^^^^^^

**Draw & Edit a Line:** The widget allows users to draw and edit a LineString geometry on the map using Mapbox GL Draw.

**Place Autocomplete (Geocoding):** Built-in `Mapbox Geocoder <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding>`_ input for searching places.

**Use My Location Action:** Users can pan to their current location using the "Use My Location" action button.

**Auto Fit To Geometry:** The map view can automatically fit to the drawn/loaded line.


Settings
^^^^^^^^
``Default Settings``

.. code-block:: python

    MAP_WIDGETS = {
     "Mapbox": {
        "accessToken": "",
        "LineStringField": {
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
                "lineFitPadding": 40,
                "showZoomNavigation": True,
            },
        },
    }


* **accessToken**: `Mapbox Access Token <https://docs.mapbox.com/help/getting-started/access-tokens/>`_. (required)

* **mapOptions**: Mapbox `MapOptions <https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters>`_ parameters passed to the map initialization.

* **geocoderOptions**: `Mapbox Geocoder <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding>`_ option parameters. See the full list `here <https://docs.mapbox.com/mapbox-search-js/api/core/geocoding/#geocodingoptions>`_.

* **drawOptions**: Options passed to Mapbox GL Draw.

* **lineFitPadding**: Padding (in pixels) used while fitting the map bounds to the LineString. Default is ``40``.

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
        "LineStringField": {
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


    class RouteAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.LineStringField: {"widget": mapwidgets.MapboxLineStringFieldWidget}
        }


**Django Forms**

.. code-block:: python

    from django.contrib.gis import forms
    import mapwidgets


    class RouteForm(forms.ModelForm):
        path = forms.LineStringField(widget=mapwidgets.MapboxLineStringFieldWidget)

        class Meta:
            model = Route
            fields = ("name", "path")
            widgets = {
                "path": mapwidgets.MapboxLineStringFieldWidget,
            }


.. image:: /_static/images/mapbox_interactive.gif


Javascript Triggers
^^^^^^^^^^^^^^^^^^^

UI customization or event handling on the front-end can be managed using map widget jQuery triggers.

* **mapboxLineStringFieldWidget:lineCreate**: Triggered when a line is created. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxLineStringFieldWidget:lineChange**: Triggered when a line is changed. (callback params: geojsonGeometry, wrapElemSelector, djangoInput)

* **mapboxLineStringFieldWidget:lineDelete**: Triggered when a line is deleted. (callback params: null, wrapElemSelector, djangoInput)

* **mapboxLineStringFieldWidget:placeChanged**: Triggered when the place in the autocomplete input is changed. (callback params: place, lat, lng, wrapElemSelector, djangoInput)

.. code-block:: javascript

    (function ($) {
        $(document).on("mapboxLineStringFieldWidget:lineCreate", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxLineStringFieldWidget:lineChange", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxLineStringFieldWidget:lineDelete", function (e, geom, wrapElemSelector, djangoInput) {
            console.log(geom);
        });

        $(document).on("mapboxLineStringFieldWidget:placeChanged", function (e, place, lat, lng, wrapElemSelector, djangoInput) {
            console.log(place, lat, lng);
        });
    })(jQuery)
