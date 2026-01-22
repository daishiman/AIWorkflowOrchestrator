# タスク仕様書: 検索結果ファイル間ナビゲーション

## メタ情報

```yaml
issue_number: 437
```

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-SEARCH-FILE-NAV-001            |
| 作成日     | 2026-01-22                          |
| 優先度     | 低                                  |
| 見積サイズ | M                                   |
| 前提タスク | TASK-SEARCH-INTEGRATE-001（完了済） |
| 関連仕様書 | ui-ux-search-panel.md               |
| ステータス | 未着手                              |
| 発生元     | Phase 12 未タスク検出               |

---

## 1. Why（なぜこのタスクが必要か）

### 1.1 背景

TASK-SEARCH-INTEGRATE-001 で実装されたワークスペース検索は、プロジェクト全体からテキストを検索し、
結果一覧をクリックすることで該当ファイル・行にジャンプできる。
しかし、現在の実装では検索結果間をキーボードで連続的に移動する機能がない。

### 1.2 問題

- 複数ファイルに跨る検索結果を確認する際、毎回マウスクリックが必要
- コードレビューや大規模リファクタリング時に効率が低下
- VS Codeなど他のエディタで標準的に提供されている機能が不足

### 1.3 期待される効果

- キーボード操作のみで検索結果間を移動可能
- コードレビュー・リファクタリングの効率向上
- 他のエディタと同等のUX提供

---

## 2. What（何を達成するか）

### 2.1 機能要件

| ID     | 要件                                               | 優先度 |
| ------ | -------------------------------------------------- | ------ |
| REQ-01 | F3/Shift+F3 で次/前の検索結果へ移動                | 必須   |
| REQ-02 | ファイル境界を跨いで連続的に移動                   | 必須   |
| REQ-03 | 現在位置インジケーター（例: 3/15）を表示           | 推奨   |
| REQ-04 | 結果リストで現在のマッチをハイライト               | 推奨   |
| REQ-05 | ファイル自動オープン（未オープンファイルへ移動時） | 推奨   |

### 2.2 非機能要件

| ID     | 要件                                    |
| ------ | --------------------------------------- |
| NFR-01 | ファイル間移動は300ms以内に完了         |
| NFR-02 | 大量の検索結果（1000件以上）でも動作    |
| NFR-03 | アクセシビリティ準拠（WCAG 2.1 AA）     |
| NFR-04 | 既存のテストカバレッジを維持（97%以上） |

### 2.3 成功基準

- [ ] F3キーで次の検索結果へ移動できる
- [ ] Shift+F3で前の検索結果へ移動できる
- [ ] ファイル間を跨いで移動できる
- [ ] 現在位置が視覚的に分かる
- [ ] 既存テストが全てPASS
- [ ] 新規機能のテストカバレッジ90%以上

---

## 3. How（どのように実現するか）

### 3.1 技術アプローチ

```
useWorkspaceSearch.ts
  └── 追加: currentResultIndex: number 状態
  └── 追加: goToNextResult() / goToPrevResult() アクション
  └── 追加: flattenedResults: FlatSearchResult[] 算出

WorkspaceSearchPanel.tsx
  └── 追加: 現在位置インジケーター
  └── 追加: 現在結果のハイライト

useSearchKeyboardShortcuts.ts
  └── 追加: F3 / Shift+F3 ハンドラー

EditorView/index.tsx
  └── 追加: ファイル自動オープン連携
```

### 3.2 影響範囲

| コンポーネント                  | 変更内容                 |
| ------------------------------- | ------------------------ |
| `useWorkspaceSearch.ts`         | 結果インデックス管理追加 |
| `WorkspaceSearchPanel.tsx`      | 位置インジケーター追加   |
| `useSearchKeyboardShortcuts.ts` | F3/Shift+F3 対応         |
| `EditorView/index.tsx`          | ファイルオープン連携     |

### 3.3 データ構造

```typescript
interface FlatSearchResult {
  fileIndex: number;
  matchIndex: number;
  filePath: string;
  line: number;
  column: number;
  preview: string;
}

interface WorkspaceSearchState {
  results: WorkspaceSearchResult[];
  flattenedResults: FlatSearchResult[];
  currentResultIndex: number;
  totalResults: number;
}
```

### 3.4 ショートカット定義

| ショートカット | 動作                     |
| -------------- | ------------------------ |
| F3             | 次の検索結果へ移動       |
| Shift+F3       | 前の検索結果へ移動       |
| Cmd/Ctrl+G     | 指定番号の結果へジャンプ |

---

## 4. Phase定義

### Phase 1: 要件定義

- 成果物: 詳細要件書、ショートカット仕様
- 完了条件: ナビゲーション仕様の確定

### Phase 2: 設計

- 成果物: コンポーネント設計、状態管理設計
- 完了条件: レビュー完了

### Phase 3: 実装

- 成果物: ナビゲーション機能
- 完了条件: 実装完了、テストPASS

### Phase 4: テスト

- 成果物: テストケース、結果レポート
- 完了条件: カバレッジ90%以上

---

## 5. 参考情報

### 5.1 関連ファイル

- `apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts`
- `apps/desktop/src/features/search/components/WorkspaceSearchPanel.tsx`
- `apps/desktop/src/renderer/views/EditorView/hooks/useSearchKeyboardShortcuts.ts`
- `apps/desktop/src/renderer/views/EditorView/index.tsx`

### 5.2 参照仕様

- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`
- `docs/30-workflows/search-panel-integration/outputs/phase-12/unassigned-task-detection.md`

### 5.3 UIモックアップ（案）

```
┌────────────────────────────────────────────────────┐
│ 🔍 ワークスペース検索: "handler"    [3/15] ◀ ▶   │
├────────────────────────────────────────────────────┤
│ 📁 src/utils/handler.ts                            │
│   → 12: export function handler() {                │
│   → 45: const eventHandler = () => {}              │
│ 📁 src/components/Button.tsx                       │
│   ● 78: onClick={handleClick}  ← 現在位置         │
│ 📁 src/api/routes.ts                               │
│   → 23: app.get('/api', handler)                   │
└────────────────────────────────────────────────────┘
```

### 5.4 VS Codeとの比較

| 機能                   | VS Code | 本実装（現在） | 本タスク後 |
| ---------------------- | ------- | -------------- | ---------- |
| F3で次の結果           | ✓       | ✗              | ✓          |
| Shift+F3で前の結果     | ✓       | ✗              | ✓          |
| ファイル跨ぎナビ       | ✓       | ✗              | ✓          |
| 結果位置インジケーター | ✓       | ✗              | ✓          |
