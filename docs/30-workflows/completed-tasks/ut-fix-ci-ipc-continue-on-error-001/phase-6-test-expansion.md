# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 6                                   |
| Phase名    | テスト拡充                          |
| 前提Phase  | Phase 5                             |
| 後続Phase  | Phase 7                             |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

Phase 5 でpushしたブランチの GitHub Actions CIが `verify-ipc-4layer` ジョブを
`continue-on-error` なしで正常にPASSしたことを確認し、その実行ログを証跡として収集・保存する。

## 背景

- Phase 5 でCI起動後、実際にCIが安定してGREENになることを実証する必要がある
- CI実行ログは「IPC 4層整合性Guard が有効化された」根拠となる証跡資料である
- CI環境でのPASS確認が取れて初めて、今回の変更が安全であると判断できる

---

## 実行タスク

### タスク6-1: GitHub Actions CI実行完了の確認

**目的**: Phase 5でpushしたブランチのCIが完了し、`verify-ipc-4layer` ジョブのステータスを確認する

**実行手順**:

1. GitHub Actions の実行ページを開く
   - `outputs/phase-5/ci-run-url.txt` に記録されたURLを確認する
   - または GitHub リポジトリの「Actions」タブから最新のCI実行を確認する
2. `gh` CLIで実行状況を確認する
   ```bash
   gh run list --branch $(git branch --show-current) --limit 5
   ```
3. CIの全ジョブが完了するまで待機する（`verify-ipc-4layer` ジョブのタイムアウトは5分）
4. `verify-ipc-4layer` ジョブのステータスが `success` であることを確認する
   ```bash
   gh run view --log | grep -A 10 "IPC 4-Layer Alignment"
   ```

**期待される成果物**:

- CI実行結果の確認（`verify-ipc-4layer` ジョブが `success`）

---

### タスク6-2: CI実行ログの収集

**目的**: `verify-ipc-4layer` ジョブの実行ログを取得し、証跡として保存する

**実行手順**:

1. `gh` CLIで最新CIの実行IDを取得する
   ```bash
   gh run list --branch $(git branch --show-current) --limit 1 --json databaseId,status,conclusion
   ```
2. 実行IDを使って `verify-ipc-4layer` ジョブのログを取得する
   ```bash
   RUN_ID=<取得したrun ID>
   gh run view $RUN_ID --log --job "IPC 4-Layer Alignment" \
     > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-verify-ipc-log.txt 2>&1
   ```
3. ログファイルに Rule-1/2/3 全PASS の記録が含まれることを確認する
4. CIジョブ全体のサマリーを保存する
   ```bash
   gh run view $RUN_ID --json status,conclusion,jobs \
     > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-run-summary.json
   ```

**期待される成果物**:

- `outputs/phase-6/ci-verify-ipc-log.txt`（`verify-ipc-4layer` ジョブのCIログ）
- `outputs/phase-6/ci-run-summary.json`（CI実行サマリー JSON）

---

### タスク6-3: CI GREEN確認の証跡収集

**目的**: `verify-ipc-4layer` ジョブが `continue-on-error` なしでGREENになった事実を、
他のPhaseが参照できる形式で記録する

**実行手順**:

1. CI実行URLとジョブのステータスを記録したMarkdownファイルを作成する
2. 以下の情報を `outputs/phase-6/ci-green-evidence.md` に記録する：
   - CI実行URL
   - 実行日時
   - `verify-ipc-4layer` ジョブのステータス（success/failure）
   - Rule-1/2/3 それぞれのPASS/FAIL状況
   - `continue-on-error` 設定の有無（削除済みであることの確認）
3. 記録フォーマット例：

   ```markdown
   # CI GREEN 証跡 - verify-ipc-4layer

   ## CI実行情報

   - URL: https://github.com/<org>/<repo>/actions/runs/<run-id>
   - 実行日時: 2026-04-XX XX:XX UTC
   - ブランチ: <branch-name>

   ## ジョブステータス

   - verify-ipc-4layer: SUCCESS
   - continue-on-error: 設定なし（削除済み）

   ## IPC Rule 検証結果

   - Rule-1 (preloadホワイトリスト整合性): PASS
   - Rule-2 (mainハンドラ実装整合性): PASS
   - Rule-3 (型定義整合性): PASS
   ```

**期待される成果物**:

- `outputs/phase-6/ci-green-evidence.md`（GREEN確認の証跡ドキュメント）

---

### タスク6-4: ローカル再実行による最終確認

**目的**: ローカル環境での `verify-ipc-4layer.cjs` の再実行結果をCI環境の結果と照合し、
整合性を確認する

**実行手順**:

1. ローカルで `verify-ipc-4layer.cjs` を再実行する
   ```bash
   node scripts/verify-ipc-4layer.cjs \
     > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/local-verify-rerun.txt 2>&1
   ```
2. Phase 5 で保存した `outputs/phase-5/local-verify-result.txt` と比較し、
   同一のPASS結果であることを確認する
   ```bash
   diff \
     docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-5/local-verify-result.txt \
     docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/local-verify-rerun.txt
   ```
3. 差分がなければ（exitコード0）、整合性確認OKと判断する

**期待される成果物**:

- `outputs/phase-6/local-verify-rerun.txt`（ローカル再実行結果）

---

## 参照資料

| 参照資料           | パス                                                                     | 内容                                          |
| ------------------ | ------------------------------------------------------------------------ | --------------------------------------------- |
| Phase 5 成果物     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-5/` | CI実行URL・ローカル検証結果等                 |
| CIワークフロー定義 | `.github/workflows/ci.yml`                                               | 変更済みCI設定（`continue-on-error`削除済み） |
| IPC検証スクリプト  | `scripts/verify-ipc-4layer.cjs`                                          | Rule-1/2/3 検証ロジック                       |
| タスクindex        | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`         | タスク全体設計と統合テスト連携一覧            |

---

## 成果物

| 成果物             | パス                                                                                           | 内容                                |
| ------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| CI実行ログ         | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-verify-ipc-log.txt`  | verify-ipc-4layerジョブのCIログ     |
| CI実行サマリー     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-run-summary.json`    | CI実行結果のJSONサマリー            |
| GREEN確認証跡      | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-green-evidence.md`   | CIブロッキング有効化のGREEN確認証跡 |
| ローカル再実行結果 | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/local-verify-rerun.txt` | ローカル環境での再実行結果          |

---

## 統合テスト連携

Phase 6 では以下の統合テスト連携を実施する：

- GitHub Actions の `verify-ipc-4layer` ジョブが `continue-on-error` なしで `success` になることを実証する
- CI実行ログを収集し、Rule-1/2/3 全PASSが記録されていることを確認する
- ローカル実行結果とCI実行結果の整合性を照合する

---

## 完了条件

- [ ] GitHub Actions CI の `verify-ipc-4layer` ジョブが `continue-on-error` なしで `success` になっている
- [ ] `outputs/phase-6/ci-verify-ipc-log.txt` にCI実行ログが保存されている
- [ ] `outputs/phase-6/ci-run-summary.json` にCI実行サマリーが保存されている
- [ ] `outputs/phase-6/ci-green-evidence.md` にGREEN確認の証跡が記録されている
- [ ] `outputs/phase-6/local-verify-rerun.txt` が保存されており、Phase 5の結果と整合している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6-1〜6-4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了し、変更がリモートブランチにpushされていること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、`phase-7-coverage-check.md` を実行してください。
