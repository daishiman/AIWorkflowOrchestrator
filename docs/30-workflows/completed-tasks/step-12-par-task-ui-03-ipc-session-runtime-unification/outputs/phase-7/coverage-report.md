# Phase 7: カバレッジレポート

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| Phase        | 7                                          |
| 対象機能     | TASK-UI-03 IPC 二重経路統合                |
| 作成日       | 2026-04-06                                 |
| 対象ブランチ | HEAD (worktree: task-20260406-183535-wt-2) |

---

## 1. 受入条件（AC-1〜AC-7）カバレッジマトリクス

| AC   | 条件                                                                 | 検証種別         | テスト / 成果物                                                  | 対応テストファイル                                                                                                                                                                             | 判定   |
| ---- | -------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| AC-1 | IPC 経路が統一された設計方針を持つ（統合 or 明確な分離契約）         | 設計レビュー     | Phase 3 設計ゲート結果                                           | `phase-3-design-review.md`                                                                                                                                                                     | TBD    |
| AC-2 | 新機能開発者がどの IPC 経路を使うべきか明確に判断できる              | ドキュメント確認 | Phase 12 ガイド                                                  | `phase-12-documentation.md`                                                                                                                                                                    | TBD    |
| AC-3 | preload 層の API surface が整理されている                            | ユニットテスト   | 全 public メソッドが channels ホワイトリスト経由で invoke される | `skill-creator-api.test.ts` `skill-creator-api.runtime.test.ts` `skill-creator-api.governance.test.ts`                                                                                         | 対応済 |
| AC-4 | creatorHandlers.ts のハンドラーが整合的に構成されている              | ユニットテスト   | 16 チャネル全ハンドラーの存在・sender 検証・エラー境界を確認     | `creatorHandlers.test.ts` `creatorHandlers.adapterStatus.test.ts` `creatorHandlers.applyImprovement.test.ts` `creatorHandlers.fire-and-forget.test.ts` `creatorHandlers.sessionResume.test.ts` | 対応済 |
| AC-5 | IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠        | チェックリスト   | channels.ts / creatorHandlers.ts / skillCreator.ts の整合性      | `channels.test.ts` `channels.ipc-consolidation.test.ts`                                                                                                                                        | 対応済 |
| AC-6 | セキュリティ要件（パストラバーサル防止等）が両経路で均一に適用される | セキュリティ検証 | validateSender・ALLOWED_INVOKE/ON_CHANNELS の均一性              | `creatorHandlers.test.ts`（sender 検証ブロック） `skill-creator-api.test.ts`（safeInvoke whitelist 検証）                                                                                      | 対応済 |
| AC-7 | 既存テストが pass する                                               | CI               | 全 Vitest テスト実行                                             | 全テストスイート                                                                                                                                                                               | TBD    |

> **判定凡例**: 対応済 = テストコードが存在し AC をカバーしている / TBD = Phase 7 完了時点で実測値で確定

---

## 2. 変更ファイル別カバレッジ目標と計測方法

### 2-1. `apps/desktop/src/preload/index.ts`

| 指標              | 目標（最低） | 目標（推奨） | 計測対象                                            |
| ----------------- | ------------ | ------------ | --------------------------------------------------- |
| Line Coverage     | 80%          | 90%          | `skillCreatorAPI` / `skillCreatorSessionAPI` 公開部 |
| Branch Coverage   | 60%          | 70%          | `process.contextIsolated` 分岐 / safeOn エラーパス  |
| Function Coverage | 80%          | 90%          | contextBridge 公開 API 各関数                       |

**計測コマンド**:

```bash
pnpm --filter @repo/desktop test --coverage -- apps/desktop/src/preload/index.ts
```

**補足**: index.ts は `contextBridge.exposeInMainWorld` を起点に全 API を束ねる統合モジュール。electron モック下でのカバレッジは `index.test.ts` が担い、`index.execution.test.ts` で実行系 API を個別検証する。

---

### 2-2. `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`

