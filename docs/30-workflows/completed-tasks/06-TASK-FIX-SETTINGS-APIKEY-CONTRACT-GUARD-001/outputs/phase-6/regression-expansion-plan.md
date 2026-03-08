# Phase 6: テスト拡充計画

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## 計測日

2026-03-08

## 概要

Phase 4-5 で実装した防御テスト（RED-01〜RED-03b）に対し、Phase 6 ではカバレッジギャップ（GAP-01〜GAP-05）を補完するテストを拡充した。

## テスト拡充仕様

### EXP-01: result.data が undefined/null の場合のフォールバック

- **GAP ID**: GAP-01, GAP-01b
- **テストファイル**: `ApiKeysSection.test.tsx`
- **実装状況**: 実装済み
- **テスト名**:
  - `GAP-01: result.data が undefined の場合、エラーメッセージにフォールバックする`
  - `GAP-01b: result.data が null の場合、エラーメッセージにフォールバックする`
- **検証内容**: `result.success === true` かつ `result.data === undefined/null` の場合、エラーメッセージを表示しクラッシュしないこと

### EXP-02: providers が空配列の場合

- **GAP ID**: GAP-02
- **テストファイル**: `ApiKeysSection.test.tsx`
- **実装状況**: 実装済み
- **テスト名**: `GAP-02: providers が空配列の場合、全プロバイダーが未登録として表示される`
- **検証内容**: `providers: []` の場合、全4プロバイダーが「未登録」として表示されること

### EXP-03: providers 配列要素の malformed データ

- **GAP ID**: GAP-03, GAP-03b, GAP-03c
- **テストファイル**: `ApiKeysSection.test.tsx`
- **実装状況**: 実装済み
- **テスト名**:
  - `GAP-03: providers 配列要素の provider フィールドが欠損した場合、該当要素をスキップする`
  - `GAP-03b: providers 配列要素の status フィールドが欠損した場合、該当要素をスキップする`
  - `GAP-03c: 正常要素と malformed 要素が混在する場合、正常要素のみ使用される`
- **検証内容**: P49 準拠（`in` 演算子 + `typeof`）で malformed 要素をフィルタし、正常要素のみ描画すること

### EXP-04: apiKey.list() が reject した場合

- **GAP ID**: GAP-04
- **テストファイル**: `ApiKeysSection.test.tsx`
- **実装状況**: 実装済み
- **テスト名**: `GAP-04: apiKey.list() が reject した場合、エラー表示して画面は継続描画される`
- **検証内容**: Promise rejection が発生してもコンポーネントがクラッシュせずエラー表示すること

### EXP-05: Main Process providers 配列バリデーション

- **GAP ID**: GAP-05
- **テストファイル**: `apiKeyHandlers.list.test.ts`
- **実装状況**: 実装済み（7テスト）
- **テスト名**:
  - `providers が null の場合、空配列にフォールバックする`
  - `providers が undefined の場合、空配列にフォールバックする`
  - `providers が非配列（文字列）の場合、空配列にフォールバックする`
  - `listProviders が null を返す場合、空配列にフォールバックする`
  - `正常な providers 配列の場合、registeredCount を正しく再計算する`
  - `status フィールドが欠損した provider は registered にカウントされない`
  - `listProviders が例外を投げる場合、エラーレスポンスを返す`
- **検証内容**: P48 準拠の `Array.isArray` ガードが Main Process 側でも機能すること

## テスト数サマリ

| テストファイル              | テスト数 | 新規追加                  |
| --------------------------- | -------- | ------------------------- |
| ApiKeysSection.test.tsx     | 46       | GAP-01〜GAP-04（7テスト） |
| apiKeyHandlers.list.test.ts | 7        | GAP-05（7テスト）         |
| apiKeyHandlers.test.ts      | 28       | 既存（変更なし）          |
| **合計**                    | **81**   | **14**                    |
