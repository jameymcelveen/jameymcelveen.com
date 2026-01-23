#!/bin/bash
# Helper script to update session notes timestamp
# Usage: ./update-session-notes.sh

SESSION_NOTES=".cursor/session-notes.md"

if [ ! -f "$SESSION_NOTES" ]; then
  echo "Error: $SESSION_NOTES not found"
  exit 1
fi

# Update the "Last Updated" date
sed -i '' "s/^\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $(date +%Y-%m-%d)/" "$SESSION_NOTES"

echo "✓ Updated session notes timestamp to $(date +%Y-%m-%d)"
