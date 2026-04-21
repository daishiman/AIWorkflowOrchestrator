# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 1                                                                        |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                                             |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク・スクリーンショット代替証跡）         |
| 親タスク   | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001                                   |
| Issue      | [#2313](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2313) |
| 前Phase    | -（本タスクの起点）                                                      |
| 次Phase    | [phase-2-design.md](phase-2-design.md)                                   |
| 作成日     | 2026-04-20                                                               |

---

## 目的

`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 で持ち越された
**repo-wide 同期 wave** の受入基準・scope 境界・前提条件・対象ファイル一覧を確定し、
Phase 2 設計が漏れなく行えるベースラインを固める。

---

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | branch 内 docs（親タスク済）と repo-wide spec（本タスク）の **同期境界の明確化** を仕様化することにある                |
| タスク種別         | NON_VISUAL ドキュメント追記タスク。スクリーンショットは取らず、grep 出力スナップショットを Phase 11 一次証跡とする     |
| 価値               | 親タスクの Phase 12 を正式に `completed` 化でき、両スキル LOGS の欠落を解消し、知見が次 wave へ確実に引き継がれる      |
| コスト             | コード変更ゼロ。ファイル追記のみ。リスクは「既存エントリ形式逸脱」と「topic-map.md 等の不要再生成」の 2 点に限定される |
| 依存関係・責務境界 | branch 内＝親タスク完了済 / repo-wide＝本タスクで完了 / Phase 13 PR 作成は user 承認待ち blocked                       |
| 親タスクとの関係   | 親タスクの Phase 12 ステータスを `in_progress` → `completed` に切り替える権限を、本タスク Phase 5 に集約する           |

---

## P50 チェック（既実装状態の調査）

### 親タスク側の現状確認

| 確認対象                                                            | 期待される現状                                                                                     | 確認方法         |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` | フロントマターの `status: in_progress` / `current_phase: 13`、Phase 12 行が `completed` のいずれか | Read（手動）     |
| `outputs/phase-12/system-spec-update-summary.md`（親）              | Step 1-A テーブルに「未実施 / repo-wide same-wave sync は本 review wave のスコープ外」と記載       | grep `未実施`    |
| `outputs/phase-12/unassigned-task-detection.md`（親）               | 「repo-wide LOGS/ledger same-wave sync」が follow-up として記録されている                          | grep `repo-wide` |
| `outputs/phase-11/manual-test-result.md`（親）                      | NON_VISUAL 代替証跡として既に存在している                                                          | ls / Read        |

### スキル側の現状確認

| 確認対象                                                                                             | 期待される現状                                                                | 確認方法                                                         |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/LOGS.md`                                                  | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` のエントリ **欠落**                  | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001"` がヒット 0 件 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                     | 同様に欠落                                                                    | 同上                                                             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                 | エントリ未追加（または `pending` のみ）                                       | grep                                                             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`                          | 親タスクが active 側に残っている可能性                                        | grep                                                             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed*.md`                      | 親タスク未掲載                                                                | grep                                                             |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`（または同等） | 3知見（NON_VISUAL 代替証跡 / scope 境界 / repo-wide sync 持ち越し管理）未反映 | grep                                                             |

### 判断

- 本タスクは **新規コード設計を含まない**。`outputs/phase-N/` 下のドキュメント生成のみ
- 既存 LOGS / canonical spec への **追記** が中心であり、形式逸脱が最大のリスク
- `topic-map.md` / `keywords.json` は **ファイル内容変更が発生しない場合は再生成不要**（最小変更原則）

---

## task classification【必須】

| 項目                 | 判定   | 理由                                                                                 |
| -------------------- | ------ | ------------------------------------------------------------------------------------ |
| UI task              | いいえ | Renderer 変更なし                                                                    |
| docs-only            | いいえ | 単純な docs 更新ではなく、複数 canonical spec の repo-wide 整合を伴う close-out wave |
| NON_VISUAL code task | はい   | コード behavior には触れないが、両スキル LOGS / canonical spec の正本性が対象        |

> **判断根拠**: 親タスクと同様 `NON_VISUAL` を継承する。Phase 11 では grep 出力スナップショットを `manual-test-result.md` に貼り付けることを一次証跡とする。

---

## 受入基準

| ID   | 基準                                                                                                                                                          | 検証方法                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AC-1 | `.claude/skills/task-specification-creator/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の wave 記録エントリが追記されている                          | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`   |
| AC-2 | `.claude/skills/aiworkflow-requirements/LOGS.md` に同タスクの close-out 記録エントリが追記されている                                                          | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`      |
| AC-3 | `aiworkflow-requirements/references/task-workflow.md`（および `task-workflow-active.md` / `task-workflow-completed*.md`）に親タスクの完了記録が追加されている | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/` |
| AC-4 | `lessons-learned-current-2026-04.md`（または同等）に 3 知見（NON_VISUAL 代替証跡 / scope 境界明確化 / repo-wide sync 持ち越し管理）が反映されている           | grep `NON_VISUAL` / `scope` / `repo-wide sync` での該当行確認                                          |
| AC-5 | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータスが `completed`、フロントマター `status` が完了状態に更新されている  | Read で目視確認 + `grep "Phase 12.*completed"` で該当行確認                                            |

> **AC は all-must-pass**。1件でも FAIL なら該当 Phase に差し戻す。

---

## scope 境界【必須】

| 区分            | 詳細                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 含む（in）      | 両 `LOGS.md` 追記 / `task-workflow.md` 完了記録追加 / lessons-learned への3知見反映 / 親 `index.md` Phase 12 完了宣言 / 本タスク自身の Phase 12 close-out 一式（mandatory 5 tasks）                      |
| 含まない（out） | コード実装変更 / Issue #2229 の再実装 / 親タスクの Phase 13 PR 作成 / 他タスク・他スキルの LOGS 更新 / `topic-map.md` `keywords.json` の不要再生成 / `SKILL.md` 変更履歴更新（任意・本タスクでは不実施） |

### scope 境界の根拠

- **branch 内 docs（親タスク完了済）**: `outputs/phase-*/` 下の mandatory 5 成果物・設計仕様書群
- **repo-wide spec（本タスク scope）**: `.claude/skills/*/LOGS.md` / `.claude/skills/aiworkflow-requirements/references/` 配下 / 親タスク `index.md`

この 2 軸を **Phase 2 設計の lane 構成と一致させる**ことで、追記漏れを構造的に防ぐ。

---

## 前提条件

1. 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 1〜11 がすべて `completed` であること
2. 親タスクの `outputs/phase-12/` 配下に mandatory 5 成果物が存在すること
3. 親タスクの `outputs/phase-11/manual-test-result.md` が存在すること
4. `aiworkflow-requirements` のスキル構成（`SKILL.md` / `LOGS.md` / `references/` 以下）が一読されていること
5. `task-specification-creator/LOGS.md` の既存エントリ形式（コンテキスト・成果・結果の 3 節構成）が把握されていること
6. `aiworkflow-requirements/LOGS.md` の既存エントリ形式（表形式：タスクID / 操作 / 対象ファイル / 結果 / 備考）が把握されていること

---

## 対象ファイル一覧（Phase 2 で詳細マップ化）

| #   | パス                                                                                                               | 種別            | 操作 | Phase 2 で詳細化する内容                                            |
| --- | ------------------------------------------------------------------------------------------------------------------ | --------------- | ---- | ------------------------------------------------------------------- |
| 1   | `.claude/skills/task-specification-creator/LOGS.md`                                                                | スキル LOGS     | 追記 | wave 記録（コンテキスト・成果・結果の3節）                          |
| 2   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                   | スキル LOGS     | 追記 | close-out 記録（表形式 1 行）                                       |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                               | canonical spec  | 追記 | 親タスクの完了記録 1 エントリ                                       |
| 3'  | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` / `task-workflow-completed*.md`        | canonical spec  | 確認 | active から completed への移動が必要かを Phase 2 で判断             |
| 4   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`（または同等の最新ファイル） | lessons-learned | 追記 | 3知見（NON_VISUAL 代替証跡 / scope 境界 / repo-wide sync 持ち越し） |
| 5   | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                                                | 親タスク index  | 更新 | Phase 12 ステータス → `completed`、フロントマター `status` 更新     |

---

## Canonical Artifacts【必須】

| 成果物         | パス                                         | 説明                                  |
| -------------- | -------------------------------------------- | ------------------------------------- |
| 要件定義       | `outputs/phase-1/requirements-definition.md` | 本仕様書を Phase 1 成果物として固定   |
| scope 境界定義 | `outputs/phase-1/scope-boundary.md`          | branch 内 / repo-wide の 2 軸境界表   |
| 受入基準       | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 と grep 検証コマンドの対応 |

---

## 実行タスク

| Task | 内容                                                          | 出力先                                       |
| ---- | ------------------------------------------------------------- | -------------------------------------------- |
| 1    | repo-wide sync の真の論点、親子タスク境界、前提条件を固定する | `outputs/phase-1/requirements-definition.md` |
| 2    | AC-1〜AC-5 と対象 5 ファイルを 1 対 1 で対応付ける            | `outputs/phase-1/acceptance-criteria.md`     |
| 3    | branch 内 / repo-wide / scope 外の境界を表形式で凍結する      | `outputs/phase-1/scope-boundary.md`          |

- Task 1: 真の論点、親子タスク境界、前提条件を固定する
- Task 2: AC-1〜AC-5 と対象 5 ファイルを対応付ける
- Task 3: branch 内 / repo-wide / scope 外の境界を固定する

---

## 統合テスト連携【必須】

本タスクは **コード変更を含まない docs-sync wave** であり、ユニットテスト / 結合テストの実行対象外。
代替として以下の **整合性検証** を Phase 7 / Phase 9 / Phase 11 で実施する。

| 判定項目                                    | 基準                                        | 結果                      |
| ------------------------------------------- | ------------------------------------------- | ------------------------- |
| 既存エントリ形式整合性（task-spec-creator） | 形式逸脱 0                                  | Phase 6 / Phase 11 で記録 |
| 既存エントリ形式整合性（aiworkflow-req）    | 形式逸脱 0                                  | 同上                      |
| Issue #2313「未実施」6項目への対応          | 6/6 全件対応                                | Phase 7 で記録            |
| 親タスク Phase 12 完了宣言の整合性          | フロントマター + Phase 一覧テーブル両方更新 | Phase 10 で記録           |
| Markdown 構文                               | lint エラー 0                               | Phase 9 で記録            |

---

## 参照資料

| 資料                                                                                                      | 用途                                          |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                                       | 親タスクの index。Phase 12 完了宣言の更新対象 |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/system-spec-update-summary.md` | Step 1-A の「未実施」記録の根拠               |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/unassigned-task-detection.md`  | 本タスク formalize の根拠                     |
| `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md`                   | 本タスク自身の Phase 12 設計ベース            |
| `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md`                     | artifacts.json の命名規則                     |
| `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                               | LOGS / canonical spec 更新の workflow 標準    |

---

## 成果物

| 成果物         | パス                                         | 役割                                 |
| -------------- | -------------------------------------------- | ------------------------------------ |
| 要件定義       | `outputs/phase-1/requirements-definition.md` | 真の論点、前提、依存関係の固定       |
| scope 境界定義 | `outputs/phase-1/scope-boundary.md`          | branch 内 / repo-wide / scope 外整理 |
| 受入基準       | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 と検証手段の正本          |

---

## 完了条件

- [ ] P50 チェック結果（親 / スキル両側）が記録された
- [ ] task classification が NON_VISUAL として確定された
- [ ] AC-1 〜 AC-5 が確定し、検証コマンドが各 AC に紐付いている
- [ ] scope 境界（含む / 含まない）が表で明示されている
- [ ] 対象ファイル一覧（5ファイル + active/completed の判断対象）が確定した
- [ ] 親タスクとの責務境界・依存関係が明示されている
- [ ] Canonical Artifacts が固定された
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次Phase

[phase-2-design.md](phase-2-design.md) — 5 ファイル更新方針・追記マップ・lessons-learned 反映計画の設計
