# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| Phase名    | カバレッジ確認                        |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 6: テスト拡充                   |
| 次Phase    | Phase 8: リファクタリング             |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

AC-1〜AC-5 と全コンポーネントのカバレッジを照合し、テストの抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ

AC ごとのテスト対応表を作成する:

| AC   | 条件                   | テスト対応           | カバー率 |
| ---- | ---------------------- | -------------------- | -------- |
| AC-1 | ルート存在 or 統合完了 | ルーティングテスト   | TBD      |
| AC-2 | IPC 使い分け明確化     | IPC アダプターテスト | TBD      |
| AC-3 | 共有コンポーネント整理 | QuestionCard テスト  | TBD      |
| AC-4 | 孤立参照クリーンアップ | grep ベーステスト    | TBD      |
| AC-5 | 既存テスト pass        | 回帰テスト           | TBD      |

### Task 2: コンポーネントカバレッジ

```bash
pnpm --filter @repo/desktop test -- --coverage
```

対象コンポーネントのカバレッジを計測する:

| コンポーネント                 | Line | Branch | Function | 目標 |
| ------------------------------ | ---- | ------ | -------- | ---- |
| QuestionCard                   | TBD  | TBD    | TBD      | 90%  |
| ConversationPanel（統合後）    | TBD  | TBD    | TBD      | 80%  |
| ConversationalInterview        | TBD  | TBD    | TBD      | 80%  |
| IPC アダプター（作成した場合） | TBD  | TBD    | TBD      | 90%  |

### Task 3: UserInputKind カバレッジ

5 つの UserInputKind 全てがテストでカバーされていることを確認する:

| UserInputKind | テスト有無 | 正常系 | 異常系 | インタラクション |
| ------------- | ---------- | ------ | ------ | ---------------- |
| text          | TBD        | TBD    | TBD    | TBD              |
| select        | TBD        | TBD    | TBD    | TBD              |
| multiSelect   | TBD        | TBD    | TBD    | TBD              |
| confirm       | TBD        | TBD    | TBD    | TBD              |
| freeform      | TBD        | TBD    | TBD    | TBD              |

### Task 4: 未カバー領域の特定

- カバレッジレポートから未テストのコードパスを特定する
- 追加テストが必要な箇所をリストアップする
- Phase 8 のリファクタリングで不要コード除去の候補を特定する

## 参照資料

| 資料名           | パス                                       | 説明               |
| ---------------- | ------------------------------------------ | ------------------ |
| テストマトリクス | `outputs/phase-4/test-matrix.md`           | AC 対応表          |
| テスト拡充記録   | `outputs/phase-6/test-expansion.md`        | 追加テストの内容   |
| 実装記録         | `outputs/phase-5/implementation-record.md` | テスト対象の変更点 |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                                  | 内容                 |
| ------------ | ----------------------------------------------------------------------------------------------------- | -------------------- |
| テスト標準化 | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | カバレッジ基準の参照 |

## 統合テスト連携

- 未カバー領域が Phase 8 のリファクタリング対象に含まれるかを評価する
- カバレッジ結果を Phase 10 の最終レビューに持ち込む

## 成果物

| 成果物             | パス                                 | 説明                                  |
| ------------------ | ------------------------------------ | ------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC 対応表、コンポーネント別カバレッジ |

## 完了条件

- [ ] AC-1〜AC-5 のテスト対応表が完成している
- [ ] 各コンポーネントのカバレッジが目標値を達成している
- [ ] UserInputKind 5 種類全てがカバーされている
- [ ] 未カバー領域が特定され、対応方針が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
