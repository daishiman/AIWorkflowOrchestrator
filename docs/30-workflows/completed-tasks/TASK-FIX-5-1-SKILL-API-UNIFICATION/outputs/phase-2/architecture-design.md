# TASK-FIX-5-1: アーキテクチャ設計

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 2 - 設計                           |
| ドキュメント | アーキテクチャ設計                 |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、SkillAPIの二重定義を解消するためのアーキテクチャ設計を記述する。

## 現状アーキテクチャ（As-Is）

### レイヤー構成

```
┌─────────────────────────────────────────────┐
│ Renderer Process                            │
│  ┌───────────────────────────────────────┐  │
│  │ React Components / Hooks / Store      │  │
│  │  - useSkillExecution                  │  │
│  │  - skillSlice                         │  │
│  │  - AgentView                          │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│              │ window.electronAPI.skill.*    │
│              │                               │
└──────────────┼───────────────────────────────┘
               │
         ┌─────▼─────┐
         │ IPC Boundary │
         └─────┬─────┘
               │
┌──────────────▼───────────────────────────────┐
│ Preload Process                              │
│  ┌───────────────────────────────────────┐  │
│  │ contextBridge.exposeInMainWorld       │  │
│  │  ("electronAPI", electronAPI)         │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│  ┌───────────▼───────────────────────────┐  │
│  │ electronAPI: ElectronAPI              │  │
│  │  ├─ file: FileAPI                     │  │
│  │  ├─ store: StoreAPI                   │  │
│  │  ├─ skill: SkillAPI ◄─────────────────┼──┐ 実体
│  │  └─ ... other APIs                    │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │ skillAPI: SkillAPI (実装)             │  │
│  │  ├─ safeInvoke を使用                 │  │
│  │  └─ safeOn を使用                     │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │ Window型宣言（types.d.ts）            │  │
│  │  ├─ electronAPI: ElectronAPI          │  │
│  │  └─ skillAPI: SkillAPI ◄──────────────┼──┐ 幽霊型定義
│  └───────────────────────────────────────┘  │ （実体なし）
└──────────────┬───────────────────────────────┘
               │
               │ IPC (skill:*)
               │
┌──────────────▼───────────────────────────────┐
│ Main Process                                 │
│  ┌───────────────────────────────────────┐  │
│  │ IPC Handlers                          │  │
│  │  - skill:execute                      │  │
│  │  - skill:list                         │  │
│  │  - skill:permissionRequest            │  │
│  │  - ... other handlers                 │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│  ┌───────────▼───────────────────────────┐  │
│  │ SkillExecutor Service                 │  │
│  └───────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 問題点

1. **型宣言の重複:**
   - `types.d.ts` で `window.skillAPI: SkillAPI` を宣言
   - `types.ts` で `ElectronAPI.skill: SkillAPI` を宣言
   - `types.ts` のグローバル宣言でも `skillAPI: SkillAPI` を宣言

2. **実体のない型宣言:**
   - `window.skillAPI` は型宣言のみ存在
   - `contextBridge.exposeInMainWorld` で公開されていない
   - 使用するとTypeScriptは通るが、実行時エラー

## 目標アーキテクチャ（To-Be）

### レイヤー構成

```
┌─────────────────────────────────────────────┐
│ Renderer Process                            │
│  ┌───────────────────────────────────────┐  │
│  │ React Components / Hooks / Store      │  │
│  │  - useSkillExecution                  │  │
│  │  - skillSlice                         │  │
│  │  - AgentView                          │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│              │ window.electronAPI.skill.*    │
│              │                               │
└──────────────┼───────────────────────────────┘
               │
         ┌─────▼─────┐
         │ IPC Boundary │
         └─────┬─────┘
               │
┌──────────────▼───────────────────────────────┐
│ Preload Process                              │
│  ┌───────────────────────────────────────┐  │
│  │ contextBridge.exposeInMainWorld       │  │
│  │  ("electronAPI", electronAPI)         │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│  ┌───────────▼───────────────────────────┐  │
│  │ electronAPI: ElectronAPI              │  │
│  │  ├─ file: FileAPI                     │  │
│  │  ├─ store: StoreAPI                   │  │
│  │  ├─ skill: SkillAPI ◄─────────────────┼──┐ 唯一のエントリポイント
│  │  └─ ... other APIs                    │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │ skillAPI: SkillAPI (実装)             │  │
│  │  ├─ safeInvoke を使用                 │  │
│  │  └─ safeOn を使用                     │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │ Window型宣言（types.ts）              │  │
│  │  └─ electronAPI: ElectronAPI          │  │
│  │      └─ skill: SkillAPI               │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  【削除】types.d.ts の skillAPI 宣言       │
│  【削除】types.ts グローバル宣言の skillAPI│
└──────────────┬───────────────────────────────┘
               │
               │ IPC (skill:*)
               │
┌──────────────▼───────────────────────────────┐
│ Main Process                                 │
│  ┌───────────────────────────────────────┐  │
│  │ IPC Handlers                          │  │
│  │  - skill:execute                      │  │
│  │  - skill:list                         │  │
│  │  - skill:permissionRequest            │  │
│  │  - ... other handlers                 │  │
│  └───────────┬───────────────────────────┘  │
│              │                               │
│  ┌───────────▼───────────────────────────┐  │
│  │ SkillExecutor Service                 │  │
│  └───────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 改善点

1. **型宣言の統一:**
   - `window.electronAPI.skill` のみを型宣言
   - `window.skillAPI` の型宣言を削除
   - 型宣言箇所を1箇所に集約（`types.ts` の `ElectronAPI.skill`）

2. **実体と型の一致:**
   - 型宣言が実装と完全に対応
   - 開発者が迷わない明確なAPIパス

