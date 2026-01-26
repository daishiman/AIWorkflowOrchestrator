# SkillStreamDisplay Permission統合ドキュメント

## 概要

TASK-3-1-DでSkillStreamDisplayコンポーネントにPermission要求処理を統合。
既存のPermissionDialogコンポーネントを再利用し、skillAPI経由の権限確認フローを実装。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│ SkillStreamDisplay                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ useSkillExecution (既存)                                │ │
│ │ - messages, status, execute, abort, reset               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ useSkillPermission (新規)                               │ │
│ │ - pendingPermission, handleApprove, handleDeny          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PermissionDialog (既存コンポーネント再利用)             │ │
│ │ - request, onApprove, onDeny                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## useSkillPermission フック

### ファイル

`apps/desktop/src/renderer/hooks/useSkillPermission.ts`

### インターフェース

```typescript
interface UseSkillPermissionReturn {
  /** 保留中の権限リクエスト（なければ null） */
  pendingPermission: SkillPermissionRequest | null;
  /** 許可ハンドラ */
  handleApprove: (rememberChoice: boolean) => void;
  /** 拒否ハンドラ */
  handleDeny: (rememberChoice: boolean) => void;
}

function useSkillPermission(): UseSkillPermissionReturn;
```

### 状態管理

```typescript
const [pendingPermission, setPendingPermission] =
  useState<SkillPermissionRequest | null>(null);
```

- `null`: リクエストなし
- `SkillPermissionRequest`: 処理待ちのリクエスト

### ライフサイクル

```
1. コンポーネントマウント
   └─ useEffect: skillAPI.onPermission() でリスナー登録

2. Permission要求受信
   └─ setPendingPermission(request)
   └─ PermissionDialog表示

3. ユーザー操作
   ├─ 許可: handleApprove() → respondPermission({approved: true})
   └─ 拒否: handleDeny() → respondPermission({approved: false})

4. 応答送信後
   └─ setPendingPermission(null)
   └─ ダイアログ非表示

5. コンポーネントアンマウント
   └─ useEffect cleanup: リスナー解除
```

## SkillStreamDisplay コンポーネント

### ファイル

`apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

### Props

```typescript
interface SkillStreamDisplayProps {
  skillId: string;
  initialPrompt?: string;
  autoExecute?: boolean;
  onComplete?: () => void;
  onError?: (error: SkillExecutionError) => void;
  onStatusChange?: (status: string) => void;
  height?: string | number;
  className?: string;
}
```

### Permission統合部分

```tsx
function SkillStreamDisplay(props: SkillStreamDisplayProps) {
  // 既存の実行フック
  const { messages, status, execute, abort, reset, isAborting } =
    useSkillExecution(skillId);

  // 権限ダイアログ用フック（新規追加）
  const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();

  return (
    <div className="skill-stream-display">
      {/* 既存UI */}
      <div className="stream-header">...</div>
      <div className="stream-content">...</div>

      {/* 権限確認ダイアログ（新規追加） */}
      <PermissionDialog
        request={pendingPermission}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </div>
  );
}
```

## PermissionDialog コンポーネント

### ファイル（既存）

`apps/desktop/src/renderer/components/organisms/PermissionDialog/PermissionDialog.tsx`

### Props

```typescript
interface PermissionDialogProps {
  request: SkillPermissionRequest | null;
  onApprove: (rememberChoice: boolean) => void;
  onDeny: (rememberChoice: boolean) => void;
}
```

### 特徴

- **モーダル表示**: 背景オーバーレイ付き
- **フォーカストラップ**: ダイアログ内でTab循環
- **アクセシビリティ**: role="alertdialog", aria属性
- **Remember choice**: チェックボックス対応

## エラーハンドリング

### IPC通信エラー

```typescript
window.skillAPI
  ?.respondPermission({ ... })
  .catch((error: unknown) => {
    console.error("[useSkillPermission] Failed to respond:", error);
  });
```

- エラー時もUI状態はリセット
- コンソールにエラーログ出力
- ユーザー操作はブロックしない

### コンポーネントアンマウント

```typescript
useEffect(() => {
  if (!window.skillAPI?.onPermission) return;

  const cleanup = window.skillAPI.onPermission((request) => {
    setPendingPermission(request);
  });

  return cleanup; // アンマウント時にリスナー解除
}, []);
```

## テスト

| テストファイル                         | テスト数 | 内容                   |
| -------------------------------------- | -------- | ---------------------- |
| useSkillPermission.test.ts             | 17       | フック単体テスト       |
| SkillStreamDisplay.permission.test.tsx | 37       | 統合テスト             |
| SkillStreamDisplay.test.tsx            | 40       | 既存機能リグレッション |

## Date

2026-01-26
