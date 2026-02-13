# Phase 1: 要件定義 -- 無効化されたSDK統合テスト17箇所の有効化

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT               |
| Phase番号  | 1                                               |
| Phase名    | 要件定義                                        |
| 機能名     | sdk-test-enablement                             |
| 目的       | 無効化されたSDK統合テスト17箇所の有効化要件定義 |
| 分類       | テスト品質改善                                  |
| 前提Phase  | なし（本タスクの起点）                          |
| 後続Phase  | Phase 2（設計）                                 |
| 前提タスク | TASK-9B-I-SDK-FORMAL-INTEGRATION（完了済み）    |
| ステータス | 未実施                                          |
| ブランチ   | fix/task-fix-11-1-sdk-test-enablement           |
| 関連Issue  | Issue #641                                      |
| 作成日     | 2026-02-13                                      |

---

## 目的

TASK-9B-I-SDK-FORMAL-INTEGRATION の完了により Claude Agent SDK の正式統合が完了したが、テストコード内に `// TODO: SDK統合後に実装` または `// TODO: SDK統合後は以下を有効化` のコメントとともに無効化されたテストアサーション・テスト実装が17箇所残存している。これらのテストは SDK 統合前にプレースホルダーとして作成された TDD Red Phase のテストであり、現在は実質的に検証を行わないダミーテストとなっている。本タスクでは、これら17箇所を全て有効化し、SDK統合済みの実装に対する正当なテスト検証を行えるようにするための要件を定義する。

---

## 実行タスク

- 現状分析: 対象3ファイルのTODO 17箇所を特定し、テスト種別ごとに分類する
- 要件抽出: FR/NFRを定義し、有効化方針を明確化する
- 受入基準定義: Given-When-Then形式で検証可能な受入基準を作成する
- スコープ定義: スコープ内/外を明示し、実装対象を固定する

### Task 1: 現状分析 -- TODO箇所の特定と分類

#### 対象ファイル一覧

| #   | ファイル                | パス                                                            | TODO箇所数 |
| --- | ----------------------- | --------------------------------------------------------------- | ---------- |
| 1   | skill-executor.test.ts  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | 5箇所      |
| 2   | agent-client.test.ts    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | 9箇所      |
| 3   | sdk-integration.test.ts | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 3箇所      |

#### skill-executor.test.ts（5箇所）

| TODO-ID   | テストID  | 行番号 | TODOコメント内容                            | 現状                                                                 |
| --------- | --------- | ------ | ------------------------------------------- | -------------------------------------------------------------------- |
| SE-TODO-1 | SDK-SE-01 | L416   | `SDK統合後は以下を有効化`                   | `mockAgentAPI.query` のスキル名マッピング検証がコメントアウト        |
| SE-TODO-2 | SDK-SE-02 | L437   | `SDK統合後は以下を有効化`                   | `mockAgentAPI.query` の projectPath コンテキスト検証がコメントアウト |
| SE-TODO-3 | SDK-SE-05 | L487   | `SDK統合後、実際の30秒タイムアウトをテスト` | 30秒タイムアウトテストがコメントアウト、現在は1秒で成功を返すだけ    |
| SE-TODO-4 | SDK-SE-13 | L623   | `SDK統合後に実装`                           | API key not found エラーのテストが未実装（成功を返すだけ）           |
| SE-TODO-5 | SDK-SE-14 | L636   | `SDK統合後に実装`                           | SDK呼び出し失敗エラーのテストが未実装（成功を返すだけ）              |

#### agent-client.test.ts（9箇所）

| TODO-ID   | テストID  | 行番号 | TODOコメント内容                               | 現状                                                |
| --------- | --------- | ------ | ---------------------------------------------- | --------------------------------------------------- |
| AC-TODO-1 | AC-06     | L200   | `SDK統合後、実際のAPIエラーをシミュレートする` | APIエラーシミュレーションが未実装（成功を返すだけ） |
| AC-TODO-2 | SDK-AC-01 | L525   | `SDK統合後に実装`                              | safeStorage からAPIキー取得の検証が未実装           |
| AC-TODO-3 | SDK-AC-02 | L539   | `SDK統合後に実装`                              | 環境変数フォールバックの検証が未実装                |
| AC-TODO-4 | SDK-AC-03 | L553   | `SDK統合後に実装`                              | APIキー未検出エラーの検証が未実装                   |
| AC-TODO-5 | SDK-AC-04 | L570   | `SDK統合後に実装`                              | 正しいモデル使用の検証が未実装                      |
| AC-TODO-6 | SDK-AC-05 | L584   | `SDK統合後に実装`                              | max_tokens設定の検証が未実装                        |
| AC-TODO-7 | SDK-AC-06 | L598   | `SDK統合後に実装`                              | systemPrompt渡しの検証が未実装                      |
| AC-TODO-8 | SDK-AC-09 | L643   | `SDK統合後に実装`                              | 401 Unauthorizedハンドリングが未実装                |
| AC-TODO-9 | SDK-AC-10 | L657   | `SDK統合後に実装`                              | 500 Internal Server Errorハンドリングが未実装       |

