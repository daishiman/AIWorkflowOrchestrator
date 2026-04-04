# テスト設計 - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 4

## テストファイル

| ファイル                                                                                            | 対象                      |
| --------------------------------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`                 | UI コンポーネントテスト   |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 統合回帰テスト            |
| `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`                                       | Main IPC ハンドラーテスト |

## AC → テストケース対応表

| AC   | テスト describe                       | テストケース数 |
| ---- | ------------------------------------- | -------------- |
| AC-1 | `AC-1: ApiKeySettingsPanel の描画`    | 4              |
| AC-2 | `AC-2: バリデーション`                | 3              |
| AC-3 | `AC-3: 保存状態の表示`                | 6              |
| AC-4 | `AC-4: 削除機能`                      | 4              |
| AC-5 | `AC-5: onStatusChange コールバック`   | 2              |
| AC-6 | 状態管理全体（AC-1〜AC-5 の状態遷移） | —              |

## Preload API Mock 設計

```ts
const mockAuthKey = {
  set: vi.fn(),
  exists: vi.fn(),
  validate: vi.fn(),
  delete: vi.fn(),
};

// デフォルト: キー未設定
mockAuthKey.exists.mockResolvedValue({ exists: false, source: "not-set" });
mockAuthKey.set.mockResolvedValue({ success: true });
mockAuthKey.validate.mockResolvedValue({ valid: true });
mockAuthKey.delete.mockResolvedValue({ success: true });

Object.defineProperty(window, "electronAPI", {
  value: { authKey: mockAuthKey },
  writable: true,
  configurable: true,
});
```
