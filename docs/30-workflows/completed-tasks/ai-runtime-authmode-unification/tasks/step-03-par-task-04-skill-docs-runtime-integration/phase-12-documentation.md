# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                                                                                                          |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 更新日     | 2026-03-16                                                                                                                                                                                                  |
| 機能名     | skill-docs-runtime-integration                                                                                                                                                                              |

## 目的

Skill Docs 生成の AI runtime 統合の実装内容を実装ガイド・システム仕様書・変更履歴・未タスク検出・スキルフィードバックの5タスクで体系的に記録し、仕様と実装の乖離を防止する。

## 実行タスク

- T-12-1: 2部構成の実装ガイド（初学者向け/技術者向け）を作成する
- T-12-2: system spec 5ファイルの更新計画と実施順を確定する
- T-12-3: documentation-changelog を全Step完了後に記録する
- T-12-4: 未タスク検出を実施し、0件でもレポートを出力する
- T-12-5: スキルフィードバックを改善点の有無に関わらず記録する

| タスクID | タスク名                     | 内容                                                                               |
| -------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| T-12-1   | 実装ガイド作成               | Part 1（中学生レベル概念説明）と Part 2（開発者向け実装詳細）の2部構成で作成する   |
| T-12-2   | システム仕様書更新           | 5つの同期先仕様書を Step 1-A ~ Step 2 の手順で更新する                             |
| T-12-3   | documentation-changelog      | 更新した全仕様書の変更内容を事後記録する（P4/P51 対策: 全 Step 完了後に記録）      |
| T-12-4   | 未タスク検出レポート         | 残件を検出し formalize する（0件でも出力必須）。検出時は3ステップ全完了（P3 対策） |
| T-12-5   | スキルフィードバックレポート | 改善観点を記録する（改善点なしでも出力必須 - P28 対策）                            |

## Task 1: 実装ガイド作成（T-12-1）

### Part 1: 中学生レベル概念説明

「お店の注文伝票」の例えで Skill Docs 生成の仕組みを説明する。

| 現実世界の例え         | システムの対応概念          | 説明                                                                                 |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| 注文伝票               | DocGenerationRequest        | お客さん（ユーザー）が「このスキルの説明書を作って」と注文する                       |
| 厨房の料理人           | LLMDocQueryAdapter          | 注文を受け取って、AI（LLM）に「この材料で説明書を作って」とお願いする仲介役          |
| 料理の結果レシート     | DocOperationResult<T>       | 料理が成功したか失敗したかの結果。失敗理由（材料切れ=API key 未設定 等）も書いてある |
| 厨房の能力チェック     | SkillDocsCapabilityResolver | 「今日の料理人は出勤してる？材料はある？」を確認して、注文を受けられるか判断する     |
| 注文窓口（カウンター） | IPC チャンネル              | お客さんと厨房をつなぐ窓口。4つの窓口（generate/preview/export/templates）がある     |

### Part 2: 開発者向け実装詳細

#### LLMDocQueryAdapter インターフェース

```typescript
interface LLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
```

- `query()`: LLM プロバイダに prompt を送信し、生成されたテキストを返す
- `isAvailable()`: API key が設定済みかつプロバイダが応答可能かを判定する
- `getProviderName()`: 現在のプロバイダ名（"anthropic", "openai" 等）を返す

#### DocOperationResult<T> 型

```typescript
interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number; // エラーコード（2001-5001）
    category: string;
    message: string;
    retryable: boolean;
    guidance?: string; // ユーザー向けガイダンステキスト
  };
}
```

#### SkillDocsCapabilityResolver

3つの capability path の判定ロジック:

| Path             | 判定条件                                         | UI 状態          |
| ---------------- | ------------------------------------------------ | ---------------- |
| integrated-api   | API key 有効 & LLM プロバイダ応答可能            | ready            |
| guidance-only    | API key 未設定 or 無効                           | guidance-only    |
| terminal-handoff | LLM 応答不可（timeout/error 後のフォールバック） | terminal handoff |

#### 使用例: docs 生成フロー

```typescript
const resolver = new SkillDocsCapabilityResolver(adapter);
const capability = await resolver.resolve();

if (capability.capability === "integrated-api") {
  const result: DocOperationResult<GeneratedDoc> =
    await generator.generate(request);
  if (result.success) {
    // result.data に生成されたドキュメント
  } else {
    // result.error.guidance にユーザー向けガイダンス
  }
}
```

#### エラーハンドリング

