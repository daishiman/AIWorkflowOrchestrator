# Phase 1: 要件定義（契約棚卸し） - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001

## メタ情報

| 項目               | 値                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001                                                |
| Phase              | 1（要件定義）                                                                            |
| 機能名             | skill-ipc-response-consistency                                                           |
| 作成日             | 2026-02-27                                                                               |
| 前提Phase          | なし（開始Phase）                                                                        |
| 目的               | `skill:` 全14チャネルの現状契約を棚卸しし、Main/Preload/Renderer間の契約差分を可視化する |
| 成果物ディレクトリ | `docs/30-workflows/skill-ipc-response-consistency/outputs/phase-1/`                      |

## 目的

`skill:` 全14チャネルの現状契約を棚卸しし、Main/Preload/Renderer間の契約差分を可視化する。

### 背景

skillHandlers.ts の `skill:` チャネルで戻り値契約が混在（ラッパー返却 / 直接返却 / 例外返却）しており、呼び出し層での契約解釈が統一されていない。方針Cの設計に向けた現状把握が必要。

## 実行タスク

### Task 1-1: 全14チャネルの契約棚卸し

**目的**: skillHandlers.ts の全 `skill:` チャネルの return/throw パターンを表形式で一覧化する。

**手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開き、全 `ipcMain.handle` 登録を列挙する
2. 各チャネルの戻り値パターンを以下のカテゴリで分類する:
   - **ラッパー返却型**: `{ success: true, data: T }` / `{ success: false, error: string }`
   - **直接返却型**: `T` を直接 return（例外時は throw）
   - **void型**: 戻り値なし
   - **プリミティブ型**: `boolean` / `string | null` 等
3. 各チャネルの throw パターン（構造化エラー vs 例外 vs なし）を記録する
4. 契約パターンマトリクスを `outputs/phase-1/contract-matrix.md` に作成する

**成果物**: `outputs/phase-1/contract-matrix.md`

**対象チャネル一覧**:

| #   | チャネル名                | 現時点の想定戻り値型                        |
| --- | ------------------------- | ------------------------------------------- |
| 1   | `skill:list`              | `{ success, data: SkillMetadata[] }`        |
| 2   | `skill:getImported`       | `{ success, data: ImportedSkill[] }`        |
| 3   | `skill:import`            | `ImportedSkill`（直接返却）                 |
| 4   | `skill:remove`            | `RemoveResult`                              |
| 5   | `skill:get-detail`        | `{ success, data: Skill }`                  |
| 6   | `skill:execute`           | `{ success, data: SkillExecutionResponse }` |
| 7   | `skill:abort`             | `boolean`                                   |
| 8   | `skill:get-status`        | `ExecutionStatus \| null`                   |
| 9   | `skill:analyze`           | `OperationResult<SkillAnalysis>`            |
| 10  | `skill:improve`           | `OperationResult<ImprovementResult>`        |
| 11  | `skill:optimize`          | `OperationResult<OptimizationResult>`       |
| 12  | `skill:optimize:variants` | `OperationResult<string[]>`                 |
| 13  | `skill:optimize:evaluate` | `OperationResult<PromptEvaluation>`         |
| 14  | `skill:scan`              | （要確認）                                  |

---

### Task 1-2: Preload API 対応付け

**目的**: skill-api.ts の各メソッドの `safeInvoke` / `safeInvokeUnwrap` 使用状況を対応付ける。

**手順**:

1. `apps/desktop/src/preload/skill-api.ts` を開き、各メソッドの IPC 呼び出し方法を確認する
2. `safeInvoke` と `safeInvokeUnwrap` の選択基準と現状使用状況を対比表にまとめる:
   - `safeInvoke`: Main の戻り値をそのまま Renderer に渡す
   - `safeInvokeUnwrap`: Main の `{ success, data }` を unwrap して `data` のみ渡す
3. チャネルごとに「Main の戻り値型」→「Preload の変換」→「Renderer に届く型」のフローを記録する
4. 結果を `outputs/phase-1/preload-mapping.md` に出力する

