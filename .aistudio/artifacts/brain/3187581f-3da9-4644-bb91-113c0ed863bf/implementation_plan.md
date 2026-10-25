# Cricket Score Management System — DBMS Project 1

A comprehensive full-stack college DBMS web application featuring a real relational SQL database, end-to-end CRUD capabilities for cricket tournaments, an interactive SQL Playground, and an academic viva preparation hub with presentation scripts and documentation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural directions confirmed during Phase 1 clarification have been incorporated:
> - **Database Engine**: Relational SQLite (`better-sqlite3`) managed via an Express API backend, enabling zero-configuration local runs, persistent disk storage, genuine foreign key enforcement, and instant faculty demonstration.
> - **Academic Deliverables**: Delivered as both an in-app interactive **Academic & Viva Hub** (with schema ER diagram, SQL query analyzer, and printable report) and downloadable project documentation files (`academic_report.md` and `presentation_scripts.md`).
> - **Demonstration Tools**: Includes an interactive **SQL Playground** with preloaded DDL/DML/DQL viva queries, custom query execution, and a one-click **Sample Data Reset** tool.

- **Confirmed Decision 1**: Five core normalized tables (`Team`, `Player`, `Match`, `Score`, `Performance`) with strict foreign keys, unique constraints, and referential integrity (`ON DELETE CASCADE` / `RESTRICT`).
- **Confirmed Decision 2**: Express API server running alongside Vite serving RESTful endpoints (`/api/teams`, `/api/players`, `/api/matches`, `/api/scores`, `/api/performances`, `/api/stats`, `/api/sql/execute`, `/api/reset`).
- **Confirmed Decision 3**: Consistent sports-journalism editorial design inspired by test match and modern T20 analytics boards, using emerald pitch greens, crisp slate cards, tabular numerals, and zero AI-slop pill clutter.

---

## 1. Overview & Core Concept

- **What It Does**: The Cricket Score Management System is a database-backed web application designed for cricket league coordinators, statisticians, and academic evaluators. It manages teams, rostered players, tournament fixtures, inning scores (runs, wickets, overs, run rate), and individual batting and bowling match figures.
- **Target Audience / Persona**: College DBMS evaluators, professors, computer science students preparing for viva examinations, and tournament administrators.
- **Key Value**: Bridges the gap between theoretical database coursework (DDL, DML, DQL, normalization, foreign key constraints, joins, aggregate queries) and practical software engineering, providing an intuitive UI coupled with transparent query inspection.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Executive Dashboard**: High-level statistical cards (Total Teams, Rostered Players, Completed Matches, Total Tournament Runs & Wickets), tournament leaderboards (Top Run Scorers, Leading Wicket Takers), and recent match results with rapid links to scorecards.
2. **Teams & Squad Management**: Grid and table views of cricket teams with country tags, coach/captain details, roster counts, modal forms for adding/editing teams, and safe deletion with cascade warning.
3. **Players Directory**: Searchable, filterable list of players by team and playing role (Batsman, Bowler, All-Rounder, Wicket-Keeper), with real-time aggregate statistics (career matches, runs, wickets) calculated from relational performance tables.
4. **Fixture & Match Scheduler**: Schedule head-to-head fixtures between teams, set match dates and venues, filter by match status (`Scheduled`, `In Progress`, `Completed`), and navigate directly to scoring.
5. **Live Scorecard & Inning Management**: Record team innings (runs scored, wickets lost, overs bowled), automatically calculate net run rate (NRR) and overs economy, and determine match outcome with database constraint validation (e.g. preventing duplicate innings scores for the same team in a match).
6. **Player Performance Entry**: Granular match-level performance logging (runs scored, balls faced, wickets taken, overs bowled) with direct foreign key association to both the match and the player.
7. **Match Summary & Match Center**: Comprehensive scorecard display featuring team scores, result banner, innings breakdown, and batting/bowling performance tables joined via relational queries.
8. **Interactive SQL Playground & Academic Viva Hub**:
   - Live query editor allowing students to test `SELECT`, `JOIN`, `GROUP BY`, `COUNT`, `SUM`, and schema inspection queries with immediate tabular output.
   - Interactive Entity-Relationship (ER) diagram visualizer showing Primary Key (PK) to Foreign Key (FK) cardinalities.
   - Ready-to-present viva scripts for Frontend, Backend, and Database evaluations.
   - Printable/exportable PDF academic report generator.

