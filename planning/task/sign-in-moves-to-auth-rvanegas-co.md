# Sign-in moves to auth.rvanegas.co

Decided 2026-11-08 (rvanegas-site
`planning/task/one-sign-in-for-every-project-at-auth-rvanegas-co.md`, which
is the design): noesis's OAuth server becomes a
service of its own, `auth.rvanegas.co`, with SSO and passkeys to follow.

Roxana's part, in Phase 1: `src/features/user/auth.ts` signs in at auth
(`VITE_AUTH_URL` where `VITE_NOESIS_URL` serves sign-in) as the same
identity-only public client, and `currentUser` reads auth's `/me`. Nothing
else changes; SSO and passkeys then come with no change here.

**Built 2026-11-08, not deployed:** branch `auth-sign-in`. Its build is the
cut-over's last step, after auth carries the `roxana` client and its people's
refresh tokens over from noesis.
