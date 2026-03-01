# Phase 11: 手動テスト検証 — Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目      | 値                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------- |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                              |
| Phase     | 11                                                                                                |
| タスク名  | Phase 11 Worktree環境テストプロトコル標準化                                                       |
| Issue     | #853                                                                                              |
| 作成日    | 2026-03-01                                                                                        |
| 前提Phase | Phase 10（最終レビュー）完了                                                                      |
| 目的      | 自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、プロトコル自体を検証する |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認する。本タスクはPhase 11プロトコル改善タスクであるため、本Phase 11の実行自体が「作成したプロトコルの自己検証」を兼ねる。作成した3層テスト分類（Layer 1-3）に従ってテストを実施し、プロトコルの実用性と完全性を確認する。

## 実行タスク

- Task 1: Layer 1テスト実行 — Worktree環境で自動テスト検証を実施する（TC-002, TC-006, TC-007）
- Task 2: Layer 2テスト実行 — Worktree環境でIPC契約静的解析を実施する（TC-003, TC-005）
- Task 3: Layer 3テスト実行 — メインリポジトリまたはCI環境でE2Eテスト・Electron起動テストを実施する（TC-001, TC-004）
- Task 4: 未実施テスト記録 — Layer 3テストがWorktreeで実施不可の場合、deferred-tests.mdに記録する
- Task 5: テスト結果レポート作成 — 全テストケースの結果を集約する

## 参照資料

| 資料名                | パス                                                                                        | 説明                              |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 2設計成果物     | `outputs/phase-2/architecture-design.md`                                                    | Layer分類・E2E/CI設計の確認       |
| 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                                                   | Phase 10成果物                    |
| Phase 4テスト成果物   | `outputs/phase-4/`                                                                          | テスト設計・テストコード          |
| Phase 5実装成果物     | `outputs/phase-5/`                                                                          | プロトコル文書・E2Eテスト実装     |
| Phase 6テスト拡充成果 | `outputs/phase-6/integration-test.md`                                                       | 統合テスト拡充の確認              |
| Phase 7カバレッジ成果 | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ達成状況の確認          |
| Phase 8リファクタ成果 | `outputs/phase-8/`                                                                          | リファクタリング結果              |
| Phase 9品質成果物     | `outputs/phase-9/`                                                                          | 品質ゲート判定結果                |
| Phase 11/12ガイド     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 手動テスト詳細手順                |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約検証手順                   |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | E2E/IPCの再利用パターン           |
| E2E品質仕様           | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | Layer 3 判定時の品質基準          |
| Playwright仕様        | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Layer 3（E2E）の実行手順          |
| CI/CD仕様             | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | CI実行時のジョブ確認基準          |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                                        | P40（テスト実行ディレクトリ依存） |
| Playwrightガイド      | `apps/desktop/playwright.config.ts`                                                         | E2Eテスト設定                     |

## 特殊な注意事項: 自己検証タスク

本タスクはPhase 11プロトコルの改善タスクである。Phase 11を実行する行為自体が、作成したプロトコルの検証となる。以下を意識して実行する:

1. **プロトコル文書（outputs/phase-5/ の Worktreeプロトコル文書）に記載された手順に厳密に従う**
2. **手順の曖昧さ・不足・矛盾を発見した場合は、テスト結果レポートに記録する**（Phase 12の未タスク候補となる）
3. **Layer分類の妥当性を検証する** — 各テストケースが正しいLayerに分類されているか確認する

## テストカテゴリ

| カテゴリ                           | Layer | 実施環境              | 説明                                     |
| ---------------------------------- | ----- | --------------------- | ---------------------------------------- |
| 自動テスト検証（Unit/Integration） | 1     | Worktree              | `pnpm vitest run` で全テストPASSを確認   |
| IPC契約静的解析                    | 2     | Worktree              | 型チェック・Lint・IPC契約整合性を検証    |
| E2Eテスト / Electron起動テスト     | 3     | メインリポジトリ / CI | Playwright E2E・Electronアプリ起動を検証 |

## テストケース

### Task 1: Layer 1テスト実行（Worktree環境）

| TC-ID  | テスト内容                                                   | Layer | 実施環境 | 前提条件                          | 操作手順                                                                                                                     | 期待結果                                                                        | 実行結果 | 備考 |
| ------ | ------------------------------------------------------------ | ----- | -------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- | ---- |
| TC-002 | Worktree環境でLayer 1テスト実行                              | 1     | Worktree | Worktree環境でpnpm installが完了  | `cd apps/desktop && pnpm vitest run` を実行する                                                                              | 全テストがPASSし、失敗テストが0件であること                                     |          |      |
| TC-006 | deferred-tests.mdに未実施テスト記録→Phase 13で検出確認       | 1     | Worktree | Layer 3テストの実施可否が判明済み | Layer 3テスト（TC-001, TC-004）がWorktreeで実施不可の場合、`outputs/phase-11/deferred-tests.md` にテンプレート形式で記録する | deferred-tests.mdにTC-ID・テスト名・延期理由・完了条件が記載されていること      |          |      |
| TC-007 | Worktree環境判定（.gitがファイルかディレクトリか）の動作確認 | 1     | Worktree | Worktree環境にいること            | `test -f .git && echo "worktree" \|\| echo "main-repo"` を実行する                                                           | Worktree環境では「worktree」、メインリポジトリでは「main-repo」と出力されること |          |      |

