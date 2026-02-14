# Phase 1: 要件定義 - IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 1（要件定義）                  |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 目的

AgentView で発生する `importedSkills.forEach is not a function` ランタイムエラーの根本原因と影響範囲を分析し、修正に必要な要件と受入基準を定義する。

## 実行タスク

| タスク | 内容                 |
| ------ | -------------------- |
| Task 1 | 要件分析             |
| Task 2 | 受入基準の定義       |
| Task 3 | スコープ定義         |
| Task 4 | 前提条件と制約の整理 |

## 参照資料

| 種別               | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 元タスク仕様書     | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md` |
| クラッシュ箇所     | `apps/desktop/src/renderer/views/AgentView/index.tsx:151`                  |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                    |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.ts`                               |
| Store Slice        | `apps/desktop/src/renderer/store/slices/agentSlice.ts:556-577`             |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                     |
| セキュリティ仕様   | `security-api-electron.md`                                                 |
| IPC設計仕様        | `interfaces-agent-sdk-skill.md`                                            |
| インターフェース   | `interfaces-agent-sdk-skill.md`                                            |
| エラーハンドリング | `error-handling.md`                                                        |
| 実装パターン       | `architecture-implementation-patterns.md`                                  |
| 既知Pitfall        | `.claude/rules/06-known-pitfalls.md` P19, P23, P24                         |

## 実行手順

### Task 1: 要件分析

#### バグの根本原因

Main Process の IPC ハンドラ（`skillHandlers.ts`）が以下の形式でレスポンスを返す:

```typescript
// SKILL_GET_IMPORTED ハンドラの応答
{ success: true, data: skills }   // 成功時
{ success: false, error: "..." }  // 失敗時
```

一方、Preload 層の `safeInvoke<T>()` はジェネリック型パラメータ `T` を型注釈として使用するが、実行時にはラッパーオブジェクトをそのまま返す。型注釈 `Promise<ImportedSkill[]>` と実行時の値 `{ success: boolean, data: ImportedSkill[] }` が不一致であり、TypeScript のコンパイル時チェックでは検出できない。

#### 影響範囲（4メソッド）

| メソッド        | IPC チャンネル     | ハンドラ応答形式                                           | 型注釈との不一致                               |
| --------------- | ------------------ | ---------------------------------------------------------- | ---------------------------------------------- |
| `getImported()` | SKILL_GET_IMPORTED | `{ success: true, data: ImportedSkill[] }`                 | 配列を期待するが、オブジェクトが返る           |
| `list()`        | SKILL_LIST         | `{ success: true, data: SkillMetadata[] }`                 | 配列を期待するが、オブジェクトが返る           |
| `rescan()`      | SKILL_SCAN         | `{ success: true, data: SkillMetadata[] }`                 | 配列を期待するが、オブジェクトが返る           |
| `import()`      | SKILL_IMPORT       | `skillService.importSkills()` の直接戻り値（ラッパーなし） | `ImportResult` 型と `ImportedSkill` 型の不一致 |

#### ランタイムクラッシュの発生経路

1. `agentSlice.ts` の `fetchSkills()` が `window.electronAPI.skill.getImported()` を呼び出す
2. Preload 層が `{ success: true, data: [...] }` を `ImportedSkill[]` として返す
3. Store が非配列オブジェクトを `importedSkills` に格納する
4. `AgentView/index.tsx:151` で `importedSkills.forEach()` を呼び出してクラッシュする

### Task 2: 受入基準の定義

以下の7つの受入基準を全て満たすこと:

| 基準ID | 受入基準                                                                 | 検証方法                                                      |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| AC-1   | `window.electronAPI.skill.getImported()` が `ImportedSkill[]` を直接返す | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-2   | `window.electronAPI.skill.list()` が `SkillMetadata[]` を直接返す        | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-3   | `window.electronAPI.skill.import()` が `ImportedSkill` を直接返す        | ユニットテストで戻り値がオブジェクト型であることを検証        |
| AC-4   | `window.electronAPI.skill.rescan()` が `SkillMetadata[]` を直接返す      | ユニットテストで戻り値が `Array.isArray()` を満たすことを検証 |
| AC-5   | AgentView で `importedSkills.forEach` が正常動作する                     | 手動テスト: Agent ビューでスキル一覧が表示される              |
| AC-6   | TypeScript の型注釈と実行時の値が一致する                                | `pnpm typecheck` PASS、かつ `as unknown as` 不要              |
| AC-7   | 既存テストが全て PASS する                                               | `pnpm --filter @repo/desktop exec vitest run` 全パス          |

### Task 3: スコープ定義

#### スコープ内

| 対象                                    | 修正内容                                       |
| --------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | `list` メソッドのレスポンスラッパー展開        |
| `apps/desktop/src/preload/skill-api.ts` | `getImported` メソッドのレスポンスラッパー展開 |
| `apps/desktop/src/preload/skill-api.ts` | `import` メソッドのレスポンスラッパー展開      |
| `apps/desktop/src/preload/skill-api.ts` | `rescan` メソッドのレスポンスラッパー展開      |
| `apps/desktop/src/preload/skill-api.ts` | エラーレスポンス時の例外スローロジック追加     |

