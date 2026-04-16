# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 1                                   |
| Phase名    | 要件定義                            |
| 前提Phase  | なし                                |
| 後続Phase  | Phase 2: 設計                       |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

`verify-ipc-4layer` CI ジョブの `continue-on-error: true` を削除し、IPC 4層整合性検証をCIの正式なブロッキングチェックとして有効化するための要件を明確にする。

## 背景

`scripts/verify-ipc-4layer.cjs` はIPC（Inter-Process Communication）の4層（shared → preload → main → renderer）の整合性を検証するスクリプトである。現在、ローカル環境ではRule-1/2/3が全PASS済みであるが、CIジョブ `verify-ipc-4layer` には `continue-on-error: true` が設定されており、検証が失敗してもCIパイプライン全体はブロックされない状態になっている。

CI Guardとして本スクリプトを機能させるには、`continue-on-error: true` を削除し、違反があった場合にCIがREDになる仕組みが必要である。ただし、CI環境での不安定原因（`@repo/shared` のビルド依存）を事前に調査・解消しないと、削除後にCIが誤検知でREDになるリスクがある。

---

## 実行タスク

### タスク1: ローカル実行による現状確認

**目的**: `node scripts/verify-ipc-4layer.cjs` がRule-1/2/3全PASSであることをローカルで確認し、スクリプト自体の正常動作を担保する。

**実行手順**:

