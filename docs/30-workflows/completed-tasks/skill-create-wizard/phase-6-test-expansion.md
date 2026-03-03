# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 6                   |
| Phase名    | テスト拡充          |
| 前提Phase  | Phase 5             |
| 後続Phase  | Phase 7             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |
| タスクID   | TASK-10A-C          |

---

## 目的

Phase 5 の実装完了後、テストカバレッジを目標値まで引き上げる。境界値テスト・異常系テスト・組み合わせテストを追加し、ウィザードの品質を確保する。

## 背景

実装が完了しテストが Green 状態になった。リファクタリングに進む前に、テストカバレッジを目標値まで引き上げ、Phase 8 リファクタリング時のリグレッション防止を担保する。

**重要制約（Phase 4 から継続）**:

- P39: `userEvent` 禁止、`fireEvent` を使用すること
- P40: `cd apps/desktop && pnpm vitest run` で実行（モノレポルートからは不可）
- P9: 各テストは `beforeEach` で完全独立

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### コンポーネント別テストカバレッジ目標

| コンポーネント    | 正常系 | 異常系 | 境界値 |
| ----------------- | ------ | ------ | ------ |
| SkillCreateWizard | 100%   | 80%+   | 100%   |
| DescribeStep      | 100%   | 80%+   | 100%   |
| ConfigureStep     | 100%   | 80%+   | -      |
| GenerateStep      | 100%   | 100%   | -      |
| CompleteStep      | 100%   | 80%+   | -      |
| StepIndicator     | 100%   | -      | 100%   |

---

## 実行タスク

- テスト拡充タスク: 境界値/異常系を追加しカバレッジ不足を解消する。

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測・分析

**目的**: 現在のカバレッジを計測し、不足箇所を特定する

**実行手順**:

1. カバレッジを計測する:

```bash
cd apps/desktop
pnpm vitest run --coverage src/renderer/components/skill/
```

2. カバレッジレポートを確認し、不足箇所を特定する

3. カバレッジ分析レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/coverage-analysis.md`

```markdown
## カバレッジ分析結果

### 現在のカバレッジ

| 指標              | 現在値 | 目標値 | 差分 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | XX%    | 80%    | -XX% |
| Branch Coverage   | XX%    | 60%    | -XX% |
| Function Coverage | XX%    | 80%    | -XX% |

### カバレッジ不足箇所

| コンポーネント | 未カバー箇所       | 優先度 |
| -------------- | ------------------ | ------ |
| DescribeStep   | スペース入力の分岐 | 高     |
| GenerateStep   | error=null 分岐    | 高     |
| ...            | ...                | ...    |
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/coverage-analysis.md`

---

### タスク2: DescribeStep の境界値テスト追加

**目的**: 入力バリデーションの境界値ケースをカバーする

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`

```typescript
// 追加テストケース例（既存 describe ブロックに追記）
describe("DescribeStep - 境界値テスト", () => {
  it("1文字の説明で「次へ」ボタンが enabled になる", () => {
    // description='a' のとき「次へ」が enabled なことを確認
  });

  it("スペースのみ（1文字）では「次へ」ボタンが disabled のまま", () => {
    // description=' ' のとき「次へ」が disabled なことを確認
  });

  it("タブ文字のみでは「次へ」ボタンが disabled のまま", () => {
    // description='\t' のとき「次へ」が disabled なことを確認
  });

  it("改行のみでは「次へ」ボタンが disabled のまま", () => {
    // description='\n' のとき「次へ」が disabled なことを確認
  });

  it("空白 + 有効テキスト + 空白でも「次へ」ボタンが enabled", () => {
    // description='  hello  ' のとき enabled なことを確認（trim後に有効）
  });

  it("非常に長い説明（1000文字以上）でも動作する", () => {
    // 1000文字の文字列で description を設定しても問題なく動作することを確認
  });

  it("日本語入力で動作する", () => {
    // 日本語テキストで onDescriptionChange が呼ばれることを確認（fireEvent 使用）
  });

  it("特殊文字（<script>等）を含む入力でも動作する", () => {
    // XSS的な文字列を入力してもテキストとして表示されることを確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`（拡充）

---

### タスク3: ConfigureStep の組み合わせテスト追加

