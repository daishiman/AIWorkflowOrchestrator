# AST-basedコード解析への移行 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-DEBT-002                      |
| タスク名     | AST-basedコード解析への移行        |
| 分類         | 改善/品質向上                      |
| 対象機能     | CodeConverter（ソースコード変換）  |
| 優先度       | 低                                 |
| 見積もり規模 | 中規模（約16時間）                 |
| ステータス   | 未実施                             |
| 発見元       | Phase 7 最終アーキテクチャレビュー |
| 発見日       | 2025-12-25                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のCodeConverterは正規表現ベースでコード構造（関数、クラス、インポート等）を抽出していますが、Phase 7の最終アーキテクチャレビューで以下の制限が指摘されました：

**レビュー指摘の原文**:

```
制限事項: 正規表現ベース解析 - AST（抽象構文木）を使用しない
影響範囲: CodeConverter - 複雑な構文の一部が抽出されない可能性
```

現在の正規表現ベース実装では、以下のような複雑なパターンを正確に抽出できません：

- ネストした関数定義（クロージャ、IIFE）
- ジェネリック型パラメータ付きのクラス・関数
- デフォルト引数やRest/Spreadパラメータ
- デコレーター（Python @decorator、TypeScript Decorator）
- 複雑な型定義（Union型、Intersection型）

### 1.2 問題点・課題

**問題1: 複雑な構文の抽出漏れ**

正規表現では以下を正確に抽出できない：

- `async <T extends BaseType>(param: Options = defaults): Promise<Result<T>>`
- Pythonのデコレーター付きメソッド
- TypeScriptのジェネリック制約

**問題2: 型情報の欠如**

関数・クラスの詳細な型情報（引数型、戻り値型、ジェネリック制約）が抽出できないため、RAG検索の精度が低下します。

**問題3: コメントとコードの関連付けが不完全**

JSDoc/Docstringとコードの紐付けができず、ドキュメント情報を活用できません。

### 1.3 放置した場合の影響

**短期的影響**:

- 複雑なコードベースでのRAG検索精度低下
- メタデータ抽出の不完全性

**長期的影響**:

- コード理解支援機能の制限
- 技術的負債の蓄積

---

## 2. 何を達成するか（What）

### 2.1 目的

TypeScript Compiler APIとBabelを使用して、AST（抽象構文木）ベースの正確なコード解析を実現し、複雑な構文や型情報を完全に抽出可能にする。

### 2.2 最終ゴール

- TypeScript/JavaScriptのジェネリック・デフォルト引数・デコレーター対応
- 関数の引数型・戻り値型の抽出
- インターフェース/型エイリアス/Enumの完全抽出
- JSDoc/Docstringとコードの関連付け
- パフォーマンス維持（<10KBで<20ms、1MBで<100ms）
- 後方互換性（ExtractedMetadata型は拡張のみ）
- テストカバレッジ100%維持

### 2.3 スコープ

#### 含むもの

- TypeScript Compiler API統合（`typescript` ライブラリ）
- Babel Parser統合（`@babel/parser`）
- AST解析ユーティリティ（`ast-utils.ts`）
- CodeStructure型の拡張（FunctionInfo, ClassInfo, TypeInfo）
- 既存51テスト維持 + 新規26テスト追加
- 後方互換性の確保（`custom.functions`文字列配列を維持）

#### 含まないもの

- セマンティック解析（変数スコープ、参照解決）
- 実行時情報の抽出
- コード品質メトリクス（Cyclomatic Complexity）
- 他言語対応（Rust, Go, Java等）

### 2.4 成果物

| 成果物                  | パス                                                                                  | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| ASTユーティリティ       | `packages/shared/src/services/conversion/converters/ast-utils.ts`                     | AST解析ヘルパー関数  |
| ASTユーティリティテスト | `packages/shared/src/services/conversion/converters/__tests__/ast-utils.test.ts`      | ユーティリティテスト |
| 拡張されたCodeConverter | `packages/shared/src/services/conversion/converters/code-converter.ts`                | AST解析統合          |
| 拡張されたテスト        | `packages/shared/src/services/conversion/converters/__tests__/code-converter.test.ts` | 26テスト追加         |
| API仕様更新             | `docs/30-api/converters/code-converter.md`                                            | 型情報抽出機能追記   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- PlainTextConverter実装完了（CONV-DEBT-001）
- 既存CodeConverterテスト51ケースが全てPASS
- TypeScript 5.7.0環境

