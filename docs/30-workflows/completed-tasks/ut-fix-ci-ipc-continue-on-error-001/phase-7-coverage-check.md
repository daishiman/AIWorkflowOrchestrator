# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 7                                   |
| Phase名    | カバレッジ確認                      |
| 前提Phase  | Phase 6                             |
| 後続Phase  | Phase 8                             |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

本タスクはCI設定ファイル（YAML）の変更であるため、コードのユニットテストカバレッジではなく
**CI整合性確認**が主目的である。`verify-ipc-4layer` ジョブのRule-1/2/3全PASS確認と、
今回の変更が他のCIジョブへ悪影響を与えていないことを検証する。

## 背景

- CI設定変更においては「テストカバレッジ率」の概念は適用されない
- 代わりに「CIジョブの整合性」「needs依存グラフの健全性」「IPC Rule全PASS」を
  カバレッジ相当の指標として確認する
- `verify-ipc-4layer` ジョブは `build` ジョブの `needs` リストに含まれており、
  このジョブのFAILは最終ビルドゲートを止める
- `coverage` ジョブは `push` の `main` でのみ実行され、`pull_request` では `skipped` が正常である

---

## 実行タスク

### タスク7-1: IPC Rule-1/2/3 全PASS確認

**目的**: `verify-ipc-4layer.cjs` が定義する3つのルールが全てPASSしていることを確認する

**各ルールの定義**:

| Rule   | 検証内容                                        | 確認方法                                          |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| Rule-1 | preloadホワイトリストとrenderer呼び出しの整合性 | `node scripts/verify-ipc-4layer.cjs` の出力で確認 |
| Rule-2 | mainプロセスハンドラの実装漏れがないこと        | `node scripts/verify-ipc-4layer.cjs` の出力で確認 |
| Rule-3 | IPC型定義（TypeScript interface）の整合性       | `node scripts/verify-ipc-4layer.cjs` の出力で確認 |

**実行手順**:

1. ローカルで `verify-ipc-4layer.cjs` を実行し、Rule-1/2/3 の出力を確認する
   ```bash
   node scripts/verify-ipc-4layer.cjs
   ```
2. 出力に `PASS` が3行含まれ、`FAIL` または `ERROR` が含まれないことを確認する
3. Phase 6 で収集した `outputs/phase-6/ci-verify-ipc-log.txt` を参照し、
   CI環境でも同様のPASS出力が得られていることを照合する
4. 確認結果を `outputs/phase-7/rule-all-pass-check.md` に記録する

**期待される成果物**:

- `outputs/phase-7/rule-all-pass-check.md`（Rule-1/2/3 全PASS確認記録）

---

### タスク7-2: build依存グラフの確認

**目的**: `verify-ipc-4layer` ジョブが `build` ジョブの `needs` に含まれており、
CIブロッキングが有効に機能することを確認する

**実行手順**:

1. `.github/workflows/ci.yml` の `build` ジョブの `needs` リストを確認する
   ```bash
   grep -A 20 "^  build:" .github/workflows/ci.yml | grep -E "needs|verify-ipc"
   ```
2. `verify-ipc-4layer` が `needs` に含まれていることを確認する
   - 現状（確認済み）: `build` の `needs` に `verify-ipc-4layer` が含まれている（452行目付近）
3. `continue-on-error: true` が `verify-ipc-4layer` ジョブに**存在しない**ことを確認する

   ```bash
   grep -n "continue-on-error" .github/workflows/ci.yml
   ```

   - 期待: `verify-ipc-4layer` ジョブのブロック内に `continue-on-error` が存在しないこと

4. `coverage` ジョブが `push` の `main` でのみ実行される条件付きジョブであることを確認する

   ```bash
   grep -A 8 "^  coverage:" .github/workflows/ci.yml | grep -E "if:|needs:"
   ```

   - 期待: `pull_request` では `coverage` が `skipped` になること

5. 確認結果を `outputs/phase-7/needs-graph-check.md` に記録する

**期待される成果物**:

- `outputs/phase-7/needs-graph-check.md`（needs依存グラフ確認記録）

---

### タスク7-3: 他のCIジョブへの影響確認

**目的**: `verify-ipc-4layer` ジョブの変更が、他のCIジョブの動作や依存関係に
悪影響を与えていないことを確認する

**確認対象ジョブ**:

| ジョブ名            | `verify-ipc-4layer` との関係 | 確認観点                                               |
| ------------------- | ---------------------------- | ------------------------------------------------------ |
| `build`             | `needs` に含む（直接依存）   | `verify-ipc-4layer` FAILで連動FAILすること             |
| `coverage`          | 条件付きジョブ               | `push` の `main` でのみ success、PRでは skipped が正常 |
| `security`          | 独立ジョブ                   | step-level continue-on-error は意図的、変更なし        |
| `lint`              | 依存関係なし                 | 独立して動作すること                                   |
| `typecheck`         | 依存関係なし                 | 独立して動作すること                                   |
| `build-shared`      | 依存関係なし                 | 独立して動作すること                                   |
| `check-module-sync` | 依存関係なし                 | 独立して動作すること                                   |
| `test-shared`       | `build-shared` に依存        | 依存関係に変化がないこと                               |
| `e2e-desktop`       | `build-shared` に依存        | 依存関係に変化がないこと                               |
| `test-desktop`      | `build-shared` に依存        | 依存関係に変化がないこと                               |
| `test-web`          | `build-shared` に依存        | 依存関係に変化がないこと                               |

