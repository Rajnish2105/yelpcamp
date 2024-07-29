const map = L.map('map').setView(campground.coordinate, 10);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
}).addTo(map);

L.marker(campground.coordinate).addTo(map)
    .bindPopup(campground.title)
    .openPopup();
