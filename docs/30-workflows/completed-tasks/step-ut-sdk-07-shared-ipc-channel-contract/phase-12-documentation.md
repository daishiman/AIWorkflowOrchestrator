# Phase 12: ドキュメント更新 - 5つの必須タスク実行

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| Phase名    | ドキュメント更新                           |
| 前提Phase  | Phase 11: 手動テスト                       |
| 後続Phase  | Phase 13                                   |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

Phase 12 の5つの必須タスクを全て実行し、実装ガイド・仕様更新サマリ・変更履歴・未タスク検出・スキルフィードバックを成果物として生成する。最終的に準拠チェックで全成果物の存在を確認する。

## 背景

shared channels.ts への3チャネル集約と desktop preload channels.ts の import 元変更について、ドキュメントレベルで記録・総括を行い、後続作業者への引き継ぎ資料を整備する。

---

## 実行タスク

### タスク12-1: Implementation Guide

**目的**: 実装内容を技術者・非技術者の両方が理解できる形で文書化する

**Part 1: なぜ必要か、何をするか、日常の例え、今回作ったもの**

- なぜこの変更が必要だったのか、背景を非技術者でも分かる言葉で説明する
- たとえば: を最低1回使い、日常の例えで概念を伝える
- Part 1 では技術用語を一切使用しない
- 今回作ったもの（成果物の概要）を平易に説明する

**Part 2: 型定義、使用例、エラーハンドリング、エッジケース、設定項目と定数一覧**

- 追加・変更した型定義を列挙する
- 使用例（コードスニペット）を示す
- エラーハンドリングの方針を記述する
- エッジケース（import パス誤り、circular dependency 等）を記述する
- 設定項目と定数一覧（3チャネルの文字列値）を表形式で示す

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### タスク12-2: System Spec Update Summary

**目的**: 正本仕様書への影響と更新状況を記録する

**Step 1-A: 完了記録と関連ドキュメントリンク**

- 本タスクの完了を記録する
- 関連するドキュメント（shared channels, preload channels, governance test）へのリンクを付ける
- 関連するテスト（`apps/desktop/src/preload/channels.test.ts`）へのリンクを付ける
- `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` を同一ターンで更新する
- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴を同一ターンで更新する
- `topic-map.md` を再生成して、関連セクションの行番号を同期する

**Step 1-B: 実装ステータス更新**

- 3チャネルの shared 側定義ステータスを「完了」に更新する
- desktop 側の import 元変更ステータスを「完了」に更新する

**Step 1-C: 関連タスクテーブル更新**

- TASK-SDK-07 との関連を記録する
- 後続タスク（もしあれば）との関連を記録する

**Step 2: ドメイン仕様更新（必須再判定）**

- 新規 exported constants の追加だが、`api-ipc-system-core.md` には既に `approval:respond` / `approval:request` / `execution:get-disclosure-info` が記録されているため、まず `resource-map.md` / `topic-map.md` で current canonical の到達先を確認する
- `api-ipc-system-core.md` / `quick-reference.md` / `security-*` などに semantic 変更が必要な場合のみ更新し、export 位置変更のみで内容差分がなければ no-op 理由を `system-spec-update-summary.md` に明記する
- 更新の有無にかかわらず `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して index/topic-map を同期する

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

### タスク12-3: Documentation Changelog

**目的**: 本タスクで発生した全てのドキュメント変更を記録する

**実行手順**:

1. 変更されたファイルを一覧化する
2. 各ファイルの変更種別（追加 / 修正 / 削除）を記録する
3. 変更理由を簡潔に記述する

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### タスク12-4: Unassigned Task Detection

**目的**: 未割り当てタスクを検出する（0件でも必ず出力する）

**検出ソース**:

- スコープ外項目（Phase 1 で定義）
- Phase 3 / Phase 10 の MINOR 発見事項
- Phase 11 の発見事項
- コード内の TODO / FIXME / HACK / XXX コメント

**4つの検出パターン**:

1. type → impl: 型定義はあるが実装がないもの
2. contract → test: 契約はあるがテストがないもの
3. UI spec → component: UI 仕様はあるがコンポーネントがないもの
4. spec inconsistency → decision: 仕様間の矛盾で決定が必要なもの

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

### タスク12-5: Skill Feedback Report

**目的**: スキル・ワークフローの改善点を記録する（改善点なしでも必ず出力する）

**カテゴリ**:

1. テンプレート改善: Phase 仕様書テンプレートの改善提案
2. ワークフロー改善: Phase 実行フローの改善提案
3. ドキュメント改善: ドキュメント構造・内容の改善提案
4. ポジティブ発見: うまく機能した点の記録

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

### 最終: Phase 12 準拠チェック

**目的**: 5つの必須成果物が全て生成されていることを確認する

**実行手順**:

1. タスク12-1〜12-5 の成果物ファイルが全て存在することを確認する
2. 各成果物が空でないことを確認する
3. 準拠チェック結果を記録する

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料             | パス                                                                         | 内容                   |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                                                    | スコープ・受入基準     |
| Phase 2 設計         | `phase-2-design.md`                                                          | 設計方針               |
| Phase 3 設計レビュー | `phase-3-design-review.md`                                                   | レビュー結果           |
| Phase 11 手動テスト  | `phase-11-manual-test.md`                                                    | 発見事項               |
| resource map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`             | canonical 逆引き       |
| topic map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                | 行番号・セクション参照 |
| spec update workflow | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`  | 仕様更新手順           |
| shared channels      | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャネル定義  |
| desktop channels     | `apps/desktop/src/preload/channels.ts`                                       | desktop 側チャネル定義 |
| governance test      | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 テスト           |

---

## 成果物

| 成果物                | パス                                                     | 内容                 |
| --------------------- | -------------------------------------------------------- | -------------------- |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2      |
| 仕様更新サマリ        | `outputs/phase-12/system-spec-update-summary.md`         | 正本仕様との同期記録 |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | 変更一覧             |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md`          | 未割り当てタスク一覧 |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | 改善提案             |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 5成果物の存在確認    |

---

## 完了条件

- [ ] タスク12-1: implementation-guide.md が Part 1（非技術・「たとえば:」含む）/ Part 2（技術詳細）で生成されている
- [ ] タスク12-2: system-spec-update-summary.md が Step 1-A/1-B/1-C/Step 2 で生成されている
- [ ] タスク12-3: documentation-changelog.md が生成されている
- [ ] タスク12-4: unassigned-task-detection.md が生成されている（0件でも出力）
- [ ] タスク12-5: skill-feedback-report.md が生成されている（改善点なしでも出力）
- [ ] phase12-task-spec-compliance-check.md で全成果物の存在が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 13: PR作成 → `phase-13-pr-creation.md`
