# 仕様抽出マップ — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 1 成果物 / 作成日: 2026-04-21

---

## 1. 概要

本ドキュメントは、実装対象コードの code anchor と system spec（仕様契約）の対応関係を整理する。  
各 anchor が「どの仕様に基づき動作するか」を明示し、実装時の参照先を一元化する。

---

## 2. Code Anchor と System Spec 対応表

| Code Anchor                         | 場所                                 | System Spec / 契約内容                                                                           | 仕様の出所                            |
| ----------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `runUpdateWorkflow()`               | `SkillCreatorService.ts`（新規追加） | update モード公開契約：`StructurePlanJson \| null` を返す private メソッド                       | 本タスク要件定義 AC-1〜AC-5           |
| `case "update":` in `createSkill()` | `SkillCreatorService.ts` L412-415    | update モード呼び出し契約：`runCreateWorkflow()` と同等のパターンで `runUpdateWorkflow()` を呼ぶ | 本タスク要件定義 AC-6〜AC-7           |
| `extractPurposeWithLlm()`           | `SkillCreatorService.ts` L1051-1073  | LLM purpose 生成契約：`llmClient.generate` を呼び、失敗時は `null` を返す                        | TASK-SC-LLM-PURPOSE-WIRE-001          |
| `PROGRESS_FLOWS.update`             | `SkillCreatorService.ts` L138-152    | progress semantics 契約：5 ステップの progress emit シーケンス                                   | TASK-SW-STREAM-FUP-03                 |
| `llmClient`                         | `SkillCreatorService.ts` L176        | LLM クライアント注入契約：`undefined` 許容、後方互換必須                                         | TASK-SC-LLM-PURPOSE-WIRE-001 AC-6     |
| `StructurePlanJson`                 | `SkillCreatorService.ts` L52-60      | 構造計画 JSON 契約：`generate_skill_md.js --plan` への入力型                                     | TASK-SC-IMP-CREATE-WORKFLOW-001       |
| `isAbortError()`                    | `SkillCreatorService.ts` L205-228    | abort 検出契約：`AbortError` を rethrow させる判定ロジック                                       | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| `resourceLoader.loadAgent()`        | `SkillCreatorService.ts` L955-959    | エージェント定義ロード契約：`extract-purpose` エージェント定義を文字列で返す                     | TASK-SC-LLM-PURPOSE-WIRE-001 AC-1     |

---

## 3. `runUpdateWorkflow()` — update モード公開契約

```
Contract: runUpdateWorkflow(options, signal?) => Promise<StructurePlanJson | null>

入力:
  - options: CreateSkillOptions（name, description を含む）
  - signal?: AbortSignal（キャンセル制御）

出力:
  - StructurePlanJson: purpose が更新された構造計画 JSON
  - null: LLM 失敗・スキル未存在など正常系フォールバック

副作用:
  - fs.readFile による既存 SKILL.md の読み取り
  - llmClient.generate による LLM 呼び出し（llmClient 存在時のみ）

エラー処理:
  - AbortError → rethrow（キャンセルを伝播させる）
  - その他例外 → null を返す（ワークフロー継続）
```

---

## 4. `extractPurposeWithLlm()` — LLM purpose 生成契約

```
Contract: extractPurposeWithLlm(options, signal?) => Promise<string | null>

入力:
  - options: CreateSkillOptions
  - signal?: AbortSignal

出力:
  - string: 正規化された purpose 文字列
  - null: llmClient 未注入 / LLM 呼び出し失敗

呼び出しパターン（runCreateWorkflow と同様）:
  1. resourceLoader.loadAgent("extract-purpose") でエージェント定義取得
  2. llmClient.generate({ system: agentDef, user: skillInput }) で purpose 生成
  3. normalizePurposeResponse() で正規化
```

---

## 5. `PROGRESS_FLOWS.update` — progress semantics 契約

| ステップ | phase              | percentage | message                   |
| -------- | ------------------ | ---------- | ------------------------- |
| 1        | `loading-skill`    | 10         | スキルを読み込んでいます  |
| 2        | `analyzing`        | 30         | 分析しています            |
| 3        | `generating-skill` | 60         | SKILL.md を生成しています |
| 4        | `validating`       | 90         | スキルを検証しています    |
| 5        | `done`             | 100        | 完了しました              |

**責務分担**:

- `loading-skill` / `analyzing` → `case "update":` が `runUpdateWorkflow()` 呼び出し前後に emit
- `generating-skill` / `validating` / `done` → `createSkill()` の共通後続処理が emit（`runCreateWorkflow()` と同一フロー）

---

## 6. Phase 12 Step 2 要否の初期仮説

| 判定項目                 | 判定    | 根拠                                                   |
| ------------------------ | ------- | ------------------------------------------------------ |
| 公開 API の変更          | なし    | `runUpdateWorkflow()` は private メソッド              |
| IPC ハンドラーの変更     | なし    | `createSkill()` のシグネチャ不変                       |
| 型定義ファイルへの影響   | なし    | `StructurePlanJson` / `SkillCreatorMode` は変更なし    |
| UI 層への影響            | なし    | progress 契約（PROGRESS_FLOWS.update）は既存定義を使用 |
| **Phase 12 Step 2 要否** | **N/A** | 内部実装のみ変更のため、system spec 同期は不要         |

---

## 7. 関連タスク参照

| タスク ID                             | 関連内容                                          |
| ------------------------------------- | ------------------------------------------------- |
| TASK-SC-LLM-PURPOSE-WIRE-001          | `extractPurposeWithLlm()` の実装契約              |
| TASK-SW-STREAM-FUP-03                 | `PROGRESS_FLOWS` の ownership と emit 契約        |
| TASK-SW-CANCEL-003                    | `cancelCurrentOperation()` / AbortController 管理 |
| TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 | private workflow の abort 入口保証                |
| TASK-SC-IMP-CREATE-WORKFLOW-001       | `generate_skill_md.js --plan` インターフェース    |
