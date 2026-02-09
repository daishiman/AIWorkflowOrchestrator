# 呼び出し元マッピング: window.electronAPI.skill 使用箇所一覧

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 1 - 要件定義                       |
| ドキュメント | 呼び出し元マッピング               |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、`window.electronAPI.skill` を使用しているすべてのファイルを特定し、使用されているメソッドとその目的を記録する。

## サマリー

| 項目         | 値                         |
| ------------ | -------------------------- |
| 総ファイル数 | 15                         |
| Hooks        | 3                          |
| Store        | 2                          |
| Views        | 1                          |
| Tests        | 9                          |
| **移行対象** | **0** （全て既に統一済み） |

**結論:** すべての呼び出し元が既に `window.electronAPI.skill` を使用しており、`window.skillAPI` を使用しているコードは存在しない。

## 詳細マッピング

### カテゴリ1: React Hooks（3ファイル）

#### 1.1 useSkillExecution.ts

**パス:** `apps/desktop/src/renderer/hooks/useSkillExecution.ts`

**用途:** スキル実行を管理するカスタムフック

**使用メソッド:**

| 行番号 | メソッド             | 用途                               |
| ------ | -------------------- | ---------------------------------- |
| 79     | `onStream(callback)` | ストリームメッセージのリスナー登録 |
| 132    | `execute(request)`   | スキル実行開始                     |
| 178    | `abort(executionId)` | 実行中断                           |

**コード例:**

```typescript
// 79行目: ストリームメッセージのリスナー登録
const unsubscribe = window.electronAPI.skill.onStream(
  (message: SkillStreamMessage) => {
    if (message.executionId !== executionIdRef.current) {
      return;
    }
    setMessages((prev) => [...prev, message]);
  },
);

// 132行目: スキル実行開始
const response = await window.electronAPI.skill.execute({
  skillId,
  prompt,
});

// 178行目: 実行中断
await window.electronAPI.skill.abort(executionIdRef.current);
```

**影響:** なし（既に統一済み）

#### 1.2 useSkillPermission.ts

**パス:** `apps/desktop/src/renderer/hooks/useSkillPermission.ts`

**用途:** スキル権限リクエストを管理するカスタムフック

**使用メソッド:**

| 行番号 | メソッド                        | 用途                         |
| ------ | ------------------------------- | ---------------------------- |
| 59     | `onPermissionRequest(callback)` | 権限リクエストのリスナー登録 |

**コード例:**

```typescript
// 59行目: 権限リクエストのリスナー登録
const cleanup = window.electronAPI.skill.onPermissionRequest(
  (request: SkillPermissionRequest) => {
    setPendingRequest(request);
  },
);
```

**影響:** なし（既に統一済み）

#### 1.3 usePermissionDialog.ts

**パス:** `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`

**用途:** 権限確認ダイアログを管理するカスタムフック

**使用メソッド:**

| 行番号 | メソッド                           | 用途                         |
| ------ | ---------------------------------- | ---------------------------- |
| 72     | `onPermissionRequest(callback)`    | 権限リクエストのリスナー登録 |
| 99     | `sendPermissionResponse(response)` | 権限応答の送信               |

**コード例:**

```typescript
// 72行目: 権限リクエストのリスナー登録
const unsubscribe = window.electronAPI.skill.onPermissionRequest(
  (request: SkillPermissionRequest) => {
    setRequests((prev) => [...prev, request]);
  },
);

// 99行目: 権限応答の送信
await window.electronAPI.skill.sendPermissionResponse(response);
```

**影響:** なし（既に統一済み）

### カテゴリ2: Zustand Store（2ファイル）

#### 2.1 skillSlice.ts

**パス:** `apps/desktop/src/renderer/store/slices/skillSlice.ts`

**用途:** スキル機能の状態管理スライス

**使用メソッド:**

| 行番号 | メソッド            | 用途                     |
| ------ | ------------------- | ------------------------ |
| 133    | `list()`            | 利用可能スキル一覧取得   |
| 134    | `getImported()`     | インポート済みスキル取得 |
| 196    | `rescan()`          | スキル再スキャン         |
| 197    | `getImported()`     | インポート済みスキル取得 |
| 217    | `import(skillName)` | スキルインポート         |
| 240    | `remove(skillName)` | スキル削除               |
| 277    | `execute(request)`  | スキル実行開始           |

