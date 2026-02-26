# UT-IMP-PHASE12-COMPLETED-TASK-REFERENCE-SYNC-GUARD-001: Phase 12 完了移管時の参照同期ガード

## メタ情報

```yaml
issue_number: 916
task_id: UT-IMP-PHASE12-COMPLETED-TASK-REFERENCE-SYNC-GUARD-001
task_name: Phase 12 完了移管時の参照同期ガード
category: 改善
target_feature: Phase 12 で unassigned-task から completed-tasks へ移管する際の参照整合
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 12 再確認（実装苦戦箇所）
created_date: 2026-02-26
```

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-COMPLETED-TASK-REFERENCE-SYNC-GUARD-001                             |
| タスク名     | Phase 12 完了移管時の参照同期ガード                                                |
| 分類         | 改善                                                                               |
| 対象機能     | Phase 12 の未タスク移管（`unassigned-task` → `completed-tasks`）                   |
| 優先度       | 中                                                                                 |
| 見積もり規模 | 中規模                                                                             |
| ステータス   | 未実施                                                                             |
| 発見元       | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 12 再確認（苦戦箇所・2026-02-26） |
| 発見日       | 2026-02-26                                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 で未タスク指示書を `completed-tasks/` へ移管した際、台帳・ワークフロー本文・Phase個票に残る旧参照（`unassigned-task/`）を同時更新できず、参照ドリフトが発生した。

### 1.2 問題点・課題

- `task-workflow.md` は完了参照になっているが、関連ワークフロー本文に旧参照が残りやすい
- 移管済みファイルのステータス（未実施/完了）が本文と不一致になる
- テンプレートに旧経路や誤った移管コマンドが残ると、再発しやすい

### 1.3 放置した場合の影響

- Phase 12 再監査で差し戻しが発生し、完了判定の信頼性が低下する
- 参照切れや誤参照により、後続タスクの追跡コストが増える
- 同種タスクで毎回手動修正が必要になり、工数が増える

---

## 2. 何を達成するか（What）

### 2.1 目的

完了移管時の参照更新を標準化し、「移管実体」「台帳」「関連ドキュメント」の三点同期を機械検証で保証する。

### 2.2 最終ゴール

1. `unassigned` → `completed` 移管時の更新対象ファイル一覧がテンプレート化されている
2. 参照パス更新漏れを検知するチェック手順が定義されている
3. 移管後の整合性を `verify-unassigned-links` と差分監査で確認できる

### 2.3 スコープ

#### 含むもの

- 移管時に更新すべき仕様書/ワークフロー本文のチェックリスト化
- 旧参照パス検出と置換の運用手順整備
- 完了移管後の検証コマンド運用（リンク・監査）

#### 含まないもの

- 既存全ワークフローの一括修正
- 実装コード（`apps/` / `packages/`）の機能変更

### 2.4 成果物

- 本未タスク指示書
- 仕様更新手順への移管同期ガード追記
- 検証ログ（リンク整合・差分監査）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 12 で対象タスクが完了状態であること
- 対象指示書の移管先（`completed-tasks/`）が存在すること
- `task-specification-creator` 検証スクリプトが実行可能であること

### 3.2 依存タスク

- ~~UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001~~（完了）

### 3.3 必要な知識

- `task-workflow.md` 残課題テーブルの更新ルール
- Phase 12 成果物とワークフロー本文の関連付け
- `verify-unassigned-links.js` と `audit-unassigned-tasks.js` の判定軸

### 3.4 推奨アプローチ

