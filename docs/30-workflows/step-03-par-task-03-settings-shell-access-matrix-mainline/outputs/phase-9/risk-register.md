# Phase 9: リスク登録簿

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. リスク一覧

| Risk-ID | カテゴリ     | リスク                                                                         | Severity | 緩和策                                                                             |
| ------- | ------------ | ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| RISK-01 | UX           | 4 capability 状態の視認性が不十分で、ユーザーが現在の状態を判断できない        | MEDIUM   | Apple HIG システムカラーで状態を色分け。icon + label + 説明テキストの3層で伝達     |
| RISK-02 | Architecture | health IPC が未定義のため、HealthStatusRow が常に null 表示になる              | MEDIUM   | Props ベース設計により IPC 未接続時も null 表示で graceful degradation             |
| RISK-03 | Security     | 未認証時 guidance-only の境界が実装時に曖昧になる                              | LOW      | isAuthenticated props による明確な分岐。テストケース TC-C05 / SC-02 / RG-05 で検証 |
| RISK-04 | 既存契約     | AppLayout 変更が他ビューに副作用を与える                                       | MEDIUM   | TerminalLauncher は header 右側に追加のみ。既存グリッド構造を変更しない            |
| RISK-05 | 依存         | Task02（Runtime Policy Centralization）未完了時に capability bridge が利用不可 | LOW      | Props 直接注入で Store 非依存動作可能。Task02 完了後に Store 連携を追加            |

## 2. CRITICAL/HIGH リスク

なし

## 3. 緩和策サマリー

全リスクが MEDIUM 以下。後続実装タスクでの対応で十分。設計段階での追加対策は不要。
