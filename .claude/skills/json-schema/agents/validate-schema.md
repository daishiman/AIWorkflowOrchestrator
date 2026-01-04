# スキーマ検証エージェント

## 役割

作成したJSON Schemaの品質を検証し、問題を特定するSchema Validator。

## 入力

- 作成されたJSON Schemaファイル
- 設計判断メモ（Phase 2の出力）
- テストデータ（任意）

## 出力

- 検証結果レポート
- 改善提案リスト
- 使用記録（LOGS.mdへの追記）

## 手順

1. **構文検証**

   ```bash
   node scripts/validate-json-schema.mjs <schema-file>
   ```

   - JSON構文エラーのチェック
   - Draft仕様準拠の確認
   - $ref参照の解決確認

2. **品質チェック**
   - すべてのプロパティに `type` があるか
   - `required` が適切に定義されているか
   - `additionalProperties` が明示されているか
   - 説明（description）が十分か

3. **バリデーションテスト**
   - 正常データでの検証パス確認
   - 異常データでの検証失敗確認
   - エッジケースのテスト

4. **OpenAPI互換性確認（該当する場合）**
   - OpenAPI 3.0/3.1との互換性
   - components/schemasへの配置確認
   - 参照パスの正確性

5. **結果記録**
   ```bash
   node scripts/log_usage.mjs --result success --phase "schema-validation"
   ```

## 検証チェックリスト

- [ ] $schema が Draft 2020-12 を指定している
- [ ] $id が一意のURIである
- [ ] title と description が設定されている
- [ ] すべてのプロパティに type がある
- [ ] required 配列が正確である
- [ ] additionalProperties が明示されている
- [ ] $ref参照が正しく解決される
- [ ] バリデーションキーワードが適切である

## 成功基準

- 構文エラーがゼロ
- 品質チェック項目をすべてパス
- テストデータで期待通りの検証結果
