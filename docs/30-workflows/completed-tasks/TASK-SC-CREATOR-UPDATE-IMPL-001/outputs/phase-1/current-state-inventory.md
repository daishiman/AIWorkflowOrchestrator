# 現状調査インベントリ — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 1 成果物 / 作成日: 2026-04-21

---

## 1. `runUpdateWorkflow()` の現状（スタブ）

### 実際のコード（SkillCreatorService.ts L412-415）

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;
```

### 問題点

| 問題                           | 詳細                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| メソッドが存在しない           | `runUpdateWorkflow()` private メソッドが未実装                          |
| 処理が空                       | `loading-skill` と `analyzing` を emit するだけで、実際の更新処理がない |
| `structurePlan` が null のまま | `structurePlan` 変数（L379）が `null` のまま後続処理に渡される          |
| SKILL.md 読み取りなし          | 既存スキルの purpose を読み込む処理が存在しない                         |
| LLM 連携なし                   | `extractPurposeWithLlm()` が呼ばれない                                  |

### 影響

`case "update":` で `structurePlan` が `null` のため、`createSkill()` L487-509 の分岐で  
`ensureSkillMdExists()` が呼ばれる（テンプレート生成のみ）。  
実質的に `update` モードが `create` モードと同じ動作をしており、既存スキルの情報が引き継がれない。

---

## 2. `runCreateWorkflow()` のパターン（参照先）

`runUpdateWorkflow()` の実装は `runCreateWorkflow()` を踏襲する。

### 実際のコード（SkillCreatorService.ts L980-1003）

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null> {
  this.throwIfAborted(signal);
  try {
    const purpose = await this.extractPurposeWithLlm(options, signal);
    const features = await this.generateFeaturesWithLlm(
      options.description,
      signal,
    );
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: purpose ?? options.description,
      features,
      agents: ["extract-purpose", "plan-structure"],
    };
    return structurePlan;
  } catch (error) {
    if (this.isAbortError(error)) throw error;
    return null;
  }
}
```

### `runUpdateWorkflow()` との差分

| 項目              | `runCreateWorkflow()`                   | `runUpdateWorkflow()`（予定）                            |
| ----------------- | --------------------------------------- | -------------------------------------------------------- |
| purpose 取得元    | LLM のみ（`extractPurposeWithLlm()`）   | 既存 SKILL.md 読み取り → LLM 再生成（失敗時は既存値）    |
| features 生成     | `generateFeaturesWithLlm()` を呼ぶ      | 呼ばない（既存を維持）                                   |
| フォールバック    | `options.description` を purpose に使用 | 既存 SKILL.md から読み取った purpose を使用              |
| agents フィールド | `["extract-purpose", "plan-structure"]` | `["extract-purpose"]`（plan-structure は新規作成時のみ） |

---

## 3. 関連テスト3本の役割

### 3-1. `SkillCreatorService.test.ts`

| テスト ID      | 内容                                                                 | update モードへの関連                                                          |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| SC-020         | `createSkill()` が update モードで成功する                           | `case "update":` の後続処理（generating-skill 以降）が正常に完了することを確認 |
| SC-021         | `createSkill()` が improve-prompt モードで成功する                   | update モードとの差分確認（参照テスト）                                        |
| BV-001〜BV-008 | バリデーション系（name 空・長さ超過・null バイト・パストラバーサル） | update モードにも適用される入力バリデーション                                  |

**役割**: update モードの公開インターフェースが壊れていないことを保証するスモークテスト。  
`runUpdateWorkflow()` 実装後、SC-020 が SKILL.md 読み取り + LLM 呼び出しを検証するよう拡張が必要。

---

### 3-2. `SkillCreatorService.purpose.test.ts`

| テスト ID | 内容                                                               | update モードへの関連                                                  |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| TC-01     | extract-purpose エージェント定義が LLM の system prompt に渡される | `runUpdateWorkflow()` でも同様に `loadAgent("extract-purpose")` を呼ぶ |
| TC-02     | `llmClient.generate` が正しい system/user 引数で呼び出される       | update モードでの LLM 呼び出しパターン確認                             |
| TC-03     | `structurePlan.purpose` に LLM 生成結果が格納される                | update モードで purpose が反映されることの確認                         |
| TC-04     | LLM 呼び出し失敗時も `createSkill` が成功する                      | フォールバック動作の確認（update モードでは既存 purpose を使用）       |
| TC-05     | `llmClient` なしでも正常動作（後方互換）                           | update モードでも `llmClient` 未注入時の動作を保証                     |
| TC-06     | `generate` が空文字を返す場合の動作                                | purpose 空文字ハンドリング                                             |
| TC-07     | `loadAgent` 失敗時も `createSkill` が成功                          | エージェント定義ロード失敗時のフォールバック                           |
| TC-08     | `AbortError` は rethrow される                                     | abort 伝播の保証                                                       |

