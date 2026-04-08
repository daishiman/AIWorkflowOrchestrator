# Phase 4: テスト作成

## メタ情報

- Phase: 4
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

実装前にテストコードを作成し（TDD方式）、`ConversationRoundStep` コンポーネントの振る舞いを仕様として確定する。

## 前提（Gate）

- Phase 3 の進行条件（Lane A/B/C/D の結果 + 4条件 PASS）を満たしていること。
- ここでは **TDD-Red** として、まずテストを作成し、実装前に失敗する（RED）ことを確認する。

## SubAgent 分担（Phase 4）

同一テストファイル内でも、`describe` ブロック単位で並列に作業できる。

| SubAgent   | 担当範囲                      | 目安の分割単位                                                         |
| ---------- | ----------------------------- | ---------------------------------------------------------------------- |
| SubAgent-A | 進捗バー + ページング         | `describe("進捗バー表示")`, `describe("ページング")`                   |
| SubAgent-B | Q3 スケジュールUI + Q5 必須   | `describe("Q3スケジュールUI展開")`, `describe("Q5必須バリデーション")` |
| SubAgent-C | サマリーカード + コールバック | `describe("適用サマリーカード")`, `describe("onBack コールバック")`    |
| Lead       | 最小 RED 確認と不足観点の補完 | RED 実行確認、テスト粒度調整                                           |

## 実行タスク

- [ ] テストファイルを作成する
- [ ] 進捗バーのテストを作成する
- [ ] ページングのテストを作成する
- [ ] Q3スケジュールUI展開テストを作成する
- [ ] Q5必須バリデーションテストを作成する
- [ ] 適用サマリーカードのテストを作成する
- [ ] スマートデフォルト適用テストを作成する
- [ ] テストが RED（失敗）状態であることを確認する

## 参照資料

| 資料名               | パス                            | 説明             |
| -------------------- | ------------------------------- | ---------------- |
| Phase 2 設計書       | `phase-2-design.md`             | テスト対象の仕様 |
| Phase 3 設計レビュー | `phase-3-design-review.md`      | レビュー済み仕様 |
| Vitest 設定          | `apps/desktop/vitest.config.ts` | テスト実行環境   |

## 実行手順

### Step 1: テストファイル作成

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### Step 2: テストコード作成

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConversationRoundStep } from "../ConversationRoundStep";
import type {
  SkillInfoFormData,
  ConversationAnswers,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";

const defaultFormData: SkillInfoFormData = {
  skillName: "",
  purpose: "テスト目的入力テスト",
  category: "automation",
};

const defaultAnswers: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "" },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

const defaultSmartDefaults: SmartDefaultResult = {
  who: null, input: null, timing: null, output: null, tool: null, format: null,
};

