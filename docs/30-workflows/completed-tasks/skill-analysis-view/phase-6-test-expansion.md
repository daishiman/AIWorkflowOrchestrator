# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| Phase      | 6                                           |
| Phase名    | テスト拡充                                  |
| 機能名     | SkillAnalysisView（スキル分析ビュー）       |
| タスクID   | TASK-10A-B                                  |
| 前提Phase  | Phase 5（実装完了、全テスト Green）         |
| 後続Phase  | Phase 7（カバレッジ確認）                   |
| 作成日     | 2026-03-02                                  |
| テスト環境 | Vitest + @testing-library/react + happy-dom |

## 目的

Phase 5 の実装完了後にカバレッジ不足箇所を特定し、境界値テスト・異常系テスト・統合テスト・アクセシビリティテスト・スタイルテストを追加して、Phase 7 のカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を目指す。

## 実行タスク

- カバレッジ測定: 現状のLine/Branch/Functionを測定する
- 境界値テスト追加: スコア閾値や空配列の境界ケースを補強する
- 異常系テスト追加: IPCエラーと連続操作時の挙動を検証する
- a11yテスト追加: ARIA属性とキーボード操作を検証する
- 統合テスト追加: コンポーネント間の一連フローを検証する
- スタイルテスト追加: variantStyles Record定数の適用を検証する
- 品質確認: 追加後の全テストがGreenであることを確認する

## 参照資料

| 資料名                          | パス                                                                              | 説明                         |
| ------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 テスト作成              | `phase-4-test-creation.md`                                                        | 既存テストケース一覧         |
| Phase 5 実装                    | `phase-5-implementation.md`                                                       | 実装仕様・variantStyles定義  |
| テスト品質基準                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準               |
| コンポーネントテストパターン    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト方針                   |
| アクセシビリティテスト          | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG観点テスト項目           |
| P39: happy-dom userEvent非互換  | `.claude/rules/06-known-pitfalls.md#P39`                                          | fireEvent使用必須            |
| P41: v8カバレッジの関数カウント | `.claude/rules/06-known-pitfalls.md#P41`                                          | インライン関数カバレッジ対策 |
| P47: CSS変数テストアサーション  | `.claude/rules/06-known-pitfalls.md#P47`                                          | variantStyles Record定数     |

## 実行手順

### Task 1: 現状カバレッジ測定

