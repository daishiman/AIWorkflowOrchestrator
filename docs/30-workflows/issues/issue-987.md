# [#987] "[UT-TASK-10A-B-008] 未タスク件数再計算同期ガード"

## メタ情報

```yaml
task_id: UT-TASK-10A-B-008
task_name: 未タスク件数再計算同期ガード
category: 改善
target_feature: SkillAnalysisView Phase 12 未タスク台帳同期
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-10A-B Phase 12 再監査（苦戦箇所）
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-b-unassigned-count-resync-guard.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-B の再監査で、修正済み課題（D1/D2）を未タスク台帳から除外し忘れ、未タスク件数が 7件のまま残るドリフトが発生した。

### 1.2 問題点・課題

- `unassigned-task-detection.md`、`task-workflow.md`、`ui-ux-feature-components.md` の件数とIDが同期されない。
- 件数だけ更新してID一覧を見直さない運用だと整合崩れが再発する。

### 1.3 放置した場合の影響

- 完了済み項目が未タスクとして残り、優先度判断を誤る。
- Phase 12 での残課題管理信頼性が低下する。

## 2. 何を達成するか（What）

### 2.1 目的

未タスク件数を「有効ID一覧ベース」で再計算し、複数台帳へ同時同期するガード手順を標準化する。

### 2.2 最終ゴール

1. `UT-TASK-10A-B-001〜005` の有効IDセットと件数が全台帳で一致する。
2. 修正済み項目が未タスク台帳に残置しない。
3. 同期後に `verify-unassigned-links` が安定してPASSする。

### 2.3 スコープ

#### 含むもの

- 有効ID再計算手順の定義
- 台帳3点（`unassigned-task-detection` / `task-workflow` / `ui-ux-feature`）の同時同期
- 参照リンク整合確認

#### 含まないもの

- 既存他タスクの未タスク一括整理
- 新規機能実装

### 2.4 成果物

- 本未タスク指示書
- 件数再計算・同期手順
- 仕様台帳の追跡リンク

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/unassigned-task/` に対象未タスク指示書が存在すること
- `task-workflow.md` と `ui-ux-feature-components.md` が更新可能であること

### 3.2 依存タスク

- UT-TASK-10A-B-001〜005（既存未タスク）
- TASK-10A-B（完了）

### 3.3 必要な知識

- Phase 12 未タスク運用（`unassigned-task-guidelines.md`）
- `verify-unassigned-links.js` / `audit-unassigned-tasks.js` の読み方

### 3.4 推奨アプローチ

1. まず有効な未タスクID一覧を確定する。
2. 件数だけでなくIDと参照パスを3台帳に同時反映する。
3. 同期直後にリンク検証と対象監査を実行する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                                    | 解決策                                              | 教訓                                                      |
| ------------------------------ | ----------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| 未タスク件数が 7件のまま残った | TASK-10A-B 再監査で D1/D2 修正済みなのに台帳未更新          | 有効IDを 001〜005 に再確定し、3台帳を同一ターン更新 | 件数更新はID再計算とセットで実施する                      |
| 台帳間で参照の粒度が揺れる     | detection は件数、workflow は表、UI仕様は関連未タスクで分断 | 参照先ファイルパスを3台帳で統一し、同時更新する     | 未タスク管理は「件数」「ID」「参照先」の3点一致で判定する |

## 4. 実行手順

### Phase構成

- Phase A: 有効ID再計算
- Phase B: 台帳同時同期
- Phase C: 検証と固定化

### Phase A: 有効ID再計算

#### 目的

更新対象のID集合を確定する。

#### 手順

1. `docs/30-workflows/unassigned-task/` の対象ファイルを列挙する。
2. 修正済み課題を除外し、有効IDを確定する。

#### 成果物

- 有効ID一覧

#### 完了条件

- IDと件数が一意に決まっている。

### Phase B: 台帳同時同期

#### 目的

件数ドリフトを解消する。

#### 手順

1. `unassigned-task-detection.md` の件数とID記載を更新する。
2. `task-workflow.md` の残課題テーブルを更新する。
3. `ui-ux-feature-components.md` の関連未タスクを更新する。

#### 成果物

- 更新済み3台帳

#### 完了条件

- 3台帳でID集合と件数が一致している。

### Phase C: 検証と固定化

#### 目的

同期結果を機械検証で保証する。

#### 手順

1. `verify-unassigned-links` を実行する。
2. `audit --target-file` で本指示書の形式を確認する。
3. `audit --diff-from HEAD` で今回差分の current 判定を確認する。

#### 成果物

- 検証ログ

#### 完了条件

- `missing=0` かつ `currentViolations.total=0`。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 有効ID一覧が確定している
- [ ] 台帳3点のID集合が一致している

### 品質要件

- [ ] `verify-unassigned-links` がPASS
- [ ] `audit --target-file` が `currentViolations.total=0`
- [ ] `audit --diff-from HEAD` が `currentViolations.total=0`

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` に本タスクが登録済み
- [ ] `lessons-learned.md` に参照導線が追加済み

## 6. 検証方法

### テストケース

- Case 1: 有効ID集合が3台帳で一致する
- Case 2: 参照リンク切れが0件
- Case 3: 今回差分の未タスク監査で current が0件

### 検証手順

```bash
rg -n "UT-TASK-10A-B-00[1-8]" docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md
rg -n "UT-TASK-10A-B-00[1-8]" .claude/skills/aiworkflow-requirements/references/task-workflow.md
rg -n "UT-TASK-10A-B-00[1-8]" .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-10a-b-unassigned-count-resync-guard.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                |
| ---------------------------------- | ------ | -------- | --------------------------------------------------- |
| 件数のみ更新してID同期漏れが残る   | 高     | 中       | 3台帳のID集合を `rg` で同時検証する                 |
| 旧参照パスが残ってリンク切れになる | 中     | 中       | `verify-unassigned-links` を必須化する              |
| baseline違反を今回差分と誤認する   | 中     | 中       | 合否は current 固定、baselineは監視値で分離記録する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
未タスク件数ドリフト（7件→5件）を再発させないため、有効ID再計算と台帳3点同期をガード化する。
```

### 補足事項

本タスクは件数整合の運用改善が目的であり、既存未タスクの技術実装自体は対象外。
