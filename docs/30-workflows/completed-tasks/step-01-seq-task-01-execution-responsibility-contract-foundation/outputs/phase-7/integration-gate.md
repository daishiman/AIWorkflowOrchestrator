# Phase 7: 統合ゲート

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 7                                                         |
| 作成日   | 2026-03-20                                                |

## Smoke ゲート（正常パス確認）

- **入力**: public settings shell で実行可能性に関わる設定（API Key）を変更する
- **検証**: capability が再計算され、mainline surface の CTA が contract-matrix 通りに更新されること
- **合否基準**: settings 変更 -> capability 再計算 -> CTA 表示更新の 3 ステップ全てが 500ms 以内に完了すること

### 確認手順

1. Settings 画面で API Key を入力する
2. RuntimePolicyResolver.resolve() が再実行されること
3. AuthModeStatus DTO が Renderer に送信されること
4. Main Chat の CTA が「AI で実行」に更新されること

## Integration ゲート（surface 横断確認）

- **入力**: S-1（Settings -> Main Chat capability 再計算フロー）を実行する
- **検証**: Settings の変更が Main Chat の CTA に反映されること
- **合否基準**: S-1 の全ステップ（settings 変更 -> capability 再計算 -> DTO 送信 -> CTA 更新 -> 画面遷移）が PASS すること

### 確認手順

1. Settings public shell で API Key を設定する
2. Main Chat 画面に遷移する
3. capability が integratedRuntime に変化していること
4. primary CTA が「AI で実行」であること

## Walkthrough ゲート（Phase 11 手動シナリオ事前定義）

| シナリオ番号 | 手動操作                                                              | 確認する UI 状態                                                                                              |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| W-1          | Settings public shell で in-app lane を有効化する -> Main Chat を開く | CTA が contract-matrix 通りの primary CTA（「AI で実行」）に変わっていること                                  |
| W-2          | Settings public shell で両 lane を失効させる -> Main Chat を開く      | state が blocked または unavailable に変わり、no-op CTA が出ていないこと                                      |
| W-3          | 両 lane を有効化した状態で mainline surface を開く                    | capability = both となり、primary CTA（「AI で実行」）+ secondary CTA（「ターミナルで実行」）が表示されること |

## ゲート合否判定タイミング

| ゲート種別   | 合否判定タイミング         | 未達時の対応                       |
| ------------ | -------------------------- | ---------------------------------- |
| Smoke ゲート | Phase 9 品質検証で自動実行 | 失敗なら Phase 5 の実装を修正      |
| Integration  | Phase 9 品質検証で自動実行 | 失敗なら Phase 5 の IPC 設計を修正 |
| Walkthrough  | Phase 11 手動テストで確認  | 失敗なら Phase 5 の CTA 実装を修正 |