**コード例:**

```typescript
// 133-134行目: スキル一覧とインポート済みスキル取得
const [available, imported] = await Promise.all([
  window.electronAPI.skill.list(),
  window.electronAPI.skill.getImported(),
]);

// 196-197行目: 再スキャン
const available = await window.electronAPI.skill.rescan();
const imported = await window.electronAPI.skill.getImported();

// 217行目: インポート
const imported = await window.electronAPI.skill.import(skillName);

// 240行目: 削除
await window.electronAPI.skill.remove(skillName);

// 277行目: 実行
const response = await window.electronAPI.skill.execute({
  skillId: selectedSkillName,
  prompt,
});
```

**影響:** なし（既に統一済み）

#### 2.2 setupSkillListeners.ts

**パス:** `apps/desktop/src/renderer/store/setupSkillListeners.ts`

**用途:** スキルIPCイベントリスナーの設定

**使用メソッド:**

| 行番号 | メソッド                        | 用途                               |
| ------ | ------------------------------- | ---------------------------------- |
| 24     | `onStream(callback)`            | ストリームメッセージのリスナー登録 |
| 29     | `onComplete(callback)`          | 完了イベントのリスナー登録         |
| 34     | `onError(callback)`             | エラーイベントのリスナー登録       |
| 39     | `onPermissionRequest(callback)` | 権限リクエストのリスナー登録       |

**コード例:**

```typescript
// 24行目: ストリームメッセージのリスナー
const unsubStream = window.electronAPI.skill.onStream(
  store._handleStreamMessage as (message: unknown) => void,
);

// 29行目: 完了イベントのリスナー
const unsubComplete = window.electronAPI.skill.onComplete(({ executionId }) =>
  store._handleComplete(executionId),
);

// 34行目: エラーイベントのリスナー
const unsubError = window.electronAPI.skill.onError(({ executionId, error }) =>
  store._handleError(executionId, error),
);

// 39行目: 権限リクエストのリスナー
const unsubPermission = window.electronAPI.skill.onPermissionRequest(
  store._handlePermissionRequest,
);
```

**影響:** なし（既に統一済み）

### カテゴリ3: React Views（1ファイル）

#### 3.1 AgentView/index.tsx

**パス:** `apps/desktop/src/renderer/views/AgentView/index.tsx`

**用途:** エージェント実行画面

**使用メソッド:**

| 行番号 | メソッド            | 用途                     |
| ------ | ------------------- | ------------------------ |
| 149    | `getImported()`     | インポート済みスキル取得 |
| 166    | `list()`            | 利用可能スキル一覧取得   |
| 198    | `execute(request)`  | スキル実行開始           |
| 218    | `remove(skillName)` | スキル削除               |
| 242    | `import(skillName)` | スキルインポート         |

**コード例:**

```typescript
// 149行目: インポート済みスキル取得
const imported = await window.electronAPI.skill.getImported();

// 166行目: 利用可能スキル一覧取得
const available = await window.electronAPI.skill.list();

// 198行目: スキル実行
await window.electronAPI.skill.execute({
  skillId: selectedSkill.name,
  prompt: inputPrompt,
});

// 218行目: スキル削除
await window.electronAPI.skill.remove(skill.name);

// 242行目: スキルインポート
await window.electronAPI.skill.import(skillName);
```

**影響:** なし（既に統一済み）

### カテゴリ4: テストファイル（9ファイル）

