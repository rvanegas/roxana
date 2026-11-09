# Toggles show display names

Decided at noesis's prompt on 2026-11-09, and built the same day (noesis
`planning/decision/2026-11-09-a-channel-s-voices-are-its-members.md`). People
in a discussion were shown by user name. They are now shown by the display
name they keep at auth.rvanegas.co, the one The Floor shows (dianoia-auth's
`display-names-are-stored-here`).

- **The lists keep user names.** `accepted`, `rejected`, `cleared`, `goal`
  and the discussants identify people, and the signed-in `username` is
  matched against them, so no stored layout changes and none is migrated.
  Only what is shown changes: the discussant toggles, a sentence's details,
  and who is in each private discussion on the list.
- **Where the names come from** (`src/features/user/displayNames.ts`): the
  signed-in person's from `/me`'s `display_name`, and everybody else's from
  auth's `GET /names/display`, with the signed-in person's token, asked at
  most once per user name per page load. A user name with no display name,
  or one nobody signed in could ask about, is shown as itself.
- **`goalsSummary` keeps user names.** It is stored text, written whenever
  the discussion is saved, and a name in it would go stale whenever the
  person renamed themselves.

noesis's export fills `accepted`, `rejected` and `goal` for a channel's
argument with each member's user name, so a discussion opens with the
members' stances already set, shown by these names.
