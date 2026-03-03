# [#955] "[UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001] Phase 12 SubAgent成果物固定ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001
task_name: Phase 12 SubAgent成果物固定ガード
category: 改善
target_feature: Phase 12 仕様同期（spec-update-summary + spec-sync-subagent-report + Step 2三点突合）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-UI-05A-GETFILETREE-001 Phase 12再確認（苦戦箇所・2026-03-03）
created_date: 2026-03-03
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-UI-05A-GETFILETREE-001` の Phase 12 追補で、実装同期自体は完了していても「仕様書ごとの担当境界（SubAgent）」が成果物として固定されていないと、次回再確認時に責務の解釈が揺れることが確認された。

### 1.2 問題点・課題

- `spec-update-summary.md` だけでは「誰がどの仕様書を同期したか」が追跡しにくい。
- Step 2 判定は実施していても、`phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の三点突合が毎回手作業になりやすい。
- 親タスクで顕在化した苦戦箇所（Main/Preload契約差、成果物名ドリフト、未タスク見出し重複）が、未タスク実行時に再発しやすい。

### 1.3 放置した場合の影響

- Phase 12 再確認ごとに説明と修正を繰り返し、完了判定コストが高止まりする。
- 仕様同期の責務境界が曖昧になり、SubAgent編成の効果（関心分離）が落ちる。
- `current=合否 / baseline=監視` の判定軸が混線し、誤修正が発生する。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の仕様同期で「SubAgent責務」と「検証証跡」を成果物として標準固定し、同種課題の再確認を短時間で再現可能にする。

### 2.2 最終ゴール

1. `spec-update-summary.md` がテンプレート準拠構造で再利用可能になっている。
2. `spec-sync-subagent-report.md` が 1仕様書=1SubAgent の責務/依存/完了条件を保持している。
3. Step 2 判定が三点突合で説明可能になっている。
4. 未タスク監査で `currentViolations=0` を合否基準として運用できる。

### 2.3 スコープ

#### 含むもの

- Phase 12 成果物の責務固定ルール（summary/report/changelogの整合）
- Step 2 三点突合ルール
- 親タスク由来の苦戦箇所を再利用する運用手順
- `task-workflow.md` / `lessons-learned.md` への未タスク同期

#### 含まないもの

- Main/Preload/Renderer の新規機能実装
- 既存 baseline 違反の全件解消
- Phase 1〜11 の定義変更

### 2.4 成果物

- 本未タスク指示書
- `task-workflow.md` 残課題テーブル登録
- `lessons-learned.md` の関連未タスク導線
- 必要時: `phase12-system-spec-retrospective-template` / `phase12-spec-sync-subagent-template` の追補案

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスク品質基準（10見出し）を満たせること
- `aiworkflow-requirements` 正本更新手順（task-workflow / lessons / SKILL / LOGS）を理解していること
- Phase 12 成果物が `docs/30-workflows/<workflow>/outputs/phase-12/` に存在すること

### 3.2 依存タスク

- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
- UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001
- UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### 3.4 推奨アプローチ

1. 仕様書単位で SubAgent を定義し、責務と完了条件を先に固定する。
2. Step 2 判定は三点突合でのみ確定する。
3. `task-workflow` と `lessons` を同一ターンで更新し、苦戦箇所の分散を防ぐ。
4. 未タスク監査は `current` と `baseline` を分離記録する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                                     | 解決策                                                          | 教訓                                       |
| --------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------ |
| Main契約 `IpcResult<T>` と Preload公開 `T` の表現差 | UT-UI-05A-GETFILETREE-001 の仕様同期で戻り値表現が揺れた     | Main契約/Preload契約を分離して同時記載                          | IPC仕様は層別契約の明示が必須              |
| Phase 12 成果物名のドリフト                         | `spec-update-summary` と成果物実体の命名差が発生しやすかった | `phase-12-documentation.md` と `outputs/phase-12` を1対1突合    | 完了前の成果物名照合を固定化               |
| 未タスク `## メタ情報` 重複                         | YAML/表を分離すると監査ノイズが出た                          | `## メタ情報` 1セクション原則 + `rg` 機械確認                   | 未タスクは存在確認だけでなく形式確認が必要 |
| SubAgent責務が成果物に残らない                      | summaryのみ更新だと担当境界が再利用しにくい                  | `spec-sync-subagent-report.md` を作成し責務/依存/完了条件を固定 | 関心分離は成果物化して初めて再利用できる   |

