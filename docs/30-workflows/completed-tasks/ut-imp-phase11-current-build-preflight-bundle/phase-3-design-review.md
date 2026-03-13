# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 3                                                 |
| Phase名    | 設計レビュー                                      |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 1, Phase 2                                  |
| 後続Phase  | Phase 4                                           |

## 目的

Phase 1 と Phase 2 の内容が、4 観点 preflight、capture integration、Phase 12 同期、関心ごと分離の観点で矛盾なく成立しているかを判定し、Phase 4 以降へ進める設計品質を確保する。

## 背景

この task は実装量が小さい一方で、失敗分類、bucket 順序、workflow 正本同期の設計ミスがそのまま再発する危険が高い。  
Phase 3 では scope creep を防ぎ、Phase 4 で作る test が設計漏れを拾える状態かを確認する。

## 実行タスク

- タスク1: 要件と設計のトレーサビリティを検証する
- タスク2: concern 分離と scope 境界を検証する
- タスク3: Phase 12 同期計画と closed issue 制約を検証する
- タスク4: ゲート判定を行う

### タスク1: 要件と設計のトレーサビリティ

**目的**: AC-1 から AC-6 が Phase 2 の設計へ落ちているかを確認する

**確認項目**:

| ID   | 確認内容                                                          | 合格条件                                                              |
| ---- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| RV-1 | AC と FR/NFR が Phase 2 成果物へ対応づいているか                  | 全 AC に対応する設計項目が存在する                                    |
| RV-2 | 4 bucket の順序が一貫しているか                                   | native -> build -> harness -> baseUrl が全資料で一致する              |
| RV-3 | shared core、CLI wrapper、capture consumer の責務が分かれているか | capture は消費者、CLI は入出力変換、core は判定者として定義されている |

### タスク2: concern 分離と scope 境界

**目的**: remediation task と guard task が混線しない設計かを確認する

**確認項目**:

| ID   | 確認内容                                                              | 合格条件                                                                         |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| RV-4 | UI remediation が scope 外として固定されているか                      | `ThemeSelector`、`AuthView`、`WorkspaceSearchPanel` の色修正が非対象になっている |
| RV-5 | Lane A-C の境界が明確か                                               | script、capture、docs が別テーブルで管理されている                               |
| RV-6 | native dependency 修復と preflight 判定が別 task として分かれているか | `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` へ責務委譲が明記されている             |
| RV-7 | shell-out 案と monolith 案を破棄する理由が記録されているか            | 設計判断テーブルに採否と理由がある                                               |

### タスク3: Phase 12 同期計画と issue 制約

**目的**: 正本仕様の更新漏れと issue 状態の誤操作を防ぐ

**確認項目**:

| ID    | 確認内容                                                                                                | 合格条件                                |
| ----- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| RV-8  | task-workflow、lessons-learned、workflow-light-theme-contrast-regression-guard が更新対象に入っているか | 3 ファイル以上が名指しされている        |
| RV-9  | current と baseline の分離記録が Phase 12 に入っているか                                                | 未タスク監査ガイドを参照している        |
| RV-10 | closed Issue #1167 を Phase 3 時点で変更しない制約が明記されているか                                    | spec 作成段階では参照用と記載されている |

### タスク4: ゲート判定

**判定基準**:

| 判定  | 条件                                             | 次アクション                  |
| ----- | ------------------------------------------------ | ----------------------------- |
| PASS  | RV-1 から RV-10 がすべて合格                     | Phase 4 へ進む                |
| MINOR | 文言不足または参照漏れが 2 件以下                | 修正後に Phase 4 へ進む       |
| MAJOR | AC 対応漏れ、scope 混線、bucket 順序不一致がある | Phase 1 または Phase 2 へ戻る |

## 参照資料

| 参照資料           | パス                       | 説明                                   |
| ------------------ | -------------------------- | -------------------------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`  | AC、FR、NFR、Lane 定義                 |
| Phase 2 設計       | `phase-2-design.md`        | contract、integration、test、sync plan |
| 仕様抽出マトリクス | `spec-reference-matrix.md` | 正本仕様の抽出根拠                     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | レビューゲートの合格条件          |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | guard task の scope 境界          |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | current と baseline 分離          |
| task 台帳        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | backlog と completed routing      |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core 採用の妥当性確認      |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | blocked / guidance の責務分離確認 |

## 実行手順

### ステップ1: Phase 1 と Phase 2 の対応を検証する

FR/NFR/AC が設計成果物と 1 対 1 でつながっているかを確認する。

### ステップ2: 採用構造が本当に最小かを検証する

shared core 案が shell-out 案や monolith 案よりも重複、責務肥大、検証負荷を減らしているかを確認する。

### ステップ3: Phase 12 と issue 制約まで含めて閉じる

正本仕様更新先、current/baseline 二層記録、closed issue 制約まで入っていることを確認する。

## 統合テスト連携

- Phase 3 の指摘は Phase 4 の test case へ反映する。
- scope 混線や bundle 名の不一致を見つけた場合は、Phase 5 実装着手前に修正する。
- Phase 12 の current/baseline 二層記録が設計に入っているかをこの Phase で確認する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                             | 主要仕様                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | shared core 採用が最小の責務境界になっているかを見る                | `architecture-implementation-patterns.md`                                                                                                    |
| エラーハンドリング | guidance と blocked bucket の扱いが core/CLI で分かれているかを見る | `error-handling.md`                                                                                                                          |
| 品質               | Phase 4 の test が設計の穴を拾えるかを見る                          | `quality-requirements.md`                                                                                                                    |
| 文書同期           | Phase 12 更新先と current/baseline 分離が設計に含まれるかを見る     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物           | パス                                      | 内容                      |
| ---------------- | ----------------------------------------- | ------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定結果と根拠            |
| 指摘一覧         | `outputs/phase-3/review-findings.md`      | MINOR または MAJOR の明細 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`        | PASS、MINOR、MAJOR の記録 |

## 完了条件

- [ ] RV-1 から RV-10 の結果が記録されている
- [ ] AC-1 から AC-6 のトレーサビリティが確認されている
- [ ] remediation task と guard task の境界が維持されている
- [ ] shared core 採用と破棄案の判断が確認されている
- [ ] Phase 12 の更新対象が 4 件以上確認されている
- [ ] ゲート判定が PASS または MINOR として記録されている

## 次Phase

Phase 4: テスト作成へ進む。
