# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 5                                   |
| Phase名    | 実装                                |
| 前提Phase  | Phase 4                             |
| 後続Phase  | Phase 6                             |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

`.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブから `continue-on-error: true` を削除し、
IPC 4層整合性違反が発生した場合にCIが確実にブロックされる状態を実現する。

## 背景

- `UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001` でCI Guard追加時、CI環境の不安定さ回避のため
  `continue-on-error: true` を一時設定した
- Rule-1/2/3 の全既知違反はローカルで解消済み（`node scripts/verify-ipc-4layer.cjs` 全PASS）
- `continue-on-error: true` が残存すると、将来のIPC違反がCIをすり抜けるリスクがある
- Phase 2 で `verify-ipc-4layer.cjs` はソース直読で動作し、`@repo/shared build` 追加は不要と確定した
- したがって、実装は `continue-on-error: true` の 1 行削除のみとする

---

## 実行タスク

### タスク5-1: ローカル動作の最終確認（Red確認）

**目的**: 実装前に現状の動作を確認し、TDDのRedフェーズを明確化する

**実行手順**:

1. ローカルで `node scripts/verify-ipc-4layer.cjs` を実行し、全PASS出力を確認する
   ```bash
   node scripts/verify-ipc-4layer.cjs
   ```
2. 出力が Rule-1/2/3 全PASS であることを確認する
3. 確認結果を `outputs/phase-5/local-verify-result.txt` に保存する
   ```bash
   node scripts/verify-ipc-4layer.cjs > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-5/local-verify-result.txt 2>&1
   ```

**期待される成果物**:

- `outputs/phase-5/local-verify-result.txt`（Rule-1/2/3全PASS出力）

---

### タスク5-2: `continue-on-error: true` の削除（1行削除のみ）

**目的**: `verify-ipc-4layer` ジョブの `continue-on-error: true` を削除し、
CIブロッキングを有効化する

Phase 2 で確定した通り、この Phase では `@repo/shared build` や追加の `needs` は入れない。

**変更前のYAMLスニペット**:

```yaml
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

**変更後のYAMLスニペット**:

```yaml
verify-ipc-4layer:
  name: IPC 4-Layer Alignment
  runs-on: ubuntu-latest
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

    - name: Verify IPC 4-layer alignment
      run: node scripts/verify-ipc-4layer.cjs
```

**実行手順**:

1. `.github/workflows/ci.yml` を開く（対象行は297行目付近）
2. `continue-on-error: true` の行を削除する
3. YAMLインデントが崩れていないことを確認する

**期待される成果物**:

- `.github/workflows/ci.yml`（`continue-on-error: true` 削除済み）

---

### タスク5-3: ブランチへのpushとCI起動

**目的**: 変更をリモートブランチにpushし、GitHub Actions CIを起動する

**TDDサイクル（Red→Green）の観点**:

- **Red（期待するCI動作）**: `continue-on-error` 削除後、IPC違反があればCIがFAILする
- **Green（今回の期待）**: 全違反が解消済みのため、CIがPASSすること

**実行手順**:

1. 変更内容を確認する
   ```bash
   git diff .github/workflows/ci.yml
   ```
2. 変更をステージングする
   ```bash
   git add .github/workflows/ci.yml
   ```
3. コミットする
   ```bash
   git commit -m "fix(ci): remove continue-on-error from verify-ipc-4layer job"
   ```
4. 現在のブランチにpushする
   ```bash
   git push
   ```
5. GitHub Actions の実行URLを `outputs/phase-5/ci-run-url.txt` に記録する

**期待される成果物**:

- `.github/workflows/ci.yml`（最終確定版）
- `outputs/phase-5/ci-run-url.txt`（CI実行URLの記録）

---

## 参照資料

| 参照資料           | パス                                                             | 内容                                         |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------- |
| CIワークフロー定義 | `.github/workflows/ci.yml`                                       | 変更対象ファイル（297行目付近、1行削除のみ） |
| IPC検証スクリプト  | `scripts/verify-ipc-4layer.cjs`                                  | CIで実行される整合性検証スクリプト           |
| タスクindex        | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md` | タスク全体設計                               |

---

## 成果物

| 成果物                     | パス                                                                                            | 内容                               |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| CI設定ファイル（変更済み） | `.github/workflows/ci.yml`                                                                      | `continue-on-error: true` 削除済み |
| ローカル検証結果           | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-5/local-verify-result.txt` | ローカル全PASS出力                 |
| CI実行URL記録              | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-5/ci-run-url.txt`          | GitHub Actions 実行ページURL       |

---

## 統合テスト連携

Phase 5 では以下の統合テスト連携を実施する：

- `node scripts/verify-ipc-4layer.cjs` をローカルで実行し、全PASSを確認してから変更をpushする
- pushによりCI（GitHub Actions）がトリガーされることを確認する
- CIの `verify-ipc-4layer` ジョブが `continue-on-error` なしで実行開始されることを確認する

---

## 完了条件

- [ ] `node scripts/verify-ipc-4layer.cjs` のローカル実行で Rule-1/2/3 全PASSが確認できている
- [ ] `.github/workflows/ci.yml` から `continue-on-error: true` が削除されている
- [ ] 変更がリモートブランチにpushされ、GitHub Actions CIが起動している
- [ ] `outputs/phase-5/` 配下の成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5-1〜5-3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、`phase-6-test-expansion.md` を実行してください。
