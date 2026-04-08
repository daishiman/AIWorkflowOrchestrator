# Phase 9: 品質保証

## メタ情報

| 項目         | 値                                      |
| ------------ | --------------------------------------- |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 |
| フェーズ     | Phase 9                                 |
| フェーズ名   | 品質保証                                |
| 前提フェーズ | Phase 8（リファクタリング完了）         |
| 担当         | 実装担当者                              |
| 成果物       | `outputs/phase-9/quality-report.md`     |

---

## 目的

実装・テスト・リファクタリングが完了した状態で、全品質チェックを実施する。全チェックが PASS であることを確認してから Phase 10（最終レビューゲート）へ進む。FAIL が発生した場合は該当フェーズへ差し戻す。

---

## 品質チェックリスト

以下の全項目を順番に実行し、結果を `outputs/phase-9/quality-report.md` に記録すること。

### チェック 1: 全ユニットテスト成功

| 項目         | 詳細                                                          |
| ------------ | ------------------------------------------------------------- |
| 目的         | 変更による既存テストへの影響がないことを確認する              |
| 実行コマンド | `pnpm --filter @repo/desktop test`                            |
| 成功条件     | 全テストが PASS し、コマンド終了コードが 0                    |
| 失敗時の対応 | 失敗しているテストを特定し、Phase 5 または Phase 6 へ差し戻す |

```bash
pnpm --filter @repo/desktop test
```

**記録場所**: `outputs/phase-9/quality-report.md` の「チェック 1: ユニットテスト結果」セクション

---

### チェック 2: Lint エラーなし

| 項目         | 詳細                                                          |
| ------------ | ------------------------------------------------------------- |
| 目的         | ESLint ルール違反がないことを確認する                         |
| 実行コマンド | `pnpm lint`                                                   |
| 成功条件     | エラー・警告が 0 件（またはプロジェクト許容済みの警告のみ）   |
| 失敗時の対応 | エラー箇所を修正して再実行する（自動修正: `pnpm lint --fix`） |

```bash
pnpm lint
```

**記録場所**: `outputs/phase-9/quality-report.md` の「チェック 2: Lint 結果」セクション

---

### チェック 3: 型エラーなし

| 項目         | 詳細                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 目的         | TypeScript の型チェックがエラーなく通過することを確認する（AC-6 対応） |
| 実行コマンド | `pnpm typecheck`                                                       |
| 成功条件     | TypeScript コンパイルエラーが 0 件                                     |
| 失敗時の対応 | 型エラー箇所を修正して再実行する。`any` 型での回避は禁止               |

```bash
pnpm typecheck
```

**記録場所**: `outputs/phase-9/quality-report.md` の「チェック 3: 型チェック結果」セクション

---

### チェック 4: コードフォーマット適用済み

| 項目                 | 詳細                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| 目的                 | Prettier によるフォーマットが適用済みであることを確認する                                                    |
| 実行コマンド（確認） | `pnpm --filter @repo/desktop prettier --check apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` |
| 実行コマンド（適用） | `pnpm --filter @repo/desktop prettier --write apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` |
| 成功条件             | `--check` オプションでの実行結果が `All matched files use Prettier code style!`                              |
| 失敗時の対応         | `--write` オプションで自動フォーマットを適用した後、`--check` で再確認する                                   |

```bash
# フォーマット確認
pnpm --filter @repo/desktop prettier --check apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts

# フォーマット適用（必要な場合）
pnpm --filter @repo/desktop prettier --write apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
```

**記録場所**: `outputs/phase-9/quality-report.md` の「チェック 4: フォーマット結果」セクション

---

## 実行順序と差し戻し基準

```
チェック 1: ユニットテスト
        ↓ PASS
チェック 2: Lint
        ↓ PASS
チェック 3: 型チェック
        ↓ PASS
チェック 4: フォーマット
        ↓ PASS
Phase 10 へ進む
```

| 失敗チェック                 | 差し戻し先                  | 理由                               |
| ---------------------------- | --------------------------- | ---------------------------------- |
| チェック 1（ユニットテスト） | Phase 5 または Phase 6      | 実装またはテストコードの修正が必要 |
| チェック 2（Lint）           | Phase 8（リファクタリング） | コードスタイルの修正が必要         |
| チェック 3（型チェック）     | Phase 5 または Phase 8      | 型定義の修正が必要                 |
| チェック 4（フォーマット）   | その場で修正                | `--write` オプションで即時解消可能 |

---

## quality-report.md の記録フォーマット

```markdown
## Phase 9: 品質保証レポート

実施日時: YYYY-MM-DD HH:MM

### チェック 1: ユニットテスト結果

コマンド: `pnpm --filter @repo/desktop test`

結果: PASS / FAIL

\`\`\`
（コマンド出力を記録）
\`\`\`

### チェック 2: Lint 結果

コマンド: `pnpm lint`

結果: PASS / FAIL

\`\`\`
（コマンド出力を記録）
\`\`\`

### チェック 3: 型チェック結果

コマンド: `pnpm typecheck`

結果: PASS / FAIL

\`\`\`
（コマンド出力を記録）
\`\`\`

### チェック 4: フォーマット結果

コマンド: `pnpm --filter @repo/desktop prettier --check ...`

結果: PASS / FAIL（適用済みの場合はその旨記録）

### 総合判定

- [ ] 全チェック PASS → Phase 10 へ進む
- [ ] 一部 FAIL → 該当フェーズへ差し戻し

差し戻し先（FAIL の場合）: Phase X
```

---

## 完了条件（フェーズゲート）

| 条件                                                        | 確認方法                                          |
| ----------------------------------------------------------- | ------------------------------------------------- |
| 全ユニットテストが PASS                                     | `pnpm --filter @repo/desktop test` の終了コード 0 |
| Lint エラーが 0 件                                          | `pnpm lint` の終了コード 0                        |
| 型チェックエラーが 0 件                                     | `pnpm typecheck` の終了コード 0                   |
| フォーマットが適用済み                                      | `prettier --check` の成功                         |
| 全結果が outputs/phase-9/quality-report.md に記録されている | ファイル確認                                      |

---

## 成果物

- **レポートファイル**: `outputs/phase-9/quality-report.md`
  - 各チェックの実行コマンドと結果
  - FAIL 発生時の差し戻し先と理由
  - 総合判定（全 PASS または差し戻し）
  - 次フェーズ（Phase 10）への引き継ぎ事項
