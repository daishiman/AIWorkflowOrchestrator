# Phase 12 実装ガイド

## メタ情報

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| タスク名 | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| 作成日   | 2026-04-11                                                  |

---

## Part 1: 中学生レベルの概念説明

### なぜ Phase 12 で複数のファイルを同時に更新する必要があるのか

卒業式の記念写真を整理するとき、次の4冊を一緒に更新しないと矛盾が起きます。

- **アルバム（completed ledger）**: 「この年度で卒業した生徒の記念写真集」
- **在校生名簿（backlog ledger）**: 「まだ在学中の生徒一覧」
- **卒業生名簿（lane index）**: 「各年度の卒業生を整理した総覧」
- **写真管理台帳（artifacts.json）**: 「どの写真がどこにあるかの管理記録」

たとえば、アルバムだけ更新して在校生名簿から名前を消し忘れると、その生徒は「卒業した」と「まだいる」という二重状態になります。同様に Phase 12 close-out でも、5箇所のファイルを同時更新しないとタスクの状態が「完了した」と「まだ残っている」の矛盾した状態になります。

### 各ファイルの役割

| ファイル                                                       | 役割                               | 例え                           |
| -------------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| `task-workflow.md`（backlog ledger）                           | まだ完了していないタスクの一覧     | 在校生名簿                     |
| `task-workflow-completed.md`（completed ledger）               | 完了したタスクの記録               | 卒業生アルバム                 |
| `lane/index.md`（lane index）                                  | レーン（作業グループ）の状態管理   | 学年別の卒業生名簿             |
| `outputs/artifacts.json`（workflow artifacts）                 | このワークフローの成果物と進捗状態 | 写真管理台帳（ワークフロー用） |
| `.claude/skills/.../outputs/artifacts.json`（skill artifacts） | スキル全体の成果物管理             | 写真管理台帳（スキル全体用）   |

### 同期しないと何が起きるか

たとえば、`task-workflow-completed.md` にタスク完了を記録したのに、`task-workflow.md` から同じタスクを削除し忘れると：

- あるファイルでは「完了済み」、別のファイルでは「まだ作業中」という矛盾が発生
- 次の担当者が「このタスクはまだ残っている？」と混乱する
- 自動検証ツールがエラーを報告する

この問題を防ぐために、Phase 12 では「三者同期チェックリスト」に従って5つのファイルを同時に更新します。

---

## Part 2: 技術者レベルの詳細説明

### 三者同期チェックリストの技術的詳細

#### 同期対象ファイル（5件）

| No  | ファイルパス                                                       | 役割               | 更新内容                                                                  |
| --- | ------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------- |
| 1   | `<workflow-root>/task-workflow.md`                                 | backlog ledger     | 完了タスクエントリを削除または `completed` ステータスへ更新               |
| 2   | `<workflow-root>/task-workflow-completed.md`                       | completed ledger   | 完了タスクのレコードを末尾に追記                                          |
| 3   | `<workflow-root>/lane/index.md`                                    | lane index         | lane ステータスとタスク参照リンクを更新（lane 非採用時は N/A 理由を記録） |
| 4   | `<workflow-root>/outputs/artifacts.json`                           | workflow artifacts | Phase ステータスを `phase12_completed` に更新                             |
| 5   | `.claude/skills/task-specification-creator/outputs/artifacts.json` | skill artifacts    | skill 成果物ステータスを更新（該当する場合）                              |

#### 更新タイミング

Phase 12 Step 1-A（完了タスク記録）の開始時に、5ファイルを同一ターンで一括更新する。

```
Phase 12 開始
  └── Step 1-A: 完了タスク記録（三者同期を同一ターンで実施）
       ├── task-workflow.md から完了タスクを削除
       ├── task-workflow-completed.md に完了タスクを追記
       ├── lane/index.md を更新（または N/A 理由を記録）
       ├── outputs/artifacts.json を更新
       └── .claude/skills/.../outputs/artifacts.json を更新
  └── Step 1-B: spec_created ステータス記録
  └── Step 1-C: 関連タスクテーブル更新
```

#### 検証コマンド

```bash
# Phase 12 成果物の構造検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/<feature> --phase 12

# mirror 同期確認（AC-6）
diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/

# 追記内容の存在確認
grep -n "FB-04" .claude/skills/task-specification-creator/SKILL.md
grep -n "三者同期" .claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md
grep -n "FB-04" .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md
```

#### 矛盾検出方法

| 矛盾パターン                          | 検出方法                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| backlog ledger にタスクIDが残っている | `task-workflow.md` に完了タスク ID が存在する                |
| completed ledger への移動漏れ         | `task-workflow-completed.md` に完了タスクのレコードがない    |
| artifacts.json の status が古い       | `outputs/artifacts.json` の phase status が `pending` のまま |
| mirror 不一致                         | `diff -qr` が出力を返す                                      |

#### エッジケース

| ケース                                   | 対応方法                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `lane/index.md` が存在しないワークフロー | N/A 理由を `system-spec-update-summary.md` に記録する                  |
| skill artifacts 更新が不要な場合         | 「該当する場合のみ」として N/A 理由を記録する                          |
| docs-only タスクの場合                   | Step 1-B のステータスは `completed` ではなく `spec_created` を使用する |

#### 設定可能なパラメータ

| パラメータ                   | 既定値              | 説明               |
| ---------------------------- | ------------------- | ------------------ |
| phase status（backlog）      | `pending`           | 未開始状態         |
| phase status（完了）         | `phase12_completed` | Phase 12 完了状態  |
| phase status（spec_created） | `spec_created`      | docs-only 完了状態 |

---

## 変更ファイルサマリー

| ファイル                                                                                    | 変更内容                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブルに `[FB-04]` エントリ追加（行307）                                                   |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | `### 4. system spec / outputs 同期` 内に FB-04 三者同期チェックリスト追加（行74〜79）                    |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-2 内に `### FB-04:` セクション追加（行63〜72）、Task 12-6 に `**[FB-04]**` チェック追加（行132） |
