# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 1                                                 |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |

## 目的

スキル関連IPC層に存在する2件の Critical 不整合（SKILL_UPDATE デッドチャンネル、SKILL_GET_DETAIL Preload API 未公開）の要件を明文化し、実装・テストの基準となる受入基準を確定する。

## 実行タスク

- 現状調査: 既存コードの実装状態を確認し、不整合の範囲とスコープを確定する
- 要件抽出: 修正に必要な機能要件・非機能要件を抽出する
- 受入基準作成: 各要件に対して検証可能な受入基準を定義する
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定する

## 参照資料

### 一般

| 資料名                | パス                                                                          | 説明                      |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| タスクindex           | `./index.md`                                                                  | タスク概要・受入基準      |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC修正時の品質ゲート     |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P42/P44/P45/P32/P5 の詳細 |

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                                                          | 説明                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| current canonical set 索引 | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                              | 今回の実装で読む順序と正本セット         |
| クイックリファレンス       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                           | 関連チャンネル早見表                     |
| スキルIPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`                                | object payload / P42 / P44 / P45         |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                             | sender検証 / unwrap / whitelist          |
| スキルインターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-core.md`                        | SkillAPI正式メソッド一覧                 |
| スキル詳細契約             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`                     | `skill:get-detail` / `skill:update` 契約 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                             | IPCハンドラ登録一覧                      |
| 完了記録 / 同期手順        | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md` | current canonical set と同期手順         |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                         | エラーカテゴリとコード範囲               |

## 実行手順

### ステップ0: P50チェック — 既実装状態の調査（必須）

Phase 1 開始前に、対象ファイルの現在の実装状態を確認する。

```bash
# skillHandlers.ts で SKILL_UPDATE の ipcMain.handle 登録を確認
grep -n "SKILL_UPDATE\|skill:update" apps/desktop/src/main/ipc/skillHandlers.ts

# skill-api.ts で getDetail / update メソッドを確認
grep -n "getDetail\|update\|SKILL_GET_DETAIL\|SKILL_UPDATE" apps/desktop/src/preload/skill-api.ts

# チャンネル定数の定義を確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" apps/desktop/src/preload/channels.ts
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" packages/shared/src/ipc/channels.ts

# ALLOWED_INVOKE_CHANNELS のホワイトリスト確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL\|ALLOWED_INVOKE" apps/desktop/src/preload/index.ts
```

| 判定         | 条件                             | 対応                                  |
| ------------ | -------------------------------- | ------------------------------------- |
| 未実装       | ハンドラ/Preload APIが存在しない | Phase 1-13 通常フローを実行           |
| 部分実装     | 一方のみ実装済み                 | 未実装部分のみをスコープとする        |
| 実装済みPASS | 両方実装済みでテストがPASS       | Phase 4-5を「検証・補完」モードに切替 |

### ステップ1: 機能要件（FR）の定義

以下の機能要件を確定する。

#### FR-1: SKILL_UPDATE IPCハンドラ登録

- **FR-1-1**: `skillHandlers.ts` に `ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, ...)` を追加する
- **FR-1-2**: ハンドラは `{ skillName, updates }` object payload を受け取り、内部で `skillName`（string）と `updates`（オブジェクト）を展開する
- **FR-1-3**: `unregisterSkillHandlers()` 内に `ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE)` を追加する
- **FR-1-4**: P42準拠の3段バリデーションを `skillName` に適用する

#### FR-2: SKILL_GET_DETAIL Preload API 公開

- **FR-2-1**: `skill-api.ts` に `getDetail(skillId: string)` メソッドを追加する
- **FR-2-2**: メソッド内で `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` を呼び出す
- **FR-2-3**: 引数 `skillId` に P42準拠の3段バリデーションを適用する
- **FR-2-4**: スキル未存在時は business error として reject / throw される

#### FR-3: SKILL_UPDATE Preload API 公開

- **FR-3-1**: `skill-api.ts` に `update(skillName: string, updates: object)` メソッドを追加する
- **FR-3-2**: メソッド内で `safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates })` を呼び出す
- **FR-3-3**: 引数 `skillName` に P42準拠の3段バリデーションを適用する

#### FR-4: チャンネル定数の整合確認

- **FR-4-1**: `apps/desktop/src/preload/channels.ts` と `packages/shared/src/ipc/channels.ts` の定数が整合していることを確認する
- **FR-4-2**: 不整合がある場合は同期修正を行う

### ステップ2: 非機能要件（NFR）の定義

| ID    | 非機能要件                                           | 優先度 | 検証方法                   |
| ----- | ---------------------------------------------------- | ------ | -------------------------- |
| NFR-1 | 既存の全スキル関連テストが引き続き PASS すること     | 必須   | `pnpm test` 実行           |
| NFR-2 | TypeScript strict モードで型エラーが発生しないこと   | 必須   | `pnpm typecheck` 実行      |
| NFR-3 | P5準拠: ipcMain.handle の二重登録を防止すること      | 必須   | コードレビュー             |
| NFR-4 | IPC引数命名がセマンティクスと一致すること（P45準拠） | 必須   | コードレビュー             |
| NFR-5 | 型定義の二箇所同時更新（P32準拠）                    | 必須   | typecheck + コードレビュー |

### ステップ3: 受入基準の確定

