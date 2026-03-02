# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                        |
| --------- | ----------------------------------------- |
| Phase     | 7                                         |
| Phase名   | カバレッジ確認                            |
| 機能名    | SkillAnalysisView（スキル分析ビュー）     |
| タスクID  | TASK-10A-B                                |
| 前提Phase | Phase 6（テスト拡充完了、全テスト Green） |
| 後続Phase | Phase 8（リファクタリング）               |
| 作成日    | 2026-03-02                                |

## 目的

Phase 6 で拡充したテストのカバレッジを測定し、プロジェクトのカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を全ファイルで達成していることを検証する。未達の場合は不足箇所を特定して Phase 6 に戻り、追加テストを作成する。

## 実行タスク

- カバレッジ測定: 全テスト実行で Line/Branch/Function の実測値を取得する
- レポート分析: ファイル別の未達項目を特定して原因を記録する
- 未達対応判断: 基準未達があれば Phase 6 へ差し戻し条件を明記する
- 最終判定: 全指標が基準を満たすかを判定し次Phase遷移可否を確定する

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 未達時のアクション |
| ----------------- | -------- | -------- | ------------------ |
| Line Coverage     | 80%      | 90%      | Phase 6 へ戻る     |
| Branch Coverage   | 60%      | 70%      | Phase 6 へ戻る     |
| Function Coverage | 80%      | 90%      | Phase 6 へ戻る     |

## 参照資料

| 資料名                            | パス                                                                        | 説明                           |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| Phase 5 実装                      | `phase-5-implementation.md`                                                 | 実装対象コードの把握           |
| Phase 6 テスト拡充                | `phase-6-test-expansion.md`                                                 | 追加テスト一覧                 |
| テスト品質基準                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準定義             |
| P40: テスト実行ディレクトリ依存   | `.claude/rules/06-known-pitfalls.md#P40`                                    | cd apps/desktop && pnpm vitest |
| P41: v8カバレッジのインライン関数 | `.claude/rules/06-known-pitfalls.md#P41`                                    | 関数カウント注意               |

## 実行手順

### Task 1: カバレッジ測定

#### 1-1: 全体カバレッジ測定コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/SuggestionList.test.tsx src/renderer/components/skill/__tests__/RiskPanel.test.tsx
```

#### 1-2: ファイル別カバレッジ測定

全体計測で未達が見つかった場合のみ、個別ファイルのカバレッジを確認する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SuggestionList.test.tsx
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/RiskPanel.test.tsx
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

### Task 2: カバレッジレポート分析

#### 2-1: ファイル別カバレッジ記録

| ファイル              | Line  | Branch | Function | Line判定  | Branch判定 | Function判定 |
| --------------------- | ----- | ------ | -------- | --------- | ---------- | ------------ |
| SkillAnalysisView.tsx | \_\_% | \_\_%  | \_\_%    | 達成/未達 | 達成/未達  | 達成/未達    |
| ScoreDisplay.tsx      | \_\_% | \_\_%  | \_\_%    | 達成/未達 | 達成/未達  | 達成/未達    |
| SuggestionList.tsx    | \_\_% | \_\_%  | \_\_%    | 達成/未達 | 達成/未達  | 達成/未達    |
| RiskPanel.tsx         | \_\_% | \_\_%  | \_\_%    | 達成/未達 | 達成/未達  | 達成/未達    |

#### 2-2: 全体サマリー

| 指標              | 実測値 | 最低基準 | 推奨基準 | 総合判定  |
| ----------------- | ------ | -------- | -------- | --------- |
| Line Coverage     | \_\_%  | 80%      | 90%      | 達成/未達 |
| Branch Coverage   | \_\_%  | 60%      | 70%      | 達成/未達 |
| Function Coverage | \_\_%  | 80%      | 90%      | 達成/未達 |

### Task 3: 未達箇所の特定と追加テスト作成

#### 3-1: 判定フロー

```
全ファイルが全指標で最低基準を達成？
├── YES → Task 4（最終確認）へ
└── NO  → 未達箇所を特定 → Phase 6 へ戻り追加テスト作成
```

#### 3-2: 未達時の対応手順

1. カバレッジレポートから未カバー行・未カバーブランチを特定する
2. 未カバー箇所に対応するテストケースを設計する
3. Phase 6 に戻り、追加テストを実装する
4. 再度 Phase 7 の Task 1 から実行する

#### 3-3: P41 対策

Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。以下の場合は Function Coverage が低下する可能性がある:

- `getScoreVariant` のインラインコールバック
- `suggestions.filter()` や `risks.map()` のインラインコールバック
- variantStyles Record 内のアクセスパターン

これらがカバレッジ低下の原因である場合は、テストで明示的にこれらの関数を呼び出すことで対応する。

### Task 4: 最終カバレッジ確認

全ファイルで全指標が最低基準を達成していることを最終確認する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/
```

---

## 統合テスト連携

| 連携先             | 方針                                                           |
| ------------------ | -------------------------------------------------------------- |
| Phase 6 テスト     | カバレッジ未達の場合は Phase 6 に戻り追加テストを作成する      |
| Phase 8 リファクタ | カバレッジ達成後にリファクタリングを開始（テスト保護下で実施） |

## 多角的チェック観点

| 観点              | 確認項目                                                 |
| ----------------- | -------------------------------------------------------- |
| Line Coverage     | 全ファイルで80%以上を達成                                |
| Branch Coverage   | 全ファイルで60%以上を達成                                |
| Function Coverage | 全ファイルで80%以上を達成（P41のインライン関数を考慮）   |
| テスト実行環境    | `cd apps/desktop && pnpm vitest run` で実行（P40）       |
| テスト全Green     | カバレッジ測定時に全テストが PASS している               |
| レポート完成      | ファイル別・全体サマリーのカバレッジ数値が記録されている |

## 成果物

| 成果物                               | タイプ             | 説明                       |
| ------------------------------------ | ------------------ | -------------------------- |
| `outputs/phase-7/coverage-report.md` | カバレッジレポート | ファイル別・全体カバレッジ |

## 完了条件

- [ ] 全4ファイルのカバレッジを測定済み
- [ ] SkillAnalysisView.tsx: Line 80%+, Branch 60%+, Function 80%+
- [ ] ScoreDisplay.tsx: Line 80%+, Branch 60%+, Function 80%+
- [ ] SuggestionList.tsx: Line 80%+, Branch 60%+, Function 80%+
- [ ] RiskPanel.tsx: Line 80%+, Branch 60%+, Function 80%+
- [ ] 全テストが PASS（Green）状態
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で行われている（P40）
- [ ] P41（v8カバレッジのインライン関数カウント）を考慮した判定
- [ ] `outputs/phase-7/coverage-report.md` にファイル別・全体サマリーが記録されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] カバレッジ基準の達成を確認

## 次のPhase

Phase 8（リファクタリング）へ進行する。テストの保護下でコード品質を改善する（DRY原則、SRP、カスタムフック抽出、パフォーマンス最適化）。
