# Phase 1 要件定義: Skill Docs Runtime Integration

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスク ID  | step-03-par-task-04-skill-docs-runtime-integration   |
| Phase      | 1 - 要件定義                                         |
| 作成日     | 2026-03-16                                           |
| ステータス | COMPLETED                                            |
| 前提タスク | step-01-seq-task-01 (AI Runtime AuthMode Foundation) |

---

## 1. 目的

SkillDocGenerator の stubQueryFn を排除し、実 LLM ランタイムと統合することで、スキルドキュメント自動生成機能を本番稼働可能な状態にする。Access Matrix に基づく 3 経路（integrated-api / terminal-handoff / guidance-only）の判定と、構造化エラーハンドリングを導入する。

---

## 2. 要件タスク一覧

### T-1-1: stubQueryFn の現状棚卸し

#### 調査結果

| 項目                   | 詳細                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| SkillDocGenerator 実装 | `apps/desktop/src/main/skill/SkillDocGenerator.ts` (285行)                                   |
| DI パターン            | Constructor Injection: `LLMQueryFn = (prompt: string) => Promise<{ content: string }>`       |
| stubQueryFn 定義箇所   | `apps/desktop/src/main/ipc/index.ts` L784-794                                                |
| stub 実装              | `async (prompt: string) => ({ content: \`Generated content for: ${prompt.slice(0, 50)}\` })` |
| タイムアウト           | 30秒 (`LLM_TIMEOUT_MS`) Promise.race 実装済み                                                |
| 既存テスト             | 33+ テストケース全 PASS                                                                      |

#### 使用 IPC チャンネル（4チャンネル）

| チャンネル             | 用途                 | stub 使用 |
| ---------------------- | -------------------- | --------- |
| `skill:docs:generate`  | ドキュメント生成     | Yes       |
| `skill:docs:preview`   | プレビュー表示       | Yes       |
| `skill:docs:export`    | ファイルエクスポート | Yes       |
| `skill:docs:templates` | テンプレート一覧取得 | No        |

#### 既存セキュリティ（4層）

| レイヤー | 実装内容                   | ステータス |
| -------- | -------------------------- | ---------- |
| L1       | sender 検証                | 実装済み   |
| L2       | P42 準拠 3段バリデーション | 実装済み   |
| L3       | enum 許可値検証            | 実装済み   |
| L4       | エラー境界                 | 実装済み   |

#### 受入基準

- [ ] stubQueryFn の全使用箇所が特定され、置換対象として文書化されていること
- [ ] 4 IPC チャンネルの契約（引数・戻り値型）が変更不要であることが確認されていること
- [ ] 既存 33+ テストが stub 依存部分と非依存部分に分類されていること

---

### T-1-2: Integrated API Runtime 要件

#### LLM プロバイダ選定要件

| 要件項目              | 仕様                                         |
| --------------------- | -------------------------------------------- |
| 対応プロバイダ        | API key ベース: Anthropic Claude, OpenAI GPT |
| 認証方式              | Settings 画面での API key 登録・検証         |
| API key 管理          | AuthKeyService 経由（暗号化ストレージ）      |
| consumer subscription | 使用禁止（アプリ内自動実行に使用不可）       |
| silent fallback       | 禁止（fail-fast 必須）                       |

#### queryFn 置換要件

| 項目               | 現状 (stub)                    | 目標 (real)                              |
| ------------------ | ------------------------------ | ---------------------------------------- |
| 入力型             | `(prompt: string)`             | 変更なし                                 |
| 出力型             | `Promise<{ content: string }>` | 変更なし                                 |
| LLM 呼び出し       | 文字列結合のダミー             | LLMDocQueryAdapter 経由で実 API 呼び出し |
| エラーハンドリング | なし                           | DocOperationResult 型による構造化エラー  |
| DI 注入経路        | ipc/index.ts L784-794 直接生成 | CapabilityResolver 判定結果に基づく注入  |

