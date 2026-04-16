# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 2                                   |
| Phase名    | 設計                                |
| 前提Phase  | Phase 1: 要件定義                   |
| 後続Phase  | Phase 3: 設計レビューゲート         |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

`verify-ipc-4layer` ジョブの `continue-on-error: true` 削除に伴う具体的な変更設計を策定する。CI環境の安定性を担保しつつ、IPC Guard を正式なブロッキングチェックとして有効化する方法を設計する。

## 背景

Phase 1の分析により、`verify-ipc-4layer.cjs` スクリプトはNode.js標準モジュール（`fs`, `path`）のみを使用し、TypeScriptソースファイルを直接読み込むため、`pnpm install` や `@repo/shared build` は不要であることが判明した。したがって、変更は `continue-on-error: true` の1行削除のみで完結する。**追加ステップは導入しない。**

---

## 実行タスク

### タスク1: 変更箇所の設計

**目的**: `.github/workflows/ci.yml` への変更内容を具体的に設計する。

**実行手順**:

1. 変更対象行を特定する
   - ファイル: `.github/workflows/ci.yml`
   - 対象ジョブ: `verify-ipc-4layer`（293〜310行）
   - 削除対象: 297行目 `    continue-on-error: true`

2. Before/After の YAML スニペットを確定する（後述の「設計詳細」参照）

3. 変更の最小化原則を適用する
   - 追加変更なし: pnpm install ステップの追加は不要（スクリプトは標準モジュールのみ使用）
   - needs 追加なし: `build-shared` への依存追加は不要（ソースファイルを直接参照）
   - 削除のみ: `continue-on-error: true` の1行削除のみ実施

**期待される成果物**:

- 変更差分の確定（Before/After スニペット）

---

### タスク2: CI環境安定化の追加ステップ設計（要否判断）

**目的**: CI環境での安定動作に追加ステップが必要かどうかを設計段階で判断する。

**実行手順**:

1. スクリプトの依存関係を再確認する

   ```
   verify-ipc-4layer.cjs が使用するNode.jsモジュール:
     - fs      (標準モジュール)
     - path    (標準モジュール)
   ```

   - npm/pnpm パッケージへの依存: なし
   - TypeScriptのコンパイル: 不要（.cjs はCommonJS形式で直接実行可能）

2. 読み込むファイルがCI環境で存在するかを確認する

   ```
   参照ファイル（actions/checkout@v4 でチェックアウト済み）:
     - packages/shared/src/ipc/channels.ts    → ソースファイル、常に存在
     - apps/desktop/src/preload/channels.ts   → ソースファイル、常に存在
     - apps/desktop/src/main/**/*.ts          → ソースファイル、常に存在
     - apps/desktop/src/renderer/**/*.ts      → ソースファイル、常に存在
   ```

3. 現在のジョブ定義で十分であると結論付ける

   ```yaml
   steps:
     - name: Checkout # ソースファイルを取得
       uses: actions/checkout@v4
     - name: Setup Node.js # Node.js 22 を準備
       uses: actions/setup-node@v6
       with:
         node-version: "22"
     - name: Verify IPC 4-layer alignment
       run: node scripts/verify-ipc-4layer.cjs # 標準モジュールのみ使用
   ```

   - **結論**: 追加ステップ不要。`continue-on-error: true` の削除のみで完結する。

**期待される成果物**:

- 追加ステップ不要の根拠（本タスクの結論）

---

### タスク3: verify-ipc-4layer ジョブの依存関係（needs）確認と設計

**目的**: `verify-ipc-4layer` ジョブが他ジョブと適切な順序関係を持つかを設計する。

**実行手順**:

1. 現状の依存関係を確認する
   - `verify-ipc-4layer` は現在 `needs` が未定義（他ジョブと独立して実行される）
   - `build` ジョブは `verify-ipc-4layer` を `needs` に含む（ci.yml 442〜453行）

2. `needs: [build-shared]` 追加の要否を判断する
   - `verify-ipc-4layer.cjs` は `packages/shared/dist/` を参照しない
   - `build-shared` の成果物（artifact）は不要
   - **結論**: `needs` 追加不要

3. 現在の実行タイミングの妥当性を確認する
   - `verify-ipc-4layer` は `lint`, `typecheck` 等と並列実行される（独立ジョブ）
   - チェックアウト直後にソースコードに対して検証を実行するため、この設計は合理的

4. `build` ジョブのブロッキング連鎖を設計上で確認する
   ```
   verify-ipc-4layer (FAIL)
        ↓ needs
   build (SKIP/FAIL)   ← continue-on-error: true 削除後、ここがブロックされる
   ```

**期待される成果物**:

- 依存関係設計の結論（`needs` 追加不要の確認）

---

### タスク4: Before/After YAML スニペットの確定

**目的**: 実装時の参照用として、変更前後の YAML を明示する。

**Before（変更前）**:

