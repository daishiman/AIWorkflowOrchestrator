# [#641] "[task-imp-sdk-integration-test-activation-001] Agent SDK統合テスト有効化"

## メタ情報

```yaml
task_id: task-imp-sdk-integration-test-activation-001
task_name: Agent SDK統合テスト有効化
category: 改善
target_feature: Agent SDK Integration（テスト基盤）
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 12（コードベースTODOスキャン）
created_date: 2026-02-01
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-sdk-integration-test-activation-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Agent SDK統合に向けたテストファイル群（agent-client.test.ts、sdk-integration.test.ts、skill-executor.test.ts）が作成されているが、実際のSDK APIが未統合のため、50箇所以上のテストケースが`// TODO: SDK統合後に実装`や`// TODO: SDK統合後は以下を有効化`としてスキップ/スタブ状態になっている。

これらのテストは以下のファイルに分散している:

- `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`（12箇所）
- `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`（5箇所）
- `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`（5箇所）

### 1.2 問題点・課題

1. **テストカバレッジの空白**: SDK統合関連のエラーハンドリング、認証フロー、パラメータ渡しなどの重要なテストケースが未実装
2. **リグレッション検出不能**: SDK APIの振る舞い変更時に自動検出する手段がない
3. **テスト負債の蓄積**: TODOコメントが50+箇所に散在し、どのテストが有効でどのテストが無効かの判別が困難
4. **具体的な未テスト項目**:
   - API Key取得（safeStorage / 環境変数フォールバック）
   - HTTP エラーハンドリング（401 Unauthorized、500 Internal Server Error）
   - タイムアウト処理（30秒タイムアウト）
   - クエリパラメータ（model、max_tokens、systemPrompt）の正確な渡し方

### 1.3 放置した場合の影響

- Agent SDK統合時に大量のテスト作成が必要となり、統合作業のボトルネックとなる
- SDKバージョンアップ時のリグレッション検出ができず、本番環境での障害リスクが増大
- テスト負債が増大し、新規開発者がテストの信頼性を判断できない

---

## 2. 何を達成するか（What）

### 2.1 目的

Agent SDK（`@anthropic-ai/claude-agent-sdk`または`@anthropic-ai/sdk`）統合後に、全てのスキップ済みテストケースを有効化し、SDK統合の品質を自動テストで保証できる状態にする。

### 2.2 最終ゴール

- 50+箇所のTODOコメント付きテストが全て有効化されている
- `// TODO: SDK統合後`パターンのコメントが0件
- テストカバレッジがLine 90%以上を達成
- CI/CDパイプラインでSDK統合テストが自動実行される

### 2.3 スコープ

#### 含むもの

- agent-client.test.ts: API Key管理、エラーハンドリング、パラメータ検証テスト（12件）
- sdk-integration.test.ts: SDK障害時UI表示、パラメータ渡し検証テスト（5件）
- skill-executor.test.ts: タイムアウト、SDK呼び出し検証テスト（5件）
- テストユーティリティ/モックの整備
- SDKモック戦略の策定と実装

#### 含まないもの

- Agent SDK本体の統合実装（別タスク: TASK-7Aシリーズ）
- SkillExecutor本体のロジック変更
- E2Eテスト作成（別タスク: task-skill-integration-e2e-manual-testing）
- Preload API変更（別タスク: task-imp-skill-stream-type-preload-completion-001）

### 2.4 成果物

| 成果物                      | 説明                              |
| --------------------------- | --------------------------------- |
| agent-client.test.ts修正    | 12件のテストケース有効化          |
| sdk-integration.test.ts修正 | 5件のテストケース有効化           |
| skill-executor.test.ts修正  | 5件のテストケース有効化           |
| SDKモックユーティリティ     | テスト用SDK モック/スタブファイル |
| Phase 1-12成果物            | 各Phase出力ファイル               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Agent SDK（`@anthropic-ai/claude-agent-sdk`または`@anthropic-ai/sdk`）がプロジェクトにインストールされていること
- SDK API仕様が確定していること
- Main ProcessからSDK APIを呼び出す基本的な実装が完了していること

### 3.2 依存タスク

