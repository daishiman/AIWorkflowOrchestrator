# Phase 7: テストカバレッジ確認 — TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 7                                                |
| Phase名    | カバレッジ確認                                   |
| タスクID   | TASK-9J                                          |
| 機能名     | TASK-9J-skill-analytics                          |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 6（テスト拡充）                            |
| 後続Phase  | Phase 8（リファクタリング）                      |
| ステータス | 未着手                                           |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

---

## 目的

Phase 5 で実装し Phase 6 でテストを拡充したスキル使用統計・分析機能のカバレッジが基準を満たしているか**最終確認**する。未達の場合は Phase 6 に戻る。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

### Task 1: カバレッジ計測

以下のコマンドを実行し、カバレッジレポートを取得する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics src/main/services/skill/__tests__/AnalyticsStore src/main/ipc/__tests__/skillAnalyticsHandlers --coverage --reporter=verbose
```

**計測対象ファイル**:

| ファイル                                                 | 説明               |
| -------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 統計・分析サービス |
| `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | イベント永続化     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラー      |

**注意**: テストファイル自体はカバレッジ計測対象外。型定義ファイル（`skill-analytics.ts`）もロジックを含まないため計測対象外。

### Task 2: ゲート判定

#### 2.1 判定テーブル

| 条件                         | 判定  | 対応                                       |
| ---------------------------- | ----- | ------------------------------------------ |
| 全3指標が最低基準を満たす    | PASS  | Phase 8 へ進む                             |
| 全3指標が推奨基準を満たす    | PASS+ | Phase 8 へ進む（高品質）                   |
| いずれかの指標が最低基準未満 | FAIL  | Phase 6 へ戻り、未カバー箇所のテストを追加 |

#### 2.2 FAIL 時の対応手順

1. カバレッジレポートの `Uncovered Lines` / `Uncovered Branches` を確認する
2. 未カバー箇所を特定し、以下の優先順位でテストを追加する:
   - **Branch Coverage 不足**: 条件分岐のうち未通過パスをテスト（if/else の片方のみカバーされていないケース）
   - **Line Coverage 不足**: 未実行行を特定し、その行を通過するテストを追加
   - **Function Coverage 不足**: 未呼出関数を確認し、呼び出すテストを追加（P41対策: インライン arrow function にも注意）
3. テスト追加後、Task 1 を再実行する
4. 基準を満たすまで Step 2-3 を繰り返す

#### 2.3 FAIL 時の典型的な未カバーパターン

| パターン                                                           | テスト追加方法                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `calculateStatistics` の 0件分岐                                   | イベント空配列で `getStatistics` を呼び出すテスト追加                           |
| `aggregateByPeriod` の granularity 別分岐                          | 各 granularity（hour/day/week/month）で個別にテスト追加                         |
| `exportData` の format 別分岐（json/csv）                          | 両フォーマットでテスト追加                                                      |
| `clearData` の before 有無による分岐                               | before 指定と省略の両パターンでテスト追加                                       |
| IPCハンドラーの eventType 別バリデーション分岐                     | 各 eventType で必須フィールドが欠損しているケースをテスト                       |
| `validateIpcSender` の `getAllowedWindows` コールバック（P41対策） | `validateIpcSender.mock.calls[i][2].getAllowedWindows()` で明示的に呼び出し確認 |
| `getEventsByPeriod` の境界値条件（start/end 包含判定）             | 境界値日時でのフィルタテスト追加                                                |
| CSV エスケープの分岐（カンマ・改行・ダブルクォート含有文字列）     | 特殊文字を含むイベントデータでの exportData テスト追加                          |

### Task 3: カバレッジレポート記録

カバレッジ計測結果を以下の形式で記録する:

```markdown
## カバレッジ結果（YYYY-MM-DD）

| ファイル          | Line  | Branch | Function | 判定      |
| ----------------- | ----- | ------ | -------- | --------- |
| SkillAnalytics.ts | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| AnalyticsStore.ts | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| skillHandlers.ts  | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
```

---

## 参照資料

| 資料                                                                        | 用途                                  |
| --------------------------------------------------------------------------- | ------------------------------------- |
| Phase 5 成果物（phase-5-implementation.md）                                 | 計測対象コードの実装基準              |
| Phase 6 成果物（phase-6-test-expansion.md）                                 | 拡充テストの計測対象                  |
| `.claude/rules/02-code-quality.md`                                          | カバレッジ基準定義                    |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質要件の正本                        |
| `.claude/rules/06-known-pitfalls.md#P41`                                    | v8 カバレッジのインライン関数カウント |

## 統合テスト連携

| 連携先                      | 内容                                                      |
| --------------------------- | --------------------------------------------------------- |
| Phase 6（テスト拡充）       | 追加テストを含めた全113テストをカバレッジ計測の入力とする |
| Phase 8（リファクタリング） | PASS/PASS+ 判定後に安全に構造改善へ進む                   |

## 成果物

| 成果物                               | 説明                          |
| ------------------------------------ | ----------------------------- |
| `outputs/phase-7/coverage-report.md` | 各指標の数値と PASS/FAIL 判定 |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] `SkillAnalytics.ts` の Line Coverage が 80% 以上である
- [ ] `SkillAnalytics.ts` の Branch Coverage が 60% 以上である
- [ ] `SkillAnalytics.ts` の Function Coverage が 80% 以上である
- [ ] `AnalyticsStore.ts` の Line Coverage が 80% 以上である
- [ ] `AnalyticsStore.ts` の Branch Coverage が 60% 以上である
- [ ] `AnalyticsStore.ts` の Function Coverage が 80% 以上である
- [ ] `skillHandlers.ts` の Line Coverage が 80% 以上である
- [ ] `skillHandlers.ts` の Branch Coverage が 60% 以上である
- [ ] `skillHandlers.ts` の Function Coverage が 80% 以上である
- [ ] 全テスト（113テスト: Phase 4の79 + Phase 6の34）が PASS している
- [ ] カバレッジ結果が記録されている

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                          | 内容                 |
| ---------- | ----------------------------------------------------------------------------- | -------------------- |
| テスト方針 | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | カバレッジ基準の正本 |
| 品質基準   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 品質管理方針         |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] カバレッジ判定（PASS/FAIL）が明確に記録されている
- [ ] 成果物（カバレッジレポート）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること（113+テストがGreen状態）
- **後続**: PASS → Phase 8（リファクタリング）、FAIL → Phase 6（テスト拡充）へ戻る

---

## 次のPhase

**PASS の場合**: 完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-8-refactoring.md`

**FAIL の場合**: 以下のファイルに戻ってください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-6-test-expansion.md`
