# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 11                                     |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

manifest を手動で ManifestLoader に読み込ませ、自動テストでは確認しきれない問題を検出する。UI スクリーンショット中心ではなく、NON_VISUAL task としてコマンド証跡と目視監査ログを残す。

## 実行タスク

- manual manifest loading: workflow-manifest.json を ManifestLoader.loadManifest() で手動読み込みする
- resource path walkthrough: 全 resource descriptor の path を手動で辿り、ファイルの存在と内容を目視確認する
- discovered issue 記録: 自動テストでは拾えない違和感を記録する
- NON_VISUAL evidence 記録: screenshot を必須化せず、実行コマンド、結果、判断理由を `manual-test-result.md` に残す

## 参照資料

| 資料名                    | パス                                                                      | 説明                  |
| ------------------------- | ------------------------------------------------------------------------- | --------------------- |
| phase-1 requirements      | `phase-1-requirements.md`                                                 | AC                    |
| phase-5 implementation    | `phase-5-implementation.md`                                               | 実装結果              |
| phase-9 quality assurance | `phase-9-quality-assurance.md`                                            | 品質確認結果          |
| phase-10 final review     | `phase-10-final-review.md`                                                | gate 判定             |
| workflow-manifest.json    | `.claude/skills/skill-creator/workflow-manifest.json`                     | 手動検証対象          |
| Phase 11 template         | `.claude/skills/task-specification-creator/references/phase-templates.md` | NON_VISUAL 運用の確認 |

## 手動テスト項目

### manifest loading 確認

| 確認項目                                         | 確認方法               |
| ------------------------------------------------ | ---------------------- |
| JSON.parse でエラーなく読み込める                | Node.js REPL で実行    |
| ManifestLoader.loadManifest() がエラーなしで完了 | テストスクリプト実行   |
| 返り値の WorkflowManifest オブジェクトが正常     | console.log で構造確認 |

### resource path walkthrough

| 確認項目                                 | 確認方法                  |
| ---------------------------------------- | ------------------------- |
| 全 resource path のファイルが存在する    | `ls` で目視確認           |
| resource kind がファイルの内容と一致する | ファイルを開いて内容確認  |
| phase と resource の関連が論理的に妥当   | manifest を読んで論理確認 |

### hook 確認

| 確認項目                                    | 確認方法                  |
| ------------------------------------------- | ------------------------- |
| 全 entry hook の command が意味のある文字列 | manifest を読んで確認     |
| 全 exit hook の command が意味のある文字列  | manifest を読んで確認     |
| phase と hook の対応関係が論理的に妥当      | manifest を読んで論理確認 |

### NON_VISUAL evidence 方針

| 項目       | 方針                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| screenshot | 必須ではない。manifest task は NON_VISUAL として扱う                                |
| 代替証跡   | 実行コマンド、標準出力、確認対象 path、判定理由を残す                               |
| PASS 条件  | `manual-test-result.md` が `not_run` ではなく、実測結果または blocker reason を持つ |

## 実行手順

### ステップ1: manifest を手動で読み込む

Node.js REPL またはテストスクリプトで workflow-manifest.json を読み込み、エラーがないことを確認する。

### ステップ2: resource path を手動で辿る

全 resource descriptor の path を `ls` と `cat` で確認し、ファイルの存在と内容を目視確認する。

### ステップ3: discovered issue を記録する

自動テストでは拾えない問題（resource と phase の論理的不整合、hook command の意味的不自然さ等）を記録する。NON_VISUAL task である理由、screen capture を要求しなかった理由、代替証跡も同時に残す。

## 統合テスト連携

| 観点             | 実施内容                      |
| ---------------- | ----------------------------- |
| manual loading   | manifest の手動読み込み確認   |
| path walkthrough | 全 resource path の目視確認   |
| human audit      | 自動テスト外の違和感抽出      |
| non-visual audit | screenshot 非依存の証跡鎖確認 |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                       |
| ---------- | ----------------------------------------------- |
| 人間可読性 | manifest を読んで workflow の流れが理解できるか |
| 導線確認   | resource と phase の関連が自然か                |
| 監査補完   | 自動テストでは検出できない問題がないか          |

## サブタスク管理

1. manifest 手動読み込み
2. resource path walkthrough
3. discovered issue 記録
4. Phase 12 input 整理

## 成果物

| 成果物                | パス                                        | 説明           |
| --------------------- | ------------------------------------------- | -------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目   |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | 手動テスト結果 |

## 完了条件

- [ ] manifest の手動読み込みが成功している
- [ ] 全 resource path の目視確認が完了している
- [ ] discovered issue の有無が記録されている
- [ ] `manual-test-result.md` が `not_run` のまま残っていない
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 9 を参照した
- [ ] Phase 10 を参照した
- [ ] manifest を手動で読み込んだ
- [ ] resource path を手動で辿った

## 次のPhase

Phase 12: ドキュメント更新
