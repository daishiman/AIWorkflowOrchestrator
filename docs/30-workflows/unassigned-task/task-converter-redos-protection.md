# 正規表現タイムアウト実装（ReDoS対策） - タスク指示書

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | CONV-DEBT-004                         |
| タスク名     | 正規表現タイムアウト実装（ReDoS対策） |
| 分類         | 改善/セキュリティ                     |
| 対象機能     | MarkdownConverter、CodeConverter      |
| 優先度       | 低                                    |
| 見積もり規模 | 小規模（約4時間）                     |
| ステータス   | 未実施                                |
| 発見元       | Phase 7 最終アーキテクチャレビュー    |
| 発見日       | 2025-12-25                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

MarkdownConverterとCodeConverterは、構造抽出に複数の正規表現を使用していますが、正規表現レベルのタイムアウト機構がありません。

**レビュー指摘の原文**:

```
技術的負債: 正規表現タイムアウト実装（ReDoS対策）
優先度: Low
見積工数: 4h
```

現在のReDoS対策:

- ✅ 安全な正規表現パターン使用（後方参照・ネスト量指定子回避）
- ✅ ConversionServiceの60秒タイムアウト
- ❌ 正規表現レベルのタイムアウトなし ← 追加が必要

多層防御の観点から、正規表現レベルでもタイムアウトを実装すべきです。

### 1.2 問題点・課題

**問題1: 悪意あるパターンへの防御が不完全**

大量の繰り返し文字（"a"×100000）で正規表現マッチングが長時間実行される可能性があります。

**問題2: 防御層が単層**

ConversionServiceのタイムアウト（60秒）のみで、正規表現レベルの防御がありません。

**問題3: エラーメッセージの不明確性**

タイムアウト発生時に、どの正規表現が原因かが不明です。

### 1.3 放置した場合の影響

**短期的影響**:

- 悪意あるパターンで処理時間増大
- 軽微なセキュリティリスク

**長期的影響**:

- セキュリティ監査での指摘
- 本番環境での予期しないハング

---

## 2. 何を達成するか（What）

### 2.1 目的

正規表現マッチング処理にタイムアウト機構を追加し、ReDoS攻撃パターンへの防御を多層化する。

### 2.2 最終ゴール

- 正規表現タイムアウト: 各正規表現に1秒のタイムアウト
- 詳細なエラー情報: タイムアウト発生時の正規表現パターンを記録
- フォールバック処理: タイムアウト時は構造抽出をスキップして続行
- セキュリティテスト: ReDoS攻撃パターンで2秒以内に完了
- ドキュメント: セキュリティガイドラインに追記

### 2.3 スコープ

#### 含むもの

- `matchWithTimeout()` ユーティリティ関数実装（regex-utils.ts）
- MarkdownConverterの全正規表現にタイムアウト適用
- CodeConverterの全正規表現にタイムアウト適用
- タイムアウト時の警告ログ出力
- `REGEX_TIMEOUT` エラーコード追加
- セキュリティテスト8ケース追加

#### 含まないもの

- 正規表現の完全な書き換え（既存パターンは安全なので維持）
- 他のタイムアウト機構（ConversionServiceのタイムアウトは既存）
- バイナリファイルの処理

### 2.4 成果物

| 成果物                      | パス                                                                       | 内容                   |
| --------------------------- | -------------------------------------------------------------------------- | ---------------------- |
| 正規表現ユーティリティ      | `packages/shared/src/services/conversion/regex-utils.ts`                   | matchWithTimeout()実装 |
| ユーティリティテスト        | `packages/shared/src/services/conversion/__tests__/regex-utils.test.ts`    | ユーティリティテスト   |
| 更新されたMarkdownConverter | `packages/shared/src/services/conversion/converters/markdown-converter.ts` | タイムアウト適用       |
| 更新されたCodeConverter     | `packages/shared/src/services/conversion/converters/code-converter.ts`     | タイムアウト適用       |
| セキュリティテスト          | `packages/shared/src/services/conversion/__tests__/security.test.ts`       | ReDoSテスト8ケース     |
| セキュリティガイド更新      | `docs/00-requirements/17-security-guidelines.md`                           | タイムアウト機構追記   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし（独立タスク）

### 3.2 依存タスク

- なし（独立タスク）

### 3.3 必要な知識・スキル

- Promise.race()の理解
- ReDoS（Regular Expression Denial of Service）の理解
- 正規表現のバックトラッキング動作の理解

### 3.4 推奨アプローチ

軽量な実装アプローチ：

1. Promise.race()でタイムアウト実現（Worker Threads不要）
2. タイムアウト時はnullを返す（例外をスローしない）
3. フォールバック処理（構造抽出スキップ、変換は続行）
4. 既存の安全な正規表現パターンは変更しない

---

## 4. 実行手順

### Phase構成

```
Phase 1: regex-utils.ts実装（matchWithTimeout関数）
Phase 2: regex-utils.test.ts実装
Phase 3: MarkdownConverter更新
Phase 4: CodeConverter更新
Phase 5: セキュリティテスト追加（ReDoS攻撃パターン）
Phase 6: ドキュメント更新
Phase 7: 品質ゲート確認
```

