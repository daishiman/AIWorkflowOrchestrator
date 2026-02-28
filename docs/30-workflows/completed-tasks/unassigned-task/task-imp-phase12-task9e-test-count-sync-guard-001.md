# UT-IMP-PHASE12-TASK9E-TEST-COUNT-SYNC-GUARD-001: TASK-9E Phase成果物テスト件数同期ガード

## メタ情報

```yaml
issue_number: 921
task_id: UT-IMP-PHASE12-TASK9E-TEST-COUNT-SYNC-GUARD-001
task_name: TASK-9E Phase成果物テスト件数同期ガード
category: 改善
target_feature: TASK-9E の Phase 5-11成果物と正本仕様のテスト件数整合
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-9E Phase 12 再監査（実装苦戦箇所）
created_date: 2026-02-28
```

| 項目         | 値                                              |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-TASK9E-TEST-COUNT-SYNC-GUARD-001 |
| タスク名     | TASK-9E Phase成果物テスト件数同期ガード         |
| 分類         | 改善                                            |
| 対象機能     | TASK-9E の Phase成果物・仕様台帳の件数整合      |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | TASK-9E Phase 12 再監査（2026-02-28）           |
| 発見日       | 2026-02-28                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9E で `SkillForker.test.ts` に追加テスト（34件）が入った後、Phase 5/6/7/9/10/11 成果物と `aiworkflow-requirements` の一部に旧件数（57、32+25）が残存した。

### 1.2 問題点・課題

- 仕様書と成果物でテスト件数が不一致になり、再監査時に整合確認工数が増える
- 「Phase時点値」と「最終値」の区別が曖昧なため、誤記が再発しやすい
- 人手更新のみだと、複数ファイル横断の件数同期漏れが発生する

### 1.3 放置した場合の影響

- Phase 12 完了証跡の信頼性が下がる
- 後続タスクが誤った件数を参照し、レビュー差し戻しが増える
- 同種の IPC 拡張タスクで同じドリフトが再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-9E のテスト件数を正本で一元管理し、Phase成果物と仕様書の件数整合を機械的に検出できる運用を作る。

### 2.2 最終ゴール

1. 正本件数（例: `34 + 25 = 59`）の定義箇所が明示される
2. `rg` ベースの件数ドリフト検出コマンドが運用化される
3. Phase 12 完了条件に「件数ドリフト検出 0件」が追加される

### 2.3 スコープ

#### 含むもの

- TASK-9E 関連文書の件数記載ルール整理
- ドリフト検出コマンドと是正手順の標準化
- Phase 12 仕様更新手順への反映

#### 含まないもの

- アプリ機能（`apps/`, `packages/`）の仕様変更
- 既存の全タスク履歴の全面的な件数再計算

### 2.4 成果物

- 本未タスク指示書
- 件数ドリフト検出・是正手順
- 仕様書更新手順への追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9E ワークフロー成果物が参照可能であること
- `task-specification-creator` / `aiworkflow-requirements` の更新権限があること

### 3.2 依存タスク

- TASK-9E（完了）
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001（関連）

### 3.3 必要な知識

- Phase 12 の成果物要件
- `verify-all-specs` / `validate-phase-output` / `audit-unassigned-tasks` の判定軸

### 3.4 推奨アプローチ

1. 正本件数を `task-workflow.md` に固定する
2. `rg` で TASK-9E 文脈の旧件数を抽出し、対象だけ更新する
3. 更新後に4点検証（spec/phase/link/audit）を実行して証跡化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                      | 発見経緯                                             | 解決策                                         | 教訓                                         |
| ------------------------- | ---------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| 57/59 の件数ドリフト      | TASK-9E 再監査で Phase成果物と正本仕様に旧件数が混在 | `rg` で TASK-9E 文脈のみ抽出し、正本件数へ統一 | 件数は「正本1箇所 + 参照転記」の順で同期する |
| Phase時点値と最終値の混同 | Phase 6/7 の時点値57が最終値と混在                   | 文言に「Phase時点」「最終値」を併記            | 時点値を残す場合は最終値を必ず併記する       |
| 複数ファイル横断更新漏れ  | 仕様書と成果物で更新対象が分散                       | 更新対象リストを先に固定して順次更新           | 更新開始前に対象一覧を確定する               |

---

## 4. 実行手順

### Phase構成

- Phase A: 正本件数の固定
- Phase B: ドリフト検出と是正
- Phase C: 仕様反映と検証

### Phase A: 正本件数の固定

#### 目的

TASK-9E 件数の正本を明示する。

#### 手順

1. `task-workflow.md` の TASK-9E セクションに件数を固定する
2. 内訳（`SkillForker` / IPC）を併記する

#### 完了条件

- 正本件数が1義的に解釈できる

### Phase B: ドリフト検出と是正

#### 目的

旧件数の混在を除去する。

#### 手順

1. `rg -n "57|32 \\+ 25|SkillForker 32"` で候補抽出
2. TASK-9E 文脈のみ正本値へ更新
3. Phase時点値は最終値併記へ変換

#### 完了条件

- TASK-9E 文脈で旧件数ヒットが0件

### Phase C: 仕様反映と検証

#### 目的

反映漏れがないことを機械検証で確定する。

#### 手順

1. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行
2. 検証結果を仕様書台帳へ反映

#### 完了条件

- 4点検証がPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TASK-9E の正本件数が明示されている
- [ ] TASK-9E 文脈の旧件数が0件である
- [ ] Phase時点値と最終値の表記ルールが定義されている

### 品質要件

- [ ] 差分監査で `current violations = 0`
- [ ] リンク監査で `ALL_LINKS_EXIST`

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている

---

## 6. 検証方法

### テストケース

- Case 1: TASK-9E 文脈の旧件数ヒットが0件
- Case 2: 4点検証コマンドがPASS

### 検証手順

```bash
rg -n "57|32 \\+ 25|SkillForker 32" \
  .claude/skills/aiworkflow-requirements/references \
  docs/30-workflows/completed-tasks/TASK-9E-skill-fork

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9E-skill-fork --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-task9e-test-count-sync-guard-001.md
```

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                         |
| ---------------------------------- | ------ | -------- | -------------------------------------------- |
| 全体の57件表記を誤って一括変更する | 中     | 中       | TASK-9E 文脈限定で抽出して更新する           |
| 時点値を消して履歴解釈が難しくなる | 低     | 中       | 「Phase時点値 + 最終値併記」ルールを適用する |
| 仕様書のみ更新して成果物が残る     | 中     | 中       | 仕様書と成果物を同一ターンで同期する         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-9E 再監査で、仕様書とPhase成果物のテスト件数表記に旧値（57, 32+25）が残存していた。
```

### 補足事項

- 本タスクは機能追加ではなく、Phase 12 の証跡品質を安定化するための運用改善タスク。
