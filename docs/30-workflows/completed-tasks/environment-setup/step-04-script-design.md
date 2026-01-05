# 自動化スクリプト設計書

## 1. 設計概要

### 1.1 目的

開発者がコマンド1つで環境構築を完了できる自動化スクリプトを設計する。冪等性、エラーハンドリング、進捗表示を備えた堅牢なスクリプトを実現する。

### 1.2 設計方針

- **冪等性**: 同じ状態から何度実行しても同じ結果
- **非破壊的**: 既存の環境を壊さない
- **透明性**: すべての操作をログに記録
- **ユーザーフレンドリー**: 分かりやすい進捗表示とエラーメッセージ
- **テスタビリティ**: 各関数が独立してテスト可能

---

## 2. スクリプト構成

### 2.1 ファイル構成

```
scripts/
├── setup-dev-environment.sh         # メインスクリプト（Mac用）
├── setup-dev-environment.ps1        # メインスクリプト（Windows用、将来）
├── verify-dependencies.mjs          # 依存関係検証スクリプト
├── lib/
│   ├── colors.sh                    # 色付き出力関数
│   ├── logger.sh                    # ログ出力関数
│   ├── validators.sh                # バリデーション関数
│   └── installers.sh                # インストール関数
└── __tests__/
    ├── verify-dependencies.test.mjs # 検証スクリプトのテスト
    └── setup.test.sh                # セットアップスクリプトのテスト
```

### 2.2 スクリプト責務分離

| スクリプト               | 責務                             | 言語    |
| ------------------------ | -------------------------------- | ------- |
| setup-dev-environment.sh | メイン処理、フロー制御           | Bash    |
| verify-dependencies.mjs  | 依存関係検証、バージョンチェック | Node.js |
| lib/colors.sh            | 色付き出力、視覚的フィードバック | Bash    |
| lib/logger.sh            | ログ記録、ファイル出力           | Bash    |
| lib/validators.sh        | バージョン検証、存在確認         | Bash    |
| lib/installers.sh        | 各ツールのインストールロジック   | Bash    |

---

## 3. 関数設計

### 3.1 ユーティリティ関数（lib/colors.sh）

**関数一覧**:

- `print_header()`: ヘッダー表示
- `print_success()`: 成功メッセージ（緑色）
- `print_error()`: エラーメッセージ（赤色）
- `print_warning()`: 警告メッセージ（黄色）
- `print_info()`: 情報メッセージ（青色）
- `print_progress()`: 進捗表示

**設計原則**:

- ANSI カラーコードを使用
- カラー無効化オプション（`--no-color`）対応
- パイプ出力時は自動的に色を無効化

### 3.2 ログ関数（lib/logger.sh）

**関数一覧**:

- `log_info()`: 情報ログ
- `log_warn()`: 警告ログ
- `log_error()`: エラーログ
- `log_debug()`: デバッグログ
- `init_log_file()`: ログファイル初期化

**ログフォーマット**:

```
[2025-12-03 10:30:15] [INFO] Node.js v22.12.0 がインストールされています
[2025-12-03 10:30:16] [WARN] pnpm が見つかりません。インストールを実行します。
[2025-12-03 10:30:20] [ERROR] Xcode Command Line Tools のインストールに失敗しました
```

**ログファイル**:

- パス: `logs/setup-YYYYMMDD-HHmmss.log`
- ローテーション: なし（手動削除）
- サイズ制限: なし

### 3.3 バリデーション関数（lib/validators.sh）

**関数一覧**:

- `validate_platform()`: プラットフォーム検証
- `validate_disk_space()`: ディスク容量検証
- `validate_network()`: ネットワーク接続検証
- `validate_version()`: バージョン番号検証
- `check_command_exists()`: コマンド存在確認
- `check_version_match()`: バージョン一致確認

**バリデーションロジック**:

```
validate_version(command, expected_major, expected_minor):
  1. コマンド実行してバージョン取得
  2. 正規表現でバージョン番号抽出
  3. メジャーバージョン比較
  4. マイナーバージョン比較（オプション）
  5. 結果を返す（true/false）
```

### 3.4 インストーラー関数（lib/installers.sh）

**関数一覧**:

- `install_homebrew()`: Homebrewインストール
- `install_nodejs()`: Node.jsインストール
- `enable_pnpm()`: pnpm有効化
- `install_xcode_clt()`: Xcode CLTインストール
- `install_project_deps()`: プロジェクト依存関係インストール
- `rebuild_native_modules()`: ネイティブモジュール再ビルド

**設計原則**:

- 各関数は独立して実行可能
- 既にインストール済みの場合はスキップ
- エラー時は詳細なメッセージを返す
- ロールバック用のアンインストール関数も提供

---

## 4. メインスクリプトフロー

### 4.1 初期化フェーズ

```bash
#!/bin/bash
set -e  # エラー時に即座に終了

# ライブラリ読み込み
source "$(dirname "$0")/lib/colors.sh"
source "$(dirname "$0")/lib/logger.sh"
source "$(dirname "$0")/lib/validators.sh"
source "$(dirname "$0")/lib/installers.sh"

# ログファイル初期化
init_log_file

# ヘッダー表示
print_header "Electronデスクトップアプリ環境構築"
```

### 4.2 事前チェックフェーズ

```bash
# プラットフォーム検証
validate_platform || exit 1

# ディスク容量検証
validate_disk_space 10 || exit 1  # 10GB必須

# ネットワーク接続確認
validate_network || exit 1
```

### 4.3 インストールフェーズ

```bash
TOTAL_STEPS=8
CURRENT_STEP=0

# Step 1: Homebrew
((CURRENT_STEP++))
print_progress "$CURRENT_STEP" "$TOTAL_STEPS" "Homebrewインストール"
if ! check_command_exists "brew"; then
  install_homebrew || handle_error "E001"
fi

# Step 2: Node.js
((CURRENT_STEP++))
print_progress "$CURRENT_STEP" "$TOTAL_STEPS" "Node.jsインストール"
if ! check_version_match "node" "22" || ! check_version_match "node" "24"; then
  install_nodejs || handle_error "E002"
fi

# ... 以降のステップ
```

### 4.4 検証フェーズ

```bash
# 最終検証
print_info "環境構築の検証を実行しています..."
node scripts/verify-dependencies.mjs || handle_error "E999"

# 成功メッセージ
print_success "環境構築が完了しました！"
print_info "次のコマンドで開発を開始できます: pnpm dev"
```

---

## 5. エラーハンドリング設計

### 5.1 エラーハンドラー関数

```bash
handle_error() {
  local error_code=$1
  local error_message=$(get_error_message "$error_code")

  print_error "エラー: $error_code"
  print_error "$error_message"

  log_error "Error $error_code: $error_message"

  # ロールバック確認
  read -p "ロールバックしますか? (y/n): " choice
  if [[ "$choice" == "y" ]]; then
    rollback
  fi

  exit 1
}
```

### 5.2 エラーメッセージマッピング

```bash
get_error_message() {
  local code=$1
  case $code in
    E001) echo "Homebrewのインストールに失敗しました。..." ;;
    E002) echo "Node.jsのインストールに失敗しました。..." ;;
    E003) echo "pnpmの有効化に失敗しました。..." ;;
    # ... その他のエラーコード
  esac
}
```

---

## 6. 進捗表示設計

### 6.1 プログレスバー

```
[2/8] ⏳ Node.jsインストール中...
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
      ダウンロード完了 (45.2MB/45.2MB)
```

### 6.2 ステップ表示

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/8] ✅ プラットフォーム検出: macOS
[2/8] ✅ Homebrew: インストール済み
[3/8] ⏳ Node.js: インストール中...
[4/8] ⏸️  pnpm: 待機中
[5/8] ⏸️  Xcode CLT: 待機中
[6/8] ⏸️  依存関係: 待機中
[7/8] ⏸️  ネイティブモジュール: 待機中
[8/8] ⏸️  開発サーバー: 待機中
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 7. 状態管理設計

### 7.1 状態ファイル

**ファイルパス**: `.setup-state.json`

**構造**:

- platform: 検出されたプラットフォーム
- steps: 各ステップの状態
- timestamp: 最終更新時刻
- version: スクリプトバージョン

**操作**:

- 読み込み: `read_state()`
- 書き込み: `write_state(step, status)`
- リセット: `reset_state()`

### 7.2 状態の保存と復元

```bash
write_state() {
  local step=$1
  local status=$2

  # JSONファイルを更新
  jq ".steps.$step = \"$status\"" .setup-state.json > tmp.json
  mv tmp.json .setup-state.json
}

read_state() {
  local step=$1

  # 状態を読み込み
  jq -r ".steps.$step" .setup-state.json
}
```

---

## 8. リトライロジック設計

### 8.1 リトライ関数

```bash
retry_command() {
  local max_attempts=3
  local delay=1
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if "$@"; then
      return 0
    fi

    print_warning "試行 $attempt/$max_attempts 失敗。${delay}秒後にリトライします..."
    sleep $delay
    delay=$((delay * 2))  # 指数バックオフ
    ((attempt++))
  done

  return 1
}
```