### 3.2 依存タスク

- なし（独立タスク、ただしCONV-DEBT-001完了後が推奨）

### 3.3 必要な知識・スキル

- TypeScript Compiler API の基礎知識
- Babel Parser の基礎知識
- AST（抽象構文木）の概念理解
- Visitor Patternの理解

### 3.4 推奨アプローチ

段階的な移行アプローチを推奨：

1. AST解析ユーティリティを独立したモジュールとして実装
2. 既存の正規表現ベース実装を残しつつ、AST-basedを並行実装
3. 後方互換性を確保（既存フィールドは削除せず、新規フィールドを追加）
4. パフォーマンステストでオーバーヘッドを計測
5. 必要に応じてキャッシング実装

---

## 4. 実行手順

### Phase構成

```
Phase 1: 依存関係追加（pnpm add）
Phase 2: AST解析ユーティリティ実装（TDD Red）
Phase 3: ユーティリティテスト実装（TDD Green）
Phase 4: CodeConverter拡張（AST統合）
Phase 5: 新規テストケース追加（26ケース）
Phase 6: パフォーマンステスト
Phase 7: ドキュメント更新
Phase 8: 品質ゲート確認
```

### Phase 1: 依存関係追加

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> タスクに最適なコマンドを `.claude/commands/ai/command_list.md` から選定して実行してください

```
手動実行（Bashツール使用）
```

#### 目的

TypeScript Compiler APIとBabel Parserをpackages/sharedに追加

#### 成果物

更新されたpackage.json（typescript, @babel/parser追加）

#### 完了条件

- [ ] `pnpm --filter @repo/shared add typescript @babel/parser` 実行成功
- [ ] package.jsonに依存追加確認

---

### Phase 2: AST解析ユーティリティ実装（TDD Red）

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 目的

AST解析のヘルパー関数を実装し、テストファーストで品質を担保

#### 成果物

- `ast-utils.ts`: parseTypeScript, parseJavaScript, extractFunctionsFromAST等
- `ast-utils.test.ts`: ユーティリティのテスト

#### 完了条件

- [ ] ast-utils.ts実装完了
- [ ] ast-utils.test.ts作成完了
- [ ] テスト実行でRed確認（実装前なので失敗）

---

### Phase 3: ユーティリティテスト成功（TDD Green）

#### 目的

ast-utils.tsの実装を完成させ、全テストをPASSさせる

#### 完了条件

- [ ] ast-utils.test.ts全テストPASS
- [ ] カバレッジ100%

---

### Phase 4: CodeConverter拡張

#### Claude Code スラッシュコマンド

```
手動実装（既存コードの段階的置き換え）
```

#### 目的

extractJSStructure()メソッドを正規表現ベースからAST-basedに置き換え

#### 成果物

更新されたcode-converter.ts

#### 完了条件

- [ ] extractJSStructure()のAST-based実装完了
- [ ] extractPythonStructure()は現状維持（Pythonは将来対応）
- [ ] 既存51テスト全てPASS

---

