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

There are no tests or lint config — type-checking is the only automated gate.

### Web preview (`preview_*` tools, launch name `verso-app`)
- **After editing, the preview serves a stale JS bundle** — `window.location.reload()` and HMR often don't pick up changes (Metro logs "Bundled" but the client cache wins). **`preview_stop` then `preview_start` to force a fresh bundle.** Confirm by asserting on a known new string before screenshotting.
- The native preview viewport collapses to ~2px wide — always `preview_resize` to the `mobile` preset (375×812) first, or screenshots are unreadable strips.
- RN-web `TouchableOpacity`/`Pressable` `onPress` does **not** reliably fire from a synthetic `MouseEvent('click')` in `preview_eval` (segmented pills work; the Book Swipe trigger and drag cards do not). Verify those by reading state/DOM, not by simulating taps.
- `type.label` and other `textTransform:'uppercase'` text returns **uppercased** from `innerText` in Chrome — match case-insensitively in assertions.

## Architecture

### App Structure
- **expo-router** file-based routing: `app/(tabs)/` holds the screens.
- 4-tab IA, in tab-bar order (`_layout.tsx`): **Today** (`index.tsx`), **Discover** (`discover.tsx`), **Social** (`social.tsx`), **Shelf** (`shelf.tsx`).
- **`index.tsx` is the Today screen, not Discover** — Today is the default landing route (`/`). Don't assume `index` == Discover.
- `profile.tsx` is `href:null` (pushed via `router.push('/profile')`). `search.tsx` is also `href:null` but currently **orphaned** — nothing navigates to it; Discover has its own inline search.
- Tab screens use a plain `View` with `paddingTop: useSafeAreaInsets().top` (not `SafeAreaView`) so the header clears the notch; the tab bar adds `insets.bottom`.
- Each screen owns a horizontal pill **sub-nav** (`const [sub,setSub]`). All modals are full-screen `Modal` components imported into the screen that owns them.

### State Management
Single Zustand store at `store/index.ts` with `persist` → `AsyncStorage` (key `'verso-storage'`). All user data lives here: shelf status, ratings, journal, rereads, reviews, lists, challenges, buddy reads, ELO ratings, streak days, favourites, stats visibility, **swipe taste-log**.

**Never duplicate data between store and component state.** Component state is only transient UI (active tab, input values, modal open/closed).

Persisted state overrides new store defaults — to see changed seed data, clear storage (web: `localStorage.removeItem('verso-storage')`).

> Dead store fields: the **Clubs** feature was removed from Social, so `userClubs / createClub / clubMessages / sendClubMessage` (and `components/BookClubModal.tsx`) are orphaned but still present.

### Data Layer
All mock/seed data is in `data/books.ts`. Key exports:
- `BOOKS` — catalogue array (Book interface). `FRIENDS` (elif/marcus/juno/priya) with match %, color, init.
- `FRIEND_BOOK` — per-book friend ratings + takes; `BOOK_VIBES` — mood/pace/weekly readers; `BOOK_TAGS` — tropes/themes/CW/subgenres; `BOOK_QUOTES` — memorable quotes; `AUTHOR_DATA` — bios keyed by full author name.
- `CHALLENGES`, `ACTIVITY`, `ISBNS`, `COVER_IDS`, `PAGE_COUNTS`.
- **`recommendBooks(seedIds, allBooks, exclude, limit)`** — content-based recsys scoring candidates by shared genre/mood/pace/trope/theme/author against the user's "liked" seed set; returns `{id, reasonId, score}` so the UI can say "Because you loved X". Used on Today and Discover. Swap the body for a server call later — the return shape is the UI contract.

Custom books live in `store.customBooks[]`. Code iterating books should always use `[...BOOKS, ...(Array.isArray(customBooks) ? customBooks : [])]`.

### Backend stubs (wired, awaiting a server)
Two features are built client-side with a clean seam for a future backend:
- **Swipe taste-log** (recommendation engine): Book Swipe records every decision via `store.recordSwipe(bookId, action)` → appends to the append-only `swipeEvents: SwipeEvent[]` log (`{bookId, action, ts, synced}`). Swipes intentionally do **nothing** to shelves/ratings. A backend drains rows where `!synced`, then calls `markSwipesSynced(lastTs)`. `swipeData` keeps the latest verdict per book (drives the queue).
- **Create insights API** (`StatsView.tsx`): `const INSIGHTS_API = { endpoint:'', apiKey:'' }`. Set `endpoint` to POST `{prompt, library[]}` and render the returned `{title, insight, rows:[{label,value,display?,bookIds?}]}`. Empty endpoint / any failure falls back to the on-device generator (`buildChart`).

### Theme System
`constants/theme.ts` — single source of truth. **Warm _light_ theme** (cream bg, white + pastel cards, dark text). StatusBars are `dark-content` everywhere.
- `colors` — bg / surface (white cards) / surface2 (warm fill, progress tracks) / text·text2·text3 / accent (forest green) / `accentText` (white text on accent fills — use this, not `colors.bg`, for new button labels) / accentDim / border / danger.
- `pastels` + `pastelText` — sage/blush/butter/sky/lavender/clay tints and matching dark text, for hero cards and stat cells.
- `spacing` xs→xxl, `radius` (use `radius.pill`=999 for pills), `shadow` (`card`/`soft`, spread: `...shadow.soft`), `fonts` (Playfair serif/serifBold/serifItalic + DM Sans sans/sansMedium/sansBold), `type` (shared text styles).

