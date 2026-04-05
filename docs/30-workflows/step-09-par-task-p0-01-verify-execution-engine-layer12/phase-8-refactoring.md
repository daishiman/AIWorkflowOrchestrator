# Phase 8: リファクタリング（TDD: Refactor）- TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 8                                                      |
| Phase名   | リファクタリング（TDD: Refactor）                      |
| カテゴリ  | 品質改善                                               |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 7                                                |
| 後続Phase | Phase 9（lint/typecheck）または Phase 10（PR作成）     |

## 目的

テストが全件 PASS している状態を維持しながら、コード品質を改善する。動作を変えずに可読性・保守性・一貫性を向上させる。current facts では Layer 3/4 互換も既に存在するため、リファクタリングは core と互換の両方を保護する。

## 実行タスク

### タスク1: リファクタリング候補の洗い出し

**目的**: 改善が必要なコード箇所を実装ファイルから洗い出す

**確認対象ファイル**:

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**洗い出し観点**:

| 観点                      | 確認内容                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| ヘルパー関数の重複        | `fileExists`・`directoryExists` 等で同様のパターン（`fs.stat()` + try/catch）が繰り返されていないか |
| `createCheck` の抽象化    | `createCheck` ファクトリ関数が各チェックで統一的に使われているか                                    |
| エラーハンドリングの統一  | Layer 1・Layer 2 各関数内の try/catch パターンが統一されているか                                    |
| 命名の一貫性（camelCase） | 全ての変数名・関数名が camelCase 規則に従っているか                                                 |
| Layer 2 出力制御ロジック  | 出力制御条件の式が読みやすく、重複していないか                                                      |
| 型アサーションの適切性    | `as` キャストや `!` 演算子の使用が最小限に抑えられているか                                          |

### タスク2: リファクタリングの実施

**目的**: 洗い出した改善候補をコードに反映する

**リファクタリング変更記録テーブル**（実施した変更を記録する）:

| 対象                       | Before | After | 理由 |
| -------------------------- | ------ | ----- | ---- |
| （記録用プレースホルダー） | —      | —     | —    |

**具体的なリファクタリングパターン例**:

#### パターン1: ヘルパー関数の重複排除

- Before: `fileExists` と `directoryExists` が似たような `fs.stat()` + try/catch を個別に持つ
- After: 共通の `statOrNull(p)` ヘルパーを抽出し、`fileExists`・`directoryExists` はそれを呼ぶ
- 理由: DRY 原則。`fs.stat()` の挙動変更が 1 箇所の修正で済む

#### パターン2: createCheck ファクトリ関数の抽象化

- Before: `createCheck` の引数が全呼び出し箇所でバラバラな順序または省略形
- After: 全ての `createCheck` 呼び出しが同じ引数順序・型で統一されている
- 理由: 可読性向上。新チェック追加時のミスを減らす

#### パターン3: Layer 2 出力制御条件の統一

- Before: 各チェックごとにインライン条件式（`if (layer1Checks.some(...))`）が散在
- After: `shouldEmitLayer2Check(id, resourceState)` ヘルパーで出力制御を一元化
- 理由: 出力制御条件の変更が 1 箇所で済む。テスト可読性が向上する

#### パターン4: 命名の一貫性確認（camelCase）

- Before: 一部の変数名・パラメータ名が `snake_case` や不統一な大文字小文字
- After: 全て camelCase に統一
- 理由: TypeScript 標準の命名規則に準拠し、コードレビューの摩擦を減らす

### タスク3: リファクタリング後のテスト実行

**目的**: リファクタリングにより動作が変わっていないことを確認する

**実行コマンド**:

```bash
# 全テストの再実行
pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm lint
```

**確認項目**:

- [ ] Phase 4 の基本テスト 15 件が全件 PASS している
- [ ] Phase 6 で追加した拡充テストが全件 PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし

### タスク4: リファクタリングレポートの作成

**目的**: 実施したリファクタリングの内容を `outputs/phase-8/refactoring-report.md` に記録する

**記録内容**:

1. リファクタリングを実施した変更の一覧（「対象/Before/After/理由」テーブル形式）
2. リファクタリングを実施しなかった箇所とその理由（過剰改善を避けた判断記録）
3. テスト再実行結果（全件 PASS であることの確認）
4. 次のPhase（lint/typecheck）への引き継ぎ事項

**変更記録テーブル形式**:

```markdown
## 変更一覧

| 対象ファイル                      | Before（変更前）             | After（変更後）              | 理由         |
| --------------------------------- | ---------------------------- | ---------------------------- | ------------ |
| SkillCreatorVerificationEngine.ts | （変更前のコードスニペット） | （変更後のコードスニペット） | （変更理由） |
```

## 参照資料

| 資料名             | パス                                                                       | 説明                          |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------- |
| Phase 2 設計       | `outputs/phase-2/design.md`                                                | リファクタリング前提の設計    |
| Phase 5 実装       | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | リファクタリング対象の実装    |
| Phase 5 Facade     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | リファクタリング対象の Facade |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`                                       | カバレッジ基準の確認          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                             |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | リファクタリング後も命名規則が維持されていること |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | 責務分離がリファクタリング後も維持されていること |

## 統合テスト連携

| テスト観点           | 内容                                                                |
| -------------------- | ------------------------------------------------------------------- |
| 動作不変の保証       | 全テスト PASS がリファクタリング前後で維持されていること            |
| 型契約の維持         | `RuntimeSkillCreatorVerifyCheck` の型シグネチャが変わっていないこと |
| P0-02 との互換性維持 | `severity` フィールドの値（error/warning/info）が変わっていないこと |

## 成果物

| 成果物                   | パス                                                                       | 説明                                       |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------ |
| リファクタリング後の実装 | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | 品質改善後の実装ファイル                   |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`                                    | 変更一覧（対象/Before/After/理由）テーブル |

## 完了条件

- [ ] ヘルパー関数の重複排除を検討し、対処または見送りの判断を記録している
- [ ] `createCheck` ファクトリ関数の抽象化を検討し、対処または見送りの判断を記録している
- [ ] Layer 2 出力制御条件のエラーハンドリングが統一されている
- [ ] 全ての命名が camelCase 規則に従っている
- [ ] リファクタリング後に全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] リファクタリングレポート `outputs/phase-8/refactoring-report.md` が「対象/Before/After/理由」テーブル形式で作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: lint / typecheck 最終確認
