import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Award, Star, Zap, Shield, Sparkles, ChevronRight, X, ExternalLink, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface CricketGoat {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  category: 'batting' | 'bowling' | 'captain';
  title: string;
  era: string;
  matches: number;
  highlightStat: string;
  statLabel: string;
  secondaryStat: string;
  secondaryLabel: string;
  iccTrophies: number;
  signatureShot: string;
  avatarColor: string;
  accentColor: string;
  bio: string;
  legendaryFeats: string[];
  dbmsComparisonQuery: string;
}

export const CRICKET_GOATS: CricketGoat[] = [
  {
    id: 'sachin',
    name: 'Sachin Tendulkar',
    country: 'India',
    countryCode: 'IND',
    category: 'batting',
    title: 'The Master Blaster',
    era: '1989 – 2013',
    matches: 664,
    highlightStat: '100',
    statLabel: 'International Centuries',
    secondaryStat: '34,357',
    secondaryLabel: 'Career Runs',
    iccTrophies: 1,
    signatureShot: 'Pinpoint Straight Drive',
    avatarColor: 'from-blue-600 via-indigo-700 to-amber-500',
    accentColor: 'border-blue-500/40 text-blue-400',
    bio: 'Widely celebrated as the greatest batsman in cricket history. The only player to score 100 international centuries, playing at elite international level for 24 years.',
    legendaryFeats: [
      'First batsman in history to score an ODI Double Century (200* vs South Africa, 2010)',
      '15,921 Test runs & 18,426 ODI runs — all-time leading run-scorer in both formats',
      '2011 ICC Cricket World Cup Champion on home soil at Wankhede',
      '2,278 World Cup tournament runs across 6 tournament editions',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, t.team_name, SUM(perf.runs_scored) AS total_runs
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
JOIN Team t ON p.team_id = t.team_id
GROUP BY p.player_id
ORDER BY total_runs DESC;`,
  },
  {
    id: 'viv-richards',
    name: 'Sir Vivian Richards',
    country: 'West Indies',
    countryCode: 'WI',
    category: 'batting',
    title: 'The Original Dominator',
    era: '1974 – 1991',
    matches: 308,
    highlightStat: '90.2',
    statLabel: 'Career ODI Strike Rate',
    secondaryStat: '2',
    secondaryLabel: 'World Cup Titles',
    iccTrophies: 2,
    signatureShot: 'Swaggering Hook (No Helmet)',
    avatarColor: 'from-rose-700 via-amber-700 to-yellow-500',
    accentColor: 'border-rose-500/40 text-rose-400',
    bio: 'Redefined batting fearlessness. Batted with nonchalant swagger without a helmet against the fastest bowlers, boasting a 90+ strike rate when global averages hovered at 65.',
    legendaryFeats: [
      '189* vs England at Old Trafford (1984), arguably the greatest ODI innings ever played',
      '56-ball Test Century vs England at Antigua, standing as the fastest Test hundred for decades',
      'Back-to-back ICC Cricket World Cup titles in 1975 and 1979',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, 
  ROUND(SUM(perf.runs_scored) * 100.0 / NULLIF(SUM(perf.balls_faced), 0), 2) AS strike_rate
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
GROUP BY p.player_id
HAVING SUM(perf.balls_faced) >= 20
ORDER BY strike_rate DESC;`,
  },
  {
    id: 'virat-kohli',
    name: 'Virat Kohli',
    country: 'India',
    countryCode: 'IND',
    category: 'batting',
    title: 'King Kohli · Chase Master',
    era: '2008 – Present',
    matches: 538,
    highlightStat: '50',
    statLabel: 'ODI Hundreds (World Record)',
    secondaryStat: '58.2',
    secondaryLabel: 'Career Batting Avg',
    iccTrophies: 3,
    signatureShot: 'Signature Whip Cover Drive',
    avatarColor: 'from-amber-600 via-yellow-600 to-emerald-600',
    accentColor: 'border-amber-500/40 text-amber-400',
    bio: 'The undisputed modern chase maestro. Smashed Sachin Tendulkar’s record with 50 ODI hundreds, boasting unmatched consistency in pressure run chases.',
    legendaryFeats: [
      'Most centuries in ODI cricket history (50 centuries, surpassing Sachin in 2023)',
      'Player of the Tournament at both the 2014 & 2016 ICC T20 World Cups & 2023 ODI World Cup',
      'Player of the Match in the 2024 ICC T20 World Cup Final triumph',
      'Over 27,000 international runs with 80 international centuries across all formats',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, t.team_name, COUNT(perf.performance_id) AS innings_played,
  SUM(perf.runs_scored) AS total_runs,
  MAX(perf.runs_scored) AS highest_score
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
JOIN Team t ON p.team_id = t.team_id
GROUP BY p.player_id
ORDER BY total_runs DESC;`,
  },
  {
    id: 'shane-warne',
    name: 'Shane Warne',
    country: 'Australia',
    countryCode: 'AUS',
    category: 'bowling',
    title: 'The King of Spin',
    era: '1992 – 2007',
    matches: 339,
    highlightStat: '708',
    statLabel: 'Test Wickets',
    secondaryStat: '37',
    secondaryLabel: 'Five-Wicket Hauls',
    iccTrophies: 1,
    signatureShot: 'Fierce Spinning Leg-Break',
    avatarColor: 'from-yellow-600 via-amber-600 to-emerald-700',
    accentColor: 'border-yellow-500/40 text-yellow-400',
    bio: 'Revived the dying art of leg-spin bowling. Bowled the iconic "Ball of the Century" to Mike Gatting in 1993 and captained Rajasthan Royals to the inaugural IPL championship.',
    legendaryFeats: [
      'Delivered the "Ball of the Century" pitching outside leg and clipping top of off-stump',
      'Man of the Match in the 1999 World Cup Final vs Pakistan (4 wickets for 33 runs)',
      '1,001 total international wickets across Tests and ODIs',
      'Named one of the 5 Wisden Cricketers of the 20th Century',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, t.team_name, SUM(perf.wickets_taken) AS total_wickets,
  SUM(perf.overs_bowled) AS total_overs
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
JOIN Team t ON p.team_id = t.team_id
GROUP BY p.player_id
ORDER BY total_wickets DESC;`,
  },
  {
    id: 'ms-dhoni',
    name: 'MS Dhoni',
    country: 'India',
    countryCode: 'IND',
    category: 'captain',
    title: 'Captain Cool · Finisher Supreme',
    era: '2004 – 2019',
    matches: 538,
    highlightStat: '3',
    statLabel: 'ICC Major Trophies Won',
    secondaryStat: '829',
    secondaryLabel: 'Wicketkeeping Dismissals',
    iccTrophies: 3,
    signatureShot: 'Helicopter Shot',
    avatarColor: 'from-emerald-600 via-teal-700 to-amber-500',
    accentColor: 'border-emerald-500/40 text-emerald-400',
    bio: 'The only captain in international cricket history to win all three ICC white-ball trophies: 2007 T20 World Cup, 2011 ODI World Cup, and 2013 Champions Trophy.',
    legendaryFeats: [
      'Finished the 2011 ICC World Cup Final with an iconic six at Wankhede Stadium (91* off 79 balls)',
      'Fastest stumping in history recorded at 0.08 seconds (faster than human eye blink)',
      'Over 10,000 ODI runs with an astonishing 50+ batting average predominantly at #6 and #7',
      'Led Chennai Super Kings to 5 Indian Premier League titles and 2 Champions League T20 titles',
    ],
    dbmsComparisonQuery: `SELECT m.match_id, t1.team_name, t2.team_name, m.status, m.venue
FROM Match m
JOIN Team t1 ON m.team1_id = t1.team_id
JOIN Team t2 ON m.team2_id = t2.team_id
WHERE m.status = 'Completed'
ORDER BY m.match_date DESC;`,
  },
  {
    id: 'wasim-akram',
    name: 'Wasim Akram',
    country: 'Pakistan',
    countryCode: 'PAK',
    category: 'bowling',
    title: 'Sultan of Swing',
    era: '1984 – 2003',
    matches: 460,
    highlightStat: '916',
    statLabel: 'International Wickets',
    secondaryStat: '4',
    secondaryLabel: 'International Hat-Tricks',
    iccTrophies: 1,
    signatureShot: 'Lethal Reverse-Swing Yorker',
    avatarColor: 'from-teal-600 via-emerald-800 to-green-950',
    accentColor: 'border-teal-500/40 text-teal-400',
    bio: 'The undisputed master of reverse swing. Left-arm fast bowler who could swing the ball both ways at lethal speeds, inspiring generations of pace bowlers worldwide.',
    legendaryFeats: [
      'Twin magic balls in the 1992 World Cup Final dismissing Allan Lamb and Chris Lewis in consecutive balls',
      'First bowler to reach 500 ODI wickets (finished with 502)',
      '4 international hat-tricks (2 in Tests, 2 in ODIs)',
      'Top-scored with 257* in a Test match batting from #8 position',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, p.role, SUM(perf.wickets_taken) AS wickets
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
WHERE p.role LIKE '%Bowler%' OR p.role LIKE '%All-Rounder%'
GROUP BY p.player_id
ORDER BY wickets DESC;`,
  },
  {
    id: 'brian-lara',
    name: 'Brian Lara',
    country: 'West Indies',
    countryCode: 'WI',
    category: 'batting',
    title: 'The Prince of Trinidad',
    era: '1990 – 2007',
    matches: 430,
    highlightStat: '400*',
    statLabel: 'Highest Individual Test Score',
    secondaryStat: '501*',
    secondaryLabel: 'Highest First-Class Score',
    iccTrophies: 1,
    signatureShot: 'Flamboyant High-Backlift Cover Drive',
    avatarColor: 'from-amber-700 via-red-800 to-purple-900',
    accentColor: 'border-amber-500/40 text-amber-400',
    bio: 'A batting virtuoso known for legendary marathon innings. Holds the all-time world records for the highest individual score in both Test cricket (400*) and first-class cricket (501*).',
    legendaryFeats: [
      'Scored 400 not out vs England at Antigua in 2004 — the only quadruple century in Test history',
      'Scored 501 not out for Warwickshire in 1994',
      'Scored 153* in 1999 vs Australia, ranked by Wisden as the second-greatest Test innings ever',
      'Captained West Indies to the 2004 ICC Champions Trophy title in England',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, MAX(perf.runs_scored) AS peak_innings
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
GROUP BY p.player_id
ORDER BY peak_innings DESC;`,
  },
  {
    id: 'jasprit-bumrah',
    name: 'Jasprit Bumrah',
    country: 'India',
    countryCode: 'IND',
    category: 'bowling',
    title: 'The Modern Yorker GOAT',
    era: '2016 – Present',
    matches: 202,
    highlightStat: '19.8',
    statLabel: 'Career Test Bowling Avg',
    secondaryStat: '< 6.3',
    secondaryLabel: 'T20I Economy Rate',
    iccTrophies: 1,
    signatureShot: 'Toe-Crushing Hyperextended Yorker',
    avatarColor: 'from-sky-600 via-blue-800 to-indigo-950',
    accentColor: 'border-sky-500/40 text-sky-400',
    bio: 'The most lethal all-format bowler of modern cricket. Possesses an extraordinary bowling average under 20 in Test cricket and delivered the clutch final over to seal the 2024 T20 World Cup.',
    legendaryFeats: [
      'Player of the Tournament at the 2024 ICC T20 World Cup with 15 wickets at an economy of 4.17',
      'Fastest Indian pacer to 100 and 150 Test wickets',
      'Hat-trick in Test cricket vs West Indies in Jamaica (2019)',
      'Ranked ICC World #1 Bowler in Tests, ODIs, and T20Is across his career',
    ],
    dbmsComparisonQuery: `SELECT p.player_name, 
  ROUND(SUM(perf.runs_scored) * 1.0 / NULLIF(SUM(perf.wickets_taken), 0), 2) AS bowling_avg
FROM Performance perf
JOIN Player p ON perf.player_id = p.player_id
GROUP BY p.player_id
HAVING SUM(perf.wickets_taken) >= 2;`,
  },
];

export const CricketGoatsSection: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'batting' | 'bowling' | 'captain'>('all');
  const [selectedGoat, setSelectedGoat] = useState<CricketGoat | null>(null);

  const filteredGoats = CRICKET_GOATS.filter((g) => {
    if (activeTab === 'all') return true;
    return g.category === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>Hall of GOATs · All-Time Cricket Legends</span>
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            The Greatest Of All Time
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-2xl ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Explore the players whose defining moments changed the game forever.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-semibold ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {(
            [
              { id: 'all', label: 'All Icons' },
              { id: 'batting', label: 'Batting Kings' },
              { id: 'bowling', label: 'Bowling Maestros' },
              { id: 'captain', label: 'Captains' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of GOAT Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredGoats.map((goat, idx) => (
          <motion.div
            key={goat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => setSelectedGoat(goat)}
            className={`group relative rounded-2xl border p-5 shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
              isDark
                ? 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 border-slate-800 hover:border-amber-500/50'
                : 'bg-white border-slate-200 hover:border-amber-500 shadow-slate-200/50'
            }`}
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {goat.country} · {goat.countryCode}
                </span>

                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-500">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{goat.iccTrophies} WC</span>
                </span>
              </div>

              {/* Player Avatar Emblem */}
              <div className="flex items-center gap-3 my-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goat.avatarColor} p-0.5 shadow-md flex items-center justify-center shrink-0 border border-white/20`}
                >
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-black text-sm text-white tracking-wider">
                    {goat.countryCode}
                  </div>
                </div>

                <div>
                  <h3
                    className={`text-base font-black transition-colors ${
                      isDark
                        ? 'text-white group-hover:text-amber-400'
                        : 'text-slate-950 group-hover:text-amber-600'
                    }`}
                  >
                    {goat.name}
                  </h3>
                  <span
                    className={`text-[11px] font-semibold block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {goat.title}
                  </span>
                </div>
              </div>

              {/* Hero Numeric Stats */}
              <div
                className={`grid grid-cols-2 gap-2 my-4 p-3 rounded-xl border ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800/80'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {goat.statLabel}
                  </span>
                  <span className="text-xl font-black font-mono text-amber-500 tabular-nums">
                    {goat.highlightStat}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {goat.secondaryLabel}
                  </span>
                  <span
                    className={`text-xl font-black font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {goat.secondaryStat}
                  </span>
                </div>
              </div>

              <div
                className={`text-[11px] line-clamp-2 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {goat.bio}
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div
              className={`pt-4 mt-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-slate-800/80' : 'border-slate-100'
              }`}
            >
              <span
                className={`font-mono text-[10px] ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {goat.era}
              </span>
              <span className="text-amber-500 font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GOAT Modal Details Dossier */}
      <AnimatePresence>
        {selectedGoat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`border rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xl'
              }`}
            >
              {/* Modal Banner Header */}
              <div
                className={`p-6 border-b flex items-start justify-between ${
                  isDark
                    ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800'
                    : 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedGoat.avatarColor} p-1 shadow-xl flex items-center justify-center shrink-0 border border-white/20`}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center font-black text-lg text-amber-400">
                      {selectedGoat.countryCode}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                        Legendary Hall of Fame
                      </span>
                      <span className={isDark ? 'text-slate-500 text-xs font-mono' : 'text-slate-400 text-xs font-mono'}>
                        · {selectedGoat.era}
                      </span>
                    </div>
                    <h2
                      className={`text-2xl font-black mt-1 ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {selectedGoat.name}
                    </h2>
                    <p className="text-xs text-amber-500 font-semibold">
                      {selectedGoat.title} · {selectedGoat.country}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGoat(null)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* 3-Stat Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {selectedGoat.statLabel}
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-500">
                      {selectedGoat.highlightStat}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {selectedGoat.secondaryLabel}
                    </span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {selectedGoat.secondaryStat}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Intl Matches
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-500">
                      {selectedGoat.matches}
                    </span>
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <h4
                    className={`text-xs font-mono uppercase tracking-wider font-bold ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Legacy Overview
                  </h4>
                  <p
                    className={`text-xs leading-relaxed p-4 rounded-xl border ${
                      isDark
                        ? 'text-slate-300 bg-slate-950/60 border-slate-800'
                        : 'text-slate-700 bg-slate-50 border-slate-200'
                    }`}
                  >
                    {selectedGoat.bio}
                  </p>
                </div>

                {/* Key Feats */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Defining Historical Achievements</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedGoat.legendaryFeats.map((feat, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          isDark
                            ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signature Trademark */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 uppercase tracking-widest font-bold block">
                      Signature Trademark Play
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {selectedGoat.signatureShot}
                    </span>
                  </div>
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>

                {/* Player data detail */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 text-white">
                  <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Career data detail</span>
                  </div>
                  <pre className="text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedGoat.dbmsComparisonQuery}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className={`p-4 border-t flex justify-end ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  onClick={() => setSelectedGoat(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors border ${
                    isDark
                      ? 'text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-700'
                      : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