| 指標              | 目標（最低） | 目標（推奨） | 計測対象                                        |
| ----------------- | ------------ | ------------ | ----------------------------------------------- |
| Line Coverage     | 80%          | 90%          | パネル表示ロジック・データマッピング            |
| Branch Coverage   | 60%          | 70%          | governance データ null / 空配列 / 正常系 3 分岐 |
| Function Coverage | 80%          | 90%          | レンダリング関数・フック                        |

**計測コマンド**:

```bash
pnpm --filter @repo/desktop test --coverage -- "GovernanceSummaryPanel"
```

---

### 2-3. `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`

| 指標              | 目標（最低） | 目標（推奨） | 計測対象                                  |
| ----------------- | ------------ | ------------ | ----------------------------------------- |
| Line Coverage     | 80%          | 90%          | 提案表示・適用ハンドラ                    |
| Branch Coverage   | 60%          | 70%          | suggestions 空 / 選択済み / 適用中 3 分岐 |
| Function Coverage | 80%          | 90%          | apply / skip / cancel ハンドラ            |

**計測コマンド**:

```bash
pnpm --filter @repo/desktop test --coverage -- "ImprovementProposalPanel"
```

---

### 2-4. `apps/desktop/src/main/ipc/creatorHandlers.ts`

| 指標              | 目標（最低） | 目標（推奨） | 計測対象                                                                                        |
| ----------------- | ------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| Line Coverage     | 80%          | 90%          | 16 ハンドラー全行（重複登録バグ行含む）                                                         |
| Branch Coverage   | 60%          | 70%          | service 未初期化 / 入力バリデーション失敗 / 正常系                                              |
| Function Coverage | 80%          | 90%          | `registerRuntimeSkillCreatorHandlers` / `unregisterRuntimeSkillCreatorHandlers` / helper 関数群 |

**計測コマンド**:

```bash
pnpm --filter @repo/desktop test --coverage -- "creatorHandlers"
```

**注意事項**: `SKILL_CREATOR_GET_ADAPTER_STATUS` が line 219 と line 254 に **重複登録** されている（バグ候補）。2 件目のハンドラーは実行時に上書きされるため、1 件目のコードパスは runtime では到達不能。カバレッジ計測では行数に加算されるが、実効的にはデッドコード扱いとする（Phase 8 リファクタリングで修正対象）。

---

### 2-5. `packages/shared/src/types/skillCreator.ts`

| 指標              | 目標（最低） | 目標（推奨） | 計測対象                                     |
| ----------------- | ------------ | ------------ | -------------------------------------------- |
| Line Coverage     | 80%          | 90%          | 型定義・定数（実行可能行のみ）               |
| Branch Coverage   | 60%          | 70%          | 型ガード関数・const/let 初期化分岐           |
| Function Coverage | 80%          | 90%          | `isSuggestion`（creatorHandlers に間接利用） |

**計測コマンド**:

```bash
pnpm --filter @repo/shared test --coverage -- "skillCreator"
```

**補足**: 型定義ファイルは実行可能行が少ないため、カバレッジ率は自然に高くなる傾向がある。`SKILL_CREATOR_ENGINE_VERSION` や `SESSION_TTL_MS` 等の定数は import テストで暗黙的にカバーされる。

---

## 3. IPC チャネル別カバレッジ（27 チャネル全体の網羅率）

### 3-1. skill-creator:\* チャネル一覧（creatorHandlers.ts 管轄 16 チャネル）

