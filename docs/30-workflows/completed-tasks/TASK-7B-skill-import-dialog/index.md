# TASK-7B: SkillImportDialog コンポーネント

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-7B                                               |
| タスク名     | SkillImportDialog コンポーネント                      |
| 分類         | 新規機能                                              |
| 対象機能     | スキルインポート確認ダイアログ                        |
| 優先度       | 高                                                    |
| 見積もり規模 | 中規模                                                |
| ステータス   | 未実施                                                |
| 依存タスク   | TASK-6-1（SkillSlice）                                |
| 並列タスク   | TASK-7A（SkillSelector）, TASK-7C（PermissionDialog） |
| ブロック先   | TASK-7D（ChatPanel統合）                              |
| Issue番号    | -                                                     |
| 作成日       | 2026-01-30                                            |

---

## 1. 概要

### 1.1 目的

スキルの詳細情報（名前、説明、許可ツール、サブリソース一覧）を表示し、ユーザーがインポートを確認するためのダイアログコンポーネントを実装する。

### 1.2 背景

スキルインポートエージェントシステム（Phase 7）のUI層として、スキル一覧からスキルを選択した後に詳細確認とインポート実行を行うダイアログが必要。TASK-6-1で実装されたSkillSlice（Zustand）を活用し、インポート処理の状態管理と連携する。

### 1.3 問題点・課題

| ID  | 課題                               | 現状                                                        |
| --- | ---------------------------------- | ----------------------------------------------------------- |
| C1  | スキル詳細確認UIが存在しない       | スキルの内容を確認せずにインポートすることになる            |
| C2  | インポート操作のフィードバックなし | ユーザーがインポート進行状況を把握できない                  |
| C3  | スキル構成の可視性が低い           | agents/references/scripts等のサブリソースが事前確認できない |

---

## 2. 最終ゴール

| 達成項目             | 達成状態                                             |
| -------------------- | ---------------------------------------------------- |
| ダイアログ開閉       | isOpen/onCloseで制御される                           |
| スキル基本情報表示   | 名前・説明が表示される                               |
| 許可ツール一覧表示   | allowedToolsがタグ形式で表示される                   |
| サブリソース一覧表示 | agents/references/scripts/assets/schemas/indexes表示 |
| インポートボタン機能 | importSkillアクションを呼び出す                      |
| ローディング状態表示 | インポート中の視覚的フィードバック                   |
| キャンセル機能       | インポート中でもキャンセル可能                       |
| ESCキー対応          | ESCキーでダイアログを閉じる                          |
| アクセシビリティ対応 | WCAG 2.1 AA準拠                                      |

---

## 3. スコープ

### 3.1 含むもの

- SkillImportDialogコンポーネント実装
- Section/ResourceList内部コンポーネント
- SkillSlice（useAppStore）との連携
- アクセシビリティ対応（role, aria属性, フォーカストラップ, ESCキー）
- コンポーネントテスト
- skill/index.tsへのエクスポート追加

### 3.2 含まないもの

- スキル一覧画面（TASK-7Aで実装）
- 権限確認ダイアログ（TASK-7Cで実装）
- ChatPanelとの統合（TASK-7Dで実装）
- スキルの削除・編集機能
- ダークモード対応（将来タスク）

---

## 4. 成果物一覧

