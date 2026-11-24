# Remove the unused Cognito user pool

Found 2026-11-02, due from 2026-11-05; still there on 2026-11-23. Roxana
stopped signing in through Cognito on 2026-11-02 (`ed24ab9`, `b7228fb`), and
signs in through dianoia-auth since 2026-11-09. The pool
`us-west-2_JBus4am8w` (`roxana31481408_userpool_31481408-roxana`, 71 users,
their email addresses among them) and the Amplify app's
`VITE_COGNITO_IDENTITY_POOL_ID`, `VITE_COGNITO_USER_POOL_ID` and
`VITE_COGNITO_WEB_CLIENT_ID` were kept only in case the switch had to be
undone. An unused identity holding people's addresses should not linger.

1. Export the pool's users (usernames and emails) as a record of the old
   accounts, kept outside any repository.
2. Amplify app `d1gtwcafz2d83t` → Environment variables: delete the three
   `VITE_COGNITO_*`.
3. The Amplify Gen 1 backend, in this order: the AppSync API's additional
   auth provider `AMAZON_COGNITO_USER_POOLS`
   (`amplify/backend/backend-config.json`, `api/roxana/cli-inputs.json`,
   `AuthCognitoUserPoolId` in `api/roxana/parameters.json`), then the `auth`
   resource `roxana31481408` (the pool and its identity pool), then
   `amplify push` with profile `amplify`. Keep `CreateAPIKey` at `0`
   (CLAUDE.md).
4. Update rvanegas-site's `PROJECTS.md` (Roxana's section names the pool) and
   this repository's CLAUDE.md.

Fits with step 5 of rvanegas-site's move to twohands.co, which touches the
same Amplify app.
