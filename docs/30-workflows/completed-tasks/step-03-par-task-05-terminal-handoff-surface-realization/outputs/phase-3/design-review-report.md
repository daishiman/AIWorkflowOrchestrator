# Phase 3 成果物: 設計レビュー報告

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 3                                                 |
| 成果物種別 | 設計レビュー報告                                  |
| 作成日     | 2026-03-22                                        |

---

## 1. レビュー結果サマリー

| 観点                | 判定 | 根拠                                                          |
| ------------------- | ---- | ------------------------------------------------------------- |
| Concern 分解        | PASS | 3 concern（Launcher / Handoff Card / Consumer Adapter）で網羅 |
| DTO 統一            | PASS | HandoffGuidance を統一 DTO とし、全 consumer で消費           |
| Ownership 境界      | PASS | Main/Renderer の所有/禁止が明確、IPC 通過型も定義済み         |
| セキュリティ        | PASS | NFR-1a〜1f 全項目が設計に反映、P55/P62 対策あり               |
| CTA 契約            | PASS | primary 1 + secondary 1 以内、用語統一                        |
| Manual Boundary     | PASS | auto-send/hidden injection/headless の 3 禁止が明記           |
| Screenshot 契約     | PASS | TC-MAN-1〜8 + MB-1〜4 で検証ポイント定義済み                  |
| Simpler Alternative | PASS | 3 案を検討し、不採用理由が明確                                |

### 総合判定: **PASS**

---

## 2. MINOR 指摘事項

| ID   | 指摘                                                                           | 対応方針                                     | 追跡 Phase |
| ---- | ------------------------------------------------------------------------------ | -------------------------------------------- | ---------- |
| MN-1 | `toHandoffGuidance()` adapter の配置先が未定義                                 | Phase 5 で配置先決定（packages/shared 推奨） | Phase 5    |
| MN-2 | Terminal Dock の状態遷移で `aborted` state が未定義                            | Phase 6 edge case で追加                     | Phase 6    |
| MN-3 | GuidanceBlock の handoff variant と TerminalHandoffCard の使い分けルールが曖昧 | Phase 5 で明確な判定条件を記述               | Phase 5    |

**対応**: 全 MINOR を Phase 5/6 の未タスク仕様書に追記し、Phase 11 で追跡する。

---

## 3. 設計検証マトリクス結果

### 3.1 Concern 完全性

| 検証項目                  | 結果 | 備考                                       |
| ------------------------- | ---- | ------------------------------------------ |
| Concern が 3 以下         | PASS | Launcher / Handoff Card / Consumer Adapter |
| 各 concern の所有境界明確 | PASS | ownership table で全 concern の owner 一意 |
| concern 間の責務重複なし  | PASS | 重複 = 0                                   |

### 3.2 契約整合性

| 検証項目                                 | 結果 | 備考                                  |
| ---------------------------------------- | ---- | ------------------------------------- |
| HandoffGuidance が統一 DTO               | PASS | 全 consumer mapping 定義済み          |
| TerminalHandoffBundle が Renderer 非参照 | PASS | ownership table で禁止明記            |
| IPC 通過型が packages/shared 配置        | PASS | IPC 通過型ルール table で全型確認済み |
| CTA が primary 1 + secondary 1 以内      | PASS | 全 state で CTA ≤ 2                   |

### 3.3 セキュリティ検証

| 検証項目                          | 結果 | 備考                        |
| --------------------------------- | ---- | --------------------------- |
| terminalCommand に API key 非含有 | PASS | NFR-1a + P55 設計済み       |
| auto-send 禁止が設計保証          | PASS | 禁止操作 table に明記       |
| P62 暗黙 fallback 禁止            | PASS | assertNoSilentFallback 設計 |
| P55 メタ文字エスケープ            | PASS | sanitize 関数仕様記載済み   |

---

## 4. Drift リスク評価

| 箇所                                | Drift リスク | 緩和策                                               |
| ----------------------------------- | ------------ | ---------------------------------------------------- |
| terminal-only vs guidance-only 語彙 | 中           | scope-definition.md 用語テーブルを Phase 11 で再確認 |
| Consumer Adapter DTO 残存           | 低           | `grep -rn "TerminalHandoffBundle" renderer/` で監視  |
| CTA ラベル surface 間統一           | 低           | i18n key `cta.openTerminal` 一意化で対策             |
| Ownership 境界侵食                  | 低           | `grep -rn "authMode\|apiKey" renderer/` で監視       |

---

## 5. Simpler Alternative 再評価

Phase 2 で検討された 3 つの代替案を再評価。

| Alternative                    | Phase 3 再評価                                         | 結論 |
| ------------------------------ | ------------------------------------------------------ | ---- |
| GuidanceBlock 統一             | copy UX 不足は AC-2 と直結するため不採用が妥当         | 維持 |
| TerminalHandoffBundle IPC 昇格 | セキュリティ表面拡大は NFR-1f に反するため不採用が妥当 | 維持 |
| Launcher なし                  | AC-1 明示要件であるため不採用が妥当                    | 維持 |

**追加検討**: 「TerminalHandoffCard をそのまま GuidanceBlock の子にする composite パターン」も検討したが、Props 互換性と DTO 統一の観点から、現設計（独立コンポーネント + 共通 DTO）がより明快。
