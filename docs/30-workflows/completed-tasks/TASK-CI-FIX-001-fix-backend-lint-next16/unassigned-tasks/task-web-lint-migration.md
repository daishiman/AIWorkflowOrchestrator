# apps/web の lint 設定移行 - タスク指示書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-CI-FIX-001-U3             |
| タスク名     | apps/web の lint 設定移行      |
| 分類         | 改善                           |
| 対象機能     | apps/web（ESLint設定）         |
| 優先度       | 低                             |
| 見積もり規模 | 小規模                         |
| ステータス   | 未実施                         |
| 発見元       | TASK-CI-FIX-001 元タスク仕様書 |
| 発見日       | 2026-01-29                     |
| issue_number | 564                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FIX-001ではapps/backendのESLint設定をNext.js 16対応に移行した。apps/webパッケージが将来追加された場合、同様のlint設定移行が必要になる。

### 1.2 問題点・課題

- apps/webが追加された場合、`next lint`を使用しているとNext.js 16でCIが失敗する
- TASK-CI-FIX-001と同じ`Invalid project directory`エラーが発生する

### 1.3 放置した場合の影響

- apps/web追加時にCI/CDパイプラインが失敗する
- 同じ調査・修正作業を再度行う必要がある

---

## 2. 何を達成するか（What）

### 2.1 目的

apps/webパッケージのESLint設定をNext.js 16対応に移行する。

### 2.2 最終ゴール

- apps/web の `pnpm lint` が `eslint . --cache` で実行される
- `eslint-config-next/core-web-vitals` がネイティブ flat config でインポートされている
- CI パイプラインでlintが成功する

### 2.3 スコープ

#### 含むもの

- apps/web/package.json の lint スクリプト変更
- apps/web/eslint.config.mjs の更新

#### 含まないもの

- apps/backend の変更（TASK-CI-FIX-001で完了済み）
- ESLintルールの変更

### 2.4 成果物

- 更新された `apps/web/package.json`
- 更新された `apps/web/eslint.config.mjs`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- apps/web パッケージが存在すること
- TASK-CI-FIX-001（apps/backend移行）が完了していること

### 3.2 依存タスク

- TASK-CI-FIX-001（完了済み）

### 3.3 必要な知識

- ESLint 9.x flat config
- `eslint-config-next` のネイティブ flat config エクスポート

### 3.4 推奨アプローチ

TASK-CI-FIX-001 の実装ガイドに従い、同じパターンを適用する:

1. `package.json` の lint スクリプトを `eslint . --cache --cache-location .next/cache/eslint/` に変更
2. `eslint.config.mjs` で `eslint-config-next/core-web-vitals` を直接インポート
3. `FlatCompat` は不要（`eslint-config-next@16+` はネイティブ flat config）

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルを使用してPhase 1-13の仕様書を生成する。

### Phase 1: 現状調査

#### 目的

apps/webのESLint設定の現状を確認し、移行対象を特定する。

#### 手順

1. `apps/web/package.json` の lint スクリプトを確認
2. `apps/web/eslint.config.mjs` の現在の設定を確認
3. `next lint` の使用有無を確認

#### 成果物

- 現状調査レポート

#### 完了条件

- 移行対象と変更箇所が特定されている

### Phase 2: ESLint設定移行

#### 目的

TASK-CI-FIX-001と同じパターンでESLint設定を移行する。

#### 手順

1. `apps/web/package.json` の lint スクリプトを `eslint . --cache --cache-location .next/cache/eslint/` に変更
2. `apps/web/eslint.config.mjs` で `eslint-config-next/core-web-vitals` をネイティブ flat config としてインポート
3. `FlatCompat` ラッパーがあれば除去

#### 成果物

- 更新された `apps/web/package.json`
- 更新された `apps/web/eslint.config.mjs`

#### 完了条件

- `pnpm --filter @repo/web lint` が成功する
- ESLintルールが正しく適用される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm --filter @repo/web lint` が成功する
- [ ] ESLintルールが正しく適用される

### 品質要件

- [ ] `pnpm --filter @repo/web build` が成功する

### ドキュメント要件

- [ ] 実装ガイドに apps/web の変更を追記

---

## 6. 検証方法

### テストケース

- `pnpm --filter @repo/web lint` の成功確認
- `pnpm --filter @repo/web build` の成功確認
- ESLintルールが正しく適用されていることの確認（意図的なルール違反で検出されるか）

### 検証手順

1. lint スクリプト変更後に `pnpm --filter @repo/web lint` を実行
2. `pnpm --filter @repo/web build` でビルドが成功することを確認
3. CI パイプラインで lint ジョブがPASSすることを確認

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                                  |
| ------------------------------------- | ------ | -------- | ----------------------------------------------------- |
| apps/webが存在しない段階で実施不可    | 低     | 高       | apps/web追加時点で本タスクを実施する                  |
| eslint-config-next のバージョン不整合 | 中     | 低       | TASK-CI-FIX-001の実装ガイドを参照し同一パターンを適用 |

---

## 8. 参照情報

### 関連ドキュメント

- TASK-CI-FIX-001 実装ガイド: `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-12/implementation-guide.md`
- システム仕様書: `.claude/skills/aiworkflow-requirements/references/technology-backend.md`

---

## 9. 備考

### 補足事項

- 現時点で apps/web は未使用のため、web パッケージが追加された時点で実施する
- TASK-CI-FIX-001の実装パターンをそのまま適用可能
