# packages/shared の no-explicit-any warning 解消 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-CI-FIX-001-U5                              |
| タスク名     | packages/shared の no-explicit-any warning 解消 |
| 分類         | リファクタリング                                |
| 対象機能     | packages/shared（TypeScript型安全性）           |
| 優先度       | 低                                              |
| 見積もり規模 | 中規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 11 手動テスト                             |
| 発見日       | 2026-01-29                                      |
| issue_number | 566                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 11の手動テストで`packages/shared`に`@typescript-eslint/no-explicit-any` warningが複数箇所で検出された。これはTASK-CI-FIX-001の変更とは無関係の既存の技術的負債である。

### 1.2 問題点・課題

- `any`型の使用はTypeScriptの型安全性を損なう
- lint警告が大量に出力され、新規の問題を見逃す可能性がある

### 1.3 放置した場合の影響

- 型安全性の低下により、ランタイムエラーの発見が遅れる
- CI出力が冗長になり、重要な警告を見逃すリスクが高まる

---

## 2. 何を達成するか（What）

### 2.1 目的

packages/shared内の`no-explicit-any` warningを解消し、適切な型定義に置き換える。

### 2.2 最終ゴール

- `pnpm --filter @repo/shared lint` でwarningが0件
- `any`型が`unknown`や具体的な型に置き換えられている
- 既存テストが全件PASS

### 2.3 スコープ

#### 含むもの

- packages/shared 内の `any` 型の解消
- 必要に応じた型定義の追加

#### 含まないもの

- apps/backend, apps/desktop の `any` 型修正
- ESLintルール自体の変更

### 2.4 成果物

- 更新されたTypeScriptソースコード
- 追加された型定義（必要に応じて）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- packages/shared のコードベースを理解していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- TypeScript 型システム（unknown, generics, type guards）
- `@typescript-eslint/no-explicit-any` ルール

### 3.4 推奨アプローチ

1. `pnpm --filter @repo/shared lint` で警告箇所を一覧化
2. 各`any`を以下の戦略で解消:
   - 具体的な型が判明している場合: その型に置き換え
   - 外部入力や不明な型: `unknown` + 型ガード
   - ジェネリクスが適切な場合: 型パラメータに置き換え
3. 変更ごとにテストが通ることを確認

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルを使用してPhase 1-13の仕様書を生成する。

### Phase 1: 警告箇所の特定

#### 目的

packages/shared内の全 `no-explicit-any` 警告を特定し、修正戦略を策定する。

#### 手順

1. `pnpm --filter @repo/shared lint` を実行して警告箇所を一覧化
2. 各警告箇所を分類（具体的な型が判明 / unknown置換 / ジェネリクス化）
3. 修正難易度と影響範囲を評価

#### 成果物

- 警告箇所一覧と修正戦略

#### 完了条件

- 全warning箇所が特定され、修正方針が決定している

### Phase 2: 型修正の実施

#### 目的

各 `any` 型を適切な型に置き換える。

#### 手順

1. 具体的な型が判明している箇所を優先的に修正
2. 外部入力や不明な型には `unknown` + 型ガードを適用
3. ジェネリクスが適切な箇所は型パラメータに置き換え
4. 各修正後にテストが通ることを確認

#### 成果物

- 更新されたTypeScriptソースコード
- 追加された型定義（必要に応じて）

#### 完了条件

- `pnpm --filter @repo/shared lint` で `no-explicit-any` warning が0件
- 既存テストが全件PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm --filter @repo/shared lint` で `no-explicit-any` warning が0件
- [ ] 既存テストが全件PASS

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` が成功する
- [ ] 型安全性が向上している（`as any`キャストの削減）

---

## 6. 検証方法

### テストケース

- `pnpm --filter @repo/shared lint` で `no-explicit-any` warning が0件
- `pnpm --filter @repo/shared typecheck` が成功する
- `pnpm --filter @repo/shared test` が全件PASS
- `as any` キャストが削減されていることの確認

### 検証手順

1. 全修正完了後に `pnpm --filter @repo/shared lint` を実行し、warning0件を確認
2. `pnpm --filter @repo/shared typecheck` で型チェックが通ることを確認
3. `pnpm --filter @repo/shared test` で既存テストが全件PASSすることを確認

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                       |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 型変更による既存コードのコンパイルエラー  | 中     | 中       | 段階的に修正し、各修正後にtypecheckとテストを実行          |
| unknown型への変更で呼び出し元の修正が必要 | 中     | 中       | 型ガードを提供し、呼び出し元への影響を最小化               |
| ジェネリクス化による複雑さの増加          | 低     | 低       | 過度なジェネリクス化を避け、必要最小限の型パラメータに限定 |

---

## 8. 参照情報

### 関連ドキュメント

- 開発ガイドライン: `CLAUDE.md`（型安全: any型の使用を避け、厳密な型定義を維持）
- TypeScript仕様: `.claude/skills/aiworkflow-requirements/references/technology-core.md`

---

## 9. 備考

### 補足事項

- 本タスクはTASK-CI-FIX-001の変更によって新たに発生したものではなく、既存の技術的負債
- CLAUDE.mdの開発ガイドラインにも「any型の使用を避け、厳密な型定義を維持」と記載されている
