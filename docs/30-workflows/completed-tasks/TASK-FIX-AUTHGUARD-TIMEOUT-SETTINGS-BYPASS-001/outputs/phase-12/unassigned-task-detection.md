# 未タスク検出レポート - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase    | 12 - Task 4                                    |
| 検出日   | 2026-03-10                                     |
| 検出件数 | 0件                                            |

## 検出方法

1. `App.tsx` と `shouldResetUnauthenticatedView.ts` を再監査し、Settings bypass と未認証 reset 条件の矛盾を確認
2. `SettingsView` / `AccountSection` を再監査し、未認証時の degrade 動作を確認
3. Phase 11 の実スクリーンショット 4 件を目視確認
4. 対象テスト 6 files / 110 tests を再実行

## 再監査結果

| 候補                                                         | 再判定       | 根拠                                                                                                                        |
| ------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| UT-AUTHGUARD-004: `currentView` reset から `settings` を除外 | 解消済み     | `shouldResetUnauthenticatedView()` を追加し、`settings` を公開ビューとして除外した                                          |
| UT-AUTHGUARD-001: Settings 内の認証依存セクション分離        | 未タスク不要 | `AccountSection` は未認証時にログイン CTA を表示する既存 degrade 実装があり、`AccountSection.test.tsx` 55件で担保されている |
| UT-AUTHGUARD-002: fallback アニメーション追加                | 未タスク不要 | 現行要件は機能修正と到達性確保であり、animation は品質向上候補だが defect ではない                                          |
| UT-AUTHGUARD-003: timeout 時間の設定可能化                   | 未タスク不要 | `AUTH_TIMEOUT_MS = 10_000` で要件充足。現スコープでは設定 UI / 永続化追加の必要なし                                         |

## 判定

今回のタスク範囲で追加作成すべき未タスクは **0件**。

## 配置・監査エビデンス

| 検証                                                                                                       | 結果                                           | 判定                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                        | `total=213 / existing=213 / missing=0`         | PASS                                             |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | `currentViolations=0 / baselineViolations=130` | PASS（今回差分は健全、legacy baseline は別管理） |

### 解釈

- 今回差分に由来する未タスク指示書の新規作成漏れはない。
- `docs/30-workflows/unassigned-task/` 配下には legacy なフォーマット負債が残るが、今回タスク起因ではないため open 未タスク 0 件の判定を維持する。
- したがって、今回タスク向けに追加配置すべき未タスクファイルはない。

## 補足

- 以前の有効候補だった reset 問題は、本タスク内で修正済み。
- 画面系の懸念は screenshot と targeted tests で再確認したが、新規 backlog 化が必要な欠陥は見つからなかった。
