# 受け入れ基準

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 1                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## AC 一覧

### AC-01: skill_wizard_started

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 対象     | `skill_wizard_started`                                                       |
| 条件     | ウィザードコンポーネントマウント時に 1 回だけ発火する                        |
| payload  | `{}` （空オブジェクト / Record<never, never>）                               |
| NG 条件  | 2 回以上発火する・アンマウント後に発火する・payload にキーが含まれる         |
| 検証方法 | `vi.mock` で `trackEvent` をモック化し、呼び出し回数と引数を `expect` で確認 |
| 連携     | Phase 4 / Phase 6 / Phase 11                                                 |

---

### AC-02: skill_wizard_step1_completed

| 項目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 対象     | `skill_wizard_step1_completed`                                                                                          |
| 条件     | Step 1 全問回答完了時またはスキップボタン押下時に 1 回だけ発火する                                                      |
| payload  | `{ method: "complete" \| "skip"; skippedAtQuestion: number \| null }`                                                   |
| 整合規則 | `method === "complete"` のとき `skippedAtQuestion` は `null`。`method === "skip"` のとき `skippedAtQuestion` は正の整数 |
| NG 条件  | `method` と `skippedAtQuestion` の組み合わせが上記整合規則に反する場合                                                  |
| 検証方法 | complete ケースと skip ケースの両方でテストを作成し payload を検証する                                                  |
| 連携     | Phase 4 / Phase 6 / Phase 11                                                                                            |

---

### AC-03: skill_wizard_generation_completed

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 対象     | `skill_wizard_generation_completed`                                                          |
| 条件     | LLM 生成が成功完了した後にのみ 1 回発火する                                                  |
| payload  | `{ method: "complete" \| "skip"; category: SkillCategory; hasExternalIntegration: boolean }` |
| NG 条件  | 生成失敗時に発火する・`category` が生成結果と異なる・`hasExternalIntegration` が不正         |
| 検証方法 | 生成成功時・生成失敗時の両ケースでテストを作成し、発火有無と payload を検証する              |
| 連携     | Phase 4 / Phase 6 / Phase 11                                                                 |

---

### AC-04: skill_skeleton_quality_feedback

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 対象     | `skill_skeleton_quality_feedback`                                                            |
| 条件     | 👍 または 👎 フィードバック送信時に 1 回だけ発火する                                         |
| payload  | `{ satisfied: boolean; generationMethod: "complete" \| "skip" }`                             |
| 整合規則 | `generationMethod` は直前の `skill_wizard_step1_completed` の `method` と一致する            |
| NG 条件  | フィードバック未送信時に発火する・`generationMethod` が生成時の方式と不一致                  |
| 検証方法 | 👍 / 👎 の各ケースと `generationMethod` の complete / skip の組み合わせ全 4 ケースを検証する |
| 連携     | Phase 4 / Phase 6 / Phase 11                                                                 |

---

### AC-05: skill_wizard_next_action

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 対象     | `skill_wizard_next_action`                                                                         |
| 条件     | CompleteStep のネクストアクション選択時に 1 回だけ発火する                                         |
| payload  | `{ action: "execute" \| "open_editor" \| "create_another" }`                                       |
| NG 条件  | 上記 3 種類以外の `action` 値が記録される・選択なしで発火する                                      |
| 検証方法 | `execute` / `open_editor` / `create_another` の 3 種類すべてで個別にテストケースを作成して検証する |
| 連携     | Phase 4 / Phase 6 / Phase 11                                                                       |

---

## 統合テスト連携マトリクス

| AC-ID | Phase 4（単体テスト） | Phase 6（エッジケース追加） | Phase 11（手動確認） |
| ----- | --------------------- | --------------------------- | -------------------- |
| AC-01 | mount 時の単一発火    | 重複マウントシナリオ        | console ログ確認     |
| AC-02 | complete / skip 双方  | 各 question 番号での skip   | console ログ確認     |
| AC-03 | 生成成功ケース        | 生成失敗時の非発火          | console ログ確認     |
| AC-04 | 👍 / 👎 双方          | generationMethod の整合     | console ログ確認     |
| AC-05 | 3 種類のアクション    | 同一セッション内の複数選択  | console ログ確認     |

---

## 完了条件チェックリスト

- [x] AC-01〜AC-05 の全 5 件が定義されていること
- [x] 各 AC に NG 条件と検証方法が明記されていること
- [x] 統合テスト連携マトリクスが作成されていること
- [x] payload の整合規則が明記されていること
- [x] 矛盾なし・漏れなし
