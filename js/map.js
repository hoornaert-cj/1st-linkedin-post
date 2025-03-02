// Initialize the map
var map = L.map('map');

// Add tile layer
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=22685591-9232-45c7-a495-cfdf0e81ab86', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

// Ensure this function exists and returns style data based on zoom level
function styleBoundary(zoom) {
    if (zoom < 12) {
        return { color: "#0A2342", weight: 1.5, opacity: 0.5, lineJoin: 'round', lineCap: 'round' };
    } else {
        return { color: "#292E1E", weight: 2.5, opacity: 0.85, dashArray: '10, 10' };
    }
}

// Define a function to get the appropriate icon based on rank
function getIcon(rank) {
    let iconPath;
    let iconSize = [50, 50];

    if (rank === 1) {
        iconPath = 'images/first-place.svg';
    } else if (rank === 2) {
        iconPath = 'images/second-place.svg';
    } else if (rank === 3) {
        iconPath = 'images/third-place.svg';
    } else if (rank === 4) {
        iconPath = 'images/fourth-place.svg';
    } else if (rank === 5) {
        iconPath = 'images/fifth-place.svg';
    } else {
        iconPath = 'images/other-stations.svg';
        iconSize = [25, 25];
    }

    return L.icon({
        iconUrl: iconPath,
        iconSize: iconSize, // Adjust size
        iconAnchor: [iconSize[0] / 2, iconSize[1] / 2], // Center the icon
        popupAnchor: [0, -iconSize[1] / 2], // Position popup correctly
    });
}

// Load GeoJSON for the boundary lines
fetch('data/to-boundary-v3.geojson')
    .then(response => response.json())
    .then(data => {
        // Add GeoJSON layer to the map
        var to_bdry = L.geoJSON(data, {
            style: function() {
                return styleBoundary(map.getZoom()); // Apply style based on current zoom level
            }
        }).addTo(map);

        // Dynamically update the style when zoom changes
        map.on('zoomend', function() {
            to_bdry.setStyle(styleBoundary(map.getZoom())); // Adjust style on zoom
        });

        // Now fit the map bounds to the GeoJSON layer's bounds after it's added
        map.fitBounds(to_bdry.getBounds());
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

//add the subway stations
// Define two separate layers
let rankedStationsLayer = L.layerGroup();
let otherStationsLayer = L.layerGroup();

// Fetch and process the GeoJSON
fetch('data/to-subway-stations.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                let rank = feature.properties.rank;
                let marker = L.marker(latlng, { icon: getIcon(rank) });

                // Add to the appropriate layer
                if (rank >= 1 && rank <= 5) {
                    rankedStationsLayer.addLayer(marker);
                } else {
                    otherStationsLayer.addLayer(marker);
                }

                return marker;
            }
        });

        // Add ranked stations to the map immediately
        rankedStationsLayer.addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// Control visibility based on zoom level
map.on("zoomend", function() {
    if (map.getZoom() >= 14) {
        // Show other-stations at zoom level 14 and higher
        if (!map.hasLayer(otherStationsLayer)) {
            map.addLayer(otherStationsLayer);
        }
    } else {
        // Hide other-stations when zoomed out
        if (map.hasLayer(otherStationsLayer)) {
            map.removeLayer(otherStationsLayer);
        }
    }
});


