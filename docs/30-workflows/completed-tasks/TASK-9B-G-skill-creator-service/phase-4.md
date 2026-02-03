# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 4                     |
| タスク | TASK-9B-G             |
| 機能名 | skill-creator-service |
| 作成日 | 2026-02-03            |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- Task 4-1: ScriptExecutorテスト作成
- Task 4-2: ResourceLoaderテスト作成
- Task 4-3: SkillCreatorServiceテスト作成
- Task 4-4: 境界値・エラーケーステスト作成

## 参照資料

| 資料名       | パス                                                               | 説明           |
| ------------ | ------------------------------------------------------------------ | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                       | 受け入れ基準   |
| 設計書       | `outputs/phase-2/architecture-design.md`                           | テスト対象設計 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`                          | 指摘事項       |
| 実装パターン | `aiworkflow-requirements: architecture-implementation-patterns.md` | テストパターン |

## 実行手順

### Task 4-1: ScriptExecutorテスト作成

`apps/desktop/src/main/services/skill/__tests__/ScriptExecutor.test.ts`

| テストケース         | 期待結果                        |
| -------------------- | ------------------------------- |
| 正常なスクリプト実行 | success: true, exitCode: 0      |
| スクリプト失敗       | success: false, exitCodeが0以外 |
| 存在しないスクリプト | エラーがthrowされる             |
| JSON出力スクリプト   | パースされたオブジェクトが返る  |
| タイムアウト         | 適切なエラーが返る              |

### Task 4-2: ResourceLoaderテスト作成

`apps/desktop/src/main/services/skill/__tests__/ResourceLoader.test.ts`

| テストケース         | 期待結果                            |
| -------------------- | ----------------------------------- |
| エージェント読み込み | agents/配下のファイル内容が返る     |
| スキーマ読み込み     | パースされたJSONオブジェクトが返る  |
| キャッシュ動作       | 2回目の読み込みはキャッシュから返る |
| 存在しないリソース   | エラーがthrowされる                 |
| キャッシュクリア     | 次回読み込みでファイルから読む      |

### Task 4-3: SkillCreatorServiceテスト作成

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

#### detectModeテスト

| テストケース         | 期待結果              |
| -------------------- | --------------------- |
| 曖昧なリクエスト     | collaborative モード  |
| 明示的なスキル作成   | create モード         |
| スキルパス指定       | update モード         |
| プロンプト最適化依頼 | improve-prompt モード |
| 実行エンジン選択依頼 | orchestrate モード    |

#### createSkillテスト

| テストケース        | 期待結果                              |
| ------------------- | ------------------------------------- |
| collaborativeモード | collaborativeワークフローが実行される |
| orchestrateモード   | orchestrateワークフローが実行される   |
| createモード        | createワークフローが実行される        |
| generateTasks: true | タスク仕様書が生成される              |
| 検証成功            | スキルディレクトリパスが返る          |

#### executeTasksテスト

| テストケース   | 期待結果                         |
| -------------- | -------------------------------- |
| 依存関係順実行 | トポロジカルソート順で実行される |
| 循環依存検出   | エラーがthrowされる              |
| 並列実行       | 独立タスクが並列実行される       |
| 失敗時中断     | 最初の失敗で中断される           |
| ドライラン     | 実行計画のみ返る                 |

### Task 4-4: 境界値・エラーケーステスト作成

| テストケース           | 期待結果                  |
| ---------------------- | ------------------------- |
| 空のタスクリスト       | 空のレポートが返る        |
| 全タスク失敗           | failed状態で全結果が返る  |
| スクリプトパス注入攻撃 | エラーで拒否される        |
| 無効なJSON出力         | パースエラーがthrowされる |

## 統合テスト連携【必須】

| シナリオカテゴリ       | 検証内容                              | テストファイル        |
| ---------------------- | ------------------------------------- | --------------------- |
| スクリプト実行テスト   | ScriptExecutor → scripts/\*.js連携    | `*.script.test.ts`    |
| リソース読み込みテスト | ResourceLoader → ファイルシステム連携 | `*.resource.test.ts`  |
| モード判定テスト       | detect_mode.js連携                    | `*.mode.test.ts`      |
| タスク実行テスト       | 依存関係解決・並列実行                | `*.execution.test.ts` |

## アーキテクチャ層別テスト

| 層           | テスト観点                 | テストファイル配置                                         |
| ------------ | -------------------------- | ---------------------------------------------------------- |
| Main Process | サービス、ビジネスロジック | `apps/desktop/src/main/services/skill/__tests__/*.test.ts` |
| Shared       | 型定義、ユーティリティ     | `packages/shared/src/types/__tests__/*.test.ts`            |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断             | 仕様参照先                                   |
| ------------------ | -------------------- | -------------------------------------------- |
| テスタビリティ     | テスト可能な設計     | `aiworkflow-requirements: testing-*.md`      |
| エラーハンドリング | 例外処理のテスト     | `aiworkflow-requirements: error-handling.md` |
| 境界値テスト       | エッジケースのカバー | -                                            |

## 成果物

| 成果物                    | パス                                                                         | 説明         |
| ------------------------- | ---------------------------------------------------------------------------- | ------------ |
| テスト仕様書              | `outputs/phase-4/test-specification.md`                                      | テスト設計   |
| テストケース              | `outputs/phase-4/test-cases.md`                                              | ケース一覧   |
| ScriptExecutorテスト      | `apps/desktop/src/main/services/skill/__tests__/ScriptExecutor.test.ts`      | テストコード |
| ResourceLoaderテスト      | `apps/desktop/src/main/services/skill/__tests__/ResourceLoader.test.ts`      | テストコード |
| SkillCreatorServiceテスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テストコード |

## 完了条件

- [ ] ScriptExecutorのテストが作成されている
- [ ] ResourceLoaderのテストが作成されている
- [ ] SkillCreatorServiceのテストが作成されている
- [ ] 境界値・エラーケーステストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標（80%+）が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 4-1: ScriptExecutorテスト作成
3. Task 4-2: ResourceLoaderテスト作成
4. Task 4-3: SkillCreatorServiceテスト作成
5. Task 4-4: 境界値・エラーケーステスト作成
6. Red状態の確認
7. 成果物の作成・配置

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] 全テストがRed状態

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9B-G-skill-creator-service --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
