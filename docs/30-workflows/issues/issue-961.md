# [#961] "[UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001] Phase 12 システム仕様スキル抽出・反映ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001
task_name: Phase 12 システム仕様スキル抽出・反映ガード
category: 改善
target_feature: 未タスク仕様書作成時に aiworkflow-requirements から必要仕様を漏れなく抽出し反映する運用
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 実装追補（苦戦箇所・2026-03-03）
created_date: 2026-03-03
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

未タスク仕様書を作成する際、`task-specification-creator` のテンプレート要件は満たせても、`aiworkflow-requirements` で要求される「正本台帳同期」「検索起点」「更新後検証」の反映が漏れるケースが発生した。

### 1.2 問題点・課題

- 未タスク本文に苦戦箇所は記録しても、`task-workflow.md` / `lessons-learned.md` への同期が後回しになりやすい。
- `aiworkflow-requirements` の `resource-map` / `topic-map` を起点にせず局所読みに寄ると、必要参照の抽出漏れが起きる。
- 更新後に `verify-unassigned-links` と `audit-unassigned-tasks` を実行しても、判定軸（current/baseline）の記録が一貫しない。

### 1.3 放置した場合の影響

- 同種課題で「未タスク仕様書はあるが、システム仕様側に追跡導線がない」状態が再発する。
- 仕様更新の再現性が落ち、再監査で差し戻しが増える。
- 苦戦箇所が次タスクへ転用されず、同じ調査コストを繰り返す。

---

## 2. 何を達成するか（What）

### 2.1 目的

未タスク仕様書作成時に、`aiworkflow-requirements` から必要情報を漏れなく抽出し、台帳・教訓・検証証跡まで同一ターンで反映する標準手順を確立する。

### 2.2 最終ゴール

1. `resource-map` 起点で必要参照を抽出し、未タスク仕様書へ反映できる。
2. `docs/30-workflows/unassigned-task/` への配置と同時に、`task-workflow.md` 残課題テーブルへ登録できる。
3. `lessons-learned.md` に関連タスク導線を追加し、苦戦箇所の再利用を固定できる。
4. `verify-unassigned-links` と `audit --target-file` の結果を `currentViolations=0` 基準で記録できる。

### 2.3 スコープ

#### 含むもの

- 未タスク仕様書の 9 セクション + 3.5 苦戦箇所記録
- `aiworkflow-requirements` の必要参照抽出手順（`resource-map` / `topic-map` / `search-spec`）
- `task-workflow.md` / `lessons-learned.md` への同期登録
- 対象監査（`--target-file`）による品質確認

#### 含まないもの

- 実装コード（`apps/`, `packages/`）の機能追加・修正
- 既存 baseline 違反の全件解消
- すべての既存未タスク指示書の再整形

### 2.4 成果物

