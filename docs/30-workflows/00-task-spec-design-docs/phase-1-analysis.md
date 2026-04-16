# Phase 1: 現状分析（要件定義）

スキル作成フロー連動調査で見つかった 4 件の欠陥を、症状の列挙ではなく責務境界・依存関係・価値/コストで整理する。
`task-specification-creator` の要件レビュー基準と `aiworkflow-requirements` の依存関係整合を前提に、Phase 2 へ渡す論点だけを固定する。

---

## 0. 先に固定する判断

### 真の論点

本件の主問題は、renderer / preload / main / service の接続面が閉じておらず、progress・cancel・structurePlan・TODO が別々の不具合に見えていることではなく、「スキル生成フローの責務境界と接続品質が未完成」であることにある。

### 依存関係・責務境界

| 層        | 期待責務                         | 現状の論点                                                       |
| --------- | -------------------------------- | ---------------------------------------------------------------- |
| renderer  | UI 表示とユーザー意図の発火      | progress 受信と cancel 発火の入口はあるが、Main への実伝達が前提 |
| preload   | `safeOn` / `safeInvoke` の橋渡し | IPC 契約がないと UI 側の意図が届かない                           |
| main      | IPC の受理と送信                 | progress 送出と cancel 受理の接続が欠けている                    |
| service   | create モードの計画生成          | `structurePlan` は返すが、意味づけの精度が不足している           |
| wizard UI | 補助表示                         | 主ツールバッジは現状整合、将来変更時のみ再検討                   |

- 問題1は `renderer → preload → main` の一方向送信経路の欠落が本質。
- 問題2は問題1と同じ IPC 基盤を共有するため、同じ接続面の延長として扱うのが最小コスト。
- 問題3は `service → main` の plan 生成品質の問題で、P1/P2 とは独立。
- 問題4は現状整合だが、将来の参照ロジック変更に追随できるかの問題。

### 価値とコスト

| 問題  | 価値 | コスト | コメント                                                                      |
| ----- | ---- | ------ | ----------------------------------------------------------------------------- |
| 問題1 | 高   | 中     | 進捗の可視化を回復し、以後の cancel 実装の前提を作る                          |
| 問題2 | 高   | 高     | shared channel / preload / main / renderer をまたぐため、最も接続コストが高い |
| 問題3 | 高   | 中〜高 | create モードの核心である `structurePlan` の品質を上げる必要がある            |
| 問題4 | 低   | 低     | 現状は正常で、将来の変更時の取りこぼし防止が主目的                            |

### 改善優先順位

1. 問題1を先に押さえ、進捗の送受信経路を確定する。
2. 問題3を同時並行候補として扱い、create モードの計画品質を回復する。
3. 問題2は問題1と同じ IPC 文脈を共有するため、P1 の設計を踏まえて実施すると重複が少ない。
4. 問題4は低優先度で、他 3 件の整理後にコメント条件を見直す。

### 4条件の初期評価

| 条件   | 初期評価 | 判断                                                                |
| ------ | -------- | ------------------------------------------------------------------- |
| 価値性 | 高       | P1/P2/P3 はユーザー体験と生成品質に直結し、P4 は保守価値中心        |
| 実現性 | 中〜高   | 変更は局所的だが、P2/P3 は共有面の順序管理が必要                    |
| 整合性 | 低〜中   | 現状の接続は層ごとに閉じておらず、意味のズレもある                  |
| 運用性 | 低〜中   | progress/cancel が運用判断材料にならず、TODO の残存も負債化しやすい |

## 1. 適用した思考法

| 系統         | 思考法                                                               | Phase 1 での着眼点                                       |
| ------------ | -------------------------------------------------------------------- | -------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 4件を「症状」ではなく「根因」で切り分ける                |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | 層・責務・依存・順序に分けて漏れを避ける                 |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 個別の不具合を、接続設計の不足という上位問題へ引き上げる |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | 代替案と初見視点で見落としを洗い出す                     |
| システム系   | システム思考、因果関係分析、因果ループ                               | 「欠落→表示不能→判断不能」の循環を確認する               |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | 価値の高い順と共有面の少ない順を両立させる               |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 真因を仮説化し、4件を意味の近い塊にまとめる              |