| タスク                                            | ステータス | 関係             |
| ------------------------------------------------- | ---------- | ---------------- |
| TASK-7D ChatPanel Agent統合                       | ✅ 完了    | テスト基盤を提供 |
| task-imp-skill-stream-type-preload-completion-001 | 未実施     | 型統一が先行推奨 |
| Agent SDK統合実装（TASK-7Aシリーズ）              | 未実施     | **必須前提**     |

### 3.3 必要な知識

- Vitest テスティングフレームワーク（vi.mock、vi.fn、vi.spyOn）
- Agent SDK API仕様（query() API、Hooks、Permission）
- Electron Main Process テストパターン
- MSWまたはSDKモック戦略

### 3.4 推奨アプローチ

1. SDK APIのインターフェースを確認し、テスト用モックを設計
2. 共通SDKモックユーティリティを`__tests__/helpers/`に作成
3. agent-client.test.tsのTODOテストを順次有効化（API Key → エラーハンドリング → パラメータ）
4. sdk-integration.test.tsのTODOテストを有効化
5. skill-executor.test.tsのTODOテストを有効化
6. カバレッジ確認・リファクタリング

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                             |
| ----- | ---------------- | -------------------------------- |
| 1     | 要件定義         | SDK API仕様確認・テスト戦略策定  |
| 2     | 設計             | モック設計・テスト構造設計       |
| 4     | テスト作成       | SDKモック作成・TODOテスト有効化  |
| 5     | 実装             | テストコード実装・既存テスト修正 |
| 6-9   | テスト・品質     | カバレッジ確認・テスト品質検証   |
| 12    | ドキュメント更新 | システム仕様書・テスト仕様更新   |

### Phase 1: 要件定義

#### 目的

SDK API仕様を確認し、50+箇所のTODOテストを分類・優先順位付けする。

#### 手順

1. `@anthropic-ai/claude-agent-sdk`のAPI仕様を確認（query() API、Hooks、Permission）
2. 50+箇所のTODOテストを一覧化し、以下に分類:
   - API Key管理系（safeStorage, env fallback）
   - エラーハンドリング系（401, 500, timeout）
   - パラメータ検証系（model, max_tokens, systemPrompt）
   - SDK障害時UI表示系
3. テスト優先順位を決定（Critical Path → Edge Case）

#### 成果物

- テスト有効化計画書（TODO一覧 + 優先順位 + モック戦略）

#### 完了条件

- 全TODOテストが一覧化され、分類・優先順位が決定している

### Phase 4-5: テスト作成・実装

#### 目的

SDKモックを作成し、TODO状態のテストを順次有効化する。

#### 手順

1. `__tests__/helpers/sdk-mock.ts`にSDKモックユーティリティを作成
2. agent-client.test.ts: API Key取得テスト（L525-599）を有効化
3. agent-client.test.ts: エラーハンドリングテスト（L643-658）を有効化
4. sdk-integration.test.ts: SDK障害テスト（L137-197）を有効化
5. skill-executor.test.ts: タイムアウトテスト（L487）を有効化
6. 各テスト実行・GREEN確認

#### 成果物

- SDKモックユーティリティファイル
- 修正済みテストファイル3件

#### 完了条件

- 全TODOテストが有効化されている
- `pnpm test`が全テストGREEN
- カバレッジLine 90%以上

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] agent-client.test.ts: 12件のTODOテストが有効化されている
- [ ] sdk-integration.test.ts: 5件のTODOテストが有効化されている
- [ ] skill-executor.test.ts: 5件のTODOテストが有効化されている
- [ ] SDKモックユーティリティが共通化されている
- [ ] API Key管理（safeStorage/env fallback）がテストされている
- [ ] HTTPエラー（401/500）がテストされている
- [ ] タイムアウト（30秒）がテストされている

### 品質要件

- [ ] テストカバレッジ Line 90%以上
- [ ] テストカバレッジ Branch 85%以上
- [ ] `grep -r "TODO.*SDK統合後"` の結果が0件
- [ ] CI/CDで全テストがGREEN
- [ ] ESLint エラー0件

### ドキュメント要件

