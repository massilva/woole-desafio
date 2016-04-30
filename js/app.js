(function () {
    'use strict';
    $(document).ready(function () {
        var map,
            tileLayer,
            layers,
            search,
            distanceMatrix = {},
            leastDistanceList = {};

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

            // Atualiza a matrix de distancia
            layers.eachLayer(function (source) {
                updateDistanceMatrix(source);
                source.on("click", function () {
                    this.closePopup();
                });
            });

            // Atualiza a lista de menor distancia
            layers.eachLayer(function (source) {
                leastDistanceList[source._leaflet_id] = source._leaflet_id;
                layers.eachLayer(function (target) {
                    if (source !== target) {
                        if(distanceMatrix[source._leaflet_id][leastDistanceList[source._leaflet_id]] > distanceMatrix[source._leaflet_id][target._leaflet_id]) {
                            leastDistanceList[source._leaflet_id] = target._leaflet_id;
                        }
                    }
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
                circleLocation: false,
                markerLocation: false,
                autoType: false,
                autoCollapse: true,
                textPlaceholder: '',
                minLength: 2
            })
            .on("search_locationfound", function (response) {
                var id,
                    marcador = L.marker(response.latlng),
                    pos= search.count % 2; //0 partida, 1 chegada

                if (!pos) {
                    search.layer.eachLayer(function (layer) {
                        for  (id in distanceMatrix[layer._leaflet_id]) {
                            delete distanceMatrix[layer._leaflet_id][id];
                        }
                        delete distanceMatrix[layer._leaflet_id];
                        search.layer.removeLayer(layer);
                    });
                }

                search.count++;
                search.layer.addLayer(marcador);
                search.limites[pos] = response.latlng;
                $("#searchtext10").attr('placeholder', search.placeholders[pos ? 0 : 1]);

                layers.addLayer(marcador);
                updateDistanceMatrix(marcador);

            });

        map.addControl(search.control);
        $("#searchtext10").attr('placeholder', search.placeholders[0]);

        function updateDistanceMatrix(marcador) {
            var id, layer;
            distanceMatrix[marcador._leaflet_id] = {};
            for (id in distanceMatrix) {
                layer = layers.getLayer(id);
                distanceMatrix[id][marcador._leaflet_id] = layer === marcador ? Infinity : layer.getLatLng().distanceTo(marcador.getLatLng());
                distanceMatrix[marcador._leaflet_id][id] = distanceMatrix[id][marcador._leaflet_id];
            }
        }

    });
}());
