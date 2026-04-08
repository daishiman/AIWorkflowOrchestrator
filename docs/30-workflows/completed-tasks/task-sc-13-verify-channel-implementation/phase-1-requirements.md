# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| 前提Phase  | -                                        |
| 後続Phase  | Phase 2                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

`skill-creator:verify` IPC チャネルの未実装状態を確認し、実装スコープ・受入基準・依存関係を確定する。
既存の `plan/execute/improve` パターンとの整合性を確保しながら、実装対象の4層（channels / Facade / handlers / preload）を明確にする。

## 背景

`artifacts.json` の `ipcChannels` に `skill-creator:verify` が定義されているが、以下4箇所が未実装：

1. `channels.ts`: `SKILL_CREATOR_VERIFY` 定数が未定義
2. `creatorHandlers.ts`: verify ハンドラが未登録
3. `skill-creator-api.ts`: Preload API に verify メソッドが未公開
4. `RuntimeSkillCreatorFacade.ts`: IPC 公開用 `verify()` メソッドが未定義

補足:

- `RuntimeSkillCreatorFacade` には内部用 `verifySkill(skillDir)` が既に存在する
- ただしこれはスキルディレクトリの絶対パスを受ける内部 API であり、公開 IPC surface ではない
- preload 側では `preload/channels.ts` の `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` への追加も必要になる

TASK-SC-08 E2E テスト実装時に発見。テストでは verify チャネルをスコープ外とし、本タスクに委譲した。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認する。

```bash
# 1. channels.ts の VERIFY 定数有無を確認
grep -n "SKILL_CREATOR_VERIFY\|skill-creator:verify" \
  packages/shared/src/ipc/channels.ts

# 2. creatorHandlers.ts の verify ハンドラ有無を確認
grep -n "verify\|SKILL_CREATOR_VERIFY" \
  apps/desktop/src/main/ipc/creatorHandlers.ts

# 3. RuntimeSkillCreatorFacade.ts の verify() 有無を確認
grep -n "verify\b" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 4. skill-creator-api.ts の verifySkill 有無を確認
grep -n "verify\b" \
  apps/desktop/src/preload/skill-creator-api.ts

# 5. 既存ハンドラパターンを確認（plan を参照例として）
grep -n "ipcMain.handle\|registerHandler\|safeInvoke\|validateSender\|sanitizeErrorMessage" \
  apps/desktop/src/main/ipc/creatorHandlers.ts | head -30

# 6. VerifyResult 型の有無を確認
grep -n "VerifyResult\|IpcResult" \
  packages/shared/src/types/skillCreator.ts

# 7. preload/channels.ts の公開定義・whitelist 有無を確認
grep -n "SKILL_CREATOR_VERIFY\|skill-creator:verify" \
  apps/desktop/src/preload/channels.ts
```

**確認事項**:

- [ ] `channels.ts` に `SKILL_CREATOR_VERIFY` が存在しないこと（未実装の証拠）
- [ ] `creatorHandlers.ts` に verify ハンドラが存在しないこと
- [ ] `RuntimeSkillCreatorFacade.ts` に IPC 用 `verify()` が存在しないこと（内部用 `verifySkill(skillDir)` は存在してもよい）
- [ ] `skill-creator-api.ts` に `verifySkill` が存在しないこと
- [ ] `preload/channels.ts` に `skill-creator:verify` の公開定義と invoke whitelist が存在しないこと
- [ ] 既存ハンドラ（plan/execute/improve）のパターンが `validateSender + isBlank + sanitizeErrorMessage` であることを確認

---

## 実行タスク

### タスク1: P50チェック

**目的**: 対象ファイルの現状実装状態を確認し、未実装を証明する

**実行手順**:

1. 上記 Step 0 のコマンドを全て実行する
2. 各ファイルの実装状態を `outputs/phase-1/p50-check-result.md` に記録する
3. 既存 plan/execute/improve ハンドラのパターンを文書化する（次フェーズの設計参照用）

**期待される成果物**:

- `outputs/phase-1/p50-check-result.md`

