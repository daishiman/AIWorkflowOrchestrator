# Phase 9: 品質検証

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 9                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

Lint、型チェック、全テスト実行による品質検証を行う。

## 実行タスク

- Lint実行: ESLintによるコード品質チェック
- 型チェック実行: TypeScript型チェックによる型安全性検証
- テスト全実行: Vitestによる全テスト実行と結果確認
- 変更差分確認: 変更ファイルが想定の4ファイルのみであることを検証
- IPC契約ドリフト検証: IPC通信チャネルの変更有無を確認

## 参照資料

| 資料名                 | パス                               | 説明                 |
| ---------------------- | ---------------------------------- | -------------------- |
| Phase 5 実装成果物     | `phase-5-implementation.md`        | 実装内容の参照       |
| Phase 7 カバレッジ確認 | `phase-7-coverage-report.md`       | カバレッジ基準の参照 |
| 品質基準               | `.claude/rules/02-code-quality.md` | コード品質ルール     |

## 実行手順

### ステップ 1: Lint

```bash
pnpm lint
```

### ステップ 2: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ 3: テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

### ステップ 4: 変更差分確認

```bash
git diff --stat
```

変更ファイルが以下の4ファイルのみであることを確認:

1. `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`
2. `apps/desktop/src/renderer/navigation/navContract.ts`
3. `apps/desktop/src/renderer/navigation/navContract.test.ts`
4. `apps/desktop/src/renderer/store/types.test.ts`

## 品質基準

| チェック項目   | 基準          |
| -------------- | ------------- |
| ESLint         | 0 errors      |
| TypeScript     | 0 errors      |
| Vitest         | 全テスト PASS |
| 変更ファイル数 | 4 ファイル    |

### IPC契約ドリフト検証【Phase 9 品質ゲート】

本タスクはnavContract.tsの型拡張であり、IPC通信チャネルの変更は含まない。

- [x] IPC通信チャネルの追加・変更なし → ドリフト検証は該当外（N/A）
- [ ] 参考: `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` の実行は任意

## 統合テスト連携

| 品質項目   | 確認内容         | 結果         |
| ---------- | ---------------- | ------------ |
| 機能検証   | 全自動テスト成功 | (実行時記入) |
| 統合テスト | 全統合テスト成功 | (実行時記入) |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| UI/UX          | GlobalNavStripへのnav item追加 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ | navContract.ts型拡張           | `aiworkflow-requirements: architecture-*.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断             | 仕様参照先                            |
| -------------------------- | -------------------- | ------------------------------------- |
| フロントエンド（Renderer） | Icon/navContract変更 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] `pnpm lint` が 0 errors
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 errors
- [ ] 全テスト PASS
- [ ] 変更ファイルが想定通り
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 10: 最終レビュー
