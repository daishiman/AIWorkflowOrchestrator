# Phase 8: リファクタリング（TDD Refactor Phase） - SkillSlice実装

## リファクタリング目的

Phase 5-7で実装した機能を維持しながら、コード品質を向上させる。

## リファクタリング対象

### 1. コード構造の改善

#### 1.1 ヘルパー関数の抽出

```typescript
// Before: アクション内に直接記述
fetchSkills: async () => {
  set({ isLoadingSkills: true, skillError: null });
  try {
    const [available, imported] = await Promise.all([
      window.electronAPI.skill.list(),
      window.electronAPI.skill.getImported(),
    ]);
    // ...
  } catch (error) {
    // ...
  }
};

// After: ヘルパー関数を抽出
async function fetchSkillsFromIPC(): Promise<{
  available: SkillMetadata[];
  imported: ImportedSkill[];
}> {
  if (!window.electronAPI?.skill) {
    throw new Error("Skill API not available");
  }
  const [available, imported] = await Promise.all([
    window.electronAPI.skill.list(),
    window.electronAPI.skill.getImported(),
  ]);
  return { available, imported };
}
```

#### 1.2 エラーメッセージの定数化

```typescript
// Before: インライン文字列
set({ skillError: `スキル一覧の取得に失敗: ${error}` });

// After: 定数化
const SKILL_ERRORS = {
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;

set({ skillError: `${SKILL_ERRORS.FETCH_FAILED}: ${error}` });
```

#### 1.3 型定義の整理

```typescript
// ローディング状態の型を抽出
interface SkillLoadingState {
  isLoadingSkills: boolean;
  isScanning: boolean;
  isImporting: boolean;
  importingSkillName: string | null;
}

// 実行状態の型を抽出
interface SkillExecutionState {
  isExecuting: boolean;
  executionId: string | null;
  executionStatus: SkillExecutionStatus | null;
  streamingMessages: SkillStreamMessage[];
  pendingPermission: SkillPermissionRequest | null;
}
```

### 2. パフォーマンス改善

#### 2.1 不要な再レンダリングの防止

```typescript
// Before: 毎回新しい配列を生成
_handleStreamMessage: (msg) => {
  set((state) => ({
    streamingMessages: [...state.streamingMessages, msg],
  }));
};

// After: immerを使用（Zustand immer middleware検討）
// または、メッセージIDによる重複チェック
_handleStreamMessage: (msg) => {
  set((state) => {
    if (state.streamingMessages.some((m) => m.timestamp === msg.timestamp)) {
      return state; // 重複は無視
    }
    return {
      streamingMessages: [...state.streamingMessages, msg],
    };
  });
};
```

### 3. コメント・ドキュメントの追加

```typescript
/**
 * スキル機能の状態管理スライス
 *
 * @description
 * スキルのインポート、選択、実行、権限管理の状態を管理する。
 * IPCを通じてMain Processと通信し、実行結果をストリーミングで受け取る。
 *
 * @see specification.md §5.5 Zustand Store設計
 * @see ChatSlice, LLMSlice（既存パターン参照）
 */
export interface SkillSlice {
  // ...
}
```

## リファクタリングチェックリスト

| チェック項目             | 状態 |
| ------------------------ | ---- |
| ヘルパー関数の抽出       | [ ]  |
| エラーメッセージの定数化 | [ ]  |
| 型定義の整理             | [ ]  |
| 重複コードの排除         | [ ]  |
| コメント・JSDocの追加    | [ ]  |
| 命名規則の統一           | [ ]  |
| 不要なコードの削除       | [ ]  |

## リファクタリング前後の比較

### ファイルサイズ

| ファイル               | Before   | After    | 削減率  |
| ---------------------- | -------- | -------- | ------- |
| skillSlice.ts          | \_\_\_行 | \_\_\_行 | \_\_\_% |
| setupSkillListeners.ts | \_\_\_行 | \_\_\_行 | \_\_\_% |

### 循環的複雑度

| 関数                | Before | After  | 目標 |
| ------------------- | ------ | ------ | ---- |
| fetchSkills         | \_\_\_ | \_\_\_ | ≤ 5  |
| executeSkill        | \_\_\_ | \_\_\_ | ≤ 5  |
| respondToPermission | \_\_\_ | \_\_\_ | ≤ 5  |

## テスト確認

リファクタリング後、全テストが引き続き通過することを確認する。

```bash
# 全テスト実行
pnpm --filter @repo/desktop test skillSlice

# カバレッジが維持されていることを確認
pnpm --filter @repo/desktop test:coverage -- skillSlice
```

## 完了条件

| 条件                                  | 状態 |
| ------------------------------------- | ---- |
| 全テストが通過する（Phase 4-6）       | [ ]  |
| カバレッジが維持されている（Phase 7） | [ ]  |
| コードの可読性が向上している          | [ ]  |
| 重複コードが排除されている            | [ ]  |
| ドキュメントコメントが追加されている  | [ ]  |
