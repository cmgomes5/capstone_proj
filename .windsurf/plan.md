# Dungeons & Dragons Combat Companion Web App – Application Plan

## 1. Overview
- **Purpose:** Single-user DM tool for managing combat encounters visually.  
- **Features:**  
  - Visual token board  
  - Initiative tracking  
  - Token management  
  - Ephemeral and saved encounters  
- **Platform:** Desktop web app only.  
- **Framework:** React frontend, RESTful backend, containerized with Docker, deployable via Kubernetes.

---

## 2. Frontend

### 2.1 General
- **State Management:** React built-in state/hooks.  
- **UI Framework:** Component library (e.g., Tailwind).  
- **Interaction:** Mouse/touch only; no keyboard shortcuts.

### 2.2 Layout

#### Left Sidebar – Initiative List
- Displays tokens **with HP > 0 only**, in **descending initiative order**.  
- Automatically reorders when new tokens are added.  
- Top-of-turn token: **slightly larger**, highlighted with **yellow border/glow**.  
- Navigation: forward/back **wraps around** and is **always visible**.  
- Display info: **picture only**, no name or health.

#### Center Board
- Displays **all tokens** in the current encounter.  
- **Friendlies:** top rows; **Enemies:** bottom rows.  
- Tokens arranged in **centered rows**, **evenly spaced**, wrap dynamically to fit all tokens.  
- Token size **scales dynamically** based on available space.  
- Displays **name and health** always.  
- Current-turn token highlighted with **yellow border/glow**.  
- Dead tokens (0 HP): tinted red with a red X overlay; **instant update, no animation**.  
- No drag-and-drop; positions are fixed.  
- Initiative numbers **not displayed**.

### 2.3 Tokens
- **Name:** wraps/multiline; letters, numbers, basic punctuation only.  
- **Picture:** solid white background; 256×256 px; cropping tool enforces square aspect ratio; zoom/pan allowed.  
- **Health:** solid red bar with percentage + numeric overlay; editable by clicking directly; updates instantly.  
- **Type:** friendly/enemy.  
- **Initiative:** numeric.  
- **Editing:** all tokens editable at any time.  

**Adding Tokens**
- Overlay submenu appears **on top of the board**.  
- Fetches all token templates in a **searchable grid**.  
- Allows creation of **ephemeral custom tokens** with validation:  
  - Name non-empty  
  - Health positive integer  
  - Picture cropped to 256×256 px  
- Newly added tokens automatically appear in **correct initiative position**.

---

## 3. Backend

### 3.1 Database
- Stores: **token templates**, **saved encounters**, **token images**.  
- Token templates initially empty; ephemeral custom tokens **not saved**.  
- Token images stored **directly in the database** as binary data.

### 3.2 API (RESTful)
- **Tokens:**  
  - GET `/tokens`  
  - POST `/tokens`  
  - PUT `/tokens/:id`  
  - DELETE `/tokens/:id`  
- **Encounters:**  
  - GET `/encounters`  
  - POST `/encounters`  
  - PUT `/encounters/:id`  
  - DELETE `/encounters/:id`  
  - Load behavior: **replace session after confirmation prompt**.

---

## 4. Encounters
- **Ephemeral:** persist while navigating in-app; lost on browser refresh.  
- **Saved:** multiple encounters; manual save only; editable names; arbitrary order; automatically highlight top token on load.  
- **Initiative list behavior:** remove tokens with HP = 0; forward/back wraps around.  
- **Turn navigation:** manual only.

---

## 5. Deployment
- **Containers:** separate for frontend and backend.  
- **Local development:** Docker + Tilt; auto rebuild/reload.  
- **Production:** Kubernetes (k3d/k3s initially; eventually EKS).  
- **Database:** SQLite for local dev; PostgreSQL optional for production.

---

## 6. Testing
- **Frontend:** Playwright UI interaction tests.  
- **Backend:** unit/integration tests for CRUD operations.

---

## 7. UI / UX Guidelines
- **Theme:** D&D aesthetic (parchment, thematic fonts), clean and readable.  
- **Token highlights:**  
  - Current turn: yellow border/glow  
  - Dead: red tint with red X, instant  
- **Health bar:** solid red, numeric overlay, instant update  
- **Add-token overlay:** appears on top without altering background  
- **Center board scaling:** dynamic token sizing to fit all tokens  
- **Token images:** 256×256 px, square crop, zoom/pan allowed

