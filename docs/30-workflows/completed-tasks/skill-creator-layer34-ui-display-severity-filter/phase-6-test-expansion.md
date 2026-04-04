# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 6                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

エッジケースの追加テストを作成し、実装の堅牢性を確認する。

## 実行タスク

### タスク1: SF-09 エッジケーステストの追加

- 目的: 全 check が `info` のみの場合に `error` フィルタで全 layer が消失するケースを検証する
- 手順:
  1. テストデータとして全 check の severity を `info` に設定した `buildVerifyDetailAllInfo` を作成
  2. SF-09: `error` フィルタ適用時に全 layer が非表示になることを検証
  3. フィルタバー自体は表示されたまま残ることを確認
- 期待出力: SF-09 テストケース（PASS）

### タスク2: 既存テストの回帰確認

- 目的: フィルタ追加後も既存テスト（TC-01〜TC-19）が全て PASS することを確認する
- 手順:
  1. `pnpm --dir apps/desktop test:run src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` を実行
  2. TC-01〜TC-19 が全て PASS することを確認
  3. SF-01〜SF-09 が全て PASS することを確認
  4. 失敗テストがある場合は原因を特定し修正する
- 期待出力: 全テスト PASS の確認

## 参照資料

| 資料名     | パス                                                                                | 説明                        |
| ---------- | ----------------------------------------------------------------------------------- | --------------------------- |
| 既存テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | TC-01〜TC-19 + SF-01〜SF-09 |
| 実装コード | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | フィルタ実装                |

## 成果物

| 成果物           | パス                                                                                | 説明       |
| ---------------- | ----------------------------------------------------------------------------------- | ---------- |
| 追加テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | SF-09 追加 |

## TDD検証

| 項目           | 期待                                     |
| -------------- | ---------------------------------------- |
| テスト実行結果 | 全27テスト PASS（TC-01〜19 + SF-01〜09） |
| 回帰テスト     | 既存テストに影響なし                     |

## 完了条件

- [ ] SF-09 のテストが作成されている
- [ ] SF-09 が PASS している
- [ ] 既存テスト（TC-01〜TC-19）が全て PASS している
- [ ] severity フィルタテスト（SF-01〜SF-09）が全て PASS している
- [ ] 全27テストが PASS していることを確認済み
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: カバレッジ確認