#### sdk-integration.test.ts（3箇所）

| TODO-ID    | テストID   | 行番号 | TODOコメント内容                                  | 現状                                            |
| ---------- | ---------- | ------ | ------------------------------------------------- | ----------------------------------------------- |
| INT-TODO-1 | INT-02     | L137   | `SDK統合後に実装`                                 | 無効APIキーエラー検証が未実装（成功を返すだけ） |
| INT-TODO-2 | INT-05     | L197   | `SDK統合後に実装`                                 | SDK障害時エラーメッセージ検証が未実装           |
| INT-TODO-3 | SDK-INT-01 | L451   | `SDK統合後、パラメータが正しく渡されることを検証` | SDKパラメータ検証が未実装（成功を返すだけ）     |

### Task 2: 要件抽出

#### 機能要件（FR）

| FR-ID  | 要件                                                                                          | 対象テストファイル      | 優先度 |
| ------ | --------------------------------------------------------------------------------------------- | ----------------------- | ------ |
| FR-001 | `skill-executor.test.ts` のコメントアウトされた `mockAgentAPI.query` 呼び出し検証を有効化する | skill-executor.test.ts  | 必須   |
| FR-002 | `skill-executor.test.ts` のコメントアウトされた projectPath コンテキスト検証を有効化する      | skill-executor.test.ts  | 必須   |
| FR-003 | `skill-executor.test.ts` の30秒タイムアウトテストを SDK 統合版に書き換える                    | skill-executor.test.ts  | 必須   |
| FR-004 | `skill-executor.test.ts` の API key not found エラーテストを実装する                          | skill-executor.test.ts  | 必須   |
| FR-005 | `skill-executor.test.ts` の SDK 呼び出し失敗エラーテストを実装する                            | skill-executor.test.ts  | 必須   |
| FR-006 | `agent-client.test.ts` の API エラーシミュレーションテストを `mockCreate` で実装する          | agent-client.test.ts    | 必須   |
| FR-007 | `agent-client.test.ts` の safeStorage API キー取得テストを実装する                            | agent-client.test.ts    | 必須   |
| FR-008 | `agent-client.test.ts` の環境変数フォールバックテストを実装する                               | agent-client.test.ts    | 必須   |
| FR-009 | `agent-client.test.ts` の API キー未検出エラーテストを実装する                                | agent-client.test.ts    | 必須   |
| FR-010 | `agent-client.test.ts` のモデル名検証テストを `mockCreate` 引数検証で実装する                 | agent-client.test.ts    | 必須   |
| FR-011 | `agent-client.test.ts` の max_tokens 設定検証テストを `mockCreate` 引数検証で実装する         | agent-client.test.ts    | 必須   |
| FR-012 | `agent-client.test.ts` の systemPrompt 渡し検証テストを `mockCreate` 引数検証で実装する       | agent-client.test.ts    | 必須   |
| FR-013 | `agent-client.test.ts` の 401 Unauthorized エラーハンドリングテストを実装する                 | agent-client.test.ts    | 必須   |
| FR-014 | `agent-client.test.ts` の 500 Internal Server Error ハンドリングテストを実装する              | agent-client.test.ts    | 必須   |
| FR-015 | `sdk-integration.test.ts` の無効APIキーエラー検証テストを実装する                             | sdk-integration.test.ts | 必須   |
| FR-016 | `sdk-integration.test.ts` の SDK 障害時エラーメッセージ検証テストを実装する                   | sdk-integration.test.ts | 必須   |
| FR-017 | `sdk-integration.test.ts` の SDK パラメータ正当性検証テストを `mockCreate` 引数検証で実装する | sdk-integration.test.ts | 必須   |

#### 非機能要件（NFR）