1. プロジェクトルートへ移動する
   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260416-141958-wt-5
   ```
2. スクリプトを実行する
   ```bash
   node scripts/verify-ipc-4layer.cjs
   ```
3. 出力を確認し、以下の内容が含まれることを検証する
   - `[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: PASS`
   - `[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS`
   - `[Rule-3] renderer で使用されたチャネルが shared/preload に未定義: PASS`
   - `Failed: 0`
4. 終了コード0であることを確認する
   ```bash
   echo "Exit code: $?"
   ```

**期待される成果物**:

- Rule-1/2/3 全PASS の実行ログ（スクリーンショットまたはテキスト記録）

---

### タスク2: CI環境での不安定原因の分析

**目的**: `verify-ipc-4layer` ジョブが `continue-on-error: true` となった経緯と、CI環境固有の不安定原因を特定する。

**実行手順**:

1. 現在の `verify-ipc-4layer` ジョブの定義を確認する

   ```yaml
   # .github/workflows/ci.yml 293-310行
   verify-ipc-4layer:
     name: IPC 4-Layer Alignment
     runs-on: ubuntu-latest
     timeout-minutes: 5
     continue-on-error: true # ← 削除対象
     env:
       ELECTRON_SKIP_BINARY_DOWNLOAD: 1
     steps:
       - name: Checkout
         uses: actions/checkout@v4
       - name: Setup Node.js
         uses: actions/setup-node@v6
         with:
           node-version: "22"
       - name: Verify IPC 4-layer alignment
         run: node scripts/verify-ipc-4layer.cjs
   ```

2. 他のジョブ（`typecheck`, `test-shared`, `test-desktop` 等）との違いを比較する
   - 他ジョブは `needs: [build-shared]` を持ち、`packages/shared/dist/` を artifact として受け取る
   - `verify-ipc-4layer` は `needs` が未定義、かつ pnpm install ステップが存在しない

3. `verify-ipc-4layer.cjs` スクリプトが参照するパスを確認する

   ```
   PATHS.SHARED_CHANNELS = "packages/shared/src/ipc/channels.ts"
   PATHS.PRELOAD_CHANNELS = "apps/desktop/src/preload/channels.ts"
   PATHS.MAIN_IPC_DIR     = "apps/desktop/src/main"
   PATHS.RENDERER_DIR     = "apps/desktop/src/renderer"
   ```

   - スクリプトはTypeScriptコンパイル済みの `dist/` ではなく、ソースファイル（`.ts`）を直接読み込む
   - `node scripts/verify-ipc-4layer.cjs` 実行に `pnpm install` や `@repo/shared build` は**不要**

4. 不安定の実際の原因を特定する
   - `verify-ipc-4layer.cjs` は `packages/shared/src/ipc/channels.ts` をソースとして直接読み込む
   - ビルド済み `dist/` には依存しない → `@repo/shared build` 依存は**誤った推測**の可能性あり
   - `Setup pnpm` ステップが存在しないが、スクリプトはNode.js標準モジュールのみ使用（`fs`, `path`）→ pnpm install 不要
   - 結論: CI環境での不安定原因はスクリプト本体の問題ではなく、過去のIPC違反が `continue-on-error: true` で隠蔽されていた可能性が高い

**期待される成果物**:

- CI不安定原因の分析レポート（本仕様書の「分析結論」セクションに記載）

**分析結論**:

| 推測原因                    | 実際の状況                                                    | 結論               |
| --------------------------- | ------------------------------------------------------------- | ------------------ |
| `@repo/shared` のビルド依存 | スクリプトはソース `.ts` を直接読み込み、`dist/` を使用しない | 該当しない         |
| `pnpm install` 未実施       | スクリプトはNode標準モジュール（`fs`, `path`）のみ使用        | 該当しない         |
| 過去のIPC違反の隠蔽         | `continue-on-error: true` により失敗が無視されていた          | 最有力             |
| チャネル定義の不整合        | ローカルでは全PASS → 現在は不整合なし                         | 現時点では問題なし |

---

### タスク3: `continue-on-error: true` 削除の要件定義

**目的**: 削除の要件・受け入れ条件・リスクを明文化する。

**実行手順**:

1. 変更対象の特定
   - ファイル: `.github/workflows/ci.yml`
   - 対象ジョブ: `verify-ipc-4layer`（293〜310行）
   - 削除対象の行: `continue-on-error: true`（297行）

2. 削除後の期待動作の定義
   - IPC違反がある場合: `verify-ipc-4layer` ジョブが FAIL → `build` ジョブがブロックされる
   - IPC違反がない場合: `verify-ipc-4layer` ジョブが PASS → 通常通りCI継続

3. `build` ジョブとの依存関係を確認する

   ```yaml
   # ci.yml 438-453行
   build:
     needs: [
         lint,
         typecheck,
         test-shared,
         test-desktop,
         test-web,
         e2e-desktop,
         build-shared,
         check-module-sync,
         verify-ipc-4layer, # ← build ジョブは verify-ipc-4layer に依存している
       ]
   ```

   - `verify-ipc-4layer` が FAIL すると `build` ジョブも実行されない

4. 受け入れ条件の定義（後述の「完了条件」参照）

**期待される成果物**:

- 要件定義書（本ファイル）の完成
- 変更対象ファイル・行番号の特定

---

## 参照資料

| 参照資料             | パス                                   | 内容                       |
| -------------------- | -------------------------------------- | -------------------------- |
| CI設定ファイル       | `.github/workflows/ci.yml`             | 変更対象のワークフロー定義 |
| IPC検証スクリプト    | `scripts/verify-ipc-4layer.cjs`        | Rule-1/2/3の検証ロジック   |
| Shared チャネル定義  | `packages/shared/src/ipc/channels.ts`  | IPC チャネルの正本定義     |
| Preload チャネル定義 | `apps/desktop/src/preload/channels.ts` | Preload ホワイトリスト定義 |

---

## 成果物

| 成果物         | パス                                                                            | 内容                       |
| -------------- | ------------------------------------------------------------------------------- | -------------------------- |
| 要件定義書     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-1-requirements.md` | 本ファイル                 |
| 実行ログ記録   | タスク1の出力（作業者が記録）                                                   | ローカルでの全PASS確認結果 |
| 不安定原因分析 | タスク2の分析結論（本ファイル内）                                               | CI不安定の原因特定         |

---

## 統合テスト連携

- Phase 4のCI実行確認プランと整合性を保つこと
- ローカルでの全PASS確認（タスク1）がPhase 4の「ローカル事前確認」と対応する

---

## 完了条件

- [ ] ローカルで `node scripts/verify-ipc-4layer.cjs` を実行し、Rule-1/2/3が全PASS（`Failed: 0`）であることを確認した
- [ ] CI環境での不安定原因を分析し、`@repo/shared` のビルド依存が実際には不要であることを確認した
- [ ] `verify-ipc-4layer` ジョブに `continue-on-error: true` が存在することを `.github/workflows/ci.yml` の297行目で確認した
- [ ] `build` ジョブが `verify-ipc-4layer` に依存していることを確認した
- [ ] 削除後の期待動作（違反時はCIブロック、正常時はCIパス）を要件として明文化した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2: 設計

---

## 次のPhase

完了後、`phase-2-design.md` を実行してください。
