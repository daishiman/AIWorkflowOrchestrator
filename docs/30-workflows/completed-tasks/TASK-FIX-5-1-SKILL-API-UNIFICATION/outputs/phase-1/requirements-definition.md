# TASK-FIX-5-1: SkillAPI二重定義の解消 - 要件定義書

## 概要

### タスク情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| タスクID   | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| タスク名   | SkillAPI二重定義の解消             |
| Phase      | 1 - 要件定義                       |
| 作成日     | 2026-02-08                         |
| ステータス | 完了                               |

### 目的

`window.skillAPI` と `window.electronAPI.skill` の二重定義を解消し、`window.electronAPI.skill` に統一することで、コードベースの保守性と一貫性を向上させる。

## 現状分析

### 問題の背景

現在のコードベースには、SkillAPIへのアクセス経路が2つ存在するかのような型定義がある：

1. `window.skillAPI` - 型宣言のみ存在（実装なし）
2. `window.electronAPI.skill` - 実装・型宣言ともに存在

しかし、実際の実装では：

- `contextBridge.exposeInMainWorld()` で公開されているのは `electronAPI` のみ
- `window.skillAPI` は独立して公開されていない
- すべての呼び出し元は既に `window.electronAPI.skill` を使用している

### 調査結果

#### 1. Preload Layer の実装状況

**ファイル: `apps/desktop/src/preload/skill-api.ts`**

- `SkillAPI` インターフェースを定義（13メソッド）
- `skillAPI` 実装オブジェクトをエクスポート
- 独立した `contextBridge.exposeInMainWorld` 呼び出しは**存在しない**

**ファイル: `apps/desktop/src/preload/index.ts`**

- 351行目: `skill: skillAPI` として `electronAPI` オブジェクトに含める
- 542行目: `contextBridge.exposeInMainWorld("electronAPI", electronAPI)` で公開
- **`window.skillAPI` として独立公開する処理は存在しない**

**ファイル: `apps/desktop/src/preload/types.d.ts`**

- 9行目: `skillAPI: SkillAPI` をグローバル `Window` インターフェースに宣言
- この宣言は**実体のない幽霊型定義**

**ファイル: `apps/desktop/src/preload/types.ts`**

- 973行目: `ElectronAPI` インターフェースで `skill: SkillAPI` を定義
- 1515行目: グローバル宣言で `skillAPI: SkillAPI` を宣言（重複）

#### 2. Renderer Layer の使用状況

調査結果：**すべての呼び出し元が `window.electronAPI.skill` を使用**

| カテゴリ | ファイル数 | 主要ファイル                                                              |
| -------- | ---------- | ------------------------------------------------------------------------- |
| Hooks    | 3          | `useSkillExecution.ts`, `useSkillPermission.ts`, `usePermissionDialog.ts` |
| Store    | 2          | `skillSlice.ts`, `setupSkillListeners.ts`                                 |
| Views    | 1          | `AgentView/index.tsx`                                                     |
| Tests    | 9          | 各種統合テスト・ユニットテスト                                            |

**使用パターン例:**

```typescript
// apps/desktop/src/renderer/hooks/useSkillExecution.ts:79
window.electronAPI.skill.onStream((message) => { ... });

// apps/desktop/src/renderer/store/slices/skillSlice.ts:133
await window.electronAPI.skill.list();

// apps/desktop/src/renderer/store/setupSkillListeners.ts:24
window.electronAPI.skill.onStream(store._handleStreamMessage);
```

**重要な発見:**

- `window.skillAPI` を使用しているコードは**0件**
- 全15ファイルが `window.electronAPI.skill.*` を使用

## 機能要件（FR）

### FR-1: 型定義の統一

**要件:** `window.skillAPI` の型宣言を削除し、`window.electronAPI.skill` のみを使用する

**受け入れ基準:**

