# Phase 2: 設計 - IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 2（設計）                      |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 目的

Phase 1 で定義した要件と受入基準に基づき、Preload 層の `skill-api.ts` における IPC レスポンスラッパー展開ロジックの実装アプローチ、インターフェース、エラーハンドリングを設計する。

## 実行タスク

| タスク | 内容                   |
| ------ | ---------------------- |
| Task 1 | 実装アプローチ選定     |
| Task 2 | インターフェース設計   |
| Task 3 | エラーハンドリング設計 |
| Task 4 | 既知Pitfall対策        |

## 参照資料

| 種別               | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Phase 1 成果物     | `docs/30-workflows/ipc-response-unwrap/phase-1-requirements.md`            |
| 元タスク仕様書     | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md` |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                    |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.ts`                               |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                     |
| セキュリティ仕様   | `security-api-electron.md`                                                 |
| IPC設計仕様        | `interfaces-agent-sdk-skill.md`                                            |
| インターフェース   | `interfaces-agent-sdk-skill.md`                                            |
| エラーハンドリング | `error-handling.md`                                                        |
| 実装パターン       | `architecture-implementation-patterns.md`                                  |
| 既知Pitfall        | `.claude/rules/06-known-pitfalls.md` P19, P23, P24                         |

## 実行手順

### Task 1: 実装アプローチ選定

#### A案: 個別メソッド展開

各メソッド内で `safeInvoke` の戻り値を個別にラッパー展開する。

```typescript
getImported: async (): Promise<ImportedSkill[]> => {
  const result = await safeInvoke<{ success: boolean; data: ImportedSkill[] }>(
    IPC_CHANNELS.SKILL_GET_IMPORTED
  );
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to get imported skills');
  }
  return result.data;
},
```

| 観点    | 評価                                              |
| ------- | ------------------------------------------------- |
| 可読性  | 各メソッドで型が明示的に記述されるため高い        |
| DRY原則 | 4メソッド全てに同じ展開ロジックが重複する         |
| 保守性  | ラッパー形式変更時に4箇所を同時修正する必要がある |
| 型安全  | メソッドごとに正確な型パラメータを指定できる      |

#### B案: 汎用 `safeInvokeUnwrap` 関数（推奨）

`{ success, data }` ラッパーを展開する汎用関数を定義し、4メソッドから共通利用する。

```typescript
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error ?? `IPC call failed: ${channel}`);
  }
  return result.data;
}
```

| 観点    | 評価                                                      |
| ------- | --------------------------------------------------------- |
| 可読性  | 展開ロジックが1箇所に集約され、メソッド側はシンプル       |
| DRY原則 | 展開ロジックの重複がない                                  |
| 保守性  | ラッパー形式変更時に `safeInvokeUnwrap` 1箇所の修正で済む |
| 型安全  | ジェネリック型パラメータ `T` で型安全を維持               |

#### 選定結果: B案（汎用 `safeInvokeUnwrap` 関数）

**選定理由**:

1. 4メソッド全てが同じ `{ success, data }` ラッパー形式のため、共通化が適切
2. DRY 原則に従い、展開ロジックの重複を排除する
3. ラッパー形式が変更された場合の修正箇所が1箇所に限定される
4. `safeInvoke` と同じファイル内に配置するため、Preload 層の凝集度が維持される

#### SKILL_IMPORT の特殊ケース

`SKILL_IMPORT` ハンドラは `skillService.importSkills()` の戻り値を直接返す（ラッパーなし）可能性がある。以下の2パターンで対応する:

| パターン | ハンドラ応答形式               | Preload 側の対応                                                          |
| -------- | ------------------------------ | ------------------------------------------------------------------------- |
| A        | `{ success: true, data: ... }` | `safeInvokeUnwrap` でラッパー展開                                         |
| B        | `ImportResult` 直接返却        | `safeInvoke` をそのまま使用し、`ImportResult` から `ImportedSkill` を抽出 |

Phase 5（実装）で `skillHandlers.ts` の SKILL_IMPORT ハンドラの実際の戻り値を確認し、パターン A またはパターン B を適用する。設計段階ではパターン A を前提とし、パターン B が必要な場合は `import` メソッドのみ個別展開とする。

### Task 2: インターフェース設計

#### `IpcResult<T>` 型定義

IPC ハンドラの `{ success, data }` ラッパー構造を表す型を定義する。