以下の受入基準を確定する（index.md の AC-1〜AC-8 を具体化）。

| AC   | 基準                                                                                                      | 検証コマンド/方法                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `skillHandlers.ts` に `ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, ...)` が存在する                         | `grep -n "SKILL_UPDATE" apps/desktop/src/main/ipc/skillHandlers.ts`                                                 |
| AC-2 | `unregisterSkillHandlers()` に `SKILL_UPDATE` の `removeHandler` が含まれる                               | `grep -n "removeHandler.*SKILL_UPDATE" apps/desktop/src/main/ipc/skillHandlers.ts`                                  |
| AC-3 | `skill-api.ts` に `getDetail()` メソッドが追加され `SKILL_GET_DETAIL` を `{ skillId }` で invoke する     | `grep -n "getDetail\|SKILL_GET_DETAIL" apps/desktop/src/preload/skill-api.ts`                                       |
| AC-4 | `skill-api.ts` に `update()` メソッドが追加され `SKILL_UPDATE` を `{ skillName, updates }` で invoke する | `grep -n "update\|SKILL_UPDATE" apps/desktop/src/preload/skill-api.ts`                                              |
| AC-5 | 全文字列引数に `.trim() === ""` チェックが実装されている（P42準拠3段バリデーション）                      | `grep -n "trim" apps/desktop/src/main/ipc/skillHandlers.ts`                                                         |
| AC-6 | IPC契約チェックリスト Phase 1-6 の全項目を実施し記録する                                                  | Phase 2/3 設計書への記録                                                                                            |
| AC-7 | 既存テストが全て PASS する                                                                                | `pnpm --filter @repo/desktop test`                                                                                  |
| AC-8 | `packages/shared` と `apps/desktop` のチャンネル定数の値が一致する                                        | `grep -n "skill:update\|skill:get-detail" packages/shared/src/ipc/channels.ts apps/desktop/src/preload/channels.ts` |

### ステップ4: スコープ境界の明確化

**スコープ内（本タスクで対応）**:

- `skillHandlers.ts` への SKILL_UPDATE ハンドラ登録
- `skillHandlers.ts` への unregister 追加
- `skill-api.ts` への `getDetail()` / `update()` メソッド追加
- チャンネル定数の整合確認・必要な場合の同期修正

**スコープ外（本タスクで対応しない）**:

- `agentSlice.ts` の Store アクション追加（Renderer側の状態管理は別タスク）
- SKILL_UPDATE の具体的なビジネスロジック実装（スキルの何をどう更新するかは別設計）
- E2E テストの新規作成
- UI コンポーネントの変更

## 統合テスト連携

| 確認項目                           | 確認方法                           | 期待結果   |
| ---------------------------------- | ---------------------------------- | ---------- |
| 既存スキルハンドラテストの継続成功 | `pnpm --filter @repo/desktop test` | 全件 PASS  |
| チャンネル定数の整合性             | grep による手動確認                | 値が一致   |
| TypeScript 型チェック              | `pnpm typecheck`                   | エラー 0件 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                  | 仕様参照先                                                                                             |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| セキュリティ       | IPC引数バリデーションあり | `aiworkflow-requirements: security-electron-ipc-core.md`                                               |
| API設計            | IPC API変更あり           | `aiworkflow-requirements: interfaces-agent-sdk-skill-core.md`, `interfaces-agent-sdk-skill-details.md` |
| エラーハンドリング | IPC例外処理あり           | `aiworkflow-requirements: error-handling.md`                                                           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断            | 仕様参照先                                                                                     |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| バックエンド（Main） | IPCハンドラ登録あり | `aiworkflow-requirements: architecture-overview-core.md`                                       |
| IPC通信              | チャンネル追加あり  | `aiworkflow-requirements: interfaces-agent-sdk-skill-details.md`, `security-skill-ipc-core.md` |
| Preload/セキュリティ | Preload API公開あり | `aiworkflow-requirements: security-api-electron.md`                                            |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（ipc-contract-checklist.md、known-pitfalls.md）
2. P50チェック: 既実装状態の調査（grep による確認）
3. 機能要件（FR）の定義・確定
4. 非機能要件（NFR）の定義・確定
5. 受入基準（AC）の確定
6. スコープ境界の明確化
7. 成果物の作成
8. 完了条件の検証

## 成果物

| 成果物       | パス                                      | 説明                         |
| ------------ | ----------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements.md`         | FR/NFR/受入基準の確定版      |
| 現状調査結果 | `outputs/phase-1/current-state-survey.md` | 既存コードの実装状態調査結果 |

## 完了条件

- [ ] 既存コードの実装状態（SKILL_UPDATE/SKILL_GET_DETAIL）を調査済み
- [ ] FR-1〜FR-4 の機能要件を定義済み
- [ ] NFR-1〜NFR-5 の非機能要件を定義済み
- [ ] AC-1〜AC-8 の受入基準を確定済み
- [ ] スコープ内/スコープ外の境界が明確化済み
- [ ] `outputs/phase-1/requirements.md` が作成済み
- [ ] `outputs/phase-1/current-state-survey.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 1
```

## 次Phase

Phase 2: 設計（[phase-2-design.md](./phase-2-design.md)）

> **Gate**: Phase 1 完了前に Phase 2 へ進まないこと。受入基準 AC-1〜AC-8 がすべて定義されていることを確認する。
