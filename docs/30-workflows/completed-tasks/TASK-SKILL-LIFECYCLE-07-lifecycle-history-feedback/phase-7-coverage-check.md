# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | カバレッジ確認                         |
| 前提Phase  | Phase 6（テスト拡充）                  |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計                                   |

---

## 目的

Phase 4（テスト作成）と Phase 6（テスト拡充）で設計したテスト仕様書が、Phase 5 の実装仕様を十分にカバーしているかを確認する。イベントカテゴリ別、集約計算ロジック別、フィードバック還流パス別にカバレッジを計測し、未達の場合は Phase 6 に戻って追加テスト仕様を設計する。

## 背景

本タスクは設計タスクであるため、実行時カバレッジ（Vitest の v8 プロバイダ）ではなく、仕様レベルのカバレッジを計測する。Phase 5 の実装仕様書に記載された全関数・全分岐・全エラーパスに対して、Phase 4 + Phase 6 のテスト仕様書にテストケースが存在するかをマトリクスで検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: イベントカテゴリ別カバレッジ確認

**目的**: 5つのイベントカテゴリ（creation, evaluation, execution, improvement, reuse）の全イベント種別に対するテストカバレッジを確認する。

**実行手順**:

1. イベント種別カバレッジマトリクスを作成する:

   | イベント種別              | カテゴリ    | 生成テスト | バリデーションテスト | 永続化テスト | 異常系テスト | カバー状況 |
   | ------------------------- | ----------- | ---------- | -------------------- | ------------ | ------------ | ---------- |
   | skill:created             | creation    | -          | -                    | -            | -            | -          |
   | skill:draft_saved         | creation    | -          | -                    | -            | -            | -          |
   | skill:template_applied    | creation    | -          | -                    | -            | -            | -          |
   | skill:evaluated           | evaluation  | -          | -                    | -            | -            | -          |
   | skill:score_updated       | evaluation  | -          | -                    | -            | -            | -          |
   | skill:gate_passed         | evaluation  | -          | -                    | -            | -            | -          |
   | skill:gate_failed         | evaluation  | -          | -                    | -            | -            | -          |
   | skill:executed            | execution   | -          | -                    | -            | -            | -          |
   | skill:execution_succeeded | execution   | -          | -                    | -            | -            | -          |
   | skill:execution_failed    | execution   | -          | -                    | -            | -            | -          |
   | skill:execution_timeout   | execution   | -          | -                    | -            | -            | -          |
   | skill:improved            | improvement | -          | -                    | -            | -            | -          |
   | skill:version_bumped      | improvement | -          | -                    | -            | -            | -          |
   | skill:feedback_applied    | improvement | -          | -                    | -            | -            | -          |
   | skill:reused              | reuse       | -          | -                    | -            | -            | -          |
   | skill:recommended         | reuse       | -          | -                    | -            | -            | -          |
   | skill:imported            | reuse       | -          | -                    | -            | -            | -          |

2. Phase 4 と Phase 6 のテスト仕様書を参照し、各セルを埋める（テスト仕様書名とテストケース番号を記載）
3. カバー率を算出する:
   - 目標: 全イベント種別の生成テスト 100%、バリデーションテスト 100%
   - 永続化テスト: カテゴリ代表1種別以上（5/5カテゴリ = 100%）
   - 異常系テスト: 主要イベント種別の 80% 以上

**期待される成果物**:

- イベントカテゴリ別カバレッジマトリクス（セル記入済み、カバー率算出済み）

---

### タスク2: 集約計算ロジックのカバレッジ確認

**目的**: 集約ビュー計算の全ロジックパスに対するテストカバレッジを確認する。

**実行手順**:

1. 計算ロジック別カバレッジマトリクスを作成する:

   | 計算ロジック       | 関数名                       | 正常系 | ゼロ除算 | 境界値 | 空データ | 大量データ | カバー状況 |
   | ------------------ | ---------------------------- | ------ | -------- | ------ | -------- | ---------- | ---------- |
   | 成功率計算         | calculateSuccessRate         | -      | -        | -      | -        | -          | -          |
   | トレンド判定       | calculateTrend               | -      | -        | -      | -        | -          | -          |
   | 推薦スコア計算     | calculateRecommendationScore | -      | -        | -      | -        | -          | -          |
   | 集約ビュー構築     | buildAggregateView           | -      | -        | -      | -        | -          | -          |
   | 改善優先度計算     | calculateImprovementPriority | -      | -        | -      | -        | -          | -          |
   | 公開メトリクス計算 | calculatePublishReadiness    | -      | -        | -      | -        | -          | -          |

2. Phase 4 と Phase 6 のテスト仕様書から該当テストケースを逆引きして各セルを埋める
3. 分岐カバレッジの確認:
   - `calculateTrend` の分岐: `improving` / `stable` / `declining` / デフォルト -> 全4パスがカバーされているか
   - `readinessLevel` の分岐: `ready` / `review_needed` / `not_ready` -> 全3パスがカバーされているか
   - 還流ルールの分岐: ルール1発火 / ルール2発火 / ルール3発火 / 複数発火 / 非発火 -> 全パスがカバーされているか
4. カバー率を算出する:
   - 目標: Line Coverage 80% 以上、Branch Coverage 60% 以上（02-code-quality.md 準拠）

**期待される成果物**:

- 集約計算ロジックカバレッジマトリクス（セル記入済み、分岐カバレッジ確認済み）

---

### タスク3: フィードバック還流パスのカバレッジ確認

**目的**: フィードバック記録からアクション生成までの全パスに対するテストカバレッジを確認する。

**実行手順**:

1. フィードバック還流パスマトリクスを作成する:

   | パス                    | テスト観点                 | Phase 4 テスト | Phase 6 テスト | カバー状況 |
   | ----------------------- | -------------------------- | -------------- | -------------- | ---------- |
   | auto_metric -> alert    | 成功率 <= 0.5 でアラート   | -              | -              | -          |
   | user_rating -> alert    | 平均 <= 3.0 でアラート     | -              | -              | -          |
   | user_text -> accumulate | テキスト蓄積               | -              | -              | -          |
   | improvement_suggestion  | 改善提案の構造化           | -              | -              | -          |
   | pending -> applied      | ステータス遷移（正常）     | -              | -              | -          |
   | pending -> dismissed    | ステータス遷移（正常）     | -              | -              | -          |
   | applied -> pending      | ステータス遷移（不正）     | -              | -              | -          |
   | dismissed -> applied    | ステータス遷移（不正）     | -              | -              | -          |
   | critical feedback       | hasCriticalFeedback = true | -              | -              | -          |
   | no feedback             | フィードバック0件          | -              | -              | -          |

2. Phase 4 と Phase 6 のテスト仕様書から該当テストケースを逆引きして各セルを埋める
3. 未カバーパスの特定:
   - 全パスがテスト仕様でカバーされていることを確認する
   - 未カバーのパスがある場合、Phase 6 への差し戻し対象として記録する

**期待される成果物**:

- フィードバック還流パスカバレッジマトリクス（セル記入済み、未カバーパス一覧）

---

## カバレッジゲート

### 基準値

| 指標                      | 最低基準 | 推奨基準 | 根拠                    |
| ------------------------- | -------- | -------- | ----------------------- |
| イベント種別カバー率      | 80%      | 100%     | 全17種別をカバー        |
| 計算ロジック正常系        | 100%     | 100%     | 全関数の正常系は必須    |
| 計算ロジック分岐          | 60%      | 80%      | 02-code-quality.md 準拠 |
| フィードバック還流パス    | 80%      | 100%     | 全パスをカバー          |
| 回帰ガード（P31/P42/P48） | 100%     | 100%     | 既知問題は必ずカバー    |

### ゲート判定

| 判定 | 条件                     | 次のアクション                |
| ---- | ------------------------ | ----------------------------- |
| PASS | 全指標が最低基準以上     | Phase 8（リファクタリング）へ |
| 未達 | いずれかの指標が基準未満 | Phase 6 に戻り追加テスト設計  |

---

## 参照資料

| 参照資料               | パス                                                | 内容             |
| ---------------------- | --------------------------------------------------- | ---------------- |
| Phase 4 成果物         | `outputs/phase-4/`                                  | テスト仕様書     |
| Phase 5 成果物         | `outputs/phase-5/`                                  | 実装仕様書       |
| Phase 6 成果物         | `outputs/phase-6/`                                  | テスト拡充仕様書 |
| 重複防止テスト仕様書   | `outputs/phase-6/duplicate-prevention-test-spec.md` | Phase 6 成果物   |
| 異常系テスト仕様書     | `outputs/phase-6/error-handling-test-spec.md`       | Phase 6 成果物   |
| 境界値テスト仕様書     | `outputs/phase-6/boundary-value-test-spec.md`       | Phase 6 成果物   |
| 回帰ガードテスト仕様書 | `outputs/phase-6/regression-guard-test-spec.md`     | Phase 6 成果物   |

### システム仕様（aiworkflow-requirements）

> カバレッジ基準の根拠として以下を参照してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| interfaces-agent-sdk-history         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         | SDK履歴インターフェース    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |

---

## 成果物

| 成果物                                 | パス                                                 | 内容                                      |
| -------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| イベントカテゴリ別カバレッジマトリクス | `outputs/phase-7/event-category-coverage-matrix.md`  | 17種別 x 4観点のカバレッジ状況            |
| 集約計算ロジックカバレッジマトリクス   | `outputs/phase-7/aggregate-logic-coverage-matrix.md` | 6関数 x 5観点のカバレッジ状況             |
| フィードバック還流パスカバレッジ       | `outputs/phase-7/feedback-path-coverage-matrix.md`   | 10パスのカバレッジ状況                    |
| カバレッジゲート判定書                 | `outputs/phase-7/coverage-gate-decision.md`          | PASS/未達判定、未カバー箇所一覧、対応方針 |

---

## 統合テスト連携

- PASS 判定の場合、Phase 8（リファクタリング）で本 Phase のカバレッジマトリクスを品質基準として使用する
- 未達判定の場合、Phase 6 に戻り不足テスト仕様を追加した後、再度本 Phase を実行する
- Phase 10（最終レビュー）で本 Phase のカバレッジゲート判定を検証項目に含める

---

## 完了条件

- [ ] イベントカテゴリ別カバレッジマトリクス（17種別 x 4観点）が完成している
- [ ] 集約計算ロジックカバレッジマトリクス（6関数 x 5観点）が完成している
- [ ] フィードバック還流パスカバレッジマトリクス（10パス）が完成している
- [ ] 全指標のカバー率が算出されている
- [ ] イベント種別カバー率が 80% 以上である（最低基準）
- [ ] 計算ロジック正常系カバー率が 100% である
- [ ] 計算ロジック分岐カバー率が 60% 以上である（最低基準）
- [ ] フィードバック還流パスカバー率が 80% 以上である（最低基準）
- [ ] 回帰ガード（P31/P42/P48）カバー率が 100% である
- [ ] カバレッジゲート判定（PASS/未達）が記録されている
- [ ] 未達の場合、Phase 6 への差し戻し対象が明記されている
- [ ] 全成果物が `outputs/phase-7/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: PASS 判定の場合 Phase 8（リファクタリング）へ進む。未達の場合 Phase 6 へ戻る

---

## 次のPhase

PASS 判定後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-8-refactoring.md`
