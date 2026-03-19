# sanitizeArgs 内の as string キャスト除去（P49準拠 in 演算子パターン適用） - タスク指示書

## メタ情報

```yaml
issue_number: 1296
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-06-005-A-SANITIZE-ARGS-TYPE-SAFETY                                     |
| タスク名     | sanitizeArgs 内の as string キャスト除去（P49準拠 in 演算子パターン適用） |
| 分類         | リファクタリング（型安全性改善）                                          |
| 対象機能     | SkillExecutor / Hook フォールバック統合                                   |
| 優先度       | 低                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | UT-06-005-A Phase 12 コード品質分析（2026-03-17）                         |
| 発見日       | 2026-03-17                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-005-A（Hook フォールバック統合）の実装において、`SkillExecutor.ts` の `sanitizeArgs` ヘルパー関数が `as string` キャストを多用するパターンで実装された。`sanitizeArgs` は主にログ・デバッグ用途だが、`.claude/rules/06-known-pitfalls.md` の **P49**（type predicate 内での `as` キャスト vs `in` 演算子）および **P19**（型キャストバイパス）では、`in` 演算子によるプロパティ存在確認を伴うパターンが推奨されている。

現在のパターン（P49 違反）:

```typescript
// 現在のパターン（P49違反）
const command = (args.command as string) || "";
const path = (args.file_path as string) || (args.path as string) || "";
```

### 1.2 問題点・課題

- 9 箇所（L1111, L1146, L1406, L1419, L1424, L1429, L1434, L1439, L1444）で `as string` が使用されている
- `args` は `Record<string, unknown>` 型であるため、値が文字列でない場合に `as string` は TypeScript の型チェックを通過するが実行時に誤動作する可能性がある
- `handlePermissionCheck` 等の private メソッドでも、外部 Hook から呼ばれる経路では P42 準拠の防御的バリデーションが不足している
- `02-code-quality.md` の「`as` 型アサーションでバリデーションを回避しない」ルールに非準拠の状態が継続する

### 1.3 放置した場合の影響

- コードレビューで P49 違反として指摘される
- 将来 `sanitizeArgs` の責務が拡大した場合（例: 実行前の引数サニタイズ）に型安全性の問題が顕在化する
- 新規開発者が `as string` パターンをテンプレートとして誤用するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`sanitizeArgs` 関数およびその周辺における `as string` キャストを、P49 準拠の `typeof` チェック + フォールバックパターン（必要に応じて `in` 演算子）に置き換え、型安全性と実行時安全性を一致させる。

### 2.2 最終ゴール

- `SkillExecutor.ts` 内の `as string` が `typeof` チェック + フォールバックパターンに置換されている
- 全テストが PASS し、機能に変化がない
- `pnpm typecheck` が PASS する

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `sanitizeArgs` 関数内および関連箇所（L1111, L1146, L1406, L1419, L1424, L1429, L1434, L1439, L1444）の `as string` キャスト置換
- 同ファイル内の `handlePermissionCheck` 等の private メソッドで P42 準拠バリデーションが必要な箇所の対応

#### 含まないもの

- `SkillExecutor.ts` 以外のファイルへの変更
- `as string` 以外のリファクタリング
- 新機能の追加

### 2.4 成果物

| 成果物           | パス                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| 実装ファイル更新 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              |
| テスト（既存）   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-06-005-A（Hook フォールバック統合）が完了していること（完了済み）
- P49 パターン（`in` 演算子による type predicate）を理解していること

### 3.2 依存タスク

| タスクID    | 関係   | 説明                              |
| ----------- | ------ | --------------------------------- |
| UT-06-005-A | 完了済 | sanitizeArgs が実装された元タスク |

### 3.3 必要な知識

- TypeScript の型ナロイング（`typeof`、`in` 演算子）
- P49: type predicate 内での `as` キャスト vs `in` 演算子
- P19: 型キャスト（as）による実行時検証バイパス
- P42: 文字列引数の `.trim()` バリデーション漏れ

### 3.4 推奨アプローチ

#### 基本変換パターン（最小限の変更）

```typescript
// P49違反（現在）
const command = (args.command as string) || "";

// P49準拠（置換後）
const command = typeof args.command === "string" ? args.command : "";
```

#### `in` 演算子を使う場合（プロパティ存在を明示したい場合）

```typescript
// P49準拠: in 演算子 + typeof による安全なアクセス
const command =
  "command" in args && typeof args.command === "string" ? args.command : "";
