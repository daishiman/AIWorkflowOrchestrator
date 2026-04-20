# Phase 5: 実装（Green）

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 5                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| タスク種別 | NON_VISUAL（UI変更なし）                                |
| 入力       | Phase 4 で追記したスタブテスト（Red 状態）              |

---

## 目的

TDD の Green フェーズとして、Phase 4 で作成したスタブテスト（TC-06相当・TC-07相当・保証点テスト）にテストコードを実装し、全テストを PASS させる。

**重要な制約**: このフェーズで変更するのはテストファイル（`SkillLifecyclePanel.auth-regression.test.tsx`）のみである。`SkillLifecyclePanel.tsx` 本体・`SessionResumePrompt.tsx` などのプロダクションコードには一切手を加えない。

## 実行タスク

以下の Step 1〜Step 4 を実行し、Red テストを GREEN 化する。

- rapid click / rerender / start-new の実装を追加する
- targeted run を通して `changed-files.md` に反映する

---

## 実装対象

| 対象ファイル                                                                                        | 作業内容                                                       |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | TC-06相当・TC-07相当・保証点テストのスタブにテストコードを実装 |

変更しないファイル（確認のみ）:

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`

---

## 実行手順

### Step 1: rapid click の再現（TC-06相当）

`userEvent` または `fireEvent.click()` を複数回連続で呼び出すことで rapid click を再現する。

**実装方針**:

- `@testing-library/user-event` の `userEvent.setup()` を使用し、`user.click(button)` を `await` で複数回実行する
- あるいは `fireEvent.click(button)` を同期的に連続呼び出しする（既存テストの `fireEvent` パターンに揃える）
- ボタンは `screen.getByTestId("skill-lifecycle-open-wizard-button")` で取得する
- 各クリックの間に `act` をかける必要がある場合は `act(async () => { ... })` でラップする

**実装例の骨格**:

```typescript
describe("TC-06: rapid click — onOpenSkillWizard を連続クリックしても auth:login が呼ばれないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.electronAPI.auth.login をスパイとして設定（既存設定を踏襲）
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("3回連続クリックしても auth:login が呼ばれないこと", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    const button = screen.getByTestId("skill-lifecycle-open-wizard-button");
    await act(async () => { fireEvent.click(button); });
    await act(async () => { fireEvent.click(button); });
    await act(async () => { fireEvent.click(button); });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("5回連続クリックしても auth:login が呼ばれないこと", async () => {
    // 同様に 5 回クリックして検証
  });
});
```

---

### Step 2: rerender の再現（TC-07相当）

`@testing-library/react` の `rerender()` API を使用して props 変更による再レンダリングを再現する。

**実装方針**:

- `render()` の戻り値から `rerender` を取得する
- `skillName` props を変更して `rerender()` を呼ぶ
- `onOpenWizard` props を差し替えて `rerender()` を呼ぶ
- `mockStoreState.isGenerating` を変更して `rerender()` を呼ぶ（store 状態変化のシミュレーション）
- 各 `rerender()` 後に `mockAuthLogin` が呼ばれていないことを `expect(...).not.toHaveBeenCalled()` で検証する

**実装例の骨格**:

```typescript
describe("TC-07: rerender — 再レンダリング時に auth:login が呼ばれないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = { ...defaultMockStoreState };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("skillName props 変更による rerender で auth:login が呼ばれないこと", async () => {
    const { rerender } = render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={vi.fn()}
        skillName="skill-a"
      />,
    );

    await act(async () => {
      rerender(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="skill-b"
        />,
      );
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("store 状態変化（isGenerating: false→true）による rerender で auth:login が呼ばれないこと", async () => {
    // mockStoreState.isGenerating を変更して rerender し検証
  });
});
```

---

### Step 3: onOpenSkillWizard / onOpenWizard 保証点テストの実装

wizard 起動ハンドラーが期待どおり呼ばれ、かつ `auth:login` が呼ばれないことを検証する。

**実装方針**:

- `onOpenSkillWizard` / `onOpenWizard` を `vi.fn()` でモックし、クリック後に `toHaveBeenCalledTimes(1)` で呼び出し回数を検証する
- 同時に `mockAuthLogin` が `not.toHaveBeenCalled()` であることを検証する

**実装例の骨格**:

```typescript
describe("AUTH-REGRESS-HANDLER-GUARANTEE: onOpenSkillWizard/onOpenWizard の auth:login 非混入保証", () => {
  it("onOpenSkillWizard ボタン押下時に onOpenSkillWizard が呼ばれ auth:login が呼ばれないこと", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard-button"));
    });

    expect(mockOnOpenSkillWizard).toHaveBeenCalledTimes(1);
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});
```

---

### Step 4: 全テスト実行と Green 確認

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

確認すべきテストケース一覧:

| テストID                                  | 期待結果               |
| ----------------------------------------- | ---------------------- |
| TC-01（既存）                             | PASS（回帰保護の維持） |
| TC-02（既存）                             | PASS                   |
| TC-04（既存）                             | PASS                   |
| TC-08（既存）                             | PASS                   |
| AUTH-REGRESS-RAPID-CLICK-06（3回）        | PASS                   |
| AUTH-REGRESS-RAPID-CLICK-06（5回）        | PASS                   |
| AUTH-REGRESS-RERENDER-07（skillName変更） | PASS                   |
| AUTH-REGRESS-RERENDER-07（store状態変化） | PASS                   |
| AUTH-REGRESS-HANDLER-GUARANTEE            | PASS                   |

---

### Step 5: 既存テスト全体の PASS 確認

```bash
pnpm --filter @repo/desktop test
```

- 既存の全テストが引き続き PASS していることを確認する
- 特に `SkillLifecyclePanel.test.tsx`（同コンポーネントの主テスト）が PASS していることを確認する

---

## 注意事項

- このフェーズでプロダクションコード（`SkillLifecyclePanel.tsx` 等）を変更してはならない
- `screen.getByTestId("skill-lifecycle-open-wizard-button")` が見つからない場合は、実際の `data-testid` 属性を `SkillLifecyclePanel.tsx` で確認して修正する（テストコードの修正のみ許可）
- `act` の警告が出る場合は、非同期処理を適切にラップして解消する
- `rerender` 後に状態が想定外になる場合は、`mockStoreState` の初期化タイミングを `beforeEach` で確認する

---

## 参照資料

| 参照資料                                 | パス                                                                                                | 内容                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 既存回帰テストファイル（Phase 4 で修正） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | Red 状態のスタブ（Green 化の対象）               |
| SkillLifecyclePanel 本体                 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | `data-testid` 属性の確認・props インターフェース |
| Testing Library ドキュメント             | https://testing-library.com/docs/react-testing-library/api/#rerender                                | `rerender()` API の使用方法                      |

---

## 成果物

| 成果物           | パス                               | 内容                                                             |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------- |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md` | 変更したファイルと変更内容の記録（テストファイルのみであること） |

