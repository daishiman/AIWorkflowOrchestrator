# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 3                      |
| 後続Phase  | Phase 5                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

実装前に Red（失敗）状態のテストを定義し、trackEvent が mock で正しく呼ばれることを確認するテストを固める。

## テスト対象

| テスト対象                                   | テスト種別     | 目的                                                          |
| -------------------------------------------- | -------------- | ------------------------------------------------------------- |
| `skill_wizard_started` 発火確認              | ユニットテスト | ウィザードマウント時に空 payload で trackEvent が呼ばれること |
| `skill_wizard_step1_completed` 発火確認      | 統合テスト     | 生成ボタン押下時に trackEvent が呼ばれること                  |
| `skill_wizard_generation_completed` 発火確認 | 統合テスト     | LLM生成完了後に trackEvent が呼ばれること                     |
| `skill_skeleton_quality_feedback` 発火確認   | ユニットテスト | フィードバック送信時に trackEvent が呼ばれること              |
| `skill_wizard_next_action` 発火確認          | 統合テスト     | ネクストアクション選択時に trackEvent が呼ばれること          |

## trackEvent mock を使ったテスト定義

| TC-ID | ファイル内テスト名                                                      | 対象                    | 観点           |
| ----- | ----------------------------------------------------------------------- | ----------------------- | -------------- |
| TC-01 | ウィザードマウント時に skill_wizard_started が空 payload で発火すること | `SkillCreateWizard.tsx` | AC-01          |
| TC-02 | complete 方式で skill_wizard_step1_completed が発火すること             | `SkillCreateWizard.tsx` | AC-02          |
| TC-03 | skip 方式で skill_wizard_step1_completed が発火すること                 | `SkillCreateWizard.tsx` | AC-02          |
| TC-04 | LLM 生成完了後に skill_wizard_generation_completed が発火すること       | `SkillCreateWizard.tsx` | AC-03          |
| TC-05 | 👍/👎 で skill_skeleton_quality_feedback が発火すること                 | `SkillCreateWizard.tsx` | AC-04          |
| TC-06 | 3 種類の next action で skill_wizard_next_action が発火すること         | `CompleteStep.tsx`      | AC-05          |
| TC-07 | trackEvent が例外を投げないこと                                         | `trackEvent.ts`         | スタブ安定性   |
| TC-08 | 開発環境で console.info が呼ばれること                                  | `trackEvent.ts`         | スタブ出力     |
| TC-09 | production では console.info が抑制されること                           | `trackEvent.ts`         | スタブ出力抑制 |

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as trackEventModule from "../../utils/trackEvent";

// trackEvent を mock する
const mockTrackEvent = vi.spyOn(trackEventModule, "trackEvent");

beforeEach(() => {
  mockTrackEvent.mockClear();
});

