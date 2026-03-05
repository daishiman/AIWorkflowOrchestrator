# Phase 5: 実装

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装                             |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | pending                          |
| 作成日     | 2026-03-05                       |
| 機能名     | task-056a-a-store-slice-baseline |

## 目的

Store Slice棚卸し仕様を実装へ反映する作業手順を定義し、変更箇所と判定根拠の追跡性を確保する。

## 実行タスク

- Slice台帳反映: 既存Sliceの責務表を作成
- 境界マトリクス反映: 新規/拡張/非対象を確定
- セレクタ規約反映: P31対策の命名規約と非推奨方針を記録

## 参照資料

| 参照資料           | パス                                                                                        | 内容             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様         | `./phase-4-test-creation.md`                                                                | 実装前条件       |
| 状態管理パターン   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice追加手順    |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | セレクタ設計     |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時の文言規約 |

## 実行手順

### Step 1: Slice Inventory作成

- 現行Sliceを責務単位で記録する。
- `partialize`対象を列として追加する。

### Step 2: 境界マトリクス作成

- Notificationを`new`候補で登録する。
- HistorySearchを`new`候補で登録する。
- SkillCenterを`local-useState`で固定する。

### Step 3: セレクタ規約記載

- 合成Hook非推奨を明記する。
- 個別セレクタ命名規約を記載する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                 |
| ---------------- | ------------------------ |
| API接続          | 本PhaseはIPC未変更を維持 |
| 認証フロー       | 認証Slice未変更を維持    |
| データフロー     | Store内の責務境界を確定  |

## 成果物

| 成果物         | パス                                        | 内容       |
| -------------- | ------------------------------------------- | ---------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | 実施内容   |
| Slice台帳      | `outputs/phase-5/slice-inventory.md`        | 棚卸し結果 |
| 境界マトリクス | `outputs/phase-5/slice-boundary-matrix.md`  | 判定結果   |

## 完了条件

- [ ] Slice台帳が完成
- [ ] 境界マトリクスが完成
- [ ] セレクタ規約が記録済み
- [ ] Phase 6のテスト拡充入力が準備済み

## 次のPhase

Phase 6: テスト拡充
