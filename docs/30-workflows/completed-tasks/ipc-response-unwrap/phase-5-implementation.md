# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 5                              |
| Phase名      | 実装（TDD Green）              |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 前提Phase    | Phase 4（テスト作成）          |
| 後続Phase    | Phase 6（テスト拡充）          |
| ステータス   | 未実施                         |
| 作成日       | 2026-02-14                     |
| 機能名       | ipc-response-unwrap            |
| 種別         | バグ修正 (fix)                 |

---

## 目的

TDD Green フェーズとして、Phase 4 で作成した失敗テストを通す最小限の実装を行う。`safeInvokeUnwrap<T>()` 汎用関数を `skill-api.ts` に追加し、`list`, `getImported`, `rescan` の3メソッドでレスポンスラッパー `{ success: true, data: T }` を展開して `T` を直接返すように修正する。`import` メソッドは Main 側ハンドラがラッパーなしで応答するため、応答形式を確認した上で修正方針を決定する。

---

## 実行タスク

| Task | 内容                           | 対象ファイル                            |
| ---- | ------------------------------ | --------------------------------------- |
| 1    | IpcResult<T> 型の定義          | `apps/desktop/src/preload/skill-api.ts` |
| 2    | safeInvokeUnwrap<T> 関数の実装 | `apps/desktop/src/preload/skill-api.ts` |
| 3    | 4メソッドの修正                | `apps/desktop/src/preload/skill-api.ts` |
| 4    | テスト実行と確認               | テストコマンド実行                      |

---

## 参照資料

| 種別               | パス                                                                              | 内容                             |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4 テスト     | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`                     | Red 状態のテスト                 |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                            | 統一 SkillAPI テスト（65テスト） |
| Preload ソース     | `apps/desktop/src/preload/skill-api.ts`                                           | 修正対象ファイル（192-200行目）  |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | Main 側応答形式の確認用          |
| セキュリティ仕様   | `aiworkflow-requirements/references/security-api-electron.md`                     | IPC セキュリティ設計             |
| IPC 設計仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill IPC 設計仕様               |
| インターフェース   | `aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | Skill API 型定義                 |
| エラーハンドリング | `aiworkflow-requirements/references/error-handling.md`                            | エラー処理パターン               |

---

## 実行手順

### Task 1: IpcResult<T> 型の定義

`skill-api.ts` 内にローカル型として `IpcResult<T>` を定義する。この型は Main Process の IPC ハンドラが返すレスポンスラッパーの構造を表す。

**定義場所**: `apps/desktop/src/preload/skill-api.ts` の `safeInvoke` 関数の直前

