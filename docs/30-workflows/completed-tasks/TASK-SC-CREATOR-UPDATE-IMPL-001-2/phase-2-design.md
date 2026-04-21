# Phase 2: 設計

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001            |
| ステータス | 未実施                                     |
| 作成日     | 2026-04-21                                 |
| 入力       | Phase 1 成果物（コード棚卸し・型定義確認） |

## 目的

`runUpdateWorkflow()` のアーキテクチャを設計し、Phase 4 のテスト設計・Phase 5 の実装が明確な仕様に基づいて進められる状態にする。既存の `runCreateWorkflow()` パターンとの一貫性を保ちながら、update モード特有の処理（既存 SKILL.md 読み込み・purpose 再生成・書き戻し）を設計する。

## runUpdateWorkflow() メソッド設計

### シグネチャ

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  skillDir: string,
  signal?: AbortSignal,
): Promise<void>
```

### 処理フロー（6ステップ）

| ステップ | 処理内容                                                                    | emitProgress                   | AbortSignal確認 |
| -------- | --------------------------------------------------------------------------- | ------------------------------ | --------------- |
| 1        | `throwIfAborted(signal)` による即時チェック                                 | -                              | ✅              |
| 2        | `fs.readFile(skillMdPath)` で既存 SKILL.md 読み込み                         | `loading-skill(10%)`           | -               |
| 3        | `throwIfAborted(signal)`                                                    | -                              | ✅              |
| 4        | `llmClient` 存在確認 → purpose 再生成（`extractPurposeWithLlm()` 呼び出し） | `analyzing(30%)`               | ✅（LLM内部）   |
| 5        | 更新済み内容を `fs.writeFile(skillMdPath)` で書き戻し                       | `generating-skill(60%)`        | -               |
| 6        | `throwIfAborted(signal)` → `validating` → `done`                            | `validating(90%)` `done(100%)` | ✅              |

### SKILL.md 更新戦略

`update` モードでの SKILL.md 更新は以下のルールに従う:

- **purpose フィールドのみ再生成対象**: `llmClient` が利用可能な場合、frontmatter の `purpose:` フィールドを LLM で再生成した値で置換する
- **その他フィールドは保持**: `name`・`description`・`allowed-tools` 等はそのまま維持する
- **LLM 不在時のフォールバック**: `llmClient` が `undefined` の場合は purpose を変更せず、SKILL.md をそのまま書き戻す（no-op に近い更新）

### case "update": ブロックの修正設計

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  await this.runUpdateWorkflow(options, skillDir, operationSignal);
  break;
```

`runUpdateWorkflow()` 内部で `generating-skill`・`validating`・`done` を emit するため、switch の外側にある `emitProgress("generating-skill")` の呼び出しとの重複に注意する。

### 重複 emitProgress の回避設計

現状のコードでは switch の後に `emitProgress("generating-skill")` が呼ばれる（L426）。`update` モードでは `runUpdateWorkflow()` 内部で emit するため、以下のいずれかの対策を設計する:

- **案A**: `runUpdateWorkflow()` が完了した後、`break` で switch を抜けて `emitProgress("generating-skill")` をスキップする（モード判定を追加）
- **案B**: `runUpdateWorkflow()` を switch の外に移動し、`emitProgress("generating-skill")` を skip する条件分岐を追加する
- **推奨**: 案A（最小変更で既存フローへの影響が少ない）

## エラーハンドリング設計

| エラーケース                     | 対応方針                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| SKILL.md が存在しない (`ENOENT`) | エラーをそのままスローする（update対象が不在はプログラムエラー）                          |
| LLM 呼び出し失敗                 | `null` にフォールバック（`extractPurposeWithLlm` 内部で処理済み）、purpose を変更せず続行 |
| AbortSignal 中断                 | `throwIfAborted(signal)` → `isAbortError` で再スロー                                      |
| SKILL.md 書き込み失敗            | エラーをそのままスロー                                                                    |

## 依存関係・責務境界

| コンポーネント                     | 責務                    | 呼び出し元                         |
| ---------------------------------- | ----------------------- | ---------------------------------- |
| `runUpdateWorkflow()`              | update フロー全体の調整 | `case "update":` ブロック          |
| `extractPurposeWithLlm()`          | LLM による purpose 生成 | `runUpdateWorkflow()`              |
| `throwIfAborted()`                 | AbortSignal 確認        | `runUpdateWorkflow()` の各ステップ |
| `fs.readFile()` / `fs.writeFile()` | SKILL.md の I/O         | `runUpdateWorkflow()`              |

`runUpdateWorkflow()` は Facade パターンの一部として、I/O・LLM・AbortSignal の各責務を既存メソッドに委譲する。

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（L412-415, L980-1003, L1051-1073）
- Phase 1 成果物: `outputs/phase-1/code-audit.md`
- Phase 1 成果物: `outputs/phase-1/skill-md-format.md`

## 受入基準

| ID     | 基準                                                        |
| ------ | ----------------------------------------------------------- |
| P2-001 | `runUpdateWorkflow()` のシグネチャが確定していること        |
| P2-002 | 6ステップの処理フローが記述されていること                   |
| P2-003 | SKILL.md 更新戦略（purpose のみ再生成）が記述されていること |
| P2-004 | 重複 `emitProgress` の回避設計が記述されていること          |
| P2-005 | エラーハンドリング設計が記述されていること                  |

## 成果物

- `outputs/phase-2/design-doc.md`（設計書）
- `outputs/phase-2/flow-diagram.md`（処理フロー図）

## タスク 100% 実行確認【必須】

- [ ] 全設計項目が記述されていること
- [ ] Phase 1 成果物との整合性が確認されていること
- [ ] Phase 3 レビューゲートの入力として十分な情報が揃っていること

## 次 Phase

Phase 2 完了後、[Phase 3: 設計レビュー](phase-3-design-review.md) へ進む。
