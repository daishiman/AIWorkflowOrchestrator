# Phase 4 テスト仕様書: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## テストファイルパス

```
apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

## テストケース一覧

| ID    | 内容                                                             | AC   | 結果 |
| ----- | ---------------------------------------------------------------- | ---- | ---- |
| TC-1  | 複数ツール入力時に fetchToolIntegrationInfo が並列呼び出しされる | AC-1 | PASS |
| TC-2  | 各ツール名で fetchToolIntegrationInfo が呼び出される             | AC-1 | PASS |
| TC-3  | 複数ツールの統合情報が正しくマージされる                         | AC-2 | PASS |
| TC-4  | マージ結果の重複フィールド値が排除される                         | AC-2 | PASS |
| TC-5  | 単一ツール入力時は従来と同一の結果が返る                         | AC-3 | PASS |
| TC-6  | 空配列入力時はデフォルト値が返る                                 | AC-4 | PASS |
| TC-7  | 未対応ツール入力時は例外を投げずデフォルト値が返る               | AC-4 | PASS |
| TC-8  | 複数ツールのうち1件が失敗しても残りがマージされる                | AC-4 | PASS |
| TC-9  | 全ツール取得失敗時はデフォルト値が返る                           | AC-4 | PASS |
| TC-10 | 3ツール以上入力時に全ツール分がマージされる                      | AC-4 | PASS |
| TC-11 | 空白のみのツール名が正規化で除去される                           | AC-4 | PASS |
| TC-12 | mergeIntegrations が空配列を受け取った場合は空を返す             | AC-4 | PASS |
| TC-13 | mergeIntegrations が複数統合情報を正しくマージする               | AC-2 | PASS |

## テスト実行結果

```
Test Files  1 passed (1)
     Tests  13 passed (13)
  Duration  7.04s
```
