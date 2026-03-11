# [#1012] "[UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001] Phase 12 task spec 再確認テンプレート採用強制と監査自動化"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001
task_name: Phase 12 task spec 再確認テンプレート採用強制と監査自動化
category: 改善
target_feature: Phase 12 再監査運用（`task-specification-creator` / `aiworkflow-requirements`）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC 再確認
created_date: 2026-03-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-task-spec-recheck-adoption-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-creator` 側には `phase12-task-spec-recheck-template.md` を追加し、Phase 12 の4点突合
（`phase-12-documentation.md` / `outputs/phase-12` / `implementation-guide.md` / 未タスク10見出し）
を専用テンプレートとして切り出した。  
ただし現状は `task-specification-creator` 側でこのテンプレート採用が必須化されておらず、
recheck の実施順と system spec 反映が担当者の記憶に依存している。

### 1.2 問題点・課題

- 専用テンプレートを追加しても、後続タスクで採用されない可能性がある。
- `verify-all-specs` / `validate-phase-output` が PASS でも、4点突合や system spec 同値同期が抜けうる。
- docs-heavy / `spec_created` task の Phase 12 で、未タスク起票と system spec 更新が手動分岐のまま残る。

### 1.3 放置した場合の影響

- 同種課題で再び「outputs は揃っているのに task spec 未準拠」が発生する。
- `task-workflow.md` / `lessons-learned.md` と current workflow `outputs/phase-12` の実測値がドリフトする。
- Phase 12 再確認のたびに、専用テンプレートの存在自体を探し直す必要が生じる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の task spec 再確認を、テンプレート追加だけで終わらせず、
`task-specification-creator` のガイド・監査・未タスク運用へ接続して再利用可能にする。

### 2.2 最終ゴール

- docs-heavy / `spec_created` task で、Phase 12 再確認時に専用テンプレート採用が自然に選ばれる。
- 4点突合と system spec 反映漏れを、ガイドまたはスクリプトで検出できる。
- 未タスク化が必要な残差を、`docs/30-workflows/unassigned-task/` 正本と system spec の両方へ同期できる。

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` 側ガイドに、専用 recheck テンプレートの採用トリガーを追加する。
- Phase 12 監査に、4点突合の実施有無を確認するチェックまたは補助スクリプトを追加する。
- `aiworkflow-requirements` に、専用テンプレート採用順序と未タスク化判断を運用ルールとして追記する。

#### 含まないもの

- 過去の完了済み workflow 全件の一括再監査。
- CI への必須ジョブ追加。
- `skill-creator` テンプレート自体の新規増設（既存テンプレートの採用導線強化を優先）。

### 2.4 成果物

