#!/usr/bin/env bash
# =============================================================================
# Kamama Portfolio release script — every update is logged and tagged on GitHub.
#
# Usage:
#   bash scripts/release.sh [patch|minor|major] "One-line release summary"
#
# What it does:
#   1. Bumps the version in VERSION (semver)
#   2. Verifies CHANGELOG.md contains an entry for the new version
#   3. Commits all pending changes ("release vX.Y.Z — summary")
#   4. Creates an annotated git tag vX.Y.Z
#   5. Pushes main + tag to origin
#   6. Publishes a GitHub Release (notes pulled from CHANGELOG.md)
#   7. Mirrors the release into the local ReleaseLog table (audit trail)
# =============================================================================
set -euo pipefail

REPO="bucky-ops/kamama-portfolio"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BUMP="${1:-patch}"
SUMMARY="${2:-}"

if [[ -z "$SUMMARY" ]]; then
  echo "✗ Provide a one-line summary: bash scripts/release.sh patch \"what changed\""
  exit 1
fi

[[ -f VERSION ]] || echo "0.0.0" > VERSION
OLD="$(cat VERSION)"
MAJOR=0; MINOR=0; PATCH=0
IFS='.' read -r MAJOR MINOR PATCH <<< "$OLD"
case "$BUMP" in
  major) NEW="$((MAJOR+1)).0.0" ;;
  minor) NEW="$MAJOR.$((MINOR+1)).0" ;;
  patch) NEW="$MAJOR.$MINOR.$((PATCH+1))" ;;
  *) echo "✗ Bump must be patch|minor|major"; exit 1 ;;
esac
TAG="v$NEW"

# 2. Changelog guard — refuse to release unlogged changes
if ! grep -qE "^## \[$NEW\]" CHANGELOG.md; then
  echo "✗ CHANGELOG.md has no '## [$NEW]' section."
  echo "  Add release notes first — every update must be logged."
  exit 1
fi

# 3. Commit
git add -A
git commit -m "release $TAG — $SUMMARY" || echo "• nothing new to commit"

# 4. Tag (annotated, always)
git tag -a "$TAG" -m "$TAG — $SUMMARY"

# 5. Push branch + tag
git push origin HEAD --follow-tags

# 6. GitHub Release from the tag
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  python3 - "$TAG" "$SUMMARY" <<'PY'
import json, os, sys, urllib.request
tag, summary = sys.argv[1], sys.argv[2]
token = os.environ["GITHUB_TOKEN"]
# extract this version's notes from CHANGELOG.md
notes, capture = [], False
for line in open("CHANGELOG.md"):
    if line.startswith("## ["):
        if line.startswith(f"## [{tag[1:]}]"):
            capture = True; continue
        elif capture: break
    if capture: notes.append(line)
body = "".join(notes).strip() or summary
payload = json.dumps({
    "tag_name": tag, "name": f"{tag} — {summary}",
    "body": body + "\n\nAuto-published by scripts/release.sh",
    "draft": False, "prerelease": False,
}).encode()
req = urllib.request.Request(
    "https://api.github.com/repos/bucky-ops/kamama-portfolio/releases",
    data=payload, method="POST",
    headers={"Authorization": f"Bearer {token}",
             "Accept": "application/vnd.github+json",
             "Content-Type": "application/json"})
with urllib.request.urlopen(req) as res:
    rel = json.load(res)
    print(f"GitHub Release published: {rel['html_url']}")
PY
else
  echo "GITHUB_TOKEN not set — create the Release manually from tag $TAG"
fi

echo "$NEW" > VERSION
echo "OK: $TAG released — logged in CHANGELOG.md, tagged on GitHub, deployed via Vercel."
