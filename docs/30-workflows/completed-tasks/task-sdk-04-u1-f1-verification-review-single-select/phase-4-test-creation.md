# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 4                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 3                                                      |
| 後続Phase  | Phase 5                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

TDD Red フェーズとして、実装前に失敗テストを先行作成し、期待挙動を固定する。

## 参照資料

| 資料名       | パス                                                                                              | 説明           |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                                                      | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                                          | Phase 1 成果物 |
| 設計書       | `outputs/phase-2/design-document.md`                                                              | Phase 2 成果物 |
| テスト戦略   | `outputs/phase-2/test-strategy.md`                                                                | Phase 2 成果物 |
| 未タスク原本 | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md` | 背景・リスク   |

## テストファイル対象

```
apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## 実行タスク

- 既存テストの Red 確認: free_text → single_select 変更後に壊れるテストを特定し、意図的に Red にする
- 新規テスト作成: AC-1〜AC-4 に対応するテストケースを作成する
- テスト仕様書作成: TC 一覧と期待結果を記録する

**[Feedback P0-09-U1 対応]**:
private method のテストが必要な場合は、`(engine as unknown as EnginePrivate)` キャストまたは
`recordExecutionFailure()` / `recordVerifyFailure()` を public API 経由でテストする方針を優先する。

## テストケース一覧

### 変更対象テスト（既存テストの書き換え）

| TC-ID    | テスト名                         | 変更内容                                           | 期待結果     |
| -------- | -------------------------------- | -------------------------------------------------- | ------------ |
| TC-MOD-1 | verification_review approve 遷移 | `textValue` → `selectedOptionId: "approve"` に変更 | approve 遷移 |
| TC-MOD-2 | verification_review improve 遷移 | `textValue` → `selectedOptionId: "improve"` に変更 | improve 遷移 |
| TC-MOD-3 | verification_review reject 遷移  | `textValue` → `selectedOptionId: "reject"` に変更  | reject 遷移  |

### 新規テスト

| TC-ID    | テスト名                                                              | 期待結果                                          |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| TC-NEW-1 | `createVerificationReviewRequest()` が `kind: "single_select"` を返す | `kind === "single_select"`                        |
| TC-NEW-2 | `createVerificationReviewRequest()` の options に3選択肢が含まれる    | options.length === 3, ids: approve/improve/reject |
| TC-NEW-3 | `validateUserInputSubmission` が無効な selectedOptionId を拒否する    | バリデーションエラー返却                          |

## 実行手順

### 1. 実行前コマンド（Red 確認）

```bash
# 現状のテストを実行し、どのテストが影響を受けるかを特定する
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  --reporter=verbose 2>&1 | grep -E "PASS|FAIL|verification_review"
```

### 2. テスト仕様の確認

Phase 1 で確認した命名規則（camelCase / kebab-case）に従い、新規テスト名を設計する。
既存テストの describe/it 構造に合わせること。

### 3. 新規テスト実装（Red 状態確認）

TC-NEW-1〜3 を実装後、実装前なので Red になることを確認する。

```bash
# Red 確認
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

### 4. テスト仕様書の作成

`outputs/phase-4/test-specification.md` に以下を記録する:

- 全テストケース一覧（TC-ID / テスト名 / 期待結果）
- Red 結果のスナップショット（失敗メッセージ）

## 統合テスト連携

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## サブタスク管理

- Lane A: 既存テストの Red 影響を特定する
- Lane B: TC-NEW-1〜3 を設計・追加する
- Lane C: A/B の結果を統合して test-specification と Red 記録を作成する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                                        |
| ------------ | --------------------------------------------------------------- |
| TDD Red 確認 | 実装前に新規テストが必ず Red になっていること                   |
| 命名整合     | 既存テストの命名規則（describe/it）に新規テストが従っていること |
| AC 網羅      | AC-1〜AC-4 が全て TC に対応していること                         |

## 成果物

| 成果物         | パス                                    | 説明                     |
| -------------- | --------------------------------------- | ------------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md` | TC 一覧・期待結果        |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`    | Red 状態のテスト実行結果 |

**注意**: テストコード自体は `outputs/` 配下に配置しない。
テストコードは `apps/desktop/src/main/services/runtime/__tests__/` に配置する。

## 完了条件

- [ ] AC-1〜AC-4 に対応するテストケースが全て定義されている
- [ ] 新規テスト（TC-NEW-1〜3）が Red 状態であることを確認した
- [ ] 既存テストの変更箇所（TC-MOD-1〜3）を特定した
- [ ] テスト仕様書が作成されている
- [ ] Red テスト結果が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 4
```

## 次のPhase

Phase 5: 実装
