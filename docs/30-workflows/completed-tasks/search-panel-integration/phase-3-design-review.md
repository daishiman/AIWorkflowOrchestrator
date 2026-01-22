# Phase 3: 設計レビューゲート - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| フェーズ   | Phase 3                                            |
| 名称       | 設計レビューゲート                                 |
| 目的       | 要件・設計の妥当性検証、Phase 5 実装との整合性確認 |
| 前提Phase  | Phase 2: 設計                                      |
| 次Phase    | Phase 4: テスト作成                                |
| ステータス | 未実施                                             |

---

## 目的

Phase 1 の要件定義と Phase 2 の設計が妥当であること、および Phase 5 で実装済みのコンポーネントとの整合性を検証する。

---

## 実行タスク

### Task 1: 要件-設計 整合性レビュー

**目的**: 要件が設計に正しく反映されていることを確認する

**実行内容**:

1. 機能要件の設計反映確認

| 機能要件                         | 設計での実現方法               | 判定 |
| -------------------------------- | ------------------------------ | ---- |
| Cmd+F で SearchPanel を開く      | useSearchKeyboardShortcuts     | [ ]  |
| 検索クエリでマッチをハイライト   | EditorInstance.setHighlights() | [ ]  |
| 次へ/前へナビゲーション          | SearchPanel 内部実装           | [ ]  |
| 置換機能                         | EditorInstance.replaceText()   | [ ]  |
| Cmd+Shift+F でワークスペース検索 | useSearchKeyboardShortcuts     | [ ]  |

2. 非機能要件の設計反映確認

| 非機能要件           | 設計での対応           | 判定 |
| -------------------- | ---------------------- | ---- |
| デバウンス 150-300ms | Phase 5 実装で対応済み | [ ]  |
| WCAG 2.1 AA 準拠     | Phase 5 実装で対応済み | [ ]  |
| テスト 94 件維持     | 統合テスト追加で確認   | [ ]  |

**完了条件**:

- [ ] 全ての要件が設計に反映されている
- [ ] 要件-設計トレーサビリティマトリクスが作成されている

### Task 2: Phase 5 実装との整合性確認

**目的**: 設計が Phase 5 で実装されたコンポーネントと整合することを確認する

**実行内容**:

1. SearchPanel コンポーネントのインターフェース確認

```typescript
// Phase 5 実装の SearchPanel props
interface SearchPanelProps {
  editorRef: RefObject<EditorInstance>;
  showReplace?: boolean;
  onClose?: () => void;
}
```

2. WorkspaceSearchPanel コンポーネントのインターフェース確認

```typescript
// Phase 5 実装の WorkspaceSearchPanel props
interface WorkspaceSearchPanelProps {
  searchProvider: WorkspaceSearchProvider;
  showReplace?: boolean;
  onClose?: () => void;
}
```

3. 型定義の整合性確認
   - EditorInstance インターフェース
   - SearchMatch 型
   - WorkspaceSearchProvider 型

**完了条件**:

- [ ] Phase 5 実装のインターフェースと設計が整合している
- [ ] 型定義の差異がないことが確認されている

### Task 3: 統合テスト観点のレビュー

**目的**: 統合テストで検証すべき観点を確認する

**実行内容**:

1. 統合テストカテゴリの確認

| カテゴリ           | 検証内容                                 | 対応設計 |
| ------------------ | ---------------------------------------- | -------- |
| API接続テスト      | SearchPanel と EditorInstance の接続     | [ ]      |
| データフローテスト | 検索クエリ → マッチ → ハイライト の流れ  | [ ]      |
| エラーハンドリング | 検索エラー時の UI 表示                   | [ ]      |
| 状態同期テスト     | EditorView 状態と SearchPanel 状態の同期 | [ ]      |

2. テストシナリオの確認
   - 正常系シナリオ
   - 異常系シナリオ
   - エッジケース

**完了条件**:

- [ ] 統合テスト観点が網羅されている
- [ ] テストシナリオ一覧が作成されている

### Task 4: 設計レビュー判定

**目的**: 設計が実装に進める状態であることを判定する

**実行内容**:

1. レビュー判定基準

| 判定基準                         | 状態 | 重要度   |
| -------------------------------- | ---- | -------- |
| 要件が設計に正しく反映されている | [ ]  | CRITICAL |
| Phase 5 実装との整合性が確認済み | [ ]  | CRITICAL |
| 統合テスト観点が網羅されている   | [ ]  | MAJOR    |
| 設計文書が完全である             | [ ]  | MAJOR    |

2. 判定結果

| 判定     | 条件                             | 次アクション     |
| -------- | -------------------------------- | ---------------- |
| PASS     | CRITICAL 全て OK、MAJOR 90% 以上 | Phase 4 へ進む   |
| MINOR    | CRITICAL 全て OK、MAJOR 70-90%   | 軽微な修正後継続 |
| MAJOR    | CRITICAL に 1 件以上の問題       | Phase 2 へ戻る   |
| CRITICAL | 要件レベルの問題                 | Phase 1 へ戻る   |

**完了条件**:

- [ ] レビュー判定が完了している
- [ ] 判定結果が `outputs/phase-3/review-result.md` に記録されている

---

## 参照資料

### Phase 1 成果物

| 参照資料               | パス                                             |
| ---------------------- | ------------------------------------------------ |
| 機能要件定義書         | `outputs/phase-1/functional-requirements.md`     |
| 非機能要件定義書       | `outputs/phase-1/non-functional-requirements.md` |
| 受入基準チェックリスト | `outputs/phase-1/acceptance-criteria.md`         |

### Phase 2 成果物

| 参照資料             | パス                                               |
| -------------------- | -------------------------------------------------- |
| アダプター設計書     | `outputs/phase-2/adapter-design.md`                |
| フック設計書         | `outputs/phase-2/hooks-design.md`                  |
| EditorView統合設計書 | `outputs/phase-2/editorview-integration-design.md` |

### Phase 5 実装

| 参照資料             | パス                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| SearchPanel          | `apps/desktop/src/features/search/components/SearchPanel.tsx`          |
| WorkspaceSearchPanel | `apps/desktop/src/features/search/components/WorkspaceSearchPanel.tsx` |
| 型定義               | `apps/desktop/src/features/search/types.ts`                            |

---

## 成果物

| 成果物                    | パス                                          |
| ------------------------- | --------------------------------------------- |
| 要件-設計トレーサビリティ | `outputs/phase-3/traceability-matrix.md`      |
| Phase 5 整合性確認結果    | `outputs/phase-3/phase5-compatibility.md`     |
| 統合テスト観点一覧        | `outputs/phase-3/integration-test-aspects.md` |
| レビュー判定結果          | `outputs/phase-3/review-result.md`            |

---

## 完了条件

- [ ] 要件-設計の整合性が確認されている
- [ ] Phase 5 実装との整合性が確認されている
- [ ] 統合テスト観点が明確化されている
- [ ] レビュー判定が PASS または MINOR である

---

## 次のPhaseへの引き継ぎ

Phase 4（テスト作成）では、本Phaseで確認した設計に基づいて:

- TDD Red: 統合テストを先に作成
- Phase 5 実装のテストとの整合性確認
- 統合テストシナリオの実装
