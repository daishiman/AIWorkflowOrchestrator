# UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 - 実装ガイド

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 |
| Phase      | 12                                        |
| 作成日     | 2026-04-16                                |
| ステータス | completed                                 |

---

## Part 1: 概念説明（中学生レベル）

### describe.skip クリーンアップとは

`describe.skip` のクリーンアップとは、一時的に「とばす」印をつけていたテストを整理することです。

たとえば、学校のテストで「この問題は後で解く」と印をつけてとばしたまま提出してしまった状態が
`describe.skip` です。テストを提出する前に、「とばした問題をちゃんと解くか、削除するか」を決めて
きれいにするのがこのクリーンアップ作業です。

なぜ整理する必要があるかというと、とばしたままのテストは「本当にちゃんと動くかどうか確認できていない」
状態が続いてしまうからです。コードが変わっても気づけなくなってしまいます。

今回は古いフローのテスト（`SkillCreateWizard.llm-generation.test.tsx`）が
すでに削除されていたため、「削除済みを確認して残存参照がないことを記録する」作業が主になりました。
新しいフロー（`createSkill` ベース）のテストは別のファイルで 43 件すべてが動いています。

---

## Part 2: 技術詳細

### 対象タスクの概要

- **タスク種別**: CLEANUP / NON_VISUAL
- **変更範囲**: テストファイルのみ（プロダクションコード変更なし）
- **採用方針**: 選択肢A（削除済み確認）

### Before / After

#### Before（旧フロー: TASK-SC-07 時点）

```typescript
// SkillCreateWizard.llm-generation.test.tsx（削除済み）
describe.skip("LLM生成フロー - generationMode 選択", () => {
  it("ラジオボタンで LLM モードを選択できる", async () => {
    // generationMode ラジオボタンを操作（存在しない UI 要素）
    fireEvent.click(screen.getByRole("radio", { name: "LLMで生成" }));
    // ...
  });
});
```

#### After（現行フロー: W2-seq-03a 以降）

```typescript
// SkillCreateWizard.test.tsx（現行・43 件すべて PASS）
describe("TASK-SW-FIX-MODE-MGMT-001: LLM専用フロー検証", () => {
  it("TC-01: Step 0にラジオボタン（テンプレートから作成/LLMで生成）が表示されないこと", () => {
    render(<SkillCreateWizard {...defaultProps} />);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
```

### describe.skip クリーンアップパターン

| パターン | 内容                                                          | 適用条件                                       |
| -------- | ------------------------------------------------------------- | ---------------------------------------------- |
| 選択肢A  | ファイルごと削除                                              | 旧フロー依存テストが復元不要な場合             |
| 選択肢B  | エッジケースを新フロー API に書き直して companion test へ移植 | エッジケースが新フローでカバーされていない場合 |

### createSkill モックパターン（現行フロー）

```typescript
// モックのセットアップ
const mockCreateSkill = vi.fn();
vi.mock("@/renderer/hooks/useCreateSkill", () => ({
  useCreateSkill: () => mockCreateSkill,
}));

beforeEach(() => {
  mockCreateSkill.mockResolvedValue("/mock/skills/new-skill");
});

// エラーケース（F-3 相当）
mockCreateSkill.mockRejectedValue(new Error("生成失敗"));

// 空文字フォールバック（F-2 相当）
mockCreateSkill.mockResolvedValue("");
```

### generationLockRef による競合防止（W-8b 相当）

```typescript
// SkillCreateWizard.tsx
const generationLockRef = useRef(false);

const handleGenerate = async (method: "complete" | "skip") => {
  if (generationLockRef.current || isGenerating) {
    return; // 二重起動ガード
  }
  generationLockRef.current = true;
  try {
    // 生成処理
  } finally {
    generationLockRef.current = false; // E-4 相当: 必ず解放
  }
};
```

### TypeScript 型定義

```typescript
// SkillCreateWizard.tsx で使用される型
type GenerationMethod = "complete" | "skip";
type WizardStep = 0 | 1 | 2 | 3;
```

### カバレッジ結果

| 指標       | 実測値 | 最低基準 | 判定 |
| ---------- | ------ | -------- | ---- |
| Statements | 95.77% | 80%      | PASS |
| Branch     | 82.56% | 60%      | PASS |
| Functions  | 95.45% | 80%      | PASS |
| Lines      | 95.77% | 80%      | PASS |
