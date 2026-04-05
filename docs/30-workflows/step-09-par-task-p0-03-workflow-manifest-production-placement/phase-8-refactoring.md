# Phase 8: リファクタリング - TDD Refactor

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

manifest JSON の構造最適化と冗長性の排除を行う。本タスクは JSON ファイル配置が主であり、`ManifestLoader.ts` 等のコードリファクタリングは対象外とする。manifest JSON 自体の構造について、不要なフィールドや冗長な定義がないかをレビューし、canonical/mirror の同期方法が最適かを確認する。

## 実行タスク

### タスク 8-1: manifest JSON の構造レビュー

- `workflow-manifest.json` の全フィールドをレビューし、以下の観点で最適性を確認する:
  - 不要なフィールドや値が含まれていないか
  - `ALLOWED_TOP_LEVEL_FIELDS`（schemaVersion / workflowId / phases / resources / entry / exit）以外のフィールドが混入していないか
  - resource の `kind` 値（agent / reference / schema / asset）が適切か
  - entry/exit hook の `command` 値が冗長でないか
  - `dependsOn` の定義が最小限で正確か

### タスク 8-2: canonical/mirror の同期方法の確認

- canonical（`.claude/skills/skill-creator/workflow-manifest.json`）と mirror（`.agents/skills/skill-creator/workflow-manifest.json`）の同期方法を確認する:
  - byte-for-byte 同一であるか
  - 同期が手動コピーの場合、差分発生リスクがないか
  - 将来的な同期自動化の必要性を評価する

### タスク 8-3: リファクタリング記録 [Feedback RT-03]

変更内容を「対象/Before/After/理由」テーブル形式で記録する。リファクタリング対象がない場合は「対象なし」と明記する。

#### リファクタリング記録テンプレート

| #   | 対象                 | Before | After | 理由 |
| --- | -------------------- | ------ | ----- | ---- |
| 1   | （対象なし or 記述） | -      | -     | -    |

### タスク 8-4: リファクタリング後のテスト確認

- リファクタリングを実施した場合、以下のテストが全 PASS することを確認する:

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
pnpm --filter @repo/desktop test ManifestLoader
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

- リファクタリング対象がない場合は、テスト再実行の確認のみ行う

### 注意事項

本タスクは JSON ファイル配置のみが対象であり、以下はスコープ外とする:

- `ManifestLoader.ts` のコードリファクタリング
- テストコードのリファクタリング
- `packages/shared/` 配下の型定義のリファクタリング
- 他タスク（P0-04/P0-07/P0-09）に影響するリファクタリング

## 統合テスト連携

### リファクタリング前後のテスト一致確認

| テスト対象                                     | リファクタリング前 | リファクタリング後 | 差異 |
| ---------------------------------------------- | ------------------ | ------------------ | ---- |
| ManifestLoader.production-manifest（17ケース） | -                  | -                  | -    |
| ManifestLoader.test.ts                         | -                  | -                  | -    |
| typecheck                                      | -                  | -                  | -    |
| lint                                           | -                  | -                  | -    |

### リファクタリングの安全性基準

- manifest JSON の構造変更を行った場合、全 17 テストケースが変更前と同一の PASS/FAIL 結果となること
- `ManifestLoader` の検証ロジック 12 ステップが全て通過すること
- canonical と mirror の byte-for-byte 同一性が維持されること

## 参照資料

| 資料名                     | パス                                                                                          | 説明                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| canonical manifest         | `.claude/skills/skill-creator/workflow-manifest.json`                                         | リファクタリング対象     |
| mirror manifest            | `.agents/skills/skill-creator/workflow-manifest.json`                                         | canonical のミラー       |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック（参照のみ） |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | TC-01〜RC-03（17ケース） |
| Phase 7                    | `phase-7-coverage-check.md`                                                                   | カバレッジ確認結果       |
| Phase 2                    | `phase-2-design.md`                                                                           | 設計仕様                 |
| 実装計画書                 | `outputs/phase-5/implementation-plan.md`                                                      | Phase 5 成果物           |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                                                          | Phase 7 成果物           |

## 成果物

| 成果物                   | パス                                    | 説明                                             |
| ------------------------ | --------------------------------------- | ------------------------------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | レビュー結果・変更記録（対象なしの場合はその旨） |

## 完了条件

- [ ] manifest JSON の構造レビューが完了している
- [ ] 不要なフィールドや冗長な定義の有無が確認されている
- [ ] canonical/mirror の同期方法の妥当性が確認されている
- [ ] リファクタリング記録が「対象/Before/After/理由」テーブル形式で記録されている [Feedback RT-03]
- [ ] リファクタリング対象がない場合は「対象なし」と明記されている
- [ ] リファクタリング実施した場合、全テストが PASS している
- [ ] 成果物 `outputs/phase-8/refactoring-report.md` が生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

- manifest JSON のフィールドが `ALLOWED_TOP_LEVEL_FIELDS` に厳密に準拠しているか
- resource の path 表記が `./agents/...` / `./references/...` / `./schemas/...` のいずれかに統一されているか
- entry/exit hook の command 値に重複や不整合がないか
- phase 名と hook 名の命名規則が一貫しているか（例: `rg-entry` vs `plan-entry` の命名差異）
- canonical/mirror の同期方法が他の skill でも再利用可能な汎用性を持つか
- リファクタリングが後続タスク（P0-04/P0-07/P0-09）の前提を壊さないか

## サブタスク管理

| SubAgent   | 責務                              |
| ---------- | --------------------------------- |
| SubAgent-A | manifest JSON 構造レビュー        |
| SubAgent-B | canonical/mirror 同期方法レビュー |
| SubAgent-C | リファクタリング記録・テスト確認  |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9: 品質保証
