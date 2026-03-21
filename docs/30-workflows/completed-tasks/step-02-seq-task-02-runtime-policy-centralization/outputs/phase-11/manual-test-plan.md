# Phase 11: 手動テスト計画 - Runtime Policy Centralization

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| タスク ID  | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| Phase      | 11（手動テスト）                           |
| 作成日     | 2026-03-21                                 |
| タスク種別 | 設計タスク（プロダクションコード変更なし） |
| テスト方式 | 設計文書 diff + grep ベース静的確認        |

## 概要

本タスクは設計タスクであり、プロダクションコードの変更は行わない。そのため、手動テストは設計成果物の整合性確認および grep ベースの静的確認コマンドによる禁止パターン検出で構成する。

後続の実装タスク（Task03-09）で実際の UI 操作・ランタイム動作確認を実施する。

---

## シナリオ 1: AI Chat の runtime 判定確認

| TC-ID     | 確認手順                                                                     | 期待結果                    | 合否判定基準                          | 証跡方法      |
| --------- | ---------------------------------------------------------------------------- | --------------------------- | ------------------------------------- | ------------- |
| MT-11-001 | API Key モードで AI Chat 実行 → Main Process ログに `resolve()` 呼び出し確認 | `integrated_api` が返される | PASS: `resolve()` が呼ばれている      | 設計文書 diff |
| MT-11-002 | IPC レスポンスに apiKey なし確認 → DevTools Network タブ確認                 | apiKey フィールド不在       | PASS: apiKey がレスポンスに含まれない | grep ログ     |
| MT-11-003 | Subscription モードで AI Chat 実行 → `terminal_handoff` が返される           | Handoff 画面表示            | PASS: HandoffGuidance 3フィールド表示 | 設計文書 diff |
| MT-11-004 | Handoff 画面情報確認 → `terminalCommand` / `contextSummary` / `reason` 表示  | 全フィールド存在            | PASS: 3フィールド全表示               | 設計文書 diff |

## シナリオ 2: health check primary route 確認

| TC-ID     | 確認手順                                                   | 期待結果                                    | 合否判定基準                            | 証跡方法      |
| --------- | ---------------------------------------------------------- | ------------------------------------------- | --------------------------------------- | ------------- |
| MT-11-005 | プロバイダー選択して接続確認 → `llm:check-health` IPC 呼出 | `HealthCheckResult` 返却                    | PASS: `llm:check-health` が呼ばれている | 設計文書 diff |
| MT-11-006 | `AI_CHECK_CONNECTION` 未使用確認 → DevTools Network 確認   | 0 件                                        | PASS: `AI_CHECK_CONNECTION` 呼出なし    | grep ログ     |
| MT-11-007 | 無効 API Key で接続確認                                    | `status="unhealthy"` → エラーメッセージ表示 | PASS: unhealthy 表示                    | 設計文書 diff |
| MT-11-008 | `checkedAt` 値確認 → 現在時刻付近の timestamp              | ±1000ms 以内                                | PASS: timestamp が妥当                  | 設計文書 diff |

## シナリオ 3: surface-local 判定禁止確認

| TC-ID     | 確認手順                                                                                                | 期待結果             | 合否判定基準      | 証跡方法  |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------- | ----------------- | --------- |
| MT-11-009 | Renderer authMode 確認 → apiKey 生値なし                                                                | mode 文字列のみ      | PASS: apiKey 不在 | grep ログ |
| MT-11-010 | authMode 分岐確認 → grep -rn で Renderer コード確認                                                     | runtime 判定分岐なし | PASS: 0件         | grep ログ |
| MT-11-011 | grep 静的確認 → `grep -rn "authMode.*=.*subscription\|authMode.*=.*api-key" apps/desktop/src/renderer/` | 0件                  | PASS: 0件         | grep ログ |

## シナリオ 4: HandoffGuidance IPC 形式確認

| TC-ID     | 確認手順                                                                              | 期待結果                    | 合否判定基準               | 証跡方法      |
| --------- | ------------------------------------------------------------------------------------- | --------------------------- | -------------------------- | ------------- |
| MT-11-012 | Subscription モード Agent 実行 → HandoffGuidance 返却                                 | 3フィールド存在             | PASS: HandoffGuidance 形式 | 設計文書 diff |
| MT-11-013 | TerminalHandoffBundle 不在確認 → `launcher` / `promptBundle` / `manualRetryRule` なし | Main 内部型が漏洩していない | PASS: 内部型不在           | grep ログ     |
| MT-11-014 | contextSummary surface 識別確認 → agent/skill で異なる contextSummary                 | surface 名含む              | PASS: surface 名一致       | 設計文書 diff |

---

## grep ベース静的確認コマンド一覧

後続実装タスクの担当者が使用する確認コマンド。設計タスク完了時点では「設計文書上でこれらの制約が定義されていること」を確認する。

```bash
# MT-11-010: surface-local 判定残存確認
grep -rn "surfaceType\|surface_type" apps/desktop/src/

# MT-11-011: authMode runtime 判定禁止確認
grep -rn "authMode.*=.*subscription\|authMode.*=.*api-key" apps/desktop/src/renderer/

# M-1-001: AI_CHECK_CONNECTION 呼び出し元ゼロ確認
grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/

# M-1-003: TerminalHandoffBundle Renderer 未参照
grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/

# M-1-004: RuntimeResolution Renderer 未参照
grep -rn "RuntimeResolution" apps/desktop/src/renderer/

# RuntimeResolver deprecated 確認（移行後）
grep -rn "RuntimeResolver" apps/desktop/src/

# buildForAgentExecution/buildForSkillExecution deprecated 確認
grep -rn "buildForAgentExecution\|buildForSkillExecution" apps/desktop/src/
```

---

## 設計タスクにおける手動テスト判定

本タスクは設計タスクであるため、上記テストケースの実行は後続実装タスクに委譲する。Phase 11 としての合否判定は以下の基準で行う:

1. **設計文書の整合性**: Phase 1-10 の設計成果物間で矛盾がないこと
2. **grep コマンドの定義完全性**: 全禁止パターンに対応する確認コマンドが定義されていること
3. **テストケースの網羅性**: validation-matrix.md のシナリオ 1-4 が全て TC-ID 付きで展開されていること

**Phase 11 判定: PASS**（設計タスクとして必要な手動テスト計画が完備）
