# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 1                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

`registerAllIpcHandlers()` 内で1つの `registerXxxHandlers()` が例外を投げた場合に後続ハンドラが全て未登録になる問題の要件を定義し、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: 現行コードの障害伝播パターンを分析し、Graceful Degradation の機能要件を抽出する
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義する
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定する

## 参照資料

| 資料名                 | パス                                                                                        | 説明                            |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| IPC ハンドラ登録       | `apps/desktop/src/main/ipc/index.ts`                                                        | 主対象ファイル                  |
| quick reference        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | 参照導線の起点                  |
| エラーハンドリング方針 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ定義              |
| Electronサービス設計   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービスアーキテクチャ          |
| IPC API仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC チャンネル仕様              |
| IPC ライフサイクル     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | register/unregister 対称性      |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 部分失敗・非IPCリスナー観点     |
| 登録一元管理           | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | `registerAllIpcHandlers` の責務 |
| 実行教訓               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 / IPC 修正の再発防止   |
| 実装教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 二重登録・解除漏れの苦戦箇所    |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P5（二重登録）、P44（不整合）   |

### システム仕様（aiworkflow-requirements）

- `error-handling.md`: エラーカテゴリ 4000-4999（Infrastructure Error）に本件を分類
- `arch-electron-services.md`: Main Process サービス初期化の設計原則
- `api-ipc-system.md`: IPC チャンネル一覧と登録パターン
- `security-electron-ipc.md`: IPC ハンドラのライフサイクルと非IPCリスナー解除
- `architecture-implementation-patterns.md`: Main Process 側の再登録パターンと依存境界
- `arch-ipc-persistence.md`: `registerAllIpcHandlers` を単一エントリポイントとして扱う原則
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`: P5再発防止、解除対称性、監査時の確認順序

### 今回の実装で必要な仕様抽出結果

| 関心ごと                             | 参照先                                                                                                                                       | このタスクで使う理由                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 障害時も他ハンドラを止めない責務境界 | `architecture-implementation-patterns.md`                                                                                                    | 1件失敗時の継続登録を設計レベルで判断するため       |
| register / unregister の対称性       | `security-electron-ipc.md`                                                                                                                   | 部分失敗時でも解除安全性を崩さないため              |
| `registerAllIpcHandlers` の単一責務  | `arch-ipc-persistence.md`                                                                                                                    | 登録導線の正本を外さないため                        |
| サービス初期化の依存順序             | `arch-electron-services.md`                                                                                                                  | 失敗しやすい初期化グループを切り出すため            |
| エラー分類とログ最小化               | `error-handling.md`                                                                                                                          | Infrastructure Error とサニタイズ方針を固定するため |
| IPC 契約影響範囲                     | `api-ipc-system.md`                                                                                                                          | runtime 契約変更の有無を切り分けるため              |
| 監査・再発防止                       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | P5 / 非IPCリスナー / 監査順序の教訓を踏まえるため   |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: 現行コード分析

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` を読み、以下を確認する:

1. 呼び出される `registerXxxHandlers()` 関数の一覧を列挙する（約30個）
2. 各関数が依存するサービス初期化処理を特定する
3. 例外が発生しうる箇所（サービスコンストラクタ、外部リソースアクセス）を洗い出す

### ステップ2: 障害シナリオの定義

以下の障害シナリオを定義する:

| シナリオ                        | 発生条件                            | 影響範囲                       |
| ------------------------------- | ----------------------------------- | ------------------------------ |
| SkillService 初期化失敗         | ホームディレクトリ未設定 / 権限不足 | Skill系ハンドラ全て（7個以上） |
| Supabase クライアント例外       | 環境変数不正                        | Auth/Profile/Avatar ハンドラ   |
| electron-store インスタンス例外 | ストレージ破損                      | SkillStore依存ハンドラ         |
| ファイルシステムアクセス例外    | パス不正 / ディスク容量不足         | File/Workspace系ハンドラ       |

### ステップ3: 要件定義

#### 機能要件（FR）

| ID    | 要件                                                                                 | 優先度 |
| ----- | ------------------------------------------------------------------------------------ | ------ |
| FR-01 | 各 `registerXxxHandlers()` の失敗が後続の `registerXxxHandlers()` の登録を阻害しない | 必須   |
| FR-02 | 失敗した `registerXxxHandlers()` のハンドラ名とエラー詳細をログに記録する            | 必須   |
| FR-03 | 全ハンドラ登録完了後、失敗したハンドラの一覧を返却する（呼び出し元で利用可能）       | 推奨   |
| FR-04 | `unregisterAllIpcHandlers()` は失敗したハンドラも含めて安全に解除処理を実行する      | 必須   |

#### 非機能要件（NFR）

| ID     | 要件                                                                           | 優先度 |
| ------ | ------------------------------------------------------------------------------ | ------ |
| NFR-01 | ハンドラ登録処理全体の実行時間が現行比で10%以上増加しない                      | 推奨   |
| NFR-02 | エラーログに内部実装詳細（ファイルパス、環境変数値）を含めない（セキュリティ） | 必須   |
| NFR-03 | エラーカテゴリは Infrastructure Error（4000-4999）を使用する                   | 必須   |

### ステップ4: 受け入れ基準

| AC-ID | 受け入れ基準                                                                                 |
| ----- | -------------------------------------------------------------------------------------------- |
| AC-01 | `registerSkillHandlers` が例外を投げた場合でも、`registerAuthKeyHandlers` が正常に登録される |
| AC-02 | 失敗したハンドラ名がログに出力される（`console.error` または `electron-log`）                |
| AC-03 | 全ハンドラ登録後、`registerAllIpcHandlers` の戻り値から失敗ハンドラ一覧を取得できる          |
| AC-04 | 1つも失敗しない正常ケースで、既存の動作と完全に同一である                                    |
| AC-05 | `unregisterAllIpcHandlers` → `registerAllIpcHandlers` の再登録フローが正常に動作する         |

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| IPC通信          | `registerAllIpcHandlers` が部分的に成功した場合のRenderer側の挙動 |
| エラーログ       | electron-log によるログ出力形式                                   |
| プロセス間連携   | Main Process 起動シーケンスとの整合性                             |

## 成果物

| 成果物       | パス                                         | 説明                   |
| ------------ | -------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な受け入れ基準 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲と除外範囲     |

## 完了条件

- [ ] 全要件（FR-01〜FR-04, NFR-01〜NFR-03）が抽出されている
- [ ] 各要件に受け入れ基準（AC-01〜AC-05）がある
- [ ] FR/NFRが分類され優先度が設定されている
- [ ] 障害シナリオが4件以上定義されている
- [ ] エラーカテゴリが Infrastructure Error（4000-4999）に分類されている
- [ ] `unregisterAllIpcHandlers` との整合性が確認されている（P5対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
