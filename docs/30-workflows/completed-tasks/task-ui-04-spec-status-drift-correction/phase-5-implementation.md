# Phase 5: 実装

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 5                                   |
| Phase名    | 実装                                |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 4: テスト作成                 |
| 次Phase    | Phase 6: テスト拡充                 |
| ステータス | pending                             |
| 作成日     | 2026-04-07                          |

## 目的

Phase 2 の修正計画に基づき、全タスク仕様書の artifacts.json / index.md を実装状態に合わせて更新し、completed-tasks への移動と executor-guide.md の更新を実行する。

## SubAgent 分担

Phase 5 は、互いに衝突しないファイル群を並列で更新し、依存がある部分だけ直列にする。

| SubAgent                | 役割                                               | 並列関係                                             | 備考                              |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| `SubAgent-P5-ARTIFACTS` | 各 `artifacts.json` の status / phases を更新する  | `SubAgent-P5-INDEX` / `SubAgent-P5-GUIDE` と並列     | タスク単位で分割可                |
| `SubAgent-P5-INDEX`     | 各 `index.md` のステータス表と残作業記録を更新する | `SubAgent-P5-ARTIFACTS` / `SubAgent-P5-GUIDE` と並列 | `artifacts.json` 更新後に同期確認 |
| `SubAgent-P5-GUIDE`     | `executor-guide.md` と親 `index.md` を更新する     | `SubAgent-P5-ARTIFACTS` / `SubAgent-P5-INDEX` と並列 | lane-wide の集約更新              |
| `SubAgent-P5-MOVE`      | completed-tasks への移動とリンク再確認を行う       | status 更新確定後に直列                              | 移動対象だけを処理する            |

`SubAgent-P5-ARTIFACTS` / `SubAgent-P5-INDEX` / `SubAgent-P5-GUIDE` で先に更新を終え、`SubAgent-P5-MOVE` は確定後に実施する。

## 実行手順

### Step 0: 修正前スナップショット

修正前の全 artifacts.json の status を記録し、変更の追跡を可能にする。

```bash
# 修正前の全 status を記録
for f in $(find docs/30-workflows/skill-creator-agent-sdk-lane/step-* -name "artifacts.json" -not -path "*/outputs/*"); do
  echo "$f: $(jq -r '.status' "$f")"
done > outputs/phase-5/pre-correction-snapshot.txt
```

### Step 1: artifacts.json の status 更新

各タスクの artifacts.json を更新する。

**TASK-P0-01** (verify engine layer1/2):

```bash
# status: in_progress → completed
# lastUpdated: 修正実行日に更新
# phases: 実装済み phase を completed に更新
```

**TASK-P0-02** (verify→improve closed loop):

```bash
# status: spec_created → completed（または in_progress: Phase 1 調査結果に依存）
# lastUpdated: 修正実行日に更新
```

**TASK-P0-04** (ManifestLoader default activation):

```bash
# status: spec_created → completed
# lastUpdated: 修正実行日に更新
```

**TASK-P0-05** (execute→SkillFileWriter integration):

```bash
# status: spec_created → completed
# lastUpdated: 修正実行日に更新
```

**TASK-P0-06** (conversational interview UI):

```bash
# status: spec_created → completed
# lastUpdated: 修正実行日に更新
```

**TASK-P0-07** (hardcoded agent names):

```bash
# status: Phase 1 調査結果に依存
# 動的解決が確認できれば completed、未完了なら in_progress + 残作業記録
```

**TASK-P0-08** (session resume renderer):

```bash
# status: spec_created → in_progress（部分実装の場合）
# 残作業記録を index.md に追記
```

**TASK-P0-09** (permission hooks governance):

```bash
# status: in_progress → completed
# lastUpdated: 修正実行日に更新
```

### Step 2: index.md のステータス更新

各タスクの index.md メタ情報テーブルのステータス行を更新する。

```bash
# 例: TASK-P0-02 の index.md
# Before: | ステータス     | spec_created |
# After:  | ステータス     | completed    |
# 更新日も修正実行日に更新
```

### Step 3: completed-tasks ディレクトリへの移動

完了確定タスクのディレクトリを移動する。

```bash
# completed-tasks ディレクトリの作成（存在しない場合）
mkdir -p docs/30-workflows/completed-tasks/

# 完了タスクの移動（git mv を使用してヒストリを保持）
# 対象タスクは Phase 2 の修正計画で確定したもの
git mv docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-XX-... docs/30-workflows/completed-tasks/
```

### Step 4: 残作業記録の追加

部分完了タスク（TASK-P0-07, TASK-P0-08 等）の index.md に残作業セクションを追加する。

```markdown
## 残作業記録

| 項目           | 内容                         |
| -------------- | ---------------------------- |
| 記録日         | 2026-04-07                   |
| 現行ステータス | in_progress                  |
| 完了済み作業   | （Phase 1 調査結果から記入） |
| 残作業         | （Phase 1 調査結果から記入） |
| ブロッカー     | （あれば記載）               |
```

### Step 5: executor-guide.md の更新

executor-guide.md のタスク一覧にステータス情報を反映する。

### Step 6: 親 index.md の更新

`docs/30-workflows/skill-creator-agent-sdk-lane/index.md` のタスク一覧を最新状態に更新する。

## 実行タスク

### Task 1: artifacts.json 一括更新

Step 1 に従い、全対象タスクの artifacts.json を更新する。

### Task 2: index.md 一括更新

Step 2 に従い、全対象タスクの index.md を更新する。

### Task 3: completed-tasks 移動実行

Step 3 に従い、完了タスクを移動する。

### Task 4: 残作業記録追加

Step 4 に従い、部分完了タスクに残作業記録を追加する。

### Task 5: executor-guide.md / 親 index.md 更新

Step 5, 6 に従い、ガイドドキュメントを更新する。

## 参照資料

| 資料名           | パス                                                               | 説明       |
| ---------------- | ------------------------------------------------------------------ | ---------- |
| 修正計画         | `outputs/phase-2/correction-plan.md`                               | 実行の根拠 |
| テストマトリクス | `outputs/phase-4/test-matrix.md`                                   | 検証基準   |
| 乖離インベントリ | `outputs/phase-1/status-drift-inventory.md`                        | 乖離の全容 |
| executor-guide   | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md` | 更新対象   |
| 親 index.md      | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`          | 更新対象   |

### システム仕様（aiworkflow-requirements）

| 参照資料                       | パス                                                                        | 内容                                  |
| ------------------------------ | --------------------------------------------------------------------------- | ------------------------------------- |
| タスクワークフローフェーズ仕様 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md` | Phase 遷移テーブル（status 値の定義） |

## 成果物

| 成果物   | パス                                       | 説明                                    |
| -------- | ------------------------------------------ | --------------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更点の一覧、修正前後の diff、移動記録 |

## 完了条件

- [ ] 全対象タスクの artifacts.json status が更新されている
- [ ] 全対象タスクの index.md ステータスが更新されている
- [ ] 完了タスクが completed-tasks/ に移動されている（該当する場合）
- [ ] 部分完了タスクに残作業記録が追加されている
- [ ] executor-guide.md が更新されている
- [ ] 親 index.md が更新されている
- [ ] Phase 4 のテストマトリクスに基づく検証が pass している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
