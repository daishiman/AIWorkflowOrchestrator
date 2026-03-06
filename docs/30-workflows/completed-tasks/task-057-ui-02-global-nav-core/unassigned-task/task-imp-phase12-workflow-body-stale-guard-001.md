# UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001: Phase 12 workflow 本文 stale 同期ガード

## メタ情報

```yaml
issue_number: 938
task_id: UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001
task_name: Phase 12 workflow 本文 stale 同期ガード
category: 改善
target_feature: Phase 12 完了同期（workflow 本文 / phase-12-documentation / artifacts / index）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-02-GLOBAL-NAV-CORE Phase 12 再々監査（実装苦戦箇所）
created_date: 2026-03-06
dependency: task-imp-phase12-auto-verification
```

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001                         |
| タスク名     | Phase 12 workflow 本文 stale 同期ガード                              |
| 分類         | 改善                                                                 |
| 対象機能     | Phase 12 における workflow 完了同期（本文 / 台帳 / 成果物）          |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | TASK-UI-02-GLOBAL-NAV-CORE Phase 12 再々監査（苦戦箇所・2026-03-06） |
| 発見日       | 2026-03-06                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-02 の再々監査で、`artifacts.json` と `index.md` は completed に揃っていても、workflow 本文の `phase-1..11` に `pending` が残る stale が見つかった。

### 1.2 問題点・課題

- Phase 12 完了判定が `outputs/phase-12` と台帳更新に寄り、workflow 本文の状態遷移まで自動確認していない
- `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` は確認しても、個別 `phase-x-*.md` まで見落としやすい
- 本文 stale の検知が手動 `rg` 頼みで、標準ガードとして固定されていない

### 1.3 放置した場合の影響

- completed 表示の workflow でも監査時に未完了扱いへ戻る
- 次回の同種タスクで同じ stale 修正を繰り返す
- Phase 12 の完了定義が曖昧になり、品質基準の再現性が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の完了同期を「成果物 / 台帳 / workflow 本文」の三層で固定し、本文 stale を機械的に検出・是正できるようにする。

### 2.2 最終ゴール

1. Phase 12 完了時に更新すべき本文・台帳・成果物の対象一覧を標準化する
2. `pending` 残置を検出するガード手順を定義する
3. 再利用可能な 5分解決カードとして system spec に残す

### 2.3 スコープ

#### 含むもの

- `phase-1..11` 本文 stale の検出手順
- `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` / 本文個票の同期ルール
- Phase 12 監査における合格基準の明文化

#### 含まないもの

- 個別機能の追加実装
- 過去 workflow 全件の自動修復

### 2.4 成果物

- 本未タスク仕様書
- workflow 本文 stale ガード手順
- system spec への教訓・未タスク追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 12 の成果物と `phase-12-documentation.md` が作成済みである
- `task-specification-creator` の workflow 検証コマンドが実行可能である
- workflow ごとの `phase-*.md` 構成が統一されている

### 3.2 依存タスク

- ~~task-imp-phase12-auto-verification~~（既存の自動検証基盤）

### 3.3 必要な知識

- Phase 12 の completed 同期対象ファイル
- `verify-all-specs` / `validate-phase-output` / `generate-index.js` の用途
- `rg` による `pending` 残置検出

### 3.4 推奨アプローチ

1. 成果物台帳を更新したら、そのターン内で workflow 本文まで必ず同期する
2. 本文 stale は `rg` で機械検出し、PASS 条件を 0 件に固定する
3. 検証結果を `task-workflow.md` と `lessons-learned.md` の両方へ残す

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                   | 発見経緯                                                                       | 解決策                                                          | 教訓                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------- |
| `artifacts.json` / `index.md` が completed でも本文に `pending` が残る | TASK-UI-02 再々監査で `phase-1..11` に stale が残存した                        | 本文個票も Phase 12 完了同期の対象に含め、`rg` でゼロ件確認した | Phase 12 完了判定は台帳だけでは閉じない        |
| 完了対象ファイルの集合が暗黙知になっていた                             | `phase-12-documentation` と `artifacts` は見ても本文個票まで連想されにくかった | 三層同期（成果物 / 台帳 / 本文仕様書）として名前付きで固定した  | 合格条件は抽象名ではなくファイル群で持つ       |
| stale 検知が手作業 grep に依存していた                                 | 再監査時に追加確認でようやく発見した                                           | `pending grep` を標準検証に組み込む                             | 見落としやすい文字列検査ほど標準コマンド化する |

