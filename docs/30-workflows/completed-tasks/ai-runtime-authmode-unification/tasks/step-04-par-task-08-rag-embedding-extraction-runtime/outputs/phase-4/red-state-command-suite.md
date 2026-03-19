# Phase 4: Red State コマンドスイート (red-state-command-suite.md)

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 4                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |
| 前提       | Phase 4: outputs/phase-4/test-matrix.md          |

---

## Red State の定義

このドキュメントでは「Phase 5 実装前に実行して失敗することを確認するコマンド」を定義する。
各コマンドは Phase 5 実装後に Green state（PASS）に変わることを期待する。

**注意**: P60 教訓に従い、テストは Phase 5 後の Green state 形式でアサーションを記述する。
そのため、以下のコマンドは **Phase 5 実装前に FAIL することを確認するためのもの**である。

---

## コマンド実行前提

```bash
# ワーキングツリーに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1
```

---

## M 層: Main Process / IPC テスト

### M-01, M-02: AI_CHECK_CONNECTION / AI_INDEX guidance-only 形式検証

```bash
# Red state 確認コマンド
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop && \
  pnpm vitest run src/main/ipc/__tests__/aiHandlers.test.ts 2>&1 | tail -30
```

**期待する Red state 出力（失敗）**:

```
FAIL src/main/ipc/__tests__/aiHandlers.test.ts
  × AI_CHECK_CONNECTION: guidance-only レスポンス形式
    AssertionError: expected { status: 'connected', indexedDocuments: 892 } to equal
    { status: 'guidance-only', message: expect.any(String) }
  × AI_INDEX: guidance-only レスポンス形式
    AssertionError: expected { indexedCount: 15, skippedCount: 3 } to equal
    { status: 'guidance-only', message: expect.any(String) }
```

**Green state 後の期待出力（PASS）**:

```
PASS src/main/ipc/__tests__/aiHandlers.test.ts
  ✓ AI_CHECK_CONNECTION: guidance-only レスポンス形式
  ✓ AI_INDEX: guidance-only レスポンス形式
```

---

### M-03: AI_INDEX unsupported provider fail-fast 検証

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop && \
  pnpm vitest run src/main/ipc/__tests__/aiHandlers.test.ts -t "unsupported provider" 2>&1 | tail -20
```

**期待する Red state 出力（失敗）**:

```
FAIL  × AI_INDEX: unsupported provider で fail-fast
  AssertionError: expected { success: true, data: { indexedCount: 15 } } to equal
  { success: false, error: { code: 'GUIDANCE_ONLY', ... } }
