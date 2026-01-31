# 未タスク指示書: PermissionDialog 詳細展開デフォルト状態変更

## メタ情報

```yaml
issue_number: 608
```

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | task-ref-permission-default-collapsed-001         |
| タスク名     | PermissionDialog 詳細展開デフォルト状態変更       |
| 分類         | リファクタリング                                  |
| 対象機能     | PermissionDialog（Desktop）                       |
| 優先度       | 低                                                |
| 見積もり規模 | 小規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 10レビュー（MINOR指摘）, Phase 11手動テスト |
| 発見日       | 2026-01-30                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-readable-ui-001の設計仕様では、詳細セクションのデフォルト状態は「折りたたみ」（isDetailExpanded = false）とされていた。しかし、実装時に既存テスト（PermissionDialog.test.tsx）がformatArgs出力を直接参照しており、折りたたみ状態では出力が非表示になりテストが失敗する問題が発生した。後方互換性を優先して「展開」（isDetailExpanded = true）デフォルトを採用した。

### 1.2 問題点・課題

| 課題                       | 詳細                                                     |
| -------------------------- | -------------------------------------------------------- |
| 仕様と実装の乖離           | 設計仕様では折りたたみデフォルトだが展開デフォルトで実装 |
| 情報過多の初期表示         | 展開デフォルトではUI上の情報量が多い                     |
| Progressive Disclosure未達 | 段階的情報開示の原則から外れている                       |

### 1.3 放置した場合の影響

| 影響カテゴリ | 影響内容                             | 重要度 |
| ------------ | ------------------------------------ | ------ |
| UX品質       | 初期表示の情報量が多く認知負荷が高い | 低     |
| 設計整合性   | 仕様書と実装の不一致が残る           | 低     |

---

## 2. 何を達成するか（What）

### 2.1 目的

詳細セクションのデフォルト状態を仕様通り「折りたたみ」に変更し、既存テストも更新する。

### 2.2 最終ゴール

- [ ] isDetailExpandedのデフォルト値がfalseに変更される
- [ ] 既存テスト（PermissionDialog.test.tsx）のformatArgs参照部分が更新される
- [ ] 全テストがPASSする
- [ ] Progressive Disclosure原則に準拠

### 2.3 スコープ

**含まれるもの**:

- useState(true)→useState(false)への変更
- PermissionDialog.test.tsxのformatArgs参照テストの修正
- PermissionDialog.readable.test.tsxの確認

**含まれないもの**:

- 設定画面でのデフォルト状態カスタマイズ（task-imp-permission-customize-001で対応）
- UIデザインの変更

### 2.4 成果物

| 成果物               | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| 修正後コンポーネント | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                |
| 修正後テスト         | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] task-imp-permission-readable-ui-001が完了していること

### 3.2 依存タスク

| タスクID                            | 内容                           | ステータス |
| ----------------------------------- | ------------------------------ | ---------- |
| task-imp-permission-readable-ui-001 | PermissionDialog人間可読UI改善 | 完了       |

### 3.3 必要な知識

- React/TypeScript
- Vitest / Testing Library

### 3.4 推奨アプローチ

1. PermissionDialog.tsxの`useState(true)`を`useState(false)`に変更
2. PermissionDialog.test.tsxのformatArgs出力を参照するテストを修正（展開操作を追加）
3. PermissionDialog.readable.test.tsxの関連テストを確認・修正
4. 全テスト実行で確認

---

## 4. 実行手順

### Phase 1: 影響範囲調査

**目的**: 変更による影響を把握

**手順**:

1. PermissionDialog.tsxのisDetailExpanded使用箇所を確認
2. テストファイルでformatArgs出力を参照している箇所をリストアップ
3. 修正計画を策定

**成果物**: 影響範囲リスト

**完了条件**:

- [ ] 影響範囲が特定されている

### Phase 2: 実装・テスト修正

**目的**: デフォルト状態の変更とテスト更新

**手順**:

1. PermissionDialog.tsx: `useState(true)` → `useState(false)`
2. PermissionDialog.test.tsx: formatArgs出力参照テストに展開操作を追加
3. PermissionDialog.readable.test.tsx: デフォルト折りたたみ確認テストを追加

**成果物**: 修正後のソースとテスト

**完了条件**:

- [ ] デフォルトが折りたたみ状態
- [ ] 全テストPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] デフォルトで詳細セクションが折りたたまれている
- [ ] 展開ボタンクリックで詳細が表示される
- [ ] 展開/折りたたみがキーボード操作可能

### 品質要件

- [ ] 全テストPASS
- [ ] TypeScriptエラー0件
- [ ] ESLintエラー0件
- [ ] Line Coverage 80%以上維持

### ドキュメント要件

- [ ] 実装ガイドのデフォルト状態に関する記述を更新

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                   | 期待結果                             |
| ------ | ---------------------------- | ------------------------------------ |
| TC-001 | 初期表示で詳細が折りたたみ   | 詳細セクションが非表示               |
| TC-002 | 展開ボタンクリックで詳細表示 | 詳細セクションが表示される           |
| TC-003 | 既存テストのformatArgs参照   | 展開操作後にformatArgs出力が確認可能 |

### 検証手順

テスト実行: `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog`

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                       |
| ------------------ | ------ | -------- | -------------------------- |
| 既存テスト大量修正 | 中     | 中       | 影響範囲を事前に調査       |
| ユーザー混乱       | 低     | 低       | リリースノートで変更を周知 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| 人間可読UI実装ガイド | `docs/30-workflows/task-imp-permission-readable-ui-001/outputs/phase-12/implementation-guide.md`      |
| Phase 10レビュー結果 | `docs/30-workflows/task-imp-permission-readable-ui-001/outputs/phase-10/final-review-report.md`       |
| 未タスク検出レポート | `docs/30-workflows/task-imp-permission-readable-ui-001/outputs/phase-12/unassigned-task-detection.md` |

---

## 9. 備考

- Phase 10レビューのMINOR指摘からの引継ぎ
- task-imp-permission-customize-001の設定機能と併せて実施すると効率的
- 既存テストの修正量は事前調査で把握すること
