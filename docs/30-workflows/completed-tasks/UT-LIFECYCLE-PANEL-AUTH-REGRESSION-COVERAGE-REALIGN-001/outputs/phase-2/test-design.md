# test-design.md

## 責務境界テーブル確定版

| 導線                             | 責務区分 | テスト種別 | 理由                                                     |
| -------------------------------- | -------- | ---------- | -------------------------------------------------------- |
| onOpenSkillWizard 呼び出し時     | 単体     | 単体テスト | モック境界内コールバック。wizard 内部に依存しない        |
| onOpenWizard 呼び出し時          | 単体     | 単体テスト | モック境界内コールバック。wizard 内部に依存しない        |
| handleSessionStartNew 呼び出し時 | 単体     | 単体テスト | SkillLifecyclePanel 内部関数。ipc モックで検証可能       |
| rapid click 時の非発火           | 単体     | 単体テスト | コンポーネントのイベントハンドラ重複防止は単体で検証可能 |
| rerender 時の非発火              | 単体     | 単体テスト | useEffect 依存配列の副作用は単体で検証可能               |
| wizard 起動先での auth 非混入    | 統合     | 統合テスト | wizard コンポーネントの内部実装に依存するため統合テスト  |
| session resume フロー全体        | 統合     | 統合テスト | SessionResumePrompt との連携を含むため統合テスト         |
| authModeSlice.setMode() の契約   | 単体     | 単体テスト | Redux スライスのアクション。TC-08 が担保                 |

## テストファイル構造設計

追加先: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

### 追加ブロック構成

```
describe('SkillLifecyclePanel auth regression')
  // 既存テスト（TC-01, TC-02, TC-04, TC-08）
  ...

  describe("TC-06: rapid click — onOpenSkillWizard を連続クリックしても auth:login が呼ばれないこと")
    it("3回連続クリックしても auth:login が呼ばれないこと")
    it("5回連続クリックしても auth:login が呼ばれないこと")

  describe("TC-07: rerender — 再レンダリング時に auth:login が呼ばれないこと")
    it("skillName props 変更による rerender で auth:login が呼ばれないこと")
    it("onOpenWizard props 変更による rerender で auth:login が呼ばれないこと")
    it("store 状態変化（isGenerating: false→true）による rerender で auth:login が呼ばれないこと")

  describe("AUTH-REGRESS-HANDLER-GUARANTEE: onOpenSkillWizard/onOpenWizard の auth:login 非混入保証")
    it("onOpenSkillWizard ボタン押下時に onOpenSkillWizard が呼ばれ auth:login が呼ばれないこと")
    it("onOpenWizard ボタン押下時に onOpenWizard が呼ばれ auth:login が呼ばれないこと")
```

## テストIDの採番規則

既存 TC 番号との重複を避けるため:

- `AUTH-REGRESS-RAPID-CLICK-06`: TC-06 相当の rapid click テスト群
- `AUTH-REGRESS-RERENDER-07`: TC-07 相当の rerender テスト群
- `AUTH-REGRESS-HANDLER-GUARANTEE`: handler 非発火保証テスト群

## モック戦略

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  (window as Window & { electronAPI?: unknown }).electronAPI = {
    auth: { login: mockAuthLogin },
  };
});
afterEach(() => {
  cleanup();
});
```

既存の `mockStoreState` / `vi.mock("../../../store", ...)` を再利用する。
