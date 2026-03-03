# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |
| 作成日     | 2026-03-03                                |
| ステータス | pending                                   |

## 目的

AUTHENTICATION_ERROR の事前検知と設定誘導 を実装可能な単位へ分解し、Phase 5 の成果物を確定する。

## 背景

AUTHENTICATION_ERROR の事前検知と設定誘導 を実行する前提として、Phase 5 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- Green実装設計: Red テストを通す最小実装を定義する
- 配線実装設計: register/export/call の接続を定義する
- エラー導線設計: UI 表示とログを統一する

## 参照資料

| 資料名                    | パス                                                                                 | 用途                          |
| ------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Executor仕様正本          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 契約確認 |
| エラーハンドリング正本    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類確認                |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService 運用方針確認   |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload境界確認               |
| IPC契約正本               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 戻り値契約確認                |
| 認証I/F正本               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定導線と状態定義確認        |
| Phase 4 仕様              | `phase-4-test-creation.md`                                                           | 依存入力（テスト作成）        |

## 実行手順

1. Red を Green にする最小変更を設計する。
2. 配線順序を固定する。
3. エラー導線を確認する。

## 統合テスト連携

- 実装後に契約テストと結合テストを実行し、配線断がないことを確認する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物       | パス                                        | 内容     |
| ------------ | ------------------------------------------- | -------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装方針 |
| 変更一覧     | `outputs/phase-5/changed-files.md`          | 変更対象 |

## 完了条件

- [ ] 実行タスクの成果物が全件定義されている
- [ ] 依存Phaseとの整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-5/ に定義する。
4. 完了条件を確認する。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 6: テスト拡充
