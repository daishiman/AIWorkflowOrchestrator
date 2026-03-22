# Phase 3: ゲート判定 - Gate Decision

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 3                                                  |
| 作成日   | 2026-03-22                                         |

## 1. ゲート判定

### 判定: **PASS**

Phase 4 以降への着手を許可する。

## 2. 判定基準

| 判定     | 条件                                             | 適用 |
| -------- | ------------------------------------------------ | ---- |
| PASS     | 全 AC に対する設計充足 + MAJOR/CRITICAL 指摘なし | 該当 |
| MINOR    | 軽微な指摘あり、修正後 Phase 4 へ                | -    |
| MAJOR    | 設計上の欠陥あり、Phase 2 へ戻る                 | -    |
| CRITICAL | 要件レベルの問題、Phase 1 へ戻る                 | -    |

## 3. Phase 4 着手条件

- [x] Phase 1 の要件定義書・スコープ定義・棚卸しが outputs/phase-1/ に配置済み
- [x] Phase 2 の設計サマリー・契約マトリクス・検証マトリクスが outputs/phase-2/ に配置済み
- [x] Phase 3 の設計レビュー報告・ゲート判定が outputs/phase-3/ に配置済み
- [x] 全 AC (AC-1〜AC-5) が設計で充足されている
- [x] P31/P48 再描画リスクが評価済み
- [x] MAJOR / CRITICAL 指摘がゼロ

## 4. MINOR 追跡

| MINOR ID | 追跡先 Phase      | 内容                                  |
| -------- | ----------------- | ------------------------------------- |
| M-01     | Phase 12 未タスク | openTerminal handler placeholder      |
| M-02     | Phase 12 未タスク | retryConnection IPC 契約未定義        |
| M-03     | Phase 12 未タスク | chatSlice 未使用 state クリーンアップ |
| M-04     | Phase 12 未タスク | 複数 reason 優先度ロジック            |

## 5. Phase 13 blocked 条件

- ユーザーの明示的な指示なしにコミット・PR を作成しない
- 全 Phase (1-12) が completed ステータスであること
- artifacts.json の全 Phase が completed であること

## 6. 戻り先マッピング（Phase 10 最終レビュー用）

| 判定     | 戻り先                         |
| -------- | ------------------------------ |
| PASS     | Phase 11 へ                    |
| MINOR    | 未タスク仕様書化後 Phase 11 へ |
| MAJOR    | Phase 2 へ                     |
| CRITICAL | Phase 1 へ                     |
