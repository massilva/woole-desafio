(function () {
    'use strict';
    $(document).ready(function () {
        var map = L.map('mapa').setView([-13.0015785, -38.507568], 18),
            tileLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
                    maxZoom: 18
                }
            );
        tileLayer.addTo(map);
        var style = {color:'blue', opacity: 1.0, fillOpacity: 1.0, weight: 2, clickable: false};
        $.get("data/pontos.kml",function(data){
            var loader = new FileLoader(map, {
                fitBounds: true, 
                addToMap: true,
                layerOptions: {
                    style: style
                }
            });
            var layer = loader._convertToGeoJSON(data,"kml");
            window.setTimeout(function () {
                map.fitBounds(layer.getBounds());
            }, 500);
            console.log(layer);
        });
    });
}());
