# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 10                                  |
| タスクID   | TASK-NOTIFICATION-SERVICE-001       |
| 作成日     | 2026-04-01                          |
| ゲート種別 | 最終品質ゲート（Phase 11 進入許可） |

---

## 目的

Phase 5〜9 の全成果物が手動テスト・ドキュメント更新・PR 作成に進む品質水準を満たしているかを総合的に判定する。
PASS であれば Phase 11（手動テスト）へ進む。MAJOR であれば指定された Phase へ差し戻す。

---

## 実行タスク

### タスク 10-1: 最終レビュー観点の確認

| 観点                               | 確認内容                                                                             | 判定    |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| AC 充足                            | AC-1〜AC-9 が Phase 9 で全て PASS                                                    | PENDING |
| テスト Green                       | TC-E-01〜TC-E-05、TC-F-01〜TC-F-08、TC-B-01〜TC-B-03 が全て Green                    | PENDING |
| typecheck 通過                     | `pnpm --filter @repo/desktop typecheck` が 0 エラー                                  | PENDING |
| lint 通過                          | `pnpm --filter @repo/desktop lint` が 0 エラー                                       | PENDING |
| カバレッジ目標達成                 | `ElectronNotificationService.ts` と `beforeQuitGuard.ts` のブランチカバレッジが 100% | PENDING |
| リグレッションなし                 | 既存テストに新規失敗がないこと                                                       | PENDING |
| セキュリティ境界                   | `ElectronNotificationService` が Main Process 外に漏洩していないこと                 | PENDING |
| `notificationHandlers.ts` 競合なし | `git diff apps/desktop/src/main/ipc/notificationHandlers.ts` に変更がないこと        | PENDING |
| リスク管理完了                     | Phase 9 のリスク管理表が作成されていること                                           | PENDING |

### タスク 10-2: 差し戻し条件の確認

以下のいずれかが発生した場合は差し戻す:

| 条件                                                             | 差し戻し先                  |
| ---------------------------------------------------------------- | --------------------------- |
| AC のいずれかが FAIL                                             | Phase 5（実装）             |
| テストが失敗している                                             | Phase 5 または Phase 6      |
| typecheck / lint エラーがある                                    | Phase 8（リファクタリング） |
| セキュリティ境界の侵害                                           | Phase 5（実装）             |
| `apps/desktop/src/main/ipc/notificationHandlers.ts` に変更がある | Phase 5（実装）             |

### タスク 10-3: ゲート判定

| 判定      | 意味                   | 次のアクション               |
| --------- | ---------------------- | ---------------------------- |
| **PASS**  | 全観点が通過した       | Phase 11（手動テスト）へ進む |
| **MAJOR** | 重大な問題が発見された | 差し戻し先 Phase へ戻る      |
| **MINOR** | 軽微な問題がある       | Phase 11 後に対処する        |

### タスク 10-4: 最終レビュー結果の記録

`outputs/phase-10/final-review-result.md` に以下を記録する:

- 全観点の判定結果
- ゲート判定（PASS/MAJOR/MINOR）
- MAJOR の場合は差し戻し先と理由
- PASS の場合は Phase 11 への進行許可の記録

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容                      |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |

### 確認対象

| ファイル           | パス                                       |
| ------------------ | ------------------------------------------ |
| 品質レポート       | `outputs/phase-9/quality-report.md`        |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` |

---

## 実行手順

### ステップ 1: 全チェックの確認

タスク 10-1 の表を全て PENDING から PASS/FAIL に更新する。

### ステップ 2: 差し戻し条件の確認

FAIL 項目があれば差し戻し条件（タスク 10-2）と照合し、差し戻し先を決定する。

### ステップ 3: ゲート判定の実施

全観点が PASS の場合は「PASS」を記録する。FAIL があれば「MAJOR」として差し戻す。

### ステップ 4: レビュー結果の作成

`outputs/phase-10/final-review-result.md` を作成する。

---

## 多角的チェック観点

| 観点               | 確認内容                                                       |
| ------------------ | -------------------------------------------------------------- |
| 網羅性             | Phase 1 で定義した AC-1〜AC-9 が全て実装で満たされていること   |
| 安全性             | 通知失敗・`beforeQuitGuard` が副作用なく動作する設計であること |
| 後方互換性         | 既存機能に影響を与えていないこと                               |
| 手動テスト準備完了 | Phase 11 の手動テスト手順に必要な環境が整っていること          |

---

## 成果物

| 成果物           | パス                                      | 説明                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 全観点の判定・ゲート判定 |

---

## 完了条件

- [ ] タスク 10-1 の全観点に判定が記入された
- [ ] PASS / MAJOR / MINOR のゲート判定が記録された
- [ ] MAJOR の場合は差し戻し先と理由が明記された
- [ ] `outputs/phase-10/final-review-result.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 10 完了時に以下を明記すること:

- 全観点の判定結果（PASS / FAIL）
- ゲート判定（PASS / MAJOR / MINOR）
- 次のアクション（Phase 11 へ進む、または差し戻し先）

---

## 次 Phase

- **PASS / MINOR**: Phase 11（手動テスト検証）へ進む
- **MAJOR**: 差し戻し先 Phase へ戻り、修正完了後に再度 Phase 10 を実施する
