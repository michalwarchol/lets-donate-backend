#!/bin/bash

# 🚫 Safety: Skip if last commit was a version bump
last_commit_msg=$(git log -1 --pretty=%B)
if [[ $last_commit_msg =~ ^chore:\ bump\ version\ to\ [0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "🛑 Last commit was a version bump. Skipping script to prevent loop."
  exit 0
fi

# Abort if there are uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Uncommitted changes detected. Please commit or stash them before running this script."
  exit 1
fi

# Get current version from package.json
current_version=$(jq -r .version package.json)
echo "📦 Current version: $current_version"

# Prompt for new version
read -p "🔢 Enter the new version to overwrite with: " new_version

# Validate version format (basic check)
if ! [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Invalid version format. Use semantic versioning, e.g., 1.2.3"
  exit 1
fi

# Overwrite version in package.json
jq --arg v "$new_version" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json

# Commit changes
git add package.json
git commit -m "chore: bump version to $new_version"

echo "✅ Version updated and committed: $new_version"