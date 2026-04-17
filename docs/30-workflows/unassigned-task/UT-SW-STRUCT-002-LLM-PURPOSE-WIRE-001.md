# structurePlan.purpose LLM統合 - タスク指示書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-SW-STRUCT-002-LLM-PURPOSE-WIRE-001                    |
| タスク名     | skill-creator-purpose-llm-wire                           |
| 分類         | 機能追加                                                 |
| 対象機能     | SkillCreatorService - structurePlan.purpose LLM統合      |
| 優先度       | **中**                                                   |
| 見積もり規模 | 中規模                                                   |
| ステータス   | 対応中（TASK-SC-LLM-PURPOSE-WIRE-001で追跡）             |
| 発見元       | TASK-SW-STRUCT-002 Phase 12 未タスク検出                 |
| 発見日       | 2026-04-17                                               |
| 関連タスク   | TASK-SC-LLM-PURPOSE-WIRE-001（実装タスク、Phase 12完了） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STRUCT-002 で実装した `SkillCreatorService.runCreateWorkflow()` の中で、
`structurePlan.purpose` は `options.description`（ユーザー入力値）の固定値で設定されている。

```typescript
// 現状: options.description の固定値がそのまま purpose に入っている
const structurePlan = {
  purpose: options.description,
  // ...
};
```

LLM による自動 purpose 抽出を担う `extract-purpose` エージェント定義は既に存在するが、
LLM 推論との配線（接続）が実装されておらず、エージェント定義が活用されていない。

### 1.2 問題点・課題

- `structurePlan.purpose` がユーザー入力値そのままのため、スキル定義の品質が低い
- `extract-purpose` エージェント定義が存在するにもかかわらず、LLM 推論との接続が欠落している
- purpose の自動抽出が機能しないと、後続のスキル生成（`generate_skill_md.js`）への入力品質が下がる
- フォールバック設計が未定義なため、LLM 失敗時の動作が不明確

### 1.3 放置した場合の影響

- スキル定義書（SKILL.md）の `purpose` フィールドがユーザーの生入力を反映するだけで、
  LLM による意味的な整理・補完が行われない
- `extract-purpose` エージェント定義が「使われていないデッドコード」になり続ける
- フォールバックが未定義のまま本番環境に達すると、LLM 失敗時に予期しない動作が発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

`runCreateWorkflow()` 内で `loadAgent("extract-purpose")` の結果を LLM に渡し、
推論結果を `structurePlan.purpose` に格納する。
LLM 失敗時は `options.description` にフォールバックする3段階フォールバック設計を確立する。

### 2.2 最終ゴール

- `runCreateWorkflow()` が `loadAgent("extract-purpose")` を呼び出し、LLM 推論を実行している
- LLM 推論結果が `structurePlan.purpose` に格納されている
- LLM 失敗時は `options.description` へのフォールバックが動作している
- `generateSkillMd` 失敗時は `ensureSkillMdExists` へのフォールバックが動作している
- ユニットテストが新しい挙動を網羅している
- 型チェックが PASS している

### 2.3 スコープ

#### 含むもの

- `runCreateWorkflow()` 内の `loadAgent("extract-purpose")` 呼び出しと LLM 接続実装
- `structurePlan.purpose` への LLM 推論結果格納
- LLM 失敗時の `options.description` フォールバック処理
- `generateSkillMd` 失敗時の `ensureSkillMdExists` フォールバック処理
- エラーハンドリングとユニットテストの整備

#### 含まないもの

- `extract-purpose` エージェント定義自体の修正
- `generate_skill_md.js` の内部実装変更
- `ILLMClient` インターフェースの変更
- 他のフィールド（`skillName`、`agents` 等）への LLM 統合

### 2.4 成果物

| 種別 | 成果物                              | 配置先                                                                       |
| ---- | ----------------------------------- | ---------------------------------------------------------------------------- |
| 修正 | runCreateWorkflow LLM 接続実装      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                |
| 追加 | LLM purpose 抽出ユニットテスト      | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` |
| 参照 | TASK-SC-LLM-PURPOSE-WIRE-001 仕様書 | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/`                            |

---

## 3. どのように実装するか（How）

### 3.1 実装方針

TASK-SC-LLM-PURPOSE-WIRE-001 の仕様に従い、
`ILLMClient` インターフェース（`packages/shared/src/services/llm/types.ts`）経由で LLM を呼び出す。

### 3.2 実装手順

#### Step 1: extract-purpose エージェント定義の読み込みと LLM 呼び出し

