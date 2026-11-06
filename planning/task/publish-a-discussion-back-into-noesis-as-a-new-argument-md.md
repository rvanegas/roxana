# Publish a discussion back into noesis, as a new `.argument.md`

Asked for 2026-11-05. The way between the projects runs one way today: noesis
extracts an argument through dianoia and exports it here
(`noesis/cmd_export.py`), and nothing comes back. This is the return: from a
discussion, a person publishes the argument as it now stands into their own
noesis library, as a **new** `.argument.md` file, one of the roles noesis
gives a dated file.

- **New, never a replacement.** A discussion is public dialectic and belongs
  to no one (rvanegas-site `CLAUDE.md`), so what comes back is a new file in
  the publisher's library, dated the day it is published. It never
  overwrites the `.argument.md` the discussion was exported from, which
  noesis's `exports.json` still maps to it.
- **Into whose library:** the signed-in person's own, since they sign in
  through noesis as the public client `roxana`.
- **noesis has to accept it, and today it does not.** That client is
  identity-only: its tokens answer `/me` alone. The Floor files text through
  the `import` scope, which only the operator grants
  (`scripts/client_imports.py`), to a confidential client. Granting it to a
  public client is a decision in its own right. noesis's import also takes
  only chats and documents (`IMPORTABLE` in `noesis/cmd_import.py`), so an
  argument is new there as well. That work is noesis's, on a branch in its
  repository.
- **The format is noesis's:** the inverse of `cmd_export.py`'s mapping, from
  Roxana's sentences (indices, justifiers first, conclusion last) back to
  noesis's argument. Still to decide: whether the participants' acceptances
  and rejections, and dianoia's analysis, come back with it, and how the
  file names the discussion it came from.
