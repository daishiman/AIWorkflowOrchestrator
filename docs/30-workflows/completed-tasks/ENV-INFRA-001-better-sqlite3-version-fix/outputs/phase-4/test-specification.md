# Phase 4: テスト仕様書

## 概要

本タスクはインフラ・環境問題のため、主にシェルスクリプトテストと手動検証シナリオを定義する。

---

## 1. better-sqlite3動作確認テスト

| No  | テスト項目               | 検証内容                                                            | 期待結果        | 種別 |
| --- | ------------------------ | ------------------------------------------------------------------- | --------------- | ---- |
| 1.1 | better-sqlite3再ビルド   | `bash scripts/setup-native-modules.sh` 実行                         | エラーなく完了  | 自動 |
| 1.2 | Workflowリポジトリテスト | `pnpm --filter @repo/shared test workflow-repository.test.ts --run` | 10/10テスト成功 | 自動 |
| 1.3 | Pre-pushフック           | テスト実行フロー                                                    | テスト成功      | 手動 |

---

## 2. バージョンチェックテスト

| No  | テスト項目         | 前提条件               | 操作                                   | 期待結果                              | 種別 |
| --- | ------------------ | ---------------------- | -------------------------------------- | ------------------------------------- | ---- |
| 2.1 | バージョン一致     | .nvmrcと同じバージョン | `bash scripts/setup-native-modules.sh` | 「✅ バイナリは正常に動作します」表示 | 自動 |
| 2.2 | アーキテクチャ検出 | arm64マシン            | スクリプト実行                         | 「現在のアーキテクチャ: arm64」表示   | 自動 |
| 2.3 | 互換性テスト       | 再ビルド後             | require('better-sqlite3')              | エラーなし                            | 自動 |

---

## 3. package.json enginesテスト

| No  | テスト項目         | 検証内容                  | 期待結果                             | 種別 |
| --- | ------------------ | ------------------------- | ------------------------------------ | ---- |
| 3.1 | バージョン制約確認 | package.json engines.node | ">=22.21.1 <23.0.0" が設定されている | 手動 |
| 3.2 | pnpm制約確認       | package.json engines.pnpm | ">=10.0.0" が設定されている          | 手動 |

---

## 4. CI/CD環境テスト

| No  | テスト項目         | 検証内容                 | 期待結果                      | 種別 |
| --- | ------------------ | ------------------------ | ----------------------------- | ---- |
| 4.1 | GitHub Actions設定 | .github/workflows/ci.yml | node-version: "22" が設定済み | 手動 |
| 4.2 | pnpmセットアップ   | ci.yml                   | pnpm/action-setup@v4 使用     | 手動 |

---

## テスト実行コマンド

### 自動テスト

```bash
# 1. ネイティブモジュールセットアップ
bash scripts/setup-native-modules.sh

# 2. better-sqlite3テスト
pnpm --filter @repo/shared test workflow-repository.test.ts --run
```

### 検証コマンド

```bash
# アーキテクチャ確認
node -p "process.arch"

# Node.jsバージョン確認
node -v

# better-sqlite3互換性テスト
node -e "try { require('better-sqlite3'); console.log('OK'); } catch(e) { console.log(e.message); }"

# package.json engines確認
cat package.json | grep -A 4 '"engines"'
```

---

## 成功基準

| カテゴリ                | 基準                  |
| ----------------------- | --------------------- |
| better-sqlite3テスト    | 10/10成功             |
| setup-native-modules.sh | 正常終了（exit 0）    |
| 互換性テスト            | "OK" 出力             |
| engines設定             | node/pnpm両方設定済み |
