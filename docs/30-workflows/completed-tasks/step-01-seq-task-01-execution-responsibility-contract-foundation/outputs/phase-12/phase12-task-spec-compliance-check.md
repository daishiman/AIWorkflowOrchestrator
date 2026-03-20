# Phase 12: SKILL.md 準拠チェック

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 12                                                        |
| 作成日   | 2026-03-20                                                |

## Task 1: 実装ガイド

| チェック項目                                            | 状態 | 確認先                                                             |
| ------------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| Part 1（中学生レベル概念説明 — 日常例え必須）           | 完了 | `outputs/phase-12/implementation-guide.md`                         |
| capability 4パターンの例え話                            | 完了 | 「AI お店」の例え話で4パターンを説明                               |
| uiState 3段階の例え話                                   | 完了 | 会員カード・準備中の看板で説明                                     |
| CTA = 入口の案内板の説明                                | 完了 | uiState 別に案内板の内容を明記                                     |
| silent fallback 禁止の説明                              | 完了 | 「黙ったすり替え」として明記                                       |
| Part 2（技術者向け実装詳細）                            | 完了 | `outputs/phase-12/implementation-guide.md`                         |
| API リファレンス（execution-capability.ts）             | 完了 | AccessCapability / UiState / CtaContract 型、5関数のシグネチャ記載 |
| resolveCapability / resolveUiState / resolveCtaContract | 完了 | 使用例コードと入出力表を追加                                       |
| AuthModeStatus DTO 拡張フィールド                       | 完了 | auth-mode.ts の optional フィールド4つを記載                       |
| contract-matrix と関数の対応表（8セル）                 | 完了 | capability x uiState 全8行の対応表を追加                           |
| 禁止事項 enforcement レイヤー表                         | 完了 | assertNoSilentFallback / assertNoPrimaryCta の使い方を記載         |
| planned wording 除去                                    | 完了 | `outputs/phase-12/implementation-guide.md`                         |

## Task 2: システム仕様書更新

| チェック項目                  | 状態 | 確認先                                                                                                               |
| ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------- |
| Step 1-A 実更新ファイル一覧   | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| LOGS.md 2ファイル更新         | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| SKILL.md 2ファイル更新        | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| topic-map / keywords 再生成   | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| Step 1-B status 整合          | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| Step 1-C related ledger sync  | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| Step 1-D mirror sync          | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |
| Phase 11 screen evidence 復旧 | 完了 | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/screenshot-coverage.md`, `outputs/phase-11/screenshots/` |
| Step 2 判定                   | 完了 | `outputs/phase-12/system-spec-update-summary.md`                                                                     |

## Task 3: documentation-changelog.md

| チェック項目        | 状態 | 確認先                                        |
| ------------------- | ---- | --------------------------------------------- |
| 全 Step の事後記録  | 完了 | `outputs/phase-12/documentation-changelog.md` |
| planned wording 0件 | 完了 | `outputs/phase-12/documentation-changelog.md` |

## Task 4: 未タスク検出

| チェック項目                               | 状態 | 確認先                                                              |
| ------------------------------------------ | ---- | ------------------------------------------------------------------- |
| `unassigned-task-detection.md` 出力        | 完了 | `outputs/phase-12/unassigned-task-detection.md`                     |
| 検出件数 3件（UT-EXEC-01/02/03）           | 完了 | `outputs/phase-12/unassigned-task-detection.md`                     |
| UT-EXEC-01: Phase 10 MINOR-1 formalization | 完了 | scope-definition.md への execution-capability.ts 追記タスク         |
| UT-EXEC-02: RuntimePolicyResolver 4状態化  | 完了 | Task02 スコープへの引き継ぎとして formalization                     |
| UT-EXEC-03: Renderer consumer 統合         | 完了 | Task03/04 スコープへの引き継ぎとして formalization                  |
| 3ステップ完了確認（P3/P38 対策）           | 完了 | `outputs/phase-12/unassigned-task-detection.md` 3ステップチェック表 |

## Task 5: スキルフィードバックレポート

| チェック項目                    | 状態 | 確認先                                                                                                  |
| ------------------------------- | ---- | ------------------------------------------------------------------------------------------------------- |
| `skill-feedback-report.md` 出力 | 完了 | `outputs/phase-12/skill-feedback-report.md`                                                             |
| 改善提案の skill 反映           | 完了 | `.claude/skills/task-specification-creator/SKILL.md`, `.claude/skills/aiworkflow-requirements/SKILL.md` |

## 落とし穴対策チェック

| Pitfall ID            | 対策                                        | 状態 |
| --------------------- | ------------------------------------------- | ---- |
| P1 / P25              | LOGS.md 2ファイル同時更新                   | 完了 |
| P1bis                 | SKILL.md 2ファイル同時更新                  | 完了 |
| P2                    | `generate-index.js` 再生成                  | 完了 |
| P4 / P51 / P59        | changelog を事後実績ベースで統合            | 完了 |
| explicit screenshot   | review-board screenshot 6件 + coverage 6/6  | 完了 |
| P57                   | worktree でも `.claude` 正本を先送りしない  | 完了 |
| planned wording drift | future wording を残さない                   | 完了 |
| Phase 13 status drift | user approval 未取得のため `blocked` を維持 | 完了 |

## 総合判定

Phase 12 SKILL.md 準拠チェック: **完了**
