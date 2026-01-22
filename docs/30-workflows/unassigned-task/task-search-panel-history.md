# タスク仕様書: 検索パネル検索履歴機能

## メタ情報

```yaml
issue_number: 436
```

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-SEARCH-HISTORY-001             |
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

TASK-SEARCH-INTEGRATE-001 で実装された検索パネルは、ファイル内検索とワークスペース検索をサポートしている。
現在の実装では、検索クエリは入力のたびにリセットされ、過去の検索履歴は保持されない。

### 1.2 問題

- 同じ検索クエリを繰り返し入力する必要がある
- プロジェクト横断的なデバッグ時に効率が低下
- 複雑な正規表現パターンを毎回入力し直す必要がある

### 1.3 期待される効果

- 検索作業の効率向上
- よく使うパターンへの素早いアクセス
- ユーザー体験の向上

---

## 2. What（何を達成するか）

### 2.1 機能要件

| ID     | 要件                                   | 優先度 |
| ------ | -------------------------------------- | ------ |
| REQ-01 | 過去の検索クエリを最大20件保存         | 必須   |
| REQ-02 | 検索入力欄でドロップダウンから履歴選択 | 必須   |
| REQ-03 | 履歴のクリア機能                       | 推奨   |
| REQ-04 | 履歴の永続化（localStorageまたはDB）   | 推奨   |
| REQ-05 | 重複クエリの排除（最新を上位に）       | 推奨   |

### 2.2 非機能要件

| ID     | 要件                                    |
| ------ | --------------------------------------- |
| NFR-01 | 履歴アクセスは100ms以内に完了           |
| NFR-02 | キーボードナビゲーション対応（↑↓キー）  |
| NFR-03 | アクセシビリティ準拠（WCAG 2.1 AA）     |
| NFR-04 | 既存のテストカバレッジを維持（97%以上） |

### 2.3 成功基準

- [ ] 検索実行後に履歴が自動保存される
- [ ] 履歴から過去のクエリを選択して検索できる
- [ ] キーボード操作で履歴にアクセスできる
- [ ] 既存テストが全てPASS
- [ ] 新規機能のテストカバレッジ90%以上

---

## 3. How（どのように実現するか）

### 3.1 技術アプローチ

```
useSearchStore.ts
  └── 追加: searchHistory: string[] 状態
  └── 追加: addToHistory(query: string) アクション
  └── 追加: clearHistory() アクション

SearchPanel.tsx
  └── 追加: 履歴ドロップダウンコンポーネント
  └── 追加: キーボードナビゲーション

localStorage / IndexedDB
  └── 履歴の永続化
```

### 3.2 影響範囲

| コンポーネント              | 変更内容                 |
| --------------------------- | ------------------------ |
| `useSearchStore.ts`         | 履歴状態・アクション追加 |
| `SearchPanel.tsx`           | 履歴ドロップダウンUI     |
| `SearchHistoryDropdown.tsx` | 新規コンポーネント       |
| `useSearchHistory.ts`       | 新規フック（永続化）     |

### 3.3 データ構造

```typescript
interface SearchHistoryEntry {
  query: string;
  timestamp: number;
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    regex: boolean;
  };
}

interface SearchHistoryStore {
  entries: SearchHistoryEntry[];
  maxEntries: number; // デフォルト: 20
}
```

---

## 4. Phase定義

### Phase 1: 要件定義

- 成果物: 詳細要件書、UI仕様
- 完了条件: 履歴機能の仕様確定

### Phase 2: 設計

- 成果物: コンポーネント設計、データ構造設計
- 完了条件: レビュー完了

### Phase 3: 実装

- 成果物: 履歴機能、永続化機能
- 完了条件: 実装完了、テストPASS

### Phase 4: テスト

- 成果物: テストケース、結果レポート
- 完了条件: カバレッジ90%以上

---

## 5. 参考情報

### 5.1 関連ファイル

- `apps/desktop/src/features/search/stores/useSearchStore.ts`
- `apps/desktop/src/features/search/components/SearchPanel.tsx`

### 5.2 参照仕様

- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`
- `docs/30-workflows/search-panel-integration/outputs/phase-12/unassigned-task-detection.md`

### 5.3 UIモックアップ（案）

```
┌───────────────────────────────────────────┐
│ 🔍 [検索クエリ                     ▼]   │
│     ├─────────────────────────────────┤   │
│     │ 最近の検索                      │   │
│     │ ─────────────────────────────── │   │
│     │ function.*handler               │   │
│     │ TODO                            │   │
│     │ import.*from                    │   │
│     │ ─────────────────────────────── │   │
│     │ 🗑️ 履歴をクリア                │   │
│     └─────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

### 5.4 キーボード操作

| キー   | 動作                       |
| ------ | -------------------------- |
| ↓      | 履歴ドロップダウンを開く   |
| ↑/↓    | 履歴項目間を移動           |
| Enter  | 選択した履歴を適用して検索 |
| Escape | ドロップダウンを閉じる     |
