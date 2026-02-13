# Phase 5: 実装（TODO箇所の有効化・モック調整） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装（TODO テスト有効化）         |
| 前提Phase  | Phase 4 (テスト作成)              |
| 後続Phase  | Phase 6 (テスト拡充)              |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |

---

## 目的

Phase 4 で策定したテストケース仕様に基づき、3 つのテストファイル内の 17 箇所の TODO コメント付きテストを実際に有効化する。コメントアウトされた expect 文の有効化、シミュレーションモックの SDK モックへの差し替え、TODO コメントの除去を行い、全テストが PASS する状態（Green）にする。

## 背景

Phase 4 で各テストケースの期待動作とモック方針が明確化された。本 Phase では以下の作業を行う:

1. コメントアウトされた expect 文を有効化する
2. シミュレーション成功を返すだけのテストを、実際のエラーモックに差し替える
3. `// TODO: SDK統合後に実装` コメントを除去する
4. 全テストが PASS することを確認する

---

## 実行タスク

- テスト有効化: `skill-executor.test.ts` / `agent-client.test.ts` / `sdk-integration.test.ts` のTODO 17箇所を実装する
- モック調整: SDK呼び出しの引数検証・エラーシミュレーションを既存モック構成内で実現する
- 品質確認: TODO除去と対象テストPASSを確認し、設計差分を記録する

### Task 1: skill-executor.test.ts の 5 箇所を有効化

### Task 2: agent-client.test.ts の 9 箇所を有効化

### Task 3: sdk-integration.test.ts の 3 箇所を有効化

---

## 参照資料

| 参照資料                 | パス                                                             | 内容               |
| ------------------------ | ---------------------------------------------------------------- | ------------------ |
| Phase 4 テストケース仕様 | `docs/30-workflows/sdk-test-enablement/phase-4-test-creation.md` | 17 箇所の実装仕様  |
| skill-executor テスト    | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`   | 変更対象（5 箇所） |
| agent-client テスト      | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`     | 変更対象（9 箇所） |
| sdk-integration テスト   | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`  | 変更対象（3 箇所） |
| skill-executor 実装      | `apps/desktop/src/main/slide/skill-executor.ts`                  | テスト対象の実装   |
| agent-client 実装        | `apps/desktop/src/main/slide/agent-client.ts`                    | テスト対象の実装   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                 | 内容                            |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| テスト品質基準          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | TDD・カバレッジ・品質基準       |
| SDK実行インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | SkillExecutor/Agent SDK実行仕様 |
| エラーハンドリング      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | 例外分類・エラー応答設計        |

---

## 成果物

| 成果物                             | パス                                                            | 内容                     |
| ---------------------------------- | --------------------------------------------------------------- | ------------------------ |
| skill-executor テスト（更新対象）  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | 5 箇所の TODO 有効化対象 |
| agent-client テスト（更新対象）    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | 9 箇所の TODO 有効化対象 |
| sdk-integration テスト（更新対象） | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 3 箇所の TODO 有効化対象 |

---

## 実装手順

### Task 1: skill-executor.test.ts（5箇所）

#### 1-1: SDK-SE-01（L416）- スキル名マッピング検証

**変更内容**: コメントアウトされた expect を有効化

```typescript
// 変更前（現在の状態）:
// TODO: SDK統合後は以下を有効化
// expect(mockAgentAPI.query).toHaveBeenCalledWith(
//   expect.objectContaining({
//     prompt: expect.stringContaining(expectedSkillName),
//   }),
// );

// 変更後:
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    prompt: expect.stringContaining(expectedSkillName),
  }),
);
```

**実装前確認**: `skill-executor.ts` の `execute()` メソッドが `mockAgentAPI.query` をどのような引数で呼び出すか確認する。`prompt` に `expectedSkillName` が含まれない場合は、引数の構造に合わせて expect を調整する。

#### 1-2: SDK-SE-02（L437）- projectPath コンテキスト検証

**変更内容**: コメントアウトされた expect を有効化

```typescript
// 変更前:
// TODO: SDK統合後は以下を有効化
// expect(mockAgentAPI.query).toHaveBeenCalledWith(
//   expect.objectContaining({
//     options: expect.objectContaining({
//       systemPrompt: expect.stringContaining(customProjectPath),
//     }),
//   }),
// );