```typescript
/**
 * IPC ハンドラの標準レスポンス型。
 * Main Process の IPC ハンドラが返す { success, data, error } 形式を表す。
 */
interface IpcResult<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

**配置場所**: `apps/desktop/src/preload/skill-api.ts` のファイルスコープ（エクスポートしない）。この型は Preload 層の内部実装詳細であり、Renderer 層に公開しない。

#### `safeInvokeUnwrap<T>` 関数シグネチャ

```typescript
/**
 * safeInvoke の結果から IPC レスポンスラッパーを展開する。
 * { success: true, data: T } 形式のレスポンスから data フィールドを抽出して返す。
 * success が false の場合は Error をスローする。
 *
 * @param channel - IPC チャンネル名（ALLOWED_INVOKE_CHANNELS に含まれること）
 * @param args - IPC ハンドラに渡す引数
 * @returns ラッパー展開後のデータ（型 T）
 * @throws Error - success が false の場合、または IPC 通信自体が失敗した場合
 */
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error ?? `IPC call failed: ${channel}`);
  }
  return result.data;
}
```

**設計上の決定事項**:

| 項目                         | 決定内容                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| 関数スコープ                 | ファイルスコープ（エクスポートしない）                            |
| チャンネルホワイトリスト検証 | 内部で `safeInvoke` を呼び出すため、既存検証が自動適用            |
| エラー時の振る舞い           | `Error` をスロー（Renderer 側の `try/catch` で捕捉可能）          |
| `success` フィールドの検証   | `!result.success` の真偽値チェック（厳密等値 `=== false` は不要） |

#### 修正後の4メソッドのシグネチャ

```typescript
list: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_LIST),

getImported: (): Promise<ImportedSkill[]> =>
  safeInvokeUnwrap<ImportedSkill[]>(IPC_CHANNELS.SKILL_GET_IMPORTED),

rescan: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_SCAN),

