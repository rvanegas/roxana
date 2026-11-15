# Represent argument structure in the argument input field

Asked for 2026-11-15. An argument is typed today as a flat list of
proposition indices separated by whitespace, justifiers first and conclusion
last (`setDisplayFromArgumentInput` in `SentenceLine.tsx`): anything but
digits and whitespace, a repeated index, or one naming a missing or
uncommitted proposition marks the field invalid. So the field can say only
"these support that"; it cannot say how the justifiers support the
conclusion. This task is to let the field carry that structure.

- **What structure.** Still to decide: which premises work together (linked)
  and which stand alone (convergent), and intermediate conclusions, so that
  one argument can chain through a sub-argument. Whatever is chosen should
  match what dianoia and noesis already mean by an argument's structure, so
  that noesis's export (`cmd_export.py`) and the return in
  `publish-a-discussion-back-into-noesis-as-a-new-argument-md.md` carry it
  instead of flattening it.
- **The syntax** is still to design: something typed in the one line, such
  as grouping or an arrow, that stays quick to write and still reads as
  indices. A bare list of indices should keep meaning what it means now.
- **Where it lands.** The sentence's `content` is the input as typed, and the
  layout stores it (`layout.tsx`), so a richer syntax needs no schema change;
  but everything that reads an argument's indices (the argument view,
  `inArgument`, the dianoia view) parses that string and has to learn the
  structure, or at least to ignore it.
