# UT-FIX-IPC-RESPONSE-UNWRAP-003 - `safeInvokeUnwrap` 型アサーション削減

## メタ情報

```yaml
issue_number: 824
```

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-003        |
| タスク名     | `safeInvokeUnwrap` 型アサーション削減 |
| 分類         | リファクタリング                      |
| 対象機能     | ipc-response-unwrap                   |
| 優先度       | 低                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | 未実施                                |
| 発見元       | Phase 10（最終レビュー MINOR M-2）    |
| 発見日       | 2026-02-14                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`safeInvokeUnwrap<T>()` は `IpcResult<T>` の `data?: T` を扱うため、`return result.data as T` が残っている。

### 1.2 問題点・課題

現状は実用上問題ないが、`as T` が残ることで「実行時検証を省略している」と誤解されやすい。将来的な型安全性改善の候補として明確化が必要。

### 1.3 放置した場合の影響

型安全に関する設計判断が曖昧なまま残り、同種実装で不要な型アサーションが増える可能性がある。

---

## 2. 何を達成するか（What）

### 2.1 目的

`safeInvokeUnwrap` の戻り値型設計を見直し、可能なら `as T` を除去する。

### 2.2 最終ゴール

- `as T` 除去、または除去不可の場合の理由を仕様化
- 変更した型設計に対応するテストを追加

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/preload/skill-api.ts` の `IpcResult` / `safeInvokeUnwrap` 型設計見直し
- `apps/desktop/src/preload/__tests__/` の関連テスト更新

#### 含まないもの

- Skill API 全体の大規模再設計
- Main Process ハンドラ仕様の全面変更

### 2.4 成果物

- 修正済み `skill-api.ts`
- 追加/更新テスト
- 設計判断の記録（仕様書追記）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存テストがグリーンであること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- TypeScript の discriminated union
- IPCレスポンス設計（`success` / `data` / `error`）

### 3.4 推奨アプローチ

- `IpcResult<T>` を discriminated union に寄せて narrowing を効かせる
- `success === true` 分岐で `data` の型が `T` になる設計を優先
- 具体的な型定義案:

```typescript
// 現行（as T が必要）
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 改善案: discriminated union（as T が不要）
type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 3.5 実装課題と解決策（親タスク UT-FIX-IPC-RESPONSE-UNWRAP-001 の教訓）

本タスクの親タスクで遭遇した苦戦箇所を記録する。型アサーション削減の実装時に同じ問題にはまらないよう活用すること。

| #   | 課題                                       | 発見経緯                                                                                                                                                                             | 解決策                                                                                                                                 | 教訓                                                                                                                                                 |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **TypeScript ジェネリクスの type erasure** | `safeInvoke<ImportedSkill[]>()` と型注釈しても、実行時は IPC レスポンス `{ success, data }` がそのまま透過した。AgentView で `importedSkills.forEach is not a function` エラーが発生 | `safeInvokeUnwrap<T>()` を新設し、実行時にラッパーを展開する処理を追加                                                                 | TypeScript の型注釈は実行時の値を変換しない（P19 の拡張）。IPC 境界では必ず実行時バリデーション/変換を行う                                           |
| 2   | **テストモック値の波及修正（19箇所）**     | `safeInvoke` → `safeInvokeUnwrap` に変更したことで、3ファイル・計19箇所のモック値（`mockResolvedValue` / `mockResolvedValueOnce`）が旧形式のまま残り、テストが大量失敗               | `grep -n "mockResolvedValue\|mockResolvedValueOnce" *.test.ts` で全モック箇所を特定し、`{ success: true, data: [...] }` 形式に一括更新 | P21/P35（DI 追加時のテストモック大規模修正）と同パターン。内部実装の変更がテスト層に波及する場合は、事前に `grep` で影響範囲を調査してから修正すべき |
| 3   | **`as T` 型アサーションの必要性判断**      | Phase 10 レビューで M-2 として検出。`IpcResult<T>` の `data?: T` がオプショナルのため、TypeScript は `success` チェック後も `data` を `T \| undefined` と推論する                    | `as T` を維持しつつ MINOR 判定として本未タスク（003）に分離。discriminated union への移行で根本解決を図る                              | `as` の使用が「実行時検証バイパス」か「型推論の限界への対処」かを区別し、後者の場合は型定義改善で解決する                                            |
| 4   | **ハンドラ応答形式の不統一**               | `SKILL_LIST/SCAN/GET_IMPORTED` は `{ success, data }` ラッパーで返却するが、`SKILL_IMPORT` は直接値を返却する。全メソッドが同一形式と想定していたため混乱が生じた                    | 各ハンドラの return 文を確認し、`safeInvoke` / `safeInvokeUnwrap` を使い分ける判断を行った                                             | discriminated union に移行する場合、全ハンドラの応答形式統一も検討すべき（本タスクのスコープ外だが関連タスクとして認識）                             |

