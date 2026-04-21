# アーキテクチャ設計 — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 2 成果物 / 作成日: 2026-04-21

---

## 1. 設計方針

- `runCreateWorkflow()` の構造を踏襲し、差分を最小化する
- 既存 SKILL.md の読み取りを追加するが、失敗時は graceful degradation
- `extractPurposeWithLlm()` は既存実装をそのまま呼び出す（共有）
- `generateFeaturesWithLlm()` は update モードでは呼ばない（既存 features を維持）
- private メソッドの追加のみ。public API・IPC・型定義は一切変更しない

---

## 2. Target Topology テーブル

| Concern                    | Owner                               | Input                               | Output                                                    |
| -------------------------- | ----------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| update モード呼び出し制御  | `createSkill()` の `case "update":` | `CreateSkillOptions`, `AbortSignal` | `StructurePlanJson \| null`（`structurePlan` 変数へ代入） |
| 既存 SKILL.md 読み取り     | `runUpdateWorkflow()`               | `skillDir` パス                     | SKILL.md の文字列内容（失敗時 `null`）                    |
| purpose 抽出（LLM）        | `extractPurposeWithLlm()` （既存）  | `CreateSkillOptions`, `AbortSignal` | purpose 文字列（失敗時 `null`）                           |
| purpose フォールバック決定 | `runUpdateWorkflow()`               | LLM 結果 + SKILL.md 内容            | 最終 purpose 文字列                                       |
| 構造計画 JSON 生成         | `runUpdateWorkflow()`               | purpose, name, description          | `StructurePlanJson`                                       |
| SKILL.md 生成              | `generateSkillMd()` （既存）        | `StructurePlanJson`                 | SKILL.md ファイル                                         |
| 検証                       | `validateSkill()` （既存）          | skillDir                            | boolean                                                   |

---

## 3. 処理フローと progress 責務テーブル（5 ステップ）

| Step | phase              | 責務者                   | 処理内容                                                                                                          |
| ---- | ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1    | `loading-skill`    | `case "update":`         | `emitProgress("loading-skill")` を emit してから `runUpdateWorkflow()` を呼び出す                                 |
| 2    | `analyzing`        | `case "update":`         | `runUpdateWorkflow()` 完了後に `emitProgress("analyzing")` を emit する（または内部で emit）                      |
| 3    | `generating-skill` | `createSkill()` 共通処理 | `runUpdateWorkflow()` 完了後、`emitProgress("generating-skill")` → `generateSkillMd()` or `ensureSkillMdExists()` |
| 4    | `validating`       | `createSkill()` 共通処理 | `emitProgress("validating")` → `validateSkill()`                                                                  |
| 5    | `done`             | `createSkill()` 共通処理 | `emitProgress("done")` → `return skillDir`                                                                        |

**設計判断**: `loading-skill` は `runUpdateWorkflow()` 呼び出し前に emit し、  
`analyzing` は呼び出し直後（戻り値受け取り後）に emit する。  
これにより「読み込み中」→「分析中」のユーザー体験上の順序が保たれる。

---

## 4. `runUpdateWorkflow()` 詳細設計

### シグネチャ

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null>
```

### 処理フロー

```
1. throwIfAborted(signal)
2. 既存 SKILL.md の読み取り
   - skillDir = path.join(this.skillsDir, options.name)
   - skillMdPath = path.join(skillDir, "SKILL.md")
   - existingContent = await fs.readFile(skillMdPath, "utf-8") を try/catch
   - 失敗時: existingContent = null
3. throwIfAborted(signal)
4. LLM purpose 再生成
   - purpose = await this.extractPurposeWithLlm(options, signal)
   - purpose が null かつ existingContent がある場合: existingContent の先頭部分から purpose を抽出
   - purpose が null かつ existingContent もない場合: options.description を使用
5. StructurePlanJson 生成
   - return {
       skillName: options.name,
       description: options.description,
       purpose: resolvedPurpose,
       features: [],       // update モードは features を再生成しない
       agents: ["extract-purpose"],
     }
6. catch (error)
   - if (isAbortError(error)) throw error
   - return null
```

### purpose 解決優先順位

```
優先度 1: LLM 生成 purpose（extractPurposeWithLlm の戻り値が非 null・非空）
優先度 2: 既存 SKILL.md から読み取った内容（existingContent の先頭 200 文字程度）
優先度 3: options.description（最終フォールバック）
```

---

## 5. `case "update":` 更新設計

### 変更前

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;
```

### 変更後（設計案）

```typescript
case "update":
  emitProgress("loading-skill");
  try {
    structurePlan = await this.runUpdateWorkflow(options, operationSignal);
  } catch (error) {
    if (this.isAbortError(error) || operationSignal.aborted) {
      throw error;
    }
    this.logger.warn("runUpdateWorkflow failed, falling back to null", {
      skillName: options.name,
      mode: options.mode,
      error,
    });
    structurePlan = null;
  }
  emitProgress("analyzing");
  break;
```

**設計根拠**: `case "create":` の try/catch パターン（L394-409）を完全に踏襲する。  
`analyzing` は `runUpdateWorkflow()` 完了後に emit することで、分析完了のタイミングを正確に表現する。

---

## 6. `runCreateWorkflow()` との比較

| 比較軸                      | `runCreateWorkflow()`                   | `runUpdateWorkflow()`（設計）              |
| --------------------------- | --------------------------------------- | ------------------------------------------ |
| 既存ファイル読み取り        | なし                                    | あり（SKILL.md）                           |
| `extractPurposeWithLlm()`   | 呼ぶ                                    | 呼ぶ（同一）                               |
| `generateFeaturesWithLlm()` | 呼ぶ                                    | 呼ばない                                   |
| purpose フォールバック      | `options.description`                   | 既存 SKILL.md 内容 → `options.description` |
| `features` フィールド       | LLM 生成                                | `[]`（空配列）                             |
| `agents` フィールド         | `["extract-purpose", "plan-structure"]` | `["extract-purpose"]`                      |
| abort 処理                  | `throwIfAborted` + rethrow              | 同一パターン                               |
| エラー処理                  | `null` 返却                             | 同一パターン                               |

---

## 7. 設計上の制約と決定

| 制約 / 決定                                | 内容                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| features を空配列にする                    | update モードは既存スキルの features を維持する想定のため、LLM 再生成しない               |
| `generateSkillMd()` への接続               | `structurePlan` が非 null なら `generateSkillMd()` が呼ばれる（既存の共通後続処理）       |
| `ensureSkillMdExists()` へのフォールバック | `structurePlan` が null の場合、テンプレート生成にフォールバック（create モードと同動作） |
| SKILL.md 読み取り失敗は non-fatal          | ファイルが存在しない場合も `null` で続行（新規スキルへの update 呼び出し対応）            |
