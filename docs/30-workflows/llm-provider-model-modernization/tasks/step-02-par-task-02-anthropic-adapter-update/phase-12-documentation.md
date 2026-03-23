# Phase 12: ドキュメント更新 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 12                       |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

実装・テスト・レビューの完了を受け、実装ガイド・システム仕様書更新・未タスク検出の 3 タスクを実施する。

---

## Task 1: 実装ガイド

### Task 1-1: 実装ガイド Part 1（中学生レベルの概念説明）

**成果物パス**: `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/implementation-guide-part1.md`

以下の内容で作成する。

---

#### タイトル: AI ヘルスチェックのモデル交換 — 「体温計」の型を変えた話

**日常例えによる説明**

病院では、患者の体温を測るために「体温計」を使います。体温計の種類には「水銀式」「デジタル式」「耳式」など様々あります。

AI アシスタントにも、「正常に動いているか確認する」ためのミニテストがあります。これがヘルスチェックです。このミニテストでは、「一番安くて速いモデル」に「こんにちは」と話しかけて、ちゃんと返事が来るか確認します。

今まで使っていた体温計（`claude-3-haiku-20240307`）は古い型になりました。そこで、より新しくて高性能な体温計（`claude-haiku-4-5`）に交換しました。

「こんにちは」と話しかける行為は同じ。ちゃんと返事が来るか確認することも同じ。変わったのは「どのモデルに話しかけるか」だけです。

**変更のポイント（3 つ）**

1. **何が変わったか**: 体温計の型番（モデルID）を変えた
2. **何が変わっていないか**: 「こんにちは」と送って返事を確認する手順は同じ
3. **なぜ変えたか**: 古い型番は古く、新しい型番の方が速くて良いから

---

### Task 1-2: 実装ガイド Part 2（開発者向け技術詳細）

**成果物パス**: `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/implementation-guide-part2.md`

以下の内容で作成する。

---

#### 変更概要

**変更対象**: `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` L207

**変更内容**:

```typescript
// 変更前
model: "claude-3-haiku-20240307", // 最安モデル

// 変更後
model: "claude-haiku-4-5", // 最安・最速モデル
```

#### checkHealth メソッドの仕様

`checkHealth` メソッドは Anthropic Messages API（`POST https://api.anthropic.com/v1/messages`）に最小リクエストを送信し、API キーとネットワーク接続の疎通を確認する。

| パラメータ          | 値                                  | 変更要否 |
| ------------------- | ----------------------------------- | -------- |
| `model`             | `claude-haiku-4-5`（変更後）        | 変更     |
| `messages`          | `[{ role: "user", content: "Hi" }]` | 変更なし |
| `max_tokens`        | `1`（最小トークンで最低限の応答）   | 変更なし |
| `anthropic-version` | `2023-06-01`                        | 変更なし |
| リトライ            | `0`（ヘルスチェックはリトライなし） | 変更なし |

#### 新規追加テスト HC-001

```typescript
// apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
it("should use claude-haiku-4-5 as health check model", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        content: [{ type: "text", text: "pong" }],
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }),
  );
  await adapter.checkHealth();
  expect(capturedBody.model).toBe("claude-haiku-4-5");
});
```

**技術的注意点**:

- `sendChat` / `streamChat` のモデルIDはリクエスト送信元（Renderer）から注入される。本変更は `checkHealth` 専用モデルのみに影響する
- `inferProviderId` の `claude-` プレフィックスパターンは `claude-haiku-4-5` にも適用されるため変更不要

---

## Task 2: システム仕様書更新

### Step 1-A: タスク完了記録

本タスクの完了を以下のファイルに記録する。

| 更新対象                                            | 更新内容                                                    |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | TASK-LLM-MOD-02 完了エントリを追加                          |
| `.claude/skills/task-specification-creator/LOGS.md` | TASK-LLM-MOD-02 完了エントリを追加（**2ファイル両方必須**） |

#### 追加するエントリ例（LOGS.md）

```markdown
## TASK-LLM-MOD-02: AnthropicAdapter ヘルスチェックモデル更新（完了）

- **日付**: 2026-03-23
- **変更ファイル**: `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- **変更内容**: L207 の model ID を `claude-3-haiku-20240307` から `claude-haiku-4-5` に更新
- **追加テスト**: HC-001（checkHealth model フィールド検証）
```

### Step 1-B: 実装状況テーブル更新

LLM Modernization の進捗テーブルが存在する場合、TASK-LLM-MOD-02 のステータスを「完了」に更新する。

対象ファイル: `.claude/skills/aiworkflow-requirements/references/` 配下の該当仕様書

```bash
grep -rn "TASK-LLM-MOD-02" .claude/skills/aiworkflow-requirements/references/
```

### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-LLM-MOD-02" .claude/skills/
```

関連仕様書が存在する場合、本タスクの完了を記録する。

### Step 1-D: topic-map.md 再生成

仕様書更新後に topic-map.md を再生成する。

