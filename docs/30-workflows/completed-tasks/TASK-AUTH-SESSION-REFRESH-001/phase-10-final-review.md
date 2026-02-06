# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 10                   |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

実装完了後、全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## 参照資料

| 資料名               | パス                                                                           | 説明                     |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                   | Phase 1成果物            |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                                       | Phase 2成果物            |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                                    | Phase 5成果物            |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                           | Phase 7成果物            |
| 品質レポート         | `outputs/phase-9/quality-report.md`                                            | Phase 9成果物            |
| レビューゲート基準   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準・戻り先ロジック |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                        |
| -------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   | トークン非露出、暗号化保存  |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | 設計原則、Main/Renderer分離 |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`       | AuthSession型、IPC契約      |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラーコード、リトライ戦略  |
| APIエンドポイント    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | auth:refresh IPC仕様        |

## レビュー観点

### 1. 要件との整合性

| チェック項目                                         | 対応FR/AC | 判定 |
| ---------------------------------------------------- | --------- | ---- |
| Access Token有効期限の監視が実装されているか         | FR-001    |      |
| 有効期限5分前に自動リフレッシュが開始されるか        | FR-002    |      |
| バックグラウンドでリフレッシュが実行されるか         | FR-003    |      |
| リフレッシュ成功時にセッションが更新されるか         | FR-004    |      |
| リフレッシュ失敗時にログアウト処理が行われるか       | FR-005    |      |
| start/stop/reset機能が動作するか                     | FR-006    |      |
| ログアウト時にスケジューラーが停止されるか           | FR-007    |      |
| アプリ終了時にタイマーがクリーンアップされるか       | FR-008    |      |
| リトライロジックが実装されているか（指数バックオフ） | FR-009    |      |
| expiresAt単位変換（秒→ミリ秒）が正しいか             | FR-010    |      |
| autoRefreshToken: falseが設定されているか            | FR-011    |      |

### 2. セキュリティ確認

| チェック項目                                   | 判定 |
| ---------------------------------------------- | ---- |
| トークンがRendererプロセスに露出していないこと |      |
| IPC通信がwithValidation()で保護されていること  |      |
| ログ出力にトークンが含まれていないこと         |      |
| SecureStorageの暗号化が維持されていること      |      |
| リフレッシュ処理の排他制御が実装されていること |      |

### 3. コード品質

| チェック項目                | 判定 |
| --------------------------- | ---- |
| 全テスト成功                |      |
| ESLint/TypeScriptエラーゼロ |      |
| カバレッジ基準達成          |      |
| コードスメルなし            |      |

### 仕様参照チェック

タスクの性質に応じて、以下の仕様を参照して整合性を確認する：

| 観点               | 参照先（aiworkflow-requirements）          | 確認の方向性                            |
| ------------------ | ------------------------------------------ | --------------------------------------- |
| セキュリティ       | `security-principles.md`                   | トークン非露出、暗号化保存が仕様通りか  |
| アーキテクチャ     | `architecture-overview.md`                 | Main/Renderer分離、パターン適用が適切か |
| API設計            | `api-endpoints.md`                         | auth:refresh IPC契約が仕様通りか        |
| インターフェース   | `interfaces-auth.md`, `interfaces-core.md` | 型定義、IPC契約が正しいか               |
| エラーハンドリング | `error-handling.md`                        | エラーコード、リトライ戦略が仕様通りか  |

## 統合テスト連携【必須】

| レビュー項目 | 確認内容                              |
| ------------ | ------------------------------------- |
| 全テスト結果 | ユニットテスト全て成功                |
| カバレッジ   | Line 80%+, Branch 60%+, Function 80%+ |
| 接続テスト   | auth:refresh IPC連携が正しく動作      |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全レビュー観点で確認完了（要件整合9項目、セキュリティ4項目、コード品質4項目）
- [ ] 判定結果が記録されている
- [ ] MINOR指摘がある場合、未タスクとして記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1-9成果物）
2. 要件との整合性レビュー（9項目）
3. セキュリティ確認（4項目）
4. コード品質確認（4項目）
5. 仕様参照チェック（5観点）
6. 判定結果記録
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