| NFR-ID  | 要件                                                                           | 優先度 |
| ------- | ------------------------------------------------------------------------------ | ------ |
| NFR-001 | 有効化した17箇所のテスト全件が `pnpm --filter @repo/desktop test` で PASS する | 必須   |
| NFR-002 | 既存のテスト（TODO箇所以外）が変更の影響を受けず全件 PASS する                 | 必須   |
| NFR-003 | 全 TODO コメント（`// TODO: SDK統合後`）が対象ファイルから除去される           | 必須   |
| NFR-004 | テスト実行時間の増加が1ファイルあたり10秒以内に収まる                          | 推奨   |
| NFR-005 | `pnpm typecheck` が全パッケージで PASS する                                    | 必須   |
| NFR-006 | テストコードに `any` 型を使用しない                                            | 必須   |
| NFR-007 | 既存の `vi.mock` / `vi.hoisted` パターンを活用し、新たなモック戦略を導入しない | 推奨   |

### Task 3: 受入基準定義

#### 受入基準一覧

| AC-ID  | Given                                      | When                                             | Then                                                                               |
| ------ | ------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| AC-001 | 全17箇所のテストが有効化された状態         | `pnpm --filter @repo/desktop test` を実行する    | 全テストが PASS する                                                               |
| AC-002 | 対象3ファイルが更新された状態              | `grep -n "TODO: SDK統合後" *.test.ts` を実行する | 一致する行が 0 件である                                                            |
| AC-003 | `skill-executor.test.ts` が更新された状態  | SDK-SE-01 テストを実行する                       | `mockAgentAPI.query` がスキル名を含むプロンプトで呼び出されたことを検証する        |
| AC-004 | `skill-executor.test.ts` が更新された状態  | SDK-SE-02 テストを実行する                       | `mockAgentAPI.query` が projectPath を含むコンテキストで呼び出されたことを検証する |
| AC-005 | `skill-executor.test.ts` が更新された状態  | SDK-SE-05 テストを実行する                       | 30秒タイムアウト時に `success: false` と適切なエラーメッセージが返される           |
| AC-006 | `skill-executor.test.ts` が更新された状態  | SDK-SE-13 テストを実行する                       | API key not found 時に `success: false` とエラーが返される                         |
| AC-007 | `skill-executor.test.ts` が更新された状態  | SDK-SE-14 テストを実行する                       | SDK 呼び出し失敗時に `success: false` とエラーが返される                           |
| AC-008 | `agent-client.test.ts` が更新された状態    | AC-06 テストを実行する                           | `mockCreate` で API エラーをシミュレートし、reject されることを検証する            |
| AC-009 | `agent-client.test.ts` が更新された状態    | SDK-AC-01 テストを実行する                       | safeStorage 経由で API キーが取得されることを検証する                              |
| AC-010 | `agent-client.test.ts` が更新された状態    | SDK-AC-04 テストを実行する                       | `mockCreate` が `claude-sonnet-4-20250514` モデルで呼び出されることを検証する      |
| AC-011 | `agent-client.test.ts` が更新された状態    | SDK-AC-05 テストを実行する                       | `mockCreate` が `max_tokens: 8192` で呼び出されることを検証する                    |
| AC-012 | `agent-client.test.ts` が更新された状態    | SDK-AC-06 テストを実行する                       | `mockCreate` に systemPrompt が渡されることを検証する                              |
| AC-013 | `agent-client.test.ts` が更新された状態    | SDK-AC-09/10 テストを実行する                    | 401/500 エラー時に適切なエラーステータスとメッセージが返される                     |
| AC-014 | `sdk-integration.test.ts` が更新された状態 | INT-02 テストを実行する                          | 無効 API キーでエラーが発生し `success: false` が返される                          |
| AC-015 | `sdk-integration.test.ts` が更新された状態 | INT-05 テストを実行する                          | SDK 障害時にエラーメッセージが結果に含まれる                                       |
| AC-016 | `sdk-integration.test.ts` が更新された状態 | SDK-INT-01 テストを実行する                      | SDK パラメータ（model, max_tokens, system 等）が正しく渡されることを検証する       |
| AC-017 | 全ファイルが更新された状態                 | `pnpm typecheck` を実行する                      | エラー 0 件で成功する                                                              |

### Task 4: スコープ定義

#### スコープ内（含むもの）

| 項目                       | 説明                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| TODO テストの有効化        | 17箇所の `// TODO: SDK統合後` コメントに対応するテストの実装・有効化 |
| TODO コメントの除去        | 有効化完了後の TODO コメント行の削除                                 |
| 既存モック拡張             | `mockAgentAPI.query` / `mockCreate` の条件分岐モック追加             |
| エラーシミュレーション実装 | 401/500/タイムアウト/API key not found のモック実装                  |
| テスト期待値の更新         | シミュレーション成功→SDK連携エラーハンドリングへの期待値変更         |

