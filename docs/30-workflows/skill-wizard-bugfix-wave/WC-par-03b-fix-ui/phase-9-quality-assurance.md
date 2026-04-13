# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 9                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 8                                                                 |
| 後続Phase  | Phase 10                                                                |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

実装・テスト・リファクタリングが完了した成果物に対して最終的な品質チェックを実施する。
CIで失敗しないことを事前に確認し、Phase 11の手動テストへ安全に引き渡せる状態にする。

## 実行タスク

- [ ] TypeScript型チェックを関連パッケージ全体で実行する
- [ ] ESLintを関連パッケージ全体で実行する
- [ ] Vitestテストを関連パッケージ全体で実行する
- [ ] `bg-blue-600`のhardcoded色が全ウィザードファイルから除去されていることを確認する
- [ ] 受け入れ基準AC-1〜AC-5を全て満たしていることを確認する

## 参照資料

| 資料名       | パス                      | 説明                   |
| ------------ | ------------------------- | ---------------------- |
| 要件定義     | `phase-1-requirements.md` | 受け入れ基準AC-1〜AC-5 |
| 変更ファイル | 実装済み7ファイル         | QA対象                 |

## 実行手順

### Step 1: 全チェックの一括実行

```bash
# shared パッケージ全チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared test

# desktop パッケージ全チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

### Step 2: hardcoded色の残存確認

```bash
# bg-blue-600 の残存確認（0件であること）
grep -rn "bg-blue-600" \
  apps/desktop/src/renderer/components/skill/ \
  --include="*.tsx"

# text-white の残存確認（ウィザード関連）
grep -n "text-white" \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### Step 3: 受け入れ基準チェックリスト

| AC番号 | 受け入れ基準                                                                         | 確認方法                                                             | 判定   |
| ------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------ |
| AC-1   | カテゴリを複数選択できる（`SkillCategory[]`型、未選択は `[]`）                       | `SkillInfoFormData.category`が`SkillCategory[]`になっていること      | 要確認 |
| AC-2   | 選択済みカテゴリを再クリックで解除できる                                             | `handleCategoryClick`がトグル動作すること（テストPASS）              | 要確認 |
| AC-3   | Step 0の「次へ」・LLMモードの「次へ」・「次のページ」が同一CSS変数スタイルを使用する | `bg-[var(--status-primary)]`と`text-[var(--text-inverse)]`を確認     | 要確認 |
| AC-4   | `InterviewProgressBar`が実際の回答済み問数（1/6〜6/6）を動的に表示する               | `currentQuestion`が`Math.max(1, answeredCount)`で計算されること      | 要確認 |
| AC-5   | カテゴリ型変更に伴う既存テストの更新が完了している                                   | `skillCreator-wizard.test.ts`が`SkillCategory[]`をテストしていること | 要確認 |

### Step 4: QAチェックリスト

| チェック項目                   | コマンド                                 | 期待結果          |
| ------------------------------ | ---------------------------------------- | ----------------- |
| shared型チェック               | `pnpm --filter @repo/shared typecheck`   | エラーなし        |
| desktop型チェック              | `pnpm --filter @repo/desktop typecheck`  | エラーなし        |
| sharedリント                   | `pnpm --filter @repo/shared lint`        | エラーなし        |
| desktopリント                  | `pnpm --filter @repo/desktop lint`       | エラーなし        |
| shared全テスト                 | `pnpm --filter @repo/shared test`        | 全件PASS          |
| desktop全テスト                | `pnpm --filter @repo/desktop test`       | 全件PASS          |
| `bg-blue-600`残存確認          | `grep -rn "bg-blue-600" apps/.../skill/` | 0件               |
| `SkillInfoFormData.category`型 | コード確認                               | `SkillCategory[]` |

### Step 5: 失敗時の対処フロー

```
型チェックエラー（category型の不整合）
  → Phase 5 に戻り、参照箇所を全て SkillCategory[] に更新する

リントエラー
  → Phase 8 に戻り、コードスタイルを修正する

テスト失敗（category型テスト）
  → Phase 4 に戻り、テストを更新する

テスト失敗（handleCategoryClick）
  → Phase 5 に戻り、トグルロジックを修正する

bg-blue-600 残存
  → Phase 5 に戻り、該当箇所のスタイルを変更する
```

## 成果物

- QAチェックリスト全項目がPASSした状態の関連修正ファイル（7ファイル）

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] `pnpm --filter @repo/desktop test` が全件パスする
- [ ] `bg-blue-600`のhardcodedクラスがウィザード関連ファイルに存在しない
- [ ] AC-1〜AC-5の受け入れ基準が全て満たされている
