# Pathfinder Functional Backend

This project is an academic capstone for Jala University's "Programming 4" module. The objective is to build a functional Node.js backend implementing a Path Finder application. It supports maps, obstacles, waypoints, route calculations via a pathfinding algorithm, and users. The entire application strictly follows the functional programming paradigm and a three-layer architecture (Presentation, Business Logic, Data Access).

> **Status:** This is a work-in-progress capstone. Phases will be added incrementally.

## Prerequisites

- Node.js v26+
- Docker & Docker Compose (for the PostgreSQL database)

## Clone Instructions

```bash
git clone https://github.com/JalaU-Capstones/pathfinder-functional-backend.git
cd pathfinder-functional-backend
```

## Installation and Setup

### Linux / macOS

```bash
# Install dependencies
npm install

# Copy environment variables and adjust if necessary
cp .env.example .env
```

### Windows (PowerShell)

```powershell
# Install dependencies
npm install

# Copy environment variables and adjust if necessary
Copy-Item .env.example .env
```

## Running the Database

We use Docker Compose to run a local PostgreSQL instance for development.

```bash
# Start the database container in the background
docker compose up -d

# To stop the database:
# docker compose down
```

## Running the Application

To start the server with native Node.js auto-reload:

```bash
npm run dev
```

The application will run on the port specified in your `.env` (default is 3000).
