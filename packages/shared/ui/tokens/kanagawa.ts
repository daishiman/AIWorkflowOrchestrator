/**
 * Kanagawa Color Palette
 * Inspired by the famous painting "The Great Wave off Kanagawa" by Hokusai
 * Original theme: https://github.com/rebelot/kanagawa.nvim
 */

// ============================================================================
// Kanagawa Wave (Default Dark Theme)
// ============================================================================
export const kanagawaWave = {
  // Background colors
  sumiInk0: "#16161D", // Deepest background
  sumiInk1: "#1F1F28", // Main background
  sumiInk2: "#2A2A37", // Highlight background
  sumiInk3: "#363646", // Elevated background
  sumiInk4: "#54546D", // Selection background
  sumiInk5: "#626278", // Non-text elements
  sumiInk6: "#727288", // Lighter non-text

  // Foreground colors
  fujiWhite: "#DCD7BA", // Main text
  oldWhite: "#C8C093", // Subdued text
  fujiGray: "#727169", // Comments

  // Syntax colors
  oniViolet: "#957FB8", // Keywords, operators
  crystalBlue: "#7E9CD8", // Functions, methods
  springGreen: "#98BB6C", // Strings
  sakuraPink: "#D27E99", // Numbers
  surimiOrange: "#FFA066", // Constants, properties
  waveAqua1: "#6A9589", // Types (subdued)
  waveAqua2: "#7AA89F", // Types
  waveBlue1: "#223249", // Diff add background
  waveBlue2: "#2D4F67", // Selection
  waveRed: "#E46876", // Standout specials

  // UI colors
  samuraiRed: "#E82424", // Errors
  roninYellow: "#FF9E3B", // Warnings
  springBlue: "#7FB4CA", // Info
  carpYellow: "#E6C384", // Identifiers
  dragonBlue: "#658594", // Muted blue
  boatYellow1: "#938056", // Git modified (subdued)
  boatYellow2: "#C0A36E", // Git modified

  // Accent colors
  peachRed: "#FF5D62", // Accent/Highlights
  autumnGreen: "#76946A", // Git added
  autumnYellow: "#DCA561", // Git changed
  autumnRed: "#C34043", // Git deleted

  // Special colors
  winterGreen: "#2B3328", // Diff add
  winterYellow: "#49443C", // Diff change
  winterRed: "#43242B", // Diff delete
  winterBlue: "#252535", // Diff text
} as const;

// ============================================================================
// Kanagawa Dragon (Darker Theme)
// ============================================================================
export const kanagawaDragon = {
  // Background colors
  dragonBlack0: "#0D0C0C", // Deepest background
  dragonBlack1: "#12120F", // Main background
  dragonBlack2: "#1D1C19", // Highlight background
  dragonBlack3: "#282727", // Elevated background
  dragonBlack4: "#393836", // Selection background
  dragonBlack5: "#625E5A", // Non-text elements
  dragonBlack6: "#7A8382", // Lighter non-text

  // Foreground colors
  dragonWhite: "#C5C9C5", // Main text
  dragonGray: "#625E5A", // Comments
  dragonGray2: "#A6A69C", // Subdued text

  // Syntax colors (reuse Wave colors with adjustments)
  dragonViolet: "#8992A7", // Keywords
  dragonBlue: "#8BA4B0", // Functions
  dragonGreen: "#87A987", // Strings
  dragonPink: "#A292A3", // Numbers
  dragonOrange: "#B6927B", // Constants
  dragonAqua: "#8EA4A2", // Types
  dragonRed: "#C4746E", // Standout specials
  dragonYellow: "#C4B28A", // Identifiers
  dragonTeal: "#949FB5", // Special

  // UI colors (same as Wave)
  samuraiRed: "#E82424",
  roninYellow: "#FF9E3B",
  springBlue: "#7FB4CA",
} as const;

