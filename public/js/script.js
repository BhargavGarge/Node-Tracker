const socket = io();

// Check if geolocation is supported
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      console.log("Sending your location:", latitude, longitude);

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
} else {
  alert("Geolocation is not supported by your browser.");
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

// Store markers for each user
const markers = {};

// Track the current user's socket ID
let currentUserId = null;

// Receive the current user's socket ID from the server
socket.on("current-user", (id) => {
  console.log("Your socket ID:", id);
  currentUserId = id;
});

// Handle incoming location data from the server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // Highlight the current user's marker differently
  if (id === currentUserId) {
    console.log("Updating your location on the map");
    if (markers[id]) {
      markers[id].setLatLng([latitude, longitude]); // Update existing marker
    } else {
      markers[id] = L.marker([latitude, longitude], { color: "blue" }).addTo(map); // Add new marker for the current user
    }
  } else {
    console.log("Updating another user's location on the map");
    if (markers[id]) {
      markers[id].setLatLng([latitude, longitude]); // Update existing marker
    } else {
      markers[id] = L.marker([latitude, longitude]).addTo(map); // Add new marker for another user
    }
  }
});

// Remove markers for disconnected users
socket.on("user-disconnect", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]); // Remove the marker from the map
    delete markers[id]; // Delete the marker from the storage
    console.log("Removed marker for disconnected user:", id);
  }
});