```yaml
verify-ipc-4layer:
  name: IPC 4-Layer Alignment
  runs-on: ubuntu-latest
  timeout-minutes: 5
  continue-on-error: true
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

**After（変更後）**:

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

**差分サマリ**:

| 項目                | Before   | After              |
| ------------------- | -------- | ------------------ |
| `continue-on-error` | `true`   | （削除）           |
| ジョブステップ      | 変更なし | 変更なし           |
| `needs`             | 未定義   | 未定義（変更なし） |
| `timeout-minutes`   | 5        | 5（変更なし）      |
| 実質的な差分行数    | —        | -1行               |

**期待される成果物**:

- Before/After スニペット（本タスク内に記載済み）

---

### タスク5: 変更実装方針の確定

**目的**: 実装フェーズ（Phase 5）での作業内容を設計として確定する。

**実行手順**:

1. 変更方針を確定する
   - **変更ファイル**: `.github/workflows/ci.yml` の1ファイルのみ
   - **変更内容**: 297行目 `    continue-on-error: true` の1行を削除
   - **変更方法**: Editツールによる正確な1行削除

2. 変更後の確認方法を設計する
   - `grep -n "continue-on-error" .github/workflows/ci.yml` で削除確認
   - `security` ジョブの `continue-on-error: true`（410行）は意図的な設定なので削除しないことを確認

3. `security` ジョブの `continue-on-error: true` との区別を明確にする

   ```yaml
   # security ジョブ（削除対象外）
   security:
     ...
     steps:
       - name: Run security audit
         run: pnpm audit --audit-level=high
         continue-on-error: true   # ← ステップレベルの設定、意図的
   ```

   - `security` ジョブの `continue-on-error` はステップレベルの設定（セキュリティ監査の脆弱性検出は警告扱い）
   - `verify-ipc-4layer` の `continue-on-error` はジョブレベルの設定（削除対象）

**期待される成果物**:

- 変更実装方針の確定（本タスク内に記載済み）

---

## 設計詳細

### 変更設計サマリ

```
対象ファイル  : .github/workflows/ci.yml
変更種別      : 1行削除
変更行        : 297行目
削除内容      : "    continue-on-error: true"
追加変更      : なし
```

### 変更後の動作フロー

```
IPC違反あり（FAIL時）:
  verify-ipc-4layer → FAIL
  └─ build ジョブ   → SKIP（needs に verify-ipc-4layer を含む）
  └─ PR マージ      → ブロック（CIがREDのためマージ不可）

IPC違反なし（PASS時）:
  verify-ipc-4layer → PASS
  └─ build ジョブ   → 正常実行継続
  └─ PR マージ      → 通常フロー
```

### リスク評価（設計段階）

| リスク                                      | 発生条件               | 対策                                                       |
| ------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| CI削除後すぐにREDになる                     | 現在IPC違反が存在する  | Phase 1タスク1でローカルPASS確認済みであれば問題なし       |
| 誤削除（securityジョブのcontinue-on-error） | 編集ミス               | Before/Afterスニペットを参照し、ジョブ名を明示して編集する |
| `build` ジョブのブロック影響                | verify-ipc-4layer FAIL | 意図的な設計（IPC Guard の目的）                           |

---

## 参照資料

| 参照資料          | パス                                                                            | 内容                                    |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| CI設定ファイル    | `.github/workflows/ci.yml`                                                      | 変更対象ワークフロー（変更行: 297行目） |
| IPC検証スクリプト | `scripts/verify-ipc-4layer.cjs`                                                 | 依存モジュール確認（fs, path のみ）     |
| Phase 1 要件定義  | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-1-requirements.md` | 要件・分析結論                          |

---

## 成果物

| 成果物                  | パス                                                                      | 内容         |
| ----------------------- | ------------------------------------------------------------------------- | ------------ |
| 設計書                  | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-2-design.md` | 本ファイル   |
| Before/After スニペット | 本ファイル内（タスク4）                                                   | YAML変更差分 |

---

## 統合テスト連携

- Phase 4の「CI実行確認プラン」に対して、本設計の変更内容（1行削除）が正しく機能することを検証する
- Phase 4のテストシナリオ（IPC違反を意図的に混入）で、本設計の変更後にCIがブロックされることを確認する

---

## 完了条件

- [ ] 変更対象（`.github/workflows/ci.yml` 297行目）を特定した
- [ ] Before/After の YAML スニペットを確定した
- [ ] 追加ステップ（pnpm install, shared build）が不要であることを確認した
- [ ] `needs` 追加が不要であることを確認した
- [ ] `security` ジョブの `continue-on-error: true` が削除対象外であることを明示した
- [ ] 変更後の動作フロー（FAIL時のブロッキング連鎖）を設計した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1: 要件定義
- **後続**: Phase 3: 設計レビューゲート

---

## 次のPhase

完了後、`phase-3-design-review.md` を実行してください。