#### 関連する既知の落とし穴（06-known-pitfalls.md）

- **P19**: 型キャスト（`as`）による実行時検証バイパス — 本タスクの根本原因
- **P21/P35**: DI 追加時のテストモック大規模修正 — 型定義変更時に再発の可能性
- **P32**: 型定義の二箇所同時更新必須 — `IpcResult` 型変更時に `packages/shared` と `apps/desktop` の両方を確認

---

## 4. 実行手順

### Phase構成

2 Phase（設計更新 → 実装/検証）

### Phase 1: 型設計更新

#### 目的

`as T` を除去可能な型定義へ整理する。

#### 手順

1. 現行 `IpcResult<T>` の使用箇所を調査
2. union 形式へ変更案を作成
3. 既存呼び出しへの影響範囲を特定

#### 成果物

- 型設計案

#### 完了条件

- コンパイル上の影響範囲が明確

### Phase 2: 実装・検証

#### 目的

型定義と実装を一致させ、テストで回帰防止する。

#### 手順

1. `skill-api.ts` を更新
2. テストを追加/更新
3. `pnpm typecheck` / `pnpm vitest run` で検証

#### 成果物

- 修正済みコードとテスト結果

#### 完了条件

- 型チェック・テストがPASS
- 仕様書に設計判断を記録

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `safeInvokeUnwrap` の `as T` が除去、または合理的理由つきで維持判断が明記されている

### 品質要件

- [ ] 型 narrowing に基づく実装であることをテストで確認している

### ドキュメント要件

- [ ] システム仕様書へ判断理由を反映している

---

## 6. 検証方法

### テストケース

- `success: true` / `success: false` 分岐の型・実行時挙動確認
- `data` 欠落時の例外系確認

### 検証手順

1. `pnpm --filter @app/desktop typecheck`
2. `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts`

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                                                   |
| ----------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| 型定義変更が他メソッドへ波及                          | 中     | 中       | 変更前に `rg "IpcResult<"` で影響範囲を可視化（P32 対策）                              |
| 実行時挙動を壊す                                      | 中     | 低       | 既存テスト + 追加テストで回帰検知                                                      |
| テストモック値の大規模修正が必要（P21/P35）           | 中     | 高       | `grep -n "mockResolvedValue" *.test.ts` で事前に影響箇所を特定し、一括修正計画を立てる |
| `packages/shared` と `apps/desktop` の型不整合（P32） | 中     | 中       | `IpcResult` が両パッケージで使用されている場合、同時更新を行う                         |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`（safeInvokeUnwrap パターン、データフロー図、使い分け基準テーブル）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（v1.12.0: 苦戦箇所 1-4、type erasure / テストモック波及 / `as T` 判断）

### 参考資料

- `apps/desktop/src/preload/skill-api.ts`（実装正本 — `IpcResult<T>` 型定義: L136-140、`safeInvokeUnwrap`: L164-173）
- `apps/desktop/src/main/ipc/skillHandlers.ts`（ハンドラ応答形式の確認先）
- `.claude/rules/06-known-pitfalls.md`（P19: 型キャスト、P21/P35: テストモック波及、P32: 型二箇所更新）
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`（IPC エラーハンドリング設計原則）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
M-2: safeInvokeUnwrap 内の return result.data as T 型アサーション。TypeScript が optional data?: T を T に絞り込めないため必要だが、as 使用箇所として記録が必要。
```

### 補足事項

- 本タスクは「型安全の明確化」が目的であり、機能要件の追加は行わない。