#### DI 基盤（既存リソース）

ipc/index.ts に以下のサービスインスタンスが既に生成済み:

- `authKeyService` - API key 取得・検証
- `authModeServiceForRuntime` - 認証モード判定
- `runtimeResolver` - ランタイム解決

#### UT-9I-001 との責務境界

| 責務                                    | 本タスク (task-04) | UT-9I-001 |
| --------------------------------------- | ------------------ | --------- |
| LLMDocQueryAdapter インターフェース定義 | 対象               | -         |
| LLM プロバイダ SDK 実装                 | -                  | 対象      |
| CapabilityResolver 判定ロジック         | 対象               | -         |
| stubQueryFn 排除                        | 対象               | -         |
| プロバイダ固有の API 呼び出し実装       | -                  | 対象      |

#### 受入基準

- [ ] LLMDocQueryAdapter インターフェースが `LLMQueryFn` 型互換で定義されていること
- [ ] AuthKeyService 経由で API key が取得できない場合に fail-fast すること
- [ ] consumer subscription モードでは LLM 呼び出しが拒否されること

---

### T-1-3: Terminal Handoff 要件

#### 発動条件（3経路）

| 条件           | トリガー                                  | エラーコード |
| -------------- | ----------------------------------------- | ------------ |
| タイムアウト   | LLM 応答が 30秒 (`LLM_TIMEOUT_MS`) を超過 | 3001         |
| 認証情報不足   | API key 未設定 or 無効                    | 2001         |
| レートリミット | HTTP 429 レスポンス                       | 3002         |

#### Terminal Handoff 仕様

| 項目              | 仕様                                                                |
| ----------------- | ------------------------------------------------------------------- |
| 提供情報          | prompt context + suggested command                                  |
| 自動送信          | 禁止（ユーザーが明示的にコマンドを実行する必要がある）              |
| prompt context    | ドキュメント生成に使用したプロンプトのサマリー（500文字以内）       |
| suggested command | CLI ベースの代替コマンド（例: `claude-code generate-docs --skill` ) |
| CapabilityMode    | `terminalSurface` として判定                                        |

#### 受入基準

- [ ] 3 つの失敗経路それぞれで terminal handoff が発動すること
- [ ] prompt context がユーザーの元リクエストを反映していること
- [ ] 自動送信が行われないこと（ユーザーアクション必須）
- [ ] handoff 情報が DocOperationResult 型で構造化されていること

---

### T-1-4: Access Matrix 適用要件

#### 3 経路判定

| 経路             | 条件                                     | CapabilityMode      | 動作                              |
| ---------------- | ---------------------------------------- | ------------------- | --------------------------------- |
| integrated-api   | API key 有効 + プロバイダ利用可能        | `integratedRuntime` | 実 LLM 呼び出しでドキュメント生成 |
| guidance-only    | API key 未設定 + Terminal 未利用         | `none`              | 設定ガイダンス表示                |
| terminal-handoff | integrated-api 失敗 or Terminal 利用可能 | `terminalSurface`   | prompt + command を提供           |

#### CapabilityResolver 判定要件

| 項目           | 仕様                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| 実行プロセス   | Main Process 完結（Renderer に判定ロジックを配置しない）                     |
| 入力           | authMode, API key 有無, Terminal 可用性                                      |
| 出力           | `CapabilityMode` (`integratedRuntime` / `terminalSurface` / `both` / `none`) |
| 判定タイミング | IPC ハンドラ呼び出し時（毎回判定、キャッシュなし）                           |
| consumer 制約  | consumer subscription では `none` を返す                                     |

#### 受入基準

- [ ] CapabilityResolver が Main Process 内で完結していること
- [ ] 4 つの CapabilityMode 全てが正しく判定されること
- [ ] consumer subscription で `none` が返されること
- [ ] 判定結果に基づいて適切な queryFn が選択されること

---

### T-1-5: エラー分類と非機能要件

#### エラー分類表（7種別）

