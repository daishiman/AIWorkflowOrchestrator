# Guided Execution Console 整合マトリクス

## 目的

この文書は、現行実装、未着手 task 群、今回の `Guided Execution Console` 仕様パックの相関関係を整理し、`どこまで信用できるか` と `どこが未接続か` を明確にする。

## 1. 現行実装との比較

| 項目                         | 現状                                                                            | 判定 | 今回の pack との関係                                     |
| ---------------------------- | ------------------------------------------------------------------------------- | ---- | -------------------------------------------------------- |
| terminal 起動 IPC            | `terminal.open` が main/preload に存在                                          | 良好 | 外部 terminal 起動の基盤は既にある                       |
| runtime policy               | `RuntimePolicyResolver` が `integrated_api / terminal_handoff` を分岐           | 良好 | `APIで実行` と `端末で続ける` の二重レーンに直接親和する |
| Skill Creator runtime facade | `RuntimeSkillCreatorFacade` に `plan / execute / improve` と handoff 分岐がある | 良好 | Skill Creator lane の中核は存在する                      |
| handoff UI 部品              | `TerminalHandoffCard` と `ExecutionEnvironment` 系が存在                        | 良好 | raw terminal 案内を再利用できる                          |
| Skill Creator preload API    | `planSkill / executePlan / improveSkillWithFeedback / onProgress` が存在        | 良好 | UI から runtime を呼ぶ準備はある                         |
| Skill Creator wizard         | `SkillCreateWizard` はまだ `createSkill()` 直結                                 | 不足 | `w4` を先に進めると main flow がつながる                 |
| 生成中 UI                    | `GenerateStep` は spinner のみ                                                  | 不足 | `w5a` を先に進めると progress surface が整う             |
| cross-app execution surface  | `ViewType` に `terminal` / `executionConsole` がない                            | 不足 | Task01 を先に進めると入口がそろう                        |
| Chat handoff 導線            | `ChatPanel` は terminal ではなく `agent` へ fallback                            | 不足 | Task01 の修正対象                                        |

## 2. 信用性の判定

| 観点                              | 判定   | 理由                                                                               |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| コンセプトの信用性                | 高     | runtime policy、handoff DTO、preload API、renderer 部品の方向が矛盾していない      |
| 実装基盤の信用性                  | 中     | 基盤はあるが、UI 導線が未接続で end-to-end には至っていない                        |
| 一般ユーザー向け UX の信用性      | 中未満 | `実行コンソール` という surface が未実装で、現状は skill/chat ごとに断片化している |
| Skill Creator end-to-end の信用性 | 低〜中 | facade / preload はあるが wizard 側が直結フローのまま                              |
| governance の信用性               | 中     | pack 側は整理したが、canonical ledger governance task が未着手                     |

## 3. 外部 task 群との相関

### 3-1. Skill Creator wave

| 対象                           | 状態                   | 親和性 | 順番上の扱い | コメント                                                                      |
| ------------------------------ | ---------------------- | ------ | ------------ | ----------------------------------------------------------------------------- |
| `w3b-sc-improve-llm`           | legacy phase-only spec | 中〜高 | follow-up    | create/execute の first ship には必須ではないが、ライフサイクル完結には重要   |
| `w4-sc-ui-runtime-connection`  | legacy phase-only spec | 高     | 先行推奨     | Skill Creator UI が runtime API を呼べないため早めに触る価値が高い            |
| `w5a-sc-streaming-progress-ui` | legacy phase-only spec | 高     | 先行推奨     | Session Dock / progress 表示の語彙を Skill Creator 側へ流すため早めに整えたい |
| `w5b-sc-e2e-terminal-handoff`  | legacy phase-only spec | 高     | 後半確認     | handoff lane を end-to-end で仕上げ確認する役割                               |

### 3-2. LLM provider modernization wave

| 対象              | 状態     | 親和性 | 順番上の扱い       | コメント                                                                                                                            |
| ----------------- | -------- | ------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `TASK-LLM-MOD-02` | 未完了   | 中     | supporting lane    | Anthropic health check の最新化で `APIで実行` の信頼性が上がる                                                                      |
| `TASK-LLM-MOD-03` | 未完了   | 低〜中 | supporting lane    | Google system instruction 正式化。Skill Creator そのものの blocker ではない                                                         |
| `TASK-LLM-MOD-04` | 完了     | 中     | supporting lane    | provider 変更の test 追従。canonical root は `docs/30-workflows/step-03-seq-task-04-test-update/`、follow-up は `UT-LLM-MOD-04-001` |
| `TASK-LLM-MOD-05` | optional | 低     | optional lane      | model description は将来 Runtime Banner や selector 補助に使える                                                                    |
| `TASK-LLM-MOD-06` | 実装済み | 中     | baseline completed | OpenAICompatibleAdapter は provider 拡張の基盤として有効                                                                            |
| `TASK-LLM-MOD-07` | 実装済み | 中     | baseline completed | OpenRouter 統合は provider 選択肢と availability 設計に親和する                                                                     |
| `TASK-LLM-MOD-08` | 実装済み | 高     | baseline completed | `isAvailable` filtering は `unavailable` state 設計と強く整合する                                                                   |

### 3-3. Governance wave

| 対象                                              | 状態                         | 親和性 | 順番上の扱い      | コメント                                                    |
| ------------------------------------------------- | ---------------------------- | ------ | ----------------- | ----------------------------------------------------------- |
| `TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001` | `spec_created` / not_started | 高     | 最後に閉じる task | state 定義、same-wave sync、completed ledger の正本化に必須 |

## 4. legacy pack に対する注意

`w3b` `w4` `w5a` `w5b` は phase-only 構成で、`index.md` / `artifacts.json` を持つ current canonical task root ではない。  
そのため、信用性の評価は `内容は有用だが、task status と厳密な前後関係の正本としては弱い` となる。

今回の pack では、これらを次のように吸収して扱う。

| legacy wave | Guided Execution 側の受け皿                       |
| ----------- | ------------------------------------------------- |
| `w4`        | Task01 + Skill Creator lane の入口設計            |
| `w5a`       | Task02 の session / progress / artifact bridge    |
| `w5b`       | Task03 の handoff / safety と E2E 観点            |
| `w3b`       | Skill Creator 改善ライフサイクルの follow-up lane |

## 5. 改善後の結論

- 今回の pack は、既存実装を否定するのではなく `既にある runtime/handoff 基盤を統合面へ昇格させる` 方向なので親和性は高い
- 最大の問題は `機能不足` ではなく `接続不足` である
- したがって、最初は `Task01 → w4 → w5a → Task02` の順で入口と progress surface を通すのが分かりやすい
- その後に `w5b → Task03` を進めると、handoff と safety まで自然につながる
- `w3b` は主ルート完了後の follow-up として扱う方が、create/execute の目的に対して迷いが少ない
