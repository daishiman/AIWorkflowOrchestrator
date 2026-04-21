# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001      |
| ステータス | 未実施                               |
| 作成日     | 2026-04-21                           |
| 入力       | Phase 2 成果物（`outputs/phase-2/`） |

## 目的

Phase 2 の設計が Phase 4（テスト作成）・Phase 5（実装）へ進める品質を満たしているかをレビューする。責務分離・依存関係・AbortSignal 設計・既存コードとの一貫性を多角的に確認し、進行可否を判定する。

## レビュー観点

### 観点 1: runCreateWorkflow() との一貫性

| 確認項目                                                            | 基準                                           |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| `runUpdateWorkflow()` のシグネチャが `runCreateWorkflow()` と同等か | `private async`, `signal?: AbortSignal` を含む |
| エラーハンドリングパターンが `runCreateWorkflow()` と一致するか     | `isAbortError` 判定・再スロー                  |
| `throwIfAborted()` の挿入タイミングが一致するか                     | 各非同期処理の前後                             |

### 観点 2: AbortSignal 設計の完全性

| ステップ            | AbortSignal 確認                       | 評価基準 |
| ------------------- | -------------------------------------- | -------- |
| 処理開始直後        | `throwIfAborted(signal)`               | 必須     |
| SKILL.md 読み込み後 | `throwIfAborted(signal)`               | 必須     |
| LLM 呼び出し内部    | `extractPurposeWithLlm()` 内で処理済み | 委譲     |
| 書き込み前          | `throwIfAborted(signal)`               | 必須     |

全てのチェックポイントがカバーされていれば「合格」とする。

### 観点 3: SKILL.md 更新戦略の妥当性

- purpose フィールドのみ再生成する方針は、他フィールド（name・description・allowed-tools 等）を破壊しないか
- LLM 不在時のフォールバック（purpose 変更なし）は、既存の `runCreateWorkflow()` のフォールバック戦略と整合しているか
- `fs.readFile()` → 更新 → `fs.writeFile()` の I/O パターンは、既存の `generateSkillMd()` や `ensureSkillMdExists()` と競合しないか

### 観点 4: 重複 emitProgress 問題の解消

- `case "update":` ブロックの後に続く `emitProgress("generating-skill")`（L426）が重複発火しないか
- 案A（モード判定追加）の実装コストと影響範囲が許容範囲内か

### 観点 5: テスト設計との整合性

- Phase 4 で設計するテストケース（UPD-NORMAL-01、UPD-NORMAL-02、UPD-ABORT-01〜03）が Phase 2 設計と整合するか
- `fs.readFile()` / `fs.writeFile()` のモックが既存テストインフラで実現可能か

## ゲート判定

| Gate 条件                                            | 判定方法                 | 結果   |
| ---------------------------------------------------- | ------------------------ | ------ |
| G-01: `runUpdateWorkflow()` シグネチャが確定している | Phase 2 設計書に記載あり | 未判定 |
| G-02: 処理フロー 6ステップが完全に記述されている     | Phase 2 設計書の確認     | 未判定 |
| G-03: AbortSignal 確認ポイントが全ステップにある     | 観点 2 の確認            | 未判定 |
| G-04: 重複 emitProgress の回避策が確定している       | 観点 4 の確認            | 未判定 |
| G-05: エラーハンドリングが全ケース設計されている     | 観点 1 の確認            | 未判定 |

**全条件が「承認」の場合のみ Phase 4 へ進む。**

| 判定            | 対応                                               |
| --------------- | -------------------------------------------------- |
| 全 Gate 承認    | Phase 4 へ進む                                     |
| G-01〜02 不承認 | Phase 2 Step 1（シグネチャ・フロー設計）へ差し戻し |
| G-03 不承認     | Phase 2 Step 1（AbortSignal 設計）へ差し戻し       |
| G-04 不承認     | Phase 2 Step 2（重複回避設計）へ差し戻し           |
| G-05 不承認     | Phase 2 Step 3（エラーハンドリング設計）へ差し戻し |

## 参照資料

- Phase 2 成果物: `outputs/phase-2/design-doc.md`
- Phase 2 成果物: `outputs/phase-2/flow-diagram.md`
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（L412-415, L980-1003）

## 受入基準

| ID     | 基準                                                         |
| ------ | ------------------------------------------------------------ |
| P3-001 | 5観点のレビューが全て実施されていること                      |
| P3-002 | 全 Gate（G-01〜G-05）の判定結果が記録されていること          |
| P3-003 | Phase 4 進行可否が明確に判定されていること                   |
| P3-004 | 差し戻しが発生した場合、差し戻し先と理由が記録されていること |

## 成果物

- `outputs/phase-3/design-review-result.md`（レビュー結果・Gate 判定・進行可否）

## タスク 100% 実行確認【必須】

- [ ] 5観点の全チェックが完了していること
- [ ] Gate G-01〜G-05 全ての判定が記録されていること
- [ ] Phase 4 への進行可否が明文化されていること

## 次 Phase

Phase 3 ゲート通過後、[Phase 4: テスト作成](phase-4-test-creation.md) へ進む。
