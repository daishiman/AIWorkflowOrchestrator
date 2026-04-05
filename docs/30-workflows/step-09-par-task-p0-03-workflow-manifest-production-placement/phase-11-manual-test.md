# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 規模       | 小規模                                 |
| 作成日     | 2026-04-04                             |

## 目的

自動テストでは検証できない観点（ファイルの物理的存在、canonical/mirror の同一性、JSON 構文の妥当性、resource path の実在確認）を手動コマンドにより確認する。

**タスク分類: NON_VISUAL** -- 本タスクは UI 変更を含まない JSON 配置タスクであるため、スクリーンショットによるエビデンスは不要。自動テスト結果および手動コマンド実行結果を証跡とする。

> **[Feedback BEFORE-QUIT-001]**: 本 Phase は仕様書作成エージェントが実地操作を行うことはできない。実行担当者が手動コマンドを実行し、結果を `manual-test-result.md` に記録する。自動テスト結果 + 手動コマンド実行結果を代替証跡とする。

## 実行タスク

- canonical 存在確認: `.claude/skills/skill-creator/workflow-manifest.json` の物理ファイル存在を確認
- mirror 存在確認: `.agents/skills/skill-creator/workflow-manifest.json` の物理ファイル存在を確認
- canonical/mirror 差分確認: diff コマンドで完全一致を検証
- JSON 構文検証: node -e で JSON.parse が成功することを確認
- resource 実在確認: manifest が参照する全 resource path のファイル存在を確認
- 自動テスト全 PASS 確認: ManifestLoader.production-manifest テスト 15 ケース全 PASS
- リグレッション確認: ManifestLoader 全テスト PASS

### Task 11-1: canonical ファイル存在確認

```bash
ls -la .claude/skills/skill-creator/workflow-manifest.json
```

期待結果: ファイルが存在し、サイズが 0 より大きい。

### Task 11-2: mirror ファイル存在確認

```bash
ls -la .agents/skills/skill-creator/workflow-manifest.json
```

期待結果: ファイルが存在し、サイズが 0 より大きい。

### Task 11-3: canonical/mirror 差分確認

```bash
diff .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json
```

期待結果: 出力なし（差分ゼロ、完全一致）。

### Task 11-4: JSON 構文検証

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/workflow-manifest.json', 'utf-8')); console.log('JSON valid')"
```

期待結果: `JSON valid` が出力され、エラーなし。

### Task 11-5: resource path の実在確認

manifest 内の全 resource の path について、canonical ディレクトリからの相対パスで実在を確認する:

```bash
# 各 resource の path を手動で ls
ls -la .claude/skills/skill-creator/agents/analyze-request.md
ls -la .claude/skills/skill-creator/agents/define-boundary.md
ls -la .claude/skills/skill-creator/references/core-principles.md
ls -la .claude/skills/skill-creator/references/codex-best-practices.md
ls -la .claude/skills/skill-creator/schemas/agent-definition.json
ls -la .claude/skills/skill-creator/schemas/boundary.json
ls -la .claude/skills/skill-creator/agents/analyze-feedback.md
```

期待結果: 全ファイルが存在する。

### Task 11-6: テスト全 PASS 確認

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

期待結果: 15 ケース全 PASS。

### Task 11-7: リグレッション確認

```bash
pnpm --filter @repo/desktop test ManifestLoader
```

期待結果: ManifestLoader 関連テスト全 PASS（既存テストを含む）。

## テストケーステーブル

| No    | テスト項目            | 前提条件       | 操作手順                                                     | 期待結果         | 実行結果   | 備考 |
| ----- | --------------------- | -------------- | ------------------------------------------------------------ | ---------------- | ---------- | ---- |
| MT-01 | canonical 存在        | Phase 5 完了   | `ls -la .claude/skills/skill-creator/workflow-manifest.json` | ファイルが存在   | {{RESULT}} |      |
| MT-02 | mirror 存在           | Phase 5 完了   | `ls -la .agents/skills/skill-creator/workflow-manifest.json` | ファイルが存在   | {{RESULT}} |      |
| MT-03 | canonical/mirror 一致 | MT-01,02 PASS  | `diff canonical mirror`                                      | 差分ゼロ         | {{RESULT}} |      |
| MT-04 | JSON 有効性           | MT-01 PASS     | `node -e` で parse                                           | 構文エラーなし   | {{RESULT}} |      |
| MT-05 | resource 実在         | MT-01 PASS     | 各 resource の path を `ls`                                  | 全ファイル存在   | {{RESULT}} |      |
| MT-06 | テスト全 PASS         | MT-01〜05 PASS | `pnpm test ManifestLoader.production-manifest`               | 15 ケース全 PASS | {{RESULT}} |      |
| MT-07 | リグレッションなし    | MT-06 PASS     | `pnpm test ManifestLoader`                                   | 全 PASS          | {{RESULT}} |      |

## エビデンス方針

> **[Feedback 4]**: NON_VISUAL タスクのため、`manual-test-result.md` のメタ情報に以下を明記すること:
>
> - **証跡の主ソース**: `ManifestLoader.production-manifest` テスト 15 ケース
> - **スクリーンショットを作らない理由**: UI 変更なし（JSON 配置タスク）

`manual-test-result.md` 作成時のメタ情報テンプレート:

```markdown
## メタ情報

