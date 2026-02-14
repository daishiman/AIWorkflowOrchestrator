# Phase 2 成果物: 設計ドキュメント - IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 2（設計）                      |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 1. 実装アプローチ選定

### 候補比較

| 観点    | A案: 個別メソッド展開                             | B案: 汎用 safeInvokeUnwrap 関数                     |
| ------- | ------------------------------------------------- | --------------------------------------------------- |
| 可読性  | 各メソッドで型が明示的に記述されるため高い        | 展開ロジックが1箇所に集約され、メソッド側はシンプル |
| DRY原則 | 4メソッド全てに同じ展開ロジックが重複する         | 展開ロジックの重複がない                            |
| 保守性  | ラッパー形式変更時に4箇所を同時修正する必要がある | ラッパー形式変更時に1箇所の修正で済む               |
| 型安全  | メソッドごとに正確な型パラメータを指定できる      | ジェネリック型パラメータで同等の型安全を維持        |

### 選定結果: B案（汎用 `safeInvokeUnwrap` 関数）

**選定理由**:

1. 4メソッド全てが同じ `{ success, data }` ラッパー形式のため、共通化が合理的
2. DRY 原則に従い、展開ロジックの重複を排除する
3. ラッパー形式が変更された場合の修正箇所が1箇所に限定される
4. `safeInvoke` と同じファイル内に配置するため、Preload 層の凝集度が維持される

## 2. インターフェース設計

### 2.1 `IpcResult<T>` 型定義

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

### 2.2 `safeInvokeUnwrap<T>` 関数シグネチャ

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

### 2.3 修正後の4メソッドのシグネチャ

```typescript
// ラッパー展開あり（safeInvokeUnwrap 使用）
list: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_LIST),

getImported: (): Promise<ImportedSkill[]> =>
  safeInvokeUnwrap<ImportedSkill[]>(IPC_CHANNELS.SKILL_GET_IMPORTED),

rescan: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_SCAN),

// SKILL_IMPORT: ハンドラの応答形式に応じて決定
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvokeUnwrap<ImportedSkill>(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

## 3. SKILL_IMPORT の特殊ケース

`SKILL_IMPORT` ハンドラは `skillService.importSkills(args.skillIds)` の戻り値を直接返す（ラッパーで包まない）。Phase 5（実装）で以下の2パターンを確認し適用する。

| パターン | ハンドラ応答形式               | Preload 側の対応                  |
| -------- | ------------------------------ | --------------------------------- |
| A        | `{ success: true, data: ... }` | `safeInvokeUnwrap` でラッパー展開 |
| B        | 直接返却（ラッパーなし）       | `safeInvoke` をそのまま使用       |

`skillHandlers.ts` の136行目を確認した結果、`return skillService.importSkills(args.skillIds)` と直接返却しているため、**パターン B** が該当する。`import` メソッドは `safeInvoke` をそのまま維持する。

ただし、`importSkills()` の戻り値型が `ImportedSkill` と一致するかの確認が Phase 5 で必要となる。一致しない場合は型変換ロジックを追加する。

## 4. エラーハンドリング設計

### 4つのエラーケースと対応

| エラーケース                                | 発生条件                                           | 対応                                                        |
| ------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| 1. チャンネルホワイトリスト拒否             | `ALLOWED_INVOKE_CHANNELS` にチャンネルが含まれない | `safeInvoke` 内で `Promise.reject` される（既存動作維持）   |
| 2. IPC ハンドラがエラーレスポンスを返す     | `{ success: false, error: "メッセージ" }`          | `safeInvokeUnwrap` 内で `Error` をスロー                    |
| 3. エラーレスポンス（error フィールドなし） | `{ success: false }`                               | デフォルトメッセージ `IPC call failed: ${channel}` でスロー |
| 4. IPC 通信自体の失敗                       | ネットワークエラー、Main Process クラッシュ        | `ipcRenderer.invoke` が reject するため、呼び出し元に伝播   |

### エラーメッセージ設計

```typescript
// ケース2: success: false + error フィールドあり
throw new Error(result.error);

// ケース3: success: false + error フィールドなし
throw new Error(`IPC call failed: ${channel}`);
```

**セキュリティ考慮**: `result.error` は IPC ハンドラ側で生成されたメッセージであり、Main Process の内部情報（ファイルパス、スタックトレース）が含まれる可能性がある。現時点では IPC ハンドラ側でサニタイズ済みであることを前提とし、Preload 層では追加のサニタイズを行わない。IPC ハンドラ側のサニタイズが不十分な場合は、別タスクで対応する。

## 5. Electron アーキテクチャ層別変更

| 層       | 変更有無 | 詳細                                                                 |
| -------- | -------- | -------------------------------------------------------------------- |
| Preload  | あり     | `IpcResult<T>` 型追加、`safeInvokeUnwrap<T>` 関数追加、4メソッド修正 |
| Main     | なし     | IPC ハンドラの `{ success, data }` 応答形式は維持                    |
| Renderer | なし     | Preload 層で展開済みの値を受け取るため修正不要                       |

## 6. 既知 Pitfall 対策

### P19: 型アサーション回避 -- 実行時バリデーション

| 対策                                 | 実装内容                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `as` 型アサーション不使用            | `safeInvokeUnwrap` は `safeInvoke<IpcResult<T>>` のジェネリック型で型推論を使用し、`as` を使わない |
| `success` フィールドの実行時チェック | `if (!result.success)` で実行時に真偽値を検証                                                      |
| 戻り値 `result.data` の型保証        | TypeScript の型推論により `IpcResult<T>` の `data` フィールドが `T` 型として推論される             |

**注意**: `result.data` が実際に期待する型（配列、オブジェクト）であるかの実行時バリデーション（`Array.isArray()` 等）は、このタスクのスコープ外とする。IPC ハンドラが正しい形式でデータを返すことを前提とし、ハンドラ側のバリデーションは既存の `skillHandlers.ts` の責務とする。

### P23: API 二重定義の型管理

| 確認項目                                                    | 確認方法                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `skill-api.ts` の型注釈と `SkillAPI` インターフェースの一致 | `pnpm typecheck` で型エラーがないことを確認                                         |
| `IpcResult<T>` 型が全ハンドラの応答形式をカバーする         | SKILL_LIST, SKILL_GET_IMPORTED, SKILL_SCAN, SKILL_IMPORT の各ハンドラの戻り値を確認 |
| `preload/types.ts` の `SkillAPI` 型との整合性               | 4メソッドの戻り値型が `SkillAPI` インターフェースと一致することを確認               |

### P24: Store 型と Preload 型の不統一への影響

| 影響箇所                                    | 影響内容                                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agentSlice.ts` の `fetchSkills()`          | `getImported()` が `ImportedSkill[]` を返すようになるため、既存の `as unknown as Skill[]` キャストの挙動は変わらない。キャスト除去は別タスク UT-FIX-5-1-001 のスコープ |
| `agentSlice.ts` の `fetchAvailableSkills()` | `list()` が `SkillMetadata[]` を返すようになるため、既存の処理は正常動作する                                                                                           |

## 7. テスト連携

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
