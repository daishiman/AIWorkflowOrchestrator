# RuntimeSkillCreatorExecuteResponse union拡張時のexhaustive check導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1946
```

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-RT-02-EXHAUSTIVE-CHECK-001                                                  |
| タスク名     | RuntimeSkillCreatorExecuteResponse union拡張時のexhaustive check導入           |
| 分類         | リファクタリング                                                               |
| 対象機能     | RuntimeSkillCreatorFacade / executeAsync()                                     |
| 優先度       | 中                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | Phase 3 設計レビュー（TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001） |
| 発見日       | 2026-04-06                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-RT-01 の実装において、`RuntimeSkillCreatorFacade.executeAsync()` は以下の union 型を処理する：

```typescript
// RuntimeSkillCreatorExecuteResponse の union 型（現状）
type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteSuccessResponse
  | RuntimeSkillCreatorExecuteErrorResponse;
```

現在の `isStructuredError` 型ガードは `success === false` の確認のみで structured error パスを判定しており、将来 union 型のバリアントが増えた場合に switch/exhaustive パターンがないため型レベルで漏れを検出できない。

### 1.2 問題点・課題

- `isStructuredError` は `success === false` のみを確認するため、`RuntimeSkillCreatorExecuteErrorResponse` と他の `success: false` を持つ型の区別ができない
- union 型が将来拡張された場合（例: `RuntimeSkillCreatorExecutePendingResponse` の追加）、switch/exhaustive パターンがなければコンパイルエラーではなく実行時バグになるリスク
- TypeScript の `never` 型を使った exhaustive check（`assertNever` パターン）が導入されていない

### 1.3 放置した場合の影響

- union 型に新バリアントが追加された際、switch 文の漏れをコンパイル時に検出できず、実行時に `undefined` 参照やサイレントな処理漏れが発生するリスク
- エラーパス・成功パスの二択が三択以上になった時点で、既存の `if (!result.success)` パターンでは不十分になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`RuntimeSkillCreatorExecuteResponse` union 型を exhaustive switch パターンで処理し、将来の型拡張時にコンパイルエラーで漏れを検出できるようにする。

### 2.2 最終ゴール

- `executeAsync()` の分岐処理が switch 文 + `assertNever` パターンで実装されている
- 新バリアントを union 型に追加した場合、switch 文の case 漏れがコンパイルエラーで検出される
- 既存テスト（T-01〜T-06）が全て PASS し続ける（回帰なし）

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.ts` の `executeAsync()` 内の条件分岐を exhaustive switch に変更
- `assertNever` ユーティリティ関数の追加（既存のものがあれば再利用）
- 既存テストの更新（switch 構造の変更に伴う最小限の修正）
- Phase 1-12 ワークフロー成果物

#### 含まないもの

- `RuntimeSkillCreatorExecuteResponse` の union 型自体への新バリアント追加
- Renderer 側の型定義変更
- IPC ブリッジの変更

### 2.4 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（修正）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`（回帰確認）
- Phase 1-12 ワークフロー成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 が完了していること ✅
- `RuntimeSkillCreatorFacade.executeAsync()` の T-01〜T-06 テストが PASS していること ✅

### 3.2 依存タスク

- TASK-UT-RT-01（完了済み）— executeAsync() の基本実装
- UT-RT-03-E2E-ERROR-MESSAGE-001（並列実行可能）— Renderer UI 確認タスク

### 3.3 必要な知識

- TypeScript の discriminated union 型（`success: true | false` による判別）
- TypeScript の `never` 型と exhaustive check パターン（`assertNever` 関数）
- Vitest によるユニットテスト作成

### 3.4 推奨アプローチ

#### ステップ1: assertNever ユーティリティの確認・追加

既存の `assertNever` がなければ追加する：

```typescript
// packages/shared/src/utils/assertNever.ts または同等の場所
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}
```

#### ステップ2: executeAsync() の switch 化

```typescript
// Before（現状）
if (!result.success) {
  // structured error パス
} else {
  // success パス
}

// After（exhaustive switch）
switch (result.success) {
  case false:
    // structured error パス
    break;
  case true:
    // success パス
    break;
  default:
    assertNever(result);
}
```

#### ステップ3: コンパイル確認

`pnpm typecheck` でエラーがないことを確認。

### 3.5 実装課題と解決策（TASK-UT-RT-01からの学び）

| 課題                              | 原因                                                   | 解決策                                                     | 教訓                                             |
| --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| `success` の boolean literal 判別 | `success: boolean` では discriminated union にならない | `success: true` / `success: false` の literal 型で定義     | union の判別子は literal 型で定義すること        |
| `assertNever` の配置場所          | プロジェクト内に同等の関数が既に存在する可能性         | `grep -r "assertNever\|never" packages/shared/src`         | 既存ユーティリティを再利用し重複を避ける         |
| switch 化に伴う既存テストへの影響 | テストが内部実装に依存している場合                     | テストは振る舞い（出力）のみをアサートし構造変更に強くする | テストは実装詳細ではなく契約（入出力）を検証する |

### 3.6 システム仕様書参照テーブル

