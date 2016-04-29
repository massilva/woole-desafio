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

        var kmlLayer = new L.KML("data/pontos.kml", {async: true});
        kmlLayer.on("loaded", function(e) {
          map.fitBounds(e.target.getBounds());
        });
        map.addLayer(kmlLayer);

    });
}());
