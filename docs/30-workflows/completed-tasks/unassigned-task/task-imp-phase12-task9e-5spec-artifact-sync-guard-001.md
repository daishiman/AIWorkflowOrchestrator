# UT-IMP-PHASE12-TASK9E-5SPEC-ARTIFACT-SYNC-GUARD-001: TASK-9E Phase 12 5関心仕様同期・未タスク成果物命名ガード

## メタ情報

```yaml
issue_number: 922
task_id: UT-IMP-PHASE12-TASK9E-5SPEC-ARTIFACT-SYNC-GUARD-001
task_name: TASK-9E Phase 12 5関心仕様同期・未タスク成果物命名ガード
category: 改善
target_feature: Phase 12 の仕様同期（api/security/interfaces/architecture/task-ledger）と未タスク成果物命名整合
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-9E Phase 12 再確認（実装苦戦箇所）
created_date: 2026-02-28
```

| 項目         | 値                                                       |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-TASK9E-5SPEC-ARTIFACT-SYNC-GUARD-001      |
| タスク名     | TASK-9E Phase 12 5関心仕様同期・未タスク成果物命名ガード |
| 分類         | 改善                                                     |
| 対象機能     | Phase 12 仕様同期と未タスク成果物命名の再発防止          |
| 優先度       | 中                                                       |
| 見積もり規模 | 中規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-9E Phase 12 再確認（2026-02-28）                    |
| 発見日       | 2026-02-28                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9E の Phase 12 再確認で、仕様同期は SubAgent A〜E に分担して完了したが、運用標準は旧来の「4仕様書同期」を前提にしており、TASK-9E で必要だった `api` / `security` / `interfaces` / `architecture` / `task-ledger` の5関心同期を直接表現できていない。

加えて、未タスク成果物名が `unassigned-task-report.md` と `unassigned-task-detection.md` の2系統で混在しており、監査・再利用時に解釈差が生じる。

### 1.2 問題点・課題

- 4仕様書前提の同期ルールでは、`architecture` や台帳系（`task-workflow` / `LOGS` / `SKILL`）の更新漏れを検知しにくい
- 未タスク成果物名の混在により、Phase 12 必須成果物チェックの実行者ごとに判定がぶれる
- 残課題ID監査を全表スキャンで実施すると、完了行との混在で誤検知しやすい

### 1.3 放置した場合の影響

- 実装は完了していても仕様同期漏れで再監査差し戻しが継続する
- 同種タスクで成果物命名の取り違えが再発し、検証手順の再利用性が低下する
- Phase 12 完了判定が属人化し、完了証跡の一貫性が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の仕様同期を「5関心（api/security/interfaces/architecture/task-ledger）」で標準化し、未タスク成果物命名の整合ルールを固定する。

### 2.2 最終ゴール

1. 5関心同期マトリクス（担当SubAgent・更新対象・完了条件）が定義される
2. `unassigned-task-report.md` と `unassigned-task-detection.md` の扱い（正本名/互換名）が明文化される
3. 残課題ID監査に scoped 判定（対象行優先）が導入され、誤検知を減らせる

### 2.3 スコープ

#### 含むもの

- Phase 12 同期手順（5関心）の運用ルール整備
- 未タスク成果物命名ルールの統一（正本 + 互換運用）
- 台帳監査（重複ID）の scoped 判定手順整備

#### 含まないもの

- アプリ本体機能（Main/Preload/Renderer）の新規実装
- 過去全ワークフロー成果物の一括リネーム

### 2.4 成果物

