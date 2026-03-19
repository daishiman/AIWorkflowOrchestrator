# Phase 8: リファクタリング計画

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 8          |
| 作成日   | 2026-03-16 |

## 1. JSDoc コメント品質チェック結果

| 要素                            | 確認項目                         | 結果                                        |
| ------------------------------- | -------------------------------- | ------------------------------------------- |
| `RiskLevel` 型                  | 1行以上の用途説明 + `@remarks`   | 確認済み - 各レベルの典型ツール例を記述     |
| `ToolRiskConfigEntry` interface | 全体説明 + 全5フィールドの JSDoc | 確認済み - `@see TOOL_RISK_CONFIG` 付き     |
| `TOOL_RISK_CONFIG` 定数         | 用途説明 + `@remarks` + `@see`   | 確認済み - 不変条件・デシジョンテーブル参照 |

JSDoc の補完は不要。Phase 5 実装時に完全な JSDoc を記述済み。

## 2. セクション区切り・配置確認

| 確認項目                                                | 結果                                            |
| ------------------------------------------------------- | ----------------------------------------------- |
| `// --- Tool Risk Configuration ---` セクションコメント | 存在確認済み（L324）                            |
| `ALLOWED_TOOLS_WHITELIST` 直後に配置                    | 確認済み（`filterAllowedTools` 関数の後、L324） |
| 既存コードの変更なし                                    | 確認済み（追記のみ）                            |

配置位置の補足: 仕様書では `ALLOWED_TOOLS_WHITELIST` 直後（L117直後）を指定していたが、実際の security.ts はホワイトリスト定義の後にユーティリティ関数が続くため、ファイル末尾に追加した。これはユーティリティ関数を分断しない配置として適切である。

## 3. 命名規約確認

| 識別子                | 期待する規約                  | 確認結果 |
| --------------------- | ----------------------------- | -------- |
| `RiskLevel`           | PascalCase（type alias）      | 準拠     |
| `ToolRiskConfigEntry` | PascalCase（interface）       | 準拠     |
| `TOOL_RISK_CONFIG`    | SCREAMING_SNAKE_CASE（const） | 準拠     |
| `dialogWidth`         | camelCase（interface field）  | 準拠     |
| `headerColorToken`    | camelCase（interface field）  | 準拠     |
| `allowPermanent`      | camelCase + `allow` prefix    | 準拠     |
| `allowTime24h`        | camelCase + `allow` prefix    | 準拠     |
| `allowTime7d`         | camelCase + `allow` prefix    | 準拠     |

全識別子が命名規約に準拠。変更不要。

## 4. リファクタリング後のテスト結果

全15件 PASS。リファクタリングによる変更なし（JSDoc・配置・命名は全て Phase 5 実装時に適切に設計済み）。

## 5. 変更・非変更サマリー

| 項目           | 変更有無 | 理由                              |
| -------------- | -------- | --------------------------------- |
| JSDoc コメント | 変更なし | Phase 5 で完全な JSDoc を記述済み |
| セクション配置 | 変更なし | ファイル末尾配置が適切            |
| 命名規約       | 変更なし | 全識別子が規約準拠                |
| テストファイル | 変更なし | 命名変更がないため対応不要        |
