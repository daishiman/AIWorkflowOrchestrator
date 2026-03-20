# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 10                                                        |
| Phase 名   | 最終レビュー                                              |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 9                                                   |
| 後続 Phase | Phase 11（手動テスト）                                    |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

execution responsibility / capability 契約基盤を final gate で再評価し、PASS / MINOR / MAJOR / CRITICAL の判定と戻り先・unresolved risk を確定する。
具体的には AC-1〜AC-4 を各成果物と照合し、後続 Task02-09 への影響を dependency graph に照らして確認し、Phase 11 への handoff 条件を固定する。

## 実行タスク

### タスク1: AC 照合（最終レビュー）

以下の4 AC を各成果物と照合し、verified / unverified を判定する。結果を `outputs/phase-10/final-review-report.md` に記録する。

**AC-1: capability 4状態の責務と表示契約が定義されている**

- 確認元: Phase 2 の contract-matrix（`integratedRuntime` / `terminalSurface` / `both` / `none` の4状態が全て定義されているか）
- 確認方法: contract-matrix の行数が4であることと、各状態の表示契約（UI ラベル / handoff 先）が空欄でないことを確認する
- verified 条件: 4状態全ての責務と表示契約が文章として記録されており、曖昧語句が含まれていない

**AC-2: UI状態語彙と CTA契約が 1:1 で定義されている**

- 確認元: Phase 2 の contract-matrix（`ready` / `blocked` / `unavailable` × primary CTA / secondary CTA の 1:1 マッピング）
- 確認方法: 状態語彙3種 × CTA 組合せ3種の合計9セルが全て記録されているか確認する
- verified 条件: 9セル全てに primary CTA と secondary CTA が具体的な文字列で記録されており、空欄・重複・逆参照がない

**AC-3: silent fallback / auto-send / hidden prompt injection を禁止する境界が文章化されている**

- 確認元: Phase 1 の FR-3（禁止事項）、Phase 2 の validation-matrix（禁止境界の実装箇所）
- 確認方法: 3禁止項目それぞれに「禁止対象の操作」「禁止境界（どのレイヤーで止めるか）」「違反時の動作（エラー表示 / UI 停止）」が記録されているか確認する
- verified 条件: 3禁止項目が全て文章化され、`grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/` のゼロヒット確認手順が記録されている

**AC-4: Step02以降が参照すべき canonical doc set が明示されている**

- 確認元: Task index の成果物パス一覧
- 確認方法: Task02-09 の Phase 3（設計レビュー）が参照すべき canonical docs のパスが全て有効なファイルパスとして記録されているか確認する
- verified 条件: canonical doc set の各パスが実際に存在するファイルを指しており、Task02-09 の依存関係（どのタスクがどの doc を参照するか）が明示されている

### タスク2: 後続影響確認

以下の後続タスクへの影響を dependency graph に照らして確認し、`outputs/phase-10/final-review-report.md` に追記する。

**Task02（RuntimePolicy Centralization）**:

- Task01 の contract を正しく消費できるか確認する（capability 4状態の定義を参照する箇所が正しいパスを指しているか）
- Task01 の Concern A（capability 契約）を変更する場合に MAJOR 戻りゲートが設定されているか確認する

**Task03-05（Mainline）**:

- capability / state / CTA を正しく参照できるか確認する（contract-matrix のパスが Task03-05 の参照資料テーブルに含まれているか）
- state drift が発生した場合の検出方法（Phase 3 設計レビューで contract-matrix との照合を必須とする）が設定されているか確認する

**Task09（Governance）**:

- canonical doc set を正しく管理できるか確認する（AC-4 の canonical doc set リストが Task09 の入力として利用可能か）

### タスク3: PASS / MINOR / MAJOR / CRITICAL 判定

以下の判定基準に従い、`outputs/phase-10/final-gate-decision.md` に判定結果と戻り先を記録する。

