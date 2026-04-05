# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

Phase 2 の設計に基づき `workflow-manifest.json` を作成し、canonical パス（`.claude/skills/skill-creator/`）と mirror パス（`.agents/skills/skill-creator/`）に配置する。テストが GREEN（全 PASS）になることを確認し、TDD サイクルを完了する。

## 実行タスク

- manifest JSON 作成: Phase 2 設計に基づき workflow-manifest.json を作成
- canonical 配置: `.claude/skills/skill-creator/workflow-manifest.json` へ配置
- mirror 配置: `.agents/skills/skill-creator/workflow-manifest.json` へ同一内容で配置
- 同一性確認: canonical と mirror の差分がゼロであることを確認
- テスト GREEN 確認: ManifestLoader.production-manifest テスト全 PASS を確認
- typecheck/lint 確認: pnpm typecheck / lint がエラーなしであることを確認

### タスク5-1: Phase 2 設計に基づく manifest JSON の作成

Phase 2 設計書（`outputs/phase-2/design.md`）のステップ6「manifest JSON の完全構造設計」に記載された JSON を基に、`workflow-manifest.json` を作成する。

作成する JSON の構造要件:

| フィールド    | 値                | 備考                                                       |
| ------------- | ----------------- | ---------------------------------------------------------- |
| schemaVersion | `1`               | WORKFLOW_MANIFEST_SCHEMA_VERSION 定数と一致                |
| workflowId    | `"skill-creator"` | テスト TC-01 の期待値                                      |
| phases        | 5件               | requirements-gathering → plan → execute → verify → improve |
| resources     | 7件               | agent x3, reference x2, schema x2                          |
| entry         | 5件               | 各 phase に対応する entry hook                             |
| exit          | 5件               | 各 phase に対応する exit hook                              |

### タスク5-2: canonical パスへの配置

作成した `workflow-manifest.json` を以下のパスに配置する:

```
.claude/skills/skill-creator/workflow-manifest.json
```

### タスク5-3: mirror パスへの配置

canonical と同一内容の `workflow-manifest.json` を以下のパスに配置する:

```
.agents/skills/skill-creator/workflow-manifest.json
```

### タスク5-4: 両ファイルの完全一致確認

canonical と mirror の `workflow-manifest.json` が byte-for-byte で同一であることを確認する:

```bash
diff .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json
```

期待結果: 差分なし（出力が空）

### タスク5-5: resource path の実在確認

manifest 内の全 resource.path が canonical ディレクトリ配下に実在することを確認する:

| resource id              | path                                 | 確認コマンド                                                         |
| ------------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| agent-analyze-request    | ./agents/analyze-request.md          | `ls .claude/skills/skill-creator/agents/analyze-request.md`          |
| agent-define-boundary    | ./agents/define-boundary.md          | `ls .claude/skills/skill-creator/agents/define-boundary.md`          |
| ref-core-principles      | ./references/core-principles.md      | `ls .claude/skills/skill-creator/references/core-principles.md`      |
| ref-codex-best-practices | ./references/codex-best-practices.md | `ls .claude/skills/skill-creator/references/codex-best-practices.md` |
| schema-agent-definition  | ./schemas/agent-definition.json      | `ls .claude/skills/skill-creator/schemas/agent-definition.json`      |
| schema-boundary          | ./schemas/boundary.json              | `ls .claude/skills/skill-creator/schemas/boundary.json`              |
| agent-analyze-feedback   | ./agents/analyze-feedback.md         | `ls .claude/skills/skill-creator/agents/analyze-feedback.md`         |

### タスク5-6: テスト実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

期待結果: 全 17 ケースが PASS（GREEN）

### タスク5-7: リグレッション確認

```bash
pnpm --filter @repo/desktop test ManifestLoader
```

期待結果: 既存テスト群も全て PASS

### タスク5-8: 型チェック・Lint 確認

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

期待結果: エラーなし

## [Feedback RT-03] 新規作成/修正ファイルパス一覧

