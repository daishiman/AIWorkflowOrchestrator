# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Phase      | 10                                                                         |
| Phase名    | 最終レビュー                                                               |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                         |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 9（品質検証） |
| 後続Phase  | Phase 11（手動テスト）                                                     |
| ステータス | completed                                                                  |
| 作成日     | 2026-03-13                                                                 |
| 更新日     | 2026-03-16                                                                 |
| 機能名     | skill-docs-runtime-integration                                             |

## 目的

Skill Docs 生成の AI runtime 統合の release 可否を最終レビューする。受入基準の充足を検証し、多角的品質レビューで release blocker を判定する。MINOR 指摘は全て未タスク仕様書に変換する（省略不可）。

## 受入基準

Phase 1 で定義された受入基準を最終検証する。

| ID   | 受入基準                                                              | 検証方法                                                               |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AC-1 | docs 生成に必要な runtime 要件が定義され実装されている                | LLMDocQueryAdapter の実装と DI 経路を確認する                          |
| AC-2 | stub 排除の対象範囲が明確で production 経路から stub が除去されている | stubQueryFn が production 条件分岐で使用されないことを grep で確認する |
| AC-3 | terminal handoff の 3 経路が定義され UI に反映されている              | timeout / missing credentials / rate limit の UI 状態遷移を確認する    |
| AC-4 | access matrix の Skill Docs 適用方針が Task01 と整合している          | SkillDocsCapabilityResolver の 3 path を Task01 設計と照合する         |

## 実行タスク

### T-10-1: 受入基準の最終検証

4 つの受入基準を逐次検証する。

- **AC-1 検証: runtime 要件の実装確認**
  - LLMDocQueryAdapter インターフェースが実装されていること
  - query() / isAvailable() / getProviderName() の 3 メソッドが機能すること
  - AuthKeyService との連携で API key 検証が行われていること
  - SkillDocGenerator への DI 経路（Setter Injection）が Phase 2 設計どおりであること

- **AC-2 検証: stub 排除の確認**
  - stubQueryFn が production 経路で使用されていないこと
    ```bash
    grep -rn "stubQueryFn\|stub.*query\|mock.*query" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\.\|\.spec\.\|__test__"
    ```
  - テスト専用のモックと production コードの境界が明確であること
  - UT-9I-001 の scope と本タスクの scope の重複がないこと

- **AC-3 検証: terminal handoff の 3 経路**
  - timeout（30 秒超過）: `timeout-guidance` 状態で guidance + retry + terminal handoff が表示されること
  - missing credentials（API key 未設定）: `guidance-only` 状態で Settings 導線が表示されること
  - rate limit（429 応答）: `rate-limit-wait` 状態で待機時間と再試行が表示されること
  - terminal handoff では prompt context と suggested command を提供し、自動実行しないこと（Task01 禁止事項）

- **AC-4 検証: access matrix 整合**
  - SkillDocsCapabilityResolver の 3 path 判定ロジック:
    1. API key 有効 + LLM 到達可能 → `integrated-api`
    2. API key 未設定 → `guidance-only`
    3. API key 有効 + LLM 到達不可 → `terminal-handoff`
  - Task01 の共通 access matrix 契約との整合を照合する
  - consumer subscription token をアプリ内自動実行に使わない制約が維持されていること

### T-10-2: 多角的品質レビュー

6 観点 + 実装観点で品質を検証する。

- **観点 1: 要件充足**
  - Phase 1 の完了条件 7 項目が全て満たされていること
  - エラー分類コード体系（7 種別）が実装に反映されていること

- **観点 2: 設計整合**
  - Phase 2 の設計（queryFn 差し替え、失敗ポリシー、capability resolver）が実装と一致していること
  - DocOperationResult の error 拡張が既存契約と後方互換であること

- **観点 3: セキュリティ**
  - 4 層セキュリティ検証が Phase 9 で確認済みであること
  - API key / token のログ出力がないこと
  - パストラバーサル防御（export）の二重防御が機能していること

