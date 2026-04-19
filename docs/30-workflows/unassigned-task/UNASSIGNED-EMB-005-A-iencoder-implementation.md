# 実Transformerモデルとの IEncoder 実装クラス作成 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UNASSIGNED-EMB-005-A                                |
| タスク名     | iencoder-transformer-implementation                 |
| 分類         | 機能追加                                            |
| 対象機能     | EmbeddingService - IEncoder 実装クラス              |
| 優先度       | **中**                                              |
| 見積もり規模 | 中規模                                              |
| ステータス   | 未着手                                              |
| 発見元       | UNASSIGNED-EMB-005 Phase 12 未タスク検出            |
| 発見日       | 2026-04-19                                          |
| depends_on   | UNASSIGNED-EMB-005（完了済み）                      |
| 並行可能     | UNASSIGNED-EMB-005-B（CJKテストケース追加）と並行可 |
| 関連タスク   | UNASSIGNED-EMB-005                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UNASSIGNED-EMB-005 の Late Chunking 実装において、`IEncoder` インターフェースを抽象化した。
しかし、実際の Transformer モデル（`@xenova/transformers` 等）を使用する具体的な
実装クラスが作成されていないため、本番環境での Late Chunking 機能を利用できない。

### 1.2 問題点・課題

- `IEncoder` インターフェースは定義済みだが、実装クラスが存在しない
- テスト用のモック実装のみ存在し、本番利用不可の状態
- `@xenova/transformers` などのライブラリとの結合が未実施
- Late Chunking の恩恵（検索品質 10-30%向上）を本番で受けられない

### 1.3 放置した場合の影響

- Late Chunking 実装が完成しても本番環境で動作しない
- Embedding 生成時に実 Transformer モデルを使用できない
- 開発環境とテスト環境の乖離が拡大する

---

## 2. 何を達成するか（What）

### 2.1 目的

`IEncoder` インターフェースを実装する具体的なクラス
（`XenovaTransformerEncoder` 等）を作成し、
`@xenova/transformers` などの実 Transformer モデルと接続する。

### 2.2 最終ゴール

- `IEncoder` を実装した具体クラスが存在する
- `@xenova/transformers` の `pipeline` 関数を使用して Embedding を生成できる
- `token_ids` と `offset_mapping` を正しく返せる
- Late Chunking パイプラインが実モデルで動作する

### 2.3 スコープ

#### 含むもの

- `XenovaTransformerEncoder`（または同等のクラス名）の実装
- `@xenova/transformers` の依存関係追加
- 実装クラスの単体テスト
- DI コンテナへの登録（必要な場合）

#### 含まないもの

- `IEncoder` インターフェース定義の変更
- モデルのファインチューニング・学習
- CJK offset_mapping の詳細テスト（UNASSIGNED-EMB-005-B のスコープ）

### 2.4 成果物

| 種別   | 成果物                          | 配置先                                                                                       |
| ------ | ------------------------------- | -------------------------------------------------------------------------------------------- |
| 実装   | XenovaTransformerEncoder クラス | `packages/shared/src/services/embedding/encoders/XenovaTransformerEncoder.ts`                |
| テスト | 実装クラス単体テスト            | `packages/shared/src/services/embedding/__tests__/encoders/XenovaTransformerEncoder.test.ts` |
| 設定   | 依存関係追加                    | `packages/shared/package.json`                                                               |

---

## 3. どのように実装するか（How）

### 3.1 実装手順

#### Step 1: 依存関係の追加

```bash
pnpm --filter @repo/shared add @xenova/transformers
```

#### Step 2: IEncoder 実装クラスの作成

```typescript
// packages/shared/src/services/embedding/encoders/XenovaTransformerEncoder.ts
import { pipeline } from "@xenova/transformers";
import type { IEncoder, EncoderOutput } from "../interfaces/IEncoder";

export class XenovaTransformerEncoder implements IEncoder {
  private modelName: string;
  private pipelineInstance: Awaited<ReturnType<typeof pipeline>> | null = null;

  constructor(modelName: string = "Xenova/all-MiniLM-L6-v2") {
    this.modelName = modelName;
  }

  async encode(text: string): Promise<EncoderOutput> {
    if (!this.pipelineInstance) {
      this.pipelineInstance = await pipeline(
        "feature-extraction",
        this.modelName,
      );
    }
    const output = await this.pipelineInstance(text, {
      pooling: "none",
      normalize: false,
    });
    return {
      token_ids: Array.from(output.input_ids.data as BigInt64Array).map(Number),
      offset_mapping: this.extractOffsetMapping(output),
      embeddings: Array.from(output.data as Float32Array),
    };
  }

  private extractOffsetMapping(output: unknown): [number, number][] {
    // offset_mapping の抽出ロジック
    // ...
  }
}
```

#### Step 3: 単体テストの作成

```typescript
// 実モデルを使用する統合テストと
// モックを使用する単体テストの両方を作成
```

### 3.2 確認コマンド

```bash
# 依存関係インストール確認
pnpm --filter @repo/shared list | grep xenova

# テスト実行
pnpm --filter @repo/shared test -- --run XenovaTransformerEncoder

# 型チェック
pnpm --filter @repo/shared typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                          | 検証方法              |
| ------ | ------------------------------------------------------------- | --------------------- |
| AC-1   | `XenovaTransformerEncoder` が `IEncoder` を正しく実装している | TypeScript コンパイル |
| AC-2   | `encode()` メソッドが `token_ids` を返す                      | 単体テスト            |
| AC-3   | `encode()` メソッドが `offset_mapping` を返す                 | 単体テスト            |
| AC-4   | Late Chunking パイプラインが実装クラスで動作する              | 統合テスト            |
| AC-5   | `pnpm typecheck`（shared）が PASS                             | typecheck コマンド    |
| AC-6   | 既存の Late Chunking テストが全て PASS                        | vitest run            |

---

## 5. 苦戦箇所と知見（予測）

### 5.1 @xenova/transformers の型定義

**予測される問題**: `@xenova/transformers` の型定義が不完全または `any` が多い場合がある。

**対処方針**: 必要に応じて型定義ファイル（`.d.ts`）を作成する。

### 5.2 offset_mapping の取得方法

**予測される問題**: `@xenova/transformers` のデフォルト出力に `offset_mapping` が
含まれない場合がある。

**対処方針**: `return_offsets: true` オプションまたはトークナイザーの
`encode` メソッドを直接呼び出して取得する。

### 5.3 Electron 環境での動作

**予測される問題**: Electron のメインプロセスで `@xenova/transformers` を
ロードする際に WASM の初期化が必要になる可能性がある。

**対処方針**: 初期化処理を遅延ロード（Lazy initialization）で実装する。

---

## 関連リンク

- [UNASSIGNED-EMB-005 仕様書](../UNASSIGNED-EMB-005-late-chunking/index.md)
- [IEncoder インターフェース](../../../../packages/shared/src/services/embedding/late-chunking/)
- [Phase 12 未タスク検出](../UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/unassigned-task-detection.md)
