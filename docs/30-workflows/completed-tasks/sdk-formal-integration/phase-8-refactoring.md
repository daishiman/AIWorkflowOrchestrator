# Phase 8: リファクタリング — 型定義・テストのコード品質改善（TDD Refactor）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION          |
| Phase番号  | 8                                         |
| Phase名    | リファクタリング                          |
| 目的       | Phase 5 実装のコード品質改善              |
| 前提Phase  | Phase 7（カバレッジ確認 — PASS）          |
| 後続Phase  | Phase 9（品質検証）                       |
| ステータス | 未実施                                    |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration |
| 作成日     | 2026-02-12                                |

---

## 目的

Phase 5 で Green にした実装コードと、Phase 4-6 で作成したテストコードに対して、TDD サイクルの Refactor 段階として品質改善を行う。型定義の命名規則の既存パターンとの整合性確認、不要なコメントの除去、import 文の整理、テスト構造の改善を実施する。本 Phase ではビジネスロジックの変更は一切行わず、コードの可読性・保守性の向上のみを目的とする。

---

## 依存関係

| 依存元  | 成果物                                         | 用途                     |
| ------- | ---------------------------------------------- | ------------------------ |
| Phase 5 | 修正済み `SkillExecutor.ts`                    | リファクタリング対象     |
| Phase 5 | 更新済み `@anthropic-ai-claude-agent-sdk.d.ts` | リファクタリング対象     |
| Phase 5 | 更新済みモックファイル                         | リファクタリング対象     |
| Phase 6 | 追加テストコード                               | テスト品質改善対象       |
| Phase 7 | `outputs/phase-7/coverage-report.md`           | カバレッジ基準達成の前提 |

---

## 実行タスク

### Task 1: コード品質レビュー — 型定義の命名規則・コメント・import 文の整理

#### 確認項目

| 確認項目        | 確認基準                                                                      | 対象ファイル                          |
| --------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| 型名の命名規則  | 既存の `QueryOptions`, `QueryMessage`, `QueryResult` との一貫性が保たれている | `@anthropic-ai-claude-agent-sdk.d.ts` |
| PascalCase 命名 | すべてのインターフェース・型エイリアスが PascalCase であること                | `@anthropic-ai-claude-agent-sdk.d.ts` |
| 不要なコメント  | `as any` 除去に伴う古いコメント（「anyキャストを使用」等）が残っていないこと  | `SkillExecutor.ts`                    |
| import 文の整理 | 未使用の import が残っていないこと                                            | `SkillExecutor.ts`                    |
| JSDoc コメント  | 修正済み箇所の JSDoc が実態と整合していること                                 | `SkillExecutor.ts`                    |

#### 実行手順

1. `@anthropic-ai-claude-agent-sdk.d.ts` を開き、新規追加した型名（`QueryCallOptions`, `QueryConfig`, `SDKMessage`, `Conversation`）が既存の命名パターンと整合しているか確認する
2. `SkillExecutor.ts` 内で `as any` 除去に関連する古いコメントが残っていないか `grep` で検索する
3. `SkillExecutor.ts` の import 文に未使用のものがないか確認する
4. 修正が必要な箇所があれば修正する

---

### Task 2: 型定義の DRY 原則適用 — 重複排除の検討

#### 検討対象

| 型定義             | 定義箇所                              | 利用箇所           | 重複有無 |
| ------------------ | ------------------------------------- | ------------------ | -------- |
| `SDKQueryOptions`  | `SkillExecutor.ts`（ローカル型）      | `SkillExecutor.ts` | 要確認   |
| `QueryCallOptions` | `@anthropic-ai-claude-agent-sdk.d.ts` | `SkillExecutor.ts` | 要確認   |

#### 判定基準

- `SDKQueryOptions`（SkillExecutor.ts 内のローカルインターフェース）と `QueryCallOptions`（型定義ファイルの型）が同一構造の場合、ローカル型を共有型定義への参照に置き換えることを**検討**する
- ただし、以下の場合はスコープ外として記録のみ行う:
  - ローカル型が SDK 型定義の部分集合（サブセット）である場合
  - ローカル型に SDK 型定義にはないフィールドが含まれる場合
  - 変更が `SkillExecutor.ts` 以外のファイルに波及する場合

#### 成果物

- 重複分析の結果を `outputs/phase-8/dry-analysis.md` に記録する
- スコープ外と判定した場合は、未タスク候補として記録する

---

### Task 3: テスト品質改善 — テスト名・テスト構造の改善

#### 対象テストファイル

