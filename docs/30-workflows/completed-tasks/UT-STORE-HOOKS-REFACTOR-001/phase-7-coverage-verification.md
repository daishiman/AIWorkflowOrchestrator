# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 7                           |
| 機能名 | UT-STORE-HOOKS-REFACTOR-001 |
| 作成日 | 2026-02-11                  |

## 目的

Phase 6で拡充したテスト結果を検証し、Zustand Store Hooks個別セレクタ化のカバレッジ基準を満たすことを確認する。

## 実行タスク

- カバレッジ再測定: authModeSlice, llmSlice, agentSliceのテストカバレッジ再計測
- 結合テスト実行: モジュール間インターフェーステストの実行と結果確認
- ゲート判定: カバレッジ基準の達成確認と未達時の対応判断

## 参照資料

| 資料名         | パス                                     | 説明                 |
| -------------- | ---------------------------------------- | -------------------- |
| テスト拡充結果 | `outputs/phase-6/coverage-report.md`     | Phase 6成果物        |
| 結合テスト設計 | `outputs/phase-6/integration-test.md`    | Phase 6成果物        |
| 品質基準       | `.claude/rules/02-code-quality.md`       | TDDカバレッジ基準    |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P31` | 無限ループ問題の教訓 |

## 実行手順

### 1. ユニットテストカバレッジ再測定

```bash
# 対象Sliceのカバレッジ測定
pnpm --filter @repo/desktop test:coverage -- --coverage.include="src/renderer/store/slices/authModeSlice.ts" --coverage.include="src/renderer/store/slices/llmSlice.ts" --coverage.include="src/renderer/store/slices/agentSlice.ts"
```

### 2. 結合テスト実行

```bash
# モジュール間インターフェーステスト
pnpm --filter @repo/desktop test -- --grep "integration"
```

### 3. カバレッジ基準の確認

以下の基準を満たしているか検証する:

| 指標              | 最低基準 | 推奨基準 | 必達 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | 必須 |
| Branch Coverage   | 60%      | 70%      | 必須 |
| Function Coverage | 80%      | 90%      | 必須 |

### 4. 未達時の対応

カバレッジ未達や結合テスト失敗がある場合、Phase 6へ戻って拡充する。

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                      | 基準 | 結果       |
| ----------------------------- | ---- | ---------- |
| authModeSlice Line Coverage   | 80%+ | {{RESULT}} |
| authModeSlice Branch Coverage | 60%+ | {{RESULT}} |
| llmSlice Line Coverage        | 80%+ | {{RESULT}} |
| llmSlice Branch Coverage      | 60%+ | {{RESULT}} |
| agentSlice Line Coverage      | 80%+ | {{RESULT}} |
| agentSlice Branch Coverage    | 60%+ | {{RESULT}} |
| モジュール間インターフェース  | 100% | {{RESULT}} |

## 検証対象詳細

### authModeSlice

| テスト項目                  | 検証内容                                |
| --------------------------- | --------------------------------------- |
| useAuthMode()               | 認証モード値の取得                      |
| useSetAuthMode()            | 認証モード値の設定                      |
| useInitializeAuthMode()     | 初期化処理（IPC経由のデフォルト値取得） |
| useAuthModeStore() 後方互換 | 既存の合成Hookが正常動作すること        |

### llmSlice

| テスト項目                     | 検証内容                         |
| ------------------------------ | -------------------------------- |
| useLLMProvider()               | LLMプロバイダー値の取得          |
| useSetLLMProvider()            | LLMプロバイダー値の設定          |
| useLLMModel()                  | LLMモデル値の取得                |
| useSetLLMModel()               | LLMモデル値の設定                |
| 個別セレクタの再レンダー最適化 | 不要な再レンダーが発生しないこと |

### agentSlice

| テスト項目              | 検証内容                 |
| ----------------------- | ------------------------ |
| useSelectedSkill()      | 選択中スキル値の取得     |
| useSetSelectedSkill()   | 選択中スキル値の設定     |
| useAvailableSkills()    | 利用可能スキル一覧の取得 |
| useSetAvailableSkills() | 利用可能スキル一覧の設定 |

## 成果物

| 成果物             | パス                                  | 説明                       |
| ------------------ | ------------------------------------- | -------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果                 |
| 結合テスト結果     | `outputs/phase-7/integration-test.md` | モジュール間テスト実行結果 |

## 完了条件

- [ ] authModeSlice: Line 80%+, Branch 60%+, Function 80%+
- [ ] llmSlice: Line 80%+, Branch 60%+, Function 80%+
- [ ] agentSlice: Line 80%+, Branch 60%+, Function 80%+
- [ ] モジュール間インターフェーステスト 100% 成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ユニットテストカバレッジ再測定
3. 結合テスト実行
4. カバレッジ基準達成確認
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001 --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