| 成果物                | パス                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| SkillImportDialog本体 | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                |
| index.tsエクスポート  | `apps/desktop/src/renderer/components/skill/index.ts`                             |
| コンポーネントテスト  | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` |

---

## 5. Phase構成

| Phase | 名称               | 概要                                  |
| ----- | ------------------ | ------------------------------------- |
| 1     | 要件定義           | ダイアログ要件の確定                  |
| 2     | 設計               | コンポーネント設計・UI設計            |
| 3     | 設計レビューゲート | 設計妥当性検証                        |
| 4     | テスト作成         | コンポーネントテスト作成（TDD: Red）  |
| 5     | 実装               | ダイアログコンポーネント実装（Green） |
| 6     | テスト拡充         | カバレッジ拡充                        |
| 7     | カバレッジ確認     | テストカバレッジ維持確認              |
| 8     | リファクタリング   | コード品質改善                        |
| 9     | 品質保証           | 品質ゲートクリア確認                  |
| 10    | 最終レビューゲート | 全体的な品質・整合性検証              |
| 11    | 手動テスト         | ダイアログ操作の動作確認              |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新                |
| 13    | PR作成             | PR作成・CI確認                        |

---

## 6. 依存関係

### 6.1 前提条件

- TASK-6-1（SkillSlice）が完了していること
- `SkillMetadata`/`SkillSubResource`型が`@repo/shared`で定義済み
- `useAppStore`のskill関連アクション（importSkill, isImporting, importingSkillName）が利用可能

### 6.2 依存タスク

| タスクID | タスク名               | ステータス |
| -------- | ---------------------- | ---------- |
| TASK-6-1 | SkillSlice（状態管理） | 完了       |
| TASK-1-1 | 型定義                 | 完了       |

---

## 7. 技術要件

### 7.1 必要な知識

| 技術領域   | 必要な知識                                |
| ---------- | ----------------------------------------- |
| React      | FC, useState, useEffect, useRef           |
| TypeScript | ジェネリクス, インターフェース            |
| Zustand    | useAppStore, スライス連携                 |
| Tailwind   | ユーティリティクラス, レスポンシブ        |
| Testing    | Vitest, @testing-library/react, モック    |
| A11y       | WCAG 2.1 AA, aria属性, フォーカストラップ |

### 7.2 推奨アプローチ

1. **コンポーネント構造**: 3つのサブコンポーネント（Section, ResourceList, メイン）
2. **状態管理**: useAppStoreからimportSkill/isImporting/importingSkillNameを取得
3. **アクセシビリティ**: PermissionDialog/RestoreDialogのパターンを踏襲
4. **段階的開示**: Apple HIG準拠のProgressive Disclosure（specification.md 4.3）

---

## 8. 完了条件チェックリスト

### 8.1 機能要件

- [ ] ダイアログが開閉する
- [ ] スキル基本情報（名前、説明）が表示される
- [ ] 許可ツール一覧が表示される
- [ ] agents/一覧が表示される
- [ ] references/一覧が表示される
- [ ] scripts/一覧が表示される
- [ ] assets/一覧が表示される
- [ ] schemas/一覧が表示される
- [ ] indexes/一覧が表示される
- [ ] インポートボタンが機能する
- [ ] ローディング状態が表示される
- [ ] キャンセルボタンが機能する
- [ ] ESCキーでダイアログが閉じる

### 8.2 品質要件

- [ ] コンポーネントテストが全て通過する
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+）

### 8.3 アクセシビリティ要件

- [ ] `role="dialog"`, `aria-modal="true"`設定
- [ ] `aria-labelledby`でタイトルとの関連付け
- [ ] フォーカストラップ実装
- [ ] キーボードナビゲーション（Tab/Shift+Tab/Escape）
- [ ] 閉じるボタンにaria-label設定

---

## 9. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                               |
| ------------------------ | ------ | -------- | ---------------------------------- |
| SkillSlice APIの不一致   | 中     | 低       | TASK-6-1の実装を事前に確認         |
| SkillMetadata型の変更    | 中     | 低       | @repo/sharedの型定義を参照         |
| フォーカストラップの実装 | 低     | 中       | 既存PermissionDialogパターンを踏襲 |
| インポート中のエラー処理 | 中     | 中       | SkillSliceのskillErrorを利用       |

---

## 10. 参照情報

### 10.1 関連ドキュメント

| ドキュメント            | パス                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| タスク定義              | `docs/30-workflows/skill-import-agent-system/tasks/task-7b-skill-import-dialog.md` |
| UI/UX仕様（4.3）        | `docs/30-workflows/skill-import-agent-system/specification.md`                     |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`            |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`       |
| Electronセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`       |

### 10.2 既存コンポーネント参照

| コンポーネント   | パス                                                               |
| ---------------- | ------------------------------------------------------------------ |
| PermissionDialog | `apps/desktop/src/renderer/components/organisms/PermissionDialog/` |
| RestoreDialog    | `apps/desktop/src/renderer/components/history/RestoreDialog.tsx`   |
| SkillSlice       | `apps/desktop/src/renderer/store/slices/skillSlice.ts`             |
| SkillMetadata型  | `packages/shared/src/types/skill.ts`                               |
