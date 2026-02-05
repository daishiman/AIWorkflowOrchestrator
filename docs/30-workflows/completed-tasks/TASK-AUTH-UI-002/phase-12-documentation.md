# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 12               |
| 機能名 | TASK-AUTH-UI-002 |
| 作成日 | 2026-02-04       |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

### Part 1: 概念的説明（中学生レベル）

```markdown
## Portalって何？

### 身近な例で考えてみよう

部屋の中に窓があるとします。窓から見える景色は「部屋の外」にありますよね。
でも窓自体は「部屋の中」にあります。

同じように、アバターメニューは「プロフィールカード」の中にあるように見えますが、
実際には「画面の一番上」に移動して表示されています。

### なぜ必要なの？

プロフィールカードは「すりガラス」のような特殊なデザインを使っています。
この「すりガラス」の中にあるものは、他の要素の後ろに隠れてしまうことがあります。
Portalを使うことで、メニューを「すりガラス」の外に出して、常に見えるようにしています。
```

### Part 2: 技術的詳細

**参照**: `assets/implementation-guide-template.md`

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `task-specification-creator/references/spec-update-workflow.md` を参照

**4サブステップで実行**（全ステップ確認必須）:

### Step 1-A: タスク完了記録【必須・全タスク】

| 対象ファイル                          | 更新内容                                         |
| ------------------------------------- | ------------------------------------------------ |
| `ui-ux-portal-patterns.md`            | 「完了タスク」セクション追加、参考実装リンク確認 |
| `aiworkflow-requirements/LOGS.md`     | タスク完了エントリ追加                           |
| `task-specification-creator/LOGS.md`  | タスク完了記録追加                               |
| `topic-map.md`                        | `generate-index.js`で再生成（行番号同期）        |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴にバージョン追記                         |
| `task-specification-creator/SKILL.md` | 変更履歴にバージョン追記                         |

### Step 1-B: 実装状況テーブル更新【実装完了時は必須】

該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新する。

| 確認ファイル               | 確認内容                     |
| -------------------------- | ---------------------------- |
| `ui-ux-portal-patterns.md` | 参考実装セクションの確認     |
| `ui-ux-components.md`      | 関連コンポーネントの実装状況 |

### Step 1-C: 関連タスクテーブル更新【該当する場合は必須】

```bash
# 関連タスクテーブル検索（必須実行）
grep -rn "AUTH-UI-002" .claude/skills/aiworkflow-requirements/references/
```

該当するテーブルが見つかった場合、ステータスを「**完了**」に更新する。

### Step 2: システム仕様更新【条件付き】

| 更新必要の場合              | 更新不要の場合             |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |

**本タスクの判断**: 実装済みのPortal機能であり、システム仕様（ui-ux-portal-patterns.md）は既に記載済みのため、**Step 2は更新不要**と判断。ただし、Step 1-A〜1-Cは必須実行。

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-AUTH-UI-002

# Step 2: Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-AUTH-UI-002 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成

## Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出候補（Phase 8より）**:

| 候補                      | 内容                     | 判断         |
| ------------------------- | ------------------------ | ------------ |
| usePortalMenuカスタムHook | Portal機能の共通化       | 未タスク候補 |
| 位置計算の共通化          | 他のPortalメニューと共有 | 未タスク候補 |

## 成果物

| 成果物               | パス                                            | 必須 |
| -------------------- | ----------------------------------------------- | ---- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdを再生成した（generate-index.js）**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.mdの変更履歴を更新した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.mdの変更履歴を更新した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを確認し、該当があれば「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルをGrepで検索し、該当があれば「完了」に更新した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