| コード | カテゴリ               | エラー名                  | 説明                               | リトライ |
| ------ | ---------------------- | ------------------------- | ---------------------------------- | -------- |
| 2001   | Business Error         | MISSING_CREDENTIALS       | API key 未設定または無効           | 不可     |
| 2002   | Business Error         | CONSUMER_SUBSCRIPTION     | consumer subscription での実行拒否 | 不可     |
| 2003   | Business Error         | INVALID_TEMPLATE          | テンプレート形式不正               | 不可     |
| 3001   | External Service Error | LLM_TIMEOUT               | LLM 応答タイムアウト（30秒超過）   | 可能     |
| 3002   | External Service Error | LLM_RATE_LIMIT            | HTTP 429 レートリミット            | 可能     |
| 3003   | External Service Error | LLM_SERVICE_ERROR         | LLM サービスの 5xx エラー          | 可能     |
| 5001   | Internal Error         | GENERATION_INTERNAL_ERROR | ドキュメント生成内部エラー         | 不可     |

#### 非機能要件

| 項目            | 仕様                                                       |
| --------------- | ---------------------------------------------------------- |
| タイムアウト    | 30秒 (`LLM_TIMEOUT_MS`) - 既存実装を維持                   |
| リトライ        | 最大 2回、exponential backoff（初回 1秒、2回目 2秒）       |
| リトライ対象    | External Service Error (3001-3003) のみ                    |
| Rate Limit 対応 | `Retry-After` ヘッダー値を尊重（上限 60秒）                |
| ログ出力        | エラー発生時に electron-log で記録（API key 値はマスク）   |
| メトリクス      | 生成成功率、平均応答時間、エラー種別カウント（将来拡張用） |

#### DocOperationResult 型要件

```typescript
interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number; // 2001-5001
    category: string; // 'BUSINESS' | 'EXTERNAL' | 'INTERNAL'
    message: string; // ユーザー向けメッセージ
    retryable: boolean; // リトライ可能フラグ
    guidance?: string; // ユーザーへの操作ガイダンス
    terminalHandoff?: {
      // terminal handoff 情報
      promptContext: string;
      suggestedCommand: string;
    };
  };
}
```

#### 受入基準

- [ ] 7 種別のエラーコードが DocOperationResult に正しくマッピングされること
- [ ] リトライ可能エラー（3001-3003）でのみリトライが実行されること
- [ ] exponential backoff が正しく動作すること（1秒 → 2秒）
- [ ] Retry-After ヘッダーが尊重されること（上限 60秒）
- [ ] API key がログに含まれないこと

---

## 3. 依存関係

### 前提タスク

| タスク                                               | 提供物                          | ステータス |
| ---------------------------------------------------- | ------------------------------- | ---------- |
| step-01-seq-task-01 (AI Runtime AuthMode Foundation) | AuthKeyService, RuntimeResolver | 完了済み   |

### 後続タスク

| タスク    | 消費物                                          |
| --------- | ----------------------------------------------- |
| UT-9I-001 | LLMDocQueryAdapter インターフェース定義         |
| UT-9I-002 | テンプレート CRUD（独立、本タスクのスコープ外） |

---

## 4. 参照資料

| 資料名                | 参照先                                                                           |
| --------------------- | -------------------------------------------------------------------------------- |
| Access Matrix 仕様    | `workflow-ai-runtime-authmode-unification.md` Access Matrix セクション           |
| CapabilityMode 型定義 | `packages/shared/src/types/` (integratedRuntime / terminalSurface / both / none) |
| エラーコード範囲      | `.claude/rules/02-code-quality.md` エラーカテゴリテーブル                        |
| 既存型定義            | `packages/shared/src/types/skill-docs.ts`                                        |
| P42 3段バリデーション | `.claude/rules/06-known-pitfalls.md#P42`                                         |

---

## 5. 次 Phase

Phase 2（設計）へ進む。本要件定義の 5 タスクを設計仕様に展開する。
