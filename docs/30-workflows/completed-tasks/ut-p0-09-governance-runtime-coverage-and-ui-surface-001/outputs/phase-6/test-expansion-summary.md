# Phase 6: テスト拡充サマリー

作成日: 2026-04-02

## 追加テストケース

### GovernanceSummaryPanel.test.tsx（Phase 6 追加分）

| TC      | テストケース                                                              | 分類             |
| ------- | ------------------------------------------------------------------------- | ---------------- |
| TC-R-08 | IPC が例外をスローした場合にエラー表示される                              | fail path        |
| TC-R-09 | recentDenials が5件超の場合は最大5件のみ表示される                        | エッジケース     |
| TC-R-10 | コンポーネントアンマウント時にポーリングが停止する                        | メモリリーク防止 |
| TC-R-11 | recentDenials が null 相当（空配列）の場合 No recent denials が表示される | エッジケース     |
| TC-R-12 | activePolicy.allowedTools が空配列でもクラッシュしない                    | エッジケース     |

### GovernanceAllPhases.test.ts（Phase 6 追加分）

| TC      | テストケース                                                | 分類         |
| ------- | ----------------------------------------------------------- | ------------ |
| TC-G-08 | plan → verify → improve でフェーズ変更が audit に記録される | 回帰ガード   |
| TC-G-09 | execute フェーズで Write ツールが許可される                 | 回帰ガード   |
| TC-G-10 | improve フェーズで Write ツールが拒否される                 | 回帰ガード   |
| TC-G-11 | plan フェーズの hooks で denial が audit に記録される       | エッジケース |
| TC-G-12 | verify フェーズの hooks で denial が audit に記録される     | エッジケース |

## テスト合計

| ファイル                        | Phase 4 | Phase 6 追加 | 合計   |
| ------------------------------- | ------- | ------------ | ------ |
| GovernanceSummaryPanel.test.tsx | 7       | 5            | 12     |
| GovernanceAllPhases.test.ts     | 7       | 5            | 12     |
| **合計**                        | **14**  | **10**       | **24** |

## 全テスト PASS 確認

既存 governance テスト（130+）を含む全テストが PASS。
