# CinemaMatch — Frontend Web Application

A dark-themed cinematic movie and TV show discovery web application with watchlist management and live metadata search.

---

## 📁 Project Structure

```
CinemaMatch/
├── index.html                 # Main application entry point
├── server.js                  # Lightweight Node.js local dev server (zero dependencies)
├── css/
│   └── styles.css             # Cinematic dark styling, glow accents, and responsive layout
└── js/
    ├── app.js                 # Application bootstrap & view routing
    ├── state/
    │   └── store.js           # Central reactive state & localStorage manager
    ├── services/
    │   ├── api.js             # Public API integration (OMDb & TVMaze) + curated database
    │   └── recommendationEngine.js
    ├── data/
    │   └── curatedMedia.js    # Curated cinematic media collection
    └── components/
        ├── Sidebar.js         # Desktop left navigation sidebar
        ├── TopBar.js          # Desktop top search header
        ├── MobileHeader.js    # Mobile top branding & search toggle
        ├── BottomNav.js       # Mobile bottom 3-tab navigation bar
        ├── MediaCard.js       # Reusable movie/show card component
        ├── MediaModal.js      # Movie details modal dialog
        ├── Toast.js           # Feedback toast notifications
        └── views/
            ├── HomeView.js        # Home page with hero banner & featured titles
            ├── DiscoverView.js    # Search & discover with live API & genre filters
            └── WatchlistView.js   # Watchlist manager & empty state
```

---

## 🚀 How to Run Locally

### Option 1: Using Node.js (Recommended)
Open a terminal in this folder and run:
```bash
node server.js
```
Then open **`http://localhost:3000`** in your web browser.

---

### Option 2: Using Python
```bash
python -m http.server 3000
```
Then open **`http://localhost:3000`** in your web browser.

---

### Option 3: Using VS Code Live Server
1. Open this `CinemaMatch` folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.