```typescript
/**
 * IpcResult<T> - Main Process IPC ハンドラのレスポンスラッパー型
 *
 * skillHandlers.ts のハンドラは以下の形式でレスポンスを返す:
 * - 成功: { success: true, data: T }
 * - 失敗: { success: false, error: string }
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**注意**: この型は `export` しない。Preload 層の内部実装詳細として扱い、外部公開しない。

### Task 2: safeInvokeUnwrap<T> 関数の実装

`safeInvoke` 関数の直後に `safeInvokeUnwrap<T>` 関数を追加する。

**定義場所**: `apps/desktop/src/preload/skill-api.ts` の `safeInvoke` 関数と `safeOn` 関数の間

```typescript
/**
 * safeInvokeUnwrap - IPC レスポンスラッパーを展開して data フィールドを返す
 *
 * Main Process の IPC ハンドラが { success: true, data: T } 形式で返す
 * レスポンスを展開し、T を直接返す。
 * { success: false, error: string } の場合は Error をスローする。
 *
 * @param channel - IPC チャンネル名
 * @param args - IPC 引数
 * @returns data フィールドの値（型 T）
 * @throws Error - success が false の場合、または IPC 通信エラーの場合
 */
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error ?? `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

**実行時チェック（P19 対策）**:

- `result.success` の boolean 判定で分岐する
- `result.error` が存在しない場合はデフォルトメッセージ `IPC call failed: ${channel}` を使用する
- `result.data` が `undefined` の場合もそのまま返す（空配列 `[]` は正当な値のため）

### Task 3: 4メソッドの修正

#### 修正対象と修正内容

| メソッド      | 修正前                                        | 修正後                                              | 理由                                                |
| ------------- | --------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `list`        | `safeInvoke(IPC_CHANNELS.SKILL_LIST)`         | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_LIST)`         | ハンドラが `{ success, data }` ラッパーを返すため   |
| `getImported` | `safeInvoke(IPC_CHANNELS.SKILL_GET_IMPORTED)` | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_IMPORTED)` | ハンドラが `{ success, data }` ラッパーを返すため   |
| `rescan`      | `safeInvoke(IPC_CHANNELS.SKILL_SCAN)`         | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_SCAN)`         | ハンドラが `{ success, data }` ラッパーを返すため   |
| `import`      | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, name)` | 応答形式に基づいて決定（下記参照）                  | ハンドラは `skillService.importSkills()` を直接返す |

#### SKILL_IMPORT ハンドラの応答形式

`skillHandlers.ts` の SKILL_IMPORT ハンドラは以下の実装:

```typescript
// skill:import ハンドラ（skillHandlers.ts:120-138）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event, args: { skillIds: string[] }) => {
    // ... validation ...
    return skillService.importSkills(args.skillIds);
  },
);
```

このハンドラは `skillService.importSkills()` の戻り値をそのまま返す（`{ success, data }` ラッパーで包んでいない）。そのため `import` メソッドは `safeInvoke` のまま維持する。

ただし、`import` メソッドの呼び出し側（`skill-api.ts`）では引数が `skillName: string` であるのに対し、ハンドラは `args: { skillIds: string[] }` を期待している点に注意する。この不整合は本タスクのスコープ外であり、現状の動作を維持する。

#### 修正後のコード

```typescript
// === Skill Management API ===

list: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_LIST),

getImported: (): Promise<ImportedSkill[]> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_IMPORTED),

rescan: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_SCAN),

import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

### Task 4: テスト実行と確認

#### 実行コマンド

