# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 3: 設計レビュー                     |
| 次Phase    | Phase 5: 実装                             |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

実装前にテストを作成し（TDD）、CompleteStep の振る舞いを仕様として固定する。

## 実行タスク

### Task 1: テストファイルの作成

対象ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

### Task 2: テストケース一覧

#### 2-1. レンダリング基本テスト

```typescript
describe("CompleteStep", () => {
  describe("基本レンダリング", () => {
    it("完了ヘッダーが表示される", () => {
      // data-testid="complete-step-header" が存在する
      // 「スキルの骨格を生成しました」テキストが含まれる
    });

    it("👍フィードバックボタンが表示される", () => {
      // data-testid="complete-step-feedback-satisfied" が存在する
    });

    it("👎フィードバックボタンが表示される", () => {
      // data-testid="complete-step-feedback-unsatisfied" が存在する
    });

    it("ネクストアクション3カードが全て表示される", () => {
      // complete-step-action-execute が存在する
      // complete-step-action-open-editor が存在する
      // complete-step-action-create-another が存在する
    });

    it("generatedSkill が null でもレンダリングできる", () => {
      // generatedSkill=null で renderCompleteStep() → エラーなし
    });
  });
```

#### 2-2. 品質フィードバックテスト

```typescript
describe("品質フィードバック", () => {
  it("👍クリックでonQualityFeedback(true)が呼ばれる", async () => {
    const onQualityFeedback = vi.fn();
    // 👍ボタンクリック → onQualityFeedback(true) が1回呼ばれる
  });

  it("👎クリックでonQualityFeedback(false)が呼ばれる", async () => {
    const onQualityFeedback = vi.fn();
    // 👎ボタンクリック → onQualityFeedback(false) が1回呼ばれる
  });

  it("👎クリックでonRetryが呼ばれる", async () => {
    const onRetry = vi.fn();
    // 👎ボタンクリック → onRetry() が呼ばれる
  });

  it("フィードバック送信後は二重送信されない", async () => {
    const onQualityFeedback = vi.fn();
    // 👍を2回クリックしても onQualityFeedback は1回のみ呼ばれる
  });
});
```

#### 2-3. ネクストアクションカードテスト

```typescript
describe("ネクストアクションカード", () => {
  it("「今すぐ実行する」カードクリックでonExecuteNowが呼ばれる", async () => {
    const onExecuteNow = vi.fn();
    // complete-step-action-execute クリック → onExecuteNow() が呼ばれる
  });

  it("「エディタで開く」カードクリックでonOpenInEditorが呼ばれる", async () => {
    const onOpenInEditor = vi.fn();
    // complete-step-action-open-editor クリック → onOpenInEditor() が呼ばれる
  });

  it("「別のスキルを作る」カードクリックでonCreateAnotherが呼ばれる", async () => {
    const onCreateAnother = vi.fn();
    // complete-step-action-create-another クリック → onCreateAnother() が呼ばれる
  });

  it("onExecuteNowが未指定の場合カードがdisabledになる", () => {
    // onExecuteNow=undefined → complete-step-action-execute が disabled
  });
});
```

#### 2-4. 外部連携チェックリストテスト

```typescript
  describe("外部連携チェックリスト", () => {
    it("hasExternalIntegration=trueの場合チェックリストが表示される", () => {
      // data-testid="complete-step-external-checklist" が存在する
    });

    it("hasExternalIntegration=falseの場合チェックリストが非表示", () => {
      // data-testid="complete-step-external-checklist" が存在しない
    });

    it("Webhookチェックボックスをクリックでトグルできる", async () => {
      // complete-step-check-webhook クリック → checked状態が変わる
    });

    it("設定ボタンは表示されない", () => {
      // 「今すぐ設定」ボタンが存在しない
    });
  });
});
```

### Task 3: テストユーティリティの準備

```typescript
// テスト用デフォルトProps
const defaultProps: CompleteStepProps = {
  generatedSkill: null,
  hasExternalIntegration: false,
  onQualityFeedback: vi.fn(),
};

// レンダリングヘルパー
const renderCompleteStep = (props?: Partial<CompleteStepProps>) =>
  render(<CompleteStep {...defaultProps} {...props} />);
```

## 参照資料

| 資料名   | パス                               | 説明         |
| -------- | ---------------------------------- | ------------ |
| 設計書   | `outputs/phase-2/design.md`        | テスト根拠   |
| レビュー | `outputs/phase-3/design-review.md` | 確認済み設計 |

## 成果物

| 成果物           | パス                                                                                | 説明               |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------ |
| テストファイル   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | TDDテスト一式      |
| テストマトリクス | `outputs/phase-4/test-matrix.md`                                                    | テストケース対応表 |

## 完了条件

- [ ] テストファイルが作成されている
- [ ] 基本レンダリングテストが記述されている
- [ ] 👍/👎フィードバックテストが記述されている
- [ ] ネクストアクション3カードのテストが記述されている
- [ ] 外部連携チェックリストの条件付き表示テストが記述されている
- [ ] リカバリーフロー（👎→onRetry）のテストが記述されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
