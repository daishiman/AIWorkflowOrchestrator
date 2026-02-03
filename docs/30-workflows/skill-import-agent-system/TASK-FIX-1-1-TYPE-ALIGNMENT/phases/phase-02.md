# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

型定義統合の具体的な設計を行い、移行方針を確定する。

## 実行タスク

### Task 1: 型統合設計

`skill-execution.ts`から`skill.ts`への型統合設計を行う。

**統合方針**:

| 移行元                     | 移行先                       | 方針                                     |
| -------------------------- | ---------------------------- | ---------------------------------------- |
| `ExecutionState`           | `skill.ts`                   | 移行（`SkillExecutionStatus`と統合検討） |
| `SkillExecutionRequest`    | `skill.ts`                   | 既存定義にフィールド追加                 |
| `SkillExecutionResponse`   | `skill.ts`                   | 既存定義を優先                           |
| `SkillStreamMessage`       | `skill.ts`                   | 既存Discriminated Unionを維持            |
| `SkillStreamMessageType`   | `skill.ts`                   | 既存定義（5種類）を維持                  |
| `ExecutionInfo`            | `skill.ts`                   | 移行（内部用として維持）                 |
| `ExecutionContext`         | `skill.ts`                   | 移行（内部用として維持）                 |
| `SKILL_EXECUTION_DEFAULTS` | `skill.ts`または定数ファイル | 移行先を検討                             |

### Task 2: 型互換性設計

**SkillStreamMessageType の統合**:

```typescript
// skill-execution.ts（削除対象）
type: "text" | "tool_use" | "error" | "complete";

// skill.ts（維持・正）
type: "assistant" | "tool_use" | "tool_result" | "status" | "error";
```

**マッピング設計**:

| 旧（skill-execution.ts） | 新（skill.ts）  | 備考                      |
| ------------------------ | --------------- | ------------------------- |
| `"text"`                 | `"assistant"`   | テキスト出力              |
| `"tool_use"`             | `"tool_use"`    | 変更なし                  |
| `"error"`                | `"error"`       | 変更なし                  |
| `"complete"`             | `"status"`      | status.status="completed" |
| -                        | `"tool_result"` | 新規（維持）              |

### Task 3: import修正設計

**影響ファイルの特定**:

```bash
grep -rn "from.*skill-execution" packages/ apps/
```

**修正パターン**:

```typescript
// Before
import { SkillStreamMessage } from "@repo/shared/types/skill-execution";

// After
import { SkillStreamMessage } from "@repo/shared/types/skill";
// または
import { SkillStreamMessage } from "@repo/shared";
```

## 参照資料

| 資料名      | パス                                         | 説明          |
| ----------- | -------------------------------------------- | ------------- |
| 要件定義書  | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 仕様書 §5.1 | `specification.md`                           | 型定義仕様    |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映:

| 統合ポイント      | 契約定義                                 |
| ----------------- | ---------------------------------------- |
| IPC skill:stream  | `SkillStreamMessage`型でのストリーミング |
| IPC skill:execute | `SkillExecutionRequest`/`Response`型     |
| Store → Component | `SkillExecutionStatus`型の状態伝播       |

## アーキテクチャ層別設計

| 層           | 設計観点                          | 仕様参照先                   |
| ------------ | --------------------------------- | ---------------------------- |
| Shared       | 型定義の集約、re-exportの整理     | `architecture-monorepo.md`   |
| Main Process | IPCハンドラーでの型使用箇所特定   | `api-ipc-agent.md`           |
| Renderer     | Component/Hooksでの型使用箇所特定 | `interfaces-agent-sdk-ui.md` |
| IPC通信      | チャンネル型定義の整合性確認      | `security-electron-ipc.md`   |

## 成果物

| 成果物           | パス                                         | 説明            |
| ---------------- | -------------------------------------------- | --------------- |
| 型統合設計書     | `outputs/phase-2/type-integration-design.md` | 統合方針        |
| 影響ファイル一覧 | `outputs/phase-2/affected-files.md`          | 修正対象        |
| 型マッピング表   | `outputs/phase-2/type-mapping.md`            | 旧→新マッピング |

## 完了条件

- [ ] 型統合方針が確定している
- [ ] 影響ファイルが全て特定されている
- [ ] 型マッピング表が作成されている
- [ ] 後方互換性の考慮が設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
