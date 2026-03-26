# TASK-SC-07-OPEN-SETTINGS: API_KEY_ERROR 時の設定画面遷移実装

## メタ情報

| 項目     | 値                                                                   |
| -------- | -------------------------------------------------------------------- |
| タスクID | TASK-SC-07-OPEN-SETTINGS                                             |
| 検出元   | TASK-SC-07-STREAMING-PROGRESS-UI Phase 3 未実装検出                  |
| 優先度   | MEDIUM                                                               |
| 影響     | API_KEY_NOT_SET エラー時の「設定を開く」ボタンが機能しない（UX障害） |
| 検出日   | 2026-03-25                                                           |

## 概要

`GenerateStep` の `onOpenSettings` prop が `SkillCreateWizard` から未接続。`API_KEY_NOT_SET` エラー発生時に表示される「設定を開く」ボタンが機能せず、ユーザーが設定画面へ遷移できない。

## 現状

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
// GenerateStep に onOpenSettings が渡されていない
<GenerateStep
  onBack={handleBack}
  onComplete={handleComplete}
  // onOpenSettings={???}  // 未接続
/>
```

## 期待される修正

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
const handleOpenSettings = useCallback(() => {
  // 設定画面へのナビゲーション処理
  navigate('/settings');
}, [navigate]);

<GenerateStep
  onBack={handleBack}
  onComplete={handleComplete}
  onOpenSettings={handleOpenSettings} // 接続を追加
/>
```

## 完了条件

- [ ] `SkillCreateWizard` が `onOpenSettings` ハンドラを `GenerateStep` に渡している
- [ ] `API_KEY_NOT_SET` エラー時に「設定を開く」ボタンをクリックすると設定画面へ遷移する
- [ ] 既存テストが全て PASS する

## 関連

- 親タスク: TASK-SC-07-STREAMING-PROGRESS-UI
- 対象ファイル: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
