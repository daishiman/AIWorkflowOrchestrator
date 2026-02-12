# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 12                               |
| Phase名    | ドキュメント更新                 |
| 前提Phase  | Phase 11                         |
| 後続Phase  | Phase 13                         |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

実装ガイド（Part 1/Part 2）の作成、システム仕様書の更新、ドキュメント更新履歴の記録、未タスク検出を行う。

## ⚠️ Phase 12 苦戦防止Tips

| Tips                                   | 説明                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 事前に空欄チェックリストを作成         | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する                                                   |
| spec-update-workflow.mdを常に参照      | Phase 12開始時に必ず spec-update-workflow.md を開き、チェックリストを確認                                                                  |
| 「全Step確認前に完了と記載しない」厳守 | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする                                                                         |
| LOGS.md/SKILL.md は4ファイル更新       | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md |
| topic-map.md再生成はセクション変更時も | 新規追加だけでなく、セクション更新・削除時も `node generate-index.js` を実行                                                               |

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

#### Part 1: 概念的説明（中学生レベル）

**必須要件**:

- 日常生活での例え話を必ず含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**内容例**:

- renderHookとは「お店の試食コーナー」のようなもの
  - 実際のお店（Reactコンポーネント）に行かなくても、味（Hookの動作）を確認できる
- getState()は「倉庫の在庫リストを直接見る」こと
  - 正確だけど、お客さん（React）が実際に棚から取る動作とは違う
- 参照安定性は「同じ担当者が常に対応する」こと
  - 毎回違う人（新しい関数参照）が来ると、確認作業（再レンダリング）が余計に発生する

#### Part 2: 技術的詳細（開発者レベル）

**必須要件**:

- renderHookとgetState()の違いの技術的説明
- 移行パターン（Before/After）のコード例
- 参照安定性テストのパターン
- 非同期テストのパターン（act + waitFor）
- テストユーティリティの使い方

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当する場合、api-endpoints.md等の実装ステータス更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-STORE-HOOKS-TEST-REFACTOR-001" references/` で関連仕様書を検索して更新
- [ ] `grep -rn "UT-STORE-HOOKS-REFACTOR-001" references/` で親タスクの関連も確認

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成

#### Step 2: システム仕様更新（条件付き）

- 本タスクはテストリファクタリングのため、新規インターフェースの追加なし
- → **Step 2は該当なし**（テストコードのみの変更のため）

### Task 3: ドキュメント更新履歴（documentation-changelog.md）

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各Stepの完了結果を詳細に記録（漏れの可視化）
- [ ] **全Step確認前に「完了」と記載しない**

### Task 4: 未タスク検出レポート（**0件でも出力必須**）

**検出ソース**:

| ソース                  | 確認項目                       |
| ----------------------- | ------------------------------ |
| 元タスク仕様書          | スコープ外として明示された項目 |
| Phase 3/10レビュー結果  | MINOR判定の指摘事項            |
| Phase 11手動テスト      | スコープ外の発見事項・改善提案 |
| コードコメント          | TODO/FIXME/HACK/XXX            |
| documentation-changelog | 記録過程で発見した不整合       |

**未タスク管理3ステップ（検出した場合）**:

1. `unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加
4. **物理ファイル存在確認**: `ls docs/30-workflows/unassigned-task/` で作成済みファイルを検証

### 苦戦箇所の記録【推奨】

Phase 1-12の実行中に苦戦した箇所を記録し、次回のタスク実行に活かす。

**記録テンプレート**:

```markdown
### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

**記録が特に有用なケース**:

| ケース                       | 記録すべき内容                   |
| ---------------------------- | -------------------------------- |
| 予期しないエラー             | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬               | 誤解の内容、正しい理解、確認方法 |
| 設計変更                     | 変更前後の設計、変更理由         |
| 時間のかかった調査           | 調査内容、発見方法、参考資料     |
| 06-known-pitfalls.md追加候補 | Pitfall ID候補、パターン、対策   |

📖 **参考**: `.claude/rules/06-known-pitfalls.md`

### フォールバック手順

Phase 12の各タスクが失敗した場合の対処:

| タスク | 失敗パターン             | フォールバック                                            |
| ------ | ------------------------ | --------------------------------------------------------- |
| Task 1 | 実装ガイド作成不完全     | Phase 5の実装コードを再確認し、Before/Afterパターンを抽出 |
| Task 2 | 仕様書パスが見つからない | `grep -rn "TASK_ID" .claude/skills/` で関連仕様を検索     |
| Task 3 | changelog記録漏れ        | `git diff --stat` で変更ファイル一覧を取得し、漏れを特定  |
| Task 4 | 未タスク検出基準が不明   | Phase 10のMINOR指摘リストを最優先でチェック               |

---

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                                  | 対策                                                               |
| --- | ----------------------------------------- | ------------------------------------------------------------------ |
| P1  | LOGS.mdが1ファイルのみ更新                | 必ず aiworkflow-requirements と task-specification-creator の両方  |
| P29 | SKILL.md変更履歴の更新漏れ                | LOGS.mdと同時にSKILL.mdも更新                                      |
| P2  | topic-map.md未更新                        | 仕様書変更後は必ず再生成                                           |
| P27 | topic-map.md再生成トリガー判断ミス        | 追加だけでなく削除・更新も再生成トリガー                           |
| -   | 未タスク検出レポートで0件判定のまま未出力 | **0件でも出力必須**                                                |
| -   | Phase 10 MINOR指摘を未タスク化せず進行    | MINOR判定は全て未タスク化対象                                      |
| P3  | 未タスク指示書の物理ファイル確認漏れ      | `ls docs/30-workflows/unassigned-task/` で存在確認                 |
| -   | ESLintキャッシュによる偽PASS              | `rm -rf node_modules/.cache/eslint-*` でキャッシュクリア後に再実行 |

## Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
cd .claude/skills/aiworkflow-requirements && node generate-index.js
cd .claude/skills/task-specification-creator && node scripts/generate-index.js

# ESLintキャッシュクリア（Hooksでエラーが残る場合）
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未使用importの自動修正
pnpm lint --fix
```

---

## 参照資料

| 参照資料             | パス                                                                                 | 内容               |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Phase 11結果         | `outputs/phase-11/manual-test-result.md`                                             | 手動テスト結果     |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | 仕様更新手順       |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 12詳細ガイド |
| 未タスクガイドライン | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク管理手順   |

---

## 成果物

| 成果物               | パス                                            | 説明                       |
| -------------------- | ----------------------------------------------- | -------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1/Part 2の2パート構成 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全更新内容の記録           |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 0件でも出力必須            |

---

## 完了条件

- [ ] 実装ガイドPart 1（中学生レベル概念説明）作成完了
- [ ] 実装ガイドPart 2（開発者向け技術詳細）作成完了
- [ ] Step 1-A: LOGS.md 2ファイル + SKILL.md 2ファイル更新完了
- [ ] Step 1-B: 実装状況テーブル更新（該当する場合）
- [ ] Step 1-C: 関連タスクテーブル更新完了
- [ ] Step 1-D: topic-map.md再生成完了
- [ ] Step 2: システム仕様更新（該当なし確認済み）
- [ ] documentation-changelog.md作成完了
- [ ] 未タスク検出レポート作成完了（0件でも必須）
- [ ] 未タスク検出時、指示書の物理ファイル存在を確認済み
- [ ] .claude/rules/ の技術的負債テーブルが最新（該当する場合）
- [ ] ESLintキャッシュクリア後にlintを再実行済み
- [ ] コメントフォーマット（JSDoc形式）が統一されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-13-pr-creation.md`