Visual language: white/pastel cards float on the bg with `radius.lg` + `...shadow.soft` and horizontal margins — **avoid full-width `borderBottomWidth` divider rows** in new UI; use spaced cards.

### Book Covers
`BookCover` fetches from Open Library using `COVER_IDS[bookId]` (exact OL cover id, preferred) else `ISBNS[bookId]`, falling back to a deterministic colored placeholder. Always pass `bookId`; pass `olCoverId` for custom books from OL search. **Some seed ISBNs are wrong** (resolve to unrelated books on OL) — prefer adding a correct `COVER_IDS` entry over trusting `ISBNS` for display.

## Screen patterns

**Today** (`index.tsx`) — engagement home, order: **combined greeting+streak tracker** → **Book Swipe** → continue reading → friends activity → recommendations → trending → goal/challenge. The tracker card merges the greeting (date + name) with a compact flame/streak badge; tapping it (`trackerOpen`) expands a 4-week calendar grid (28 cells via `calendar`, aligned to weekday columns, ending the current week, future days muted). Streak is derived from `store.streakDays` (`'Mon D'` labels): current streak = run of consecutive logged days ending today (or yesterday if today isn't logged). `logToday()` appends today. Continue-reading rows open `BookDetailModal` on its `initialTab='shelf'` (My Shelf, where Reading Journal now sits near the top under a combined Your Shelf/Format card). Friends-activity rows open `SocialPostModal` (single-post view reusing `feedComments`/`addComment`). Goal/Challenge cards open `GoalModal` / `ChallengeModal`.

**Discover** (`discover.tsx`) — search + 2 sub-tabs (`For You` · `Mood`). For You leads with `recommendBooks` ("Recommended for you"), then a Book Swipe card, taste-twin picks, trending, editor picks. Search overrides the tabs and offers add-from-OL.

**Shelf** (`shelf.tsx`) — sub-nav `Stats · Library · Journal · Profile` (default Stats). **Library** unifies four collection views behind one chip row via `libMode: 'shelf'|'lists'|'favorites'|'rankings'` (shelf chips Read/Reading/TBR/DNF, then Lists/Favorites/Rankings). Rankings is ELO order; ELO is built by Book Swipe's Versus mode.

**Stats** (`components/StatsView.tsx`) — 14 sections grouped by a 4-way segmented control via the `GROUP` map (section-key → `Overview|Reading|Taste`), plus a **`Create`** segment.
- **Overview** renders sections as always-open scrolling cards. **Reading/Taste** render them as a **single-open accordion** (`openSection` state; collapsed cards show a teaser stat; first card auto-expands per tab).
- Every breakdown bar/chip/cell is tappable: inline rows expand a horizontal cover strip (`exp` state); glance cells open a full drill-down sheet. Breakdowns are computed from the user's engaged "pool" (shelves+ratings+favourites+lists), falling back to the whole catalogue when the library is thin.
- **Create** is the chart builder (see Backend stubs). **Customize** toggles `store.statsHidden[key]`; hidden sections don't render under any segment.

**Social** (`social.tsx`) — sub-nav `Feed · Challenges · Authors`. Feed is Instagram/Twitter-styled (story rings, @handles, post-type tag, tweet-like serif hot takes, embedded tappable book "media" card, like/comment/share bar). Like counts/comment counts are derived deterministically from a per-item hash (filler).

**Book Swipe** (`components/SwipeModal.tsx`, header "Book Swipe") — two modes: Swipe (Tinder-style cards) and Versus (ELO). Gamified: rules intro (once per session via module-level `seenRules`, re-openable via `?`), synthesized Web-Audio sounds + mute, drag glow / verdict stamps / pop badge / confetti / progress bar / session counter. **Web drag** uses direct DOM `pointer*` listeners on the card node (RN-web's responder system is unreliable for drags); a small-movement pointerup is treated as a tap → `onOpenBook`. Native uses `PanResponder`.

**Modals** receive `bookId/visible/onClose`. `BookDetailModal` uses an internal `localId` so author→book navigation works without remounting; its review composer defaults to Hot Take.

## Gotchas
- **Large Playfair _italic_ titles clip** without an explicit `lineHeight` (e.g. `fontSize:30` needs `lineHeight:40`) — the glyph box overflows the default line box and gets cut on-device.
- **react-native-svg**: don't use `origin`/`rotation` props on `<G>` — they emit "Invalid DOM property transform-origin" on web. Use `strokeDashoffset` for arc positioning.
- **Horizontal sub-nav `ScrollView` with `flexGrow:0` collapses to ~14px** on RN-web, clipping pills — give it an explicit `height` (e.g. `{flexGrow:0, height:56}`) and `contentContainerStyle={{alignItems:'center'}}`. (Fixed-count sub-navs now often use a flex row instead.)
- `Date.now()`/`Math.random()` are fine in normal components (used by `recordSwipe`, confetti) — only forbidden inside Workflow scripts.