### Visual Identity & Theme
- **Aesthetic Direction**: Contemporary sports editorial and analytics dashboard. Professional, structured, and legible under classroom projection conditions.
- **Color Palette**:
  - Dominant Neutral: Crisp light slate (`#F8FAFC`) canvas and pure white (`#FFFFFF`) structural surfaces; deep navy dark mode support.
  - Primary Pitch Accent: Cricket wicket green (`#0F766E` / `#047857`) representing pitch turf and active tournament highlights.
  - Contrast & Accents: Amber (`#D97706`) for match fixtures in progress, Crimson (`#DC2626`) for wickets and destructive actions, Deep Slate (`#0F172A`) for typography.
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans` (font weight 600–700) for clean editorial presence.
  - Body & UI: `Public Sans` / `Plus Jakarta Sans` (font weight 400–500) with generous line heights.
  - Numerics & Queries: Strictly tabular monospace (`JetBrains Mono` / `font-mono tabular-nums`) for overs, scores, run rates, SQL code, and table IDs.
- **Zero-Pill Discipline & Spatial Balance**:
  - Clean unboxed metadata with dot separators (`India · 15 Players · Group A`).
  - Single-elevation card depth with delicate 1px hairline borders (`border-slate-200`).
  - Active tabs and filter selectors styled as sleek segmented controls rather than floating candy capsules.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Relational SQLite Backend via Node/Express**
  - *Chosen Approach*: Embedded server-side SQLite (`better-sqlite3` file database `cricket_dbms.sqlite`) connected via an Express server integrated into the development runtime.
  - *Why*: Provides genuine ACID transactions, strict schema constraints, actual foreign keys, and raw SQL queries without requiring students to configure external database servers or cloud credentials. Perfect for college viva grading.
  - *Alternatives Considered*: Client-side mock state (rejected by prompt requirements); Cloud SQL (requires cloud billing/credentials, less portable for students running on campus lab computers).

- **Decision 2: Raw Parameterized SQL Queries over Abstract ORMs**
  - *Chosen Approach*: Explicit SQL statements (`CREATE TABLE`, `INSERT INTO ... VALUES (?)`, `SELECT ... INNER JOIN`, `GROUP BY`) executed via `db.prepare()`.
  - *Why*: Faculty members scrutinize whether the student actually understands SQL syntax, join conditions, foreign key references, and aggregation functions. Hiding SQL behind high-level ORMs often loses marks in college evaluations.
  - *Alternatives Considered*: Drizzle or Prisma (adds abstraction layers that hide the exact SQL queries students need to explain in their viva).

- **Decision 3: Dedicated Academic Viva Hub & Exportable Deliverables**
  - *Chosen Approach*: Building an in-app Academic & Viva Hub page that includes printable report views, copyable speaking scripts for 3 video presentations, and ER diagram views, accompanied by physical markdown files in the repository.
  - *Why*: Fulfills Section 8 of the project brief, giving the student an immediate, flawless presentation aid to explain components, API routes, database normalization, and SQL statements directly on-screen.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CRICKET SCORE MANAGEMENT CLIENT                       │
│                     (React 19 + TypeScript + Tailwind)                      │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Dashboard     │  │ Teams & Squad │  │ Matches &      │  │ Player Perf │  │
│  │ & Standings   │  │ Management    │  │ Scorecard Entry│  │ Tracking    │  │
│  └───────┬───────┘  └───────┬───────┘  └────────┬───────┘  └──────┬──────┘  │
│          │                  │                   │                 │         │
│  ┌───────┴──────────────────┴───────────────────┴─────────────────┴──────┐  │
│  │       Interactive SQL Query Playground & Academic Viva Studio         │  │
│  └──────────────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ REST API (/api/*)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS BACKEND SERVER (Node.js)                      │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────┐  │
│  │ Team & Player Router    │  │ Match & Score Router    │  │ SQL Runner  │  │
│  │ (/api/teams, /players)  │  │ (/api/matches, /scores) │  │ & Reset API │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └──────┬──────┘  │
│               │                            │                      │         │
│               ▼                            ▼                      ▼         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │         Database Service (Parameterized SQL Engine with DDL/DQL)      │  │
│  └──────────────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ better-sqlite3
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 RELATIONAL SQL DATABASE (cricket_dbms.sqlite)                │
│                                                                             │
│      ┌──────────────┐         1 : N         ┌──────────────┐                │
│      │     TEAM     │──────────────────────▶│    PLAYER    │                │
│      │  (team_id)   │                       │ (player_id)  │                │
│      └──────┬───────┘                       └──────┬───────┘                │
│             │                                      │                        │
│             │ 1 : N                                │ 1 : N                  │
│             ▼                                      ▼                        │
│      ┌──────────────┐         1 : N         ┌──────────────┐                │
│      │    MATCH     │──────────────────────▶│ PERFORMANCE  │                │
│      │  (match_id)  │                       │(performance) │                │
│      └──────┬───────┘                       └──────────────┘                │
│             │                                                               │
│             │ 1 : N                                                         │
│             ▼                                                               │
│      ┌──────────────┐                                                       │
│      │    SCORE     │                                                       │
│      │  (score_id)  │ (Unique match_id + team_id constraint)                │
│      └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Relational Schema Specification

1. **`Team` Table**:
   - `team_id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `team_name`: TEXT NOT NULL UNIQUE
   - `country`: TEXT NOT NULL
   - `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

2. **`Player` Table**:
   - `player_id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `player_name`: TEXT NOT NULL
   - `role`: TEXT NOT NULL CHECK(role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'))
   - `team_id`: INTEGER NOT NULL, FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE

3. **`Match` Table**:
   - `match_id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `team1_id`: INTEGER NOT NULL, FOREIGN KEY (`team1_id`) REFERENCES `Team`(`team_id`)
   - `team2_id`: INTEGER NOT NULL, FOREIGN KEY (`team2_id`) REFERENCES `Team`(`team_id`)
   - `match_date`: TEXT NOT NULL
   - `venue`: TEXT NOT NULL
   - `status`: TEXT NOT NULL CHECK(status IN ('Scheduled', 'In Progress', 'Completed'))
   - CHECK (`team1_id` <> `team2_id`)

4. **`Score` Table**:
   - `score_id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `match_id`: INTEGER NOT NULL, FOREIGN KEY (`match_id`) REFERENCES `Match`(`match_id`) ON DELETE CASCADE
   - `team_id`: INTEGER NOT NULL, FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE
   - `runs`: INTEGER NOT NULL DEFAULT 0 CHECK(`runs` >= 0)
   - `wickets`: INTEGER NOT NULL DEFAULT 0 CHECK(`wickets` BETWEEN 0 AND 10)
   - `overs`: REAL NOT NULL DEFAULT 0.0 CHECK(`overs` >= 0.0 AND `overs` <= 50.0)
   - UNIQUE(`match_id`, `team_id`) -- Prevents duplicate innings for the same team in a match

5. **`Performance` Table**:
   - `performance_id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `match_id`: INTEGER NOT NULL, FOREIGN KEY (`match_id`) REFERENCES `Match`(`match_id`) ON DELETE CASCADE
   - `player_id`: INTEGER NOT NULL, FOREIGN KEY (`player_id`) REFERENCES `Player`(`player_id`) ON DELETE CASCADE
   - `runs_scored`: INTEGER NOT NULL DEFAULT 0 CHECK(`runs_scored` >= 0)
   - `wickets_taken`: INTEGER NOT NULL DEFAULT 0 CHECK(`wickets_taken` BETWEEN 0 AND 10)
   - `balls_faced`: INTEGER NOT NULL DEFAULT 0 CHECK(`balls_faced` >= 0)
   - `overs_bowled`: REAL NOT NULL DEFAULT 0.0 CHECK(`overs_bowled` >= 0.0)
   - UNIQUE(`match_id`, `player_id`) -- One performance entry per player per match

### Demonstration SQL Queries Pre-Loaded in the System

- **DDL**: Complete `CREATE TABLE` statements with primary keys, foreign keys, check constraints, and unique indices.
- **DML**:
  - `INSERT INTO Team (team_name, country) VALUES (?, ?)`
  - `UPDATE Score SET runs = ?, wickets = ?, overs = ? WHERE score_id = ?`
  - `DELETE FROM Player WHERE player_id = ?`
- **DQL & Joins**:
  - `SELECT p.player_id, p.player_name, p.role, t.team_name, t.country FROM Player p INNER JOIN Team t ON p.team_id = t.team_id ORDER BY t.team_name, p.player_name;`
  - `SELECT m.match_id, m.match_date, m.venue, m.status, t1.team_name AS team1, t2.team_name AS team2, s1.runs || '/' || s1.wickets || ' (' || s1.overs || ' ov)' AS team1_score, s2.runs || '/' || s2.wickets || ' (' || s2.overs || ' ov)' AS team2_score FROM Match m INNER JOIN Team t1 ON m.team1_id = t1.team_id INNER JOIN Team t2 ON m.team2_id = t2.team_id LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id ORDER BY m.match_date DESC;`
- **Aggregates (COUNT, SUM, AVG)**:
  - `SELECT t.team_name, COUNT(p.player_id) AS total_players FROM Team t LEFT JOIN Player p ON t.team_id = p.team_id GROUP BY t.team_id, t.team_name ORDER BY total_players DESC;`
  - `SELECT p.player_name, t.team_name, SUM(pf.runs_scored) AS total_runs, SUM(pf.wickets_taken) AS total_wickets, COUNT(pf.match_id) AS matches_played FROM Player p INNER JOIN Team t ON p.team_id = t.team_id INNER JOIN Performance pf ON p.player_id = pf.player_id GROUP BY p.player_id, p.player_name, t.team_name ORDER BY total_runs DESC LIMIT 5;`

---

## 5. Implementation Sequence & Deliverables

1. **Backend & Database Initialization**:
   - Setup SQLite engine, automatic table schema migration with foreign keys enabled (`PRAGMA foreign_keys = ON;`), and rich initial seed dataset (6 international teams, 40+ players, 5 matches with complete scores and performance records).
   - Implement Express API routes with parameter sanitization, relational queries, and error handling.
2. **Frontend Views**:
   - Navigation bar complying with Top Bar Contract (Wordmark, single-line tabs, Quick Action button).
   - Dashboard with aggregate KPI metrics, recent match scorecards, and tournament top performers.
   - Teams Page: Team cards, country flags/tags, squad viewer, Add/Edit/Delete modals.
   - Players Page: Filter by role and team, search by name, Add/Edit/Delete modal.
   - Matches Page: Fixture scheduling modal with team selectors, venue, date, and status management.
   - Scorecard Entry Page: Record match scores for Team 1 & Team 2, run rate calculation, overs validation.
   - Performance Entry Page: Log individual player figures with match linkage.
   - Match Details Page: Full match view with both innings cards and batting/bowling leaderboards.
3. **Academic & Viva Hub**:
   - Interactive SQL Playground with preset queries (DDL, DML, DQL, Joins, Aggregates) and custom SQL editor.
   - Interactive Schema and Entity-Relationship (ER) model diagram.
   - PDF/Print-ready Academic Report view covering objectives, tools, ER schema, SQL queries, and architecture.
   - Presentation Script view with 3 detailed speaking scripts (Frontend, Backend, Database/Integration) for student viva demonstration.
   - One-click Sample Data Reset button for testing and demonstration.
4. **Documentation Files**:
   - `README.md` with installation, architecture, and demonstration guidelines.
   - `docs/academic_report.md` for project submission.
   - `docs/presentation_scripts.md` containing word-for-word speaking scripts for the 3 presentation videos.