| 種別     | ファイルパス                                          | 説明                   |
| -------- | ----------------------------------------------------- | ---------------------- |
| 新規作成 | `.claude/skills/skill-creator/workflow-manifest.json` | canonical manifest     |
| 新規作成 | `.agents/skills/skill-creator/workflow-manifest.json` | mirror manifest        |
| 修正     | なし                                                  | 既存ファイルの変更なし |

注: canonical / mirror パスに既に `workflow-manifest.json` が存在する場合は、Phase 2 設計に基づく正しい内容で上書きする。

## 参照資料

| 資料名               | パス                                                                                                 | 説明                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計書       | `outputs/phase-2/design.md`                                                                          | manifest 構造設計    |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`                                                            | 設計レビュー結果     |
| Phase 4 テスト計画   | `outputs/phase-4/test-plan.md`                                                                       | テストケース確認結果 |
| テストファイル       | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        | テスト本体（17件）   |
| ManifestLoader       | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ロジック本体     |
| テストフィクスチャ   | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 構造リファレンス     |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## manifest JSON 構造（Phase 2 設計準拠）

Phase 2 設計書のステップ6に記載された完全な JSON 構造をそのまま使用する。主要な構造:

```
{
  "schemaVersion": 1,
  "workflowId": "skill-creator",
  "phases": [5件 - 各 phase に id/title/entryHookId/exitHookId/resourceIds/dependsOn],
  "resources": [7件 - 各 resource に id/kind/path/phaseIds],
  "entry": [5件 - 各 hook に id/command],
  "exit": [5件 - 各 hook に id/command]
}
```

詳細な JSON 内容は Phase 2 設計書 `phase-2-design.md` のステップ6を参照のこと。

## 統合テスト連携

- Phase 4 で整理した期待値に対して、本 Phase の manifest が全 PASS 条件を満たすことを検証する
- `ManifestLoader.production-manifest.test.ts` の全 17 ケースが検証ゲートとなる
- `ManifestLoader.test.ts` の既存テスト群がリグレッションガードとなる
- テスト TC-03 で resource の absolutePath 実在が検証される（`fs.access()`）
- テスト AC-2 で canonical と mirror の同一性が検証される（`fs.readFile()` 比較）

## 多角的チェック観点

- 配置する JSON が Phase 2 設計と完全に一致しているか
- ALLOWED_TOP_LEVEL_FIELDS 以外のフィールドが含まれていないか
- JSON のフォーマット（インデント、末尾改行）が Prettier の設定に準拠しているか
- resource.path の相対パス解決が canonical / mirror 両方で正しく機能するか
- phase ↔ resource の双方向参照が対称的であるか
- canonical と mirror のファイルが byte-for-byte で同一であるか
- 全テスト PASS 後に typecheck / lint もエラーなしであるか

## 成果物

| 成果物             | パス                                                  | 説明                       |
| ------------------ | ----------------------------------------------------- | -------------------------- |
| 実装計画書         | `outputs/phase-5/implementation-plan.md`              | 実装手順・確認結果の記録   |
| canonical manifest | `.claude/skills/skill-creator/workflow-manifest.json` | 本番 manifest（canonical） |
| mirror manifest    | `.agents/skills/skill-creator/workflow-manifest.json` | 本番 manifest（mirror）    |

## 完了条件

- [ ] Phase 2 設計に基づく `workflow-manifest.json` が作成されている
- [ ] `.claude/skills/skill-creator/workflow-manifest.json` に配置されている（AC-1）
- [ ] `.agents/skills/skill-creator/workflow-manifest.json` に配置されている（AC-2）
- [ ] canonical と mirror の内容が完全一致している（`diff` で差分なし）
- [ ] 全 7 resource の path が実在ファイルを指している（AC-4）
- [ ] `pnpm --filter @repo/desktop test ManifestLoader.production-manifest` が全 PASS（AC-1〜AC-7）
- [ ] `pnpm --filter @repo/desktop test ManifestLoader` が全 PASS（リグレッションなし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] 実装計画書が `outputs/phase-5/implementation-plan.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                               |
| ---------- | ---------------------------------- |
| SubAgent-A | manifest JSON 作成・canonical 配置 |
| SubAgent-B | mirror 配置・同一性確認            |
| SubAgent-C | テスト実行・typecheck・lint 確認   |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6: テスト拡充
