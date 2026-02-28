# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| 機能名     | TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 |
| タスク名   | authCallbackServer タイムアウト停止責務分離   |
| 作成日     | 2026-02-28                                    |
| ステータス | completed                                     |
| 前提Phase  | Phase 8                                       |
| 後続Phase  | Phase 10                                      |

## 目的

静的品質・セキュリティ・エラーハンドリング整合を確定する。

## 実行タスク

- 静的品質確認: lint・typecheckの結果を記録する。
- セキュリティ確認: localhost限定・入力検証・例外メッセージ漏えいを確認する。
- エラー整合確認: timeout/stop失敗時の分類とログ方針を確認する。
- 品質サマリー作成: 品質判定を出荷可否の形で記録する。

## 参照資料

| 資料名               | パス                                                                                               | 内容                              |
| -------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| ブランチ差分         | `apps/desktop/src/main/auth/authCallbackServer.ts`                                                 | 停止責務分離の実装対象            |
| ブランチ差分         | `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`                                  | timeout後クリーンアップの実装対象 |
| 仕様選択ガイド       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                   | タスク種別ごとの必須仕様特定      |
| 仕様早見表           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                | Main/IPCの標準運用パターン確認    |
| 認証セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`                     | ローカル認証サーバー運用規則      |
| 責務配置             | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                         | Main/authの責務配置               |
| 認証アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                  | 認証待機とtimeout境界             |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                             | 認証型契約の整合                  |
| 認証IPC契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                | 外部契約変更有無の判定            |
| Mainサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                      | Main Processライフサイクル規律    |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                         | 攻撃面最小化と防御原則            |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                       | ハンドラ境界と安全設定            |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                              | timeout/停止失敗の分類規則        |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`        | 責務分離と再発防止パターン        |
| テストパターン       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                  | Fake Timersと非同期検証手順       |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                             | 再発防止運用の学習知見            |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-5/` | 依存成果物                        |

## 実行手順

### ステップ1: 差分と前提を固定する

- ブランチ差分2ファイルと本Phaseの目的を成果物冒頭へ記録する。
- 参照仕様の根拠を表形式で整理し、前提を固定する。

### ステップ2: 実行タスクを順番に完了する

- 実行タスクを記載順で処理し、各タスクの判断根拠を成果物へ記録する。
- 依存Phase成果物との矛盾が見つかったら同一Phase内で解消する。

### ステップ3: 成果物と検証結果を記録する

- `outputs/phase-9/` に成果物を出力し、完了条件を更新する。
- 実行したコマンドと結果要約を成果物末尾へ残す。

## 統合テスト連携

- 統合フローに対する静的品質の最終値を確認する。
- セキュリティ原則と実装の差分を比較する。
- エラー分類の漏れを点検する。

## 多角的チェック観点（AIが判断）

| 観点               | このPhaseで確認する内容                                   | 仕様参照先                                                   |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------ |
| セキュリティ       | localhost限定、不要公開面の排除、例外メッセージ漏えい防止 | `security-principles.md`, `security-electron-ipc.md`         |
| アーキテクチャ     | Main/authの責務境界、依存方向、停止ライフサイクル         | `architecture-auth-security.md`, `arch-electron-services.md` |
| API/IF整合         | 認証インターフェース契約の変更有無判定                    | `interfaces-auth.md`, `api-ipc-auth.md`                      |
| エラーハンドリング | timeout/stop失敗の分類と復旧手順                          | `error-handling.md`                                          |
| テスタビリティ     | timeout・停止・回帰の再現性ある検証                       | `testing-component-patterns.md`                              |
| 再発防止           | 過去教訓に沿った予防策の反映                              | `lessons-learned.md`                                         |

## 成果物

| 成果物         | パス                               | 内容                        |
| -------------- | ---------------------------------- | --------------------------- |
| 品質ゲート結果 | `outputs/phase-9/quality-gate.md`  | lint/typecheck/security判定 |
| リスク一覧     | `outputs/phase-9/risk-register.md` | 残存リスクと対処方針        |

## 完了条件

- [x] 実行タスクの全項目を実施した。
- [x] 参照資料の根拠を成果物に反映した。
- [x] 依存Phase成果物との矛盾がない。
- [x] ブランチ差分2ファイルとの対応が追跡できる。
- [x] `outputs/phase-9/` に成果物を出力した。
- [x] 本Phase内の全タスクを100%実行完了した。

## サブタスク管理

1. 参照資料確認
2. 実行タスク実施
3. 品質観点チェック
4. 成果物作成
5. 完了条件検証

## タスク100%実行確認【必須】

- [x] 実行タスクを全件完了した。
- [x] 成果物を `outputs/phase-9/` に出力した。
- [x] 依存Phase成果物との矛盾を解消した。
- [x] 本Phase内の全タスクを100%実行完了した。

## 依存関係

- 前提: Phase 8
- 後続: Phase 10

## 次のPhase

完了後、以下の仕様書を実行する。

`docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/phase-10-final-review.md`
