# Phase 5: 実装

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 5                                            |
| 機能名     | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 4                                      |
| 後続Phase  | Phase 6                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

deepMerge 関数を実装し、Red から Green へ移行する。`settings:update` ハンドラのシャローマージ（`{ ...currentSettings, ...payload }`）をディープマージに置き換えることで、TC-01〜TC-05 を全て PASS させる。

## 背景

Phase 4 の Red 確認で、ネストオブジェクトの部分更新時にフィールドが消失することを実証済み。最小差分の実装で Green へ移行し、既存動作への副作用がないことを確認する。対象ファイルは `apps/desktop/src/main/ipc/storeHandlers.ts`。

## SubAgentチーム編成

| SubAgent   | 関心ごと               | 主担当                           |
| ---------- | ---------------------- | -------------------------------- |
| SubAgent-A | IPC/ストア責務         | deepMerge 実装・ハンドラ差し替え |
| SubAgent-B | 型契約・型安全性       | ジェネリクス型定義・型推論の確認 |
| SubAgent-C | テスト実行・Green 確認 | TC-01〜TC-05 全件 PASS の確認    |
| SubAgent-D | 統合監査               | 矛盾・漏れ・整合・依存判定       |

## 実行タスク

- 最小実装計画: Green 達成に必要な最小差分を定義する
- 契約差分監査: 実装差分と契約差分を 1 対 1 で記録する
- 再発防止実装: 同種障害を抑止するガードを設計へ反映する

### 実装方針

| 項目             | 内容                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| 追加関数         | `deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T`                                       |
| 配列の扱い       | 上書き（マージしない）                                                                                              |
| null 値の扱い    | 上書き（patch 側の null をそのまま適用）                                                                            |
| undefined の扱い | 省略（patch 側の undefined キーはスキップ）                                                                         |
| 差し替え箇所     | `settings:update` ハンドラ内の `{ ...currentSettings, ...payload }` を `deepMerge(currentSettings, payload)` へ変更 |

## 参照資料

| 参照資料       | パス                                              | 説明           |
| -------------- | ------------------------------------------------- | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`           | Phase 4 成果物 |
| Red 結果       | `outputs/phase-4/red-test-result.md`              | Phase 4 成果物 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md`        | Phase 4 成果物 |
| 対象ハンドラ   | `apps/desktop/src/main/ipc/storeHandlers.ts`      | 実装対象       |
| テストファイル | `apps/desktop/src/main/ipc/storeHandlers.test.ts` | テスト対象     |

## 実行手順

1. Phase 4 成果物（`outputs/phase-4/`）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. `storeHandlers.ts` に `deepMerge` 関数を追加し、ハンドラを差し替える。
4. `pnpm --filter @repo/desktop test:run` で TC-01〜TC-05 が全件 PASS することを確認する。
5. 成果物を `outputs/phase-5/` に定義する。
6. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の実装・型確認・テスト実行を並列で進める。
- SubAgent-D が統合順序を直列で確定する。
- `settings:update` / `settings:get` を統合対象に固定する。
- 既存テスト（TC-01 以前）が引き続き PASS することをテスト実行ログで確認する。
- Green 確認ログは `outputs/phase-5/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                      |
| -------- | --------------------------------------------------------------------------------------------- |
| 矛盾     | `deepMerge` の挙動定義（配列・null・undefined）が TC-01〜TC-05 の期待値と矛盾しないか確認する |
| 漏れ     | ハンドラ差し替え箇所が 1 箇所だけであり、他の呼び出し箇所に漏れがないか確認する               |
| 整合性   | ジェネリクス型 `T extends Record<string, unknown>` が Settings 型と整合するか確認する         |
| 依存関係 | Phase 4 Red 結果が存在し、実装前後で差分が最小限であることを確認する                          |

## サブタスク管理

1. Phase 4 成果物の確認
2. SubAgent-A/B/C の並列作業（実装・型・テスト実行）
3. SubAgent-D の統合判定
4. Green 確認ログの保存
5. 成果物出力
6. 完了条件判定

## 成果物

| 成果物           | パス                                        | 説明                       |
| ---------------- | ------------------------------------------- | -------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装計画と差分要約         |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイルと差分内容 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 契約差分の 1 対 1 記録     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-01〜TC-05 が全件 PASS（Green）であることを確認
- [ ] `deepMerge` 関数が `storeHandlers.ts` に追加されている
- [ ] ハンドラ差し替え箇所が 1 箇所のみであることを確認
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

Phase 6: テスト拡充
