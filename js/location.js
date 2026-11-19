let currentCoords = null;
let riderName = "Delivery Rider";
let riderPhone = "";
let orderDetails = "";

window.addEventListener("DOMContentLoaded", () => {
  initParams();
});

function initParams() {
  const params = new URLSearchParams(window.location.search);
  riderName = params.get("r") ? decodeURIComponent(params.get("r")).trim() : "Delivery Rider";
  riderPhone = params.get("p") ? params.get("p").replace(/[^0-9]/g, "") : "";
  orderDetails = params.get("order") || params.get("details") ? decodeURIComponent(params.get("order") || params.get("details")).trim() : "";

  document.getElementById("riderNameDisplay").textContent = riderName;
  document.getElementById("riderAvatar").textContent = riderName.charAt(0).toUpperCase() || "R";

  const orderBadge = document.getElementById("orderBadgeDisplay");
  if (orderDetails) {
    orderBadge.textContent = "Details: " + orderDetails;
    orderBadge.classList.remove("hidden");
  }

  if (!riderPhone) {
    const errorBox = document.getElementById("generalError");
    errorBox.textContent = "No rider phone number found in this link. Please request a new link from our CSR.";
    errorBox.classList.remove("hidden");
    document.getElementById("locateBtn").disabled = true;
  }
}

function requestLocation() {
  const loading = document.getElementById("statusLoading");
  const errorBox = document.getElementById("statusError");
  const resultBox = document.getElementById("locationConfirmed");
  const locateBtn = document.getElementById("locateBtn");

  errorBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  loading.classList.remove("hidden");
  locateBtn.disabled = true;

  if (!navigator.geolocation) {
    loading.classList.add("hidden");
    locateBtn.disabled = false;
    showError("Geolocation is not supported by your browser. Please open this link in Chrome or Safari.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      loading.classList.add("hidden");
      locateBtn.disabled = false;

      currentCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy)
      };

      displayConfirmedLocation(currentCoords);
    },
    (err) => {
      loading.classList.add("hidden");
      locateBtn.disabled = false;

      let msg = "Could not retrieve your location.";
      if (err.code === 1) {
        msg = "Location access was denied. Please allow location permissions in your browser settings to continue.";
      } else if (err.code === 2) {
        msg = "Location unavailable. Please make sure GPS is turned on and try again.";
      } else if (err.code === 3) {
        msg = "Location request timed out. Please check your signal and tap Detect again.";
      }
      showError(msg);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

function displayConfirmedLocation(coords) {
  document.getElementById("latDisplay").textContent = coords.lat.toFixed(6);
  document.getElementById("lngDisplay").textContent = coords.lng.toFixed(6);
  document.getElementById("accuracyDisplay").textContent = `Accuracy: within ±${coords.accuracy} meters`;

  const delta = 0.003;
  const bbox = `${coords.lng - delta}%2C${coords.lat - delta}%2C${coords.lng + delta}%2C${coords.lat + delta}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
  document.getElementById("mapIframe").src = iframeSrc;

  const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  document.getElementById("viewMapsBtn").href = mapsUrl;

  document.getElementById("locationConfirmed").classList.remove("hidden");
  document.getElementById("locateBtn").textContent = "Update / Re-detect Location";
}

function sendLocationToWhatsApp() {
  if (!currentCoords) return;

  const landmarkInput = document.getElementById("landmarkInput");
  const landmark = landmarkInput ? landmarkInput.value.trim() : "";
  const mapsLink = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;

  let message = `*WL Food Delivery - Customer Location*\n\n`;
  message += `👤 *Rider:* ${riderName}\n`;
  if (orderDetails) {
    message += `📝 *Details:* ${orderDetails}\n`;
  }
  message += `📍 *Exact Location Link:*\n${mapsLink}\n\n`;
  message += `🎯 *GPS Accuracy:* ±${currentCoords.accuracy} meters\n`;
  if (landmark) {
    message += `🏠 *Landmark / Note:* ${landmark}\n`;
  }
  message += `\nDelivering with WL Food Delivery.`;

  const waUrl = `https://wa.me/${riderPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
}

function showError(msg) {
  const errorBox = document.getElementById("statusError");
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}
