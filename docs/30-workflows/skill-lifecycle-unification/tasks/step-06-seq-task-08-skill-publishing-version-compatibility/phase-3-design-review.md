# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 3                            |
| Phase名    | 設計レビュー                 |
| 前提Phase  | Phase 2（設計）              |
| 後続Phase  | Phase 4（テスト作成）        |
| ステータス | 未実施                       |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

---

## 目的

Phase 2 で設計した公開レベルメタデータ、互換性チェックロジック、Skill Center フロー、配布操作責務境界、公開判定マトリクスの 5 つの設計が、Phase 1 の受入基準（AC-1〜AC-4）を充足し、既存システム仕様と整合しているかを多角的に検証する。

## 背景

TASK-SKILL-LIFECYCLE-08 は設計タスクであり、プロダクションコードを生成しない。設計タスクにおける Phase 3 は、Phase 4（テスト仕様作成）以降に進む前の品質ゲートとして機能する。設計に重大な問題がある場合は Phase 1 または Phase 2 へ差し戻し、手戻りコストを最小化する。TASK-SKILL-LIFECYCLE-08 は依存タスク（05/06/07）の成果物を横断参照するため、依存契約との整合性レビューが特に重要となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準充足性レビュー

**目的**: Phase 2 の 5 つの設計成果物が Phase 1 の受入基準（AC-1〜AC-4）を全て充足しているか検証する。

**実行手順**:

1. AC-1（共有/公開レベルが定義されている）の充足確認:
   - `outputs/phase-2/publishing-metadata-design.md` に `SkillVisibility` 型が定義されているか
   - 3 つの公開レベル（local/team/public）の遷移条件が StateChart で明示されているか
   - 各レベルの必須/任意メタデータフィールドが網羅されているか
2. AC-2（バージョン/互換性ルールが定義されている）の充足確認:
   - `outputs/phase-2/compatibility-check-design.md` に semver 判定ロジックが定義されているか
   - breaking change の判定基準が曖昧でないか（入力スキーマ削除、型変更が明示されているか）
   - 依存スキル間のバージョン制約解決アルゴリズムが定義されているか
3. AC-3（公開前安全性と観測指標が接続されている）の充足確認:
   - `outputs/phase-2/publish-readiness-design.md` に Task06（ToolRiskLevel/SafetyGateResult）からの入力が明示されているか
   - Task07（実行成功率/品質スコアトレンド/フィードバックスコア）からの入力が明示されているか
   - 判定マトリクスの閾値が数値で定義されているか（曖昧な「高い」「低い」ではなく）
4. AC-4（Skill Center との接続方針がある）の充足確認:
   - `outputs/phase-2/skill-center-flow-design.md` に登録・更新・公開停止の 3 フローが定義されているか
   - `SkillRegistryService` インターフェースが TypeScript 型として定義されているか

**期待される成果物**:

- 受入基準充足性チェックリスト（AC-1〜AC-4 各項目の PASS/FAIL 判定）

---

### タスク2: 依存タスク契約整合性レビュー

**目的**: TASK-SKILL-LIFECYCLE-05/06/07 の成果物との契約境界が整合しているか検証する。

**実行手順**:

1. Task05（利用導線）との整合性確認:
   - 公開スキルの CTA（Call to Action）が Task05 の利用導線設計と矛盾しないか
   - import フローが Task05 の「再利用シナリオ」と整合するか
2. Task06（安全性ゲート）との整合性確認:
   - `PublishReadinessChecker` が Task06 の `ToolRiskLevel` 型を正しく参照しているか
   - SafetyGateResult の承認ステータスの値セットが Task06 の定義と一致するか
3. Task07（観測指標）との整合性確認:
   - 公開判定マトリクスが Task07 の `SkillAggregateView` の計算ロジックと整合するか
   - 成功率・トレンド・フィードバックスコアの型が Task07 の定義と一致するか
4. 不整合が検出された場合は、影響範囲と修正方針を記録する

**期待される成果物**:

