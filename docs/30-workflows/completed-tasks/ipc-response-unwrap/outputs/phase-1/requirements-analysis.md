# Phase 1 成果物: 要件分析 - IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 1（要件定義）                  |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 1. バグの根本原因分析

### 問題の概要

AgentView で `importedSkills.forEach is not a function` ランタイムエラーが発生する。Renderer 層が配列を期待しているにもかかわらず、実際にはオブジェクト `{ success: true, data: [...] }` が渡されている。

### 根本原因

Main Process の IPC ハンドラ（`skillHandlers.ts`）は、レスポンスを `{ success: boolean, data?: T, error?: string }` 形式のラッパーオブジェクトで返す。一方、Preload 層の `safeInvoke<T>()` は TypeScript のジェネリック型パラメータ `T` を型注釈としてのみ使用しており、実行時にはラッパーオブジェクトをそのまま Renderer 層に透過させる。

TypeScript のジェネリック型は**コンパイル時に消去（Type Erasure）**されるため、`safeInvoke<ImportedSkill[]>()` と記述しても、実行時には `ipcRenderer.invoke()` の戻り値がそのまま返される。結果として、型注釈 `Promise<ImportedSkill[]>` と実行時の値 `{ success: boolean, data: ImportedSkill[] }` が不一致となる。

### ランタイムクラッシュの発生経路

```
1. agentSlice.ts の fetchSkills() が window.electronAPI.skill.getImported() を呼び出す
2. Preload 層の safeInvoke<ImportedSkill[]>() が IPC 通信を実行
3. Main Process の skillHandlers.ts が { success: true, data: skills } を返す
4. safeInvoke がラッパーオブジェクトをそのまま返す（展開しない）
5. agentSlice.ts が非配列オブジェクトを importedSkills に格納
6. AgentView/index.tsx:151 で importedSkills.forEach() を呼び出し → TypeError
```

### skillHandlers.ts の応答形式確認結果

| IPC チャンネル     | ハンドラの応答コード                              | ラッパー形式     |
| ------------------ | ------------------------------------------------- | ---------------- |
| SKILL_LIST         | `return { success: true, data: result.skills }`   | あり             |
| SKILL_SCAN         | `return { success: true, data: result.skills }`   | あり             |
| SKILL_GET_IMPORTED | `return { success: true, data: skills }`          | あり             |
| SKILL_IMPORT       | `return skillService.importSkills(args.skillIds)` | なし（直接返却） |

## 2. 影響範囲

### 影響を受ける4メソッド

| メソッド        | IPC チャンネル     | 型注釈での戻り値型 | 実行時の実際の戻り値                       | 不一致の内容                         |
| --------------- | ------------------ | ------------------ | ------------------------------------------ | ------------------------------------ |
| `list()`        | SKILL_LIST         | `SkillMetadata[]`  | `{ success: true, data: SkillMetadata[] }` | 配列を期待するがオブジェクトが返る   |
| `getImported()` | SKILL_GET_IMPORTED | `ImportedSkill[]`  | `{ success: true, data: ImportedSkill[] }` | 配列を期待するがオブジェクトが返る   |
| `rescan()`      | SKILL_SCAN         | `SkillMetadata[]`  | `{ success: true, data: SkillMetadata[] }` | 配列を期待するがオブジェクトが返る   |
| `import()`      | SKILL_IMPORT       | `ImportedSkill`    | `skillService.importSkills()` の直接戻り値 | ラッパーなしだが戻り値型の確認が必要 |

### 影響を受けるファイル

| ファイル                                               | 影響内容                                     |
| ------------------------------------------------------ | -------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                | 修正対象（4メソッドのラッパー展開追加）      |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 間接的な影響（非配列を受け取ってクラッシュ） |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | クラッシュ発生箇所（151行目）                |

## 3. 受入基準（AC-1 -- AC-7）

| 基準ID | 受入基準                                                                 | 検証方法                                                      |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| AC-1   | `window.electronAPI.skill.getImported()` が `ImportedSkill[]` を直接返す | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-2   | `window.electronAPI.skill.list()` が `SkillMetadata[]` を直接返す        | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-3   | `window.electronAPI.skill.import()` が `ImportedSkill` を直接返す        | ユニットテストで戻り値がオブジェクト型であることを検証        |
| AC-4   | `window.electronAPI.skill.rescan()` が `SkillMetadata[]` を直接返す      | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-5   | AgentView で `importedSkills.forEach` が正常動作する                     | 手動テスト: Agent ビューでスキル一覧が表示される              |
| AC-6   | TypeScript の型注釈と実行時の値が一致する                                | `pnpm typecheck` PASS、かつ `as unknown as` 不要              |
| AC-7   | 既存テストが全て PASS する                                               | `pnpm --filter @repo/desktop exec vitest run` 全パス          |