// ============================================================================
// Kanagawa Lotus (Light Theme)
// ============================================================================
export const kanagawaLotus = {
  // Background colors
  lotusWhite0: "#D5CEA3", // Deepest background (warm)
  lotusWhite1: "#DCD5AC", // Main background
  lotusWhite2: "#E5DDB0", // Highlight background
  lotusWhite3: "#F2ECBC", // Elevated background
  lotusWhite4: "#E7DBA0", // Selection background
  lotusWhite5: "#E4D794", // Non-text elements

  // Foreground colors
  lotusInk1: "#545464", // Main text
  lotusInk2: "#43436C", // Emphasized text
  lotusGray: "#8A8980", // Comments
  lotusGray2: "#716E61", // Subdued text
  lotusGray3: "#9699A3", // Lighter subdued

  // Syntax colors
  lotusViolet1: "#B35B79", // Keywords
  lotusViolet2: "#624C83", // Numbers
  lotusViolet3: "#766B90", // Keywords alt
  lotusViolet4: "#8992A7", // Special
  lotusBlue1: "#C7D7E0", // Diff add background
  lotusBlue2: "#B5CBD2", // Selection
  lotusBlue3: "#9FB5C9", // Muted blue
  lotusBlue4: "#4D699B", // Identifiers
  lotusBlue5: "#5D57A3", // Special
  lotusGreen: "#6F894E", // Strings
  lotusGreen2: "#5E857A", // Types
  lotusGreen3: "#5D734F", // Git added
  lotusPink: "#B35B79", // Standout
  lotusOrange: "#CC6D00", // Constants
  lotusOrange2: "#E98A00", // Properties
  lotusYellow: "#77713F", // Git modified
  lotusYellow2: "#836F4A", // Identifiers alt
  lotusYellow3: "#DE9800", // Warnings
  lotusYellow4: "#F9D791", // Search bg
  lotusCyan: "#D7E3D8", // Info bg
  lotusRed: "#C84053", // Errors
  lotusRed2: "#D7474B", // Diff delete
  lotusRed3: "#E46876", // Standout alt
  lotusRed4: "#D9A594", // Diff change
  lotusAqua: "#5E857A", // Aqua
  lotusAqua2: "#597B75", // Aqua alt
  lotusTeal1: "#4E8CA2", // Teal
  lotusTeal2: "#6693BF", // Teal alt
  lotusTeal3: "#5A7785", // Teal subdued

  // UI colors
  samuraiRed: "#E82424",
  roninYellow: "#FF9E3B",
  springBlue: "#7FB4CA",
} as const;

// ============================================================================
// Theme Type Definitions
// ============================================================================
export type KanagawaWaveColors = typeof kanagawaWave;
export type KanagawaDragonColors = typeof kanagawaDragon;
export type KanagawaLotusColors = typeof kanagawaLotus;

export type KanagawaTheme =
  | "kanagawa-wave"
  | "kanagawa-dragon"
  | "kanagawa-lotus";

// ============================================================================
// Semantic Color Mappings
// ============================================================================
export const kanagawaSemanticWave = {
  background: {
    primary: kanagawaWave.sumiInk1,
    secondary: kanagawaWave.sumiInk2,
    tertiary: kanagawaWave.sumiInk3,
    elevated: kanagawaWave.sumiInk3,
    glass: "rgba(31, 31, 40, 0.8)",
    selection: kanagawaWave.waveBlue2,
  },
  text: {
    primary: kanagawaWave.fujiWhite,
    secondary: kanagawaWave.oldWhite,
    muted: kanagawaWave.fujiGray,
    inverse: kanagawaWave.sumiInk1,
  },
  border: {
    default: kanagawaWave.sumiInk4,
    emphasis: kanagawaWave.sumiInk5,
    subtle: "rgba(220, 215, 186, 0.1)",
  },
  status: {
    primary: kanagawaWave.crystalBlue,
    primaryHover: kanagawaWave.springBlue,
    success: kanagawaWave.springGreen,
    successHover: kanagawaWave.autumnGreen,
    warning: kanagawaWave.roninYellow,
    warningHover: kanagawaWave.carpYellow,
    error: kanagawaWave.samuraiRed,
    errorHover: kanagawaWave.peachRed,
    info: kanagawaWave.springBlue,
    infoHover: kanagawaWave.dragonBlue,
  },
  syntax: {
    keyword: kanagawaWave.oniViolet,
    function: kanagawaWave.crystalBlue,
    string: kanagawaWave.springGreen,
    number: kanagawaWave.sakuraPink,
    constant: kanagawaWave.surimiOrange,
    type: kanagawaWave.waveAqua2,
    comment: kanagawaWave.fujiGray,
    variable: kanagawaWave.carpYellow,
  },
  git: {
    added: kanagawaWave.autumnGreen,
    modified: kanagawaWave.autumnYellow,
    deleted: kanagawaWave.autumnRed,
    addedBg: kanagawaWave.winterGreen,
    modifiedBg: kanagawaWave.winterYellow,
    deletedBg: kanagawaWave.winterRed,
  },
} as const;

