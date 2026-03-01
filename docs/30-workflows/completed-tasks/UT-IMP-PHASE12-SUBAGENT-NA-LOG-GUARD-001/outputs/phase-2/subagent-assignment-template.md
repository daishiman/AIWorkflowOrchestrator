# Phase 2 成果物: SubAgent 分担表テンプレート

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

---

## 概要

Phase 12 Task 2（システム仕様書更新）において、推奨5点セット仕様書の更新を5つの SubAgent に分担して実行するためのテンプレートを定義する。P43（rate limit 対策）として各 SubAgent の担当ファイル数を3ファイル以下に制限する。

---

## SubAgent 分担マトリクス

### 分担表

| SubAgent | 担当仕様書                        | 更新観点                                               | ファイル数上限 | 依存関係       |
| -------- | --------------------------------- | ------------------------------------------------------ | -------------- | -------------- |
| A        | interfaces-\*.md（最大3ファイル） | 型定義・API契約の同期                                  | 3              | なし           |
| B        | api-ipc-\*.md（最大3ファイル）    | IPCチャネル契約の同期                                  | 3              | なし           |
| C        | security-\*.md（最大3ファイル）   | sender検証・P42準拠3段バリデーション・エラーサニタイズ | 3              | なし           |
| D        | task-workflow.md + LOGS.md x2     | 完了タスクテーブル・検証証跡の同期                     | 3              | A, B, C 完了後 |
| E        | lessons-learned.md                | 教訓の構造化記録（Phase 10 レビュー結果の反映）        | 1              | A, B, C 完了後 |

### P43対策: ファイル数上限ルール

- 各 SubAgent の担当ファイル数は **3ファイル以下** に制限する（P43: rate limit 中断の防止）
- 4ファイル以上の更新が必要な場合、SubAgent を分割する（例: A1 と A2 に分割）
- 分割時は分割後の各 SubAgent も3ファイル以下を遵守する
- LOGS.md の更新は全 SubAgent 作業完了後の最終ステップとする（P43 教訓: 「完了」記録は全ファイル更新後）

---

## 実行順序

```
Phase 1（並列実行）: SubAgent A, B, C を同時起動
  |  A: interfaces-*.md の更新または N/A 判定
  |  B: api-ipc-*.md の更新または N/A 判定
  |  C: security-*.md の更新または N/A 判定
  v
[ゲート] A, B, C の全完了を確認
  v
Phase 2（並列実行）: SubAgent D, E を同時起動
  |  D: task-workflow.md + LOGS.md x2 の更新
  |  E: lessons-learned.md の更新または N/A 判定
  v
[ゲート] D, E の全完了を確認
  v
Phase 3（直列実行）: リーダーが三点突合を実行
  |  verify-na-log の実行
  |  verify-three-point の実行
  |  verify-subagent-assignment の実行
  v
[完了] Phase 12 Task 2 完了
```

### 実行順序の根拠

| Phase                       | 根拠                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Phase 1: A, B, C 並列       | interfaces, api-ipc, security は相互に独立した仕様書カテゴリであり、更新が競合しない                           |
| Phase 2: D, E は A-C 完了後 | task-workflow.md の完了タスクテーブルには A-C の更新結果を反映する必要がある。LOGS.md は全変更の最終集計を含む |
| Phase 3: リーダー直列       | 三点突合は全 SubAgent の成果物を入力とするため、全完了後に実行する                                             |

---

## SubAgent 完了条件テーブル

| SubAgent | 完了条件                                                                                                                                       | 検証方法                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A        | 担当仕様書の更新または N/A 判定ログ記録が完了し、`git diff --stat` の出力で変更内容を報告済み                                                  | `grep "interfaces" spec-update-summary.md` で判定記録の存在を確認する                            |
| B        | 担当仕様書の更新または N/A 判定ログ記録が完了し、`git diff --stat` の出力で変更内容を報告済み                                                  | `grep "api-ipc" spec-update-summary.md` で判定記録の存在を確認する                               |
| C        | 担当仕様書の更新または N/A 判定ログ記録が完了し、`git diff --stat` の出力で変更内容を報告済み                                                  | `grep "security" spec-update-summary.md` で判定記録の存在を確認する                              |
| D        | task-workflow.md の完了タスクテーブルにタスク ID を追加し、LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）を更新済み | `grep "task-workflow" spec-update-summary.md` と `grep "LOGS" spec-update-summary.md` で確認する |
| E        | lessons-learned.md の更新または N/A 判定ログ記録が完了し、教訓フォーマット（教訓・解決策・関連タスク）に準拠していることを確認済み             | `grep "lessons-learned" spec-update-summary.md` で判定記録の存在を確認する                       |