**成果物**: `outputs/phase-1/preload-mapping.md`

---

### Task 1-3: Renderer 利用側の期待形抽出

**目的**: Renderer コンポーネント・Store が skill API のどの型を期待しているかを抽出する。

**手順**:

1. `rg -n "electronAPI\.skill\." apps/desktop/src/renderer` で全利用箇所を特定する
2. 各利用箇所の戻り値解釈パターンを記録する:
   - `.executionId` 直参照（直接返却を期待）
   - `.success` 判定（ラッパー返却を期待）
   - `.data` アクセス（unwrap済みデータを期待）
   - try/catch のみ（throw を期待）
3. 利用箇所ごとに「期待する型」と「実際に受け取る型」の一致/不一致を判定する
4. `outputs/phase-1/renderer-expectations.md` に一覧を出力する

**成果物**: `outputs/phase-1/renderer-expectations.md`

---

### Task 1-4: 仕様正本との差分表作成

**目的**: aiworkflow-requirements の正本（AR-1〜AR-7制約）と現状実装の差分を可視化する。

**手順**:

1. 以下の AR-1〜AR-7 制約を基準として確認する:

| ID   | 抽出元                                    | 必須制約                                                                      |
| ---- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| AR-1 | `interfaces-agent-sdk-skill.md`           | `skill:import` は `skillName: string` 受け取り、`ImportedSkill` を返す        |
| AR-2 | `architecture-implementation-patterns.md` | `{ success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke` を選択 |
| AR-3 | `security-skill-ipc.md`                   | `validateIpcSender` + 文字列 `.trim()` 非空検証を全 `skill:` ハンドラで実施   |
| AR-4 | `security-electron-ipc.md`                | IPC入力検証を Main 側で行い、不正入力を早期拒否する                           |
| AR-5 | `ipc-contract-checklist.md`               | 型同期（shared/preload）・仕様同期・テスト検証を必須で実施                    |
| AR-6 | `task-workflow.md`                        | 本タスクIDと指示書パスの参照整合を維持する                                    |
| AR-7 | `arch-electron-services.md`               | `skill:remove` の戻り値契約は `RemoveResult`、Preload 側型と乖離させない      |

2. 各制約ごとに「正本の規定」と「現状実装」を対比する
3. `outputs/phase-1/as-is-gap-analysis.md` に AS-IS差分表を出力する

**成果物**: `outputs/phase-1/as-is-gap-analysis.md`

---

### Task 1-5: 要件書作成

**目的**: Phase 2 以降の設計に必要な要件一覧を確定する。

**手順**:

1. Task 1-1〜1-4 の結果を統合し、以下を定義する:
   - **機能要件**: 契約統一の対象チャネル、各プロファイルの定義、Preload変換ルール
   - **非機能要件**: 後方互換性、テスト影響、パフォーマンス制約
   - **接続要件**: IPC/Preload/Renderer 契約の接続ポイント
2. `outputs/phase-1/requirements.md` に出力する

**成果物**: `outputs/phase-1/requirements.md`

---

## SubAgent 分担

| SubAgent   | 担当                                                   |
| ---------- | ------------------------------------------------------ |
| SubAgent-A | Task 1-1（契約棚卸し）+ Task 1-2（Preload対応付け）    |
| SubAgent-B | Task 1-3（Renderer期待形抽出）+ Task 1-4（差分表作成） |
| SubAgent-C | Task 1-5（要件書統合）— SubAgent-A/B 完了後に実行      |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                  |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Skill IPC インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill: チャネル型定義 |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 検証パターン          |
| Electron IPC セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則  |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44統合   |
| API IPC Agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル仕様          |
| Electron サービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービス層設計        |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S2/S13/S18パターン    |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ        |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P42/P44/P45   |

### タスク固有参照

| 参照資料                 | パス                                                                       | 内容               |
| ------------------------ | -------------------------------------------------------------------------- | ------------------ |
| タスク指示書（完了記録） | `docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md` | 元タスクの詳細仕様 |

## 統合テスト連携