**役割**: `extractPurposeWithLlm()` の契約テスト。`runUpdateWorkflow()` が同メソッドを呼ぶため、  
テスト TC-01〜TC-08 は update モードの LLM 連携部分を間接的にカバーする。

---

### 3-3. `SkillCreatorService-cancel.test.ts`

| テスト ID | 内容                                                                       | update モードへの関連                                  |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| TC-01     | `cancelCurrentOperation()` が public で存在する                            | update モードでもキャンセル可能であることの前提        |
| TC-02     | `cancelCurrentOperation()` 呼び出しで `AbortController.abort()` が呼ばれる | update モードのキャンセル動作の基盤                    |
| TC-03     | `cancelCurrentOperation()` 後に `currentAbortController` が null になる    | リソースリークなしの確認                               |
| TC-04     | `createSkill()` 中に `AbortController` が設定され finally でリセットされる | update モードでも finally リセットが動作することの確認 |
| TC-PM-03  | `runCreateWorkflow()` が abort 済み signal で AbortError をスローする      | `runUpdateWorkflow()` に移植すべき abort 動作パターン  |
| TC-PM-04  | `runCreateWorkflow()` が signal なしで正常終了                             | update モードでの正常系の参照                          |

**役割**: キャンセル制御（TASK-SW-CANCEL-003）の契約テスト。  
`runUpdateWorkflow()` 実装時、`throwIfAborted(signal)` の配置が TC-PM-03 / TC-PM-04 相当のテストをパスする必要がある。

---

## 4. `PROGRESS_FLOWS.update` の定義

### ソースコード（SkillCreatorService.ts L138-152）

```typescript
update: [
  {
    phase: "loading-skill",
    percentage: 10,
    message: "スキルを読み込んでいます",
  },
  { phase: "analyzing", percentage: 30, message: "分析しています" },
  {
    phase: "generating-skill",
    percentage: 60,
    message: "SKILL.md を生成しています",
  },
  { phase: "validating", percentage: 90, message: "スキルを検証しています" },
  { phase: "done", percentage: 100, message: "完了しました" },
],
```

### emit 責務マッピング

| phase              | emit 責務者                      | タイミング                                           |
| ------------------ | -------------------------------- | ---------------------------------------------------- |
| `loading-skill`    | `case "update":`                 | `runUpdateWorkflow()` 呼び出し前                     |
| `analyzing`        | `case "update":`                 | `runUpdateWorkflow()` 呼び出し前（または呼び出し後） |
| `generating-skill` | `createSkill()` 共通処理（L426） | `runUpdateWorkflow()` 完了後                         |
| `validating`       | `createSkill()` 共通処理（L526） | `validateSkill()` 呼び出し前                         |
| `done`             | `createSkill()` 共通処理（L535） | 全処理完了後                                         |

**注意**: `generating-agents` は `PROGRESS_FLOWS.update` に含まれないため、`emitProgress("generating-agents")` は no-op となる（L512-513 コメント参照）。

---

## 5. 依存コンポーネント一覧

| コンポーネント               | 役割                   | update ワークフローでの用途              |
| ---------------------------- | ---------------------- | ---------------------------------------- |
| `ResourceLoader.loadAgent()` | エージェント定義ロード | `extract-purpose` エージェント定義の取得 |
| `LlmClient.generate()`       | LLM テキスト生成       | purpose 再生成                           |
| `fs.readFile()`              | ファイル読み取り       | 既存 SKILL.md の内容取得                 |
| `throwIfAborted()`           | abort チェック         | `runUpdateWorkflow()` 内の各ステップ前後 |
| `isAbortError()`             | abort エラー判定       | catch ブロックでの rethrow 判定          |
| `normalizePurposeResponse()` | LLM レスポンス正規化   | `extractPurposeWithLlm()` 内で使用済み   |
