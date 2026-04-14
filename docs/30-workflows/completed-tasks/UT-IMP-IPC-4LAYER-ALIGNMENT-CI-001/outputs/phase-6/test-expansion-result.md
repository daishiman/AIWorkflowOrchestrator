# Phase 6 成果物: テスト拡充結果

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## テスト拡充サマリ

| 区分               | 既存テスト数 | 追加テスト数 | 合計      |
| ------------------ | ------------ | ------------ | --------- |
| parsers.test.ts    | 37           | 27           | 64        |
| validators.test.ts | 19           | 0            | 19        |
| reporter.test.ts   | 8            | 0            | 8         |
| e2e.test.ts        | 7            | 0            | 7         |
| **合計**           | **71(※)**    | **27**       | **98(※)** |

※ parsers.test.ts の既存37テストはインポート共有のため、テストランナー上では78テスト(既存) -> 105テスト(拡充後)としてカウントされる。

## 追加テスト一覧

### resolveMainChannelRefs テスト (7件)

| #   | テスト名                                                                        | カテゴリ     |
| --- | ------------------------------------------------------------------------------- | ------------ |
| 1   | 直接チャネル名はそのまま保持する                                                | 正常系       |
| 2   | `__IPC_CHANNELS_REF__` を preloadChannelMap で解決する                          | 正常系       |
| 3   | `__IPC_CHANNELS_REF__` が preloadMap になければ shared フラットマップで解決する | 正常系       |
| 4   | `__IPC_CHANNELS_REF__` がどちらのマップでも解決できない場合はスキップされる     | エッジケース |
| 5   | `__CHANNELS_REF__` を sharedGroupMap で解決する                                 | 正常系       |
| 6   | `__CHANNELS_REF__` が解決できない場合はスキップされる                           | エッジケース |
| 7   | 混在する参照タイプを同時に解決する                                              | 複合ケース   |

### buildPreloadChannelMap 追加テスト (3件)

| #   | テスト名                                          | カテゴリ |
| --- | ------------------------------------------------- | -------- |
| 1   | spread パターンを sharedGroupMap で解決する       | 正常系   |
| 2   | GROUP.MEMBER 参照を sharedGroupMap で解決する     | 正常系   |
| 3   | standalone 参照を shared フラットマップで解決する | 正常系   |

### エッジケーステスト (17件)

| #   | テスト名                                                                      | カテゴリ             |
| --- | ----------------------------------------------------------------------------- | -------------------- |
| 1   | stripComments: コメントのみのファイルを処理できる                             | 空入力               |
| 2   | stripComments: 閉じていないブロックコメントを安全に処理する                   | 不正入力             |
| 3   | parseSharedChannels: 不正なチャネル名パターンを除外する                       | バリデーション       |
| 4   | parseSharedChannels: アンダースコアを含むチャネル名を処理する                 | 特殊文字             |
| 5   | parseMainHandlersFromContent: registerXxxHandler パターンを抽出する           | パーサーパターン     |
| 6   | parseMainHandlersFromContent: createIpcHandler パターンを抽出する             | パーサーパターン     |
| 7   | parseMainHandlersFromContent: ローカル定数で定義されたチャネルを解決する      | ローカル定数解決     |
| 8   | parseMainHandlersFromContent: main.handle パターンを抽出する                  | パーサーパターン     |
| 9   | parsePreloadWhitelist: spread パターンを sharedGroupMap で解決する            | spread解決           |
| 10  | parsePreloadWhitelist: GROUP.MEMBER 参照を解決する                            | 参照解決             |
| 11  | parseMainHandlers: .spec.ts ファイルを除外する                                | ファイルフィルタ     |
| 12  | parseMainHandlers: .d.ts ファイルを除外する                                   | ファイルフィルタ     |
| 13  | parseMainHandlers: `__tests__` / `__mocks__` ディレクトリを除外する           | ディレクトリフィルタ |
| 14  | parseMainHandlers: サブディレクトリ内のファイルも再帰的に走査する             | 再帰走査             |
| 15  | parseRendererUsageFromContent: 複数の型パラメータを持つ safeInvoke を処理する | ジェネリック型       |
| 16  | parseSharedGroupMap: コメント内のグループを無視する                           | コメント除外         |
| 17  | parseSharedGroupMap: 空のグループを含まない                                   | 空グループ           |

## テスト実行結果

```
Test Files  4 passed (4)
     Tests  105 passed (105)
  Duration  2.10s
```

- Phase 4 既存テスト (78件): 全件 PASS (回帰なし)
- Phase 6 追加テスト (27件): 全件 PASS
- テスト失敗: 0件

## Phase 6 実行記録

### 実行タスク

- タスク1 Fail Path テスト追加: 完了 (validators.test.ts に既に網羅済み、e2e.test.ts に複合FAILシナリオ含む)
- タスク2 回帰ガードテスト追加: 完了 (e2e.test.ts のRule-1/2/3 FAILケースで回帰をカバー)
- タスク3 エッジケーステスト追加: 完了 (17件追加)
- タスク4 テスト実行・結果集約: 完了 (105件全GREEN)
- タスク5 テスト拡充に伴う実装修正: 修正不要 (全テストが既存実装で PASS)

### テスト実行結果サマリー

- 既存テスト (Phase 4): 78件 PASS / 0件 FAIL
- 新規追加テスト: 27件 PASS / 0件 FAIL
- 合計: 105件 PASS / 0件 FAIL

### 実装修正

- カテゴリA (即時修正): 0件
- カテゴリB (設計判断要): 0件 (動的チャネルWARNINGは現状スコープ外)
- カテゴリC (Phase 8 対応): 0件

### 発見事項

- 良かった点: resolveMainChannelRefs のテストが未カバーだったため、参照解決ロジックの品質保証が大幅に向上した
- 問題点: なし
- 改善提案: 動的チャネル生成(テンプレートリテラル)の検出は将来タスクとして検討可能

### 次Phase への引き継ぎ事項

- 105件のテストが安定して全GREEN
- resolveMainChannelRefs, buildPreloadChannelMap, parsePreloadWhitelist の spread/参照解決パスがテストカバーされた
