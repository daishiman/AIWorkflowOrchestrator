# テスト計画書

## 概要

macOS CI ビルド修正のテスト実行計画を定義する。

---

## テスト実行環境

### ローカル環境

| 項目             | 値      |
| ---------------- | ------- |
| OS               | macOS   |
| Node.js          | v22.x   |
| pnpm             | 最新版  |
| electron-builder | v26.0.0 |

### CI環境

| 項目    | 値                                         |
| ------- | ------------------------------------------ |
| Runner  | macos-14 (Apple Silicon)                   |
| Node.js | v22                                        |
| pnpm    | 最新版                                     |
| 署名    | 無効（CSC_IDENTITY_AUTO_DISCOVERY: false） |

---

## テスト実行手順

### Phase 4: 現状確認（Red状態）

**目的**: 修正前のCIが失敗することを確認する

1. 現在の `fix/macos-build-ci` ブランチをプッシュ
2. GitHub Actions のワークフローが起動
3. `build-macos-arm64` ジョブが **失敗** することを確認
4. エラーメッセージに `hdiutil` が含まれることを確認

**確認コマンド**:

```bash
# 最新のCI実行を確認
gh run list --workflow=build-electron.yml --branch=fix/macos-build-ci --limit=1

# 実行詳細を確認
gh run view <run-id>

# ログを確認
gh run view <run-id> --log | grep -i hdiutil
```

**期待結果**: CI失敗、hdiutilエラーあり

---

### Phase 5: 実装後確認（Green状態）

**目的**: 修正後のCIが成功することを確認する

1. `electron-builder.yml` を修正
2. 変更をコミット・プッシュ
3. GitHub Actions のワークフローが起動
4. `build-macos-arm64` ジョブが **成功** することを確認
5. アーティファクトがアップロードされることを確認

**確認コマンド**:

```bash
# 変更をプッシュ
git add apps/desktop/electron-builder.yml
git commit -m "fix: remove DMG target from macOS build for CI compatibility"
git push origin fix/macos-build-ci

# CI実行を確認
gh run list --workflow=build-electron.yml --limit=1
gh run view <run-id>

# アーティファクト確認
gh run view <run-id> --json artifacts
```

**期待結果**: CI成功、アーティファクトあり

---

### Phase 11: 手動テスト

**目的**: 最終的な動作確認を行う

1. ローカルでビルドを実行
2. CI成果物をダウンロード
3. ZIPファイルの内容を確認
4. アプリが起動することを確認（可能な場合）

**確認コマンド**:

```bash
# ローカルビルド
pnpm install
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop package:mac

# 成果物確認
ls -la apps/desktop/dist/*.zip

# CI成果物ダウンロード
gh run download <run-id> --name electron-macos-arm64

# ZIPの中身確認
unzip -l *.zip | head -20
```

---

## 成功/失敗の判定基準

### 成功条件（全て必須）

| #   | 条件                                 | 検証方法             |
| --- | ------------------------------------ | -------------------- |
| 1   | CIビルドが成功                       | GitHub Actions UI    |
| 2   | hdiutilエラーが発生しない            | ログ検索             |
| 3   | ZIPファイルが生成される              | アーティファクト確認 |
| 4   | アーティファクトがアップロードされる | Summary確認          |
| 5   | ローカルビルドが成功                 | 手動実行             |

### 失敗条件

| #   | 条件                             | 対応                         |
| --- | -------------------------------- | ---------------------------- |
| 1   | hdiutilエラーが発生              | 設定を再確認                 |
| 2   | CIビルドが失敗                   | ログを分析、設計を見直し     |
| 3   | 成果物が生成されない             | target設定を確認             |
| 4   | アーティファクトアップロード失敗 | ワークフローのパス設定を確認 |

---

## テストカバレッジ目標

### ユニットテスト（該当なし）

今回の修正は設定ファイルの変更のみであり、コードレベルのユニットテストは該当しない。

### 統合テスト

| 項目                     | 目標 |
| ------------------------ | ---- |
| CI接続テスト             | 100% |
| ビルドフローテスト       | 100% |
| 成果物生成テスト         | 100% |
| アーティファクトテスト   | 100% |
| エラーハンドリングテスト | 80%+ |

### E2Eテスト

| 項目               | 目標 |
| ------------------ | ---- |
| CI実行〜成果物確認 | 100% |

---

## テストデータ

今回の修正ではテストデータは不要。
検証対象は設定ファイルとCIパイプラインの動作。

---

## テストスケジュール

| Phase | テスト内容            | 実行タイミング |
| ----- | --------------------- | -------------- |
| 4     | Red状態確認           | Phase 4完了時  |
| 5     | 実装後のGreen状態確認 | 実装後         |
| 6     | テスト拡充            | Phase 5完了後  |
| 7     | カバレッジ確認        | Phase 6完了後  |
| 11    | 手動テスト            | Phase 10完了後 |

---

## Red状態確認（TDD）

### 現状のCI状態

`hdiutil` エラーにより CI が失敗している状態を確認済み（Issue #212）。

**エラーメッセージ**:

```
hdiutil: create failed - Device not configured
```

### 確認方法

```bash
# 既存の失敗したCIログを確認
gh run list --workflow=build-electron.yml --status=failure --limit=5
```

**ステータス**: Red状態確認済み（Issue #212, #230 で報告）

---

## 完了確認

- [x] テスト実行環境を定義した
- [x] テスト実行手順を定義した
- [x] 成功/失敗の判定基準を定義した
- [x] テストカバレッジ目標が設定されている
- [x] Red状態（修正前の失敗状態）を確認した
