# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                                                                                                                                                                    |
| Phase名    | PR作成                                                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                                                                                                                                    |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト）、Phase 12（ドキュメント） |
| 後続Phase  | なし                                                                                                                                                                                                                                  |
| ステータス | not_started                                                                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                                                                            |
| 更新日     | 2026-03-16                                                                                                                                                                                                                            |
| 機能名     | skill-docs-runtime-integration                                                                                                                                                                                                        |

## 目的

Skill Docs 生成の AI runtime 統合の全変更を PR として整理し、レビュアーが変更範囲・テスト計画・後方互換性を迅速に把握できる説明素材を準備する。

## 実行タスク

- T-13-1: 変更範囲を新規/変更/影響の3区分で整理する
- T-13-2: PR 本文を Summary/Test Plan/Breaking Changes 形式で作成する
- T-13-3: lint/typecheck/test/spec sync の最終チェックを実施する

| タスクID | タスク名               | 内容                                                            |
| -------- | ---------------------- | --------------------------------------------------------------- |
| T-13-1   | 変更範囲のサマリー整理 | 新規/変更/影響ファイルを分類し、変更の意図と範囲を明確化する    |
| T-13-2   | PR 本文テンプレート    | Summary / Test Plan / Breaking Changes を含む PR 本文を作成する |
| T-13-3   | PR チェックリスト      | lint / typecheck / test / spec sync の全 PASS を確認する        |

## T-13-1: 変更範囲のサマリー整理

### 新規ファイル

| ファイル                    | 内容                                                      |
| --------------------------- | --------------------------------------------------------- |
| LLMDocQueryAdapter          | LLM プロバイダへの query/isAvailable/getProviderName DI   |
| DocOperationResult<T>       | success/data/error（code, category, retryable, guidance） |
| SkillDocsCapabilityResolver | integrated-api / guidance-only / terminal-handoff 判定    |

### 変更ファイル

| ファイル                  | 変更内容                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| SkillDocGenerator         | queryFn DI を LLMDocQueryAdapter に拡張。DocOperationResult でラップ |
| registerSkillDocsHandlers | capability チェック追加。エラーレスポンスに guidance フィールド追加  |
| IPC 型定義                | 4チャンネルのレスポンス型を DocOperationResult<T> に変更             |

### 影響範囲

| 影響対象                        | 影響内容                                                |
| ------------------------------- | ------------------------------------------------------- |
| skill:docs:generate チャンネル  | レスポンス型が DocOperationResult<GeneratedDoc> に変更  |
| skill:docs:preview チャンネル   | レスポンス型が DocOperationResult<string> に変更        |
| skill:docs:export チャンネル    | レスポンス型が DocOperationResult<ExportResult> に変更  |
| skill:docs:templates チャンネル | レスポンス型が DocOperationResult<DocTemplate[]> に変更 |
| Renderer 側 Skill Docs UI       | 7つの UI 状態に対応する状態遷移ロジック追加             |

## T-13-2: PR 本文テンプレート

### Summary

```markdown
## Summary

- Skill Docs 生成に LLMDocQueryAdapter を導入し、stub 依存を排除して実 LLM プロバイダと接続
- DocOperationResult<T> 型で 7 種別のエラー分類（retryable フラグ + ユーザー向け guidance）を統一
- SkillDocsCapabilityResolver で API key 有無に応じた 3 path（integrated-api / guidance-only / terminal-handoff）を自動判定
```

### Test Plan

```markdown
## Test Plan

- **Unit Tests**: LLMDocQueryAdapter / DocOperationResult / SkillDocsCapabilityResolver の単体テスト全 PASS
- **Integration Tests**: 4 IPC チャンネルの E2E テスト全 PASS
- **Coverage**: Line XX% / Branch XX% / Function XX%（Phase 7 確認済み）
- **Manual Tests**: TC-11-01 ~ TC-11-05 の 5 シナリオ全 PASS（Phase 11 確認済み）
```

### Breaking Changes

```markdown
## Breaking Changes

### IPC レスポンス形式の拡張（後方互換あり）

4つの skill:docs:\* チャンネルのレスポンスが `DocOperationResult<T>` でラップされました。

**Before:**

- `skill:docs:generate` -> `GeneratedDoc | Error`

**After:**

- `skill:docs:generate` -> `DocOperationResult<GeneratedDoc>`
  - `result.success === true` の場合: `result.data` に GeneratedDoc
  - `result.success === false` の場合: `result.error` にエラー詳細

**互換性**: Renderer 側は `result.success` チェックを追加する必要がありますが、
既存の try/catch パターンは引き続き動作します（IPC 例外は変更なし）。
```

## T-13-3: PR チェックリスト

