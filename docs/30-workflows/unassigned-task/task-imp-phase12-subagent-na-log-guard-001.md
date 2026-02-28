# Phase 12 仕様書別SubAgent N/A判定ログガード - タスク指示書

## メタ情報

```yaml
issue_number: 933
```

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                                                      |
| タスク名     | Phase 12 仕様書別SubAgent N/A判定ログガード                                                   |
| 分類         | 改善                                                                                          |
| 対象機能     | Phase 12 の仕様書同期（aiworkflow-requirements / task-specification-creator / skill-creator） |
| 優先度       | 中                                                                                            |
| 見積もり規模 | 中規模                                                                                        |
| ステータス   | 未実施                                                                                        |
| 発見元       | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 Phase 12 実行監査                                   |
| 発見日       | 2026-02-28                                                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 実行監査で、成果物実体の確認は完了していても、`artifacts.json` のステータスや `phase-12-documentation.md` のチェック同期、非対象仕様書の扱い（N/A判定ログ）が運用依存になっていた。

### 1.2 問題点・課題

- 仕様書別SubAgentで分担しても、更新不要な仕様書を「未対応」か「意図的N/A」か判別しにくい。
- 完了判定が手作業中心で、三点突合（成果物実体 / artifacts / チェックリスト）漏れが再発しやすい。
- `current` と `baseline` の監査値を誤読すると、今回差分の合否判定を誤る。

### 1.3 放置した場合の影響

- 監査差し戻しが繰り返され、Phase 12 の完了判定コストが増大する。
- 仕様書同期の説明責任が弱くなり、後続担当が再確認時に同じ調査をやり直す。
- 未タスクの起票基準が曖昧化し、再発防止が進まない。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の仕様同期で、仕様書別SubAgent運用時の「更新/N/A判定」と完了判定（三点突合）を機械確認できる状態にする。

### 2.2 最終ゴール

1. 仕様書ごとに `更新` または `N/A` を必ず記録し、理由と代替証跡が残る。
2. Phase 12 完了判定を三点突合で機械確認できる。
3. 監査結果の合否を `currentViolations.total` 基準で一貫判定できる。

### 2.3 スコープ

#### 含むもの

- `phase12-system-spec-retrospective-template.md` を入力にした N/A判定ログ運用の固定化。
- Phase 12 三点突合（成果物実体/`artifacts.json`/`phase-12-documentation.md`）の検証手順整備。
- 監査結果を `current` / `baseline` 分離で記録する運用チェック。

#### 含まないもの

- 各機能タスク本体（Main/Renderer/IPC）の実装変更。
- 既存の全未タスク（baseline違反）の一括是正。
- Phase 1〜11 の工程定義変更。

### 2.4 成果物

- Phase 12 N/A判定ログの検証手順書。
- 三点突合の検証コマンドセット。
- `aiworkflow-requirements` 側の残課題台帳同期記録。

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクガイドラインと監査スクリプトが利用可能である。
- `aiworkflow-requirements` の `task-workflow.md` / `lessons-learned.md` が更新可能である。
- Phase 12 実行済みワークフローを最低1件用意できる。

### 3.2 依存タスク

- TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001（Phase 12 実行監査）
- UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001（証跡・リンク監査運用）

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 3.4 推奨アプローチ

1. 仕様書別SubAgentの担当表を作成し、5仕様書を `更新/N/A` で明示判定する。
2. 三点突合の検証を実行し、いずれか未達なら `Phase 12 未完了` と判定する。
3. `audit-unassigned-tasks --diff-from HEAD` の `currentViolations.total` で合否を記録し、`baseline` は監視値として分離記録する。
4. 結果を `task-workflow.md` と `lessons-learned.md` に同一ターン反映する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                               | 発見経緯                                                         | 解決策                                                                   | 教訓                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 成果物実体が揃っていても `artifacts.json` が `pending` のまま残る  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の Phase 12 監査で確認 | 完了判定をファイル存在のみで行わず、`phases.12.status` を必須確認にした  | Phase 12 は「成果物実体 + artifacts + チェックリスト」の三点突合を必須化する |
| `audit-unassigned-tasks` の `baseline` と `current` を誤読しやすい | `--json` 単体実行の違反件数を今回差分と誤認                      | `--diff-from HEAD` を併用し、合否判定を `currentViolations.total` に固定 | 監査値は `current`（合否）と `baseline`（監視）を常に分離記録する            |
| `phase-12-documentation.md` のチェック未同期が発生                 | 成果物作成と手順書更新が別ターンで実施された                     | 実体証跡と手順書チェックを同一ターンで同期する運用に変更                 | 実装証跡と宣言（チェックリスト）は必ず同時更新する                           |
| 非対象仕様書の扱いが不明瞭                                         | 仕様書別SubAgent分担で更新不要ファイルの理由が残らない           | N/A判定ログ（判定理由/代替証跡）をテンプレート化                         | 「更新なし」は省略ではなく N/A 記録として残す                                |