### Task 2: Layer 2テスト実行（Worktree環境）

| TC-ID  | テスト内容                                                 | Layer | 実施環境 | 前提条件                         | 操作手順                                                                                                                                                                       | 期待結果                                                                            | 実行結果 | 備考 |
| ------ | ---------------------------------------------------------- | ----- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------- | ---- |
| TC-003 | Worktree環境でLayer 2テスト実行（IPC契約静的解析）         | 2     | Worktree | Worktree環境でpnpm installが完了 | 1. `pnpm typecheck` を実行する 2. `pnpm lint` を実行する 3. IPCチャンネル定数とハンドラの整合性をgrepで確認する                                                                | typecheckとlintが0エラーで完了し、IPC定数とハンドラのチャンネル名が一致していること |          |      |
| TC-005 | Phase 11テンプレートのWorktreeセクションで模擬Phase 11実行 | 2     | Worktree | Phase 5でテンプレート更新が完了  | 1. `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` のWorktree代替手順セクションを読む 2. セクションに記載された手順に従いLayer 1-2テストを実施する | テンプレートの手順が不足なく実行でき、全Layer 1-2テストがPASSすること               |          |      |

### Task 3: Layer 3テスト実行（メインリポジトリ / CI）

| TC-ID  | テスト内容                          | Layer | 実施環境          | 前提条件                             | 操作手順                                                             | 期待結果                                                                       | 実行結果 | 備考                                            |
| ------ | ----------------------------------- | ----- | ----------------- | ------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------- |
| TC-001 | メインリポジトリでE2Eテスト実行     | 3     | メインリポジトリ  | Playwrightがインストール済み         | メインリポジトリで `pnpm --filter @repo/desktop test:e2e` を実行する | E2Eテストが全件PASSし、skill:remove・skill:importのIPC通信が正常に動作すること |          | Worktree不可の場合はdeferred-tests.mdに記録する |
| TC-004 | CI環境でE2Eテストジョブ正常完了確認 | 3     | CI/GitHub Actions | PRがプッシュされGitHub Actionsが起動 | GitHub ActionsのCI結果画面でE2Eテストジョブのステータスを確認する    | E2Eテストジョブが「success」ステータスで完了していること                       |          | PRプッシュ後に確認する（Phase 13と連携）        |

## Worktree環境対応ルール

### Layer別の実施環境マッピング

| Layer | Worktree実施可否 | 代替実施環境              | 未実施時の対応                                  |
| ----- | ---------------- | ------------------------- | ----------------------------------------------- |
| 1     | 可能             | -                         | -                                               |
| 2     | 可能             | -                         | -                                               |
| 3     | 不可             | メインリポジトリ / CI環境 | `outputs/phase-11/deferred-tests.md` に記録する |

### Worktree環境判定方法

```bash
# Worktree環境の判定: .git がファイルであればWorktree、ディレクトリであればメインリポジトリ
if [ -f .git ]; then
  echo "現在Worktree環境です — Layer 3テストはメインリポジトリまたはCIで実行してください"
else
  echo "現在メインリポジトリです — 全Layerのテストを実行できます"
fi
```

## 統合テスト連携

| 統合テスト観点                                | 確認方法                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| 自動テスト結果との整合                        | Phase 9品質検証のテスト結果と、Layer 1テスト結果の矛盾がないことを確認する             |
| Playwright E2E → Electron IPC通信の実環境検証 | TC-001のE2Eテストで、skill:remove・skill:importのIPC通信が正常に動作することを確認する |
| CI/CDパイプラインとの連携                     | TC-004でGitHub ActionsのE2Eテストジョブが正常完了していることを確認する                |
| Phase 12への入力情報引き渡し                  | 発見事項・プロトコルの改善点を `manual-test-result.md` に記録し、Phase 12へ連携する    |
| deferred-testsの追跡連携                      | 未実施テストをdeferred-tests.mdに記録し、Phase 13のチェックリストで検出確認する        |

## 多角的チェック観点

| 観点                           | 適用判断 | 仕様参照先                                                                    |
| ------------------------------ | -------- | ----------------------------------------------------------------------------- |
| Worktree環境制約               | 適用     | `outputs/phase-5/` 内のWorktreeプロトコル文書                                 |
| 3層テスト分類の妥当性          | 適用     | `phase-1-requirements.md` のFR-1                                              |
| E2Eテスト実行可否              | 適用     | `apps/desktop/playwright.config.ts`                                           |
| IPC契約整合性                  | 適用     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| CI/CDパイプライン統合          | 適用     | `.github/workflows/ci.yml`                                                    |
| deferred-tests追跡ワークフロー | 適用     | `outputs/phase-5/` 内のdeferred-testsテンプレート                             |
| テスト実行ディレクトリ依存     | 適用     | `.claude/rules/06-known-pitfalls.md` P40                                      |

## 実行手順

