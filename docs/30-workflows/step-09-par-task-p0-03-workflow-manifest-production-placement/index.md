# TASK-P0-03: workflow-manifest.json の本番配置

## メタ情報

| 項目           | 内容                                                             |
| -------------- | ---------------------------------------------------------------- |
| タスクID       | TASK-P0-03                                                       |
| タスク名       | workflow-manifest.json の本番配置                                |
| 分類           | 新機能（Spec P0 系）                                             |
| 対象機能       | Skill Creator Agent SDK Lane - ManifestLoader / 動的パイプライン |
| 優先度         | high                                                             |
| 見積もり規模   | small                                                            |
| ステータス     | spec_created                                                     |
| 依存タスク     | なし                                                             |
| 作成日         | 2026-04-04                                                       |
| 親ワークフロー | step-09-par-task-p0-03-workflow-manifest-production-placement    |

---

## 目的

Skill Creator Agent が使用する `workflow-manifest.json` を canonical / mirror の本番パスで再確定し、`ManifestLoader` が実運用環境で正常にロードできる状態を維持する。既存 manifest とテストフィクスチャを照合し、差分があれば canonical / mirror の両方を同一内容へ更新して、動的パイプライン実行の基盤を固定する。

---

## スコープ

### 含む

- `workflow-manifest.json` の内容定義（workflowId, phases, resources, entry, exit）
- canonical パス（`.claude/skills/skill-creator/workflow-manifest.json`）への配置
- mirror パス（`.agents/skills/skill-creator/workflow-manifest.json`）への配置（canonical と同一内容）
- `ManifestLoader` が本番 manifest を読み込めることの確認
- manifest スキーマとフィクスチャの整合確認

### 含まない

- ManifestLoader のデフォルト有効化（TASK-P0-04）
- AGENT_NAMES の動的化（TASK-P0-07）
- permission / hooks 定義の追加（TASK-P0-09）
- manifest 内容変更後のランタイム動作確認

---

## aiworkflow-requirements 抽出結果

| 参照対象                     | パス                                                                                        | 要点                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` は read / validate / normalize / cache のみを担当する |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                                                     |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する                          |

---

## 参照資料

| 名称                       | パス                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| ManifestLoader.ts          | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        |
| テストフィクスチャ         | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` |
| P0 是正パック              | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`              |
| canonical ディレクトリ     | `.claude/skills/skill-creator/`                                                                      |
| mirror ディレクトリ        | `.agents/skills/skill-creator/`                                                                      |

---

## 成果物一覧

| 成果物             | 配置先                                                | 説明                                   |
| ------------------ | ----------------------------------------------------- | -------------------------------------- |
| canonical manifest | `.claude/skills/skill-creator/workflow-manifest.json` | ManifestLoader が読み込む正本 manifest |
| mirror manifest    | `.agents/skills/skill-creator/workflow-manifest.json` | canonical と同一内容のミラーコピー     |

---

## 受入条件チェックリスト

- [ ] **AC-1**: `.claude/skills/skill-creator/workflow-manifest.json` が存在する
- [ ] **AC-2**: `.agents/skills/skill-creator/workflow-manifest.json` が存在し canonical と同一内容
- [ ] **AC-3**: `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了
- [ ] **AC-4**: 全 resource の `absolutePath` が実在ファイルを指す
- [ ] **AC-5**: phases が 5 件（requirements-gathering, plan, execute, verify, improve）をこの順序で含む
- [ ] **AC-6**: `schemaVersion` が `1`
- [ ] **AC-7**: 全 phase の `entryHookId` / `exitHookId` が `entry[]` / `exit[]` に存在

---

## 品質要件チェックリスト

- [ ] 関連テストが全て PASS（`ManifestLoader.production-manifest.test.ts`）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS

---

## 後続タスク依存

| タスクID   | タスク名                                         | 関係性                                             |
| ---------- | ------------------------------------------------ | -------------------------------------------------- |
| TASK-P0-04 | ManifestLoader dynamic pipeline デフォルト有効化 | 本タスクで配置した manifest を読み込み先として使用 |
| TASK-P0-07 | AGENT_NAMES の動的解決                           | manifest 内の agent 定義を参照                     |
| TASK-P0-09 | permission / hooks / audit ガバナンス            | manifest へ permission/hooks 定義を追加            |

---

## Phase 一覧（Phase 1-13）

| Phase | 名称             | パターン | 依存     | ゲート | 仕様書                                                       |
| ----- | ---------------- | -------- | -------- | ------ | ------------------------------------------------------------ |
| 1     | 要件定義         | seq      | -        | -      | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計             | seq      | Phase 1  | -      | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビュー     | seq      | Phase 2  | GATE   | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成       | seq      | Phase 3  | -      | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装             | seq      | Phase 4  | -      | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充       | seq      | Phase 5  | -      | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | seq      | Phase 6  | -      | [phase-7-coverage-check.md](phase-7-coverage-check.md)       |
| 8     | リファクタリング | seq      | Phase 7  | -      | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質保証         | seq      | Phase 8  | -      | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | seq      | Phase 9  | GATE   | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト       | seq      | Phase 10 | -      | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント更新 | par      | Phase 11 | -      | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR 作成          | seq      | Phase 12 | -      | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

---

## 備考

### 現状の manifest 配置状態

- テストフィクスチャ（`__tests__/fixtures/workflow-manifest/workflow-manifest.json`）は既に存在し、`ManifestLoader` の単体テストで使用されている
- canonical パス（`.claude/skills/skill-creator/`）および mirror パス（`.agents/skills/skill-creator/`）には `workflow-manifest.json` が既に存在する
- 本タスクでは、テストフィクスチャの内容と現行 manifest の差分を照合し、差分がある場合のみ canonical / mirror 双方を同一内容へ上書きして再確定する
- `ManifestLoader.production-manifest.test.ts` が本番パスの manifest を対象としたテストであり、このテストが PASS することで AC-3〜AC-7 を検証できる

---

## Phase 完了時アクション

各 Phase 完了時に以下を実行:

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow step-09-par-task-p0-03-workflow-manifest-production-placement \
  --phase <PHASE_NUMBER>
```

---

## 出力ファイル構成

```
docs/30-workflows/step-09-par-task-p0-03-workflow-manifest-production-placement/
├── index.md
├── artifacts.json
└── outputs/
    ├── phase-1/requirements.md
    ├── phase-2/design.md
    ├── phase-3/design-review-result.md
    ├── phase-4/test-plan.md
    ├── phase-5/implementation-plan.md
    ├── phase-6/test-expansion.md
    ├── phase-7/coverage-report.md
    ├── phase-8/refactoring-report.md
    ├── phase-9/quality-report.md
    ├── phase-10/final-review-result.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/discovered-issues.md
    ├── phase-12/implementation-guide.md
    ├── phase-12/documentation-changelog.md
    ├── phase-12/system-spec-update-summary.md
    ├── phase-12/unassigned-task-detection.md
    ├── phase-12/skill-feedback-report.md
    └── phase-13/pr-info.md
```

---

## タスク分類

**NON_VISUAL** -- UI タスクではない。ManifestLoader / ファイル配置のみ。
