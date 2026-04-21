# Phase 11: 手動テストチェックリスト（NV-01〜NV-05）

本チェックリストは `manual-test-result.md`（一次ソース）の実行手順を checkbox 形式で提示する補助成果物である。現在は NV-01〜NV-03 と `typecheck/lint` を実施済み、NV-04 は未実施、NV-05 は環境 blocker により未完了。

## 前提条件

- [ ] Phase 10 `final-review-result.md` の blocker が 0 件であることを確認した
- [ ] 実コード 4 ファイルの変更がマージまたは作業ブランチに適用されている
- [ ] 新規テスト 4 シナリオ（match / miss / legacy / no-options）が `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` に追加されている
- [ ] `pnpm install` が完了しローカル環境で dev server / test が起動できる

## NV-01: 型利用箇所の一貫性

| #   | チェック項目                                                 | 実行コマンド / 確認方法                             | 期待結果                                              | チェック |
| --- | ------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------- | -------- |
| 1-1 | `SkillCreatorProgress` 型参照の全洗い出し                    | `grep -rn "SkillCreatorProgress" apps/desktop/src/` | 型定義 1 件 + 利用箇所（Hook / テスト）の列挙         | [ ]      |
| 1-2 | 型定義に planId? / requestId? が追加されていること           | 結果中の `skill-creator-api.ts` 行を目視            | `planId?: string;` / `requestId?: string;` が含まれる | [ ]      |
| 1-3 | 参照箇所で optional field の未設定経路が破壊されていないこと | 各利用箇所の近傍コードを目視                        | 未設定時も既存動作を維持する条件分岐が入っている      | [ ]      |
| 1-4 | typecheck が PASS すること                                   | `pnpm --filter @repo/desktop typecheck`             | exit code 0                                           | [ ]      |

## NV-02: Main 側送信呼び出しの planId 付与

| #   | チェック項目                                                                  | 実行コマンド / 確認方法                                      | 期待結果                                                                       | チェック |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------- |
| 2-1 | `sendSkillCreatorProgress` の全呼び出し元洗い出し                             | `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/` | Main ipc / Runtime 経路（該当すれば）の列挙                                    | [ ]      |
| 2-2 | 呼び出し元が planId を渡せるシグネチャになっていること                        | 呼び出し元の引数を目視                                       | `progress` オブジェクトに planId が積まれている                                | [ ]      |
| 2-3 | `skillCreatorHandlers.ts` の createSkill ハンドラで planId が貫通していること | 該当箇所を目視                                               | `sendSkillCreatorProgress(mainWindow, { ...progress, planId })` に相当する構造 | [ ]      |

## NV-03: Runtime 経路 emit 漏れ検出

| #   | チェック項目                                                   | 実行コマンド / 確認方法                                                                                                      | 期待結果                              | チェック |
| --- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------- |
| 3-1 | Runtime / ipc 配下の emit 経路洗い出し                         | `grep -REn 'onProgress\|emitProgress\|webContents\.send' apps/desktop/src/main/services/runtime/ apps/desktop/src/main/ipc/` | progress emit を行う全経路の列挙      | [ ]      |
| 3-2 | 全 emit 経路で planId が付与されていること                     | 結果の各行を目視                                                                                                             | 付与漏れ 0 件                         | [ ]      |
| 3-3 | workflow state snapshot 経由の planId 貫通が維持されていること | `RuntimeSkillCreatorFacade.ts` の関連箇所を目視                                                                              | snapshot 内 planId が既存設計通り貫通 | [ ]      |

## NV-04: dev server 起動スモーク

| #   | チェック項目                                                                      | 実行コマンド / 確認方法           | 期待結果                                        | チェック |
| --- | --------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------- | -------- |
| 4-1 | dev server 起動                                                                   | `pnpm --filter @repo/desktop dev` | アプリ起動 & main プロセス console がアクティブ | [ ]      |
| 4-2 | スキル生成 1 件をトリガ                                                           | UI 操作（スキル作成）             | main プロセス console に progress ログが流れる  | [ ]      |
| 4-3 | progress ログに planId が含まれること                                             | console 出力目視                  | `planId: "<uuid or string>"` が含まれる         | [ ]      |
| 4-4 | `useStreamingProgress` を使っている UI に該当 planId の progress が反映されること | 画面目視                          | stage / percent / message が更新される          | [ ]      |

## NV-05: Hook filter 回帰（unit test）

| #   | チェック項目             | 実行コマンド / 確認方法                                                     | 期待結果                                             | チェック |
| --- | ------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| 5-1 | 対象テスト実行           | `pnpm --filter @repo/desktop test -- --run useStreamingProgress`            | exit code 0                                          | [ ]      |
| 5-2 | match シナリオ PASS      | テスト出力目視                                                              | `options.planId === progress.planId` で store 更新   | [ ]      |
| 5-3 | miss シナリオ PASS       | テスト出力目視                                                              | `options.planId !== progress.planId` で store 未更新 | [ ]      |
| 5-4 | legacy シナリオ PASS     | テスト出力目視                                                              | `progress.planId` 未設定で後方互換受け入れ           | [ ]      |
| 5-5 | no-options シナリオ PASS | テスト出力目視                                                              | `options.planId` 未指定で全通知受け入れ              | [ ]      |
| 5-6 | 既存テストも全 PASS      | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` の総合結果 | 既存ケース含め fail 0 件                             | [ ]      |

## 完了条件

- [ ] NV-01〜NV-05 の全チェック項目が PASS（もしくは合理的な判定が付与されている）
- [ ] 不合格があれば `discovered-issues.md` に Blocker / Note / Info 分類で記録
- [ ] `manual-test-result.md` の実行状態欄を「実機観測済み」で更新
