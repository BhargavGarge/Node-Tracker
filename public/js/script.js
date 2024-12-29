const socket = io();

// Check if geolocation is supported
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);

      // Send location to the server
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

// Store markers for each user
const markers = {};

// Handle incoming location data from the server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // Center the map on the new location
  map.setView([latitude, longitude], 15);

  // Update or create a marker for the user
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]); // Update existing marker
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map); // Add new marker
  }
});

socket.on("disconnect", (id) => {
  if (markers[id]) {
    map.removeLayers(markers[id]);
    delete markers[id];
  }
});