## 4. スコープ定義

### スコープ内

| 対象                                    | 修正内容                                       |
| --------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | `list` メソッドのレスポンスラッパー展開        |
| `apps/desktop/src/preload/skill-api.ts` | `getImported` メソッドのレスポンスラッパー展開 |
| `apps/desktop/src/preload/skill-api.ts` | `import` メソッドのレスポンスラッパー展開      |
| `apps/desktop/src/preload/skill-api.ts` | `rescan` メソッドのレスポンスラッパー展開      |
| `apps/desktop/src/preload/skill-api.ts` | エラーレスポンス時の例外スローロジック追加     |

### スコープ外

| 対象                                            | 理由                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| `skill.execute()` のレスポンス形式変更          | 別メソッドであり、影響範囲調査が別途必要       |
| Permission API のレスポンス形式変更             | 別ドメインの API であり、このタスクの範囲外    |
| `agentSlice.ts` の `as unknown as Skill[]` 除去 | 別タスク UT-FIX-5-1-001 のスコープ             |
| IPC ハンドラ（`skillHandlers.ts`）の変更        | ラッパー形式は他のハンドラとの一貫性のため維持 |

## 5. 前提条件と制約

### 前提条件

| 条件                                                                      | 確認状態 |
| ------------------------------------------------------------------------- | -------- |
| IPC ハンドラの `{ success, data }` 応答形式は変更しない                   | 確定     |
| `safeInvoke` のチャンネルホワイトリスト検証ロジックは維持する             | 確定     |
| 修正対象は `apps/desktop/src/preload/skill-api.ts` の4メソッドに限定する  | 確定     |
| Preload 層でレスポンスラッパーを展開し、Renderer 層には展開済みの値を渡す | 確定     |

### 制約

| 制約                                                                       | 理由                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `contextIsolation: true` 環境下で動作すること                              | Electron セキュリティ要件（BrowserWindow 必須設定）      |
| `safeInvoke` のチャンネルホワイトリスト検証を迂回しないこと                | IPC セキュリティ原則（チャンネル名はホワイトリスト管理） |
| エラーレスポンス時に内部エラーメッセージをそのまま Renderer に渡さないこと | エラー情報漏洩防止                                       |

## 6. SKILL_IMPORT の特殊ケース

`SKILL_IMPORT` ハンドラは他の3つのハンドラと異なり、`skillService.importSkills(args.skillIds)` の戻り値を**直接返却**している（ラッパーで包んでいない）。

```typescript
// skillHandlers.ts:136
return skillService.importSkills(args.skillIds);
```

この特殊ケースにより、`import` メソッドは他のメソッドと異なる対応が必要となる。`importSkills()` の実際の戻り値型を Phase 5（実装）で確認し、ラッパー展開が不要な場合は `safeInvoke` をそのまま維持する方針とする。

## 7. 多角的チェック観点

### セキュリティ観点

- `safeInvoke` 関数内のチャンネルホワイトリスト検証が、新しい展開ロジック追加後も維持されること
- 新関数を追加する場合、`safeInvoke` を内部で呼び出し、ホワイトリスト検証をバイパスしないこと
- エラーレスポンスの `error` フィールドに含まれる内部情報が Renderer に伝播する際、スタックトレースやファイルパスが含まれないこと

### IPC 通信観点

- 4メソッド全てが同じレスポンス展開パターンで処理されること（`import` の特殊ケースを除く）
- IPC ハンドラ側の `{ success, data }` 応答形式には変更を加えないこと
- エラーレスポンス時に Preload 層で例外をスローし、Renderer 層の `try/catch` でハンドリング可能であること

### 型安全観点

- TypeScript の型注釈と `ipcRenderer.invoke` の実行時戻り値が一致すること
- ジェネリック型パラメータ `T` が IPC ハンドラの実際のレスポンス構造を反映すること
- `as` 型アサーションを使用せず、実行時バリデーションで型安全を保証すること
