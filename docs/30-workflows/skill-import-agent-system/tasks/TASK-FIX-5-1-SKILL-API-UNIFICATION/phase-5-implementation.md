# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 5                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

Phase 4で作成したテストを全てパスさせるため、統一SkillAPIを実装し、全呼び出し元を移行する。

## 参照資料

| 資料名        | パス                                                   | 説明          |
| ------------- | ------------------------------------------------------ | ------------- |
| 統一API設計書 | `outputs/phase-2/unified-api-design.md`                | Phase 2成果物 |
| 移行計画書    | `outputs/phase-2/migration-plan.md`                    | Phase 2成果物 |
| テスト（Red） | `apps/desktop/src/preload/__tests__/skill-api.test.ts` | Phase 4成果物 |

## 実行タスク

### Task 1: preload/skill-api.ts の統一インターフェース実装

#### 目的

`preload/skill-api.ts` を統一SkillAPIインターフェースに拡張する。

#### 手順

1. `apps/desktop/src/preload/skill-api.ts` を開く
2. 統一インターフェース（Phase 2設計書参照）に従い、以下を実装:
   - 既存の実行・ストリーミング・権限メソッドは保持
   - スタブ実装だった管理メソッド（list, getImported, import, remove, rescan）を実装
   - 全メソッドが `ipcRenderer.invoke(SKILL_CHANNELS.*)` を使用するように統一
3. 戻り値型を統一（`OperationResult<T>` ラッパーは不使用）
4. 型定義を `@repo/shared` からインポート

#### 実装ガイド

```
[実装時にPhase 2設計書の統一インターフェースに従う]

重要: 既存の実装済みメソッド（execute, onStream, abort等）は
動作を変えずにインターフェースを統一すること
```

#### アーキテクチャ層別ガイド

| 層      | 配置先                                  | 責務                  |
| ------- | --------------------------------------- | --------------------- |
| Preload | `apps/desktop/src/preload/skill-api.ts` | IPC呼び出しのラッパー |
| 型定義  | `packages/shared/src/types/skill.ts`    | 統一型定義            |

### Task 2: preload/index.ts の公開ポイント統一

#### 目的

`contextBridge.exposeInMainWorld` での公開を一本化する。

#### 手順

1. `apps/desktop/src/preload/index.ts` を開く
2. `window.electronAPI.skill` に統一APIを設定
3. `window.skillAPI` の個別公開を廃止（削除）
4. フォールバック処理（非isolatedContext時）も同様に統一

#### 変更前後

**変更前（現状）:**

- L342: `skill: skillAPI` （electronAPI内）
- L542: `contextBridge.exposeInMainWorld("skillAPI", skillAPI)` （別途公開）

**変更後:**

- `window.electronAPI.skill` のみに統一
- `window.skillAPI` 公開行を削除

### Task 3: 呼び出し元の移行（hooks系）

#### 目的

`window.skillAPI` を使用している hooks を `window.electronAPI.skill` に移行する。

#### 対象ファイルと変更内容

| ファイル                       | 変更前                                        | 変更後                                                 |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------ |
| `hooks/useSkillExecution.ts`   | `window.skillAPI.execute(...)`                | `window.electronAPI.skill.execute(...)`                |
| `hooks/useSkillExecution.ts`   | `window.skillAPI.onStream(...)`               | `window.electronAPI.skill.onStream(...)`               |
| `hooks/useSkillExecution.ts`   | `window.skillAPI.abort(...)`                  | `window.electronAPI.skill.abort(...)`                  |
| `hooks/useSkillPermission.ts`  | `window.skillAPI.onPermissionRequest(...)`    | `window.electronAPI.skill.onPermissionRequest(...)`    |
| `hooks/useSkillPermission.ts`  | `window.skillAPI.sendPermissionResponse(...)` | `window.electronAPI.skill.sendPermissionResponse(...)` |
| `hooks/usePermissionDialog.ts` | 同上                                          | 同上                                                   |

### Task 4: 呼び出し元の移行（store/slice系）

#### 目的

`skillSlice.ts` を新APIのインターフェースに対応させる。

#### 手順

1. `apps/desktop/src/renderer/store/slices/skillSlice.ts` を開く
2. `OperationResult<T>` のアンラップ処理を削除
3. 直接型の戻り値を使用するように変更
4. `execute()` の引数を `SkillExecutionRequest` オブジェクト形式に変更

#### 変更例

**変更前:**

```typescript
const result = await window.electronAPI.skill.execute(skillId, params);
if (result.success) {
  /* use result.data */
}
```

**変更後:**

```typescript
const response = await window.electronAPI.skill.execute({
  skillName,
  prompt,
  workingDirectory,
});
// response は SkillExecutionResponse 型
```

### Task 5: renderer/preload/index.ts のskillAPI定義削除

#### 目的

不要になったrenderer側のskillAPI定義を削除する。

#### 手順

1. `apps/desktop/src/renderer/preload/index.ts` を開く
2. skillAPI関連のインターフェース定義（行1-109付近）を削除
3. skillAPI関連のimportを削除
4. 削除後もファイル内の他の定義（electronAPI等）に影響がないことを確認

### Task 6: テスト修正

#### 目的

既存テストのモック対象を新APIに対応させる。

#### 手順

1. `window.skillAPI` をモックしているテストファイルを検索
2. モック対象を `window.electronAPI.skill` に変更
3. `OperationResult<T>` をモック返却していた箇所を直接型に変更

## TDD検証

```bash
# Green状態の確認（全テスト成功）
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物              | パス                                    | 説明                  |
| ------------------- | --------------------------------------- | --------------------- |
| 統合skill-api.ts    | `apps/desktop/src/preload/skill-api.ts` | 統一API実装           |
| テスト結果（Green） | `outputs/phase-5/test-green-result.md`  | Green状態のテスト結果 |

## 完了条件

- [ ] `preload/skill-api.ts` が統一インターフェースに拡張されている
- [ ] `window.skillAPI` の個別公開が廃止されている
- [ ] 全hooks（3ファイル）が `window.electronAPI.skill` を使用している
- [ ] `skillSlice.ts` が新APIインターフェースに対応している
- [ ] `renderer/preload/index.ts` のskillAPI定義が削除されている
- [ ] 既存テストのモック対象が更新されている
- [ ] Phase 4のテストが全てPASS（Green状態）
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