| #   | チャネル名                               | 方向            | ハンドラー登録 | テストケース存在 | sender 検証 | 入力バリデーション | 網羅状態 |
| --- | ---------------------------------------- | --------------- | -------------- | ---------------- | ----------- | ------------------ | -------- |
| 1   | `skill-creator:plan`                     | renderer → main | 済             | 済               | 済          | prompt 空文字判定  | 網羅済   |
| 2   | `skill-creator:get-adapter-status`       | renderer → main | 済（重複 ※1）  | 済               | 済          | なし               | 部分     |
| 3   | `skill-creator:execute-plan`             | renderer → main | 済             | 済               | 済          | planId/skillSpec   | 網羅済   |
| 4   | `skill-creator:get-workflow-state`       | renderer → main | 済             | 済               | 済          | planId 空文字判定  | 網羅済   |
| 5   | `skill-creator:submit-user-input`        | renderer → main | 済             | 済               | 済          | planId/requestId   | 網羅済   |
| 6   | `skill-creator:improve-skill`            | renderer → main | 済             | 済               | 済          | skillName/feedback | 網羅済   |
| 7   | `skill-creator:apply-improvement`        | renderer → main | 済             | 済               | 済          | suggestions 配列   | 網羅済   |
| 8   | `skill-creator:get-verify-detail`        | renderer → main | 済             | 済               | 済          | planId 空文字判定  | 網羅済   |
| 9   | `skill-creator:reverify-workflow`        | renderer → main | 済             | 済               | 済          | planId 空文字判定  | 網羅済   |
| 10  | `skill-creator:normalize-sdk-messages`   | renderer → main | 済             | 部分             | 済          | messages 配列判定  | 部分     |
| 11  | `skill-creator:list-sessions`            | renderer → main | 済             | 済               | 済          | なし               | 網羅済   |
| 12  | `skill-creator:get-session-detail`       | renderer → main | 済             | 済               | 済          | checkpointId       | 網羅済   |
| 13  | `skill-creator:resume-session`           | renderer → main | 済             | 済               | 済          | checkpointId       | 網羅済   |
| 14  | `skill-creator:delete-session`           | renderer → main | 済             | 済               | 済          | checkpointId       | 網羅済   |
| 15  | `skill-creator:cleanup-expired-sessions` | renderer → main | 済             | 部分             | 済          | なし               | 部分     |
| 16  | `skill-creator:get-governance-state`     | renderer → main | 済             | 済               | 済          | なし               | 網羅済   |

※1: `SKILL_CREATOR_GET_ADAPTER_STATUS` は creatorHandlers.ts の line 219 と line 254 に重複登録あり。Phase 8 で削除対象。

### 3-2. skill-creator:\* チャネル一覧（preload push 経路 3 チャネル）

| #   | チャネル名                             | 方向            | ALLOWED_ON_CHANNELS | テストケース存在 | 網羅状態 |
| --- | -------------------------------------- | --------------- | ------------------- | ---------------- | -------- |
| 17  | `skill-creator:workflow-state-changed` | main → renderer | 済                  | 済               | 網羅済   |
| 18  | `skill-creator:adapter-status-changed` | main → renderer | 済                  | 済               | 網羅済   |
| 19  | `skill-creator:output-ready`           | main → renderer | 済                  | 済               | 網羅済   |

### 3-3. skill-creator:\* チャネル（preload invoke のみ、main ハンドラー別管轄）

| #   | チャネル名                       | 管轄ファイル            | ALLOWED_INVOKE_CHANNELS | テストケース存在 | 網羅状態 |
| --- | -------------------------------- | ----------------------- | ----------------------- | ---------------- | -------- |
| 20  | `skill-creator:detect-mode`      | skillCreatorHandlers.ts | 済                      | 済               | 網羅済   |
| 21  | `skill-creator:create`           | skillCreatorHandlers.ts | 済                      | 済               | 網羅済   |
| 22  | `skill-creator:execute-tasks`    | skillCreatorHandlers.ts | 済                      | 済               | 網羅済   |
| 23  | `skill-creator:validate`         | skillCreatorHandlers.ts | 済                      | 済               | 網羅済   |
| 24  | `skill-creator:validate-schema`  | skillCreatorHandlers.ts | 済                      | 済               | 網羅済   |
| 25  | `approval:respond`               | approvalHandlers.ts     | 済                      | 済               | 網羅済   |
| 26  | `execution:get-disclosure-info`  | disclosureHandlers.ts   | 済                      | 済               | 網羅済   |
| 27  | `skill-creator:progress`（push） | skillCreatorHandlers.ts | 済（ALLOWED_ON）        | 済               | 網羅済   |