```

#### 複数キーのフォールバックパターン

```typescript
// P49違反（現在）
const path = (args.file_path as string) || (args.path as string) || "";

// P49準拠（置換後）
const path =
  (typeof args.file_path === "string" ? args.file_path : "") ||
  (typeof args.path === "string" ? args.path : "") ||
  "";
```

#### 共通ユーティリティ関数（抽出検討可能）

```typescript
function extractStringArg(
  args: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    if (key in args && typeof args[key] === "string") return args[key];
  }
  return "";
}
```

#### P42 バリデーション強化（private メソッド）

```typescript
// P42 準拠: 外部 Hook から呼ばれる場合の 3段バリデーション
private handlePermissionCheck(toolName: string): void {
  if (typeof toolName !== "string" || toolName.trim() === "") {
    return; // または適切なフォールバック
  }
  // 処理
}
```

### 3.5 対象箇所リスト

| 行番号 | 変数名   | キー                          |
| ------ | -------- | ----------------------------- |
| L1111  | （無名） | `args.path`, `args.file_path` |
| L1146  | command  | `input.args.command`          |
| L1406  | command  | `args.command`                |
| L1419  | path     | `args.file_path`, `args.path` |
| L1424  | path     | `args.file_path`, `args.path` |
| L1429  | path     | `args.file_path`, `args.path` |
| L1434  | pattern  | `args.pattern`                |
| L1439  | pattern  | `args.pattern`                |
| L1444  | desc     | `args.description`            |

---

## 4. 実行手順

### Phase 構成

Phase 5 + 9（実装 → 品質検証）の軽量構成で実施。機能変更なしのリファクタリングのため、テストファースト（Phase 4）は省略可能。

### Phase 5: 実装

#### 手順

1. `SkillExecutor.ts` を読み込み、上記 9 箇所の `as string` 箇所を確認
2. 各箇所を `typeof` チェック + フォールバックパターンに置換
3. 必要に応じて `extractStringArg` 共通ユーティリティ関数を抽出
4. `handlePermissionCheck` 等の private メソッドで P42 バリデーションが必要な箇所を確認・追加

### Phase 9: 品質検証

#### 手順

1. `pnpm typecheck` が PASS することを確認
2. `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__` で全テスト PASS を確認
3. `pnpm lint` が PASS することを確認
4. `grep -n "as string" apps/desktop/src/main/services/skill/SkillExecutor.ts` で残存箇所が 0 件であることを確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 9 箇所の `as string` が `typeof` チェック + フォールバックパターンに置換されている
- [ ] `handlePermissionCheck` 等の private メソッドで P42 バリデーションが必要な箇所に対応済み

### 品質要件

- [ ] `pnpm typecheck` が PASS
- [ ] `pnpm lint` が PASS
- [ ] 関連テスト全 PASS（機能に変化なし）
- [ ] `grep -n "as string" apps/desktop/src/main/services/skill/SkillExecutor.ts` の出力が 0 件

---

## 6. 検証方法

### テストケーステーブル

| テストID | 対象                               | 入力値                         | 期待結果                                                     |
| -------- | ---------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| TS-01    | sanitizeArgs（command フィールド） | `{ command: "echo hello" }`    | `"echo hello"` が返る（機能変化なし）                        |
| TS-02    | sanitizeArgs（command なし）       | `{}`                           | `""` が返る（typeof ガードで安全にフォールバック）           |
| TS-03    | sanitizeArgs（command が数値）     | `{ command: 42 }`              | `""` が返る（typeof チェックで弾く）                         |
| TS-04    | sanitizeArgs（複数キー）           | `{ file_path: "/a/b" }`        | `"/a/b"` が返る（file_path → path の順でフォールバック）     |
| TS-05    | handlePermissionCheck              | `toolName: "   "` （空白のみ） | 早期リターンまたは適切なフォールバック（P42 バリデーション） |
| TS-06    | 型チェック                         | `pnpm typecheck` 実行          | PASS（`as string` 除去後も型エラーなし）                     |

### 検証手順

1. `grep -n "as string" apps/desktop/src/main/services/skill/SkillExecutor.ts` で残存 `as string` が 0 件であることを確認
2. `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor` で全テスト PASS
3. `pnpm typecheck` で型整合性確認

---

## 7. リスクと対策

| リスク                                                         | 影響度 | 発生確率 | 対策                                                                                    |
| -------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| `typeof` チェックへの置換で TypeScript のナロイングが変わる    | 低     | 低       | `pnpm typecheck` で即座に検出可能。エラーが出た場合はガード条件を追加する               |
| `handlePermissionCheck` のバリデーション強化で既存動作が変わる | 中     | 低       | 既存テストで動作変化を検出。変化した場合はテストを更新して意図を明示する                |
| 共通ユーティリティ関数抽出により他のコードへの影響が発生する   | 低     | 低       | ユーティリティ関数は `SkillExecutor.ts` 内の private 関数として定義し、外部に公開しない |

---

## 8. 参照情報

### システム仕様書

| 仕様書                                                                                                 | 関連セクション                    |
| ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`              | sanitizeArgs 実装仕様、引数型定義 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-safety-gate-permission-fallback.md` | 苦戦箇所7（P49 as キャスト多用）  |

### 関連ドキュメント

| ドキュメント                    | パス                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| 既知の落とし穴（P49, P19, P42） | `.claude/rules/06-known-pitfalls.md`                                                 |
| コード品質ルール                | `.claude/rules/02-code-quality.md`                                                   |
| SkillExecutor 実装              | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              |
| Hook フォールバックテスト       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` |

