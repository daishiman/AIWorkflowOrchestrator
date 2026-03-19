# Phase 1 成果物: 要件定義

## メタ情報

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| タスク ID  | UT-06-005-A                                                                       |
| フェーズ   | Phase 1 - 要件定義                                                                |
| 作成日     | 2026-03-17                                                                        |
| 参照仕様書 | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/phase-1-requirements.md` |

## 目的

`PreToolUse Hook` と `processPermissionFallback` を接続し、`sendPermissionRequest` の拒否・タイムアウト・再試行・skip・abort の各フォールバックフローを `SkillExecutor` 内に統合する。

## P50 チェック結果

| 項目                                                      | 結果                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `handlePermissionCheck`                                   | 未実装                                                           |
| `sendPermissionRequestWithTimeout`                        | 未実装                                                           |
| `processPermissionFallback`                               | 実装済み（L1535-1681）                                           |
| `executeAbortFlow`                                        | 実装済み                                                         |
| `executeSkipFlow`                                         | 実装済み                                                         |
| `PreToolUse Hook` の `processPermissionFallback` 呼び出し | **未実装**（L1127-1184 が `{ proceed: true }` を直接返している） |

**判定: 未実装 → Phase 4-5 で通常実装を行う。**

## 機能要件

| FR-ID  | 要件                                                                                                                    | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-101 | `PreToolUse Hook` で Permission 拒否時に `processPermissionFallback` が呼ばれること                                     | 必須   |
| FR-102 | `sendPermissionRequest` のタイムアウト（`DEFAULT_TIMEOUT_MS=30000ms`）時に `executeAbortFlow("timeout")` が呼ばれること | 必須   |
| FR-103 | retry フォールバック（`retryCount < maxRetries`）時に `sendPermissionRequest` が再発行されること（最大3回）             | 必須   |
| FR-104 | skip フォールバック時にツール実行がスキップされ、後続処理が継続すること                                                 | 必須   |
| FR-105 | abort フォールバック時にスキル実行が安全に停止すること                                                                  | 必須   |
| FR-106 | max_retries 到達（`retryCount >= maxRetries`）時に `executeAbortFlow("max_retries")` が呼ばれること                     | 必須   |

## 非機能要件

| NFR-ID  | 要件                                                                    | 優先度 |
| ------- | ----------------------------------------------------------------------- | ------ |
| NFR-101 | フォールバック処理自体の例外は fail-closed（abort）に倒すこと           | 必須   |
| NFR-102 | タイムアウト値は `DEFAULT_TIMEOUT_MS=30000ms`（30秒）で初期化されること | 必須   |
| NFR-103 | abort フローは冪等であること（二重 abort でエラー非発生）               | 必須   |
| NFR-104 | 既存テスト 275+ ケースが全 PASS 維持されること                          | 必須   |
| NFR-105 | 既存の FR-001〜FR-003 の動作に影響を与えないこと                        | 必須   |

## 既存実装の確認済み定数・型

| 識別子                   | 場所                       | 値         |
| ------------------------ | -------------------------- | ---------- |
| `DEFAULT_TIMEOUT_MS`     | SkillExecutor.ts L257      | `30000`    |
| `PERMISSION_MAX_RETRIES` | SkillExecutor.ts L251      | `3`        |
| `PermissionFlowContext`  | SkillExecutor.ts L232 付近 | 型定義済み |
| `PermissionFlowResult`   | SkillExecutor.ts L232 付近 | 型定義済み |
| `AbortReason`            | SkillExecutor.ts L232 付近 | 型定義済み |

## 実装対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`

## 次フェーズへの引き継ぎ

Phase 2 では本要件定義に基づき、`handlePermissionCheck` / `sendPermissionRequestWithTimeout` の詳細設計を行う。
