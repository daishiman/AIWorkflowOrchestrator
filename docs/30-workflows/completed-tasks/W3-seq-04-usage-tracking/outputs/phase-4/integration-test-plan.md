# 統合テスト計画

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 目的

5 計装ポイントそれぞれの統合シナリオを定義し、AC-01〜AC-05 との対応を明確にする。
単体テストでは確認できないウィザード操作フロー全体を通した発火順序と payload 整合を検証する。

---

## 統合シナリオ一覧

### シナリオ A: 正常フロー（complete 方式）

**前提条件:** `SkillCreateWizard` が正常にマウントされる

| ステップ | 操作                                   | 期待イベント                                                                                               |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1        | コンポーネントマウント                 | `skill_wizard_started` `{}` で 1 回発火                                                                    |
| 2        | スキル名・目的を入力して「次へ」押下   | （イベントなし）                                                                                           |
| 3        | Step 1 の全 6 問に回答して「生成」押下 | `skill_wizard_step1_completed` `{ method: "complete", skippedAtQuestion: null }` で発火                    |
| 4        | LLM 生成完了                           | `skill_wizard_generation_completed` `{ method: "complete", category: <値>, hasExternalIntegration: <値> }` |
| 5        | 👍 フィードバック送信                  | `skill_skeleton_quality_feedback` `{ satisfied: true, generationMethod: "complete" }` で発火               |
| 6        | 「今すぐ実行」ボタン押下               | `skill_wizard_next_action` `{ action: "execute" }` で発火                                                  |

---

### シナリオ B: スキップフロー（skip 方式）

**前提条件:** `SkillCreateWizard` が正常にマウントされる

| ステップ | 操作                                 | 期待イベント                                                                                           |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1        | コンポーネントマウント               | `skill_wizard_started` `{}` で 1 回発火                                                                |
| 2        | スキル名・目的を入力して「次へ」押下 | （イベントなし）                                                                                       |
| 3        | Q3 で「スキップして生成」押下        | `skill_wizard_step1_completed` `{ method: "skip", skippedAtQuestion: 3 }` で発火                       |
| 4        | LLM 生成完了                         | `skill_wizard_generation_completed` `{ method: "skip", category: <値>, hasExternalIntegration: <値> }` |
| 5        | 👎 フィードバック送信                | `skill_skeleton_quality_feedback` `{ satisfied: false, generationMethod: "skip" }` で発火              |
| 6        | 「エディタで開く」ボタン押下         | `skill_wizard_next_action` `{ action: "open_editor" }` で発火                                          |

---

### シナリオ C: LLM 生成失敗フロー

**前提条件:** LLM 生成 API がエラーを返す

| ステップ | 操作                                  | 期待イベント                                       |
| -------- | ------------------------------------- | -------------------------------------------------- |
| 1        | コンポーネントマウント                | `skill_wizard_started` `{}` で 1 回発火            |
| 2        | Step 1 完了または skip で「生成」押下 | `skill_wizard_step1_completed` で発火              |
| 3        | LLM 生成失敗                          | `skill_wizard_generation_completed` **発火しない** |

---

### シナリオ D: 「別のスキルを作成」フロー

**前提条件:** シナリオ A または B の後半で別のスキル作成を選択

| ステップ | 操作                                 | 期待イベント                                                     |
| -------- | ------------------------------------ | ---------------------------------------------------------------- |
| 1        | 生成完了後に「別のスキルを作成」押下 | `skill_wizard_next_action` `{ action: "create_another" }` で発火 |

---

## 計装ポイント × シナリオ 対応マトリクス

| 計装ポイント                        | シナリオ A | シナリオ B  | シナリオ C | シナリオ D     |
| ----------------------------------- | ---------- | ----------- | ---------- | -------------- |
| `skill_wizard_started`              | 発火       | 発火        | 発火       | 発火           |
| `skill_wizard_step1_completed`      | 発火       | 発火        | 発火       | -              |
| `skill_wizard_generation_completed` | 発火       | 発火        | 非発火     | -              |
| `skill_skeleton_quality_feedback`   | 発火       | 発火        | -          | -              |
| `skill_wizard_next_action`          | execute    | open_editor | -          | create_another |

---

## テスト実装戦略

| テスト種別       | 対象ファイル                          | カバー対象シナリオ        |
| ---------------- | ------------------------------------- | ------------------------- |
| 単体テスト       | `trackEvent.test.ts`                  | スタブ安定性（TC-07〜09） |
| コンポーネントUT | `SkillCreateWizard.tracking.test.tsx` | シナリオ A/C の部分確認   |
| エッジケース     | 同上（Phase 6 追加分）                | TC-E01〜TC-E03            |

---

## AC-01〜AC-05 対応確認

| AC-ID | 対応シナリオ                                        | 確認内容                                                 |
| ----- | --------------------------------------------------- | -------------------------------------------------------- |
| AC-01 | A/B/C/D（全シナリオ）                               | マウント時に 1 回だけ空 payload で発火すること           |
| AC-02 | A（complete）/ B（skip）                            | `method` と `skippedAtQuestion` の整合が正しいこと       |
| AC-03 | A/B（成功）/ C（失敗）                              | 成功時のみ発火し、失敗時は発火しないこと                 |
| AC-04 | A（👍）/ B（👎）                                    | `satisfied` と `generationMethod` が正確に記録されること |
| AC-05 | A（execute）/ B（open_editor）/ D（create_another） | 3 種類のアクション全てが確認されること                   |

---

## 完了条件チェックリスト

- [x] 4 つの統合シナリオが定義されていること
- [x] 各シナリオの操作ステップと期待イベントが明記されていること
- [x] LLM 生成失敗シナリオが含まれていること
- [x] AC-01〜AC-05 とシナリオの対応が確認されていること