| エラーコード | エラー種別       | retryable | 推奨対処                          |
| ------------ | ---------------- | --------- | --------------------------------- |
| 2001         | API key 未設定   | false     | Settings 画面で API key を登録    |
| 2002         | API key 無効     | false     | Settings 画面で API key を再登録  |
| 3001         | LLM timeout      | true      | 再試行 or terminal handoff        |
| 3002         | LLM rate limit   | true      | 自動再試行（exponential backoff） |
| 3003         | LLM server error | true      | 再試行 or terminal handoff        |
| 4001         | IPC 通信エラー   | true      | アプリ再起動 or 再試行            |
| 5001         | 内部エラー       | false     | ログを確認し Issue を報告         |

## Task 2: システム仕様書更新（T-12-2）

### 仕様同期計画

| #   | 同期先仕様書                                                  | 更新内容                                                                             | エージェント分割     |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| 1   | interfaces-agent-sdk-skill-reference-share-debug-analytics.md | LLMDocQueryAdapter / DocOperationResult 型定義追加、SkillDocsCapabilityResolver 記載 | Agent A（3ファイル） |
| 2   | api-ipc-agent-details.md                                      | 4チャンネルのレスポンス形式拡張（DocOperationResult 導入）を記録                     | Agent A              |
| 3   | security-electron-ipc-advanced.md                             | 4チャンネルの P42 3段バリデーション / sender 検証 / エラー境界の追加を記録           | Agent A              |
| 4   | task-workflow.md                                              | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 完了記録、残課題テーブル更新                      | Agent B（2ファイル） |
| 5   | lessons-learned.md                                            | 実装で得た教訓（capability resolver パターン等）を記録                               | Agent B              |

> P43 対策: 仕様書更新は 3ファイル以下/エージェントに分割する

### Step 1-A: タスク完了記録

- [ ] 該当仕様書（interfaces-agent-sdk-skill-reference-share-debug-analytics.md 等）にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** - P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

### Step 1-B: 実装状況テーブル更新

- [ ] interfaces-agent-sdk-skill-reference-share-debug-analytics.md の実装ステータスを `spec_created` -> `implemented` に更新

### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-IMP-SKILL-DOCS" references/` で関連仕様書を検索
- [ ] 検出された全仕様書の関連タスクテーブルを更新

### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27 対策）
- [ ] 再生成後の diff で indexes/ ディレクトリの変更を確認

### Step 2: システム仕様更新（該当する場合）

新規インターフェース（LLMDocQueryAdapter, DocOperationResult, SkillDocsCapabilityResolver）があるため、以下を更新する:

- [ ] interfaces-agent-sdk-skill-reference-share-debug-analytics.md に型定義セクションを追加
- [ ] architecture-overview.md の registerSkillDocsHandlers 記載を更新（該当する場合）

## Task 3: documentation-changelog.md（T-12-3）

> P4/P51 対策: 全 Step 完了後に事後記録する。実行前に「完了」と記載しない。

記録内容:

- [ ] 更新した全仕様書のファイルパスと変更内容
- [ ] Step 1-A ~ Step 2 の各ステップの完了結果を詳細に記録
- [ ] 未完了のステップがある場合はその理由を明記

## Task 4: 未タスク検出レポート（T-12-4）

> P3 対策: 検出した未タスクは3ステップ全完了が必須

1. `unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

- [ ] `unassigned-task-report.md` を作成（**0件でも出力必須**）
- [ ] 検出された未タスクの GitHub Issue を `auto-create-issue.sh` で自動作成
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close（P56 対策）

## Task 5: スキルフィードバックレポート（T-12-5）

> P28 対策: 改善点なしでも出力必須

記録観点:

- CapabilityResolver パターンの他機能への適用可能性
- DocOperationResult のエラー分類が他の IPC ハンドラに流用できるか
- LLMDocQueryAdapter の DI パターンの汎用性

## 参照資料

| 参照資料                    | パス                                                                                                              | 内容                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                                                         | 要件と受入基準を確認する                     |
| Phase 2（設計）             | `phase-2-design.md`                                                                                               | LLMDocQueryAdapter / DocOperationResult 設計 |
| Phase 5（実装）             | `phase-5-implementation.md`                                                                                       | 実装コードを確認する                         |
| Phase 6（テスト拡充）       | `outputs/phase-6/regression-plan.md`                                                                              | 失敗パス・回帰テストの観点を確認する         |
| Phase 7（カバレッジ確認）   | `outputs/phase-7/coverage-plan.md`                                                                                | coverage gap と優先補完対象を確認する        |
| Phase 8（リファクタリング） | `outputs/phase-8/refactor-plan.md`                                                                                | 責務分離後の設計差分を確認する               |
| Phase 9（品質検証）         | `outputs/phase-9/qa-checklist.md`                                                                                 | lint/typecheck/test 品質基準を確認する       |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                                                        | レビュー指摘事項の対応状況を確認する         |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                                                         | 手動テスト結果を確認する                     |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体（queryFn DI）を確認する        |
| SkillDocsCapabilityResolver | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`                                             | capability 判定ロジックを確認する            |
| ipc index                   | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の登録を確認する   |
| task UT-9I-001              | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクとの関係を確認する       |

