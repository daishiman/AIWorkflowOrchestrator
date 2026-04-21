---
task_id: TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID
task_name: skill-creator progress payload への planId / requestId 付与による混線防止
task_type: NON_VISUAL
category: feature-improvement
status: in_progress
current_phase: 9
created_date: 2026-04-20
issue_number: 2300
issue_state: closed
---

# TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID

## メタ情報

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| タスク種別 | NON_VISUAL code task                                                  |
| 現在状態   | 実装・system spec sync は反映済み。targeted test は環境差分で blocked |
| 進捗       | Phase 1-8 完了、Phase 9 実測中、Phase 10-12 再同期中                  |

## ユーザー要求の要約

GitHub Issue #2300 で提起された `skill-creator:progress` payload の混線問題に対応する task 仕様書を、
`task-specification-creator` skill の Phase 1-13 骨格に沿って作成する。
issue は既に closed 状態だが、ユーザー指示に基づき closed のまま task 仕様書を作成する。
commit / push / PR は実施しない。コードの実装は行わない（仕様書のみ作成）。

## 現状整理

- 既存仕様書: `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md`
  - 単一 Markdown で Why / What / How / AC / 知見の構造。Phase 1-13 分割ではない
- 関連実装コード（未変更）:
  - `apps/desktop/src/preload/skill-creator-api.ts` — `SkillCreatorProgress` 型
  - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` — `sendSkillCreatorProgress` 関数
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `executeAsync` ルート
  - `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` — progress 受信 Hook
- 先行タスク: TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（完了済み）で phase マッピング整備済み

## 真の論点

1. 単一ブロードキャスト IPC チャンネル `skill-creator:progress` に発生元識別子がなく、
   並行 `executePlan` 実行時にどの planId の通知か判別できない
2. `SkillCreatorProgress` 型にオプショナルで `planId` / `requestId` を追加し、
   後方互換を壊さずに Renderer 側フィルタリングを可能にする
3. Runtime ルート（`executeAsync`）と従来ルート（`createSkill`）で progress emit 経路が異なる点を
   仕様書で整理し、両経路に planId 付与を行き渡らせる

## 価値とコスト

- 価値
  - 将来の複数スキル並行生成機能で進捗 UI が混線するリスクを事前に除去
  - セッション復元（TASK-P0-08）との競合による誤表示を防止
  - planId ベースのデバッグ容易性向上（ログ追跡可能）
- コスト
  - 型定義・関数シグネチャ・Hook の 4 ファイル修正
  - 既存テストの修正と新規フィルタリングテストの追加
  - オプショナルフィールド運用のため後方互換ロジックの明示が必要

## 4条件の初期評価

| 条件         | 初期判定 | 主因                                                                    |
| ------------ | -------- | ----------------------------------------------------------------------- |
| 矛盾なし     | PASS     | 既存実装と整合する方向で追加するだけ。破壊的変更はしない                |
| 漏れなし     | FAIL     | Phase 1-13 分割仕様がまだ存在しない。artifacts registry / gate が未定義 |
| 整合性あり   | FAIL     | Runtime ルートの progress 経路が既存仕様書で不確定のまま残っている      |
| 依存関係整合 | FAIL     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE との spec 参照リンクが未整備     |

## 最終ゴール

- `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加し、後方互換を維持
- Main 側 `sendSkillCreatorProgress` と Runtime ルートの emit 経路に planId を貫通させる
- Renderer 側 `useStreamingProgress` に `options.planId` フィルタを追加
- 既存テスト全 PASS + 新規 4 シナリオ（一致 / 不一致 / progress 未設定 / options 未設定）追加
- `task-specification-creator` Phase 1-13 + `aiworkflow-requirements` 整合

## スコープ

### 含む

- `docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/` 配下の phase spec 作成
- `index.md` / `artifacts.json` / phase-1.md 〜 phase-13.md の全 15 ファイル作成
- NON_VISUAL code task としての Phase 11 代替証跡方針定義
- 既存 `unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md` の位置づけ整理（参照 pointer 化）

### 含まない

- コード実装（型追加・関数修正・Hook 修正）の実施
- テスト実装の実施
- commit / push / PR 実行
- progress チャンネル多重化設計（planId 別チャンネル）

## 30思考法の適用方針

### 論理分析系

- 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考

役割: 既存 unassigned spec と実コードの差分を抽出し、後方互換の論理矛盾を除去。

### 構造分解系

- 要素分解、MECE、2軸思考、プロセス思考

役割: 4 ファイル変更 × 5 検証観点 × 13 Phase を MECE に分割する。

### メタ・抽象系

- メタ思考、抽象化思考、ダブル・ループ思考

役割: progress チャンネル多重化でなく payload メタデータ戦略を採用する判断根拠を支える。

