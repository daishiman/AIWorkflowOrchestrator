# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 11                                               |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## タスク種別判定

UI タスク（Renderer コンポーネントの変更あり）

## 目的

UI/UX の実環境動作確認。severity フィルタの視覚的・操作的な品質検証。

## 実行タスク

### タスク1: ウォークスルーシナリオ

| #   | シナリオ       | 確認内容                                |
| --- | -------------- | --------------------------------------- |
| 1   | デフォルト表示 | all フィルタがアクティブ、全 check 表示 |
| 2   | warning+ 切替  | info が非表示、warning/error のみ表示   |
| 3   | error 切替     | error のみ表示、空 layer 非表示         |
| 4   | all に戻す     | 全 check 再表示                         |
| 5   | reverify 後    | フィルタ状態が維持される                |
| 6   | accordion 操作 | フィルタ切替後も Layer 開閉が動作       |
| 7   | 件数バッジ     | 各フィルタボタンの件数が正確            |

### タスク2: アクセシビリティ確認

- `role="radiogroup"` が存在すること
- `aria-checked` が切替に応じて更新されること
- キーボード操作（Tab / Enter / Space）で切替が可能であること

## テストケース

| テストケース | 状態             | 確認内容                                                 |
| ------------ | ---------------- | -------------------------------------------------------- |
| TC-11-01     | default-all      | light theme で all フィルタがアクティブ、全 check 表示   |
| TC-11-02     | warning-plus     | light theme で info を非表示にし、warning/error のみ表示 |
| TC-11-03     | error-only       | light theme で error のみ表示し、空 layer を非表示にする |
| TC-11-04     | default-all-dark | dark theme で all フィルタがアクティブ                   |

## 画面カバレッジマトリクス

| テストケース | 証跡                                                                           | current build source                                                                   |
| ------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-severity-filter-all-light.png`          | `/phase11-task-skill-lifecycle-severity-filter.html?state=default-all&theme=light`     |
| TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-severity-filter-warning-plus-light.png` | `/phase11-task-skill-lifecycle-severity-filter.html?state=warning-plus&theme=light`    |
| TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-severity-filter-error-light.png`        | `/phase11-task-skill-lifecycle-severity-filter.html?state=error-only&theme=light`      |
| TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-severity-filter-all-dark.png`           | `/phase11-task-skill-lifecycle-severity-filter.html?state=default-all-dark&theme=dark` |

### タスク3: スクリーンショット（visual capture）

- CLI から current build の Vite harness route を起動し、Playwright で verify detail を撮影する
- `outputs/phase-11/screenshots/` に 4 枚の証跡を保存する
- `outputs/phase-11/screenshots/phase11-capture-metadata.json` に撮影メタデータを保存する
- `outputs/phase-11/screenshot-plan.json` と `outputs/phase-11/screenshot-coverage.md` でケースと証跡の対応を固定する

### スクリーンショット証跡

- `outputs/phase-11/screenshots/TC-11-01-severity-filter-all-light.png`
- `outputs/phase-11/screenshots/TC-11-02-severity-filter-warning-plus-light.png`
- `outputs/phase-11/screenshots/TC-11-03-severity-filter-error-light.png`
- `outputs/phase-11/screenshots/TC-11-04-severity-filter-all-dark.png`

## 必須成果物

| 成果物                | パス                                   |
| --------------------- | -------------------------------------- |
| manual-test-result.md | outputs/phase-11/manual-test-result.md |
| manual-test-report.md | outputs/phase-11/manual-test-report.md |
| discovered-issues.md  | outputs/phase-11/discovered-issues.md  |

## 完了条件

- [x] 全シナリオのウォークスルー完了
- [x] Blocker なし
- [x] テスト方式を manual-test-result.md に明記
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

Phase 12: ドキュメント更新
