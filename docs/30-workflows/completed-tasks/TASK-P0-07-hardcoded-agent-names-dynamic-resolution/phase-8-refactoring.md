# Phase 8: リファクタリング（TDD: Refactor）- TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 8                                                   |
| Phase名   | リファクタリング（TDD: Refactor）                   |
| カテゴリ  | 品質改善                                            |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 7: カバレッジ確認                             |
| 後続Phase | Phase 9: 品質保証                                   |

## 目的

テストが全件 PASS している状態を維持しながら、コード品質を改善する。動作を変えずに可読性・保守性・一貫性を向上させる。Phase 5 で `resolveOperationResources()` に責務を集約した前提で、Facade への追加抽象化を増やさず、必要最小限の整理だけを行う。

## 実行タスク

### タスク1: リファクタリング候補の洗い出し

**目的**: 改善が必要なコード箇所を実装ファイルから洗い出す

**確認対象ファイル**:

- `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**洗い出し観点**:

| 観点                           | 確認内容                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Facade での追加抽象化の必要性  | `plan()` / `improve()` の分岐が Phase 5 で十分に収束しており、追加 helper が不要か                                                                    |
| 関数名の長さ                   | `buildPhaseResourceRequestsFromManifest()` が既存コードの命名慣例と比較して冗長でないか。短縮候補: `resolvePhaseResources()` 等の検討                 |
| パス変換ロジックの独立性       | `path.replace(/^\.\//, "")` が関数内にインラインか、ヘルパーとして分離されているか                                                                    |
| kind → tier マッピングの独立性 | `agent` → `required-core` / `reference`/`schema`/`asset` → `optional-quality` のマッピングが関数内にインラインか、定数/ヘルパーとして分離されているか |
| ログ出力パターンの統一         | フォールバック発動時の warn ログフォーマットが全箇所で統一されているか                                                                                |
| 命名の一貫性（camelCase）      | 全ての変数名・関数名が camelCase 規則に従っているか                                                                                                   |
| 型アサーションの適切性         | `as` キャストや `!` 演算子の使用が最小限に抑えられているか                                                                                            |
| import 整理                    | 使用されていない import が残っていないか                                                                                                              |

### タスク2: リファクタリングの実施

**目的**: 洗い出した改善候補をコードに反映する

**リファクタリング変更記録テーブル**（Feedback RT-03 準拠: 実施した変更を「対象/Before/After/理由」形式で記録する）:

| 対象                       | Before | After | 理由 |
| -------------------------- | ------ | ----- | ---- |
| （記録用プレースホルダー） | --     | --    | --   |

**具体的なリファクタリングパターン例**:

#### パターン1: Facade での追加抽象化を増やさない

- Before: `plan()` と `improve()` の両方で manifest 解決と request 生成が分散している
- After: Phase 5 で `resolveOperationResources()` に集約済みなら、追加の Facade helper は作らず現状維持
- 理由: 追加 helper は呼び出し階層を増やすだけになりやすく、今回の変更範囲では過剰抽象化になりやすい

#### パターン2: 関数名の短縮検討

- Before: `buildPhaseResourceRequestsFromManifest(manifest, phaseId, fallback)`
- After: `resolvePhaseResources(manifest, phaseId, fallback)` または現状維持
- 理由: 関数名が 40 文字超の場合、可読性が低下する。ただし既存の `planPromptConstants.ts`（24 文字）と同等の長さであれば現状維持で問題なし
- 判断基準: Phase 3 MINOR 指摘 #1 の結論を反映する

#### パターン3: kind → tier マッピングの定数化

- Before: `buildPhaseResourceRequestsFromManifest()` 内でインライン条件式 `kind === "agent" ? "required-core" : "optional-quality"`
- After: `KIND_TO_TIER_MAP` 定数オブジェクト `{ agent: { tier: "required-core", required: true }, reference: { tier: "optional-quality", required: false }, schema: { tier: "optional-quality", required: false }, asset: { tier: "optional-quality", required: false } }` として分離
- 理由: 新しい `kind` 追加時に変更箇所を限定できる。テストの可読性も向上

#### パターン4: パス変換ヘルパーの分離

- Before: `resource.path.replace(/^\.\//, "")` がインラインで記述
- After: `normalizeRelativePath(path: string): string` ヘルパーとして分離
- 理由: パス変換ルールの変更が1箇所で済む。テストも独立して記述可能

#### パターン5: ログメッセージの定数化

- Before: ログメッセージが各フォールバック箇所で文字列リテラルとして散在
- After: ログメッセージを定数として `manifestResourceResolver.ts` の先頭にまとめる
- 理由: ログメッセージの統一と、テストでのログ検証時の参照先を明確化

### タスク3: リファクタリング後のテスト実行

**目的**: リファクタリングにより動作が変わっていないことを確認する

**実行コマンド**:

```bash
# manifestResourceResolver のテスト
pnpm --filter @repo/desktop test -- --run manifestResourceResolver

# RuntimeSkillCreatorFacade のテスト
pnpm --filter @repo/desktop test -- --run RuntimeSkillCreatorFacade

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

**確認項目**:

- [ ] `manifestResourceResolver.test.ts` の全テストが PASS している
- [ ] `RuntimeSkillCreatorFacade` 関連の全テスト（plan / improve 含む）が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

### タスク4: リファクタリングレポートの作成

**目的**: 実施したリファクタリングの内容を `outputs/phase-8/refactoring-report.md` に記録する

**記録内容**:

1. リファクタリングを実施した変更の一覧（「対象/Before/After/理由」テーブル形式 -- Feedback RT-03 準拠）
2. リファクタリングを実施しなかった箇所とその理由（過剰改善を避けた判断記録）
3. テスト再実行結果（全件 PASS であることの確認）
4. 次のPhase（品質保証）への引き継ぎ事項

**変更記録テーブル形式**:

```markdown
## 変更一覧

| 対象ファイル                 | Before（変更前）             | After（変更後）              | 理由         |
| ---------------------------- | ---------------------------- | ---------------------------- | ------------ |
| manifestResourceResolver.ts  | （変更前のコードスニペット） | （変更後のコードスニペット） | （変更理由） |
| RuntimeSkillCreatorFacade.ts | （変更前のコードスニペット） | （変更後のコードスニペット） | （変更理由） |
```

## 参照資料

| 資料名                           | パス                                                                                | 説明                           |
| -------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| Phase 2 設計                     | `phase-2-design.md`                                                                 | リファクタリング前提の設計     |
| Phase 3 設計レビュー             | `phase-3-design-review.md`                                                          | MINOR 指摘事項（命名等）       |
| Phase 7 カバレッジ               | `outputs/phase-7/coverage-report.md`                                                | カバレッジ基準の確認           |
| manifestResourceResolver         | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                | リファクタリング対象（新規）   |
| RuntimeSkillCreatorFacade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               | リファクタリング対象（Facade） |
| テスト: manifestResourceResolver | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts` | リファクタリング対象のテスト   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                             |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 責務分離がリファクタリング後も維持されていること |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン準拠                     |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | リファクタリング後も命名規則が維持されていること |

## 統合テスト連携

| テスト観点               | 内容                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| 動作不変の保証           | 全テスト PASS がリファクタリング前後で維持されていること                                          |
| 型契約の維持             | `PhaseResourceRequest` 型のシグネチャがリファクタリング後も変わっていないこと                     |
| フォールバック動作の維持 | フォールバック5パターンの動作がリファクタリング後も変わっていないこと                             |
| 静的定数の保持           | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` がリファクタリング後も削除されていないこと |

## 成果物

| 成果物                   | パス                                                                  | 説明                                                 |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------- |
| リファクタリング後の実装 | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`  | 品質改善後の実装ファイル                             |
| リファクタリング後の実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 品質改善後の Facade                                  |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`                               | 変更一覧（対象/Before/After/理由）テーブル RT-03準拠 |

## 完了条件

- [ ] Phase 5 での責務集約を前提に、Facade への追加 helper が不要かを検討し、対処または見送りの判断を記録している
- [ ] `buildPhaseResourceRequestsFromManifest()` の命名が長すぎる場合の改善を検討し、対処または見送りの判断を記録している
- [ ] kind → tier マッピングの定数化を検討し、対処または見送りの判断を記録している
- [ ] パス変換ヘルパーの分離を検討し、対処または見送りの判断を記録している
- [ ] 全ての命名が camelCase 規則に従っている
- [ ] リファクタリング後に `manifestResourceResolver.test.ts` の全テストが PASS している
- [ ] リファクタリング後に `RuntimeSkillCreatorFacade` 関連の全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] リファクタリングレポート `outputs/phase-8/refactoring-report.md` が「対象/Before/After/理由」テーブル形式（Feedback RT-03 準拠）で作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