- [ ] `types.d.ts` から `skillAPI: SkillAPI` 宣言が削除されている
- [ ] `types.ts` のグローバル宣言から `skillAPI` が削除されている
- [ ] `ElectronAPI.skill` の型定義は維持されている
- [ ] TypeScript型チェック（`pnpm typecheck`）がエラーなく通過する

### FR-2: API インターフェースの維持

**要件:** `SkillAPI` インターフェースの13メソッドは変更せず、そのまま維持する

**受け入れ基準:**

- [ ] `skill-api.ts` の `SkillAPI` インターフェース定義に変更がない
- [ ] `skillAPI` 実装オブジェクトに変更がない
- [ ] すべてのAPIメソッドの型シグネチャが維持されている

### FR-3: 実装コードの非影響

**要件:** Renderer層のコードは変更不要（既に統一されているため）

**受け入れ基準:**

- [ ] Renderer Hooks に変更がない
- [ ] Renderer Store に変更がない
- [ ] Renderer Views に変更がない
- [ ] テストコードに変更がない

## 非機能要件（NFR）

### NFR-1: セキュリティ

**要件:** Electron セキュリティ原則を遵守

- `contextIsolation: true` を維持
- `nodeIntegration: false` を維持
- `sandbox: true` を維持
- `safeInvoke` / `safeOn` パターンを維持

**参照:** `.claude/rules/04-electron-security.md`

### NFR-2: 型安全性

**要件:** TypeScript strict モードでエラーが発生しない

- `strict: true` での型チェックが通過
- 型アサーション（`as`）の使用を最小限に
- ジェネリクスによる型保証を維持

**参照:** `.claude/rules/02-code-quality.md`

### NFR-3: 後方互換性

**要件:** 既存の動作に影響を与えない

- API の振る舞いが変更前と同一
- IPC通信フローに変更なし
- Main Process のハンドラに変更なし

### NFR-4: テストカバレッジ

**要件:** 既存テストが100%通過

- ユニットテスト（9ファイル）が全て成功
- 統合テストが全て成功
- E2Eテストが全て成功（該当する場合）

## SkillAPI メソッド一覧

### 一覧・管理系（5メソッド）

| メソッド        | 用途                     | IPCチャンネル       | 戻り値型                   |
| --------------- | ------------------------ | ------------------- | -------------------------- |
| `list()`        | 利用可能スキル一覧取得   | `skill:list`        | `Promise<SkillMetadata[]>` |
| `getImported()` | インポート済みスキル取得 | `skill:getImported` | `Promise<ImportedSkill[]>` |
| `import(name)`  | スキルインポート         | `skill:import`      | `Promise<ImportedSkill>`   |
| `remove(name)`  | スキル削除               | `skill:remove`      | `Promise<void>`            |
| `rescan()`      | スキル再スキャン         | `skill:scan`        | `Promise<SkillMetadata[]>` |

### 実行系（3メソッド）

| メソッド                 | 用途           | IPCチャンネル     | 戻り値型                          |
| ------------------------ | -------------- | ----------------- | --------------------------------- |
| `execute(request)`       | スキル実行開始 | `skill:execute`   | `Promise<SkillExecutionResponse>` |
| `abort(executionId)`     | 実行中断       | `skill:abort`     | `Promise<void>`                   |
| `getExecutionStatus(id)` | 実行状態取得   | `skill:getStatus` | `Promise<ExecutionInfo \| null>`  |

### イベント系（3メソッド）

| メソッド               | 用途                     | IPCチャンネル    | 戻り値型               |
| ---------------------- | ------------------------ | ---------------- | ---------------------- |
| `onStream(callback)`   | ストリームメッセージ購読 | `skill:stream`   | `() => void` (cleanup) |
| `onComplete(callback)` | 完了イベント購読         | `skill:complete` | `() => void` (cleanup) |
| `onError(callback)`    | エラーイベント購読       | `skill:error`    | `() => void` (cleanup) |

### 権限系（2メソッド）

