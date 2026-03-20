# [#1291] "[UT-06-005-A] PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装"

## メタ情報

```yaml
task_id: UT-06-005-A
task_name: PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装
category: 実装
target_feature: SkillExecutor Permission Fallback
priority: 高
scale: 中規模
status: 未実施
source_phase: UT-06-005 Phase 12 未タスク検出（GAP-02/03）
created_date: 2026-03-17
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-06-005-a-hook-fallback-integration.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-005（Permission拒否時のabort/skip/retry/timeoutフォールバック実装）において、`processPermissionFallback`・`executeAbortFlow`・`executeSkipFlow` の各メソッドを実装し、23テストで単体検証が完了した。

しかし、これらのメソッドは実際の PreToolUse Hook（`SkillExecutor.ts` L1126-1184）とは接続されておらず、現状ではテストコードからのみ呼び出される状態となっている。加えて、`sendPermissionRequest`（L1480-1516）がタイムアウトした場合に `executeAbortFlow("timeout")` を自動呼び出しする仕組みも未実装のままである。

### 1.2 問題点・課題

1. PreToolUse Hook の Permission 拒否フローで `processPermissionFallback` が呼ばれていない。実際のスキル実行時に abort/skip/retry の挙動が選択されない
2. `sendPermissionRequest` がタイムアウトした際に `executeAbortFlow("timeout")` を自動呼び出しする仕組みがない。タイムアウト時のフォールバック動作が未定義の状態
3. 実行時フローへの統合が行われていないため、UT-06-005 で実装した全フォールバック機能（abort/skip/retry/timeout）が事実上無効化されている

### 1.3 放置した場合の影響

- ユーザーが Permission を拒否した場合、abort/skip/retry の選択ができず、スキル実行が予期しない状態で停止または継続するリスクがある
- timeout 発生時にフォールバック処理が実行されないため、スキルが無限に待機する可能性がある
- UT-06-005 の実装価値が失われ、実機能としての意義がなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

UT-06-005 で実装した `processPermissionFallback`・`executeAbortFlow`・`executeSkipFlow` を実際の PreToolUse Hook フローに統合し、Permission 拒否・タイムアウト時のフォールバック動作を実行時に有効化する。

### 2.2 最終ゴール

- PreToolUse Hook が Permission 拒否を受け取った際に `processPermissionFallback` を呼び出すこと
- `sendPermissionRequest` がタイムアウトした際に `executeAbortFlow("timeout")` が自動で呼び出されること
- abort/skip/retry/timeout の全フォールバックパターンが実行時に正しく機能すること
- 統合テストが23件以上パスすること

### 2.3 スコープ

#### 含むもの

- `SkillExecutor.ts` の PreToolUse Hook 内に `processPermissionFallback` 呼び出しを追加
- `sendPermissionRequest` にタイムアウト検知 + `executeAbortFlow("timeout")` 自動呼び出しを追加
- 統合テストファイル `SkillExecutor.hook-fallback.test.ts` の作成
- abort/skip/retry/timeout × 正常/異常の代表的なテストケース実装

#### 含まないもの

- `processPermissionFallback` 本体の変更（UT-06-005 で実装済み）
- Permission UI の変更
- PermissionStore の変更

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（PreToolUse Hook 修正 + sendPermissionRequest タイムアウト処理追加）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`（統合テスト 新規作成）

---

## 3. どう実装するか（How）

### 3.1 実装方針

#### Step 1: 既存コードの確認

実装前に以下を必ず確認すること：

- `SkillExecutor.ts` L1126-1184 の PreToolUse Hook 実装
- `sendPermissionRequest`（L1480-1516）の戻り値の形式と型定義
- `processPermissionFallback` の呼び出しインターフェース

```bash
# 既存の sendPermissionRequest 実装を確認
grep -n "sendPermissionRequest\|processPermissionFallback\|executeAbortFlow" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

#### Step 2: PreToolUse Hook への統合

PreToolUse Hook 内の Permission 拒否分岐で `processPermissionFallback` を呼び出す：

```typescript
// PreToolUse Hook 内（L1126-1184 付近）
// 変更前: Permission 拒否時に直接エラーをスロー
// 変更後: processPermissionFallback を呼び出してフォールバック動作を選択

const permissionResponse = await this.sendPermissionRequest(/* ... */);
if (permissionResponse.action === "deny") {
  const fallbackResult = await this.processPermissionFallback(
    permissionResponse,
    context,
  );
  return fallbackResult;
}
```

#### Step 3: timeout→abort 自動遷移の追加

`sendPermissionRequest` に `Promise.race` でタイムアウト検知を追加し、タイムアウト時に `executeAbortFlow("timeout")` を呼び出す：

```typescript
// sendPermissionRequest 内
const timeoutMs = this.config.permissionTimeoutMs ?? 30000;
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new PermissionTimeoutError()), timeoutMs),
);

