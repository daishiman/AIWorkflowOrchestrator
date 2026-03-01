# Phase 4 テスト仕様

## 対象

- モジュール解決: `@repo/shared/types/auth`, `@repo/shared/types/api-keys`, `@repo/shared/types`
- ビルド成果物: `dist/src/types/` 配下の .js / .d.ts ファイル
- 設定同期: package.json exports / typesVersions, tsup.config.ts entry

## 新規テストファイル

- `module-resolution.test.ts`（5 tests） — 移行後の公開パス解決検証
- `build-artifacts.test.ts`（14 tests） — dist/ ディレクトリ構造の正否検証
- `config-sync.test.ts`（7 tests） — 4ファイル同期の整合性検証

## テスト戦略

- ベースラインテスト: 移行前の全テスト PASS を記録し、回帰テストの基準とする
- Red フェーズ: 移行後のパスを期待するテストを作成（Phase 5 実装前は FAIL）
- ファイルシステムテスト: `fs.existsSync` で dist/ 構造を直接検証
- 設定ファイルテスト: JSON.parse / テキスト検索で設定値を検証
- テスト実行は `cd packages/shared` から実行（P40 対策）

## テストケース総数

26 テスト（M: 5, D: 14, S: 7）

## 判定

（Phase 4 実行後に記入）
