# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 3                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 2                                                                     |
| 後続Phase  | Phase 4                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

Phase 2 で策定した設計の矛盾・漏れ・整合・依存をゲートで判定し、
Phase 4（テスト作成）への移行可否を決定する設計レビューゲートとして機能する。

## 背景

`useStreamingProgress.ts` のphase→stageマッピング拡張と `onProgress` IPC接続の設計が
Phase 2 で完成した。本 Phase ではその設計が AC-1〜AC-6 を満たし、依存タスクとの整合が
取れていることをレビューで確認する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- 矛盾レビュー: 設計内の矛盾（phase名・stage型・IPC契約の不一致）を検査する
- 漏れレビュー: AC-1〜AC-6 から設計への未反映項目を検査する
- ゲート判定: Go/No-Goと是正タスクを判定する

## レビュー観点（4条件）

### 1. 価値性（ユーザー価値への寄与）

**評価観点**: 本設計が実装された場合にユーザーへの価値が向上するか。

| チェック項目                                     | 評価 | 根拠                                                         |
| ------------------------------------------------ | ---- | ------------------------------------------------------------ |
| onProgress接続によりリアルタイム進捗が表示される | OK   | generationProgress.messageの動的表示で即時フィードバック実現 |
| mode-specific phaseが正しいstageに反映される     | OK   | update/collaborativeの各phaseに対応するstage割当済み         |
| 「planning」固まり問題が解消される               | OK   | フラットマップ拡張によりmode-specific phaseが識別可能        |
| create以外のモードでUX退行が発生しない           | OK   | 既存createマッピングは変更せず拡張のみを行う設計             |

**価値性判定**: PASS

### 2. 実現性（技術的実現可能性）

**評価観点**: 設計が既存技術スタック・制約の中で実現可能か。

| チェック項目                              | 評価 | 根拠                                               |
| ----------------------------------------- | ---- | -------------------------------------------------- |
| safeOnパターンが既存Preloadに存在する     | OK   | skill-creator-api.tsで既にsafeOnパターンを使用済み |
| SKILL_CREATOR_PROGRESSチャンネルが既設    | OK   | TASK-SW-STREAM-002で配線済み                       |
| useEffect cleanupでリスナー解除が実装可能 | OK   | Reactの標準パターンで実現可能                      |
| フラットマップ方式でphase名衝突なし       | OK   | update/collaborativeのphase名は日本語で一意        |
| 既存StreamingGenerationStage型で表現可能  | OK   | 新規stage追加不要、既存型へのマッピングで充足      |
| pnpm typecheckが通る設計                  | OK   | 型拡張は最小限（マッピングテーブル追加のみ）       |

**実現性判定**: PASS

### 3. 整合性（設計内・依存タスクとの整合）

**評価観点**: 設計の各要素が矛盾なく整合しているか。

| チェック項目                                       | 評価 | 根拠                                                             |
| -------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| Main側phase名とRenderer側マッピングが一致          | OK   | TASK-SW-STREAM-FUP-03で定義されたphase名を参照してマッピング設計 |
| SkillCreatorProgress型とonProgress引数型が一致     | OK   | phase/percentage/messageの3フィールド構成で整合                  |
| setGenerationProgressの引数形式が一致              | OK   | generationProgressSliceの型と整合確認済み                        |
| isGeneratingガードとonProgressライフサイクルが協調 | OK   | isGenerating=trueの間のみリスナー登録し終了時に解除する設計      |
| AC-1〜AC-6が設計に全て反映されている               | OK   | 下記「前Phase成果物チェックリスト」で確認                        |

**整合性判定**: PASS

### 4. 運用性（保守・拡張・テスト容易性）

**評価観点**: 実装後の保守・拡張・テストが容易か。

| チェック項目                                              | 評価 | 根拠                                                                                |
| --------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| フラットマップ方式で新規modeのphase追加が容易             | OK   | マッピングテーブルに1行追加するだけで対応可能                                       |
| ユニットテストでマッピング網羅的に検証可能                | OK   | テスト戦略でモード別テスト方針を定義済み                                            |
| リスナー二重登録防止が設計レベルで保証されている          | OK   | useEffect依存配列とcleanupパターンで防止                                            |
| orchestrate/improve-prompt の current flow を反映している | OK   | `engine-selection` / `improving` を既存stageへ写像し、将来 wording へ逃がしていない |
| aria-live属性でアクセシビリティが維持される               | OK   | `aria-live="polite"` の動的表示パターンを設計に明記                                 |

**運用性判定**: PASS

## 各AC設計反映確認

