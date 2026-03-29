# Phase 4: テスト作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

PlanResultDetailPanel / ExecuteResultDetailPanel の全 props パターン、表示フィールド検証、エラー状態表示、SkillLifecyclePanel 統合の test matrix を定義する。

## 実行タスク

- PlanResultDetailPanel の test case を定義する
- ExecuteResultDetailPanel の test case を定義する
- ErrorBanner の test case を定義する
- SkillLifecyclePanel 統合の test case を定義する

## 参照資料

| 資料名              | パス                                     | 説明               |
| ------------------- | ---------------------------------------- | ------------------ |
| Phase 1 要件        | `phase-1-requirements.md`                | 表示対象フィールド |
| Phase 2 設計        | `phase-2-design.md`                      | コンポーネント設計 |
| panel props catalog | `outputs/phase-2/panel-props-catalog.md` | props interface    |
| Phase 3 review      | `phase-3-design-review.md`               | gate 判定結果      |

## 実行手順

### ステップ1: PlanResultDetailPanel テストケースを定義する

| テストケース | シナリオ                         | 期待結果                                                        |
| ------------ | -------------------------------- | --------------------------------------------------------------- |
| `T-PRP-01`   | 完全な planResult を渡す         | skillName, description, agents, scripts, triggers, anchors 表示 |
| `T-PRP-02`   | planResult が null               | 何も表示されない                                                |
| `T-PRP-03`   | isLoading が true                | スケルトンローダーが表示される                                  |
| `T-PRP-04`   | error が設定されている           | ErrorBanner が表示される                                        |
| `T-PRP-05`   | agents が空配列                  | Agents セクションが適切に表示される（空の旨を表示）             |
| `T-PRP-06`   | scripts が空配列                 | Scripts セクションが適切に表示される                            |
| `T-PRP-07`   | triggers が空配列                | Triggers セクションが適切に表示される                           |
| `T-PRP-08`   | anchors が空配列                 | Anchors セクションが適切に表示される                            |
| `T-PRP-09`   | estimatedSteps が表示される      | バッジに数値が表示される                                        |
| `T-PRP-10`   | skillSpec が存在し折りたたみ展開 | skillSpec の全文が表示される                                    |
| `T-PRP-11`   | agents に複数エントリ            | 全エントリが name — role 形式でリスト表示される                 |
| `T-PRP-12`   | planId が表示される              | フッターに planId が小さく表示される                            |

### ステップ2: ExecuteResultDetailPanel テストケースを定義する

| テストケース | シナリオ                               | 期待結果                                              |
| ------------ | -------------------------------------- | ----------------------------------------------------- |
| `T-ERP-01`   | success: true の executeResult を渡す  | 成功バッジ + 成功メッセージが表示される               |
| `T-ERP-02`   | success: false の executeResult を渡す | 失敗バッジ + エラーメッセージが表示される             |
| `T-ERP-03`   | executeResult が null                  | 何も表示されない                                      |
| `T-ERP-04`   | isLoading が true                      | プログレスインジケーターが表示される                  |
| `T-ERP-05`   | error が設定されている                 | ErrorBanner が表示される                              |
| `T-ERP-06`   | success: false で error フィールドあり | error メッセージが表示される                          |
| `T-ERP-07`   | success: false で onRetry が渡される   | 再試行ボタンが表示され、クリックで onRetry が呼ばれる |
| `T-ERP-08`   | executeId が表示される                 | フッターに executeId が小さく表示される               |

### ステップ3: ErrorBanner テストケースを定義する

| テストケース | シナリオ                        | 期待結果                                          |
| ------------ | ------------------------------- | ------------------------------------------------- |
| `T-ERR-01`   | errorCode + errorMessage を渡す | エラーアイコン + メッセージが赤系背景で表示される |
| `T-ERR-02`   | onRetry が渡される              | 再試行ボタンが表示される                          |
| `T-ERR-03`   | onRetry が未設定                | 再試行ボタンが表示されない                        |
| `T-ERR-04`   | 長いエラーメッセージ            | テキストが折り返されて表示される                  |

### ステップ4: SkillLifecyclePanel 統合テストケースを定義する

| テストケース | シナリオ                                       | 期待結果                                      |
| ------------ | ---------------------------------------------- | --------------------------------------------- |
| `T-INT-01`   | currentPhase が "review" で planResult あり    | PlanResultDetailPanel が表示される            |
| `T-INT-02`   | currentPhase が "verify" で executeResult あり | ExecuteResultDetailPanel が表示される         |
| `T-INT-03`   | currentPhase が "plan" で結果なし              | どちらのパネルも表示されない                  |
| `T-INT-04`   | currentPhase が "review" から "execute" へ遷移 | PlanResultDetailPanel が非表示になる          |
| `T-INT-05`   | plan エラー発生                                | PlanResultDetailPanel にエラーが表示される    |
| `T-INT-06`   | execute エラー発生                             | ExecuteResultDetailPanel にエラーが表示される |

## 統合テスト連携

- Phase 6 で null/undefined、極端に長いデータ、特殊文字等の edge case を追加する
- Phase 7 で全表示フィールドの test coverage を集計する

## 成果物

| 成果物      | パス                             | 説明                         |
| ----------- | -------------------------------- | ---------------------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | pass/fail シナリオと期待結果 |

## 完了条件

- [ ] PlanResultDetailPanel の全 props パターンが定義されている
- [ ] ExecuteResultDetailPanel の全 props パターンが定義されている
- [ ] ErrorBanner の test case がある
- [ ] SkillLifecyclePanel 統合の test case がある
- [ ] **本Phase内の全タスクを100%実行完了**
