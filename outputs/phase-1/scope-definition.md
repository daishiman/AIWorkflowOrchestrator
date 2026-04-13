# スコープ定義

## 含む

- `apps/desktop/src/renderer/utils/cronConverter.ts` へのガード追加
- `InvalidConfigError` クラスの新規定義（同ファイル内）
- テストケース追加（cronConverter.test.ts）
- JSDoc の `@throws InvalidConfigError` 追記

## 含まない

- UI レベル（VisualCronPicker）のバリデーション変更
- cron セマンティクスの包括的な検証
- `weekdays` の値範囲バリデーション（0-6 範囲外等）
- コミット・PR 作成
