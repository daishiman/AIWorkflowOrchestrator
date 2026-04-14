# Phase 11 成果物: 手動テスト結果

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 11                                 |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## NON_VISUAL 判定

| 項目                      | 内容                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| NON_VISUAL である理由     | 対象は Node.js CLI スクリプト (`verify-ipc-4layer.cjs`) であり、UI 描画を伴わない |
| primary evidence          | スクリプト直接実行結果 / vitest 実行結果 / YAML 構文検証結果                      |
| screenshot-plan.json      | 生成しない (NON_VISUAL のため不要)                                                |
| screenshots/ ディレクトリ | 作成しない (NON_VISUAL のため不要)                                                |
| placeholder-only 証跡     | PASS 扱いにしない                                                                 |

### 代替 evidence の正当性

本タスクは CI スクリプトの実装であり、ブラウザやデスクトップ上の UI 描画を伴わない。手動テストの証跡は、以下のコマンド実行結果で代替する:

1. `node scripts/verify-ipc-4layer.cjs` の実行結果 (stdout/stderr キャプチャ + exit code)
2. `pnpm vitest run scripts/__tests__/verify-ipc-4layer/` の実行結果
3. `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` による YAML 構文検証
4. `node -e "const m = require('./scripts/verify-ipc-4layer.cjs'); ..."` によるモジュールエクスポート検証

これらは全て再現可能なコマンドであり、実行結果から機能の正常動作を客観的に判定できる。

---

## テストケース結果

### TC-11-01: スクリプト実行テスト (実コードベース)

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| TC-ID        | TC-11-01                             |
| テスト名     | 全チャネル整合確認 (実コードベース)  |
| 検証対象     | FR-5, AC-1, AC-5, AC-6               |
| 実行コマンド | `node scripts/verify-ipc-4layer.cjs` |
| 判定         | **PASS**                             |

**実行結果:**

```
$ node scripts/verify-ipc-4layer.cjs
[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: FAIL (12 missing)
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: FAIL (8 missing)
[Rule-3] renderer で使用されたチャネルが shared/preload に未定義: PASS

--- Summary ---
Total rules: 3
Passed: 1
Failed: 2
```

- exit code: **1** (不整合検出のため正常動作)
- Rule-1: 12件の不整合検出
- Rule-2: 8件の不整合検出
- Rule-3: PASS
- 実行時間: **0.00秒** (time -p の丸め表示。実行自体は即時)

**判定根拠:** スクリプトが正常に実行され、exit code 1 で不整合を正しく検出した。AC-1 (実行可能性) と AC-6 (不整合時の CI 失敗) を充足している。Rule-1/Rule-2 の残件は、別タスクで追跡すべき現在の契約 drift である。

---

### TC-11-02: ユニットテスト全件実行

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| TC-ID        | TC-11-02                                               |
| テスト名     | ユニットテスト全件 PASS 確認                           |
| 検証対象     | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8                     |
| 実行コマンド | `pnpm vitest run scripts/__tests__/verify-ipc-4layer/` |
| 判定         | **PASS**                                               |

**実行結果:**

```
 ✓ scripts/__tests__/verify-ipc-4layer/reporter.test.ts (8 tests) 22ms
 ✓ scripts/__tests__/verify-ipc-4layer/validators.test.ts (19 tests) 21ms
 ✓ scripts/__tests__/verify-ipc-4layer/e2e.test.ts (7 tests) 44ms
 ✓ scripts/__tests__/verify-ipc-4layer/parsers.test.ts (79 tests) 117ms

 Test Files  4 passed (4)
      Tests  113 passed (113)
   Duration  3.48s
```

- テストファイル: **4ファイル全 PASS**
- テスト数: **113件全 GREEN**
- 実行時間: **3.48秒**
- FAIL: **0件**

**判定根拠:** 113件のユニットテストが全て PASS した。テストは Rule-1/Rule-2/Rule-3 の正常系・異常系・エッジケースを網羅しており、AC-2 (shared->preload 検出), AC-3 (preload->main 検出), AC-4 (renderer->shared 検出), AC-5 (全整合時 exit 0), AC-6 (不整合時 exit 1), AC-8 (ユニットテスト全件 PASS) を充足している。

---

### TC-11-03: CI YAML 構文検証

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| TC-ID        | TC-11-03                                                                                     |
| テスト名     | GitHub Actions ワークフロー構文検証                                                          |
| 検証対象     | AC-7                                                                                         |
| 実行コマンド | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('VALID')"` |
| 判定         | **PASS**                                                                                     |

**実行結果:**

```
$ python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('VALID')"
VALID
```

- YAML 構文: **VALID** (パースエラーなし)

**CI ワークフロー定義の確認:**

