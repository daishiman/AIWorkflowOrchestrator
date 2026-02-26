# Phase 7: カバレッジ確認

## メタ情報

| 項目               | 内容                                                |
| ------------------ | --------------------------------------------------- |
| Phase              | 7                                                   |
| Phase名            | カバレッジ確認                                      |
| タスクID           | TASK-9B                                             |
| 機能名             | task-9b-skill-creator                               |
| 作成日             | 2026-02-26                                          |
| ステータス         | pending                                             |
| 前Phase            | [Phase 6: テスト拡充](phase-6-test-expansion.md)    |
| 後続Phase          | [Phase 8: リファクタリング](phase-8-refactoring.md) |
| 成果物ディレクトリ | outputs/phase-7/                                    |

## 目的

Phase 6で拡充したテストのカバレッジ結果を最終検証し、全ファイルがカバレッジ基準を充足していることを確認する。
基準未達のファイルがある場合はPhase 6に戻り、追加テストを実施する。

## 参照資料テーブル

| 参照資料              | パス                                                                                            | 用途              |
| --------------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| Phase 6カバレッジ結果 | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-6/coverage-report.md`    | 前Phase測定結果   |
| Phase 6統合テスト結果 | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-6/integration-test.md`   | 統合テスト結果    |
| Phase 5実装成果物     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-5/design-changes.md`     | 実装変更点の確認  |
| Phase 4テスト仕様     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-4/test-specification.md` | テストケース全量  |
| テストパターン        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`               | テスト設計基準    |
| 品質基準              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                     | ゲート判定基準    |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | IPCカバレッジ観点 |

## ゲート判定テーブル

| 判定条件                                     | 結果        | 次アクション                      |
| -------------------------------------------- | ----------- | --------------------------------- |
| 全ファイルが最低基準を充足している           | **PASS**    | Phase 8（リファクタリング）へ進む |
| 1ファイル以上が最低基準を未達                | **FAIL**    | Phase 6 に戻りテスト追加          |
| 統合テストが1件以上失敗                      | **FAIL**    | Phase 6 に戻りテスト修正          |
| テスト実行自体がエラー（コンパイルエラー等） | **BLOCKED** | Phase 5 に戻り実装修正            |

## 実行タスク

- Task 7-1: カバレッジを最終測定する
- Task 7-2: ファイル別カバレッジを判定する
- Task 7-3: 統合テスト結果を最終確認する
- Task 7-4: テスト品質を確認する
- Task 7-5: 総合判定を実施する

### Task 7-1: カバレッジ最終測定

以下のコマンドでカバレッジを測定する:

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreator \
  src/main/services/skill/__tests__/HearingFacilitator \
  src/main/services/skill/__tests__/TaskGenerator \
  src/main/services/skill/__tests__/CodeGenerator \
  src/main/services/skill/__tests__/Validator \
  src/main/ipc/__tests__/skillCreator \
  --coverage
```

### Task 7-2: ファイル別カバレッジ判定

各ファイルの測定結果を以下のテーブルに記入し、PASS/FAIL を判定する:

| ファイル                | Line | Branch | Function | Line判定  | Branch判定 | Function判定 | 総合判定 |
| ----------------------- | ---- | ------ | -------- | --------- | ---------- | ------------ | -------- |
| SkillCreatorService.ts  | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| HearingFacilitator.ts   | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| TaskGenerator.ts        | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| CodeGenerator.ts        | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| ApiIntegrator.ts        | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| SkillValidator.ts       | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |
| skillCreatorHandlers.ts | \_%  | \_%    | \_%      | PASS/FAIL | PASS/FAIL  | PASS/FAIL    | ─        |

#### 判定基準

| 指標              | 最低基準（PASS条件） | 推奨基準 |
| ----------------- | -------------------- | -------- |
| Line Coverage     | 80%以上              | 90%以上  |
| Branch Coverage   | 60%以上              | 70%以上  |
| Function Coverage | 80%以上              | 90%以上  |

### Task 7-3: 統合テスト最終確認

Phase 4 + Phase 6 の統合テスト結果を確認する:

| テストID   | テスト名                    | 結果（PASS/FAIL） |
| ---------- | --------------------------- | ----------------- |
| INT-001    | スキル生成フロー            | ─                 |
| INT-002    | タスク実行フロー            | ─                 |
| INT-003    | エラーリカバリ              | ─                 |
| INT-004    | ドライラン                  | ─                 |
| INT-005    | IPC→Service連携             | ─                 |
| INT-EX-001 | スキル改善フロー            | ─                 |
| INT-EX-002 | スキルフォーク→検証フロー   | ─                 |
| INT-EX-003 | デバッグ実行→ログ出力フロー | ─                 |
| INT-EX-004 | ドキュメント生成フロー      | ─                 |

### Task 7-4: テスト品質確認

| 確認項目                                          | 結果（OK/NG） |
| ------------------------------------------------- | ------------- |
| 全テストがGreen（成功）である                     | ─             |
| テスト実行時間が120秒以内に完了する               | ─             |
| `vi.clearAllMocks()` が全beforeEachに含まれている | ─             |
| テスト間の状態リークがない（P9対策）              | ─             |
| happy-dom環境でuserEventを使用していない（P39）   | ─             |
| テスト実行ディレクトリが正しい（P40対策）         | ─             |

### Task 7-5: 最終判定

| 判定項目       | 結果      | 備考           |
| -------------- | --------- | -------------- |
| カバレッジ基準 | PASS/FAIL | （判定後記入） |
| 統合テスト     | PASS/FAIL | （判定後記入） |
| テスト品質     | PASS/FAIL | （判定後記入） |
| **総合判定**   | **─**     | （判定後記入） |

**総合判定が PASS の場合**: Phase 8（リファクタリング）へ進む
**総合判定が FAIL の場合**: Phase 6 に戻り、FAILの原因となったテストを追加・修正する

## 統合テスト連携【必須】

| 判定項目                   | 基準                                                   | 結果 |
| -------------------------- | ------------------------------------------------------ | ---- |
| 全統合テスト成功           | INT-001〜INT-005, INT-EX-001〜INT-EX-004 の9件全てPASS | ─    |
| Line Coverage 最低基準     | 全ファイル80%以上                                      | ─    |
| Branch Coverage 最低基準   | 全ファイル60%以上                                      | ─    |
| Function Coverage 最低基準 | 全ファイル80%以上                                      | ─    |
| テスト実行成功率           | 100%（全テストGreen）                                  | ─    |
| テスト実行時間             | 120秒以内                                              | ─    |

## テスト数サマリ

| カテゴリ            | Phase 4テスト数 | Phase 6追加 | 合計    |
| ------------------- | --------------- | ----------- | ------- |
| SkillCreatorService | 既存19 + 追加12 | 10          | ─件     |
| HearingFacilitator  | 6               | 2           | 8件     |
| TaskGenerator       | 7               | 2           | 9件     |
| CodeGenerator       | 5               | 2           | 7件     |
| Validator           | 7               | 2           | 9件     |
| IPCハンドラ         | 12              | 5           | 17件    |
| 統合テスト          | 5               | 4           | 9件     |
| 境界値テスト        | 8               | 0           | 8件     |
| **合計**            | ─               | ─           | **─件** |

実際のテスト数は `grep -c "it(" *.test.ts` で正確にカウントする（P37対策）。

## 多角的チェック観点（AIが判断）

### カバレッジ充足性観点

- [ ] 全7ファイルがLine Coverage 80%以上を達成している
- [ ] 全7ファイルがBranch Coverage 60%以上を達成している
- [ ] 全7ファイルがFunction Coverage 80%以上を達成している
- [ ] カバレッジ未達ファイルがゼロである

### テスト信頼性観点

- [ ] 全テストが安定して成功する（flaky testがない）
- [ ] テスト実行時間が妥当である（120秒以内）
- [ ] モック設定が正しく、実際の動作を反映している

### リグレッション防止観点

- [ ] Phase 4の既存テストが全て成功している
- [ ] Phase 6の追加テストが全て成功している
- [ ] テスト間の依存関係がない（独立実行可能）

### ゲート判定観点

