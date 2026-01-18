# スキルIPCハンドラー登録バグ修正 - 実装ガイド

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| 作成日     | 2026-01-17                             |
| Phase      | 12                                     |
| ステータス | 完了                                   |
| 作成者     | Claude Code (自動生成)                 |
| バグID     | skill-ipc-handlers-registration-bugfix |

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 問題の概要

Agent画面でスキル一覧が表示されず、無限にローディング状態が続く問題が発生していました。

### 何が起きていたか

Electronアプリでは、画面（フロントエンド）とバックエンドの間で「IPC通信」という方法でデータをやり取りします。この通信において、データの「渡し方」に不一致がありました。

**例え話**:

- フロントエンド: 「りんご、みかん」と果物の名前を直接伝えていた
- バックエンド: 「{果物: りんご、みかん}」という形式の荷物を期待していた
- 結果: バックエンドは荷物を開封しても「果物」というラベルがないため、何も見つけられなかった

### 解決策

データの渡し方を統一することで、正常に通信できるようになりました。

具体的には、フロントエンド側でデータを「荷物」に包んでから渡すように修正しました。

### 影響範囲

- 修正ファイル: 1つだけ
- 修正箇所: 3行のみ
- 既存機能への影響: なし
- ユーザーへの影響: Agent画面が正常に表示されるようになった

---

## Part 2: 技術的詳細（開発者向け）

### 根本原因分析

#### 問題の発生箇所

`apps/desktop/src/renderer/preload/index.ts` において、IPC invoke呼び出しの引数形式が、`apps/desktop/src/main/ipc/skillHandlers.ts` のハンドラーが期待する形式と異なっていた。

#### 不一致の詳細

| メソッド  | preload側（修正前）                   | handler側の期待                |
| --------- | ------------------------------------- | ------------------------------ |
| import    | `invoke("skill:import", skillIds)`    | `args: { skillIds: string[] }` |
| remove    | `invoke("skill:remove", skillId)`     | `args: { skillId: string }`    |
| getDetail | `invoke("skill:get-detail", skillId)` | `args: { skillId: string }`    |

#### handler側のコード

```typescript
// skillHandlers.ts
registerSecureIpcHandler<{ skillIds: string[] }, OperationResult<void>>(
  ipcMain,
  IpcChannels.SKILL_IMPORT,
  async (_event, args) => {
    const { skillIds } = args; // args.skillIds を期待
    // ...
  },
);
```

preload側が `skillIds` を直接渡すと、handler側では `args` 自体が配列になり、`args.skillIds` は `undefined` になる。

---

### 修正内容

#### 修正1: import メソッド

**ファイル**: `apps/desktop/src/renderer/preload/index.ts`

```typescript
// Before (Line 60-62)
return window.electronAPI.invoke<OperationResult<void>>(
  "skill:import",
  skillIds, // ← 配列を直接渡している
);

// After
return window.electronAPI.invoke<OperationResult<void>>("skill:import", {
  skillIds, // ← オブジェクト形式に変更
});
```

#### 修正2: remove メソッド

```typescript
// Before (Line 69-71)
return window.electronAPI.invoke<OperationResult<void>>(
  "skill:remove",
  skillId, // ← 文字列を直接渡している
);

// After
return window.electronAPI.invoke<OperationResult<void>>("skill:remove", {
  skillId, // ← オブジェクト形式に変更
});
```

#### 修正3: getDetail メソッド

```typescript
// Before (Line 78-80)
return window.electronAPI.invoke<OperationResult<Skill>>(
  "skill:get-detail",
  skillId, // ← 文字列を直接渡している
);

// After
return window.electronAPI.invoke<OperationResult<Skill>>(
  "skill:get-detail",
  { skillId }, // ← オブジェクト形式に変更
);
```

---

### 修正理由

1. **handler側の期待に合わせる**: handler側は既に正しい形式（オブジェクト形式）で実装されている
2. **影響範囲の最小化**: preload側の修正のみで対応可能（3行の変更）
3. **一貫性の維持**: 他のIPCハンドラーとの一貫性を保てる

---

### 関連ファイル

| ファイル                                     | 役割                | 変更 |
| -------------------------------------------- | ------------------- | ---- |
| `apps/desktop/src/renderer/preload/index.ts` | Renderer側IPC API   | 修正 |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | Main側IPCハンドラー | なし |
| `packages/shared/types/skill.ts`             | 型定義              | なし |

---

### テスト戦略

#### 追加されたテスト

| カテゴリ             | テスト数 | 内容                                |
| -------------------- | -------- | ----------------------------------- |
| 引数形式テスト       | 12       | オブジェクト形式での呼び出し確認    |
| エッジケーステスト   | 9        | 特殊文字、日本語、長文字列など      |
| エラーハンドリング   | 13       | IPCエラー、タイムアウト、失敗時など |
| フォールバックテスト | 3        | non-Electron環境での動作            |
| 統合シナリオテスト   | 4        | 完全なインポート/削除フロー         |

#### カバレッジ

| メトリクス | 実績 |
| ---------- | ---- |
| Line       | 100% |
| Branch     | 100% |
| Function   | 100% |

---

### 注意事項

#### IPC通信のベストプラクティス

1. **常にオブジェクト形式で引数を渡す**: `invoke("channel", { key: value })` の形式を使用
2. **型定義を明確にする**: handler側の期待する型を定義し、一貫性を保つ
3. **テストを書く**: IPC通信の引数形式をテストで検証する

#### 今回の教訓

- IPC通信では、preload側とhandler側の引数形式を必ず確認する
- TypeScriptの型システムだけでは、invoke呼び出しの引数形式の不一致を検出できない場合がある
- ユニットテストで引数形式を明示的に検証することが重要

---

### 参考リンク

- Electron IPC Documentation: https://www.electronjs.org/docs/latest/api/ipc-main
- プロジェクトのIPC Handler Registration Pattern: `architecture-patterns.md` 6.11.0節
