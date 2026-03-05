# [#983] "[UT-TASK-10A-B-006] Phase 11 必須セクション検証ガード"

## メタ情報

```yaml
task_id: UT-TASK-10A-B-006
task_name: Phase 11 必須セクション検証ガード
category: 改善
target_feature: SkillAnalysisView Phase 11 手動テスト仕様
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-10A-B Phase 12 再監査（苦戦箇所）
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-B の再監査で `phase-11-manual-test.md` の必須節不足（`統合テスト連携`）が発生し、`validate-phase-output` が失敗した。

### 1.2 問題点・課題

- Phase 11 文書更新後の必須節確認が手作業で、実行漏れが起きやすい。
- `verify-all-specs` と `validate-phase-output` を通す前提チェックが標準化されていない。

### 1.3 放置した場合の影響

- UIタスクごとに同じ章不足エラーが再発し、Phase 12 完了判定が遅延する。
- 実装完了後に文書差し戻しが発生し、レビュー工数が増える。

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 文書の必須節（`統合テスト連携` / `成果物 or 実行手順` / `完了条件`）を機械的に検証し、更新漏れを防ぐ。

### 2.2 最終ゴール

1. Phase 11 更新時に必須節不足を即検出できる。
2. `verify-all-specs` / `validate-phase-output` 前に章不足が解消される。
3. `task-workflow.md` の証跡欄に同一手順で記録できる。

### 2.3 スコープ

#### 含むもの

- Phase 11 必須節確認手順の標準化
- `task-specification-creator` 運用ガイドへの反映
- `task-workflow.md` / `lessons-learned.md` の追跡導線

#### 含まないもの

- SkillAnalysisView の機能追加
- 既存の未タスク全体（baseline）是正

### 2.4 成果物

- 本未タスク指示書
- 必須節確認コマンドの運用手順
- 関連仕様書更新（task-workflow / lessons）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の検証スクリプトを実行できること
- 対象workflowに `phase-11-manual-test.md` が存在すること

### 3.2 依存タスク

- TASK-10A-B（完了）

### 3.3 必要な知識

- `validate-phase-output.js` の仕様
- Phase 11 テンプレート構造（`phase-templates.md`）

### 3.4 推奨アプローチ

1. 文書更新直後に `rg` で必須節を確認する。
2. 続けて `validate-phase-output` と `verify-all-specs` を実行する。
3. 証跡値を `task-workflow.md` に同一ターンで反映する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                   | 発見経緯                                           | 解決策                                        | 教訓                                         |
| -------------------------------------- | -------------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| `phase-11-manual-test.md` の必須節不足 | TASK-10A-B 再監査で `validate-phase-output` が失敗 | `統合テスト連携` を追記して 28項目PASSへ復帰  | Phase 11更新後は必須節grepを最初に実行する   |
| 章立て確認が後回しになりやすい         | 画面証跡更新を優先した結果、文書構造確認が遅延     | `rg` → `validate` → `verify` の固定順序を導入 | UIタスクは証跡更新と文書構造検証を分離しない |

## 4. 実行手順

### Phase構成

- Phase A: 必須節チェック定義
- Phase B: 検証フロー実装
- Phase C: 仕様同期

### Phase A: 必須節チェック定義

#### 目的

確認対象の見出しを固定する。

#### 手順

1. 必須見出しを3種に固定する（統合テスト連携、成果物/実行手順、完了条件）。
2. 検証コマンドを定義する。

#### 成果物

- 見出しチェックコマンド定義

#### 完了条件

- 3種見出しの判定基準が文書化されている。

### Phase B: 検証フロー実装

#### 目的

再監査時の実行順序を固定する。

#### 手順

1. `rg` で見出し存在確認を実行する。
2. `validate-phase-output` を実行する。
3. `verify-all-specs` を実行する。

#### 成果物

- 実行ログ

#### 完了条件

- 3コマンドが連続PASSする。

### Phase C: 仕様同期

#### 目的

追跡性を正本仕様へ反映する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ登録する。
2. `lessons-learned.md` の関連未タスクへ追加する。
3. `verify-unassigned-links` で参照整合を確認する。

#### 成果物

- 更新済み `task-workflow.md` / `lessons-learned.md`

#### 完了条件

- 参照切れ0件を満たす。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 11 必須節チェックコマンドが定義されている
- [ ] `rg` → `validate` → `verify` の順序が手順化されている

### 品質要件

- [ ] `validate-phase-output` が PASS
- [ ] `verify-all-specs` が PASS
- [ ] `audit --target-file` で `currentViolations.total=0`

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` に本タスクが登録済み
- [ ] `lessons-learned.md` に本タスクの参照が追記済み

## 6. 検証方法

### テストケース

- Case 1: 必須節不足時に `rg` で即検出できる
- Case 2: 必須節追加後に `validate-phase-output` がPASSする
- Case 3: 参照追加後に `verify-unassigned-links` がPASSする

### 検証手順

```bash
rg -n -e '^## 統合テスト連携$' -e '^## 成果物$' -e '^## 実行手順$' -e '^## 完了条件$' docs/30-workflows/completed-tasks/skill-analysis-view/phase-11-manual-test.md
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-analysis-view
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-analysis-view --strict
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md
```

## 7. リスクと対策

| リスク                                            | 影響度 | 発生確率 | 対策                                   |
| ------------------------------------------------- | ------ | -------- | -------------------------------------- |
| UIタスク以外にも一律適用して運用過多になる        | 低     | 中       | UI変更タスク限定の実行条件を明記する   |
| `成果物` と `実行手順` のどちらか判定が曖昧になる | 中     | 中       | どちらか1つ存在で合格と明文化する      |
| 検証はPASSでも証跡転記を忘れる                    | 中     | 中       | `task-workflow` 同期を完了条件に入れる |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/phase-11-manual-test.md`
- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
phase-11-manual-test.md の必須節不足（統合テスト連携欠落）で再監査時に validate-phase-output が失敗
```

### 補足事項

本タスクは機能実装ではなく、Phase 11/12 の再監査運用を安定化するための品質ガードである。
