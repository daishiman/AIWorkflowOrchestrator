# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

Phase 4 のテストでカバーしきれなかった異常系・境界値・回帰ガードのテストを追加する。

## 実行タスク

### Task 1: assertNoSilentFallback 異常系テスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`

| ID   | テストケース                                           | 期待結果                       |
| ---- | ------------------------------------------------------ | ------------------------------ |
| T-13 | setSelectedLLMConfig(null) 後の assertNoSilentFallback | throw                          |
| T-14 | 複数回の set → reset → assert のシーケンス             | 最後の状態に基づいて正しく動作 |
| T-15 | エラーの name プロパティが "LLMConfigNotSelectedError" | Error.name の検証              |

### Task 2: ExecutionEnvironment 回帰ガードテスト追加

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx`

| ID   | テストケース                                                | 期待結果                                       |
| ---- | ----------------------------------------------------------- | ---------------------------------------------- |
| T-16 | environmentType="html" に handoffGuidance を渡しても無視    | HTMLPreviewEnvironment が表示                  |
| T-17 | environmentType="none" のデフォルト動作が維持される         | noPreview Placeholder が表示                   |
| T-18 | handoffGuidance の各フィールドが TerminalHandoffCard に渡る | terminalCommand, contextSummary, reason が表示 |

## 参照資料

| 資料名         | パス                                                                | 説明           |
| -------------- | ------------------------------------------------------------------- | -------------- |
| Phase 4 テスト | `docs/30-workflows/execution-env-terminal/phase-4-test-creation.md` | 初回テスト設計 |

## 統合テスト連携

- 拡充テスト含めた全テスト実行: `cd apps/desktop && pnpm vitest run`
- 回帰テスト: 既存の html/markdown 環境テストが引き続き PASS すること

## 成果物

| 成果物               | パス                                                                                              | 説明                 |
| -------------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| テスト拡充（ガード） | `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`                              | 異常系テスト追加     |
| テスト拡充（UI）     | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx` | 回帰ガードテスト追加 |

## 完了条件

- [ ] T-13〜T-18 のテストが追加されている
- [ ] 全テスト（T-1〜T-18）が PASS する
- [ ] 既存テストに回帰がない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 7: カバレッジ確認