- [ ] PASS/FAILの判定が全項目に記入されている
- [ ] FAIL項目がある場合、原因と対応策が明記されている
- [ ] Phase 6への差し戻し条件が明確である

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                                | 仕様参照先                                        |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（カバレッジ確認のみ、UI変更なし）                | -                                                 |
| バックエンド（Main）       | 必須（全サービスファイルのカバレッジ基準充足確認）      | aiworkflow-requirements: quality-requirements.md  |
| IPC通信                    | 必須（skillCreatorHandlers.tsのカバレッジ基準充足確認） | aiworkflow-requirements: api-ipc-agent.md         |
| Preload/セキュリティ       | 確認のみ（Preload APIテストの継続成功を確認）           | aiworkflow-requirements: security-api-electron.md |
| ローカルストレージ         | 非該当（DB変更なし）                                    | -                                                 |

## サブタスク管理

| サブタスクID | 内容                     | 状態    | 依存関係      |
| ------------ | ------------------------ | ------- | ------------- |
| 7-1          | カバレッジ最終測定       | pending | なし          |
| 7-2          | ファイル別カバレッジ判定 | pending | 7-1           |
| 7-3          | 統合テスト最終確認       | pending | 7-1           |
| 7-4          | テスト品質確認           | pending | 7-1           |
| 7-5          | 最終判定                 | pending | 7-2, 7-3, 7-4 |

## タスク100%実行確認【必須】

- [ ] カバレッジ測定コマンドが正常に実行されている
- [ ] ファイル別カバレッジ判定テーブルが全項目記入されている
- [ ] 統合テスト最終確認テーブルが全項目記入されている
- [ ] テスト品質確認テーブルが全項目記入されている
- [ ] 最終判定が記入されている
- [ ] テスト数サマリの合計が実際の `grep -c "it("` の結果と一致している（P37対策）
- [ ] PASS判定の場合: Phase 8への遷移条件が満たされている
- [ ] FAIL判定の場合: Phase 6への差し戻し理由が記録されている

## Phase完了時の検証コマンド

```bash
# Phase出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 7

# カバレッジ付きテスト実行（最終確認）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreator \
  src/main/services/skill/__tests__/HearingFacilitator \
  src/main/services/skill/__tests__/TaskGenerator \
  src/main/services/skill/__tests__/CodeGenerator \
  src/main/services/skill/__tests__/Validator \
  src/main/ipc/__tests__/skillCreator \
  --coverage

# テスト数の正確なカウント（P37対策）
grep -c "it(" apps/desktop/src/main/services/skill/__tests__/SkillCreator*.test.ts \
  apps/desktop/src/main/services/skill/__tests__/HearingFacilitator*.test.ts \
  apps/desktop/src/main/services/skill/__tests__/TaskGenerator*.test.ts \
  apps/desktop/src/main/services/skill/__tests__/CodeGenerator*.test.ts \
  apps/desktop/src/main/services/skill/__tests__/Validator*.test.ts \
  apps/desktop/src/main/ipc/__tests__/skillCreator*.test.ts
```

## 成果物テーブル

| 成果物名                 | パス                                  |
| ------------------------ | ------------------------------------- |
| カバレッジ再測定レポート | `outputs/phase-7/coverage-report.md`  |
| 統合テスト結果           | `outputs/phase-7/integration-test.md` |

## 完了条件

- [ ] 全ファイルのLine Coverage が80%以上である
- [ ] 全ファイルのBranch Coverage が60%以上である
- [ ] 全ファイルのFunction Coverage が80%以上である
- [ ] 全統合テスト（9件）がPASSである
- [ ] テスト品質確認の全項目がOKである
- [ ] 最終判定がPASSである
- [ ] カバレッジレポートが `outputs/phase-7/` に出力されている
- [ ] テスト数が `grep -c "it("` で正確にカウントされている（P37対策）

## 次Phase

Phase 7のゲート判定がPASSの場合、[Phase 8: リファクタリング](phase-8-refactoring.md)へ進む。
FAILの場合、[Phase 6: テスト拡充](phase-6-test-expansion.md)に戻り、不足テストを追加する。
