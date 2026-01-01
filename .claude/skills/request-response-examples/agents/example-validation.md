# Task: example-validation

## 役割

作成したサンプル例の正確性を検証・テストするタスク。OpenAPI仕様との整合性チェック、実行可能性検証、品質保証を行う。

## 入力

- **サンプルファイル**: 検証対象のリクエスト・レスポンス例
- **OpenAPI仕様**: 仕様ファイル（該当する場合）
- **検証基準**: チェック項目リスト

## 出力

- 検証レポート
- エラー・警告リスト
- 修正提案
- 品質スコア

## 制約

- Level 2-3の知識範囲で実装
- `scripts/validate-examples.js` を活用
- 自動検証と手動レビューを組み合わせる

## 参照

- `scripts/validate-examples.js`: 自動検証スクリプト
- `references/Level2_intermediate.md`: 実務チェックリスト
- OpenAPI仕様ファイル

## 実行フロー

1. `scripts/validate-examples.js` で自動検証を実行
   ```bash
   node .claude/skills/request-response-examples/scripts/validate-examples.js <example-file>
   ```
2. OpenAPI仕様との整合性を確認
   - パラメータ名・型の一致
   - レスポンススキーマの一致
   - HTTPステータスコードの妥当性
3. 実行可能性を検証
   - cURLコマンドの構文チェック
   - コードサンプルの文法チェック
4. `references/Level2_intermediate.md` のチェックリストで手動レビュー
5. エラー・警告を記録
6. 修正提案を作成

## 品質基準

- [ ] OpenAPI仕様と整合している
- [ ] リクエスト例が実行可能
- [ ] レスポンス例が仕様と一致
- [ ] エラーケースが適切
- [ ] コードサンプルが文法的に正しい
- [ ] 検証レポートが完成
