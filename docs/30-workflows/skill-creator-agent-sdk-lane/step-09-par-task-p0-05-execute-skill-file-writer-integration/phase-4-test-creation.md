# Phase 4: テスト作成（TDD-Red） - タスク仕様書

## メタ情報

| 項目      | 内容                  |
| --------- | --------------------- |
| Phase     | 4                     |
| Phase名   | テスト作成（TDD-Red） |
| カテゴリ  | テスト                |
| 前提Phase | Phase 3               |
| 後続Phase | Phase 5               |

## 目的

既存テストの網羅性を確認し、Phase 1-3 で特定された不足テストケースを追加計画として確定する。
本タスクの persist 統合テストは **22件**（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）が current facts。

## 実行タスク

### タスク1: 既存テストの確認・実行

**目的**: persist-integration / SkillFileWriter / parseLlmResponseToContent の各テストが Green であることを確認する。

**手順**:

1. persist-integration テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
   ```

2. SkillFileWriter 単体テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=SkillFileWriter
   ```

3. parseLlmResponseToContent テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=parseLlmResponseToContent
   ```

4. 結果を整理する（例: `outputs/phase-4/existing-test-results.md`）。

### タスク2: 不足テストの特定（統合観点）

**目的**: AC とテストの対応が、旧来の「`E-11` が正常系」前提になっていないか点検し、現行のテスト構成に合わせる。

**Current Facts（persist-integration）**:

- 正常系: `F-01`, `F-02`
- 失敗系: `F-03`
- スキップ系: `F-05`（コードブロックなし）, `F-06`（execute失敗）, `E-28`（parse null）
- DI未注入: `F-04`, `E-16`, `E-29`
- PATH_TRAVERSAL: `E-11`（Writer エラーの伝播）, `E-21〜E-23`（統合観点の入力バリエーション）
- rollback: `E-24〜E-25`
- 回帰ガード: `E-26〜E-29`

**期待される成果物**:

- 不足テスト分析（`outputs/phase-4/missing-test-analysis.md`）

## 成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| 不足テスト分析 | `outputs/phase-4/missing-test-analysis.md` | Markdown |
