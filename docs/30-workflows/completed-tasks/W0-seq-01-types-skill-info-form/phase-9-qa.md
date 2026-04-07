# Phase 9: 品質保証

## メタ情報

- Phase: 9
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

実装・テスト・リファクタリングが完了した成果物に対して、最終的な品質チェックを実施する。CI で失敗しないことを事前に確認し、後続タスクへ安全に引き渡せる状態にする。

## 実行タスク

- [ ] TypeScript 型チェックをパッケージ全体で実行する
- [ ] ESLint をパッケージ全体で実行する
- [ ] Vitest テストをパッケージ全体で実行する
- [ ] `skillCreator.ts` のエクスポート一覧に追加型が含まれていることを確認する
- [ ] 追加型が `@repo/shared/types/skillCreator` の公開 API として利用可能であることを確認する
- [ ] 既存テストへの影響がないことを確認する

## 参照資料

| 資料名                | パス                                                              | 説明                 |
| --------------------- | ----------------------------------------------------------------- | -------------------- |
| 追記対象ファイル      | `packages/shared/src/types/skillCreator.ts`                       | QA 対象              |
| テストファイル        | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | QA 対象              |
| shared パッケージ設定 | `packages/shared/package.json`                                    | エクスポート設定確認 |

## 実行手順

### Step 1: 全チェックの一括実行

```bash
# 型チェック（shared パッケージ全体）
pnpm --filter @repo/shared typecheck

# リント（shared パッケージ全体）
pnpm --filter @repo/shared lint

# テスト（shared パッケージ全体）
pnpm --filter @repo/shared test
```

### Step 2: 追加型のエクスポート確認

以下のインポートが他パッケージから正常に行えることを確認する。

```typescript
// apps/desktop や apps/web からのインポートが通ることを確認
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillCategory,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  SmartDefaultResult,
  SkeletonQualityFeedback,
} from "@repo/shared/types/skillCreator";
```

確認コマンド:

```bash
# shared パッケージのビルド（エクスポート確認）
pnpm --filter @repo/shared build
```

### Step 3: 既存テストへの影響確認

追加型が既存型と衝突していないことを確認する。

```bash
# shared パッケージの全テスト（既存テストを含む）
pnpm --filter @repo/shared test --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|ERROR)"
```

特に以下の既存テストが引き続きパスすることを確認:

- `skillCreator.test.ts`（既存ファイルが存在する場合）
- `skillCreator.ts` を参照する他のテストファイル

### Step 4: QA チェックリスト

| チェック項目 | コマンド                                              | 期待結果          |
| ------------ | ----------------------------------------------------- | ----------------- |
| 型チェック   | `pnpm --filter @repo/shared typecheck`                | エラーなし        |
| リント       | `pnpm --filter @repo/shared lint`                     | エラーなし        |
| 新規テスト   | `pnpm --filter @repo/shared test skillCreator-wizard` | 全件 PASS         |
| 全テスト     | `pnpm --filter @repo/shared test`                     | 既存含め全件 PASS |
| ビルド       | `pnpm --filter @repo/shared build`                    | エラーなし        |

### Step 5: 失敗時の対処フロー

```
型チェックエラー
  → Phase 5 に戻り、型定義を修正する

リントエラー
  → Phase 8 に戻り、コードスタイルを修正する

テスト失敗（新規）
  → Phase 4-6 に戻り、テストまたは実装を修正する

テスト失敗（既存）
  → `skillCreator.ts` への追加内容を確認・修正する

ビルドエラー
  → 型のエクスポート設定を確認する
```

## 成果物

- QA チェックリストの全項目が PASS した状態の `skillCreator.ts` および テストファイル

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする（新規・既存含む）
- [ ] `pnpm --filter @repo/shared build` がエラーなしで通過する
- [ ] 追加した 7 型が `@repo/shared/types/skillCreator` から正しくインポートできる
