# Phase 13 成果物: CI結果

## PR作成時点の状態

| チェック                    | 状態        | URL                                                                                            |
| --------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| Build macOS (Apple Silicon) | IN_PROGRESS | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651166/job/66757025333` |
| Lint                        | IN_PROGRESS | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651171/job/66757025448` |
| Build Shared                | IN_PROGRESS | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651171/job/66757025429` |
| Security Audit              | IN_PROGRESS | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651171/job/66757025455` |
| Module Sync Check           | SUCCESS     | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651171/job/66757025446` |
| E2E Test (desktop)          | SUCCESS     | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651171/job/66757025444` |
| Auto Label PR / label       | SUCCESS     | `https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/22992651177/job/66757025117` |

## 判定

- `mergeStateStatus`: `UNSTABLE`
- 理由: 主要 check が進行中のため
- 方針: merge 可否は CI 完了後に再確認する
