# [#361] [TASK-SEARCH-INTEGRATE-001] Phase 5 検索パネル実装の EditorView 統合

## メタ情報

```yaml
task_id: TASK-SEARCH-INTEGRATE-001
task_name: Phase 5 検索パネル実装の EditorView 統合
category: 改善
target_feature: 検索・置換機能
priority: 高
scale: 中規模
status: 完了
source_phase: Phase 10 ドキュメント更新
created_date: 2026-01-05
dependencies: []
spec_path: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/docs/30-workflows/unassigned-task/task-search-panel-integration.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 完了   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 5で TDD 手法を用いて高品質な検索・置換 UI コンポーネントを実装した：

- `apps/desktop/src/features/search/components/SearchPanel.tsx`
- `apps/desktop/src/features/search/components/WorkspaceSearchPanel.tsx`
- `apps/desktop/src/features/search/stores/useSearchStore.ts`
- `apps/desktop/src/features/search/hooks/useSearchKeyboardShortcuts.ts`

しかし、これらは EditorView に統合されておらず、実際には使用されていない状態。
現在 EditorView で使用されているのは既存の `UnifiedSearchPanel`（organisms/SearchPanel/）。

### 1.2 問題点・課題

| 観点               | 既存実装（UnifiedSearchPanel） | Phase 5 実装             |
| ------------------ | ------------------------------ | ------------------------ |
| テストカバレッジ   | 不明                           | 71.23%（94テスト合格）   |
| TypeScript型安全性 | 不明                           | エラー0件                |
| WCAG 2.1 AA準拠    | 不明                           | 完全準拠（11テスト合格） |
| ESLint警告         | 不明                           | 0件                      |
| 統合状態           | EditorView統合済み             | 未統合                   |

### 1.3 放置した場合の影響

- Phase 5 で投入した開発コストが無駄になる
- 高品質なテスト済みコードが活用されない
- 既存実装のアクセシビリティ状態が不明のまま

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 5 で作成した高品質な検索パネルコンポーネントを EditorView に統合し、
実際にユーザーが使用できる状態にする。

### 2.2 最終ゴール

- `Cmd+F` / `Ctrl+F` で Phase 5 の SearchPanel が開く
- `Cmd+Shift+F` / `Ctrl+Shift+F` で Phase 5 の WorkspaceSearchPanel が開く
- 検索・置換・ナビゲーション機能が正常動作する
- 既存のテスト（94件）が全て合格する
- WCAG 2.1 AA 準拠が維持される

### 2.3 スコープ

#### 含むもの

- EditorView への SearchPanel/WorkspaceSearchPanel 統合
- TextArea と SearchPanel の連携実装（EditorInstance アダプター）
- キーボードショートカットの接続
- 既存テストの維持・追加

#### 含まないもの

- 既存 UnifiedSearchPanel の削除（将来のクリーンアップタスク）
- 新機能の追加
- バックエンド変更

### 2.4 成果物

| 成果物                   | パス                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| 更新された EditorView    | `apps/desktop/src/renderer/views/EditorView/index.tsx`                            |
| EditorInstanceアダプター | `apps/desktop/src/features/search/adapters/EditorAdapter.ts`                      |
| 統合テスト（追加）       | `apps/desktop/src/features/search/__tests__/integration/`                         |
| 実装ログ                 | `docs/30-workflows/search-replace-ui-implementation/outputs/phase-5-integration/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 5 実装が完了していること（✅ 完了済み）
- テストが全て合格していること（✅ 94テスト合格）
- WCAG 2.1 AA 準拠が確認されていること（✅ 確認済み）

### 3.2 依存タスク

- TASK-SEARCH-REPLACE-001（バックエンド）: ✅ 完了済み
- Phase 5 実装: ✅ 完了済み

### 3.3 必要な知識・スキル

- React コンポーネント設計
- TypeScript 型システム
- Electron IPC 通信
- アダプターパターン

### 3.4 推奨アプローチ

**アダプターパターン**を採用：

1. `EditorInstance` インターフェースに準拠したアダプターを作成
2. 既存の `TextArea` をラップして必要なメソッドを提供
3. SearchPanel に注入して統合

