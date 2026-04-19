# Lessons Learned / Late Chunking 実装（UNASSIGNED-EMB-005）

> 親仕様書: [lessons-learned-rag-embedding-runtime.md](lessons-learned-rag-embedding-runtime.md)
> 役割: UNASSIGNED-EMB-005（Late Chunking実装）の実装教訓（L-LC-01〜02）

---

## 教訓サマリー

| ID | 件名 | 重要度 |
| --- | --- | --- |
| L-LC-01 | esbuildバイナリバージョン不一致（worktree環境） | 高 |
| L-LC-02 | IEncoderインターフェースのモック雛型はPhase 2設計書に含める | 中 |

---

## UNASSIGNED-EMB-005 実装教訓（2026-04-19）

### L-LC-01: esbuildバイナリバージョン不一致（worktree環境）

**背景**:
git worktreeを使って並行開発している環境では、`node_modules/.bin/esbuild` バイナリが worktree 間で共有されず、worktree 固有のバイナリが main の node_modules とバージョン不一致になる場合がある。特に `pnpm` のシンボリックリンク構造下では、worktree 内の `pnpm install` が既存バイナリを上書きせずスキップすることがある。

**症状**:
```
Error: The esbuild binary found in node_modules is from a different version
  of esbuild. Maybe you need to run "npm install"?
  Installed: x.y.z
  Expected: a.b.c
```

**教訓**:
- worktree 環境で esbuild 関連エラーが発生した場合、まず `pnpm install --force` を試みる
- それでも解消しない場合は `node_modules/.cache` を削除し再インストールする
- `packages/shared` のビルド（`pnpm --filter @repo/shared build`）を実行して、ビルド成果物が正しく生成されているか確認する
- worktree では `pnpm install` の代わりに root から `pnpm install` を実行することで、全 worktree が同じバイナリを参照するようにできる

**対処手順**:
```bash
# 1. worktreeのルートから強制再インストール
pnpm install --force

# 2. キャッシュ削除後に再インストール
rm -rf node_modules/.cache
pnpm install

# 3. shared パッケージのビルド確認
pnpm --filter @repo/shared build

# 4. テスト実行で動作確認
pnpm --filter @repo/shared test
```

**関連**: git worktree / pnpm monorepo / esbuild binary mismatch

---

### L-LC-02: IEncoderインターフェースのモック雛型はPhase 2設計書に含める

**背景**:
Late Chunking の `LateChunkingService` は `IEncoder` インターフェースに依存する。`IEncoder.encode()` は `Promise<EncoderOutput>` を返し、`hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を持つ。Phase 4 でテストを作成する際、この `IEncoder` のモック実装を一から設計する必要があり、`hiddenStates` の次元数や `offsetMapping` の形式の仕様理解に時間がかかった。

**症状**:
Phase 4 でテスト作成を開始した際、`IEncoder` のモック実装をどう書くかが不明確で、設計書を再確認する往復が発生した。特に `offsetMapping: [number, number][]` の意味（文字位置の [start, end] ペア）が仕様書に明記されておらず、実装ファイルを読み直して理解する必要があった。

**教訓**:
- 外部依存インターフェース（特にモック実装が複雑なもの）は Phase 2 設計書に **モック雛型コード** を含めるべき
- `IEncoder` のような「hiddenStates の形状」「offsetMapping の意味」など非自明な仕様は Phase 2 で明文化する
- テスト作成者（Phase 4）が設計書だけを読んで迷わずモックを書けることが品質ゲートの要件になる

**Phase 2 設計書に含めるべき内容（IEncoder の場合）**:
```typescript
// Phase 2 設計書に含めるべきモック雛型
const mockEncoder: IEncoder = {
  encode: vi.fn().mockResolvedValue({
    // hiddenStates: トークン数 × 次元数のFloat32Array配列
    // 各 Float32Array が1トークンの768次元ベクトルを表す
    hiddenStates: [new Float32Array([0.1, 0.2, ...]), ...],
    // offsetMapping: [(文字開始位置, 文字終了位置), ...]
    // 各要素が1トークンに対応する元テキストの文字位置範囲
    offsetMapping: [[0, 3], [4, 8], ...],
  }),
};
```

**適用基準**:
- インターフェースのメソッドが `Float32Array` / 多次元配列 / `[number, number][]` などの非自明な型を返す場合
- DI されるインターフェースで、テスト環境ではモックが必須の場合
- モック実装が「正しい入力形状」に依存する場合（形状が間違うと処理結果が全てゼロになる等）

**関連**: L-RAG-07（Factory wiring タスクでの型互換性事前検証パターン）

---

## 関連ドキュメント

- [RAG・Embedding・Extraction Runtime 統合 教訓](./lessons-learned-rag-embedding-runtime.md)
- [Embedding Generation Pipeline アーキテクチャ](./architecture-embedding-pipeline.md)
- [Embedding Generation API](./api-internal-embedding.md)
- [Embedding 型定義](./llm-embedding.md)
