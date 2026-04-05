# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| Phase名    | 要件定義                                    |
| カテゴリ   | 要件                                        |
| 前提Phase  | なし                                        |
| 後続Phase  | Phase 2                                     |
| タスク分類 | 新機能（Feature Gap 系） — コード実装を含む |

## 目的

TASK-P0-05 のスコープ・受入条件・前提条件を確定し、既存実装の状態を正確に把握する。
特に「実装済み部分」と「未完了部分」の境界を明確にし、Phase 2 以降の作業量を最小化する。

## Step 0: P50チェック（必須）

Phase 1 開始前に、対象ファイルの既存実装状態を確認し、重複作成を防止する。

### 確認対象ファイル

| ファイル                     | パス                                      | 確認コマンド               |
| ---------------------------- | ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/` | `grep -n "TASK-P0-05\\     | Step 3\\.5\\                                                                                | parseLlmResponseToContent\\                                                   | skillFileWriter" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| SkillFileWriter.ts           | `apps/desktop/src/main/services/skill/`   | `grep -n "persist\\        | validateSkillName\\                                                                         | rollback" apps/desktop/src/main/services/skill/SkillFileWriter.ts`            |
| parseLlmResponseToContent.ts | `apps/desktop/src/main/services/runtime/` | `grep -n "export\\         | SkillGeneratedContent" apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` |
| SkillCreatorOutputHandler.ts | `apps/desktop/src/main/services/runtime/` | `grep -n \"toSlug\\        | saveSkill\\                                                                                 | handleSessionComplete\\                                                       | SKILL_START\" apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`    |
| skillCreator.ts（型定義）    | `packages/shared/src/types/`              | `grep -n \"persistResult\\ | persistError\\                                                                              | RuntimeSkillCreatorExecuteResult\" packages/shared/src/types/skillCreator.ts` |

### P50 確認結果記録テンプレート（Current Facts 前提）

```markdown
| ファイル                                  | 実装状態             | 備考                                                         |
| ----------------------------------------- | -------------------- | ------------------------------------------------------------ |
| RuntimeSkillCreatorFacade.ts Step 3.5-3.6 | 実装済み             | parseLlmResponseToContent + SkillFileWriter.persist 呼び出し |
| SkillFileWriter.ts                        | 実装済み（28テスト） | persist / validateSkillName / rollback                       |
| parseLlmResponseToContent.ts              | 実装済み（14テスト） | コードブロック抽出・分類                                     |
| SkillCreatorOutputHandler.ts              | 別系統として存続     | session-complete パイプライン。toSlug はパス安全             |
| RuntimeSkillCreatorExecuteResult 型       | 定義済み             | persistResult / persistError フィールドあり                  |
```

## 実行タスク

### タスク1: 既存実装の動作状態確認

**目的**: Step 3.5-3.6 の実装コードが正しく動作するかテスト実行で確認する。

**手順**:

1. `SkillFileWriter` 単体テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=SkillFileWriter
   ```

2. `parseLlmResponseToContent` 単体テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=parseLlmResponseToContent
   ```

3. `persist-integration` 統合テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
   ```

4. テスト結果を記録する（全パス / 一部失敗 / 全失敗）。

**期待される成果物**:

- テスト実行結果記録（`outputs/phase-1/test-execution-results.md`）

### タスク2: SkillCreatorOutputHandler.ts の調査

**目的**: 二重実装リスクを排除し、OutputHandler の扱いと別パイプラインとしての位置付けを決定する。

**手順**:

1. `SkillCreatorOutputHandler.ts` を読み、以下を確認する：
   - 抽出アプローチ（マーカーベース + フォールバック）
   - 保存先
   - `dirName` 生成（`toSlug()` がパス安全であること）
   - 呼び出し経路（`SkillCreatorIpcBridge` 経由であること）

2. 結果を `outputs/phase-1/output-handler-investigation.md` に記録する。

**期待される成果物**:

- OutputHandler 調査結果（`outputs/phase-1/output-handler-investigation.md`）

### タスク3: スコープ定義（AC確定）

**目的**: 受入条件（AC-1〜）を確定し、Phase 2 の設計入力にする。

**手順**:

1. AC を確定する（persist 成功/失敗/スキップ/DI 未注入/パストラバーサル/ロールバック等）。
2. AC と検証方法（テストID）を `outputs/phase-1/scope-definition.md` に記録する。

**期待される成果物**:

- スコープ定義書（`outputs/phase-1/scope-definition.md`）

## 統合テスト連携（Current Facts）

| カテゴリ         | テスト観点                                                  | 該当テスト              |
| ---------------- | ----------------------------------------------------------- | ----------------------- |
| persist 正常系   | persist が正しい引数で呼ばれる / persistResult が設定される | F-01, F-02              |
| persist 失敗     | persistError が設定される                                   | F-03, E-10 ~ E-15, E-27 |
| persist スキップ | コードブロックなし / execute失敗 / parse null               | F-05, F-06, E-28        |
| DI 未注入        | warn + 正常終了                                             | F-04, E-16, E-29        |
| PATH_TRAVERSAL   | skillName が危険な場合に拒否される                          | E-11, E-21 ~ E-23       |
| rollback         | 部分失敗時のロールバック                                    | E-24, E-25              |
| 回帰ガード       | executeResult の必須フィールド維持                          | E-26 ~ E-29             |

## 成果物

| 成果物                 | 配置先                                            | 形式     |
| ---------------------- | ------------------------------------------------- | -------- |
| OutputHandler 調査結果 | `outputs/phase-1/output-handler-investigation.md` | Markdown |
| スコープ定義書         | `outputs/phase-1/scope-definition.md`             | Markdown |