- 本未タスク指示書
- 5関心同期テンプレート（Phase 12 用）
- 命名整合ルールを反映した仕様更新手順

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9E ワークフローと Phase 12 成果物が参照可能である
- `task-specification-creator` / `aiworkflow-requirements` の更新権限がある
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` を実行できる

### 3.2 依存タスク

- TASK-9E（完了）
- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001（関連）
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001（関連）

### 3.3 必要な知識

- Phase 12 Step 1-A〜1-E の必須更新手順
- 未タスク検出レポートの出力要件
- `current` / `baseline` 分離監査の判定基準

### 3.4 推奨アプローチ

1. まず 5関心同期マトリクスを定義し、SubAgent責務を固定する
2. 未タスク成果物名の正本を定め、互換名の扱いを手順化する
3. 残課題ID監査は scoped 判定を正本にしてから全体監査を実施する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                                                                                      | 解決策                                                                                 | 教訓                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 4仕様書前提と5関心同期のずれ               | TASK-9E では `api/security/interfaces/architecture/task-ledger` の5関心同期が必要だった       | Phase 12 テンプレートに5関心マトリクスを追加し、SubAgent A〜E を固定する               | 「仕様書数」ではなく「関心単位」で同期責務を定義する     |
| 未タスク成果物名の混在（report/detection） | 参照先に `unassigned-task-report.md` と `unassigned-task-detection.md` が混在し、判定がぶれた | 正本名を定義し、互換名は移行期間のみ許容するルールを明文化する                         | 命名は成果物契約。互換運用の期限と判定優先順位を必ず持つ |
| 重複ID監査の誤検知                         | 完了行を含む全表スキャンで未完了行との重複判定が混ざった                                      | `--target-file`/`--diff-from` を優先し、`currentViolations.total` を合否基準に固定する | 監査は「対象合否」と「全体健全性」を分離して扱う         |

---

## 4. 実行手順

### Phase構成

- Phase A: 5関心同期マトリクス定義
- Phase B: 未タスク成果物命名ルール統一
- Phase C: 台帳監査ルール（scoped 判定）固定
- Phase D: 仕様反映と検証

### Phase A: 5関心同期マトリクス定義

#### 目的

Phase 12 の同期漏れを関心単位で検出できるようにする。

#### 手順

1. `api/security/interfaces/architecture/task-ledger` の5関心を更新対象として定義する
2. SubAgent A〜E の担当・入力・完了条件を表形式で固定する
3. 依存順序（契約 → セキュリティ → 台帳）を明文化する

#### 完了条件

- 5関心それぞれに担当・完了条件が定義されている

### Phase B: 未タスク成果物命名ルール統一

#### 目的

未タスク成果物の判定ぶれを防止する。

#### 手順

1. 正本成果物名（`unassigned-task-detection.md` など）を決定する
2. 互換名（`unassigned-task-report.md`）の許容条件と移行期限を定義する
3. 検証スクリプト・テンプレート参照を正本名へ同期する

#### 完了条件

- 命名優先順位と互換条件が仕様として記録されている

### Phase C: 台帳監査ルール（scoped 判定）固定

#### 目的

重複ID監査の誤検知を減らし、合否判定を安定化する。

#### 手順

1. `--target-file` / `--diff-from` を対象合否の標準モードとする
2. `currentViolations.total` を fail 判定の正本とする
3. scope 未指定監査は baseline 監視として別記録に分離する

#### 完了条件

- `current` と `baseline` の判定軸が明確に分離されている

### Phase D: 仕様反映と検証

#### 目的

更新ルールを正本仕様へ反映し、機械検証で確定する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを登録する
2. 関連仕様書と LOGS / SKILL 履歴へ更新内容を同期する
3. 4点検証を実行して証跡を記録する

#### 完了条件

- 残課題登録・履歴更新・4点検証が完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 5関心同期マトリクスが定義されている
- [ ] 未タスク成果物命名の正本/互換ルールが定義されている
- [ ] 重複ID監査の scoped 判定ルールが定義されている

### 品質要件

- [ ] `verify-unassigned-links` が `ALL_LINKS_EXIST`
- [ ] `audit --target-file` または `--diff-from` で `currentViolations.total = 0`
- [ ] baseline 監視結果が別枠で記録されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに本タスクIDが登録されている
- [ ] `aiworkflow-requirements` の履歴（LOGS/SKILL）に反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 5関心の各担当に更新対象・完了条件が設定されている
- Case 2: 未タスク成果物名の判定優先順位が仕様に記載されている
- Case 3: `audit` で `current=0` / `baseline>0` を分離して記録できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9E-skill-fork --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-task9e-5spec-artifact-sync-guard-001.md
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                  |
| -------------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| 4仕様書前提のまま運用が継続する        | 中     | 中       | 5関心同期マトリクスを Phase 12 テンプレートへ組み込み、必須項目化する |
| 成果物命名統一時に既存参照が壊れる     | 中     | 中       | 正本/互換の2段運用を設定し、参照更新を段階実施する                    |
| 監査スクリプトの判定解釈が再び混在する | 中     | 低       | `current` 合否・`baseline` 監視の2軸をチェックリストに固定する        |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-12/unassigned-task-report.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 の仕様同期で、4仕様書前提の運用と TASK-9E の5関心同期がずれている。
未タスク成果物名（report/detection）と重複ID監査判定の解釈を標準化しないと再発する。
```

### 補足事項

- 本タスクは実装機能の追加ではなく、Phase 12 の再監査品質を高める運用改善タスク。