1. 移管前に旧参照の分布を `rg` で抽出する
2. 移管と参照置換を同一ターンで実施する
3. `current` 判定を基準に合否を確定し、baselineは監視として分離記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                                                                   | 解決策                                                       | 教訓                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| 完了移管後に旧参照が残る   | `UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001` 再確認で、`phase-1/4/5/13` に旧パス残存を確認 | 移管対象IDで `rg` し、ワークフロー本文・個票・台帳を同時更新 | 移管はファイル移動だけでなく、参照更新をセットで完了扱いにする |
| 台帳と実体の状態不一致     | `task-workflow.md` は完了だが、指示書本文ステータスが未実施のまま残存                      | 移管時に本文メタ（ステータス/成果物パス）も同期更新          | 「配置」と「状態」は別軸で検証しないと整合しない               |
| テンプレートに旧経路が残る | `skill-creator` テンプレートに絶対パスや旧成果物名が残っていた                             | 正規経路（repo相対）へ統一し、成果物名を最新仕様へ更新       | テンプレートは実体より先に崩れるため、定期同期が必要           |

---

## 4. 実行手順

### Phase構成

- Phase A: 旧参照の検出
- Phase B: 移管と参照同期
- Phase C: 検証と台帳確定

### Phase A: 旧参照の検出

#### 目的

移管対象タスクIDに紐づく旧参照箇所を網羅抽出する。

#### 手順

1. 対象タスクIDとファイル名で `rg` 検索を実行する
2. `unassigned-task/` を参照する箇所を一覧化する
3. 更新対象ファイルを確定する

#### 成果物

- 更新対象ファイル一覧

#### 完了条件

- 旧参照箇所が一覧化されている

### Phase B: 移管と参照同期

#### 目的

ファイル移管とドキュメント参照を同時に整合させる。

#### 手順

1. 対象指示書を `completed-tasks/` へ移動する
2. `task-workflow.md` の参照先とステータスを完了へ同期する
3. 関連ワークフロー本文（index/phase-\*）の参照を置換する
4. 指示書本文のステータス/成果物パスを完了状態へ更新する

#### 成果物

- 移管済み指示書
- 参照同期済み台帳とワークフロー本文

#### 完了条件

- `unassigned-task/` に対象が残っておらず、`completed-tasks/` に存在する

### Phase C: 検証と台帳確定

#### 目的

移管後の参照整合を機械的に保証する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行する
3. 必要に応じて `--target-file` 監査で個別合否を確認する
4. 検証結果を変更履歴/ログに記録する

#### 成果物

- 検証ログ

#### 完了条件

- `missing = 0` かつ `currentViolations = 0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 完了移管対象の参照更新チェックリストが定義されている
- [ ] 台帳/本文/実体の三点同期手順が定義されている
- [ ] 旧参照検出手順が運用化されている

### 品質要件

- [ ] `verify-unassigned-links` で参照切れ 0 件
- [ ] 差分監査で `currentViolations = 0`
- [ ] baseline と current の判定軸が分離されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] 苦戦箇所（3.5）が再利用可能な形式で記録されている

---

## 6. 検証方法

### テストケース

- Case 1: 完了移管後、`task-workflow.md` と実体パスが一致する
- Case 2: 関連ワークフロー本文に旧参照が残っていない
- Case 3: リンク検証と差分監査がともにPASSする

### 検証手順

```bash
rg -n "task-imp-phase12-completed-task-reference-sync-guard-001|unassigned-task/.*<対象ID>" docs/30-workflows .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-completed-task-reference-sync-guard-001.md
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                                               |
| ------------------------ | ------ | -------- | ------------------------------------------------------------------ |
| 移管後の旧参照残存       | 中     | 中       | 移管前後で `rg` 比較を必須化し、更新対象をチェックリストで固定する |
| ステータス整合の更新漏れ | 中     | 中       | 指示書本文メタの同期更新を完了条件に追加する                       |
| baseline違反の誤判定     | 中     | 低       | 合否は `currentViolations` 固定、baselineは監視として別記録する    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-imp-skill-validation-gate-alignment-001.md`
- `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 完了移管後に unassigned/completed の参照が混在し、台帳と実体がズレる。
移管時に参照更新・ステータス更新・検証ログ取得を同時実施するガードが必要。
```

### 補足事項

- 本タスクは「完了移管の運用ガード」を対象とするため、実装コード変更はスコープ外。
- 同様のズレが検出された場合は、まず `current` 判定で今回差分の有無を確定すること。
