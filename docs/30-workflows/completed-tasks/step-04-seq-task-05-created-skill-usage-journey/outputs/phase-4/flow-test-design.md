# Phase 4 画面遷移フローテスト仕様

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 4                          |
| 成果物   | flow-test-design           |
| 作成日   | 2026-03-15                 |

---

## 概要

3つの利用シナリオ（A: 作成直後利用 / B: あとから利用 / C: 履歴再利用）の E2E 画面遷移をテストケースとして定義する。各ステップの遷移元・遷移先・検証内容・遷移コンテキスト（渡されるデータ）を明示する。

---

## シナリオA: 作成直後に使う（Immediate Use）

### TC-FLOW-A01: Skill Creator 完了 → EP-1 採点完了画面

| 項目             | 内容                                                                |
| ---------------- | ------------------------------------------------------------------- |
| テストケース ID  | TC-FLOW-A01                                                         |
| 遷移元           | Skill Creator 完了画面                                              |
| 遷移先           | EP-1 採点完了画面                                                   |
| 遷移トリガー     | Skill Creator の「完了」ボタンクリック                              |
| 遷移コンテキスト | `{ skillName: string, prompt: string, description: string }`        |
| 検証内容         | ScoringGateResult が取得され、ScoreGateBadge が正しく表示されること |
| 合否基準         | ScoringGate バッジとスコア数値が表示されれば PASS                   |

### TC-FLOW-A02: EP-1 採点完了 → Workspace（USE_ALLOWED以上）

| 項目             | 内容                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| テストケース ID  | TC-FLOW-A02                                                                    |
| 遷移元           | EP-1 採点完了画面                                                              |
| 遷移先           | Workspace                                                                      |
| 遷移トリガー     | 「今すぐ使う」CTA クリック                                                     |
| 前提条件         | ScoringGate が USE_ALLOWED (80-99) または RECOMMENDED (100)                    |
| 遷移コンテキスト | `{ skillName: string, scoringGateResult: ScoringGateResult }`                  |
| 検証内容         | Workspace にスキル名が自動設定され、EP-3 評価バナーが表示されること            |
| 合否基準         | Workspace にスキルが事前選択された状態で遷移し、EP-3 バナーが表示されれば PASS |

### TC-FLOW-A03: Workspace → Agent

| 項目             | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| テストケース ID  | TC-FLOW-A03                                                       |
| 遷移元           | Workspace                                                         |
| 遷移先           | Agent                                                             |
| 遷移トリガー     | Workspace の「実行」アクション                                    |
| 遷移コンテキスト | `{ skillName: string, workspaceContext: WorkspaceContext }`       |
| 検証内容         | スキルが自動選択された状態で Agent へ遷移し、実行が開始されること |
| 合否基準         | Agent 画面でスキル名が表示され、実行状態が「実行中」になれば PASS |

### TC-FLOW-A04: Agent 実行中 → Agent 実行結果

| 項目            | 内容                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| テストケース ID | TC-FLOW-A04                                                                                |
| 遷移元          | Agent 実行中画面                                                                           |
| 遷移先          | Agent 実行結果画面                                                                         |
| 遷移トリガー    | 実行完了イベント                                                                           |
| 検証内容        | 実行結果サマリーと PostExecutionActionBar が表示されること                                 |
| 合否基準        | 結果サマリー + PostExecutionActionBar（もう一度使う / 改善する / 完了）が表示されれば PASS |

### TC-FLOW-A05: Agent 実行結果 → 履歴記録

| 項目            | 内容                                                                        |
| --------------- | --------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-A05                                                                 |
| 遷移元          | Agent 実行結果画面                                                          |
| 遷移先          | 履歴記録完了                                                                |
| 遷移トリガー    | 「完了」CTA クリック                                                        |
| 検証内容        | 実行履歴に ExecutionSummary が追加され、recentlyUsedSkills が更新されること |
| 合否基準        | Agent 履歴タブに新しいエントリが追加されれば PASS                           |

---

## シナリオB: あとから使う（Deferred Use）

### TC-FLOW-B01: Skill Center 一覧 → SkillCard 表示

| 項目            | 内容                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-B01                                                                                  |
| 遷移元          | Skill Center 一覧画面                                                                        |
| 遷移先          | SkillCard 表示                                                                               |
| 検証内容        | SkillCard に ScoringGate バッジが表示され、ソート/フィルタが機能すること                     |
| 合否基準        | SkillCard に ScoreGateBadge(sm) が表示され、ScoringGate/カテゴリ でフィルタ可能であれば PASS |

### TC-FLOW-B02: SkillCard → SkillDetailPanel

| 項目            | 内容                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-B02                                                                  |
| 遷移元          | SkillCard                                                                    |
| 遷移先          | SkillDetailPanel                                                             |
| 遷移トリガー    | SkillCard クリック                                                           |
| 検証内容        | 詳細パネルが開き、ScoreDisplay（総合スコア + 5軸 breakdown）が表示されること |
| 合否基準        | SkillDetailPanel に「使う」CTA と「改善する」CTA が表示されれば PASS         |

### TC-FLOW-B03: SkillDetailPanel → Workspace