```
┌─────────────────────────────────────────────────────┐
│ EditorView                                          │
│ ┌─────────────────┐   ┌─────────────────────┐      │
│ │ SearchPanel     │◀──│ EditorAdapter       │      │
│ │ (Phase 5)       │   │ (新規作成)          │      │
│ └─────────────────┘   └──────────┬──────────┘      │
│                                  │                  │
│                       ┌──────────▼──────────┐      │
│                       │ TextArea (既存)     │      │
│                       └─────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                          |
| ----- | ---------------- | ----------------------------- |
| 1     | アダプター作成   | EditorInstance アダプター実装 |
| 2     | EditorView更新   | SearchPanel 統合              |
| 3     | テスト・品質確認 | 既存テスト + 統合テスト       |
| 4     | ドキュメント更新 | 実装ログ作成                  |

### Phase 1: アダプター作成

#### 目的

TextArea を EditorInstance インターフェースに適合させる

#### 成果物

- `apps/desktop/src/features/search/adapters/EditorAdapter.ts`

#### 完了条件

- [x] EditorInstance インターフェースの全メソッドが実装されている
- [x] TypeScript 型エラーがない

### Phase 2: EditorView更新

#### 目的

EditorView で Phase 5 の SearchPanel を使用する

#### 成果物

- 更新された `apps/desktop/src/renderer/views/EditorView/index.tsx`

#### 完了条件

- [x] SearchPanel が EditorView で表示される
- [x] キーボードショートカットが機能する
- [x] 検索・置換が正常動作する

### Phase 3: テスト・品質確認

#### 目的

品質基準を満たすことを確認

#### 完了条件

- [x] 既存テスト 94 件が全て合格
- [x] ESLint 警告 0 件
- [x] TypeScript エラー 0 件
- [ ] 実機で動作確認（Phase 9で実施予定）

### Phase 4: ドキュメント更新

#### 目的

実装内容を記録

#### 成果物

- 実装ログ（`outputs/phase-5-integration/integration-log.md`）

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] `Cmd+F` / `Ctrl+F` で SearchPanel が開く
- [x] `Cmd+Shift+F` / `Ctrl+Shift+F` で WorkspaceSearchPanel が開く
- [x] 検索クエリ入力で結果がハイライト表示される
- [x] 次へ/前へナビゲーションが機能する
- [x] 置換/全置換が機能する
- [x] `Escape` でパネルが閉じる

### 品質要件

- [x] テスト 94 件全合格
- [x] ESLint 警告 0 件
- [x] TypeScript エラー 0 件
- [x] WCAG 2.1 AA 準拠維持

### ドキュメント要件

- [x] 実装ログが作成されている
- [x] artifacts.json が更新されている

---

## 6. 検証方法

### テストケース

| #   | テストケース            | 期待結果                 |
| --- | ----------------------- | ------------------------ |
| 1   | Cmd+F を押す            | SearchPanel が表示される |
| 2   | 検索クエリを入力        | マッチがハイライトされる |
| 3   | Enter を押す            | 次のマッチに移動         |
| 4   | Shift+Enter を押す      | 前のマッチに移動         |
| 5   | 置換テキスト入力 → 置換 | 現在のマッチが置換される |
| 6   | 全置換ボタン            | 全マッチが置換される     |
| 7   | Escape を押す           | パネルが閉じる           |

### 検証手順

```bash
# 1. ユニットテスト実行
pnpm --filter @repo/desktop test:run

# 2. TypeScript 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# 3. ESLint
pnpm --filter @repo/desktop lint

# 4. 実機確認
pnpm --filter @repo/desktop dev
```

---

## 7. リスクと対策

| リスク              | 影響度 | 発生確率 | 対策                           |
| ------------------- | ------ | -------- | ------------------------------ |
| TextArea API が不足 | 中     | 中       | アダプターで補完実装           |
| 既存テストが失敗    | 高     | 低       | 段階的に統合、問題を即座に修正 |
| パフォーマンス低下  | 中     | 低       | デバウンス処理を維持           |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                 | パス                                                   |
| ---------------------- | ------------------------------------------------------ |
| Phase 5 実装ログ       | `outputs/phase-5/implementation-log.md`                |
| 実装ガイド             | `outputs/phase-10/implementation-guide.md`             |
| Phase 5 コンポーネント | `apps/desktop/src/features/search/`                    |
| 既存 EditorView        | `apps/desktop/src/renderer/views/EditorView/index.tsx` |

### 参考資料

- React アダプターパターン
- WCAG 2.1 ガイドライン

---

## 9. 備考

### 既存実装との関係

Phase 5 実装の統合後も、既存の `UnifiedSearchPanel`（organisms/SearchPanel/）は残存する。
将来のクリーンアップタスクで削除を検討する。

### 補足事項

- この統合により、検索機能の品質が向上する（テスト済み、WCAG準拠）
- アダプターパターンにより、将来のエディタ変更にも柔軟に対応可能
