# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 10                           |
| Phase名    | 最終レビュー                 |
| 前提Phase  | Phase 9（品質検証）          |
| 後続Phase  | Phase 11（手動テスト）       |
| ステータス | 完了（2026-03-17 再監査）    |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

---

## 目的

受入基準（AC-1〜AC-4）の最終充足確認、Phase 3 MINOR 追跡事項の解決確認、依存タスクとの最終整合確認を行い、Phase 11 への進行可否を判定する。

## 背景

TASK-SKILL-LIFECYCLE-08 は設計タスクであり、プロダクションコードを生成しない。Phase 10 は本タスクの最終品質ゲートである。設計タスクとして Phase 1〜9 を経て積み上げた型定義・インターフェース設計・フロー設計が、Phase 1 で定義した受入基準を全て充足しているかを多角的に最終確認する。Phase 11 は設計文書ウォークスルー（SF-01）であり、この Phase で PASS を得られた設計のみが次フェーズに進む。

---

## 実行タスク

### タスク1: 受入基準（AC-1〜AC-4）最終確認

**目的**: Phase 2〜9 の全成果物が Phase 1 の受入基準を最終的に充足しているかを確認する。

**実行手順**:

1. AC-1（公開レベルの定義と遷移 StateChart）の充足確認:
   - **証跡1**: `outputs/phase-2/publishing-metadata-design.md` に `SkillVisibility = "local" | "team" | "public"` の3値定義が含まれていること
   - **証跡2**: 同ファイルに local→team→public の昇格条件（必須フィールド充足 + 互換性チェック PASS）と降格条件（teamId 無効化、公開停止承認）が全て StateChart で明示されていること
   - **証跡3**: `outputs/phase-1/publishing-levels.md` に権限マトリクス（visibility/shared_with/tags/license の変更権限）が含まれていること
   - **証跡4**: `outputs/phase-5/type-definitions.md` に `SkillPublishingMetadata` の全フィールドが visibility 別の必須/任意として型レベルで定義されていること
   - **証跡5**: `outputs/phase-8/dedup-plan.md` で packages/shared への一元化が確定していること
2. AC-2（semver/schema/依存互換性チェックロジック）の充足確認:
   - **証跡1**: `outputs/phase-2/compatibility-check-design.md` に semver major（入力スキーマの必須フィールド削除・型変更）/minor（任意パラメータ追加）/patch（ドキュメントのみ変更）の判定基準が具体的条件で定義されていること
   - **証跡2**: breaking change の判定基準が「既存フィールド削除」「型の非互換変更」として明示されていること
   - **証跡3**: 依存スキル間のバージョン制約解決アルゴリズム（conflict detection）が定義されていること
   - **証跡4**: `outputs/phase-5/type-definitions.md` に `CompatibilityCheckResult` 型（`level`, `breakingChanges`, `warnings`, `suggestedBump`）が定義されていること
3. AC-3（Task06/07 入力→公開判定マトリクスの接続）の充足確認:
   - **証跡1**: `outputs/phase-2/publish-readiness-design.md` に Task06 の `ToolRiskLevel`（`"low" | "medium" | "high" | "critical"`）からの入力接続が明示されていること
   - **証跡2**: Task07 の `ObservabilityMetrics`（`successRate`, `qualityTrend`, `feedbackScore`）からの入力接続が明示されていること
   - **証跡3**: 判定マトリクスの全閾値が数値で定義されていること — 公開ブロック: `maxRiskLevel` が `"critical"` または `"high"`、警告: `deniedRatio >= 0.5`・`testPassRate < 0.8`、推奨: `maxRiskLevel === "low"` + `testPassRate >= 0.95` + `avgScore >= 4.0`（`outputs/phase-1/safety-gate-connection.md` で定義された閾値と一致すること）
   - **証跡4**: `outputs/phase-5/type-definitions.md` に `PublishReadiness` 型（4ステータス判別 union）が定義されていること
   - **証跡5**: `outputs/phase-4/publish-readiness-test-spec.md` に全6判定パスのテスト仕様が定義されていること
4. AC-4（Skill Center 登録・更新・停止フロー）の充足確認:
   - **証跡1**: `outputs/phase-2/skill-center-flow-design.md` に登録（Step 1-4）・更新（互換性チェック→承認→公開）・公開停止（deprecation→30日 grace period→removal）の 3 フローがシーケンス図記述で定義されていること
   - **証跡2**: `outputs/phase-2/distribution-operations-design.md` に import/export/fork/share の4操作の責務マトリクスが定義されていること
   - **証跡3**: `outputs/phase-5/service-interfaces.md` に `SkillRegistryService`（5メソッド）と `SkillDistributionService`（4メソッド）のインターフェースが TypeScript 型として定義されていること
   - **証跡4**: `outputs/phase-9/security-check-report.md` のセキュリティ確認が全て PASS であること