import: (skillName: string): Promise<ImportedSkill> =>
  safeInvokeUnwrap<ImportedSkill>(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

### Task 3: エラーハンドリング設計

#### エラー分類と対応

| エラーケース                                                 | 発生条件                                           | 対応                                                        |
| ------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------- |
| チャンネルホワイトリスト拒否                                 | `ALLOWED_INVOKE_CHANNELS` にチャンネルが含まれない | `safeInvoke` 内で `Promise.reject` される（既存動作維持）   |
| IPC ハンドラがエラーレスポンスを返す                         | `{ success: false, error: "メッセージ" }`          | `safeInvokeUnwrap` 内で `Error` をスロー                    |
| IPC ハンドラがエラーレスポンスを返す（error フィールドなし） | `{ success: false }`                               | デフォルトメッセージ `IPC call failed: ${channel}` でスロー |
| IPC 通信自体の失敗                                           | ネットワークエラー、Main Process クラッシュ        | `ipcRenderer.invoke` が reject するため、呼び出し元に伝播   |

#### エラーメッセージ設計

```typescript
// success: false + error フィールドあり
throw new Error(result.error);

// success: false + error フィールドなし
throw new Error(`IPC call failed: ${channel}`);
```

**セキュリティ考慮**: `result.error` はIPC ハンドラ側で生成されたメッセージであり、Main Process の内部情報（ファイルパス、スタックトレース）が含まれる可能性がある。現時点では IPC ハンドラ側でサニタイズ済みであることを前提とし、Preload 層では追加のサニタイズを行わない。IPC ハンドラのエラーメッセージにファイルパスやスタックトレースが含まれている場合は、別タスクでハンドラ側のサニタイズを対応する。

### Task 4: 既知Pitfall対策

#### P19: 型アサーション回避 - 実行時バリデーション

| 対策                                 | 実装内容                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `as` 型アサーション不使用            | `safeInvokeUnwrap` は `safeInvoke<IpcResult<T>>` のジェネリック型で型推論を使用し、`as` を使わない |
| `success` フィールドの実行時チェック | `if (!result.success)` で実行時に真偽値を検証                                                      |
| 戻り値 `result.data` の型保証        | TypeScript の型推論により `IpcResult<T>` の `data` フィールドが `T` 型として推論される             |

**補足**: `result.data` が実際に期待する型（配列、オブジェクト）であるかの実行時バリデーション（`Array.isArray()` 等）は、この修正のスコープ外とする。IPC ハンドラが正しい形式でデータを返すことを前提とし、ハンドラ側のバリデーションは既存の `skillHandlers.ts` の責務とする。

#### P23: 型定義の整合性確認

| 確認項目                                                    | 確認方法                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `skill-api.ts` の型注釈と `SkillAPI` インターフェースの一致 | `pnpm typecheck` で型エラーがないことを確認                                         |
| `IpcResult<T>` 型が全ハンドラの応答形式をカバーする         | SKILL_LIST, SKILL_GET_IMPORTED, SKILL_SCAN, SKILL_IMPORT の各ハンドラの戻り値を確認 |
| `preload/types.ts` の `SkillAPI` 型との整合性               | 4メソッドの戻り値型が `SkillAPI` インターフェースと一致することを確認               |

#### P24: Store 型と Preload 型の不統一への影響

| 影響箇所                                    | 影響内容                                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agentSlice.ts` の `fetchSkills()`          | `getImported()` が `ImportedSkill[]` を返すようになるため、既存の `as unknown as Skill[]` キャストの挙動は変わらない。キャスト除去は別タスク UT-FIX-5-1-001 のスコープ |
| `agentSlice.ts` の `fetchAvailableSkills()` | `list()` が `SkillMetadata[]` を返すようになるため、既存の処理は正常動作する                                                                                           |

## Electron アーキテクチャ層別設計

### Preload 層

| 変更内容                         | 詳細                                                             |
| -------------------------------- | ---------------------------------------------------------------- |
| `IpcResult<T>` 型を追加          | ファイルスコープ、エクスポートしない                             |
| `safeInvokeUnwrap<T>` 関数を追加 | `safeInvoke` の直後に配置、ファイルスコープ                      |
| `list` メソッドを修正            | `safeInvoke` → `safeInvokeUnwrap` に変更                         |
| `getImported` メソッドを修正     | `safeInvoke` → `safeInvokeUnwrap` に変更                         |
| `rescan` メソッドを修正          | `safeInvoke` → `safeInvokeUnwrap` に変更                         |
| `import` メソッドを修正          | `safeInvoke` → `safeInvokeUnwrap` に変更（ハンドラ確認後に確定） |

### Main 層

| 変更内容 | 詳細                                                  |
| -------- | ----------------------------------------------------- |
| 変更なし | IPC ハンドラの `{ success, data }` 応答形式は維持する |

### Renderer 層

| 変更内容 | 詳細                                                                |
| -------- | ------------------------------------------------------------------- |
| 変更なし | `agentSlice.ts` は Preload 層で展開済みの値を受け取るため、修正不要 |

## 統合テスト連携

| テスト対象                     | テスト内容                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| `safeInvokeUnwrap` 関数        | `{ success: true, data }` を受け取り `data` を返す          |
| `safeInvokeUnwrap` 関数        | `{ success: false, error }` を受け取り `Error` をスロー     |
| `safeInvokeUnwrap` 関数        | `{ success: false }` を受け取りデフォルトメッセージでスロー |
| `skill.list()` メソッド        | `SkillMetadata[]` を直接返す（ラッパーなし）                |
| `skill.getImported()` メソッド | `ImportedSkill[]` を直接返す（ラッパーなし）                |
| `skill.import()` メソッド      | `ImportedSkill` を直接返す（ラッパーなし）                  |
| `skill.rescan()` メソッド      | `SkillMetadata[]` を直接返す（ラッパーなし）                |
| チャンネルホワイトリスト       | `safeInvokeUnwrap` 経由でも非許可チャンネルが拒否される     |

## 多角的チェック観点

### セキュリティ

- `safeInvokeUnwrap` は内部で `safeInvoke` を呼び出すため、チャンネルホワイトリスト検証は自動的に適用される
- `IpcResult<T>` 型と `safeInvokeUnwrap` 関数はファイルスコープであり、Renderer 層からアクセスできない
- エラーメッセージの伝播において、IPC ハンドラ側でサニタイズ済みであることが前提

### IPC 通信

- `safeInvokeUnwrap` は `safeInvoke` の薄いラッパーであり、IPC 通信の振る舞いを変更しない
- エラーレスポンス時の例外スローにより、Renderer 層は `try/catch` でエラーハンドリング可能

### 型安全

- `IpcResult<T>` のジェネリック型により、`data` フィールドの型が呼び出し元のメソッドの戻り値型と一致する
- `as` 型アサーションを使用しない設計により、P19 パターンを回避する
- `pnpm typecheck` で型整合性を検証する

## 成果物

| 成果物             | パス                                                      |
| ------------------ | --------------------------------------------------------- |
| Phase 2 設計仕様書 | `docs/30-workflows/ipc-response-unwrap/phase-2-design.md` |

## 完了条件

- [ ] A案（個別メソッド展開）とB案（汎用 `safeInvokeUnwrap` 関数）の比較が完了し、B案が選定理由とともに記録されている
- [ ] `IpcResult<T>` 型の定義（フィールド: `success`, `data`, `error?`）が記述されている
- [ ] `safeInvokeUnwrap<T>` 関数のシグネチャとJSDocコメントが記述されている
- [ ] 修正後の4メソッド（`list`, `getImported`, `import`, `rescan`）のシグネチャが記述されている
- [ ] SKILL_IMPORT の特殊ケース（ラッパーなし）への対応方針が記述されている
- [ ] エラーハンドリング設計（4つのエラーケースとその対応）が記述されている
- [ ] P19（型アサーション回避）、P23（型定義整合性）、P24（Store型不統一）の各対策が記述されている
- [ ] Electron 3層（Preload/Main/Renderer）それぞれの変更有無が明確化されている
- [ ] テスト対象と内容が8項目列挙されている

## 次のPhase

Phase 3（設計レビュー）へ進む。Phase 1-2 の成果物を入力として、要件-設計整合性、セキュリティ、型安全性、既知Pitfall対策の4観点でレビューを行う。
