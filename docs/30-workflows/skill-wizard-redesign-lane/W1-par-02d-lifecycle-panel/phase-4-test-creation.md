# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| Phase名    | テスト作成                                               |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 3: 設計レビュー                                    |
| 次Phase    | Phase 5: 実装                                            |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

実装前にテストを作成し（TDD）、SkillLifecyclePanel の新しい振る舞いを仕様として固定し、削除要素が存在しないことを保証する。

## 実行タスク

### Task 1: 既存テストファイルの確認

```bash
# 既存テストの確認
rg --files apps/desktop/src | rg "SkillLifecyclePanel.*(test|spec)\\.(tsx|ts)$"

# 削除予定の data-testid を参照しているテストを確認
rg -n "skill-lifecycle-request-input|skill-lifecycle-create-button|skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx
```

対象は 1 ファイルではなく、`SkillLifecyclePanel*.test.tsx` の分割スイート全体とする。  
旧 selector を参照するテストは「移行」ではなく、削除対象の機能に紐づくケースなら削除、残すべき回帰は新しい selector へ置換する。

### Task 2: 既存テストの更新方針

削除予定の data-testid を参照しているテストを特定し、以下の方針で更新する:

| テスト種別                                              | 更新方針               |
| ------------------------------------------------------- | ---------------------- |
| `skill-lifecycle-request-input` を参照するテスト        | テストケースを削除する |
| `skill-lifecycle-create-button` を参照するテスト        | テストケースを削除する |
| `skill-lifecycle-prepare-button` を参照するテスト       | テストケースを削除する |
| `handleCreate` / `handlePrepare` の動作を検証するテスト | テストケースを削除する |

### Task 3: 新規テストケースの作成

対象ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx`（既存スイート全体）

#### 3-1. ウィザードボタンの存在確認テスト

```typescript
describe("SkillLifecyclePanel - ウィザード遷移化", () => {
  describe("ウィザードボタンの表示", () => {
    it("ウィザードボタンがdata-testidで取得できる", () => {
      // render(<SkillLifecyclePanel onClose={vi.fn()} onOpenSkillWizard={vi.fn()} />)
      // screen.getByTestId("skill-lifecycle-open-wizard-button") が存在する
    });

    it("ウィザードボタンに正しいテキストが表示される", () => {
      // 「スキル作成ウィザードを開く →」が表示される
    });

    it("ウィザードボタンクリックでonOpenSkillWizardが呼ばれる", async () => {
      const onOpenSkillWizard = vi.fn();
      // skill-lifecycle-open-wizard-button クリック → onOpenSkillWizard() が1回呼ばれる
    });
  });
```

#### 3-2. 削除要素の非存在確認テスト

```typescript
describe("削除要素の非存在確認", () => {
  it("テキストエリアが存在しない", () => {
    // queryByTestId("skill-lifecycle-request-input") が null
  });

  it("「スキルを生成する」ボタンが存在しない", () => {
    // queryByTestId("skill-lifecycle-create-button") が null
  });

  it("「方針を決める」ボタンが存在しない", () => {
    // queryByTestId("skill-lifecycle-prepare-button") が null
  });
});
```

#### 3-3. 既存機能の保持確認テスト

```typescript
  describe("既存機能の保持確認", () => {
    it("onCloseが正しく渡せる", () => {
      const onClose = vi.fn();
      // onClose props が受け付けられる（TypeScript型エラーなし）
    });

    it("セクション見出し「1. スキルを作成する」が表示される", () => {
      // 「1. スキルを作成する」テキストが存在する
    });

    it("説明テキストが表示される", () => {
      // 「スキルの目的・機能・連携ツールをガイドに沿って設定し」テキストが存在する
    });
  });
});
```

### Task 4: テストユーティリティの準備

```typescript
// テスト用デフォルトProps
const defaultProps = {
  onClose: vi.fn(),
  onOpenSkillWizard: vi.fn(),
};

const renderPanel = (props?: Partial<typeof defaultProps>) =>
  render(<SkillLifecyclePanel {...defaultProps} {...props} />);
```

### Task 5: テスト実行（RED確認）

実装前にテストを実行し、失敗（RED）することを確認する。

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel
```

## 参照資料

| 資料名   | パス                               | 説明         |
| -------- | ---------------------------------- | ------------ |
| 設計書   | `outputs/phase-2/design.md`        | テスト根拠   |
| レビュー | `outputs/phase-3/design-review.md` | 確認済み設計 |

## 成果物

| 成果物           | パス                                                                                 | 説明               |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------ |
| テストファイル   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | TDDテスト一式      |
| テストマトリクス | `outputs/phase-4/test-matrix.md`                                                     | テストケース対応表 |

## 完了条件

- [ ] 既存テストの更新方針が確定している
- [ ] ウィザードボタンがdata-testidで取得できるテストが記述されている
- [ ] テキストエリアが存在しないことのテストが記述されている
- [ ] 「スキルを生成する」ボタンが存在しないことのテストが記述されている
- [ ] 「方針を決める」ボタンが存在しないことのテストが記述されている
- [ ] onOpenSkillWizardの呼び出しテストが記述されている
- [ ] 既存機能（onClose等）の保持確認テストが記述されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
