type IgnoreGroup = {
  ecosystem: string;
  patterns: RegExp[];
};

// Node.js / React
const NODE_PATTERNS: IgnoreGroup = {
  ecosystem: "Node.js / React",
  patterns: [
    /(^|[\/])node_modules([\/]|$)/i,
    /(^|[\/])dist([\/]|$)/i,
    /(^|[\/])build([\/]|$)/i,
    /\.lock$/i,
    /\.min\.js$/i,
    /\.map$/i,
    /^\.env(\..*)?$/i,
    /(^|[\/])coverage([\/]|$)/i,
    /(^|[\/])\.next([\/]|$)/i,
    /(^|[\/])out([\/]|$)/i,
  ],
};

// Java
const JAVA_PATTERNS: IgnoreGroup = {
  ecosystem: "Java",
  patterns: [
    /(^|[\/])target([\/]|$)/i,
    /\.class$/i,
    /\.jar$/i,
    /\.war$/i,
    /\.ear$/i,
  ],
};

// .NET / C# / ASP.NET
const DOTNET_PATTERNS: IgnoreGroup = {
  ecosystem: ".NET / C# / ASP.NET",
  patterns: [
    /(^|[\/])bin([\/]|$)/i,
    /(^|[\/])obj([\/]|$)/i,
    /\.dll$/i,
    /\.pdb$/i,
    /\.exe$/i,
  ],
};

// PostgreSQL
const POSTGRES_PATTERNS: IgnoreGroup = {
  ecosystem: "PostgreSQL",
  patterns: [
    /\.sql\.tmp$/i,
    /\.backup$/i,
    /\.dump$/i,
    /(^|[\/])pg_wal([\/]|$)/i,
    /(^|[\/])pg_data([\/]|$)/i,
  ],
};

// General
const GENERAL_PATTERNS: IgnoreGroup = {
  ecosystem: "General",
  patterns: [
    /(^|[\/])\.git([\/]|$)/i,
    /(^|[\/])\.svn([\/]|$)/i,
    /(^|[\/])\.hg([\/]|$)/i,
    /(^|[\/])\.DS_Store$/i,
    /(^|[\/])Thumbs\.db$/i,
    /(^|[\/])desktop\.ini$/i,
  ],
};

export const IGNORE_PATTERN_GROUPS = [
  NODE_PATTERNS,
  JAVA_PATTERNS,
  DOTNET_PATTERNS,
  POSTGRES_PATTERNS,
  GENERAL_PATTERNS,
];

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/");
}

export function isIgnoredPath(path: string): boolean {
  const normalized = normalizePath(path).toLowerCase();
  return IGNORE_PATTERN_GROUPS.some((group) =>
    group.patterns.some((pattern) => pattern.test(normalized)),
  );
}