describe("SkillCreateWizard 計装テスト", () => {
  // テスト1: ウィザード起動イベント
  it("ウィザードマウント時に skill_wizard_started が空 payload で発火すること", () => {
    render(<SkillCreateWizard />);
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_started", {});
  });

  // テスト2: Step 1 完了イベント（complete方式）
  it("complete方式で生成した場合に skill_wizard_step1_completed が発火すること", async () => {
    // Step 0 → Step 1 → 全問回答 → 生成ボタン押下のシナリオ
    // ...
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step1_completed", {
      method: "complete",
      skippedAtQuestion: null,
    });
  });

  // テスト3: Step 1 完了イベント（skip方式）
  it("skip方式で生成した場合に skill_wizard_step1_completed が発火し skippedAtQuestion が記録されること", async () => {
    // Q3 の時点でスキップボタン押下のシナリオ
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step1_completed", {
      method: "skip",
      skippedAtQuestion: 3, // 3問目でスキップ
    });
  });

  // テスト4: 生成完了イベント
  it("LLM生成完了後に skill_wizard_generation_completed が発火すること", async () => {
    // LLM生成モック完了後
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_wizard_generation_completed",
      {
        method: expect.stringMatching(/^(complete|skip)$/),
        category: expect.any(String),
        hasExternalIntegration: expect.any(Boolean),
      }
    );
  });

  // テスト5: 品質フィードバックイベント（満足）
  it("👍 フィードバック時に skill_skeleton_quality_feedback(satisfied=true) が発火すること", () => {
    // CompleteStep の 👍 ボタン押下
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_skeleton_quality_feedback",
      {
        satisfied: true,
        generationMethod: expect.stringMatching(/^(complete|skip)$/),
      }
    );
  });

  // テスト6: 品質フィードバックイベント（不満）
  it("👎 フィードバック時に skill_skeleton_quality_feedback(satisfied=false) が発火すること", () => {
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_skeleton_quality_feedback",
      {
        satisfied: false,
        generationMethod: expect.stringMatching(/^(complete|skip)$/),
      }
    );
  });

  // テスト7: ネクストアクション「実行」
  it("'実行' を選択した場合に skill_wizard_next_action(execute) が発火すること", () => {
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "execute",
    });
  });

  // テスト8: ネクストアクション「エディタで開く」
  it("'エディタで開く' を選択した場合に skill_wizard_next_action(open_editor) が発火すること", () => {
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "open_editor",
    });
  });

  // テスト9: ネクストアクション「別のスキルを作成」
  it("'別のスキルを作成' を選択した場合に skill_wizard_next_action(create_another) が発火すること", () => {
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "create_another",
    });
  });
});
```

## 統合テスト連携

- Phase 1 の AC-01〜AC-05 を TC-01〜TC-09 に落とし込み、Phase 6 で edge case を追加する。
- Phase 11 は NON_VISUAL として、manual-test-result の console evidence に TC-ID を紐付ける。
- 生成完了とフィードバックは 1 回ずつ発火し、二重送信がないことを確認する。

## trackEvent スタブのテスト

```typescript
describe("trackEvent スタブ", () => {
  it("trackEvent が呼ばれた場合にエラーをスローしないこと", () => {
    expect(() => {
      trackEvent("skill_wizard_started", {});
    }).not.toThrow();
  });

  it("開発環境では console.info が呼ばれること", () => {
    const consoleSpy = vi.spyOn(console, "info");
    trackEvent("skill_wizard_started", {});
    expect(consoleSpy).toHaveBeenCalledWith(
      "[trackEvent]",
      "skill_wizard_started",
      {},
    );
  });
});
```

## 参照資料

| 資料名               | パス                                         | 用途           |
| -------------------- | -------------------------------------------- | -------------- |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`    | Phase 3 成果物 |
| ゲート判定           | `outputs/phase-3/gate-decision.md`           | Phase 3 成果物 |
| 実装設計書           | `outputs/phase-2/implementation-design.md`   | Phase 2 成果物 |
| イベントスキーマ定義 | `outputs/phase-1/event-schema-definition.md` | Phase 1 成果物 |

## 実行タスク

1. Phase 3 成果物を確認し、ゲート判定が PASS であることを確認する。
2. `vi.spyOn` で `trackEvent` をモック化するテストファイルを作成する。
3. 9つのテストケースを全て Red（失敗）状態で作成する。
4. `trackEvent` スタブ自体のテストを作成する。
5. テスト仕様書として成果物を出力する。

## 成果物

| 成果物         | パス                                       | 説明                             |
| -------------- | ------------------------------------------ | -------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧（mock確認含む） |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 実装前の失敗確認記録             |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 全計装ポイントの統合シナリオ     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 5つの計装ポイントのテストが全て定義されていること
- [ ] `vi.spyOn` による `trackEvent` モック確認テストが実装されていること
- [ ] スキップ時の `skippedAtQuestion` 記録テストが含まれていること
- [ ] 全9テストケースが Red（失敗）状態であることが確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. trackEvent mock テスト設計
3. テストファイル作成（Red段階）
4. Red状態確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
