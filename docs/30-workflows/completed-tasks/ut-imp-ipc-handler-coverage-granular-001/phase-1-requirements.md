# Phase 1: 要件定義 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2（設計）                           |
| ステータス | 完了（2026-02-28）                        |
| 作成日     | 2026-02-28                                |
| 機能名     | ut-imp-ipc-handler-coverage-granular-001  |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001  |
| Issue      | #854                                      |
| 依存タスク | UT-FIX-SKILL-REMOVE-INTERFACE-001（完了） |
| 並行タスク | UT-FIX-7-1-002（未着手）                  |

## 目的

`skillHandlers.ts` のような複数IPCハンドラを含むファイルに対して、ハンドラ単位でカバレッジを計測・レポートする基盤を構築するための要件を抽出し、受け入れ基準を定義する。

以下の3つのタスクを実行する:

1. 機能要件（FR）・非機能要件（NFR）の抽出と分類
2. 各要件に対する検証可能な受け入れ基準の作成
3. スコープの明確な定義と境界の確認

## 実行タスク

- **Task 1**: 機能要件・非機能要件の抽出
- **Task 2**: 受け入れ基準の作成
- **Task 3**: スコープ定義と制約条件の確認

## 参照資料

| 参照資料           | パス                                                                                        | 内容                             |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| タスク指示書       | `docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md`           | 元のタスク指示書（完了移管済み） |
| タスクindex        | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/index.md`                       | タスク概要・スコープ定義         |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 集計スクリプトの対象ファイル     |
| カバレッジ基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値の定義             |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの参考               |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題テーブルへの登録           |
| P41 記録           | `.claude/rules/06-known-pitfalls.md#P41`                                                    | v8 インライン関数カウント        |
| P40 記録           | `.claude/rules/06-known-pitfalls.md#P40`                                                    | テスト実行ディレクトリ依存       |

## aiworkflow-requirements 抽出結果（今回実装で必須）

| 関心ごと                   | 抽出した仕様書                                                                    | 抽出理由                                                                 | 反映先Phase         |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| カバレッジ閾値・品質ゲート | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | Rule-1〜4 と Line/Branch/Function 閾値の正本                             | 1, 5, 7, 9, 10, 12  |
| IPC契約（チャンネル定義）  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skillHandlers.ts` のIPCチャンネル契約と判定レポート接続点を確認するため | 2, 3, 5, 7, 10, 12  |
| Skill関連型契約            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `skill:*` チャンネル名・戻り値・型の整合確認が必要なため                 | 2, 3, 5, 10, 12     |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証とIPC登録ライフサイクル制約を仕様へ反映するため                | 2, 3, 5, 10, 11, 12 |
| エラーハンドリング基準     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | CLI異常系（JSON不正/ファイル未存在/引数欠落）の期待応答を定義するため    | 1, 4, 6, 10, 11     |
| Main/IPC責務分離           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     | Main Process内での責務分離とスクリプト連携設計の根拠が必要なため         | 2, 3, 5, 10         |
| IPC登録パターン            | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | `register*Handlers` と配線漏れ防止観点を早期定義するため                 | 2, 3, 5, 10         |
| IPC契約チェック運用        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | チャンネル名・引数・戻り値・エラー契約の確認項目を明示するため           | 2, 3, 5, 10, 12     |
| Phase運用ルール            | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | Phase 7/12 の判定と未タスク登録手順を運用基準へ合わせるため              | 1, 7, 10, 12        |

### SubAgent分担（関心ごとの分離）

- SubAgent-A（品質/判定）: `quality-requirements.md` と `architecture-implementation-patterns.md` を担当し、カバレッジ判定基準を固定する。
- SubAgent-B（IPC契約）: `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `ipc-contract-checklist.md` を担当し、チャンネル・型・戻り値契約を固定する。
- SubAgent-C（セキュリティ/異常系）: `security-electron-ipc.md` と `error-handling.md` を担当し、sender検証とエラーパス要件を固定する。
- SubAgent-D（運用ルール）: `task-workflow.md` と `task-workflow-rules.md` を担当し、未タスク運用とPhaseゲート条件を固定する。

## 実行手順

### Step 1: 機能要件の抽出

現行の `skillHandlers.ts` 構造（3登録関数・23ハンドラ）と Vitest v8 カバレッジ出力を分析し、以下の機能要件を定義する。

