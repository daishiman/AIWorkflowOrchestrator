# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

全体的な品質・整合性を最終検証し、TASK-P0-03（workflow-manifest.json の本番配置）が全ての受入条件（AC-1〜AC-7）を満たし、後続タスク（P0-04/P0-07/P0-09）へのブロッカーがない状態であることを確認する。

## 判定基準

| 判定     | 条件                                                                                | 次の動き                                    |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| PASS     | 全 AC 達成、テスト全 PASS、manifest 整合確認完了、後続タスクへのブロッカーなし      | Phase 11（手動テスト）へ進む                |
| MINOR    | 軽微な修正（命名規則の微調整、コメント追加等）で閉じる（1〜2 箇所）                 | Phase 10 内で修正し、再レビュー             |
| MAJOR    | manifest 構造の不整合、resource path の実在しないファイル参照、双方向参照の不一致   | Phase 5（実装）へ戻る                       |
| CRITICAL | schemaVersion 不一致、phase 順序の根本的誤り、トップレベル構造の破綻、テスト全 FAIL | Phase 1（要件定義）へ戻り、要件を再固定する |

## 実行タスク

### タスク 10-1: 受入条件（AC-1〜AC-7）の達成状況確認

| AC   | 受入条件                                                                           | 検証方法                 | 結果 |
| ---- | ---------------------------------------------------------------------------------- | ------------------------ | ---- |
| AC-1 | `.claude/skills/skill-creator/workflow-manifest.json` が存在する                   | ファイル存在確認         | -    |
| AC-2 | `.agents/skills/skill-creator/workflow-manifest.json` が存在し canonical と同一    | diff コマンド            | -    |
| AC-3 | `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了              | TC-01 PASS               | -    |
| AC-4 | 全 resource の `absolutePath` が実在ファイルを指す                                 | TC-03 PASS               | -    |
| AC-5 | phases が 5 件（requirements-gathering, plan, execute, verify, improve）を順序通り | TC-04 PASS               | -    |
| AC-6 | `schemaVersion` が `1`                                                             | TC-02 PASS               | -    |
| AC-7 | 全 phase の `entryHookId`/`exitHookId` が `entry[]`/`exit[]` に存在                | TC-05, TC-06, TC-07 PASS | -    |

### タスク 10-2: テスト全 PASS 確認

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
pnpm --filter @repo/desktop test ManifestLoader
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

| テスト項目                                     | 結果 | 備考 |
| ---------------------------------------------- | ---- | ---- |
| ManifestLoader.production-manifest（17ケース） | -    | -    |
| ManifestLoader テスト全体                      | -    | -    |
| typecheck                                      | -    | -    |
| lint                                           | -    | -    |

### タスク 10-3: canonical/mirror 一致確認

- canonical と mirror の `workflow-manifest.json` が byte-for-byte 同一であることを最終確認する
- 差分がある場合は原因を特定し、MAJOR 判定とする

### タスク 10-4: manifest スキーマ整合性の最終確認

| チェック項目                        | 期待値                                                    | 結果 |
| ----------------------------------- | --------------------------------------------------------- | ---- |
| トップレベルフィールドが 6 項目のみ | schemaVersion, workflowId, phases, resources, entry, exit | -    |
| schemaVersion                       | `1`                                                       | -    |
| workflowId                          | `"skill-creator"`（空でない文字列）                       | -    |
| phases 数                           | 5 件                                                      | -    |
| resources 数                        | 7 件                                                      | -    |
| entry hooks 数                      | 5 件（全一意）                                            | -    |
| exit hooks 数                       | 5 件（全一意）                                            | -    |

### タスク 10-5: resource path 実在確認

全 7 resource の path が `.claude/skills/skill-creator/` 配下に実在することを最終確認する:

| resource id              | path                                 | canonical 実在 | mirror 実在 |
| ------------------------ | ------------------------------------ | -------------- | ----------- |
| agent-analyze-request    | ./agents/analyze-request.md          | -              | -           |
| agent-define-boundary    | ./agents/define-boundary.md          | -              | -           |
| ref-core-principles      | ./references/core-principles.md      | -              | -           |
| ref-codex-best-practices | ./references/codex-best-practices.md | -              | -           |
| schema-agent-definition  | ./schemas/agent-definition.json      | -              | -           |
| schema-boundary          | ./schemas/boundary.json              | -              | -           |
| agent-analyze-feedback   | ./agents/analyze-feedback.md         | -              | -           |

### タスク 10-6: phase ↔ resource 双方向参照整合

- 全 phase の `resourceIds` が `resources[].id` に存在することを確認する
- 全 resource の `phaseIds` が `phases[].id` に存在し、双方向で一致することを確認する

| phase id               | phase.resourceIds                                   | 双方向一致 |
| ---------------------- | --------------------------------------------------- | ---------- |
| requirements-gathering | [agent-analyze-request]                             | -          |
| plan                   | [agent-define-boundary, ref-core-principles]        | -          |
| execute                | [ref-codex-best-practices, schema-agent-definition] | -          |
| verify                 | [schema-boundary]                                   | -          |
| improve                | [agent-analyze-feedback]                            | -          |

### タスク 10-7: dependsOn 順序整合

| phase（index）             | dependsOn                | 参照先 index | 正当性 |
| -------------------------- | ------------------------ | ------------ | ------ |
| requirements-gathering (0) | なし                     | -            | -      |
| plan (1)                   | [requirements-gathering] | 0            | -      |
| execute (2)                | [plan]                   | 1            | -      |
| verify (3)                 | [execute]                | 2            | -      |
| improve (4)                | [verify]                 | 3            | -      |

### タスク 10-8: 後続タスクへのブロッカー確認

| 後続タスク | タスク名                                         | ブロッカー有無 | 詳細 |
| ---------- | ------------------------------------------------ | -------------- | ---- |
| P0-04      | ManifestLoader dynamic pipeline デフォルト有効化 | -              | -    |
| P0-07      | AGENT_NAMES の動的解決                           | -              | -    |
| P0-09      | permission / hooks / audit ガバナンス            | -              | -    |

確認観点:

- P0-04: manifest が正しく配置され、`loadManifest()` が成功する前提が満たされているか
- P0-07: manifest 内の agent resource 定義が動的名前解決に十分な情報を含んでいるか
- P0-09: manifest の entry/exit hook 構造が permission/hooks 拡張の土台として適切か

## 統合テスト連携

### Phase 間の整合確認

| Phase | 成果物           | Phase 10 での確認観点                                 |
| ----- | ---------------- | ----------------------------------------------------- |
| 1     | 要件定義         | AC-1〜AC-7 が全て検証されているか                     |
| 2     | 設計             | 設計通りの manifest 構造が実現されているか            |
| 3     | 設計レビュー     | レビュー指摘事項が全て解消されているか                |
| 4     | テスト作成       | テストケースが全 AC をカバーしているか                |
| 5     | 実装             | canonical/mirror に正しい manifest が配置されているか |
| 6     | テスト拡充       | エッジケース・リグレッションテストが PASS しているか  |
| 7     | カバレッジ確認   | カバレッジ基準が達成されているか                      |
| 8     | リファクタリング | リファクタリング後もテスト全 PASS が維持されているか  |
| 9     | 品質保証         | 全品質ゲートが PASS しているか                        |

### 最終判定

| 項目     | 判定 |
| -------- | ---- |
| 総合判定 | -    |
| 判定理由 | -    |
| 次の動き | -    |

## 参照資料

| 資料名                     | パス                                                                                          | 説明                       |
| -------------------------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1                    | `phase-1-requirements.md`                                                                     | 要件定義                   |
| Phase 2                    | `phase-2-design.md`                                                                           | 設計                       |
| Phase 3                    | `phase-3-design-review.md`                                                                    | 設計レビュー               |
| Phase 9                    | `phase-9-quality-assurance.md`                                                                | 品質保証結果               |
| canonical manifest         | `.claude/skills/skill-creator/workflow-manifest.json`                                         | 最終レビュー対象（正本）   |
| mirror manifest            | `.agents/skills/skill-creator/workflow-manifest.json`                                         | 最終レビュー対象（ミラー） |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体           |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | TC-01〜RC-03（17ケース）   |
| remediation pack           | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`       | 全体構成・依存マトリクス   |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                                             | Phase 1 成果物             |
| 設計書                     | `outputs/phase-2/design.md`                                                                   | Phase 2 成果物             |
| 実装計画書                 | `outputs/phase-5/implementation-plan.md`                                                      | Phase 5 成果物             |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                                                          | Phase 7 成果物             |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`                                                       | Phase 8 成果物             |
| 品質レポート               | `outputs/phase-9/quality-report.md`                                                           | Phase 9 成果物             |

## 成果物

| 成果物           | パス                                      | 説明                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 全検証結果・総合判定・次の動き |

## 完了条件

- [ ] AC-1〜AC-7 の達成状況が全て確認されている
- [ ] ManifestLoader.production-manifest テスト全 17 ケースが PASS している
- [ ] ManifestLoader テスト全体が PASS している
- [ ] typecheck がエラーなしで完了している
- [ ] lint がエラーなしで完了している
- [ ] canonical/mirror の一致が確認されている
- [ ] manifest スキーマ整合性が確認されている
- [ ] 全 7 resource の path 実在が確認されている（canonical/mirror 両方）
- [ ] phase ↔ resource 双方向参照整合が確認されている
- [ ] dependsOn 順序整合が確認されている
- [ ] 後続タスク（P0-04/P0-07/P0-09）へのブロッカーがないことが確認されている
- [ ] 判定基準（PASS/MINOR/MAJOR/CRITICAL）に基づく総合判定が記録されている
- [ ] 成果物 `outputs/phase-10/final-review-result.md` が生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

- Phase 1〜9 の全成果物が整合しているか（要件→設計→実装→テストの一貫性）
- 受入条件（AC-1〜AC-7）が全て独立に検証されているか
- canonical/mirror の一致確認が最終時点の実ファイルに対して行われているか
- resource path の実在確認が canonical と mirror の両方で行われているか
- 後続タスクへのブロッカー評価が具体的かつ網羅的か
- 判定結果が客観的な証跡に基づいているか（テスト結果、diff 出力等）
- MINOR/MAJOR 指摘がある場合、修正後の再検証手順が明確か

## サブタスク管理

| SubAgent   | 責務                                           |
| ---------- | ---------------------------------------------- |
| SubAgent-A | AC 達成状況・テスト PASS 確認                  |
| SubAgent-B | manifest 整合性・resource path・双方向参照検証 |
| SubAgent-C | 後続タスクブロッカー確認・総合判定             |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 11: 手動テスト
