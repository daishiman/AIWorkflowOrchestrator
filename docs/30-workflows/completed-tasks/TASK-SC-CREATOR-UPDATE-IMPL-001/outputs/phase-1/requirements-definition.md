# 要件定義 — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 1 成果物 / 作成日: 2026-04-21

---

## 1. タスク概要

| 項目             | 内容                                                             |
| ---------------- | ---------------------------------------------------------------- |
| タスク ID        | TASK-SC-CREATOR-UPDATE-IMPL-001                                  |
| 対象ファイル     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`    |
| 変更対象メソッド | `createSkill()` の `case "update":` / 新規 `runUpdateWorkflow()` |
| 変更の性質       | スタブ解消（stub → 実装）                                        |
| 実装モード       | `new`（スタブの完全置換）                                        |

---

## 2. 現状の問題

`createSkill()` の `case "update":` は現在スタブ状態であり、進捗の emit のみを行う：

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;
```

`runUpdateWorkflow()` は存在せず、`case "update":` は実際のスキル更新処理を一切実行しない。  
`runCreateWorkflow()` と同等の LLM 連携と `StructurePlanJson` 生成が欠如している。

---

## 3. 受け入れ基準（AC-1〜AC-7）

| ID   | 検証可能な条件                                                                           | 確認方法                                                   |
| ---- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| AC-1 | `runUpdateWorkflow()` が private メソッドとして `SkillCreatorService` に存在する         | TypeScript コンパイル成功 + クラス定義確認                 |
| AC-2 | 既存 SKILL.md が存在する場合、`fs.readFile` でそのパスを読み込む                         | ユニットテスト: `readFile` モックへの呼び出し確認          |
| AC-3 | LLM クライアント（`llmClient`）が存在する場合、purpose 再生成を試みる                    | ユニットテスト: `llmClient.generate` 呼び出し確認          |
| AC-4 | LLM 呼び出し失敗時、既存 SKILL.md から読み取った purpose でフォールバックする            | ユニットテスト: `generate` が rejectされた場合の戻り値検証 |
| AC-5 | `runUpdateWorkflow()` は `StructurePlanJson \| null` を返す                              | TypeScript 戻り値型の確認                                  |
| AC-6 | `case "update":` が `runUpdateWorkflow()` を呼び出し、`structurePlan` に代入する         | コードレビュー + ユニットテスト                            |
| AC-7 | `case "update":` の後続処理（generating-skill 以降）が `case "create":` と同様に動作する | ユニットテスト: progress emit シーケンス確認               |

---

## 4. スコープ

### 含むもの

- `runUpdateWorkflow()` private メソッドの新規実装
- `createSkill()` の `case "update":` の更新（`runUpdateWorkflow()` 呼び出し追加）
- 既存 SKILL.md からの purpose 読み取りロジック
- LLM purpose 再生成（失敗時フォールバック付き）
- `StructurePlanJson | null` の返却

### 含まないもの

- `runCreateWorkflow()` の変更
- `collaborative` / `orchestrate` / `improve-prompt` モードへの影響
- IPC ハンドラーへの変更
- UI 層への変更
- 新たなテストファイルの追加（既存テストの pass を確認するのみ）
- SKILL.md のスキーマ変更

---

## 5. 実装モード採用理由

**採用モード**: `new`（新規メソッド追加 + 既存 case の更新）

**理由**:

- `runUpdateWorkflow()` は現時点で存在しないため、`new` モードが適切
- スタブ解消が目的であり、既存の `runCreateWorkflow()` を改修する `update` モードではない
- `case "update":` の変更は既存コードの部分的な置換であり、影響範囲は局所的

---

## 6. `implementation_mode` 衝突リスク記録

| リスク                        | 内容                                                              | 対処                                                                     |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `new` vs `new_feature` の混同 | タスク仕様で `new_feature` を使うと既存機能の拡張と誤解される恐れ | 本タスクは `new`（スタブ解消・新規追加）で統一                           |
| `update` モードとの意味的衝突 | `SkillCreatorMode = "update"` と実装モード `update` が同名        | 実装モードは常に `new` と明記。`SkillCreatorMode` は機能モードとして区別 |
| 既存テストへの影響            | `case "update":` の変更が既存テストを壊す可能性                   | SC-020 / SC-021 テストが update モードをカバー。事前に pass 確認必須     |

---

## 7. 非機能要件

| 項目           | 要件                                                                   |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| 型安全性       | `any` 型不使用。`StructurePlanJson                                     | null` の型を厳守 |
| エラー耐性     | `AbortError` は rethrow。それ以外の例外は null フォールバック          |
| パフォーマンス | LLM 呼び出し失敗時に追加レイテンシを生じさせない（即時フォールバック） |
| 後方互換性     | `llmClient` が undefined の場合でも既存動作を維持                      |
