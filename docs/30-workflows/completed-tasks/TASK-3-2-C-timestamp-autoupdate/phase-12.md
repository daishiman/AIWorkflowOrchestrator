# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 12                              |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 実行タスク

- **Task 1**: 実装ガイド作成【必須】- 2パート構成の技術ドキュメント
- **Task 2**: システムドキュメント更新【必須】- タスク完了記録・仕様更新
- **Task 3**: ドキュメント更新履歴 & artifacts.json更新【必須】
- **Task 4**: 未タスク検出【必須】- 残課題の検出と記録（0件でも出力必須）

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。

### Part 1: 概念的説明（中学生でもわかる版）

**対象読者**: 初学者・非技術者

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**構成例**:

```markdown
# タイムスタンプ自動更新機能 - 概念ガイド

## このガイドの対象者

プログラミング経験がなくても理解できるよう説明します。

## なぜこの機能が必要か

チャットアプリで「5分前」という表示を見たことはありますか？
この表示が時間とともに自動で更新されると便利ですよね。

## 日常生活での例え

時計の針が動くように、タイムスタンプも自動で更新される仕組みです。
...
```

### Part 2: 技術的詳細（開発者向け）

**対象読者**: 開発者・技術者

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**構成**:

```markdown
# タイムスタンプ自動更新機能 - 技術ガイド

## アーキテクチャ概要

- TimestampProvider（Context）
- useInterval（Hook）
- usePageVisibility（Hook）
- MessageTimestamp（Component）

## API リファレンス

### useInterval

\`\`\`typescript
function useInterval(callback: () => void, delay: number | null): void
\`\`\`

### usePageVisibility

\`\`\`typescript
function usePageVisibility(): boolean
\`\`\`

### useTimestampContext

\`\`\`typescript
function useTimestampContext(): number
\`\`\`

## 定数

| 定数名                  | 値      | 説明  |
| ----------------------- | ------- | ----- |
| UPDATE_INTERVALS.SECOND | 1000    | 1秒   |
| UPDATE_INTERVALS.MINUTE | 60000   | 1分   |
| UPDATE_INTERVALS.HOUR   | 3600000 | 1時間 |

## 使用例

...
```

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須・全タスク】

以下のドキュメントを更新する:

1. **機能別コンポーネント仕様の更新**
   - ファイル: `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
   - 追加内容: SkillStreamDisplayセクションにタイムスタンプ自動更新機能の記載

2. **LOGS.mdの更新（2ファイル）**
   - `.claude/skills/aiworkflow-requirements/LOGS.md` - タスク完了エントリを追加
   - `.claude/skills/task-specification-creator/LOGS.md` - タスク完了記録を追加

3. **変更履歴の追記**
   - 該当する仕様書の変更履歴セクションにバージョンを追記

**完了タスクセクションのテンプレート**:

```markdown
## 完了タスク

### タスク: TASK-3-2-C タイムスタンプ自動更新（{{COMPLETION_DATE}}完了）

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| タスクID   | TASK-3-2-C                                                                                   |
| ステータス | **完了**                                                                                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動）                                                                 |
| 実装ガイド | `docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/outputs/phase-12/implementation-guide.md` |
```

### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本タスクの判断**:

- TimestampContext: 新規Context追加 → **更新必要**
- useInterval: 新規Hook追加 → **更新必要**
- usePageVisibility: 新規Hook追加 → **更新必要**
- UPDATE_INTERVALS: 新規定数追加 → **更新必要**

**更新対象ファイル**:

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

### Step 1: ドキュメント更新履歴生成

```bash
# 手動で作成（スクリプトが存在しない場合）
# outputs/phase-12/documentation-changelog.md
```

**ドキュメント更新履歴の内容**:

```markdown
# ドキュメント更新履歴 - TASK-3-2-C

## 更新日時

{{DATETIME}}

## 更新されたドキュメント

| ドキュメント             | パス                                                                            | 更新内容                       |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                      | 新規作成                       |
| 機能別コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | タイムスタンプ自動更新機能追加 |
| LOGS.md                  | `.claude/skills/aiworkflow-requirements/LOGS.md`                                | タスク完了記録追加             |
| LOGS.md                  | `.claude/skills/task-specification-creator/LOGS.md`                             | タスク完了記録追加             |

## システム仕様更新判定

- [x] 新規インターフェース追加あり → 更新実施
```

### Step 2: artifacts.json更新

Phase 12完了時に`artifacts.json`を更新し、全Phaseの成果物を登録する。

---

## Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**出力**: 検出結果を`outputs/phase-12/unassigned-task-detection.md`に記録（**0件でも出力必須**）

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
- [ ] **【Task 2 Step 1】機能別コンポーネント仕様に完了タスクセクションを追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **【Task 2 Step 2】必要に応じてシステム仕様を更新した**
- [ ] **ドキュメント更新履歴が作成されている**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |

---

## 次のPhase

Phase 13: PR作成
