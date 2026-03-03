# Phase 9: 品質保証

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase番号 | 9                         |
| 機能名    | skill-create-wizard       |
| タスクID  | TASK-10A-C                |
| 作成日    | 2026-03-03                |
| 前Phase   | Phase 8: リファクタリング |
| 次Phase   | Phase 10: 最終レビュー    |

## 目的

Lint・TypeScript型チェック・全テスト実行・カバレッジ最終確認を通じて、
`SkillCreateWizard` 実装のコード品質を自動検証し、
**Phase 10（最終レビュー）に進むための品質ゲートをクリア**する。

## 実行タスク

- 品質保証タスク: lint/typecheck/test/coverageを通し品質レポートを確定する。

| No  | タスク                   | コマンド                                                                       |
| --- | ------------------------ | ------------------------------------------------------------------------------ |
| 1   | ESLint 実行・修正        | `cd apps/desktop && pnpm lint`                                                 |
| 2   | TypeScript 型チェック    | `cd apps/desktop && pnpm typecheck`                                            |
| 3   | コンポーネントテスト実行 | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/`            |
| 4   | 全テスト実行             | `cd apps/desktop && pnpm vitest run`                                           |
| 5   | カバレッジ最終確認       | `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/` |
| 6   | 品質レポート作成         | `outputs/phase-9/quality-report.md`                                            |

## 参照資料

| 資料                        | パス                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Phase 5 実装                | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-5-implementation.md`              |
| コード品質ルール            | `.claude/rules/02-code-quality.md`                                                             |
| P39対策（happy-dom）        | `.claude/rules/06-known-pitfalls.md#P39`                                                       |
| P40対策（実行ディレクトリ） | `.claude/rules/06-known-pitfalls.md#P40`                                                       |
| Phase 8 成果物              | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-8/refactoring-summary.md` |
| カバレッジ基準              | `.claude/rules/02-code-quality.md#カバレッジ基準`                                              |
| 品質要件仕様                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                    |
| エラーハンドリング仕様      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                          |
| 入力検証セキュリティ仕様    | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`               |
| Agent SDK スキル仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`              |

## 実行手順

### Step 1: ESLint 実行と修正

```bash
cd apps/desktop && pnpm lint
```

**よくある ESLint エラーと対処:**

| エラー                               | 対処                                   |
| ------------------------------------ | -------------------------------------- |
| `no-unused-vars`                     | 未使用変数・import を削除              |
| `@typescript-eslint/no-explicit-any` | `any` を具体的な型に変更               |
| `react-hooks/exhaustive-deps`        | useEffect の依存配列を明示ルールで設定 |
| `react/display-name`                 | コンポーネントに `displayName` を設定  |

自動修正:

```bash
cd apps/desktop && pnpm lint --fix
```

自動修正後に手動対処が必要なエラーが残った場合は修正してから次のステップへ。

### Step 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

**TypeScript エラー対処方針:**

- `Type 'X' is not assignable to type 'Y'` → 型定義を修正する。`as` による型キャストは最終手段
- `Property 'X' does not exist on type 'Y'` → 型定義に不足プロパティを追加
- `Cannot find module 'X'` → import パスを確認、依存関係が `package.json` に記載されているか確認（P8対策）

**禁止事項:**

- `@ts-ignore` / `@ts-expect-error` を理由コメントなしで使用しない
- `any` 型で型エラーを回避しない

### Step 3: コンポーネントテスト実行

P40対策: テストは必ずパッケージディレクトリから実行する。

```bash
# ✅ 正しい実行方法（apps/desktop ディレクトリから）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# ❌ 間違い（プロジェクトルートから直接パス指定）
# pnpm vitest run apps/desktop/src/renderer/components/skill/
```

**確認する対象ファイル:**

| ファイル                               | 内容                       |
| -------------------------------------- | -------------------------- |
| `__tests__/SkillCreateWizard.test.tsx` | メインコンポーネントテスト |
| `__tests__/useWizardStep.test.ts`      | カスタムフックテスト       |
| `wizard/` 配下の `*.test.tsx`          | サブコンポーネントテスト   |

**テスト失敗時の対処:**

1. エラーメッセージを確認
2. P39対策: `userEvent` を使用している場合は `fireEvent` に変更
3. P9対策: テスト間で状態がリークしていないか確認（`beforeEach` でリセット）
4. テストを修正（プロダクションコードが正しい場合）またはコードを修正（テストが正しい場合）

### Step 4: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

`SkillCreateWizard` 関連の変更が他のテストを壊していないことを確認する。

