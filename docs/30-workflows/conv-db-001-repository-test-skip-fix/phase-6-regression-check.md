# Phase 6: 回帰確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

better-sqlite3 リビルド後に、他の conversation 関連テストおよび Main プロセス全体のテストに回帰が発生していないことを確認する。

## 実行タスク

- conversation 関連テスト回帰確認: conversation ハンドラ・DB テストの回帰確認
- Main プロセステスト回帰確認: `apps/desktop/src/main/` 全体のテスト回帰確認
- AC-4 検証: 他のテストに回帰がないことの最終確認

## 参照資料

| 資料名             | パス                                                                                | 説明                       |
| ------------------ | ----------------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装       | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-5-implementation.md`  | 実装結果                   |
| テストファイル一覧 | `apps/desktop/src/main/` 配下                                                       | テスト対象                 |
| DB実装コア仕様     | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | SQLite/better-sqlite3 設計 |

## 実行手順

### ステップ1: conversation 関連テストの回帰確認

```bash
# conversation ハンドラテスト（43件）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/conversationHandlers.test.ts --reporter=verbose

# conversation ハンドラ登録テスト（22件）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/register-conversation-handlers.test.ts --reporter=verbose

# conversation DB テスト
cd apps/desktop && pnpm vitest run src/main/database/__tests__/conversationDatabase.test.ts --reporter=verbose
```

#### 期待結果

| テストファイル                           | 期待件数 | 期待結果 |
| ---------------------------------------- | -------- | -------- |
| `conversationHandlers.test.ts`           | 43件     | 全 PASS  |
| `register-conversation-handlers.test.ts` | 22件     | 全 PASS  |
| `conversationDatabase.test.ts`           | 可変     | 全 PASS  |

### ステップ2: Main プロセステスト全体の回帰確認

```bash
# Main プロセス配下の全テストを実行
cd apps/desktop && pnpm vitest run src/main/ --reporter=verbose 2>&1 | tail -30
```

#### 判断基準

| 条件                                                 | 結果                            |
| ---------------------------------------------------- | ------------------------------- |
| 全テスト PASS                                        | AC-4 PASS                       |
| 既知のスキップ（他のネイティブモジュール依存等）のみ | AC-4 PASS（スキップ理由を記録） |
| 新規 FAIL が発生                                     | AC-4 FAIL → 原因調査が必要      |

### ステップ3: 最終確認サマリー

受け入れ基準の全項目を最終確認:

| AC   | 基準                                   | 結果                     | 備考               |
| ---- | -------------------------------------- | ------------------------ | ------------------ |
| AC-1 | `.node` バイナリが存在する             | PASS（Phase 5 確認済み） | Phase 5 で確認済み |
| AC-2 | `require('better-sqlite3')` が成功する | PASS（Phase 5 確認済み） | Phase 5 で確認済み |
| AC-3 | 75件テストが全て PASS                  | PASS（Phase 5 確認済み） | Phase 5 で確認済み |
| AC-4 | 他のテストに回帰がないこと             | 未確認 → 本Phaseで確認   | 本Phase で確認     |

## 統合テスト連携

- conversation 関連テスト（計 140件以上）の回帰確認
- Main プロセス全体のテストスイート回帰確認
- リビルドによる副作用がないことの最終保証

## 成果物

| 成果物           | パス                                                                                          | 説明           |
| ---------------- | --------------------------------------------------------------------------------------------- | -------------- |
| 回帰確認レポート | `docs/30-workflows/conv-db-001-repository-test-skip-fix/outputs/phase-6/regression-report.md` | 回帰テスト結果 |

## 完了条件

- [ ] conversation ハンドラテスト（43件）が全て PASS
- [ ] conversation ハンドラ登録テスト（22件）が全て PASS
- [ ] conversation DB テストが全て PASS
- [ ] Main プロセステスト全体で新規 FAIL なし
- [ ] AC-1〜AC-4 の全項目が PASS
- [ ] 回帰確認レポートが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

### ステップ4: Phase 12 最小チェックリスト（簡易版）

Phase 1-6 簡易版のため Phase 12 は独立実施しないが、以下の最小限チェックは本Phase内で実施する:

- [ ] `LOGS.md` 2ファイル（aiworkflow-requirements / task-specification-creator）への完了記録の要否判断
  - ビルド環境修正のみでコード変更なしの場合: 記録不要（根拠を明示）
  - package.json 変更を伴う場合: 記録必要
- [ ] `topic-map.md` 再生成の要否判断
  - 仕様書の追加・変更がない場合: 不要
- [ ] 未タスク検出: 本タスク実施中に発見された未タスクの有無を記録（0件でも記録必須）

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断             | 仕様参照先                                                 |
| ------------ | -------------------- | ---------------------------------------------------------- |
| データ整合性 | DB操作テスト回帰確認 | `aiworkflow-requirements: database-implementation-core.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. conversation 関連テストの回帰確認
2. Main プロセステスト全体の回帰確認
3. 最終確認サマリーの記録
4. Phase 12 最小チェックリストの実施
5. 回帰確認レポートの作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 6
```

## タスク完了後

Phase 1-6 簡易版のため、以下のPhaseは本タスクのスコープ外:

- Phase 7-9: カバレッジ確認・リファクタリング・品質検証（コード変更なしのため不要）
- Phase 10-11: 最終レビュー・手動テスト（コード変更なしのため簡略化可能）
- Phase 12: ドキュメント更新（リビルド手順のドキュメント化で完了）
- Phase 13: PR作成（ユーザー指示に従う）
