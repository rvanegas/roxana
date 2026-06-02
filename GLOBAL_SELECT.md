# Global Select Mode

Select mode is now a shared, real-time state visible to all participants in a discussion.

## How it works

`selectMode`, `selectedPropositions`, and `selectedArguments` are serialized into the `layout` JSON string that is persisted to DynamoDB via AppSync. The existing `updateDiscussion` mutation and `onDiscussionById` subscription broadcast the state to all connected clients whenever it changes.

## Behavior

- **Entering select mode** — any authenticated user can enter select mode via the hamburger menu. All other clients receive the subscription update within milliseconds and switch to select mode immediately.
- **Frozen edits** — while select mode is active, all editing is disabled for every user (existing `readOnly` check in `SentenceLine.tsx`).
- **Live selection** — each checkbox toggle writes to DynamoDB and propagates to all clients, so everyone sees the same set of selected propositions and arguments in real time.
- **Exiting select mode** — the user who initiated (or any user) can press cancel. The cleared selection is broadcast and all clients return to normal editing mode.
- **Creating from selection** — the "new" button creates a new discussion from the current selection, then exits select mode.

## Files changed

| File | Change |
|------|--------|
| `src/features/discussion/layout.tsx` | `createDiscussionLayout` now includes `selectMode`, `selectedPropositions`, `selectedArguments` in the serialized JSON |
| `src/features/discussion/data.tsx` | `updateDiscussionLayout` passes selection state; four new thunks (`enterSelectMode`, `exitSelectMode`, `toggleSelectProposition`, `toggleSelectArgument`) persist each change immediately |
| `src/features/discussion/discussionsSlice.tsx` | `updateDiscussion` reads select state from incoming subscription data and applies it to Redux state |
| `src/App.tsx` | Uses `enterSelectModeAction` / `exitSelectModeAction` thunks instead of raw slice actions |
| `src/features/discussion/SentenceLine.tsx` | Uses `toggleSelectPropositionAction` / `toggleSelectArgumentAction` thunks instead of raw slice actions |