**実行手順**:

1. Phase 6 で収集した `outputs/phase-6/ci-run-summary.json` を確認し、
   上記ジョブがトリガー条件に応じた期待値になっていることを確認する
   ```bash
   cat docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-run-summary.json \
     | python3 -m json.tool | grep -E '"name"|"conclusion"'
   ```
2. `coverage` の `skipped` は `pull_request` では正常であり、異常扱いしないことを確認する
3. `verify-ipc-4layer` 以外のジョブに予期しない変化がないことを確認する
4. 確認結果を `outputs/phase-7/other-jobs-impact-check.md` に記録する

**期待される成果物**:

- `outputs/phase-7/other-jobs-impact-check.md`（他ジョブへの影響確認記録）

---

### タスク7-4: CI整合性サマリーの作成

**目的**: Phase 7 で実施した全確認結果をまとめ、次フェーズへの引き継ぎ資料を作成する

**実行手順**:

1. タスク7-1〜7-3の確認結果をまとめた `outputs/phase-7/ci-integrity-summary.md` を作成する
2. 以下の項目を網羅する：
   - Rule-1/2/3 全PASS: ○/×
   - `build` 依存グラフ正常: ○/×
   - `security` ジョブ正常: ○/×
   - `coverage` 条件付き実行正常: ○/×
   - `pull_request` で `coverage` が `skipped` になる: ○/×
   - `continue-on-error` 削除確認: ○/×
   - 他ジョブへの影響なし: ○/×
   - 総合判定: PASS/FAIL
3. 総合判定がFAILの場合は、Phase 6 へ戻り原因を調査する

**期待される成果物**:

- `outputs/phase-7/ci-integrity-summary.md`（CI整合性サマリー）

---

## 参照資料

| 参照資料               | パス                                                                                          | 内容                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Phase 6 CI実行ログ     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-verify-ipc-log.txt` | CI環境でのverify-ipc-4layerログ                                                    |
| Phase 6 CI実行サマリー | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-run-summary.json`   | CI全ジョブの実行結果サマリー                                                       |
| CIワークフロー定義     | `.github/workflows/ci.yml`                                                                    | `build` の `needs` 定義（438〜453行付近）と `coverage` の条件付き実行（415行付近） |
| IPC検証スクリプト      | `scripts/verify-ipc-4layer.cjs`                                                               | Rule-1/2/3の検証ロジック                                                           |
| タスクindex            | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`                              | CI検証指標（PASS率100%目標）                                                       |

---

## 成果物

| 成果物                  | パス                                                                                               | 内容                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Rule全PASS確認記録      | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/rule-all-pass-check.md`     | Rule-1/2/3 全PASS確認                                   |
| needs依存グラフ確認記録 | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/needs-graph-check.md`       | build依存グラフの健全性確認                             |
| 他ジョブ影響確認記録    | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/other-jobs-impact-check.md` | 他CIジョブへの影響なし確認                              |
| CI整合性サマリー        | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/ci-integrity-summary.md`    | Phase 7 総合判定サマリー（build/security/coverage含む） |

---

## 統合テスト連携

Phase 7 では以下の統合テスト連携を実施する：

- Rule-1/2/3 全PASSをゲート判定に使用する（全PASSでないとPhase 8へ進めない）
- `needs` 依存グラフを確認し、`verify-ipc-4layer` が `build` をブロックする構造が正しいことを確認する
- `coverage` が `push` の `main` でのみ実行され、`pull_request` では `skipped` が正常であることを確認する
- 他の全CIジョブの期待ステータスを確認し、今回の変更による副作用がないことを保証する

---

## 完了条件

- [ ] Rule-1/2/3 が全てPASSしている（ローカルおよびCI環境の両方）
- [ ] `verify-ipc-4layer` ジョブが `build` ジョブの `needs` に含まれていることを確認した
- [ ] `.github/workflows/ci.yml` に `continue-on-error` が残存していないことを確認した
- [ ] `security` ジョブが独立ジョブとして正常に success であることを確認した
- [ ] `coverage` ジョブが `push` の `main` でのみ実行され、`pull_request` では `skipped` が正常であることを確認した
- [ ] 他の全CIジョブへの悪影響がないことを確認した
- [ ] `outputs/phase-7/ci-integrity-summary.md` の総合判定が PASS である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（7-1〜7-4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了し、CI GREEN確認証跡が取得されていること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、`phase-8-refactoring.md` を実行してください。
