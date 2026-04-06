# Phase 7: カバレッジ確認 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 7                                                   |
| Phase名   | テストカバレッジ確認                                |
| カテゴリ  | 品質ゲート                                          |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 6: テスト拡充（Red-Green）                    |
| 後続Phase | Phase 8: リファクタリング（TDD: Refactor）          |

## 目的

`manifestResourceResolver.ts` および `RuntimeSkillCreatorFacade.ts`（変更箇所周辺）のテストカバレッジが基準を満たしていることを確認する。基準未達の場合はテストを追加してカバレッジを引き上げる。動的パス / フォールバックパスの分岐カバレッジを特に重点的に確認する。

## カバレッジ基準

| カバレッジ種別    | 基準値 | 理由                                                                      |
| ----------------- | ------ | ------------------------------------------------------------------------- |
| Line coverage     | 80%+   | 主要な実行パスを網羅する最低ライン                                        |
| Branch coverage   | 60%+   | 動的パス / フォールバックパスの分岐（5パターン）を主要パスでカバーする    |
| Function coverage | 80%+   | `buildPhaseResourceRequestsFromManifest` および関連ヘルパー関数を網羅する |

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: 現状のカバレッジ数値を取得する

**対象ファイル**:

- `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（変更箇所周辺）

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage --run manifestResourceResolver RuntimeSkillCreatorFacade
```

**確認項目**:

| 確認項目          | 確認方法                                  |
| ----------------- | ----------------------------------------- |
| Line coverage     | レポートの `Lines` 列を確認する           |
| Branch coverage   | レポートの `Branches` 列を確認する        |
| Function coverage | レポートの `Functions` 列を確認する       |
| 未カバー箇所      | レポートの `Uncovered Lines` 列を確認する |

### タスク2: カバレッジレポートの読み取り

**目的**: 未カバーの箇所を特定し、追加テストの必要性を判断する

**分析観点**:

| 観点                                              | 確認内容                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 動的パス（manifest 有効時）                       | `buildPhaseResourceRequestsFromManifest()` の正常系パスがカバーされているか                                   |
| フォールバック: フェーズ未存在                    | manifest に対象 `phaseId` が存在しない場合のフォールバックパスがカバーされているか                            |
| フォールバック: resourceIds が undefined          | フェーズの `resourceIds` が `undefined` の場合のフォールバックパスがカバーされているか                        |
| フォールバック: resourceIds が空配列              | フェーズの `resourceIds` が `[]` の場合のフォールバックパスがカバーされているか                               |
| フォールバック: 全リソース未発見                  | `resourceIds` の全 ID が `resources` に見つからない場合のフォールバックパスがカバーされているか               |
| 個別リソース未発見のスキップ                      | 一部の `resourceId` が `resources` に見つからない場合の warn ログ + スキップがカバーされているか              |
| `hasDynamicResourcePipeline()` false 時の静的パス | 動的パイプライン無効時に既存の静的パスが使われることがカバーされているか                                      |
| パス変換: `./` プレフィックス除去                 | `resource.path` の先頭 `./` が正しく除去されることがカバーされているか                                        |
| kind → tier マッピング                            | `agent` → `required-core`、`reference`/`schema`/`asset` → `optional-quality` の全パターンがカバーされているか |

### タスク3: カバレッジ基準の判定

**目的**: 計測結果が基準を満たすかを判定し、不足時は対処する

**判定フロー**:

```
計測結果の確認
  ├── 全基準をクリア → 成果物記録して Phase 8 へ進む
  └── 基準未達 → タスク4（追加テスト作成）へ進む
```

**判定結果記録**:

| ファイル                     | カバレッジ種別    | 計測値 | 基準値 | 判定（PASS/FAIL） |
| ---------------------------- | ----------------- | ------ | ------ | ----------------- |
| manifestResourceResolver.ts  | Line coverage     | --     | 80%+   | --                |
| manifestResourceResolver.ts  | Branch coverage   | --     | 60%+   | --                |
| manifestResourceResolver.ts  | Function coverage | --     | 80%+   | --                |
| RuntimeSkillCreatorFacade.ts | Line coverage     | --     | 80%+   | --                |
| RuntimeSkillCreatorFacade.ts | Branch coverage   | --     | 60%+   | --                |
| RuntimeSkillCreatorFacade.ts | Function coverage | --     | 80%+   | --                |

