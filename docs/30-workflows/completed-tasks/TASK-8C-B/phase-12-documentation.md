# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 12                           |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

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

| パート | 対象読者         | 内容                                     |
| ------ | ---------------- | ---------------------------------------- |
| Part 1 | 初学者・非技術者 | E2Eテストの概念説明（中学生でもわかる）  |
| Part 2 | 開発者・技術者   | Playwright API、セレクタ設計、テスト構造 |

**Part 1 記載内容**:

- E2Eテストとは何か（身近な例え：自動操縦のロボット）
- なぜE2Eテストが必要か
- スキル選択のテストで確認していること

**Part 2 記載内容**:

- Playwright + Electron の設定
- テストファイル構造
- セレクタ一覧（aria-label, role）
- ヘルパー関数の使い方

### Task 2: システムドキュメント更新【必須】

#### Step 1: タスク完了記録【必須・全タスク】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

##### Step 1-A: タスク完了記録

- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート/実装ガイド等）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

##### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した
- 本タスク判断: テスト実装のため該当なし（APIエンドポイント追加なし）

##### Step 1-C: 関連タスクテーブル更新【Grep必須】

- [ ] `grep -rn "TASK-8C-B" .claude/skills/aiworkflow-requirements/references/` を実行した
- [ ] arch-state-management.md等の「関連タスク」テーブルを確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

##### Step 1-D: topic-map.md再生成【見落としやすい】

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

##### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）

- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] `task-workflow.md` の残課題（未タスク）テーブルに新規未タスクを登録した
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録した
- ⚠️ 検出レポート作成だけでなく、指示書作成+テーブル登録まで完了すること

##### 必須更新ファイル（全タスク共通）

- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した

**更新対象ファイル**:

| ファイル                                             | 更新内容                    |
| ---------------------------------------------------- | --------------------------- |
| `aiworkflow-requirements: development-guidelines.md` | E2Eテスト例としてリンク追加 |
| `aiworkflow-requirements: technology-desktop.md`     | テスト関連セクション更新    |

#### Step 2: システム仕様更新【条件付き】

本タスクはテスト実装のため、システム仕様の更新は不要（インターフェース変更なし）。

**更新不要の理由**:

- 新規インターフェース/型追加なし
- 既存インターフェース変更なし
- 新規定数/設定値追加なし
- documentation-changelog.md に「更新なし」と理由を明記すること

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-B

# Step 2: Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-B \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                |
| --- | ---------------------- | ----------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項     |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項     |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項    |
| 4   | テストコード           | TODO/FIXME/HACKコメント |

**検出レポート出力**: `outputs/phase-12/unassigned-task-detection.md`

※検出0件でも「検出0件」と明記してレポートを出力する

## 成果物

| 成果物               | パス                                            | 必須 | 説明                    |
| -------------------- | ----------------------------------------------- | ---- | ----------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1/Part 2構成       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力） |

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド（Part 1: 概念的説明・中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている

### Task 2: システムドキュメント更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」詳細テンプレートで完了記録を追加した
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書の「実装状況」テーブルを確認し、該当なしまたは「完了」に更新した

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-8C-B" references/` でタスク記載箇所を確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した（該当する場合）

#### Step 1-D: topic-map.md再生成

- [ ] `generate-index.js` を実行してtopic-map.mdを再生成した

#### Step 1-E: 未タスク指示書作成・登録

- [ ] 未タスク候補が1件以上の場合、指示書を作成・配置した
- [ ] 残課題テーブルに新規未タスクを登録した（該当する場合）

#### 必須更新ファイル

- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した

#### Step 2: システム仕様更新

- [ ] システム仕様更新の要否を判断し、documentation-changelog.mdに記録した

### Task 3: ドキュメント更新履歴

- [ ] documentation-changelog.md が作成されている
- [ ] artifacts.jsonが更新されている

### Task 4: 未タスク検出

- [ ] **未タスク検出レポートが出力されている**【0件でも必須】

### 最終確認

- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
