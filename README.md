# Z-engine (v2.0.4)

Z-engine is an elite-tier software engineering console and AI assistant workspace optimized for predictive script compilation, algorithmic analysis, and rapid hardware/software debugging. Built on top of a highly responsive Next.js frontend, it securely hooks into automated backend workflows and persistent database management nodes to provide an isolated execution sandbox environment.

![System Core Layout](public/down.gif)

## 🚀 Key Features

- **Advanced Command Shell UI:** A dark terminal-themed interface featuring real-time state updates, micro-scale button interactions, full-screen background animations, and custom CSS scanline grid overlays.
- **Dynamic Register Management:** Instant side-panel indexing allowing full row CRUD workflows (Creating Standard Sessions, Inline Renaming, Individual Row Purging, and Global Database Wipes).
- **Incognito Temp Chat:** An ephemeral testing sandbox bypassing storage layer write-routines, completely resetting the engine's memory array on panel closure.
- **Isolated AI Core Intelligence:** System execution strictly locked into software development domains, rejecting off-topic queries to maximize technical precision.
- **Zero-Dependency Vector Graphics:** Raw inline SVG optimization to prevent Turbopack compilation bottlenecks.

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js (v16.2.10) with React Hooks (Client Components)
- **Styling Engine:** Tailwind CSS & Lucide React Icons
- **Authentication:** NextAuth.js (GitHub OAuth Provider Integration)
- **Workflow Automation:** n8n Workflow Automation Platform
- **Database Layer:** Supabase (PostgREST API Engine Layer)

---

## 📂 Project Architecture

```text
ziggymon/
├── public/
│   └── down.gif              # Core animated terminal background asset
├── src/
│   └── app/
│       ├── api/
│       │   └── sessions/
│       │       └── route.js  # Serverless CRUD REST endpoint (GET, PUT, DELETE)
│       ├── chat/
│       │   └── page.js       # Core terminal canvas & sidebar registry matrix
│       ├── login/
│       │   └── page.js       # SVG-optimized advanced login interface
│       └── layout.js         # Global viewport configuration wrapper