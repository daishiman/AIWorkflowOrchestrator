# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | -                           |
| 後続Phase  | Phase 2                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-16                  |
| 機能名     | slide-agent-sdk-integration |

---

## 目的

タスクの目的、スコープ、受け入れ基準を明文化し、Claude Agent SDK統合に必要な機能要件・非機能要件を定義する。

## 背景

skill-executor.tsおよびagent-client.tsには現在シミュレーション実装が含まれており、実際のClaude Agent SDKとの統合が必要。本Phaseでは、統合に必要な要件を明確化し、実装フェーズに向けた基盤を整備する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件抽出

**目的**: ユーザー要求からClaude Agent SDK統合に必要な機能要件・非機能要件を抽出する

**実行手順**:

1. 未完了タスク元指示書（`docs/30-workflows/unassigned-task/task-imp-slide-agent-sdk-integration-001.md`）を精読する
2. 既存実装（`skill-executor.ts`, `agent-client.ts`）のTODOコメントとシミュレーション部分を確認する
3. interfaces-agent-sdk.mdからSDK統合に関する仕様を抽出する
4. 機能要件（FR）を列挙する:
   - FR-01: skill-executor.tsがClaude Agent SDKを呼び出してスキルを実行できる
   - FR-02: agent-client.tsが実際のAgent SDK API呼び出しを行う
   - FR-03: スキルフェーズ（hearing/structure/html/modifier）ごとにスキルを実行できる
   - FR-04: projectPathパラメータをスキル実行時のコンテキストとして渡せる
   - FR-05: 進捗コールバックでUI（SyncStatusIndicator）に進捗を反映できる
   - FR-06: AbortControllerによるキャンセル機能が動作する
   - FR-07: ModifierSkill（HTML→structure.md逆同期）が実動作する
5. 非機能要件（NFR）を列挙する:
   - NFR-01: 30秒以内のタイムアウト処理
   - NFR-02: APIキーのsafeStorage暗号化保存
   - NFR-03: エラー発生時の適切なエラーメッセージ表示
   - NFR-04: 非同期処理の適切な管理（メモリリーク防止）

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md` - 機能要件・非機能要件一覧

---

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 各機能要件（FR）に対してGiven-When-Then形式でACを作成する
2. 各非機能要件（NFR）に対して数値基準を含むACを作成する
3. AC一覧をドキュメント化する

**受け入れ基準の例**:

| ID    | 要件   | 受け入れ基準                                                                                    |
| ----- | ------ | ----------------------------------------------------------------------------------------------- |
| AC-01 | FR-01  | skill-executor.executeを呼び出すと、Agent SDKのqueryメソッドが実行される                        |
| AC-02 | FR-02  | agent-client.queryを呼び出すと、実際のHTTPS通信がClaude Agent SDKサーバーに送信される           |
| AC-03 | FR-03  | 各スキルフェーズ（hearing/structure/html/modifier）でスキル名が正しくマッピングされて実行される |
| AC-04 | FR-04  | projectPathパラメータがAgent SDKリクエストのコンテキストとして含まれる                          |
| AC-05 | FR-05  | スキル実行中に進捗（0%, 25%, 50%, 100%）がSyncStatusIndicatorに反映される                       |
| AC-06 | FR-06  | cancel()呼び出しでAbortController.abortが発火し、実行中のクエリが中断される                     |
| AC-07 | FR-07  | HTML変更検知時にModifierSkillが実行され、structure.mdが更新される                               |
| AC-08 | NFR-01 | 30秒経過後にタイムアウトエラーが発生し、適切なエラーメッセージが表示される                      |
| AC-09 | NFR-02 | APIキーがElectron safeStorageで暗号化されて保存される                                           |
| AC-10 | NFR-03 | SDK呼び出し失敗時に、UIにエラーメッセージが表示される                                           |
| AC-11 | NFR-04 | 繰り返しスキル実行後もメモリ使用量が増加し続けない                                              |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準一覧

---

### タスク3: スコープ定義

**目的**: 実装スコープを明確化し、スコープ内外を定義する

**実行手順**:

1. スコープ内を定義する:
   - skill-executor.tsへのClaude Agent SDK統合
   - agent-client.tsへの実SDK API呼び出し実装
   - projectPathパラメータの活用
   - スキルフェーズとAgent SDKスキル名のマッピング
   - エラーハンドリングの実装
   - 統合テストの追加
2. スコープ外を定義する:
   - Agent SDK自体の開発・修正
   - 新しいスキルフェーズの追加
   - UIコンポーネントの変更（既存のSyncStatusIndicatorで対応可能）
   - 他のSlide関連モジュール（file-watcher, sync-manager）の変更
   - リトライロジックの実装（将来タスクとして記録）

**期待される成果物**:

- `outputs/phase-1/scope-definition.md` - スコープ定義書

---

## 参照資料

| 参照資料       | パス                                                                            | 内容             |
| -------------- | ------------------------------------------------------------------------------- | ---------------- |
| 未完了タスク元 | `docs/30-workflows/unassigned-task/task-imp-slide-agent-sdk-integration-001.md` | 元のタスク指示書 |
| Agent SDK仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | SDK統合仕様      |
| skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`                                 | 現行実装         |
| agent-client   | `apps/desktop/src/main/slide/agent-client.ts`                                   | 現行実装         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                    |
| ------------- | --------------------------------------------------------------------------- | ----------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK統合インターフェース |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

SDK接続要件（API認証・タイムアウト・エラー処理）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                            |
| ---------------- | --------------------------------------------------- |
| API接続          | Claude Agent SDK HTTPS通信、safeStorage認証         |
| タイムアウト     | 30秒タイムアウト、AbortController連携               |
| エラー処理       | SDK呼び出し失敗時のエラーハンドリング、リトライなし |

---

## 完了条件

- [ ] 全機能要件（FR-01〜FR-07）が抽出されている
- [ ] 全非機能要件（NFR-01〜NFR-04）が抽出されている
- [ ] 各要件に受け入れ基準がある（AC-01〜AC-11）
- [ ] スコープ内外が明確に定義されている
- [ ] SDK接続要件（API認証・タイムアウト・エラー処理）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2（設計）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 要件抽出
3. タスク2: 受け入れ基準作成
4. タスク3: スコープ定義
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 次のPhase

Phase 2: 設計
