# Phase 3: ゲート判定 - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別   | design（設計タスク）                       |
| 作成日       | 2026-03-21                                 |
| レビュー対象 | Phase 1-2 全成果物（6ファイル）            |
| 判定者       | Phase 3 設計レビュー                       |

---

## 1. Phase 3 ゲート判定

### 判定: MINOR（Phase 4 着手可）

**根拠:**

Phase 1-2 の成果物（requirements-definition.md / scope-definition.md / current-state-inventory.md / design-summary.md / contract-matrix.md / validation-matrix.md）は、以下の全 AC を実質的に満たしている。

| AC   | 内容                                                                                | 判定 |
| ---- | ----------------------------------------------------------------------------------- | ---- |
| AC-1 | surface-local 判定を禁止する ownership table が定義されている                       | PASS |
| AC-2 | health route は `llm:check-health` を primary とし、legacy 残置条件が定義されている | PASS |
| AC-3 | RuntimePolicy / HandoffGuidance / Health DTO の責務境界が Phase 2 で図示されている  | PASS |
| AC-4 | Step 03 以降が参照する policy consumption contract が完成している                   | PASS |

MINOR 指摘（M-1〜M-3）はいずれも Phase 4 の着手を blocking しない軽微な改善事項であり、設計の根幹を変更するものではない。

**MAJOR 判定としない理由:**

- 設計判断（DD-1〜DD-6）に矛盾・欠落はない
- ownership table の4カテゴリが全て網羅されており、禁止事項が具体的な違反パターンで記述されている
- policy consumption contract の4原則に禁止・必須・型スニペットが全て含まれている
- Simpler Alternative（案A/B/C）の比較と不採用理由が妥当である

---

## 2. Phase 4 着手条件

以下の条件が全て満たされていることを Phase 4 着手前に確認すること。

### 必須条件（blocking）

| 条件                                      | 確認方法                                                                                                                  | 状態          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Phase 1 成果物が揃っている                | `outputs/phase-1/` に requirements-definition.md / scope-definition.md / current-state-inventory.md の3ファイルが存在する | 完了          |
| Phase 2 成果物が揃っている                | `outputs/phase-2/` に design-summary.md / contract-matrix.md / validation-matrix.md の3ファイルが存在する                 | 完了          |
| Phase 3 ゲートが PASS または MINOR である | 本ファイルの判定が PASS または MINOR であること                                                                           | 完了（MINOR） |
| AC-1〜AC-4 が全て PASS である             | design-review-report.md § 2 の各 AC 判定が全て PASS であること                                                            | 完了          |

### 推奨条件（non-blocking）

Phase 4 テスト設計の品質向上のため、以下を着手前に対応することを推奨する。ただし、着手を blocking しない。

| 推奨事項                                                                                  | 対応する MINOR 指摘 | 期限           |
| ----------------------------------------------------------------------------------------- | ------------------- | -------------- |
| `IRuntimePolicyResolver.resolve()` のシグネチャを確定し contract-matrix.md に追記する     | M-2                 | Phase 4 開始前 |
| `RuntimeDecisionForRenderer`（サニタイズ後 IPC 型）の定義を contract-matrix.md に追記する | M-1                 | Phase 5 開始前 |

---

## 3. MINOR 追跡先

MINOR 指摘（M-1〜M-3）の追跡先を以下に定義する。

| 指摘ID | 内容概要                                                                              | 追跡フェーズ                                       | 対応方法                                                                                               |
| ------ | ------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| M-1    | `RuntimeDecision` の IPC 向け sanitize 後の型（`RuntimeDecisionForRenderer`）が未定義 | Phase 4 着手前（推奨）/ Phase 5 着手前（最終期限） | contract-matrix.md § 2 にサニタイズ後の型定義を追記する                                                |
| M-2    | `IRuntimePolicyResolver.resolve()` のシグネチャが未確定（常時引数 vs 省略時内部DI）   | Phase 4 着手前（推奨）                             | 現行 `RuntimePolicyResolver.ts` を確認してシグネチャを確定し contract-matrix.md に追記する             |
| M-3    | `AI_CHECK_CONNECTION` 廃止 cleanup タスクのタスクIDが未割当                           | Phase 12                                           | Phase 12 の未タスク検出フローで `docs/30-workflows/unassigned-task/` に cleanup タスク指示書を作成する |

### 追跡確認方法

Phase 5 着手前チェック:

- `contract-matrix.md § 2` に `RuntimeDecisionForRenderer` 型の定義が追記されていること（M-1）
- `contract-matrix.md § 4 原則 1` に確定した `resolve()` シグネチャが記載されていること（M-2）

Phase 12 未タスク検出時:

- `docs/30-workflows/unassigned-task/` に `AI_CHECK_CONNECTION` cleanup タスクの指示書が存在すること（M-3）

---

## 4. Phase 13 blocked 条件

**ユーザー指示なしの commit / PR は禁止。**

以下の操作は、ユーザーから明示的な指示を受けるまで実行してはならない。

| 操作                                           | 状態                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| `git commit`（いかなるオプションでも）         | blocked                                                   |
| `git push`（いかなるオプションでも）           | blocked                                                   |
| `gh pr create`（GitHub PR 作成）               | blocked                                                   |
| `git commit --no-verify`（Husky フックの回避） | **絶対禁止**（CLAUDE.md 規定、Phase 13 以前を問わず禁止） |

**理由:** 本タスク（TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001）は設計タスクであり、Phase 5-9 の実装・テスト完了後に PR を作成することが想定されている。Phase 13 到達前の commit / PR はユーザーの確認なしに行う。

Phase 13 解禁条件:

1. Phase 12 の全 Task（実装ガイド / システム仕様書更新 / documentation-changelog / 未タスク検出）が完了していること
2. ユーザーから「PR を作成してください」または「commit してください」の明示的な指示があること

---

## 5. 戻り先定義

### MAJOR 発生時の対応方針

本 Phase 3 の判定は MINOR であり戻りは不要だが、以下に戻り先を記録する。

| MAJOR の種類                                                            | 戻り先  | 対応内容                                                                                          |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| AC-1: ownership table に4カテゴリの欠落または禁止事項の具体性不足       | Phase 2 | contract-matrix.md § 1 を修正して4カテゴリを網羅し、禁止事項に具体的な違反パターンを追記する      |
| AC-2: health route の primary/legacy 区分が曖昧または廃止条件が未定義   | Phase 2 | contract-matrix.md § 3 を修正して primary/legacy を明示し、廃止トリガーを検証可能な形式で定義する |
| AC-3: 型の IPC 通過可否が定義されていない、または責務境界の図示がない   | Phase 2 | design-summary.md § 2 の ASCII 図および contract-matrix.md § 2 を修正する                         |
| AC-4: policy consumption contract の4原則の欠落または警告コメントの不在 | Phase 2 | contract-matrix.md § 4 を修正して全4原則を完備し、警告コメントを追加する                          |
| 要件と設計の根本的な不整合（FR と設計判断の矛盾）                       | Phase 1 | requirements-definition.md を修正して FR を再定義し、Phase 2 の設計判断を再評価する               |

### CRITICAL 発生時の対応方針

以下の場合は Phase 1 に戻り要件を再定義する。

- `RuntimePolicyResolver` と `RuntimeResolver` の統合方針が既存コードの構造と根本的に相容れないことが判明した場合
- Task01（Contract Foundation）の成果物が本タスクの前提と矛盾していることが判明した場合
- security 設計（DD-2: apiKey の IPC 除外）が Electron の IPC 制約上実現不可能であることが判明した場合
