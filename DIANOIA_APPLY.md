# Plan: Integrate Dianoia AI Evaluation into Roxana

## Context

Roxana is a collaborative discussion platform where users write discrete propositions and logical arguments, then vote on them. Noesis is a React frontend and Dianoia is a FastAPI backend that evaluate logical arguments using Claude — giving truth scores, validity scores, and improvement recommendations for each proposition.

The integration opportunity is natural: Roxana propositions are already discrete logical claims, and Dianoia's `ContentEvaluationAgent` is designed to evaluate exactly this kind of structured argument. Showing AI-generated truth scores alongside peer voting adds a new, independent signal to discussions.

**Design constraint**: This first integration must be entirely opt-in, non-disruptive to existing workflows, and require no backend changes. All analysis state lives in React context, not Redux.

---

## What to Integrate (First Step Only)

**Feature**: An "analyze" button inside each committed proposition's sentence modal. Clicking it sends all committed propositions to Dianoia and shows truth score results inline in the modal once complete. A global progress indicator in the navbar shows whether analysis is in flight or complete.

**Scope**: Propositions only (mapped as `assumptions` to Dianoia), not arguments. Roxana argument sentences contain only the referenced proposition indices ("1 2 3"), not a natural-language conclusion — mapping them meaningfully to Dianoia requires a future design decision. Deferring arguments keeps this integration clean and truthful.

**Not in scope**: Formalization, improvement recommendations, formal validity evaluation, argument validity — these require multi-step workflows not appropriate for a first integration.

---

## Architecture

### State: DianoiaContext

Because analysis status must be readable by both `App.tsx` (navbar indicator) and `SentenceLine.tsx` (modal results), state lives in a React context provided at the top of the app — not in `Discussion.tsx` local state and not in Redux.

`src/features/discussion/DianoiaContext.tsx` exports:
- `DianoiaProvider` — wraps the app; owns all fetch/poll logic and state
- `useDianoia()` — hook returning `{ status, results, startAnalysis }`

State shape:
```ts
status: 'idle' | 'loading' | 'done' | 'error'
results: Record<string, string> | null  // keyed by proposition symbol → truth_score string
```

`startAnalysis(propositions: Sentence[], discussionId: string)` — called from `SentenceLine.tsx` when the user clicks "analyze". Triggers the POST + poll sequence. Clears previous results before starting.

`sessionId`: generated once at module level in `DianoiaContext.tsx` via `crypto.randomUUID()`.

### Data Mapping (Roxana → Dianoia)

Committed Roxana propositions become Dianoia `assumptions`. Dianoia `argument` array is sent empty.

```
POST /api/argument/replace?conversation_id=<sessionId>:<discussionId>&snapshot_id=1
Body:
{
  assumptions: propositions
    .filter(s => s.status === 'committed' && !s.hidden)
    .map(s => ({
      symbol: String(s.index),
      proposition: s.content,
      justifiers: [],
      truth_score: ""
    })),
  argument: [],
  file_ids: []
}
```

`snapshot_id`: fixed string `"1"` (Roxana has no snapshot model; re-analysis always overwrites).

### Result Polling

After `POST /api/argument/replace` returns, poll:
```
GET /api/agents/results?conversation_id=<sessionId>:<discussionId>&snapshot_id=1
```
every 1 second until `tasks_complete: true`. Stop polling and display results.

### Configuration

`VITE_DIANOIA_URL` env var (e.g., `http://localhost:8000`). When unset or empty, the "analyze" button is not rendered and the navbar indicator is not rendered — feature is invisible by default.

Set `VITE_DIANOIA_URL=https://dianoia.rvanegas.com` in `.env` for both local dev and production. For local Dianoia dev, override with `http://localhost:8000`.

Dianoia's `main.py` already configures `allow_origins: ["*"]`, so CORS is handled.

---

## Files to Create

### `src/features/discussion/DianoiaContext.tsx` (new, ~100 lines)

- Module-level `sessionId = crypto.randomUUID()`
- `DianoiaContext` with `{ status, results, startAnalysis }`
- `DianoiaProvider` component: owns `useState` for `status` and `results`, implements `startAnalysis` (POST → poll → set results), clears interval on unmount
- `useDianoia()` hook: `return useContext(DianoiaContext)`
- Gracefully handles `VITE_DIANOIA_URL` missing (startAnalysis is a no-op)

---

## Files to Modify

### `src/features/discussion/SentenceLine.tsx`

Two changes inside the existing `sentenceModal()` function:

**1. "Analyze" button** — added to `modalActions` when all three hold:
```tsx
if (section === 'propositions' && sentence.status === 'committed' && import.meta.env.VITE_DIANOIA_URL) {
  modalActions.push(
    <Button key="analyze" variation="link" size="small"
      onClick={() => startAnalysis(allPropositions, discussionId)}>
      analyze
    </Button>
  )
}
```

**2. Per-proposition result** — displayed inside the modal below the action buttons when results are available for this sentence:
```tsx
const score = results?.[String(sentence.index)]
if (score) {
  // render a colored badge: green if score >= 0.7, yellow if >= 0.4, red otherwise
}
```

Use `useDianoia()` at the top of `SentenceLine` to access `startAnalysis` and `results`. Pass `allPropositions` (the full `discussions.propositions` array) and `discussionId` to `startAnalysis`.

### `src/App.tsx`

Add a Dianoia progress indicator to the left of `syncIndicatorIfAny` in **both** responsive layout spots (lines ~143 and ~161).

```tsx
const { status: dianoiaStatus } = useDianoia()
const dianoiaIndicator = import.meta.env.VITE_DIANOIA_URL && dianoiaStatus !== 'idle'
  ? <View className={`dianoia-indicator dianoia-${dianoiaStatus}`} title={`Dianoia: ${dianoiaStatus}`} />
  : null
```

Render order in each navbar Flex: `{dianoiaIndicator}` then `{syncIndicatorIfAny}` then `{navbarRight}`.

Also wrap the existing JSX with `<DianoiaProvider>` at the outermost return level.

### `src/features/discussion/discussion.css` (or `src/App.css`)

Add styles for `.dianoia-indicator` — same size/shape as `.indicator` (the existing sync dot), with distinct colors:
- `.dianoia-loading` — pulsing blue/gray dot
- `.dianoia-done` — solid blue dot (or checkmark color)
- `.dianoia-error` — solid orange dot

### `.env` (local only, not committed)

```
VITE_DIANOIA_URL=https://dianoia.rvanegas.com
```

---

## Key Implementation Notes

- **Do NOT put analysis state in Redux** — that would risk triggering AppSync sync writes. Keep all Dianoia state in `DianoiaContext`.
- **`crypto.randomUUID()`** is available in modern browsers; use it at module level in `DianoiaContext.tsx` so it persists across re-renders.
- **Content evaluator results** come in the `content_evaluator` key of the `/api/agents/results` response. Confirm the exact shape against Noesis's `AllAgentResults.tsx` lines 200-400 before implementing the results parser.
- **Don't port `AllAgentResults.tsx`** wholesale (963 lines). Extract only truth scores from `content_evaluator` results.
- **Dianoia unreachable**: if the POST fails or polling times out, set `status = 'error'` and show a neutral error state in the indicator; don't crash.

---

## Reference Files

- `src/features/discussion/SentenceLine.tsx` — add "analyze" button + score display to sentenceModal
- `src/App.tsx` — add DianoiaProvider wrapper + dianoia-indicator in navbar
- `src/features/discussion/discussionsSlice.tsx` — read-only, for Sentence type
- `src/features/discussion/discussion.d.ts` — Sentence type definition
- `/Users/rodvandur/src/dianoia/src/api/argument.py` — `/replace` and agent polling endpoints
- `/Users/rodvandur/src/dianoia/src/schemas/arguments.py` — `Arguments` request body schema
- `/Users/rodvandur/src/dianoia/src/schemas/step.py` — `Step` schema
- `/Users/rodvandur/src/noesis/src/AllAgentResults.tsx` lines 200-400 — reference for parsing `content_evaluator` results

---

## Verification

1. Add `VITE_DIANOIA_URL=https://dianoia.rvanegas.com` to `roxana/.env`
2. Start Roxana: `npm start`
3. Open a discussion with committed propositions
4. Click a committed proposition to open its modal — "analyze" button should appear
5. Click "analyze" — modal closes; Dianoia progress indicator appears to the left of the sync dot in the navbar, pulsing while in flight
6. After ~5–15 seconds, indicator changes to "done" state; open any proposition modal to see its truth score badge
7. Without `VITE_DIANOIA_URL` set: "analyze" button and navbar indicator should not appear at all

---

## Future Phases (Not in This Plan)

- **Argument validity**: Requires adding a natural-language conclusion field to Roxana's argument sentence model (backend schema change needed)
- **Improvement recommendations**: Requires formalization workflow (multi-step, needs dedicated UI)
- **Enhanced irrationality detection**: Use content evaluator's incoherent set detection rather than pure vote-pattern analysis
- **Collaborative analysis**: Share analysis results via AppSync so all participants see scores (requires backend changes)
