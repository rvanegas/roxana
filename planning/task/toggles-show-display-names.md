# Toggles show display names

Decided 2026-11-09, at noesis's prompt (noesis
`planning/decision/2026-11-09-a-channel-s-voices-are-its-members.md`). A sentence's
`accepted`, `rejected`, `cleared` and `goal` lists show people by user name.
They should show each person's display name, the one The Floor shows, which
is stored at auth.rvanegas.co (dianoia-auth's task
`display-names-are-stored-here.md`).

- **The lists keep user names.** They identify the people, and the signed-in
  `username` is matched against them (`discussionsSlice.tsx`, `data.tsx`).
  Only what is shown changes.
- **The display name comes from auth**: the signed-in person's from the
  token's `name` claim, everybody else's from auth's lookup by user name. A
  user name auth does not know is shown as itself.

noesis's export now fills `accepted`, `rejected` and `goal` for a channel's
argument, with each member's user name in every sentence, so a discussion
opens with every member's stances already set.
