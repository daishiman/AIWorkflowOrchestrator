# Phase 5: 実装

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

設計で決定した方式で `AUTH_*` 登録重複式を排除し、既存契約を保持する。

## 実行タスク

- SubAgent-C: 登録一元化コードを実装する。
- SubAgent-B: Phase 4ケースに沿って失敗を解消する。
- Lead: 差分を最小化し、可読性と追跡性を確保する。

## 参照資料

| 参照資料                  | パス                                                                          | 内容           |
| ------------------------- | ----------------------------------------------------------------------------- | -------------- |
| Phase 2                   | `phase-2-design.md`                                                           | 採用方式       |
| Phase 4                   | `phase-4-test-creation.md`                                                    | テスト要件     |
| 認証IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`           | 契約基準       |
| IPC契約チェック           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 整合判定       |
| regression-cases.md       | `outputs/phase-4/regression-cases.md`                                         | Phase 4 成果物 |
| spec-planned-artifacts.md | `outputs/phase-4/spec-planned-artifacts.md`                                   | Phase 4 成果物 |
| test-commands.md          | `outputs/phase-4/test-commands.md`                                            | Phase 4 成果物 |
| test-specification.md     | `outputs/phase-4/test-specification.md`                                       | Phase 4 成果物 |

## 実行手順

1. 登録一元化コードを追加する。
2. 既存テストを通し契約互換を確認する。
3. 変更理由と影響範囲を成果物へ記録する。

## 統合テスト連携

| 接続点      | 実装要件                              |
| ----------- | ------------------------------------- |
| Main登録    | `AUTH_*` 全チャネルが単一フローで登録 |
| Preload連携 | 公開APIの外形を維持                   |
| エラー処理  | 既存ハンドラの例外契約を維持          |

## 成果物

| 成果物   | パス                                    | 説明           |
| -------- | --------------------------------------- | -------------- |
| 実装ログ | `outputs/phase-5/implementation-log.md` | 変更要約       |
| 差分一覧 | `outputs/phase-5/diff-summary.md`       | ファイル別変更 |
| 影響範囲 | `outputs/phase-5/impact-analysis.md`    | 回帰影響       |

## 完了条件

- [ ] `AUTH_*` 重複式が排除されている
- [ ] 既存契約が維持されている
- [ ] Phase 4で定義した主要ケースが通過可能
- [ ] 統合テスト連携の実装要件を満たしている
- [ ] 本Phase内の全タスクを100%実行完了