| 項目                             | 値                                                    |
| -------------------------------- | ----------------------------------------------------- |
| Phase                            | 11                                                    |
| タスクID                         | TASK-P0-03                                            |
| 証跡の主ソース                   | ManifestLoader.production-manifest テスト 15 ケース   |
| スクリーンショットを作らない理由 | UI 変更なし（JSON 配置タスク、NON_VISUAL タスク分類） |
```

## 統合テスト連携

| 連携先テスト                                 | 関連性                                            | 確認方法                                       |
| -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `ManifestLoader.production-manifest.test.ts` | canonical manifest の本番パス読み込み検証（15件） | `pnpm test ManifestLoader.production-manifest` |
| `ManifestLoader.test.ts`                     | ManifestLoader の汎用ロジック検証                 | `pnpm test ManifestLoader`                     |
| typecheck                                    | 型整合性                                          | `pnpm --filter @repo/desktop typecheck`        |
| lint                                         | コードスタイル準拠                                | `pnpm --filter @repo/desktop lint`             |

統合テストとの関係:

- Phase 11 の手動テストは、自動テスト（Phase 7-8）がカバーしない「物理ファイル配置」の観点を補完する
- 自動テストがフィクスチャを使用するのに対し、手動テストは本番パスの実ファイルを直接確認する
- MT-06/MT-07 は自動テストの再実行であり、Phase 7-8 以降の変更によるリグレッションがないことを保証する

## 参照資料

| 資料名                     | パス                                                                                          | 説明                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1                    | `phase-1-requirements.md`                                                                     | 要件定義                 |
| Phase 2                    | `phase-2-design.md`                                                                           | 設計                     |
| Phase 3                    | `phase-3-design-review.md`                                                                    | 設計レビュー             |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体         |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | テスト期待値（15ケース） |
| canonical manifest         | `.claude/skills/skill-creator/workflow-manifest.json`                                         | 本番 manifest            |
| mirror manifest            | `.agents/skills/skill-creator/workflow-manifest.json`                                         | ミラー manifest          |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`                                                     | Phase 10 成果物          |

## 成果物

| 成果物             | パス                                     | 必須 |
| ------------------ | ---------------------------------------- | ---- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | ✅   |
| 発見された問題一覧 | `outputs/phase-11/discovered-issues.md`  | ✅   |

## 完了条件

- [ ] MT-01〜MT-05: 手動コマンド実行結果を `manual-test-result.md` に記録
- [ ] MT-06: `ManifestLoader.production-manifest` テスト 15 ケース全 PASS
- [ ] MT-07: `ManifestLoader` テスト全 PASS（リグレッションなし）
- [ ] `manual-test-result.md` のメタ情報に証跡の主ソースとスクリーンショット不要理由を明記
- [ ] `discovered-issues.md` を作成（問題なしの場合も「発見された問題: なし」と記録）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
