# Phase 11: スクリーンショットカバレッジ

## カバレッジ一覧

| TC-ID    | 証跡                                                                          | 画面状態           | 判定 |
| -------- | ----------------------------------------------------------------------------- | ------------------ | ---- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-chat-blocked-light.png`                | Chat blocked       | PASS |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-settings-after-guidance-cta-light.png` | Settings after CTA | PASS |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-chat-ready-light.png`                  | Chat ready         | PASS |
| TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-workspace-blocked-light.png`           | Workspace blocked  | PASS |

## 集計

| 指標     | 値   |
| -------- | ---- |
| expected | 4    |
| covered  | 4    |
| coverage | 100% |

## deferred visual follow-up

| 対象                                                      | 理由                              |
| --------------------------------------------------------- | --------------------------------- |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001`        | secondary CTA handler 未実装      |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` | retryConnection UI/IPC 契約未実装 |

## 検証メモ

- すべての screenshot は `manual-test-result.md` に証跡として紐付いている
- `phase11-capture-metadata.json` の checks と coverage 判定が一致している