---

### タスク2: 実装スコープの確定

**目的**: 変更対象ファイルと変更種別を確定する

**実行手順**:

1. 変更ファイル（新規作成 / 修正）を一覧化する
2. 変更しないファイル（スコープ外）を明示する
3. スコープ定義書を作成する

**変更ファイル一覧（コード）**:

| ファイル                                                              | 変更種別 | 変更内容                                                                               |
| --------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | 修正     | `VerifyResult` 型を追加                                                                |
| `packages/shared/src/ipc/channels.ts`                                 | 修正     | `SKILL_CREATOR_VERIFY` 定数を追加                                                      |
| `apps/desktop/src/preload/channels.ts`                                | 修正     | `IPC_CHANNELS` と `ALLOWED_INVOKE_CHANNELS` に verify を追加                           |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | `verify(skillName, authMode, apiKey)` メソッドを追加                                   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 修正     | verify ハンドラを追加・`unregisterRuntimeSkillCreatorHandlers` に `removeHandler` 追加 |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | 修正     | `verifySkill` メソッドを追加                                                           |

**変更ファイル一覧（テスト）**:

| ファイル                                                             | 変更種別 | 変更内容                        |
| -------------------------------------------------------------------- | -------- | ------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | 新規作成 | verify ハンドラのユニットテスト |
| `apps/desktop/src/test/skill-creator-integration.test.ts`            | 修正     | verify テストケースを追加       |

**スコープ外（変更しない）**:

- `SkillCreatorVerificationEngine`（TASK-P0-01で実装済み）
- Renderer側コード（本タスクのスコープ外）
- 既存の plan/execute/improve/applyImprovement ハンドラ（破壊的変更禁止）

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

### タスク3: 受入基準の定義

**目的**: AC-1〜AC-11 の受入基準を定義・文書化する

**受入基準（AC-1〜AC-11）**:

| AC番号 | 基準                                                                                                                 | 検証方法              |
| ------ | -------------------------------------------------------------------------------------------------------------------- | --------------------- |
| AC-1   | `channels.ts` に `SKILL_CREATOR_VERIFY = "skill-creator:verify"` 定数が追加されている                                | コードレビュー / grep |
| AC-2   | `preload/channels.ts` に `IPC_CHANNELS.SKILL_CREATOR_VERIFY` と `ALLOWED_INVOKE_CHANNELS` の追加が反映されている     | コードレビュー / grep |
| AC-3   | `RuntimeSkillCreatorFacade` に `verify(skillName, authMode, apiKey)` メソッドが実装されている                        | コードレビュー        |
| AC-4   | `creatorHandlers.ts` に verify ハンドラが `validateSender + isBlank + sanitizeErrorMessage` パターンで登録されている | コードレビュー        |
| AC-5   | `skill-creator-api.ts` に `verifySkill` メソッドが公開されている                                                     | コードレビュー        |
| AC-6   | verify レスポンスが `IpcResult<VerifyResult>` 形式である                                                             | テスト PASS           |
| AC-7   | エラー時にサニタイズされたエラーメッセージ（string 型）が返る                                                        | テスト PASS           |
| AC-8   | `unregisterRuntimeSkillCreatorHandlers` に verify チャネルの `removeHandler` が追加されている                        | コードレビュー / grep |
| AC-9   | 既存の plan/execute/improve テストが全件 PASS のまま維持されている                                                   | `pnpm test` PASS      |
| AC-10  | `pnpm --filter @repo/desktop typecheck` が通る                                                                       | typecheck PASS        |
| AC-11  | verify ハンドラ UT と E2E テスト全件 PASS                                                                            | `pnpm test` PASS      |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク4: タスク分類の記録

**目的**: UI task / docs-only task の分類を明示する（Phase 11 方針決定のため）

**タスク分類**: **NON_VISUAL task**（IPC / Main プロセス実装。Renderer UI 変更なし）

- Phase 11 は NON_VISUAL として実行する
- `screenshot-plan.json` は生成しない
- 証跡は自動テスト結果（vitest）で代替する

