# Cricket Score Management System — DBMS Project 1

A complete, functional, full-stack **Cricket Score Management System** built for a college Database Management Systems (DBMS) project. 

The application demonstrates practical relational database concepts—including normalized tables, Primary Keys (PK), Foreign Keys (FK), referential integrity (`ON DELETE CASCADE`), domain `CHECK` constraints, parameterized SQL queries, and multi-table joins.

---

## 1. Project Overview & Features

- **Relational SQL Database**: 5 normalized tables (`Team`, `Player`, `Match`, `Score`, `Performance`) running on server-side SQLite (`better-sqlite3`).
- **Complete CRUD Operations**:
  - **Teams**: Create, view with roster count, edit, and cascade delete.
  - **Players**: Add players with playing roles, associate with teams, filter, search, and delete.
  - **Matches**: Schedule fixtures between two distinct teams, manage venues, dates, and match status.
  - **Scores**: Record and update team innings (runs, wickets, overs), compute net run rates, and enforce single-score per team constraints.
  - **Performances**: Track individual match batting (runs, balls) and bowling (wickets, overs) linked via junction foreign keys.
- **Live Match Auto-Scorer & Ball-by-Ball Simulator**: Simulate live overs on-time with automated parameterized `UPDATE` queries executing on the database.
- **Interactive SQL Playground**: Run live DDL, DML, DQL, and aggregate queries directly in the browser with execution time tracking.
- **One-Click Benchmark Reset**: Restore the database to clean benchmark sample data anytime for testing or demonstration.

---

## 2. Technology Stack & Rationale

| Tool / Technology | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend: React 19 + TypeScript** | User Interface | Component-based, responsive UI with strict type safety for database models and forms. |
| **Styling: Tailwind CSS v4** | Design System | Clean, high-density layout with tabular numbers for scores and statistics. |
| **Backend: Node.js + Express** | Server & REST API | Lightweight server implementing parameterized SQL prepared statements to protect against SQL injection. |
| **Database: SQLite (`better-sqlite3`)** | Relational SQL Engine | Zero-configuration, disk-persisted relational database supporting ACID transactions and true foreign keys (`PRAGMA foreign_keys = ON;`). |
| **Build Tool: Vite & tsx** | Development & Bundling | Fast developer experience running both backend API and Vite frontend on unified port 3000. |

---

## 3. Database Schema (5 Normalized Tables)

```sql
-- 1. Team Table
CREATE TABLE Team (
  team_id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Player Table
CREATE TABLE Player (
  player_id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper')),
  team_id INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE
);

-- 3. Match Table
CREATE TABLE Match (
  match_id INTEGER PRIMARY KEY AUTOINCREMENT,
  team1_id INTEGER NOT NULL,
  team2_id INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Scheduled', 'In Progress', 'Completed')),
  FOREIGN KEY (team1_id) REFERENCES Team(team_id) ON DELETE CASCADE,
  FOREIGN KEY (team2_id) REFERENCES Team(team_id) ON DELETE CASCADE,
  CHECK (team1_id <> team2_id)
);

-- 4. Score Table
CREATE TABLE Score (
  score_id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  runs INTEGER NOT NULL DEFAULT 0 CHECK(runs >= 0),
  wickets INTEGER NOT NULL DEFAULT 0 CHECK(wickets BETWEEN 0 AND 10),
  overs REAL NOT NULL DEFAULT 0.0 CHECK(overs >= 0.0 AND overs <= 50.0),
  FOREIGN KEY (match_id) REFERENCES Match(match_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
  UNIQUE(match_id, team_id)
);

-- 5. Performance Table
CREATE TABLE Performance (
  performance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  runs_scored INTEGER NOT NULL DEFAULT 0 CHECK(runs_scored >= 0),
  wickets_taken INTEGER NOT NULL DEFAULT 0 CHECK(wickets_taken BETWEEN 0 AND 10),
  balls_faced INTEGER NOT NULL DEFAULT 0 CHECK(balls_faced >= 0),
  overs_bowled REAL NOT NULL DEFAULT 0.0 CHECK(overs_bowled >= 0.0),
  FOREIGN KEY (match_id) REFERENCES Match(match_id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
  UNIQUE(match_id, player_id)
);
```

