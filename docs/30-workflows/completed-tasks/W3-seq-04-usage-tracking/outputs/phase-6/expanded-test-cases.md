# 拡張テストケース一覧（エッジケース）

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 6                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 概要

Phase 4 の基本テストケース（TC-01〜TC-12）に加え、各計装ポイントのエッジケースを追加した。
TC-E01〜TC-E03 は `SkillCreateWizard.tracking.test.tsx` に実装済み。

---

## エッジケース一覧

### TC-E01: skill_wizard_started 重複発火防止

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| TC-ID        | TC-E01                                                                                       |
| 対応 AC      | AC-01                                                                                        |
| テスト名     | `skill_wizard_started` は同一マウントで 1 回だけ発火すること                                 |
| 前提         | `SkillCreateWizard` が 1 回マウントされる                                                    |
| 操作         | `render(<SkillCreateWizard onClose={mockOnClose} />)` を 1 回実行                            |
| 期待結果     | `skill_wizard_started` 呼び出し回数 = 1                                                      |
| 確認方法     | `mockTrackEvent.mock.calls.filter(([name]) => name === "skill_wizard_started")` の長さを確認 |
| 実装ファイル | `SkillCreateWizard.tracking.test.tsx`                                                        |

---

### TC-E02: LLM 生成失敗時の非発火確認

| 項目         | 内容                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| TC-ID        | TC-E02                                                                                                    |
| 対応 AC      | AC-03                                                                                                     |
| テスト名     | LLM 生成失敗時に `skill_wizard_generation_completed` が発火しないこと                                     |
| 前提         | `mockCreateSkill.mockRejectedValue(new Error("LLM error"))` を設定                                        |
| 操作         | 生成ボタン押下後に LLM 呼び出しが失敗する                                                                 |
| 期待結果     | `skill_wizard_generation_completed` が呼ばれていないこと                                                  |
| 確認方法     | `expect(mockTrackEvent).not.toHaveBeenCalledWith("skill_wizard_generation_completed", expect.anything())` |
| 実装ファイル | `SkillCreateWizard.tracking.test.tsx`                                                                     |

---

### TC-E03: 品質フィードバック複数回送信

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| TC-ID        | TC-E03                                                                                             |
| 対応 AC      | AC-04                                                                                              |
| テスト名     | 品質フィードバックが複数回送信された場合、送信回数分だけ発火すること                               |
| 前提         | 生成完了後に CompleteStep が表示されている状態                                                     |
| 操作         | 👍 ボタンを 2 回押下                                                                               |
| 期待結果     | `skill_skeleton_quality_feedback` が 2 回呼ばれること                                              |
| 確認方法     | `expect(mockTrackEvent).toHaveBeenCalledTimes(2)` （`skill_skeleton_quality_feedback` フィルタ後） |
| 実装ファイル | `SkillCreateWizard.tracking.test.tsx`                                                              |

---

## resolveSkippedAtQuestion エッジケース

| TC-ID | テスト名                                        | 入力（回答済み問数） | 期待値 |
| ----- | ----------------------------------------------- | -------------------- | ------ |
| -     | 全問未回答の場合は 1 を返すこと                 | 0 問                 | `1`    |
| -     | Q1 だけ回答済みの場合は 2 を返すこと            | 1 問                 | `2`    |
| -     | Q1〜Q3 回答済み、Q4 未回答の場合は 4 を返すこと | 3 問                 | `4`    |
| -     | Q1 でスキップ（skippedAtQuestion: 1）           | 0 問                 | `1`    |
| -     | 全問回答済みの場合は null を返すこと            | 6 問                 | `null` |

---

## trackEvent スタブ回帰エッジケース

| TC-ID  | テスト名                                                                | 確認内容                                      |
| ------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| TC-09  | production では `console.info` が呼ばれないこと                         | `vi.stubEnv("NODE_ENV", "production")` で確認 |
| TC-08b | `skill_wizard_step1_completed` のペイロードが `console.info` に渡ること | `method: "skip", skippedAtQuestion: 3` で確認 |

---

## StrictMode 二重マウントの取り扱い

React StrictMode は開発環境でコンポーネントを 2 回マウントする。この振る舞いは以下の方針で取り扱う。

| 環境              | 挙動                                    | テスト方針                                            |
| ----------------- | --------------------------------------- | ----------------------------------------------------- |
| dev（StrictMode） | `useEffect` が 2 回実行される場合がある | テストハーネスでは StrictMode を使わず 1 回発火を確認 |
| prod              | `useEffect` は 1 回のみ                 | `vi.stubEnv("NODE_ENV", "production")` で確認         |

Vitest + `@testing-library/react` のデフォルトは StrictMode が有効でない場合も多いため、テスト環境では `render()` の 1 回マウントで 1 回発火を確認することで十分とする。

---

## 完了条件チェックリスト

- [x] TC-E01〜TC-E03 が定義・実装されていること
- [x] `resolveSkippedAtQuestion` の境界値テストが含まれていること
- [x] StrictMode の二重マウント問題が文書化されていること
- [x] trackEvent スタブの production 抑制テストが含まれていること