#### スコープ外（含まないもの）

| 項目                                           | 除外理由                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| プロダクションコード（実装）の変更             | テストコードのみを対象とする                                         |
| 新規テストケースの追加                         | 既存 TODO 箇所の有効化に限定する                                     |
| テストフレームワークのアップデート             | Vitest の設定変更は行わない                                          |
| `agent-client.ts` / `skill-executor.ts` の修正 | 実装ファイルへの変更は本タスクのスコープ外                           |
| 他のテストファイルの修正                       | 対象は3ファイル（skill-executor, agent-client, sdk-integration）のみ |

### アーキテクチャ層別要件

| 層                         | 影響 | 内容                                               |
| -------------------------- | ---- | -------------------------------------------------- |
| フロントエンド（Renderer） | なし | テストコードのみの変更                             |
| バックエンド（Main）       | なし | テストコードのみの変更（実装ファイルは変更しない） |
| IPC 通信                   | なし | IPC チャンネル・ハンドラは変更なし                 |
| Preload                    | なし | Preload API は変更なし                             |
| Shared                     | なし | 共有型定義は変更なし                               |
| テスト層                   | あり | Main Process slide 機能のテストファイル3件を修正   |

---

## 参照資料

| 参照資料               | パス                                                            | 内容                                     |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | TODO 5箇所を含むテストファイル           |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | TODO 9箇所を含むテストファイル           |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | TODO 3箇所を含むテストファイル           |
| skill-executor 実装    | `apps/desktop/src/main/slide/skill-executor.ts`                 | テスト対象の実装ファイル                 |
| agent-client 実装      | `apps/desktop/src/main/slide/agent-client.ts`                   | テスト対象の実装ファイル                 |
| 前提タスク仕様書       | `docs/30-workflows/completed-tasks/sdk-formal-integration/`     | TASK-9B-I の完了成果物                   |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                              | テスト設計基準                           |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                            | P9, P13, P20, P21 等のテスト関連落とし穴 |

---

## 実行手順

### Step 1: 現状分析の実行

1. 対象3ファイルを読み込み、全17箇所の TODO コメントの正確な行番号と内容を確認する
2. 各 TODO 箇所の周辺コード（テスト構造、モック設定、beforeEach 設定）を分析する
3. 既存の `vi.mock` / `vi.hoisted` パターンを整理する

### Step 2: テストカテゴリの分類

1. 17箇所をテスト種別（引数検証、エラーハンドリング、タイムアウト、APIキー管理）に分類する
2. 各カテゴリごとのモック戦略要件を特定する

### Step 3: 要件の確定

1. Task 1 の分析結果に基づき、FR/NFR を確定する
2. 各要件の優先度と技術的実現可能性を検証する

### Step 4: 受入基準の作成

1. 各 FR/NFR に対応する受入基準を Given-When-Then 形式で作成する
2. 自動検証可能な基準（grep, test, typecheck）を優先する

---

## 成果物

| 成果物     | 説明                               | 配置先                                |
| ---------- | ---------------------------------- | ------------------------------------- |
| 要件定義書 | FR/NFR・スコープ・受入基準の確定版 | 本ファイル（phase-1-requirements.md） |

---

## 統合テスト連携

本タスクは既存テストコードの有効化であり、統合テスト自体が対象である。有効化後のテストが既存の統合テストシナリオ（INT-01 ~ INT-15, SDK-INT-01 ~ SDK-INT-05）と整合することを Phase 5 の全テスト実行で確認する。

---

## 完了条件

- [ ] 対象3ファイルの全17箇所の TODO コメントが特定・文書化されている
- [ ] 各 TODO 箇所のテスト種別（引数検証/エラーハンドリング/タイムアウト/APIキー管理）が分類されている
- [ ] 機能要件（FR-001 ~ FR-017）が定義されている
- [ ] 非機能要件（NFR-001 ~ NFR-007）が定義されている
- [ ] 受入基準（AC-001 ~ AC-017）が Given-When-Then 形式で作成されている
- [ ] スコープ内・スコープ外が明確に定義されている
- [ ] 既存テストの `vi.mock` / `vi.hoisted` パターンが分析されている
- [ ] 本Phase内の全タスクを100%実行完了した

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

## 次Phase

**Phase 2: 設計** -- テスト有効化のアプローチ設計（モック戦略・エラーシミュレーション設計）
