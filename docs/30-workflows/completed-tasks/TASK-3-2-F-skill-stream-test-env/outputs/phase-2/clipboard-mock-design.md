# Clipboard APIモック設計書 - TASK-3-2-F Phase 2

## モック対象

- `navigator.clipboard.writeText` - クリップボードへのテキスト書き込み
- `navigator.clipboard.readText` - クリップボードからのテキスト読み取り（補助的）

## モック配置場所

**テストセットアップファイル（グローバルモック）**: `apps/desktop/src/test/setup.ts`

理由:

- 複数テストファイル（4ファイル）でClipboard APIを使用するため、グローバルモックが効率的
- テストセットアップファイルは全テスト実行前に読み込まれるため、一貫したモック環境を提供
- 各テストファイルでの個別モック設定が不要になり、DRY原則に準拠

## モック実装設計

### setup.ts に追加するコード

```typescript
// Clipboard API モック（jsdom環境用）
// jsdom環境ではnavigator.clipboardがundefinedのため、グローバルモックを設定
if (typeof navigator !== "undefined" && !navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
    writable: true,
    configurable: true,
  });
}
```

### 各テストファイル内のモック（既存）

各テストファイル内にも`beforeEach`でClipboard APIモックが定義されている。既存のモック定義はテスト固有のモック振る舞い（例: エラーケース）を設定するために維持する。

```typescript
// 既存のテストファイル内モック（例: SkillStreamDisplay.test.tsx L974-982）
beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
    configurable: true,
  });
});
```

## モックリセット戦略

1. **グローバルモック（setup.ts）**: テスト実行前に1回設定。`vi.fn()`による基本動作（成功レスポンス）を提供。
2. **テストファイル内モック（beforeEach）**: 各テストケース前にリセット。テスト固有の振る舞い（エラー発生等）を設定。
3. **afterEach**: `vi.restoreAllMocks()` で全モックをリセット（既存のafterEach処理に統合）。

## 動作フロー

```
1. setup.ts実行 → navigator.clipboard グローバルモック設定
2. テストファイルロード
3. beforeEach実行 → テスト固有のモック設定（必要な場合）
4. テスト実行 → navigator.clipboard.writeText() 呼び出し
5. afterEach実行 → モックリセット
```

## エラーケーステスト対応

TC-R3-7（should handle clipboard API error gracefully）では、`writeText`がrejectedになるケースをテストする。このテストでは`beforeEach`内で以下のようにモックを上書きする:

```typescript
test("should handle clipboard API error gracefully", async () => {
  vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
    new Error("Clipboard write failed"),
  );
  // テスト処理
});
```
