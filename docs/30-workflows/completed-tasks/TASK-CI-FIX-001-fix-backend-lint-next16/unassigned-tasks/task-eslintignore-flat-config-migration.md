# .eslintignore → eslint.config.js ignores 移行 - タスク指示書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-CI-FIX-001-U4                            |
| タスク名     | .eslintignore → eslint.config.js ignores 移行 |
| 分類         | リファクタリング                              |
| 対象機能     | ルートESLint設定                              |
| 優先度       | 低                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | Phase 11 手動テスト                           |
| 発見日       | 2026-01-29                                    |
| issue_number | 565                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 11の手動テストでルートの`.eslintignore`ファイルが残存していることが確認された。ESLint 9.xではflat config (`eslint.config.js`) の`ignores`プロパティを使用することが推奨されており、`.eslintignore`は非推奨となっている。

### 1.2 問題点・課題

- ESLint 9.x 実行時に`.eslintignore`に関する非推奨警告が表示される
- flat configとignoreファイルの二重管理が発生している

### 1.3 放置した場合の影響

- 将来のESLintバージョンで`.eslintignore`サポートが完全に削除される可能性
- CI出力に不要な警告が表示され続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

ルートの`.eslintignore`の内容を`eslint.config.js`（または`eslint.config.mjs`）の`ignores`プロパティに移行し、`.eslintignore`ファイルを削除する。

### 2.2 最終ゴール

- `.eslintignore`ファイルが削除されている
- ルートの`eslint.config.js`に全ignoreパターンが含まれている
- ESLint実行時に非推奨警告が表示されない

### 2.3 スコープ

#### 含むもの

- ルートの`.eslintignore` → `eslint.config.js` ignores 移行
- `.eslintignore`ファイルの削除

#### 含まないもの

- パッケージ個別のESLint設定変更
- ESLintルールの変更

### 2.4 成果物

- 更新された `eslint.config.js`（ルート）
- 削除された `.eslintignore`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現在の`.eslintignore`の内容を確認済みであること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- ESLint 9.x flat config の ignores 仕様

### 3.4 推奨アプローチ

1. `.eslintignore` の内容を確認
2. `eslint.config.js` に `ignores` プロパティとして移行
3. `.eslintignore` を削除
4. `pnpm lint` が全パッケージで成功することを確認

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルを使用してPhase 1-13の仕様書を生成する。

### Phase 1: 現状調査

#### 目的

ルートの `.eslintignore` の内容と、`eslint.config.js` の現在の ignores 設定を確認する。

#### 手順

1. `.eslintignore` の内容を確認し、全ignoreパターンを一覧化
2. ルートの `eslint.config.js` の現在の ignores 設定を確認
3. 重複するパターンと未移行パターンを特定

#### 成果物

- ignoreパターン移行一覧（移行元・移行先の対照表）

#### 完了条件

- 全ignoreパターンが特定されている

### Phase 2: ignoresプロパティへの移行

#### 目的

`.eslintignore` の全パターンを `eslint.config.js` の `ignores` プロパティに移行する。

#### 手順

1. `.eslintignore` の各パターンを `eslint.config.js` の `ignores` 配列に追加
2. `.eslintignore` ファイルを削除
3. `pnpm lint` を実行して全パッケージでlintが成功することを確認

#### 成果物

- 更新された `eslint.config.js`
- 削除された `.eslintignore`

#### 完了条件

- `.eslintignore` が削除されている
- `pnpm lint` が全パッケージで成功する
- ESLint実行時に非推奨警告が表示されない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.eslintignore` が削除されている
- [ ] `eslint.config.js` に ignores パターンが移行されている
- [ ] ESLint実行時に非推奨警告が表示されない

### 品質要件

- [ ] `pnpm lint` が全パッケージで成功する

---

## 6. 検証方法

### テストケース

- `pnpm lint` が全パッケージで成功する
- ESLint実行時に `.eslintignore` 関連の非推奨警告が表示されない
- `.eslintignore` ファイルが存在しないことの確認

### 検証手順

1. `.eslintignore` 削除後に `pnpm lint` を実行
2. ESLint出力に非推奨警告がないことを確認
3. `ls -la .eslintignore` でファイルが存在しないことを確認

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                                |
| ------------------------------------- | ------ | -------- | --------------------------------------------------- |
| ignoreパターンの漏れによるlintエラー  | 中     | 低       | 移行前後で `pnpm lint` の出力を比較                 |
| パッケージ個別のeslint.configとの競合 | 低     | 低       | ルートのglobal ignoresとパッケージ個別ignoresを分離 |

---

## 8. 参照情報

### 関連ドキュメント

- ESLint Flat Config Migration: https://eslint.org/docs/latest/use/configure/migration-guide
- システム仕様書: `.claude/skills/aiworkflow-requirements/references/technology-devops.md`

---

## 9. 備考

### 補足事項

- 本タスクはTASK-CI-FIX-001の変更によって新たに発生したものではなく、既存の技術的負債
- Phase 11手動テストで発見された非推奨警告がきっかけ
