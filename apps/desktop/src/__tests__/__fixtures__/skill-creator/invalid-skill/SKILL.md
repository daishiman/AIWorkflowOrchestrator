---
name: fixture-invalid-skill
description: This is invalid: because of unquoted colon
allowed-tools: not-an-array
---

# Invalid Skill

This fixture intentionally contains invalid YAML frontmatter for testing error detection.
The description field contains an unquoted colon and allowed-tools is a string instead of an array.
