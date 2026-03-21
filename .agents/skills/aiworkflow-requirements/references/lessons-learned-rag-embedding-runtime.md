# Lessons Learned / RAG・Embedding・Extraction Runtime 統合

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 の実装教訓（L-RAG-01〜06）

---

## 教訓サマリー

| ID | 件名 | 関連 Pitfall | 重要度 |
| --- | --- | --- | --- |
| L-RAG-01 | production mock の guidance-only 置換パターン | P23, P32 | 高 |
| L-RAG-02 | HybridRAGFactory の throw stub が CRITICAL GAP | P62 | 高 |
| L-RAG-03 | silent fallback の是非判定（3分類） | P50 | 中 |
| L-RAG-04 | Embedding 仕様差分 7件の発見 | P37, P50 | 中 |
| L-RAG-05 | communityHandlers テストファイル不在 | P9, P21 | 中 |
| L-RAG-06 | ILLMClient 型の乖離 | P23, P32, P44 | 高 |
| L-RAG-07 | Factory wiring タスクでの型互換性事前検証パターン | P23, P32, P44 | 高 |

---

## TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 実装教訓（2026-03-19）

### L-RAG-01: production mock の guidance-only 置換パターン

**背景**:
IPC レスポンス形式の不統一（`{ success, data }` vs `{ ok, value }`）が型制約により即時解消できないケースが存在した。production mock はテスト環境では正常に機能するが、実際のランタイムで呼ばれると「成功を装った偽レスポンス」を返すため、エラーの隠蔽が発生する。

**教訓**:
- mock 削除は型制約の影響範囲を事前調査してから実施する
- 即時削除できない場合は「guidance-only」置換パターンを採用する: throw または console.warn + 代替手段案内に差し替える
- `// TODO: remove mock` コメントだけでは不十分。未タスク化して backlog に登録する

**具体的対処**:
```typescript
// ❌ production mock（成功を装う）
async fetchEmbedding(text: string): Promise<EmbeddingResult> {
  return { ok: true, value: new Float32Array(1536) }; // fake
}

// ✅ guidance-only 置換
async fetchEmbedding(text: string): Promise<EmbeddingResult> {
  throw new Error(
    "[MOCK_NOT_REPLACED] fetchEmbedding is not implemented. " +
    "Use RealEmbeddingClient instead. See: docs/embedding-setup.md"
  );
}
```

**関連**: P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）

---

### L-RAG-02: HybridRAGFactory の throw stub が CRITICAL GAP

**背景**:
`HybridRAGFactory.create()` が実装前の throw stub のままリリースされると、RAG 機能全体が利用不能になる。エラーメッセージに「代替手段」の案内がなければ、ユーザーも開発者も次のアクションが取れない。

**教訓**:
- factory の throw stub は explicit error だが、代替手段の案内がなければ CRITICAL GAP となる
- `[FACTORY_NOT_READY]` のような識別タグを付与し、ログ集約・アラートで検出できるようにする
- エラーメッセージには「現在の状態」「回避策」「追跡 Issue URL」の3要素を含める

**具体的対処**:
```typescript
// ❌ 案内なし throw stub
static create(): HybridRAGService {
  throw new Error("Not implemented");
}

// ✅ 案内付き throw stub
static create(): HybridRAGService {
  throw new Error(
    "[FACTORY_NOT_READY] HybridRAGFactory.create() is not yet implemented. " +
    "Workaround: use EmbeddingOnlyRAGService for basic retrieval. " +
    "Tracking: https://github.com/org/repo/issues/XXX"
  );
}
```

**関連**: P62（DEFAULT_CONFIG への暗黙 fallback）

---

### L-RAG-03: silent fallback の是非判定（3分類）

**背景**:
RAG/Embedding 統合では複数の fallback が存在し、それぞれ「許容すべき graceful degradation」と「修正すべき production mock」が混在していた。一律に「fallback = 悪」と判断すると過剰修正が発生する。

**教訓**:
fallback は以下の3分類で判断する:

| 分類 | 判断基準 | 対処 |
| --- | --- | --- |
| 許容（graceful degradation） | 部分的な機能低下だが、コア機能は継続可能（SF-04, SF-06, SF-08） | warn ログ + 監視アラートを追加 |
| 修正（production mock） | 成功を装い実際の処理をスキップ（SF-01, SF-02, SF-03） | guidance-only に置換（L-RAG-01 参照） |
| 監視（warn ログ追加） | 想定内の degradation だが頻度把握が必要（SF-05, SF-07, SF-09） | warn ログ追加で可視化 |