| FR-ID  | 要件名                     | 説明                                                                                                                      | 優先度 |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-001 | ハンドラ境界検出           | TypeScript AST（ts-morph）を使用して `ipcMain.handle()` の各コールバック関数の開始行・終了行を検出する                    | 必須   |
| FR-002 | v8カバレッジJSON解析       | Vitest が出力する v8 カバレッジ JSON ファイルを読み込み、行単位・関数単位・分岐単位のカバレッジデータを解析する           | 必須   |
| FR-003 | ハンドラ単位カバレッジ算出 | FR-001 で検出したハンドラ境界と FR-002 のカバレッジデータを突合し、各ハンドラの Line/Branch/Function カバレッジを算出する | 必須   |
| FR-004 | レポート出力               | ハンドラ単位のカバレッジ結果を構造化データ（JSON）およびテーブル形式（Markdown）で出力する                                | 必須   |
| FR-005 | 修正対象ハンドラの特定     | コマンドライン引数またはオプションで修正対象のハンドラ名（チャンネル名）を指定可能にする                                  | 必須   |
| FR-006 | 判定結果の自動出力         | Phase 7 判定ルールに基づき、修正対象ハンドラのカバレッジが基準を満たすかの判定結果（PASS/FAIL）を出力する                 | 必須   |
| FR-007 | 複数ファイル対応           | `skillHandlers.ts` 以外の IPC ハンドラファイルにも適用可能な汎用的なインターフェースで設計する                            | 推奨   |

### Step 2: 非機能要件の抽出

| NFR-ID  | 要件名             | 説明                                                                                           | 優先度 |
| ------- | ------------------ | ---------------------------------------------------------------------------------------------- | ------ |
| NFR-001 | 実行速度           | `skillHandlers.ts`（約1,075行・23ハンドラ）の解析を5秒以内に完了する                           | 必須   |
| NFR-002 | エラーハンドリング | 不正なカバレッジ JSON、存在しないファイルパス、AST解析失敗に対して明確なエラーメッセージを返す | 必須   |
| NFR-003 | テストカバレッジ   | 集計スクリプト自体のテストカバレッジが Lines 80%、Functions 80%、Branches 60% 以上             | 必須   |
| NFR-004 | P41対策            | v8 カバレッジプロバイダのインライン関数カウント問題を考慮した集計ロジックを実装する            | 必須   |
| NFR-005 | P40対策            | モノレポ環境でのテスト実行ディレクトリ依存を考慮し、パスの解決を相対パスベースで行う           | 必須   |
| NFR-006 | 型安全             | TypeScript strict モードでコンパイルが通り、`any` 型を使用しない                               | 必須   |
| NFR-007 | 依存関係の最小化   | ts-morph 以外の追加依存を最小限に抑える（Vitest / Node.js 標準ライブラリを優先利用）           | 推奨   |

### Step 3: 受け入れ基準の作成

| 要件ID  | 受け入れ基準                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001  | `skillHandlers.ts` の23個のハンドラ（3登録関数: registerSkillHandlers 14、registerSkillScheduleHandlers 5、registerSkillDocsHandlers 4）全てのチャンネル名と行範囲が正しく検出される                                                 |
| FR-002  | Vitest `--coverage --coverage.reporter=json` で出力された v8 カバレッジ JSON を正常に解析でき、各行のヒットカウントが取得できる                                                                                                      |
| FR-003  | `skill:remove` ハンドラのカバレッジが事実上100%であることを正しく算出する（UT-FIX-SKILL-REMOVE-INTERFACE-001 のテスト実行結果と一致）                                                                                                |
| FR-004  | JSON 出力には `CoverageReport` 構造（`handlers[]` / `summary` / `p41Note`）が含まれ、各ハンドラ要素に `handler.channelName`, `handler.startLine`, `handler.endLine`, `lineCoverage`, `branchCoverage`, `functionCoverage` が含まれる |
| FR-005  | `--target skill:remove` のようなオプションで修正対象ハンドラを指定できる                                                                                                                                                             |
| FR-006  | Phase 7 判定ルール4条に基づく PASS/FAIL 判定が出力に含まれる                                                                                                                                                                         |
| FR-007  | 入力パラメータとしてファイルパスを受け取るインターフェースであり、`skillHandlers.ts` に依存するハードコードがない                                                                                                                    |
| NFR-001 | `skillHandlers.ts` の解析が5秒以内に完了する（CI環境を想定）                                                                                                                                                                         |
| NFR-002 | 不正入力に対して `Error` を投げ、エラーメッセージに原因が含まれる                                                                                                                                                                    |
| NFR-003 | `pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'` で Lines 80%以上を達成                                                                                          |
| NFR-004 | インライン arrow function がハンドラ内に存在しても、Function カバレッジが不当に低下しない集計方法を使用する                                                                                                                          |

### Step 4: スコープ定義

#### 含むもの

1. **カバレッジ集計スクリプト** (`scripts/coverage-by-handler.ts`)
   - TypeScript AST 解析によるハンドラ境界検出
   - v8 カバレッジ JSON の解析・突合
   - ハンドラ単位 Line/Branch/Function カバレッジの算出
   - JSON・Markdown 形式でのレポート出力
   - 修正対象ハンドラの指定オプション
   - Phase 7 判定ルールに基づく PASS/FAIL 判定

2. **集計スクリプトのテスト** (`scripts/coverage-by-handler.test.ts`)
   - AST 解析の正確性テスト
   - カバレッジ算出ロジックのユニットテスト
   - エラーハンドリングテスト
   - P41 対策のテスト

3. **Phase 7 判定ルール文書化**
   - `quality-requirements.md` への判定ルール追記
   - Phase 7 テンプレートへのレポートセクション追加

