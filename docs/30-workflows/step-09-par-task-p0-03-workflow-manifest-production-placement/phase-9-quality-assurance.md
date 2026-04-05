# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

品質基準の全項目達成を検証し、`workflow-manifest.json` の本番配置が全ての品質ゲートを通過することを確認する。機能検証、リグレッション、型チェック、Lint、manifest 整合性の各観点から総合的に品質を保証する。

## 実行タスク

### タスク 9-1: 機能検証

- `ManifestLoader.production-manifest` テスト全 17 ケースが PASS することを確認する

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

- 各テストケースの PASS/FAIL を記録する:

| テストケース | 検証内容                       | 結果 |
| ------------ | ------------------------------ | ---- |
| TC-01        | loadManifest() 成功            | -    |
| TC-02        | schemaVersion === 1            | -    |
| TC-03        | 全 resource absolutePath 実在  | -    |
| TC-04        | phases 5 件・正しい順序        | -    |
| TC-05        | entry/exit hooks 定義あり      | -    |
| TC-06        | entryHookId → entry[] 参照整合 | -    |
| TC-07        | exitHookId → exit[] 参照整合   | -    |
| AC-2         | canonical/mirror 同一性        | -    |
| kind検証     | 全 resource.kind が有効値      | -    |
| dependsOn    | 正しい依存順序                 | -    |
| EC-01        | dependsOn 不正 → 拒否          | -    |
| EC-02        | kind 空文字 → 拒否             | -    |
| EC-03        | command 空文字 → 拒否          | -    |
| EC-04        | 1 phase のみ → 通過            | -    |
| RC-01        | resource path 削除 → 検出      | -    |
| RC-02        | schemaVersion 変更 → 検出      | -    |
| RC-03        | workflowId 空文字 → 拒否       | -    |

### タスク 9-2: リグレッション検証

- ManifestLoader 関連テスト全体が PASS することを確認する

```bash
pnpm --filter @repo/desktop test ManifestLoader
```

- production-manifest テスト以外のテスト（単体テスト・フィクスチャテスト）も含めてリグレッションがないことを検証する

### タスク 9-3: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- エラーなしで完了することを確認する
- エラーがある場合は内容を記録し、本タスクに起因するかを判別する

### タスク 9-4: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

- エラーなしで完了することを確認する
- 警告がある場合は内容を記録し、本タスクに起因するかを判別する

### タスク 9-5: manifest 整合性検証

#### canonical と mirror の完全一致

- `.claude/skills/skill-creator/workflow-manifest.json` と `.agents/skills/skill-creator/workflow-manifest.json` の内容が byte-for-byte 同一であることを確認する

```bash
diff .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json
```

#### JSON 構文検証

