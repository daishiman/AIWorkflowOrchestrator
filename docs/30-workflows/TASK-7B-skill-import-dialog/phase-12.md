# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を**必ず**含める
  - 例: 「アプリストアで新しいアプリをインストールする前に、説明やレビューを確認する画面のようなもの」
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 2（技術者レベル）の必須要件**:

- SkillImportDialogProps インターフェース定義
- Section/ResourceList コンポーネントAPI
- useAppStoreとの連携パターン
- フォーカストラップの実装詳細
- ESCキーハンドラーの実装詳細

**テンプレート**: `assets/implementation-guide-template.md`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加
- [ ] topic-map.mdに新規セクションエントリを追加（該当する場合）

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**TASK-7Bの判断**:

- `SkillImportDialogProps` は新規コンポーネントProps → **更新必要の可能性**
- ただし`SkillMetadata`/`SkillSubResource`は既存型の利用のみ → **型定義の更新不要**
- 更新対象候補: `ui-ux-components.md`にSkillImportDialogコンポーネント追加
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-7B-skill-import-dialog

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-7B-skill-import-dialog \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`）

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

**想定される未タスク候補**:

- ダークモード対応（スコープ外として定義済み）
- スキル削除・編集機能（TASK-7B範囲外）
- エラーダイアログの詳細表示（importSkill失敗時の詳細情報）

## アーキテクチャ層別ドキュメント（Renderer Process）

実装ガイドPart 2では、以下の内容を含める:

| 層               | ドキュメント内容                                   | 更新対象              |
| ---------------- | -------------------------------------------------- | --------------------- |
| Renderer Process | コンポーネント設計、Props API、Zustand連携パターン | `ui-ux-components.md` |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（Renderer Process）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

## 次のPhase

Phase 13: PR作成