| AC番号 | 受け入れ基準                                                            | 設計反映箇所                                          | 充足 |
| ------ | ----------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| AC-1   | `executePlan`実行中に`onProgress`コールバックが呼ばれる                 | SkillLifecyclePanel.tsxのuseEffect onProgress接続設計 | OK   |
| AC-2   | `generationProgress`がリアルタイム更新される                            | dispatch(setGenerationProgress(data))接続設計         | OK   |
| AC-3   | UIのプログレステキストが動的に変化する（静的テキストでない）            | GenerateStep.txsのaria-live動的表示設計               | OK   |
| AC-4   | mode-specific phaseが`planning`に吸収されず対応するstage/表示に反映     | PHASE_TO_STAGEフラットマップ拡張設計                  | OK   |
| AC-5   | collaborative/orchestrate/update/improve-promptでcreate前提に退行しない | 既存createマッピング非破壊拡張・モード別テスト設計    | OK   |
| AC-6   | `pnpm typecheck`（desktop）がPASS                                       | 最小型変更（マッピングテーブル追加のみ）設計          | OK   |

## ゲート判定

### 判定基準

| 条件   | 基準                                 |
| ------ | ------------------------------------ |
| 価値性 | PASS: ユーザー価値が向上すること     |
| 実現性 | PASS: 技術的制約内で実現可能なこと   |
| 整合性 | PASS: 矛盾・漏れ・不整合がないこと   |
| 運用性 | PASS: 保守・拡張・テストが容易なこと |
| AC充足 | PASS: AC-1〜AC-6が全て設計に反映済み |

### 判定結果

**ゲート判定: PASS**

全4条件（価値性・実現性・整合性・運用性）および AC-1〜AC-6 の設計反映が確認できた。
Phase 4（テスト作成）への移行を承認する。

### 是正タスク

なし（全条件クリア）

ただし以下を Phase 4 以降の実装時の注意事項として記録する：

- `engine-selection` / `loading-skill` / `analyzing` / `improving` の mapping が実装値と一致することを characterization test で固定する
- isGenerating ガードと onProgress のライフサイクル競合は実装時に再確認すること

## 前Phase成果物チェックリスト

### Phase 1 成果物

- [ ] `outputs/phase-1/requirements-definition.md` — 機能要件と非機能要件
- [ ] `outputs/phase-1/acceptance-criteria.md` — AC-1〜AC-6
- [ ] `outputs/phase-1/aiworkflow-requirements-extraction.md` — 仕様抽出結果
- [ ] `outputs/phase-1/branch-diff-coverage.md` — 変更対象ファイル反映確認
- [ ] `outputs/phase-1/implementation-spec-traceability-matrix.md` — 要件と仕様の対応表

### Phase 2 成果物

- [ ] `outputs/phase-2/architecture-design.md` — 層別責務設計
- [ ] `outputs/phase-2/ipc-contract-design.md` — onProgress I/O契約
- [ ] `outputs/phase-2/test-strategy.md` — モード別マッピングテスト戦略
- [ ] `outputs/phase-2/dependency-consistency-matrix.md` — 依存タスク整合確認表

## 後続Phase移行条件

Phase 4（テスト作成）への移行条件:

1. **ゲート判定がPASS** — 本Phaseで確認済み
2. **Phase 1/2の全成果物が生成済み** — Phase 1/2実行時に確認
3. **AC-1〜AC-6が全てテスト可能な形式で定義されている** — Phase 2のテスト戦略で確認済み
4. **依存タスク（TASK-SW-STREAM-FUP-03, TASK-SW-STREAM-002）が完了済み** — 実装開始前に最終確認

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`                     | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |

## 実行手順

1. 入力成果物（Phase 1/2の成果物）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 4条件（価値性・実現性・整合性・運用性）を評価する。
4. ゲート判定を実施し成果物を outputs/phase-3/ に保存する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）の設計整合を確認する。
- phase変換・Store更新・UI表示の3層設計が矛盾なく接続されていることを確認する。
- 統合ログは `outputs/phase-3/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                               |
| -------- | ---------------------------------------------------------------------- |
| 矛盾     | phase名・stage型・IPC契約・Store型に矛盾がないか確認する               |
| 漏れ     | AC-1〜AC-6が設計に全て反映されているか確認する                         |
| 整合性   | Main側phase名とRenderer側マッピング・Preload型が一致しているか確認する |
| 依存関係 | TASK-SW-STREAM-FUP-03/002/TASK-SC-06との入出力が整合しているか確認する |

## 成果物

| 成果物           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー記録  |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/FAIL判定 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 4: テスト作成
