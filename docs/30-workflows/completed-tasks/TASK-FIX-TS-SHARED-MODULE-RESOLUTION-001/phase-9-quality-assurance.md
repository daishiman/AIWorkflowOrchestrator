# Phase 9: 品質保証 - TypeScript @repo/shared モジュール解決エラー修正

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 9                                        |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase名    | 品質保証                                 |
| 前提Phase  | Phase 8 (リファクタリング)               |
| 次Phase    | Phase 10 (最終レビュー)                  |
| 作成日     | 2026-02-20                               |
| ステータス | 未着手                                   |

---

## 目的

Lint・型チェック・全テスト実行・セキュリティチェックの観点から実装の品質を総合的に検証する。本タスクの最重要ゴールである「`pnpm typecheck` で `@repo/shared` 関連のモジュール解決エラーが 228件 → 0件」を最終確認する。

---

## 実行タスク

- 型チェック（typecheck）: @repo/shared 関連エラー 228件→0件の確認
- ESLint 実行: コード品質・スタイル準拠の確認
- 全テスト実行: 全パッケージのテストが PASS することを確認
- @repo/shared ビルド確認: パッケージビルドが成功することを確認
- セキュリティチェック: 設定ファイル変更によるセキュリティ影響の確認

| #   | タスク名                | 目的                                         |
| --- | ----------------------- | -------------------------------------------- |
| 1   | 型チェック（typecheck） | @repo/shared 関連エラー 228件→0件の確認      |
| 2   | ESLint 実行             | コード品質・スタイル準拠の確認               |
| 3   | 全テスト実行            | 全パッケージのテストが PASS することを確認   |
| 4   | @repo/shared ビルド確認 | パッケージビルドが成功することを確認         |
| 5   | セキュリティチェック    | 設定ファイル変更によるセキュリティ影響の確認 |

---

## 参照資料

| 参照資料              | パス                                                                                | 確認内容             |
| --------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| Phase 5 実装          | `phase-5-implementation.md`                                                         | 実装仕様との整合確認 |
| Phase 8 成果物        | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-8-refactoring.md` | リファクタリング結果 |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`         | 品質基準             |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`          | セキュリティ原則     |
| DevOps/テスト実行基盤 | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`            | 実行コマンド標準化   |
| コード品質ルール      | `.claude/rules/02-code-quality.md`                                                  | 品質基準テーブル     |

---

## 実行手順

### 1. 型チェック（typecheck） — 最重要検証項目

```bash
# プロジェクト全体の型チェック
pnpm typecheck

# @repo/shared 関連エラーのみ抽出して件数確認
pnpm typecheck 2>&1 | grep -c "@repo/shared" || echo "0件"

# 個別パッケージの型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

#### 型チェック結果

| チェック項目                                   | 判定 | 備考 |
| ---------------------------------------------- | ---- | ---- |
| `@repo/shared` 関連エラーが 0件                | -    |      |
| `pnpm typecheck` がプロジェクト全体で成功      | -    |      |
| `pnpm --filter @repo/shared typecheck` が成功  | -    |      |
| `pnpm --filter @repo/desktop typecheck` が成功 | -    |      |
| any 型の新規使用なし                           | -    |      |
| strict mode での動作確認                       | -    |      |

### 2. ESLint 実行

```bash
# プロジェクト全体の Lint
pnpm lint

# 個別パッケージの Lint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

#### ESLint 結果

| チェック項目          | 判定 | 備考 |
| --------------------- | ---- | ---- |
| エラー 0件            | -    |      |
| 警告 0件              | -    |      |
| import 順序ルール準拠 | -    |      |
| 未使用 import なし    | -    |      |

### 3. 全テスト実行

```bash
# @repo/shared パッケージのテスト
cd packages/shared && pnpm vitest run

# apps/desktop パッケージのテスト（P40 準拠: パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run

# apps/web パッケージのテスト（影響がある場合）
cd apps/web && pnpm vitest run 2>/dev/null || echo "web テスト未設定"
```

#### テスト結果

| パッケージ      | テスト数 | PASS | FAIL | 判定 |
| --------------- | -------- | ---- | ---- | ---- |
| `@repo/shared`  | -        | -    | -    | -    |
| `@repo/desktop` | -        | -    | -    | -    |
| `@repo/web`     | -        | -    | -    | -    |

