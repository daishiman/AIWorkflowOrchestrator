# ファクトリーの型安全性改善 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-001            |
| タスク名     | ファクトリーの型安全性改善    |
| 分類         | 改善                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 低                            |
| 見積もり規模 | 小規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 7: 最終レビューゲート   |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7の最終レビューにおいて、arch-policeエージェントから型安全性の改善提案が出された。

現在のEmbeddingProviderFactoryは、switch文のdefaultケースで単純にエラーをスローしているが、これでは新しいプロバイダー型を追加した際にコンパイル時に実装漏れを検出できない。

### 1.2 問題点・課題

**現在の実装の問題**:

- 新しいプロバイダー型（例: 'voyage'）を型定義に追加
- ファクトリーの更新を忘れる
- コンパイルエラーにならない
- ランタイムまで問題が発覚しない

**具体例**:

```typescript
// 型定義に'voyage'を追加
export type ProviderName = 'openai' | 'qwen3' | 'voyage';

// ファクトリーの更新を忘れる（コンパイルエラーにならない）
static create(name: ProviderName) {
  switch (name) {
    case 'openai': return new OpenAIProvider();
    case 'qwen3': return new Qwen3Provider();
    // 'voyage'のケースがない！でもエラーにならない
    default: throw new Error('Unknown');
  }
}
```

### 1.3 放置した場合の影響

**短期的影響**:

- 新しいプロバイダー追加時にバグが混入しやすい
- ランタイムエラーによる本番障害のリスク

**中長期的影響**:

- 保守性の低下
- プロバイダー追加のたびに全ケースを手動確認する必要
- 技術的負債の蓄積

**影響度**: 低（現時点では2プロバイダーのみで安定しているが、将来の拡張時に問題化）

---

## 2. 何を達成するか（What）

### 2.1 目的

EmbeddingProviderFactoryにexhaustive checkパターンを適用し、新しいプロバイダー追加時にコンパイルエラーで実装漏れを自動検出できるようにする。

### 2.2 最終ゴール

- 新しいProviderName型を追加した時点で、ファクトリーに未対応のケースがあればTypeScriptコンパイラがエラーを出す
- 開発者がIDEで即座に実装漏れに気づける
- 型システムによる静的検査でランタイムエラーを防止

### 2.3 スコープ

#### 含むもの

- ✅ exhaustive-check.tsヘルパー関数の作成
- ✅ EmbeddingProviderFactoryへのassertNever適用
- ✅ ユニットテストの追加
- ✅ エクスポートの追加

#### 含まないもの

- ❌ ChunkingStrategyFactoryへの適用（別タスクとして実施可能）
- ❌ 他のファクトリークラスへの適用
- ❌ 既存プロバイダーの変更

### 2.4 成果物

1. `packages/shared/src/services/embedding/utils/exhaustive-check.ts`
2. 修正された`embedding-provider-factory.ts`
3. `packages/shared/src/services/embedding/utils/__tests__/exhaustive-check.test.ts`
4. 更新された`packages/shared/src/services/embedding/index.ts`（エクスポート追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `packages/shared/src/services/embedding/factory/embedding-provider-factory.ts` が存在すること
- [ ] TypeScript 5.x環境が整っていること
- [ ] 既存のテストが全て通過していること（104/104）
- [ ] `pnpm typecheck` が通過していること

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識・スキル

- TypeScript の never 型の理解
- exhaustive checkパターンの理解
- ファクトリーパターンの理解
- Vitest によるユニットテスト作成

### 3.4 推奨アプローチ

1. 小さいヘルパー関数から作成（exhaustive-check.ts）
2. テストファーストで実装（TDD）
3. 既存のファクトリーを段階的に修正
4. 型チェックとテストで検証

---

## 4. 実行手順

### Phase構成

```
Phase 1: ヘルパー関数作成
Phase 2: テスト作成
Phase 3: ファクトリー修正
Phase 4: 検証
```

### Phase 1: exhaustive checkヘルパー関数作成

#### 目的

never型を受け取り、実行時エラーを投げるヘルパー関数を作成

#### 実行手順

**Step 1**: ファイル作成