#### スコープ外

| 対象                                            | 理由                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| `skill.execute()` のレスポンス形式変更          | 別メソッドであり、影響範囲調査が別途必要       |
| Permission API のレスポンス形式変更             | 別ドメインの API であり、このタスクの範囲外    |
| `agentSlice.ts` の `as unknown as Skill[]` 除去 | 別タスク UT-FIX-5-1-001 のスコープ             |
| IPC ハンドラ（`skillHandlers.ts`）の変更        | ラッパー形式は他のハンドラとの一貫性のため維持 |

### Task 4: 前提条件と制約の整理

#### 前提条件

| 条件                                                                      | 確認状態 |
| ------------------------------------------------------------------------- | -------- |
| IPC ハンドラの `{ success, data }` 応答形式は変更しない                   | 確定     |
| `safeInvoke` のチャンネルホワイトリスト検証ロジックは維持する             | 確定     |
| 修正対象は `apps/desktop/src/preload/skill-api.ts` の4メソッドに限定する  | 確定     |
| Preload 層でレスポンスラッパーを展開し、Renderer 層には展開済みの値を渡す | 確定     |

#### 制約

| 制約                                                                       | 理由                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `contextIsolation: true` 環境下で動作すること                              | Electron セキュリティ要件（BrowserWindow 必須設定）      |
| `safeInvoke` のチャンネルホワイトリスト検証を迂回しないこと                | IPC セキュリティ原則（チャンネル名はホワイトリスト管理） |
| エラーレスポンス時に内部エラーメッセージをそのまま Renderer に渡さないこと | エラー情報漏洩防止                                       |

## 統合テスト連携

Preload → Main の IPC 通信検証方針:

| 検証項目                                             | 方法                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `safeInvoke` がホワイトリスト外チャンネルを拒否する  | 既存テスト `skill-api.test.ts` で検証済み                  |
| `{ success: true, data }` 形式の展開                 | 新規ユニットテストで `ipcRenderer.invoke` をモックして検証 |
| `{ success: false, error }` 形式のエラーハンドリング | 新規ユニットテストで例外スローを検証                       |
| SKILL_IMPORT の特殊ケース（ラッパーなし）            | 新規ユニットテストで直接戻り値の透過を検証                 |

## 多角的チェック観点

### セキュリティ

- `safeInvoke` 関数内のチャンネルホワイトリスト検証（`ALLOWED_INVOKE_CHANNELS.includes(channel)`）が新しい展開ロジック追加後も維持されること
- 新関数（`safeInvokeUnwrap` を採用する場合）が `safeInvoke` を内部で呼び出し、ホワイトリスト検証をバイパスしないこと
- エラーレスポンスの `error` フィールドに含まれる内部情報が Renderer に伝播する際、スタックトレースやファイルパスが含まれないこと

### IPC 通信

- 4メソッド全てが同じレスポンス展開パターンで処理されること（`import` の特殊ケースを除く）
- IPC ハンドラ側の `{ success, data }` 応答形式には変更を加えないこと
- エラーレスポンス時に Preload 層で例外をスローし、Renderer 層の `try/catch` でハンドリング可能であること

### 型安全

- TypeScript の型注釈（`Promise<ImportedSkill[]>` 等）と `ipcRenderer.invoke` の実行時戻り値が一致すること
- ジェネリック型パラメータ `T` が IPC ハンドラの実際のレスポンス構造を反映すること
- `as` 型アサーションを使用せず、実行時バリデーションで型安全を保証すること

## 成果物

| 成果物                 | パス                                                            |
| ---------------------- | --------------------------------------------------------------- |
| Phase 1 要件定義仕様書 | `docs/30-workflows/ipc-response-unwrap/phase-1-requirements.md` |

## 完了条件

- [ ] バグの根本原因が特定され、影響を受ける4メソッド（`list`, `getImported`, `import`, `rescan`）が列挙されている
- [ ] 7つの受入基準（AC-1 〜 AC-7）が定義され、各基準の検証方法が明示されている
- [ ] スコープ内（4メソッドのラッパー展開）とスコープ外（`execute()`, Permission API, `agentSlice` の型キャスト除去）が明確に区分されている
- [ ] 前提条件（IPC ハンドラ応答形式の維持、ホワイトリスト検証の維持）が確定している
- [ ] 制約（contextIsolation, チャンネルホワイトリスト、エラー情報漏洩防止）が整理されている
- [ ] SKILL_IMPORT の特殊ケース（ラッパーなし、`ImportResult` 型）が識別されている
- [ ] セキュリティ・IPC通信・型安全の3観点でチェック項目が定義されている

## 次のPhase

Phase 2（設計）へ進む。Phase 1 の要件分析結果と受入基準を入力として、Preload 層のレスポンス展開ロジックの設計を行う。
