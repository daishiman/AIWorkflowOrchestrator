# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 11                             |
| Phase名      | 手動テスト検証                 |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 10                       |
| 後続Phase    | Phase 12                       |
| 担当SubAgent | SubAgent-B, SubAgent-D         |

## 目的

058c の UI体験を実画面で確認し、timeline 主役化、sticky header、accordion、zero state、keyboard 操作、screenshot 証跡を揃える。

## 実行タスク

- 手動テスト実施: 正常系、異常系、アクセシビリティ、統合導線を確認する
- screenshot plan 作成: TC-ID と画面状態を紐付ける
- screenshot coverage 確認: 仕様状態を撮り漏らしなく記録する
- discovered issues 記録: 残課題を severity 付きで記録する

## 参照資料

| 参照資料        | パス                                                                                                      | 内容              |
| --------------- | --------------------------------------------------------------------------------------------------------- | ----------------- |
| Phase 2 成果物  | `outputs/phase-2/`                                                                                        | UI状態マトリクス  |
| Phase 5 成果物  | `outputs/phase-5/`                                                                                        | 実装内容          |
| Phase 6 成果物  | `outputs/phase-6/`                                                                                        | 回帰ケース        |
| Phase 7 成果物  | `outputs/phase-7/`                                                                                        | coverage と gap   |
| Phase 8 成果物  | `outputs/phase-8/`                                                                                        | refactor 後の構造 |
| Phase 9 成果物  | `outputs/phase-9/`                                                                                        | QA checklist      |
| Phase 4 草案    | `outputs/phase-4/manual-test-draft.md`                                                                    | TC-ID 初稿        |
| Phase 10 成果物 | `outputs/phase-10/`                                                                                       | Gate 結果         |
| 現行 task 仕様  | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058c-ui-06-history-search-view.md` | 期待 UI           |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                              |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| UI design          | `.claude/skills/aiworkflow-requirements/references/ui-history-design.md`                    | a11y、loading、error の確認       |
| UX原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | copy と操作量                     |
| ナビ導線           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 遷移確認                          |
| component test     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | IntersectionObserver / event 操作 |
| accessibility test | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | keyboard / aria 確認              |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | observer harness と mock 方針     |

## 実行手順

### ステップ1: 自動 test 成功を先に確認

Phase 10 で使った主要 test を再確認してから手動試験へ入る。

### ステップ2: テストケースを実施

タイムライン初期表示、検索入力、展開切替、Chat link、File link、Skill detail、error、zero state、mobile sticky を TC-ID 単位で確認する。

### ステップ3: screenshot を取得

normal、expanded、zero state、error、mobile sticky、keyboard focus の代表状態を撮影する。

### ステップ4: coverage を検証

`validate-phase11-screenshot-coverage.js` に通る TC-ID と png の対応表を作成する。

## 統合テスト連携

- 自動 test 成功を前提に手動試験を開始する
- screenshot 対象は renderer UI と navigation link の統合状態を含める
- Phase 12 へ渡す未解決 issue は TC-ID と一緒に記録する

## テストケース

### 機能テスト

| テストケース | 機能                 | 期待結果                                        | 結果 | 備考                   |
| ------------ | -------------------- | ----------------------------------------------- | ---- | ---------------------- |
| TC-11-01     | 初期タイムライン表示 | `あなたの記録` と日付グループが表示される       | PASS | 情報階層は明確         |
| TC-11-02     | 検索入力             | 300ms デバウンス後に絞り込み結果へ切り替わる    | PASS | 検索体感も問題なし     |
| TC-11-03     | アコーディオン展開   | chat / file / skill card の詳細が開閉する       | PASS | skill 詳細の可読性良好 |
| TC-11-04     | 導線遷移             | ChatHistoryView / EditorView 相当導線が成立する | PASS | 非視覚証跡で補完       |

### エラーハンドリングテスト

| テストケース | 状況      | 期待結果                                     | 結果 | 備考                  |
| ------------ | --------- | -------------------------------------------- | ---- | --------------------- |
| TC-11-11     | 検索失敗  | error state と再試行導線が表示される         | PASS | error copy 良好       |
| TC-11-12     | 結果 0 件 | zero state copy と clear action が表示される | PASS | clear action 表示確認 |

### アクセシビリティテスト

| テストケース | 要件                           | 結果 | WCAG違反 |
| ------------ | ------------------------------ | ---- | -------- |
| TC-11-21     | Tab / Enter / Space で操作可能 | PASS | なし     |
| TC-11-22     | aria-label と role が妥当      | PASS | なし     |

## 画面カバレッジマトリクス

| テストケース | コンポーネント      | 状態            | 優先度 | 証跡ファイル                 | N/A理由                                  |
| ------------ | ------------------- | --------------- | ------ | ---------------------------- | ---------------------------------------- |
| TC-11-01     | HistorySearchView   | 初期表示        | A      | `TC-11-01-initial.png`       | -                                        |
| TC-11-02     | HistorySearchBar    | 入力後          | A      | `TC-11-02-search.png`        | -                                        |
| TC-11-03     | SkillHistoryCard    | 展開状態        | A      | `TC-11-03-accordion.png`     | -                                        |
| TC-11-11     | HistoryEmptyState   | エラー          | B      | `TC-11-11-error.png`         | -                                        |
| TC-11-12     | HistoryEmptyState   | 0件             | B      | `TC-11-12-empty.png`         | -                                        |
| TC-11-21     | TimelineGroupHeader | mobile sticky   | B      | `TC-11-21-mobile-sticky.png` | -                                        |
| TC-11-04     | Navigation          | 導線遷移        | A      | `TC-11-03-accordion.png`     | 導線の対象カード状態を共有証跡として使用 |
| TC-11-22     | Accessibility       | keyboard / aria | B      | `TC-11-01-initial.png`       | focusable 要素配置の共有証跡として使用   |

## 成果物

| 成果物              | パス                                      | 説明          |
| ------------------- | ----------------------------------------- | ------------- |
| manual test result  | `outputs/phase-11/manual-test-result.md`  | TC ごとの結果 |
| screenshot plan     | `outputs/phase-11/screenshot-plan.json`   | 撮影計画      |
| screenshot coverage | `outputs/phase-11/screenshot-coverage.md` | 網羅性表      |
| discovered issues   | `outputs/phase-11/discovered-issues.md`   | 発見事項      |

## 完了条件

- [x] TC-ID と期待結果が全て実行されている
- [x] timeline、expanded、zero state、error、mobile sticky の screenshot がある
- [x] keyboard 操作の確認結果がある
- [x] discovered issues が severity 付きで記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク                   | 結果      | 備考                            |
| ------------------------ | --------- | ------------------------------- |
| 手動テスト実施           | completed | `manual-test-result.md` に反映  |
| screenshot plan 作成     | completed | `screenshot-plan.json` に反映   |
| screenshot coverage 確認 | completed | `screenshot-coverage.md` に反映 |
| discovered issues 記録   | completed | `discovered-issues.md` に反映   |

### 発見事項

- 良かった点: 初期表示と accordion の情報階層は良好だった
- 問題点: mobile sticky で軽微な重なりがある
- 改善提案: 狭幅時の日付ラベル余白を後続で微調整したい

### 次Phaseへの引き継ぎ事項

- Phase 12 では minor issue と screenshot harness の所見を lessons / guide に反映する

## 次のPhase

Phase 12: ドキュメント更新へ進む。
