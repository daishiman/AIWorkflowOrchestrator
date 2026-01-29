# TASK-7A SkillSelector 要件定義書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 1          |
| 作成日 | 2026-01-30 |

## 機能要件（FR）

| FR-ID | 要件                                                           | 優先度 |
| ----- | -------------------------------------------------------------- | ------ |
| FR-01 | ドロップダウンUIでスキル一覧を表示できる                       | 高     |
| FR-02 | 「なし」オプションでスキル選択を解除できる                     | 高     |
| FR-03 | インポート済みスキルをセクション表示し選択できる               | 高     |
| FR-04 | 利用可能（未インポート）スキルをセクション表示する             | 高     |
| FR-05 | 選択中スキルがトリガーボタンに表示される                       | 高     |
| FR-06 | 「再スキャン」ボタンで利用可能スキルを再取得できる             | 中     |
| FR-07 | 各スキルオプションにサブエージェント数・参照資料数が表示される | 中     |
| FR-08 | スキル説明文がtruncateで表示される                             | 低     |

## 非機能要件（NFR）

| NFR-ID | 要件                                                              | 優先度 |
| ------ | ----------------------------------------------------------------- | ------ |
| NFR-01 | WAI-ARIA Listbox パターンに準拠したアクセシビリティ               | 高     |
| NFR-02 | キーボードナビゲーション（Enter/Space/Escape/Arrow/Home/End）対応 | 高     |
| NFR-03 | 外側クリックでドロップダウンが閉じる                              | 高     |
| NFR-04 | ダークモード対応（Tailwind `dark:` プレフィックス）               | 中     |
| NFR-05 | ドロップダウン開閉アニメーション（200ms ease-out）                | 低     |
| NFR-06 | ModelSelector と一貫した操作感                                    | 中     |
| NFR-07 | TypeScript 厳密型定義                                             | 高     |

## SkillSlice連携要件

| 状態/アクション     | 型                               | 用途                     |
| ------------------- | -------------------------------- | ------------------------ |
| `availableSkills`   | `SkillMetadata[]`                | 利用可能スキル一覧表示   |
| `importedSkills`    | `ImportedSkill[]`                | インポート済みスキル表示 |
| `selectedSkillName` | `string \| null`                 | 現在選択中のスキル名     |
| `isLoadingSkills`   | `boolean`                        | ローディング表示         |
| `isScanning`        | `boolean`                        | スキャン中表示           |
| `selectSkill`       | `(name: string \| null) => void` | スキル選択アクション     |
| `rescanSkills`      | `() => Promise<void>`            | 再スキャンアクション     |

接続方式: `useSkillStore()` セレクターフック経由（`useAppStore` ラッパー）

## 影響範囲

### 新規作成ファイル

| ファイル                                                                      | 内容                 |
| ----------------------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                | メインコンポーネント |
| `apps/desktop/src/renderer/components/skill/index.ts`                         | barrel export        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | コンポーネントテスト |

### 影響を受けるシステム

| システム      | 影響内容                                    |
| ------------- | ------------------------------------------- |
| SkillSlice    | 読み取り専用で参照（変更なし）              |
| ModelSelector | 影響なし（パターン参照のみ）                |
| チャットUI    | TASK-7Dで統合（本タスクでは単体テストのみ） |
