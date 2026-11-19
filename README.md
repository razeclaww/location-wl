# WL Food Delivery — Rider & Customer Dispatch System

A lightweight, zero-dependency web dispatch portal and customer location-sharing platform built for WL Food Delivery.

---

## Overview

When customers place orders via WhatsApp, Messenger, or phone, CSRs can quickly assign a delivery rider, generate a dedicated location verification link, and send it to the customer. When the customer opens the link, the webpage acquires high-accuracy GPS coordinates and generates an instant WhatsApp message directed to the assigned rider containing the Google Maps coordinates and landmark notes.

```
[ Customer Order ] 
        │
        ▼
[ CSR Portal: index.html ] ──▶ Assigns Rider (Name & +977 Phone)
        │
        ▼ (Generates Link)
[ Customer: location.html ] ──▶ Allows GPS Permission
        │
        ▼ (Sends via WhatsApp)
[ Assigned Delivery Rider ] ──▶ Receives exact Google Maps pin & landmark
```

---

## Features

- **Staff PIN Protection:** CSR dashboard is secured with staff PIN (`3693`). The PIN is hashed using SHA-256 (`c3574b...`) so it never appears in plaintext in the client source code.
- **Desktop-Optimized 3-Panel Layout:**
  - **Left Side:** Dispatch History list showing past orders, date and 12-hour timestamps (`Nov 19, 6:15 PM`), and one-click link copying.
  - **Center:** CSR Dispatch Desk with recent riders, locked `+977` prefix, and `DETAILS` field.
  - **Right Side:** Sideways slide-in animation revealing the generated URL and direct action buttons.
- **Permanent `+977` Prefix:** The country code `+977` is locked and protected against backspace and deletion.
- **Recent Riders Memory:** One-click rider pills auto-fill both the rider's name AND contact number simultaneously.
- **High-Accuracy Geolocation:** Queries device GPS (`enableHighAccuracy: true`) on the customer page with accuracy radius feedback.
- **Interactive Map Preview:** Embedded OpenStreetMap view confirms the captured pin before sending.
- **Direct WhatsApp Handoff:** Formats a pre-composed WhatsApp message addressed to the assigned rider's phone number containing the live Google Maps link and optional customer landmark notes.
- **Branded Design & Favicon:** Mobile-first layout featuring the official WL Food Delivery brand icon.
- **Creator Attribution:** Made by [razeclaw](https://razeclaw.vercel.app).

---

## File Structure

```
WL rider and customer/
├── index.html          # CSR dispatch and link generation portal
├── location.html       # Customer location acquisition and WhatsApp dispatch
├── favicon.png         # WL Food Delivery brand icon & favicon
├── css/
│   ├── style.css       # CSR portal stylesheet (desktop grid + sidebar + smooth animations)
│   └── location.css    # Customer portal stylesheet
├── js/
│   ├── app.js          # CSR auth, phone locking, history, and sideways link generator
│   └── location.js     # Geolocation and WhatsApp dispatch handler
└── README.md           # Documentation
```

---

## Getting Started

### Local Testing
You can open `index.html` directly in any web browser, or serve it locally using a static web server:

```bash
# Python 3
python -m http.server 3000

# or Node npx
npx serve .
```

### Accessing the Portal
1. Open `index.html`.
2. Enter the staff PIN: `3693`.
3. Fill in the rider's name, contact number (`+977...`), and order `DETAILS`.
4. Click **Generate Customer Link** — the result panel slides out sideways on the right!
5. Copy the link and send it to the customer on WhatsApp, Messenger, or SMS.
6. The customer taps **Detect My Current Location** and then **Send Location to Rider on WhatsApp**.

---

Co-authored by agy.
