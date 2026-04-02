# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 6                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

Phase 5 実装に対して fail path・回帰ガード・補助テストを追加し、テストカバレッジを目標値に近づける。

## 実行タスク

- タスク1: GovernanceSummaryPanel の fail path テスト追加
- タスク2: 全フェーズ配線の回帰ガード追加
- タスク3: エッジケーステスト追加

## 参照資料

| 資料名         | パス                                                                                                 | 説明   |
| -------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| Phase 4 テスト | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | 拡充元 |
| Phase 4 テスト | `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`            | 拡充元 |

## 実行手順

### ステップ1: GovernanceSummaryPanel fail path テスト

追加テストケース:

- `TC-R-08`: ネットワーク遅延時にローディング表示
- `TC-R-09`: 500件以上の audit event 時のパフォーマンス（メモリリークなし）
- `TC-R-10`: コンポーネントアンマウント時にポーリングが停止する

### ステップ2: 全フェーズ配線回帰ガード

追加テストケース:

- `TC-G-08`: フェーズ切り替え時に currentGovernancePhase が更新される
- `TC-G-09`: 不正なフェーズ名が渡された場合のエラーハンドリング
- `TC-G-10`: 複数セッションの並行実行時に正しいフェーズが維持される

### ステップ3: エッジケーステスト

- recentDenials が null/undefined の場合の表示
- activePolicy.allowedTools が空配列の場合の表示

## 統合テスト連携

- 全テスト実行: `pnpm --filter @repo/desktop test -- --run governance`
- 全テスト PASS 確認

## 成果物

| 成果物     | パス                                        | 説明                 |
| ---------- | ------------------------------------------- | -------------------- |
| 拡充テスト | `outputs/phase-6/test-expansion-summary.md` | 追加テストケース一覧 |

## 完了条件

- [ ] fail path テストが追加されている（3件）
- [ ] 回帰ガードテストが追加されている（3件）
- [ ] エッジケーステストが追加されている
- [ ] 全テストが PASS
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
