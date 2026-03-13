# Phase 1 Output: Acceptance Criteria

| ID    | 受け入れ基準                                                                                               | 検証方法                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| AC-1  | QuickFileSearch guard が `score=0` 除外、stable sort、top 10 制御を別責務として定義している                | Phase 2 設計 / Phase 4 testcase                                             |
| AC-2  | preview resilience guard が renderer local timeout / retry / loading release を新規 IPC なしで定義している | `api-ipc-system.md` との整合                                                |
| AC-3  | parse / transport / crash / no-match の UI 応答が別々に定義されている                                      | `error-handling.md` 整合                                                    |
| AC-4  | 04C の local state ownership を崩さないことが明記されている                                                | `arch-state-management.md` 整合                                             |
| AC-5  | Phase 12 exact count / ID / path sync を validator 実行で確認できる                                        | `task-workflow.md` / `verify-unassigned-links.js` 接続                      |
| AC-6  | Phase 1-3 completed 前は Phase 4+ を実行しない方針が artifacts / phase docs / index に残っている           | workflow self-check                                                         |
| AC-7  | 設計完了後に実装・テスト・doc sync まで進めつつ、commit / PR は行わない方針が明記されている                | workflow self-check                                                         |
| AC-8  | `.claude` 正本仕様の参照が各 phase に含まれている                                                          | validator + 目視確認                                                        |
| AC-9  | preview 共通ガードの設計が sanitize / dangerous URL / CSP 契約を壊さないことが明記されている               | `security-input-validation.md` 整合                                         |
| AC-10 | UI語彙、shortcut、focus、dialog token の drift 防止条件が明記されている                                    | `ui-ux-components.md`, `ui-ux-navigation.md`, `ui-ux-design-system.md` 整合 |
