# Phase 2 成果物: CI統合設計書

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| タスク | タスク3: CI統合設計                |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 既存CIパイプライン構成

### 1.1 現行 jobs 一覧

```
ci.yml
├── lint                    (独立)
├── build-shared            (独立)
├── typecheck               (needs: build-shared)
├── test-shared             (needs: build-shared)
├── test-desktop            (needs: build-shared)
├── e2e-desktop             (needs: build-shared)
├── check-module-sync       (独立)
├── security                (独立)
├── coverage                (needs: test-shared, test-desktop)
└── build                   (needs: lint, typecheck, test-shared, test-desktop)
```

### 1.2 共通パターン

- Node.js v22
- pnpm/action-setup@v4
- `.github/actions/pnpm-install-retry` カスタムアクションで依存関係インストール
- `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` で Electron バイナリスキップ
- shared ビルド依存の job は `actions/download-artifact@v4` で `shared-build` をダウンロード

---

## 2. 新規 job 設計: verify-ipc-4layer

### 2.1 Job 定義

```yaml
verify-ipc-4layer:
  name: Verify IPC 4-Layer Alignment
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 5
  env:
    ELECTRON_SKIP_BINARY_DOWNLOAD: 1
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"

    - name: Run IPC 4-layer verification
      run: node scripts/verify-ipc-4layer.js
```

### 2.2 設計判断

| 判断項目                  | 決定               | 理由                                                                                                                 |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| needs 依存                | `[build-shared]`   | shared のビルド成果物は不要だが、shared ソースが存在すればよい。ただし CI 実行順序の安定性のため build-shared に依存 |
| pnpm インストール         | **不要**           | `.js` ファイルで Node.js 標準ライブラリのみ使用のため pnpm/依存関係インストール不要                                  |
| shared-build artifact     | **不要**           | スクリプトはソースコード (.ts) を直接読むため、ビルド成果物不要                                                      |
| timeout-minutes           | 5                  | NFR-1 の 30 秒以内 + 余裕。checkout 含めて最大 5 分                                                                  |
| paths filter              | なし（全PRで実行） | IPC 関連ファイルの変更検出は複雑で偽陰性のリスクが高い。実行時間が短い (<1秒) ため全PRで実行しても問題ない           |
| Electron バイナリスキップ | 設定する           | 念のため（Node.js セットアップ時の自動ダウンロード抑制）                                                             |

### 2.3 build job への依存追加

新規 job を `build` job の `needs` に追加する:

```yaml
build:
  needs: [lint, typecheck, test-shared, test-desktop, verify-ipc-4layer]
```

これにより IPC 4層整合性違反がある場合は build が実行されない。

---

## 3. 既存スクリプトとの共存設計

### 3.1 実行順序

```
ci.yml 実行フロー:
  build-shared → verify-ipc-4layer (新規)
                → typecheck
                → test-shared
                → test-desktop → ...
```

`check-ipc-contracts.ts` は現在 CI に組み込まれていないため、実行順序の衝突はない。

### 3.2 将来の統合方針

| 段階   | 構成                                                 |
| ------ | ---------------------------------------------------- |
| 現在   | `verify-ipc-4layer.js` のみ CI 実行                  |
| 将来案 | `check-ipc-contracts.ts` も CI に追加し、並列実行    |
| 統合案 | 両スクリプトを1つの CI job にまとめ、sequential 実行 |

現時点では `verify-ipc-4layer.js` のみを CI に組み込み、`check-ipc-contracts.ts` の CI 統合は別タスクとする。

---

## 4. エラー時の振る舞い

### 4.1 GitHub Actions アノテーション

スクリプトが `::error` / `::warning` プレフィックスを使用することで、GitHub Actions が自動的にアノテーションを生成する。

```
::error file=packages/shared/src/ipc/channels.ts::Rule-1: Channel "test:missing" defined in shared but not in preload whitelist
```

これにより PR の Files Changed タブにインラインでエラーが表示される。

### 4.2 exit code マッピング

| exit code | 意味                   | CI結果  |
| --------- | ---------------------- | ------- |
| 0         | 全ルールパス           | SUCCESS |
| 1         | 1つ以上のルール違反    | FAILURE |
| 2         | スクリプト自体のエラー | FAILURE |

### 4.3 失敗時の開発者アクション

```
CI 失敗
  ↓
エラーログ確認
  ├── Rule-1 違反 → preload/channels.ts の ALLOWED_INVOKE_CHANNELS or ALLOWED_ON_CHANNELS に追加
  ├── Rule-2 違反 → main/ipc/ に ipcMain.handle を追加
  └── Rule-3 違反 → shared/channels.ts にチャネル定義を追加、または preload IPC_CHANNELS に追加
```

---

## 5. パフォーマンス考慮

### 5.1 実行時間見積もり

| ステップ       | 見積もり時間 |
| -------------- | ------------ |
| checkout       | 5-15秒       |
| Node.js setup  | 5-10秒       |
| スクリプト実行 | < 1秒        |
| **合計**       | **10-26秒**  |

### 5.2 並列実行による最適化

`verify-ipc-4layer` は他の job と並列実行される（`build-shared` 完了後）。CI 全体のクリティカルパスに影響を与えない。

```
timeline:
  t=0   build-shared 開始
  t=30  build-shared 完了
  t=30  verify-ipc-4layer 開始 (並列: typecheck, test-shared, test-desktop)
  t=56  verify-ipc-4layer 完了
  t=120 typecheck 完了
  t=180 test-desktop 完了
  t=180 build 開始 (全 needs 完了)
```

---

## 6. package.json scripts 追加

CI 以外でもローカル実行できるよう、ルートの `package.json` にスクリプトを追加する:

```json
{
  "scripts": {
    "verify:ipc": "node scripts/verify-ipc-4layer.js"
  }
}
```

開発者は `pnpm verify:ipc` でローカル実行可能。

---

## 7. セキュリティ考慮

| 項目                 | 対応                                               |
| -------------------- | -------------------------------------------------- |
| ファイル読み取りのみ | スクリプトはファイルシステムへの書き込みを行わない |
| 外部通信なし         | ネットワークアクセスなし                           |
| 権限                 | `contents: read` のみ必要（既存設定で充足）        |
| シークレット不要     | 環境変数・シークレットを使用しない                 |
