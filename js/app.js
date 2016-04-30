(function () {
    'use strict';
    $(document).ready(function () {
        var map,
            tileLayer,
            layers,
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
        layers = new L.KML("data/pontos.kml", {async: true});
        layers.on("loaded", function (e) {
            map.fitBounds(e.target.getBounds());
            layers.eachLayer(function (source) {
                updateAdjancyMatrix(source);
                source.on("click", function () {
                    this.closePopup();
                });
            });
        });
        map.addLayer(layers);

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
                var marcador = L.marker(response.latlng),
                    pos= search.count % 2; //0 partida, 1 chegada

                if (!pos) {
                    search.layer.eachLayer(function (layer) {
                        search.layer.removeLayer(layer);
                    });
                }

                search.count++;
                search.limites[pos] = response.latlng;
                $("#searchtext10").attr('placeholder', search.placeholders[pos ? 0 : 1]);

                layers.addLayer(marcador);
                updateAdjancyMatrix(marcador);

            });

        map.addControl(search.control);
        $("#searchtext10").attr('placeholder', search.placeholders[0]);

        //Atualiza matrix de adjacencia
        function updateAdjancyMatrix(marcador) {
            var id, layer;
            adjacencyMatrix[marcador._leaflet_id] = {};
            for (id in adjacencyMatrix) {
                layer = layers.getLayer(id);
                adjacencyMatrix[id][marcador._leaflet_id] = layer === marcador ? Infinity : layer.getLatLng().distanceTo(marcador.getLatLng());
                adjacencyMatrix[marcador._leaflet_id][id] = adjacencyMatrix[id][marcador._leaflet_id];
            }
        }

    });
}());
