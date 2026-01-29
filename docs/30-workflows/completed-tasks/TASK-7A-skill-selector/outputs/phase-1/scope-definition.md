# TASK-7A SkillSelector スコープ定義

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 1          |
| 作成日 | 2026-01-30 |

## スコープ内

- `SkillSelector` メインコンポーネント
- `SkillOption` サブコンポーネント（インポート済みスキル用）
- `SkillOptionUnimported` サブコンポーネント（未インポートスキル用）
- ドロップダウン開閉ロジック
- 外側クリック検知
- キーボードナビゲーション（Enter, Space, Escape, ArrowUp/Down, Home, End, Tab）
- ARIA属性（`aria-haspopup`, `aria-expanded`, `role="listbox"`, `role="option"`, `aria-selected`）
- 「再スキャン」ボタン
- コンポーネントテスト（13テストケース以上）
- barrel export（`index.ts`）

## スコープ外

- インポートダイアログ（TASK-7B で実装）
- SkillStreamDisplay（TASK-7C で実装）
- スキル実行UI統合（TASK-7D で実装）
- Main Process / IPC通信の変更
- SkillSlice の変更（TASK-6-1 で実装済み）
- i18n対応（将来タスク）

## アーキテクチャ層

| 層                         | 対象                                               |
| -------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | Reactコンポーネント、Zustand状態管理連携、ARIA属性 |
| Main Process               | 対象外（SkillSlice経由で間接的にIPC使用）          |
| IPC                        | 対象外（本コンポーネントは直接使用しない）         |

## 統合ポイント

| 統合先        | 契約                                                             |
| ------------- | ---------------------------------------------------------------- |
| Zustand Store | `useSkillStore()` でskillSliceの状態・アクションを取得           |
| selectSkill   | `(name: string \| null) => void` で即座に状態が更新される        |
| rescanSkills  | `() => Promise<void>` で `isScanning` が true→false に遷移       |
| TASK-7D統合   | `SkillSelector` をインポートしてチャットツールバーに配置（将来） |