#### 含まないもの

- `skillHandlers.ts` のファイル分割（UT-FIX-7-1-002 のスコープ）
- `skill:remove` 以外のハンドラへのテスト追加
- Vitest 本体のカスタムレポータープラグイン作成
- 他の IPC ハンドラファイルへのスクリプト適用（汎用的設計は行うが、実適用は対象外）

### Step 5: Phase 7 判定ルールの要件定義

以下の4ルールを Phase 7 カバレッジ判定の標準ルールとして定義する。

| ルールID | ルール名                         | 条件                                                                                       | 判定     |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Rule-1   | 修正対象ハンドラ基準充足         | 修正対象ハンドラの Line/Function/Branch カバレッジが全て最低基準（80%/80%/60%）を満たす    | PASS     |
| Rule-2   | ファイル全体基準未達の許容       | ファイル全体のカバレッジが最低基準未達でも、未達の原因が修正対象外ハンドラに限定される場合 | PASS     |
| Rule-3   | 未カバーハンドラの未タスク化     | Rule-2 適用時、未カバーハンドラのテスト追加を Phase 12 で未タスクとして検出・登録する      | 必須対応 |
| Rule-4   | Branch Coverage ファイル全体基準 | ファイル全体の Branch Coverage が最低基準（60%）を満たす必要がある                         | 必須     |

## 統合テスト連携

### データフロー

```
Vitest --coverage (v8 JSON出力)
  → coverage-by-handler.ts (AST解析 + カバレッジ突合)
    → ハンドラ単位レポート (JSON/Markdown)
      → Phase 7 判定 (PASS/FAIL)
```

### 統合ポイント

| 統合ポイント          | 入力                            | 出力                                 | 検証方法                     |
| --------------------- | ------------------------------- | ------------------------------------ | ---------------------------- |
| Vitest カバレッジ出力 | テスト実行                      | `coverage/coverage-final.json`       | JSON スキーマ検証            |
| AST 解析              | TypeScript ソースファイル       | ハンドラ一覧（チャンネル名・行範囲） | 既知のハンドラ数との一致     |
| カバレッジ突合        | ハンドラ行範囲 + v8 JSON        | ハンドラ単位カバレッジ数値           | skill:remove 100% の検証     |
| Phase 7 判定          | ハンドラ単位カバレッジ + ルール | PASS/FAIL 判定                       | Rule-1〜4 の各パターンテスト |

## 多角的チェック観点

| 観点               | チェック項目                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 要件の完全性       | 全ての機能要件・非機能要件が検証可能な受け入れ基準を持つか                               |
| スコープの明確性   | 含むもの・含まないものの境界が明確で、曖昧な表現がないか                                 |
| P41 対策の十分性   | v8 インライン関数カウント問題がカバレッジ算出ロジックに与える影響を全て特定しているか    |
| P40 対策の十分性   | モノレポ環境でのパス解決がテスト実行ディレクトリに依存しない設計になっているか           |
| 判定ルールの網羅性 | Rule-1〜4 がカバレッジ判定の全パターンを網羅しているか（エッジケースの見落としがないか） |
| 既存基準との整合性 | `quality-requirements.md` の既存カバレッジ閾値と Phase 7 判定ルールが矛盾しないか        |

## 成果物

| 成果物       | パス                                         | 説明                |
| ------------ | -------------------------------------------- | ------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR の完全な定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の検証基準    |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 含む/含まないの境界 |

## 完了条件

- [ ] 機能要件（FR-001〜FR-007）が全て定義されている
- [ ] 非機能要件（NFR-001〜NFR-007）が全て定義されている
- [ ] 各要件に検証可能な受け入れ基準が対応している
- [ ] Phase 7 判定ルール（Rule-1〜Rule-4）が定義されている
- [ ] スコープの「含むもの」「含まないもの」が明確に定義されている
- [ ] P41・P40 の対策が要件に反映されている
- [ ] 成果物が全て作成されている

## サブタスク管理

| サブタスク                    | 担当           | 依存関係  | 状態   |
| ----------------------------- | -------------- | --------- | ------ |
| Task 1: 機能要件の抽出        | AIエージェント | なし      | 未実施 |
| Task 2: 非機能要件の抽出      | AIエージェント | なし      | 未実施 |
| Task 3: 受け入れ基準の作成    | AIエージェント | Task 1, 2 | 未実施 |
| Step 4: スコープ定義          | AIエージェント | Task 1, 2 | 未実施 |
| Step 5: Phase 7判定ルール定義 | AIエージェント | Task 1    | 未実施 |

## タスク100%実行確認【必須】

- [ ] Task 1〜3 および Step 4〜5 の全てが完了している
- [ ] 成果物3件の全てが指定パスに出力されている
- [ ] 完了条件チェックリストの全項目がチェック済みである
- [ ] 次の Phase（Phase 2）に進むために必要な情報が全て揃っている

## 次のPhase

→ [Phase 2: 設計](./phase-2-design.md)
