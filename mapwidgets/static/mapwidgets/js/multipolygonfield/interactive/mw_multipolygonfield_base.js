(function ($) {
    DjangoMapMultiPolygonWidgetBase = $.Class.extend({

        init: function (options) {
            $.extend(this, options);
            this.deleteBtn.on("click", this.resetMap.bind(this));
            this.myLocationBtn.on("click", this.handleMyLocationBtnClick.bind(this));

            // if the field is in a collapsed Django admin fieldset, re-init when expanded
            if ($(this.wrapElemSelector).closest('.module.collapse').length) {
                $(document).on('show.fieldset', this.initializeMap.bind(this));
            }

            this.initializeMap.bind(this)();
            this.djangoInput.data('mwMapObj', this.map);
            this.djangoInput.data('mwClassObj', this);
        },

        initializeMap: function () {
            console.warn("Implement initializeMap method.");
        },

        enableClearBtn: function () {
            this.deleteBtn.removeClass("mw-btn-default disabled").addClass("mw-btn-danger");
        },

        disableClearBtn: function () {
            this.deleteBtn.removeClass("mw-btn-danger").addClass("mw-btn-default disabled");
        },

        showOverlay: function () {
            this.loaderOverlayElem.removeClass("hide")
        },

        hideOverlay: function () {
            this.loaderOverlayElem.addClass("hide")
        },

        resetMap: function () {
            if (!$.isEmptyObject(this.djangoGeoJSONValue)) {
                this.djangoInput.val("");
                this.disableClearBtn();
                $(document).trigger(this.multiPolygonDeleteTriggerNameSpace,
                    [this.djangoGeoJSONValue, this.wrapElemSelector, this.djangoInput]
                );
                this.djangoGeoJSONValue = null;
                if (this.clearGeometry) {
                    this.clearGeometry();
                }
            }
        },

        updateDjangoInput: function (geojsonGeometry) {
            if (geojsonGeometry) {
                this.djangoInput.val(JSON.stringify(geojsonGeometry));
                this.djangoGeoJSONValue = geojsonGeometry;
                this.enableClearBtn();
            } else {
                this.djangoInput.val("");
                this.djangoGeoJSONValue = null;
                this.disableClearBtn();
            }
        },

        handleMyLocationBtnClick: function () {
            this.showOverlay();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    this.handleCurrentPosition.bind(this),
                    this.handlecurrentPositionError.bind(this)
                );
            } else {
                this.handlecurrentPositionError();
            }
        },

        handleCurrentPosition: function (location) {
            this.hideOverlay();
            if (this.panTo) {
                this.panTo(location.coords.latitude, location.coords.longitude);
            }
        },

        handlecurrentPositionError: function () {
            this.hideOverlay();
            alert("Your location could not be found.");
        },
    });

})(mapWidgets.jQuery);