### 8.2 リトライ対象

- ネットワークダウンロード（brew install、pnpm install）
- 一時的なリソース競合
- ロックファイル待機

**リトライ不可**:

- バージョン不一致（明示的なエラー）
- 権限エラー（ユーザー介入が必要）
- ディスク容量不足（環境の問題）

---

## 9. ロールバック機能設計

### 9.1 ロールバック関数

```bash
rollback() {
  print_info "ロールバックを実行しています..."

  # 状態ファイルから実行済みステップを読み取り
  local completed_steps=$(jq -r '.steps | to_entries | map(select(.value == "completed")) | .[].key' .setup-state.json)

  # 逆順でアンインストール
  for step in $(echo "$completed_steps" | tac); do
    case $step in
      nodejs) brew uninstall node@22 ;;
      pnpm) corepack disable ;;
      pnpm-install) rm -rf node_modules ;;
      # ... その他のステップ
    esac
  done

  # 状態ファイルリセット
  reset_state

  print_success "ロールバックが完了しました"
}
```

### 9.2 部分ロールバック

- ユーザーに確認を求める
- ステップ単位でロールバックを選択可能
- 既存環境を保護（既にインストール済みのツールは保持）

---

## 10. 並列処理設計

### 10.1 並列化の可能性

**並列化不可**（依存関係のため）:

- すべてのインストールステップは順次実行が必須

**並列化可能**（将来的な最適化）:

- 検証スクリプトの複数項目チェック
- ドキュメントの並列ダウンロード

### 10.2 バックグラウンド処理

**対象**:

- Homebrewのバックグラウンド更新（`brew update`）
- ログファイルの非同期書き込み

**非対象**:

- インストール処理（フォアグラウンドで進捗表示が必要）

---

## 11. 検証スクリプト設計（verify-dependencies.mjs）

### 11.1 検証項目

```javascript
const verifications = [
  { name: "Node.js", command: "node", version: /^v(22|24)\./, required: true },
  { name: "pnpm", command: "pnpm", version: /^10\./, required: true },
  { name: "Electron", package: "electron", version: /^39\./, required: true },
  {
    name: "TypeScript",
    package: "typescript",
    version: /^5\./,
    required: true,
  },
  {
    name: "better-sqlite3",
    package: "better-sqlite3",
    loadTest: true,
    required: true,
  },
  { name: "Vitest", package: "vitest", version: /^2\./, required: true },
  { name: "React", package: "react", version: /^18\./, required: true },
  {
    name: "Drizzle",
    package: "drizzle-orm",
    version: /^0\.39\./,
    required: true,
  },
];
```

### 11.2 検証ロジック

```javascript
async function verifyDependency(dep) {
  // コマンドバージョン確認
  if (dep.command) {
    const version = await getCommandVersion(dep.command);
    return dep.version.test(version);
  }

  // パッケージバージョン確認
  if (dep.package) {
    const version = await getPackageVersion(dep.package);
    return dep.version.test(version);
  }

  // ロードテスト
  if (dep.loadTest) {
    try {
      require(dep.package);
      return true;
    } catch (e) {
      return false;
    }
  }
}
```

