# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| Phase名    | リファクタリング                      |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 7: カバレッジ確認               |
| 次Phase    | Phase 9: 品質保証                     |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

不要コードの除去、統合後に残った冗長なコードの整理、共有コンポーネントのインターフェース最適化を行う。

## 実行タスク

### Task 1: 不要コード除去

- **統合の場合**: ConversationPanel のファイルが完全に不要であれば削除する
  - ConversationPanel 本体ファイルの削除（統合済みの場合）
  - ConversationPanel 固有のスタイルファイルの削除
  - ConversationPanel 固有のテストファイルの削除（統合先テストに移行済み）
- **ルート追加の場合**: session IPC の不要部分を整理する
- デモ HTML の残存参照がないことを最終確認する

### Task 2: import パスの整理

- 統合/移動に伴い変更された import パスが全て更新されていることを確認する
- 未使用の import がないことを確認する
- barrel export（index.ts）が整理されていることを確認する

### Task 3: 共有コンポーネントインターフェース最適化

- QuestionCard 等の Props 型が最小限かつ必要十分であることを確認する
- Optional Props が適切にデフォルト値を持つことを確認する
- コンポーネントの命名が統一されていることを確認する

### Task 4: IPC コードの整理

- 未使用の IPC チャネル定義を削除する
- session IPC と runtime IPC の境界が明確であることを再確認する
- IPC 関連のエラーハンドリングが統一されていることを確認する

### Task 5: lint / typecheck / test の実行

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test
```

全てが pass することを確認する。

## 参照資料

| 資料名             | パス                                       | 説明           |
| ------------------ | ------------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | 不要コード候補 |
| 実装記録           | `outputs/phase-5/implementation-record.md` | 変更点の参照   |
| 設計書             | `outputs/phase-2/design-document.md`       | 設計意図の参照 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                   |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| IPC契約チェックリスト | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC 削除時の整合性確認 |

## 統合テスト連携

- リファクタリング後に全テストが pass することを Phase 9 で品質保証する
- 不要コード除去がカバレッジに影響する場合は再計測する

## 成果物

| 成果物               | パス                                 | 説明                                    |
| -------------------- | ------------------------------------ | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 削除ファイル、import 整理、IPC 整理内容 |

## 完了条件

- [ ] 不要コードが除去されている
- [ ] import パスが全て整理されている
- [ ] 共有コンポーネントの Props 型が最適化されている
- [ ] IPC コードが整理されている
- [ ] lint / typecheck / test が全て pass する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
