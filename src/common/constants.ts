export const JOB_ALLOW_LIST: string[] = [
  "Editor",
  "Director of Photography",
  "Production Design",
  "Casting",
  "Costume Design",
  "Set Decoration",
  "Original Music Composer",
  "Script Supervisor",
  "Director",
  "Music Editor",
  "Stunt Coordinator",
  "Location Scout",
  "Dialect Coach",
  "Animation Supervisor",
  "Chef",
  "Music Coordinator",
  "Pyrotechnician",
  "Creature Design",
  "Writer",
  "Screenplay",
  "Novel",
  "Story",
  "Characters",
  "Author",
  "Cinematography",
];

export const LOG_LEVELS = ["error", "warning", "info", "debug", "verbose"];

export const CREW_JOB_MAP = {
  "directors": ["Director"],
  "editors": ["Editor"],
  "cinematographers": ["Director of Photography", "Cinematography"],
  "writers": ["Writer", "Screenplay", "Novel", "Story"]
};

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "TV Movie",
  "War",
  "Western"
];

export const GENRE_ID_MAP: Record<string, number> = {
  ["Drama"]: 18,
	["Mystery"]: 9648,
	["Fantasy"]: 14,
	["Adventure"]: 12,
	["Comedy"]: 35,
	["History"]: 36,
	["Horror"]: 27,
	["Documentary"]: 99,
	["Thriller"]: 53,
	["Science Fiction"]: 878,
	["Action"]: 28,
	["Romance"]: 10749,
	["Family"]: 10751,
	["Western"]: 37,
	["War"]: 10752,
	["Crime"]: 80,
	["Animation"]: 16,
	["Music"]: 10402,
	["TV Movie"]: 10770
}

export const DEFAULT_USER_SETTINGS = {
  statsMinWatched: 2,
  statsMinCastOrder: 15
};