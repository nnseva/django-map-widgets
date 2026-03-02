(function ($) {

    DjangoMapboxPolygonFieldWidget = DjangoMapPolygonWidgetBase.extend({

        init: function (options) {
            $.extend(this, options);

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
            this.geocoder.on('result', (place) => this.handleAutoCompletePlaceChange(place.result));

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

            // Capture initial interaction handler states so we can restore them after Mapbox Draw
            // temporarily disables map interactions during create/edit.
            this.captureMapInteractionState();

            // store
            $(this.mapElement).data('mwMapObj', this.map);
            $(this.mapElement).data('mwClassObj', this);
            this.addressAutoCompleteInput = $("input:first", "#" + this.geocoderWrapID);

            // bind draw events
            this.map.on('draw.create', this.handleDrawCreate.bind(this));
            this.map.on('draw.update', this.handleDrawUpdate.bind(this));
            this.map.on('draw.delete', this.handleDrawDelete.bind(this));
            this.map.on('draw.modechange', this.handleDrawModeChange.bind(this));

            // initial value
            if (this.djangoGeoJSONValue && this.djangoGeoJSONValue.geojson) {
                const initialGeom = this.djangoGeoJSONValue.geojson;
                if (initialGeom.type === 'Polygon') {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: initialGeom
                    };
                    const ids = this.draw.add(feature);
                    this.currentFeatureId = (ids && ids.length) ? ids[0] : null;
                    this.updateDjangoInput(initialGeom);
                    this.fitToPolygon(initialGeom);
                }
            } else if (this.djangoGeoJSONValue && this.djangoGeoJSONValue.type === 'Polygon') {
                // allow passing raw geometry
                const feature = {
                    type: 'Feature',
                    properties: {},
                    geometry: this.djangoGeoJSONValue
                };
                const ids = this.draw.add(feature);
                this.currentFeatureId = (ids && ids.length) ? ids[0] : null;
                this.updateDjangoInput(this.djangoGeoJSONValue);
                this.fitToPolygon(this.djangoGeoJSONValue);
            }
        },

        captureMapInteractionState: function () {
            if (!this.map) return;
            const handlers = [
                'dragPan',
                'scrollZoom',
                'boxZoom',
                'dragRotate',
                'keyboard',
                'doubleClickZoom',
                'touchZoomRotate'
            ];
            this._mwInteractionState = {};
            for (let i = 0; i < handlers.length; i++) {
                const handlerName = handlers[i];
                const handler = this.map[handlerName];
                if (handler && typeof handler.isEnabled === 'function') {
                    try {
                        this._mwInteractionState[handlerName] = handler.isEnabled();
                    } catch (e) {
                        // ignore
                    }
                }
            }
        },

        restoreMapInteractionState: function () {
            if (!this.map || !this._mwInteractionState) return;

            for (const handlerName in this._mwInteractionState) {
                if (!Object.prototype.hasOwnProperty.call(this._mwInteractionState, handlerName)) continue;
                const shouldBeEnabled = this._mwInteractionState[handlerName];
                const handler = this.map[handlerName];
                if (!handler) continue;

                try {
                    if (shouldBeEnabled && typeof handler.enable === 'function') {
                        handler.enable();
                    } else if (!shouldBeEnabled && typeof handler.disable === 'function') {
                        handler.disable();
                    }
                } catch (e) {
                    // ignore
                }
            }
        },

        deferRestoreMapInteractionState: function () {
            const restore = this.restoreMapInteractionState.bind(this);
            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(() => setTimeout(restore, 0));
            } else {
                setTimeout(restore, 0);
            }
        },

        handleDrawModeChange: function (e) {
            if (e && e.mode === 'simple_select') {
                this.deferRestoreMapInteractionState();
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

            const switchMode = () => {
                try {
                    this.draw.changeMode('simple_select');
                } catch (e) {
                    // ignore
                }
            };

            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(switchMode);
            } else {
                setTimeout(switchMode, 0);
            }

            this.deferRestoreMapInteractionState();
        },

        panTo: function (lat, lng) {
            if (!this.map) return;
            const center = [parseFloat(lng), parseFloat(lat)];
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
            this.currentFeatureId = null;
            if (this.geocoder) {
                this.geocoder.clear();
            }
        },

        handleDrawPolygonBtnClick: function () {
            const isActive = this.drawPolygonBtn.hasClass('active');
            this.drawPolygonBtn.toggleClass('active');

            if (!this.draw) return;

            if (!isActive) {
                // start drawing a new polygon (single geometry)
                this.draw.deleteAll();
                this.currentFeatureId = null;
                this.updateDjangoInput(null);
                this.draw.changeMode('draw_polygon');
            } else {
                this.draw.changeMode('simple_select');
                this.deferRestoreMapInteractionState();
            }
        },

        handleDrawCreate: function (e) {
            if (!e || !e.features || !e.features.length) return;

            const polygonFeatures = e.features.filter(f => f.geometry && f.geometry.type === 'Polygon');
            if (!polygonFeatures.length) return;

            const feature = polygonFeatures[polygonFeatures.length - 1];
            this.currentFeatureId = feature.id;

            const all = this.draw.getAll();
            if (all && all.features && all.features.length > 1) {
                const idsToDelete = all.features
                    .filter(f => f.id !== this.currentFeatureId)
                    .map(f => f.id);
                if (idsToDelete.length) {
                    this.draw.delete(idsToDelete);
                }
            }

            const geom = feature.geometry;
            const hadValue = !$.isEmptyObject(this.djangoGeoJSONValue);
            this.updateDjangoInput(geom);
            // Avoid surprising view jumps: fit only when the geometry is first created
            // (or when explicitly enabled for edits).
            if (!hadValue || this.mapOptions.fitBoundsOnEdit === true) {
                this.fitToPolygon(geom);
            }

            if (!hadValue) {
                $(document).trigger(this.polygonCreateTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);
            } else {
                $(document).trigger(this.polygonChangeTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);
            }

            this.finishDrawing();
        },

        handleDrawUpdate: function (e) {
            if (!e || !e.features || !e.features.length) return;

            const polygonFeatures = e.features.filter(f => f.geometry && f.geometry.type === 'Polygon');
            if (!polygonFeatures.length) return;

            const feature = polygonFeatures[polygonFeatures.length - 1];
            this.currentFeatureId = feature.id;
            const geom = feature.geometry;

            this.updateDjangoInput(geom);
            // Do not auto-fit after edits by default.
            if (this.mapOptions.fitBoundsOnEdit === true) {
                this.fitToPolygon(geom);
            }
            $(document).trigger(this.polygonChangeTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);

            this.deferRestoreMapInteractionState();
        },

        handleDrawDelete: function () {
            this.updateDjangoInput(null);
            $(document).trigger(this.polygonDeleteTriggerNameSpace, [null, this.wrapElemSelector, this.djangoInput]);
        },

        fitToPolygon: function (geojsonGeometry) {
            if (!this.map || !geojsonGeometry || !geojsonGeometry.coordinates || !geojsonGeometry.coordinates.length) {
                return;
            }

            // Polygon coordinates: [ [ [lng,lat], ... ] , [hole], ...]
            const rings = geojsonGeometry.coordinates;
            const firstRing = rings[0];
            if (!firstRing || !firstRing.length) return;

            let bounds = new mapboxgl.LngLatBounds(firstRing[0], firstRing[0]);
            for (let r = 0; r < rings.length; r++) {
                const ring = rings[r] || [];
                for (let i = 0; i < ring.length; i++) {
                    bounds.extend(ring[i]);
                }
            }

            const padding = this.mapOptions.polygonFitPadding || 40;
            this.map.fitBounds(bounds, {padding: padding, animate: this.mapboxOptions.animate || false});
        },

        handleAutoCompletePlaceChange: function (place) {
            if (!place || !place.geometry) {
                return;
            }
            const lng = place.geometry.coordinates[0];
            const lat = place.geometry.coordinates[1];
            this.panTo(lat, lng);
            $(document).trigger(this.placeChangedTriggerNameSpace,
                [place, lat, lng, this.wrapElemSelector, this.djangoInput]
            );
        },

    });

})(mapWidgets.jQuery);