describe("ConversationRoundStep", () => {
  describe("進捗バー表示", () => {
    it("Page1 表示時に「質問 1/6」が表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      expect(screen.getByText(/質問 1\/6/)).toBeInTheDocument();
    });

    it("進捗バーが6問ずつ正確に表示される", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      // Page1: 「質問 1/6」表示
      expect(screen.getByText(/質問 1\/6/)).toBeInTheDocument();
      // Page2へ遷移
      await user.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      // Page2: 「質問 4/6」表示
      expect(screen.getByText(/質問 4\/6/)).toBeInTheDocument();
    });
  });

  describe("ページング", () => {
    it("初期表示で Q1〜Q3 が表示される（Page1）", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      expect(screen.getByText(/Q1|利用者/)).toBeInTheDocument();
      expect(screen.getByText(/Q2|入力データ/)).toBeInTheDocument();
      expect(screen.getByText(/Q3|実行タイミング/)).toBeInTheDocument();
      expect(screen.queryByText(/Q4|出力先/)).not.toBeInTheDocument();
    });

    it("「次のページ」クリックで Q4〜Q6 が表示される（Page2）", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText(/Q4|出力先/)).toBeInTheDocument();
      expect(screen.getByText(/Q5|外部ツール/)).toBeInTheDocument();
      expect(screen.getByText(/Q6|出力フォーマット/)).toBeInTheDocument();
      expect(screen.queryByText(/Q1|利用者/)).not.toBeInTheDocument();
    });
  });

  describe("Q3スケジュールUI展開", () => {
    it("Q3 で「定期実行」を選択するとスケジュールUIが展開される", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.getByLabelText(/cron|スケジュール/i)).toBeInTheDocument();
    });

    it("Q3 で「手動実行」を選択するとスケジュールUIが表示されない", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: "手動実行" }));
      expect(screen.queryByLabelText(/cron|スケジュール/i)).not.toBeInTheDocument();
    });
  });

  describe("Q5必須バリデーション", () => {
    it("category=external-integration のとき Q5 に必須マークが表示される", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={{ ...defaultFormData, category: "external-integration" }}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText(/Q5.*必須|必須.*Q5/)).toBeInTheDocument();
    });

    it("category=automation のとき Q5 に必須マークが表示されない", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.queryByText(/Q5.*必須|必須.*Q5/)).not.toBeInTheDocument();
    });
  });

  describe("適用サマリーカード", () => {
    it("「今すぐ生成する」クリックで適用サマリーカードが表示される", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      expect(screen.getByRole("region", { name: /サマリー|適用/ })).toBeInTheDocument();
    });

    it("今すぐ生成のサマリーカードが正しく表示される（残問デフォルト値一覧）", async () => {
      const user = userEvent.setup();
      const smartDefaults: SmartDefaultResult = {
        who: "自分のみ", input: null, timing: null, output: null, tool: null, format: "Markdown",
      };
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={smartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      expect(screen.getByText(/自分のみ/)).toBeInTheDocument();
      expect(screen.getByText(/Markdown/)).toBeInTheDocument();
    });

    it("サマリーカードの×ボタンでカードが閉じる", async () => {
      const user = userEvent.setup();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      await user.click(screen.getByRole("button", { name: /閉じる|×/ }));
      expect(screen.queryByRole("region", { name: /サマリー|適用/ })).not.toBeInTheDocument();
    });

    it("サマリーカードの「生成する」クリックで onGenerate('skip') が呼ばれる", async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={vi.fn()}
          onGenerate={onGenerate}
        />
      );
      await user.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      await user.click(screen.getByRole("button", { name: /^生成する$/ }));
      expect(onGenerate).toHaveBeenCalledWith("skip");
    });
  });

  describe("onBack コールバック", () => {
    it("「戻る」ボタンクリック時に onBack が呼ばれる", async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={vi.fn()}
          onBack={onBack}
          onGenerate={vi.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /戻る/ }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Step 3: テスト実行（RED確認）

```bash
# vitest でテスト実行（実装前なので失敗することを確認）
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

## 統合テスト連携

| TC-ID | AC-ID | テスト内容                                                   |
| ----- | ----- | ------------------------------------------------------------ |
| TC-01 | AC-01 | Page1 表示時に Q1〜Q3 が表示され Q4〜Q6 は非表示             |
| TC-02 | AC-01 | 「次のページ」クリックで Q4〜Q6 が表示される                 |
| TC-03 | AC-02 | Page1 で「質問 1/6」、Page2 で「質問 4/6」が表示される       |
| TC-04 | AC-03 | SmartDefaultResult が各問の初期値として反映される            |
| TC-05 | AC-04 | Q3「定期実行」選択でスケジュールUIが展開される               |
| TC-06 | AC-04 | Q3「手動実行」選択でスケジュールUIが非表示になる             |
| TC-07 | AC-05 | category=external-integration のとき Q5 に必須マーク         |
| TC-08 | AC-05 | category=automation のとき Q5 に必須マークなし               |
| TC-09 | AC-06 | 「今すぐ生成する」でサマリーカードが表示される               |
| TC-10 | AC-07 | サマリーカードの×ボタンでカードが閉じる                      |
| TC-11 | AC-06 | サマリーカードの「生成する」で onGenerate("skip") が呼ばれる |
| TC-12 | —     | 「戻る」ボタンで onBack が呼ばれる                           |

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`

## 完了条件

- [ ] テストファイルが作成されている
- [ ] 進捗バーの「質問 N/6」表示テストが作成されている
- [ ] ページング（Page1/Page2切り替え）テストが作成されている
- [ ] Q3スケジュールUI展開テストが作成されている
- [ ] Q5必須バリデーションテストが作成されている
- [ ] 適用サマリーカード（表示・dismissible・生成）テストが作成されている
- [ ] `onBack` / `onGenerate` コールバックテストが作成されている
- [ ] 実装前にテストが失敗（RED）することを確認している
