# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 前Phase    | 7: カバレッジ確認                         |
| 次Phase    | 9: 品質保証                               |

---

## 目的

Phase 5/6 で実装した `ChunkingService` と `IEmbeddingClient` 拡張について、
コードの保守性・型安全性・可読性を向上させる。
改善が有益な場合のみ変更を加え、不要と判断した場合はその理由を記録する。

参照する上流成果物:

- `outputs/phase-1/requirements.md`
- `outputs/phase-1/interface-inventory.md`
- `outputs/phase-2/design.md`

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: `ChunkingService.getTokenEmbeddings()` の関心分離検討

**目的**: `ChunkingService.getTokenEmbeddings()` が肥大化している場合に、「クライアント呼び出し部」と「セグメント分割部」を分離することで可読性を向上させる

**実行手順**:

1. `packages/shared/src/services/chunking/chunking-service.ts` を開き、`getTokenEmbeddings()` の行数と責務を確認する
2. 以下の観点で分離の要否を判断する
   - 50行以上かつ複数責務がある場合 → 分離を実施
   - 50行未満または単一責務の場合 → 分離不要と記録
3. 分離する場合は以下の形式でプライベートメソッドに切り出す

```typescript
// クライアント呼び出し部
private async fetchTokenEmbeddings(
  text: string,
  client: Required<IEmbeddingClient>
): Promise<TokenEmbeddingsResult> { ... }

// セグメント分割部
private splitIntoSegments(
  tokenEmbeddings: TokenEmbeddingsResult,
  options: ChunkingOptions
): EmbeddingSegment[] { ... }
```

4. 分離後にテストが全 PASS することを確認する

```bash
pnpm --filter @repo/shared test -- chunking-service
```

**期待される成果物**:

- `outputs/phase-8/refactoring-notes.md` の関心分離セクション（実施/非実施と理由）

---

### タスク2: `MockTokenEmbeddingClient` ファクトリメソッド導入検討

**目的**: テストコードで `MockTokenEmbeddingClient` の生成が煩雑な場合にファクトリメソッドを導入し、テストの可読性を向上させる

**実行手順**:

1. テストファイル内の `MockTokenEmbeddingClient` 生成コードを確認する
2. 同一の初期化パターンが3箇所以上繰り返されている場合 → ファクトリメソッドを導入
3. 導入する場合は以下の形式で実装する

```typescript
/**
 * テスト専用: MockTokenEmbeddingClient を生成するファクトリ関数。
 * テスト間の状態漏れを防ぐため、各テストの beforeEach で呼び出すこと。
 */
export function createMockTokenEmbeddingClient(
  overrides?: Partial<MockTokenEmbeddingClientOptions>
): MockTokenEmbeddingClient { ... }
```

4. 導入後にテストが全 PASS することを確認する

**期待される成果物**:

- `outputs/phase-8/refactoring-notes.md` のファクトリメソッドセクション（実施/非実施と理由）

---

### タスク3: 不要な型アサーションと `any` の除去

**目的**: `as unknown as` 型アサーションや `any` 型を使用している箇所を型安全な実装に置き換える

**実行手順**:

1. 以下のコマンドで `any` と `as unknown as` の使用箇所を検索する

```bash
# any の検索
grep -rn ": any" packages/shared/src/services/embedding/

# as unknown as の検索
grep -rn "as unknown as" packages/shared/src/services/embedding/
```

2. 各使用箇所について、除去できるか判断する
3. 除去できる場合は適切な型定義に置き換える
4. 置き換え後に型チェックを実行する

```bash
pnpm --filter @repo/shared typecheck
```

**Before/After/理由テーブル（記入例）**:

| ファイル            | Before（変更前）                     | After（変更後）    | 理由                           |
| ------------------- | ------------------------------------ | ------------------ | ------------------------------ |
| chunking-service.ts | `client as unknown as Required<...>` | 型ガードで絞り込み | `as unknown as` は型安全でない |

**期待される成果物**:

- `outputs/phase-8/refactoring-notes.md` の型アサーション除去セクション

---

### タスク4: 型ガード `hasTokenEmbeddingSupport()` の導入検討

**目的**: `IEmbeddingClient` が `getTokenEmbeddings()` を持つかどうかを安全に判定する型ガードを導入し、フォールバック分岐の型安全性を向上させる

**実行手順**:

1. `ChunkingService` 内で `getTokenEmbeddings` の存在チェックをしている箇所を確認する
2. 型ガードが有益かどうか判断する（複数箇所で同一チェックがある場合 → 導入）
3. 導入する場合は以下の形式で実装する

```typescript
/**
 * IEmbeddingClient が getTokenEmbeddings をサポートしているかどうかを判定する型ガード。
 * Late Chunking を有効にする前に使用する。
 */
function hasTokenEmbeddingSupport(
  client: IEmbeddingClient,
): client is Required<IEmbeddingClient> {
  return (
    typeof (client as Required<IEmbeddingClient>).getTokenEmbeddings ===
    "function"
  );
}
```

4. 型ガード導入後に型チェックとテストを実行する

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared test -- chunking-service
```

**期待される成果物**:

- `outputs/phase-8/refactoring-notes.md` の型ガード導入セクション（実施/非実施と理由）

---

## 参照資料

| 参照資料             | パス                                                              | 内容                       |
| -------------------- | ----------------------------------------------------------------- | -------------------------- |
| Phase 6/7 成果物     | `outputs/phase-6/`, `outputs/phase-7/`                            | テスト拡充・カバレッジ結果 |
| ChunkingService 実装 | `packages/shared/src/services/embedding/`                         | リファクタリング対象       |
| IEmbeddingClient 型  | `packages/shared/src/services/embedding/types.ts`（相当ファイル） | インターフェース定義       |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に必ず以下のシステム仕様を確認し、仕様に準拠した状態を維持してください。

| 参照資料   | パス                                                                   | 内容                 |
| ---------- | ---------------------------------------------------------------------- | -------------------- |
| 記述ガイド | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 仕様記述・命名の基準 |

---

## 成果物

| 成果物                 | パス                                   | 内容                                                        |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------- |
| リファクタリングノート | `outputs/phase-8/refactoring-notes.md` | 各タスクの Before/After/理由テーブル・実施/非実施の判断根拠 |

---

## 統合テスト連携【必須】

**Phase 8 の統合テスト連携アクション**:

- リファクタリング後もテストが全 PASS することを確認し、変更が既存の挙動を破壊していないことを保証する
- 型ガード導入後は型チェックが通ることで、インターフェース契約の整合性を確認する
- 統合テストは以下コマンドで実行する

```bash
pnpm --filter @repo/shared test -- chunking-service.integration
```

---

## 完了条件

- [ ] `ChunkingService.getTokenEmbeddings()` の分離要否が判断され、実施/非実施と理由が記録されている
- [ ] `MockTokenEmbeddingClient` のファクトリメソッド導入要否が判断され、実施/非実施と理由が記録されている
- [ ] 不要な `as unknown as` や `any` の除去が実施され、Before/After/理由テーブルが記録されている
- [ ] 型ガード `hasTokenEmbeddingSupport()` の導入要否が判断され、実施/非実施と理由が記録されている
- [ ] リファクタリング後に `pnpm --filter @repo/shared test` で全テストが PASS している
- [ ] `outputs/phase-8/refactoring-notes.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-9-quality.md`
