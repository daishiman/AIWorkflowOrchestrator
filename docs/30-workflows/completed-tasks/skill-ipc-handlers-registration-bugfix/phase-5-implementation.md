# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装（TDD Green）                      |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-17                             |
| 機能名     | skill-ipc-handlers-registration-bugfix |

---

## 目的

TDDのGreen（テストを通す実装）フェーズとして、バグ修正を実装する。
Phase 4で作成した失敗するテストを全てパスさせる最小限の修正を行う。

## 背景

Phase 4で作成したテストが失敗している状態から、
preloadのskillAPIの引数形式を修正してテストをパスさせる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: preload/index.ts の修正

**目的**: skillAPIの引数形式をオブジェクト形式に修正する

**実行手順**:

1. `apps/desktop/src/renderer/preload/index.ts` を開く
2. `import` メソッドの引数形式を修正: `skillIds` → `{ skillIds }`
3. `remove` メソッドの引数形式を修正: `skillId` → `{ skillId }`
4. `getDetail` メソッドの引数形式を修正: `skillId` → `{ skillId }`
5. 型エラーがないことを確認

**修正内容**:

```typescript
// apps/desktop/src/renderer/preload/index.ts

// Before
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,
  );
}

// After
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    { skillIds },
  );
}

// Before
remove: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:remove",
    skillId,
  );
}

// After
remove: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:remove",
    { skillId },
  );
}

// Before
getDetail: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<Skill | null>>(
    "skill:get-detail",
    skillId,
  );
}

// After
getDetail: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<Skill | null>>(
    "skill:get-detail",
    { skillId },
  );
}
```

**期待される成果物**:

- 修正された `apps/desktop/src/renderer/preload/index.ts`

---

### タスク2: IPCハンドラー登録確認

**目的**: `registerSkillHandlers` が正しく呼び出されていることを確認し、必要に応じて修正

**実行手順**:

1. `apps/desktop/src/main/ipc/index.ts` を開く
2. `registerSkillHandlers` のimport文があるか確認
3. `registerAllIpcHandlers` 関数内で `registerSkillHandlers` が呼び出されているか確認
4. 呼び出されていない場合は追加
5. 確認用ログを追加（オプション）

**確認・修正内容**:

```typescript
// apps/desktop/src/main/ipc/index.ts

// インポートの確認
import { registerSkillHandlers } from "./skillHandlers";

// registerAllIpcHandlers 内での呼び出し確認
export const registerAllIpcHandlers = (
  mainWindow: BrowserWindow,
  store: Store,
): void => {
  // ... 他のハンドラー登録 ...

  // Skill handlers登録（この呼び出しが存在するか確認）
  console.log("[IPC] Registering skill handlers...");
  registerSkillHandlers(mainWindow, skillService);
  console.log("[IPC] Skill handlers registered successfully");
};
```

**期待される成果物**:

- 確認/修正された `apps/desktop/src/main/ipc/index.ts`

---

### タスク3: テスト実行（Green状態確認）

**目的**: 修正後のコードでテストがパスすることを確認する

**実行手順**:

1. 全テストを実行: `pnpm --filter @repo/desktop test`
2. Phase 4で追加したテストがパスすることを確認
3. 既存テストも全てパスすることを確認
4. テスト結果を記録

**実行コマンド**:

```bash
# テスト実行
pnpm --filter @repo/desktop test

# 特定テストのみ実行（デバッグ用）
pnpm --filter @repo/desktop test -- --grep "skillAPI"
```

**期待される成果物**:

- `outputs/phase-5/test-green-result.md`: テスト成功結果レポート

---

### タスク4: ビルド確認

**目的**: 修正後のコードがビルドできることを確認する

**実行手順**:

1. TypeScript型チェックを実行: `pnpm --filter @repo/desktop typecheck`
2. ビルドを実行: `pnpm --filter @repo/desktop build`
3. ビルドエラーがないことを確認
4. ビルド結果を記録

**実行コマンド**:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# ビルド
pnpm --filter @repo/desktop build
```

**期待される成果物**:

- `outputs/phase-5/build-result.md`: ビルド結果レポート

---

## 参照資料

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| Phase 2成果物       | `outputs/phase-2/`                                                           | 修正設計書                |
| Phase 4成果物       | `outputs/phase-4/`                                                           | テストコード              |
| IPC Handler Pattern | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン |

---

## 成果物

| 成果物                | パス                                         | 内容                  |
| --------------------- | -------------------------------------------- | --------------------- |
| 修正コード（preload） | `apps/desktop/src/renderer/preload/index.ts` | 引数形式修正          |
| 修正コード（IPC）     | `apps/desktop/src/main/ipc/index.ts`         | ハンドラー登録確認    |
| テスト成功結果        | `outputs/phase-5/test-green-result.md`       | Green状態確認レポート |
| ビルド結果            | `outputs/phase-5/build-result.md`            | ビルド成功確認        |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5の統合テスト連携アクション**:

- preload/mainプロセス間の接続実装
- IPC通信が正常に動作することを確認
- エラーハンドリングが適切に実装されていることを確認

---

## 完了条件

- [ ] preload/index.ts の引数形式が全て修正されている
- [ ] IPCハンドラー登録が確認/修正されている
- [ ] Phase 4で追加した全テストがパスしている（Green状態）
- [ ] 既存テストも全てパスしている
- [ ] TypeScript型チェックがパスしている
- [ ] ビルドが成功している
- [ ] 全成果物が配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration-bugfix/phase-6-test-expansion.md`
