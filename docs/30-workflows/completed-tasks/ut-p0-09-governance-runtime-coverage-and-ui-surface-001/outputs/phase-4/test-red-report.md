# Phase 4: テスト RED 確認レポート

作成日: 2026-04-02

## 作成したテストファイル

### 1. GovernanceSummaryPanel.test.tsx

**ファイル**: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx`

| TC      | テストケース                                                | 期待状態               |
| ------- | ----------------------------------------------------------- | ---------------------- |
| TC-R-01 | state.phase が正しく表示される                              | Phase 5 実装後に GREEN |
| TC-R-02 | permissionMode が表示される                                 | Phase 5 実装後に GREEN |
| TC-R-03 | recentDenials リストが表示される（最大5件）                 | Phase 5 実装後に GREEN |
| TC-R-04 | recentDenials が空の場合は "No recent denials" が表示される | Phase 5 実装後に GREEN |
| TC-R-05 | IPC 取得失敗時にフォールバックが表示される                  | Phase 5 実装後に GREEN |
| TC-R-06 | session summary（audit event 数）が表示される               | Phase 5 実装後に GREEN |
| TC-R-07 | 定期ポーリングが設定される（useEffect + setInterval）       | Phase 5 実装後に GREEN |

### 2. GovernanceAllPhases.test.ts

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`

| TC      | テストケース                                                   | 期待状態               |
| ------- | -------------------------------------------------------------- | ---------------------- |
| TC-G-01 | plan フェーズで createGovernanceHooks("plan") が呼ばれる       | Phase 5 実装後に GREEN |
| TC-G-02 | verify フェーズで createGovernanceHooks("verify") が呼ばれる   | Phase 5 実装後に GREEN |
| TC-G-03 | improve フェーズで createGovernanceHooks("improve") が呼ばれる | Phase 5 実装後に GREEN |
| TC-G-04 | plan フェーズで Write ツールが拒否される                       | 既存コードで GREEN     |
| TC-G-05 | verify フェーズで Write ツールが拒否される                     | 既存コードで GREEN     |
| TC-G-06 | improve フェーズで Read ツールが許可される                     | 既存コードで GREEN     |
| TC-G-07 | getGovernanceState() が現在フェーズを正確に返す                | 既存コードで GREEN     |

## 状態

- GovernanceSummaryPanel テスト: コンポーネント未実装のため RED（Phase 5 実装後に GREEN 予定）
- GovernanceAllPhases テスト: 既存 governance 層が実装済みのため GREEN（Phase 4 の目的は新規テストの定義）

## 備考

- TC-G-01〜G-03 は `createHooks()` 関数経由で audit event の phase フィールドを検証する
- TC-G-04〜G-06 は `canUseTool()` 直接呼び出しで policy 設定を検証する
- TC-G-07 は `RuntimeSkillCreatorFacade` 最小インスタンスで `getGovernanceState()` を検証する