### タスク4: カバレッジ不足時の追加テスト（基準未達の場合のみ）

**目的**: 基準未達のカバレッジを引き上げるためのテストを追加する

**追加テスト候補**:

| 未カバー箇所                             | 追加テスト内容                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| フォールバック: フェーズ未存在           | manifest に存在しない `phaseId` を渡し、`fallback` がそのまま返ることを確認する                |
| フォールバック: resourceIds が undefined | `resourceIds` が `undefined` のフェーズを渡し、`fallback` がそのまま返ることを確認する         |
| フォールバック: resourceIds が空配列     | `resourceIds` が `[]` のフェーズを渡し、`fallback` がそのまま返ることを確認する                |
| フォールバック: 全リソース未発見         | `resourceIds` に存在しない ID のみを指定し、`fallback` がそのまま返ることを確認する            |
| 個別リソース未発見のスキップ + warn ログ | 一部の ID が不正な場合に、有効なリソースのみ返却されることを確認する                           |
| kind → tier マッピング: asset            | `kind: "asset"` のリソースが `optional-quality` / `required: false` に変換されることを確認する |
| パス変換: `./` なしのパス                | `./` プレフィックスがないパスがそのまま `relativePath` になることを確認する                    |

**手順**:

1. 未カバー箇所を特定する
2. 対応するテストケースを `manifestResourceResolver.test.ts` に追加する
3. 再度カバレッジ計測コマンドを実行する
4. 基準をクリアするまでタスク3〜4を繰り返す

### タスク5: カバレッジレポートの記録

**目的**: 最終的なカバレッジ数値と未カバー箇所の説明を文書化する

**記録内容**:

- 最終カバレッジ数値（Line / Branch / Function）をファイル別に記録
- 未カバー箇所の一覧とその理由
- 基準クリアの確認
- 変更したファイル / ブロックの line カバレッジと branch カバレッジの実測値を証跡として残す

## 参照資料

| 資料名                           | パス                                                                                      | 説明                              |
| -------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件定義                 | `phase-1-requirements.md`                                                                 | 要件・AC・スコープ定義            |
| Phase 2 設計                     | `phase-2-design.md`                                                                       | 設計書（フォールバック5パターン） |
| manifestResourceResolver         | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                      | カバレッジ計測対象（新規）        |
| RuntimeSkillCreatorFacade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | カバレッジ計測対象（変更箇所）    |
| テスト: manifestResourceResolver | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`       | ユーティリティのテスト            |
| テスト: Facade plan              | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | Facade plan() のテスト            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 統合テスト連携

| テスト観点                  | 内容                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Branch coverage の重要性    | 動的パス / フォールバック5パターンの分岐が全パターンカバーされていることが重要                                             |
| Function coverage の対象    | `buildPhaseResourceRequestsFromManifest` およびその内部ロジック（パス変換・tier マッピング）が間接的にカバーされていること |
| Facade 統合パスのカバレッジ | `plan()` / `improve()` の動的パスで `buildPhaseResourceRequestsFromManifest` が呼ばれることがカバーされていること          |

## 成果物

| 成果物             | パス                                 | 説明                                                           |
| ------------------ | ------------------------------------ | -------------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・判定・未カバー箇所の説明記録（ファイル別実測値含む） |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test -- --coverage --run manifestResourceResolver RuntimeSkillCreatorFacade` を実行している
- [ ] `manifestResourceResolver.ts` の Line coverage が 80% 以上である
- [ ] `manifestResourceResolver.ts` の Branch coverage が 60% 以上である
- [ ] `manifestResourceResolver.ts` の Function coverage が 80% 以上である
- [ ] `RuntimeSkillCreatorFacade.ts`（変更箇所周辺）の Line coverage が 80% 以上である
- [ ] `RuntimeSkillCreatorFacade.ts`（変更箇所周辺）の Branch coverage が 60% 以上である
- [ ] 未カバー箇所の一覧と理由が記録されている
- [ ] 変更したファイル / ブロックの line カバレッジと branch カバレッジの実測値が証跡として残されている
- [ ] カバレッジレポート `outputs/phase-7/coverage-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