**期待される成果物**: `outputs/phase-10/acceptance-criteria-final.md`（AC-1〜AC-4 別最終 PASS/FAIL 判定・証跡ファイルパス）

---

### タスク2: Phase 3 MINOR 追跡テーブル解決確認

**目的**: Phase 3 設計レビューで検出された全 MINOR 指摘が「解決済み」または「未タスク化済み」になっているかを確認する。

**実行手順**:

1. `outputs/phase-3/gate-decision.md` の MINOR 追跡テーブルを参照する
2. 各 MINOR 指摘について以下のいずれかが達成されていることを確認する:
   - 解決済み: Phase 4〜9 のいずれかで対応された証跡（成果物ファイルパスと該当箇所）が記録されていること
   - 未タスク化済み: `docs/30-workflows/unassigned-task/` に独立した指示書ファイルが存在し、`task-workflow.md` の残課題テーブルに登録されていること（P3/P58 準拠）
3. 解決も未タスク化もされていない MINOR 指摘が 0 件であることを確認する
4. 未解決の MINOR 指摘が発見された場合、即時未タスク化の手順（P3 の 3 ステップ）を実行する

**期待される成果物**: `outputs/phase-10/minor-tracking-resolution.md`（MINOR 追跡テーブルの最終状態・各指摘の解決証跡または未タスクパス）

---

### タスク3: 依存タスク最終整合確認

**目的**: TASK-SKILL-LIFECYCLE-05/06/07 の最新設計と TASK-SKILL-LIFECYCLE-08 の設計が整合していることを最終確認する。

**実行手順**:

1. Task05（利用導線）との最終整合確認:
   - Task05 の Phase 2 設計書（`docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`）を参照し、import フローと公開スキル CTA の設計が矛盾していないことを確認する
2. Task06（安全性ゲート）との最終整合確認:
   - Task06 の Phase 2 設計書（`docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/phase-2-design.md`）を参照し、`ToolRiskLevel` 型の値セットが Task08 の判定マトリクスと一致していることを確認する
   - `SafetyGateResult` の承認ステータス値（APPROVED/REJECTED/PENDING 等）が両タスクで一致していることを確認する
3. Task07（観測指標）との最終整合確認:
   - Task07 の Phase 2 設計書（`docs/30-workflows/completed-tasks/TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md`）を参照し、`SkillAggregateView` の計算ロジックが Task08 の閾値定義と整合していることを確認する
4. 差分が発見された場合、差分内容・影響範囲・修正案を記録する

**期待される成果物**: `outputs/phase-10/dependency-final-check.md`（Task05/06/07 別最終整合確認結果・差分リスト・修正案）

---

### タスク4: Phase 9 品質ゲート結果の最終確認

**目的**: Phase 9 の品質ゲート結果が全項目 PASS（または CONDITIONAL PASS の修正済み）であることを確認する。

**実行手順**:

1. `outputs/phase-9/quality-gate-result.md` を参照し、品質ゲートチェックリストの全 8 項目が PASS であることを確認する
2. Phase 9 で CONDITIONAL PASS だった場合、修正指示が全て実施済みであることを確認する
3. 未修正の指摘が残っている場合は、本 Phase の総合判定を MINOR 以下に格下げする
4. Phase 9 で FAIL だった場合は、本 Phase の総合判定を CRITICAL とし、差し戻し先を特定する

**期待される成果物**: タスク5 の `final-review-decision.md` に Phase 9 結果の最終確認セクションを含める（独立ファイルは作成しない）

---

### タスク5: 総合判定

**目的**: タスク1〜4 の結果を総合し、Phase 11 へ進行可能かを判定する。

**実行手順**:

1. タスク1〜4 の結果を以下のレビューゲートテーブルに照合する:

   | 判定     | 条件                                        | 次のアクション                   |
   | -------- | ------------------------------------------- | -------------------------------- |
   | PASS     | 全 AC 充足・全 MINOR 解決・品質ゲート PASS  | Phase 11 へ                      |
   | MINOR    | 軽微な指摘あり（受入基準は充足）            | 未タスク仕様書変換後 Phase 11 へ |
   | MAJOR    | 受入基準の一部未充足または依存契約不整合    | 影響範囲に応じて Phase 1-5 へ    |
   | CRITICAL | 致命的問題（セキュリティ違反・AC 全未充足） | Phase 1 へ戻りユーザー確認       |

