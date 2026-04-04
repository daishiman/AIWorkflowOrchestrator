# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 4                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

実装前にテストを先行作成し（TDD Red）、GovernanceSummaryPanel と全フェーズ governance 配線の期待動作を定義する。

## 実行タスク

- タスク1: GovernanceSummaryPanel レンダリングテスト作成
- タスク2: 全フェーズ governance 配線テスト作成
- タスク3: テストが RED（失敗）状態であることを確認

## 参照資料

| 資料名         | パス                                                           | 説明               |
| -------------- | -------------------------------------------------------------- | ------------------ |
| Phase 2 設計書 | `outputs/phase-2/ui-design.md`                                 | コンポーネント仕様 |
| 既存テスト     | `apps/desktop/src/main/services/runtime/__tests__/governance/` | 参照パターン       |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                    | テスト用型         |

## 実行手順

### ステップ1: GovernanceSummaryPanel テスト作成

**ファイル**: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx`

テストケース:

- `TC-R-01`: `state.phase` が正しく表示される（Props なし）
- `TC-R-02`: permissionMode が表示される
- `TC-R-03`: recentDenials リストが表示される（最大5件）
- `TC-R-04`: recentDenials が空の場合は "No recent denials" が表示される
- `TC-R-05`: IPC 取得失敗時にフォールバックが表示される
- `TC-R-06`: session summary（audit event 数）が表示される
- `TC-R-07`: 定期ポーリングが設定される（useEffect + setInterval）

### ステップ2: 全フェーズ governance 配線テスト作成

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`

テストケース:

- `TC-G-01`: plan フェーズで createGovernanceHooks("plan") が呼ばれる
- `TC-G-02`: verify フェーズで createGovernanceHooks("verify") が呼ばれる
- `TC-G-03`: improve フェーズで createGovernanceHooks("improve") が呼ばれる
- `TC-G-04`: plan フェーズで Write ツールが拒否される
- `TC-G-05`: verify フェーズで Write ツールが拒否される
- `TC-G-06`: improve フェーズで Read ツールが許可される
- `TC-G-07`: getGovernanceState() が現在フェーズを正確に返す

### ステップ3: RED 確認

```bash
pnpm --filter @repo/desktop test -- --run GovernanceSummaryPanel
pnpm --filter @repo/desktop test -- --run GovernanceAllPhases
```

期待結果: 全テストが FAIL（実装前なので）

## 統合テスト連携

- 既存の governance テスト（130+ tests）が引き続き PASS していることを確認
- 新規テストは FAIL を確認（TDD Red）

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断 | 仕様参照先                           |
| ------------ | -------- | ------------------------------------ |
| テスト網羅性 | 適用     | Happy path + Error path のカバレッジ |
| TDD 原則     | 適用     | 実装前に失敗することを確認           |

## 成果物

| 成果物             | パス                                                                                                 | 説明           |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------------- |
| UIテストファイル   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | コード成果物   |
| 配線テストファイル | `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`            | コード成果物   |
| RED確認レポート    | `outputs/phase-4/test-red-report.md`                                                                 | テスト失敗確認 |

## 完了条件

- [ ] GovernanceSummaryPanel テストが作成されている（7テストケース）
- [ ] GovernanceAllPhases テストが作成されている（7テストケース）
- [ ] 全新規テストが RED（FAIL）状態である
- [ ] 既存 governance テストが PASS 継続している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理【Phase開始時】

1. 参照資料の確認
2. GovernanceSummaryPanel テスト作成
3. GovernanceAllPhases テスト作成
4. RED 確認実行
5. RED 確認レポート作成
6. artifacts.json 更新

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 5: 実装
