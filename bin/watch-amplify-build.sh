#!/usr/bin/env bash
#
# Watch the latest Amplify Hosting build for the roxana master branch.
# Polls the most recent job until it reaches a terminal state.
#
# Usage: bin/watch-amplify-build.sh [interval_seconds]
#   interval_seconds  poll interval (default: 15)
#
# Requires the AWS CLI and the `amplify` profile.

set -euo pipefail

APP_ID="d1gtwcafz2d83t"
BRANCH="master"
PROFILE="amplify"
REGION="us-west-2"
INTERVAL="${1:-15}"

aws_amplify() {
  aws amplify "$@" --app-id "$APP_ID" --branch-name "$BRANCH" \
    --profile "$PROFILE" --region "$REGION" --output json
}

latest_job_id() {
  aws_amplify list-jobs --max-items 1 \
    | python3 -c 'import json,sys; jobs=json.load(sys.stdin).get("jobSummaries",[]); print(jobs[0]["jobId"] if jobs else "")'
}

JOB_ID="$(latest_job_id)"
if [[ -z "$JOB_ID" ]]; then
  echo "No build jobs found for $APP_ID/$BRANCH." >&2
  exit 1
fi

echo "Watching Amplify build: app=$APP_ID branch=$BRANCH job=$JOB_ID (poll ${INTERVAL}s)"
echo

while true; do
  read -r STATUS COMMIT MSG < <(
    aws_amplify get-job --job-id "$JOB_ID" \
      | python3 -c 'import json,sys
j=json.load(sys.stdin)["job"]["summary"]
print(j.get("status",""), j.get("commitId","")[:8], j.get("commitMessage","").splitlines()[0] if j.get("commitMessage") else "")'
  )

  printf '[%s] job %s  %-10s  %s  %s\n' "$(date +%H:%M:%S)" "$JOB_ID" "$STATUS" "$COMMIT" "$MSG"

  case "$STATUS" in
    SUCCEED|FAILED|CANCELLED)
      echo
      echo "Build finished: $STATUS"
      [[ "$STATUS" == "SUCCEED" ]] && exit 0 || exit 1
      ;;
  esac

  sleep "$INTERVAL"
done
