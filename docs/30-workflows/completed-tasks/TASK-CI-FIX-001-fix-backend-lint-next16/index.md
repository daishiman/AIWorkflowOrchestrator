# TASK-CI-FIX-001: Backend Lint修正（Next.js 16対応）

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-CI-FIX-001                                |
| タスク名     | Backend Lint修正（Next.js 16対応）             |
| 分類         | 修正（fix）                                    |
| 対象機能     | apps/backend lintスクリプト・ESLint設定        |
| 優先度       | 高                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | PR #562（dependabot/npm_and_yarn/next-16.1.5） |
| 発見日       | 2026-01-29                                     |
| 親タスク     | なし                                           |
| Issue番号    | 未割当                                         |
| 作成日       | 2026-01-29                                     |

---

## 1. 概要

### 1.1 目的

Next.js 16で削除された `next lint` コマンドを ESLint CLI 直接呼び出しに置き換え、CI の lint ジョブを復旧する。

### 1.2 背景

dependabot PR #562 が Next.js を 15.5.9 から 16.1.5 にバージョンアップしたが、CI の lint ステップでエラーが発生している。Next.js 16 では `next lint` サブコマンドが完全に削除されており、`next` CLI が `lint` を引数としてディレクトリパスと解釈してしまう。

### 1.3 問題点・課題

| ID  | 課題                       | 現状                                                                                               |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| C1  | `next lint` コマンド削除   | Next.js 16 で `next lint` が廃止。CLI が `lint` をディレクトリパスとして解釈しエラーになる         |
| C2  | Backend ESLint設定が不完全 | `apps/backend/eslint.config.mjs` は ignores のみで、`next lint` 経由でルールが適用される前提だった |
| C3  | CI lint ジョブが失敗       | `pnpm --filter @repo/backend lint` が `next lint` を実行し `Exit status 1` で失敗                  |

**CIエラー詳細**:

```
Run pnpm --filter @repo/backend lint

> @repo/backend@1.0.0 lint
> next lint

Invalid project directory provided, no such directory:
/home/runner/work/AIWorkflowOrchestrator/AIWorkflowOrchestrator/apps/backend/lint
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @repo/backend@1.0.0 lint: `next lint`
Exit status 1
```

---

## 2. 最終ゴール

| 達成項目               | 達成状態                                               |
| ---------------------- | ------------------------------------------------------ |
| lint スクリプト修正    | `next lint` を ESLint CLI 直接呼び出しに置き換え       |
| ESLint設定の自己完結化 | `eslint.config.mjs` が単体で動作するルール定義を持つ   |
| CI lint ジョブの復旧   | `pnpm --filter @repo/backend lint` が成功する          |
| 既存リントルールの維持 | Next.js 推奨ルール（eslint-config-next）を引き続き適用 |

---

## 3. スコープ

### 3.1 含むもの

- `apps/backend/package.json` の `lint` スクリプト変更
- `apps/backend/eslint.config.mjs` の更新（eslint-config-next ルール統合）
- CI lint ジョブの動作確認
- 依存パッケージの確認・調整

### 3.2 含まないもの

- Next.js 16 のその他の破壊的変更への対応（async Request API、Turbopack デフォルト化等）
- `apps/web/` パッケージの ESLint 設定変更（存在しない場合）
- ルートレベルの `eslint.config.js` の変更
- ESLint ルールの追加・変更（既存ルールの移行のみ）
- Next.js 16 マイグレーション全般

---

## 4. 成果物一覧

| 成果物                     | パス                             |
| -------------------------- | -------------------------------- |
| 更新済み package.json      | `apps/backend/package.json`      |
| 更新済み eslint.config.mjs | `apps/backend/eslint.config.mjs` |

---

## 5. Phase構成

| Phase | 名称               | 概要                                 |
| ----- | ------------------ | ------------------------------------ |
| 1     | 要件定義           | lint修正の要件・受け入れ基準定義     |
| 2     | 設計               | ESLint設定・スクリプト変更方針設計   |
| 3     | 設計レビューゲート | 設計妥当性・互換性検証               |
| 4     | テスト作成         | lint動作確認テストケース定義         |
| 5     | 実装               | package.json・eslint.config.mjs更新  |
| 6     | テスト拡充         | 追加検証（全ファイルlint、CI整合性） |
| 7     | カバレッジ確認     | 既存テストカバレッジへの影響なし確認 |
| 8     | リファクタリング   | 不要コメント・設定の整理             |
| 9     | 品質保証           | 品質ゲート全項目クリア確認           |
| 10    | 最終レビューゲート | 全体整合性・品質最終確認             |
| 11    | 手動テスト         | ローカル・CI環境でのlint動作確認     |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新               |
| 13    | PR作成             | PR作成・CI確認                       |

---