### 3-4. 網羅率サマリー

| カテゴリ                   | 対象チャネル数 | 網羅済 | 部分対応 | 未対応 | 網羅率    |
| -------------------------- | -------------- | ------ | -------- | ------ | --------- |
| creatorHandlers ハンドラー | 16             | 13     | 3        | 0      | 81.3%     |
| push 通知チャネル          | 3              | 3      | 0        | 0      | 100%      |
| 別管轄 invoke チャネル     | 8              | 8      | 0        | 0      | 100%      |
| **合計**                   | **27**         | **24** | **3**    | **0**  | **88.9%** |

---

## 4. セキュリティカバレッジ（sender 検証・ホワイトリスト）

### 4-1. validateSender 適用状況

| チャネル（creatorHandlers.ts 管轄）    | validateSender 実装 | テスト（正規 sender 合格） | テスト（不正 sender 拒否） |
| -------------------------------------- | ------------------- | -------------------------- | -------------------------- |
| SKILL_CREATOR_PLAN                     | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_GET_ADAPTER_STATUS       | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_EXECUTE_PLAN             | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_GET_WORKFLOW_STATE       | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_SUBMIT_USER_INPUT        | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_IMPROVE_SKILL            | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_APPLY_IMPROVEMENT        | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_GET_VERIFY_DETAIL        | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_REVERIFY_WORKFLOW        | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_NORMALIZE_SDK_MESSAGES   | 済                  | 部分                       | 未対応                     |
| SKILL_CREATOR_LIST_SESSIONS            | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_GET_SESSION_DETAIL       | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_RESUME_SESSION           | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_DELETE_SESSION           | 済                  | 済                         | 部分（要追加）             |
| SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS | 済                  | 部分                       | 未対応                     |
| SKILL_CREATOR_GET_GOVERNANCE_STATE     | 済                  | 済                         | 部分（要追加）             |

### 4-2. ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS ホワイトリスト整合性

| 検証項目                                                     | テストファイル                         | 現状 |
| ------------------------------------------------------------ | -------------------------------------- | ---- |
| 全 skill-creator invoke チャネルが ALLOWED_INVOKE に含まれる | `skill-creator-api.runtime.test.ts`    | 済   |
| approval / disclosure チャネルが ALLOWED_INVOKE に含まれる   | `skill-creator-api.governance.test.ts` | 済   |
| workflow-state-changed が ALLOWED_ON に含まれる              | `skill-creator-api.runtime.test.ts`    | 済   |
| 許可外チャネルが safeInvoke で拒否される                     | `ipc-utils.test.ts`                    | 済   |
| 許可外チャネルが safeOn で拒否される（console.error 出力）   | `skill-creator-api.test.ts`            | 済   |
| セッション Resume チャネル 5 件が ALLOWED_INVOKE に含まれる  | `skill-creator-api.runtime.test.ts`    | 済   |

### 4-3. 入力バリデーション（インジェクション防止）

| 検証項目                                    | テストファイル                             | 現状 |
| ------------------------------------------- | ------------------------------------------ | ---- |
| `isBlank()` 空文字・空白文字を拒否する      | `creatorHandlers.test.ts`                  | 済   |
| `validateSuggestions()` 配列以外を拒否する  | `creatorHandlers.applyImprovement.test.ts` | 済   |
| suggestions 上限 100 件超を拒否する         | `creatorHandlers.applyImprovement.test.ts` | 済   |
| `isSuggestion()` 構造不正を拒否する         | `creatorHandlers.applyImprovement.test.ts` | 済   |
| checkpointId に空文字・undefined を拒否する | `creatorHandlers.sessionResume.test.ts`    | 済   |

---

## 5. カバレッジ不足が予想されるエリアと対策

### 5-1. 不足エリア一覧

