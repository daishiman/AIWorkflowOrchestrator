# 実装ガイド: ExecutionEnvironment.terminal 本実装 + assertNoSilentFallback

## Part 1: 中学生レベル概念説明

### これは何をするもの？

AI にお願いするとき、「どの AI に頼むか」を選ばないといけません。例えるなら、飲食店で注文するときと同じです。

#### 飲食店の例え

- **`assertNoSilentFallback`** = 注文を取る前に「何を注文するか決めましたか？」と確認する店員
  - 決まっていないのに勝手に料理を出したら困りますよね
- **`DEFAULT_CONFIG` への暗黙 fallback** = 注文を聞かずに勝手にカレーを出すこと（NG）
  - お客さんは何も頼んでいないのに、勝手にカレーが来る = 使うつもりがない AI が動いてしまう
- **`LLMConfigNotSelectedError`** = 「まだ注文が決まっていません」というお客さんへの丁寧な案内
  - エラーで止まるのではなく、「設定画面で選んでね」と教えてくれる

#### なぜ必要か？

AI に何かお願いするとき、「OpenAI の GPT-4o」とか「Anthropic の Claude」のように、どの AI を使うかを先に選ぶ必要があります。選んでいないのに勝手に動くと、意図しない AI が使われて困ります。

#### 何をするか？

「まだ選んでいないよ」という状態を検出して、ユーザーに「先に選んでね」と教える仕組みを作りました。

---

## Part 2: 技術者向け実装詳細

### 1. assertNoSilentFallback() インターフェース仕様

```typescript
export function assertNoSilentFallback(): SelectedLLMConfig;
```

- **配置**: `apps/desktop/src/main/ipc/llmConfigProvider.ts`
- **責務**: `currentConfig` が `null` の場合に `LLMConfigNotSelectedError` を throw
- **戻り値**: `SelectedLLMConfig`（non-null 保証）
- **同期関数**: in-memory 変数のチェックのみ。非同期にする理由なし（NFR-1）

### 2. LLMConfigNotSelectedError エラー型

```typescript
export class LLMConfigNotSelectedError extends Error {
  readonly code = "LLM_CONFIG_NOT_SELECTED" as const;
  constructor(message: string);
}
```

- `instanceof` で判別可能
- `code` プロパティでプログラム的に識別可能
- エラーメッセージはユーザー向け文言（内部パス等を含まない）

### 3. ExecutionEnvironment.terminal Props 拡張

```typescript
export interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  handoffGuidance?: HandoffGuidance | null; // NEW
  onRefresh?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

- `handoffGuidance` が `null` / `undefined` の場合: 待機中 Placeholder を表示
- `handoffGuidance` が有効な場合: `TerminalHandoffCard` を表示

### 4. テストケース一覧

| ID   | テストケース                          | ファイル                       |
| ---- | ------------------------------------- | ------------------------------ |
| T-1  | config null 時の throw                | assertNoSilentFallback.test.ts |
| T-2  | config 設定時の返却                   | assertNoSilentFallback.test.ts |
| T-3  | エラーコード検証                      | assertNoSilentFallback.test.ts |
| T-4  | instanceof 判定                       | assertNoSilentFallback.test.ts |
| T-5  | エラーメッセージ文言                  | assertNoSilentFallback.test.ts |
| T-6  | setSelectedLLMConfig 後の返却         | assertNoSilentFallback.test.ts |
| T-7  | resetLLMConfig 後の throw             | assertNoSilentFallback.test.ts |
| T-8  | terminal + guidance あり              | terminal.test.tsx              |
| T-9  | terminal + guidance null              | terminal.test.tsx              |
| T-10 | terminal + guidance undefined         | terminal.test.tsx              |
| T-11 | guidance props の渡り確認             | terminal.test.tsx              |
| T-12 | html 環境への影響なし                 | terminal.test.tsx              |
| T-13 | setSelectedLLMConfig(null) 後の throw | assertNoSilentFallback.test.ts |
| T-14 | 複数回 set/reset シーケンス           | assertNoSilentFallback.test.ts |
| T-15 | エラー name プロパティ                | assertNoSilentFallback.test.ts |
| T-16 | html に guidance 渡しても無視         | terminal.test.tsx              |
| T-17 | none のデフォルト動作維持             | terminal.test.tsx              |
| T-18 | 詳細 guidance フィールド確認          | terminal.test.tsx              |

### 5. 影響範囲分析

| ファイル                                                                         | 変更種別                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                 | 追加（assertNoSilentFallback + LLMConfigNotSelectedError） |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/index.tsx`                   | 変更（terminal case: placeholder → 本実装）                |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/__tests__/index.test.tsx`    | 変更（terminal テストを本実装に合わせて更新）              |
| `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`             | 新規（10ケース）                                           |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/__tests__/terminal.test.tsx` | 新規（8ケース）                                            |
