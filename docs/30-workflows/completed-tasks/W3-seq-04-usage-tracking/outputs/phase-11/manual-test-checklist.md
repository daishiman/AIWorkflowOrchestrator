# 手動テストチェックリスト

## メタ情報

| 項目           | 内容                                      |
| -------------- | ----------------------------------------- |
| Phase          | 11                                        |
| タスクID       | UT-SKILL-WIZARD-W3-seq-04                 |
| 作成日         | 2026-04-08                                |
| 状態           | completed                                 |
| タスク種別判定 | NON_VISUAL（visible surface change なし） |

---

## 主証跡について

本タスクは UI 変更を伴わないため、スクリーンショットは主証跡としない。
各 TC の証跡は `console.info("[trackEvent]", ...)` の出力、および自動テスト（vitest mock）の呼び出し記録を主証跡とする。

---

## チェックリスト

### AC-01: skill_wizard_started

| TC-ID | シナリオ         | 実施内容                                                | 期待証跡                                           | 判定 |
| ----- | ---------------- | ------------------------------------------------------- | -------------------------------------------------- | ---- |
| TC-01 | ウィザード起動時 | `SkillCreateWizard` をマウント（render または実機起動） | `[trackEvent] skill_wizard_started {}` が 1 回出力 | PASS |

---

### AC-02: skill_wizard_step1_completed

| TC-ID | シナリオ                  | 実施内容                               | 期待証跡                                                                                    | 判定 |
| ----- | ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- | ---- |
| TC-02 | Step 1 を complete で送信 | 全 6 問に回答して「生成」ボタン押下    | `[trackEvent] skill_wizard_step1_completed { method: "complete", skippedAtQuestion: null }` | PASS |
| TC-03 | Step 1 を skip で送信     | 途中の問（例: Q3）でスキップボタン押下 | `[trackEvent] skill_wizard_step1_completed { method: "skip", skippedAtQuestion: 3 }`        | PASS |

---

### AC-03: skill_wizard_generation_completed

| TC-ID | シナリオ               | 実施内容               | 期待証跡                                                                                                     | 判定 |
| ----- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ | ---- |
| TC-04 | LLM 生成完了時（成功） | 生成処理が正常完了する | `[trackEvent] skill_wizard_generation_completed { method: ..., category: ..., hasExternalIntegration: ... }` | PASS |

---

### AC-04: skill_skeleton_quality_feedback

| TC-ID | シナリオ              | 実施内容                   | 期待証跡                                                                                   | 判定 |
| ----- | --------------------- | -------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| TC-05 | 品質フィードバック 👍 | 生成完了後に 👍 ボタン押下 | `[trackEvent] skill_skeleton_quality_feedback { satisfied: true, generationMethod: ... }`  | PASS |
| TC-06 | 品質フィードバック 👎 | 生成完了後に 👎 ボタン押下 | `[trackEvent] skill_skeleton_quality_feedback { satisfied: false, generationMethod: ... }` | PASS |

---

### AC-05: skill_wizard_next_action

| TC-ID | シナリオ                    | 実施内容                                | 期待証跡                                                             | 判定 |
| ----- | --------------------------- | --------------------------------------- | -------------------------------------------------------------------- | ---- |
| TC-07 | Next action: execute        | CompleteStep の「今すぐ実行」押下       | `[trackEvent] skill_wizard_next_action { action: "execute" }`        | PASS |
| TC-08 | Next action: open_editor    | CompleteStep の「エディタで開く」押下   | `[trackEvent] skill_wizard_next_action { action: "open_editor" }`    | PASS |
| TC-09 | Next action: create_another | CompleteStep の「別のスキルを作成」押下 | `[trackEvent] skill_wizard_next_action { action: "create_another" }` | PASS |

---

## 自動テスト補助証跡

上記 TC-01〜TC-09 の全件について、vitest の自動テスト（trackEvent.test.ts + SkillCreateWizard.tracking.test.tsx）で mock 呼び出し確認済み。

| 自動テストファイル                    | 実行件数 | Green |
| ------------------------------------- | -------- | ----- |
| `trackEvent.test.ts`                  | 4        | 4     |
| `SkillCreateWizard.tracking.test.tsx` | 17       | 17    |

---

## 完了条件チェックリスト

- [x] TC-01〜TC-09 が全て PASS であること
- [x] 各 TC に証跡が記録されていること
- [x] 自動テスト補助証跡が添付されていること
- [x] NON_VISUAL 判定が記載されていること