- canonical manifest が valid JSON であることを確認する

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/workflow-manifest.json', 'utf8')); console.log('Valid JSON')"
```

#### スキーマ整合性

- トップレベルフィールドが `ALLOWED_TOP_LEVEL_FIELDS`（schemaVersion / workflowId / phases / resources / entry / exit）のみであることを確認する
- `schemaVersion` が `1` であることを確認する
- `workflowId` が空でない文字列であることを確認する

## 品質ゲート総合判定

| #   | ゲート項目     | 基準                                               | 結果 | 備考 |
| --- | -------------- | -------------------------------------------------- | ---- | ---- |
| 1   | 機能検証       | ManifestLoader.production-manifest 全 15 PASS      | -    | -    |
| 2   | リグレッション | ManifestLoader テスト全 PASS                       | -    | -    |
| 3   | 型チェック     | `pnpm --filter @repo/desktop typecheck` エラーなし | -    | -    |
| 4   | Lint           | `pnpm --filter @repo/desktop lint` エラーなし      | -    | -    |
| 5   | manifest 整合  | canonical と mirror が完全一致                     | -    | -    |
| 6   | JSON 構文      | manifest が valid JSON                             | -    | -    |
| 7   | スキーマ整合   | ALLOWED_TOP_LEVEL_FIELDS 準拠                      | -    | -    |

## 統合テスト連携

### 品質ゲートと受入条件の対応

| 品質ゲート     | 関連 AC                            | 検証方法                        |
| -------------- | ---------------------------------- | ------------------------------- |
| 機能検証       | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7 | production-manifest テスト      |
| manifest 整合  | AC-2                               | diff コマンドによるファイル比較 |
| JSON 構文      | AC-1（前提条件）                   | JSON.parse による構文検証       |
| スキーマ整合   | AC-6, AC-7                         | トップレベルフィールド検査      |
| リグレッション | NFR-01                             | ManifestLoader テスト全 PASS    |
| 型チェック     | NFR-02                             | typecheck コマンド              |
| Lint           | NFR-03                             | lint コマンド                   |

### 品質基準未達時の対応

| 品質ゲート          | 未達時の対応                                             |
| ------------------- | -------------------------------------------------------- |
| 機能検証 FAIL       | Phase 5（実装）へ戻り manifest JSON を修正               |
| リグレッション FAIL | FAIL テストの原因を特定し、Phase 5 または Phase 6 へ戻る |
| 型チェック FAIL     | 本タスク起因なら Phase 5 へ戻る。既存問題なら Issue 作成 |
| Lint FAIL           | 本タスク起因なら Phase 5 へ戻る。既存問題なら Issue 作成 |
| manifest 整合 FAIL  | Phase 5 へ戻り canonical/mirror の同期を修正             |
| JSON 構文 FAIL      | Phase 5 へ戻り manifest JSON の構文を修正                |

## 参照資料

| 資料名                     | パス                                                                                          | 説明                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| canonical manifest         | `.claude/skills/skill-creator/workflow-manifest.json`                                         | 品質検証対象（正本）     |
| mirror manifest            | `.agents/skills/skill-creator/workflow-manifest.json`                                         | 品質検証対象（ミラー）   |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体         |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | TC-01〜RC-03（17ケース） |
| Phase 7                    | `phase-7-coverage-check.md`                                                                   | カバレッジ確認結果       |
| Phase 8                    | `phase-8-refactoring.md`                                                                      | リファクタリング結果     |
| 実装計画書                 | `outputs/phase-5/implementation-plan.md`                                                      | Phase 5 成果物           |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`                                                       | Phase 8 成果物           |

## 成果物

| 成果物       | パス                                | 説明                             |
| ------------ | ----------------------------------- | -------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質ゲートの検証結果・総合判定 |

## 完了条件

- [ ] ManifestLoader.production-manifest テスト全 17 ケースが PASS している
- [ ] ManifestLoader 関連テスト全体が PASS している（リグレッションなし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで完了している
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで完了している
- [ ] canonical と mirror の manifest が完全一致している
- [ ] manifest が valid JSON であることが確認されている
- [ ] manifest が ALLOWED_TOP_LEVEL_FIELDS に準拠していることが確認されている
- [ ] 品質ゲート総合判定が記録されている
- [ ] 成果物 `outputs/phase-9/quality-report.md` が生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

- 全品質ゲートが独立して検証されているか（1つの PASS が他の PASS を暗黙に前提としていないか）
- manifest 整合性検証が canonical/mirror 両方を対象としているか
- 型チェック・Lint のエラーが本タスク起因か既存問題かの切り分けが明確か
- Phase 7（カバレッジ）・Phase 8（リファクタリング）の結果が品質判定に反映されているか
- 後続タスク（P0-04/P0-07/P0-09）へのブロッカーとなる品質問題がないか

## サブタスク管理

| SubAgent   | 責務                                    |
| ---------- | --------------------------------------- |
| SubAgent-A | 機能検証・リグレッション検証            |
| SubAgent-B | 型チェック・Lint チェック               |
| SubAgent-C | manifest 整合性検証・品質ゲート総合判定 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビューゲート
