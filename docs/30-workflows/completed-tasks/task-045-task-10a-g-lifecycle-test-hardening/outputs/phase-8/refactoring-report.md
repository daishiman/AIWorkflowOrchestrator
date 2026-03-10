# Phase 8: リファクタリングレポート

## 実施日

2026-03-10

## 対象ファイル

| ファイル                                                                                       | テスト数（前後不変） |
| ---------------------------------------------------------------------------------------------- | -------------------- |
| G1: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 14                   |
| G2: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 21                   |
| G3: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 17                   |
| **合計**                                                                                       | **52**               |

## リファクタリング内容

### Task 1: テストヘルパー抽出

#### G1: `expectHandlerError` ヘルパー関数の抽出

G1-VAL（6件）、G1-ERR（3件）、G1-SEC-1（1件）で繰り返されていた try/catch + エラーコード検証パターンを `expectHandlerError()` ヘルパー関数に抽出した。

**変更前**: 各テストケースに 7-9 行の try/catch ブロックが重複（合計10箇所）

```typescript
// 変更前: 10箇所で繰り返されていたパターン
try {
  await handler(mockEvent, ...args);
  throw new Error("Expected XXX to be thrown");
} catch (error) {
  expect((error as { code: string }).code).toBe("XXX");
  expect((error as { message: string }).message).toBe("...");
}
```

**変更後**: 共通ヘルパーによる1行呼び出し

```typescript
// 変更後: ヘルパー関数で統一
async function expectHandlerError(
  args: unknown[],
  expectedCode: string,
  messageAssertion?: (message: string) => void,
): Promise<void> { ... }

// 使用例
await expectHandlerError(
  [undefined, VALID_OPTIONS],
  "VALIDATION_ERROR",
  (msg) => expect(msg).toBe(DESCRIPTION_ERROR_MSG),
);
```

**効果**: 重複コード約70行を削減。エラー検証ロジックの一元化。

#### G2/G3: ヘルパー抽出不要

G2 は `setupMockElectronAPI()` / `getSkillAPI()` が既に存在し、十分に整理されていた。G3 は `setStoreState()` ヘルパーが既に存在し、追加のヘルパー抽出は不要だった。

### Task 2: テストデータファクトリ

#### G1: 定数命名のPascalCase統一

- `validDescription` -> `VALID_DESCRIPTION`（テスト定数のため UPPER_SNAKE_CASE に統一）
- `validOptions` -> `VALID_OPTIONS`（同上）
- VAL describe内に `DESCRIPTION_ERROR_MSG` / `OPTIONS_ERROR_MSG` エラーメッセージ定数を新設

#### G2: `DEFAULT_CREATE_OPTIONS` 定数の抽出

5箇所で繰り返されていた `{ generateTasks: true, addAgents: false, addReferences: false }` オブジェクトリテラルを `DEFAULT_CREATE_OPTIONS` 定数に抽出した。

**効果**: テストオプション変更時の修正箇所を5箇所 -> 1箇所に集約。

#### G3: 変更不要

`defaultStoreState` が既にヘルパーレベルで定義済み。

### Task 3: テスト構造最適化

3ファイルとも describe/it 構造がカテゴリ（VAL/DEL/ERR/SEC/CL/LA/AI/SD/INT/ISO/GUARD）ごとに適切に整理されており、構造変更は不要だった。

### Task 4: 命名規則統一

全テストケース名が既に「G1-VAL-1: 条件 -> 期待結果」形式で統一されており、変更不要だった。

### Task 5: マジックナンバー除去

G1-VAL の繰り返しエラーメッセージ文字列を `DESCRIPTION_ERROR_MSG` / `OPTIONS_ERROR_MSG` 定数に抽出した。

## テスト数検証

```
# リファクタリング前
G1: 14, G2: 21, G3: 17 (合計: 52)

# リファクタリング後
G1: 14, G2: 21, G3: 17 (合計: 52)
```

テスト数不変を `grep -c "it("` で確認済み。

## リファクタリング後のテスト結果

```
Test Files  3 passed (3)
     Tests  52 passed (52)
  Duration  3.36s
```

全52テストがGreen。
