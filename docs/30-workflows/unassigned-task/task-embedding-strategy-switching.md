# チャンキングストラテジー動的切り替え - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UNASSIGNED-EMB-002                   |
| タスク名     | チャンキングストラテジー動的切り替え |
| 分類         | 改善                                 |
| 対象機能     | embedding-generation-pipeline        |
| 優先度       | 低                                   |
| 見積もり規模 | 小規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 7: 最終レビューゲート          |
| 発見日       | 2025-12-26                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7のアーキテクチャレビューにおいて、ChunkingServiceのストラテジー切り替え機能の不足が指摘された。

現在のChunkingServiceは、コンストラクタで渡されたストラテジーを固定で使用しており、実行中に別のストラテジーに切り替えることができない。

### 1.2 問題点・課題

**現在の制約**:

- ドキュメントタイプごとに最適なストラテジーが異なる
  - Markdown: セマンティックチャンキング
  - コード: AST-awareチャンキング
  - プレーンテキスト: 固定サイズチャンキング
- ストラテジー変更には新しいサービスインスタンス生成が必要
- 柔軟性に欠け、メモリ効率も悪い

**具体例**:

```typescript
// 現在: ドキュメントタイプごとに別インスタンス必要
const mdChunker = new ChunkingService(new SemanticStrategy());
const codeChunker = new ChunkingService(new CodeStrategy());
const textChunker = new ChunkingService(new FixedSizeStrategy());

// 理想: 1つのインスタンスで切り替え
const chunker = new ChunkingService(new SemanticStrategy());
chunker.setStrategy(new CodeStrategy()); // 動的切り替え
```

### 1.3 放置した場合の影響

**短期的影響**:

- 複数のサービスインスタンス管理が必要
- メモリ使用量の増加（微小）

**中長期的影響**:

- コードの冗長性
- 保守性の低下
- 拡張性の制限

**影響度**: 低（現状でも動作するが、柔軟性に欠ける）

---

## 2. 何を達成するか（What）

### 2.1 目的

ChunkingServiceにストラテジーを動的に切り替えるメソッドを追加し、ランタイムで異なるチャンキング戦略を適用できるようにする。

### 2.2 最終ゴール

- `setStrategy(strategy: ChunkingStrategy)`メソッドの実装
- `getStrategyName()`メソッドで現在のストラテジーを確認可能
- ドキュメントタイプに基づく自動ストラテジー選択ヘルパーの提供

### 2.3 スコープ

#### 含むもの

- ✅ setStrategy()メソッドの実装
- ✅ getStrategyName()メソッドの実装
- ✅ getAvailableStrategies()メソッドの実装
- ✅ strategy-selector.tsヘルパーの作成
- ✅ ユニットテストの追加

#### 含まないもの

- ❌ 新しいチャンキング戦略の実装
- ❌ 既存ストラテジーの変更
- ❌ パイプライン全体の変更

### 2.4 成果物

1. 修正された`chunking-service.ts`（3つの新規メソッド追加）
2. `packages/shared/src/services/chunking/utils/strategy-selector.ts`
3. `packages/shared/src/services/chunking/__tests__/strategy-switching.test.ts`
4. 更新されたAPI設計ドキュメント（使用例）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `packages/shared/src/services/chunking/chunking-service.ts` が存在すること
- [ ] 各種チャンキングストラテジーが実装済みであること
  - FixedSizeChunkingStrategy
  - SemanticChunkingStrategy
- [ ] 既存のテストが全て通過していること

### 3.2 依存タスク

- UNASSIGNED-EMB-001: ファクトリーの型安全性改善（推奨、必須ではない）

### 3.3 必要な知識・スキル

- TypeScript
- Strategyパターンの理解
- Vitestによるユニットテスト
- ファイル拡張子の判定ロジック

### 3.4 推奨アプローチ

1. **テストファースト**: 先にテストを書いて期待動作を明確化
2. **段階的実装**: メソッド1つずつ実装・テスト
3. **後方互換性維持**: 既存の使用方法を壊さない

---

## 4. 実行手順

### Phase構成

```
Phase 1: ChunkingServiceにメソッド追加
Phase 2: Strategy Selectorヘルパー作成
Phase 3: テスト作成
Phase 4: ドキュメント更新
```

### Phase 1: ChunkingServiceにメソッド追加

#### 目的

ストラテジー切り替え用の3つのメソッドを実装