// 変更後:
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    options: expect.objectContaining({
      systemPrompt: expect.stringContaining(customProjectPath),
    }),
  }),
);
```

**実装前確認**: `systemPrompt` に `projectPath` がどの形式で埋め込まれるか確認する。

#### 1-3: SDK-SE-05（L487）- 30秒タイムアウト検証

**変更内容**: コメントアウトされたタイムアウトテストロジックを有効化

```typescript
// 変更前:
// TODO: SDK統合後、実際の30秒タイムアウトをテスト
// 現在のシミュレーションは1秒で完了する
const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;
// シミュレーションは成功を返す
expect(result.success).toBe(true);

// 変更後:
// mockAgentAPIを応答しないモックに差し替え
mockAgentAPI.query.mockImplementation(
  () => new Promise(() => {}), // 決して resolve しない
);

const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(30000); // 30秒タイムアウト
const result = await resultPromise;

expect(result.success).toBe(false);
expect(result.error).toContain("timeout");
```

**実装前確認**: SkillExecutor 内部のタイムアウト実装を確認。タイムアウト時間（30秒）とエラーメッセージのフォーマットを特定する。P13（タイマーテスト無限ループ）回避のため `advanceTimersByTimeAsync` を使用する。

**注意**: SkillExecutor にタイムアウト機構が実装されていない場合は、このテストは設計変更記録に記載し、実装側の修正が必要な未タスクとして報告する。

#### 1-4: SDK-SE-13（L623）- API key not found エラー

**変更内容**: 成功テストをエラーモックに差し替え

```typescript
// 変更前:
// TODO: SDK統合後に実装
const executor = createSkillExecutor();
const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;
expect(result.success).toBe(true);

// 変更後:
mockAgentAPI.query.mockRejectedValue(new Error("API key not configured"));

const executor = createSkillExecutor();
const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;

expect(result.success).toBe(false);
expect(result.error).toContain("API key");
```

#### 1-5: SDK-SE-14（L636）- SDK呼び出し失敗エラー

**変更内容**: 成功テストをエラーモックに差し替え

```typescript
// 変更前:
// TODO: SDK統合後に実装
const executor = createSkillExecutor();
const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;
expect(result.success).toBe(true);

// 変更後:
mockAgentAPI.query.mockRejectedValue(
  new Error("SDK call failed: Connection refused"),
);

const executor = createSkillExecutor();
const resultPromise = executor.execute("html", testProjectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;

expect(result.success).toBe(false);
expect(result.error).toBeDefined();
```

---

### Task 2: agent-client.test.ts（9箇所）

#### 2-1: AC-06（L200）- SDK APIエラーシミュレーション

**変更内容**: 成功テストを SDK エラーモックに差し替え

```typescript
// 変更前:
// TODO: SDK統合後、実際のAPIエラーをシミュレートする
const queryPromise = agentAPI.query({ ... });
await vi.advanceTimersByTimeAsync(1000);
const response = await queryPromise;
expect(response).toBeDefined();

// 変更後:
mockCreate.mockRejectedValue(new Error("SDK API error: rate limit exceeded"));

const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});

await expect(queryPromise).rejects.toThrow("SDK API error");
```

#### 2-2: SDK-AC-01（L525）- safeStorage から API キー取得

**変更内容**: safeStorage の API キー取得を検証

```typescript
// 変更前:
// TODO: SDK統合後に実装
const queryPromise = agentAPI.query({ ... });
await vi.advanceTimersByTimeAsync(1000);
const response = await queryPromise;
expect(response).toBeDefined();

// 変更後:
// electron-storeのモックで暗号化キーを返すように設定
// （実装側がsafeStorageをどう使うか確認後に調整）
const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});
await vi.advanceTimersByTimeAsync(1000);
const response = await queryPromise;

expect(response).toBeDefined();
// mockCreate が呼ばれていることでAPIキーが正常に取得されたことを間接検証
expect(mockCreate).toHaveBeenCalled();
```

**実装前確認**: `agent-client.ts` の API キー取得ロジックを確認し、safeStorage → electron-store のフローを把握する。

#### 2-3: SDK-AC-02（L539）- 環境変数フォールバック

**変更内容**: safeStorage 失敗時の環境変数フォールバックを検証

```typescript
// 変更後:
// safeStorageが利用不可の状態を作成（electron-storeがundefinedを返す）
// beforeEachで process.env.ANTHROPIC_API_KEY = 'test-api-key' が設定済み