### ステップ1: テスト環境準備

1. 現在の環境がWorktreeかメインリポジトリかを判定する（`test -f .git` で確認）
2. `pnpm install` で依存関係を最新化する
3. `pnpm --filter @repo/shared build` でsharedパッケージをビルドする
4. テスト実行ディレクトリを `apps/desktop` に移動する（P40対策）

### ステップ2: Layer 1テスト実行（TC-002, TC-006, TC-007）

1. TC-007を実行し、Worktree環境判定が正しく動作することを確認する
2. TC-002を実行し、全自動テストがPASSすることを確認する
3. Layer 3テストの実施可否を判定し、不可の場合はTC-006でdeferred-tests.mdに記録する

### ステップ3: Layer 2テスト実行（TC-003, TC-005）

1. TC-003を実行し、typecheckとlintが0エラーで完了することを確認する
2. TC-005を実行し、Phase 11テンプレートのWorktreeセクション手順を模擬実行する
3. テンプレートの手順に不足・矛盾がないかを確認し、発見した場合はテスト結果に記録する

### ステップ4: Layer 3テスト実行（TC-001, TC-004）

1. Worktree環境の場合: TC-001, TC-004をdeferred-tests.mdに記録し、ステップ5に進む
2. メインリポジトリの場合: TC-001を実行し、E2Eテストが全件PASSすることを確認する
3. TC-004はPRプッシュ後にGitHub ActionsのCI結果で確認する（Phase 13と連携）

### ステップ5: テスト結果レポート作成

1. 全テストケース（TC-001〜TC-007）の結果を `outputs/phase-11/manual-test-result.md` に記録する
2. 未実施テストがある場合は `outputs/phase-11/deferred-tests.md` を作成する
3. プロトコルの改善点・発見事項を記録する（Phase 12の未タスク候補となる）

## 成果物

| 成果物           | パス                                     | 必須 | 説明                                              |
| ---------------- | ---------------------------------------- | ---- | ------------------------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | ✅   | 全テストケース（TC-001〜TC-007）の実行結果        |
| 未実施テスト記録 | `outputs/phase-11/deferred-tests.md`     | 条件 | Layer 3テストがWorktreeで実施不可の場合に作成する |

### deferred-tests.md テンプレート

```markdown
# 未実施テスト記録

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001      |
| 作成日   | {{YYYY-MM-DD}}                            |
| 作成理由 | Worktree環境のためLayer 3テストが実施不可 |

## 未実施テスト一覧

| TC-ID  | テスト名                            | Layer | 延期理由                                           | 完了条件                                                       | 完了期限       |
| ------ | ----------------------------------- | ----- | -------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| TC-001 | メインリポジトリでE2Eテスト実行     | 3     | Worktree環境ではElectronアプリのビルド・起動が不可 | メインリポジトリで `pnpm --filter @repo/desktop test:e2e` PASS | Phase 13完了前 |
| TC-004 | CI環境でE2Eテストジョブ正常完了確認 | 3     | PRプッシュ前のためCI実行不可                       | GitHub ActionsのE2Eジョブが「success」ステータス               | Phase 13完了前 |

## 解消チェック

- [ ] TC-001: メインリポジトリまたはCI環境でE2Eテストが全件PASS
- [ ] TC-004: GitHub ActionsのE2Eテストジョブが「success」ステータスで完了
```

## 完了条件

### Layer 1テスト

- [ ] TC-002: Worktree環境で `cd apps/desktop && pnpm vitest run` が全件PASSしている
- [ ] TC-006: Layer 3テストの実施可否を判定し、未実施の場合はdeferred-tests.mdに記録済み
- [ ] TC-007: Worktree環境判定コマンドが正しい結果を返すことを確認した

### Layer 2テスト

- [ ] TC-003: `pnpm typecheck` と `pnpm lint` が0エラーで完了している
- [ ] TC-005: Phase 11テンプレートのWorktreeセクション手順を模擬実行し、手順に不足がないことを確認した

### Layer 3テスト

- [ ] TC-001: E2Eテストが全件PASSしている（Worktree不可時はdeferred-tests.mdに記録済み）
- [ ] TC-004: CI環境でE2Eテストジョブが正常完了している（PRプッシュ前の場合はdeferred-tests.mdに記録済み）

### 全体

- [ ] 全7テストケース（TC-001〜TC-007）の結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] 未実施テストがある場合、`outputs/phase-11/deferred-tests.md` が作成されている
- [ ] プロトコルの改善点・発見事項がテスト結果レポートに記録されている（0件の場合は「改善点なし」と明記）
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. テスト環境準備（Worktree判定、依存関係インストール、sharedビルド）
2. Task 1: Layer 1テスト実行（TC-002, TC-006, TC-007）
3. Task 2: Layer 2テスト実行（TC-003, TC-005）
4. Task 3: Layer 3テスト実行（TC-001, TC-004）— 実施不可の場合はdeferred-tests.md記録
5. Task 4: 未実施テスト記録（deferred-tests.md作成）
6. Task 5: テスト結果レポート作成（manual-test-result.md）
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-phase11-worktree-protocol --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
