@~/src/technosophia/WORKING.md

# Working on Roxana

**This file is 6,968 bytes, under technosophia's cap of 20,000.** Read
technosophia's `INSTRUCTIONS.md` before adding to it, and correct the figure
in the same commit.

**The practices this project shares with others are technosophia's**, at
`~/src/technosophia`. This file imports its `WORKING.md` (trunk, the verbs,
one at a time and only when asked, commit subjects and trailers), which says
when to read the rest: `LANDING.md`, `PLANNING.md`, `INSTRUCTIONS.md`,
`SERVICES.md`, `CLIENTS.md`. What follows is what is Roxana's alone.

**Scripts run as `ts <name>`**, from anywhere in the checkout: technosophia's
shared ones (`note`, `task`, ...); `ts` alone lists them.

## `planning/`

Laid out as technosophia's `PLANNING.md` says: `task/`, `backlog/` and
`decision/`, one file per item; a verb and a quoted title is a reference to a
file, resolved with `ts note find`. Read it before filing or resolving one.

## Commands

```bash
npm start          # Dev server (Vite, port 3000)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

Node 24.13.0 required (see `.node-version`). No test suite configured.

The `cli/` directory is a separate TypeScript tool for AWS admin operations; run it independently with its own `npm` commands.

`src/cli.ts` is the admin CLI (`npm run roxana`, then `AWS_PROFILE=amplify node cli-build/cli.js <command>`): `discussions`, `users`, `delete`, `publish`, `privatize <id>` (makes a public discussion private, giving everyone who voted on it a UserDiscussion row so they keep access; a dry run without `--confirm`), and `rename <file>`, which renames people everywhere Roxana keeps a name (User, UserDiscussion, each layout's owner and votes, analyzingState) from `old<TAB>new` lines; a dry run without `--confirm`. It moved the Cognito-era names onto noesis user names in 2026-11.

The web app does `publish` and `privatize` too, from the hamburger menu inside a discussion (`App.tsx`): "make private" / "make public", each after a confirmation, through the event queue (`makePrivate` / `makePublic` in `data.tsx`). "make private" keeps in, beyond the voters, whoever clicks it; "make public" also drops the invite code, which the CLI's `publish` leaves.

## aws-exports.js

`aws-exports.js` is gitignored (contains secrets) but required to run the app. The production values can be found in the AWS Console:
- **AppSync endpoint and API key**: AppSync → roxana-roxana → Settings

The app reads its AppSync settings from `.env.local` (`VITE_AWS_REGION`, `VITE_APPSYNC_ENDPOINT`, `VITE_APPSYNC_API_KEY`), and noesis's from `VITE_NOESIS_URL` / `VITE_NOESIS_CLIENT_ID` (defaults `https://noesis.rvanegas.co`, `roxana`). The Cognito pool (`roxana31481408_userpool_31481408-roxana`) no longer signs anyone in.

## ⚠️ AppSync API key expires 2027-06-07

**If today is on or after 2027-05-07, remind the user immediately** — even if the current task is unrelated: the manually created AppSync API key (used by the frontend via `VITE_APPSYNC_API_KEY` and in `aws-exports.js`) expires **2027-06-07** and the app loses all API access when it does; so does noesis's own key (`ROXANA_API_KEY` in `~/noesis/.env` on `commons`; noesis was called mdc until 2026-11-02), and with it noesis's export. To renew: AWS Console → AppSync → roxana-roxana → Settings → create a new key for each (365-day max), then update the frontend's in both places above, including the Amplify Hosting environment variables, and noesis's in its `.env`. Do not re-enable CloudFormation-managed keys (`CreateAPIKey` stays `0` in `amplify/backend/api/roxana/parameters.json`): a CFN-managed key that expired in 2023 silently broke every `amplify push` for months. Update the dates in this section after renewing.

## Architecture

**Roxana** is a React/TypeScript SPA for structured rational discussions. Users propose ideas (propositions) and supporting/opposing arguments (arguments) expressed as discrete sentences; other participants accept, reject, or clear each sentence. AWS Amplify provides the full backend.

### Key directories

| Path | Purpose |
|------|---------|
| `src/features/discussion/` | Core feature — all discussion UI, Redux slice, GraphQL data access |
| `src/app/store.tsx` | Redux store (single `discussions` reducer) |
| `src/graphql/` | Auto-generated AppSync queries/mutations/subscriptions + `custom.js` for hand-written operations |
| `amplify/backend/api/roxana/schema.graphql` | Source of truth for the GraphQL schema |
| `cli/` | Standalone AWS SDK v3 tool for DynamoDB/AppSync inspection |

### Data flow

1. **State** lives in Redux (`discussionsSlice.tsx`). A discussion holds two sections: `propositions` and `arguments`, each containing `Sentence` objects.
2. **Persistence** — the Redux state is serialized to a string `layout` field before being written to DynamoDB via AppSync mutations (`data.tsx`).
3. **Sync queue** — optimistic UI updates go through an `eventQueue` in Redux state; a `syncIndicator` shows pending/synced status to the user.
4. **Real-time** — `onDiscussionById` AppSync subscription pushes remote changes back into Redux.
5. **Auth** — noesis's OAuth server (`noesis.rvanegas.co`), not Cognito (since 2026-11-02). Roxana is its public client `roxana` (PKCE, identity-only: the token answers noesis's `/me` and dianoia, nothing else). `src/features/user/auth.ts` runs the flow: `signIn` redirects to noesis's `/authorize`, which comes back to `/signin` (`completeSignIn`); the refresh token is in localStorage, the access token in memory (`getAccessToken`, also sent to dianoia). `AuthProvider`/`useAuth` (`User.tsx`) surface the user, whose username is their noesis user name. Local development signs in through `http://localhost:3000/signin`, which the client's registration names.

### Notable patterns

- **`dlog`** (`src/app/util.tsx`) — conditional debug logging enabled only for specific user IDs; use it instead of bare `console.log`.
- **Layout serialization** — `layout.tsx` handles converting the discussion object tree to/from the persisted string; touch this carefully when changing the `Sentence` or `Section` shape.
- **Cookie persistence** — user preferences (e.g., hidden discussants) stored via `universal-cookie`, not Redux.
- **Amplify UI** — components use `@aws-amplify/ui-react` primitives (`Flex`, `View`, `Text`); responsive breakpoints are inline via Amplify's `breakpoints` prop.
- **Draft.js** — rich-text sentence composition; keep Draft.js state separate from plain-text content stored in AppSync.

### GraphQL schema entities

- `Discussion` — top-level record with `layout`, `goalsSummary`, `inviteCode`, `isPrivate`
- `Sentence` — immutable content with voting arrays (`accepted`, `rejected`, `cleared`, `goal`) and `status` (`draft` | `committed`)
- `UserDiscussion` — join table tracking per-user participation timestamps
