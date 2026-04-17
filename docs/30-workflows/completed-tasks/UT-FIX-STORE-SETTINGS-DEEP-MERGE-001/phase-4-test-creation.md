# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 4                                            |
| 機能名     | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 3                                      |
| 後続Phase  | Phase 5                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

TDDアプローチでテストを先に書き、Redを確認する。現在の `settings:update` ハンドラがシャローマージ（`{ ...currentSettings, ...payload }`）を使用しているため、ネストオブジェクトの部分更新でフィールドが欠落する問題をテストで証明する。

## 背景

`settings:update` IPC ハンドラが `{ ...currentSettings, ...payload }` によるシャローマージを実施しているため、ネストされたオブジェクト（例: `theme`）の一部フィールドのみを更新すると他フィールドが消失する。Issue #2197 で報告済み。対象ファイルは `apps/desktop/src/main/ipc/storeHandlers.ts`、テストファイルは `apps/desktop/src/main/ipc/storeHandlers.test.ts`。

## SubAgentチーム編成

| SubAgent   | 関心ごと               | 主担当                              |
| ---------- | ---------------------- | ----------------------------------- |
| SubAgent-A | IPC/ストア責務         | settings:update 登録・マージ挙動    |
| SubAgent-B | 型契約・入出力境界     | Settings 型定義・ペイロード型安全性 |
| SubAgent-C | テスト仕様・ケース設計 | TC-01〜TC-05 の詳細仕様・Red確認    |
| SubAgent-D | 統合監査               | 矛盾・漏れ・整合・依存判定          |

## 実行タスク

- テスト仕様書作成: TC-01〜TC-05 の詳細仕様を記述する
- Red確認: 現時点でテストがFailになることを記録する
- 統合テスト計画: 既存テストとの干渉なしを確認する

### テストケース一覧

| TC ID | タイトル                                             | 入力（現在値）                                 | 更新ペイロード                  | 期待値                                          |
| ----- | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------- | ----------------------------------------------- |
| TC-01 | ネストオブジェクトの部分更新でフィールドが保持される | `{ theme: { color: "dark", size: "medium" } }` | `{ theme: { color: "light" } }` | `{ theme: { color: "light", size: "medium" } }` |
| TC-02 | トップレベルフィールドの上書きが従来通り動作する     | `{ language: "ja", theme: { color: "dark" } }` | `{ language: "en" }`            | `{ language: "en", theme: { color: "dark" } }`  |
| TC-03 | 配列フィールドは上書き動作になる（マージしない）     | `{ providers: ["a", "b"] }`                    | `{ providers: ["c"] }`          | `{ providers: ["c"] }`                          |
| TC-04 | nullペイロードは上書き扱い                           | `{ theme: { color: "dark" } }`                 | `{ theme: null }`               | `{ theme: null }`                               |
| TC-05 | 存在しない子キーが追加される                         | `{ theme: { color: "dark" } }`                 | `{ theme: { size: "large" } }`  | `{ theme: { color: "dark", size: "large" } }`   |

## 参照資料

| 参照資料           | パス                                              | 説明           |
| ------------------ | ------------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| 差分カバレッジ     | `outputs/phase-1/branch-diff-coverage.md`         | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物 |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`          | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                | Phase 2 成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`         | Phase 3 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`                | Phase 3 成果物 |
| 対象ハンドラ       | `apps/desktop/src/main/ipc/storeHandlers.ts`      | 実装対象       |
| テストファイル     | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト対象     |

## 実行手順

1. 入力成果物（Phase 1〜3）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. TC-01〜TC-05 をテストファイルに記述し、`pnpm --filter @repo/desktop test:run` で実行して Red を確認する。
4. 成果物を `outputs/phase-4/` に定義する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- `settings:update` / `settings:get` を統合対象に固定する。
- 既存テストケース（TC-01以前）との干渉がないことをテスト実行ログで確認する。
- Red確認ログは `outputs/phase-4/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | TC-01〜TC-05 の期待値が受け入れ基準（AC-1〜AC-5）と矛盾しないか確認する   |
| 漏れ     | 5件全 TC が仕様書に記載され、テストコードに対応するケースがあるか確認する |
| 整合性   | ペイロード型が `Settings` 型定義と整合しているか確認する                  |
| 依存関係 | Phase 3 ゲート判定が PASS であり、Phase 4 実行に支障がないか確認する      |

## サブタスク管理

1. 参照資料（Phase 1〜3 成果物）の確認
2. SubAgent-A/B/C の並列作業（テスト仕様・型確認・ケース設計）
3. SubAgent-D の統合判定
4. テスト実行による Red 確認
5. 成果物出力
6. 完了条件判定

## 成果物

| 成果物         | パス                                       | 説明                           |
| -------------- | ------------------------------------------ | ------------------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | TC-01〜TC-05 の詳細仕様書      |
| Red結果        | `outputs/phase-4/red-test-result.md`       | 実行失敗結果の記録             |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 既存テストとの干渉なし確認計画 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-01〜TC-05 が全てテスト仕様書に記述されている
- [ ] Red 確認でテストが Fail することをログに記録した
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

Phase 5: 実装
