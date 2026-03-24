# Phase 13: 完了・PR 準備

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 13                         |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |

## 目的

Phase 1-12 の全成果物が揃っていることを最終確認し、コミット済みブランチを準備する。PR はユーザー指示があるまで作成しない（CONST_002 準拠）。

## 実行タスク

### Task 1: 最終チェックリスト確認

Phase 1-12 の全成果物が存在し、完了条件を満たしていることを確認する。

| Phase | 名称             | 成果物                           | 確認 |
| ----- | ---------------- | -------------------------------- | ---- |
| 1     | 要件定義         | phase-01-requirements.md         | [ ]  |
| 2     | 設計             | phase-02-design.md               | [ ]  |
| 3     | 設計レビュー     | phase-03-design-review.md        | [ ]  |
| 4     | テスト作成       | phase-04-test-creation.md        | [ ]  |
| 5     | 実装             | phase-05-implementation.md       | [ ]  |
| 6     | テスト拡充       | phase-06-test-expansion.md       | [ ]  |
| 7     | カバレッジ確認   | phase-07-coverage.md             | [ ]  |
| 8     | リファクタリング | phase-08-refactoring.md          | [ ]  |
| 9     | 品質検証         | phase-09-quality-verification.md | [ ]  |
| 10    | 最終レビュー     | phase-10-final-review.md         | [ ]  |
| 11    | 手動テスト       | manual-test-report.md            | [ ]  |
| 12    | ドキュメント     | implementation-guide.md 他       | [ ]  |

### Task 2: 変更ファイル一覧の確認

以下のコマンドで変更ファイルを確認する:

```bash
git diff --stat
```

期待される変更対象ファイル:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — setLLMAdapter() メソッド追加、readonly 解除
- `apps/desktop/src/main/ipc/index.ts` — fire-and-forget async で LLMAdapter DI 配線
- `apps/desktop/src/main/services/runtime/__tests__/` — テストファイル（新規または更新）
- `docs/30-workflows/ut-sc-03-003-di-wiring/` — Phase 仕様書・成果物一式
- `.claude/skills/` — システム仕様書更新（LOGS.md, SKILL.md, references/, indexes/）

### Task 3: コミットメッセージ作成

```
feat(runtime): add DI wiring for llmAdapter/resourceLoader in RuntimeSkillCreatorFacade

- Add setLLMAdapter() setter injection method to RuntimeSkillCreatorFacade
- Wire LLMAdapterFactory.getAdapter("anthropic") via fire-and-forget async in ipc/index.ts
- Inject ResourceLoader via constructor injection
- Implement graceful degradation for pre-injection plan() calls
- Add comprehensive tests for DI lifecycle scenarios

Closes: UT-SC-03-003
Parent: TASK-SC-03-PLAN-LLM-PROMPT
```

### Task 4: PR 作成判断

- PR はユーザーから明示的な指示があるまで作成しない（CONST_002 準拠）
- ブランチがコミット済みであることのみ確認する
- `--no-verify` は使用禁止（CLAUDE.md 準拠）

## 参照資料

| 資料名                        | パス / 参照先                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| Phase 1-12 成果物ディレクトリ | `docs/30-workflows/ut-sc-03-003-di-wiring/`                    |
| Git 操作ルール                | `.claude/rules/07-git-and-tooling.md`                          |
| CLAUDE.md Git 操作禁止事項    | `CLAUDE.md#Git操作の禁止事項`                                  |
| PR 作成ルール                 | `.claude/rules/07-git-and-tooling.md#PR作成ルール`             |
| コミット前チェックリスト      | `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト` |

## 成果物

| 成果物               | 説明                                          |
| -------------------- | --------------------------------------------- |
| コミット済みブランチ | 全 Phase の成果物を含むコミット済みブランチ   |
| PR                   | ユーザー指示があるまで作成しない（CONST_002） |

## 完了条件

- [ ] Phase 1-12 の全成果物が存在し、各 Phase の完了条件を満たしている
- [ ] Phase 12 までの完了根拠を記録
- [ ] `git diff --stat` で変更ファイル一覧が期待どおりである
- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 関連テストが全て PASS している
- [ ] local check（lint, typecheck, test）の結果要約を記録
- [ ] コミットメッセージが規約に従っている
- [ ] `--no-verify` を使用していない
- [ ] Mirror Sync が完了している（`.claude/skills/` と `.agents/skills/` が同期済み）
- [ ] PR はユーザー指示待ち状態である（user approval の待機状態を明記）

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

完了
