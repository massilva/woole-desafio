(function () {
    'use strict';
    $(document).ready(function () {
        var map,
            tileLayer, layers, search, path,
            distanceMatrix = {},
            selected, countSelected = 0,
            icons = [
                L.icon({
                    iconUrl: 'css/images/bike-green.svg',
                    iconSize: [24, 24]
                }),
                L.icon({
                    iconUrl: 'css/images/race-flag.png',
                    shadowUrl: 'css/images/race-flag-shadow.png',
                    iconSize:     [32, 32],
                    shadowSize:   [32, 32]
                })
            ];

        //inicializa o mapa com a visão de salvador e no zoom max
        map = L.map('mapa').setView([-13.0015785, -38.507568], 18);

        //carrega o layout do mapa
        tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
            maxZoom: 18
        });
        tileLayer.addTo(map);

        path = new L.layerGroup();
        map.addLayer(path);

        //carrega os dados do kml
        layers = new L.KML("data/pontos.kml", {async: true});
        layers.on("loaded", function (e) {
            map.fitBounds(e.target.getBounds());
            search.limites[0] = layers.getLayers()[0];

            // Atualiza a matrix de distancia
            layers.eachLayer(function (source) {
                updateDistanceMatrix(source);
                source.on("click", function () {
                    this.closePopup();

                    if (search.limites.length == 2) {
                        var pos = countSelected % 2, initial;

                        if (!pos) {
                            path.eachLayer(function (layer) {
                                map.removeLayer(layer);
                            });
                        }

                        initial = pos === 0 ? search.limites[0] : selected;
                        dijktra(initial, this);

                        selected = this;
                        countSelected++;

                        if (countSelected % 2 === 0) {
                            dijktra(selected, search.limites[1]);
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
                    pos = search.count % 2, //0 partida, 1 chegada
                    marcador = L.marker(response.latlng, {icon: icons[pos]});

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
                search.limites[pos] = marcador;
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

        function dijktra(initial, selected) {

            var queue = [], path_distance = [],
                arr = Object.keys(distanceMatrix),
                predecessorOf = [],
                current, backTo, backMarker,
                top, v_source, adjacent, cost,
                i, idx;

            for(i = arr.length - 1; i >= 0; --i){
                path_distance[i] = Infinity;
                predecessorOf[i] = undefined;
            }
            path_distance[arr.indexOf("" + initial._leaflet_id)] = 0;

            //Algoritmo de dijktra
            queue.push(initial);
            while (queue.length) {
                top = queue.shift();
                v_source = Object.keys(distanceMatrix[top._leaflet_id]);
                for(i = v_source.length - 1; i >= 0; --i){
                    adjacent = v_source[i];
                    cost = distanceMatrix[top._leaflet_id][adjacent];
                    if(path_distance[arr.indexOf(adjacent)] > path_distance[arr.indexOf("" + top._leaflet_id)] + cost){
                        if(path_distance[arr.indexOf(adjacent)] != Infinity){
                            queue.splice(queue.indexOf(adjacent),1);
                        }
                        predecessorOf[arr.indexOf(adjacent)] = top._leaflet_id;
                        path_distance[arr.indexOf(adjacent)] = path_distance[arr.indexOf("" + top._leaflet_id)] + cost;
                        queue.push(layers.getLayer(adjacent));
                    }
                }
            }

            // Faz backtrack no dijktra desenhando o caminho
            current = selected;
            backTo = predecessorOf[arr.indexOf("" + current._leaflet_id)];
            while (backTo) {
                backMarker = layers.getLayer(backTo);
                path.addLayer(
                    new L.Polyline([current.getLatLng(), backMarker.getLatLng()], {
                        color: 'blue',
                        weight: 3,
                        opacity: 0.5,
                        smoothFactor: 1
                    })
                );
                current = backMarker;
                backTo = predecessorOf[arr.indexOf(""+current._leaflet_id)];
            }
        }

    });
}());
