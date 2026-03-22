# Phase 6: 回帰拡張計画

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 6                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 追加回帰観点

### 1.1 error / blocked / fallback 境界

| TC-ID | 観点                             | 検証内容                                                           |
| ----- | -------------------------------- | ------------------------------------------------------------------ |
| RE-01 | blocked → ready 遷移             | reason が null に変化した瞬間に GuidanceBlock が非表示になること   |
| RE-02 | ready → blocked 遷移             | reason が non-null に変化した瞬間に GuidanceBlock が表示されること |
| RE-03 | blocked reason 切替              | NO_PROVIDER → NO_API_KEY でメッセージ・variant が即更新            |
| RE-04 | error variant の CTA 動作        | AUTH_EXPIRED の "設定を見る" が Settings に遷移                    |
| RE-05 | handoff variant の secondary CTA | POLICY_VIOLATION の "command をコピー" がクリップボードにコピー    |

### 1.2 性能・安定性

| TC-ID | 観点                            | 検証内容                                           |
| ----- | ------------------------------- | -------------------------------------------------- |
| RE-06 | useBlockedGuidance の再描画回数 | reason 不変時に re-render が 0 回であること        |
| RE-07 | GuidanceBlock memo 有効性       | props 不変時に GuidanceBlock が再描画されないこと  |
| RE-08 | dispatcher の参照安定性         | useMemo で生成した dispatcher が同一参照であること |

### 1.3 legacy coexistence

| TC-ID | 観点                                | 検証内容                                               |
| ----- | ----------------------------------- | ------------------------------------------------------ |
| RE-09 | LLMGuidanceBanner 削除後の影響      | ChatView で LLMGuidanceBanner を import していないこと |
| RE-10 | controller.selectedModelId 参照除去 | WorkspaceChatPanel で直接参照していないこと            |

## 2. Phase 7-9 で確認すべき不足

| 不足領域                     | 確認 Phase | 詳細                                      |
| ---------------------------- | ---------- | ----------------------------------------- |
| 複数 reason 同時存在の優先度 | Phase 7    | coverage 目標設定で優先度ロジックを含める |
| openTerminal handler の実装  | Phase 9    | placeholder → 実装の品質検証              |
| retryConnection の IPC 契約  | Phase 9    | IPC handler 未定義のリスク評価            |
