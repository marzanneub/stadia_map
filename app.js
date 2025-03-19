// Load environment variables (if using a backend or bundler like Webpack)
// require('dotenv').config(); // Uncomment if using Node.js

// Initialize the map
var map = L.map('map').setView([24.8949, 91.8687], 13); // Sylhet City coordinates

// Add Stadia Maps tile layer
const stadiaMapsApiKey = process.env.STADIA_MAPS_API_KEY || 'your_stadia_maps_api_key_here'; // Fallback for local testing
L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png?api_key=${stadiaMapsApiKey}`, {
  attribution: '© Stadia Maps',
}).addTo(map);

// Variables to store the user's location and parking lot markers
var userMarker = null;
var parkingMarkers = [];
var routingControl = null;

// Function to get the user's current location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;

        // Remove the previous user marker if it exists
        if (userMarker) {
          map.removeLayer(userMarker);
        }

        // Add a marker for the user's location
        userMarker = L.marker([userLat, userLng], { draggable: true }).addTo(map);
        userMarker.bindPopup('Your Location').openPopup();

        // Center the map on the user's location
        map.setView([userLat, userLng], 13);

        // Generate random parking lots near the user's location
        generateParkingLots(userLat, userLng);
      },
      function (error) {
        alert('Error getting your location: ' + error.message);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Function to generate random parking lots near the user's location
function generateParkingLots(userLat, userLng) {
  // Clear previous parking lot markers
  parkingMarkers.forEach((marker) => map.removeLayer(marker));
  parkingMarkers = [];

  // Generate 5 random parking lots within 2 km of the user's location
  for (var i = 0; i < 5; i++) {
    var offsetLat = (Math.random() - 0.5) * 0.02; // Random offset for latitude
    var offsetLng = (Math.random() - 0.5) * 0.02; // Random offset for longitude

    var parkingLat = userLat + offsetLat;
    var parkingLng = userLng + offsetLng;

    // Add a marker for the parking lot
    var parkingMarker = L.marker([parkingLat, parkingLng]).addTo(map);
    parkingMarker.bindPopup('Parking Lot ' + (i + 1)).openPopup();

    // Add click event to show route to the parking lot
    parkingMarker.on('click', function (e) {
      if (userMarker) {
        showRoute(userMarker.getLatLng(), e.latlng);
      }
    });

    parkingMarkers.push(parkingMarker);
  }
}

// Function to show the route between two points
function showRoute(from, to) {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [from, to],
    routeWhileDragging: true,
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
    }),
  }).addTo(map);
}

// Function to clear the route and markers
function clearRoute() {
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  parkingMarkers.forEach((marker) => map.removeLayer(marker));
  parkingMarkers = [];
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}

// Add event listener to the "Get My Location" button
document.getElementById('get-location').addEventListener('click', getLocation);

// Add event listener to the "Clear Route" button
document.getElementById('clear-route').addEventListener('click', clearRoute);