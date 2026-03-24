# Spec Extraction Map

## System Spec → Code Anchor 1:1 対応

| System Spec                             | Code Anchor                                                                      | 対応関係               |
| --------------------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| ui-ux-realization.md#画面状態マトリクス | UiState 型定義 (execution-capability.ts:46)                                      | 8 値の定義元           |
| ui-ux-realization.md#CTA契約            | resolveCtaContract() (execution-capability.ts:244-315)                           | CTA マッピングの定義元 |
| Phase 2 D-1 UiState 型                  | execution-capability.ts UiState type alias                                       | 型拡張の設計           |
| Phase 2 D-2 CapabilityContext           | execution-capability.ts CapabilityContext interface                              | フィールド拡張の設計   |
| Phase 2 D-3 resolveUiState              | execution-capability.ts resolveUiState() overload 1                              | 8 値分岐ロジック       |
| Phase 2 D-4 UiStateResult               | execution-capability.ts UiStateResult interface                                  | handoffGuidance 追加   |
| Phase 2 D-5 CTA マッピング              | execution-capability.ts resolveCtaContract()                                     | 新 5 状態の CTA        |
| Phase 2 D-6 overload 2                  | execution-capability.ts resolveUiState() overload 2                              | 後方互換               |
| Phase 2 D-7 Guard 関数                  | execution-capability.ts assertStreamingCtaContract / assertHandoffGuidanceExists | 実行時ガード           |
| handoff.ts HandoffGuidance              | handoff.ts:10-17                                                                 | DTO 定義               |