const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});
await vi.advanceTimersByTimeAsync(1000);
const response = await queryPromise;

// 環境変数フォールバックで正常動作
expect(response).toBeDefined();
expect(mockCreate).toHaveBeenCalled();
```

#### 2-4: SDK-AC-03（L553）- API キー未検出エラー

**変更内容**: API キー未設定時のエラーを検証

```typescript
// 変更後:
delete process.env.ANTHROPIC_API_KEY;
resetAgentAPI();
const newAgentAPI = getAgentAPI();

const queryPromise = newAgentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});

await expect(queryPromise).rejects.toThrow("API key not configured");
```

**注意**: EDGE-AC-08 テストと同じパターン。重複が問題になる場合は、SDK-AC-03 を異なる観点（例: safeStorage + 環境変数の両方が無効）に変更するか、EDGE-AC-08 への参照コメントを追加する。

#### 2-5: SDK-AC-04（L570）- 正しいモデル使用検証

**変更内容**: mockCreate の呼び出し引数でモデル名を検証

```typescript
// 変更後:
const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});
await vi.advanceTimersByTimeAsync(1000);
await queryPromise;

expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    model: "claude-sonnet-4-20250514",
  }),
);
```

**実装前確認**: `agent-client.ts` の実際のモデル名を確認。異なる場合はテスト側の期待値を修正する。

#### 2-6: SDK-AC-05（L584）- max_tokens 設定検証

**変更内容**: mockCreate の呼び出し引数で max_tokens を検証

```typescript
// 変更後:
const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});
await vi.advanceTimersByTimeAsync(1000);
await queryPromise;

expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    max_tokens: 8192,
  }),
);
```

**実装前確認**: `agent-client.ts` の実際の max_tokens 値を確認。

#### 2-7: SDK-AC-06（L598）- systemPrompt 渡し検証

**変更内容**: mockCreate の呼び出し引数で system パラメータを検証

```typescript
// 変更後:
const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: {
    systemPrompt: "You are a slide designer.",
    timeout: 30000,
  },
});
await vi.advanceTimersByTimeAsync(1000);
await queryPromise;

expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    system: expect.stringContaining("slide designer"),
  }),
);
```

**実装前確認**: `agent-client.ts` で `systemPrompt` がどのフィールド名で SDK に渡されるか（`system` / `system_prompt` 等）を確認。

#### 2-8: SDK-AC-09（L643）- 401 Unauthorized エラー

**変更内容**: 成功テストを 401 エラーモックに差し替え

```typescript
// 変更後:
mockCreate.mockRejectedValue(
  Object.assign(new Error("Unauthorized"), { status: 401 }),
);

const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});

await expect(queryPromise).rejects.toThrow("Unauthorized");
```

#### 2-9: SDK-AC-10（L657）- 500 Internal Server Error

**変更内容**: 成功テストを 500 エラーモックに差し替え

```typescript
// 変更後:
mockCreate.mockRejectedValue(
  Object.assign(new Error("Internal Server Error"), { status: 500 }),
);

const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});

