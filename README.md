# Woole-desafio

## Uso

Para traçar a rota que passa por dois pontos selecionados o usuário tem que buscar o endereço de partida e chegada, que será representado pelos icones de uma bicicleta e uma bandeira, respectivamente. Após escolher os pontos de partida e chegada o usuário deve selecionar o ponto por onde desejar passar a rota.

## Implementação

Inicialmente, pensou-se em implementar uma solução simplificada utilizando uma lista contendo as menores distancias para cada ponto, juntamente com a matriz de adjancencia `distanceMatrix`. A matriz de adjancencia contém as distancias entre os pontos.

Mas observou-se que a lista não ajudaria na implementação e tinha a necessidade de se tirar os ciclos do grafo.

Por isso, utilizou-se o algoritmo de dijktra para encontrar o menor caminho juntamente com backtrack para que fosse possível desenhar o menor caminho no mapa.

Pelo fato de ser um grafo completo, não há restrição por qual ponto pode-se passar. Com isto, este algoritmo se faz desnecessário. Uma vez que ir para o ponto, que se deseja passar, diretamente é sempre menos custoso, ou no máximo igual, do que passar por algum outro ponto.

### Buscar endereço

Para a busca do endereço foi utilizado o plugin [Leaflet Search](https://github.com/stefanocudini/leaflet-search) utilizando [Nominatim](https://nominatim.openstreetmap.org/) como provedor dos endereços.

### KML

Para ler os dados do KML foi utilizado o plugin [Leaflet KML](http://harrywood.co.uk/maps/examples/leaflet/kml.view.html).
Ao carregar o KML é feito o cálculo das distancias entre os pontos carregados.

### Algoritmo menor caminho

Utilizou-se uma adaptação do algoritmo de dijktra implementado em [Algorithm](https://github.com/massilva/massilva.github.io/blob/master/graph.io/js/algorithm.js) que é utilizado em [Graph.io](https://massilva.github.io/graph.io/).

## Tecnologias

- HTML
- CSS
- Javascript
- Gulp
- Less
- JSLint
