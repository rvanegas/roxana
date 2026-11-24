# Renew the AppSync API key before 2027-06-07

Found 2026-11-05; read again 2026-11-23. The manually made AppSync API key
expires **2027-06-07** (both Roxana AppSync APIs' keys show that date). Start
by **2027-03-07**, three months ahead, the operator's rule for expiring
credentials since 2026-11-05.

It is used in three places, each updated after renewing: the frontend
(`VITE_APPSYNC_API_KEY`, the Amplify app's environment variables), noesis
(`roxana_api_key` in its config, which was mdc's when this was first noted),
and `aws-exports.js`. Renew in the AWS Console → AppSync → roxana-roxana →
Settings (365 days at most), as CLAUDE.md describes.

Keep `CreateAPIKey: 0` in `amplify/backend/api/roxana/parameters.json`: a
key CloudFormation managed expired in 2023 and silently broke every
`amplify push` until July 2026.
