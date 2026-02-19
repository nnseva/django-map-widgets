(function ($) {

    DjangoMapboxMultiPolygonFieldWidget = DjangoMapMultiPolygonWidgetBase.extend({

        init: function (options) {
            $.extend(this, options);

            var self = this;

            this.drawPolygonBtn.on("click", this.handleDrawPolygonBtnClick.bind(this));

            // Mapbox setup
            mapboxgl.accessToken = this.mapOptions.accessToken;
            this.mapboxSDK = new mapboxSdk({accessToken: this.mapOptions.accessToken});

            // map options
            this.mapboxOptions = this.mapOptions.mapOptions || {};
            this.mapboxOptions.container = this.mapElement.id;

            if (this.mapboxOptions.center) {
                // settings are [lat, lng] for historical consistency; Mapbox wants [lng, lat]
                this.mapboxOptions.center = [this.mapboxOptions.center[1], this.mapboxOptions.center[0]];
            }

            // geocoder options
            this.geocoderOptions = this.mapOptions.geocoderOptions || {};
            this.geocoderOptions.mapboxgl = mapboxgl;
            this.geocoderOptions.accessToken = mapboxgl.accessToken;
            if (!this.geocoderOptions.placeholder) {
                this.geocoderOptions.placeholder = this.geocoderInputPlaceholderText;
            }
            this.flyToEnabled = this.geocoderOptions.flyTo || false;
            this.geocoder = new MapboxGeocoder(this.geocoderOptions);
                this.geocoder.on('result', function (place) {
                    self.handleAutoCompletePlaceChange(place.result);
                });

            // draw options
            this.drawOptions = this.mapOptions.drawOptions || {};

            this.Super(options);
        },

        initializeMap: function () {
            this.map = new mapboxgl.Map(this.mapboxOptions);

            // add controls
            document.getElementById(this.geocoderWrapID).appendChild(this.geocoder.onAdd(this.map));
            if (this.mapOptions.showZoomNavigation) {
                this.map.addControl(new mapboxgl.NavigationControl());
            }

            this.draw = new MapboxDraw(Object.assign({
                displayControlsDefault: false,
                controls: {
                    polygon: false,
                    trash: false
                },
                defaultMode: 'simple_select'
            }, this.drawOptions));

            this.map.addControl(this.draw);

            // store
            $(this.mapElement).data('mwMapObj', this.map);
            $(this.mapElement).data('mwClassObj', this);
            this.addressAutoCompleteInput = $("input:first", "#" + this.geocoderWrapID);

            // bind draw events
            this.map.on('draw.create', this.handleDrawCreate.bind(this));
            this.map.on('draw.update', this.handleDrawUpdate.bind(this));
            this.map.on('draw.delete', this.handleDrawDelete.bind(this));

            // initial value
            var initialGeom = null;
            if (this.djangoGeoJSONValue && this.djangoGeoJSONValue.geojson) {
                initialGeom = this.djangoGeoJSONValue.geojson;
            } else if (this.djangoGeoJSONValue && this.djangoGeoJSONValue.type) {
                initialGeom = this.djangoGeoJSONValue;
            }

            if (initialGeom) {
                if (initialGeom.type === 'MultiPolygon') {
                    for (var i = 0; i < initialGeom.coordinates.length; i++) {
                        var polygonCoords = initialGeom.coordinates[i];
                        var feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Polygon',
                                coordinates: polygonCoords
                            }
                        };
                        this.draw.add(feature);
                    }
                    this.updateDjangoInput({type: 'MultiPolygon', coordinates: initialGeom.coordinates});
                    this.fitToMultiPolygon({type: 'MultiPolygon', coordinates: initialGeom.coordinates});
                } else if (initialGeom.type === 'Polygon') {
                    var feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: initialGeom
                    };
                    this.draw.add(feature);
                    var mp = {type: 'MultiPolygon', coordinates: [initialGeom.coordinates]};
                    this.updateDjangoInput(mp);
                    this.fitToMultiPolygon(mp);
                }
            }
        },

        finishDrawing: function () {
            if (!this.draw) return;

            if (this.drawPolygonBtn && this.drawPolygonBtn.hasClass('active')) {
                this.drawPolygonBtn.removeClass('active');
            }

            try {
                this.draw.changeMode('simple_select');
            } catch (e) {
                // ignore
            }

            var self = this;
            var switchMode = function () {
                try {
                    self.draw.changeMode('simple_select');
                } catch (e) {
                    // ignore
                }
            };

            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(switchMode);
            } else {
                setTimeout(switchMode, 0);
            }
        },

        panTo: function (lat, lng) {
            if (!this.map) return;
            var center = [parseFloat(lng), parseFloat(lat)];
            if (this.flyToEnabled) {
                this.map.flyTo({center: center});
            } else {
                this.map.jumpTo({center: center});
            }
        },

        clearGeometry: function () {
            if (this.draw) {
                this.draw.deleteAll();
            }
            if (this.geocoder) {
                this.geocoder.clear();
            }
        },

        collectMultiPolygonGeometry: function () {
            if (!this.draw) return null;

            var all = this.draw.getAll();
            var features = (all && all.features) ? all.features : [];
            var polygons = [];

            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                if (feature && feature.geometry && feature.geometry.type === 'Polygon') {
                    polygons.push(feature.geometry.coordinates);
                }
            }

            if (!polygons.length) {
                return null;
            }

            return {
                type: 'MultiPolygon',
                coordinates: polygons
            };
        },

        handleDrawPolygonBtnClick: function () {
            var isActive = this.drawPolygonBtn.hasClass('active');
            this.drawPolygonBtn.toggleClass('active');

            if (!this.draw) return;

            if (!isActive) {
                // start drawing a new polygon and append it to the multipolygon
                this.draw.changeMode('draw_polygon');
            } else {
                this.finishDrawing();
            }
        },

        handleDrawCreate: function () {
            var hadValue = !$.isEmptyObject(this.djangoGeoJSONValue);
            var mp = this.collectMultiPolygonGeometry();

            this.updateDjangoInput(mp);
            if (mp) {
                this.fitToMultiPolygon(mp);
            }

            if (!hadValue && mp) {
                $(document).trigger(this.multiPolygonCreateTriggerNameSpace, [mp, this.wrapElemSelector, this.djangoInput]);
            } else {
                $(document).trigger(this.multiPolygonChangeTriggerNameSpace, [mp, this.wrapElemSelector, this.djangoInput]);
            }

            this.finishDrawing();
        },

        handleDrawUpdate: function () {
            var mp = this.collectMultiPolygonGeometry();
            this.updateDjangoInput(mp);
            if (mp) {
                this.fitToMultiPolygon(mp);
            }
            $(document).trigger(this.multiPolygonChangeTriggerNameSpace, [mp, this.wrapElemSelector, this.djangoInput]);
        },

        handleDrawDelete: function () {
            var mp = this.collectMultiPolygonGeometry();

            if (mp) {
                this.updateDjangoInput(mp);
                this.fitToMultiPolygon(mp);
                $(document).trigger(this.multiPolygonChangeTriggerNameSpace, [mp, this.wrapElemSelector, this.djangoInput]);
            } else {
                this.updateDjangoInput(null);
                $(document).trigger(this.multiPolygonDeleteTriggerNameSpace, [null, this.wrapElemSelector, this.djangoInput]);
            }
        },

        fitToMultiPolygon: function (geojsonGeometry) {
            if (!this.map || !geojsonGeometry || geojsonGeometry.type !== 'MultiPolygon') {
                return;
            }

            var polygons = geojsonGeometry.coordinates || [];
            if (!polygons.length) return;

            var bounds = null;

            for (var p = 0; p < polygons.length; p++) {
                var rings = polygons[p] || [];
                for (var r = 0; r < rings.length; r++) {
                    var ring = rings[r] || [];
                    for (var i = 0; i < ring.length; i++) {
                        var lngLat = ring[i];
                        if (!lngLat || lngLat.length < 2) continue;
                        if (!bounds) {
                            bounds = new mapboxgl.LngLatBounds(lngLat, lngLat);
                        } else {
                            bounds.extend(lngLat);
                        }
                    }
                }
            }

            if (!bounds) return;

            var padding = this.mapOptions.polygonFitPadding || 40;
            this.map.fitBounds(bounds, {padding: padding, animate: this.mapboxOptions.animate || false});
        },

        handleAutoCompletePlaceChange: function (place) {
            if (!place || !place.geometry) {
                return;
            }
            var lng = place.geometry.coordinates[0];
            var lat = place.geometry.coordinates[1];
            this.panTo(lat, lng);
            $(document).trigger(this.placeChangedTriggerNameSpace,
                [place, lat, lng, this.wrapElemSelector, this.djangoInput]
            );
        },

    });

})(mapWidgets.jQuery);