### 11.3 出力フォーマット

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
依存関係検証結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Node.js: v22.12.0 (OK)
✅ pnpm: 10.24.0 (OK)
✅ Electron: 39.2.4 (OK)
✅ TypeScript: 5.7.0 (OK)
✅ better-sqlite3: 動作確認 OK
✅ Vitest: 2.1.8 (OK)
✅ React: 18.3.1 (OK)
✅ Drizzle: 0.39.2 (OK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
検証結果: 成功 (8/8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 12. 設定可能なオプション

### 12.1 コマンドラインオプション

| オプション      | 説明                         | デフォルト |
| --------------- | ---------------------------- | ---------- |
| `--no-color`    | 色付き出力を無効化           | false      |
| `--verbose`     | 詳細ログを表示               | false      |
| `--skip-verify` | 最終検証をスキップ           | false      |
| `--force`       | 既存ツールを再インストール   | false      |
| `--dry-run`     | 実際のインストールを行わない | false      |

### 12.2 環境変数

| 変数名                | 説明                 | デフォルト |
| --------------------- | -------------------- | ---------- |
| `SETUP_LOG_DIR`       | ログ出力ディレクトリ | `./logs`   |
| `SETUP_SKIP_HOMEBREW` | Homebrewをスキップ   | false      |
| `SETUP_NODE_VERSION`  | Node.jsバージョン    | 22         |

---

## 13. テスト設計

### 13.1 ユニットテスト（lib関数）

**テスト対象**:

- `validate_version()`: バージョン検証ロジック
- `check_command_exists()`: コマンド存在確認
- `get_error_message()`: エラーメッセージ取得

**テストフレームワーク**: Bash Automated Testing System (BATS)または手動テスト

### 13.2 統合テスト

**テストシナリオ**:

1. 全ツール未インストール状態からのフルインストール
2. 一部ツールがインストール済みの状態でのスキップ
3. バージョン不一致の検出とアップグレード
4. エラー発生時のロールバック

**テスト環境**:

- Docker コンテナ（クリーンな環境）
- CI/CD（GitHub Actions）

---

## 14. パフォーマンス最適化

### 14.1 キャッシュ活用

- Homebrewキャッシュの再利用
- pnpmストアの共有
- ダウンロード済みパッケージの再利用

### 14.2 並列ダウンロード

- pnpm install の内部並列処理を活用
- 明示的な並列化は不要

### 14.3 スキップロジック

```bash
# 既にインストール済みの場合はスキップ
if check_command_exists "brew" && check_version_match "brew" "4"; then
  print_info "Homebrew は既にインストールされています。スキップします。"
  write_state "homebrew" "completed"
else
  install_homebrew
fi
```

---

## 15. プラットフォーム分岐設計

### 15.1 プラットフォーム検出

```bash
detect_platform() {
  case "$(uname -s)" in
    Darwin*)  echo "mac" ;;
    MINGW*)   echo "windows" ;;
    Linux*)   echo "linux" ;;
    *)        echo "unknown" ;;
  esac
}

PLATFORM=$(detect_platform)

if [[ "$PLATFORM" != "mac" ]]; then
  print_error "このスクリプトはmacOS専用です"
  print_info "Windows版は setup-dev-environment.ps1 を使用してください"
  exit 1
fi
```

### 15.2 プラットフォーム固有処理

```bash
case "$PLATFORM" in
  mac)
    install_homebrew
    install_xcode_clt
    ;;
  windows)
    install_chocolatey
    install_vs_build_tools
    ;;
esac
```

---

## 16. ユーザーインタラクション設計

### 16.1 確認プロンプト

**確認が必要な操作**:

- Homebrewのインストール（初回のみ）
- Xcode CLTのインストール（ダウンロード時間が長い）
- ロールバックの実行

**自動実行**:

- バージョンアップグレード
- 依存関係インストール
- ネイティブモジュール再ビルド

### 16.2 非対話モード

```bash
# --yes オプションですべて自動実行
if [[ "$YES_FLAG" == "true" ]]; then
  # 確認プロンプトをスキップ
fi
```

---

## 17. ドキュメント生成

### 17.1 インストールログ

**ファイル**: `logs/setup-YYYYMMDD-HHmmss.log`

**内容**:

- 実行開始時刻
- 各ステップの開始・完了時刻
- インストールされたツールとバージョン
- エラーメッセージ
- 実行終了時刻
- 合計所要時間

### 17.2 環境情報レポート

**ファイル**: `environment-info.md`

**内容**:

- プラットフォーム情報
- インストールされたツール一覧
- バージョン情報
- 環境変数設定
- 次のステップ

---

## 18. セキュリティ設計

### 18.1 安全なスクリプト実行

- `set -e`: エラー時に即座に終了
- `set -u`: 未定義変数の使用を禁止
- `set -o pipefail`: パイプライン内のエラーを検出

### 18.2 ダウンロード検証

- HTTPS接続のみ許可
- 公式URLのみ使用
- チェックサム検証（可能な場合）

### 18.3 権限管理

- sudo は最小限の使用
- ユーザーディレクトリへのインストールを優先
- システム全体への影響を最小化

---

## 19. 依存関係

### 19.1 前提条件

- T-01-1（セットアップフロー設計）が完了している
- Phase 0の要件定義が完了している

### 19.2 後続タスク

- T-02-1（依存関係検証テスト作成）
- T-03-1（セットアップスクリプト実装）

---

## 20. 成功基準

- [ ] 冪等性が保証されている
- [ ] エラーハンドリングが各ステップで設計されている
- [ ] 進捗表示が設計されている
- [ ] ロールバック機能が設計されている
- [ ] Mac/Windows両対応が考慮されている
- [ ] 状態管理が設計されている
- [ ] リトライロジックが設計されている
- [ ] セキュリティが考慮されている

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 作成者      |
| ---------- | ---------- | -------- | ----------- |
| 1.0.0      | 2025-12-03 | 初版作成 | .claude/agents/devops-eng.md |