```

---

### M-05, I-03: registerAIHandlers / unregisterAIHandlers ペア存在確認

```bash
# 現行実装に unregisterAIHandlers が存在しないことを静的検査で確認
grep -n "unregisterAIHandlers\|export.*unregister" \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop/src/main/ipc/aiHandlers.ts
```

**期待する Red state 出力（0件 = export なし）**:

```
（出力なし）
```

**Green state 後の期待出力（2件以上）**:

```
234: export function unregisterAIHandlers(): void {
```

---

### I-01: communityHandlers レスポンス形式確認

```bash
# 現行実装のレスポンス形式を確認（{ ok, value } 形式が使われているか検査）
grep -n "ok:\|\.ok\b\|\.value\b" \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop/src/main/ipc/communityHandlers.ts | head -20
```

**期待する Red state 出力（旧形式が残存）**:

```
42:   return { ok: true, value: mockCommunities };
65:   return { ok: false, error: "Community not found" };
```

**Green state 後の期待出力（統一形式）**:

```
（{ ok } 形式は存在しない）
```

---

### I-04: communityHandlers unregister ペア存在確認

```bash
grep -n "unregisterCommunityHandlers\|export.*unregister" \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop/src/main/ipc/communityHandlers.ts
```

**期待する Red state 出力（0件 = export なし）**:

```
（出力なし）
```

---

### I-02: P42 3段バリデーション不在の確認

```bash
# communityHandlers に .trim() チェックが存在しないことを確認
grep -n "\.trim()" \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop/src/main/ipc/communityHandlers.ts
```

**期待する Red state 出力（0件 = trim チェックなし）**:

```
（出力なし）
```

**Green state 後の期待出力（3段バリデーション追加後）**:

```
45:   if (typeof communityId !== "string" || communityId.trim() === "") {
```

---

## S 層: Shared Services テスト

### S-09: HybridRAGFactory throw stub 確認

```bash
# HybridRAGFactory.createFull が throw stub であることを確認
grep -n "throw\|not implemented\|TODO" \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared/src/services/search/hybrid-rag-factory.ts | head -10
```

**期待する Red state 出力（throw stub 存在）**:

```
15:   throw new Error("HybridRAGFactory.createFull: not implemented");
```

```bash
# テスト実行でも確認
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared && \
  pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.runtime.test.ts 2>&1 | tail -20
```

**期待する Red state 出力（失敗）**:

```
FAIL src/services/search/__tests__/hybrid-rag-factory.runtime.test.ts
  × HybridRAGFactory: createFull が HybridRAGEngine を返す
    Error: HybridRAGFactory.createFull: not implemented
```

---

### S-07: GraphRAGQueryService silent failure 確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared && \
  pnpm vitest run src/services/search/__tests__/graphrag-query-service.runtime.test.ts -t "partialFailure" 2>&1 | tail -20
```

**期待する Red state 出力（失敗）**:

```
FAIL × GraphRAGQueryService: community search 失敗時の UI 明示用フラグ
  AssertionError: expected [] to have property 'partialFailure' equaling true
```

---

### S-06: CommunitySummarizer embed 失敗時のカウンタ確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared && \
  pnpm vitest run src/services/graph/__tests__/community-summarizer.runtime.test.ts -t "failureCount" 2>&1 | tail -20
```

**期待する Red state 出力（失敗）**:

```
FAIL × CommunitySummarizer: embed 失敗時の warn + 部分失敗カウンタ
  AssertionError: expected result to have property 'failureCount'
```

---

### S-08: RelevanceEvaluator JSON parse 失敗時のログ確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared && \
  pnpm vitest run src/services/search/crag/__tests__/relevance-evaluator.runtime.test.ts -t "parse.*warn" 2>&1 | tail -20
```

**期待する Red state 出力（失敗）**:

```
FAIL × RelevanceEvaluator: JSON parse 失敗時の score=5 + warn ログ出力
  AssertionError: expect(console.warn).toHaveBeenCalled()
  - Expected: called at least once
  - Received: not called
```

---

## 静的検査コマンド一覧（テスト不要の確認）

これらは既存ファイルの状態を確認するためのコマンドであり、テストファイルの作成前に実行する。

```bash
#!/bin/bash
# Phase 4: Red state 静的検査スクリプト
BASE=/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1

echo "=== M-01/M-02: AI_CHECK_CONNECTION / AI_INDEX mock 残存確認 ==="
grep -n "TODO\|indexedDocuments: 892\|indexedCount: 15\|setTimeout.*1000" \
  $BASE/apps/desktop/src/main/ipc/aiHandlers.ts

echo ""
echo "=== M-05/I-03: unregisterAIHandlers 不在確認 ==="
grep -n "unregisterAIHandlers" $BASE/apps/desktop/src/main/ipc/aiHandlers.ts

echo ""
echo "=== I-01: communityHandlers 旧形式 { ok } 残存確認 ==="
grep -n "ok:" $BASE/apps/desktop/src/main/ipc/communityHandlers.ts

echo ""
echo "=== I-02: communityHandlers P42 trim チェック不在確認 ==="
grep -n "\.trim()" $BASE/apps/desktop/src/main/ipc/communityHandlers.ts

echo ""
echo "=== I-04: unregisterCommunityHandlers 不在確認 ==="
grep -n "unregisterCommunityHandlers" $BASE/apps/desktop/src/main/ipc/communityHandlers.ts

echo ""
echo "=== S-09: HybridRAGFactory throw stub 確認 ==="
grep -n "throw\|not implemented" $BASE/packages/shared/src/services/search/hybrid-rag-factory.ts

echo ""
echo "=== SF-05: GraphRAGQueryService silent [] 返却確認 ==="
grep -n "return \[\]" $BASE/packages/shared/src/services/search/graphrag-query-service.ts

echo ""
echo "=== SF-09: CommunitySummarizer console.warn のみ確認 ==="
grep -n "console\.warn" $BASE/packages/shared/src/services/graph/community-summarizer.ts
```

---

## Phase 5 実装後の Green state 確認コマンド

Phase 5 実装後に以下のコマンドで全テストが PASS することを確認する。

```bash
# M 層テスト
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/apps/desktop && \
  pnpm vitest run src/main/ipc/__tests__/aiHandlers.test.ts \
                  src/main/ipc/__tests__/communityHandlers.runtime.test.ts 2>&1 | tail -30

# S 層テスト
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110101-wt-1/packages/shared && \
  pnpm vitest run \
    src/services/embedding/__tests__/embedding-service.runtime.test.ts \
    src/services/embedding/__tests__/pipeline/embedding-pipeline.runtime.test.ts \
    src/services/search/__tests__/hybrid-rag-engine.runtime.test.ts \
    src/services/search/__tests__/hybrid-rag-factory.runtime.test.ts \
    src/services/search/__tests__/graphrag-query-service.runtime.test.ts \
    src/services/search/__tests__/llm-query-classifier.runtime.test.ts \
    src/services/extraction/__tests__/entity-extractor.runtime.test.ts \
    src/services/graph/__tests__/community-summarizer.runtime.test.ts \
    src/services/search/crag/__tests__/relevance-evaluator.runtime.test.ts 2>&1 | tail -30
```

**期待する Green state 出力**:

```
Test Files  11 passed (11)
Tests       19 passed (19)
```

---

## Red state 確認サマリー

| ID   | 確認方法      | Red state 判定基準                                   |
| ---- | ------------- | ---------------------------------------------------- |
| M-01 | テスト実行    | `status: "connected"` が返る（guidance-only でない） |
| M-02 | テスト実行    | `indexedCount: 15` が返る（guidance-only でない）    |
| M-03 | テスト実行    | バリデーションなしで mock が成功返却                 |
| M-04 | テスト実行    | `error: "string"` 形式（object でない）              |
| M-05 | grep          | `unregisterAIHandlers` が 0 件                       |
| M-06 | テスト実行    | 二重登録で例外 throw                                 |
| S-01 | テスト実行    | `code` フィールドなしの PipelineError                |
| S-02 | テスト実行    | 部分失敗時に throw（成功/失敗カウントなし）          |
| S-03 | テスト実行    | `console.warn` が呼ばれない（silent）                |
| S-04 | テスト実行    | `console.warn` が呼ばれない（silent）                |
| S-05 | テスト実行    | `errorCount` フィールドなし                          |
| S-06 | テスト実行    | `failureCount` フィールドなし                        |
| S-07 | テスト実行    | `partialFailure` フラグなし                          |
| S-08 | テスト実行    | `console.warn` が呼ばれない（silent）                |
| S-09 | grep + テスト | `throw new Error` 存在 / テスト FAIL                 |
| I-01 | grep          | `{ ok:` 形式が存在する                               |
| I-02 | grep          | `.trim()` が 0 件                                    |
| I-03 | grep          | `unregisterAIHandlers` が 0 件                       |
| I-04 | grep          | `unregisterCommunityHandlers` が 0 件                |
