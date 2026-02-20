VERSION = (0, 5, 2)
__version__ = ".".join(map(str, VERSION))

from .widgets import (
    GoogleMapPointFieldInlineWidget,
    GoogleMapPointFieldStaticWidget,
    GoogleMapPointFieldWidget,
    LeafletPointFieldWidget,
    MapboxLineStringFieldWidget,
    MapboxMultiPolygonFieldWidget,
    MapboxPointFieldStaticWidget,
    MapboxPointFieldWidget,
    MapboxPolygonFieldWidget,
)

__all__ = [
    "GoogleMapPointFieldWidget",
    "GoogleMapPointFieldInlineWidget",
    "GoogleMapPointFieldStaticWidget",
    "MapboxPointFieldWidget",
    "MapboxPointFieldStaticWidget",
    "MapboxLineStringFieldWidget",
    "MapboxPolygonFieldWidget",
    "MapboxMultiPolygonFieldWidget",
    "LeafletPointFieldWidget",
]
