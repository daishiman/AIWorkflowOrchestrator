# Phase 2 設計書サマリ

本ドキュメントは phase-2-design.md の実行サマリ。詳細は正本を参照。

## 設計決定一覧

| ID  | 決定事項                                    | 根拠                                                                                                  |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| D-1 | UiState 8 値 union 型                       | ui-ux-realization.md 画面状態マトリクス準拠（running 除外）                                           |
| D-2 | CapabilityContext 4 optional フィールド追加 | 既存呼び出し元の変更不要（後方互換）                                                                  |
| D-3 | resolveUiState() 評価優先順位 P1-P8         | streaming 最優先 → handoff → terminal-only → degraded → ready → guidance-only → blocked → unavailable |
| D-4 | UiStateResult に handoffGuidance 追加       | handoff 状態で HandoffGuidance DTO を返す                                                             |
| D-5 | resolveCtaContract() 新 5 状態 CTA          | Contract Matrix 準拠のマッピング                                                                      |
| D-6 | overload 2 後方互換維持                     | 3 値のみ返す既存シグネチャを @deprecated 付きで維持                                                   |
| D-7 | Guard 関数 2 種追加                         | assertStreamingCtaContract + assertHandoffGuidanceExists                                              |

## 評価優先順位図

```
CapabilityContext
  │
  ├─ isStreaming? ──yes──▶ P1: streaming
  │
  ├─ isHandoffRequired? && (terminalSurface|both)? ──yes──▶ P2: handoff
  │
  ├─ capability === terminalSurface?
  │   ├─ !isTerminalAvailable ──▶ unavailable
  │   └─ available ──▶ P3: terminal-only
  │
  ├─ isDegraded? && capability !== none? ──yes──▶ P4: degraded
  │
  ├─ capability === integratedRuntime|both? ──yes──▶ P5: ready
  │
  │  (capability === none の分岐)
  ├─ hasAlternativeGuidance? ──yes──▶ P6: guidance-only
  │
  ├─ hasResolutionAction? ──yes──▶ P7: blocked
  │
  └─ else ──▶ P8: unavailable
```