### 4. @repo/shared ビルド確認

```bash
# ビルド実行
pnpm --filter @repo/shared build

# ビルド成果物の存在確認
ls -la packages/shared/dist/
```

#### ビルド結果

| チェック項目                                   | 判定 | 備考 |
| ---------------------------------------------- | ---- | ---- |
| `pnpm --filter @repo/shared build` 成功        | -    |      |
| `dist/` ディレクトリに成果物が存在             | -    |      |
| exports で指定したパスに対応するファイルが存在 | -    |      |

### 5. セキュリティチェック

設定ファイル変更（`tsconfig.json`, `package.json`, `vitest.config.ts`）によるセキュリティ影響を確認する。

| チェック項目                                                   | 判定 | 備考 |
| -------------------------------------------------------------- | ---- | ---- |
| `tsconfig.json` の `paths` 変更がセキュリティ影響なし          | -    |      |
| `package.json` の `exports` 変更で意図しないモジュール露出なし | -    |      |
| `vitest.config.ts` の alias 変更がテスト環境外に影響なし       | -    |      |
| 新規依存パッケージの追加なし                                   | -    |      |
| `contextIsolation` / `nodeIntegration` 設定に変更なし          | -    |      |

```bash
# 依存関係セキュリティ監査
pnpm audit

# 設定変更の diff 確認（セキュリティ関連設定の変更有無）
git diff main -- apps/desktop/src/main/ | grep -E "contextIsolation|nodeIntegration|sandbox"
```

---

## 統合テスト連携

| 連携観点           | 内容                                       | 参照先                                                                      |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------- |
| 全体品質ゲート     | build/typecheck/lint/test を同一ランで確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| 実行環境差異の排除 | コマンド実行ディレクトリ・フィルタを統一   | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    |

---

## 品質ゲートチェックリスト

| #   | チェック項目                                            | コマンド                                        | 判定 |
| --- | ------------------------------------------------------- | ----------------------------------------------- | ---- |
| 1   | `pnpm typecheck` で `@repo/shared` 関連エラー 0件       | `pnpm typecheck 2>&1 \| grep -c "@repo/shared"` | -    |
| 2   | `pnpm lint` がエラー・警告 0件                          | `pnpm lint`                                     | -    |
| 3   | `pnpm --filter @repo/desktop exec vitest run` が全 PASS | `cd apps/desktop && pnpm vitest run`            | -    |
| 4   | `pnpm --filter @repo/shared build` が成功               | `pnpm --filter @repo/shared build`              | -    |
| 5   | セキュリティ影響なし                                    | 上記セキュリティチェックリスト参照              | -    |

---

## 指摘事項

### 発見された問題

| ID   | 重要度 | 観点 | 問題内容 | 対応状況 |
| ---- | ------ | ---- | -------- | -------- |
| Q-01 | -      | -    | -        | -        |

### 重要度定義

| 重要度   | 定義                             | 対応              |
| -------- | -------------------------------- | ----------------- |
| CRITICAL | セキュリティ・動作不能の重大問題 | 即時修正必須      |
| MAJOR    | 品質基準未達                     | Phase 8へ戻り修正 |
| MINOR    | 改善推奨事項                     | Phase 12で対応可  |

---

## 修正実施

### 修正ログ

| 問題ID | 修正内容 | 修正日 | 確認者 |
| ------ | -------- | ------ | ------ |
| -      | -        | -      | -      |

---

## 成果物

| 成果物             | 配置先                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 品質レポート       | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-9/quality-report.md`   |
| typecheck 実行結果 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-9/typecheck-result.md` |

---

## 完了条件

- [ ] `pnpm typecheck` で `@repo/shared` 関連エラーが 228件 → 0件を達成
- [ ] `pnpm typecheck` がプロジェクト全体で成功
- [ ] `pnpm lint` がエラー・警告 0件
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全テスト PASS
- [ ] `pnpm --filter @repo/shared build` が成功
- [ ] セキュリティチェック項目が全て合格（設定変更による影響なし）
- [ ] CRITICAL/MAJOR 問題が解決済み
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 10（最終レビュー）へ進み、全体品質・整合性を検証する。
