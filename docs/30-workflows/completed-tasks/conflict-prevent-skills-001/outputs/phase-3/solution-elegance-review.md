# Phase 3 Output: Solution Elegance Review

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 3                         |
| 作成日   | 2026-04-18                |

## 概要

Phase 2 設計を 30 種思考法で多角的に評価し、過剰設計・前提誤認・依存漏れを検出する。  
2 つの監査成果物（task-specification-creator compliance audit、aiworkflow-requirements extraction audit）の結論を統合し、ゲート判定を行う。

---

## エレガント解の定義

最小の複雑性で conflict source を分類し、各分類に 1 つの運用原則だけを与えること。

## 採用した設計

| conflict class    | 採用原則                                              |
| ----------------- | ----------------------------------------------------- |
| generated index   | custom `keep-ours` + deterministic regenerate         |
| mirror tree       | canonical `.claude` / mirror `.agents` + parity check |
| append-only log   | `merge=union` 候補 + archive                          |
| volatile metadata | schema 不変、短期は merge policy のみ                 |

## 捨てた案

| 案                                       | 却下理由                            |
| ---------------------------------------- | ----------------------------------- |
| `topic-map.md` の行番号削除              | discoverability 契約を壊す          |
| `EVALS.json` schema 変更を同 wave で実施 | consumer 影響が未監査               |
| `all union` / `all ours`                 | file 性質の差を潰して副作用が増える |

---

## 30 種思考法レビュー

### 論理分析系

| 思考法         | 評価                                                            | 結論                                                                                                                  |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 批判的思考     | `merge=ours` が built-in であるという前提誤認を排除できているか | OK。AC-2 で custom driver bootstrap 必須を明文化し、`.gitattributes` 設計方針に反映した                               |
| 演繹思考       | Git 仕様から custom driver 必須条件を正しく導けているか         | OK。`git help attributes` の仕様に基づき、`merge=ours` は `merge.ours.driver true` がなければ機能しないことを確認済み |
| アブダクション | `spec_created` 文書が「実装済み」口調になった原因を説明できるか | OK。仕様書テンプレートの wording が曖昧だったため。Phase 骨格補完で是正済み                                           |

### 構造分解系

| 思考法     | 評価                                                    | 結論                                                                                                      |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 要素分解   | G1〜G4 の4分類が MECE になっているか                    | OK。generated / mirror / log / metadata で重複なく網羅。`SKILL-changelog.md` は G3 に正しく分類されている |
| カテゴリ化 | `all-union` / `all-ours` という単純化を避けられているか | OK。`union` は G3（append-only log）のみに限定し、JSON や mirror への乱用を排除した                       |
| 階層化     | Lane A → Lane C の依存順序が明確か                      | OK。Lane A（Git設定）と Lane B（Generator）が完了してから Lane C（運用・統合）へ進む順序を明示した        |

### メタ・抽象系

| 思考法         | 評価                                                                                    | 結論                                                                                           |
| -------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| メタ認知       | 「競合防止」と「仕様汚染防止」を分離できているか                                        | OK。`.gitattributes` 設定は競合防止、Phase 骨格補完と wording 統一は仕様汚染防止として分離した |
| 抽象化         | 真因が「共有状態の混在」であることを設計に反映できているか                              | OK。G1〜G4 の分類と category 別 policy がこの認識に基づく                                      |
| フレームシフト | 「競合を減らす」だけでなく「regenerate で正しい状態に戻す」という視点を取り込めているか | OK。post-merge hook と Phase 12 close-out の2導線を設計した                                    |

### 発想・拡張系

| 思考法     | 評価                                                     | 結論                                                                                                                                       |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 水平思考   | `all-union` がなぜ危険かを説明できるか                   | OK。JSON に `union` を適用すると構造が破壊される。G1 generated index に `union` を適用すると regenerate 後の内容変化が残差として蓄積される |
| 逆説思考   | 最も単純な設計が最も drift を防ぐか                      | OK。category 別設計（4分類）は `all-union` / `all-ours` より記述量は増えるが、誤適用リスクが減り運用再現性が高い                           |
| アナロジー | 他プロジェクトの merge policy 設計から学べることはあるか | 参考: generated file に `merge=ours` を標準適用し regenerate で補完するパターンは広く採用されている                                        |

### システム系

| 思考法               | 評価                                                          | 結論                                                                                                        |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| システム思考         | Phase 5 の設定変更が Phase 9 / 12 へどう波及するか            | OK。validator matrix（Phase 9）と close-out 手順（Phase 12）に Phase 5 の成果物を前提として明記した         |
| 因果ループ           | Phase 12 sync を怠ると次 wave で同じ drift が再生産されないか | OK。close-out ステップ 2（parity チェック）と ステップ 3（artifacts sync）が drift 防止の閉ループを形成する |
| フィードバックループ | post-merge hook が失敗した場合の代替経路があるか              | OK。Phase 12 close-out 手順（手動）が自動 hook の fallback として機能する                                   |

### 戦略・価値系

