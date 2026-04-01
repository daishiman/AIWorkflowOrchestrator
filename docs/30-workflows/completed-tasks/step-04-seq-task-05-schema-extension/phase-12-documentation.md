# Phase 12: ドキュメント更新 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 12                     |
| 機能名    | schema-extension       |
| タスクID  | TASK-LLM-MOD-05        |
| 作成日    | 2026-03-23             |
| 依存Phase | Phase 11（手動テスト） |

## 目的

実装ガイドの作成、システム仕様書の更新、未タスクの検出・記録を行い、TASK-LLM-MOD-05 を完全に完了する。

## 実行タスク

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生レベルの概念説明（日常的なアナロジー）

**ファイル**: `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/implementation-guide.md`

**作成内容（Part 1）:**

メニュー表のたとえ話を使って説明する:

> AIモデルを選ぶ画面は、レストランのメニュー表のようなものです。
>
> 今まで、メニューには料理名と価格しか書いていませんでした（モデルID、モデル名のみ）。
> でも、「このパスタって、どんな料理なの？」と思うお客さんもいますよね。
>
> そこで、メニューの「説明文欄（description）」を追加しました。
> これで「最も多機能なモデル（Most capable multimodal model）」のように、
> 各AIモデルの特徴を表示できるようになります。
>
> ただし、今回は「メニューのテンプレートに説明文欄を作っただけ」で、
> まだ実際のメニュー表（UI画面）に表示する部分は完成していません。
> それは次のタスクでやります。

**作成内容（Part 2）:**

開発者向けの技術詳細:

> **変更の概要**
>
> `PROVIDER_CONFIGS`（`apps/desktop/src/main/handlers/llm.ts`）のモデル配列要素型に
> `description?: string` フィールドを追加し、各モデルに説明文を設定した。
>
> **変更点**
>
> 1. `PROVIDER_CONFIGS` インライン型: `description?: string` を追加（L36）
> 2. 全13モデルエントリに `description` 値を設定（30文字以内の英語）
>
> **変更不要だった部分**
>
> - `LLMModelSchema`（`packages/shared/src/types/llm/schemas/provider.ts:35`）:
>   `description: z.string().optional()` が既に定義済みだったため変更なし
> - `handleGetProviders()`（`llm.ts:206-222`）:
>   `models: config.models` で直接代入しているため変更なし
>
> **データフロー**
>
> ```
> PROVIDER_CONFIGS（description値あり）
>   ↓ handleGetProviders() が config.models をそのまま返す
> LLMProvider[] （models[n].description を含む）
>   ↓ IPC: LLM_GET_PROVIDERS
> Renderer（model.description で参照可能）
> ```

### Task 12-2: システム仕様書更新

以下のファイルを更新する（3ファイル以内/サブエージェントに分割、P43対策）:

#### Step 1-A: タスク完了記録

- [ ] 対象仕様書（LLM関連）にタスク完了記録を追加する
  - 検索: `grep -rn "TASK-LLM-MOD-05\|schema-extension" .claude/skills/`
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了を記録する（**2ファイル両方**、P1対策）
- [ ] `task-specification-creator/LOGS.md` にタスク完了を記録する
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] LLM関連のインターフェース仕様書（`interfaces-llm.md` 等）を検索して実装ステータスを確認する
  ```bash
  find .claude/skills -name "*.md" | xargs grep -l "LLMModel\|description" 2>/dev/null
  ```

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-LLM-MOD-05" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新する

#### Step 1-D: topic-map.md 再生成（P2対策）

- [ ] 仕様書に変更があれば必ず再生成する
  ```bash
  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
  ```

#### Step 2: システム仕様更新（該当する場合）

- [ ] `LLMModel` 型の `description` フィールドが既存であることをシステム仕様書に記録する（新規インターフェース変更ではないため軽微な記録のみ）

### Task 12-3: documentation-changelog.md の記録

**注意（P4対策）**: 全 Step 確認後に「完了」と記載する。各 Step の結果を事後記録すること。