- 依存タスク契約整合性レポート（各タスクとの整合 PASS/FAIL 判定、不整合箇所リスト）

---

### タスク3: システム仕様整合性レビュー

**目的**: 既存のシステム仕様書（aiworkflow-requirements）との整合性を検証する。

**実行手順**:

1. `security-skill-execution.md` との整合確認:
   - 公開前安全性チェックが既存のセキュリティポリシーと矛盾しないか
   - 新規追加する型が既存の security 型体系に適合するか
2. `ui-ux-navigation.md` との整合確認:
   - Skill Center の公開/閲覧導線が既存ナビゲーション仕様と整合するか
   - レベル別 UI 表示（バッジ、フィルタ）が既存デザインシステムと統一されているか
3. `interfaces-agent-sdk-skill.md` との整合確認:
   - 新規追加する型（`SkillVisibility`, `SkillPublishingMetadata`, `CompatibilityCheckResult`）が既存の型体系と命名規則で統一されているか
   - IPC チャンネル追加が必要な場合、既存の IPC 契約ルールに準拠しているか
4. `lessons-learned-current.md` の教訓確認:
   - import/share drift の既知教訓が設計に反映されているか

**期待される成果物**:

- システム仕様整合性レポート（仕様書別 PASS/FAIL 判定、改善推奨リスト）

---

### タスク4: 設計品質レビュー

**目的**: 設計の技術的品質（複雑度、拡張性、テスト容易性）を評価する。

**実行手順**:

1. 複雑度の評価:
   - 公開レベル遷移 StateChart の状態数と遷移数が適切か（状態数 3、遷移数 6 以下を推奨）
   - 互換性チェックの判定分岐が過剰でないか
   - 公開判定マトリクスの条件組合せが爆発しないか
2. 拡張性の評価:
   - 将来の公開レベル追加（例: `organization`）に対応可能な設計か
   - 新しい互換性チェック条件の追加が容易か
   - 新しい配布操作の追加が既存の責務境界を壊さないか
3. テスト容易性の評価:
   - 各サービスインターフェースがモック可能か（DI パターンに適合しているか）
   - 判定ロジックが純粋関数として分離されているか
   - 副作用（IPC 通信、ファイル I/O）が境界に押し出されているか
4. simpler alternative（より簡素な代替案）の検討:
   - 設計が過剰に複雑でないか、より簡素な実現方法がないかを検討し結果を記録する

**期待される成果物**:

- 設計品質評価レポート（複雑度/拡張性/テスト容易性の各評価、simpler alternative 検討結果）

---

### タスク5: レビュー総合判定

**目的**: タスク1〜4 の結果を総合し、Phase 4 へ進行可能かを判定する。

**実行手順**:

1. タスク1〜4 の各レポートを集約する
2. 指摘事項を重大度別に分類する:
   - CRITICAL: 受入基準未達、セキュリティ違反
   - MAJOR: 依存契約不整合、仕様書矛盾
   - MINOR: 命名不統一、ドキュメント不足、改善推奨
3. 総合判定を以下の基準で下す:
   - PASS: CRITICAL 0件、MAJOR 0件（MINOR は追跡テーブルで管理）
   - MINOR: CRITICAL 0件、MAJOR 0件、MINOR 1件以上（指摘対応後 Phase 4 へ）
   - MAJOR: MAJOR 1件以上（Phase 2 または Phase 1 へ差し戻し）
   - CRITICAL: CRITICAL 1件以上（Phase 1 へ差し戻し、ユーザー確認）
4. MINOR 判定の場合、MINOR 追跡テーブルを作成する

**期待される成果物**:

- レビュー総合判定レポート（判定結果、指摘一覧、MINOR 追跡テーブル）

---

## 参照資料