---

## SubAgent 起動テンプレート

### SubAgent A 指示書

````markdown
### SubAgent A 指示書

**担当仕様書**: `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`（最大3ファイル）
**更新観点**: 型定義・API契約の同期
**タスクID**: <TASK-ID>
**ファイル数上限**: 3（P43対策）

#### 手順

1. 担当範囲の仕様書ファイルを特定する
   ```bash
   ls .claude/skills/aiworkflow-requirements/references/interfaces-*.md
   ```
````

2. 各仕様書を読み込み、タスクの実装内容との差分を確認する
3. 更新が必要な場合:
   - 仕様書を更新する
   - N/A判定ログに `updated` を記録する（理由: 更新内容の要約、証跡: diff出力の要約）
4. 更新が不要な場合:
   - N/A判定ログに `na` を記録する
   - 理由: 具体的な N/A 判定根拠（10文字以上）
   - 代替証跡: 検証コマンドの実行結果（10文字以上、grep/git diff/git log のいずれかを含む）
5. `git diff --stat` で変更内容を報告する

#### 完了報告形式

- 判定: updated / na（ファイルごと）
- 理由: [具体的な理由]
- 証跡: [grep コマンド出力 or diff 出力]
- 担当SubAgent: A

````

### SubAgent B 指示書

```markdown
### SubAgent B 指示書

**担当仕様書**: `.claude/skills/aiworkflow-requirements/references/api-ipc-*.md`（最大3ファイル）
**更新観点**: IPCチャネル契約の同期
**タスクID**: <TASK-ID>
**ファイル数上限**: 3（P43対策）

#### 手順

1. 担当範囲の仕様書ファイルを特定する
   ```bash
   ls .claude/skills/aiworkflow-requirements/references/api-ipc-*.md
````

2. 各仕様書を読み込み、IPCチャネルの変更有無を確認する
3. 更新が必要な場合:
   - 仕様書を更新する
   - N/A判定ログに `updated` を記録する
4. 更新が不要な場合:
   - N/A判定ログに `na` を記録する
   - 理由: 具体的な N/A 判定根拠（10文字以上）
   - 代替証跡: `grep -rn "<チャネル名>" apps/desktop/src/main/` の実行結果
5. `git diff --stat` で変更内容を報告する

#### 完了報告形式

- 判定: updated / na（ファイルごと）
- 理由: [具体的な理由]
- 証跡: [grep コマンド出力 or diff 出力]
- 担当SubAgent: B

````

### SubAgent C 指示書

```markdown
### SubAgent C 指示書

**担当仕様書**: `.claude/skills/aiworkflow-requirements/references/security-*.md`（最大3ファイル）
**更新観点**: sender検証・P42準拠3段バリデーション・エラーサニタイズ
**タスクID**: <TASK-ID>
**ファイル数上限**: 3（P43対策）

#### 手順

1. 担当範囲の仕様書ファイルを特定する
   ```bash
   ls .claude/skills/aiworkflow-requirements/references/security-*.md
````

2. 各仕様書を読み込み、セキュリティ関連の変更有無を確認する
3. 更新が必要な場合:
   - 仕様書を更新する
   - N/A判定ログに `updated` を記録する
4. 更新が不要な場合:
   - N/A判定ログに `na` を記録する
   - 理由: 具体的な N/A 判定根拠（10文字以上）
   - 代替証跡: `git diff --stat -- apps/desktop/src/main/security/` の実行結果
5. `git diff --stat` で変更内容を報告する

#### 完了報告形式

