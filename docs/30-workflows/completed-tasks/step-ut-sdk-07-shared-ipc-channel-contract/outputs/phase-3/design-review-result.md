# Phase 3 設計レビュー結果

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 1. レビュー基準と判定

| #   | レビュー基準            | 判定 | コメント                                                                                                                                                                  |
| --- | ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 | 既存パターン準拠        | PASS | `CHAT_EXPORT_CHANNELS`, `SKILL_CHANNELS` 等と同一の `as const` オブジェクト + `IPC_CHANNELS` スプレッドパターンを踏襲                                                     |
| R-2 | Single Source of Truth  | PASS | shared パッケージにチャネル定義を追加し、parity テストで desktop との一致を保証。SSoT 原則に合致                                                                          |
| R-3 | Electron バンドル互換性 | PASS | `as const` オブジェクトは tree-shakable。desktop 側は `@repo/shared/src/ipc/channels` からの import に変更。既存の shared import パスと同じ解決方式                       |
| R-4 | テストカバレッジ        | PASS | 5種テスト (shared ユニット、allowlist 正当性、cross-layer parity、チャネル分離、import パス解決) で全 AC をカバー                                                         |
| R-5 | 後方互換性              | PASS | shared 側は新規定数追加のみ。desktop 側は3チャネルのリテラルを shared import に置換するが、`IPC_CHANNELS` の公開 API（キー名・値）は不変。既存 handler/hooks への影響なし |
| R-6 | 簡潔性                  | PASS | 変更対象は shared channels.ts (定義追加) + desktop channels.ts (import 変更) + テスト。最小限の差分で SSoT を達成                                                         |

---

## 2. ゲート判定

### **PASS**

全6基準を満たしている。Phase 4 (テスト作成) に進行可能。

---

## 3. 代替案分析

### 方式A: shared 追加 + desktop import 変更 (採用)

**概要**: shared 側に `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` を追加し、desktop 側は3チャネルのリテラル定義を shared からの import に置き換え。parity テストで契約を担保。

| 評価軸           | 評価                                                     |
| ---------------- | -------------------------------------------------------- |
| 既存パターン準拠 | 高 -- shared の既存グループパターンと完全一致            |
| 変更リスク       | 低〜中 -- desktop 側 import パス変更のバンドル確認が必要 |
| テスト信頼性     | 高 -- cross-layer parity テストで文字列値一致を保証      |
| 実装コスト       | 小 -- shared 1ファイル + desktop 1ファイル + テスト      |

**選定理由**: 構造的に drift を防止し、SSoT を確立。既存の `CHAT_EXPORT_CHANNELS` / `SKILL_CHANNELS` パターンと同じアプローチ。

### 方式B: parity テストのみ (不採用)

**概要**: shared 側に定義を追加せず、テストのみで desktop ローカル定義の値を検証。

| 評価軸           | 評価                                                |
| ---------------- | --------------------------------------------------- |
| 既存パターン準拠 | 低 -- shared に定義がないため SSoT 原則を満たさない |
| 変更リスク       | 最低 -- コード変更なし                              |
| テスト信頼性     | 中 -- 片方向の検証しかできない                      |
| 実装コスト       | 最小 -- テストファイルのみ                          |

**不採用理由**: SSoT 原則を満たさない。shared パッケージを消費する他のレイヤー (例: web app) がチャネル定義にアクセスできない。

### 方式C: 新規 enum による再定義 (不採用)

**概要**: `as const` オブジェクトの代わりに TypeScript enum でチャネルを再定義。

| 評価軸           | 評価                                                            |
| ---------------- | --------------------------------------------------------------- |
| 既存パターン準拠 | 低 -- 既存は全て `as const` オブジェクト。enum は使われていない |
| 変更リスク       | 高 -- 既存パターンとの不一致によりメンテナンスコスト増加        |
| テスト信頼性     | 高 -- enum 値による型チェック                                   |
| 実装コスト       | 中 -- パターン変更に伴う追加考慮が必要                          |

**不採用理由**: 既存コードベースのパターン (`as const`) と不一致。enum は tree-shaking で不利な場合があり、Electron バンドル最適化の観点でも非推奨。

---

## 4. 補足: 設計決定の記録

- desktop 側への shared import 導入は本タスクでは見送り。desktop の `IPC_CHANNELS` は388エントリのフラットオブジェクトであり、shared のグループ構造への移行は別タスクとして扱うべき規模である
- `EXECUTION_GET_TERMINAL_LOG` / `EXECUTION_GET_COPY_COMMAND` は本タスクスコープ外とするが、実装時に `EXECUTION_CHANNELS` へまとめて追加することを推奨する (追加コスト微小)