#### 実行手順

`packages/shared/src/services/chunking/chunking-service.ts` に以下を追加:

```typescript
/**
 * チャンキング戦略を設定
 */
setStrategy(strategy: ChunkingStrategy): void {
  this.strategy = strategy;
}

/**
 * 現在のストラテジー名を取得
 */
getStrategyName(): string {
  return this.strategy.constructor.name;
}

/**
 * 利用可能な戦略一覧を取得
 */
getAvailableStrategies(): string[] {
  return [
    'FixedSizeChunkingStrategy',
    'SemanticChunkingStrategy',
  ];
}
```

#### 成果物

- ✅ 修正された`chunking-service.ts`

#### 完了条件

- [ ] 3つのメソッドが追加されている
- [ ] 型エラーがない

### Phase 2: Strategy Selectorヘルパー作成

#### 目的

ファイル拡張子からストラテジーを推奨するヘルパーを作成

#### 実行手順

`packages/shared/src/services/chunking/utils/strategy-selector.ts` を作成:

```typescript
import type { ChunkingStrategy } from "../types";

export function recommendStrategy(filename: string): ChunkingStrategy {
  const ext = filename.split(".").pop()?.toLowerCase();

  const codeExtensions = ["ts", "tsx", "js", "jsx", "py", "java"];
  const markdownExtensions = ["md", "mdx"];

  if (codeExtensions.includes(ext || "")) {
    return "semantic";
  }

  if (markdownExtensions.includes(ext || "")) {
    return "semantic";
  }

  return "fixed";
}
```

#### 成果物

- ✅ `strategy-selector.ts`

#### 完了条件

- [ ] ファイルが作成されている
- [ ] コード/Markdown/その他の判定ロジックがある

### Phase 3: テスト作成

#### 実行手順

`packages/shared/src/services/chunking/__tests__/strategy-switching.test.ts` を作成

#### 成果物

- ✅ `strategy-switching.test.ts`（5テストケース）

#### 完了条件

- [ ] 全テストが通過する（5/5）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] setStrategy()が実装され、正常に動作する
- [ ] getStrategyName()が現在のストラテジー名を返す
- [ ] getAvailableStrategies()が利用可能なストラテジー一覧を返す
- [ ] recommendStrategy()がファイル拡張子から適切なストラテジーを推奨する

### 品質要件

- [ ] ユニットテストが5件追加されている
- [ ] 全テストが通過する（104 → 109件）
- [ ] 型チェックが通過する

### ドキュメント要件

- [ ] API設計ドキュメントに使用例が追加されている

---

## 6. 検証方法

### テストケース

| No  | テストケース                        | 期待結果                                      |
| --- | ----------------------------------- | --------------------------------------------- |
| 1   | setStrategy()でストラテジー切り替え | getStrategyName()が新しいストラテジー名を返す |
| 2   | 切り替え後のチャンキング            | 新しいストラテジーで分割される                |
| 3   | getAvailableStrategies()            | 利用可能なストラテジー名配列が返る            |
| 4   | recommendStrategy('test.md')        | 'semantic'が返る                              |
| 5   | recommendStrategy('test.ts')        | 'semantic'が返る                              |

### 検証手順

```bash
pnpm test strategy-switching
pnpm typecheck
pnpm test  # 全テスト
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                         |
| ------------------------ | ------ | -------- | ---------------------------- |
| スレッドセーフティの問題 | 中     | 低       | ドキュメントに注意事項を記載 |
| 既存コードへの影響       | 低     | 低       | 後方互換性を維持             |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 7 最終レビュー結果](../embedding-generation-pipeline/review-final.md)
- [ChunkingService実装](../../../packages/shared/src/services/chunking/chunking-service.ts)

### 参考資料

- Strategy Pattern: https://refactoring.guru/design-patterns/strategy

---

## 9. 備考

### レビュー指摘の原文

```
Phase 7: arch-police エージェント

チャンキングサービスのストラテジー切り替え

問題: ランタイムでのストラテジー切り替えメソッドがない
推奨: setStrategy()メソッドの追加
優先度: 低
```

### 補足事項

- ストラテジーパターンの柔軟性を活かした拡張
- 将来的にはコンテンツ解析による自動ストラテジー選択も検討可能
- 複数ドキュメントを並行処理する場合は、ドキュメントごとに別インスタンス推奨
