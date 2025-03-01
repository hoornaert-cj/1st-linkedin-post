// Initialize the map
var map = L.map('map').setView([43.6532, -79.3832], 11);

// Add tile layer
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=22685591-9232-45c7-a495-cfdf0e81ab86', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

var to_bdry;
fetch('data/to-boundary.geojson')
    .then(response => response.json())
    .then(data => {
        to_bdry = L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: feature.properties.color,
                    weight: 3
                };
            }
        }) .addTo(map);
        map.fitBounds(to_bdry.getBounds()); // Adjust the map view
    })
    .catch(error => console.error('Error loading GeoJSON for boundary lines:', error));