| 確認項目                       | 確認結果                                                 |
| ------------------------------ | -------------------------------------------------------- |
| verify-ipc-4layer ジョブの存在 | `.github/workflows/ci.yml` L286-302 に定義済み           |
| ジョブ名                       | `IPC 4-Layer Alignment`                                  |
| timeout-minutes                | 5 (設定済み)                                             |
| Node.js バージョン             | 22                                                       |
| 実行コマンド                   | `node scripts/verify-ipc-4layer.cjs`                     |
| build ジョブの needs への追加  | `verify-ipc-4layer` が build の needs 配列に含まれている |

**判定根拠:** YAML 構文が正常であり、verify-ipc-4layer ジョブが正しく定義されている。AC-7 (GitHub Actions 統合) を充足している。

---

### TC-11-04: モジュールエクスポート検証

| 項目         | 内容                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | TC-11-04                                                                                                                                             |
| テスト名     | モジュールエクスポートのアクセス可能性確認                                                                                                           |
| 検証対象     | AC-1, NFR-2                                                                                                                                          |
| 実行コマンド | `node -e "const m = require('./scripts/verify-ipc-4layer.cjs'); const exports = Object.keys(m); console.log('Total exports:', exports.length); ..."` |
| 判定         | **PASS**                                                                                                                                             |

**実行結果:**

```
Total exports: 20
Functions (16): stripComments, flattenSharedGroupMap, parseSharedChannels,
  parseSharedGroupMap, parsePreloadChannels, parseMainHandlers,
  resolveMainChannelRefs, parseRendererSinks, resolvePreloadChannelRefs,
  resolveAllowedChannels, validateRule1, validateRule2, validateRule3,
  formatReport, runValidation, main
Constants (4): REF_IPC_CHANNELS, REF_CHANNELS, REF_PRELOAD, REF_STANDALONE
```

- エクスポート数: **20** (関数16 + 定数4)
- 全エクスポートがエラーなくアクセス可能

**判定根拠:** スクリプトの全パブリック API (16関数 + 4定数) が正常にエクスポートされ、外部からアクセス可能であることを確認した。CommonJS モジュールとして正しく動作しており、AC-1 (実行可能性) と NFR-2 (Node.js 標準のみ) を充足している。

---

## テストケースサマリー

| TC-ID    | テスト名                   | 判定     | evidence                                  |
| -------- | -------------------------- | -------- | ----------------------------------------- |
| TC-11-01 | スクリプト実行テスト       | **PASS** | スクリプト stdout/stderr + exit code 記録 |
| TC-11-02 | ユニットテスト全件実行     | **PASS** | vitest 実行結果 (113件全 GREEN, 3.48秒)   |
| TC-11-03 | CI YAML 構文検証           | **PASS** | python3 yaml.safe_load 結果 + 定義確認    |
| TC-11-04 | モジュールエクスポート検証 | **PASS** | Node.js require 結果 (20エクスポート確認) |

---

## 総合判定

**Phase 11 手動テスト結果: PASS**

- 全4テストケース (TC-11-01 から TC-11-04) が PASS
- NON_VISUAL タスクとして適切な代替 evidence で検証完了
- placeholder-only の証跡は使用していない
- screenshots/ ディレクトリは作成していない (NON_VISUAL)
- screenshot-plan.json は生成していない (NON_VISUAL)

---

## Phase 11 実行記録

### 実行タスク

- タスク1 TC-11-01 スクリプト実行テスト: 完了 (exit code 1、Rule-1: 12件、Rule-2: 8件、Rule-3: PASS)
- タスク2 TC-11-02 ユニットテスト全件実行: 完了 (113件全 GREEN、3.48秒)
- タスク3 TC-11-03 CI YAML 構文検証: 完了 (VALID)
- タスク4 TC-11-04 モジュールエクスポート検証: 完了 (20エクスポート確認)
- タスク5 手動テスト結果記録: 完了 (本ファイル)

### テスト結果サマリー

| TC-ID    | 判定 | evidence                                  |
| -------- | ---- | ----------------------------------------- |
| TC-11-01 | PASS | スクリプト stdout/stderr + exit code 記録 |
| TC-11-02 | PASS | vitest 実行結果 (113件全 GREEN)           |
| TC-11-03 | PASS | python3 yaml.safe_load + 定義確認         |
| TC-11-04 | PASS | Node.js require 結果 (20エクスポート確認) |

### 発見事項

- 良かった点: 実コードベースでの実行が高速で、CI パイプラインへの影響が極めて小さい
- 良かった点: Rule-1/Rule-2 の不整合検出がコードベースの実際のギャップを正しく反映している
- 問題点: Rule-1 の 12 件と Rule-2 の 8 件が残っているため、follow-up が必要
- 改善提案: 残件を unassigned-task として整理し、公開面の責務ごとに分割して追跡する

### 次Phase への引き継ぎ事項

- 全テストケース PASS。Phase 12 (ドキュメント更新) へ進行可能
- スクリプト実行時間 0.00秒は NFR-1 基準 (30秒) を大幅に下回っている
