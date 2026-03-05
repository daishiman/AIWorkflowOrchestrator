# Phase 1 スコープ定義

## 1. 対象範囲（In Scope）

### 1.1 分割仕様（00-1〜00-4）

- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md`
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md`
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md`
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-054-ui-00-4-organisms-components.md`

### 1.2 後続画面仕様（task-057〜task-061 + task-030）

- `task-057-ui-02-global-nav-core.md`
- `task-058a-ui-03-agent-view-enhancement.md`
- `task-058b-ui-04a-workspace-layout-filebrowser.md`
- `task-059a-ui-04b-workspace-chat-panel.md`
- `task-059b-ui-04c-workspace-preview-quicksearch.md`
- `task-030-ui-05-skill-center-view.md`
- `task-058c-ui-06-history-search-view.md`
- `task-058d-ui-07-dashboard-enhancement.md`
- `task-058e-ui-08-notification-center.md`
- `task-061-ui-09-onboarding-wizard.md`

## 2. 対象外（Out of Scope）

| 対象外項目                                       | 理由                                                       |
| ------------------------------------------------ | ---------------------------------------------------------- |
| 実装コードの新規UI開発                           | 本タスクは仕様反映監査タスクであり、実装変更は必須ではない |
| `kanagawa-wave` / `kanagawa-lotus` の新規CSS実装 | task-050でスコープ外と定義済み                             |
| バックエンドIPC仕様の新規追加                    | 画面仕様反映監査の範囲外                                   |

## 3. 関心ごとの分離（SubAgent Team）

| SubAgent              | 担当スコープ                 | 実行方式 |
| --------------------- | ---------------------------- | -------- |
| SubAgent-REQ-SOURCE   | `task-050` 反映元分解        | 直列     |
| SubAgent-REQ-TARGET   | 00-1〜00-4 の対象確認        | 並列     |
| SubAgent-REQ-SCREENS  | task-057〜061/030 の対象確認 | 並列     |
| SubAgent-REQ-CRITERIA | 判定基準統合                 | 直列     |

## 4. 並列実行境界

- 並列可能:
  - 分割仕様4本の証跡抽出
  - 画面仕様10本の証跡抽出
- 直列固定:
  - 判定語彙統合
  - 最終結論（反映済み率、要追記一覧）

## 5. 完了条件チェック

- [x] 反映先ドキュメント一覧を固定
- [x] 対象外理由を明示
- [x] SubAgent責務分離を定義
- [x] 並列/直列境界を明示
