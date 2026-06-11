# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo Version

**Always read the versioned Expo docs before writing code**: https://docs.expo.dev/versions/v56.0.0/

This project uses Expo SDK 56, React Native 0.85.3, and expo-router v56. APIs change between Expo versions — do not rely on training-data knowledge.

## Commands

```bash
# Start dev server (web preview at localhost:8081)
npx expo start --web --port 8081

# Type-check — ALWAYS use this, never `npx tsc` (installs wrong package)
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json

# Install packages
npm install --legacy-peer-deps
```

The preview server is configured in `.claude/launch.json` as `"verso-app"` — use `preview_start` with that name.

## Architecture

### App Structure
- **expo-router** file-based routing: `app/(tabs)/` contains the main screens
- 4-tab IA, in tab-bar order: **Today** (`index.tsx`), **Discover** (`discover.tsx`), **Social** (`social.tsx`), **Shelf** (`shelf.tsx`)
- **`index.tsx` is the Today screen, not Discover** — Today is the default landing route (`/`). The route files were deliberately swapped so the app opens on Today; the Discover screen lives in `discover.tsx`. Don't assume `index` == Discover.
- Tab order and which screens appear in the bar are controlled in `_layout.tsx` (`<Tabs.Screen>` order; `href:null` hides a route from the bar)
- `profile.tsx` and `search.tsx` have `href:null` — pushed via `router.push('/profile')`, not tab links
- Tab screens use a plain `View` with `paddingTop: useSafeAreaInsets().top` (not `SafeAreaView`) so the header clears the notch; the tab bar adds `insets.bottom`
- All modals are full-screen `Modal` components imported into the screen that owns them

### State Management
Single Zustand store at `store/index.ts` with `persist` middleware → `AsyncStorage` (key: `'verso-storage'`). All user data lives here: shelf status, ratings, journal, rereads, reviews, lists, clubs, challenges, buddy reads, ELO ratings, streak days, stats visibility.

**Never duplicate data between store and component state.** Component state is only for transient UI (which tab is active, input values, modal open/closed).

### Data Layer
All mock/seed data is in `data/books.ts`. Key exports:
- `BOOKS` — main catalogue array (Book interface)
- `FRIENDS` — 4 friends (elif/marcus/juno/priya) with match %, color, init
- `FRIEND_BOOK` — per-book friend ratings + takes: `Record<bookId, Record<friendId, {r, t}>>`
- `BOOK_VIBES` — mood/pace/weekly readers per book
- `BOOK_TAGS` — tropes/themes/CW/subgenres per book
- `AUTHOR_DATA` — rich author bios keyed by full name
- `CHALLENGES`, `ACTIVITY`, `ISBNS`, `COVER_IDS`, `PAGE_COUNTS`

Custom books added by user are stored in `store.customBooks[]`. Code that iterates books should always use `[...BOOKS, ...(Array.isArray(customBooks) ? customBooks : [])]`.

### Theme System
`constants/theme.ts` — single source of truth for all visual tokens. **The app is a warm _light_ theme** (cream bg, white + pastel cards, dark text) — not dark. StatusBars are `dark-content` everywhere.
- `colors` — bg (warm greige) / surface (white cards) / surface2 (warm fill, used for progress-bar tracks) / text / text2 / text3 / accent (forest green) / `accentText` (white text on accent fills — use this, not `colors.bg`, for new button labels) / accentDim / border / danger
- `pastels` + `pastelText` — sage/blush/butter/sky/lavender/clay tints and their matching dark text colors, for hero cards and stat cells
- `spacing` — xs/sm/md/lg/xl/xxl
- `radius` — sm/md/lg/xl/pill (use `radius.pill` = 999 for pills/round buttons)
- `shadow` — `card` and `soft` elevation presets (spread into a style: `...shadow.soft`)
- `fonts` — Playfair Display (serif/serifBold/serifItalic) + DM Sans (sans/sansMedium/sansBold)
- `type` — shared text style objects (label, bookTitle, body, etc.)

Visual language: white/pastel cards float on the bg with `borderRadius: radius.lg` + `...shadow.soft` and horizontal margins — **avoid full-width `borderBottomWidth` divider rows** in new UI; use spaced cards instead.

### Book Covers
`BookCover` component fetches from Open Library Covers API using `ISBNS[bookId]` or `COVER_IDS[bookId]`. Falls back to a deterministic colored placeholder. Always pass `bookId`; optionally pass `olCoverId` for custom books returned from OL search.

### react-native-svg Gotcha
Do **not** use `origin` or `rotation` props on `<G>` elements — they emit "Invalid DOM property transform-origin" warnings on web. Use `strokeDashoffset` for arc positioning instead.

## Patterns

**Sub-navs** are horizontal `ScrollView` with filled `TouchableOpacity` pill tabs (active = `colors.accent` bg + `colors.accentText`) — each screen manages its own `const [sub, setSub]` state. **Web gotcha:** a horizontal `ScrollView` with `flexGrow:0` collapses to ~14px tall on react-native-web, clipping the pills. Give the sub-nav `ScrollView` an explicit `height` (e.g. `style={{flexGrow:0, height:60}}`) and `contentContainerStyle={{alignItems:'center'}}`.

**Today screen** (`index.tsx`) is the streak/engagement home. Streak is derived from `store.streakDays` (array of `'Mon D'` labels): the current streak is the run of consecutive logged days ending today, or yesterday if today isn't logged yet. `store.logToday()` appends today's label. `streakDays` is seeded in the store default so the hero isn't empty on first run — clear AsyncStorage (web: `localStorage.removeItem('verso-storage')`) to see seed changes, since persisted state overrides new defaults.

**Stats sub-tabs**: `StatsView` groups its 13 sections under an Overview/Reading/Taste segmented control (`GROUP` map of section-key → segment). A section renders when `!statsHidden[key] && GROUP[key] === seg`. Customize (show/hide) still toggles `statsHidden` independent of the segment.

**Modals** receive `bookId/visible/onClose` props. `BookDetailModal` uses an internal `localId` state so navigating author→book works without remounting.

**Add from search**: `index.tsx` passes `prefill` to `AddBookModal`, which calls Open Library `search.json` API on mount when prefill is set.

**ELO ranking**: `store.updateElo(ids, winnerId)` implements K=32 ELO. Called from `SwipeModal` on each swipe decision.

**Stats customization**: `store.statsHidden` is a `Record<string, boolean>`. `StatsView` checks `!statsHidden[key]` before rendering each section. `toggleStat(key)` flips it.
