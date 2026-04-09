# テスト仕様書

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## テスト対象ファイル

| ファイル                                                                                   | 役割                     |
| ------------------------------------------------------------------------------------------ | ------------------------ |
| `apps/desktop/src/renderer/utils/trackEvent.ts`                                            | 計装スタブ本体           |
| `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                             | スタブ単体テスト         |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` | ウィザード計装統合テスト |

---

## テストケース一覧

### SkillCreateWizard 計装テスト（tracking.test.tsx）

| TC-ID | テスト名                                                                                 | 対応 AC | 観点                                                           |
| ----- | ---------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| TC-01 | ウィザードマウント時に `skill_wizard_started` が空 payload で発火すること                | AC-01   | `render(<SkillCreateWizard />)` 後に `trackEvent` 呼び出し確認 |
| TC-02 | complete 方式で `skill_wizard_step1_completed(method=complete)` が発火すること           | AC-02   | 生成ボタン押下後に payload 確認                                |
| TC-03 | skip 方式で `skill_wizard_step1_completed` が発火し `skippedAtQuestion` が記録されること | AC-02   | スキップボタン押下後に payload 確認                            |
| TC-04 | LLM 生成完了後に `skill_wizard_generation_completed` が発火すること                      | AC-03   | `createSkill` 成功後に payload 確認                            |
| TC-05 | 👍 フィードバック時に `skill_skeleton_quality_feedback(satisfied=true)` が発火すること   | AC-04   | フィードバックボタン押下確認                                   |
| TC-06 | 👎 フィードバック時に `skill_skeleton_quality_feedback(satisfied=false)` が発火すること  | AC-04   | フィードバックボタン押下確認                                   |
| TC-10 | execute ボタン押下で `skill_wizard_next_action(execute)` が発火すること                  | AC-05   | CompleteStep 経由で execute 確認                               |
| TC-11 | open_editor ボタン押下で `skill_wizard_next_action(open_editor)` が発火すること          | AC-05   | CompleteStep 経由で open_editor 確認                           |
| TC-12 | create_another ボタン押下で `skill_wizard_next_action(create_another)` が発火すること    | AC-05   | CompleteStep 経由で create_another 確認                        |

### Phase 6 エッジケース（同ファイルに追加）

| TC-ID  | テスト名                                                              | 対応 AC | 観点                                                        |
| ------ | --------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| TC-E01 | `skill_wizard_started` は同一マウントで 1 回だけ発火すること          | AC-01   | mock.calls をフィルタリングして呼び出し回数 = 1 を確認      |
| TC-E02 | LLM 生成失敗時に `skill_wizard_generation_completed` が発火しないこと | AC-03   | `mockCreateSkill.mockRejectedValue(...)` で失敗シミュレート |
| TC-E03 | 品質フィードバックが複数回送信された場合、送信回数分だけ発火すること  | AC-04   | 2 回押下 → `trackEvent` 2 回呼び出し確認                    |

### trackEvent スタブ単体テスト（trackEvent.test.ts）

| TC-ID  | テスト名                                                                | 観点                                                       |
| ------ | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC-07  | `trackEvent` が呼ばれた場合にエラーをスローしないこと                   | `expect(() => trackEvent(...)).not.toThrow()` で安定性確認 |
| TC-08  | 開発環境では `console.info` が呼ばれること                              | `vi.spyOn(console, "info")` で出力確認                     |
| TC-08b | `skill_wizard_step1_completed` のペイロードが `console.info` に渡ること | `method: "skip", skippedAtQuestion: 3` のペイロード確認    |
| TC-09  | production では `console.info` が呼ばれないこと                         | `vi.stubEnv("NODE_ENV", "production")` で抑制確認          |

---

## モック設定

```typescript
// trackEvent をスパイ
const mockTrackEvent = vi.spyOn(trackEventModule, "trackEvent");

// Store モック
vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useClearGenerationState: () => vi.fn(),
  useWorkflowSnapshot: () => null,
}));
```

---

## resolveSkippedAtQuestion ユニットテスト

| テスト名                                        | 期待値 |
| ----------------------------------------------- | ------ |
| 全問未回答の場合は 1 を返すこと                 | `1`    |
| Q1 だけ回答済みの場合は 2 を返すこと            | `2`    |
| Q1〜Q3 回答済み、Q4 未回答の場合は 4 を返すこと | `4`    |
| Q1 の時点でスキップ（skippedAtQuestion: 1）     | `1`    |
| 全問回答済みの場合は null を返すこと            | `null` |

---

## 完了条件チェックリスト

- [x] 5 計装ポイントのテストが全件定義されていること
- [x] `vi.spyOn` による `trackEvent` モック確認テストが実装されていること
- [x] スキップ時の `skippedAtQuestion` 記録テストが含まれていること
- [x] エッジケース TC-E01〜TC-E03 が定義されていること
- [x] `resolveSkippedAtQuestion` の境界値テストが定義されていること
- [x] trackEvent スタブ単体テスト TC-07〜TC-09 が定義されていること
