# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 3                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

型拡張の後方互換性、Facade 責務侵食の有無、IPC 変換の整合性、renderer エラー表示の UX 妥当性を判定する。

## 実行タスク

- 型拡張の後方互換性を判定する
- Facade 責務境界を判定する
- IPC 変換の整合性を判定する
- renderer エラー表示の UX 妥当性を判定する

## 参照資料

| 資料名              | パス                                           | 説明                        |
| ------------------- | ---------------------------------------------- | --------------------------- |
| Phase 1 要件        | `phase-1-requirements.md`                      | スタブ箇所・影響範囲        |
| Phase 2 設計        | `phase-2-design.md`                            | 型 / Facade / IPC / UI 設計 |
| error response 設計 | `{outputs/phase-2/error-response-design.md`    | 型拡張フロー                |
| reason code catalog | `{outputs/phase-2/reason-code-catalog.md`      | reason code 一覧            |
| IPC handler         | `apps/desktop/src/main/ipc/creatorHandlers.ts` | 既存 IpcResult パターン     |

## 判定

PASS

## Gate Summary

| Gate                       | 結果 | 根拠                                                                                               |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------- |
| G-01 型後方互換性          | PASS | `status` / `degradedReason` / `userMessage` は optional フィールドとして追加。既存コードに影響なし |
| G-02 Facade 責務境界       | PASS | Facade はエラー状態の判定と reason code 付与のみ。エラー表示ロジックは renderer に閉じる           |
| G-03 IPC 変換整合性        | PASS | 既存の `IpcResult` パターン（`{ success: false, error }`）を踏襲。新規チャネル不要                 |
| G-04 renderer UX 妥当性    | PASS | reason code に応じたユーザーフレンドリーメッセージ。既存の error state パターンに統合              |
| G-05 正常系パス非破壊      | PASS | 正常系は `status: "ok"` を付与するのみ。既存ロジックの条件分岐を変更しない                         |
| G-06 TASK-RT-01 競合リスク | PASS | RT-01 は llmAdapter エラー伝搬、RT-02 はスタブ置換。共有型の `status` フィールドのみマージ注意     |

## Minor Notes

| 項目                                                 | 行き先         |
| ---------------------------------------------------- | -------------- |
| execute() / improve() のスタブ条件の正確な行番号確認 | Phase 5 実装   |
| `userMessage` の i18n 対応                           | follow-up task |
| degraded status（部分的成功）のユースケース定義      | follow-up task |
| reason code の拡張性（新しい原因追加時の型安全性）   | Phase 9 QA     |

## 統合テスト連携

- Phase 4 の test matrix に全スタブ条件が含まれていることを確認する。
- Phase 9 で型拡張と既存正常系の互換性を再監査する。

## Phase 4 開始条件

- plan() / execute() / improve() の全スタブ条件が test case へ変換可能であること
- IPC handler 変換が Phase 5 の実装へ直接写像可能であること

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない
- spec_created のため、local check と change summary までで止める

## 成果物

| 成果物             | パス                                     | 説明                    |
| ------------------ | ---------------------------------------- | ----------------------- |
| design review gate | `{outputs/phase-3/design-review-gate.md` | gate summary と判定根拠 |

## 完了条件

- [ ] 型拡張が既存コードに影響しない
- [ ] Facade に UI ロジックが漏れていない
- [ ] IPC 変換が既存パターンに沿っている
- [ ] renderer エラー表示が UX として妥当である
- [ ] 正常系パスが非破壊である
- [ ] **本Phase内の全タスクを100%実行完了**