export const kanagawaSemanticDragon = {
  background: {
    primary: kanagawaDragon.dragonBlack1,
    secondary: kanagawaDragon.dragonBlack2,
    tertiary: kanagawaDragon.dragonBlack3,
    elevated: kanagawaDragon.dragonBlack3,
    glass: "rgba(18, 18, 15, 0.9)",
    selection: kanagawaDragon.dragonBlack4,
  },
  text: {
    primary: kanagawaDragon.dragonWhite,
    secondary: kanagawaDragon.dragonGray2,
    muted: kanagawaDragon.dragonGray,
    inverse: kanagawaDragon.dragonBlack1,
  },
  border: {
    default: kanagawaDragon.dragonBlack4,
    emphasis: kanagawaDragon.dragonBlack5,
    subtle: "rgba(197, 201, 197, 0.1)",
  },
  status: {
    primary: kanagawaDragon.dragonBlue,
    primaryHover: kanagawaDragon.dragonTeal,
    success: kanagawaDragon.dragonGreen,
    successHover: kanagawaWave.autumnGreen,
    warning: kanagawaDragon.roninYellow,
    warningHover: kanagawaDragon.dragonYellow,
    error: kanagawaDragon.samuraiRed,
    errorHover: kanagawaDragon.dragonRed,
    info: kanagawaDragon.springBlue,
    infoHover: kanagawaDragon.dragonBlue,
  },
  syntax: {
    keyword: kanagawaDragon.dragonViolet,
    function: kanagawaDragon.dragonBlue,
    string: kanagawaDragon.dragonGreen,
    number: kanagawaDragon.dragonPink,
    constant: kanagawaDragon.dragonOrange,
    type: kanagawaDragon.dragonAqua,
    comment: kanagawaDragon.dragonGray,
    variable: kanagawaDragon.dragonYellow,
  },
  git: {
    added: kanagawaWave.autumnGreen,
    modified: kanagawaWave.autumnYellow,
    deleted: kanagawaWave.autumnRed,
    addedBg: kanagawaWave.winterGreen,
    modifiedBg: kanagawaWave.winterYellow,
    deletedBg: kanagawaWave.winterRed,
  },
} as const;

export const kanagawaSemanticLotus = {
  background: {
    primary: kanagawaLotus.lotusWhite1,
    secondary: kanagawaLotus.lotusWhite2,
    tertiary: kanagawaLotus.lotusWhite3,
    elevated: kanagawaLotus.lotusWhite3,
    glass: "rgba(220, 213, 172, 0.8)",
    selection: kanagawaLotus.lotusBlue2,
  },
  text: {
    primary: kanagawaLotus.lotusInk1,
    secondary: kanagawaLotus.lotusGray2,
    muted: kanagawaLotus.lotusGray,
    inverse: kanagawaLotus.lotusWhite1,
  },
  border: {
    default: kanagawaLotus.lotusWhite4,
    emphasis: kanagawaLotus.lotusGray,
    subtle: "rgba(84, 84, 100, 0.1)",
  },
  status: {
    primary: kanagawaLotus.lotusBlue4,
    primaryHover: kanagawaLotus.lotusBlue5,
    success: kanagawaLotus.lotusGreen,
    successHover: kanagawaLotus.lotusGreen2,
    warning: kanagawaLotus.lotusYellow3,
    warningHover: kanagawaLotus.lotusOrange2,
    error: kanagawaLotus.lotusRed,
    errorHover: kanagawaLotus.lotusRed2,
    info: kanagawaLotus.lotusTeal1,
    infoHover: kanagawaLotus.lotusTeal2,
  },
  syntax: {
    keyword: kanagawaLotus.lotusViolet1,
    function: kanagawaLotus.lotusBlue4,
    string: kanagawaLotus.lotusGreen,
    number: kanagawaLotus.lotusViolet2,
    constant: kanagawaLotus.lotusOrange,
    type: kanagawaLotus.lotusGreen2,
    comment: kanagawaLotus.lotusGray,
    variable: kanagawaLotus.lotusYellow2,
  },
  git: {
    added: kanagawaLotus.lotusGreen3,
    modified: kanagawaLotus.lotusYellow,
    deleted: kanagawaLotus.lotusRed2,
    addedBg: kanagawaLotus.lotusCyan,
    modifiedBg: kanagawaLotus.lotusYellow4,
    deletedBg: kanagawaLotus.lotusRed4,
  },
} as const;

export type KanagawaSemanticColors = typeof kanagawaSemanticWave;