**IPC命名規則確認**:

既存の命名パターン（`safeInvoke`、`safeOn` 等）を確認し、`skill-creator:verify` が既存規則と整合することを記録する。

---

## 参照資料

| 参照資料                     | パス                                                                            | 内容                             |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| channels.ts                  | `packages/shared/src/ipc/channels.ts`                                           | IPC チャネル定数定義             |
| creatorHandlers.ts           | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                  | 既存ハンドラパターン参照         |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`           | Facade 実装確認                  |
| skill-creator-api.ts         | `apps/desktop/src/preload/skill-creator-api.ts`                                 | Preload API 確認                 |
| artifacts.json（w5b）        | `docs/30-workflows/w5b-sc-e2e-terminal-handoff/artifacts.json`                  | `skill-creator:verify` 定義 L141 |
| TASK-SC-08 知見              | `docs/30-workflows/unassigned-task/TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION.md` | 苦戦箇所・解決策                 |

---

## 成果物

| 成果物          | パス                                     | 内容             |
| --------------- | ---------------------------------------- | ---------------- |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`    | 未実装確認証跡   |
| スコープ定義書  | `outputs/phase-1/scope-definition.md`    | 変更ファイル一覧 |
| 受入基準        | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-11      |

---

## 統合テスト連携

- Preload API 経由必須（直接 `ipcRenderer.on` は禁止パターン）
- 新規 IPC surface 定義: `skill-creator:verify`
- 接続要件: `verifySkill(skillName, authMode, apiKey)` → `IpcResult<VerifyResult>`
- Main 側では `skillName` を `skillDir` に解決してから `verificationEngine.verify(skillDir)` を呼ぶ

---

## 多角的チェック観点

### システム系

- **因果ループ**: `verify` チャネル未実装 → FR-4 機能デッドコード → スキル検証不可 → 品質担保ループ欠如（強化ループ：デッドコード固定化）
- **責務境界**: チャネル定数 (`channels.ts`) → ビジネスロジック (`Facade`) → IPC登録 (`handlers`) → Preload公開 (`api`) の4層が明確に分離
- **状態所有権**: verify の実行状態は `RuntimeSkillCreatorFacade`、IPC登録・解除は `creatorHandlers`

### 価値・コスト系

- **価値**: FR-4 スキル検証機能が実際に動作するようになる
- **コスト**: 変更ファイル数は少ない（5コード + 2テスト）。既存パターン適用のため設計コスト低
- **トレードオン**: verify の内部ロジック（VerificationEngine）は TASK-P0-01 で実装済み。本タスクは IPC 配線のみ

---

## サブタスク管理

| ID     | タスク名       | ステータス |
| ------ | -------------- | ---------- |
| T-01-1 | P50チェック    | 未実施     |
| T-01-2 | スコープ確定   | 未実施     |
| T-01-3 | 受入基準定義   | 未実施     |
| T-01-4 | タスク分類記録 | 未実施     |

---

## 完了条件

- [ ] P50チェックを実行し、4箇所全ての未実装が確認済みであること
- [ ] `preload/channels.ts` の未反映も確認済みであること
- [ ] 既存ハンドラパターン（validateSender + isBlank + sanitizeErrorMessage）が文書化されていること
- [ ] 変更対象ファイル一覧（コード6種 + テスト2種）が確定していること
- [ ] 受入基準 AC-1〜AC-11 が全て定義・文書化されていること
- [ ] タスク分類（NON_VISUAL）が記録されていること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み → `outputs/phase-1/p50-check-result.md` 作成済み
- [ ] T-01-2: スコープ確定済み → `outputs/phase-1/scope-definition.md` 作成済み
- [ ] T-01-3: 受入基準定義済み → `outputs/phase-1/acceptance-criteria.md` 作成済み
- [ ] T-01-4: タスク分類（NON_VISUAL）記録済み

---

## 次Phase

**Phase 2: 設計** — `VerifyResult` 型設計・`IpcResult<VerifyResult>` インターフェース・4層実装設計を行う。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
