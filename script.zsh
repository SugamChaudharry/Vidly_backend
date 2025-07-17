#!/bin/zsh

# Array of commit messages
commit_messages=(
  "chore: remove old JS files"
  "feat: migrate app and constants to TS"
  "feat: migrate controllers to TS"
  "feat: migrate middlewares to TS"
  "feat: migrate models to TS"
  "feat: migrate routes to TS"
  "feat: migrate db config and index"
  "feat: migrate utils to TS"
  "chore: add tsconfig and nodemon config"
  "refactor: clean up and finalize migration"
)

# Initial date
current_date="2025-07-01"

# File groups for each commit
file_groups=(
  ".vscode/settings.json package.json package-lock.json pnpm-lock.yaml src/*.js"
  "src/app.ts src/constants.ts"
  "src/controllers/*.ts"
  "src/middlewares/*.ts"
  "src/models/*.ts"
  "src/routes/*.ts"
  "src/db/index.ts src/index.ts"
  "src/utils/*.ts"
  "tsconfig.json nodemon.json"
  "."  # catch-all cleanup
)

# Loop over 10 commits
for i in {1..10}; do
  echo "\n📦 Commit #$i on $current_date"

  # Expand and add files properly using eval
  eval "git add ${file_groups[$i]}"

  # Use GIT environment variables to backdate the commit
  GIT_AUTHOR_DATE="$current_date 10:00:00" \
  GIT_COMMITTER_DATE="$current_date 10:00:00" \
  git commit -m "${commit_messages[$i]}"

  # Increment date randomly by 1–2 days
  increment=$((RANDOM % 2 + 1))
  current_date=$(date -d "$current_date +$increment day" +%Y-%m-%d)
done
