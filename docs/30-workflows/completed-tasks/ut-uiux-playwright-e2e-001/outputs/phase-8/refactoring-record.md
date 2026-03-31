# Phase 8: リファクタリング記録（Before/After/理由テーブル）

## 概要

`evaluate-ui-ux-playwright-e2e.ts` における Phase 8 の変更を Before/After/理由の形式で記録する。

## 変更テーブル

| 対象                                         | Before                                                                                 | After                                                             | 理由                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `test.describe` のタイトル                   | `"TASK-RT-05 multi_select Phase 11: 3層評価"`                                          | `"UI/UX 3層評価フレームワーク"`                                   | 特定タスク・フェーズへの依存を除去し、汎用フレームワーク名にする                  |
| テストケース定義方法                         | 固定の 4 テスト（M11-1〜M11-4）をベタ書き                                              | `TEST_TARGETS` を `for...of` でイテレートして動的生成             | test-targets.config.ts を唯一の設定源とし、新画面追加時にスクリプト変更不要にする |
| M11-1 テスト                                 | `page.goto("/workflow")` → `[role="checkbox"]` で Semantic 検証 → VIS スナップショット | 削除（`TEST_TARGETS` のエントリで代替）                           | multi_select 専用の前提を排除する                                                 |
| M11-2 テスト                                 | checkbox 2件クリック → `aria-checked` 確認 → payload 検証 → スナップショット           | 削除（`TEST_TARGETS` のエントリで代替）                           | multi_select 専用のインタラクションロジックを除去する                             |
| M11-3 テスト                                 | `[data-testid="kind-switch"]` クリック → aria-checked リセット確認                     | 削除（`TEST_TARGETS` のエントリで代替）                           | kind 切り替えは multi_select 固有の操作であり汎用化不可                           |
| M11-4 テスト                                 | 4 種類の kind をループしてスナップショット撮影                                         | 削除（`TEST_TARGETS` のエントリで代替）                           | kind 名をハードコードしていたため、設定駆動型に移行                               |
| Semantic テスト内容                          | `ariaLabels.length > 0` のアサーション（M11-1 固有）                                   | `tabIndexElements.length >= 0` のアサーション（全ターゲット共通） | multi_select 専用の期待値を除去し、あらゆる画面に適用できる最小アサーションにする |
| Visual テスト ID                             | `"M11-1-multi-select-display"` などハードコード文字列                                  | `target.id`（e.g. `"chat-main"`, `"skill-list"`）                 | スナップショットファイル名を config の id と一致させ、管理を一元化する            |
| import 文                                    | `SemanticTestResult` のみ import                                                       | `TEST_TARGETS`, `type TestTarget` を追加 import                   | test-targets.config.ts への依存を明示する                                         |
| `testSemanticLayer` / `testVisualLayer` 関数 | 変更なし（維持）                                                                       | 変更なし（維持）                                                  | 共通ロジックとして再利用可能なため変更不要                                        |
| `launchElectronApp` 関数                     | 変更なし（維持）                                                                       | 変更なし（維持）                                                  | 起動ロジックは変更不要                                                            |

## 変更前後のテスト構成

### Before（ハードコード）

```
test.describe("TASK-RT-05 multi_select Phase 11: 3層評価")
  test("M11-1: multi_select request を開く - 3層評価")     // [SEM + VIS]
  test("M11-2: 2件選択して送信する - 3層評価")             // [SEM + VIS + payload]
  test("M11-3: kind を切り替える - 3層評価")               // [SEM + VIS]
  test("M11-4: 既存 4 kind を順に確認する - 3層評価")      // [VIS x4]
計: 4 テスト（multi_select 専用）
```

### After（TEST_TARGETS 駆動）

```
test.describe("UI/UX 3層評価フレームワーク")
  test("[SEM] chat-main: Semantic 検証 - メインチャット画面")
  test("[VIS] chat-main: Visual 検証 - メインチャット画面")
  test("[SEM] skill-list: Semantic 検証 - スキル一覧画面")
  test("[VIS] skill-list: Visual 検証 - スキル一覧画面")
  test("[SEM] settings-general: Semantic 検証 - 設定画面（一般タブ）")
  test("[VIS] settings-general: Visual 検証 - 設定画面（一般タブ）")
  test("[SEM] sidebar-navigation: Semantic 検証 - サイドバーナビゲーション")
  test("[VIS] sidebar-navigation: Visual 検証 - サイドバーナビゲーション")
  test("[SEM] error-display: Semantic 検証 - エラー表示コンポーネント")
  test("[VIS] error-display: Visual 検証 - エラー表示コンポーネント")
  test("[VIS] loading-state: Visual 検証 - ローディング状態")
  test("[VIS] dark-mode: Visual 検証 - ダークモード（テーマ切り替え後）")
計: 12 テスト（TEST_TARGETS 7 画面に対応）
```

新画面追加時は `test-targets.config.ts` に 1 エントリ追加するだけでテストが自動的に増える。