### システム仕様（aiworkflow-requirements）

> Phase 12 では以下の正本仕様を更新対象とする。更新前に現在の内容を確認し、差分を最小化する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | 4チャンネルの IPC 契約（更新対象）               |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | 型定義と public contract（更新対象）             |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | セキュリティ設定（更新対象）                     |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | タスク完了記録と残課題（更新対象）               |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                            | 教訓記録（更新対象）                             |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本（参照のみ） |

## 実行手順

### ステップ1: 参照資料と前提 Phase の成果物を確認する

Phase 1-11 の成果物を確認し、実装内容とテスト結果を把握する。特に Phase 2 の設計（型定義）と Phase 10 のレビュー指摘を重点的に確認する。

### ステップ2: Task 1 ~ Task 5 を順番に実施する

Task 1（実装ガイド）-> Task 2（仕様書更新）-> Task 3（changelog）-> Task 4（未タスク検出）-> Task 5（フィードバック）の順に処理する。Task 3 は Task 2 の全 Step 完了後に記録する（P4 対策）。

### ステップ3: system spec との整合を最終確認する

`git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証し、更新漏れがないことを確認する（P43 対策）。

### ステップ4: 成果物と完了条件を確認する

全成果物が出力パスに存在し、完了条件の全チェック項目が満たされていることを確認する。

## 成果物

| 成果物               | パス                                            | 内容                                                                                     |
| -------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（中学生レベル概念説明）と Part 2（開発者向け API シグネチャ・使用例・エラー処理） |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 全 Step の完了結果を事後記録（P4/P51 対策）                                              |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件 formalize（0件でも出力。検出時は3ステップ全完了 - P3 対策）                         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録（0件でも出力 - P28 対策）                                                 |
| 仕様同期計画         | `outputs/phase-12/system-spec-sync-plan.md`     | 5ファイルの更新方針とエージェント分割（P43 対策: 3ファイル以下/エージェント）            |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1（中学生レベル概念説明）と Part 2（開発者向け詳細）が作成されている
- [ ] Task 2 Step 1-A: LOGS.md x2 / SKILL.md x2 のタスク完了記録が更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 1-D: topic-map.md が再生成されている（`node generate-index.js` 実行済み）
- [ ] Task 2 Step 2: 新規インターフェースの型定義が仕様書に反映されている
- [ ] Task 3: documentation-changelog.md が全 Step 完了後に事後記録されている
- [ ] Task 4: unassigned-task-detection.md が作成されている（0件でも出力）
- [ ] Task 5: skill-feedback-report.md が作成されている（0件でも出力）
- [ ] spec sync 先5ファイルが全て定義・更新されている
- [ ] `git diff --stat -- .claude/skills/` で更新漏れがないことが確認されている

## 既知の落とし穴

| Pitfall | 内容                                         | 対策                                                               |
| ------- | -------------------------------------------- | ------------------------------------------------------------------ |
| P1/P25  | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements と task-specification-creator の両方を更新 |
| P2/P27  | topic-map.md 再生成忘れ                      | `node generate-index.js` 実行後に indexes/ の diff を確認          |
| P3      | 未タスク管理の3ステップ不完全                | 指示書 -> 残課題テーブル -> 関連仕様書リンクの全ステップ実行       |
| P4      | documentation-changelog への早期「完了」記載 | 全 Step 完了後に事後記録する                                       |
| P28     | スキルフィードバックレポート未作成           | 改善点なしでも出力必須                                             |
| P43     | サブエージェントの rate limit 中断           | 仕様書更新は 3ファイル以下/エージェントに分割                      |
| P51     | サブエージェントの changelog 早期完了記載    | changelog は事後記録、完了後に git diff で検証                     |
| P56     | 再評価クローズ時の GitHub Issue Close 漏れ   | `gh issue close` を同時実行                                        |

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
