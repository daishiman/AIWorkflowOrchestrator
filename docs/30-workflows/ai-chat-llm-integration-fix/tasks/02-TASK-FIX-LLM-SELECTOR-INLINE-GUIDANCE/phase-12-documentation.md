# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase番号  | 12                                               |
| 機能名     | LLMモデル選択インラインガイダンス追加            |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE            |
| 作成日     | 2026-03-20                                       |
| ステータス | 作成済み                                         |
| 依存       | [Phase 11 手動テスト](./phase-11-manual-test.md) |

## 目的

Phase 12 は最も漏れが発生しやすい Phase である（P1〜P4参照）。本仕様書に従い Task 1〜4 を**全項目逐次確認**し、いずれも省略せず実施する。

## 実行タスク

### Task 1: 実装ガイド作成

#### Task 1-1: outputs/phase-12/implementation-guide.md Part 1（中学生レベル概念説明）

**ファイルパス**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/implementation-guide.md`

**Part 1 要件（中学生でも理解できる説明）**:

- 日常的なアナロジーを必ず使う
- 例: 「モデル未選択のまま送信するのは、どのお店で注文するか決めずにレジに並ぶようなもの。バナーは "まずお店を選んでください" という案内板」
- 技術用語を避け、「なぜこの機能が必要か」を1〜2段落で説明
- ユーザー視点でのユースケース（「こんな場面で役立つ」）を記載

**Part 2 要件（開発者向け実装詳細）**:

- `LLMGuidanceBanner` コンポーネントの責務と設計判断
- P31 対策（個別セレクタ使用）の技術的理由
- `GuidanceBlock` への `action` props 追加の実装詳細
- テストモック設計（Zustand セレクタのモック方法）
- 将来の拡張ポイント（例: LLMセクションへの直接スクロール遷移など）

#### Task 1-2: component-documentation.md

**ファイルパス**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/component-documentation.md`

- `LLMGuidanceBanner` の Props 一覧・型定義・使用例
- `GuidanceBlock` の拡張後 Props 一覧

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

**重要**: 全 Step を実行前に「完了」と記録しない（P4対策）。

#### Step 1-A: タスク完了記録

以下 **2ファイル両方**を更新する（P1・P25対策 — 1ファイル更新漏れが頻発）:

```bash
# 更新対象ファイルの確認
ls .claude/skills/aiworkflow-requirements/LOGS.md
ls .claude/skills/task-specification-creator/LOGS.md
```

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**省略不可**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（P29対策）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（P29対策）

関連仕様書への完了記録:

```bash
# 関連仕様書の確認
grep -rn "TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE\|LLMGuidanceBanner\|GuidanceBlock" \
  .claude/skills/aiworkflow-requirements/references/
```

- [ ] 該当仕様書（`ui-ux-*.md` 等）にタスク完了記録を追加

#### Step 1-B: 実装状況テーブル更新

```bash
# 関連する実装ステータステーブルの確認
grep -rn "ChatView\|WorkspaceView\|LLMSelector" \
  .claude/skills/aiworkflow-requirements/references/
```

- [ ] 該当する実装ステータステーブルを更新（該当する場合）

#### Step 1-C: 関連タスクテーブル

```bash
grep -rn "TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE" \
  .claude/skills/aiworkflow-requirements/references/
```

- [ ] 関連仕様書の参照テーブルを更新

#### Step 1-D: topic-map.md 再生成（P2・P27対策）

仕様書に変更があれば必ず実行する（セクション追加・更新・削除を含む）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] topic-map.md が再生成されている
- [ ] `git diff --stat -- .claude/skills/` で変更ファイルを確認

#### Step 2: システム仕様更新（新規インターフェースがある場合）

本タスクで追加した `LLMGuidanceBanner` コンポーネントの型定義・インターフェースが新規追加されている場合、以下を更新する:

- [ ] `interfaces-*.md` に型定義を追加（該当する場合）
- [ ] `ui-ux-components.md` 等のコンポーネント仕様書を更新（該当する場合）

#### Step 3: IPC 契約検証