```bash
node ./.claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

P2 / P27 対策: 仕様書に変更がある場合は必ず再生成する。

### Step 2: システム仕様更新（該当する場合）

本タスクは新規インターフェースを追加しない（既存メソッドの内部文字列変更のみ）ため、アーキテクチャ仕様書の変更は不要。

ただし、Adapter API 仕様書（`adapters-llm.md` 等）が存在する場合、ヘルスチェックモデル更新を記録する。

---

## Task 3: documentation-changelog.md

**成果物パス**: `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/documentation-changelog.md`

全 Step 完了後に以下の内容で作成する（P4 対策: 全 Step 確認前に「完了」と記載しない）。

```markdown
# Documentation Changelog — TASK-LLM-MOD-02

## 更新日: 2026-03-23

### Step 1-A: タスク完了記録

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` 更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新

### Step 1-B: 実装状況テーブル

- [ ] 対象仕様書を grep で特定し更新（存在する場合）

### Step 1-C: 関連タスクテーブル

- [ ] TASK-LLM-MOD-02 を参照する仕様書を grep で特定し更新

### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` 実行完了

### Step 2: システム仕様更新

- [ ] 新規インターフェースなし → 変更不要と確認
```

---

## Task 4: 未タスク検出

**成果物パス**: `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/unassigned-task-report.md`

### 検出した未タスク候補

| 未タスクID（仮）               | 説明                                                    | 発見Phase | 優先度 |
| ------------------------------ | ------------------------------------------------------- | --------- | ------ |
| TASK-LLM-MOD-HEALTHCHECK-CONST | ヘルスチェックモデルIDの定数化（全 Adapter 統一）       | Phase 8   | 低     |
| TASK-LLM-MOD-HEALTHCHECK-BODY  | `checkHealth` の `max_tokens` / `messages` 固定値テスト | Phase 6   | 低     |

### 未タスクの3ステップ処理

各候補について以下を実施する（P3 / P38 対策）:

1. `docs/30-workflows/llm-provider-model-modernization/tasks/unassigned-task/` に指示書を作成する
2. `docs/30-workflows/task-workflow.md` の残課題テーブルに登録する（存在する場合）
3. 関連仕様書に参照リンクを追加する

### unassigned-task-report.md の内容

```markdown
# 未タスク検出レポート — TASK-LLM-MOD-02

## 検出日: 2026-03-23

## 検出件数: 2件

| 未タスクID                     | 説明                                              | 優先度 | 指示書パス       |
| ------------------------------ | ------------------------------------------------- | ------ | ---------------- |
| TASK-LLM-MOD-HEALTHCHECK-CONST | ヘルスチェックモデルIDの定数化（全 Adapter 統一） | 低     | （作成後に記入） |
| TASK-LLM-MOD-HEALTHCHECK-BODY  | checkHealth の max_tokens / messages 固定値テスト | 低     | （作成後に記入） |
```

---

## 参照資料

| ドキュメント                                                    | 用途                               |
| --------------------------------------------------------------- | ---------------------------------- |
| `phase-11-manual-testing.md`                                    | Phase 11 完了の確認（前提条件）    |
| `phase-8-refactoring.md`                                        | 未タスク候補（定数化）の参照       |
| `phase-6-test-expansion.md`                                     | 未タスク候補（固定値テスト）の参照 |
| `.claude/rules/05-task-execution.md` (Phase 12 チェックリスト)  | Phase 12 必須チェックリスト        |
| `.claude/rules/06-known-pitfalls.md` (P1-P4, P25-P29, P43, P51) | Phase 12 インシデント防止          |

## 成果物

| 成果物                     | パス                                                                                                                                                   | 備考                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 実装ガイド Part 1          | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/implementation-guide-part1.md` | 新規作成                |
| 実装ガイド Part 2          | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/implementation-guide-part2.md` | 新規作成                |
| documentation-changelog.md | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/documentation-changelog.md`    | 新規作成                |
| unassigned-task-report.md  | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/outputs/phase-12/unassigned-task-report.md`     | 新規作成（0件でも必須） |

## 完了条件

### Task 1

- [ ] 実装ガイド Part 1 が作成されている（日常例え必須）
- [ ] 実装ガイド Part 2 が作成されている（変更コード・テストコード記載）

### Task 2

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新した
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新した（**2ファイル必須 / P1 / P25対策**）
- [ ] 関連仕様書を grep で特定し、更新が必要なものを更新した
- [ ] `node generate-index.js` で topic-map.md を再生成した（P2 / P27対策）

### Task 3

- [ ] `documentation-changelog.md` を全 Step 完了後に作成した（P4 / P51対策）
- [ ] 各 Step の実行結果を具体的に記録した

### Task 4

- [ ] `unassigned-task-report.md` を作成した（0件でも必須）
- [ ] 検出した未タスク2件について3ステップ（指示書作成 / テーブル登録 / リンク追加）を実施した（P3 / P38対策）

## 次のPhase

Phase 13: 完了（`phase-13-completion.md`）