**注意:** 失敗するテストが出た場合は `.skip` で一時スキップし、
GitHub Issue を作成して未タスクとして管理する（`--no-verify` は使用禁止）。

### Step 5: カバレッジ最終確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/
```

**カバレッジ基準:**

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**カバレッジ不足の場合:**
Phase 6 に戻ってテストを追加する（Phase 9 では新規テストは追加しない方針だが、
Phase 8 のリファクタリングで新しいコードが追加された場合は追加可）。

**v8 カバレッジプロバイダの注意（P41対策）:**
インライン arrow function がある場合、Function Coverage が予期せず低下することがある。
IPC バリデーション関連のコールバックは明示的にテストして確認する。

### Step 6: 品質レポート作成

以下の内容で `outputs/phase-9/quality-report.md` を作成する:

```markdown
# Phase 9 品質レポート

## 実行日時

2026-XX-XX HH:MM

## Lint 結果

- ステータス: PASS / FAIL
- エラー件数: N件
- 警告件数: N件
- 自動修正件数: N件
- 手動修正件数: N件

## TypeScript 型チェック結果

- ステータス: PASS / FAIL
- エラー件数: N件
- 主なエラー内容: （あれば記載）

## コンポーネントテスト結果

- ステータス: PASS / FAIL
- 全テスト数: N件
- PASS: N件
- FAIL: N件（Failがある場合は詳細を記載）
- SKIP: N件

## 全テスト結果

- ステータス: PASS / FAIL
- 変更前後でのテスト数変化: なし / 増加N件 / 減少N件

## カバレッジ結果

| 指標              | 結果 | 基準 | 判定      |
| ----------------- | ---- | ---- | --------- |
| Line Coverage     | XX%  | 80%  | PASS/FAIL |
| Branch Coverage   | XX%  | 60%  | PASS/FAIL |
| Function Coverage | XX%  | 80%  | PASS/FAIL |

## 総合判定

- [ ] PASS（Phase 10 へ進む）
- [ ] FAIL（修正が必要）

## 残件（あれば）

- 修正が必要な項目と対処内容
```

## 統合テスト連携

全テスト実行（Step 4）で `SkillManagementPanel`（TASK-10A-A）や
`SkillAnalysisView`（TASK-10A-B）のテストも含まれるため、
相互影響がないことを確認する。

## 多角的チェック観点

| 観点             | チェック内容                            |
| ---------------- | --------------------------------------- |
| Lint             | ESLint エラー 0件、警告も可能な限り 0件 |
| 型安全性         | TypeScript エラー 0件、`any` 型なし     |
| テスト           | 全テスト PASS、リグレッションなし       |
| カバレッジ       | Line/Function 80%以上、Branch 60%以上   |
| happy-dom制約    | `userEvent` 不使用、`fireEvent` で代替  |
| 実行ディレクトリ | `apps/desktop` から実行（P40対策）      |

## 成果物

| 成果物       | パス                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| 品質レポート | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] ESLint が 0 エラーで PASS している
- [ ] TypeScript 型チェックが 0 エラーで PASS している
- [ ] コンポーネントテストが全件 PASS している
- [ ] 全テスト実行でリグレッションが発生していない
- [ ] Line Coverage が 80% 以上
- [ ] Function Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] 品質レポートに総合判定「PASS」が記録されている

## サブタスク管理

| No  | サブタスク               | ステータス |
| --- | ------------------------ | ---------- |
| 1   | ESLint 実行・修正        | pending    |
| 2   | TypeScript 型チェック    | pending    |
| 3   | コンポーネントテスト実行 | pending    |
| 4   | 全テスト実行             | pending    |
| 5   | カバレッジ最終確認       | pending    |
| 6   | 品質レポート作成         | pending    |

## タスク100%実行確認【必須】

Phase 9 完了前に以下を全項目確認すること:

- [ ] ESLint エラー 0件を確認した
- [ ] TypeScript エラー 0件を確認した
- [ ] 全コンポーネントテストが PASS したことを確認した
- [ ] 全テスト実行でリグレッションがないことを確認した
- [ ] カバレッジが全指標で基準値をクリアしていることを確認した
- [ ] `outputs/phase-9/quality-report.md` を作成した
- [ ] 品質レポートに数値を記録した

## 次のPhase

Phase 9 の全完了条件チェックが終了し、品質レポートで「PASS」を確認したら、
Phase 10（最終レビュー）へ進む。

仕様書: `docs/30-workflows/completed-tasks/skill-create-wizard/phase-10-final-review.md`