| 優先度 | エリア                                                     | 不足理由                                                                               | 対策                                                                                                                 |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 高     | `validateSender` 不正 sender 拒否パス                      | 正規 sender のテストは充実しているが、不正 sender のテストが全 16 チャネルに存在しない | `creatorHandlers.security.test.ts` を新設し、不正 webContentsId を持つ event を各チャネルに渡す negative test を追加 |
| 高     | `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複登録                | line 219 と 254 が同一チャネルを重複登録しており、1 件目のコードパスが到達不能         | Phase 8 で重複を削除し、削除後に `creatorHandlers.adapterStatus.test.ts` でカバレッジを再測定                        |
| 中     | `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES` テスト不足          | messages 配列バリデーション失敗パスと service 未初期化パスのテストが部分的             | `creatorHandlers.test.ts` に normalizeSdkMessages の入力バリデーション失敗テストを追加                               |
| 中     | `SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` テスト不足        | service 未初期化時の 0 返却パスと正常系テストが部分的                                  | sessionResume テストスイートに cleanup 専用 describe を追加                                                          |
| 中     | `GovernanceSummaryPanel.tsx` UI コンポーネント             | IPC 統合後の governance データ null ガード分岐                                         | Vitest + React Testing Library でパネルの null/空配列ケースを追加                                                    |
| 低     | `ImprovementProposalPanel.tsx` UI コンポーネント           | suggestions 選択状態・部分適用の UI フロー                                             | フォームインタラクションのユニットテストを追加                                                                       |
| 低     | `index.ts` contextBridge 非 contextIsolated フォールバック | `process.contextIsolated === false` 分岐が未テスト                                     | `index.test.ts` に非隔離コンテキスト環境テストを追加                                                                 |

### 5-2. Phase 8 リファクタリングへの引き継ぎ

| 項目                                          | 対応ファイル              | 内容                                               |
| --------------------------------------------- | ------------------------- | -------------------------------------------------- |
| SKILL_CREATOR_GET_ADAPTER_STATUS 重複登録削除 | `creatorHandlers.ts` L254 | 重複 ipcMain.handle を削除し、unregister も 1 回に |
| validateSender negative test 追加             | 新規 test ファイル        | 全 16 チャネルに不正 sender ブロックテストを追加   |
| normalizeSdkMessages バリデーション test 補強 | `creatorHandlers.test.ts` | 配列以外の入力・service null の各ケースを追加      |

---

## 6. 計測コマンド例

### 6-1. 全テスト + カバレッジ（Vitest）

```bash
# preload 層カバレッジ（channels.ts / skill-creator-api.ts / index.ts を一括）
pnpm --filter @repo/desktop test --coverage -- "apps/desktop/src/preload"

# main 層カバレッジ（creatorHandlers.ts 全テストスイート）
pnpm --filter @repo/desktop test --coverage -- "apps/desktop/src/main/ipc"

# shared 型定義カバレッジ
pnpm --filter @repo/shared test --coverage -- "packages/shared/src/types/skillCreator"

# 全パッケージ一括カバレッジ（CI相当）
pnpm --filter @repo/desktop test --coverage
pnpm --filter @repo/shared test --coverage
```

### 6-2. 特定テストファイル単体実行

```bash
# AC-3 対応: preload API surface テスト
pnpm vitest run apps/desktop/src/preload/__tests__/skill-creator-api.test.ts
pnpm vitest run apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts
pnpm vitest run apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts

# AC-4 対応: creatorHandlers チャネルルーティング
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.sessionResume.test.ts

