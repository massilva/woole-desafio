(function () {
    'use strict';
    $(document).ready(function () {
        var map,
            tileLayer,
            kmlLayer,
            search,
            adjacencyMatrix = {};

        //inicializa o mapa com a visão de salvador e no zoom max
        map = L.map('mapa').setView([-13.0015785, -38.507568], 18);

        //carrega o layout do mapa
        tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
            maxZoom: 18
        });
        tileLayer.addTo(map);

        //carrega os dados do kml
        kmlLayer = new L.KML("data/pontos.kml", {async: true});
        kmlLayer.on("loaded", function (e) {
            map.fitBounds(e.target.getBounds());
            kmlLayer.eachLayer(function (source) {
                adjacencyMatrix[source._leaflet_id] = {};
                kmlLayer.eachLayer(function (target) {
                    adjacencyMatrix[source._leaflet_id][target._leaflet_id] = source === target ? Infinity : source.getLatLng().distanceTo(target.getLatLng());
                });
            });
        });
        map.addLayer(kmlLayer);

        search = {
            layer: new L.layerGroup().addTo(map),
            control: {},
            limites: [],
            count: 0,
            placeholders: ['Partida...', 'Chegada...']
        };

        search.control =
            new L.Control.Search({
                url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                jsonpParam: 'json_callback',
                propertyName: 'display_name',
                propertyLoc: ['lat', 'lon'],
                circleLocation: true,
                markerLocation: false,
                autoType: false,
                autoCollapse: true,
                textPlaceholder: '',
                minLength: 2
            })
            .on("search_locationfound", function (response) {
                var pos = search.count % 2; //0 partida, 1 chegada
                if (!pos) {
                    search.layer.eachLayer(function (layer) {
                        search.layer.removeLayer(layer);
                    });
                }
                search.limites[pos] = response.latlng;
                search.layer.addLayer(L.marker(response.latlng));
                search.count++;
                $("#searchtext10").attr('placeholder', search.placeholders[pos ? 0 : 1]);
            });
        map.addControl(search.control);
        $("#searchtext10").attr('placeholder', search.placeholders[0]);

    });
}());