```
apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

#### 改善項目

| 改善項目             | 確認基準                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| テスト名の明確性     | `it("should ...")` の記述が実行内容と期待結果を正確に表現していること        |
| describe ネスト構造  | テストケースが論理的にグループ化されていること（型推論、エラー検出、互換性） |
| テスト間の独立性     | `beforeEach` でモックが適切にリセットされていること                          |
| アサーションの明確性 | `expect()` の対象と条件が明確であること                                      |

#### 注意事項

- テストのロジック（何をテストするか）は変更しない
- テスト名とグループ構造の改善のみ実施する
- 改善によりテストが FAIL する場合は改善を取り消す

---

### Task 4: リファクタリング後の全テスト実行 — 品質維持の確認

#### 実行コマンド

```bash
# SkillExecutor 関連テスト全件実行
pnpm vitest run apps/desktop/src/main/services/skill/__tests__/

# 全パッケージの型チェック
pnpm typecheck
```

#### 確認項目

| 確認項目                              | 期待結果          |
| ------------------------------------- | ----------------- |
| 全 7 テストファイルが PASS            | テスト失敗 0 件   |
| `pnpm typecheck` が全パッケージで成功 | エラー 0 件       |
| `pnpm --filter @repo/desktop lint`    | 警告・エラー 0 件 |

#### テスト FAIL 時の対応

- リファクタリングによりテストが FAIL した場合は、該当のリファクタリング変更を取り消す
- テストの PASS を最優先し、品質改善は PASS を維持できる範囲に限定する

---

## 既知の落とし穴への対策

| Pitfall ID | 内容                               | 対策                                                                 |
| ---------- | ---------------------------------- | -------------------------------------------------------------------- |
| P11        | PostToolUse フックによる Edit 失敗 | 各 Task の編集後に `git diff --stat` で変更数を確認する              |
| P9         | テスト間の状態リーク               | Task 3 でテスト間の独立性を確認し、`beforeEach` のリセットを検証する |

---

## 参照資料

| 参照資料                   | パス                                                                             | 内容                     |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装仕様           | `phase-5-implementation.md`                                                      | 実装内容の参照           |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                             | カバレッジ基準達成の確認 |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                               | 命名規則・品質基準       |
| SkillExecutor 実装         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                          | リファクタリング対象     |
| SDK 型定義                 | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`                  | リファクタリング対象     |
| テストファイル             | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | テスト品質改善対象       |

---

## 実行手順

### Step 1: コード品質レビューの実施

1. `@anthropic-ai-claude-agent-sdk.d.ts` を開き、型名の命名規則を確認する
2. `SkillExecutor.ts` で古いコメントが残っていないか確認する
3. 未使用の import がないか確認する
4. 修正が必要な箇所を修正する

### Step 2: DRY 原則の検討

1. `SkillExecutor.ts` のローカル型 `SDKQueryOptions` と型定義ファイルの `QueryCallOptions` を比較する
2. 重複がある場合はリファクタリングの可否を判定する
3. 判定結果を `outputs/phase-8/dry-analysis.md` に記録する

### Step 3: テスト品質改善

1. `SkillExecutor.sdk-types.test.ts` のテスト名と構造をレビューする
2. 改善が必要な箇所を修正する
3. 修正後にテストを実行し PASS を確認する

### Step 4: 全テスト実行と最終確認

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` を実行する
2. `pnpm typecheck` を実行する
3. `pnpm --filter @repo/desktop lint` を実行する
4. 全て成功することを確認する

---

## 成果物

| 成果物                     | 説明                                 | 配置先                            |
| -------------------------- | ------------------------------------ | --------------------------------- |
| DRY 分析レポート           | ローカル型と共有型定義の重複分析結果 | `outputs/phase-8/dry-analysis.md` |
| リファクタリング済みコード | 品質改善後のソースコード             | 各対象ファイル（変更がある場合）  |

---

## 統合テスト連携

リファクタリング後の全テスト実行で統合的な動作保証を行う。リファクタリングによる機能変更は行わないため、新規統合テストは不要。

---

## 完了条件

- [ ] `@anthropic-ai-claude-agent-sdk.d.ts` の型名が既存パターンと整合している
- [ ] `SkillExecutor.ts` に `as any` 除去に関連する古いコメントが残っていない
- [ ] `SkillExecutor.ts` に未使用の import が残っていない
- [ ] ローカル型と共有型定義の重複分析が `outputs/phase-8/dry-analysis.md` に記録されている
- [ ] テスト名が実行内容と期待結果を正確に表現している
- [ ] 全 7 テストファイルが PASS している
- [ ] `pnpm typecheck` が全パッケージでエラー 0 件で成功している
- [ ] `pnpm --filter @repo/desktop lint` が警告・エラー 0 件で成功している
- [ ] リファクタリングによるビジネスロジックの変更がないこと
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 9: 品質検証** — Lint・型チェック・全テスト実行による品質確認
