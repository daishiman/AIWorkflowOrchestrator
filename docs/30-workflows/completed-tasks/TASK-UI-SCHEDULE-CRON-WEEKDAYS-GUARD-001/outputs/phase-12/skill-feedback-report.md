# Phase 12: スキルフィードバックレポート

## タスクID

TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## フィードバック

| ID    | 内容                                                                                                    | 種別     |
| ----- | ------------------------------------------------------------------------------------------------------- | -------- |
| FB-01 | `docs-only` タスクでは `index.md` と `artifacts.json` に分類情報を明記すると validator の解釈が安定する | 改善提案 |
| FB-02 | `NON_VISUAL` タスクでも `phase11` の補助成果物を明示しておくと、後続の検証が簡単になる                  | 知見     |
| FB-03 | `outputs/artifacts.json` を task root 直下に置くと、Phase 10 / 11 / 12 の漏れ確認がしやすい             | 改善提案 |

## 反映提案

- task-specification-creator では docs-only / NON_VISUAL のメタ情報を標準項目に寄せる
- Phase 11 のテンプレートに「スクリーンショット不要判定」の欄を固定で持たせる
