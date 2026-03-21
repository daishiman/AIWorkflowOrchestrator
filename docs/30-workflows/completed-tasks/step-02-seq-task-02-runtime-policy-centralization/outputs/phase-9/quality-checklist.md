# 品質検証チェックリスト

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 9 - 品質検証                          |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION |
| 作成日     | 2026-03-21                            |
| 前提成果物 | phase-1 ~ phase-8 の全成果物          |

---

## 5観点の確認結果

### 1. UX: ui-ux-realization.md との整合

| 確認項目                                        | 状態     | 根拠                                                     |
| ----------------------------------------------- | -------- | -------------------------------------------------------- |
| 状態語彙（allowed/blocked/unknown）が設計に反映 | 確認済み | RuntimeDecision.status で3値を定義                       |
| CTA（Call to Action）が handoff 契約に含まれる  | 確認済み | HandoffGuidance.actionLabel で CTA テキストを保持        |
| handoff 契約が Renderer で消費可能な形式        | 確認済み | sanitizeForRenderer() で apiKey を除外した安全な型を提供 |
| surface ごとの UX 差分が HandoffGuidance に反映 | 確認済み | buildForSurface() で surface 固有の contextSummary 生成  |

**判定**: 確認済み

### 2. アーキテクチャ: arch-state-management-core.md との整合

| 確認項目                                                | 状態     | 根拠                                                                       |
| ------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| 3 concern の Ownership Table が定義されている           | 確認済み | runtime実行可否 / health check / handoff bundle / authMode参照 の4カテゴリ |
| Ownership Table が arch-state-management-core.md と整合 | 確認済み | 状態の配置原則（Zustand Store / Main Process / shared）に準拠              |
| RuntimePolicyResolver の配置が Main Process             | 確認済み | 03-state-management.md のレイヤー依存方向に準拠                            |
| HandoffGuidance の配置が packages/shared                | 確認済み | 01-architecture.md のモノレポ構造ルールに準拠                              |

**判定**: 確認済み

### 3. IPC: api-ipc-system-core.md との整合

| 確認項目                                                   | 状態     | 根拠                                         |
| ---------------------------------------------------------- | -------- | -------------------------------------------- |
| Policy Consumption Contract 原則 1（Single Entry）         | 確認済み | resolve() が唯一の判定エントリーポイント     |
| Policy Consumption Contract 原則 2（No Direct Store）      | 確認済み | Renderer は IPC 経由でのみ policy 結果を受信 |
| Policy Consumption Contract 原則 3（Sanitized Output）     | 確認済み | sanitizeForRenderer() で apiKey 除外         |
| Policy Consumption Contract 原則 4（Surface Independence） | 確認済み | 各 surface の判定がステートレスで独立        |
| llm:check-health が primary health route                   | 確認済み | DD-3 で定義、Contract 5 で境界設定           |
| AI_CHECK_CONNECTION が新規参照禁止                         | 確認済み | DD-4 で定義、Contract 6 で境界設定           |

**判定**: 確認済み

### 4. セキュリティ: security-electron-ipc-core.md との整合

| 確認項目                                       | 状態     | 根拠                                          |
| ---------------------------------------------- | -------- | --------------------------------------------- |
| apiKey が Renderer に送信されない              | 確認済み | DD-2 + Contract 2（sanitizeForRenderer 経由） |
| TerminalHandoffBundle が Main Process 内部限定 | 確認済み | Contract 4（Renderer からの参照ゼロ確認）     |
| IPC チャンネルがホワイトリスト管理             | 確認済み | 04-electron-security.md 準拠                  |
| エラー情報のサニタイズ                         | 確認済み | エラー応答に内部パス情報を含めない            |

**判定**: 確認済み（DD-2 による apiKey 除外が主要なセキュリティ境界）

### 5. ワークフロー: DD-1 ~ DD-6 と validation-matrix.md AC の対応

| DD   | 設計判断                          | 対応 AC              | 対応状態 |
| ---- | --------------------------------- | -------------------- | -------- |
| DD-1 | resolve() 単一エントリーポイント  | AC-1, AC-2, AC-3     | 対応済み |
| DD-2 | apiKey を Renderer に送信しない   | AC-2（セキュリティ） | 対応済み |
| DD-3 | llm:check-health が primary route | AC-4                 | 対応済み |
| DD-4 | AI_CHECK_CONNECTION 新規参照禁止  | AC-4（補完）         | 対応済み |
| DD-5 | SurfaceType による型安全分類      | AC-5, AC-6           | 対応済み |
| DD-6 | HandoffGuidance を shared に配置  | AC-5, AC-6           | 対応済み |

**判定**: 確認済み

---

## implementation_ready 判定

**判定: 着手可（条件付き）**

### 前提条件

| 条件 ID | 内容                                                                         | 担当 Phase         |
| ------- | ---------------------------------------------------------------------------- | ------------------ |
| C-1     | M-1（RuntimeDecisionForRenderer サニタイズ型）の型ファイル定義完了           | 実装タスク Phase 5 |
| C-2     | M-2（resolve シグネチャ）の Phase 4 確定結果が contract-matrix.md に反映済み | 完了済み           |

### 条件充足状況

- C-1: 型定義は実装タスクの Phase 5 で作成する。設計段階では型の仕様（apiKey を除外した RuntimeDecision のサブセット）が確定済み
- C-2: Phase 4 で `resolve(authMode: AuthMode | undefined, apiKey: string | undefined): RuntimeDecision` として確定済み
