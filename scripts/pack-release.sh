#!/bin/bash
set -euo pipefail

# Cortex Glimpse Release Packaging Script
#
# Produces:
# - cortex-glimpse-${version}.tgz (package tarball)
# - SHA256SUMS.txt (checksums for verification)
#
# This script packages the Cortex adapters, ops, and necessary runtime files
# while excluding development artifacts, secrets, and build outputs that can
# be regenerated.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=== Glimpse Cortex Package Release Builder ==="

# Read version from cortex-package.json
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Install with: apt install jq (or brew install jq)"
    exit 1
fi

VERSION=$(jq -r '.version' cortex-package.json)
if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
    echo "Error: Could not read version from cortex-package.json"
    exit 1
fi

echo "Version: $VERSION"

ARTIFACT_NAME="cortex-glimpse-${VERSION}.tgz"
CHECKSUMS_FILE="SHA256SUMS.txt"

# Clean previous artifacts
echo "Cleaning previous release artifacts..."
rm -f "$ARTIFACT_NAME" "$CHECKSUMS_FILE"

# Create a temporary staging directory
STAGING_DIR=$(mktemp -d)
trap "rm -rf '$STAGING_DIR'" EXIT

echo "Staging files to $STAGING_DIR..."

# Package structure:
# We include source code and package metadata, but exclude:
# - node_modules (can be reinstalled)
# - .git (version control)
# - .env* (secrets)
# - dist/ (can be rebuilt, but may include if small)
# - Local tmpdir state (game tables)
# - Development logs and caches

mkdir -p "$STAGING_DIR/glimpse"

# Core package files - using tar instead of rsync for portability
tar -C "$PROJECT_ROOT" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='*.swp' \
  --exclude='*~' \
  --exclude='.cursor' \
  --exclude='.vscode' \
  --exclude='dist' \
  --exclude='.output' \
  --exclude='.wrangler' \
  --exclude='terminals' \
  --exclude='*.tgz' \
  --exclude='SHA256SUMS.txt' \
  --exclude='reference' \
  --exclude='ITERATION_*.md' \
  --exclude='SMOKE_*.md' \
  --exclude='*_SUMMARY.md' \
  --exclude='*_FIXES.md' \
  --exclude='BUGS_*.md' \
  --exclude='FIXES_*.md' \
  --exclude='KNOWN_ISSUES.md' \
  --exclude='VIDEOJS_*.md' \
  --exclude='GLIMPSE_MANAGEMENT.md' \
  --exclude='ROUTINE_HOST.md' \
  --exclude='test-api.sh' \
  --exclude='smoke-test*.mjs' \
  -cf - . | tar -C "$STAGING_DIR/glimpse" -xf -

# Ensure critical package files are present
REQUIRED_FILES=(
  "cortex-package.json"
  "tools.manifest.json"
  "ops/index.js"
  "adapters/cortex/activate.js"
  "adapters/mcp/server.js"
  "PACKAGE.md"
  "README.md"
  "package.json"
)

echo "Verifying required files..."
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$STAGING_DIR/glimpse/$file" ]; then
    echo "Error: Required file missing: $file"
    exit 1
  fi
done

# Create tarball
echo "Creating tarball: $ARTIFACT_NAME"
tar -czf "$ARTIFACT_NAME" -C "$STAGING_DIR" glimpse

# Generate checksums
echo "Generating checksums: $CHECKSUMS_FILE"
sha256sum "$ARTIFACT_NAME" > "$CHECKSUMS_FILE"

# Display results
ARTIFACT_SIZE=$(du -h "$ARTIFACT_NAME" | cut -f1)
echo ""
echo "=== Release artifacts created ==="
echo "  Artifact:  $ARTIFACT_NAME ($ARTIFACT_SIZE)"
echo "  Checksums: $CHECKSUMS_FILE"
echo ""
echo "Contents:"
sha256sum "$ARTIFACT_NAME"
echo ""
echo "To verify: sha256sum -c $CHECKSUMS_FILE"
echo ""
echo "Package structure:"
tar -tzf "$ARTIFACT_NAME" | head -20
echo "... (see tarball for full contents)"
echo ""
echo "=== Build complete ==="