await expect(queryPromise).rejects.toThrow("Internal Server Error");
```

---

### Task 3: sdk-integration.test.ts（3箇所）

#### 3-1: INT-02（L137）- 無効APIキーエラー

**変更内容**: 成功テストを認証エラーモックに差し替え

```typescript
// 変更前:
// TODO: SDK統合後に実装
const resultPromise = executor.execute("html", projectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;
expect(result.success).toBe(true);

// 変更後:
mockCreate.mockRejectedValue(
  Object.assign(new Error("Invalid API key"), { status: 401 }),
);

const resultPromise = executor.execute("html", projectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;

expect(result.success).toBe(false);
expect(result.error).toContain("API key");
```

**注意**: SkillExecutor が AgentClient のエラーをどのようにキャッチ・変換するか確認が必要。エラーメッセージの文言が異なる場合は expect を調整する。

#### 3-2: INT-05（L197）- SDK障害時エラーメッセージ

**変更内容**: キャンセルシミュレーションを SDK エラーモックに差し替え

```typescript
// 変更前:
// TODO: SDK統合後に実装
const resultPromise = executor.execute("html", projectPath);
executor.cancel();
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;
expect(result.success).toBe(false);
expect(result.error).toBeDefined();

// 変更後:
mockCreate.mockRejectedValue(
  new Error("SDK internal error: service unavailable"),
);

const resultPromise = executor.execute("html", projectPath);
await vi.advanceTimersByTimeAsync(1000);
const result = await resultPromise;

expect(result.success).toBe(false);
expect(result.error).toBeDefined();
expect(typeof result.error).toBe("string");
```

#### 3-3: SDK-INT-01（L451）- SDKパラメータ正確性検証

**変更内容**: パラメータ検証を追加

```typescript
// 変更前:
// TODO: SDK統合後、パラメータが正しく渡されることを検証
expect(result.success).toBe(true);

// 変更後:
expect(result.success).toBe(true);

// SDK パラメータの正確性を検証
expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    model: expect.any(String),
    max_tokens: expect.any(Number),
    messages: expect.arrayContaining([
      expect.objectContaining({
        role: "user",
        content: expect.any(String),
      }),
    ]),
  }),
);
```

**実装前確認**: `mockCreate` の呼び出し引数構造を `agent-client.ts` から確認し、正確なフィールド名・値を特定する。

---

## TODO コメント除去手順

全 17 箇所の実装完了後、以下のコメントを除去する:

```bash
# 除去対象の TODO コメント一覧確認コマンド
grep -n "TODO: SDK統合後" apps/desktop/src/main/slide/__tests__/*.test.ts
```

除去対象パターン:

- `// TODO: SDK統合後は以下を有効化`
- `// TODO: SDK統合後に実装`
- `// TODO: SDK統合後、実際の30秒タイムアウトをテスト`
- `// TODO: SDK統合後、実際のAPIエラーをシミュレートする`
- `// TODO: SDK統合後、パラメータが正しく渡されることを検証`

---

## 設計変更記録

実装中に Phase 4 の仕様から変更が必要になった場合、以下のテーブルに記録する:

| テストID | 変更内容 | 変更理由 | 変更日 |
| -------- | -------- | -------- | ------ |
| -        | -        | -        | -      |

---

## TDD 検証

### テスト実行コマンド

```bash
# 個別テストファイルの実行
pnpm --filter @repo/desktop test -- skill-executor.test
pnpm --filter @repo/desktop test -- agent-client.test
pnpm --filter @repo/desktop test -- sdk-integration.test

# 全テスト実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/
```

**確認項目**:

- [ ] 全 17 箇所のテストが PASS していること（Green 状態）
- [ ] 既存テスト（TODO 箇所以外）が壊れていないこと

---

## 統合テスト連携（Phase 1-11は必須）

- [ ] `sdk-integration.test.ts` を含む対象3ファイルの統合観点テストを実行し、既存INTシナリオと整合することを確認
- [ ] 認証（APIキー）・HTTPエラー（401/500）・タイムアウト（30秒）の統合観点を実行結果に記録
- [ ] 統合テスト結果を Phase 5 実行記録に反映し、Phase 6のカバレッジ分析入力とする

---

## 完了条件

- [ ] skill-executor.test.ts の 5 箇所の TODO が有効化され、テストが PASS している
- [ ] agent-client.test.ts の 9 箇所の TODO が有効化され、テストが PASS している
- [ ] sdk-integration.test.ts の 3 箇所の TODO が有効化され、テストが PASS している
- [ ] `// TODO: SDK統合後` コメントが全て除去されている
- [ ] 既存テストが壊れていない（regression なし）
- [ ] TypeScript 型エラーがない
- [ ] ESLint 警告がない
- [ ] 設計変更がある場合は設計変更記録に記載されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実装結果

- 有効化対象箇所: {{数}}/17
- PASS テスト数: {{数}}
- 設計変更あり: {{Yes/No}}

### ファイルごとの結果

- skill-executor.test.ts: {{数}}/5 箇所完了
- agent-client.test.ts: {{数}}/9 箇所完了
- sdk-integration.test.ts: {{数}}/3 箇所完了

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-test-enablement/phase-6-test-expansion.md`