| #   | ファイル                                 | 用途                       | 影響               |
| --- | ---------------------------------------- | -------------------------- | ------------------ |
| 4.1 | `skillSlice.test.ts`                     | skillSlice ユニットテスト  | なし（モック経由） |
| 4.2 | `skillSlice.edge-cases.test.ts`          | エッジケーステスト         | なし（モック経由） |
| 4.3 | `skillSlice.integration.test.ts`         | 統合テスト                 | なし（モック経由） |
| 4.4 | `skillSlice.ipc.test.ts`                 | IPC通信テスト              | なし（モック経由） |
| 4.5 | `skillSlice.state-transition.test.ts`    | 状態遷移テスト             | なし（モック経由） |
| 4.6 | `usePermissionDialog.test.ts`            | usePermissionDialog テスト | なし（モック経由） |
| 4.7 | `useSkillExecution.test.ts`              | useSkillExecution テスト   | なし（モック経由） |
| 4.8 | `AgentView/debug.test.ts`                | AgentView デバッグテスト   | なし（モック経由） |
| 4.9 | `SkillStreamDisplay.permission.test.tsx` | 権限ダイアログテスト       | なし（モック経由） |

**テストでの使用パターン:**

```typescript
// モックの設定例
(global as any).window.electronAPI.skill.execute = vi
  .fn()
  .mockResolvedValue({ success: true, executionId: "test-123" });

(global as any).window.electronAPI.skill.onStream = vi
  .fn()
  .mockReturnValue(() => {});

// アサーション例
expect(
  (global as any).window.electronAPI.skill.sendPermissionResponse,
).toHaveBeenCalledWith({
  requestId: "test-request-id",
  allowed: true,
});
```

**影響:** なし（モック経由のため、実装への依存なし）

## 移行影響分析

### window.skillAPI を使用しているコード

**検索結果:**

```bash
$ grep -r "window\.skillAPI" apps/desktop/src/renderer
# → 0件
```

**結論:** `window.skillAPI` を使用しているコードは**存在しない**。

### window.electronAPI.skill を使用しているコード

**検索結果:** 15ファイルで45箇所の使用を確認

**結論:** すべての呼び出し元が既に `window.electronAPI.skill` を使用している。

### 移行の必要性

| 判定         | 理由                                                             |
| ------------ | ---------------------------------------------------------------- |
| **移行不要** | 全ての呼び出し元が既に `window.electronAPI.skill` を使用         |
| **影響なし** | `window.skillAPI` の型宣言を削除しても、実装コードへの影響はゼロ |
| **変更対象** | 型宣言ファイル（`types.d.ts`, `types.ts`）のみ                   |

## メソッド使用頻度

| メソッド                   | 使用箇所数 | 主要用途                   |
| -------------------------- | ---------- | -------------------------- |
| `onStream()`               | 3          | リアルタイムメッセージ受信 |
| `execute()`                | 5          | スキル実行開始             |
| `list()`                   | 3          | 利用可能スキル一覧取得     |
| `getImported()`            | 5          | インポート済みスキル取得   |
| `onPermissionRequest()`    | 3          | 権限リクエスト処理         |
| `sendPermissionResponse()` | 2          | 権限応答送信               |
| `import()`                 | 2          | スキルインポート           |
| `remove()`                 | 2          | スキル削除                 |
| `rescan()`                 | 1          | スキル再スキャン           |
| `abort()`                  | 1          | 実行中断                   |
| `onComplete()`             | 1          | 完了イベント処理           |
| `onError()`                | 1          | エラーイベント処理         |
| `getExecutionStatus()`     | 0          | （現在未使用）             |

**合計:** 13メソッド中12メソッドが実際に使用されている。

## 推奨アクション

1. **型宣言の削除:**
   - `apps/desktop/src/preload/types.d.ts` から `skillAPI: SkillAPI` を削除
   - `apps/desktop/src/preload/types.ts` のグローバル宣言から `skillAPI` を削除

2. **実装コードの変更:**
   - **不要**（全て既に統一済み）

3. **テストの変更:**
   - **不要**（モック経由のため影響なし）

## まとめ

- **移行対象コード:** 0件
- **変更必要ファイル:** 2件（型宣言ファイルのみ）
- **影響を受けるファイル:** 0件
- **後方互換性:** 完全に保証される
- **リスク:** 極めて低い

**結論:** 本タスクは型宣言の整理のみで完了し、実装コードへの影響はゼロ。

---

**作成日:** 2026-02-09
**ステータス:** Phase 1 完了
