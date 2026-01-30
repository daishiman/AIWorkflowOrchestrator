---
id: TASK-7C
tier: 1
title: PermissionDialog コンポーネント
phase: 7
depends_on: [TASK-6-1]
parallel_with: [TASK-7A, TASK-7B]
blocks: [TASK-7D]
status: completed
completed_date: 2026-01-30
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, component, dialog]
---

# PermissionDialog コンポーネント

## 概要

スキル実行中にツール使用の権限確認を求めるダイアログコンポーネントを実装する。

## 入力

- TASK-6-1 で実装した SkillSlice
- UI/UX仕様（specification.md 4.4.2）

## 出力

- `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`
- コンポーネントテストファイル

## 実装詳細

### コンポーネント構造

```typescript
// apps/desktop/src/renderer/components/skill/PermissionDialog.tsx

import React, { useState } from "react";
import { useAppStore } from "../../store";

export const PermissionDialog: React.FC = () => {
  const { pendingPermission, respondToPermission } = useAppStore();
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!pendingPermission) return null;

  const handleApprove = () => {
    respondToPermission(true, rememberChoice);
    setRememberChoice(false);
  };

  const handleApproveOnce = () => {
    respondToPermission(true, false);
    setRememberChoice(false);
  };

  const handleDeny = () => {
    respondToPermission(false, false);
    setRememberChoice(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-yellow-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-semibold">権限の確認が必要です</h2>
          </div>
          <button
            type="button"
            onClick={handleDeny}
            aria-label="閉じる"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4">
          <p className="mb-4 text-gray-700">
            エージェントが以下の操作を実行しようとしています:
          </p>

          {/* ツール情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">ツール:</span>
              <span className="px-2 py-0.5 bg-gray-200 rounded text-sm">
                {pendingPermission.toolName}
              </span>
            </div>

            {/* 引数表示 */}
            <div className="mt-2">
              <span className="font-medium text-sm text-gray-600">引数:</span>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {formatArgs(pendingPermission.args)}
              </pre>
            </div>

            {/* 理由（存在する場合） */}
            {pendingPermission.reason && (
              <div className="mt-2">
                <span className="font-medium text-sm text-gray-600">理由:</span>
                <p className="mt-1 text-sm text-gray-700">
                  {pendingPermission.reason}
                </p>
              </div>
            )}
          </div>

          {/* 自動許可チェックボックス */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              このセッション中は同様の操作を自動許可する
            </span>
          </label>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleDeny}
            className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            拒否
          </button>
          <button
            type="button"
            onClick={handleApproveOnce}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
          >
            1回許可
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            許可
          </button>
        </div>
      </div>
    </div>
  );
};

// 引数をフォーマット
function formatArgs(args: Record<string, unknown>): string {
  // Bashコマンドの場合は特別処理
  if (args.command && typeof args.command === "string") {
    return args.command;
  }

  // ファイルパスの場合
  if (args.path && typeof args.path === "string") {
    return args.path;
  }

  // それ以外はJSON
  return JSON.stringify(args, null, 2);
}
```

### ツール別アイコン

```typescript
const toolIcons: Record<string, string> = {
  Bash: "💻",
  Read: "📖",
  Write: "✏️",
  Edit: "📝",
  Glob: "🔍",
  Grep: "🔎",
  LS: "📁",
  Task: "📋",
  WebSearch: "🌐",
  WebFetch: "🌐",
};
```

## ファイル

| 操作 | パス                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                            |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] pendingPermission が null の時は何も表示しない
- [ ] ツール名が表示される
- [ ] 引数が適切にフォーマットされて表示される
- [ ] 「拒否」ボタンが機能する
- [ ] 「1回許可」ボタンが機能する
- [ ] 「許可」ボタンが機能する
- [ ] 「このセッション中は自動許可」チェックボックスが機能する
- [ ] ダイアログが閉じた後にチェックボックス状態がリセットされる
- [ ] コンポーネントテストが全て通過する

## テスト要件

### コンポーネントテスト

```typescript
describe("PermissionDialog", () => {
  it("should not render when pendingPermission is null");
  it("should render tool name");
  it("should render args for Bash command");
  it("should render args for file path");
  it("should render args as JSON for other tools");
  it("should call respondToPermission(false) on deny");
  it("should call respondToPermission(true, false) on approve once");
  it("should call respondToPermission(true, true) on approve with remember");
  it("should reset remember checkbox after response");
});
```

## 参考資料

- [specification.md - 4.4.2 権限確認ダイアログ](../specification.md)
