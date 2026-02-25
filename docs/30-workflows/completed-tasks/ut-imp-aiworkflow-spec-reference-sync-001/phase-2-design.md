# Phase 2: 設計 - Phase 12 仕様更新リンク同期ガード強化

## メタ情報

| 項目         | 値                                                 |
| ------------ | -------------------------------------------------- |
| Phase        | 2                                                  |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001          |
| タスク名     | Phase 12 仕様更新リンク同期ガード強化              |
| 機能名       | ut-imp-aiworkflow-spec-reference-sync-001          |
| 種別         | 改善 (improvement) ※仕様書修正のみ、コード変更なし |
| GitHub Issue | #903                                               |
| 作成日       | 2026-02-25                                         |

## 目的

Phase 1 で定義した要件（FR-1 ~ FR-4、NFR-1 ~ NFR-3）を実現するために、更新対象の4仕様書（`task-workflow.md`、`spec-update-workflow.md`、`phase-11-12-guide.md`、`phase-templates.md`）への具体的な変更内容を設計する。3点同期ルール、チェックリスト構造、検証コマンド実行手順、baseline/current 分離記録フォーマットを確定する。

## 実行タスク

### Task 1: 未タスク参照同期ルールの設計（FR-1 対応）

- `task-workflow.md` に追加する「未タスク参照同期ルール」セクションの構造を設計する
- `unassigned-task/` ファイルと `task-workflow.md` 残課題テーブルの 1:1 対応検証手順を設計する
- 未タスク完了時の参照リンク更新フローを設計する

### Task 2: 3点同期チェックリストの設計（FR-2 対応）

- `task-workflow.md` / `SKILL.md`（2ファイル） / `LOGS.md`（2ファイル）の更新順序を設計する
- 各ファイルの更新チェックボックスの具体的な記載内容を設計する
- `spec-update-workflow.md` の Step 1-A セクションへの追記内容を設計する

### Task 3: 苦戦箇所転記手順の設計（FR-3 対応）

- Phase 12 苦戦箇所セクションから未タスク指示書への転記フローを設計する
- P3 準拠の3ステップ手順を具体化する
- `phase-templates.md` Phase 12 テンプレートへの追加内容を設計する

### Task 4: baseline/current 判定分離ルールの設計（FR-4 対応）

- `baseline`（既存問題）と `current`（今回の変更起因）の分類基準を設計する
- 判定フローチャートを設計する
- `spec-update-workflow.md` への追記内容を設計する

### Task 5: 検証コマンド実行手順の設計（NFR-2 対応）

- `phase-11-12-guide.md` に追加する検証コマンドセクションの構造を設計する
- 各コマンドの期待出力（正常時・異常時）を設計する

## 参照資料

