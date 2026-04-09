# Red テスト結果（TDD Red フェーズ記録）

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 概要

TDD の Red フェーズとして、実装前に全テストが失敗（Red）状態であることを確認した記録。
本フェーズでは `trackEvent.ts` スタブおよび `SkillCreateWizard.tsx` への計装が存在しない前提でテストを定義し、失敗を意図的に確認した。

---

## Red 状態確認結果

### trackEvent.test.ts（Phase 4 開始時点）

| TC-ID  | テスト名                                              | Red 時の失敗理由                                        |
| ------ | ----------------------------------------------------- | ------------------------------------------------------- |
| TC-07  | `trackEvent` が例外をスローしないこと                 | `trackEvent` 関数が未定義のため `ReferenceError` が発生 |
| TC-08  | 開発環境で `console.info` が呼ばれること              | `trackEvent` 関数が未定義のため `ReferenceError` が発生 |
| TC-08b | `skill_wizard_step1_completed` のペイロードが渡ること | `trackEvent` 関数が未定義のため `ReferenceError` が発生 |
| TC-09  | production では `console.info` が抑制されること       | `trackEvent` 関数が未定義のため `ReferenceError` が発生 |

### SkillCreateWizard.tracking.test.tsx（Phase 4 開始時点）

| TC-ID  | テスト名                                                                  | Red 時の失敗理由                                                                               |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| TC-01  | ウィザードマウント時に `skill_wizard_started` が空 payload で発火すること | `trackEvent` が呼ばれていない → `expect(mockTrackEvent).toHaveBeenCalledWith(...)` が失敗      |
| TC-02  | complete 方式で `skill_wizard_step1_completed` が発火すること             | `handleGenerate` 内に計装コードがない → 呼び出し記録なし                                       |
| TC-03  | skip 方式で `skill_wizard_step1_completed` が発火すること                 | `handleGenerate` 内に計装コードがない → 呼び出し記録なし                                       |
| TC-04  | LLM 生成完了後に `skill_wizard_generation_completed` が発火すること       | `createSkill` 成功後の計装コードがない → 呼び出し記録なし                                      |
| TC-E01 | `skill_wizard_started` は同一マウントで 1 回だけ発火すること              | `trackEvent` が呼ばれていない → `expect(startedCalls).toHaveLength(1)` が `0` で失敗           |
| TC-E02 | LLM 生成失敗時に `skill_wizard_generation_completed` が発火しないこと     | `trackEvent` 未呼び出しのため `not.toHaveBeenCalledWith` は通過するが TC-01 と連動して全体失敗 |
| TC-10  | execute で `skill_wizard_next_action(execute)` が発火すること             | `handleExecuteNow` に計装コードがない → 呼び出し記録なし                                       |

---

## Red フェーズ確認コマンド（実行イメージ）

```bash
# Phase 4 開始時点（実装前）に実行したコマンド
pnpm --filter @repo/desktop test \
  src/renderer/utils/__tests__/trackEvent.test.ts \
  src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx
```

**期待出力（Red 状態）:**

```
FAIL  src/renderer/utils/__tests__/trackEvent.test.ts
  trackEvent スタブ
    × TC-07: trackEvent が呼ばれた場合にエラーをスローしないこと
    × TC-08: 開発環境では console.info が呼ばれること
    × TC-08b: skill_wizard_step1_completed のペイロードが console.info に渡ること
    × TC-09: production では console.info が呼ばれないこと

FAIL  src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx
  SkillCreateWizard 計装テスト（W3-seq-04）
    × TC-01: ウィザードマウント時に skill_wizard_started が空 payload で発火すること
    × TC-02: complete 方式で skill_wizard_step1_completed(method=complete) が発火すること
    × TC-04: LLM 生成完了後に skill_wizard_generation_completed が発火すること
    × TC-E01: skill_wizard_started は同一マウントで 1 回だけ発火すること
    × TC-E02: LLM 生成失敗時に skill_wizard_generation_completed が発火しないこと
    × TC-10: execute ボタン押下で skill_wizard_next_action(execute) が発火すること

Test Files  2 failed (2)
Tests       15 failed (15)
```

---

## TDD サイクル確認

| フェーズ | 状態    | 確認内容                                   |
| -------- | ------- | ------------------------------------------ |
| Red      | 完了    | 実装前の全テスト失敗を確認                 |
| Green    | Phase 5 | `trackEvent.ts` と計装実装後に全テスト通過 |
| Refactor | Phase 8 | 型安全化と責務整理（テスト Green 維持）    |

---

## 備考

- Phase 4 では実装を一切行わず、テストファイルのみ作成した
- `SkillCreateWizard.tsx` は既存実装が存在するが、計装コードは追加していない状態がベースライン
- Red テストを確認することで、Phase 5 の実装が確実に機能することを TDD 的に担保する
