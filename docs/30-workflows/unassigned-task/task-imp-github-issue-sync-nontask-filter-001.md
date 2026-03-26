# TASK-IMP-GITHUB-ISSUE-SYNC-NONTASK-FILTER-001: sync_new_issues の非タスク文書誤検出是正

## メタ情報

```yaml
issue_number: 1659
task_id: TASK-IMP-GITHUB-ISSUE-SYNC-NONTASK-FILTER-001
task_name: sync_new_issues の非タスク文書誤検出是正
category: 改善
target_feature: github-issue-manager / sync_new_issues.js
priority: 中
scale: 小規模
status: 未実施
source_phase: 未タスク作成・Issue同期の branch 監査（2回確認）
created_date: 2026-03-26
dependencies: [github-issue-manager]
spec_path: docs/30-workflows/unassigned-task/task-imp-github-issue-sync-nontask-filter-001.md
```

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-IMP-GITHUB-ISSUE-SYNC-NONTASK-FILTER-001    |
| タスク名     | sync_new_issues の非タスク文書誤検出是正         |
| 分類         | 改善                                             |
| 対象機能     | github-issue-manager / sync_new_issues.js        |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | 未タスク作成・Issue同期の branch 監査（2回確認） |
| 発見日       | 2026-03-26                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

未タスク作成・Issue同期フローの実行中に `node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --check` を実行したところ、Issue 作成対象ではない調査レポートやメモ文書まで「未同期仕様書」として検出された。

### 1.2 問題点・課題

- `sync_new_issues.js` は `docs/30-workflows/unassigned-task/` 配下の `task-*.md` を一律に Issue 対象とみなしている
- `task-05-phase-1-3-source-investigation-report.md` のような調査レポートも false positive になる
- `sync_new_issues.js` 実行結果と `--check` の結果が一致せず、運用者が「同期済みかどうか」を信頼できない

### 1.3 放置した場合の影響

- PR 前チェックで常に未同期警告が残り、真の未同期仕様書を見分けにくくなる
- 調査レポートや実行メモに不要な Issue を作る誤運用が起きる
- branch 状況の2回確認をしても、自動判定がノイズを返して監査品質が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`sync_new_issues.js` が「Issue 化すべき未タスク仕様書」だけを検出し、調査レポートやメモを除外できるようにする。

### 2.2 最終ゴール

- `sync_new_issues.js --check` が false positive なしで未同期仕様書だけを返す
- 非タスク文書の判定ルールがコードと運用手順に明記される
- 実行結果と再確認結果が一致する

### 2.3 スコープ

#### 含むもの

- `sync_new_issues.js` の検出条件見直し
- 必要なら `create_issue.js` / `utils.js` のメタ情報判定補強
- 非タスク文書の判定基準を `github-issue-manager` 運用ドキュメントへ反映

#### 含まないもの

- 既存 GitHub Issue 全体の棚卸し
- task-specification-creator 側テンプレートの全面変更
- unassigned-task ディレクトリの大規模リネーム

### 2.4 成果物

- `sync_new_issues.js` の誤検出防止修正
- 対応テストまたは再現手順
- 運用ガイド更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/unassigned-task/` には task 仕様書以外の補助文書も混在しうる
- Issue 対象の正本フォーマットは YAML メタ情報または task-specification-creator 準拠文書である

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- `.claude/skills/github-issue-manager/scripts/sync_new_issues.js`
- `.claude/skills/github-issue-manager/scripts/create_issue.js`
- `.claude/skills/github-issue-manager/scripts/utils.js`
- `docs/30-workflows/unassigned-task/` の文書種別

### 3.4 推奨アプローチ

1. Issue 対象文書の最小条件を定義する
2. `findSpecsWithoutIssue()` でファイル名だけでなくメタ情報有無を判定する
3. false positive 再現ケースを fixture 化し、`--check` と通常実行の結果一致を確認する

### 3.5 苦戦箇所

| ID     | 内容                                                          | 解決策                                                     |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| GIM-01 | `task-*` 命名だけでは task 仕様書と調査レポートを区別できない | YAML メタ情報、必須見出し、task_id など構造条件を加える    |
| GIM-02 | 実行結果と `--check` の結果が一致せず、同期成否を誤読しやすい | 同一入力集合で dry-run / check / create の判定経路を揃える |

---

## 4. 実行手順

### Phase A: 再現条件の固定

#### 目的

誤検出する文書と、本当に Issue 化すべき文書の差を明文化する。

#### 手順

1. `docs/30-workflows/unassigned-task/` から false positive 例を抽出する
2. task 仕様書の必須メタ情報を一覧化する
3. 除外ルールを決める

#### 成果物

- 再現対象一覧
- 判定ルール表

#### 完了条件

- false positive の再現ケースが固定されている

### Phase B: スクリプト修正

#### 目的

Issue 対象の判定条件をコードへ反映する。

#### 手順

1. `sync_new_issues.js` の `findSpecsWithoutIssue()` を修正する
2. 必要なら `create_issue.js` / `utils.js` のメタ情報判定を共通化する
3. `--check` と通常実行の差異が出ないようにする

#### 成果物

- スクリプト修正差分

#### 完了条件

- 非タスク文書が `sync_new_issues.js --check` で除外される

### Phase C: 検証と運用同期

#### 目的

誤検出が再発しないことを確認し、運用手順へ残す。

#### 手順

1. 再現ケースで `--check` / 通常実行 / dry-run を比較する
2. `github-issue-manager` の運用手順に判定条件を追記する
3. 必要なら related unassigned / lessons を更新する

#### 成果物

- 検証ログ
- 更新済み運用手順

#### 完了条件

- 実行結果と再確認結果が一致する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 非タスク文書が Issue 対象から除外される
- [ ] 真の未同期 task 仕様書だけが検出される
- [ ] `--check` と通常実行で対象集合が一致する

### 品質要件

- [ ] false positive 再現ケースで確認している
- [ ] 判定ルールが 100人中100人で再利用できる粒度で記録されている
- [ ] 既存 Issue 作成フローを壊していない

### ドキュメント要件

- [ ] `github-issue-manager` の運用ガイドに反映されている
- [ ] 必要なら lessons / backlog へ同期している

---

## 6. 検証方法

### テストケース

- Case 1: task 仕様書は未同期検出される
- Case 2: 調査レポートは未同期検出されない
- Case 3: `sync_new_issues.js` 実行後に `--check` が同じ結果を返す

### 検証手順

```bash
node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run
node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --check
```

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                         |
| ----------------------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| 判定を厳しくしすぎて本来の task 仕様書を除外する      | 高     | 中       | task-specification-creator 準拠文書を fixture として比較する |
| create/check の分岐修正が別経路になり再び不一致になる | 中     | 中       | 判定ロジックを共通関数へ寄せる                               |
| 既存運用文書が stale のまま残る                       | 低     | 中       | スクリプト修正と同じ turn で skill 文書を更新する            |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/github-issue-manager/scripts/sync_new_issues.js`
- `.claude/skills/github-issue-manager/scripts/create_issue.js`
- `.claude/skills/github-issue-manager/scripts/utils.js`
- `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`

### 参考資料

- `docs/30-workflows/unassigned-task/task-05-phase-1-3-source-investigation-report.md`
- `docs/30-workflows/unassigned-task/task-exec-scope-definition-path-update-001.md`
- `docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md`

---

## 9. 備考

### 補足事項

- 発見契機は branch 監査時の 2回確認であり、今回完了した workflow 自体の未実装項目ではない
- `status:unassigned` ラベルが closed issue に残る挙動も併せて再確認対象に含めてよい
