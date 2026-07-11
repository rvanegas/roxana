# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (Vite, port 3000)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

Node 24.13.0 required (see `.node-version`). No test suite configured.

The `cli/` directory is a separate TypeScript tool for AWS admin operations; run it independently with its own `npm` commands.

## aws-exports.js

`aws-exports.js` is gitignored (contains secrets) but required to run the app. The production values can be found in the AWS Console:
- **AppSync endpoint and API key**: AppSync → roxana-roxana → Settings
- **Cognito user pool and client**: Cognito → User pools → roxana31481408_userpool_31481408-roxana
- **Identity pool**: Cognito → Identity pools

## ⚠️ AppSync API key expires 2027-06-07

**If today is on or after 2027-05-07, remind the user immediately** — even if the current task is unrelated: the manually created AppSync API key (used by the frontend via `VITE_APPSYNC_API_KEY`, by mdc via `roxana_api_key` in `~/.config/mdc/config.toml`, and in `aws-exports.js`) expires **2027-06-07** and the app loses all API access when it does. To renew: AWS Console → AppSync → roxana-roxana → Settings → create a new key (365-day max), then update it in all three places above, including the Amplify Hosting environment variables. Do not re-enable CloudFormation-managed keys (`CreateAPIKey` stays `0` in `amplify/backend/api/roxana/parameters.json`): a CFN-managed key that expired in 2023 silently broke every `amplify push` for months. Update the dates in this section after renewing.

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
5. **Auth** — AWS Cognito via `Amplify.Auth`; the authenticated user is surfaced through `src/features/user/`.

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