| 思考法           | 評価                                                                                   | 結論                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 戦略的思考       | 即効性の高い対策を先に、consumer 監査必須変更を後ろに置けているか                      | OK。G1/G2 の `.gitattributes` 修正と G3 の `union` 設定は即効性が高い。EVALS schema 変更は follow-up に分離した                                      |
| 優先順位思考     | EVALS を本 wave から外すことで即効性が上がるか                                         | OK。EVALS の schema 変更は consumer 棚卸しが必要で高リスク。本 wave を `merge=ours` 設定のみに限定することで、他の対策（G1/G2/G3）の実装速度が上がる |
| トレードオフ思考 | category 別設計の複雑性と、`all-union` / `all-ours` の単純さのトレードオフを評価したか | OK。category 別設計は `.gitattributes` の行数が増えるが、誤適用による JSON 破壊や regenerate 漏れのリスクを排除できる。複雑性は許容範囲内である      |

### 問題解決系

| 思考法            | 評価                                                              | 結論                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| why 思考（5 Why） | 真因は「共有状態の混在」であることを確認できているか              | OK。症状: コンフリクト発生 → 原因: 同じ policy で異なる性質のファイルを扱っている → 真因: generated / mirror / log / metadata の性質差を無視した設計 |
| KJ 法             | 指摘を `骨格`、`Git仕様`、`scope`、`close-out` に束ねられているか | OK。compliance audit と extraction audit の指摘を上記4束に分類し、是正内容を対応させた                                                               |
| 仮説思考          | EVALS 変更が必要という仮説を、事実として扱っていないか            | OK。EVALS schema 変更は「可能性がある改善」として follow-up に分離し、本 wave の設計に混入させていない                                               |

---

## 監査成果物の統合

### task-specification-creator compliance audit からの結論

- Phase 骨格の必須セクション欠落は全 Phase で是正済み
- `merge=ours` の built-in 誤記を排除し、custom driver 登録前提を明記した
- `spec_created` workflow に「実装済み」口調を混入させていない
- artifacts parity（root / outputs の 2 ファイル同期）を Phase 12 close-out 手順に含めた

### aiworkflow-requirements extraction audit からの結論

- canonical（`.claude/skills/`）と mirror（`.agents/skills/`）の責務を明確に分離した
- generated index には regenerate 導線（post-merge hook + Phase 12 close-out）を設計した
- `topic-map.md` は日付ヘッダーのみ除去し、行番号索引契約（discoverability）は維持した
- EVALS の schema は本 wave で変更しないことを AC-6 で確定した

---

## ゲート判定

### 判定結果: PASS

| 柱                       | 状態     | 根拠                                                                                            |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| custom driver bootstrap  | 設計済み | Lane A で `session-init.sh` への追記と確認コマンドを定義                                        |
| deterministic regenerate | 設計済み | Lane B で `generate-index.js` 日付除去を定義。post-merge hook と Phase 12 close-out の2導線あり |
| Phase 12 close-out 同期  | 設計済み | `validation-and-regenerate-plan.md` に 4 ステップの close-out 手順を明記                        |

3 本柱（custom driver + regenerate + close-out）が揃っているため PASS と判定する。

### MINOR / MAJOR 事項

| 区分  | 内容                                                                                         | 対応                                               |
| ----- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| MINOR | `.gitattributes` の G2 パターン（`.agents/skills/**`）の glob が既存エントリと重複する可能性 | Phase 5 実装時に既存エントリとの重複確認を実施する |
| なし  | MAJOR 事項なし                                                                               | Phase 2 への差し戻しは不要                         |

---

## 主要な設計結論

### 結論 1: category 別設計が all-union / all-ours より簡潔

`all-union`（全ファイルに union）は JSON ファイルを破壊するリスクがある。  
`all-ours`（全ファイルに ours）は append-only log でも現ブランチを優先するため、他ブランチの追記が失われる。  
G1/G2/G4 を `ours`、G3 のみを `union` とする category 別設計が、最少の設定変更で最大の安全性を実現する。

### 結論 2: EVALS を本 wave から外すことで即効性が上がる

EVALS の schema 変更は consumer 棚卸しが必要で、着手から完了まで時間がかかる。  
本 wave を `merge=ours` 設定のみに絞ることで、G1/G2/G3 の対策（即効性が高い部分）を先行して展開できる。  
EVALS の schema 設計は consumer が確定した後の follow-up タスクで実施するのが最小コスト経路である。

---

## Phase 4 着手条件

以下の条件がすべて満たされた時点で Phase 4（テスト作成）へ進む。

| 条件                                                                     | 確認方法             |
| ------------------------------------------------------------------------ | -------------------- |
| Phase 1〜3 の成果物が `outputs/` 以下に揃っている                        | ファイル存在確認     |
| AC-1〜AC-6 が `requirements-definition.md` に記載されている              | ドキュメントレビュー |
| validator matrix が `validation-and-regenerate-plan.md` に記載されている | ドキュメントレビュー |
| ゲート判定が PASS である                                                 | 本ドキュメント参照   |
| MAJOR 事項がゼロである                                                   | 本ドキュメント参照   |