| 資料名                     | パス                                                                           | 説明                        |
| -------------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| Phase 1 要件定義           | `phase-1-requirements.md`                                                      | Phase 1 成果物（FR/NFR/AC） |
| spec-update-workflow.md    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 現行の仕様更新手順          |
| phase-11-12-guide.md       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 現行の Phase 11-12 ガイド   |
| phase-templates.md         | `.claude/skills/task-specification-creator/references/phase-templates.md`      | 現行の Phase テンプレート   |
| task-workflow.md           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 現行の残課題テーブル        |
| lessons-learned.md         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 過去タスクの教訓集          |
| verify-unassigned-links.js | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | リンク検証スクリプト        |
| generate-index.js          | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`             | 索引再生成スクリプト        |
| 06-known-pitfalls.md       | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P28, P43 の教訓  |
| acceptance-criteria        | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物              |
| requirements-definition    | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物              |
| scope-definition           | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物              |

### aiworkflow-requirements 仕様参照テーブル

| 仕様書                  | 参照セクション                  | 参照目的                             |
| ----------------------- | ------------------------------- | ------------------------------------ |
| indexes/resource-map.md | ガイドライン / task-workflow    | 参照開始点と対象カテゴリの特定       |
| indexes/topic-map.md    | task-workflow / lessons-learned | 追記対象セクションの特定             |
| task-workflow.md        | 残課題テーブル                  | 既存構造の把握と追記設計             |
| lessons-learned.md      | Phase 12関連教訓                | 設計判断根拠（P1/P25/P29/P43）の抽出 |
| patterns.md             | Phase 12 漏れ                   | チェックリスト設計の失敗パターン回避 |

### task-specification-creator 仕様参照テーブル

| 仕様書                  | 参照セクション              | 参照目的                               |
| ----------------------- | --------------------------- | -------------------------------------- |
| spec-update-workflow.md | Step 1-A ~ Step 1-D         | 既存チェックリストへの追記ポイント特定 |
| phase-templates.md      | Phase 12 完了条件セクション | 同期ガード項目の追加位置特定           |

### aiworkflow-requirements 抽出ログ（Progressive Disclosure）

1. `indexes/resource-map.md` で「ガイドライン」「タスクワークフロー」系を選定。
2. `indexes/topic-map.md` で追記対象の見出し位置を特定。
3. `task-workflow.md` / `lessons-learned.md` / `patterns.md` を設計入力として採用。

### aiworkflow-requirements 抽出完全性チェック

| カテゴリ                   | 参照仕様                                                                                               | 判定   | 設計反映先                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| タスク運用ルール           | `references/task-workflow.md`                                                                          | 必須   | Design 1, Design 2             |
| 教訓・再発防止             | `references/lessons-learned.md`, `references/patterns.md`                                              | 必須   | Design 2, Design 3, Design 4   |
| 品質ゲート                 | `references/quality-requirements.md`                                                                   | 必須   | Design 5                       |
| 探索インデックス           | `indexes/resource-map.md`, `indexes/topic-map.md`                                                      | 必須   | 参照資料, 抽出ログ             |
| 仕様作成規約               | `references/spec-guidelines.md`                                                                        | 必須   | 更新対象ファイル一覧           |
| API/UI/DB/セキュリティ個別 | `references/api-*.md`, `references/ui-ux-*.md`, `references/database-*.md`, `references/security-*.md` | 非該当 | コード変更なし（仕様書タスク） |

## 実行手順

### ステップ 1: 未タスク参照同期ルール（Design 1）の設計

1. `task-workflow.md` の現行構造（残課題テーブルのカラム定義、セクション配置）を確認する
2. 追加セクション「未タスク参照同期ルール」の位置を残課題テーブルの直後に決定する
3. 同期対象テーブル（ソースと対応先の対応表）を設計する
4. 未タスク完了時の更新手順を4ステップで設計する
5. 1:1 対応検証の手動確認コマンド（`ls` + `grep`）を設計する

### ステップ 2: 3点同期チェックリスト（Design 2）の設計

1. `spec-update-workflow.md` の Step 1-A セクションの現行構造を確認する
2. 3点同期チェックリストの挿入位置を Step 1-A の冒頭に決定する
3. 5ファイルの更新順序テーブル（#, ファイル, 更新内容, 完了チェック）を設計する
4. 更新順序の根拠（P1, P25, P29, P43 の教訓との対応）を記載する

### ステップ 3: 苦戦箇所転記手順（Design 3）の設計

1. `phase-templates.md` の Phase 12 セクションの現行構造を確認する
2. 「苦戦箇所の未タスク転記手順」の挿入位置を「苦戦箇所の記録」セクション直後に決定する
3. P3 準拠の3ステップ手順（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）を具体化する
4. 苦戦箇所 0 件の場合の対応を明記する

### ステップ 4: baseline/current 判定分離ルール（Design 4）の設計

1. `spec-update-workflow.md` への新規セクション「baseline/current 判定ルール」の位置を決定する
2. 判定フローチャート（baseline か current かの分岐ロジック）を設計する
3. 判定基準テーブル（判定名, 定義, 対応）を設計する
4. 判定に迷う場合のフォールバック手順（`git log` コマンドによる確認）を設計する

### ステップ 5: 検証コマンド実行手順（Design 5）の設計

1. `phase-11-12-guide.md` への新規セクション「Phase 12 検証コマンド一括実行手順」の位置を決定する
2. 3つの検証コマンドの実行順序と依存関係を設計する
3. 各コマンドの正常時・異常時の出力判定基準テーブルを設計する
4. コピー&ペースト用の一括実行コマンドを設計する

---

## 設計詳細

### Design 1: 未タスク参照同期ルール（FR-1 対応）

#### 追記先: `task-workflow.md` の残課題テーブル直後

**追加セクション名**: 「未タスク参照同期ルール」

**セクション構造**:

```markdown
## 未タスク参照同期ルール

### 同期対象