try {
  const response = await Promise.race([
    this.sendPermissionRequestInternal(/* ... */),
    timeoutPromise,
  ]);
  return response;
} catch (error) {
  if (error instanceof PermissionTimeoutError) {
    await this.executeAbortFlow("timeout");
    throw error;
  }
  throw error;
}
```

#### Step 4: fail-closed 原則の適用

フォールバック処理自体が例外を送出した場合は abort にフォールバックする（`security-skill-execution.md` 準拠）：

```typescript
try {
  return await this.processPermissionFallback(response, context);
} catch (fallbackError) {
  // fail-closed: フォールバック処理の例外は abort に倒す
  await this.executeAbortFlow("fallback_error");
  throw fallbackError;
}
```

### 3.2 苦戦箇所・注意点（前回の教訓）

**P60（IPC テスト応答形式不一致）**:
Phase 4 でテスト設計した応答形式と Phase 5 の実装形式が乖離することがある。今回は必ず既存の `sendPermissionRequest` の戻り値形式を先に確認し、その型に合わせてテストを書くこと。

**フォールバック境界条件の多さ**:
abort/skip/retry/timeout の4パターン × 正常/異常の組み合わせが多い。実装開始前に代表的なケース（abort/正常、timeout/正常、skip/正常、fallback_error/abort遷移）に絞って設計すること。

**P54（safeRegister パターン不適合）**:
`sendPermissionRequest` に戻り値（Promise）が必要な場合、`safeRegister` パターンは使用できない。個別 try-catch で実装すること。

**fail-closed 原則の徹底**:
フォールバック処理内で例外が発生した場合は、常に abort 方向に倒すこと。security-skill-execution.md のセキュリティセクションに準拠。

**既存テストへの影響確認**:
`SkillExecutor.ts` の変更は既存テストファイルに影響する可能性がある。変更後に必ず以下を実行すること：

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

### 3.3 テスト方針

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`

| TC-ID    | テスト内容                                                 | 期待結果                                          |
| -------- | ---------------------------------------------------------- | ------------------------------------------------- |
| TC-A-001 | Permission 拒否時に processPermissionFallback が呼ばれる   | processPermissionFallback が1回呼ばれること       |
| TC-A-002 | abort フォールバック時にスキル実行が停止する               | AbortError がスローされること                     |
| TC-A-003 | skip フォールバック時に実行が継続する                      | ツール実行がスキップされ次の処理が継続すること    |
| TC-A-004 | retry フォールバック時に再度 Permission 要求が発生する     | sendPermissionRequest が再度呼ばれること          |
| TC-A-005 | timeout 発生時に executeAbortFlow("timeout") が呼ばれる    | executeAbortFlow が "timeout" 引数で呼ばれること  |
| TC-A-006 | フォールバック処理が例外をスローした場合、abort に遷移する | executeAbortFlow("fallback_error") が呼ばれること |

テスト環境の注意：

- P40 準拠: `pnpm --filter @repo/desktop exec vitest run` で実行すること（プロジェクトルートからは実行しない）
- P39 準拠: happy-dom 環境のため `fireEvent` を使用し `userEvent` は使用しない

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID    | 関係性                                            |
| ----------- | ------------------------------------------------- |
| UT-06-005   | 前提（processPermissionFallback 実装元）          |
| UT-06-005-B | 並列対象（revokeSessionEntries セッション別実装） |
| TASK-3-2    | 関連（PermissionResolver 実装）                   |
| TASK-3-1-B  | 関連（SkillExecutor IPC 統合）                    |

### 4.2 関連仕様書

| 仕様書                                                                                       | 内容                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | Permission フォールバックフロー詳細 |
| `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed セキュリティ要件        |
| `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/`                                     | UT-06-005 ワークフロー成果物        |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| P54        | safeRegister パターン不適合（戻り値キャプチャ必要なハンドラ） |
| P60        | IPC テスト応答形式不一致                                      |
| P39        | happy-dom 環境での userEvent 非互換                           |
| P40        | テスト実行ディレクトリ依存（モノレポ）                        |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PreToolUse Hook の Permission 拒否分岐で `processPermissionFallback` が呼び出されること
- [ ] `sendPermissionRequest` タイムアウト時に `executeAbortFlow("timeout")` が自動呼び出しされること
- [ ] abort/skip/retry/timeout の全フォールバックパターンが実行時に機能すること
- [ ] フォールバック処理の例外時に fail-closed（abort）が適用されること

### 品質要件

- [ ] 統合テスト `SkillExecutor.hook-fallback.test.ts` が全件パスすること
- [ ] 既存テスト（`SkillExecutor.*.test.ts`）が全件パスすること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること

### ドキュメント要件

- [ ] Phase 12 完了時に `interfaces-agent-sdk-executor-details.md` に実装完了を記録すること
- [ ] Phase 12 完了時に LOGS.md（2ファイル）を更新すること
