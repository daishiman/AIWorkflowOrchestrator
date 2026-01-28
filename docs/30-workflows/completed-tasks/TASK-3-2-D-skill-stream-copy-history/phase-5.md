# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | TASK-3-2-D-skill-stream-copy-history |
| 作成日 | 2026-01-28                           |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。

## 実行タスク

- CopyHistoryContext 実装: Context とProvider の実装
- useCopyHistory Hook 実装: Hook の実装
- CopyHistoryPanel 実装: UIコンポーネントの実装
- CopyButton 連携: 既存CopyButtonからの履歴追加機能統合

## 参照資料

| 資料名         | パス                                                                                 | 説明          |
| -------------- | ------------------------------------------------------------------------------------ | ------------- |
| 設計書         | `outputs/phase-2/component-design.md`                                                | Phase 2成果物 |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                              | Phase 4成果物 |
| Context テスト | `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`           | Phase 4成果物 |
| Panel テスト   | `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                            | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| UI/UX機能コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様 |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-types.md`         | 型定義                 |

## 実行手順

### ステップ1: CopyHistoryContext 実装

#### ファイル作成

`apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`

#### 実装内容

1. **型定義**
   - `CopyHistoryEntry`: 履歴エントリの型
   - `CopyHistoryContextValue`: Context の値の型

2. **Context作成**
   - `CopyHistoryContext`: React.createContext で作成
   - デフォルト値は undefined（Provider 外使用時のエラー検出用）

3. **Provider実装**
   - `CopyHistoryProvider`: 状態管理とメソッド提供
   - `useState` で `history` と `selectedIds` を管理

4. **メソッド実装**
   - `addToHistory`: 先頭追加、50件上限チェック
   - `removeFromHistory`: ID指定削除
   - `clearHistory`: 全削除
   - `copyFromHistory`: Clipboard API呼び出し
   - `copySelectedItems`: 選択項目結合コピー
   - `toggleSelection` / `clearSelection`: 選択状態管理

### ステップ2: useCopyHistory Hook 実装

#### ファイル作成

`apps/desktop/src/renderer/hooks/useCopyHistory.ts`

#### 実装内容

```typescript
export function useCopyHistory(): CopyHistoryContextValue {
  const context = useContext(CopyHistoryContext);
  if (!context) {
    throw new Error("useCopyHistory must be used within CopyHistoryProvider");
  }
  return context;
}
```

### ステップ3: CopyHistoryPanel 実装

#### ファイル作成

`apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx`

#### 実装内容

1. **コンポーネント構造**
   - ヘッダー: タイトル、件数、閉じるボタン
   - 履歴リスト: 各項目をマップ表示
   - アクションバー: 選択コピー、クリアボタン

2. **履歴項目（CopyHistoryItem）**
   - チェックボックス: 複数選択用
   - プレビューテキスト: 100文字省略
   - 再コピーボタン: 個別コピー

3. **アクセシビリティ**
   - `role="dialog"`, `aria-label`
   - `role="listbox"`, `role="option"`
   - キーボードハンドラー（Tab/Enter/Escape/Space）

### ステップ4: CopyButton 連携

#### 既存ファイル更新

`apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

#### 更新内容

1. **CopyButton のonCopy拡張**
   - コピー成功時に `addToHistory` を呼び出し
   - `sourceMessageId` を渡す

2. **CopyHistoryToggle 追加**
   - 履歴アイコンボタン
   - クリックで CopyHistoryPanel 表示

3. **ポップオーバー管理**
   - `isHistoryOpen` state
   - パネル表示/非表示切り替え

## 統合テスト連携【必須】

フロント連携の実装とテスト支援コード整備:

| 実装項目           | 内容                                                     |
| ------------------ | -------------------------------------------------------- |
| Context連携        | CopyHistoryProvider を AgentView または App レベルに配置 |
| CopyButton連携     | コピー成功時に addToHistory 呼び出し                     |
| エラーハンドリング | Clipboard API失敗時の console.error 出力                 |
| 状態同期           | Context 更新による即時UI反映                             |

## アーキテクチャ層別実装（Electronデスクトップアプリ観点）

| 層               | 実装観点                         | 実装ファイル配置             | 仕様参照先                  |
| ---------------- | -------------------------------- | ---------------------------- | --------------------------- |
| Renderer Process | Context、Hooks、UIコンポーネント | `apps/desktop/src/renderer/` | ui-ux-feature-components.md |

## 成果物

| 成果物              | パス                                                                    | 説明        |
| ------------------- | ----------------------------------------------------------------------- | ----------- |
| CopyHistoryContext  | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`             | Context実装 |
| useCopyHistory Hook | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`                     | Hook実装    |
| CopyHistoryPanel    | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx`   | Panel実装   |
| 更新済みSkillStream | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 連携統合    |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] CopyHistoryContext が実装されている
- [ ] useCopyHistory Hook が実装されている
- [ ] CopyHistoryPanel が実装されている
- [ ] CopyButton から履歴追加が動作する
- [ ] 50件上限が機能している
- [ ] アクセシビリティ要件が満たされている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. CopyHistoryContext の実装
3. useCopyHistory Hook の実装
4. CopyHistoryPanel の実装
5. CopyButton 連携の実装
6. テスト実行と Green 確認
7. 完了条件の検証

## 次のPhase

Phase 6: テスト拡充