---

## 4. 実行手順

### Phase構成

- Phase A: SubAgent責務定義
- Phase B: 成果物固定ルール実装
- Phase C: システム仕様同期と監査

### Phase A: SubAgent責務定義

#### 目的

仕様書ごとの担当境界を固定し、更新漏れを防止する。

#### 手順

1. 対象仕様書（api-ipc/interfaces/security/ui-ux-feature/task/lessons）を確定する。
2. 1仕様書=1SubAgent で責務表を作成する。
3. 各SubAgentの完了条件を定義する。

#### 成果物

- SubAgent責務マトリクス

#### 完了条件

- すべての対象仕様書に担当と完了条件が紐づいている。

### Phase B: 成果物固定ルール実装

#### 目的

summary/report/changelog の整合を標準化する。

#### 手順

1. `spec-update-summary.md` をテンプレート準拠で再編する。
2. `spec-sync-subagent-report.md` を作成/更新する。
3. `documentation-changelog.md` に Step 2 判定根拠を反映する。

#### 成果物

- 更新済み Phase 12 成果物3点

#### 完了条件

- 三点突合（phase-12-documentation/changelog/summary）を説明できる。

### Phase C: システム仕様同期と監査

#### 目的

未タスク台帳と教訓を正本へ同期し、機械監査で確定する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを登録する。
2. `lessons-learned.md` に関連未タスク導線を追加する。
3. `verify-unassigned-links` / `audit --target-file` / `audit --diff-from HEAD` を実行する。

#### 成果物

- 更新済み `task-workflow.md` / `lessons-learned.md`
- 監査結果

#### 完了条件

- `currentViolations=0` かつ参照切れ0件。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SubAgent責務表（仕様書単位）が固定化されている
- [ ] Step 2 三点突合ルールが明文化されている
- [ ] summary/report/changelog の整合確認手順が定義されている

### 品質要件

- [ ] `current` と `baseline` の判定分離が明記されている
- [ ] 親タスク由来の苦戦箇所が 3.5 に反映されている
- [ ] 未タスク形式（10見出し）が維持されている

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `lessons-learned.md` に関連未タスク導線を追加済み

---

## 6. 検証方法

### テストケース

- Case 1: SubAgent責務が summary/report の両方で一致する
- Case 2: Step 2 判定根拠が三点突合で説明できる
- Case 3: 未タスク監査で `currentViolations=0` を維持できる
- Case 4: `## メタ情報` が1件のみである

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
rg -n '^## メタ情報$|^## [1-9]\. ' docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                    |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------------- |
| SubAgent責務表だけ更新し、台帳同期が漏れる | 中     | 中       | `task-workflow`/`lessons` 同時更新を完了条件化          |
| Step 2 判定が changelog 側でズレる         | 中     | 中       | 三点突合チェックを実行手順へ固定                        |
| 既存baseline違反を今回差分と誤認する       | 高     | 中       | 合否は `currentViolations` 固定、baselineは監視欄で分離 |
| 未タスク指示書のフォーマットドリフト       | 中     | 中       | 10見出し + `## メタ情報` 1件を機械監査                  |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### 参考資料

- `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/spec-sync-subagent-report.md`
- `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/documentation-changelog.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
実装同期は完了していても、仕様書ごとの担当境界（SubAgent）が成果物に残らないと、次回再確認で責務が曖昧化する。
```

### 補足事項

本タスクは「新機能実装」ではなく「Phase 12 運用品質の固定化」が目的。実装タスクには依存せず、ドキュメント同期ルールの整備を優先する。
