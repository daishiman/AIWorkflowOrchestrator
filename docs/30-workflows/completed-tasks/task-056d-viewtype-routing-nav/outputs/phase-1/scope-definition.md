# Phase 1 スコープ定義（SubAgent-A）

## 対象

- `apps/desktop/src/renderer/navigation/navContract.ts` 新規
- `apps/desktop/src/renderer/App.tsx` へのショートカット導入
- `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` の契約参照化
- ナビ関連テスト追加・更新

## 対象外

- GlobalNavStrip 本体実装（`TASK-UI-02`）
- IPCチャネル追加・Main/Preload変更
- AppDock廃止（Phase 13以降タスク）

## 依存関係

- `store/types.ts` の `ViewType` を正本として再利用
- 参照仕様: `ui-ux-navigation.md`, `arch-state-management.md`, `task-057-ui-02-global-nav-core.md`
