<div style="display: flex; justify-content: center;">
  <picture>
    <source srcset="https://goal4u.netlify.app/assets/img/white-logo.png" media="(prefers-color-scheme: dark)">
    <img src="https://goal4u.netlify.app/assets/img/fav2.png" alt="Goal4U Logo" width="580" height="220">
  </picture>
</div>


**GOAL4U — The Home of Football**

[![Website](https://img.shields.io/badge/Live%20Site-Goal4U-green?style=for-the-badge&logo=netlify)](https://goal4u.netlify.app)  
Live football scores, match fixtures, streaming, and highlights — all in one place.


---

## 📖 Overview
Goal4U is a modern football streaming and live score platform. It aggregates **real-time match data**, **live video streams**, **fixtures**, and **team/player stats** for leagues like the **Premier League**, **La Liga**, **Bundesliga**, and more. The platform is optimized for both **desktop** and **mobile**, ensuring fans never miss a moment.

---

## 🎯 Key Features

- **Home Page** — Live match hero, top matches carousel, news headlines, highlight reels, and email signup.  
- **Live Hub** — Real-time scores, league filter, and instant "Watch Now" links.  
- **Match Details** — Video player, scoreboard with logos & stats, plus tabs for lineups, commentary, and live chat.  
- **Multiple TV** — Watch 2–4 matches at once with adjustable windows.  
- **Fixtures** — Calendar view with tabs (*Today*, *This Week*, *All*), plus search/filter.  
- **Leagues** — Banners, standings, fixtures, top scorers.  
- **Teams & Players** — Profiles with squads, results, history, and clips.  
- **Shorts / Reels** — TikTok-style feed with swipe and infinite scroll.  
- **About** — Platform mission & contact form.  
- **404 Page** — Friendly redirect back home.


---

## 📲 Mobile-First Features
- **Collapsible bottom navigation** for quick access.
- Optimized tap targets and vertical scrolling.
- Dynamic mobile footer for different page types.

---

## 📺 Live TV Page

A responsive live-streaming hub with:
- **Embedded video player** for instant match viewing.
- **Multiple providers** (Elixx, Sportzonline, Vivosoccer) loaded dynamically from JSON feeds.
- **Scrollable channel cards** — click to instantly switch streams.
- **Provider dropdown** to filter channels.
- **URL sharing** with encoded `stream` parameter.
- **Adaptive layout** for mobile & desktop viewing.
- **Ad & fullscreen hint** for better viewing experience.
- **Live match list** and **breaking live news** below the player for complete match context.

---

### 🖼 Screenshot

 <img src="https://goal4u.netlify.app/assets/img/stock/live-tv-ss.png" alt="Goal4U Screenshot" >


## 🛠 Tech Stack

| Technology        | Purpose                                      |
|-------------------|----------------------------------------------|
| React.js          | UI library                                   |
| React Router      | Page routing                                 |
| React Helmet Async| SEO meta management                          |
| Tailwind / CSS    | Styling and responsive layout                |
| Bootstrap 5       | Additional layout components                 |
| Slick Carousel    | Match & news carousels                       |
| jQuery Plugins    | Sticky header and sliders                    |
| Google Analytics  | Visitor tracking                             |
| Real-Time API     | Live match scores and stats                  |

---

## 📂 Project Structure
```
src/
├── components/ # Reusable UI components
├── pages/ # Page-specific components
├── services/ # API and analytics integrations
├── App.jsx # Main application entry point
├── main.jsx # React mount point
└── assets/ # Images, icons, styles
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```
git clone https://github.com/yourusername/goal4u.git
cd goal4u
```


## 2️⃣ Install Dependencies
```
npm install
```


## 3️⃣ Start the Development Server
```
npm run dev
```

Your app will be running at http://localhost:5173/.

## 📦 Build for Production

```
npm run build
```

Outputs to the *dist* folder — deploy to *Netlify*, *Vercel*, or your hosting provider.

## 🌐 Live Demo
Visit [**Goal4U**](https://goal4u.netlify.app)


*📜 License*
This project is licensed under the *MIT License* — free to use and modify.

*💡 Future Roadmap*
- User authentication for favorites & chat
- Dark mode toggle
- Push notifications for goals & events
- AI-powered match predictions

⚽ *GOAL4U — Because every moment matters.*


