const map = L.map('cluster-map').setView([39.7392, -104.9903], 4);
// Add a tile layer (you can use any Tile Layer URL or service)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
}).addTo(map);

// Initialize the marker cluster group
const markers = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let color = '#6EACDA';
        let size = 25;
        if (count > 10 && count <= 25) {
            color = '#135479';
            size = 35;
        } else if (count > 25 && count <= 50) {
            color = '#0A496D';
            size = 45;
        }

        const iconHtml = `<div class="custom-cluster-icon" style="background-color: ${color}; width: ${size}px; height: ${size}px;">${count}</div>`;
        return L.divIcon({
            html: iconHtml,
            className: 'custom-cluster-icon-wrapper',
            iconSize: L.point(size, size)
        });
    }
});

// Add the marker cluster group to the map
map.addLayer(markers);

// Add markers to the cluster group
campgrounds.forEach(campground => {
    const marker = L.marker(campground.coordinate)
        .bindPopup(campground.linkToCamp);
    markers.addLayer(marker);
});