**目的**: チェックボックスの全組み合わせと状態遷移をカバーする

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`

```typescript
// 追加テストケース例
describe("ConfigureStep - 組み合わせテスト", () => {
  it("全チェックボックスが ON のとき全て checked 表示される", () => {
    // options = { generateTasks: true, addAgents: true, addReferences: true }
    // 3つ全てが checked なことを確認
  });

  it("全チェックボックスが OFF のとき全て unchecked 表示される", () => {
    // options = { generateTasks: false, addAgents: false, addReferences: false }
    // 3つ全てが unchecked なことを確認
  });

  it("generateTasks を ON→OFF に変更すると正しい options が渡される", () => {
    // ON 状態から fireEvent.click でアンチェック → false に変わることを確認
  });

  it("addAgents を OFF→ON に変更すると他のオプションは変化しない", () => {
    // addAgents のみ変更され、他は変化しないことを確認
  });

  it("複数チェックボックスを順に変更しても最終状態が正確", () => {
    // 複数操作後の options が期待通りであることを確認
  });
});

describe("ConfigureStep - アクセシビリティ", () => {
  it("各チェックボックスにラベルが関連付けられている", () => {
    // label の htmlFor と input の id が対応しているか、または label で包んでいることを確認
  });

  it("キーボードでチェックボックスを操作できる", () => {
    // fireEvent.keyDown で Space キーを押してチェックできることを確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`（拡充）

---

### タスク4: GenerateStep の異常系テスト追加

**目的**: エラー表示の全パターンをカバーする

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`

```typescript
// 追加テストケース例
describe("GenerateStep - エラーパターン", () => {
  it("Error オブジェクトのメッセージが表示される", () => {
    // error=new Error('生成に失敗しました') のとき 'カスタムメッセージが表示されることを確認
  });

  it("message なし Error では fallback メッセージが表示される", () => {
    // error.message='' のとき「スキル生成に失敗しました」等の fallback が表示されることを確認
  });

  it("isGenerating=true かつ error がある場合の状態を確認", () => {
    // ローディング中にエラーがある場合（稀だが）の表示を確認
  });
});

describe("GenerateStep - ローディング詳細", () => {
  it("スピナー要素に role='status' が付与されている", () => {
    // aria 属性の確認
  });

  it("isGenerating=false かつ error=null のとき何も表示されない", () => {
    // 初期状態（遷移直前）や両方 false/null の場合に空表示を確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`（拡充）

---

### タスク5: CompleteStep の異常系テスト追加

**目的**: skillPath の null ケースやエッジケースをカバーする

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

```typescript
// 追加テストケース例
describe("CompleteStep - パス表示パターン", () => {
  it("非常に長いパスでも表示が崩れない", () => {
    // skillPath='/very/long/path/to/skill-name-with-many-characters' を渡して確認
  });

  it("パスに特殊文字が含まれても表示される", () => {
    // skillPath='/path/to/skill with spaces' や記号を含むパスを確認
  });

  it("skillPath='' (空文字) のときパス表示がない", () => {
    // 空文字では表示されないことを確認（null と同様の扱いを確認）
  });
});

describe("CompleteStep - アクセシビリティ", () => {
  it("完了メッセージが role='status' または aria-live で通知される", () => {
    // スクリーンリーダー向けアナウンスの確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`（拡充）

---

### タスク6: StepIndicator の境界値テスト追加

**目的**: ステップ数とインデックスの境界値をカバーする

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`

```typescript
// 追加テストケース例
describe("StepIndicator - 境界値テスト", () => {
  it("currentStep=3（最後のステップ）が正しくアクティブになる", () => {
    // 4ステップのうち最後（index=3）が active になることを確認
  });

  it("currentStep=3 のとき0〜2が completed になる", () => {
    // 全ての前ステップが completed になることを確認
  });

  it("currentStep=0 のとき1〜3が pending になる", () => {
    // 最初のステップだけ active で残りが pending であることを確認
  });

  it("stepStateStyles の各バリアントが Record 定数から正しく適用される", () => {
    // P47: export された stepStateStyles を import してアサーション
    // import { stepStateStyles } from "../StepIndicator"
    // expect(activeElement.className).toContain(stepStateStyles.active)
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`（拡充）

---

### タスク7: SkillCreateWizard の統合テスト拡充

**目的**: エラーフロー・戻るフロー・複数オプション設定フローを追加する

**実行手順**:

1. 既存のテストファイルに追加する:
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`

```typescript
// 追加テストケース例
describe("SkillCreateWizard - 拡充テスト", () => {
  describe("エラーリカバリーフロー", () => {
    it("IPC 失敗後も Step 3 に留まりエラーが表示される", async () => {
      // mockCreate を reject に設定 → エラー表示の確認
    });

    it("エラー表示後にウィザードが操作不能にならない", async () => {
      // エラー後の状態で他のボタンが操作可能なことを確認
    });
  });

  describe("オプション設定フロー", () => {
    it("Step 2 でオプションを変更して「スキルを生成」すると正しいオプションが IPC に渡される", async () => {
      // generateTasks=false に変更して生成 → mockCreate の引数を確認
    });

    it("全オプション OFF で生成しても IPC が呼ばれる", async () => {
      // 全チェックボックスを OFF にして「スキルを生成」 → mockCreate が呼ばれることを確認
    });
  });

  describe("説明の引き継ぎ", () => {
    it("Step 1 で入力した説明が Step 2 に引き継がれ IPC に渡される", async () => {
      // description='テスト説明' を入力 → 最終的に mockCreate の引数に含まれることを確認
    });

    it("Step 2 から Step 1 に戻ると説明が保持されている", () => {
      // 「戻る」後も description が textarea に残っていることを確認
    });
  });

  describe("アクセシビリティ統合テスト", () => {
    it("各ステップで適切な heading が表示される", () => {
      // h1 または aria-label でステップ名が識別できることを確認
    });

    it("キーボードで「次へ」ボタンにフォーカスできる", () => {
      // tabIndex またはデフォルトフォーカス順序でボタンにアクセスできることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（拡充）

---

### タスク8: IPC モックの詳細テスト追加

**目的**: IPC 呼び出しの詳細なパラメータ検証テストを追加する

**実行手順**:

1. SkillCreateWizard テストに追加する:

```typescript
describe("SkillCreateWizard - IPC パラメータ検証", () => {
  it("skill.create に description（trim前原文）が渡される", async () => {
    // 入力した生の description 文字列が create に渡されることを確認
    // （サーバー側の trim を信頼する）
  });

  it("skill.create に options オブジェクトが渡される", async () => {
    // { generateTasks: boolean, addAgents: boolean, addReferences: boolean } 形式で渡されることを確認
    // mockCreate.mock.calls[0][0] の構造を検証
  });

  it("skill.create が1回だけ呼ばれる（重複呼び出しなし）", async () => {
    // 「スキルを生成」を1回クリックして mockCreate が1回だけ呼ばれることを確認
  });

  it("IPC 完了後に生成されたパスが CompleteStep に渡される", async () => {
    // mockCreate が { path: '/custom/path' } を返した場合 CompleteStep に '/custom/path' が表示されることを確認
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（拡充）

---

### タスク9: カバレッジ再計測・確認

**目的**: カバレッジ目標達成を確認する

**実行手順**:

1. カバレッジを再計測する:

```bash
cd apps/desktop
pnpm vitest run --coverage src/renderer/components/skill/
```

2. 目標達成を確認し、カバレッジ最終レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md`

```markdown
## テスト拡充レポート

### カバレッジ達成状況

| 指標              | 拡充前 | 拡充後 | 目標値 | 達成 |
| ----------------- | ------ | ------ | ------ | ---- |
| Line Coverage     | XX%    | XX%    | 80%    | ✓/✗  |
| Branch Coverage   | XX%    | XX%    | 60%    | ✓/✗  |
| Function Coverage | XX%    | XX%    | 80%    | ✓/✗  |

### 追加テスト数

| コンポーネント    | 追加前 | 追加後 | 追加数 |
| ----------------- | ------ | ------ | ------ |
| SkillCreateWizard | XX     | XX     | XX     |
| DescribeStep      | XX     | XX     | XX     |
| ConfigureStep     | XX     | XX     | XX     |
| GenerateStep      | XX     | XX     | XX     |
| CompleteStep      | XX     | XX     | XX     |
| StepIndicator     | XX     | XX     | XX     |

### 未達箇所（目標未達の場合のみ）

| ファイル | 未カバー箇所 | 対応方針 |
| -------- | ------------ | -------- |
| ...      | ...          | ...      |
```

3. 未達の場合は追加テストを作成する（タスク2〜8を繰り返す）

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md`

---

## 実行手順

1. Phase 5 実装後のカバレッジレポートを確認し、不足箇所を特定する: `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/`
2. カバレッジ分析レポート（`outputs/phase-6/coverage-analysis.md`）を作成する
3. DescribeStep の境界値テスト（スペース・タブ・改行・長文・特殊文字）を追加する
4. ConfigureStep のチェックボックス全組み合わせテストを追加する
5. GenerateStep の全エラーパターンテストを追加する
6. SkillCreateWizard のエラーリカバリーフローテストを追加する
7. IPC パラメータ詳細検証テストを追加する
8. テストを実行し全件 PASS を確認する: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/`
9. テスト拡充レポート（`outputs/phase-6/test-expansion-report.md`）を作成する

---

## 参照資料

| 参照資料                 | パス                                                                                              | 内容                   |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 4 テスト仕様       | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-4-test-creation.md`                  | テストケース設計方針   |
| Phase 5 実装サマリー     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md` | 実装済みコンポーネント |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`       | P39,P47等              |
| コンポーネントテスト仕様 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                 | 拡充テスト設計基準     |
| 品質要件仕様             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       | カバレッジ目標の正本   |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                 | Skill API テスト観点   |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                                | カバレッジ基準         |

---

## 統合テスト連携

**Phase 6 での必須アクション**:

- [ ] DescribeStep の境界値テスト（スペース、タブ、改行の各バリエーション）を追加
- [ ] ConfigureStep の全チェックボックス組み合わせテストを追加
- [ ] GenerateStep の全エラーパターンテストを追加
- [ ] SkillCreateWizard のエラーリカバリーフローを追加
- [ ] IPC パラメータ詳細検証テストを追加

---

## 多角的チェック観点

- **P39 遵守**: 追加テストに `userEvent` が使われていないか（全て `fireEvent`）
- **P9 遵守**: 各テストが `beforeEach` でモックをリセットしているか
- **P47 適用**: CSS変数スタイルの検証に Record 定数 import を使っているか
- **テスト可読性**: テスト名から何を検証しているかが明確か
- **境界値網羅**: スペース・タブ・改行・空文字・null・undefined の各ケースを確認

---

## 成果物

| 成果物                           | パス                                                                                             | 内容             |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| カバレッジ分析                   | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/coverage-analysis.md`     | 初期カバレッジ   |
| DescribeStep テスト（拡充）      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`              | 境界値テスト追加 |
| ConfigureStep テスト（拡充）     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`             | 組み合わせテスト |
| GenerateStep テスト（拡充）      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`              | 異常系テスト追加 |
| CompleteStep テスト（拡充）      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`              | 異常系テスト追加 |
| StepIndicator テスト（拡充）     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`             | 境界値テスト追加 |
| SkillCreateWizard テスト（拡充） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 統合テスト拡充   |
| テスト拡充レポート               | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md` | カバレッジ最終値 |

---

## 完了条件

- [ ] カバレッジ分析レポートが作成されている
- [ ] DescribeStep の境界値テストが追加されている（P39: fireEvent 使用）
- [ ] ConfigureStep の組み合わせテストが追加されている
- [ ] GenerateStep の異常系テストが追加されている
- [ ] CompleteStep の異常系テストが追加されている
- [ ] StepIndicator の境界値テストが追加されている（P47: Record 定数使用）
- [ ] SkillCreateWizard のエラーリカバリー・IPC パラメータテストが追加されている
- [ ] Line Coverage 80%+ を達成している
- [ ] Branch Coverage 60%+ を達成している
- [ ] Function Coverage 80%+ を達成している
- [ ] テスト拡充レポートが作成されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（タスク1〜9）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（テストファイル拡充6本 + 分析レポート + 拡充レポート）が全て生成されていることを確認
- [ ] artifacts.json の Phase 6 ステータスを更新

---

## サブタスク管理

Phase 6 完了後に以下を確認:

- `cd apps/desktop && pnpm vitest run src/renderer/components/skill` で全テストが PASS
- カバレッジが Line 80%+, Branch 60%+, Function 80%+ を達成
- 追加テストの命名が `it("〜するとき〜になる", ...)` 形式で統一されている

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む
- **戻り**: カバレッジ未達の場合、タスク2〜8を繰り返す

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-7-coverage-check.md`