本タスクは IPC 変更なし → Step 3 は対象外。

### Task 3: outputs/phase-12/documentation-changelog.md 更新

**注意**: 全 Step の完了を確認してから「完了」と記録する（P4対策）。

**ファイルパス**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/documentation-changelog.md`

記録内容:

- Task 1 実装ガイド作成: 完了/未完了
- Task 2 Step 1-A LOGS.md 2ファイル更新: 完了/未完了
- Task 2 Step 1-A SKILL.md 変更履歴更新: 完了/未完了
- Task 2 Step 1-B〜1-C 関連テーブル更新: 完了/未完了
- Task 2 Step 1-D topic-map.md 再生成: 完了/未完了（`git diff --stat` 確認済み）
- Task 4 未タスク検出件数

### Task 4: 未タスク検出（0件でも必須）

**ファイルパス**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md`

検出した未タスクに対し**3ステップ全完了**（P3・P38・P58対策）:

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成（0件でも「なし」として報告書を作成）
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**未タスク候補の検討**:

- Settings 画面 LLM セクションへの直接スクロール遷移（本タスクスコープ外）
- LLMGuidanceBanner の dismiss ボタン（ユーザーが一時的に非表示にする機能）
- Phase 11 スクリーンショット取得の自動化（P53参照）

## 参照資料

| ファイル                                 | 用途                                 |
| ---------------------------------------- | ------------------------------------ |
| `.claude/rules/05-task-execution.md`     | Phase 12 必須チェックリスト          |
| `.claude/rules/06-known-pitfalls.md#P1`  | LOGS.md 2ファイル更新漏れ            |
| `.claude/rules/06-known-pitfalls.md#P2`  | topic-map.md 再生成忘れ              |
| `.claude/rules/06-known-pitfalls.md#P3`  | 未タスク管理の3ステップ不完全        |
| `.claude/rules/06-known-pitfalls.md#P4`  | documentation-changelog 早期完了記載 |
| `.claude/rules/06-known-pitfalls.md#P29` | SKILL.md 変更履歴更新漏れ            |
| `.claude/rules/06-known-pitfalls.md#P43` | サブエージェント rate limit 中断対策 |
| `.claude/rules/06-known-pitfalls.md#P58` | 設計タスクの未タスク指示書省略禁止   |

## 実行手順

### Step 1: 実装ガイド作成（Task 1）

Part 1（中学生レベル）と Part 2（開発者向け）の2パート構成を守る。

### Step 2: システム仕様書更新（Task 2）

Step 1-A → 1-B → 1-C → 1-D の順で実施。各ステップ完了後にチェックを入れる。

### Step 3: Changelog 記録（Task 3）

**全 Step 完了後**に changelog を「完了」として記録する（P4対策）。

### Step 4: 未タスク検出（Task 4）

0件でも `outputs/phase-12/unassigned-task-detection.md` を作成する。

## 成果物

| 成果物                     | パス                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド                 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/implementation-guide.md`      |
| コンポーネントドキュメント | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/component-documentation.md`                    |
| Documentation Changelog    | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md` |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル、日常アナロジー必須）が作成されている
- [ ] 実装ガイド Part 2（開発者向け技術詳細）が作成されている
- [ ] LOGS.md が **2ファイル両方**更新されている（P1・P25対策）
- [ ] SKILL.md が **2ファイル両方**更新されている（P29対策）
- [ ] topic-map.md が再生成されている（`git diff --stat` 確認済み、P2・P27対策）
- [ ] outputs/phase-12/documentation-changelog.md に全 Step の実績が記録されている（P4対策）
- [ ] outputs/phase-12/unassigned-task-detection.md が作成されている（0件でも必須、P3・P58対策）
- [ ] 未タスクがある場合、3ステップ（指示書・テーブル登録・リンク追加）が全完了（P3対策）
- [ ] GitHub Issue が存在する場合、再評価クローズ時に `gh issue close` が実行されている（P56対策）

## 次Phase

[Phase 13: 完了](./phase-13-pr-creation.md)
