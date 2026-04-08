# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

実装前に Red（失敗）状態のテストを定義し、TDD サイクルの起点を固める。

## 実行タスク

1. ツール推論の Red テストを定義する。
2. タイミング推論の Red テストを定義する。
3. フォーマット推論と inferenceLog の Red テストを定義する。

## 統合テスト連携

- Phase 5 はここで定義した Red テストを Green にする最小実装に限定する。
- Phase 6 で edge case / regression を追加できるよう、ケース名を安定化する。

## private method テスト方針

本タスクは純粋関数 `inferSmartDefaults` のテストが主体のため private method テストは不要。
ただし、将来的に内部メソッドが発生した場合は `(service as unknown as ServicePrivate)` キャストまたは public callback 経由を使う。

## テスト対象

| テスト対象                            | テスト種別     | 目的                                    |
| ------------------------------------- | -------------- | --------------------------------------- |
| `inferSmartDefaults` ツール推論       | ユニットテスト | slack/github/notion の推論正確性検証    |
| `inferSmartDefaults` タイミング推論   | ユニットテスト | scheduled/realtime の推論正確性検証     |
| `inferSmartDefaults` フォーマット推論 | ユニットテスト | code/structured の推論正確性検証        |
| `inferSmartDefaults` フォールバック   | ユニットテスト | null フィールド・空 inferenceLog の確認 |
| `inferSmartDefaults` inferenceLog     | ユニットテスト | 推論根拠の記録が正しいことの確認        |

## テストケース一覧（Red 段階）

| TC-ID | 説明                                                        | 期待値                                           |
| ----- | ----------------------------------------------------------- | ------------------------------------------------ |
| TC-01 | purpose に 'Slack' を含む場合 tool = 'slack'                | `result.tool === "slack"`                        |
| TC-02 | purpose に 'GitHub' を含む場合 tool = 'github'              | `result.tool === "github"`                       |
| TC-03 | purpose に 'Notion' を含む場合 tool = 'notion'              | `result.tool === "notion"`                       |
| TC-04 | purpose に ツールキーワードなし tool = null                 | `result.tool === null`                           |
| TC-05 | purpose に '毎日' を含む timing = 'scheduled'               | `result.timing === "scheduled"`                  |
| TC-06 | purpose に 'リアルタイム' を含む timing = 'realtime'        | `result.timing === "realtime"`                   |
| TC-07 | purpose にタイミングキーワードなし timing = null            | `result.timing === null`                         |
| TC-08 | category = 'code-support' の場合 format = 'code'            | `result.format === "code"`                       |
| TC-09 | category = 'data-analysis' の場合 format = 'structured'     | `result.format === "structured"`                 |
| TC-10 | category が null の場合 format = null                       | `result.format === null`                         |
| TC-11 | purpose が空文字の場合 tool = null, timing = null           | `result.tool === null && result.timing === null` |
| TC-12 | 全フィールドが推論できない場合 inferenceLog = []            | `result.inferenceLog.length === 0`               |
| TC-13 | Slack推論成功時 inferenceLog に推論根拠が含まれる           | `result.inferenceLog[0]` に 'slack' が含まれる   |
| TC-14 | 先勝ちルール: Slack と GitHub が両方含まれる場合 slack 優先 | `result.tool === "slack"`                        |
| TC-15 | purpose が undefined/null の場合 tool = null                | `result.tool === null`                           |

## テスト実行コマンド

```bash
# Red 状態確認（実装前）
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# 命名規則確認
pnpm --filter @repo/shared typecheck
```

## 参照資料

| 資料名             | パス                                     | 用途           |
| ------------------ | ---------------------------------------- | -------------- |
| API シグネチャ設計 | `outputs/phase-2/api-design.md`          | Phase 2 成果物 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md` | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`       | Phase 2 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`       | Phase 3 成果物 |

## 実行手順

1. Phase 2 のテスト戦略を確認する。
2. Phase 3 のゲート判定が PASS/MINOR であることを確認する。
3. テストファイルを作成する（実装なしで Red を確認）。
4. Red テスト結果を記録する。

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース定義一覧 |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 実行結果（FAIL確認） |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テスト方針       |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-01〜TC-15 の全テストケースが定義されていること
- [ ] Red 状態（テスト失敗）が確認されていること
- [ ] テストファイルパスが命名規則と整合していること
- [ ] 本Phase内の全タスクを100%実行完了

## TDD Red 確認

```bash
# 実行コマンド（Red 確認）
pnpm --filter @repo/shared test:run -- src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
# 期待: 全テスト FAIL（実装がないため）
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