```typescript
// runCreateWorkflow() 内
const extractPurposeAgent = await loadAgent("extract-purpose");
let purpose: string;

try {
  const llmResult = await this.llmClient.complete({
    system: extractPurposeAgent.systemPrompt,
    messages: [{ role: "user", content: options.description }],
  });
  purpose = llmResult.content ?? options.description;
} catch {
  // LLM 失敗時は options.description にフォールバック
  purpose = options.description;
}

const structurePlan = {
  purpose,
  // ...
};
```

#### Step 2: generateSkillMd 失敗時のフォールバック設計

```typescript
// 3段階フォールバック設計
try {
  await generateSkillMd(structurePlan);
} catch {
  // generateSkillMd 失敗時は ensureSkillMdExists にフォールバック
  await ensureSkillMdExists(structurePlan);
}
```

#### Step 3: Null 安全性の注意点

```typescript
// ?? を使用（|| は falsy 全体をフォールバック対象にするため不適切）
purpose = llmResult.content ?? options.description;

// null チェックは !== null で明示的に行う
if (llmResult.content !== null && llmResult.content !== undefined) {
  purpose = llmResult.content;
} else {
  purpose = options.description;
}
```

### 3.3 確認コマンド

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --run SkillCreatorService

# 型チェック
pnpm --filter @repo/desktop typecheck

# purpose が固定値のままになっていないか確認
grep -n "purpose: options.description" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                  | 検証方法           |
| ------ | --------------------------------------------------------------------- | ------------------ |
| AC-1   | `runCreateWorkflow()` が `loadAgent("extract-purpose")` を呼び出す    | コードレビュー     |
| AC-2   | LLM 推論結果が `structurePlan.purpose` に格納される                   | ユニットテスト     |
| AC-3   | LLM 失敗時に `options.description` へフォールバックする               | ユニットテスト     |
| AC-4   | `generateSkillMd` 失敗時に `ensureSkillMdExists` へフォールバックする | ユニットテスト     |
| AC-5   | 既存テストが全て PASS                                                 | vitest run         |
| AC-6   | `pnpm typecheck`（desktop）が PASS                                    | typecheck コマンド |

---

## 5. 苦戦箇所と知見

### 5.1 upstream マージによる計画変更への対応

**苦戦した点**: 実装予定の処理が既に upstream でマージ済みのケースがあり、
計画していた実装内容が現在のコードベースに既に存在している場合がある。

**知見**: 実装開始前に必ず `git log --oneline upstream/main` および関連ファイルの現状確認を行い、
マージ済みの内容と未実装の内容を正確に分別してから作業に入ること。
「追加が必要な箇所」と「既に実装済みの箇所」を混同すると、重複実装や意図しない上書きが発生する。

### 5.2 Null 安全性の使い分け

**苦戦した点**: `|| []` と `?? []`、`if (x)` と `if (x !== null)` の使い分けが細かく、
誤った使い方をすると空文字列（`""`）や `0` のような falsy 値が意図せずフォールバック対象になる。

**知見**:

- `?? []`（Nullish Coalescing）は `null` / `undefined` のみをフォールバック対象とするため推奨
- `|| []` は `null` / `undefined` に加え `""` / `0` / `false` もフォールバック対象になるため、
  purpose のような文字列には原則 `??` を使用する
- `if (x)` は falsy チェック全般。`null` / `undefined` 専用チェックには `if (x !== null)` や
  `if (x != null)`（loose equality）を使い、意図を明確にする

### 5.3 3段階フォールバック設計パターン

**苦戦した点**: フォールバック設計の粒度（何が失敗したらどこにフォールバックするか）が曖昧なまま実装すると、
エラーハンドリングが複雑になり、テストが書きにくくなる。

**知見**: フォールバック段階を明示的に3段階で設計する：

1. **LLM 推論成功** → LLM 結果を `structurePlan.purpose` に格納
2. **LLM 推論失敗** → `options.description` を `structurePlan.purpose` に使用
3. **generateSkillMd 失敗** → `ensureSkillMdExists` で最低限のファイル生成を保証

各段階を独立した try-catch ブロックで実装することで、テストの可読性と独立性が高まる。

---

## 関連リンク

- [TASK-SC-LLM-PURPOSE-WIRE-001 仕様書](../completed-tasks/TASK-SC-LLM-PURPOSE-WIRE-001/)
- [SkillCreatorService.ts](../../../../apps/desktop/src/main/services/skill/SkillCreatorService.ts)
- [SkillCreatorService.test.ts](../../../../apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts)
- [ILLMClient インターフェース](../../../../packages/shared/src/services/llm/types.ts)
