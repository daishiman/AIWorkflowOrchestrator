# 型定義同期計画: shared 型と preload 型の同期

> **Phase 2 Task 2-3 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: outputs/phase-1/preload-mapping.md, outputs/phase-1/as-is-gap-analysis.md

---

## 1. 対象ファイル

| ファイル       | 役割                                      | パス                                    |
| -------------- | ----------------------------------------- | --------------------------------------- |
| shared 型定義  | 共有型（全パッケージから参照）            | `packages/shared/src/types/skill.ts`    |
| Preload 型定義 | Preload 層の API 型                       | `apps/desktop/src/preload/types.ts`     |
| Preload 実装   | skill-api.ts の SkillAPI インターフェース | `apps/desktop/src/preload/skill-api.ts` |

---

## 2. 型定義の現状対比

### 2.1 shared 型から Preload 型への使用状況

| 型名                      | shared (types/skill.ts) | Preload (skill-api.ts)    | 一致状況             |
| ------------------------- | ----------------------- | ------------------------- | -------------------- |
| `SkillExecutionRequest`   | 定義あり                | import 使用               | 一致                 |
| `SkillExecutionResponse`  | 定義あり                | import 使用               | 一致                 |
| `ExecutionInfo`           | 定義あり                | import 使用               | 一致                 |
| `RemoveResult`            | 定義あり                | import 使用               | 一致                 |
| `SkillName`               | 定義あり (branded type) | import 使用               | 一致                 |
| `SkillStreamMessage`      | 定義あり                | import 使用               | 一致                 |
| `SkillPermissionRequest`  | 定義あり                | import 使用               | 一致                 |
| `SkillPermissionResponse` | 定義あり                | import 使用               | 一致                 |
| `SkillMetadata`           | 定義あり                | import 使用               | 一致                 |
| `ImportedSkill`           | 定義あり                | import 使用               | 一致                 |
| `BackupInfo`              | **なし**                | `preload/types.ts` で定義 | **Preload ローカル** |

### 2.2 型一致の結論

全ての skill 関連型は `@repo/shared` から import されており、shared と Preload の型定義は一致している。P23/P32 の「型定義の二箇所同時更新必須」パターンは、現時点では発生していない。

唯一 `BackupInfo` が `preload/types.ts` にローカル定義されているが、これは skillFileHandlers.ts のバックアップ機能固有の型であり、shared への移動は本タスクのスコープ外。

---

## 3. 変更が必要な型定義

### 3.1 本タスクで変更が必要な型

| 型定義 | 変更内容 | 理由                                   | 優先度 |
| ------ | -------- | -------------------------------------- | ------ |
| なし   | --       | 既存型はすべて一致。新規型の追加も不要 | --     |

### 3.2 変更不要の根拠

1. **FR-01（optimize 系バリデーション統一）**: Main 側のバリデーション処理の変更のみ。型定義への影響なし
2. **FR-02（sanitizeErrorMessage 適用）**: エラーメッセージの内容変更のみ。型定義への影響なし
3. **FR-03（skill:abort 型整合）**: Preload 型定義の `Promise<void>` は維持する方針。変更不要
4. **FR-04（契約ドリフト検出テスト）**: テストファイルの追加のみ。型定義への影響なし

---

## 4. P23/P32 準拠の同時更新計画

### 4.1 本タスクでの P23/P32 リスク評価

| リスク項目                      | 評価   | 理由                                                 |
| ------------------------------- | ------ | ---------------------------------------------------- |
| shared/preload 型の二重更新漏れ | **低** | 本タスクでは型定義の変更を行わない                   |
| 既存テストとの型不整合          | **低** | 型変更なしのため、テスト期待値への型レベルの影響なし |
| pnpm typecheck 失敗リスク       | **低** | Main 側のロジック変更のみ。型シグネチャは不変        |

### 4.2 将来タスクでの注意事項

以下の変更を将来行う場合は、P23/P32 準拠の同時更新が必要になる。

| 将来タスク                            | 影響する型               | 更新対象ファイル                             |
| ------------------------------------- | ------------------------ | -------------------------------------------- |
| skill:get-detail の Preload API 追加  | 新規メソッドシグネチャ   | skill-api.ts                                 |
| SkillExecutionResponse.success 除去   | `SkillExecutionResponse` | shared/types/skill.ts + preload/skill-api.ts |
| RemoveResult.success フィールド名変更 | `RemoveResult`           | shared/types/skill.ts + preload/skill-api.ts |
| BackupInfo の shared 移動             | `BackupInfo`             | shared/types/skill.ts + preload/types.ts     |
| OperationResult 廃止（P25）           | `OperationResult<T>`     | shared 全体                                  |

---

## 5. 型整合性検証手順

本タスクの実装完了後に以下の手順で型整合性を検証する。

```bash
# Step 1: shared パッケージのビルド
pnpm --filter @repo/shared build

# Step 2: desktop パッケージの型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Step 3: 全パッケージの型チェック
pnpm typecheck

# Step 4: テスト実行（型の実行時整合性確認）
pnpm --filter @repo/desktop test
```

---

## 6. IpcResult<T> 型の補足

`IpcResult<T>` は `skill-api.ts` 内にローカル定義されている。

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

この型は shared には存在せず、Preload 層の内部型として使用されている。`safeInvokeUnwrap` がこの型を内部的に使用して展開処理を行うため、Renderer 側には直接露出しない。

skillFileHandlers.ts の一部チャネル（writeFile, createFile, deleteFile, restoreBackup）は成功時に `{ success: true }` を返し `data` フィールドを含めていないが、`safeInvokeUnwrap<void>` は `result.data as void` を返すため、`data` が `undefined` でも `void` として問題なく動作する。