| 参照資料                         | パス                                                                                                              | 内容                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Phase 1 成果物                   | `./phase-1-requirements.md`                                                                                       | 受入基準と要件定義                                      |
| Phase 2 成果物                   | `./phase-2-design.md`                                                                                             | 5 つの設計書                                            |
| 公開レベルメタデータ設計書       | `outputs/phase-2/publishing-metadata-design.md`                                                                   | 型定義・StateChart                                      |
| 互換性チェック設計書             | `outputs/phase-2/compatibility-check-design.md`                                                                   | 判定ロジック・依存解決                                  |
| Skill Center フロー設計書        | `outputs/phase-2/skill-center-flow-design.md`                                                                     | 登録・更新・停止フロー                                  |
| 配布操作設計書                   | `outputs/phase-2/distribution-operations-design.md`                                                               | import/export/fork/share                                |
| 公開判定ロジック設計書           | `outputs/phase-2/publish-readiness-design.md`                                                                     | 判定マトリクス                                          |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                   | 公開前安全性チェック                                    |
| security-skill-ipc               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                         | 配布操作IPCセキュリティ（設計整合性レビューの照合先）   |
| ui-ux-navigation                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                           | Skill Center 導線                                       |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | 型定義更新先（インデックス）                            |
| interfaces-agent-sdk-skill-share | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | TASK-9F共有型正本（配布操作設計の既存実装との整合確認） |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | import/share drift 教訓                                 |
| review-gate-criteria             | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                    | レビューゲート判定基準                                  |

---

## 統合テスト連携

Phase 3 はレビューフェーズのため、テストコードの作成・実行は行わない。ただし、以下の観点を Phase 4（テスト仕様作成）に引き継ぐ:

- 受入基準充足性レビューで検出された「テストで検証すべき条件」をリスト化する
- 依存タスク契約整合性レビューで検出された「結合テストで確認すべき契約境界」をリスト化する
- 設計品質レビューで「テスト容易性に課題がある」と判定された箇所を Phase 5 の DI 設計に反映する

---

## 成果物

| 成果物                       | パス                                               | 内容                             |
| ---------------------------- | -------------------------------------------------- | -------------------------------- |
| 受入基準充足性チェックリスト | `outputs/phase-3/acceptance-criteria-check.md`     | AC-1〜AC-4 の PASS/FAIL 判定     |
| 依存タスク契約整合性レポート | `outputs/phase-3/dependency-contract-alignment.md` | Task05/06/07 との整合判定        |
| システム仕様整合性レポート   | `outputs/phase-3/system-spec-alignment.md`         | aiworkflow-requirements との整合 |
| 設計品質評価レポート         | `outputs/phase-3/design-quality-evaluation.md`     | 複雑度・拡張性・テスト容易性評価 |
| レビュー総合判定レポート     | `outputs/phase-3/gate-decision.md`                 | PASS/MINOR/MAJOR/CRITICAL 判定   |

---

## 完了条件

- [ ] AC-1〜AC-4 の全項目について PASS/FAIL 判定が記録されている
- [ ] TASK-SKILL-LIFECYCLE-05/06/07 との契約境界が全て検証されている
- [ ] システム仕様（security/ui-ux/interfaces）との整合が全て検証されている
- [ ] 設計品質（複雑度/拡張性/テスト容易性）の評価が記録されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が下されている
- [ ] MINOR 判定の場合、MINOR 追跡テーブルが作成されている

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                   | 次のアクション                                 |
| -------- | -------------------------------------- | ---------------------------------------------- |
| PASS     | CRITICAL 0件、MAJOR 0件、MINOR 0件     | Phase 4 へ進行                                 |
| MINOR    | CRITICAL 0件、MAJOR 0件、MINOR 1件以上 | MINOR 追跡テーブル作成後 Phase 4 へ            |
| MAJOR    | MAJOR 1件以上                          | 影響範囲に応じて Phase 1 または Phase 2 へ戻る |
| CRITICAL | CRITICAL 1件以上                       | Phase 1 へ戻りユーザー確認                     |

### 戻り先決定基準

| 問題の種類                 | 戻り先              |
| -------------------------- | ------------------- |
| 受入基準の定義が不十分     | Phase 1（要件定義） |
| 設計の技術的問題           | Phase 2（設計）     |
| 依存タスク契約の根本不整合 | Phase 1（要件定義） |
| 型定義・命名の軽微な不統一 | Phase 2（設計）     |