#### 1-1: カバレッジ測定コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/SuggestionList.test.tsx src/renderer/components/skill/__tests__/RiskPanel.test.tsx
```

#### 1-2: 現状カバレッジ記録テンプレート

| ファイル              | Line  | Branch | Function | 判定      |
| --------------------- | ----- | ------ | -------- | --------- |
| SkillAnalysisView.tsx | \_\_% | \_\_%  | \_\_%    | 達成/未達 |
| ScoreDisplay.tsx      | \_\_% | \_\_%  | \_\_%    | 達成/未達 |
| SuggestionList.tsx    | \_\_% | \_\_%  | \_\_%    | 達成/未達 |
| RiskPanel.tsx         | \_\_% | \_\_%  | \_\_%    | 達成/未達 |

未達箇所を特定し、Task 2 以降で追加テストを作成する。

### Task 2: 境界値テスト追加

#### 2-1: ScoreDisplay 境界値

| No  | テストケース名                     | 検証内容                                               |
| --- | ---------------------------------- | ------------------------------------------------------ |
| 1   | スコア0の場合にエラー色を適用する  | `overallScore: 0` で `scoreVariantStyles.error` が適用 |
| 2   | スコア59の場合にエラー色を適用する | 境界値59でエラー色適用                                 |
| 3   | スコア60の場合に警告色を適用する   | 境界値60で警告色に切り替わる                           |
| 4   | スコア79の場合に警告色を適用する   | 境界値79で警告色適用                                   |
| 5   | スコア80の場合に成功色を適用する   | 境界値80で成功色に切り替わる                           |
| 6   | スコア100の場合に成功色を適用する  | `overallScore: 100` で `scoreVariantStyles.success`    |

#### 2-2: SuggestionList 境界値

| No  | テストケース名       | 検証内容                                       |
| --- | -------------------- | ---------------------------------------------- |
| 7   | 単一提案のみの表示   | 提案が1件のみの場合でも正しくリスト表示される  |
| 8   | 同一優先度の複数提案 | 全提案がhighの場合、1グループで全て表示される  |
| 9   | 全提案を選択した状態 | 全インデックスが `selected` Set に含まれる場合 |

#### 2-3: RiskPanel 境界値

| No  | テストケース名                        | 検証内容                                  |
| --- | ------------------------------------- | ----------------------------------------- |
| 10  | 全4レベルのリスクが同時に存在する場合 | critical/high/medium/low が全て描画される |
| 11  | 単一リスクのみの表示                  | リスクが1件のみの場合でも正しく表示される |

#### 2-4: SkillAnalysisView 境界値

| No  | テストケース名           | 検証内容                                  |
| --- | ------------------------ | ----------------------------------------- |
| 12  | 空のcategories配列の場合 | カテゴリが0件でもエラーにならず表示される |
| 13  | 空のrisks配列の場合      | リスクが0件で空状態メッセージが表示される |

### Task 3: 異常系テスト追加

#### 3-1: IPC エラーテスト

| No  | テストケース名                         | 検証内容                                            |
| --- | -------------------------------------- | --------------------------------------------------- |
| 14  | analyze が例外を投げた場合のエラー表示 | `analyze` reject時にエラーメッセージ + 再試行ボタン |
| 15  | applyImprovements が例外を投げた場合   | 改善適用失敗時のエラー表示                          |
| 16  | autoImprove が例外を投げた場合         | 全自動改善失敗時のエラー表示                        |
| 17  | analyze がnullを返した場合             | 予期しない戻り値でのエラーハンドリング              |
| 18  | 改善結果にerrorsが含まれる場合の表示   | `ImprovementResult.errors` が0件以上の場合の表示    |

#### 3-2: 連続操作テスト

| No  | テストケース名                           | 検証内容                                       |
| --- | ---------------------------------------- | ---------------------------------------------- |
| 19  | 分析中に閉じるボタンをクリックする       | `isAnalyzing` 中でも `onClose` が呼ばれる      |
| 20  | 改善適用中に再度適用ボタンをクリックする | `isImproving` 中はボタンが disabled で操作不可 |
| 21  | エラー状態から再試行→成功のフロー        | エラー→再試行→分析成功→結果表示の状態遷移      |

### Task 4: アクセシビリティテスト追加

| No  | テストケース名                                    | 検証内容                                         |
| --- | ------------------------------------------------- | ------------------------------------------------ |
| 22  | ScoreDisplay にARIA progressbar属性がある         | `role="progressbar"` と `aria-valuenow` の存在   |
| 23  | SuggestionList チェックボックスにaria-labelがある | 各チェックボックスに説明的な `aria-label` が設定 |
| 24  | エラーメッセージに role="alert" がある            | エラー表示要素に `role="alert"` が付与されている |
| 25  | ボタンの disabled 状態がaria-disabledと一致       | `isImproving` 中に `aria-disabled="true"` が設定 |
| 26  | 閉じるボタンに aria-label がある                  | 閉じるボタンに「閉じる」等のaria-labelが設定     |

### Task 5: 統合テスト追加（コンポーネント間連携）

| No  | テストケース名                                                     | 検証内容                                             |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| 27  | 分析→ScoreDisplay表示→SuggestionList表示→RiskPanel表示の一連フロー | analyze成功後にサブコンポーネント3つが全て描画される |
| 28  | 提案選択→適用→再分析の完全フロー                                   | チェック→適用ボタン→API呼び出し→再分析→画面更新      |
| 29  | 全自動改善→確認→実行→再分析の完全フロー                            | ボタン→確認→autoImprove→再分析→画面更新              |

### Task 6: スタイルテスト追加（variantStyles Record検証）

| No  | テストケース名                                   | 検証内容                                              |
| --- | ------------------------------------------------ | ----------------------------------------------------- |
| 30  | scoreVariantStyles が正しいCSS変数を含む         | Record定数の各値にCSS変数文字列が含まれることを検証   |
| 31  | riskLevelStyles の4レベル全てが定義されている    | critical/high/medium/low の全キーが存在する           |
| 32  | priorityStyles の3優先度全てが定義されている     | high/medium/low の全キーが存在する                    |
| 33  | getScoreVariant が境界値で正しいバリアントを返す | 0→error, 59→error, 60→warning, 79→warning, 80→success |

### Task 7: 品質確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

- Phase 4 の36テスト + Phase 6 の追加テスト33件 = 合計69テストが全て Green であることを確認
- `userEvent` が使用されていないことを確認（P39）
- テスト間で状態が共有されていないことを確認（P9）

---

## 統合テスト連携

| 連携先             | 方針                                                   |
| ------------------ | ------------------------------------------------------ |
| Phase 4 テスト     | 既存36テストに追加する形で拡充（テストファイルは同一） |
| Phase 5 実装       | variantStyles Record定数をテスト側から import して検証 |
| IPC契約            | 異常系テストで IPC API のエラーケースを網羅            |
| アクセシビリティ   | ARIA属性・キーボード操作のテストを追加                 |
| Phase 7 カバレッジ | 追加テストによりカバレッジ基準達成を目指す             |

## 多角的チェック観点

| 観点         | 確認項目                                                           |
| ------------ | ------------------------------------------------------------------ |
| 境界値網羅   | スコア閾値（0/59/60/79/80/100）が全てテストされている              |
| 異常系網羅   | IPC API の3メソッド全てのエラーケースがテストされている            |
| a11y網羅     | ARIA属性、role、aria-label が主要要素でテストされている            |
| 統合フロー   | 分析→表示→選択→適用→再分析の End-to-End フローがテストされている   |
| P41対策      | インライン関数のカバレッジ低下を認識し、未達箇所に対してテスト追加 |
| P47対策      | variantStyles Record定数をテスト側から import して検証している     |
| テスト独立性 | 追加テストも beforeEach でモックがリセットされている               |

## 成果物

| 成果物                                | タイプ             | 説明                             |
| ------------------------------------- | ------------------ | -------------------------------- |
| `outputs/phase-6/coverage-report.md`  | カバレッジレポート | 拡充後のカバレッジ計測結果       |
| `outputs/phase-6/integration-test.md` | 統合テスト記録     | 追加した統合テストシナリオと結果 |
| 既存4テストファイルへの追加テスト     | テストコード       | 33テストケース追加               |

> テストコードのパスはすべて `apps/desktop/src/renderer/components/skill/__tests__/` 配下。

## 完了条件

- [ ] 現状カバレッジを測定し、不足箇所を特定済み
- [ ] 境界値テスト13件が追加されている（Task 2）
- [ ] 異常系テスト8件が追加されている（Task 3）
- [ ] アクセシビリティテスト5件が追加されている（Task 4）
- [ ] 統合テスト3件が追加されている（Task 5）
- [ ] スタイルテスト4件が追加されている（Task 6）
- [ ] Phase 4 の36テスト + Phase 6 の33テスト = 合計69テストが全て Green
- [ ] `userEvent` を使用していない（P39）
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で行われている（P40）
- [ ] variantStyles Record定数をテスト側から import して検証している（P47）
- [ ] `outputs/phase-6/coverage-report.md` と `outputs/phase-6/integration-test.md` が作成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-7）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 合計69テストの Green 状態を確認

## 次のPhase

Phase 7（カバレッジ確認）へ進行する。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を検証し、未達の場合は Phase 6 に戻る。
