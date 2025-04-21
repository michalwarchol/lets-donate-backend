#!/bin/bash

# 🚫 Skip if last commit was a version bump
last_commit_msg=$(git log -1 --pretty=%B)
if [[ $last_commit_msg =~ ^chore:\ bump\ version\ to\ [0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "🛑 Last commit was a version bump. Skipping to prevent loop."
  exit 0
fi

# ❌ Abort if there are uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Uncommitted changes detected. Please commit or stash them before running this script."
  exit 1
fi

# 📦 Read current version using grep/sed
current_version=$(grep '"version"' package.json | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
echo "📦 Current version: $current_version"

# 🔢 Prompt for new version
read -p "🔢 Enter the new version to overwrite with: " new_version

# ✅ Validate version format
if ! [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Invalid version format. Use semantic versioning, e.g., 1.2.3"
  exit 1
fi

# 🛠 Replace version line in package.json
sed -i.bak -E "s/\"version\": *\"[^\"]+\"/\"version\": \"$new_version\"/" package.json
rm package.json.bak

# ✅ Commit changes
git add package.json
git commit -m "chore: bump version to $new_version"

echo "✅ Version updated and committed: $new_version"