`packages/shared/src/services/embedding/utils/exhaustive-check.ts`

```typescript
/**
 * Exhaustive check pattern helper
 *
 * switch文で全ケースを網羅していない場合、コンパイルエラーとなる
 *
 * @param value - 想定されないnever型の値
 * @throws Error - 実行時にこの関数が呼ばれた場合
 *
 * @example
 * switch (providerName) {
 *   case 'openai': return new OpenAIProvider();
 *   case 'qwen3': return new Qwen3Provider();
 *   default: return assertNever(providerName); // 未対応の型があればコンパイルエラー
 * }
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
```

#### 成果物

- ✅ `exhaustive-check.ts`

#### 完了条件

- [ ] ファイルが作成されている
- [ ] JSDocコメントが記載されている
- [ ] 型定義が正しい（引数: never, 戻り値: never）

### Phase 2: テスト作成

#### 目的

exhaustive-check関数のユニットテストを作成

#### 実行手順

**Step 1**: テストファイル作成

`packages/shared/src/services/embedding/utils/__tests__/exhaustive-check.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { assertNever } from "../exhaustive-check";

describe("exhaustive-check", () => {
  describe("assertNever", () => {
    it("should throw error when called", () => {
      expect(() => assertNever("unexpected" as never)).toThrow(
        'Unexpected value: "unexpected"',
      );
    });

    it("should include value in error message", () => {
      const value = { foo: "bar" };
      expect(() => assertNever(value as never)).toThrow(
        'Unexpected value: {"foo":"bar"}',
      );
    });

    it("should handle null", () => {
      expect(() => assertNever(null as never)).toThrow(
        "Unexpected value: null",
      );
    });

    it("should handle undefined", () => {
      expect(() => assertNever(undefined as never)).toThrow("Unexpected value");
    });
  });
});
```