### Phase 5: 新規テストケース追加

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests
```

#### 目的

ジェネリック・デフォルト引数・型情報抽出のテストを追加

#### 成果物

code-converter.test.tsに26テスト追加（合計77テスト）

#### 完了条件

- [ ] 26新規テスト追加
- [ ] 全77テストPASS
- [ ] カバレッジ100%維持

---

### Phase 6: パフォーマンステスト

#### 目的

AST解析のパフォーマンス影響を計測

#### 完了条件

- [ ] <10KB: <20ms達成
- [ ] 100KB: <50ms達成
- [ ] 1MB: <100ms達成

---

### Phase 7: ドキュメント更新

#### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

#### 目的

API仕様とアーキテクチャドキュメントを更新

#### 完了条件

- [ ] docs/00-requirements/05-architecture.md更新
- [ ] docs/30-api/converters/code-converter.md更新

---

### Phase 8: 品質ゲート確認

#### Claude Code スラッシュコマンド

```
/ai:lint --fix
```

#### 完了条件

- [ ] ESLint 0エラー
- [ ] TypeScript 0エラー
- [ ] 全77テストPASS
- [ ] カバレッジ100%
- [ ] ビルド成功

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TypeScript Compiler API統合済み
- [ ] @babel/parser統合済み
- [ ] ジェネリック型パラメータ抽出可能
- [ ] 関数の引数型・戻り値型抽出可能
- [ ] インターフェース/型エイリアス/Enum抽出可能
- [ ] 後方互換性維持（custom.functions文字列配列）

### 品質要件

- [ ] 既存51テスト + 新規26テスト = 77テスト全てPASS
- [ ] テストカバレッジ100%（全指標）
- [ ] ESLintエラー: 0
- [ ] TypeScriptエラー: 0
- [ ] ビルド成功

### ドキュメント要件

- [ ] 05-architecture.md更新済み
- [ ] code-converter.md API仕様更新済み
- [ ] rag-conversion-guide.md使用例追加済み

---

## 6. 検証方法

### テストケース

**ジェネリック関数抽出（5ケース）**:

- 単一型パラメータ `<T>`
- 複数型パラメータ `<T, U>`
- 制約付き型パラメータ `<T extends BaseType>`
- デフォルト型パラメータ `<T = string>`
- ネストしたジェネリック `<T extends Array<U>>`

**複雑な引数（5ケース）**:

- デフォルト引数 `(a = 10)`
- Rest パラメータ `(...args: string[])`
- Destructuring `({ option1, option2 })`
- オプショナル引数 `(a?: string)`
- 複合型引数 `(a: string | number)`

**型定義抽出（5ケース）**:

- Interface定義
- Type Alias
- Enum定義
- Union型
- Intersection型

**パフォーマンステスト（3ケース）**:

- 小ファイル（<10KB）: <20ms
- 中ファイル（100KB）: <50ms
- 大ファイル（1MB）: <100ms

**後方互換性テスト（3ケース）**:

- 既存51テスト全てPASS
- `custom.functions`（文字列配列）継続提供
- `custom.classes`（文字列配列）継続提供

### 検証手順

1. ユニットテスト実行: `pnpm --filter @repo/shared test`
2. カバレッジ確認: `pnpm --filter @repo/shared test:coverage`
3. パフォーマンステスト実行: 手動テストスクリプト
4. 型チェック: `pnpm typecheck`
5. ビルド確認: `pnpm --filter @repo/shared build`

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                                         |
| --------------------------- | ------ | -------- | ------------------------------------------------------------ |
| AST解析のパフォーマンス劣化 | 高     | 中       | キャッシング実装、大容量ファイルでは正規表現フォールバック   |
| 後方互換性の破壊            | 高     | 低       | 既存フィールド削除禁止、新規フィールドはオプショナル追加のみ |
| バンドルサイズ増加（+2MB）  | 中     | 高       | Tree Shaking、必要最小限のインポート                         |
| Python AST統合の複雑性      | 中     | 高       | 初期フェーズではTypeScript/JavaScriptのみ対応                |

---

## 8. 参照情報

### 関連ドキュメント

- [05-architecture.md](../../00-requirements/05-architecture.md) - 5.2A.7 技術的負債
- [05-architecture.md](../../00-requirements/05-architecture.md) - 5.2A.4 新規コンバーター追加手順
- [Code Converter API](../../30-api/converters/code-converter.md)

### 参考資料

- [TypeScript Compiler API Handbook](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [@babel/parser Documentation](https://babeljs.io/docs/babel-parser)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 7 最終アーキテクチャレビュー - 技術的負債リスト

ID: CONV-DEBT-002
内容: AST-basedコード解析への移行
優先度: Low
見積工数: 16h
```

### 補足事項

- 依存追加により約2MBのバンドルサイズ増加が見込まれます
- パフォーマンス劣化が許容範囲を超える場合は、正規表現ベースへのフォールバック実装を検討してください
- Python AST統合はNode.jsからPythonプロセス呼び出しが必要となるため、別タスクとして分離を推奨します
