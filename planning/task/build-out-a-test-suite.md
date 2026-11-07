# Build out a test suite

Asked for 2026-11-06. `npm test` runs Vitest over `test/`, and the suite so
far holds one test: that `CLAUDE.md` is within technosophia's cap. Nothing
in the app is covered. This is the rest of it, starting where a mistake
costs most and a test costs least.

- **The pure functions first**, since they need no AWS and no DOM:
  `layout.tsx` (parsing and creating a discussion's layout, the round trip
  between them), `discussionsSlice.tsx`'s reducers and helpers
  (`nextUniqueIndex`, `forcedPropositionPositions`,
  `propositionIndexesFromArgument`), `util.tsx`'s `toAlphaIndex`, and in
  `data.tsx` `insertBeforeConclusion` and `substituteSymbol`, which rewrite
  an argument's text when a recommendation is applied.
- **Then `data.tsx`'s thunks against a mocked Amplify client**: the event
  queue, and above all `makePrivate` and `makePublic`, which change who can
  see a discussion. *Public dialectic has no owner* (rvanegas-site
  `CLAUDE.md`), so a test that an exported discussion never gains a
  `UserDiscussion` row or an invite code holds that rule here.
- **`src/cli.ts`**: that `rename` and `privatize` change nothing without
  `--confirm`.
- **Components last**, if at all: they would need jsdom and Testing
  Library, and the logic worth testing is mostly in the files above.
- **`src/App.test.js` and `src/setupTests.js` are the Create React App
  template's**, from the first commit, and have never run: their
  dependencies are not installed. Delete them; `vite.config.ts` limits the
  suite to `test/` until then.
- **Nothing runs the suite automatically.** Amplify's build runs only `npm
  run build`, and its machine has no `~/src/technosophia`, so the
  `CLAUDE.md` test cannot run there as it stands. Decide whether the build
  runs the app's tests, and if so, how that one is skipped there.
