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
- **expo-router** file-based routing: `app/(tabs)/` contains the 3 main screens
- 3-tab IA: `index.tsx` (Discover), `social.tsx` (Social), `shelf.tsx` (Shelf)
- `profile.tsx` and `search.tsx` exist but have `href:null` — they're pushed via `router.push('/profile')`, not tab links
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
`constants/theme.ts` — single source of truth for all visual tokens:
- `colors` — bg/surface/surface2/text/text2/text3/accent/accentDim/border
- `spacing` — xs/sm/md/lg/xl
- `fonts` — Playfair Display (serif/serifBold/serifItalic) + DM Sans (sans/sansMedium/sansBold)
- `type` — shared text style objects (label, bookTitle, body, etc.)

### Book Covers
`BookCover` component fetches from Open Library Covers API using `ISBNS[bookId]` or `COVER_IDS[bookId]`. Falls back to a deterministic colored placeholder. Always pass `bookId`; optionally pass `olCoverId` for custom books returned from OL search.

### react-native-svg Gotcha
Do **not** use `origin` or `rotation` props on `<G>` elements — they emit "Invalid DOM property transform-origin" warnings on web. Use `strokeDashoffset` for arc positioning instead.

## Patterns

**Sub-navs** are horizontal `ScrollView` with `TouchableOpacity` pill tabs — each screen manages its own `const [sub, setSub]` state.

**Modals** receive `bookId/visible/onClose` props. `BookDetailModal` uses an internal `localId` state so navigating author→book works without remounting.

**Add from search**: `index.tsx` passes `prefill` to `AddBookModal`, which calls Open Library `search.json` API on mount when prefill is set.

**ELO ranking**: `store.updateElo(ids, winnerId)` implements K=32 ELO. Called from `SwipeModal` on each swipe decision.

**Stats customization**: `store.statsHidden` is a `Record<string, boolean>`. `StatsView` checks `!statsHidden[key]` before rendering each section. `toggleStat(key)` flips it.
