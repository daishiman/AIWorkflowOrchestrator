# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| ステータス | 未実施                          |
| 作成日     | 2026-04-21                      |

## 目的

`SkillCreatorService` の `update` モードにおける実処理の欠落を正確に把握し、実装に必要な前提条件・スコープ・テスト戦略を確定する。曖昧な前提のまま設計・実装フェーズに進まず、このフェーズで事実ベースの情報を収集する。

## 実行タスク

### Step 0: P50チェック（前提確認）

- 依存タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` の完了確認
  - `git log --oneline -10` で成果物コミットを特定する
  - dispatch 修正内容（どのファイルが変更されたか）を把握する
- 現ブランチの差分確認: `git diff main...HEAD` でスコープ外の変更がないことを確認する
- 既存テスト PASS 確認: `pnpm --filter @repo/desktop test SkillCreatorService` を実行し、現状のテスト通過率を記録する

### Step 1: 既存コード棚卸し

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` を読み込み、以下を確認する
  - `case "update":` ブロック（L412-415）の現状（スタブ確認）
  - `runCreateWorkflow()` メソッド（L980-1003）の実処理パターンを把握する
  - `extractPurposeWithLlm()` メソッド（L1051-1073）のシグネチャと動作を把握する
  - `throwIfAborted()` の使用パターンを全箇所確認する
  - `llmClient` フィールド（L176）の型・初期化方法を確認する
- `update` モードの `PROGRESS_FLOWS`（L138-152）を確認し、各ステップの percentage・message を記録する

### Step 2: SKILL.md フォーマット分析

- 既存スキルの SKILL.md（例: `.claude/skills/task-specification-creator/SKILL.md`）を読み込み、frontmatter の構造を把握する
- name・description・purpose フィールドの位置・フォーマットを記録する
- YAML frontmatter のパースに使用できる既存ユーティリティが存在するか確認する

### Step 3: 関連テストファイル確認

- 以下のテストファイルの構造・テストID・モックパターンを確認する
  - `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
  - `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts`
  - `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- 新規テストファイル `SkillCreatorService.update.test.ts` の命名規則が既存と整合していることを確認する

### Step 4: 型定義確認

- `@repo/shared/types` の `SkillCreatorMode`・`CreateSkillOptions` を確認する
- `update` モードの引数（`options.name`・`options.description`）が利用可能か確認する
- `runUpdateWorkflow()` が受け取るべき引数の型を確定する

### Step 5: テスト戦略の方針決定

- TDD（Red → Green → Refactor）で進めることを確認する
- テストケース一覧（Phase 4 で詳細化する前の一覧）を列挙する
  - 正常系: LLMなしで SKILL.md が更新される
  - 正常系: LLMありで purpose が再生成される
  - 異常系: AbortSignal 中断（各ステップ）
  - 異常系: SKILL.md が存在しない場合のエラーハンドリング

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- GitHub Issue #2318（CLOSED）

## 受入基準

| ID     | 基準                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| P1-001 | 依存タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` の完了コミットが確認できること |
| P1-002 | `case "update":` ブロックのスタブ状態が記録されていること                               |
| P1-003 | `runCreateWorkflow()` のパターンが把握されていること                                    |
| P1-004 | SKILL.md の frontmatter 構造が記録されていること                                        |
| P1-005 | テスト戦略の方針が確定していること                                                      |

## 成果物

- `outputs/phase-1/code-audit.md`（コード棚卸し結果）
- `outputs/phase-1/skill-md-format.md`（SKILL.md フォーマット分析）
- `outputs/phase-1/test-strategy.md`（テスト戦略方針）

## 統合テスト連携

Phase 1 は調査・分析フェーズであるため、コード変更は行わない。既存テストが引き続き PASS していることを `pnpm --filter @repo/desktop test SkillCreatorService` で確認し、調査作業が既存テストを破壊していないことを記録する。

## サブタスク管理

| サブタスクID | 内容                             | 担当Step |
| ------------ | -------------------------------- | -------- |
| ST-1-01      | 依存タスク完了確認               | Step 0   |
| ST-1-02      | `case "update":` スタブ確認      | Step 1   |
| ST-1-03      | `runCreateWorkflow` パターン把握 | Step 1   |
| ST-1-04      | SKILL.md フォーマット分析        | Step 2   |
| ST-1-05      | 既存テストファイル確認           | Step 3   |
| ST-1-06      | 型定義確認                       | Step 4   |
| ST-1-07      | テスト戦略方針確定               | Step 5   |

## タスク 100% 実行確認【必須】

全サブタスク完了後、以下を確認すること:

- [ ] 全 Step が完了していること
- [ ] 成果物が `outputs/phase-1/` に出力されていること
- [ ] 既存テストが PASS していること
- [ ] Phase 2 への進行可否が判定されていること

## 次 Phase

Phase 1 完了後、成果物をもとに [Phase 2: 設計](phase-2-design.md) へ進む。