### MINOR 追跡テーブル（gate-decision.md 用）

| MINOR ID                 | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ------------------------ | -------- | ------------- | ------------- | ---- |
| （レビュー実施時に記入） |          |               |               |      |

---

## タスク100%実行確認【必須】

| #   | 確認項目                                       | 合否基準                             |
| --- | ---------------------------------------------- | ------------------------------------ |
| 1   | タスク1〜5 の全成果物が生成されている          | 5 ファイル全て存在                   |
| 2   | 受入基準 AC-1〜AC-4 の判定が全て記録されている | 判定漏れ 0件                         |
| 3   | 依存タスク 3 件の契約整合が全て検証されている  | 未検証の契約境界 0件                 |
| 4   | 総合判定が明示的に下されている                 | PASS/MINOR/MAJOR/CRITICAL のいずれか |
| 5   | MINOR の場合、追跡テーブルが作成されている     | MINOR 判定時は必須                   |

---

## 多角的チェック観点（AIが判断）

- Phase 1 の受入基準 AC-1〜AC-4 が Phase 2 の設計書で全て具体的に満たされているか
- 依存タスク（Task05/06/07）の型定義と Phase 2 の型定義でフィールド名・型が一致しているか
- セキュリティ設計原則（最小権限・多層防御・フェイルセキュア）が設計に反映されているか
- simpler alternative（より単純な設計代替案）が検討・記録されているか
- Phase 2 の設計がテスト可能であるか（Phase 4 でテスト仕様が書ける粒度か）

---

## サブタスク管理

| #   | タスク名                     | ステータス | 完了基準                                 |
| --- | ---------------------------- | ---------- | ---------------------------------------- |
| 1   | 受入基準充足性レビュー       | 未実施     | AC-1〜AC-4 全項目の PASS/FAIL 判定が記録 |
| 2   | 依存タスク契約整合性レビュー | 未実施     | Task05/06/07 との契約境界が全て検証      |
| 3   | システム仕様整合性レビュー   | 未実施     | security/ui-ux/interfaces との整合が検証 |
| 4   | 設計品質レビュー             | 未実施     | 複雑度/拡張性/テスト容易性の評価が記録   |
| 5   | レビュー総合判定             | 未実施     | PASS/MINOR/MAJOR/CRITICAL が下されている |

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む（PASS/MINOR の場合）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（受入基準充足性レビュー）: （結果を記録）
- タスク2（依存タスク契約整合性レビュー）: （結果を記録）
- タスク3（システム仕様整合性レビュー）: （結果を記録）
- タスク4（設計品質レビュー）: （結果を記録）
- タスク5（レビュー総合判定）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 3 の総合判定が PASS または MINOR（追跡テーブル作成後）の場合、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/phase-4-test-creation.md`

Phase 4 では、Phase 2 の 5 つの設計書に対するテスト仕様（テストケース定義、期待値、テストデータ）を作成する。設計タスクのため、実行可能テストコードではなくテスト仕様書を成果物とする。

### Phase 4 開始条件

以下の**全て**を満たした場合のみ Phase 4 へ進行できる:

- [ ] 総合判定が PASS または MINOR である
- [ ] MINOR 判定の場合、全 MINOR 指摘が追跡テーブル（`gate-decision.md`）に登録されている
- [ ] CRITICAL・MAJOR 判定の指摘が 0 件である
- [ ] `outputs/phase-3/gate-decision.md` が存在し、判定結果が明示されている

### Phase 13 blocked 条件

以下のいずれかに該当する場合、Phase 13（完了）への進行をブロックする:

- 追跡テーブルに登録された MINOR 指摘のうち、`解決予定Phase` が Phase 13 以前のものが未解決のまま残っている
- `gate-decision.md` の総合判定が MAJOR または CRITICAL に変更された（再レビュー結果による）
- Phase 2 に差し戻された後、再レビューが実施されていない
