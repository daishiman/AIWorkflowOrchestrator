# Phase 7: カバレッジ確認

## メタ情報

| 項目  | 内容                                                                             |
| ----- | -------------------------------------------------------------------------------- |
| Phase | 7                                                                                |
| 名称  | テストカバレッジ確認                                                             |
| 目的  | Phase 4/6 のテスト設計が要件・導線・契約を漏れなくカバーしているかを定量確認する |
| 入力  | Phase 1 要件、Phase 4 テスト設計、Phase 6 拡充ケース                             |
| 出力  | カバレッジマトリクス、ギャップ一覧、優先度付き是正計画                           |
| 依存  | Phase 1, Phase 4, Phase 6                                                        |

## 目的

要件に対してテストが不足している箇所を数値で特定し、
Phase 8 以降で仕様改善すべき箇所と Phase 10 で判定に使う材料を固定する。

## 実行タスク

- タスク1: 要件IDとテストケースIDを突合し、coverage matrix を作成する
- タスク2: シナリオA/B/C と改善ループの導線カバレッジを算出し、未検証導線を特定する
- タスク3: IPC・状態管理・UI表示の契約カバレッジを確認し、契約逸脱リスクを抽出する
- タスク4: 未カバー項目を優先度付けし、Phase 8/10/12 での是正方針を決定する
- タスク5: カバレッジ結果を成果物化し、判定ログへ引き継ぐ

## 参照資料

| 種別         | パス                                                                                 | 用途                              |
| ------------ | ------------------------------------------------------------------------------------ | --------------------------------- |
| Phase 1      | `./phase-1-requirements.md`                                                          | 要件ID・受入基準・依存契約        |
| Phase 4      | `./phase-4-test-creation.md`                                                         | 基本テストケース定義              |
| Phase 5      | `./phase-5-implementation.md`                                                        | outputs 確定内容と整合性判定      |
| Phase 6      | `./phase-6-test-expansion.md`                                                        | 拡張テストケース（失敗系/境界値） |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行契約・結果データ契約          |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | 実行導線・遷移契約                |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Store状態と更新責務               |

## 実行手順

### ステップ1: coverage matrix 作成（タスク1）

1. Phase 1 の要件ID（AC-1〜AC-5）を行として列挙する
2. Phase 4/6 のテストケースIDを列として配置する
3. `完全カバー / 部分カバー / 未カバー` の3値で判定する

### ステップ2: 導線カバレッジ算出（タスク2）

1. シナリオA/B/C と改善ループを導線単位で分解する
2. 各導線に対応するテストケースIDを紐づける
3. 未紐づけ導線を gap 候補として抽出する

### ステップ3: 契約カバレッジ算出（タスク3）

1. IPC 契約（EP-3/EP-4）とテストケースの対応を確認する
2. 状態管理（favorite/recentlyUsed/lastExecutionResult）の更新契約を突合する
3. UI 表示契約（ScoreGate/ScoreDelta/CTA）の検証有無を確認する

### ステップ4: gap 優先度付け（タスク4）

1. gap を `CRITICAL / MAJOR / MINOR` で分類する
2. CRITICAL/MAJOR は Phase 10 判定に直結する blocker として扱う
3. MINOR は Phase 12 未タスク化候補として管理する

### ステップ5: 成果物化と引き継ぎ（タスク5）

1. `outputs/phase-7/coverage-matrix.md` に全判定を記録する
2. `outputs/phase-7/coverage-gap-report.md` に gap 詳細を記録する
3. `outputs/phase-7/coverage-summary.md` に総括と次Phaseアクションを記録する

## 統合テスト連携

| 観点          | 連携内容                                                       |
| ------------- | -------------------------------------------------------------- |
| Phase 4 連携  | 基本ケースの網羅性を coverage の基準線として固定する           |
| Phase 6 連携  | 追加ケースを取り込んで未カバー導線を削減し、回帰観点を補強する |
| Phase 10 連携 | CRITICAL/MAJOR gap を最終判定の blocker 判定へ連動する         |
| Phase 12 連携 | MINOR gap を未タスク検出レポートの入力として正式化する         |

## 成果物

| 成果物                     | パス                                     | 説明                                  |
| -------------------------- | ---------------------------------------- | ------------------------------------- |
| カバレッジマトリクス       | `outputs/phase-7/coverage-matrix.md`     | 要件ID × テストケースID の対応表      |
| カバレッジギャップレポート | `outputs/phase-7/coverage-gap-report.md` | 未カバー項目と優先度分類              |
| カバレッジサマリー         | `outputs/phase-7/coverage-summary.md`    | カバレッジ率と次Phaseへの引き継ぎ事項 |

## 完了条件

- [ ] coverage matrix が作成されている
- [ ] シナリオA/B/C と改善ループの導線カバレッジが算出されている
- [ ] IPC・状態管理・UI契約のカバレッジが確認されている
- [ ] gap に優先度（CRITICAL/MAJOR/MINOR）が付与されている
- [ ] `outputs/phase-7/*.md` に成果物が記録されている
- [ ] Phase 10 と Phase 12 への引き継ぎ事項が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] タスク1: coverage matrix 作成
- [ ] タスク2: 導線カバレッジ算出
- [ ] タスク3: 契約カバレッジ算出
- [ ] タスク4: gap 優先度付け
- [ ] タスク5: 成果物化と引き継ぎ

## タスク100%実行確認【必須】

上記サブタスクがすべて完了してから、Phase完了として扱うこと。

## 次のPhase

- [Phase 8: リファクタリング](./phase-8-refactoring.md)
