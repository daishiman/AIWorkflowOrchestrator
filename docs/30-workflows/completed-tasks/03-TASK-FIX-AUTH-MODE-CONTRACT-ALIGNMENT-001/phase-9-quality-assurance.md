# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の品質保証              |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

contract alignment 後の security、error envelope、risk を監査し、Phase 10 へ release blocker なしで渡せる状態にする。

## 背景

このタスクは auth-mode の public contract を変える。UI が通っても sender failure や error code drift が残ると次の auth 変更で再び壊れる。

## SubAgentチーム編成

| SubAgent                | 担当関心                | 実行形態 | Phase 9 の責務                                             |
| ----------------------- | ----------------------- | -------- | ---------------------------------------------------------- |
| SubAgent-Contract-Main  | security / adapter 監査 | 並列     | handler の sender 順序と error sanitization を監査する     |
| SubAgent-Bridge-Preload | bridge error 監査       | 並列     | public response shape と error transport を監査する        |
| SubAgent-Renderer-State | UI error 監査           | 並列     | SettingsView の表示メッセージと state 遷移を監査する       |
| SubAgent-Spec-Sync      | risk と監査結果統合     | 直列統合 | quality report、risk register、error code audit を統合する |

## 実行タスク

- security 監査: sender 検証順序、invalid mode 検証、エラーサニタイズを監査する。
- error transport 監査: Main / Preload / Renderer の `code`, `message`, `guidance` の整合を監査する。
- channel stability 監査: `apps/desktop/src/preload/channels.ts` の channel 名 / whitelist が変わっていないことを確認する。
- risk 管理: backward compatibility、永続化、UI 表示、test fixture のリスクを整理する。
- selector 安定性監査: SettingsView と `store/index.ts` が P31 防止パターンを維持しているか確認する。

## 参照資料

### 実装・コード

| 資料名                  | パス                                                                    | 用途                                                 |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 5 仕様            | `phase-5-implementation.md`                                             | 実装対象を確認する                                   |
| Phase 8 仕様            | `phase-8-refactoring.md`                                                | refactor 後の境界を確認する                          |
| Phase 5 成果物          | `outputs/phase-5/`                                                      | 実装順序と変更対象を確認する                         |
| Phase 8 成果物          | `outputs/phase-8/`                                                      | 重複削減と helper 集約結果を確認する                 |
| Main IPC handler        | `apps/desktop/src/main/ipc/authModeHandlers.ts`                         | sender と error transport を確認する                 |
| Subscription provider   | `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`       | subscription guidance と credential state を確認する |
| Preload API             | `apps/desktop/src/preload/index.ts`                                     | response shape を確認する                            |
| Preload channels        | `apps/desktop/src/preload/channels.ts`                                  | channel 名 / whitelist の維持を確認する              |
| Renderer Slice          | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`               | UI error path を確認する                             |
| Store selector          | `apps/desktop/src/renderer/store/index.ts`                              | selector export と再利用方針を確認する               |
| Settings View           | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                | message / mount / event 反映を監査する               |
| 無限ループ防止テスト    | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` | P31 防止の監査証跡を確認する                         |
| 実装計画                | `outputs/phase-5/implementation-plan.md`                                | Phase 5 成果物                                       |
| 変更ファイル計画        | `outputs/phase-5/changed-files-plan.md`                                 | Phase 5 成果物                                       |
| 移行順序                | `outputs/phase-5/migration-order.md`                                    | Phase 5 成果物                                       |
| ロールバック計画        | `outputs/phase-5/rollback-plan.md`                                      | Phase 5 成果物                                       |
| リファクタリング計画    | `outputs/phase-8/refactoring-plan.md`                                   | Phase 8 成果物                                       |
| 型正本集約              | `outputs/phase-8/type-source-consolidation.md`                          | Phase 8 成果物                                       |
| adapter review          | `outputs/phase-8/adapter-review.md`                                     | Phase 8 成果物                                       |
| post-refactor checklist | `outputs/phase-8/post-refactor-checklist.md`                            | Phase 8 成果物                                       |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                          | 用途                                                            |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | sender 順序と error code の方針を確認する                       |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | error envelope と guidance 記載を確認する                       |
| 認証仕様           | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | public error union と status DTO を確認する                     |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | SettingsView の selector / event 反映と旧記述との差分を確認する |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/patterns.md`               | `useAuthModeStore` 非推奨と横断 grep ルールを確認する           |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 個別 selector / `useEffect` の遵守を確認する                    |

## 実行手順

1. Phase 5 と Phase 8 の成果物を読み、品質監査対象を確定する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で security と error transport を監査する。
3. `quality-report.md` と `error-code-alignment-audit.md` に差分と合否を記録する。
4. `risk-register.md` に残課題、緩和策、owner、次の確認 Phase を記録する。

## 統合テスト連携

- invalid sender が validation より先に返ることを確認する。
- missing credential 時に `status` と `validate` の error code が一致することを確認する。
- `changed` event 後の UI 表示メッセージが `status.message` と一致することを確認する。
- backward compatibility のため永続化済み mode が restart 後も崩れないことを確認する。
- SettingsView mount が個別 selector 前提を保ち、無限ループ防止テストと矛盾しないことを確認する。

## 多角的チェック観点

| 観点            | 確認内容                                                         |
| --------------- | ---------------------------------------------------------------- |
| セキュリティ    | sender -> 構造 -> P42 -> 許可値 の順序を守っているか             |
| エラー整合      | code / message / guidance が 3 層で揃っているか                  |
| UI 整合         | status message と画面表示が揃っているか                          |
| channel 安定性  | channel 名 / whitelist を変えず payload shape のみ整合しているか |
| Selector 安定性 | P31 再発条件を生む合成 hook が戻っていないか                     |
| リスク管理      | 残リスクに owner と緩和策があるか                                |
| 永続化          | restart 後も mode の restore が揃うか                            |

## 成果物

| 成果物               | パス                                            | 説明                             |
| -------------------- | ----------------------------------------------- | -------------------------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`             | 合否と監査コメント               |
| セキュリティ監査     | `outputs/phase-9/security-audit-checklist.md`   | sender 順序と validation の確認  |
| リスク台帳           | `outputs/phase-9/risk-register.md`              | 残リスク、緩和策、owner          |
| エラーコード整合監査 | `outputs/phase-9/error-code-alignment-audit.md` | code / message / guidance の突合 |

## 完了条件

- [x] `security-audit-checklist.md` に sender 順序と invalid mode の確認がある
- [x] `error-code-alignment-audit.md` に Main / Preload / Renderer の 3 層比較がある
- [x] `risk-register.md` の各行に owner と緩和策がある
- [x] `quality-report.md` に blocker の有無を書く
- [x] Phase 10 へ持ち越す項目がある場合は件数を書く
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. security 監査
2. error transport 監査
3. UI error 監査
4. risk 台帳整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] security と error transport を別成果物で監査した
- [x] risk に owner を付けた
- [x] blocker 有無を明記した
- [x] Phase 10 へ渡す論点を固定した

## 次のPhase

Phase 10: 最終レビューゲート