- **観点 4: UI/UX**
  - 7 状態の遷移にデッドロックがないこと（Phase 9 確認済み）
  - guidance block のマイクロコピーが Task01 UI/UX 正本に準拠していること
  - silent fallback がないこと

- **観点 5: テスト品質**
  - カバレッジ基準（Line >= 80%, Branch >= 60%, Function >= 80%）が維持されていること
  - エラーケース（7 種別）の全てにテストが存在すること
  - 境界値テスト（timeout 直前/直後、retry 上限）が存在すること

- **観点 6: 契約整合**
  - IPC 4 チャンネルの public contract が api-ipc-agent-details.md 正本と一致していること
  - DocGenerationRequest / GeneratedDoc の型が interfaces-agent-sdk-skill-reference-share-debug-analytics.md 正本と一致していること
  - Pattern 3 登録が architecture-overview.md 正本と一致していること

- **観点 7: 実装品質（Phase 3 に追加）**
  - Phase 8 のリファクタリングで SRP が達成されていること
  - PromptBuilder / ErrorMapper / withDocHandler の責務分離が適切であること
  - 不要な依存や循環参照がないこと

### T-10-3: Release Blocker 判定

レビュー結果を集約し、release 可否を判定する。

- 各観点の指摘を severity で分類する

  | severity | 定義                         | 対応                     |
  | -------- | ---------------------------- | ------------------------ |
  | blocker  | release を阻止する重大な問題 | 即時修正（戻り先を決定） |
  | major    | 機能に影響する問題           | Phase 1-5 へ戻る         |
  | minor    | 機能に影響しない改善点       | 未タスク仕様書に変換     |
  | info     | 情報共有のみ                 | 記録のみ                 |

- **MINOR 指摘の未タスク化（省略不可）**
  - MINOR 判定の指摘は全て未タスク仕様書に変換する
  - 「機能影響なし」でも省略しない（05-task-execution.md 準拠）
  - 未タスクの 3 ステップを完了する:
    1. `unassigned-task/` に指示書を作成する
    2. `task-workflow.md` 残課題テーブルに登録する
    3. 関連仕様書に参照リンクを追加する

## レビューゲート

| 判定     | 条件                             | 次のアクション                                              |
| -------- | -------------------------------- | ----------------------------------------------------------- |
| PASS     | 重大な問題がない                 | Phase 11 に進む                                             |
| MINOR    | 軽微な指摘がある（機能影響なし） | 全指摘を未タスク仕様書に変換後、Phase 11 に進む（省略不可） |
| MAJOR    | 戻り先が必要な問題がある         | 下表の戻り先へ戻す                                          |
| CRITICAL | 要件再確認が必要な問題がある     | Phase 1 へ戻して再確認する                                  |

| 問題の種類             | 戻り先                      |
| ---------------------- | --------------------------- |
| 要件の問題             | Phase 1（要件定義）         |
| 設計の問題             | Phase 2（設計）             |
| テスト設計の問題       | Phase 4（テスト作成）       |
| 実装の問題             | Phase 5（実装）             |
| リファクタリングの問題 | Phase 8（リファクタリング） |

## 参照資料

| 参照資料                    | パス                                                                                                              | 内容                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                                                         | 受入基準と完了条件を確認する                   |
| Phase 2（設計）             | `phase-2-design.md`                                                                                               | 設計方針とインターフェース定義を確認する       |
| Phase 5（実装）             | `phase-5-implementation.md`                                                                                       | 実装成果物の配置を確認する                     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                                                          | 責務分離の結果を確認する                       |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                                                    | 品質チェック結果を確認する                     |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する                        |
| PromptBuilder               | `apps/desktop/src/main/services/skill/PromptBuilder.ts`                                                           | prompt 構築を確認する                          |
| ErrorMapper                 | `apps/desktop/src/main/services/skill/ErrorMapper.ts`                                                             | エラー変換を確認する                           |
| IPC handlers                | `apps/desktop/src/main/ipc/handlers/skillDocsHandlers.ts`                                                         | 4 チャンネルのハンドラを確認する               |
| ipc index                   | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の DI 経路を確認する |
| task UT-9I-001              | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクとの責務境界を確認する     |
| pack UI/UX 正本             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | guidance block の microcopy 契約を確認する     |
| pack design audit           | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 多角的監査の結論と禁止事項を確認する           |

