# スコープ定義書

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-3-2-D                        |
| 機能名     | SkillStreamDisplay コピー履歴機能 |
| Phase      | 1                                 |
| 作成日     | 2026-01-28                        |
| ステータス | 確定                              |

---

## 1. スコープ概要

### 1.1 目的

CopyButtonコンポーネントにコピー履歴機能を追加し、ユーザーが過去にコピーした内容を参照・再利用できるようにする。

### 1.2 背景

TASK-3-2-AでCopyButtonコンポーネントを実装し、メッセージのワンクリックコピー機能を追加した。しかし、現在は単発のコピー操作のみで、過去にコピーした内容の履歴は保持されない。これにより、同じ内容を再度コピーする際には元のメッセージを探す必要がある。

---

## 2. スコープに含むもの（In Scope）

### 2.1 新規作成コンポーネント

| コンポーネント     | パス                                                                  | 責務                     |
| ------------------ | --------------------------------------------------------------------- | ------------------------ |
| CopyHistoryContext | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`           | 履歴状態のグローバル管理 |
| useCopyHistory     | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`                   | 履歴操作のカスタムフック |
| CopyHistoryPanel   | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` | 履歴表示パネルUI         |

### 2.2 既存コンポーネント更新

| コンポーネント     | パス                                                                    | 更新内容                 |
| ------------------ | ----------------------------------------------------------------------- | ------------------------ |
| SkillStreamDisplay | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 履歴アイコン・パネル統合 |
| CopyButton（内部） | 同上                                                                    | Context連携追加          |

### 2.3 テストファイル

| テストファイル              | パス                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| CopyHistoryPanel.test.tsx   | `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx` |
| CopyHistoryContext.test.tsx | `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`           |
| useCopyHistory.test.ts      | `apps/desktop/src/renderer/hooks/__tests__/useCopyHistory.test.ts`                   |

### 2.4 機能スコープ

| 機能                   | 詳細                                       |
| ---------------------- | ------------------------------------------ |
| コピー履歴パネル表示   | ポップオーバー形式で履歴一覧を表示         |
| 履歴項目からの再コピー | クリックで再度クリップボードにコピー       |
| 複数選択一括コピー     | チェックボックス選択後、結合コピー         |
| 履歴クリア             | 全履歴を手動で削除                         |
| 履歴件数管理           | 最大50件、FIFO方式で古いものを自動削除     |
| プレビュー表示         | 最初の100文字を表示、超過分は「...」で省略 |

---

## 3. スコープに含まないもの（Out of Scope）

### 3.1 明示的な除外項目

| 除外項目                     | 理由                                       |
| ---------------------------- | ------------------------------------------ |
| 履歴の永続化（localStorage） | 複雑度増加、将来タスクとして分離           |
| 履歴の検索・フィルタリング   | 50件の履歴では不要、将来拡張時に検討       |
| 履歴の自動期限切れ           | セッション内のみの保持で十分               |
| 履歴のエクスポート機能       | ユースケースが限定的、将来タスクとして分離 |
| Main Process連携             | Rendererのみで完結する機能のため不要       |
| IPC通信                      | 同上                                       |

### 3.2 将来タスク候補

| 候補機能         | 優先度 | 備考                                   |
| ---------------- | ------ | -------------------------------------- |
| 履歴永続化       | 低     | localStorageまたはelectron-storeを使用 |
| 履歴検索         | 低     | 件数が増えた場合に検討                 |
| グローバル履歴   | 低     | アプリ全体での履歴共有                 |
| 履歴エクスポート | 低     | JSONまたはテキスト形式でエクスポート   |

---

## 4. 依存関係

### 4.1 前提条件

| 条件                 | 状態   | 備考               |
| -------------------- | ------ | ------------------ |
| TASK-3-2-Aが完了     | 完了   | CopyButton実装済み |
| CopyButtonが正常動作 | 確認済 | 既存テストPASS     |
| 既存テストが全てPASS | 確認要 | CI実行で確認       |

### 4.2 技術依存

| 依存技術          | バージョン | 用途                 |
| ----------------- | ---------- | -------------------- |
| React             | 18.x       | Context API、Hooks   |
| TypeScript        | 5.x        | 型定義               |
| Tailwind CSS      | 3.x        | スタイリング         |
| Vitest            | 2.x        | ユニットテスト       |
| React Testing Lib | 14.x       | コンポーネントテスト |

---

## 5. 成果物一覧

### 5.1 ソースコード

| 成果物             | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| CopyHistoryContext | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`             |
| useCopyHistory     | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`                     |
| CopyHistoryPanel   | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx`   |
| SkillStreamDisplay | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |

### 5.2 テストコード

| 成果物                      | パス                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| CopyHistoryPanel.test.tsx   | `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx` |
| CopyHistoryContext.test.tsx | `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`           |
| useCopyHistory.test.ts      | `apps/desktop/src/renderer/hooks/__tests__/useCopyHistory.test.ts`                   |

### 5.3 ドキュメント

| 成果物         | パス                                         |
| -------------- | -------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準書 | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        |

---

## 6. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                             |
| -------------------------- | ------ | -------- | -------------------------------- |
| メモリ使用量増加           | 低     | 中       | 履歴件数上限50件の設定           |
| UI複雑化                   | 中     | 中       | シンプルなポップオーバーUIを採用 |
| 既存CopyButton動作への影響 | 低     | 低       | 既存機能を維持しつつ拡張         |
| Context再レンダリング      | 中     | 中       | useCallback/useMemoで最適化      |

---

## 7. タイムライン（Phase構成）

| Phase | 名称               | 主な作業               |
| ----- | ------------------ | ---------------------- |
| 1     | 要件定義           | 本ドキュメント作成     |
| 2     | 設計               | UI/状態管理設計        |
| 3     | 設計レビューゲート | 設計妥当性検証         |
| 4     | テスト作成         | テストケース作成       |
| 5     | 実装               | コンポーネント実装     |
| 6     | テスト拡充         | 統合テスト追加         |
| 7     | カバレッジ確認     | カバレッジ100%維持確認 |
| 8     | リファクタリング   | コード品質改善         |
| 9     | 品質保証           | 品質ゲートクリア       |
| 10    | 最終レビューゲート | 全体品質検証           |
| 11    | 手動テスト         | 動作確認               |
| 12    | ドキュメント更新   | 実装ガイド作成         |
| 13    | PR作成             | PR作成・CI確認         |

---

## 8. 承認

| 項目         | 状態   |
| ------------ | ------ |
| 要件確定     | 確定   |
| スコープ確定 | 確定   |
| 依存関係確認 | 確認済 |
