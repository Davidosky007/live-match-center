# Live Match Center

A real-time football match tracking app built with Next.js 14, TypeScript, and Socket.IO.

→ **[Live Demo](https://live-match-center-tau.vercel.app)**  
→ **[Repository](https://github.com/Davidosky007/live-match-center)**

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app connects to the live backend automatically — no environment variables needed for local development.

If you want to point at a different API:

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com npm run dev
```

---

## What I Built

A live match dashboard, a per-match detail view with real-time events and stats, and a chat room for each match — all wired up over WebSockets (Socket.IO) so everything updates without touching the page.

The basic flow: you land on the dashboard, see which matches are live, click one, and from that point on the score, timeline, and stats are all pushed to you by the server. The chat room is scoped to that match — you pick a username the first time (stored in localStorage, nothing fancy), and you're in.

---

## Approach

### Starting with the socket layer

The first thing I wired up was the Socket.IO connection, before any UI at all. Real-time apps have a way of surfacing awkward problems late if you build the visuals first and bolt on the socket layer afterwards — things like stale closures in event listeners, duplicate connections from re-renders, or subscriptions that never get cleaned up. Getting the connection stable and the event flow working early meant the rest of the build was just UI on top of a reliable data stream.

The socket lives in a module-scoped singleton (`lib/socket.ts`). It only gets created once regardless of how many components mount or unmount. All the hooks just call `getSocket()` and register their own listeners — no context providers, no prop-drilling a socket instance around.

### Custom hooks for everything stateful

Each major feature has one hook that owns its state and its socket subscriptions:

- `useMatchList` — fetches the match list on mount, listens for `score_update` and `status_change`, and runs a 60-second polling interval as a fallback in case a WS event gets dropped
- `useMatchDetail(id)` — fetches the full match on mount, subscribes/unsubscribes from that match's room, and handles all four event types
- `useMatchChat(id)` — manages join/leave, message state, typing indicators, the rate-limit errors, and the auto-scroll logic

The cleanup logic in each hook's `useEffect` return is where a lot of the reliability lives. Every listener that gets added gets explicitly removed when the component unmounts. This was the most tedious part to get right — especially the chat hook, which has a lot of moving pieces — but it's what stops the app from accumulating ghost subscriptions as users navigate around.

### The dashboard as a live patch operation

Rather than re-fetching the full match list on every score update (which would be wasteful and cause flicker), the dashboard starts with a full fetch and then applies surgical patches to the array state as WS events come in. A `score_update` just touches the scores on one match object. A `status_change` just touches the status. The full re-fetch only happens on the 60-second interval, and on reconnection after a disconnect.

This keeps the UI smooth even when multiple matches are updating simultaneously.

### Reconnection handling

When the socket drops, three things need to happen when it comes back: the connection status bar needs to update, the active subscriptions need to be re-emitted (`subscribe_match`, `join_chat`), and the REST data needs to be re-fetched to recover anything that was missed while offline. I tied all of this to the socket's `reconnect` event inside each hook. The order matters — you want the subscriptions registered before the next batch of WS events arrives.

The Socket.IO client is configured with exponential backoff (starts at 1 second, caps at 30 seconds, infinite attempts). The status bar appears as soon as `disconnect` fires and disappears as soon as `connect` fires on reconnect. Users shouldn't have to do anything.

### Theme system

The app has a light mode and a dark mode. Rather than managing two separate Tailwind class sets everywhere, I used CSS custom properties for all the colour tokens and switched the full set by toggling a `dark` class on the root element. Tailwind's `dark:` prefix handles structural overrides (like shadow intensity and border opacity); the CSS variables handle the actual colour values.

The dark mode palette is a deliberate choice — dark olive/charcoal background with a yellow-green accent — rather than just inverting the light theme. It reads as intentional.

---

## Trade-offs

**No optimistic chat updates.** When you send a message, it appears in the list only after the server echoes it back. I thought about doing optimistic updates but decided against it — the main complication is that the server can reject messages (rate limiting), so you'd need rollback logic, a pending state, an error state, and a way to reconcile the local message with the server-echoed one. The latency on a local network is low enough that the round-trip is barely perceptible. If this were going to production I'd revisit it, but for a 24-hour build it's the right call.

**localStorage identity, nothing more.** Users get a random `userId` and pick a username. It persists per device, per browser. There's no account system, no server-side user tracking, no cross-device sync. The brief was clear that this was acceptable, and it kept the auth surface area at zero.

**Polling as a WebSocket safety net.** The 60-second re-fetch on the dashboard feels redundant when WebSockets are working, and it is — that's the point. WebSocket events can get dropped silently. A missed `status_change` event means a match that's already at half-time still shows as "Live · 1st" until the next event comes in, which could be minutes. The polling interval closes that gap without being aggressive about it.

**Chat messages are capped at 200 in state.** The app doesn't load chat history when you join a room — you see messages from the moment you arrive. The 200-message cap prevents the DOM from growing unbounded over a long match. Oldest messages drop off the top. This was a deliberate UX decision too: live match chat is ephemeral by nature. Nobody needs a scrollback buffer of 2,000 messages.

**Line up and Table tabs are placeholders.** The API doesn't return lineup or table data in the spec, so these tabs render a "coming soon" state. I built the tab infrastructure fully so adding real content later is just a matter of wiring up a new data source — the component structure is already there.

**No test suite.** Given the 24-hour constraint, I spent the time on reliability and edge cases in the actual code rather than writing tests. The hooks are structured in a way that would make them straightforward to test with React Testing Library — each one has a clear input (matchId), clear state output, and explicit side effects. If this were a production project, the socket event handlers and the reconnection recovery logic are the first things I'd want covered.

---

## What I'd Do Differently with More Time

The thing that felt most rushed was the chat UX on mobile. The tab-based switching between match content and chat works, but it means you can't glance at the score while reading messages. A floating chat toggle (like a notification bubble in the corner) that opens a bottom sheet would be a lot more natural — the score and status stay visible underneath. I started sketching it out but cut it to stay on schedule.

I'd also add proper error boundaries around the chat panel specifically. Right now if something throws in there it bubbles up and takes the whole detail page with it. The match view shouldn't be hostage to a chat error.

And honestly, the loading skeletons could be more accurate. They're the right height and shape but don't fully reflect the card anatomy. It's a small thing that gets noticed.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Socket.IO Client** — real-time events
- **Zustand** — global state (theme, connection status, user identity)
- **Tailwind CSS** — styling
- **Vercel** — deployment
