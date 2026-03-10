# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 10                              |
| Phase名    | 最終レビュー                    |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 9                         |
| 後続Phase  | Phase 11                        |

## 目的

実装の品質・整合性・セキュリティを多角的に最終検証し、手動テストに進めるか判定する。

## 実行タスク

- タスク1: helper 抽出後も公開 API 契約が不変であることをレビューする
- タスク2: セキュリティ境界と error message の露出範囲を最終確認する
- タスク3: AC と未タスク化ルールに照らして判定する

### タスク1: コードレビュー

**目的**: 実装コードの品質を最終確認する

**チェック項目**:

- [ ] `Promise.race` パターンが設計どおりに実装されている
- [ ] timeout 実装が `ipc-utils.ts` に集約され、各 wrapper が薄い委譲に留まっている
- [ ] `IPC_TIMEOUT_MS` が定数として定義されている
- [ ] エラーメッセージに channel 名が含まれている
- [ ] 内部情報（パス、スタックトレース）がエラーメッセージに含まれていない
- [ ] `any` 型が使用されていない
- [ ] non-null assertion (`!`) が使用されていない（P48/P52 準拠）
- [ ] 未使用の import がない
- [ ] コメントが適切

### タスク2: セキュリティ最終確認

**目的**: Preload 層のセキュリティ境界が維持されていることを最終確認する

**チェック項目**:

- [ ] `contextIsolation` / `sandbox` の設定に変更がない
- [ ] `contextBridge` のホワイトリスト制御が維持されている
- [ ] チャンネルバリデーションが維持されている
- [ ] エラーメッセージに機密情報が含まれていない

### タスク3: 受け入れ基準最終確認

**目的**: AC-1〜AC-6 が全て満たされていることを最終確認する

| AC   | 基準                          | 検証方法       | 結果 |
| ---- | ----------------------------- | -------------- | ---- |
| AC-1 | タイムアウトで reject         | テスト T1 PASS | 確認 |
| AC-2 | エラーメッセージに channel 名 | テスト T2 PASS | 確認 |
| AC-3 | 正常応答はタイムアウトなし    | テスト T4 PASS | 確認 |
| AC-4 | チャンネル拒否は従来どおり    | テスト T6 PASS | 確認 |
| AC-5 | 定数として定義                | コードレビュー | 確認 |
| AC-6 | 全既存テスト PASS             | Phase 9 結果   | 確認 |

### タスク4: 最終判定

**目的**: レビュー結果に基づく最終判定を行う

**判定基準**:

| 判定     | 条件                     | アクション                          |
| -------- | ------------------------ | ----------------------------------- |
| PASS     | 全チェック項目に問題なし | Phase 11 へ                         |
| MINOR    | 軽微な指摘あり           | 未タスク仕様書に変換後、Phase 11 へ |
| MAJOR    | 重大な問題あり           | Phase 1-5 へ戻る                    |
| CRITICAL | セキュリティ問題あり     | Phase 1 へ戻り要件再確認            |

**MINOR 指摘時の必須対応**:

- 全ての MINOR 指摘を未タスク仕様書に変換（省略不可）
- `docs/30-workflows/unassigned-task/` に指示書作成
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録

## 参照資料

| 参照資料           | パス                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md`      |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`            |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-5-implementation.md`    |
| Phase 9 品質検証   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-9-quality-assurance.md` |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                                          |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | セキュリティ最終確認（IPC境界検証） |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約最終検証                     |
| 実装パターン集            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン準拠確認                |
| 状態管理                  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | timeout 後の state 終了条件確認     |

## 統合テスト連携

- PASS/MINOR の場合、Phase 11 で手動テストを行う
- MAJOR/CRITICAL の場合、該当 Phase に戻り修正

## 成果物

| 成果物                     | パス                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| 最終レビュー結果（本文書） | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-10-final-review.md` |

## 完了条件

- [ ] コードレビューの全チェック項目を確認
- [ ] セキュリティ最終確認の全チェック項目を確認
- [ ] 受け入れ基準 AC-1〜AC-6 の最終確認
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）を決定
- [ ] MINOR 指摘がある場合、未タスク仕様書に変換
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 11: 手動テストへ進む。実際の Electron 環境での動作確認を行う。
