# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 機能名   | skillcenter-create-route              |
| Phase    | 9                                     |
| 作成日   | 2026-03-17                            |
| 依存     | Phase 8（リファクタリング）の成果物   |

## 目的

Lint・型チェック・全テストを実行して、コードが品質基準を満たしていることを検証する。全項目が PASS しない限り Phase 10 へ進まない。

## 参照資料

- `CLAUDE.md` — pnpm コマンド規約
- `.claude/rules/02-code-quality.md` — コード品質基準
- `.claude/rules/07-git-and-tooling.md` — ツーリングルール

## 実行タスク

### Task 1: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

期待結果: エラー 0 件、警告 0 件

エラーが出た場合: 自動修正を試みる。

```bash
pnpm --filter @repo/desktop lint --fix
```

自動修正後も残るエラーは手動で修正し、`outputs/phase-9/lint-errors.txt` に記録する。

### Task 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待結果: エラー 0 件

エラーが出た場合: エラー内容を `outputs/phase-9/typecheck-errors.txt` に記録し、Phase 5/8 で修正後に再実行する。

確認観点:

- `any` 型の混入がないか
- ナビゲーションアクション関数の引数・戻り値型が正確か
- `useSkillCenter` フックの返り値型が明示されているか

### Task 3: 関連ユニットテスト実行

対象ファイルを対象ディレクトリから実行する（P40対策）。

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/SkillCenterView/ \
  src/renderer/hooks/useSkillCenter/ \
  src/renderer/components/JourneyPanel/
```

期待結果: 全テスト PASS

### Task 4: デスクトップパッケージ全テスト実行

```bash
pnpm --filter @repo/desktop test
```

期待結果: 全テスト PASS（既存テストへのリグレッションなし）

### Task 5: Shared パッケージビルド確認

```bash
pnpm --filter @repo/shared build
```

期待結果: ビルドエラー 0 件

### Task 6: 品質検証結果サマリー作成

`outputs/phase-9/qa-summary.md` に以下を記録する:

- 各 Task の実行結果（PASS / FAIL / スキップ）
- FAIL の場合: エラー内容と対処方法
- 全 PASS した場合: Phase 10 移行許可の記録

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

- `outputs/phase-9/lint-errors.txt` — Lint エラー一覧（0件の場合は「エラーなし」と記載）
- `outputs/phase-9/typecheck-errors.txt` — 型チェックエラー一覧（0件の場合は「エラーなし」と記載）
- `outputs/phase-9/qa-summary.md` — 品質検証結果サマリー

## 完了条件

- [ ] `pnpm lint` がエラー 0 件で完了している
- [ ] `pnpm typecheck` がエラー 0 件で完了している
- [ ] 関連ユニットテストが全 PASS している
- [ ] デスクトップパッケージの全テストが PASS している
- [ ] Shared パッケージがビルドエラーなしでビルドできている
- [ ] `outputs/phase-9/qa-summary.md` に全 PASS が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 10: 最終レビュー