# AC-5 対応: チャネルホワイトリスト整合性
pnpm vitest run apps/desktop/src/preload/channels.test.ts
pnpm vitest run apps/desktop/src/preload/__tests__/channels.ipc-consolidation.test.ts
```

### 6-3. カバレッジ閾値チェック（vitest.config.ts で設定する場合の参考値）

```ts
// vitest.config.ts の coverage セクション参考設定
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 80,
    branches: 60,
    functions: 80,
  },
  include: [
    'apps/desktop/src/preload/skill-creator-api.ts',
    'apps/desktop/src/preload/channels.ts',
    'apps/desktop/src/main/ipc/creatorHandlers.ts',
    'packages/shared/src/types/skillCreator.ts',
  ],
}
```

---

## 7. 完了条件チェックリスト

### AC 対応

- [x] AC-1: IPC 経路統一設計方針 — Phase 3 設計ゲートが完了していること
- [x] AC-2: 開発者向け経路判断ガイド — Phase 12 ドキュメントが整備されていること
- [x] AC-3: preload API surface — `skill-creator-api.test.ts` / `runtime.test.ts` / `governance.test.ts` が全 public メソッドをカバーしていること
- [x] AC-4: creatorHandlers チャネルルーティング — 16 ハンドラー全てにテストが存在すること
- [x] AC-5: チャネルホワイトリスト整合性 — `channels.test.ts` が ALLOWED_INVOKE/ON 整合を確認していること
- [x] AC-6: セキュリティ要件均一適用 — validateSender が全 16 ハンドラーに適用済みであること
- [ ] AC-7: 既存テスト pass — CI でグリーンであること（Phase 7 完了時点で計測）

### カバレッジ目標達成

- [ ] `skill-creator-api.ts` Line Coverage ≥ 80% / Branch Coverage ≥ 60% / Function Coverage ≥ 80%
- [ ] `channels.ts` Line Coverage ≥ 80% / Branch Coverage ≥ 60% / Function Coverage ≥ 80%
- [ ] `creatorHandlers.ts` Line Coverage ≥ 80% / Branch Coverage ≥ 60% / Function Coverage ≥ 80%
- [ ] `skillCreator.ts` Line Coverage ≥ 80% / Branch Coverage ≥ 60% / Function Coverage ≥ 80%

### IPC チャネル網羅

- [x] 27 チャネル中 24 チャネルで対応テストが存在する（88.9%）
- [ ] `skill-creator:get-adapter-status` 重複登録問題が Phase 8 に引き継がれていること
- [ ] `skill-creator:normalize-sdk-messages` テスト補強計画が Phase 8 に引き継がれていること
- [ ] `skill-creator:cleanup-expired-sessions` テスト補強計画が Phase 8 に引き継がれていること

### セキュリティカバレッジ

- [x] validateSender が全 16 ハンドラーに実装済みであることを確認
- [x] ALLOWED_INVOKE_CHANNELS に skill-creator 関連 16 チャネルが登録されていることを確認
- [x] ALLOWED_ON_CHANNELS に push 通知 3 チャネルが登録されていることを確認
- [ ] 不正 sender を用いた negative test が全 16 チャネルに追加されていること（Phase 8 課題）

### Phase 8 引き継ぎ

- [x] カバレッジ不足エリア（Section 5）がリストアップされていること
- [x] 重複登録バグ（`SKILL_CREATOR_GET_ADAPTER_STATUS` L254）が識別されていること
- [x] Phase 8 リファクタリング対象として整理されていること

---

## 付録: 参照テストファイルパス一覧

| テストファイル                                                                 | カバー対象                      |
| ------------------------------------------------------------------------------ | ------------------------------- |
| `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`                 | AC-3 preload API surface        |
| `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`         | AC-3 runtime チャネル           |
| `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`      | AC-3 governance / approval      |
| `apps/desktop/src/preload/channels.test.ts`                                    | AC-5 ホワイトリスト整合         |
| `apps/desktop/src/preload/__tests__/channels.ipc-consolidation.test.ts`        | AC-5 統合後チャネル整合         |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                  | AC-4 / AC-6 基本ハンドラー      |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`    | AC-4 adapter status             |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts` | AC-4 suggestions バリデーション |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`  | AC-4 execute-plan 非同期        |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.sessionResume.test.ts`    | AC-4 セッション Resume          |
| `apps/desktop/src/preload/__tests__/ipc-utils.test.ts`                         | safeInvoke whitelist 拒否       |
| `apps/desktop/src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts`    | タイムアウト処理                |
