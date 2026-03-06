# UT-TASK-10A-B-008 未タスク件数再計算同期ガード - タスク指示書

## メタ情報

```yaml
issue_number: 996
```

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-TASK-10A-B-008                           |
| タスク名     | 未タスク件数再計算同期ガード                |
| 分類         | 改善                                        |
| 対象機能     | SkillAnalysisView Phase 12 未タスク台帳同期 |
| 優先度       | 中                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 完了（2026-03-06）                          |
| 発見元       | TASK-10A-B Phase 12 再監査（苦戦箇所）      |
| 発見日       | 2026-03-02                                  |

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

1. `UT-TASK-10A-B-002 / 004 / 005 / 006 / 007 / 009` の active set と件数が全台帳で一致する。
2. 完了済み `UT-TASK-10A-B-001 / 003 / 008` が未タスク台帳に残置しない。
3. 同期後に `validate-task10ab-ledger-sync` と `audit --diff-from HEAD` が PASS する。

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

- UT-TASK-10A-B-002 / 004 / 005（継続未タスク）
- UT-TASK-10A-B-006 / 007 / 009（継続運用ガード）
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

1. `validate-task10ab-ledger-sync` で canonical/derived の同期を確認する。
2. `verify-unassigned-links` を実行する。
3. `audit --diff-from HEAD` で今回差分の current 判定を確認する。

#### 成果物

- 検証ログ

#### 完了条件

- `missing=0` かつ `currentViolations.total=0`。

## 5. 完了条件チェックリスト

### 機能要件

- [x] 有効ID一覧が確定している
- [x] 台帳3点のID集合が一致している

### 品質要件

- [x] `verify-unassigned-links` がPASS
- [x] `validate-task10ab-ledger-sync` がPASS
- [x] `audit --diff-from HEAD` が `currentViolations.total=0`

### ドキュメント要件

- [x] 本指示書が `docs/30-workflows/completed-tasks/` に移管済み
- [x] `task-workflow.md` に本タスクの完了が登録済み
- [x] `lessons-learned.md` に再利用導線が追加済み

## 6. 検証方法

### テストケース

- Case 1: current active set（002/004/005/006/007/009）が3台帳で一致する
- Case 2: completed set（001/003/008）が active set から除外される
- Case 3: 今回差分の未タスク監査で current が0件

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/validate-task10ab-ledger-sync.js
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                                 |
| ---------------------------------- | ------ | -------- | -------------------------------------------------------------------- |
| 件数のみ更新してID同期漏れが残る   | 高     | 中       | `validate-task10ab-ledger-sync` で active/completed 両集合を検証する |
| 旧参照パスが残ってリンク切れになる | 中     | 中       | `verify-unassigned-links` を必須化する                               |
| baseline違反を今回差分と誤認する   | 中     | 中       | 合否は current 固定、baselineは監視値で分離記録する                  |

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

## 10. 完了実績

- `UT-TASK-10A-B-001 / 003 / 008` を completed 集合へ移し、current active set を `002 / 004 / 005 / 006 / 007 / 009` に固定
- `task-workflow.md` / `ui-ux-feature-components.md` / parent `unassigned-task-detection.md` を同一ターンで同期
- `validate-task10ab-ledger-sync.js` とテストを追加し、固定レンジ依存の再発を機械検証へ置換