### 発想・拡張系

- ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考

役割: 「planId 未設定なら受け入れる」という逆説的後方互換ロジックの妥当性検証。

### システム系

- システム思考、因果関係分析、因果ループ

役割: 単一 IPC チャンネル → 並行実行 → UI 混線 → デバッグ困難 の因果ループを断つ。

### 戦略・価値系

- トレードオン思考、プラスサム思考、価値提案思考、戦略的思考

役割: チャンネル多重化の抜本設計コストと payload 拡張の漸進性をトレードオンする。

### 問題解決系

- why思考、改善思考、仮説思考、論点思考、KJ法

役割: 真因を「発生元識別子の欠如」に絞り、改善対象を payload フィールドに集中させる。

## 参照根拠

- `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md` — 既存 unassigned spec
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/task-specification-creator/references/create-workflow.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

## Phase 一覧

| Phase | 名称             | 仕様書                                                       | 目的                                                                                                              | ステータス  |
| ----- | ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | 混線問題の要件と受入基準を再固定する                                                                              | completed   |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | 型・関数・Hook の変更設計と SubAgent lane を決める                                                                | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | 30思考法と 4条件で設計の PASS / MAJOR / MINOR を判定する                                                          | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | filter 一致 / 不一致 / 後方互換 2 パターンのテストシナリオを定義する                                              | completed   |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | tracking payload 実装とテスト更新方針を定義する                                                                   | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | エッジケース（空文字 planId / useEffect 依存配列挙動）を追加する                                                  | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)                   | filter 分岐と送信経路のカバレッジを確認する                                                                       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | progress 送信ヘルパー共通化の要否を判定する                                                                       | completed   |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | typecheck / lint / targeted test を固定する                                                                       | in_progress |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | AC-1 〜 AC-9 と phase evidence を横断確認する                                                                     | pending     |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | NON_VISUAL code task として代替証跡（grep / 型参照監査）を固定する                                                | in_progress |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | mandatory 5 tasks（branch 内 review / system spec sync / changelog / unassigned 検出 / skill feedback）を実施する | in_progress |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー承認待ちとして pending のまま保留する                                                                     | not_started |

## Canonical Artifacts

| Phase | 成果物                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/current-implementation-audit.md`, `outputs/phase-1/artifact-canonical-list.md`                                                                                                                                                       |
| 2     | `outputs/phase-2/solution-design.md`, `outputs/phase-2/subagent-lane-plan.md`, `outputs/phase-2/validation-path.md`                                                                                                                                                                                 |
| 3     | `outputs/phase-3/design-review-result.md`, `outputs/phase-3/solution-elegance-review.md`, `outputs/phase-3/review-prompt.txt`                                                                                                                                                                       |
| 4     | `outputs/phase-4/test-scenarios.md`, `outputs/phase-4/command-expectations.md`                                                                                                                                                                                                                      |
| 5     | `outputs/phase-5/implementation-diff-plan.md`, `outputs/phase-5/patch-plan.md`                                                                                                                                                                                                                      |
| 6     | `outputs/phase-6/regression-expansion-plan.md`                                                                                                                                                                                                                                                      |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactor-decision-log.md`                                                                                                                                                                                                                                                          |
| 9     | `outputs/phase-9/quality-gate-report.md`                                                                                                                                                                                                                                                            |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/discovered-issues.md`                                                                                                                                                                      |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/local-check-result.md`, `outputs/phase-13/change-summary.md`, `outputs/phase-13/pr-info.md`, `outputs/phase-13/pr-creation-result.md`                                                                                                                                             |

## SubAgent 編成

| Lane   | 役割                                                         | 実行形態 |
| ------ | ------------------------------------------------------------ | -------- |
| Lane A | 設計書作成（Phase 1-3）                                      | 直列     |
| Lane B | テスト / 実装 / カバレッジ仕様書作成（Phase 4-7）            | 並列     |
| Lane C | リファクタ / 品質保証 / 最終レビュー仕様書作成（Phase 8-10） | 並列     |
| Lane D | 手動テスト / ドキュメント / PR 仕様書作成（Phase 11-13）     | 並列     |

## ゲート

- Phase 1 から Phase 2: 4条件の修正方針 / AC-1〜AC-9 固定
- Phase 2 から Phase 3: Runtime ルート emit 経路方針の決定
- Phase 3 から Phase 4: 4条件 PASS または修正方針確定
- Phase 9 から Phase 10: typecheck / lint / targeted test すべて PASS
- Phase 10 から Phase 11: `final-review-result.md` で blocker 0 件
- Phase 12 から Phase 13: mandatory 5 tasks 完了、`artifacts.json` parity 完了
- Phase 13: user 承認があるまで blocked