### Phase 1: regex-utils.ts実装

#### Claude Code スラッシュコマンド

```
手動実装
```

#### 目的

Promise.race()を使用したタイムアウト付き正規表現マッチング関数を実装

#### 成果物

regex-utils.ts（matchWithTimeout関数）

#### 完了条件

- [ ] matchWithTimeout()実装完了
- [ ] デフォルトタイムアウト: 1秒
- [ ] タイムアウト時はnullを返す

---

### Phase 2: regex-utils.test.ts実装

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests
```

#### 目的

matchWithTimeout()の正常動作を検証

#### 完了条件

- [ ] 正常なマッチングテスト
- [ ] タイムアウト発生テスト
- [ ] 全テストPASS

---

### Phase 3: MarkdownConverter更新

#### 目的

extractHeaders(), extractLinks(), countCodeBlocks()にタイムアウト適用

#### 完了条件

- [ ] 全正規表現にmatchWithTimeout()適用
- [ ] タイムアウト時の警告ログ実装
- [ ] 既存54テスト全てPASS

---

### Phase 4: CodeConverter更新

#### 目的

extractJSStructure(), extractPythonStructure()にタイムアウト適用

#### 完了条件

- [ ] 全正規表現にmatchWithTimeout()適用
- [ ] タイムアウト時の警告ログ実装
- [ ] 既存51テスト全てPASS

---

### Phase 5: セキュリティテスト追加

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests
```

#### 目的

ReDoS攻撃パターンへの防御を検証

#### 成果物

security.test.ts（8テストケース）

#### 完了条件

- [ ] ReDoS攻撃パターンテスト実装
- [ ] タイムアウト動作確認テスト実装
- [ ] フォールバック処理テスト実装
- [ ] 全8テストPASS

---

### Phase 6: ドキュメント更新

#### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

#### 完了条件

- [ ] 17-security-guidelines.md更新
- [ ] 05-architecture.mdの技術的負債から削除

---

### Phase 7: 品質ゲート確認

#### Claude Code スラッシュコマンド

```
/ai:lint --fix
```

#### 完了条件

- [ ] ESLint 0エラー
- [ ] TypeScript 0エラー
- [ ] 既存201テスト + 新規8テスト = 209テスト全てPASS
- [ ] カバレッジ100%

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] matchWithTimeout()関数実装済み
- [ ] デフォルトタイムアウト: 1秒
- [ ] MarkdownConverterの全正規表現にタイムアウト適用済み
- [ ] CodeConverterの全正規表現にタイムアウト適用済み
- [ ] タイムアウト時は警告ログを出力

### 品質要件

- [ ] 既存201テスト全てPASS
- [ ] 新規セキュリティテスト8ケース全てPASS
- [ ] テストカバレッジ100%維持
- [ ] ESLintエラー: 0
- [ ] TypeScriptエラー: 0

### ドキュメント要件

- [ ] 17-security-guidelines.md更新済み
- [ ] 05-architecture.mdの技術的負債から削除済み

---

## 6. 検証方法

### テストケース

**セキュリティテスト（8ケース）**:

- ReDoS攻撃パターン（"a"×100000）で2秒以内に完了
- タイムアウト発生時も変換成功
- 警告ログが出力される
- 部分的な結果が返される
- 複数正規表現の同時タイムアウト
- 正常な入力でタイムアウトしない
- マッチ結果が既存実装と一致
- タイムアウト後のクリーンアップ

### 検証手順

1. セキュリティテスト実行: `pnpm test security.test.ts`
2. ReDoS攻撃パターンで手動検証
3. ログ出力確認
4. 既存テスト実行: `pnpm test`
5. カバレッジ確認: `pnpm test:coverage`

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                              |
| -------------------------------------- | ------ | -------- | ------------------------------------------------- |
| パフォーマンス劣化                     | 中     | 低       | Promise.race()のオーバーヘッドは<1ms              |
| 誤検知（正常なパターンがタイムアウト） | 中     | 低       | タイムアウト時間を1秒に設定（現状は数ms〜数十ms） |
| フォールバック時の品質低下             | 低     | 低       | 通常のパターンではタイムアウトしない              |

---

## 8. 参照情報

### 関連ドキュメント

- [17-security-guidelines.md](../../00-requirements/17-security-guidelines.md) - 17.4.6 正規表現のセキュリティ
- [05-architecture.md](../../00-requirements/05-architecture.md) - 5.2A.7 技術的負債

### 参考資料

- [OWASP ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
- [Node.js Promise.race()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 7 最終アーキテクチャレビュー - 技術的負債リスト

ID: CONV-DEBT-004
内容: 正規表現タイムアウト実装（ReDoS対策）
優先度: Low
見積工数: 4h
```

### 補足事項

- 現在の正規表現パターンは既に安全（後方参照・ネスト量指定子を回避済み）ですが、多層防御の観点からタイムアウトを追加します
- タイムアウト発生時は構造抽出をスキップしますが、変換自体は成功するため、ユーザーは基本的なテキストを取得できます
- Promise.race()のオーバーヘッドは無視できるレベル（<1ms）です