### コード品質

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop test` が全 PASS している
- [ ] `--no-verify` を使用していない

### Phase 完了確認

- [ ] Phase 9（品質検証）: lint / typecheck / 全テスト PASS
- [ ] Phase 10（最終レビュー）: PASS 判定（MINOR 指摘は未タスク化済み）
- [ ] Phase 11（手動テスト）: TC-11-01 ~ TC-11-05 全 PASS
- [ ] Phase 12（ドキュメント）: 5タスク全完了、spec sync 5ファイル更新済み

### 仕様同期確認

- [ ] interfaces-agent-sdk-skill-reference-share-debug-analytics.md が更新されている
- [ ] api-ipc-agent-details.md が更新されている
- [ ] security-electron-ipc-advanced.md が更新されている
- [ ] task-workflow.md が更新されている
- [ ] lessons-learned.md が更新されている
- [ ] topic-map.md が再生成されている

### ブランチ / PR 規約

- [ ] ブランチ名が `feature/skill-docs-runtime-integration` プレフィックス
- [ ] PR タイトルが 70 文字以内
- [ ] main ブランチに直接 push していない

## 参照資料

| 参照資料                    | パス                                                                  | 内容                                       |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                             | 要件と受入基準を確認する                   |
| Phase 2（設計）             | `phase-2-design.md`                                                   | 型定義とアーキテクチャ設計を確認する       |
| Phase 5（実装）             | `phase-5-implementation.md`                                           | 実装コードの変更範囲を確認する             |
| Phase 6（テスト拡充）       | `outputs/phase-6/regression-plan.md`                                  | 失敗パス・回帰テストの補完状況を確認する   |
| Phase 7（カバレッジ確認）   | `outputs/phase-7/coverage-plan.md`                                    | coverage gap の収束状況を確認する          |
| Phase 8（リファクタリング） | `outputs/phase-8/refactor-plan.md`                                    | 責務分離後の差分を確認する                 |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                        | lint / typecheck / test の結果を確認する   |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                            | レビュー判定結果を確認する                 |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                             | 手動テスト結果を確認する                   |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                                           | 仕様書更新状況を確認する                   |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | docs 生成本体を確認する                    |
| SkillDocsCapabilityResolver | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | capability 判定ロジックを確認する          |
| ipc index                   | `apps/desktop/src/main/ipc/index.ts`                                  | registerSkillDocsHandlers の登録を確認する |

### システム仕様（aiworkflow-requirements）

> PR 作成前に以下の正本仕様が更新済みであることを確認する。

| 参照資料                   | パス                                                                                                              | 内容                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | 4チャンネルの IPC 契約（Phase 12 で更新済み）   |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | 型定義と public contract（Phase 12 で更新済み） |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | セキュリティ設定（Phase 12 で更新済み）         |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | タスク完了記録（Phase 12 で更新済み）           |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                            | 教訓記録（Phase 12 で更新済み）                 |

## 実行手順

### ステップ1: 変更範囲を確認する

`git diff --stat main..HEAD` で変更ファイル一覧を取得し、T-13-1 の変更範囲サマリーと一致することを確認する。

### ステップ2: PR チェックリストを実行する

T-13-3 の全チェック項目を順番に確認し、全て PASS であることを確認する。1つでも FAIL がある場合は該当 Phase に戻って修正する。

### ステップ3: PR 本文を作成する

T-13-2 のテンプレートに実際の数値（カバレッジ、テスト数）を埋め込み、PR 本文を完成させる。

### ステップ4: 成果物を確認し PR 作成準備を完了する

PR サマリ下書きが完成し、全チェック項目が PASS であることを最終確認する。

## 成果物

| 成果物                | パス                                       | 内容                                                  |
| --------------------- | ------------------------------------------ | ----------------------------------------------------- |
| PR サマリ下書き       | `outputs/phase-13/pr-summary-draft.md`     | Summary / Test Plan / Breaking Changes を含む PR 本文 |
| PR チェックリスト結果 | `outputs/phase-13/pr-checklist-result.md`  | T-13-3 の全チェック項目の PASS/FAIL 結果              |
| 変更範囲サマリー      | `outputs/phase-13/change-scope-summary.md` | 新規/変更/影響ファイルの分類と git diff サマリー      |

## 完了条件

- [ ] T-13-1: 変更範囲（新規/変更/影響）が分類・整理されている
- [ ] T-13-2: PR 本文（Summary / Test Plan / Breaking Changes）が作成されている
- [ ] T-13-3: lint / typecheck / test 全 PASS が確認されている
- [ ] T-13-3: Phase 12 の spec sync 5ファイルが全て更新済みであることが確認されている
- [ ] T-13-3: `--no-verify` が使用されていないことが確認されている
- [ ] PR 用の説明素材が全て揃っている

## 既知の落とし穴

| Pitfall | 内容                        | 対策                                                     |
| ------- | --------------------------- | -------------------------------------------------------- |
| P37     | ドキュメント数値の早期固定  | テスト数・カバレッジは実際のファイルからカウントして記載 |
| P29     | SKILL.md 変更履歴の更新漏れ | Phase 12 完了を確認してから PR を作成                    |

## 次のPhase

- なし（仕様書作成完了）