| メソッド                        | 用途               | IPCチャンネル              | 戻り値型                      |
| ------------------------------- | ------------------ | -------------------------- | ----------------------------- |
| `onPermissionRequest(callback)` | 権限リクエスト購読 | `skill:permissionRequest`  | `() => void` (cleanup)        |
| `sendPermissionResponse(res)`   | 権限応答送信       | `skill:permissionResponse` | `Promise<{success: boolean}>` |

## 影響範囲分析

### 変更対象ファイル

| ファイル                              | 変更内容                           | 影響度           |
| ------------------------------------- | ---------------------------------- | ---------------- |
| `apps/desktop/src/preload/types.d.ts` | `window.skillAPI` 宣言を削除       | 低（型定義のみ） |
| `apps/desktop/src/preload/types.ts`   | グローバル宣言から `skillAPI` 削除 | 低（型定義のみ） |

### 変更不要ファイル

| ファイル                                | 理由                                   |
| --------------------------------------- | -------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | インターフェース・実装は維持           |
| `apps/desktop/src/preload/index.ts`     | `electronAPI.skill` への割り当ては維持 |
| `apps/desktop/src/renderer/**/*.ts(x)`  | 既に `window.electronAPI.skill` を使用 |

### リスク評価

| リスク           | 発生確率 | 影響度 | 対策                        |
| ---------------- | -------- | ------ | --------------------------- |
| 型チェックエラー | 低       | 低     | `pnpm typecheck` で事前検証 |
| ビルドエラー     | 低       | 低     | `pnpm build` で事前検証     |
| テスト失敗       | 低       | 中     | 全テスト実行で検証          |
| 実行時エラー     | 極低     | 高     | 実装コードに変更なしのため  |

## 接続要件

### API接続

```
Renderer Process
  ↓
window.electronAPI.skill
  ↓
contextBridge
  ↓
IPC (safeInvoke / safeOn)
  ↓
Main Process (SkillExecutor)
```

### データフロー

1. **コマンド系フロー:**
   - Renderer → `window.electronAPI.skill.execute(request)`
   - → Preload → `safeInvoke("skill:execute", request)`
   - → IPC → Main Process → SkillExecutor

2. **イベント系フロー:**
   - Main Process → IPC → `skill:stream` チャンネル
   - → Preload → `safeOn` でリスナー登録
   - → Renderer → コールバック実行

## アーキテクチャ層別要件

### フロントエンド（Renderer）

- **確認観点:** `window.electronAPI.skill` を一貫して使用
- **変更:** なし（既に統一済み）
- **検証方法:** grep検索で `window.skillAPI` が0件

### バックエンド（Main）

- **確認観点:** IPC ハンドラの変更なし
- **変更:** なし
- **検証方法:** Main Process のコード差分なし

### IPC通信

- **確認観点:** チャンネル定義の変更なし
- **変更:** なし
- **検証方法:** `channels.ts` の差分なし

### Preload/セキュリティ

- **確認観点:** `contextBridge` の公開APIを整理
- **変更:** 型宣言ファイルのみ
- **検証方法:**
  - `contextIsolation: true` 維持
  - `nodeIntegration: false` 維持
  - `sandbox: true` 維持
  - セキュリティ設定の差分なし

### データ

- **確認観点:** データ型の変更なし
- **変更:** なし
- **検証方法:** 型定義の差分なし（`SkillAPI` インターフェース）

## 完了条件チェックリスト

- [x] 2つのAPI（skill-api.ts vs preload/index.ts）の差異が分析されている
- [x] 統一対象の13メソッドが特定されている
- [x] 移行対象の呼び出し元が特定されている（15ファイル、全て既に統一済み）
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 接続要件（API/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [x] リスク評価が完了している
- [x] 影響範囲が明確化されている

## 次のアクション

Phase 2: 設計（architecture-design.md の作成）

---

**作成日:** 2026-02-09
**最終更新:** 2026-02-09
**ステータス:** Phase 1 完了