- 本未タスク指示書
- `task-workflow.md` 残課題テーブルの登録行
- `lessons-learned.md` の関連タスク導線
- 検証ログ（links + audit）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/SKILL.md` と `unassigned-task-guidelines.md` を参照可能
- `.claude/skills/aiworkflow-requirements/SKILL.md` の Task仕様ナビ（search/browse/read/update/index）を利用可能
- `docs/30-workflows/unassigned-task/` と `aiworkflow-requirements/references/` へ書き込み可能

### 3.2 依存タスク

- `UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001`（完了）
- `UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001`（未実施、関連）

### 3.3 必要な知識

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 3.4 推奨アプローチ

1. 先に `aiworkflow-requirements` の参照抽出範囲を固定する（resource-map -> topic-map -> reference）。
2. 未タスク仕様書を 9 セクション + 3.5 で作成し、同一ターンで台帳へ登録する。
3. `verify-unassigned-links` と `audit --target-file` を実行し、`currentViolations=0` を合否基準にする。
4. baseline は監視値として別記録し、今回差分判定と混同しない。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題               | 発見経緯                                                                             | 解決策                                                                           | 教訓                                                             |
| ------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 必要仕様の抽出漏れ | 未タスク本文作成を先行し、`aiworkflow-requirements` 参照が後追いになった             | `resource-map` で対象ファイルを先に確定し、`search-spec` で不足参照を補完        | 「先に仕様抽出、後で本文作成」の順序を固定しないと漏れが再発する |
| 台帳同期の片側更新 | 未タスクを配置したが `task-workflow` または `lessons` のどちらかが未同期になりやすい | 未タスク作成と同一ターンで `task-workflow.md` と `lessons-learned.md` を同時更新 | 未タスク運用は「指示書 + 台帳 + 教訓」の三点同時更新が必要       |
| 監査結果の誤読     | `audit` の baseline 値を今回差分の fail と誤認しやすい                               | 合否を `currentViolations.total` 固定にし、baseline は監視欄へ分離記録           | 監査は「判定値(current)」と「監視値(baseline)」を分離して扱う    |
| 更新後検証の抜け   | 文書更新後に links 検証を飛ばしやすい                                                | `verify-unassigned-links` を完了条件へ組み込み、missing=0 を必須化               | 参照整合は文書更新の最後ではなく完了判定の必須要件として扱う     |

---

## 4. 実行手順

### Phase構成

- Phase A: 仕様抽出範囲の確定
- Phase B: 未タスク仕様書の作成
- Phase C: システム仕様台帳への反映
- Phase D: 検証と記録

### Phase A: 仕様抽出範囲の確定

#### 目的

`aiworkflow-requirements` から今回必要な参照を漏れなく抽出する。

#### 手順

1. `resource-map.md` でタスク種別に対応する参照ファイルを特定する。
2. `search-spec.js` でキーワード検索し、追加参照候補を抽出する。
3. `topic-map.md` で該当セクション位置を確認する。

#### 成果物

- 参照抽出マトリクス（対象ファイル一覧）

#### 完了条件

- 未タスク本文で参照すべき仕様ファイルが確定している。

### Phase B: 未タスク仕様書の作成

#### 目的

9 セクション + 3.5 苦戦箇所を満たした実行可能な指示書を作る。

#### 手順

1. `docs/30-workflows/unassigned-task/` に新規指示書を作成する。
2. Why/What/How を具体化し、実行手順を Phase 単位で記述する。
3. 3.5 セクションへ親タスク由来の苦戦箇所を転記する。

#### 成果物

- 新規未タスク仕様書（本ファイル）

#### 完了条件

- `audit-unassigned-tasks --target-file` で必須見出し欠落がない。

### Phase C: システム仕様台帳への反映

#### 目的

未タスクをシステム仕様上で追跡可能にする。

#### 手順

1. `task-workflow.md` 残課題テーブルへタスク行を追加する。
2. `task-workflow.md` 変更履歴へ登録記録を追加する。
3. `lessons-learned.md` の関連タスク表へ導線を追加する。

#### 成果物

- 更新済み `task-workflow.md` / `lessons-learned.md`

#### 完了条件

- 未タスクIDが台帳と教訓の両方から辿れる。

### Phase D: 検証と記録

#### 目的

配置・参照・監査結果を機械的に確定する。

#### 手順

1. `verify-unassigned-links.js` を実行して参照切れを確認する。
2. `audit-unassigned-tasks.js --json --target-file <本ファイル>` を実行する。
3. 必要に応じて `audit --diff-from HEAD` を実行し、current/baseline を分離記録する。

#### 成果物

- 検証ログ（links / audit）

#### 完了条件

- `missing=0` かつ `currentViolations.total=0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `aiworkflow-requirements` から必要参照を抽出した記録がある
- [ ] 未タスク仕様書が 9 セクション + 3.5 構成で作成されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み

### 品質要件

- [ ] 苦戦箇所が「課題/発見経緯/解決策/教訓」で記録されている
- [ ] `current` / `baseline` 判定軸が分離されている
- [ ] `verify-unassigned-links` で missing=0

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の変更履歴に登録されている
- [ ] `lessons-learned.md` の関連タスク導線が更新されている

---

## 6. 検証方法

### テストケース

- Case 1: 本指示書が 10 必須見出し（メタ情報 + 1〜9）を満たす
- Case 2: `task-workflow` から本指示書への参照が解決できる
- Case 3: `audit --target-file` で current 違反 0 件

### 検証手順

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Phase 12 未タスク 仕様更新" -C 3
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                                                            |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------------- |
| 参照抽出の抜け漏れ | 中     | 中       | `resource-map` -> `search-spec` -> `topic-map` の順に抽出し、参照一覧を固定する |
| 台帳と本文の不一致 | 中     | 中       | 未タスク作成と同一ターンで `task-workflow` / `lessons` を更新する               |
| 監査値の誤読       | 高     | 中       | 合否は `currentViolations=0` 固定、baseline は監視指標として別枠記録する        |
| 参照切れの残存     | 中     | 低       | `verify-unassigned-links` を完了条件に含め、missing=0 以外は完了扱いにしない    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 参考資料

- `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
未タスク仕様書を作るだけでなく、システム仕様スキル（aiworkflow-requirements）の内容から
今回実装に必要な情報を漏れなく抽出し、再利用できる形で反映すること。
```

### 補足事項

- 本タスクは運用ガードの整備を目的とし、機能実装の追加は対象外とする。
- まず台帳同期と検証手順を固定し、必要であれば後続で自動化タスクへ分割する。
