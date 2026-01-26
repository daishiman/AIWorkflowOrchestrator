# コンポーネント統合設計書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 概要

SkillStreamDisplayコンポーネントにPermissionDialogを統合し、skillAPIからの権限リクエストを受信してユーザーに確認を求める機能を実装する。

---

## 2. コンポーネント構成

### 2.1 コンポーネント階層

```
SkillStreamDisplay
├── SkillStreamContent (既存)
└── PermissionDialog (既存コンポーネント再利用)
    ├── DialogTitle
    ├── ToolNameDisplay
    ├── ArgsDisplay
    ├── ReasonDisplay
    ├── RememberCheckbox
    └── ActionButtons (許可/拒否)
```

### 2.2 関連コンポーネント

| コンポーネント     | パス                                                                    | 役割               |
| ------------------ | ----------------------------------------------------------------------- | ------------------ |
| SkillStreamDisplay | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | スキル実行UI       |
| PermissionDialog   | `apps/desktop/src/renderer/components/organisms/PermissionDialog/`      | 権限確認ダイアログ |

---

## 3. 状態管理設計

### 3.1 設計方針

**既存agentSliceのpendingPermissionパターンを流用**

理由:

- 既にPermissionRequest型とアクションが定義済み
- PermissionDialogが使用する型と互換性がある
- 状態管理パターンの一貫性を維持

### 3.2 状態定義

```typescript
// agentSliceに追加または既存を流用
interface AgentExecutionState {
  // ... 既存の状態
  pendingPermission: PermissionRequest | null; // 既存
  rememberedChoices: Record<string, boolean>; // 既存
}
```

### 3.3 SkillPermissionRequest → PermissionRequest 変換

```typescript
/**
 * SkillPermissionRequest を PermissionDialog用の PermissionRequest に変換
 */
function convertToPermissionRequest(
  skillRequest: SkillPermissionRequest,
): PermissionRequest {
  return {
    requestId: skillRequest.requestId,
    toolName: skillRequest.toolName,
    args: skillRequest.args,
    reason: skillRequest.reason,
    // PermissionDialogで使用される形式に変換
  };
}
```

---

## 4. カスタムフック設計

### 4.1 useSkillPermission フック

```typescript
/**
 * スキル権限管理用カスタムフック
 *
 * skillAPIからの権限リクエスト受信と、
 * 応答送信を管理する。
 */
export function useSkillPermission() {
  const store = useStore();
  const { pendingPermission, setPermissionRequest, respondToPermission } =
    store.getAgentState();

  // 権限リクエストリスナー登録
  useEffect(() => {
    const cleanup = window.skillAPI.onPermission((request) => {
      // SkillPermissionRequest → PermissionRequest変換
      const permissionRequest = convertToPermissionRequest(request);
      setPermissionRequest(permissionRequest);
    });

    return cleanup;
  }, [setPermissionRequest]);

  /**
   * 許可応答を送信
   */
  const handleApprove = useCallback(
    async (rememberChoice: boolean) => {
      if (!pendingPermission) return;

      await window.skillAPI.respondPermission({
        requestId: pendingPermission.requestId,
        approved: true,
        rememberChoice,
      });

      if (rememberChoice) {
        store.rememberPermissionChoice(pendingPermission.toolName, true);
      }

      setPermissionRequest(null);
    },
    [pendingPermission, setPermissionRequest, store],
  );

  /**
   * 拒否応答を送信
   */
  const handleDeny = useCallback(
    async (rememberChoice: boolean) => {
      if (!pendingPermission) return;

      await window.skillAPI.respondPermission({
        requestId: pendingPermission.requestId,
        approved: false,
        rememberChoice,
      });

      if (rememberChoice) {
        store.rememberPermissionChoice(pendingPermission.toolName, false);
      }

      setPermissionRequest(null);
    },
    [pendingPermission, setPermissionRequest, store],
  );

  return {
    pendingPermission,
    handleApprove,
    handleDeny,
  };
}
```

---

## 5. SkillStreamDisplay 統合設計

### 5.1 コンポーネント実装

```typescript
import { PermissionDialog } from "../organisms/PermissionDialog/PermissionDialog";
import { useSkillPermission } from "../../hooks/useSkillPermission";

export const SkillStreamDisplay: React.FC<SkillStreamDisplayProps> = ({
  // ... existing props
}) => {
  const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();

  return (
    <div className="skill-stream-display">
      {/* 既存のストリーム表示コンテンツ */}
      <SkillStreamContent {...contentProps} />

      {/* 権限確認ダイアログ */}
      <PermissionDialog
        request={pendingPermission}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </div>
  );
};
```

### 5.2 Props定義（変更なし）

既存のSkillStreamDisplayPropsに変更は不要。
権限管理はuseSkillPermissionフック内で完結する。

---

## 6. フォーカス管理設計

### 6.1 ダイアログ表示時