**関連**: P50（既実装防御の発見による Phase 転換）

---

### L-RAG-04: Embedding 仕様差分 7件の発見

**背景**:
Phase 10 最終レビューで Embedding の仕様書と実装に 7件の差分が発見された。主な差分:
- EMB-001/002 の割り当てが仕様書と実装で逆転していた
- 次元数が仕様書（768次元）と実装（1536次元）で不一致

**教訓**:
- P50 チェック（Phase 4 開始前の既存実装調査）を徹底することで発見できる差分がある
- 実装先行でコードが既に完成している場合は、仕様書を実装に合わせる原則を適用する（逆方向の更新はリグレッションリスクが高い）
- 次元数のような数値は仕様書・テスト・実装の3箇所を `grep -rn "768\|1536"` で一括確認する

**具体的手順**:
```bash
# 次元数の不一致を一括検出
grep -rn "dimensions\|dim_size\|vector_size" apps/desktop/src/ .claude/skills/

# 仕様書と実装の差分確認
grep -rn "EMB-001\|EMB-002" docs/ .claude/skills/ apps/
```

**関連**: P37（ドキュメント数値の早期固定）、P50（既実装防御の発見による Phase 転換）

---

### L-RAG-05: communityHandlers テストファイル不在

**背景**:
`communityHandlers` の mock を全削除するタスクにおいて、削除後の「動作確認テスト」が存在しなかった。mock を削除するとテスト対象のコードパスが消滅するため、削除後に何を検証すべきかが不明確になる逆説的状況が発生した。

**教訓**:
- mock 削除タスクでは「削除後の代替動作確認テスト」を Phase 4 で設計する
- mock 全削除 = テスト対象消滅 の場合、「削除済みであることの確認テスト」（existence check）を作成する
- テスト間の状態リークに注意: mock 削除後に `beforeEach` リセットが不要になる箇所を確認する

**具体的対処**:
```typescript
// ✅ 削除済みであることの確認テスト
describe("communityHandlers (removed)", () => {
  it("should not register community IPC channels", () => {
    const registeredChannels = getRegisteredIpcChannels();
    expect(registeredChannels).not.toContain("community:fetch");
    expect(registeredChannels).not.toContain("community:submit");
  });
});
```

**関連**: P9（モジュールスコープ変数のテスト間リーク）、P21（既存テストへの DI 追加時の大規模修正）

---

### L-RAG-06: ILLMClient 型の乖離

**背景**:
`crag/types.ts` と `llm/types.ts` に同名の `ILLMClient` インターフェースが存在し、メソッドシグネチャが異なっていた。`grep` では同名で検出できるが、シグネチャの差分は grep では発見しにくく、DI 配線時（実装クラスをインターフェースに渡す場面）にのみ TypeScript 型エラーとして顕在化した。

**教訓**:
- 同名インターフェースが複数ファイルに存在する場合、シグネチャの比較は `grep` だけでは不十分
- DI 配線（コンストラクタ引数・factory 呼び出し）を行う前に、両インターフェースのメソッド一覧を並べて比較する
- 共有型は `packages/shared` に配置して単一の真実源を保つ（P32 準拠）

**検出コマンド**:
```bash
# 同名インターフェースの存在を確認
grep -rn "interface ILLMClient" apps/ packages/

# メソッドシグネチャを比較
grep -A 20 "interface ILLMClient" apps/desktop/src/main/crag/types.ts
grep -A 20 "interface ILLMClient" apps/desktop/src/main/llm/types.ts
```

**関連**: P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）、P44（IPC インターフェース不整合）

---

### L-RAG-07: Factory wiring タスクでの型互換性事前検証パターン

- **タスク**: UT-RAG-08-002（HybridRAGFactory 実配線）
- **教訓**: Factory パターンで複数の依存モジュールを配線する際、各モジュールが要求するインターフェースの型互換性を Phase 2（設計）で検証すべき。UT-RAG-08-002 では `ILLMClient` が `crag/types.ts`（1引数オブジェクト形式）と `llm/types.ts`（2引数形式）で異なるシグネチャを持ち、Phase 3 レビューで MAJOR として検出された
- **解決策**: Factory が依存する全モジュールのコンストラクタ引数型を Phase 1（要件定義）で FR-00 テーブルに列挙し、Phase 2 で import 元ファイルのインターフェース定義を実際に読んで型互換性を検証する
- **関連**: L-RAG-06, P23, P64