| ソース                              | 対応先                              | 同期条件                       |
| ----------------------------------- | ----------------------------------- | ------------------------------ |
| `unassigned-task/*.md` ファイル     | `task-workflow.md` 残課題テーブル行 | ファイル追加・削除時に同期必須 |
| `task-workflow.md` 残課題テーブル行 | 関連仕様書内の参照リンク            | ステータス変更時に同期必須     |

### 未タスク完了時の更新手順

1. `unassigned-task/` から該当ファイルを削除する
2. `task-workflow.md` 残課題テーブルの該当行のステータスを「完了」に更新する
3. 関連仕様書内の参照リンクを「完了タスク」セクションに移動する
4. `verify-unassigned-links.js` を実行して参照切れが 0 件であることを確認する

### 検証コマンド

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

期待出力（正常時）: "All links valid. 0 broken links found."
期待出力（異常時）: "ERROR: N broken links found:" + 切れたリンクのリスト
```

#### 1:1 対応検証ルール

`unassigned-task/` ディレクトリ内の `.md` ファイル数と `task-workflow.md` 残課題テーブルの「未完了」行数が一致していることを検証する。手動検証手順:

```bash
# unassigned-task/ のファイル数をカウント
ls docs/30-workflows/unassigned-task/*.md 2>/dev/null | wc -l

# task-workflow.md の未完了行数をカウント（ステータス列が「未完了」の行）
grep -c "未完了\|未着手\|pending" .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

---

### Design 2: 3点同期チェックリスト（FR-2 対応）

#### 追記先: `spec-update-workflow.md` の Step 1-A セクション冒頭

**追加内容**: 既存の Step 1-A チェックリストの冒頭に「3点同期チェックリスト」を挿入する。

**チェックリスト構造**:

```markdown
### 3点同期チェックリスト【Phase 12 Task 2 Step 1-A 必須】

以下の5ファイルを**この順序で**更新する。全ファイルの更新完了を個別に確認すること。

| #   | 更新対象ファイル                                      | 更新内容                         | 完了 |
| --- | ----------------------------------------------------- | -------------------------------- | ---- |
| 1   | `aiworkflow-requirements/references/task-workflow.md` | 残課題テーブルのステータス更新   | [ ]  |
| 2   | `aiworkflow-requirements/SKILL.md`                    | 変更履歴テーブルにバージョン追記 | [ ]  |
| 3   | `task-specification-creator/SKILL.md`                 | 変更履歴テーブルにバージョン追記 | [ ]  |
| 4   | `aiworkflow-requirements/LOGS.md`                     | タスク完了エントリ追加           | [ ]  |
| 5   | `task-specification-creator/LOGS.md`                  | タスク完了記録追加               | [ ]  |

**注意**: LOGS.md は2ファイル両方を更新すること（P1, P25 再発防止）
**注意**: SKILL.md は2ファイル両方を更新すること（P29 再発防止）
```

#### 更新順序の根拠

| 順序 | ファイル         | 根拠                                                             |
| ---- | ---------------- | ---------------------------------------------------------------- |
| 1    | task-workflow.md | 残課題テーブルが他のファイル更新の前提情報を含むため最初に更新   |
| 2-3  | SKILL.md (x2)    | 変更履歴は LOGS.md のエントリ番号を参照する場合があるため中間    |
| 4-5  | LOGS.md (x2)     | 全更新が完了した最終ステップとして記録（P43 教訓: 最終ステップ） |

---

### Design 3: 苦戦箇所転記手順（FR-3 対応）

#### 追記先: `phase-templates.md` の Phase 12 セクション内「苦戦箇所の記録」直後

**追加セクション名**: 「苦戦箇所の未タスク転記手順」

**手順構造**:

```markdown
### 苦戦箇所の未タスク転記手順【苦戦箇所が検出された場合に必須】

苦戦箇所セクションで記録した課題のうち、後続タスクとして切り出すべきものは以下の3ステップで転記する（P3 準拠）。

#### ステップ 1: 未タスク指示書の作成

- `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
- ファイル名: `task-{カテゴリ}-{概要}-NNN.md`（例: `task-imp-link-sync-guard-001.md`）
- 内容: 苦戦箇所の症状・原因・解決方針を記載

#### ステップ 2: 残課題テーブルへの登録

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに行を追加する
- 列: タスクID / タスク名 / ステータス（未着手） / 関連タスク / 備考

#### ステップ 3: 関連仕様書への参照リンク追加

- 苦戦箇所の原因となった仕様書に参照リンクを追加する
- リンク形式: `→ 関連未タスク: [UT-{ID}](../unassigned-task/task-{slug}.md)`

#### 苦戦箇所が 0 件の場合

苦戦箇所セクションに「苦戦箇所なし」と明記する。転記手順の実行は不要。
```

---

### Design 4: baseline/current 判定分離ルール（FR-4 対応）

#### 追記先: `spec-update-workflow.md` の新規セクション

**追加セクション名**: 「baseline/current 判定ルール」

**判定フロー**:

```
監査スクリプト出力
  |
  +-- この問題はタスク開始前から存在していたか？
  |   |
  |   +-- YES → baseline（既存課題）
  |   |   └── 対応: unassigned-task-report.md の「スコープ外・既存課題」セクションに記録
  |   |         task-workflow.md への登録は「任意」（改善タスクとして別途起票する場合のみ）
  |   |
  |   └── NO → current（今回の変更起因）
  |       └── 対応: 今回のタスク内で修正必須
  |             修正完了後に verify-unassigned-links.js で 0 件を確認
  |
  └── 判定に迷う場合
      └── git log --oneline --since="タスク開始日" -- 該当ファイル で変更履歴を確認
          直近の変更が自分のタスクのコミットであれば current、それ以前であれば baseline
```

**判定基準テーブル**:

```markdown
### baseline/current 判定基準

| 判定     | 定義                                 | 対応                                               |
| -------- | ------------------------------------ | -------------------------------------------------- |
| baseline | タスク開始前から存在していた問題     | `unassigned-task-report.md` の「スコープ外」に記録 |
| current  | 今回のタスクの変更によって生じた問題 | 今回のタスク内で修正必須                           |

### 判定方法

1. `git log --oneline --since="タスク開始日" -- 該当ファイル` で変更履歴を確認する
2. 該当ファイルの直近の変更が自分のタスクのコミットであれば `current`
3. 自分のタスク以前のコミットであれば `baseline`
4. 判定結果を `documentation-changelog.md` に記録する
```

---

### Design 5: 検証コマンド実行手順（NFR-2 対応）

#### 追記先: `phase-11-12-guide.md` の新規セクション

**追加セクション名**: 「Phase 12 検証コマンド一括実行手順」

**セクション構造**:

```markdown
## Phase 12 検証コマンド一括実行手順

Phase 12 Task 2 の全ステップ完了後に、以下の3つの検証コマンドを順次実行する。

### コマンド 1: 未タスク参照リンク検証

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

| 出力           | 意味                                       |
| -------------- | ------------------------------------------ |
| 0 broken links | 正常。全リンクが有効                       |
| N broken links | 異常。切れたリンクを修正してから再実行する |

### コマンド 2: topic-map.md 索引再生成

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

| 出力                | 意味                                         |
| ------------------- | -------------------------------------------- |
| Generated N entries | 正常。topic-map.md が再生成された            |
| Error: ...          | 異常。エラーメッセージに従って原因を修正する |

### コマンド 3: SKILL.md 変更履歴テーブル確認（手動）

以下の2ファイルの変更履歴テーブルに今回のタスクのエントリが存在することを手動で確認する:

- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴テーブル
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブル

### 全コマンド一括実行（コピー&ペースト用）

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js && \
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js && \
echo "=== SKILL.md 手動確認が必要 ==="
```

#### 異常時の修正フロー

| コマンド                       | 異常時の修正手順                                                   | 再実行対象          |
| ------------------------------ | ------------------------------------------------------------------ | ------------------- |
| `verify-unassigned-links.js`   | エラー出力のファイルパスを確認し、該当する参照リンクを修正する     | コマンド 1 を再実行 |
| `generate-index.js`            | 仕様書のマークダウンヘッダー構造を確認し、壊れたヘッダーを修正する | コマンド 2 を再実行 |
| SKILL.md validator（手動確認） | 不足しているタスクエントリを該当 SKILL.md に追加する               | コマンド 3 を再確認 |

---

## 更新対象ファイル一覧

| #   | ファイル                  | 変更種別       | 変更内容                                                  |
| --- | ------------------------- | -------------- | --------------------------------------------------------- |
| 1   | `task-workflow.md`        | セクション追加 | 「未タスク参照同期ルール」セクション                      |
| 2   | `spec-update-workflow.md` | セクション追加 | 「3点同期チェックリスト」+「baseline/current 判定ルール」 |
| 3   | `phase-11-12-guide.md`    | セクション追加 | 「Phase 12 検証コマンド一括実行手順」                     |
| 4   | `phase-templates.md`      | セクション追加 | Phase 12 テンプレートに「苦戦箇所転記手順」追加           |

---

## 統合テスト連携【必須】

本タスクは仕様書修正のみのため、自動テスト（ユニット/統合/E2E）の変更は発生しない。
検証スクリプト間の連携（実行順序と依存関係）を以下のように設計する:

| 実行順序 | 検証スクリプト                 | 入力依存                                     | 出力                          |
| -------- | ------------------------------ | -------------------------------------------- | ----------------------------- |
| 1        | `verify-unassigned-links.js`   | `task-workflow.md` の残課題テーブル更新完了  | 参照切れ検出結果（0件で正常） |
| 2        | `generate-index.js`            | 仕様書の全更新完了（SKILL.md/LOGS.md含む）   | `topic-map.md` の再生成       |
| 3        | SKILL.md validator（手動確認） | SKILL.md 2ファイルの変更履歴テーブル更新完了 | タスクエントリ存在確認結果    |

**連携の制約:**

- コマンド1が失敗した場合、参照切れを修正してからコマンド2を実行する（参照切れが索引生成に影響する可能性があるため）
- コマンド2はコマンド1の修正が完了してから実行する
- コマンド3はコマンド1・2とは独立して実行可能だが、全コマンドが正常完了するまで Phase 12 を完了としない

Phase 5（実装＝仕様書修正）後に以下の追加検証を実施する:

| 検証ステップ               | 検証内容                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| verify-unassigned-links.js | 仕様書修正後に参照リンク切れが 0 件であること                               |
| generate-index.js          | topic-map.md の索引が修正後の仕様書構造と一致していること                   |
| 曖昧表現 grep              | `grep -rn "[適][切]に\|[必][要]に応じて\|等$\|[な][ど]$"` で 0 件であること |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断     | 確認内容                                                                |
| ------------------ | ------------ | ----------------------------------------------------------------------- |
| アーキテクチャ     | **該当する** | ドキュメント構造の依存関係設計（5ファイルの更新順序・依存関係）         |
| セキュリティ       | 該当しない   | -                                                                       |
| UI/UX              | 該当しない   | -                                                                       |
| エラーハンドリング | **該当する** | 検証コマンドの異常時修正フロー設計                                      |
| データ整合性       | **該当する** | 4仕様書間の参照整合性、チェックリストの網羅性                           |
| パフォーマンス     | 該当しない   | -                                                                       |
| 運用性             | **該当する** | チェックリストの実用性（NFR-1.1 の 20 分以内解決、NFR-3.2 の3要素必須） |

## 成果物

| 成果物               | パス                                     | 説明                                                          |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | 同期ルール・チェックリスト・判定ルールの統合設計              |
| 同期ルール設計書     | `outputs/phase-2/sync-rule-design.md`    | 5ファイルの更新順序・依存関係・参照リンク移動ルールの詳細設計 |

## 完了条件

- [ ] Design 1（未タスク参照同期ルール）のセクション構造と検証手順が設計されている
- [ ] Design 1 の 1:1 対応検証コマンド（`ls` + `grep`）が具体的に定義されている
- [ ] Design 2（3点同期チェックリスト）の更新順序と各ファイルのチェック項目が設計されている
- [ ] Design 2 の更新順序の根拠（P1, P25, P29, P43 との対応）が記載されている
- [ ] Design 3（苦戦箇所転記手順）の3ステップ手順が P3 準拠で設計されている
- [ ] Design 3 の苦戦箇所 0 件時の対応が明記されている
- [ ] Design 4（baseline/current 判定分離ルール）の判定フローと基準テーブルが設計されている
- [ ] Design 4 の判定に迷う場合のフォールバック手順（`git log` コマンド）が設計されている
- [ ] Design 5（検証コマンド実行手順）の各コマンドの期待出力（正常時・異常時）が設計されている
- [ ] Design 5 の異常時修正フロー（修正対象ファイル・再実行コマンド）が設計されている
- [ ] 更新対象ファイル一覧（4ファイル）と変更種別が明確である
- [ ] 各設計の追記先（セクション位置）が具体的に指定されている
- [ ] Phase 1 の全 FR（FR-1 ~ FR-4）と全 NFR（NFR-1 ~ NFR-3）への対応が設計に含まれている
- [ ] 曖昧表現（禁止語一覧は `.claude/rules/02-code-quality.md` 参照）が設計文書に含まれていない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