## セキュリティアーキテクチャ

### 多層防御の維持

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Context Isolation                          │
│  - Renderer と Preload の V8 コンテキストを分離      │
│  - window.electronAPI 以外はアクセス不可             │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Layer 2: contextBridge Whitelist                    │
│  - electronAPI のみ公開                              │
│  - skillAPI は独立公開しない                         │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Layer 3: safeInvoke / safeOn Channel Validation     │
│  - ALLOWED_INVOKE_CHANNELS で invoke を制限          │
│  - ALLOWED_ON_CHANNELS でリスナー登録を制限          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Layer 4: Main Process IPC Handler Validation        │
│  - パラメータバリデーション                          │
│  - パーミッションチェック                            │
└─────────────────────────────────────────────────────┘
```

**変更の影響:** なし（全4層を維持）

## データフロー設計

### 1. コマンド系フロー（例: execute）

```
┌─────────────────┐
│ Renderer        │
│  skillSlice.ts  │
└────────┬────────┘
         │
         │ window.electronAPI.skill.execute(request)
         │
┌────────▼────────┐
│ Preload         │
│  skill-api.ts   │
│  └─ safeInvoke  │
└────────┬────────┘
         │
         │ ipcRenderer.invoke("skill:execute", request)
         │
┌────────▼────────┐
│ Main            │
│  IPC Handler    │
│  └─ validate    │
└────────┬────────┘
         │
         │ SkillExecutor.execute(request)
         │
┌────────▼────────┐
│ SkillExecutor   │
│  Service        │
└─────────────────┘
```

### 2. イベント系フロー（例: onStream）

```
┌─────────────────┐
│ SkillExecutor   │
│  Service        │
└────────┬────────┘
         │
         │ this.emit("skill:stream", message)
         │
┌────────▼────────┐
│ Main            │
│  IPC Handler    │
└────────┬────────┘
         │
         │ BrowserWindow.webContents.send("skill:stream", message)
         │
┌────────▼────────┐
│ Preload         │
│  skill-api.ts   │
│  └─ safeOn      │
└────────┬────────┘
         │
         │ callback(message)
         │
┌────────▼────────┐
│ Renderer        │
│  useSkillExec   │
│  ution          │
└─────────────────┘
```

## 統合ポイント設計

### Renderer ↔ Preload

**契約:**

- Renderer は `window.electronAPI.skill.*` を通じてAPIを呼び出す
- Preload は `electronAPI.skill` として `SkillAPI` を提供

**検証:**

- `window.electronAPI?.skill` の存在チェック
- TypeScript による型チェック

### Preload ↔ Main

**契約:**

- Preload は `safeInvoke` / `safeOn` でチャンネルを制限
- Main は各 IPC チャンネルでハンドラを登録

**検証:**

- チャンネルホワイトリスト（`channels.ts`）
- Main Process のハンドラ登録確認

## アーキテクチャ決定記録（ADR）

### ADR-1: window.skillAPI 型宣言の削除

**決定:** `window.skillAPI` の型宣言を削除する

**理由:**

1. 実装が存在しない（幽霊型定義）
2. 全ての呼び出し元が既に `window.electronAPI.skill` を使用
3. 一貫性の欠如を解消

**影響:**

- 型定義ファイルの変更のみ
- 実装コードへの影響なし

### ADR-2: ElectronAPI.skill の維持

**決定:** `ElectronAPI.skill` の型定義と実装を維持する

**理由:**

1. 仕様に準拠した正式なAPIパス
2. セキュリティ原則（contextBridge）を遵守
3. 他のAPIとの一貫性

**影響:**

- 変更なし

### ADR-3: 段階的移行の不要性

**決定:** 段階的移行（deprecation警告等）は実施しない

**理由:**

1. `window.skillAPI` を使用しているコードが0件
2. 後方互換性の問題なし
3. 即座に削除可能

**影響:**

- Phase 5（実装）で即座に削除可能

## アーキテクチャ品質属性

### パフォーマンス

- **変更の影響:** なし
- **理由:** 型定義の削除のみ、実行時パフォーマンスに影響なし

### セキュリティ

- **変更の影響:** なし（むしろ向上）
- **理由:**
  - 4層防御を維持
  - 幽霊型定義を削除することで、開発者の誤用を防止

### 保守性

- **変更の影響:** 向上
- **理由:**
  - 型宣言箇所を1箇所に集約
  - 使用されていないコードを削除
  - 一貫性のある設計

### テスト容易性

- **変更の影響:** なし
- **理由:** テストはモック経由のため、型宣言の削除に影響されない

## まとめ

### アーキテクチャ変更サマリー

| 項目                | 変更前                               | 変更後                     |
| ------------------- | ------------------------------------ | -------------------------- |
| APIエントリポイント | 2箇所（electronAPI.skill, skillAPI） | 1箇所（electronAPI.skill） |
| 型宣言箇所          | 3箇所（types.d.ts, types.ts x2）     | 1箇所（types.ts）          |
| 実装                | 1箇所（skill-api.ts）                | 変更なし                   |
| セキュリティ層      | 4層                                  | 変更なし                   |

### 設計原則の遵守

- ✅ **単一責務 (SRP):** 各ファイルが明確な責務を持つ
- ✅ **依存性逆転 (DIP):** インターフェース（SkillAPI）に依存
- ✅ **インターフェース分離 (ISP):** 必要なメソッドのみを公開
- ✅ **最小権限:** Renderer は electronAPI 経由のみ
- ✅ **多層防御:** 4層のセキュリティ防御を維持

---

**作成日:** 2026-02-09
**ステータス:** Phase 2 完了
**次のアクション:** Phase 3 設計レビューへ進行