- `task-specification-creator` の guide / patterns / scripts 更新
- `aiworkflow-requirements` の運用ルール更新
- 専用 recheck テンプレート採用を前提にした検証ログ
- 必要に応じた sample output または implementation guide 追補

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `skill-creator/assets/phase12-task-spec-recheck-template.md` が存在すること。
- `TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC` の current workflow と `outputs/phase-12` が参照可能であること。
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` が利用可能であること。

### 3.2 依存タスク

- TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC（完了）
- 既存の Phase 12 ガイド更新（完了）
- `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001`（並行する Phase 12 自動化改善）

### 3.3 必要な知識

- Phase 12 Task 12-1〜12-5 の完了条件
- `docs/30-workflows/unassigned-task/` の 10見出しフォーマット
- `currentViolations` / `baselineViolations` の分離運用
- `task-workflow.md` / `lessons-learned.md` / current workflow outputs の同値同期

### 3.4 推奨アプローチ

Guard First を採用する。  
まず「どのタスクで専用テンプレートを使うべきか」を guide に固定し、
次に 4点突合の実施有無を検査する補助スクリプトまたはチェックリストを追加し、
最後に system spec と未タスク正本へ同値同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                                                                         | 解決策                                                                                 | 教訓                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 専用 recheck テンプレートを追加しても採用が任意のまま残る | TASK-UI-01-E で `phase12-task-spec-recheck-template.md` を追加後、task-spec skill 側で採用トリガーが未固定だった | `task-specification-creator` guide に docs-heavy / `spec_created` の採用条件を追加する | テンプレートは存在だけでなく採用条件まで同期して初めて再利用できる |
| outputs の存在確認だけでは task spec 未準拠が見逃される   | `verify-all-specs` / `validate-phase-output` PASS 後も 4点突合が別確認として残った                               | 4点突合の実施有無を監査できるチェックを導入する                                        | Phase 12 は量ではなく意味要件の確認を自動化する必要がある          |
| system spec 反映と未タスク起票が担当者依存になる          | `task-workflow.md` / `lessons-learned.md` / outputs 側の更新順が手動だった                                       | 専用テンプレート採用後の同期順序を guide に固定する                                    | 同じ課題を短く閉じるには「採用順序」も仕様化すべき                 |

---

## 4. 実行手順

### Phase A: 採用条件固定

#### 目的

どの条件で `phase12-task-spec-recheck-template.md` を使うべきかを明文化する。

#### 手順

1. `spec_created` / docs-heavy / 再監査タスクの判定条件を整理する。
2. `task-specification-creator` guide に採用トリガーを追記する。
3. 未タスク化判断の条件を `aiworkflow-requirements` へ同期する。

#### 完了条件

- 専用テンプレート採用の対象条件が 1 箇所ではなく、guide と system spec の両方で確認できる。

### Phase B: 監査導線実装

#### 目的

4点突合と未タスク同期の実施有無を確認できるようにする。

#### 手順

1. 4点突合の実施有無を確認するチェックまたは補助スクリプトを追加する。
2. `audit-unassigned-tasks --diff-from HEAD --target-file` の使い分けを、専用テンプレートの検証手順へ組み込む。
3. 必要なら sample output を追加し、期待される出力構造を固定する。

#### 完了条件

- 専用テンプレートを使った Phase 12 再確認で、監査観点がコマンドまたはチェックリストとして再利用できる。

### Phase C: system spec と未タスク運用同期

#### 目的

system spec 正本と未タスク正本の更新順を固定し、再監査コストを下げる。

#### 手順

1. `task-workflow.md` / `lessons-learned.md` / current workflow `outputs/phase-12` を同値同期する。
2. 残差がある場合は `docs/30-workflows/unassigned-task/` へ起票し、system spec に同 ID を反映する。
3. `verify-unassigned-links` と `audit --diff-from HEAD` を実行して完了を確認する。

#### 完了条件

- Phase 12 再確認の残差が、current workflow outputs と system spec 正本の両方で追跡可能になっている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 専用 recheck テンプレートの採用条件が guide に定義されている
- [ ] 4点突合の実施有無を確認できる監査導線がある
- [ ] 未タスク起票と system spec 同期の順序が明文化されている

### 品質要件

- [ ] `verify-unassigned-links` が PASS する
- [ ] 対象未タスクの `audit --diff-from HEAD --target-file` が `currentViolations=0` になる
- [ ] repo 差分全体の `audit --diff-from HEAD` が `currentViolations=0` になる

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に苦戦箇所と再利用手順が同期されている
- [ ] current workflow `outputs/phase-12` に今回の未タスク起票が反映されている

---

## 6. 検証方法

### テストケース

- Case 1: docs-heavy task の再監査で専用テンプレート採用条件が案内される
- Case 2: 4点突合が未実施なら監査で検出できる
- Case 3: 未タスク起票後に system spec と outputs の同値同期が確認できる

### 検証手順

```bash
# 1) 新規未タスク指示書の差分監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-task-spec-recheck-adoption-001.md

# 2) repo 差分全体の未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 3) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 4) system spec index 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### 成功条件

- 新規未タスク指示書が `currentViolations=0`
- repo 差分全体も `currentViolations=0`
- `verify-unassigned-links` が PASS
- system spec index 再生成後も error なし

---

## 7. リスクと対策

| リスク             | 内容                                                           | 対策                                                       |
| ------------------ | -------------------------------------------------------------- | ---------------------------------------------------------- |
| 過剰設計           | guide と script の両方で同じルールを二重管理しすぎる           | 最初は guide + 軽量チェックに留め、CI 強制は後続判断とする |
| 対象境界の曖昧化   | どの task が docs-heavy / `spec_created` に当たるかぶれる      | 対象判定を examples 付きで追記する                         |
| 既存履歴との不整合 | 新ルールを追加しても current workflow outputs が旧値のまま残る | Phase 12 の current workflow outputs も同ターンで更新する  |

---

## 8. 参照情報

- `skill-creator/assets/phase12-task-spec-recheck-template.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/task-056e-integration-gate-and-spec-sync/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/task-056e-integration-gate-and-spec-sync/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

- 本タスクは「新しいテンプレートを増やすこと」が目的ではなく、「既に増やしたテンプレートを確実に使わせること」が目的である。
- 同種課題を短手順で閉じるには、テンプレート本体・採用条件・監査手順・system spec 同期の4点を同時に固定する必要がある。