### システム仕様（aiworkflow-requirements）

> 最終レビュー時に以下の正本仕様と照合し、release 可否を判定する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）          |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成      |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本   |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界） |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本    |

## 実行手順

### ステップ1: Phase 9 の品質検証結果を確認する

Phase 9 の qa-checklist.md、security-verification.md、nonfunctional-report.md を読み込み、既に確認済みの項目と未解決の指摘を把握する。

### ステップ2: T-10-1 の受入基準を逐次検証する

AC-1 から AC-4 を順に検証する。各基準について「PASS / FAIL / 条件付き PASS」を判定する。FAIL の場合は即座に戻り先を決定する。

### ステップ3: T-10-2 の多角的品質レビューを実施する

7 観点で品質を検証する。各観点の指摘を severity で分類し、blocker / major / minor / info に振り分ける。

### ステップ4: T-10-3 の release blocker 判定を行う

指摘を集約してレビューゲート判定（PASS / MINOR / MAJOR / CRITICAL）を決定する。MINOR 指摘がある場合は全て未タスク仕様書に変換してから Phase 11 に進む。

## 統合テスト連携

最終レビューの観点から以下の統合ポイントの release 可否を判定する:

- queryFn: stub → production 差し替えが完了し、production 経路で LLM 応答が取得できること
- provider adapter: API key 検証 → LLM クライアント初期化 → queryFn 注入の経路が end-to-end で機能すること
- timeout: 30 秒 Promise.race → ErrorMapper → DocOperationResult → UI 状態遷移の全経路が機能すること
- retry: exponential backoff が retryable エラーのみで発動し、最大 2 回で停止すること
- guidance: 3 経路（timeout / missing credentials / rate limit）の各 guidance が正しく表示されること

## 成果物

| 成果物           | パス                                      | 内容                                                 |
| ---------------- | ----------------------------------------- | ---------------------------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | 受入基準検証結果、多角的レビュー結果、判定を記録する |
| 指摘一覧         | `outputs/phase-10/review-findings.md`     | 全指摘の severity 分類と対応方針を記録する           |
| 未タスク仕様書   | `outputs/phase-10/unassigned-tasks/`      | MINOR 指摘から変換した未タスク仕様書を格納する       |

## 完了条件

- [ ] AC-1 から AC-4 の受入基準が全て PASS または条件付き PASS である
- [ ] 7 観点の多角的品質レビューが実施され、結果が記録されている
- [ ] release blocker（severity: blocker）が 0 件である
- [ ] MINOR 指摘が全て未タスク仕様書に変換されている（0 件の場合も「0 件」と記録する）
- [ ] 未タスクの 3 ステップ（指示書 → 残課題テーブル → 関連仕様書リンク）が全て完了している
- [ ] レビューゲート判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている

## 既知の落とし穴（関連 Pitfall）

| Pitfall | 内容                                       | 本 Phase での対策                                                           |
| ------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| P3      | 未タスク管理の 3 ステップ不完全            | 指示書 → 残課題テーブル → 関連仕様書リンクの 3 ステップを必ず完了する       |
| P4      | documentation-changelog への早期完了記載   | 全指摘の未タスク化完了前に「完了」と記載しない                              |
| P37     | ドキュメント数値の早期固定                 | テスト数は実際のファイルから `grep -c "it("` でカウントする                 |
| P38     | 未タスク配置ディレクトリ間違い             | 未タスク指示書は `unassigned-task/` 配下に配置する                          |
| P50     | 既実装防御の発見による Phase 転換          | AC 検証前に対象ファイルの現状を確認し、既実装の場合は検証モードに切り替える |
| P52     | 同ファイル内 non-null assertion 残存       | 指摘対象ファイル全体を grep でスキャンする                                  |
| P56     | 再評価クローズ時の GitHub Issue Close 漏れ | 未タスク再評価クローズ時は `gh issue close` を同時実行する                  |

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
