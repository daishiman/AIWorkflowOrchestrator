# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 6                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

中断、再開、branch、成果物欠落、verify fail、graceful degradation の回帰ケースを補う。

## 実行タスク

- pause / resume envelope の round-trip 観点を追加する
- artifact persistence failure と parse failure の観点を追加する
- `terminal_handoff` / `integrated_api` branch の失敗系を追加する
- verify fail 後の next action owner 観点を追加する

## 参照資料

| 資料名             | パス                             | 説明                      |
| ------------------ | -------------------------------- | ------------------------- |
| Phase 5 実装計画   | `phase-5-implementation.md`      | 変更対象と migration step |
| Phase 4 テスト作成 | `phase-4-test-creation.md`       | base suite                |
| test matrix        | `outputs/phase-4/test-matrix.md` | regression target         |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                            | 内容                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | degraded / handoff ルート                            |
| lesson                     | `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | graceful degradation を handler missing にしない方針 |

## 実行手順

### ステップ1: state machine の失敗系を追加する

- invalid transition、artifact append failure、resume envelope 生成失敗のケースを追加する。
- `verifyResult` が fail のときに engine が next action を保持できるかを確認する。
- execute reject、`success:false`、`verification_review` の 3 経路を別ケースで固定し、`verify/pending` への誤遷移を許可しない。
- repeated failure でも `execute_result` artifact が append され、履歴の末尾を latest として読めることを確認する。

### ステップ2: route branch の失敗系を追加する

- auth key なし、subscription 有効、service 例外の 3 パターンを回帰ケースへ入れる。
- `execute()` が handoff bundle を返す経路と executor 実行経路を分離して確認する。
- facade が executor reject を catch して failure snapshot を保存することを確認する。

### ステップ3: public contract drift を追加監視する

- preload の戻り値型と shared union のズレを test で検出する。
- IPC handler の error envelope が一定文字列に正規化されるかを確認する。

## 統合テスト連携

- Phase 4 の suite に `resume envelope`, `verify fail`, `graceful degradation`, `public contract drift` の観点を追加する。
- `reject`, `success:false`, `verification_review`, `repeated failure append`, `invalid transition rejection` を targeted regression として維持する。
- Phase 7 で owner coverage と route coverage を集計する。

## 成果物

| 成果物         | パス                        | 説明                          |
| -------------- | --------------------------- | ----------------------------- |
| テスト拡充仕様 | `phase-6-test-expansion.md` | fail path と回帰 guard の定義 |

## 完了条件

- [ ] state machine の失敗系が定義されている
- [ ] route branch の失敗系が定義されている
- [ ] preload / shared contract drift の検知観点が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