---

## 9. 備考

### 関連タスク

| タスクID                           | 関係   | 説明                                           |
| ---------------------------------- | ------ | ---------------------------------------------- |
| UT-06-005-A                        | 発見元 | Hook フォールバック統合（sanitizeArgs 実装元） |
| UT-06-005-A-PERMISSION-RESOLVER-DI | 関連   | 同タスクの Phase 12 で発見された別未タスク     |

---

### 苦戦箇所と教訓

以下は UT-06-005-A Phase 12 コード品質分析で記録された苦戦箇所の「5分解決カード」テーブルです。同種の課題に直面した場合に参照してください。

#### 同種課題の5分解決カード

| #   | 苦戦箇所                                                   | 症状                                                                                           | 根本原因                                                                                                          | 解決パターン                                                                                                              | 参照 Pitfall |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | `sanitizeArgs` 内 `as string` 多用（9箇所）                | `grep "as string"` で 9 件ヒット。TypeScript コンパイルは通るが P49 非準拠                     | `Record<string, unknown>` 型のプロパティアクセスで `typeof` チェック後に `as string` キャストを追加してしまう習慣 | `typeof arg === "string" ? arg : ""` パターンで `as` キャスト不要（TypeScript が自動ナロイング）                          | P49, P19     |
| 2   | `handlePermissionCheck` 引数バリデーション未実装           | 空白文字列（`"   "`）が private メソッドに到達する可能性                                       | 「private メソッドだから呼び出し元が保証する」という前提で防御的バリデーションを省略                              | 外部 Hook から呼ばれる経路がある場合は `typeof !== "string" \|\| .trim() === ""` の 3段バリデーション（P42 準拠）を追加   | P42          |
| 3   | `args` の型が `Record<string, unknown>` でプロパティ非存在 | `typeof args.command === "string"` だけでは、プロパティ自体が存在しない場合の意図が不明確      | `in` 演算子ガードなしに `typeof` チェックを書くと、プロパティ存在の確認が暗黙になる                               | `"command" in args &&` を先頭に追加して、プロパティ存在を明示的に検証する（P49 完全準拠版）                               | P49          |
| 4   | type predicate 内での `as Record<string, unknown>`         | `(item as Record<string, unknown>).field` で P19 違反                                          | `item` が `unknown` 型のため、プロパティアクセスに `as` キャストが必要に見える                                    | `item != null && typeof item === "object" && "field" in item` の順で型ナロイングを行うと `as` キャスト不要                | P49, P19     |
| 5   | `as string` 除去後の TypeScript エラー                     | `as string` を消すと「`string \| undefined` は `string` に代入できない」エラーが出る場合がある | `in` 演算子ガードや `typeof` チェックを伴わずに `as string` だけ除去すると TypeScript が型を絞り込めない          | `typeof arg === "string" ? arg : ""` の三項演算子パターンで同時に置換することで TypeScript が正しく `string` 型を推論する | P49          |