---

## 統合テスト連携

**Phase 5 の統合テスト連携アクション**:

- TC-06相当・TC-07相当・保証点テストの GREEN 化により、rapid click・rerender 条件での `auth:login` 非発火が自動回帰テストとして保護される
- 既存テスト（TC-01/TC-02/TC-04/TC-08）の継続 PASS により、既存の回帰保護が壊れていないことを確認する
- `pnpm --filter @repo/desktop test` での全体実行により、テスト追加が他コンポーネントのテストに悪影響を与えていないことを確認する
- `outputs/phase-5/changed-files.md` によりプロダクションコードへの変更がなかったことを記録する

---

## 完了条件

- [ ] TC-06相当（rapid click）の全ケースが PASS している
- [ ] TC-07相当（rerender）の全ケースが PASS している
- [ ] 保証点テスト（AUTH-REGRESS-HANDLER-GUARANTEE）が PASS している
- [ ] 既存の TC-01/TC-02/TC-04/TC-08 が引き続き PASS している
- [ ] `pnpm --filter @repo/desktop test` 全体実行で既存テストが壊れていない
- [ ] `outputs/phase-5/changed-files.md` にテストファイルのみが記載されている
- [ ] プロダクションコード（`.tsx`・`.ts` の非テストファイル）への変更がないことを `git diff` で確認している

---

## タスク100%実行確認【必須】

1. 各スタブに対してテストコードを実装し、全ケースが PASS したことを確認したか
2. `git diff` でプロダクションコードへの変更がないことを確認したか
3. `pnpm --filter @repo/desktop test` 全体で既存テストが PASS していることを確認したか
4. `changed-files.md` にテストファイルのみが記載されていることを確認したか

---

## 次Phase

Phase 6（テスト拡充）へ進む。統合境界テストと境界条件・エッジケースを追加する。
