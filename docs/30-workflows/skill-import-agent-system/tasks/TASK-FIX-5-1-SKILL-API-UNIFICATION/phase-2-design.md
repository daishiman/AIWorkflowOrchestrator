# Phase 2: 設計

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

仕様書（specification.md §4）に準拠した統一SkillAPIインターフェースを設計し、段階的な移行戦略を策定する。

## 参照資料

| 資料名           | パス                                | 説明          |
| ---------------- | ----------------------------------- | ------------- |
| API比較分析表    | `outputs/phase-1/api-comparison.md` | Phase 1成果物 |
| 呼び出し元マップ | `outputs/phase-1/caller-mapping.md` | Phase 1成果物 |
| 仕様書照合結果   | `outputs/phase-1/spec-alignment.md` | Phase 1成果物 |
| 仕様書§4         | `specification.md` §4               | API定義の正本 |

## 実行タスク

### Task 1: 統一SkillAPIインターフェース設計

#### 目的

仕様書§4に準拠し、両APIの機能を完全にカバーする統一インターフェースを設計する。

#### 手順

1. Phase 1の比較分析表を参照し、全メソッドをカテゴリ別に整理
2. 仕様書§4の定義を基に統一インターフェースを設計
3. 戻り値型を統一（`SkillExecutionResponse` 等の直接型を採用）
4. `OperationResult<T>` ラッパーの廃止方針を決定

#### 統一インターフェース設計方針

```typescript
interface SkillAPI {
  // 一覧・管理
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillIds: string[]) => Promise<void>;
  remove: (skillId: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;

  // 実行
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // イベント
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // 権限
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: PermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

#### 設計判断項目

| 判断項目    | 選択肢A                              | 選択肢B                  | 推奨                      |
| ----------- | ------------------------------------ | ------------------------ | ------------------------- |
| 戻り値型    | `OperationResult<T>` ラッパー        | 直接型（`T` or `throw`） | B: 直接型（仕様書準拠）   |
| execute引数 | `SkillExecutionRequest` オブジェクト | `(skillId, params)` 分割 | A: オブジェクト（拡張性） |
| import引数  | `skillIds: string[]` 配列            | `skillName: string` 単体 | A: 配列（仕様書準拠）     |
| 公開方法    | `window.electronAPI.skill` のみ      | `window.skillAPI` も残す | A: 単一公開（混乱防止）   |

### Task 2: 移行戦略の策定

#### 目的

既存の呼び出し元を新APIに段階的に移行する計画を立てる。

#### 手順

1. 移行優先順位を決定（影響範囲が小さいものから）
2. 各呼び出し元の修正箇所を特定
3. 移行時の互換性維持方針を決定

#### 移行計画

| 順序 | 対象ファイル                   | 変更内容                                  | リスク                 |
| ---- | ------------------------------ | ----------------------------------------- | ---------------------- |
| 1    | `preload/skill-api.ts`         | 統一インターフェースに拡張                | 低（既存メソッド保持） |
| 2    | `preload/index.ts`             | 公開ポイントの統一                        | 中（アクセスパス変更） |
| 3    | `hooks/useSkillExecution.ts`   | `window.electronAPI.skill.execute` に変更 | 中                     |
| 4    | `hooks/useSkillPermission.ts`  | `window.electronAPI.skill` に変更         | 低                     |
| 5    | `hooks/usePermissionDialog.ts` | `window.electronAPI.skill` に変更         | 低                     |
| 6    | `store/slices/skillSlice.ts`   | 戻り値型の変更（OperationResult→直接型）  | 高（型変更多数）       |
| 7    | `renderer/preload/index.ts`    | skillAPI定義の削除                        | 低（参照解消後）       |

### Task 3: 型定義変更の設計

#### 目的

統一APIに必要な型定義の変更を設計する。

#### 手順

1. `packages/shared/src/types/skill.ts` の変更箇所を特定
2. `OperationResult<T>` 関連の型の扱いを決定
3. `window.electronAPI` の型定義更新を設計

#### 型変更設計

| 型名                 | 変更内容                   | 影響ファイル                                      |
| -------------------- | -------------------------- | ------------------------------------------------- |
| `SkillAPI`           | 統一インターフェースに更新 | `preload/skill-api.ts`                            |
| `ElectronAPI`        | `skill: SkillAPI` を更新   | `preload/types.ts` or `renderer/preload/index.ts` |
| `OperationResult<T>` | skillAPI関連では非使用に   | `skillSlice.ts` の利用箇所                        |

## システム開発観点チェック

| 観点             | 確認項目                     | 参照仕様書                                |
| ---------------- | ---------------------------- | ----------------------------------------- |
| セキュリティ     | contextBridge公開APIの最小化 | `security-api-electron.md`                |
| アーキテクチャ   | Preload層の責務範囲          | `architecture-implementation-patterns.md` |
| インターフェース | 統一インターフェースの整合性 | `interfaces-agent-sdk-skill.md`           |

## Electronデスクトップアプリ観点

| 層       | 設計考慮事項                                         |
| -------- | ---------------------------------------------------- |
| Preload  | contextBridge.exposeInMainWorld での公開ポイント統一 |
| Renderer | `window.electronAPI.skill` 単一パスへの統一          |
| IPC通信  | channels.ts の定義との整合性維持                     |

## 成果物

| 成果物        | パス                                    | 説明                 |
| ------------- | --------------------------------------- | -------------------- |
| 統一API設計書 | `outputs/phase-2/unified-api-design.md` | インターフェース設計 |
| 移行計画書    | `outputs/phase-2/migration-plan.md`     | 段階的移行計画       |
| 型変更設計書  | `outputs/phase-2/type-change-design.md` | 型定義変更設計       |

## 完了条件

- [ ] 統一SkillAPIインターフェースが設計されている
- [ ] 仕様書§4との整合性が確認されている
- [ ] 全メソッドの引数・戻り値型が決定されている
- [ ] 移行計画（7ステップ）が策定されている
- [ ] 型定義変更の設計が完了している
- [ ] 設計判断が記録されている（4項目以上）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
