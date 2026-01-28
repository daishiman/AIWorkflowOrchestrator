# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 12                |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生レベル）

**必須要件**:

- 日常生活での例え話を含める（例：「翻訳アプリのように、ボタンひとつで言葉が変わる」）
- 専門用語は使わない、使う場合は即座に説明
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**目次案**:

1. なぜ多言語対応が必要？（日常の例え話）
2. この機能で何ができるようになる？
3. どうやって言語が切り替わる？（仕組みの簡単な説明）

#### Part 2: 技術的詳細（開発者向け）

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- 翻訳キー一覧と使用方法
- コンポーネントでの使用例
- テストでのモック方法

**目次案**:

1. アーキテクチャ概要
2. i18n設定詳細
3. 翻訳キー一覧
4. コンポーネント使用例
5. テスト方法
6. トラブルシューティング

---

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

更新対象ファイル:

- [ ] `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
  - 「完了タスク」セクションにTASK-3-2-Bを追加
  - SkillStreamDisplayセクションにi18n対応を追記
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md`
  - タスク完了エントリを追加
- [ ] `.claude/skills/task-specification-creator/LOGS.md`
  - タスク完了記録を追加

追加内容:

```markdown
### タスク: TASK-3-2-B SkillStreamDisplay i18n対応（2026-XX-XX完了）

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-3-2-B                   |
| ステータス | **完了**                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動） |
| 対応言語   | 日本語（ja）、英語（en）     |
```

#### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                         | 更新不要                   |
| -------------------------------- | -------------------------- |
| 新規i18nインターフェース追加     | 内部実装の変更のみ         |
| formatRelativeTimeシグネチャ変更 | リファクタリング（IF不変） |

**本タスクの場合**:

- formatRelativeTimeのシグネチャ変更あり → 更新必要
- 更新対象: `ui-ux-feature-components.md` のformatRelativeTime仕様セクション

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-3-2-B-skill-stream-i18n

# Step 2: Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-3-2-B-skill-stream-i18n \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成

---

### Task 4: 未タスク検出【必須】

| #   | ソース                  | 確認項目                    |
| --- | ----------------------- | --------------------------- |
| 1   | Phase 3レビュー結果     | MINOR判定の指摘事項         |
| 2   | Phase 10レビュー結果    | MINOR判定の指摘事項         |
| 3   | Phase 11手動テスト結果  | スコープ外の発見事項        |
| 4   | Phase 8リファクタリング | 将来の改善候補              |
| 5   | コードベース            | TODO/FIXME/HACK/XXXコメント |

**予想される未タスク**:
| 候補 | 説明 | 優先度 |
| ---- | ---- | ------ |
| 言語切替UI | ユーザーが手動で言語を選択するUI | 低 |
| 3言語以上対応 | 中国語、韓国語等の追加 | 低 |
| アプリ全体i18n | 他コンポーネントへのi18n展開 | 中 |

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】ui-ux-feature-components.mdに「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】SkillStreamDisplayセクションにi18n対応を追記した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】formatRelativeTime仕様の更新が完了した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                    |
| ------------------------------------- | ------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成      |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成                  |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認 |

---

## 次のPhase

Phase 13: PR作成
