# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 3                                |
| Phase名    | 設計レビューゲート               |
| 前提Phase  | Phase 2                          |
| 後続Phase  | Phase 4                          |
| ステータス | pending                          |
| 作成日     | 2026-03-05                       |
| 機能名     | task-056a-a-store-slice-baseline |

## 目的

Phase 2の設計がP31対策、Slice Isolation、後続タスク連携の3軸を満たすかを判定し、Phase 4以降へ進む条件を固定する。

## 実行タスク

- 設計整合レビュー: 台帳・境界・規約の整合確認
- 依存レビュー: `task-056b` と接続時の前提確認
- 判定作成: PASS / MINOR / MAJOR の判定表を作成

## 参照資料

| 参照資料           | パス                                                                         | 内容               |
| ------------------ | ---------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物      | `./phase-1-requirements.md`                                                  | 要件と受け入れ基準 |
| 設計書             | `./phase-2-design.md`                                                        | レビュー対象       |
| 状態管理パターン   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31対策根拠        |
| アーキテクチャ総論 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | 責務分離根拠       |

## 実行手順

### Step 1: 設計差分チェック

- 3成果物の用語を照合する。
- 同一概念の重複定義を検出する。

### Step 2: 依存関係チェック

- `task-056b` が参照する境界情報の欠損を検査する。
- `task-056c` / `task-056d` の入力条件を満たすか判定する。

### Step 3: レビュー判定

- PASS: 重大欠損0件。
- MINOR: 修正項目3件以内。
- MAJOR: 重大欠損1件以上。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                               |
| ---------------- | -------------------------------------- |
| API接続          | IPC関連は `task-056b` へ委譲済みか確認 |
| 認証フロー       | 認証Slice境界を侵食しない設計か確認    |
| データフロー     | Store境界が一方向依存か確認            |

## 成果物

| 成果物       | パス                                      | 内容            |
| ------------ | ----------------------------------------- | --------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定と根拠      |
| 修正項目表   | `outputs/phase-3/review-findings.md`      | MINOR/MAJOR項目 |

## 完了条件

- [ ] 3成果物の整合確認が完了
- [ ] 判定基準に基づく結果が記録済み
- [ ] MAJOR時の差し戻し先が明記済み
- [ ] Phase 4へ進む条件が明記済み

## 次のPhase

Phase 4: テスト作成