---

## 4. Setup and Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm (Node Package Manager)

### Quick Start
```bash
# 1. Install all dependencies
npm install

# 2. Run the application (starts Express API backend and Vite client on port 3000)
npm run dev

# 3. Open in your browser
http://localhost:3000
```

The database file `data/cricket_dbms.sqlite` is automatically initialized and seeded with sample data upon starting the server.

---

## 5. Backend RESTful API Endpoints

### Dashboard & Analytics
- `GET /api/stats`: Returns tournament aggregates (total teams, players, matches, runs, wickets, leading run scorers, leading wicket takers, and recent matches).

### Teams
- `GET /api/teams`: Retrieve all teams with rostered player counts.
- `POST /api/teams`: Create a new team (`team_name`, `country`).
- `PUT /api/teams/:id`: Update team details.
- `DELETE /api/teams/:id`: Delete a team and cascade-delete associated players and matches.

### Players
- `GET /api/players`: Retrieve players with optional query filters (`team_id`, `role`, `search`).
- `POST /api/players`: Register a player with role and team foreign key.
- `PUT /api/players/:id`: Update player details.
- `DELETE /api/players/:id`: Delete a player.

### Matches
- `GET /api/matches`: Retrieve all fixtures with team names and scores.
- `GET /api/matches/:id`: Retrieve single match with complete scorecard and player figures.
- `POST /api/matches`: Schedule a match (`team1_id`, `team2_id`, `match_date`, `venue`, `status`).
- `PUT /api/matches/:id`: Update fixture details.
- `DELETE /api/matches/:id`: Delete a match.

### Scores & Live Simulation
- `GET /api/scores`: Retrieve all recorded innings scorecards.
- `POST /api/scores`: Insert or update innings score (`match_id`, `team_id`, `runs`, `wickets`, `overs`).
- `DELETE /api/scores/:id`: Delete a score record.
- `POST /api/matches/:id/simulate-ball`: Simulates a live cricket ball, updating scores and performances in real-time.
- `GET /api/matches/:id/live-balls`: Get recent ball events and executed SQL statements for a match.

### Performances
- `GET /api/performances`: Retrieve performance records with optional match or player filter.
- `POST /api/performances`: Log or update individual player match figures.
- `DELETE /api/performances/:id`: Delete a performance entry.

### SQL Runner & Database Reset
- `POST /api/sql/execute`: Executes raw SQL query from the frontend playground and returns tabular data with execution time.
- `POST /api/reset`: Resets the database to the verified academic benchmark sample dataset.

---

## 6. Project Demonstration Highlights

1. **Demonstrate Referential Integrity**:
   - Go to **Teams**, view player counts. Explain that `Player.team_id` references `Team.team_id`.
   - Show that deleting a team cascade-deletes its rostered athletes.
2. **Demonstrate Domain Constraints**:
   - Try adding a score with 12 wickets; observe the `CHECK(wickets BETWEEN 0 AND 10)` constraint validation.
   - Show how `UNIQUE(match_id, team_id)` prevents accidental duplicate innings scorecards.
3. **Demonstrate Relational Joins & Aggregates**:
   - Go to **SQL & Schema** -> **SQL Playground**.
   - Execute the preset **"DQL: Dual Inner Join Match Scorecards"** to show how `Match`, `Team`, and `Score` are joined.
   - Execute **"Aggregates: Tournament Top Scorers"** to show `SUM`, `GROUP BY`, and `ORDER BY`.
4. **Demonstrate Real-Time Scoring**:
   - Go to **Scorecards**, click **"Start Auto-Sync"** on an active match, and watch live SQL `UPDATE` statements execute and update the scoreboard in real time.
