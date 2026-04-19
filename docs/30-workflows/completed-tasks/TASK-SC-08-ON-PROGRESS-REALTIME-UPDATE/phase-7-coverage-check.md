# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 7                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 6                                                                     |
| 後続Phase  | Phase 8                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

concern・dependency edge のカバレッジを可視化し、AC-1〜AC-6 のテストカバレッジ網羅率を定量的に確認する。
不足箇所を特定して補完計画を固定し、Phase 8（リファクタリング）への移行判断を行う。

## 背景

Phase 4〜6 でユニット・コンポーネント・回帰テストを実装した。
しかし `useStreamingProgress.ts` の分岐（フォールバック処理・全モードマッピング）や、
`onProgress` 接続部（SkillLifecyclePanel または useSkillLLMGeneration）の
アンマウント/クリーンアップパスが十分にカバーされているかが定量的に確認できていない。
本 Phase では `--coverage` オプションでカバレッジレポートを生成し、目標値との差分を分析する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- カバレッジ計測: `--coverage` オプションで行・分岐・関数の計測値を取得する
- 不足分析: 目標カバレッジ率に未達の箇所を特定し根因と補完策を記録する
- 受け入れ照合: AC-1〜AC-6 のトレーサビリティ網羅率を計測する

## カバレッジ計画

| 対象ファイル                                                | 目標カバレッジ率             | 計測観点                                       |
| ----------------------------------------------------------- | ---------------------------- | ---------------------------------------------- |
| `useStreamingProgress.ts`                                   | 80% 以上                     | PHASE_TO_STAGEの全エントリ・フォールバック分岐 |
| `SkillLifecyclePanel.tsx` または `useSkillLLMGeneration.ts` | 80% 以上（onProgress接続部） | useEffect登録・cleanup・isGeneratingガード分岐 |
| `generationProgressSlice.ts`                                | 80% 以上                     | setGenerationProgressリデューサー分岐          |
| `GenerateStep.tsx`                                          | 80% 以上                     | generationProgress.message動的表示分岐         |

### 計測観点の詳細

| ファイル                     | 計測対象分岐                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `useStreamingProgress.ts`    | createモード5段階 / updateモード3段階 / collaborativeモード1段階 / 未知phaseフォールバック  |
| onProgress接続先ファイル     | isGenerating=true時のリスナー登録 / isGenerating=false時のcleanup / アンマウント時のcleanup |
| `generationProgressSlice.ts` | phase/percentage/messageの各フィールド更新 / 初期値                                         |
| `GenerateStep.tsx`           | generationProgress.messageが存在する場合 / null/undefinedの場合のfallback                   |

## 未到達分析の方針

| ステップ | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 1        | カバレッジレポートで行・分岐カバレッジが80%未満のファイルを特定する      |
| 2        | 未到達行・分岐の根因（テスト設計漏れ・実装不到達・モック不足）を分類する |
| 3        | 補完策（テスト追加・モック改善・未到達コード削除）を記録する             |
| 4        | Phase 8 への持ち越しか Phase 7 内での補完かを判定する                    |

## トレーサビリティ網羅率（AC-1〜AC-6）

| AC番号 | 受け入れ基準                                                            | 対応テストケース    | 充足確認      |
| ------ | ----------------------------------------------------------------------- | ------------------- | ------------- |
| AC-1   | `executePlan`実行中に`onProgress`コールバックが呼ばれる                 | TC-01, TC-07, TC-08 | Phase 7で確認 |
| AC-2   | `generationProgress`がリアルタイム更新される                            | TC-02, TC-10        | Phase 7で確認 |
| AC-3   | UIのプログレステキストが動的に変化する（静的テキストでない）            | TC-03               | Phase 7で確認 |
| AC-4   | mode-specific phaseが`planning`に吸収されず対応するstage/表示に反映     | TC-04, TC-05, TC-09 | Phase 7で確認 |
| AC-5   | collaborative/orchestrate/update/improve-promptでcreate前提に退行しない | TC-06, TC-09, TC-11 | Phase 7で確認 |
| AC-6   | `pnpm typecheck`（desktop）がPASS                                       | 型チェックコマンド  | Phase 7で確認 |

## 実行コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --run --coverage

# 特定ファイルのカバレッジを確認する
pnpm --filter @repo/desktop test -- --run --coverage \
  src/renderer/hooks/__tests__/useStreamingProgress.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck
```

## 実行手順

1. Phase 6 の成果物（`outputs/phase-6/`）を確認する。
2. SubAgent-A/B/C を並列実行し、各担当ファイルのカバレッジを計測する。
3. SubAgent-D が統合判定し、AC-1〜AC-6 の網羅率を算出する。
4. 不足分析結果と補完策を成果物として `outputs/phase-7/` に保存する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の計測ケースを並列で実施する。
- SubAgent-D が統合順序を直列で確定する。
- onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）のカバレッジを統合対象に固定する。
- phase変換・Store更新・UI表示の3層のカバレッジが目標値を達成しているか確認する。
- 統合ログは `outputs/phase-7/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | カバレッジ計測結果と成果物の記載に矛盾がないか確認する              |
| 漏れ     | AC-1〜AC-6 の全てにテストケースが対応しているか確認する             |
| 整合性   | Hook/Slice/Component の各層でカバレッジ目標が整合しているか確認する |
| 依存関係 | Phase 4/5/6 の成果物を参照してカバレッジが設計通りか確認する        |

## 成果物

| 成果物                 | パス                                              | 説明                             |
| ---------------------- | ------------------------------------------------- | -------------------------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 対象ファイル・目標値・実績値     |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達箇所の根因と補完策         |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC-1〜AC-6のテストカバレッジ確認 |

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`           | Phase 5 成果物 |
| 契約差分           | `outputs/phase-5/contract-diff.md`           | Phase 5 成果物 |
| 拡張テストケース   | `outputs/phase-6/expanded-test-cases.md`     | Phase 6 成果物 |
| 回帰テスト結果     | `outputs/phase-6/regression-test-result.md`  | Phase 6 成果物 |
| 異常系結果         | `outputs/phase-6/edge-case-result.md`        | Phase 6 成果物 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業（カバレッジ計測・不足分析）
3. SubAgent-D の統合判定（AC-1〜AC-6 網羅率算出）
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

Phase 8: リファクタリング