2. 総合判定を下す:
   - PASS 基準: AC-1〜AC-4 全充足 + 全 MINOR 解決済み + 品質ゲート全 PASS + 依存タスク整合
   - MINOR 基準: 上記のうち軽微な未対応事項があり、機能影響なし
   - MAJOR 基準: 受入基準の 1 件以上が未充足、または依存タスクとの契約不整合が存在
   - CRITICAL 基準: セキュリティ違反が存在、または複数の受入基準が根本から未充足
3. MINOR 判定の場合、全指摘を未タスク仕様書に変換する（省略不可。P3/P58 準拠の 3 ステップを実行する）:
   1. `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成する
   2. `task-workflow.md` 残課題テーブルに登録する
   3. 関連仕様書に参照リンクを追加する
4. 判定根拠・指摘事項・未タスクパスを最終判定レポートに記録する

**期待される成果物**: `outputs/phase-10/final-review-decision.md`（総合判定・判定根拠・指摘事項・未タスクパス一覧）

---

## 参照資料

| 参照資料                   | パス                                                                              | 内容                      |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件定義           | `./phase-1-requirements.md`                                                       | AC-1〜AC-4 受入基準の原典 |
| Phase 2 設計               | `./phase-2-design.md`                                                             | 5 つの設計書              |
| Phase 3 レビュー           | `./phase-3-design-review.md`                                                      | MINOR 追跡テーブル        |
| Phase 4 テスト仕様         | `./phase-4-test-creation.md`                                                      | テスト仕様                |
| Phase 5 型定義確定書       | `./phase-5-implementation.md`                                                     | 型定義の全フィールド      |
| Phase 6 拡充テスト仕様     | `./phase-6-test-expansion.md`                                                     | 境界テスト仕様            |
| Phase 7 カバレッジ         | `./phase-7-coverage-check.md`                                                     | カバレッジ結果            |
| Phase 8 リファクタリング   | `./phase-8-refactoring.md`                                                        | 型整理・命名統一結果      |
| Phase 9 品質検証           | `./phase-9-quality-assurance.md`                                                  | 品質ゲート結果            |
| Phase 9 品質ゲート総合判定 | `outputs/phase-9/quality-gate-result.md`                                          | 全8項目のPASS/FAIL結果    |
| Phase 9 セキュリティ確認   | `outputs/phase-9/security-check-report.md`                                        | セキュリティ検証結果      |
| Phase 8 型重複排除計画     | `outputs/phase-8/dedup-plan.md`                                                   | 一元化確定の証跡          |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型定義整合の最終確認      |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | 公開安全性の最終確認      |

---

## 統合テスト連携

Phase 10 は最終レビューフェーズのため、新規テストコードを作成しない。以下の引き継ぎ事項を Phase 11 に渡す:

- 総合判定結果（PASS/MINOR/MAJOR/CRITICAL）
- MINOR 未タスク化した指摘の仕様書パス一覧
- Phase 11 手動テストで重点確認すべき領域（受入基準の充足証跡として確認が必要な箇所）

---

## 成果物

| 成果物                         | パス                                            | 内容                                                                                              |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 受入基準最終確認レポート       | `outputs/phase-10/acceptance-criteria-final.md` | AC-1〜AC-4 別最終 PASS/FAIL・証跡                                                                 |
| MINOR 追跡解決確認レポート     | `outputs/phase-10/minor-tracking-resolution.md` | 全 MINOR 指摘の解決証跡または未タスクパス                                                         |
| 依存タスク最終整合確認レポート | `outputs/phase-10/dependency-final-check.md`    | Task05/06/07 別整合確認結果・差分リスト                                                           |
| 最終判定レポート               | `outputs/phase-10/final-review-decision.md`     | 総合判定・判定根拠・未タスクパス一覧・Phase 9 品質ゲート最終確認セクション（タスク4の結果を含む） |

---

## 完了条件

- [ ] AC-1〜AC-4 の全受入基準について最終 PASS/FAIL 判定が記録されている
- [ ] Phase 3 の全 MINOR 指摘が「解決済み（証跡あり）」または「未タスク化済み（指示書パスあり）」のいずれかになっている
- [ ] Task05/06/07 との最終整合確認が全て実施されている
- [ ] Phase 9 の品質ゲート全 8 項目が最終 PASS であることが確認されている
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が明示されている
- [ ] MINOR 判定の場合、全指摘が未タスク仕様書に変換され P3 の 3 ステップが実施されている
- [ ] 4 つの成果物ファイルが全て生成されている

---

## タスク100%実行確認【必須】

| #   | 確認項目                                                | 合否基準                                             |
| --- | ------------------------------------------------------- | ---------------------------------------------------- |
| 1   | タスク1〜5 の全成果物が生成されている                   | 4 ファイル全て存在                                   |
| 2   | AC-1〜AC-4 の全受入基準が最終確認されている             | 確認漏れ AC 項目 0 件                                |
| 3   | Phase 3 の全 MINOR 指摘が解決または未タスク化されている | 未対応 MINOR 指摘 0 件                               |
| 4   | 総合判定が 4 択（PASS/MINOR/MAJOR/CRITICAL）のいずれか  | 「保留」「要確認」等の曖昧判定は不可                 |
| 5   | MINOR の場合、未タスク P3 の 3 ステップが全て実施済み   | 指示書ファイル存在 + task-workflow 登録 + リンク追加 |

---

## 多角的チェック観点（AIが判断）

- AC-1〜AC-4 の全受入基準が Phase 2 の設計書で具体的に満たされているか（Phase 1 との一貫性）
- Phase 3 の全 MINOR 指摘が解決済みまたは未タスク化済みか（追跡テーブルとの照合）
- Task05/06/07 との最終整合が Phase 9 の結果と一致しているか
- Phase 9 の品質ゲート全8項目が Phase 10 時点でも依然 PASS か（劣化していないか）
- MINOR 判定の場合、未タスク仕様書が P3 の3ステップ（指示書+台帳+リンク）を全て完了しているか

---

## サブタスク管理

| #   | タスク名                           | ステータス | 完了基準                            |
| --- | ---------------------------------- | ---------- | ----------------------------------- |
| 1   | 受入基準（AC-1〜AC-4）最終確認     | 完了       | 全AC項目の最終 PASS/FAIL 判定が記録 |
| 2   | Phase 3 MINOR 追跡テーブル解決確認 | 完了       | 未対応 MINOR 指摘 0件               |
| 3   | 依存タスク最終整合確認             | 完了       | Task05/06/07 全て検証済み           |
| 4   | Phase 9 品質ゲート結果の最終確認   | 完了       | 全8項目が最終 PASS                  |
| 5   | 総合判定                           | 完了       | PASS/MINOR/MAJOR/CRITICAL が明示    |

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション                                         |
| -------- | ------------------------ | ------------------------------------------------------ |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行                                        |
| MINOR    | 軽微な指摘あり           | 全指摘を未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて Phase 1-5 へ戻る                      |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認                             |

### 戻り先決定基準

| 問題の種類             | 戻り先                |
| ---------------------- | --------------------- |
| 受入基準の定義が不十分 | Phase 1（要件定義）   |
| 設計の技術的問題       | Phase 2（設計）       |
| テスト設計の問題       | Phase 4（テスト）     |
| 実装の問題             | Phase 5（実装）       |
| 品質の問題             | Phase 8（リファクタ） |

---

## 依存関係

- **前提**: Phase 9（品質検証）が完了していること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR の場合）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（受入基準最終確認）: （結果を記録）
- タスク2（Phase 3 MINOR 追跡テーブル解決確認）: （結果を記録）
- タスク3（依存タスク最終整合確認）: （結果を記録）
- タスク4（Phase 9 品質ゲート結果の最終確認）: （結果を記録）
- タスク5（総合判定）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 10 の総合判定が PASS または MINOR（未タスク仕様書変換後）の場合、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/phase-11-manual-test.md`

Phase 11 では、設計タスクの手動検証として Phase 2 の設計書を実際の既存コードベースと突き合わせ、設計の実現可能性を確認する。

MAJOR または CRITICAL の場合は以下の差し戻し基準に従う:

- MAJOR（受入基準一部未充足）: 影響する AC に対応する Phase へ戻る（AC-1→Phase 2 タスク1、AC-2→Phase 2 タスク2、AC-3→Phase 2 タスク5、AC-4→Phase 2 タスク3）
- CRITICAL（致命的問題）: Phase 1 へ戻りユーザーと受入基準を再確認する