---

## 4. 実行手順

### Phase構成

- Phase A: 同期対象の固定
- Phase B: 本文同期
- Phase C: 検証
- Phase D: system spec 反映

### Phase A: 同期対象の固定

#### 目的

Phase 12 完了時に更新すべき対象ファイルを明示する。

#### 手順

1. `phase-12-documentation.md` を completed にする
2. `artifacts.json` と `outputs/artifacts.json` を同期する
3. workflow `index.md` と completed 扱いの `phase-1..11` 個票を対象一覧へ含める

#### 成果物

- 完了同期対象一覧

#### 完了条件

- 本文個票が対象から漏れていない

### Phase B: 本文同期

#### 目的

workflow 本文を completed 実態へ揃える。

#### 手順

1. 各 `phase-x-*.md` の `ステータス` を同期する
2. 完了条件チェックリストを completed 実態へ揃える
3. `実行タスク結果` の `pending` を解消する

#### 成果物

- 同期済み workflow 本文

#### 完了条件

- `pending` が残っていない

### Phase C: 検証

#### 目的

本文 stale がないことを機械的に保証する。

#### 手順

1. `verify-all-specs --workflow` を実行する
2. `validate-phase-output <workflow-dir>` を実行する
3. `generate-index.js --workflow ... --regenerate` を実行する
4. `rg -n 'ステータス\\s*\\|\\s*pending'` で 0 件を確認する

#### 成果物

- 検証ログ

#### 完了条件

- 本文 stale 0 件である

### Phase D: system spec 反映

#### 目的

苦戦箇所と再利用手順を system spec に残す。

#### 手順

1. `task-workflow.md` に未タスクIDと検証手順を追記する
2. `lessons-learned.md` に苦戦箇所と 5分解決カードを追記する
3. 必要に応じて domain 正本にも再利用ルールを同期する

#### 成果物

- system spec 更新差分

#### 完了条件

- 次回は同じ stale を未タスク参照からすぐ是正できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 12 完了同期の対象一覧に workflow 本文個票が含まれている
- [ ] 本文 stale を検出する標準手順が定義されている
- [ ] system spec に未タスクIDと教訓が反映されている

### 品質要件

- [ ] `verify-all-specs` が PASS する
- [ ] `validate-phase-output` が PASS する
- [ ] `pending grep` が 0 件になる

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` に配置されている
- [ ] `task-workflow.md` / `lessons-learned.md` へ同一IDが反映されている
- [ ] 苦戦箇所（3.5）が簡潔に再利用できる形式で記録されている

---

## 6. 検証方法

### テストケース

- Case 1: `artifacts.json` と `index.md` が completed でも本文 stale があれば検出される
- Case 2: 本文 stale を解消すると `pending grep` が 0 件になる
- Case 3: 本未タスク仕様書がフォーマット監査を通過する

### 使用コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core --regenerate
rg -n 'ステータス\\s*\\|\\s*pending' docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-{1,2,3,4,5,6,7,8,9,10,11,12}-*.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --unassigned-dir docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task --target-file docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md
```

### 合格基準

- `verify-all-specs` と `validate-phase-output` が PASS
- `pending grep` が 0 件
- `audit-unassigned-tasks` が `currentViolations.total = 0`

---

## 7. リスクと対策

| リスク                          | 内容                                        | 対策                                                     |
| ------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| grep パターンだけで誤検知する   | 文脈によって `pending` 文字列がノイズになる | `ステータス` / `実行タスク結果` を含むパターンへ限定する |
| workflow 構造差で対象漏れが出る | phase ファイル名が一部異なる                | `generate-index.js` と併用し、構成自体のズレも確認する   |
| 合格条件がまた暗黙化する        | 手順書に残しても実行順が揺れる              | Phase 12 の標準検証順を system spec へ固定する           |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-completed-task-reference-sync-guard-001.md`

---

## 9. 備考

- 本未タスクは「ファイルは揃っているのに本文だけ stale」という Phase 12 特有の抜け漏れを対象とする。
- 将来的には `verify-all-specs` 側に本文 stale チェックを組み込む拡張候補として扱える。
