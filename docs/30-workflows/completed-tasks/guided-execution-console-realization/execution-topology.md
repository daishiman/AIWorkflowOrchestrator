# Guided Execution Console 実行トポロジ

## 目的

この文書は、`親ディレクトリ直下の Phase`、`tasks/ 配下の責務 task`、`他 workflow の未着手 task` がそれぞれどういう立ち位置にあるかを整理し、`どの順番で読めばよいか` と `どの順番で進めればよいか` を分離して説明する。
依存関係を厳密に管理すること自体が目的ではなく、指定順に進めて最終成果物へ到達しやすくすることを優先する。

## 1. 立ち位置

| 種別                   | 例                                                                       | 役割                                            | どう扱うか                                    |
| ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------- |
| 親Phase                | `phase-1-requirements.md` 〜 `phase-13-pr-creation.md`                   | 親パック全体の gate、実行順、完了定義を固定する | pack governance として読む                    |
| 子task root            | `tasks/step-01...` 〜 `tasks/step-03...`                                 | 実装責務ごとの standalone task                  | 実装単位として扱う                            |
| external task root     | `llm-provider-model-modernization/tasks/...`、`ai-runtime.../step-06...` | 他 workflow の参照・補完・仕上げ用 task         | 必要なときに順番へ差し込む                    |
| legacy phase-only pack | `skill-creator-llm-integration/w3b` 〜 `w5b`                             | 旧 wave の設計メモ群                            | 参照資料として扱い、即 task root とみなさない |

## 2. なぜ親Phaseがディレクトリ外にあるのか

親Phaseは `Task01-03 の上位設計` を閉じるためにある。  
Task01-03 に入る前に、親パック自身が次のことを定義しなければならない。

- 何を `実行コンソール` の正本とするか
- task をどう分けるか
- どの順番で進めるか
- test / QA / documentation をどこで閉じるか
- `spec_created` と `implementation_ready` をどう区別するか

つまり、親Phaseは `Task の外にある余計な作業` ではなく、`Task がぶれないための前提契約` である。

## 3. 理解するときの読む順番

1. [00-ai-read-order.md](./00-ai-read-order.md)
2. [index.md](./index.md)
3. [execution-topology.md](./execution-topology.md)
4. 必要に応じて [system-alignment-matrix.md](./system-alignment-matrix.md)
5. 必要に応じて [ui-ux-realization.md](./ui-ux-realization.md) / [design-audit-matrix.md](./design-audit-matrix.md)
6. Task01-03 の `index.md`
7. 実際に着手する task の Phase 1-3
8. pack governance が必要なら root の Phase 1-3

この順番にすると、`親の方針` → `必要なら周辺task` → `各責務 task` の順で理解できる。

## 4. 実装するときの順番

### 4-1. 最短の実装主軸

| Stage | 実行順 | 対象                                       | 理由                                                                               |
| ----- | ------ | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| A     | 1      | Task01: guided-execution-shell-foundation  | route / label / shared launcher を先に閉じないと他 lane の UI 置き場が不安定になる |
| B     | 2      | Task02: session-dock-artifact-bridge       | 実行中・実行後の見え方を task 単位で固定する                                       |
| C     | 3      | Task03: advanced-console-safety-governance | advanced console と safety は shell と session が見えてから固定する                |

### 4-2. Skill Creator lane を含める場合の推奨順

| Stage | 実行順 | 対象                                       | この順で触る理由                                                  |
| ----- | ------ | ------------------------------------------ | ----------------------------------------------------------------- |
| S1    | 1      | `TASK-SC-06-UI-RUNTIME-CONNECTION` (`w4`)  | Skill Creator UI と runtime API を先に接続すると main flow が通る |
| S2    | 2      | `TASK-SC-07-STREAMING-PROGRESS-UI` (`w5a`) | 進捗・段階表示の surface を与えて体験をつなぐ                     |
| S3    | 3      | Task02                                     | Session Dock / Artifact Summary と progress 表示を合流させる      |
| S4    | 4      | `TASK-SC-08-E2E-TERMINAL-HANDOFF` (`w5b`)  | handoff lane の end-to-end 仕上げ確認を行う                       |
| S5    | 5      | Task03                                     | safety / approval / disclosure を cross-app で統合する            |
| S6    | 6      | `TASK-SC-05-IMPROVE-LLM` (`w3b`)           | create / execute の主ルート完了後に improve lane を補強する       |

### 4-3. provider reliability を気にする場合の順番

| 優先度   | 対象                                                    | 位置づけ                                           |
| -------- | ------------------------------------------------------- | -------------------------------------------------- |
| 高       | `TASK-LLM-MOD-02`, `TASK-LLM-MOD-03`, `TASK-LLM-MOD-04` | `APIで実行` レーンの信頼性を上げる supporting lane |
| 中       | `TASK-LLM-MOD-05`                                       | モデル説明や schema 整合の optional lane           |
| 完了済み | `TASK-LLM-MOD-06`, `TASK-LLM-MOD-07`, `TASK-LLM-MOD-08` | 既に今回の pack と親和する基盤が存在する           |

### 4-4. governance を閉じる最後の順番

| 実行順 | 対象                                              | 理由                                                                                     |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 最後   | `TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001` | `spec_created` / `implementation_ready` / `completed` の ledger を最後に正本同期するため |

## 5. 今回の pack と legacy pack の違い

`skill-creator-llm-integration/w3b` 〜 `w5b` は `phase-01` 形式の legacy wave であり、`index.md` と `artifacts.json` を持つ current task root ではない。  
そのため、今すぐの実装順を決めるときは次の扱いにする。

- 内容は参照する
- ただし status や厳密な前後関係の正本としては扱わない
- current pack 側で `どの task に吸収するか` を明示してから使う

## 6. この pack の現在の結論

- 親Phaseは `Task01-03 の前提契約` であり、余分ではない
- 実装主軸は `Task01 → Task02 → Task03`
- Skill Creator を含めて end-to-end にするなら `w4` と `w5a` を先に触ると流れが通りやすい
- Skill Creator 改善系の `w3b` は first route の前提ではなく follow-up lane として扱うと分かりやすい
- provider modernization は supporting lane であり、`APIで実行` の信用性を上げる
- ledger / canonical governance は最後に閉じる