| 判定              | 条件                                                      | 戻り先                              | 対応                                                                                                                                                                    |
| ----------------- | --------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PASS              | AC-1〜AC-4 が全て verified、後続影響なし                  | Phase 11 へ                         | そのまま進む                                                                                                                                                            |
| MINOR             | 用語の微修正・ドキュメント補足が必要（機能影響なし）      | Phase 11 へ（未タスク仕様書変換後） | 未タスク仕様書を `docs/30-workflows/unassigned-task/` に作成し、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` と関連仕様書に登録する（省略不可） |
| MAJOR（設計問題） | 3 concern 分解の見直しが必要（AC-1 / AC-2 が unverified） | Phase 2 へ                          | contract-matrix または concern 分解を修正する                                                                                                                           |
| MAJOR（要件問題） | capability 4状態の定義見直しが必要（FR-1〜FR-4 と乖離）   | Phase 1 へ                          | 要件定義をやり直す                                                                                                                                                      |
| CRITICAL          | 親パックとの根本矛盾（AI runtime 全体設計の見直しが必要） | 親パック再検討                      | 親パック index で設計ゲートを再実行する                                                                                                                                 |

**MINOR 判定の未タスク変換は省略不可**: MINOR 指摘が1件でもある場合、以下の3ステップを全て完了してから Phase 11 に進む。

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題導線に登録する
3. 関連仕様書に参照リンクを追加する

## 参照資料

| 参照資料            | パス                                                                                        | 確認する内容                                                              |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 親パック index      | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート（CRITICAL 判定時の戻り先）                   |
| Task index          | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | AC-1〜AC-4 の正式定義・canonical doc set のパス                           |
| Phase 1             | phase-1-requirements.md                                                                     | FR-1〜FR-4（MAJOR 要件問題時の戻り先確認）                                |
| Phase 2             | phase-2-design.md                                                                           | contract-matrix・3 concern 分解・validation-matrix（AC-1〜AC-3 の照合元） |
| Phase 9             | phase-9-quality-assurance.md                                                                | quality-checklist.md / risk-register.md（残余 risk の確認元）             |
| Phase 5 outputs     | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md               | concern ownership と変更境界                                              |
| 親 UI/UX 正本       | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA・handoff 契約（AC-2 照合の参照元）                          |
| ui-ux-navigation    | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `ViewType` / `renderView()` の consumer 境界    |
| spec elegance audit | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md        | 抽象・整合・依存レビューの基準                                            |

## 実行手順

### ステップ1: Phase 9 の成果物を確認する

`outputs/phase-9/quality-checklist.md` の release readiness 判定と `outputs/phase-9/risk-register.md` の残余 risk（R-1〜R-3 の unresolved 項目）を確認する。unresolved risk が存在する場合は、本 Phase でその risk が AC 照合を通じて resolved になるか確認する。

### ステップ2: AC-1〜AC-4 を各成果物と照合する（タスク1）

Phase 2 の contract-matrix を Read し、AC-1（capability 4状態）・AC-2（state × CTA 1:1）・AC-3（禁止境界）・AC-4（canonical doc set）を順番に照合する。各 AC の verified / unverified を判定し、`outputs/phase-10/final-review-report.md` に記録する。

### ステップ3: 後続 Task02-09 への影響を確認する（タスク2）

Task index の dependency graph を確認し、Task02 / Task03-05 / Task09 それぞれが Task01 の成果物を正しく参照できるかを確認する。参照できない箇所がある場合はその詳細を `outputs/phase-10/final-review-report.md` に追記する。

### ステップ4: PASS / MINOR / MAJOR / CRITICAL を判定する（タスク3）

AC 照合結果と後続影響確認結果を統合し、判定基準テーブルに従って判定を行う。MINOR の場合は未タスク仕様書の3ステップを実行してから結果を記録する。判定結果と戻り先・再レビュー条件を `outputs/phase-10/final-gate-decision.md` に記録する。

### ステップ5: 完了条件と次Phase handoff を確認する

完了条件チェックリストを全て verified にし、Phase 11 への handoff 条件（final-gate-decision.md が PASS または MINOR 対応完了の状態であること）を確認する。

## 統合テスト連携（Phase 1〜11は必須）

最終 gate で integration completeness と documentation completeness を同時確認する:

| 確認項目                                            | 確認方法                                         | 担当 Phase |
| --------------------------------------------------- | ------------------------------------------------ | ---------- |
| contract-matrix の capability 4状態が AC-1 を満たす | Phase 2 の contract-matrix を Read して照合      | Phase 10   |
| state × CTA の 1:1 マッピングが AC-2 を満たす       | Phase 2 の contract-matrix を Read して照合      | Phase 10   |
| 禁止境界が AC-3 を満たす                            | Phase 1 FR-3 と Phase 2 validation-matrix を照合 | Phase 10   |
| canonical doc set が AC-4 を満たす                  | Task index の成果物パスを確認                    | Phase 10   |
| capability × UI 表示分岐の動作確認                  | Phase 11 の手動テストチェックリストに引き継ぐ    | Phase 11   |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                                    | 仕様参照先                                                            |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | capability × state × CTA テーブルが UI 仕様と一致しているか最終確認する場合 | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 3 concern の SRP 準拠と dependency graph の整合を最終確認する場合           | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | IPC envelope と 3段バリデーションの最終確認を行う場合                       | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | MINOR 未タスク変換・canonical doc set 登録を行う場合                        | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 9 成果物（quality-checklist.md・risk-register.md）の確認
2. AC-1〜AC-4 の各成果物照合
3. 後続 Task02-09 への影響確認（dependency graph 照合）
4. PASS / MINOR / MAJOR / CRITICAL 判定と戻り先記録
5. MINOR の場合: 未タスク仕様書の3ステップ実行
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 内容                                                                          |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| 最終レビュー報告 | outputs/phase-10/final-review-report.md | AC-1〜AC-4 の照合結果（verified/unverified）・後続 Task02-09 への影響確認結果 |
| 最終ゲート判定   | outputs/phase-10/final-gate-decision.md | PASS / MINOR / MAJOR / CRITICAL の判定・戻り先・再レビュー条件                |

## 完了条件

- [ ] `outputs/phase-10/final-review-report.md` に AC-1〜AC-4 の verified/unverified 判定と後続影響確認結果が記録されている
- [ ] `outputs/phase-10/final-gate-decision.md` に判定（PASS/MINOR/MAJOR/CRITICAL）と戻り先が記録されている
- [ ] MINOR の場合、未タスク仕様書の3ステップ（指示書作成 / task-workflow 登録 / 関連仕様書リンク）が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-10/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 9 の quality-checklist.md 完成）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