- 判定: updated / na（ファイルごと）
- 理由: [具体的な理由]
- 証跡: [grep コマンド出力 or diff 出力]
- 担当SubAgent: C

````

### SubAgent D 指示書

```markdown
### SubAgent D 指示書

**担当仕様書**:
  1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  2. `.claude/skills/aiworkflow-requirements/LOGS.md`
  3. `.claude/skills/task-specification-creator/LOGS.md`
**更新観点**: 完了タスクテーブル・検証証跡の同期
**タスクID**: <TASK-ID>
**ファイル数上限**: 3（P43対策）
**依存関係**: SubAgent A, B, C の完了後に実行する

#### 手順

1. task-workflow.md を読み込む
2. 完了タスクテーブルにタスク ID、完了日、ステータスを追加する
3. aiworkflow-requirements/LOGS.md を更新する（P1/P25対策: 2ファイル両方の更新を忘れない）
4. task-specification-creator/LOGS.md を更新する
5. N/A判定ログに `updated` を記録する（D は常に更新が発生する）
6. `git diff --stat` で変更内容を報告する

#### 注意事項

- LOGS.md は **2ファイル** ある（P1/P25対策）。片方だけの更新は不完全
- 「完了」の記録は全ファイル更新後の最終ステップとする（P43対策）

#### 完了報告形式

- 判定: updated（3ファイル全て）
- 理由: [完了タスクテーブルへの追加内容]
- 証跡: [git diff --stat の出力]
- 担当SubAgent: D
````

### SubAgent E 指示書

```markdown
### SubAgent E 指示書

**担当仕様書**: `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
**更新観点**: 教訓の構造化記録（Phase 10 レビュー結果の反映）
**タスクID**: <TASK-ID>
**ファイル数上限**: 1（P43対策）
**依存関係**: SubAgent A, B, C の完了後に実行する

#### 手順

1. Phase 10 最終レビューの結果を確認し、新規教訓の有無を判定する
2. 新規教訓がある場合:
   - lessons-learned.md に教訓を追加する
   - フォーマット: 教訓（何が起きたか）・解決策（どう対処するか）・関連タスク
   - N/A判定ログに `updated` を記録する
3. 新規教訓がない場合:
   - N/A判定ログに `na` を記録する
   - 理由: 「Phase 10 レビュー結果に新規教訓候補が0件であったため」
   - 代替証跡: 「Phase 10 レビュー結果を確認し、教訓候補0件を検証した」
4. `git diff --stat` で変更内容を報告する

#### 完了報告形式

- 判定: updated / na
- 理由: [具体的な理由]
- 証跡: [Phase 10 レビュー結果の参照 or diff 出力]
- 担当SubAgent: E
```

---

## リーダー三点突合手順（Phase 3）

SubAgent A～E の全完了後、リーダーが以下の手順で最終検証を実行する:

### 手順

1. SubAgent 全完了の確認

   ```bash
   bash verify-subagent-assignment.sh <TASK-ID>
   ```

   期待値: 終了コード 0（全 SubAgent 完了）

2. N/A 判定ログの完全性検証

   ```bash
   bash verify-na-log.sh <TASK-ID>
   ```

   期待値: 終了コード 0（推奨5点セット全件記録済み）

3. 三点突合の実行

   ```bash
   bash verify-three-point.sh <TASK-ID>
   ```

   期待値: 終了コード 0（パターン #1: PASS）

4. 結果の記録
   - 全検証が PASS の場合: spec-update-summary.md に三点突合結果を記録する
   - いずれかが FAIL の場合: 対処手順に従い修正後、再検証する

---

## エスカレーション基準

| 状況                                           | 対応                                                                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| SubAgent が rate limit で中断した              | 中断した SubAgent の作業を引き継ぎ、残ファイルを手動更新する。P43 教訓に従い `git diff --stat -- .claude/skills/` で実際の変更を確認する |
| 三点突合で CRITICAL（パターン #5）が検出された | 手動調査で原因を特定し、成果物の作成またはステータスの取り消しを実施する                                                                 |
| N/A 判定ログに理由・証跡が不足している         | 該当 SubAgent に差し戻し、10文字以上の理由と検証手段パターンを含む証跡を追記させる                                                       |
