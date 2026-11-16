# An argument's field shows its structure

Asked for and built 2026-11-15. An argument was typed and shown as a flat
list of proposition indexes, `1 2 3 4`. Its field now shows `1, 2, 3 -> 4`:
the justifiers, then an arrow, then the conclusion, the one structure every
argument already has (`src/features/discussion/argumentInput.ts`).

- **Storage is unchanged.** `content` keeps `1 2 3 4`, so everything that
  reads an argument's indexes (`propositionIndexesFromArgument`, the dianoia
  view, noesis's export) is untouched and no layout is migrated. Only the
  field formats it.
- **Any run of characters that are neither letters nor digits separates.**
  Punctuation carries no meaning when typed: `1 2, 3 -> 4` and `1, 2 3 4`
  are the same argument, and the field rewrites either as `1, 2, 3 -> 4` on
  leaving it. Letters still mark the field invalid.
- **Deliberately not built:** linked versus convergent premises and
  intermediate conclusions, which the task that asked for this had left
  open. This was the whole of what was wanted.
