# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装（TDD: Green）          |
| 前提Phase  | Phase 4                     |
| 後続Phase  | Phase 6                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-16                  |
| 機能名     | slide-agent-sdk-integration |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。skill-executor.tsとagent-client.tsにClaude Agent SDKを統合し、シミュレーション実装を実際のAPI呼び出しに置換する。

## 背景

Phase 4で作成したテストがすべてRed状態（失敗）になっている。本Phaseでは、これらのテストをGreen状態（成功）にするための実装を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: agent-client.ts更新

**目的**: シミュレーション実装を実際のClaude Agent SDK呼び出しに置換する

**実行手順**:

1. SDK依存関係を確認/追加:

   ```bash
   # packages/sharedにSDK依存が必要な場合
   pnpm --filter @repo/shared add @anthropic-ai/claude-agent-sdk
   ```

2. `executeAgentQuery`関数を実装:

   ```typescript
   async function executeAgentQuery(
     prompt: string,
     systemPrompt: string | undefined,
     timeout: number,
     signal: AbortSignal,
   ): Promise<ModifierAgentQueryResponse> {
     // APIキーを取得（safeStorageまたは環境変数）
     const apiKey = await getApiKey();

     // Claude Agent SDKクライアントを初期化
     const client = new Anthropic({ apiKey });

     // タイムアウト処理を設定
     const timeoutId = setTimeout(() => {
       throw new Error("Request timeout");
     }, timeout);

     try {
       // SDK呼び出し
       const response = await client.messages.create(
         {
           model: "claude-sonnet-4-20250514",
           max_tokens: 8192,
           system: systemPrompt,
           messages: [{ role: "user", content: prompt }],
         },
         { signal },
       );

       clearTimeout(timeoutId);

       return {
         content: response.content[0].text,
         usage: {
           inputTokens: response.usage.input_tokens,
           outputTokens: response.usage.output_tokens,
         },
       };
     } catch (error) {
       clearTimeout(timeoutId);
       throw error;
     }
   }
   ```

3. APIキー取得関数を実装:

   ```typescript
   async function getApiKey(): Promise<string> {
     // Electron safeStorageから取得を試行
     const encrypted = store.get("anthropic_api_key");
     if (encrypted) {
       return safeStorage.decryptString(Buffer.from(encrypted));
     }

     // 環境変数フォールバック（開発時）
     const envKey = process.env.ANTHROPIC_API_KEY;
     if (envKey) {
       return envKey;
     }

     throw new Error("API key not configured");
   }
   ```

4. メッセージリスナーへの通知を実装

**期待される成果物**:

- `apps/desktop/src/main/slide/agent-client.ts` - 更新されたファイル

---

### タスク2: skill-executor.ts更新

**目的**: シミュレーション実装を実際のAgentClient呼び出しに置換する

**実行手順**:

1. AgentClientをインポート:

   ```typescript
   import { getAgentAPI } from "./agent-client";
   ```

2. `execute`メソッドを更新:

   ```typescript
   async execute(phase, projectPath) {
     // ... 既存のガード処理 ...

     const skillName = getSkillName(phase);
     const agentAPI = getAgentAPI();

     try {
       emitProgress(0);

       // スキル実行用プロンプトを生成
       const prompt = generateSkillPrompt(phase, projectPath);
       const systemPrompt = getSystemPromptForPhase(phase);

       emitProgress(25);

       // Agent SDK呼び出し
       const response = await agentAPI.query({
         prompt,
         options: {
           systemPrompt,
           timeout: 30000,
         },
       });

       emitProgress(75);

       // レスポンスをパース
       const result = parseSkillResponse(phase, response.content);

       emitProgress(100);

       return {
         phase,
         success: true,
         output: result,
         duration: Date.now() - startTime,
         ...result.additionalInfo,
       };
     } catch (error) {
       // ... エラーハンドリング ...
     }
   }
   ```

3. スキルフェーズ別のプロンプト生成関数を実装:

   ```typescript
   function generateSkillPrompt(
     phase: SkillPhase,
     projectPath: string,
   ): string {
     // 各フェーズに応じたプロンプトを生成
   }

   function getSystemPromptForPhase(phase: SkillPhase): string {
     // 各フェーズに応じたシステムプロンプトを返す
   }
   ```

4. レスポンスパース関数を実装:
   ```typescript
   function parseSkillResponse(phase: SkillPhase, content: string): object {
     // JSON形式のレスポンスをパース
   }
   ```

**期待される成果物**:

- `apps/desktop/src/main/slide/skill-executor.ts` - 更新されたファイル

---

### タスク3: テスト実行とGreen確認

**目的**: 実装したコードでPhase 4のテストがすべて成功することを確認する

**実行手順**:

1. ユニットテストを実行:

   ```bash
   pnpm --filter @repo/desktop test skill-executor
   pnpm --filter @repo/desktop test agent-client
   ```

2. 統合テストを実行:

   ```bash
   pnpm --filter @repo/desktop test sdk-integration
   ```

3. 失敗するテストがあれば修正する

4. すべてのテストがGreen状態になったことを確認

**期待される成果物**:

- テスト実行結果（すべてGreen）

---

## 参照資料

| 参照資料           | パス                                                                        | 内容          |
| ------------------ | --------------------------------------------------------------------------- | ------------- |
| 設計書             | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| API設計            | `outputs/phase-2/api-design.md`                                             | Phase 2成果物 |
| テスト仕様         | `outputs/phase-4/test-specification.md`                                     | Phase 4成果物 |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK仕様       |
| skill-executor現行 | `apps/desktop/src/main/slide/skill-executor.ts`                             | 変更対象      |
| agent-client現行   | `apps/desktop/src/main/slide/agent-client.ts`                               | 変更対象      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                    |
| ------------- | --------------------------------------------------------------------------- | ----------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK統合インターフェース |

---

## 成果物

| 成果物         | パス                                            | 内容              |
| -------------- | ----------------------------------------------- | ----------------- |
| skill-executor | `apps/desktop/src/main/slide/skill-executor.ts` | SDK統合実装       |
| agent-client   | `apps/desktop/src/main/slide/agent-client.ts`   | 実API呼び出し実装 |

---

## 統合テスト連携【必須】

SDK接続実装とモック統合テスト支援コード整備:

| 実装項目           | 内容                                            |
| ------------------ | ----------------------------------------------- |
| API接続            | Claude Agent SDK HTTPS通信実装                  |
| 認証               | safeStorage APIキー取得・環境変数フォールバック |
| エラーハンドリング | タイムアウト/中断/SDK障害の適切なエラー処理     |
| 状態同期           | 進捗コールバック・メッセージリスナー連携        |

---

## 完了条件

- [ ] agent-client.tsが実際のClaude Agent SDK呼び出しを行う
- [ ] skill-executor.tsがAgentClientを使用してスキルを実行する
- [ ] すべてのユニットテストが成功状態（Green）
- [ ] すべての統合テストが成功状態（Green）
- [ ] 実装が最小限に抑えられている（YAGNI原則）
- [ ] SDK接続・認証・エラーハンドリングが実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

Phase 6: テスト拡充
