# 設定UI設計 - 許可済みツール管理

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

設定画面に「許可済みツール管理」セクションを追加し、ユーザーが許可したツールの確認・削除を行えるようにします。

---

## UI配置場所

### 設定画面構成

```
設定 (Settings)
├── 一般 (General)
├── 外観 (Appearance)
├── スキル (Skills)
│   └── 許可済みツール (Allowed Tools)  ← 新規追加
├── 連携 (Integrations)
└── 詳細 (Advanced)
```

### 配置理由

- 「スキル」カテゴリに属する機能のため
- ツール権限はスキル実行に関連

---

## コンポーネント構成

### コンポーネントツリー

```
PermissionSettings (コンテナ)
├── PermissionSettingsHeader
│   ├── タイトル: "許可済みツール"
│   └── 説明: "「次回から確認しない」で許可したツール"
├── AllowedToolList
│   ├── AllowedToolItem (Read)
│   │   ├── ツール名
│   │   ├── 許可日時
│   │   └── 削除ボタン
│   ├── AllowedToolItem (Glob)
│   │   └── ...
│   └── EmptyState (許可ツールがない場合)
└── PermissionSettingsFooter
    └── 全てクリアボタン
```

---

## コンポーネント設計

### PermissionSettings

```typescript
// apps/desktop/src/renderer/components/settings/PermissionSettings.tsx

import { usePermissionSettings } from "../../hooks/usePermissionSettings";

export function PermissionSettings() {
  const {
    tools,
    isLoading,
    error,
    revokeTool,
    clearAll,
  } = usePermissionSettings();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="permission-settings">
      <PermissionSettingsHeader />
      <AllowedToolList
        tools={tools}
        onRevoke={revokeTool}
      />
      <PermissionSettingsFooter
        toolCount={tools.length}
        onClearAll={clearAll}
      />
    </div>
  );
}
```

### AllowedToolItem

```typescript
// apps/desktop/src/renderer/components/settings/AllowedToolItem.tsx

interface AllowedToolItemProps {
  toolName: string;
  allowedAt: string;
  onRevoke: (toolName: string) => void;
}

export function AllowedToolItem({
  toolName,
  allowedAt,
  onRevoke,
}: AllowedToolItemProps) {
  const formattedDate = formatDate(allowedAt);

  return (
    <div className="allowed-tool-item">
      <div className="tool-info">
        <span className="tool-name">{toolName}</span>
        <span className="allowed-at">
          許可日時: {formattedDate}
        </span>
      </div>
      <button
        className="revoke-button"
        onClick={() => onRevoke(toolName)}
        aria-label={`${toolName}の許可を取り消す`}
      >
        削除
      </button>
    </div>
  );
}
```

---

## 状態管理

### usePermissionSettings Hook

```typescript
// apps/desktop/src/renderer/hooks/usePermissionSettings.ts

import { useState, useEffect, useCallback } from "react";
import type { AllowedToolEntry } from "@repo/shared";

interface UsePermissionSettingsResult {
  tools: AllowedToolEntry[];
  isLoading: boolean;
  error: string | null;
  revokeTool: (toolName: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePermissionSettings(): UsePermissionSettingsResult {
  const [tools, setTools] = useState<AllowedToolEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await window.electronPermission.getAllowedTools();
      setTools(response.tools);
    } catch (err) {
      setError("許可済みツールの取得に失敗しました");
      console.error("Failed to fetch allowed tools:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeTool = useCallback(async (toolName: string) => {
    try {
      await window.electronPermission.revokeTool(toolName);
      setTools((prev) => prev.filter((t) => t.toolName !== toolName));
    } catch (err) {
      setError("許可の取り消しに失敗しました");
      console.error("Failed to revoke tool:", err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await window.electronPermission.clearAllPermissions();
      setTools([]);
    } catch (err) {
      setError("許可のクリアに失敗しました");
      console.error("Failed to clear all permissions:", err);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return {
    tools,
    isLoading,
    error,
    revokeTool,
    clearAll,
    refresh: fetchTools,
  };
}
```

---

## UIワイヤーフレーム

### 許可済みツールがある場合

```
┌─────────────────────────────────────────────────────┐
│  許可済みツール                                      │
│  「次回から確認しない」で許可したツール              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Read                                         │   │
│  │ 許可日時: 2026/01/25 12:00                  [削除]│
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Glob                                         │   │
│  │ 許可日時: 2026/01/25 12:05                  [削除]│
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Grep                                         │   │
│  │ 許可日時: 2026/01/25 12:10                  [削除]│
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                              [全ての許可をクリア]    │
└─────────────────────────────────────────────────────┘
```

### 許可済みツールがない場合

```
┌─────────────────────────────────────────────────────┐
│  許可済みツール                                      │
│  「次回から確認しない」で許可したツール              │
├─────────────────────────────────────────────────────┤
│                                                     │
│           📋                                        │
│                                                     │
│      許可済みのツールはありません                    │
│                                                     │
│      スキル実行時に「次回から確認しない」を          │
│      選択すると、ここに表示されます                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## スタイリング

### Tailwind CSS クラス

```typescript
// PermissionSettings.tsx
<div className="space-y-4">
  {/* Header */}
  <div className="border-b pb-4">
    <h3 className="text-lg font-medium">許可済みツール</h3>
    <p className="text-sm text-gray-500">
      「次回から確認しない」で許可したツール
    </p>
  </div>

  {/* Tool List */}
  <div className="space-y-2">
    {tools.map((tool) => (
      <div
        key={tool.toolName}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div>
          <span className="font-medium">{tool.toolName}</span>
          <span className="ml-2 text-sm text-gray-500">
            許可日時: {formatDate(tool.allowedAt)}
          </span>
        </div>
        <button
          onClick={() => revokeTool(tool.toolName)}
          className="text-red-500 hover:text-red-700"
        >
          削除
        </button>
      </div>
    ))}
  </div>

  {/* Footer */}
  {tools.length > 0 && (
    <div className="flex justify-end pt-4 border-t">
      <button
        onClick={clearAll}
        className="text-red-500 hover:text-red-700"
      >
        全ての許可をクリア
      </button>
    </div>
  )}
</div>
```

---

## アクセシビリティ

### ARIA属性

| 要素           | 属性       | 値                            |
| -------------- | ---------- | ----------------------------- |
| 削除ボタン     | aria-label | `${toolName}の許可を取り消す` |
| 全クリアボタン | aria-label | "全ての許可をクリア"          |
| ツールリスト   | role       | "list"                        |
| ツールアイテム | role       | "listitem"                    |

### キーボード操作

- Tab: フォーカス移動
- Enter/Space: ボタン実行

---

## ファイル配置

```
apps/desktop/src/renderer/
├── components/
│   └── settings/
│       ├── PermissionSettings.tsx        # 新規
│       ├── AllowedToolItem.tsx           # 新規
│       └── index.ts
└── hooks/
    └── usePermissionSettings.ts          # 新規
```

---

## 関連ドキュメント

- [IPCチャネル設計](./ipc-channel-design.md)
- [シーケンス図](./sequence-diagrams.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
