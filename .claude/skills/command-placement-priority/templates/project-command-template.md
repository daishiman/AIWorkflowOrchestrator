# プロジェクトコマンドテンプレート

```markdown
---
description: [Project-specific workflow]
---

# [Command Name]

## Project Context

Project: [project name]
Team: [team name]
Purpose: [specific project need]

## Execution

[Project-specific steps]

## Notes

- This command is specific to [project]
- Requires: [project dependencies]
- Team usage: [how team uses this]
```

## 例

```markdown
---
description: Deploy to staging with project-specific validation
---

# deploy-staging

## Project Context

Project: ecommerce-platform
Team: Backend team
Purpose: Staging deployment with inventory validation

## Pre-deployment

Check inventory service health
Validate database migrations

## Deploy

Execute deployment to staging
Run smoke tests

## Notify

Slack notification to #backend channel
```