- 接続要件（IPC/Preload/Renderer契約）を要件に明記し、Phase 4（テスト作成）の入力とする
- 各チャネルの契約プロファイルが Phase 2 の設計入力となる
- AR-1〜AR-7 制約の充足状況が Phase 3 のレビュー基準となる

## 多角的チェック観点

| 観点           | 適用判断              | 仕様参照先                                                   |
| -------------- | --------------------- | ------------------------------------------------------------ |
| セキュリティ   | 必須（AR-3/AR-4）     | `security-skill-ipc.md`, `security-electron-ipc.md`          |
| UI/UX          | 非該当（IPC層タスク） | —                                                            |
| アーキテクチャ | 必須                  | `interfaces-agent-sdk-skill.md`, `arch-electron-services.md` |
| 型安全         | 必須（AR-5）          | `architecture-implementation-patterns.md`                    |
| テスト         | 確認のみ              | Phase 4 で本格対応                                           |

### Electron デスクトップアプリ観点

| 層                         | 適用判断 | 確認内容                                       |
| -------------------------- | -------- | ---------------------------------------------- |
| フロントエンド（Renderer） | 必須     | 戻り値解釈パターンの棚卸し                     |
| バックエンド（Main）       | 必須     | 全14チャネルの return/throw パターン分類       |
| IPC通信                    | 必須     | チャネル契約マトリクス作成                     |
| Preload/セキュリティ       | 必須     | safeInvoke/safeInvokeUnwrap 使用状況の対応付け |
| ローカルストレージ         | 非該当   | —                                              |

## 実行手順

1. SubAgent-A: skillHandlers.ts と skill-api.ts を読み取り、契約マトリクスと Preload 対応表を作成する
2. SubAgent-B: Renderer 全利用箇所を grep で特定し、期待形一覧と AS-IS 差分表を作成する
3. SubAgent-C: SubAgent-A/B の成果物を統合し、要件書を作成する
4. 全成果物の完了条件を検証する

## 成果物

| 成果物                 | パス                                       | 内容                             |
| ---------------------- | ------------------------------------------ | -------------------------------- |
| 契約パターンマトリクス | `outputs/phase-1/contract-matrix.md`       | 全14チャネルの戻り値パターン一覧 |
| Preload対応表          | `outputs/phase-1/preload-mapping.md`       | safeInvoke/safeInvokeUnwrap対応  |
| Renderer期待形一覧     | `outputs/phase-1/renderer-expectations.md` | 利用側の戻り値解釈               |
| AS-IS差分表            | `outputs/phase-1/as-is-gap-analysis.md`    | 正本vs現状の差分                 |
| 要件書                 | `outputs/phase-1/requirements.md`          | 機能・非機能要件                 |

## 完了条件

- [ ] 全14チャネルの契約パターンが表形式で一覧化されている
- [ ] Preload API の safeInvoke/safeInvokeUnwrap 使用状況が対応付けされている
- [ ] Renderer 利用側の期待形が全て抽出されている
- [ ] AR-1〜AR-7 との差分が AS-IS差分表にまとまっている
- [ ] 要件書が作成され、Phase 2 への入力が明確である

---

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認（skillHandlers.ts / skill-api.ts / Renderer利用箇所 / 正本仕様）
2. 実行タスク実施（Task 1-1〜1-5 を SubAgent 分担に従い実行）
3. 成果物作成（5つの成果物ファイルを outputs/phase-1/ に出力）
4. 完了条件検証（全5条件のチェック）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1-1〜1-5）を100%実行完了
- [ ] 各タスクの成果物（5ファイル）が `outputs/phase-1/` に生成されている
- [ ] artifacts.json の Phase 1 ステータスが更新されている
- [ ] Phase末端で完了状態を明記している

## Phase実行記録

| 項目     | 値  |
| -------- | --- |
| 開始日時 | —   |
| 完了日時 | —   |
| 実行者   | —   |
| 判定     | —   |
| 備考     | —   |

## 次Phase

[Phase 2（設計 — 契約プロファイル設計）](./phase-2-design.md) へ進む。
