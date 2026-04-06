# Phase 2: audit sink 設計書

## SkillCreatorGovernanceAuditEvent 型（確定版）

```typescript
interface SkillCreatorGovernanceAuditEvent {
  eventType: SkillCreatorHookEventType; // 'session_start' | 'pre_tool_use' | 'post_tool_use' | 'session_end'
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  toolName?: string;
  decision?: SkillCreatorToolDecision;
  provenance?: SkillCreatorWorkflowSourceProvenance;
  metadata?: Record<string, unknown>;
  timestamp: string; // ISO 8601
}
```

## 設計決定事項

| 項目                     | 決定値                                                | 理由                                                                      |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| maxEvents デフォルト     | 500件                                                 | セッションあたり平均ツール使用50件×10セッション分を余裕を持って保持       |
| ring buffer 方式         | `slice(-maxEvents)`                                   | シンプルで型安全。専用 CircularBuffer より可読性が高い                    |
| `clear()` の自動呼び出し | なし（明示的に呼ぶ）                                  | Facade がライフサイクルを制御するため、自動クリアは予測不能な副作用を生む |
| 型定義の配置             | `@repo/shared/types`（既存の skillCreator.ts に追加） | 他の型定義との一貫性                                                      |

## 将来スコープ（永続化）

現時点では in-memory のみ。永続化（ファイル/DB への書き出し）は
`TASK-P0-09-U1` またはそれ以降のタスクで検討する。

**作成日**: 2026-04-06