## 問題1: Streaming進捗の送信経路欠落（useStreamingProgress / skillCreatorAPI）

- 事実: `useStreamingProgress.ts:71-115` は `window.skillCreatorAPI.onProgress` を購読し、`skill-creator-api.ts:673-676` は `safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)` へ橋渡しする。Main 側の `skillCreatorHandlers.ts:692-703` には `sendSkillCreatorProgress` があるが、`createSkill` からの呼び出しがない。
- 根因: `SKILL_CREATOR_PROGRESS` の送出起点が Main に存在せず、renderer の購読が空振りしている。
- 影響: プログレスバーとステップ表示が更新されず、生成中か停止中かを UI で判断できない。
- 依存: 問題2は同じ IPC 基盤を共有するため、P1 で送受信経路を確定すると後続の重複が減る。
- 優先度: High

## 問題2: キャンセル処理の IPC 未接続（useCancelGeneration）

- 事実: `useCancelGeneration.ts:16-29` は `AbortController.abort()` と stage 更新だけを行い、`skillCreatorAPI` に cancel 系メソッドはない。Main 側にも `SKILL_CREATOR_CANCEL` ハンドラーはない。
- 根因: abort の意図が renderer 内に閉じており、Main の実処理へ伝わる契約が未定義。
- 影響: UI だけが `cancelled` になり、バックグラウンド生成は継続する。
- 依存: 問題1と同じ IPC 文脈を共有するため、P1 の接続方針を先に固める方が最小コスト。
- 優先度: High

## 問題3: `structurePlan` の意味設計不足（SkillCreatorService.ts）

- 事実: `SkillCreatorService.ts` の `createSkill` は `112-123` で `structurePlan` を受け取り、`178-183` で `generateSkillMd(skillDir, structurePlan)` に渡す。`runCreateWorkflow` は `613-630` で `StructurePlanJson` を返すが、`purpose` に agent prompt 文を入れ、`features` は空、`agents` も prompt 文の配列になっている。
- 根因: 接続自体は存在するが、`StructurePlanJson` の意味づけが実データと揃っておらず、計画がプロンプトの箱になっている。
- 影響: create モードの核心である「ユーザー要求から構造を起こす」価値が薄まり、SKILL.md の差別化が弱くなる。
- 依存: P1/P2 の IPC 配線とは独立だが、同じ `SkillCreatorService.ts` を扱うため、後続の修正波では書き込み面の競合管理が必要。
- 優先度: High

## 問題4: 主ツールバッジ TODO の残存（ConversationRoundStep.tsx）

- 事実: `ConversationRoundStep.tsx:456-457` の TODO は `resolveExternalIntegration` の主ツール参照ロジック変更後に削除する前提だが、`SkillCreateWizard.tsx:177-183` は現在も `selectedOptions[0]` を主ツールとして参照している。
- 根因: TODO の発火条件はまだ来ておらず、削除条件と現行実装は一致している。
- 影響: 直ちに不具合はないが、将来ロジックが変わったときに取りこぼすと UI だけ古い前提が残る。
- 依存: 独立性は高く、`resolveExternalIntegration` の変更タスクと同じ wave で整理するのが自然。
- 優先度: Low

## 4件のまとめ

| No  | 問題                           | 本質                                                     | 依存関係                        | 価値/コスト | 優先度 |
| --- | ------------------------------ | -------------------------------------------------------- | ------------------------------- | ----------- | ------ |
| 1   | Streaming進捗の送信経路欠落    | renderer / preload / main の progress 経路が閉じていない | P2 と同じ IPC 基盤              | 高 / 中     | High   |
| 2   | キャンセル処理の IPC 未接続    | abort の意図が renderer 内で止まっている                 | P1 と同じ IPC 文脈              | 高 / 高     | High   |
| 3   | `structurePlan` の意味設計不足 | 生成フローは接続済みだが計画の意味が薄い                 | `SkillCreatorService.ts` を共有 | 高 / 中〜高 | High   |
| 4   | 主ツールバッジ TODO の残存     | 現状は整合、将来変更時の追随が論点                       | ほぼ独立                        | 低 / 低     | Low    |
