(function ($) {

    DjangoMapboxLineStringFieldWidget = DjangoMapLineStringWidgetBase.extend({

        init: function (options) {
            $.extend(this, options);

            this.drawLineBtn.on("click", this.handleDrawLineBtnClick.bind(this));

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
                    line_string: false,
                    trash: false
                },
                defaultMode: 'simple_select'
            }, this.drawOptions));

            this.map.addControl(this.draw);

            // Capture the initial interaction handler states (dragPan, scrollZoom, etc.) so we can
            // restore them after Mapbox Draw temporarily disables interactions during edit.
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
                if (initialGeom.type === 'LineString') {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: initialGeom
                    };
                    const ids = this.draw.add(feature);
                    this.currentFeatureId = (ids && ids.length) ? ids[0] : null;
                    this.updateDjangoInput(initialGeom);
                    this.fitToLine(initialGeom);
                }
            } else if (this.djangoGeoJSONValue && this.djangoGeoJSONValue.type === 'LineString') {
                // allow passing raw geometry
                const feature = {
                    type: 'Feature',
                    properties: {},
                    geometry: this.djangoGeoJSONValue
                };
                const ids = this.draw.add(feature);
                this.currentFeatureId = (ids && ids.length) ? ids[0] : null;
                this.updateDjangoInput(this.djangoGeoJSONValue);
                this.fitToLine(this.djangoGeoJSONValue);
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
            // When leaving Draw modes, ensure map interactions (especially dragPan) are restored.
            if (e && e.mode === 'simple_select') {
                this.deferRestoreMapInteractionState();
            }
        },

        finishDrawing: function () {
            if (!this.draw) return;

            if (this.drawLineBtn && this.drawLineBtn.hasClass('active')) {
                this.drawLineBtn.removeClass('active');
            }

            // Mapbox Draw can keep draw_line_string "alive" until the next tick;
            // switching mode again on the next frame prevents the dangling preview
            // segment from last vertex to mouse cursor.
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

            // Some Mapbox Draw interaction handlers can leave dragPan disabled if mode switches
            // happen inside draw event callbacks. Restore interaction state after the mode switch.
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

        handleDrawLineBtnClick: function () {
            // toggle draw mode
            const isActive = this.drawLineBtn.hasClass('active');
            this.drawLineBtn.toggleClass('active');

            if (!this.draw) return;

            if (!isActive) {
                // start drawing a new line (single geometry)
                this.draw.deleteAll();
                this.currentFeatureId = null;
                this.updateDjangoInput(null);
                this.draw.changeMode('draw_line_string');
            } else {
                // back to select mode
                this.draw.changeMode('simple_select');
                this.deferRestoreMapInteractionState();
            }
        },

        handleDrawCreate: function (e) {
            if (!e || !e.features || !e.features.length) return;

            // keep only the last LineString
            const lineFeatures = e.features.filter(f => f.geometry && f.geometry.type === 'LineString');
            if (!lineFeatures.length) return;

            const feature = lineFeatures[lineFeatures.length - 1];
            this.currentFeatureId = feature.id;

            // if multiple features exist in draw store, keep only currentFeatureId
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
                this.fitToLine(geom);
            }

            if (!hadValue) {
                $(document).trigger(this.lineCreateTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);
            } else {
                $(document).trigger(this.lineChangeTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);
            }

            // leave draw mode after finishing the line
            this.finishDrawing();
        },

        handleDrawUpdate: function (e) {
            if (!e || !e.features || !e.features.length) return;

            const lineFeatures = e.features.filter(f => f.geometry && f.geometry.type === 'LineString');
            if (!lineFeatures.length) return;

            const feature = lineFeatures[lineFeatures.length - 1];
            this.currentFeatureId = feature.id;
            const geom = feature.geometry;

            this.updateDjangoInput(geom);
            // Do not auto-fit after edits by default. This prevents the map from snapping back
            // to the geometry bounds after the user pans/zooms while editing.
            if (this.mapOptions.fitBoundsOnEdit === true) {
                this.fitToLine(geom);
            }
            $(document).trigger(this.lineChangeTriggerNameSpace, [geom, this.wrapElemSelector, this.djangoInput]);

            // Vertex drag/edit can temporarily disable map dragPan; ensure it is restored after update.
            this.deferRestoreMapInteractionState();
        },

        handleDrawDelete: function (e) {
            this.updateDjangoInput(null);
            $(document).trigger(this.lineDeleteTriggerNameSpace, [null, this.wrapElemSelector, this.djangoInput]);
        },

        fitToLine: function (geojsonGeometry) {
            if (!this.map || !geojsonGeometry || !geojsonGeometry.coordinates || !geojsonGeometry.coordinates.length) {
                return;
            }
            const coords = geojsonGeometry.coordinates;
            let bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);
            for (let i = 1; i < coords.length; i++) {
                bounds.extend(coords[i]);
            }
            const padding = this.mapOptions.lineFitPadding || 40;
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