## 6. 依存関係

### 6.1 前提条件

- Next.js 16.1.5 のリリースノート・マイグレーションガイドを確認済みであること
- `eslint-config-next` パッケージが ESLint flat config に対応していること
- ルートの `eslint.config.js` が引き続き機能すること

### 6.2 依存タスク

| タスクID | タスク名                       | ステータス |
| -------- | ------------------------------ | ---------- |
| なし     | （独立タスク、前提タスクなし） | -          |

---

## 7. 技術要件

### 7.1 必要な知識

| 技術領域 | 必要な知識                                            |
| -------- | ----------------------------------------------------- |
| ESLint   | ESLint 9.x flat config 形式、eslint-config-next       |
| Next.js  | Next.js 15→16 の破壊的変更（`next lint` 削除）        |
| pnpm     | monorepo でのパッケージフィルタリング・スクリプト実行 |
| CI/CD    | GitHub Actions ワークフロー                           |

### 7.2 推奨アプローチ

1. **lint スクリプト変更**
   - `"lint": "next lint"` → `"lint": "eslint ."` に変更
   - キャッシュオプション追加: `--cache --cache-location .next/cache/eslint/`

2. **ESLint設定の自己完結化**
   - `eslint-config-next` を flat config 形式でインポート
   - `@eslint/eslintrc` の `FlatCompat` を使用して legacy config を変換
   - 既存の ignores 設定を維持

3. **依存パッケージ確認**
   - `eslint-config-next@^16.0.7` が既にインストール済み
   - 追加パッケージが必要か確認

---

## 8. 完了条件チェックリスト

### 8.1 機能要件

- [ ] C1: `pnpm --filter @repo/backend lint` が正常終了する
- [ ] C2: `apps/backend/eslint.config.mjs` が自己完結した設定を持つ
- [ ] C3: `eslint-config-next` のルールが適用されている
- [ ] C4: ルートの `pnpm lint`（`eslint .`）が引き続き動作する

### 8.2 品質要件

- [ ] CI lint ジョブが成功する
- [ ] TypeScript型エラーなし
- [ ] 既存テストが全てPASS

### 8.3 互換性要件

- [ ] ルートの `eslint.config.js` との競合なし
- [ ] `pnpm lint`（ルート）と `pnpm --filter @repo/backend lint` の両方が動作する
- [ ] lint-staged（pre-commit hook）が正常動作する

### 8.4 ドキュメント要件

- [ ] ESLint設定変更の経緯がドキュメント化されている
- [ ] 実装ガイド（Part 1/Part 2）が作成されている

---

## 9. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                 |
| -------------------------------------- | ------ | -------- | ------------------------------------ |
| eslint-config-next flat config非対応   | 高     | 低       | FlatCompat でレガシー設定変換        |
| ルート ESLint 設定との競合             | 中     | 中       | 設定の優先順位を検証、スコープを限定 |
| lint ルール差異（next lint vs eslint） | 低     | 中       | 既存ファイルで lint 結果を比較       |

---

## 10. 参照情報

### 10.1 関連ドキュメント

| ドキュメント         | パス                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| CI ワークフロー      | `.github/workflows/ci.yml`                                                 |
| ルートESLint設定     | `eslint.config.js`                                                         |
| Backend ESLint設定   | `apps/backend/eslint.config.mjs`                                           |
| Backend package.json | `apps/backend/package.json`                                                |
| CI/CDインフラ仕様    | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`        |
| コード品質仕様       | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md` |

### 10.2 参考資料

| 資料名                       | URL/パス                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| Next.js 16 Upgrade Guide     | https://nextjs.org/docs/app/guides/upgrading/version-16      |
| Next.js 16 Blog Post         | https://nextjs.org/blog/next-16                              |
| ESLint Flat Config Migration | https://eslint.org/docs/latest/use/configure/migration-guide |
| eslint-config-next           | https://www.npmjs.com/package/eslint-config-next             |
| PR #562（dependabot）        | https://github.com/daishiman/AIWorkflowOrchestrator/pull/562 |

---

## 11. 備考

### 11.1 発見元

```
PR #562: dependabot/npm_and_yarn/next-16.1.5
CI Error: pnpm --filter @repo/backend lint → next lint → Exit status 1
"Invalid project directory provided, no such directory: .../apps/backend/lint"
```

### 11.2 補足事項

- Next.js 16 の `next lint` 削除は Next.js 15.5 で非推奨化され、16 で完全削除された
- 公式コードモッド `npx @next/codemod@canary next-lint-to-eslint-cli .` が利用可能
- このタスクは lint 修正のみに焦点を当て、Next.js 16 のその他の破壊的変更は別タスクとする
- `apps/backend` は現在最小構成（health check エンドポイントのみ）のため影響範囲は限定的