**Step 2**: テスト実行

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251226-000434/packages/shared
pnpm test exhaustive-check
```

#### 成果物

- ✅ `exhaustive-check.test.ts`

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] 4つのテストケースがある
- [ ] 全テストが通過する

### Phase 3: EmbeddingProviderFactoryを修正

#### 目的

ファクトリーのdefaultケースでassertNeverを使用

#### 実行手順

**Step 1**: ファクトリーファイルを修正

`packages/shared/src/services/embedding/factory/embedding-provider-factory.ts`

**変更前**:

```typescript
static create(providerName: ProviderName, config: ProviderConfig): IEmbeddingProvider {
  switch (providerName) {
    case 'openai':
      return new OpenAIEmbeddingProvider(config, ...);
    case 'qwen3':
      return new Qwen3EmbeddingProvider(config, ...);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
```

**変更後**:

```typescript
import { assertNever } from '../utils/exhaustive-check';

static create(providerName: ProviderName, config: ProviderConfig): IEmbeddingProvider {
  switch (providerName) {
    case 'openai':
      return new OpenAIEmbeddingProvider(config, ...);
    case 'qwen3':
      return new Qwen3EmbeddingProvider(config, ...);
    default:
      // 新しいプロバイダー追加時、ここでコンパイルエラーとなる
      return assertNever(providerName);
  }
}
```

**Step 2**: エクスポートを追加

`packages/shared/src/services/embedding/index.ts`

```typescript
// utils
export { assertNever } from "./utils/exhaustive-check";
```

**Step 3**: 型チェック実行

```bash
pnpm typecheck
```

#### 成果物

- ✅ 修正された`embedding-provider-factory.ts`
- ✅ 更新された`index.ts`

#### 完了条件

- [ ] assertNeverがインポートされている
- [ ] defaultケースでassertNeverが使用されている
- [ ] 型チェックが通過する
- [ ] 既存のテストが通過する

### Phase 4: 動作確認

#### 目的

新しいプロバイダー型追加時にコンパイルエラーが発生することを確認

#### 実行手順

**Step 1**: テスト用に新しい型を追加

```typescript
// packages/shared/src/services/embedding/types/embedding.types.ts
export type ProviderName = "openai" | "qwen3" | "voyage"; // 'voyage' を追加
```

**Step 2**: 型チェック実行（エラーが発生することを確認）

```bash
pnpm typecheck
```

**期待される結果**: 以下のようなエラーが発生

```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
```

**Step 3**: voyageケースを追加（エラー解消を確認）

```typescript
case 'voyage':
  return new VoyageEmbeddingProvider(config, ...);
```

**Step 4**: 型定義を元に戻す

```typescript
export type ProviderName = "openai" | "qwen3"; // voyageを削除
```

#### 成果物

- ✅ 動作確認完了

#### 完了条件

- [ ] 新しい型追加時にコンパイルエラーが発生することを確認
- [ ] ケース追加後にエラーが解消されることを確認
- [ ] 型定義を元に戻してクリーンな状態に

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] exhaustive-check.ts が作成されている
- [ ] assertNever関数が正しく実装されている
- [ ] EmbeddingProviderFactoryでassertNeverが使用されている
- [ ] 新しい型追加時にコンパイルエラーが発生する

### 品質要件

- [ ] ユニットテストが4件追加されている
- [ ] 全テストが通過する（104 → 108件）
- [ ] 型チェックが通過する
- [ ] コードカバレッジが維持される（91.39%以上）

### ドキュメント要件

- [ ] exhaustive-check.ts にJSDocコメントが記載されている
- [ ] テストコードにdescribeブロックのdescriptionが記載されている
- [ ] エクスポートが index.ts に追加されている

---

## 6. 検証方法

### テストケース

| No  | テストケース             | 入力                  | 期待結果                             |
| --- | ------------------------ | --------------------- | ------------------------------------ |
| 1   | 文字列を渡した場合       | 'unexpected' as never | エラーがスローされる                 |
| 2   | オブジェクトを渡した場合 | {foo: 'bar'} as never | JSON形式でエラーメッセージに含まれる |
| 3   | nullを渡した場合         | null as never         | エラーがスローされる                 |
| 4   | undefinedを渡した場合    | undefined as never    | エラーがスローされる                 |

### 検証手順

1. **ユニットテスト実行**

   ```bash
   pnpm test exhaustive-check
   ```

   期待: 4/4テスト成功

2. **型チェック実行**

   ```bash
   pnpm typecheck
   ```

   期待: エラーなし

3. **実装漏れ検出の確認**
   - 新しい型を追加
   - 型チェック実行
   - コンパイルエラー発生を確認

4. **全テスト実行**
   ```bash
   pnpm test
   ```
   期待: 108/108テスト成功

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                       |
| -------------------------- | ------ | -------- | ------------------------------------------ |
| 既存のテストが失敗する     | 中     | 低       | 事前に全テスト実行で確認                   |
| 他のファクトリーとの整合性 | 低     | 低       | ChunkingStrategyFactoryも同様に修正を検討  |
| パフォーマンスへの影響     | 低     | なし     | コンパイル時のみの検査でランタイム影響なし |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 7 最終レビュー結果](../embedding-generation-pipeline/review-final.md)
- [EmbeddingProviderFactory 実装](../../../packages/shared/src/services/embedding/factory/embedding-provider-factory.ts)
- [05-architecture.md](../../00-requirements/05-architecture.md#52b)

### 参考資料

- TypeScript Handbook: Never type
  - https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type
- TypeScript Deep Dive: Exhaustive Checks
  - https://basarat.gitbook.io/typescript/type-system/discriminated-unions#exhaustive-checks

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 7: arch-police エージェントの指摘

ファクトリーの型安全性改善

ファイル: embedding-provider-factory.ts

問題: ファクトリーメソッドで未知のプロバイダータイプに対するエラーハンドリングが`throw`のみ

推奨:
- ExhaustiveCheck パターンの適用
- コンパイル時に網羅性チェック

優先度: 低
```

### 補足事項

- exhaustive checkパターンはTypeScriptの型システムを活用した防御的プログラミング手法
- パフォーマンスへの影響なし（コンパイル時のみの検査）
- 他のファクトリー（ChunkingStrategyFactory等）にも同様のパターンを適用可能
- IDEの補完機能と組み合わせることで開発効率が向上
