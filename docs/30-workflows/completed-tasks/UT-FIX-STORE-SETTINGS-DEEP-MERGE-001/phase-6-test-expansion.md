# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 6                                            |
| 機能名     | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 5                                      |
| 後続Phase  | Phase 7                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

エッジケースと回帰テストを追加し、品質を強化する。Phase 5 で Green になった TC-01〜TC-05 に加え、深いネスト・空オブジェクト・undefined 省略・update/get 往復・入力検証・prototype pollution 防止の観点でテストカバレッジを拡充する。

## 背景

Phase 5 で `deepMerge` の基本動作を Green にした。しかし、3 階層以上のネスト・空オブジェクト・undefined キー・update/get 往復・入力検証・危険キー除外はまだカバーされていない。回帰リスクと品質強化のため、追加テストケースを設計する。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                           |
| ---------- | ---------------- | -------------------------------- |
| SubAgent-A | IPC/ストア責務   | deepMerge の再帰動作・エッジ挙動 |
| SubAgent-B | 型契約・型安全性 | エッジケース入力の型整合確認     |
| SubAgent-C | テスト設計・実行 | 追加 TC 設計・全件 PASS 確認     |
| SubAgent-D | 統合監査         | 矛盾・漏れ・整合・依存判定       |

## 実行タスク

- エッジケース追加: 境界値テストを設計する
- 回帰テスト実行: 既存テスト全件 PASS を確認する
- 異常系検証: 不正入力パターンの動作を確認する

### 追加テストケース一覧

| TC ID | タイトル                                             | 入力（現在値）                                                 | 更新ペイロード                                                                                                | 期待値                                                   |
| ----- | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-06 | 3 階層以上のネストオブジェクトのマージ               | `{ a: { b: { c: "old", d: "keep" } } }`                        | `{ a: { b: { c: "new" } } }`                                                                                  | `{ a: { b: { c: "new", d: "keep" } } }`                  |
| TC-07 | 空オブジェクトを patch した場合                      | `{ theme: { color: "dark" } }`                                 | `{}`                                                                                                          | `{ theme: { color: "dark" } }`（変化なし）               |
| TC-08 | patch が空オブジェクトの子を持つ場合                 | `{ theme: { color: "dark" } }`                                 | `{ theme: {} }`                                                                                               | `{ theme: { color: "dark" } }`（変化なし）               |
| TC-09 | undefined 値のキーは省略される                       | `{ language: "ja" }`                                           | `{ language: undefined }`                                                                                     | `{ language: "ja" }`（undefined キーはスキップ）         |
| TC-10 | `settings:update` 後に `settings:get` で同じ値が返る | `{ theme: { color: "dark", size: "medium" }, language: "ja" }` | `{ theme: { color: "light" } }`                                                                               | update 後の merged 値が `settings:get` でそのまま返る    |
| TC-11 | 非 plain object の payload を拒否                    | `{ theme: { color: "dark" } }`                                 | `[]`                                                                                                          | validation error を返し、store は更新しない              |
| TC-12 | 危険キーを無視し prototype pollution を防ぐ          | `{}`                                                           | `{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true}}` | `__proto__` / `constructor` / `prototype` は保存されない |

## 参照資料

| 参照資料         | パス                                              | 説明           |
| ---------------- | ------------------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`           | Phase 4 成果物 |
| Red 結果         | `outputs/phase-4/red-test-result.md`              | Phase 4 成果物 |
| 統合テスト計画   | `outputs/phase-4/integration-test-plan.md`        | Phase 4 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |
| テストファイル   | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト対象     |

## 実行手順

1. Phase 4〜5 成果物（`outputs/phase-4/`, `outputs/phase-5/`）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. TC-06〜TC-12 をテストファイルに追加し、`pnpm --filter @repo/desktop test:run` で全件 PASS を確認する。
4. TC-01〜TC-05 の回帰 PASS をログで記録する。
5. 成果物を `outputs/phase-6/` に定義する。
6. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C のエッジケース設計・型確認・テスト実行を並列で進める。
- SubAgent-D が統合順序を直列で確定する。
- `settings:update` / `settings:get` を統合対象に固定する。
- TC-01〜TC-05（Phase 4 設計）が引き続き PASS することを回帰ログで確認する。
- TC-11 / TC-12 で入力検証と安全性を確認する。
- 拡充テスト実行ログは `outputs/phase-6/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 矛盾     | TC-06〜TC-12 の期待値が TC-01〜TC-05 の挙動定義（配列・null・undefined）と矛盾しないか確認する                                          |
| 漏れ     | 3 階層ネスト・空オブジェクト・undefined・update/get 往復・入力検証・prototype pollution の 6 パターンが全て TC に含まれているか確認する |
| 整合性   | 追加 TC の入力型が `Settings` 型定義と整合しているか確認する                                                                            |
| 依存関係 | Phase 5 Green 結果が存在し、Phase 6 での追加 TC が新たな Red を生じさせないか確認する                                                   |

## サブタスク管理

1. Phase 4〜5 成果物の確認
2. SubAgent-A/B/C の並列作業（エッジケース設計・型確認・テスト実行）
3. SubAgent-D の統合判定
4. 回帰 PASS ログの保存
5. 成果物出力
6. 完了条件判定

## 成果物

| 成果物           | パス                                        | 説明                          |
| ---------------- | ------------------------------------------- | ----------------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | TC-06〜TC-12 の追加テスト一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | TC-01〜TC-12 全件 PASS 記録   |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | エッジケース検証結果          |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-06〜TC-12 が全件テストファイルに追加されている
- [ ] TC-01〜TC-12 が全件 PASS（回帰含む）であることを確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## 次のPhase

Phase 7: テストカバレッジ確認