```bash
# Phase 4 で作成したテストの実行（Green 確認）
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts

# 既存テストが影響を受けていないことの確認
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts

# 全 Preload テストの実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/

# agentSlice テストの実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

#### 確認項目

- [ ] `skill-api.unwrap.test.ts` の全テストが PASS する（Green 状態）
- [ ] `skill-api.test.ts` の全テストが PASS する（既存テスト影響なし）
- [ ] `skill-api.unification.test.ts` の全テストが PASS する
- [ ] `skill-api.permission.test.ts` の全テストが PASS する
- [ ] `agentSlice.test.ts` の fetchSkills テストが PASS する

---

## Electron アーキテクチャ層別実装指針

### Preload 層（変更あり）

| 変更内容                       | ファイル                                | 影響範囲                      |
| ------------------------------ | --------------------------------------- | ----------------------------- |
| `IpcResult<T>` 型追加          | `apps/desktop/src/preload/skill-api.ts` | ファイル内のみ（export なし） |
| `safeInvokeUnwrap<T>` 関数追加 | 同上                                    | ファイル内のみ                |
| `list` メソッド修正            | 同上                                    | Renderer 層の呼び出し元       |
| `getImported` メソッド修正     | 同上                                    | Renderer 層の呼び出し元       |
| `rescan` メソッド修正          | 同上                                    | Renderer 層の呼び出し元       |

### Main 層（変更なし）

- `skillHandlers.ts` のハンドラ応答形式は変更しない
- `{ success: true, data: T }` ラッパー形式を維持する
- Preload 層で展開するため、Main 層の修正は不要

### Renderer 層（変更なし）

- `agentSlice.ts` の `fetchSkills()` は Preload 層から展開済みの配列を受け取るため変更不要
- `as unknown as Skill[]` 型キャストの除去は本タスクのスコープ外

---

## 既知 Pitfall 対策

### P19: 型キャスト（as）による実行時検証バイパス

- `safeInvokeUnwrap` 内で `result.success` の boolean 判定を実行時に行う
- `result.data as T` の型キャストは、`success === true` を確認した後にのみ実行する
- IPC ハンドラの応答が壊れている場合（`success` フィールドが存在しない場合）は `!result.success` が `true` と評価され、エラーをスローする

### P23: API 二重定義の型管理

- `SkillAPI` インターフェースの戻り値型（`Promise<SkillMetadata[]>` 等）は変更しない
- `safeInvokeUnwrap` は内部実装の変更であり、公開 API の型注釈に影響しない
- `export interface SkillAPI` の定義は修正不要

### P11: PostToolUse フックによる Edit 失敗

- Prettier/ESLint の自動修正がファイルを変更する可能性がある
- 実装完了後に `git diff --stat` で変更されたファイル数を確認する
- 後続の Edit が失敗した場合はファイルを再読み込みしてからリトライする

---

## 統合テスト連携

### Phase 5 での必須アクション

- [ ] `safeInvokeUnwrap` 関数の実装が完了している
- [ ] 3メソッド（list, getImported, rescan）が `safeInvokeUnwrap` を使用している
- [ ] `import` メソッドの応答形式を確認し、修正方針を決定している
- [ ] 全 Preload テストが PASS している
- [ ] agentSlice テストが PASS している

---

## 多角的チェック観点

| 観点               | 確認内容                                                            |
| ------------------ | ------------------------------------------------------------------- |
| 受入基準 1         | `getImported()` が `ImportedSkill[]` を直接返す                     |
| 受入基準 2         | `list()` が `SkillMetadata[]` を直接返す                            |
| 受入基準 3         | `import()` が `ImportedSkill` を直接返す                            |
| 受入基準 4         | `rescan()` が `SkillMetadata[]` を直接返す                          |
| 受入基準 5         | AgentView で `importedSkills.forEach` が正常動作する                |
| 受入基準 6         | 型注釈と実行時の値が一致する（ラッパーオブジェクトではなく直接値）  |
| 受入基準 7         | 既存テストが全て PASS する                                          |
| セキュリティ       | `safeInvoke` のチャンネルホワイトリスト検証が維持されている         |
| エラーハンドリング | `{ success: false }` 応答が想定どおり Error に変換される            |
| 後方互換性         | `execute`, `abort`, `getExecutionStatus` 等の他メソッドに影響しない |
| SKILL_IMPORT       | ラッパーなし応答のメソッドに `safeInvokeUnwrap` を誤適用していない  |

---

## 成果物

| 成果物       | パス                                    | 内容                                             |
| ------------ | --------------------------------------- | ------------------------------------------------ |
| 修正ファイル | `apps/desktop/src/preload/skill-api.ts` | IpcResult型、safeInvokeUnwrap追加、3メソッド修正 |

---

## 完了条件

- [ ] `IpcResult<T>` 型が `skill-api.ts` 内に定義されている
- [ ] `safeInvokeUnwrap<T>` 関数が `skill-api.ts` 内に実装されている
- [ ] `list` メソッドが `safeInvokeUnwrap` を使用している
- [ ] `getImported` メソッドが `safeInvokeUnwrap` を使用している
- [ ] `rescan` メソッドが `safeInvokeUnwrap` を使用している
- [ ] `import` メソッドの応答形式が確認され、修正方針が決定されている
- [ ] Phase 4 のテストが全て GREEN である
- [ ] 既存の `skill-api.test.ts` のテストが全て PASS している
- [ ] `skill-api.unification.test.ts` のテストが全て PASS している
- [ ] `skill-api.permission.test.ts` のテストが全て PASS している
- [ ] `agentSlice.test.ts` の fetchSkills テストが PASS している
- [ ] TypeScript 型エラーがない（`pnpm typecheck`）
- [ ] ESLint 警告がない（`pnpm lint`）

---

## TDD 検証

```bash
# Green 状態の確認
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts
```

**確認項目**:

- [ ] 全テストが成功すること（Green 状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ipc-response-unwrap/phase-6-test-expansion.md`
