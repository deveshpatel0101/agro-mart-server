self.addEventListener('install', function(event) {
    console.log("Installing service worker...", event);
});

self.addEventListener('activate', function(event) {
    console.log("Service worker activating...", event);
});

self.addEventListener('fetch', function(event) {
    console.log("Fetch event triggered...");
});