```typescript
// PermissionDialog内の既存実装を活用
useEffect(() => {
  if (!request || !dialogRef.current) return;

  const focusableElements = dialogRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0] as HTMLElement;

  // 最初の要素（拒否ボタン）にフォーカス
  firstElement?.focus();
}, [request]);
```

### 6.2 ダイアログ閉じる時

```typescript
// 応答送信後、pendingPermissionがnullになりダイアログが非表示
// フォーカスは自然に元の位置に戻る（特別な処理不要）
```

### 6.3 フォーカストラップ

既存PermissionDialog実装のフォーカストラップをそのまま活用:

```typescript
// PermissionDialog.tsx 既存実装
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
};
```

---

## 7. エラーハンドリング設計

### 7.1 IPC通信エラー

```typescript
const handleApprove = useCallback(
  async (rememberChoice: boolean) => {
    if (!pendingPermission) return;

    try {
      await window.skillAPI.respondPermission({
        requestId: pendingPermission.requestId,
        approved: true,
        rememberChoice,
      });
    } catch (error) {
      console.error("[SkillPermission] Failed to send approval:", error);
      // エラー時もダイアログを閉じる（Main側でタイムアウト処理される）
    } finally {
      setPermissionRequest(null);
    }
  },
  [pendingPermission, setPermissionRequest],
);
```

### 7.2 コンポーネントアンマウント時

```typescript
useEffect(() => {
  const cleanup = window.skillAPI.onPermission((request) => {
    setPermissionRequest(convertToPermissionRequest(request));
  });

  return () => {
    // クリーンアップ時にリスナー解除
    cleanup();

    // 保留中のリクエストがあれば自動拒否
    // （Main側でタイムアウト処理されるため、ここでは何もしない）
  };
}, [setPermissionRequest]);
```

---

## 8. ライフサイクル設計

### 8.1 コンポーネントマウント時

1. `useSkillPermission`フックが初期化される
2. `skillAPI.onPermission()`でリスナーが登録される
3. `pendingPermission`はnullで初期化される

### 8.2 権限リクエスト受信時

1. `onPermission`コールバックが呼ばれる
2. `SkillPermissionRequest`が`PermissionRequest`に変換される
3. `setPermissionRequest()`で状態更新
4. `PermissionDialog`が表示される

### 8.3 ユーザー応答時

1. 許可/拒否ボタンがクリックされる
2. `handleApprove`または`handleDeny`が呼ばれる
3. `skillAPI.respondPermission()`でIPC送信
4. `setPermissionRequest(null)`で状態クリア
5. `PermissionDialog`が非表示になる

### 8.4 コンポーネントアンマウント時

1. useEffectのクリーンアップ関数が実行される
2. `skillAPI.onPermission()`のリスナーが解除される

---

## 9. テスト設計

### 9.1 ユニットテスト対象

| テスト対象                 | テスト内容                            |
| -------------------------- | ------------------------------------- |
| useSkillPermission         | リスナー登録/解除、状態更新、応答送信 |
| SkillStreamDisplay         | PermissionDialog表示/非表示           |
| convertToPermissionRequest | 型変換の正確性                        |

### 9.2 テストシナリオ

```typescript
describe("SkillStreamDisplay Permission Integration", () => {
  it("権限リクエスト受信時にダイアログが表示される", async () => {
    render(<SkillStreamDisplay />);

    // 権限リクエストをシミュレート
    const mockRequest: SkillPermissionRequest = {
      requestId: "req-1",
      executionId: "exec-1",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };

    act(() => {
      mockOnPermissionCallback(mockRequest);
    });

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Bash")).toBeInTheDocument();
  });

  it("許可ボタンクリックで応答が送信される", async () => {
    // ... テスト実装
  });

  it("拒否ボタンクリックで応答が送信される", async () => {
    // ... テスト実装
  });
});
```

---

## 10. 統合テスト観点

### 10.1 E2Eテストシナリオ

| シナリオ                           | 検証内容                           |
| ---------------------------------- | ---------------------------------- |
| スキル実行 → 権限リクエスト → 許可 | 全フローが正常に動作する           |
| スキル実行 → 権限リクエスト → 拒否 | 拒否後にスキル実行が中断される     |
| 記憶チェック → 次回自動判定        | 記憶した選択が次回に反映される     |
| ダイアログ表示中のキーボード操作   | Tab、Enter、Escapeが正常に動作する |

### 10.2 アクセシビリティテスト

- フォーカストラップが動作することを確認
- スクリーンリーダーでダイアログが認識されることを確認
- キーボードのみで操作できることを確認

---

## 11. 関連ファイル

| ファイル                                                                | 役割                   |
| ----------------------------------------------------------------------- | ---------------------- |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 統合対象コンポーネント |
| `apps/desktop/src/renderer/components/organisms/PermissionDialog/`      | 再利用ダイアログ       |
| `apps/desktop/src/renderer/hooks/useSkillPermission.ts`                 | 新規カスタムフック     |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                  | 状態管理               |
