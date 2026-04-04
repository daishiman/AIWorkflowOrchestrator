# Phase 5: 実装 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-RT-04                |
| Phase      | 5 - 実装                  |
| 前提Phase  | Phase 4（テスト作成）完了 |
| 関連Issue  | #1881                     |
| ステータス | pending                   |

## 目的

`auth-key:*` 契約と `ApiKeySettingsPanel` を実装する。

## 実行タスク

- `packages/shared/src/types/skillCreator.ts` に `ApiKeyStatus` を追加する
- `apps/desktop/src/main/ipc/authKeyHandlers.ts` を実装・更新する
- `apps/desktop/src/preload/authKeyApi.ts` を実装・更新する
- `ApiKeySettingsPanel` と `SkillLifecyclePanel` を統合する
- `SettingsView` の主導線と補助導線を崩さない

## 参照資料

| 資料名              | パス                                                                 | 説明             |
| ------------------- | -------------------------------------------------------------------- | ---------------- |
| Phase 4 テスト作成  | [phase-04-test-creation.md](phase-04-test-creation.md)               | Red テスト       |
| Phase 2 設計        | [phase-02-design.md](phase-02-design.md)                             | 実装範囲         |
| authKeyHandlers     | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                       | Main IPC 正本    |
| authKeyApi          | `apps/desktop/src/preload/authKeyApi.ts`                             | Preload API 正本 |
| ApiKeySettingsPanel | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | UI 正本          |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 補助導線         |
| SettingsView        | `apps/desktop/src/renderer/views/SettingsView/index.tsx`             | 主導線           |

## 統合テスト連携

- Phase 4 の Red を Green に戻す
- `auth-key:*` の 4 層整合を維持する

## 成果物

| 成果物               | パス                                                               |
| -------------------- | ------------------------------------------------------------------ |
| 共有型定義           | packages/shared/src/types/skillCreator.ts                          |
| Main IPCハンドラ     | apps/desktop/src/main/ipc/authKeyHandlers.ts                       |
| Preload API          | apps/desktop/src/preload/authKeyApi.ts                             |
| UIコンポーネント     | apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx |
| 統合先コンポーネント | apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx |

## 完了条件

- [ ] `ApiKeyStatus` 型が追加されている
- [ ] preload API に `auth-key:*` メソッドが追加されている
- [ ] `ApiKeySettingsPanel` が実装されている
- [ ] `SkillLifecyclePanel` に統合されている
- [ ] Phase 4 のテストが Green になる
- [ ] 本Phase内の全タスクを100%実行完了
