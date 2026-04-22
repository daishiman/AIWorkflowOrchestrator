# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 9                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 8                                             |
| 後続Phase  | Phase 10                                            |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

line budget・link・mirror parity を一括判定し、Phase 10（最終レビューゲート）に進める状態かを判断する。
型エラー・Lint エラー・テスト失敗・ミラー不一致・行数バジェット超過がゼロであることを確認する。

## 品質チェック項目

### TypeScript 型品質

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `EvalsValidationResult` 型が正しく `export` されており、外部から参照できる
- [ ] `evalsValidation` フィールドが Optional（`?`）であり、既存の呼び出し箇所で型エラーが発生しない
- [ ] `any` 型の新規使用がゼロである

### Lint 品質

- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] 未使用変数・未使用 import がゼロである
- [ ] `validateEvalsContent()` ヘルパーの exhaustive-deps 相当の警告がない

### テスト品質

- [ ] `pnpm --filter @repo/desktop test -- SkillScanner` で全テスト GREEN
- [ ] 既存3テスト（with-evals / with-all-others / with-sized-evals）が GREEN を維持している
- [ ] Phase 6 で追加した全異常系テストが GREEN である
- [ ] カバレッジが内容バリデーション追加部分で 100% である

### ミラー parity 確認

- [ ] `.claude/skills/` 配下の SkillScanner 関連仕様が更新されている
- [ ] `.agents/skills/` が `.claude/skills/` と同一内容である（parity 一致）
- [ ] parity 確認コマンド（`diff -r .claude/skills .agents/skills`）で差分がゼロである

### SkillScanner.ts 行数バジェット確認

- [ ] `SkillScanner.ts` の総行数が事前合意したバジェット（目安: 実装前行数 + 80 行以内）を超えていない
- [ ] バジェット超過の場合はリファクタリング（Phase 8）に戻って削減する

## リスク台帳

| リスク                                                                                 | 発生確率 | 影響度 | 対処状況                                                                                                            |
| -------------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| JSON.parse の同期処理による性能劣化（スキル数増加時）                                  | 中       | 中     | Phase 5 で大容量ファイルスキップ安全弁を実装済み。スキル数が 100 件超になった場合は非同期化を検討する（別タスク化） |
| `EvalsValidationResult` 型変更による呼び出し箇所の後方互換破壊                         | 低       | 高     | Optional フィールドとして追加することで既存コードへの影響をゼロにしている                                           |
| camelCase/snake_case 両許容ポリシーが先行タスクの設計と乖離                            | 中       | 中     | Phase 8 の責務境界マップで接合点を整備済み。先行タスク（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）完了時に再確認する    |
| fixture EVALS（skill-creator/complete-skill/EVALS.json）の snake_case が警告扱いになる | 低       | 低     | スコープ外（camelCase 移行は別タスク）であることを確認済み。警告は出るが失敗にはならない                            |
| .claude/.agents ミラー parity 不一致によるスキル実行エラー                             | 低       | 高     | 本 Phase でミラー同期を実施・確認する                                                                               |

## 因果ループ監査

バリデーション追加による副作用を確認する。

| 変更点                                | 考えられる副作用                                        | 影響範囲                                               | 対処済み |
| ------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | -------- |
| `evalsValidation` フィールド追加      | SkillScanner の戻り値を受け取る全コンシューマーへの影響 | Optional フィールドのため既存コードへの影響なし        | - [x]    |
| EVALS.json パース処理追加             | スキャン処理時間の増加                                  | 大容量スキップにより最悪ケースを抑制                   | - [x]    |
| `validateEvalsContent()` ヘルパー追加 | テスト対象が増加（ただし private のため直接テスト不可） | SkillScanner テストから間接的にカバー済み              | - [x]    |
| `EVALS_VALIDATION_ERRORS` 定数追加    | モジュールサイズ増加                                    | 微小（数十バイト）、問題なし                           | - [x]    |
| camelCase/snake_case 両許容ロジック   | 今後の仕様変更（片方のみ許容）時の修正コスト増加        | Phase 8 の責務境界マップで先行タスクへの委譲計画を明記 | - [x]    |

## 品質ゲートコマンド一覧

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. Lint チェック
pnpm --filter @repo/desktop lint

# 3. テスト全実行（カバレッジ付き）
pnpm --filter @repo/desktop test --coverage SkillScanner

# 4. ミラー parity 確認
diff -r .claude/skills .agents/skills

# 5. SkillScanner.ts 行数確認
wc -l apps/desktop/src/main/services/skill/SkillScanner.ts
```

## 成果物

| 成果物         | パス                                   | 説明                                     |
| -------------- | -------------------------------------- | ---------------------------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 全品質チェック項目の実行結果サマリー     |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク評価・発生確率・対処状況の最終版   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | バリデーション追加による副作用確認の記録 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過した
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過した
- [ ] 全テストが GREEN である
- [ ] カバレッジが内容バリデーション部分で 100% である
- [ ] `.claude/skills/` と `.agents/skills/` の parity が一致している
- [ ] `SkillScanner.ts` の行数がバジェット内である
- [ ] リスク台帳を更新した
- [ ] 因果ループ監査を完了した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 10: 最終レビューゲート
