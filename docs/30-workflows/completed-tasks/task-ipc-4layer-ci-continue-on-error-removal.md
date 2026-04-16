# UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2196
```

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001         |
| タスク名     | CI verify-ipc-4layer continue-on-error 解除 |
| 分類         | 改善                                        |
| 対象機能     | GitHub Actions CI / verify-ipc-4layer       |
| 優先度       | 中                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 完了                                        |
| 完了日       | 2026-04-16                                  |
| 対応Issue    | #2196                                       |
| 発見元       | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Phase 12 |
| 発見日       | 2026-04-15                                  |

## 苦戦箇所記録

CI環境でのIPC検証が不安定だったため、一時的に `continue-on-error: true` を設定した。

- **ローカル**: `node scripts/verify-ipc-4layer.cjs` → Rule-1/2/3 全PASS
- **CI環境**: `pnpm install` なしで `node scripts/verify-ipc-4layer.cjs` を実行するため、
  `@repo/shared` のビルド成果物が存在しない状態で実行される可能性があった
- **対応**: 当時は原因究明に時間をかけず、`continue-on-error: true` で一旦通過させた
- **リスク**: 将来のIPC違反（新規チャネル追加時など）がCIをブロックせずにmainに入り込む

> 同様の状況（スクリプトがローカルPASSでCI不安定）では、`verify-ipc-4layer.cjs` が
> `@repo/shared/dist` または TypeScriptソースを直接読んでいるかを確認する。
> `.cjs` スクリプトはビルド済み成果物に依存しがちであり、CI環境のセットアップ順序が重要。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001` で CI `verify-ipc-4layer` ジョブを追加したが、
CI環境での実行が不安定だったため `continue-on-error: true` を設定した。

その後、以下の2タスクで既知の全違反（Rule-1/Rule-2 計20チャネル）が解消済み:

- `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`: Rule-1（preloadホワイトリスト不足 12チャネル）解消
- `UT-FIX-IPC-MAIN-HANDLER-IMPL-001`: Rule-2（mainハンドラ未実装 8チャネル）解消

### 1.2 問題点・課題

`continue-on-error: true` がある限り、将来のIPC違反がCIをブロックしない。
IPC 4層整合性の自動保護（Guard）として機能しない状態になっている。

### 1.3 放置した場合の影響

新規のIPC channelを追加した際、preload or main の登録漏れがあっても
CI/CDパイプラインが通過してしまう。ランタイムで renderer→main 通信が
サイレントに失敗する障害が発生し得る。

---

## 2. 何を達成するか（What）

### 2.1 目的

`verify-ipc-4layer` CIジョブから `continue-on-error: true` を削除し、
IPC 4層整合性違反を検出した場合にCIをブロックする状態にする。

### 2.2 最終ゴール

`.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブが
`continue-on-error` なしで安定してPASSすること。

### 2.3 スコープ

#### 含むもの

- CI環境での `verify-ipc-4layer.cjs` 実行安定化（必要に応じてCI設定調整）
- `.github/workflows/ci.yml` から `continue-on-error: true` を削除
- CI PASSの確認

#### 含まないもの

- 新規IPC channelの追加
- `verify-ipc-4layer.cjs` スクリプト本体の修正
- Rule-3以外の新規検証ルール追加

### 2.4 成果物

- `.github/workflows/ci.yml` 修正（`continue-on-error: true` 削除）
- CI PASS確認結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `node scripts/verify-ipc-4layer.cjs` がローカルでRule-1/2/3 全PASS確認済み
- `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001` / `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` 完了済み

### 3.2 依存タスク

なし（両IPC修正タスク完了済み）

### 3.3 必要な知識

- GitHub Actions ワークフロー設定
- `verify-ipc-4layer.cjs` スクリプトの実行前提条件

### 3.4 推奨アプローチ

1. まずローカルで `node scripts/verify-ipc-4layer.cjs` を実行して全PASS確認
2. CI環境での失敗原因を特定（`@repo/shared` ビルド依存、Node.js version等）
3. 必要に応じてCIのstepsに `pnpm --filter @repo/shared build` を追加
4. `continue-on-error: true` を削除してCIトリガー

---

## 4. 実行手順

### Phase 1: 事前確認

```bash
# ローカルでの全PASS確認
node scripts/verify-ipc-4layer.cjs
```

- Rule-1（preload whitelist完全一致）: PASS
- Rule-2（main handler実装完全）: PASS
- Rule-3（shared channels整合）: PASS

### Phase 2: CI設定修正

対象ファイル: `.github/workflows/ci.yml`

変更内容:

```yaml
# Before（削除対象）
verify-ipc-4layer:
    name: IPC 4-Layer Alignment
    runs-on: ubuntu-latest
    timeout-minutes: 5
    continue-on-error: true   # ← 削除

# After
verify-ipc-4layer:
    name: IPC 4-Layer Alignment
    runs-on: ubuntu-latest
    timeout-minutes: 5
    # continue-on-error なし → CIブロッキング有効
```

### Phase 3: CI実行確認

CI実行後に `verify-ipc-4layer` ジョブが GREEN になっていることを確認。
FAILの場合は残存違反を `node scripts/verify-ipc-4layer.cjs` で特定して修正。

### 成果物

- `.github/workflows/ci.yml` 修正（`continue-on-error: true` 削除）
- CI PASS確認済み状態
