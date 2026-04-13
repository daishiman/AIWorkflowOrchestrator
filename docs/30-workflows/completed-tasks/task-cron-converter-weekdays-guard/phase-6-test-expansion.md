# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 6                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 5                                  |
| 後続Phase  | Phase 7                                  |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

Phase 4 の基本テストを拡充し、エッジケース・回帰テストで品質を高める。

## 拡充テストケース

### weekdays エッジケース

| ケース     | 入力                        | 期待結果                     |
| ---------- | --------------------------- | ---------------------------- |
| 重複値あり | `weekdays: [0, 0]`          | `"0 9 * * 0"` に正規化される |
| 単一値     | `weekdays: [6]`             | `"0 9 * * 6"`                |
| 全曜日     | `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"`    |

### InvalidConfigError 詳細テスト

| ケース                              | 確認内容                                                  |
| ----------------------------------- | --------------------------------------------------------- |
| `err.name`                          | `"InvalidConfigError"`                                    |
| `err.message`                       | `"weekdays must not be empty when frequency is 'weekly'"` |
| `err instanceof Error`              | `true`                                                    |
| `err instanceof InvalidConfigError` | `true`                                                    |

### frequency 別回帰テスト

| frequency      | weekdays 状態 | 期待動作                      |
| -------------- | ------------- | ----------------------------- |
| `"daily"`      | `[]`          | エラーなし（weekdays 無関係） |
| `"every-hour"` | `[]`          | エラーなし（weekdays 無関係） |
| `"weekly"`     | `[0]`         | 正常変換                      |
| `"weekly"`     | `[]`          | InvalidConfigError            |

### 既存テストの回帰確認

- 既存の `cronConverter.ts` テストが全て Green のままであることを確認する。

## 実行手順

1. Phase 5 成果物を確認する。
2. エッジケーステストを追加する。
3. frequency 別回帰テストを追加する。
4. `pnpm --filter @repo/desktop test:run -- apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` を実行する。
5. 全テストが Green であることを確認する。

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | エッジケース一覧       |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰テスト実行結果     |
| エッジケース結果 | `outputs/phase-6/edge-case-result.md`       | エッジケーステスト結果 |

## コード成果物

| ファイル                                                          | 種別   | 説明                         |
| ----------------------------------------------------------------- | ------ | ---------------------------- |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | テスト | エッジケース・回帰テスト追加 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] エッジケーステストが追加されていること
- [ ] frequency 別回帰テストが追加されていること
- [ ] 全テストが Green であること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5 成果物確認
2. エッジケーステスト追加
3. 回帰テスト追加
4. 全テスト Green 確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
