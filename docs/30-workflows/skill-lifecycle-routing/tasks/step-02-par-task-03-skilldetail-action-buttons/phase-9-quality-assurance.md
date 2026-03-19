# Phase 9: 品質検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 9                                       |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 8 成果物（`outputs/phase-8/`）    |

## 目的

Lint・型チェック・全テスト実行の3項目を順次実施し、プロダクション品質を確認する。いずれかが失敗した場合は原因を特定して修正する。

## 参照資料

- Phase 8 成果物: `outputs/phase-8/`
- コード品質ルール: `.claude/rules/02-code-quality.md`
- Git & ツーリングルール: `.claude/rules/07-git-and-tooling.md`

## 実行タスク

- タスク 1: Lint 実行結果を取得し、違反をゼロにする
- タスク 2: TypeScript 型チェックを実行し、型エラーを解消する
- タスク 3: 対象テストと関連テストを実行し、回帰を検証する
- タスク 4: 品質サマリを作成して Phase 10 判定材料を揃える

## 実行手順

### Step 1: Lint 実行

```bash
pnpm --filter @repo/desktop lint
```

- ESLint エラー・警告がゼロであることを確認する
- 未使用 import がないことを確認する
- `any` 型の使用がないことを確認する

### Step 2: 型チェック実行

```bash
pnpm --filter @repo/desktop typecheck
```

- TypeScript コンパイルエラーがゼロであることを確認する
- 以下のファイルを重点確認する:
  - `src/renderer/components/SkillDetailPanel/ActionButtons.tsx`
  - `src/renderer/hooks/useSkillCenter.ts`

### Step 3: テスト実行

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/SkillDetailPanel \
  src/renderer/hooks/useSkillCenter
```

- TC-01〜TC-08 に対応するテストケースが全件 PASS していることを確認する
- テスト失敗時は原因を特定し修正する

### Step 4: 関連テスト一括実行

```bash
pnpm --filter @repo/desktop test
```

- 既存テストへのリグレッションがないことを確認する

### Step 5: 問題発生時の対応方針

| 問題種別           | 対応先                              |
| ------------------ | ----------------------------------- |
| Lint エラー        | 該当ファイルを直接修正              |
| 型チェックエラー   | 該当ファイルを直接修正              |
| テスト失敗（新規） | Phase 5 実装またはテストを修正      |
| テスト失敗（既存） | リグレッションとして Phase 8 へ戻る |

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| ファイル                               | 内容                            |
| -------------------------------------- | ------------------------------- |
| `outputs/phase-9/lint-result.txt`      | ESLint 実行結果の全文           |
| `outputs/phase-9/typecheck-result.txt` | TypeScript 型チェック結果の全文 |
| `outputs/phase-9/test-result.txt`      | テスト実行結果の全文            |
| `outputs/phase-9/quality-summary.md`   | 3項目の合否サマリ               |

## 完了条件

- [ ] `pnpm lint` がエラーゼロで完了している
- [ ] `pnpm typecheck` がエラーゼロで完了している
- [ ] 対象テストが全件 PASS している（TC-01〜TC-08 を含む）
- [ ] 既存テストにリグレッションがない
- [ ] `outputs/phase-9/quality-summary.md` に全結果が記録されている

**本Phase内の全タスクを100%実行完了** してから次フェーズへ進むこと。

## 次 Phase

Phase 10（最終レビュー）へ進む。
