# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

型定義を統合し、テストを通す（Green状態）。

## 実行タスク

### Task 1: skill-execution.ts から skill.ts への型移行

**移行手順**:

1. `ExecutionState` を `skill.ts` へ移行
2. `ExecutionInfo` を `skill.ts` へ移行
3. `ExecutionContext` を `skill.ts` へ移行
4. `SKILL_EXECUTION_DEFAULTS` を `skill.ts` へ移行
5. `SkillExecutionError`, `SkillExecutionErrorCode` を `skill.ts` へ移行

### Task 2: 重複型定義の削除

**削除対象**（`skill-execution.ts` から）:

| 型名                     | 対応                         |
| ------------------------ | ---------------------------- |
| `SkillStreamMessage`     | 削除（skill.tsの定義を使用） |
| `SkillStreamMessageType` | 削除（skill.tsの定義を使用） |
| `SkillExecutionRequest`  | 削除（skill.tsの定義を使用） |
| `SkillExecutionResponse` | 削除（skill.tsの定義を使用） |

### Task 3: index.ts の re-export 整理

```typescript
// packages/shared/src/types/index.ts

// 統合後の skill.ts からエクスポート
export * from "./skill";

// skill-execution.ts からのエクスポートを削除
// export * from "./skill-execution"; // 削除
```

### Task 4: import 文の修正

影響ファイルの import を修正する。

```bash
# 影響ファイルの特定
grep -rn "from.*skill-execution" packages/ apps/
```

**修正例**:

```typescript
// Before
import {
  SkillStreamMessage,
  SkillExecutionRequest,
} from "@repo/shared/types/skill-execution";

// After
import {
  SkillStreamMessage,
  SkillExecutionRequest,
} from "@repo/shared/types/skill";
// または
import { SkillStreamMessage, SkillExecutionRequest } from "@repo/shared";
```

## 統合テスト連携【必須】

型統合後の接続確認:

| 実装項目      | 内容                                        |
| ------------- | ------------------------------------------- |
| IPC型整合性   | Main-Renderer間でSkillStreamMessage型が一貫 |
| Store型整合性 | skillSliceでの型使用がエラーなし            |
| SDK型互換性   | Claude Agent SDKとの型互換性維持            |

## アーキテクチャ層別実装

| 層           | 実装観点                    | 実装ファイル配置                     |
| ------------ | --------------------------- | ------------------------------------ |
| Shared       | 型定義の集約                | `packages/shared/src/types/skill.ts` |
| Main Process | IPCハンドラーのimport修正   | `apps/desktop/src/main/ipc/`         |
| Renderer     | Component/Hooksのimport修正 | `apps/desktop/src/renderer/`         |

## 成果物

| 成果物         | パス                                           | 説明           |
| -------------- | ---------------------------------------------- | -------------- |
| 統合済み型定義 | `packages/shared/src/types/skill.ts`           | 統合後の型定義 |
| 削除ファイル   | `packages/shared/src/types/skill-execution.ts` | 削除または空化 |

## 完了条件

- [ ] `skill-execution.ts` の型が `skill.ts` へ移行完了
- [ ] 重複型定義が削除されている
- [ ] `index.ts` の re-export が整理されている
- [ ] 全ての import 文が修正されている
- [ ] `pnpm typecheck` がエラーなし
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test
pnpm typecheck

# 確認項目
# - [ ] 型チェックが成功することを確認
# - [ ] 全テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