---

## 4. 実行手順

### Phase構成

- Phase A: 監査ルール定義
- Phase B: 検証コマンド整備
- Phase C: 台帳同期と検証

### Phase A: 監査ルール定義

#### 目的

N/A判定ログと三点突合の判定基準を固定する。

#### 手順

1. 仕様書別SubAgent分担表を作成する。
2. 5仕様書それぞれを `更新` または `N/A` で判定する。
3. N/A項目へ理由と代替証跡を記録する。

#### 成果物

- N/A判定ログ付き監査メモ

#### 完了条件

- 5仕様書すべてに判定結果が記録されている。

### Phase B: 検証コマンド整備

#### 目的

三点突合と未タスク監査を再現可能な手順にする。

#### 手順

1. `verify-all-specs` / `validate-phase-output` を実行する。
2. `outputs/phase-12` の必須5成果物存在を確認する。
3. `artifacts.json` の `phases.12.status` を確認する。
4. `phase-12-documentation.md` の完了チェック同期を確認する。
5. `verify-unassigned-links` と `audit --diff-from HEAD` を実行する。

#### 成果物

- 検証ログ（コマンドと結果）

#### 完了条件

- 合否判定に必要な全コマンド結果が揃っている。

### Phase C: 台帳同期と検証

#### 目的

未タスク指示書とシステム仕様台帳を同期し、参照整合を確定する。

#### 手順

1. 本未タスク指示書を `docs/30-workflows/unassigned-task/` に配置する。
2. `task-workflow.md` の残課題テーブルへ本タスクを追加する。
3. `verify-unassigned-links.js` で参照整合を確認する。
4. `audit-unassigned-tasks.js --target-file` で本ファイルの形式監査を実施する。

#### 成果物

- 未タスク指示書
- 更新済み残課題テーブル

#### 完了条件

- 参照切れ0件、対象監査 `currentViolations.total = 0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 仕様書別SubAgent分担で `更新/N/A` 判定ログを作成できる。
- [ ] Phase 12 三点突合の判定手順が定義されている。
- [ ] 合否判定に `currentViolations.total` を使用するルールが明文化されている。

### 品質要件

- [ ] 判定手順が再実行可能である。
- [ ] N/A判定に理由と代替証跡が必ず付与される。
- [ ] 対象監査でフォーマット違反0件を維持できる。

### ドキュメント要件

- [ ] 本未タスク指示書が `## メタ情報` + `## 1..9` を満たしている。
- [ ] `task-workflow.md` の残課題テーブルに登録されている。
- [ ] 関連仕様書リンクが有効である。

---

## 6. 検証方法

### テストケース

- Case 1: N/A判定ログ未記載の場合、完了不可と判定できる。
- Case 2: `artifacts.json` が `pending` の場合、完了不可と判定できる。
- Case 3: `phase-12-documentation.md` 未同期の場合、完了不可と判定できる。
- Case 4: `audit --diff-from HEAD` で `current=0` を確認できる。

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                        |
| ------------------------------------------------ | ------ | -------- | ----------------------------------------------------------- |
| N/A判定ログが形骸化し、理由が空欄で運用される    | 中     | 中       | 完了条件に「理由 + 代替証跡」を必須項目として固定する       |
| 三点突合のうち一部だけ実施して完了扱いになる     | 高     | 中       | 完了判定を3ゲート全通過に固定し、未達は未完了に戻す         |
| baseline違反を今回差分違反と誤読して過剰修正する | 中     | 中       | `current/baseline` 分離記録をテンプレート項目として固定する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 参考資料

- `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-12-documentation.md`
- `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 の完了判定において、成果物実体だけでなく artifacts / チェックリスト / N/A判定理由の同期を必須化する。
```

### 補足事項

本タスクは「機能実装」ではなく「Phase 12 運用ガード強化」の未タスクである。完了時は `unassigned-task` から `completed-tasks/unassigned-task` への移管を実施する。
