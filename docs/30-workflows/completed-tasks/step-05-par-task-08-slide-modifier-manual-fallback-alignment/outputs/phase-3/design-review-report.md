# Phase 3: 設計レビュー報告

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 3                                                     |
| 作成日   | 2026-03-23                                            |
| 前提     | Phase 1-2 成果物                                      |

## 1. レビュー観点と判定

### 1.1 Silent Fallback

| 観点                           | 判定 | 根拠                                               |
| ------------------------------ | ---- | -------------------------------------------------- |
| silent fallback の特定完了     | PASS | getApiKey() の safeStorage→env fallback を特定済み |
| fallback 明示化の設計          | PASS | SlideCapabilityDTO.apiKeySource で source を開示   |
| P62 準拠（暗黙 fallback 禁止） | PASS | warning ログ + capability DTO で通知する設計       |

### 1.2 Legacy Path 残置

| 観点                         | 判定 | 根拠                                                 |
| ---------------------------- | ---- | ---------------------------------------------------- |
| direct SDK path の棚卸し完了 | PASS | agent-client.ts L9,L245 を特定済み                   |
| 整理順と ownership の明確性  | PASS | cleanup 順序テーブルに9ステップ・担当タスクID を定義 |
| 段階的移行の妥当性           | PASS | 即時削除（Alternative 1）の不採用理由が明確          |

### 1.3 Task Ownership 衝突

| 観点                             | 判定 | 根拠                                                  |
| -------------------------------- | ---- | ----------------------------------------------------- |
| ファイル ownership の一意性      | PASS | ownership テーブルで全ファイルの変更権限が一意        |
| Task05 との分離境界              | PASS | TerminalHandoffCard を共有、Slide 固有スコープが分離  |
| Task09 governance への follow-up | PASS | cleanup 順序テーブルの順序6,7で governance 委譲を明記 |

### 1.4 UI 4領域の設計品質

| 観点                    | 判定 | 根拠                            |
| ----------------------- | ---- | ------------------------------- |
| 状態遷移の完全性        | PASS | 4状態 + 不正遷移4パターンを定義 |
| 表示ルールの一貫性      | PASS | 状態×領域の表示マトリクスが完備 |
| screenshot 契約の紐付け | PASS | UX-07 TC-ID が5件定義済み       |

### 1.5 DTO 設計

| 観点                            | 判定  | 根拠                                                   |
| ------------------------------- | ----- | ------------------------------------------------------ |
| ModifierResponse 後方互換       | PASS  | 追加フィールドは全て optional                          |
| SlideCapabilityDTO の必要性     | MINOR | 新規 DTO 追加は IPC channel 追加を伴う。実装時に確認要 |
| TerminalHandoffCard Task05 互換 | PASS  | Task05 共有 DTO として最小限のフィールド               |

## 2. 総合判定

| 判定                      | 対応                          |
| ------------------------- | ----------------------------- |
| **PASS（MINOR 1件付き）** | MINOR 対応後 Phase 4 へ進行可 |

### MINOR 指摘詳細

| ID    | 指摘                                                                                        | 追跡先                         |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| MN-01 | SlideCapabilityDTO 追加に伴う IPC channel 設計を Phase 5 implementation-plan で明示すること | Phase 5 implementation-plan.md |

## 3. Simpler Alternative 再確認

Phase 2 で検討した3つの Alternative を再評価した結果、全て不採用判定を維持する。

| Alternative                           | 再評価結果 | 理由                               |
| ------------------------------------- | ---------- | ---------------------------------- |
| 1: agent-client.ts 即時削除           | 不採用維持 | slide 機能停止のリスクが許容範囲外 |
| 2: UI 4領域を汎用 banner に簡略化     | 不採用維持 | UX-07 screenshot 契約に違反        |
| 3: IPC namespace 統一を Task08 で実施 | 不採用維持 | 設計タスクのスコープ逸脱           |

## 4. AC 照合

| AC   | 検証結果 | 証跡                                                 |
| ---- | -------- | ---------------------------------------------------- |
| AC-1 | 充足     | contract-matrix.md: lane 分離表 + state 遷移表       |
| AC-2 | 充足     | design-summary.md: cleanup 順序テーブル（9ステップ） |
| AC-3 | 充足     | contract-matrix.md: UX-07 TC-ID 5件                  |
| AC-4 | 充足     | design-summary.md: Concern C follow-up ルール        |
