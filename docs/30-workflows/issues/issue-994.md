# [#994] "[UT-TASK-10A-B-007] Phase 11 画面証跡鮮度ガード"

## メタ情報

```yaml
task_id: UT-TASK-10A-B-007
task_name: Phase 11 画面証跡鮮度ガード
category: 改善
target_feature: SkillAnalysisView Phase 11 スクリーンショット検証
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-10A-B Phase 12 再監査（苦戦箇所）
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-B の再監査で、既存スクリーンショットの存在確認だけでは証跡鮮度が保証できず、再撮影実施有無の判断が曖昧だった。

### 1.2 問題点・課題

- `outputs/phase-11/screenshots` に画像があっても、当日再取得かどうかが分かりづらい。
- 画面証跡が古い場合でも Phase 11 を完了扱いにしてしまうリスクがある。

### 1.3 放置した場合の影響

- UI再監査で証跡の信頼性が低下し、差し戻しが再発する。
- 同種タスクで「検証済み」の判定基準がブレる。

## 2. 何を達成するか（What）

### 2.1 目的

スクリーンショットの存在確認と鮮度確認（更新時刻確認）を Phase 11 の標準手順として固定する。

### 2.2 最終ゴール

1. UIタスクで `screenshots/` の最新更新時刻を必ず記録できる。
2. `manual-test-result.md` に証跡ファイル名と取得日が明記される。
3. Phase 12 再監査時に画像鮮度で迷わない状態になる。

### 2.3 スコープ

#### 含むもの

- 画面証跡鮮度確認手順の定義
- `task-workflow.md` / `ui-ux-feature-components.md` への参照同期
- 未タスク監査用コマンドの固定

#### 含まないもの

- スクリーンショット撮影ツールの全面刷新
- UIコンポーネントの機能改修

### 2.4 成果物

- 本未タスク指示書
- 鮮度確認コマンド（`ls -lt`）の運用化
- システム仕様書の未タスク参照追記

## 3. どのように実行するか（How）

### 3.1 前提条件

- UIタスクの Phase 11 で `outputs/phase-11/screenshots/` が生成されること
- 手動テスト結果ドキュメントが更新可能であること

### 3.2 依存タスク

- TASK-10A-B（完了）

### 3.3 必要な知識

- Phase 11 画面検証手順
- `capture-screenshots` 系スクリプト運用

### 3.4 推奨アプローチ

1. スクリーンショット再撮影後に `ls -lt` で更新時刻を確認する。
2. `manual-test-result.md` に当日取得ファイルを明記する。
3. `task-workflow` と `ui-ux-feature-components` の証跡欄へ同じ証跡を同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                         | 発見経緯                                  | 解決策                                        | 教訓                                    |
| -------------------------------------------- | ----------------------------------------- | --------------------------------------------- | --------------------------------------- |
| 既存スクショの存在確認だけで完了判定しやすい | TASK-10A-B 再監査で旧証跡利用リスクを確認 | `ls -lt` で更新時刻を確認し、当日取得を証跡化 | UI証跡は「存在 + 鮮度」の二段確認が必要 |
| 証跡ファイル名の転記漏れ                     | 手動テスト結果と仕様書で記載粒度が揺れた  | 証跡ファイル名をテーブル形式で固定            | 再利用可能な証跡はファイル名まで残す    |

## 4. 実行手順

### Phase構成

- Phase A: 鮮度確認ルール定義
- Phase B: 手順への組み込み
- Phase C: 仕様台帳同期

### Phase A: 鮮度確認ルール定義

#### 目的

判定ルールを統一する。

#### 手順

1. UIタスクの証跡判定を「存在 + 更新時刻確認」に定義する。
2. 記録対象を `TC-*` ファイルへ固定する。

#### 成果物

- 鮮度判定ルール

#### 完了条件

- 判定基準が文書化されている。

### Phase B: 手順への組み込み

#### 目的

再監査時の実行漏れを防ぐ。

#### 手順

1. `ls -lt outputs/phase-11/screenshots` を実行する。
2. `manual-test-result.md` に取得ファイルを記録する。
3. 必要に応じて再撮影を実施する。

#### 成果物

- 実行ログ
- 更新済み手動テスト結果

#### 完了条件

- 画面証跡4状態の鮮度が確認できる。

### Phase C: 仕様台帳同期

#### 目的

証跡情報を正本仕様に残す。

#### 手順

1. `task-workflow.md` の残課題へ本タスクを登録する。
2. `ui-ux-feature-components.md` の関連未タスクへ追記する。
3. `verify-unassigned-links` で参照整合を確認する。

#### 成果物

- 更新済み `task-workflow.md` / `ui-ux-feature-components.md`

#### 完了条件

- 参照切れ0件を満たす。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UIタスク向け鮮度確認手順が定義されている
- [ ] `manual-test-result.md` に取得ファイルが記録される

### 品質要件

- [ ] `ls -lt` で最新更新時刻を確認できる
- [ ] `audit --target-file` で `currentViolations.total=0`

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` と `ui-ux-feature-components.md` に登録済み
- [ ] `lessons-learned.md` に関連未タスクとして追記済み

## 6. 検証方法

### テストケース

- Case 1: スクリーンショット更新直後に最新時刻が確認できる
- Case 2: 記載ファイルと実ファイルが一致する
- Case 3: 未タスク参照リンクが切れない

### 検証手順

```bash
ls -lt docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots
rg -n "TC-01|TC-02|TC-03|TC-04" docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/manual-test-result.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md
```

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                 |
| -------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 撮影済みだが記録漏れで鮮度不明になる   | 中     | 中       | 証跡ファイル名を `manual-test-result` に必須記録する |
| UI以外タスクで不要な運用コストが増える | 低     | 低       | UI変更タスクのみ適用と明記する                       |
| 取得日が曖昧で差し戻しになる           | 中     | 中       | 更新時刻とタスク実施日をペアで記録する               |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/`
- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/manual-test-result.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/capture-screenshots.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UI再確認で既存スクリーンショットの存在確認のみで完了判定しない。再取得と更新時刻確認を固定化する。
```

### 補足事項

本タスクは証跡品質ガードであり、表示仕様やUI機能そのものの変更は対象外。
