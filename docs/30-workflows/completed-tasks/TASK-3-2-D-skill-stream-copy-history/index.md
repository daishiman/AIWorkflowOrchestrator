# TASK-3-2-D: SkillStreamDisplay コピー履歴機能

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-3-2-D                                  |
| タスク名     | SkillStreamDisplay コピー履歴機能           |
| 分類         | 改善                                        |
| 対象機能     | SkillStreamDisplay CopyButtonコンポーネント |
| 優先度       | 低                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | Phase 8（TASK-3-2-A リファクタリング）      |
| 発見日       | 2026-01-27                                  |
| 親タスク     | TASK-3-2-A SkillStreamDisplay UX改善        |
| Issue番号    | #530                                        |
| 作成日       | 2026-01-28                                  |

---

## 1. 概要

### 1.1 目的

CopyButtonコンポーネントにコピー履歴機能を追加し、過去にコピーした内容の参照・再利用を可能にする。

### 1.2 背景

TASK-3-2-AでCopyButtonコンポーネントを実装し、メッセージのワンクリックコピー機能を追加した。現在、コピー操作は単発で実行され、過去にコピーした内容の履歴は保持されない。

### 1.3 問題点・課題

| ID  | 課題                           | 現状                                                     |
| --- | ------------------------------ | -------------------------------------------------------- |
| C1  | コピー履歴なし                 | 過去にコピーした内容を参照できない                       |
| C2  | 複数メッセージの一括コピー不可 | 1メッセージずつしかコピーできない                        |
| C3  | コピー内容の再利用困難         | 同じ内容を再度コピーするには元メッセージを探す必要がある |

---

## 2. 最終ゴール

| 達成項目           | 達成状態                                 |
| ------------------ | ---------------------------------------- |
| コピー履歴表示     | 過去にコピーした内容一覧が表示できる     |
| 履歴からの再コピー | 履歴項目をクリックして再度コピーできる   |
| 複数選択コピー     | 複数メッセージを選択して一括コピーできる |
| 履歴クリア         | 履歴を手動でクリアできる                 |

---

## 3. スコープ

### 3.1 含むもの

- コピー履歴パネルコンポーネント（CopyHistoryPanel）
- コピー履歴Context（CopyHistoryContext）
- 履歴管理Hook（useCopyHistory）
- 履歴状態管理（セッション内、最大50件）
- 複数選択UIの実装
- 関連ユニットテストの追加

### 3.2 含まないもの

- 履歴の永続化（localStorageなど）
- 履歴の検索・フィルタリング機能
- 履歴の自動期限切れ
- 履歴のエクスポート機能

---

## 4. 成果物一覧

| 成果物              | パス                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| CopyHistoryContext  | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`                          |
| useCopyHistory Hook | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`                                  |
| CopyHistoryPanel    | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx`                |
| 改善済みCopyButton  | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`（既存更新）  |
| 追加テスト          | `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx` |
| Context テスト      | `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`           |
| Hook テスト         | `apps/desktop/src/renderer/hooks/__tests__/useCopyHistory.test.ts`                   |

---

## 5. Phase構成

| Phase | 名称               | 概要                       |
| ----- | ------------------ | -------------------------- |
| 1     | 要件定義           | 履歴機能仕様の確定         |
| 2     | 設計               | UI/状態管理設計            |
| 3     | 設計レビューゲート | 設計妥当性検証             |
| 4     | テスト作成         | コピー履歴テストケース作成 |
| 5     | 実装               | コピー履歴機能実装         |
| 6     | テスト拡充         | 統合テスト・E2Eテスト追加  |
| 7     | カバレッジ確認     | テストカバレッジ維持確認   |
| 8     | リファクタリング   | コード品質改善             |
| 9     | 品質保証           | 品質ゲートクリア確認       |
| 10    | 最終レビューゲート | 全体的な品質・整合性検証   |
| 11    | 手動テスト         | 履歴操作動作確認           |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新     |
| 13    | PR作成             | PR作成・CI確認             |

---

## 6. 依存関係

### 6.1 前提条件

- TASK-3-2-Aが完了していること
- CopyButtonコンポーネントが正常に動作していること
- 既存テストが全てPASSしていること

### 6.2 依存タスク

| タスクID   | タスク名                  | ステータス |
| ---------- | ------------------------- | ---------- |
| TASK-3-2-A | SkillStreamDisplay UX改善 | 完了       |

---

## 7. 技術要件

### 7.1 必要な知識

| 技術領域   | 必要な知識                        |
| ---------- | --------------------------------- |
| React      | useState、useContext、Context API |
| TypeScript | ジェネリクス、ユニオン型          |
| CSS        | ポップオーバー、ドロップダウンUI  |
| Testing    | Context Provider モック           |

### 7.2 推奨アプローチ

1. **状態管理設計**
   - `CopyHistoryContext` でアプリ全体の履歴を管理
   - 最大履歴件数: 50件

2. **UI設計**
   - CopyButtonの近くに履歴アイコンを配置
   - クリックでポップオーバーパネル表示
   - 履歴項目はプレビュー（最初の100文字）表示

3. **複数選択UI**
   - チェックボックスで複数選択
   - 「選択したアイテムをコピー」ボタン

---

## 8. 完了条件チェックリスト

### 8.1 機能要件

- [ ] C1: コピー履歴パネルが表示される
- [ ] C2: 履歴項目をクリックで再コピーできる
- [ ] C3: 複数メッセージを選択して一括コピーできる
- [ ] C4: 履歴をクリアできる
- [ ] C5: 最大50件まで履歴が保持される

### 8.2 品質要件

- [ ] 既存テストが全てPASS
- [ ] 履歴機能関連テストが追加されている
- [ ] カバレッジが100%を維持
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### 8.3 アクセシビリティ要件

- [ ] 履歴パネルにaria-label設定
- [ ] キーボードで履歴操作可能（Tab/Enter/Escape）
- [ ] スクリーンリーダー対応

### 8.4 ドキュメント要件

- [ ] コピー履歴機能仕様がドキュメント化されている
- [ ] 実装ガイド（Part 1/Part 2）が作成されている

---

## 9. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                       |
| -------------------------- | ------ | -------- | -------------------------- |
| メモリ使用量増加           | 低     | 中       | 履歴件数上限の設定（50件） |
| UI複雑化                   | 中     | 中       | シンプルなポップオーバーUI |
| 既存CopyButton動作への影響 | 低     | 低       | 既存機能を維持しつつ拡張   |

---

## 10. 参照情報

### 10.1 関連ドキュメント

| ドキュメント            | パス                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| TASK-3-2-A実装ガイド    | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      |
| 未タスク仕様書（元）    | `docs/30-workflows/unassigned-task/task-skill-stream-copy-history.md`                                |

### 10.2 参考資料

| 資料名              | URL/パス                                                   |
| ------------------- | ---------------------------------------------------------- |
| React Context       | https://react.dev/reference/react/useContext               |
| Headless UI Popover | https://headlessui.com/react/popover                       |
| Clipboard API       | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard |

---

## 11. 備考

### 11.1 発見元

```
TASK-3-2-A Phase 8 Refactoring Report - Future Improvement Candidates:
- コピー履歴機能: 優先度低、機能拡張として記録
```

### 11.2 補足事項

- この改善は任意タスクであり、他の優先タスクがある場合は後回しにしてよい
- 履歴の永続化（localStorage）は別タスクとして検討
- 将来的にグローバルなコピー履歴（アプリ全体）への拡張を検討
