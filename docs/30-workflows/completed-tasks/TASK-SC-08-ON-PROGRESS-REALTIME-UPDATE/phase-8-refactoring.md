# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 8                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 7                                                                     |
| 後続Phase  | Phase 9                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

振る舞いを維持したまま duplicate（重複）と navigation drift（責務逸脱）を削除し、
`useStreamingProgress.ts` の保守性と拡張性を向上させる。

## 背景

Phase 5 で `PHASE_TO_STAGE` マップをフラット方式で拡張し、Phase 6/7 で品質確認を完了した。
実装後の振り返りとして以下のリファクタリング課題が残存している可能性がある。

1. `PHASE_TO_STAGE` マップ内で update と create で同じ stage が重複定義されていないか
2. モード別 phase メッセージ文字列がハードコードされており、定数化・集約の余地がないか
3. `useStreamingProgress.ts` のマッピングロジックが Hook 内に埋め込まれており、純粋関数として切り出せないか

本 Phase では上記3点を分析し、振る舞いを変えないリファクタリング計画を策定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- 重複削減: `PHASE_TO_STAGE` マップの重複エントリを統合して責務を明確化する
- 命名整合: モード別 phase メッセージ文字列の定数化要否を判断し必要であれば実施する
- 責務分離: マッピングロジックを純粋関数として切り出す必要があるか判定し必要であれば実施する
- 再検証計画: リファクタリング後の回帰確認計画を策定する

## リファクタリング計画

### 対象 1: PHASE_TO_STAGEマップの重複チェック

| 項目   | 内容                                                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                                                                             |
| Before | update モードの `"loading-skill": "planning"` / `"analyzing": "planning"` と create モードの `planning: "planning"` で同じ stage が複数行に定義されている可能性がある |
| After  | 同一 stage へのマッピングが意味論的に重複していないか確認し、重複があればコメントで意図を明示するか統合する                                                           |
| 理由   | マップ内の重複エントリは誤った印象を与え、将来の変更時に一方のみ更新される migration drift を引き起こす                                                               |

### 対象 2: ハードコードされたモード別phaseメッセージ文字列の定数化要否

| 項目   | 内容                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                                |
| Before | `"loading-skill"` `"analyzing"` `"engine-selection"` `"improving"` がマップのキーとしてリテラル文字列で直書きされている  |
| After  | 同じ文字列が他のファイル（Main/Preload/テスト）にも登場する場合は共有定数に抽出する。単一箇所のみであれば現状維持とする  |
| 理由   | リテラル重複が発生している場合、文字列変更時に一方のみ変更されるタイポリスクがある。単一箇所なら抽出コストが便益を上回る |

### 対象 3: useStreamingProgressの責務分離（マッピングロジックの切り出し要否）

| 項目   | 内容                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                                                   |
| Before | `PHASE_TO_STAGE` マップへのルックアップとフォールバックロジックが Hook 本体（または Hook が呼び出す関数）に埋め込まれている |
| After  | `resolvePhaseToStage(phase: string): StreamingGenerationStage` として純粋関数に切り出す（テスト容易性の向上）               |
| 理由   | 純粋関数に切り出すことでマッピングロジック単体のユニットテストが簡潔になる。Hook から副作用のない変換ロジックを分離できる   |

## 変更内容テーブル

| 対象                          | Before                                                  | After                                                | 理由                                           |
| ----------------------------- | ------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| PHASE_TO_STAGE重複エントリ    | 意図不明な重複定義が存在する可能性がある                | 重複を排除またはコメントで意図を明示する             | migration drift 防止                           |
| モード別phaseメッセージ文字列 | リテラル直書きが複数箇所で重複している場合がある        | 重複箇所を共有定数に抽出する（単一箇所なら現状維持） | タイポリスク低減・変更箇所の一元化             |
| マッピングロジック            | Hook内部にルックアップ+フォールバックが埋め込まれている | `resolvePhaseToStage()` 純粋関数として切り出す       | テスト容易性向上・副作用なし変換ロジックの分離 |

## 責務境界マップ

```
[Hook 層: useStreamingProgress.ts]
  責務: Streaming状態管理・stageの変換と更新
  - resolvePhaseToStage(phase) を呼び出してstageを取得する
  - Store更新（dispatch）を行う
  - isGeneratingガードを管理する

[純粋関数: resolvePhaseToStage]
  責務: phaseをstageに変換する（副作用なし）
  - PHASE_TO_STAGEマップのルックアップ
  - 未知phaseの"planning"フォールバック
  - 外部依存なし（テスト容易）

[Slice 層: generationProgressSlice.ts]
  責務: generationProgress状態の保持と更新
  - setGenerationProgress(data)リデューサー
  - phase/percentage/messageのState管理

[Component 層: SkillLifecyclePanel.tsx または useSkillLLMGeneration.ts]
  責務: onProgressリスナーのライフサイクル管理
  - isGeneratingガードによるリスナー登録/解除
  - dispatch(setGenerationProgress(data))呼び出し

[Component 層: GenerateStep.tsx]
  責務: generationProgress.messageの動的表示
  - aria-live="polite"によるアクセシブルな進捗表示
  - nullish coalescing fallback（"生成中..."）
```

## 再テスト計画

| ステップ | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 1        | リファクタリング変更後に `pnpm --filter @repo/desktop test -- --run` を実行する |
| 2        | TC-01〜TC-11 が全件 PASS することを確認する                                     |
| 3        | `resolvePhaseToStage()` 切り出し後は同関数の単体テストが通ることを確認する      |
| 4        | `pnpm --filter @repo/desktop typecheck` が PASS することを確認する              |
| 5        | カバレッジが Phase 7 の目標値（80%以上）を維持していることを確認する            |

## 実行手順

1. Phase 7 の成果物（`outputs/phase-7/`）を確認する。
2. SubAgent-A/B/C を並列実行し、各対象のリファクタリング案を策定する。
3. SubAgent-D が統合判定し、振る舞い変更がないことを確認する。
4. リファクタリング計画・再テスト計画・責務境界マップを `outputs/phase-8/` に保存する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- リファクタリング前後で onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）の動作が変わらないことを確認する。
- phase変換・Store更新・UI表示の3層で振る舞いが維持されていることを確認する。
- 統合ログは `outputs/phase-8/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| 矛盾     | リファクタリング計画が AC-1〜AC-6 の受け入れ基準と矛盾していないか確認する   |
| 漏れ     | 3つのリファクタリング対象が全て分析されているか確認する                      |
| 整合性   | Hook/純粋関数/Slice/Component の責務境界が明確に分離されているか確認する     |
| 依存関係 | Phase 7 のカバレッジ計測結果がリファクタリング計画の根拠として使われているか |

## 成果物

| 成果物         | パス                                             | 説明                             |
| -------------- | ------------------------------------------------ | -------------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 3対象の変更内容テーブル          |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の回帰確認計画       |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Hook/Slice/Componentの責務分離図 |

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物 |
| IPC契約設計            | `outputs/phase-2/ipc-contract-design.md`          | Phase 2 成果物 |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物 |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`             | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業（3対象のリファクタリング分析）
3. SubAgent-D の統合判定（振る舞い変更なし確認）
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

Phase 9: 品質保証