- [ ] interfaces-agent-sdk-executor.md 更新（テスト仕様追加）
- [ ] aiworkflow-requirements/LOGS.md 更新
- [ ] task-specification-creator/LOGS.md 更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                                    | 対象ファイル            | 期待結果                  |
| --- | ----------------------------------------------- | ----------------------- | ------------------------- |
| 1   | API KeyをsafeStorageから取得できる              | agent-client.test.ts    | safeStorage APIが呼ばれる |
| 2   | safeStorage失敗時に環境変数にフォールバック     | agent-client.test.ts    | process.envから取得       |
| 3   | API Key未設定時にエラーが発生する               | agent-client.test.ts    | 適切なエラーメッセージ    |
| 4   | 正しいmodel名がSDKに渡される                    | agent-client.test.ts    | パラメータ一致            |
| 5   | max_tokens=8192がSDKに渡される                  | agent-client.test.ts    | パラメータ一致            |
| 6   | systemPromptがSDKに渡される                     | agent-client.test.ts    | パラメータ一致            |
| 7   | 401 Unauthorizedが適切にハンドルされる          | agent-client.test.ts    | 認証エラーメッセージ      |
| 8   | 500 Internal Server Errorが適切にハンドルされる | agent-client.test.ts    | サーバーエラーメッセージ  |
| 9   | SDK APIエラー時にエラーメッセージが表示される   | sdk-integration.test.ts | UI上にエラー表示          |
| 10  | Invalid API Key時にエラーが表示される           | sdk-integration.test.ts | 適切なUI通知              |
| 11  | 30秒タイムアウト時の動作                        | skill-executor.test.ts  | タイムアウトエラー        |
| 12  | SDK呼び出し後にパラメータが正しく渡される       | sdk-integration.test.ts | query() パラメータ検証    |

### 検証手順

1. `pnpm test -- --filter agent-client` を実行し、全12件がGREEN
2. `pnpm test -- --filter sdk-integration` を実行し、全5件がGREEN
3. `pnpm test -- --filter skill-executor` を実行し、全5件がGREEN
4. `grep -rn "TODO.*SDK統合後" apps/desktop/src/` で0件を確認
5. `pnpm test -- --coverage` でカバレッジ90%以上を確認

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                                         |
| ------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| SDK API仕様が未確定で変更される       | 高     | 中       | モックをインターフェースベースで設計し、実装詳細に依存しない |
| safeStorageがテスト環境で利用できない | 中     | 高       | Electron APIモックを作成し、テスト環境での動作を保証         |
| テスト数増加によるCI時間の延長        | 低     | 中       | テストの並列実行を活用し、CI時間を許容範囲内に維持           |
| SDK未統合状態でのテスト実行           | 中     | 低       | vi.mockで完全にモック化し、SDK不在でもテスト実行可能にする   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | 用途                         |
| -------------------------------- | ---------------------------- |
| interfaces-agent-sdk-executor.md | SkillExecutor・Agent SDK仕様 |
| interfaces-agent-sdk-ui.md       | Agent SDK UI統合仕様         |
| interfaces-agent-sdk-history.md  | Agent SDK履歴管理仕様        |
| quality-requirements.md          | テストカバレッジ基準         |

### 参考資料

| ファイルパス                                                    | 該当行       | 内容                      |
| --------------------------------------------------------------- | ------------ | ------------------------- |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | L200,525-599 | SDK統合テストTODO（12件） |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | L137,197,451 | SDK統合テストTODO（5件）  |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | L416,437,487 | SDK統合テストTODO（5件）  |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: SDK統合後は以下を有効化（skill-executor.test.ts:416）
// TODO: SDK統合後に実装（agent-client.test.ts:525）
// TODO: SDK統合後、実際のAPIエラーをシミュレートする（agent-client.test.ts:200）
// TODO: SDK統合後、パラメータが正しく渡されることを検証（sdk-integration.test.ts:451）
```

### 補足事項

- 本タスクはAgent SDK統合実装（TASK-7Aシリーズ）が完了した後に実行する
- テスト有効化はSDK統合と同時並行で進めることも可能（モックベースでのテスト先行作成）
- agent-client.test.tsのテストが最も数が多い（12件）ため、優先的に着手することを推奨
- TASK-7DのテストパターンDiscriminated Union型（DisplayableStatus = Exclude）を踏襲すること