**記録内容（事後記録）:**

- Step 1-A: LOGS.md 2ファイル更新結果
- Step 1-B: 実装状況テーブル確認結果
- Step 1-C: 関連タスクテーブル更新結果
- Step 1-D: topic-map.md 再生成結果（実行ログを記録）
- Step 2: システム仕様更新結果

### Task 12-4: 未タスク検出（0件でも必須）

本タスクのスコープ外として識別されたRendererでの description 表示実装について、未タスクとして記録する。

**検出した未タスク:**

| タスクID候補                          | 概要                                                             | 優先度 | 関連ファイル                           |
| ------------------------------------- | ---------------------------------------------------------------- | ------ | -------------------------------------- |
| TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY | Renderer（InlineModelSelector等）にモデルのdescriptionを表示する | 低     | Renderer側のモデル選択UIコンポーネント |

**3ステップ完全実施（P3・P38対策）:**

1. `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/unassigned-task/renderer-description-display.md` を作成する
2. 関連する `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（LLM UI仕様書）に参照リンクを追加する

**注意（P58対策）**: 設計タスクまたはオプションタスクであっても、独立した指示書ファイルの作成は省略しない。

**未タスク件数**: 1件（TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY）

また、以下も未タスク候補として記録する:

| タスクID候補                                | 概要                                                               | 優先度 |
| ------------------------------------------- | ------------------------------------------------------------------ | ------ |
| TASK-LLM-MOD-05-PROVIDER-CONFIGS-TYPE-DEDUP | PROVIDER_CONFIGSのインライン型をLLMModel型で統一する（型重複削減） | 低     |

## 参照資料

| 資料                                            | 用途                            |
| ----------------------------------------------- | ------------------------------- |
| `.claude/rules/05-task-execution.md`            | Phase 12 必須チェックリスト     |
| `.claude/rules/06-known-pitfalls.md` P1-P4, P43 | Phase 12 インシデント防止       |
| `aiworkflow-requirements/LOGS.md`               | タスク完了記録先（2ファイル目） |
| `task-specification-creator/LOGS.md`            | タスク完了記録先（1ファイル目） |

## 成果物

| 成果物                     | パス                                                                                                                                            | 備考               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 実装ガイド                 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/implementation-guide.md`                         | Part 1 + Part 2    |
| documentation-changelog.md | `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/documentation-changelog.md`                      | 全 Step の完了記録 |
| 未タスク指示書             | `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/unassigned-task/renderer-description-display.md` | 1件                |
| unassigned-task-report.md  | `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/unassigned-task-report.md`                       | 0件以上必須        |

## 統合テスト連携

Phase 12 ではテスト追加は不要。Phase 4〜9 で実装済みのテストがシステム仕様書と整合していることを確認する。

## 完了条件

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1（中学生レベルの概念説明、日常的アナロジー）を作成した
- [ ] `implementation-guide.md` Part 2（開発者向け技術詳細）を作成した

### Task 2: システム仕様書更新

- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Step 1-A: `task-specification-creator/LOGS.md` を更新した（**2ファイル両方**、P1対策）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` の変更履歴を更新した
- [ ] Step 1-A: `task-specification-creator/SKILL.md` の変更履歴を更新した
- [ ] Step 1-B: 実装状況テーブルの更新有無を確認した
- [ ] Step 1-C: 関連タスクテーブルの更新有無を確認した
- [ ] Step 1-D: `topic-map.md` を再生成した（変更があった場合、P2対策）

### Task 3: documentation-changelog.md

- [ ] 全 Step 確認後に完了を記録した（全 Step 完了前に「完了」と記載しない、P4対策）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` を作成した（0件でも必須）
- [ ] TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY の3ステップが完全であること（①指示書作成 → ②task-workflow登録 → ③関連仕様書リンク追加、P3対策）
- [ ] 再評価クローズした未タスクがある場合は GitHub Issue を Close した（P56対策）

## 次のPhase

[Phase 13: 完了](./phase-13-completion.md)
