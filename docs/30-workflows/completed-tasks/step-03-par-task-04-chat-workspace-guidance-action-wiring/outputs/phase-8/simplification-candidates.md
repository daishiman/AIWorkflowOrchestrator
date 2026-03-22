# Phase 8: 簡素化候補

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 8                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 簡素化候補一覧

| 候補                                         | 現在の設計                              | 簡素化案                                 | 採用判定 | 理由                               |
| -------------------------------------------- | --------------------------------------- | ---------------------------------------- | -------- | ---------------------------------- |
| useBlockedGuidance Hook を排除               | useMemo ラッパー Hook                   | 直接 BLOCKED_GUIDANCE_MAP[reason] lookup | 不採用   | null safety + future extensibility |
| guidanceActionDispatcher を排除              | createGuidanceActionDispatcher 関数     | surface で直接 switch                    | 不採用   | surface 間で handler 共有不可      |
| GuidanceBlock secondary を別コンポーネントに | secondary props を GuidanceBlock に追加 | SecondaryActionButton 分離               | 不採用   | 1コンポーネントで完結が DRY        |
| reason 型を string literal から enum に変更  | union type                              | const enum                               | 不採用   | tree-shaking 優位性が union にある |