| 仕様書                                  | 参照セクション             | 用途                            |
| --------------------------------------- | -------------------------- | ------------------------------- |
| architecture-implementation-patterns.md | TypeScript union型パターン | exhaustive check の設計原則確認 |
| error-handling.md                       | エラーカテゴリ体系         | structured error の位置づけ確認 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                          |
| ----- | ---------------------------- | --------------------------------------------- |
| 1     | 要件定義                     | assertNever 有無の確認・union 型現状調査      |
| 2     | 設計                         | switch 化設計・assertNever 配置決定           |
| 3     | 設計レビュー                 | レビューゲート                                |
| 4     | テスト作成                   | exhaustive check の新規テストケース作成       |
| 5     | 実装                         | executeAsync() の switch 化・assertNever 追加 |
| 6-7   | テスト拡充・カバレッジ確認   | 回帰確認・カバレッジ維持                      |
| 8-9   | リファクタリング・品質検証   | lint / typecheck / 全テスト PASS 確認         |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・PR                              |

### Phase 1: 要件定義

#### 目的

`assertNever` の既存実装を確認し、union 型の現状を把握する

#### 手順

1. `grep -r "assertNever\|never" packages/shared/src/` で既存ユーティリティを確認
2. `RuntimeSkillCreatorExecuteResponse` の型定義を読み込み、バリアントを列挙
3. `executeAsync()` の条件分岐コードを確認し、switch 化対象箇所を特定

#### 成果物

- 現状調査メモ（assertNever の有無・union 型バリアント一覧）

#### 完了条件

- [ ] assertNever の有無が確認済み
- [ ] union 型の全バリアントが列挙されている

### Phase 4-5: テスト作成・実装

#### 目的

exhaustive check のテストを先に書いてから switch 化を実装する（TDD）

#### 手順

1. 新バリアント追加時のコンパイルエラー検出テストを作成（型レベルテスト）
2. `executeAsync()` を exhaustive switch に変更
3. `assertNever` を追加（または既存を import）
4. 既存 T-01〜T-06 テストが全 PASS することを確認

#### 成果物

- `RuntimeSkillCreatorFacade.ts`（switch 化）
- 型レベルテスト追加

#### 完了条件

- [ ] switch 文 + assertNever パターンで実装されている
- [ ] 新バリアント追加時にコンパイルエラーが発生することを確認
- [ ] 既存 T-01〜T-06 テストが全 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `executeAsync()` の分岐処理が exhaustive switch パターンで実装されている
- [ ] `assertNever` が使用されており、switch の default に配置されている
- [ ] 新バリアント追加時にコンパイルエラーが発生する

### 品質要件

- [ ] TypeScript 型チェックエラー 0 件
- [ ] ESLint エラー 0 件
- [ ] 既存テスト（T-01〜T-06）が全 PASS
- [ ] Branch Coverage 維持（回帰なし）

### ドキュメント要件

- [ ] 実装ガイド（Phase 12 成果物）
- [ ] システム仕様書更新（該当箇所のみ）
- [ ] documentation-changelog.md

---

## 6. 検証方法

### テストケース

| #   | シナリオ                               | 期待結果                                             |
| --- | -------------------------------------- | ---------------------------------------------------- |
| 1   | 既存 T-01〜T-06 の全テスト実行         | 全 PASS（回帰なし）                                  |
| 2   | union 型に仮バリアントを追加してビルド | TypeScript コンパイルエラーが `assertNever` 行で発生 |
| 3   | 仮バリアントを case 追加後に再ビルド   | コンパイルエラーが解消される                         |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`
2. `pnpm --filter @repo/desktop typecheck`
3. `pnpm --filter @repo/desktop lint`

---

## 7. リスクと対策

| リスク                                                             | 影響度 | 発生確率 | 対策                                                               |
| ------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------ |
| assertNever の配置場所でプロジェクト慣習と不整合                   | 低     | 低       | 既存の型ユーティリティを確認し、同じ場所に配置                     |
| switch 化で既存テストが失敗                                        | 中     | 低       | テストは振る舞いをアサートしているため影響は限定的。事前確認で対処 |
| success の型定義が boolean のままで discriminated union にならない | 中     | 低       | 型定義ファイルを確認し、literal 型になっていることを検証           |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — 実装対象ファイル
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` — 既存テスト

### 関連タスク

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001（完了済み）— 本タスクの前提
- UT-RT-03-E2E-ERROR-MESSAGE-001（並列実行可能）— Renderer UI 確認タスク

---

## 9. 備考

### 苦戦箇所（TASK-UT-RT-01からの知見）

**苦戦点**: `success: boolean` vs `success: true | false` の判別子設計

- TypeScript の discriminated union は、判別子プロパティが **literal 型**である必要がある
- `success: boolean` では narrowing が効かず、`success: true` / `success: false` の literal 型が必須
- 本タスク実施前に現在の型定義を必ず確認すること

**苦戦点**: `assertNever` の import パス

- プロジェクト内に同等の関数が複数存在する場合、最もスコープの広い共有パッケージのものを使用
- `packages/shared/src/utils/` か `apps/desktop/src/shared/utils/` を優先的に確認

### 補足事項

- 現時点の union 型が success の 2 値のみであれば、`assertNever` の追加コストは最小限
- 将来的に union 型が 3 バリアント以上になった時点で exhaustive check の価値が最大化する
- このパターンは `OpenAIModel | AnthropicModel | ...` のような他の union 型にも横展開できる
