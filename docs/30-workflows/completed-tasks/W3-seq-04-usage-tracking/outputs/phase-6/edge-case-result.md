# エッジケーステスト結果

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 6                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## エッジケース実行結果

### TC-E01: skill_wizard_started 重複発火防止

| 項目     | 内容                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 結果     | PASS                                                                                                              |
| 確認内容 | `render(<SkillCreateWizard onClose={mockOnClose} />)` 後、`skill_wizard_started` 呼び出し回数 = 1                 |
| 証跡     | `mockTrackEvent.mock.calls.filter(([name]) => name === "skill_wizard_started")` の length が `1` であることを確認 |
| 備考     | Vitest + testing-library のデフォルト設定では StrictMode が無効なため、dev での二重マウント問題は発生しない       |

---

### TC-E02: LLM 生成失敗時の非発火確認

| 項目     | 内容                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 結果     | PASS                                                                                                             |
| 確認内容 | `mockCreateSkill.mockRejectedValue(new Error("LLM error"))` 設定後、生成ボタン押下                               |
| 証跡     | `expect(mockTrackEvent).not.toHaveBeenCalledWith("skill_wizard_generation_completed", expect.anything())` が通過 |
| 備考     | `skill_wizard_step1_completed` は発火するが `skill_wizard_generation_completed` は発火しないことを確認           |

---

### TC-E03: 品質フィードバック複数回送信

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 結果     | PASS（SkillCreateWizard.tracking.test.tsx の実装範囲内で確認）                                      |
| 確認内容 | `handleQualityFeedback` が複数回呼ばれる場合に `trackEvent` が呼び出し回数分発火する                |
| 証跡     | `skill_skeleton_quality_feedback` フィルタ後の呼び出し回数確認                                      |
| 備考     | UI上での複数回押下は E2E テストで確認。ユニットテストでは直接ハンドラを複数回呼び出すパターンで確認 |

---

## resolveSkippedAtQuestion 境界値テスト結果

| テスト名                                        | 入力 | 期待値 | 結果 |
| ----------------------------------------------- | ---- | ------ | ---- |
| 全問未回答の場合は 1 を返すこと                 | 0 問 | `1`    | PASS |
| Q1 だけ回答済みの場合は 2 を返すこと            | 1 問 | `2`    | PASS |
| Q1〜Q3 回答済み、Q4 未回答の場合は 4 を返すこと | 3 問 | `4`    | PASS |
| Q1 の時点でスキップ（skippedAtQuestion: 1）     | 0 問 | `1`    | PASS |
| 全問回答済みの場合は null を返すこと            | 6 問 | `null` | PASS |

---

## trackEvent スタブ production 抑制確認

| テスト名                                        | 結果 | 確認方法                                          |
| ----------------------------------------------- | ---- | ------------------------------------------------- |
| production では `console.info` が呼ばれないこと | PASS | `vi.stubEnv("NODE_ENV", "production")` + spy 確認 |
| dev では `console.info` が呼ばれること          | PASS | `vi.spyOn(console, "info")` で出力確認            |

---

## 発見した問題・特記事項

| 項目                           | 内容                                                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| StrictMode 二重マウント        | テスト環境では発生しない。本番アプリの dev モードでは `[trackEvent] skill_wizard_started {}` が 2 回 console に出る場合があるが、production では抑制される |
| TC-E02 の LLM 失敗シミュレート | `mockCreateSkill.mockRejectedValue(...)` で正確にシミュレートできた。生成 try/catch 外への計装配置が重要                                                   |

---

## 完了条件チェックリスト

- [x] TC-E01〜TC-E03 の結果が記録されていること
- [x] 境界値テストの結果が全件 PASS であること
- [x] production 抑制テストが PASS であること
- [x] 発見した問題・特記事項が記録されていること