| 項目             | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| テストケース ID  | TC-FLOW-B03                                                       |
| 遷移元           | SkillDetailPanel                                                  |
| 遷移先           | Workspace                                                         |
| 遷移トリガー     | 「使う」CTA クリック                                              |
| 前提条件         | canUse が true（USE_ALLOWED 以上）                                |
| 遷移コンテキスト | `{ skillName: string }`                                           |
| 検証内容         | Workspace にスキルが自動選択され、EP-3 評価バナーが表示されること |
| 合否基準         | Workspace 遷移 + スキル選択 + EP-3 バナー表示なら PASS            |

### TC-FLOW-B04: Workspace → Agent

| 項目            | 内容                                                              |
| --------------- | ----------------------------------------------------------------- |
| テストケース ID | TC-FLOW-B04                                                       |
| 遷移元          | Workspace                                                         |
| 遷移先          | Agent                                                             |
| 遷移トリガー    | 文脈準備完了 → 「実行」アクション                                 |
| 検証内容        | 文脈（ファイル接続・パラメータ設定）を含めて Agent に遷移すること |
| 合否基準        | Agent 画面でスキル + 文脈が反映されていれば PASS                  |

### TC-FLOW-B05: Agent 実行結果 → 「最近使ったスキル」更新

| 項目            | 内容                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-B05                                                                                        |
| 遷移元          | Agent 実行結果画面                                                                                 |
| 遷移先          | Skill Center（最近使ったスキル更新）                                                               |
| 検証内容        | 実行後に recentlyUsedSkills Store が更新され、Skill Center の RecentlyUsedSection に反映されること |
| 合否基準        | 実行完了後に recentlyUsedSkills に skillName + timestamp が追加されれば PASS                       |

### TC-FLOW-B06: Skill Center 検索バー → 検索結果

| 項目            | 内容                                                     |
| --------------- | -------------------------------------------------------- |
| テストケース ID | TC-FLOW-B06                                              |
| 遷移元          | Skill Center 検索バー                                    |
| 遷移先          | 検索結果一覧                                             |
| 遷移トリガー    | 検索テキスト入力                                         |
| 検証内容        | スキル名・説明・タグで絞り込み結果が正しく表示されること |
| 合否基準        | 検索キーワードに一致するスキルのみが表示されれば PASS    |

---

## シナリオC: 履歴から再利用する（History Reuse）

### TC-FLOW-C01: Agent 履歴タブ → 履歴エントリ一覧

| 項目            | 内容                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-C01                                                                       |
| 遷移元          | Agent 履歴タブ                                                                    |
| 遷移先          | 履歴エントリ一覧（RecentExecutionList）                                           |
| 検証内容        | 各エントリにスキル名・実行日時（相対表示）・ステータス・スコア・ScoreDelta が表示 |
| 合否基準        | 履歴エントリの5項目全てが表示されれば PASS                                        |

### TC-FLOW-C02: 履歴エントリ → Agent 再実行

| 項目             | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| テストケース ID  | TC-FLOW-C02                                                       |
| 遷移元           | 履歴エントリ                                                      |
| 遷移先           | Agent 再実行                                                      |
| 遷移トリガー     | 「もう一度使う」CTA クリック                                      |
| 遷移コンテキスト | `{ skillName: string, previousParams: ExecutionParams }`          |
| 検証内容         | 前回の実行パラメータが復元された状態で Agent 実行が開始されること |
| 合否基準         | 前回パラメータ復元 + Agent 実行開始なら PASS                      |

### TC-FLOW-C03: Agent 実行結果（不満） → SkillAnalysisView

| 項目             | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| テストケース ID  | TC-FLOW-C03                                                  |
| 遷移元           | Agent 実行結果画面                                           |
| 遷移先           | SkillAnalysisView（Task03 管轄）                             |
| 遷移トリガー     | PostExecutionActionBar の「改善する」CTA クリック            |
| 遷移コンテキスト | `{ skillName: string, executionResult: ExecutionResult }`    |
| 検証内容         | skillName と実行結果が SkillAnalysisView に渡されること      |
| 合否基準         | 遷移先で skillName と実行結果コンテキストが受け取れれば PASS |

### TC-FLOW-C04: SkillAnalysisView → EP-2 改善後再採点

| 項目            | 内容                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-C04                                                                      |
| 遷移元          | SkillAnalysisView（改善完了後）                                                  |
| 遷移先          | EP-2 改善後再採点                                                                |
| 検証内容        | 改善完了後に新しい ScoringGateResult が取得され、ScoreGateBadge が更新されること |
| 合否基準        | 新しい ScoringGate が反映された ScoreGateBadge が表示されれば PASS               |

### TC-FLOW-C05: EP-2 再採点完了 → 再利用導線

| 項目            | 内容                                                                |
| --------------- | ------------------------------------------------------------------- |
| テストケース ID | TC-FLOW-C05                                                         |
| 遷移元          | EP-2 再採点完了画面                                                 |
| 遷移先          | Skill Center（スコア更新反映）/ Agent 履歴（ScoreDelta 更新）       |
| 検証内容        | 改善完了後に再利用導線へ戻るパスが機能すること                      |
| 合否基準        | Skill Center または Agent 履歴に更新されたスコアが反映されれば PASS |

---

## テストケース集計

| シナリオ        | テストケース数 | ID範囲           |
| --------------- | -------------- | ---------------- |
| A: 作成直後利用 | 5              | TC-FLOW-A01〜A05 |
| B: あとから利用 | 6              | TC-FLOW-B01〜B06 |
| C: 履歴再利用   | 5              | TC-FLOW-C01〜C05 |
| **合計**        | **16**         |                  |
