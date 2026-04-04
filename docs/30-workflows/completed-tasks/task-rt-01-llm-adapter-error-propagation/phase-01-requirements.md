# Phase 1: 要件定義 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目       | 値                                                          |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-RT-01                                                  |
| タスク種別 | UI task                                                     |
| Phase      | 1 - 要件定義                                                |
| 関連Issue  | #1879                                                       |
| 前提タスク | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001（完了済み）        |
| 関連タスク | TASK-RT-04（APIキー設定UI）、TASK-RT-02（アダプタ状態統合） |
| 作成日     | 2026-04-04                                                  |

## 目的

LLMAdapter 初期化失敗時のエラー伝播経路を整備し、Renderer 側に UI 通知できる最小限の契約を要件化する。
pull（invoke）+ push（on）の 2 経路を明確に定義し、Phase 2 の IPC 設計の前提を固める。

## 実行タスク

- **P0 既実装確認**: 着手前に既存コードの実装状態を確認し、重複作業を防止する
- **タスク分類固定**: Renderer コンポーネント変更を含む UI task として扱い、Phase 11 の screenshot 証跡を前提にする
- **受入条件定義**: UI 通知・IPC 公開・push 通知の受入条件を番号付きで列挙する
- **スコープ確定**: 本タスクの IN / OUT 境界を固定する
- **依存関係整理**: 他タスクとの協調インターフェースを明記する

## 参照資料

| 資料名                                      | パス                                                                          | 用途                         |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| task-specification-creator Phase 1 template | `.claude/skills/task-specification-creator/references/phase-template-core.md` | Phase 1 必須構造確認         |
| IPC 4層整合ガイド                           | `.claude/skills/task-specification-creator/references/phase-template-core.md` | IPC 設計の前提確認           |
| aiworkflow resource map                     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`              | 関連 system spec の選定      |
| Skill Creator IPC 正本                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`     | `skill-creator:*` 契約の正本 |
| Facade 実装                                 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`         | 既実装の確認対象             |
| shared 型定義                               | `packages/shared/src/types/skillCreator.ts`                                   | `LLMAdapterStatus` 型の確認  |
| channels.ts                                 | `apps/desktop/src/preload/channels.ts`                                        | 既存チャネル一覧の確認       |

## P0: 既実装確認（Phase 1 開始前必須）

以下のコマンドで着手時の実装状態を確認し、重複作業を防止すること。

```bash
# LLMAdapter 関連の実装済みコードを確認
grep -n "llmAdapterStatus\|LLMAdapterStatus\|setLLMAdapterFailed\|setLLMAdapter" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# IPC チャネルの実装済み状態を確認
grep -n "adapter.status\|ADAPTER_STATUS\|adapter-status" \
  apps/desktop/src/preload/channels.ts

# Renderer 側の LLMAdapterErrorBanner 存在確認
ls apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx 2>/dev/null || \
  echo "LLMAdapterErrorBanner: 未実装"
```

### 確認済み実装状態（2026-04-04 調査済み）

| 項目                                              | 実装状態    | ファイル・行                                    |
| ------------------------------------------------- | ----------- | ----------------------------------------------- |
| `_llmAdapterStatus` フィールド                    | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:146`              |
| `setLLMAdapterFailed(reason)`                     | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:226-229`          |
| `setLLMAdapter(adapter)`                          | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:216-220`          |
| `llmAdapterStatus` getter                         | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:198-200`          |
| `llmAdapterFailureReason` getter                  | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:203-205`          |
| 初期化失敗時 `setLLMAdapterFailed()` 呼び出し     | ✅ 実装済み | `main/ipc/index.ts:1060-1063`                   |
| `LLMAdapterStatus` 型                             | ✅ 実装済み | `shared/types/skillCreator.ts:338`              |
| `SkillCreatorErrorCode` 型                        | ✅ 実装済み | `shared/types/skillCreator.ts:341-344`          |
| `AdapterStatusBadge` コンポーネント               | ✅ 実装済み | `renderer/components/atoms/AdapterStatusBadge/` |
| `skill-creator:get-adapter-status` チャネル       | ❌ 未実装   | `preload/channels.ts`（追加必要）               |
| `skill-creator:adapter-status-changed` チャネル   | ❌ 未実装   | `preload/channels.ts`（追加必要）               |
| `onAdapterStatusChanged` コールバック             | ❌ 未実装   | `RuntimeSkillCreatorFacade.ts`（追加必要）      |
| IPC ハンドラ                                      | ❌ 未実装   | `creatorHandlers.ts`（追加必要）                |
| `getAdapterStatus()` / `onAdapterStatusChanged()` | ❌ 未実装   | `preload/skill-creator-api.ts`（追加必要）      |
| `LLMAdapterErrorBanner.tsx`                       | ❌ 未実装   | 新規作成必要                                    |
| `useLLMAdapterStatus.ts`                          | ❌ 未実装   | 新規作成必要                                    |
| `SkillLifecyclePanel` 統合                        | ❌ 未実装   | 追加必要                                        |

## 受入条件（Acceptance Criteria）

- **AC-1**: `ANTHROPIC_API_KEY` 未設定または無効値でアプリを起動したとき、`SkillLifecyclePanel` 上部にエラーバナーが表示される
- **AC-2**: エラーバナーには actionable なメッセージ（「APIキーを設定してください」等）が含まれる
- **AC-3**: `skill-creator:get-adapter-status` を invoke すると `{ status: LLMAdapterStatus, failureReason: string | null }` が返る
- **AC-4**: `setLLMAdapterFailed()` が呼ばれたタイミングで `skill-creator:adapter-status-changed` push イベントが Renderer に届く
- **AC-5**: UI は `"ready"` / `"initializing"` / `"failed"` の 3 状態を正しく表示・切り替えられる
- **AC-6**: 正常な API キー設定時（status が `"ready"`）にはエラーバナーが表示されない
- **AC-7**: 全 TypeScript 型チェックが通る（`pnpm --filter @repo/desktop typecheck`）
- **AC-8**: 新規追加テストが全て PASS する

## 現状差分分析

| 観点                | 現状                                                   | 本タスクで到達する状態                           |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| IPC チャネル        | `skill-creator:get-adapter-status` 未定義              | `channels.ts` に追加・ALLOWED リスト登録済み     |
| push 通知           | `setLLMAdapterFailed()` 呼び出し後の Renderer 通知なし | `adapter-status-changed` push が Renderer に届く |
| Facade コールバック | なし                                                   | `onAdapterStatusChanged` コールバックがある      |
| Preload API         | `getAdapterStatus()` メソッドなし                      | `skillCreatorAPI.getAdapterStatus()` が呼べる    |
| UI 表示             | エラーバナーなし                                       | `SkillLifecyclePanel` にエラーバナーが表示される |

## スコープ

### 含む

- `packages/shared/src/types/skillCreator.ts` に `LLMAdapterStatusPayload` 型追加
- `apps/desktop/src/preload/channels.ts` に 2 チャネル追加・ALLOWED リスト登録
- `RuntimeSkillCreatorFacade.ts` に `onAdapterStatusChanged` コールバック追加
- `apps/desktop/src/main/ipc/creatorHandlers.ts` に IPC ハンドラ + push ワイヤリング追加
- `apps/desktop/src/preload/skill-creator-api.ts` に 2 メソッド追加
- `LLMAdapterErrorBanner.tsx` 新規作成
- `useLLMAdapterStatus.ts` フック新規作成
- `SkillLifecyclePanel.tsx` への統合
- 単体テスト・統合テスト追加

### 含まない

- APIキー設定 UI の実装（`TASK-RT-04` の責務）
- `SkillCreateWizard` への統合（優先度を下げ初回スコープ外）
- `execute()` / `improve()` のアダプタガード（`task-ut-rt-01-execute-improve-adapter-guard-001.md`）
- LLMAdapterFactory の retry logic（`task-ut-rt-01-llm-adapter-retry-logic-001.md`）

## 統合テスト連携

Phase 4 でテストを先に作成し、Phase 5 の実装時にテストを通す TDD アプローチを取る。
統合テストは以下を対象とする：

1. `creatorHandlers.adapterStatus.test.ts` — IPC ハンドラ単体テスト
2. `LLMAdapterErrorBanner.test.tsx` — コンポーネント統合テスト
3. `useLLMAdapterStatus.test.ts` — フックテスト

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断 | 確認事項                                                                            |
| ------------ | -------- | ----------------------------------------------------------------------------------- |
| セキュリティ | 適用     | `validateIpcSender` が新規ハンドラに適用されているか確認                            |
| IPC 4層整合  | 適用     | channels.ts / ALLOWED リスト / ipcMain.handle / preload API の 4 層が揃っているか   |
| 状態所有権   | 適用     | LLMAdapter 状態は Main が持ち、Renderer は IPC 経由でのみ参照する設計になっているか |
| メモリリーク | 適用     | push 購読のクリーンアップ（useEffect のアンマウント処理）が正しく実装されるか       |

## サブタスク管理

| ID     | 内容                      | Phase   |
| ------ | ------------------------- | ------- |
| ST-1-1 | P0 既実装確認コマンド実行 | Phase 1 |
| ST-1-2 | 受入条件レビュー          | Phase 1 |
| ST-1-3 | スコープ境界の最終確認    | Phase 1 |

## 成果物

| 成果物           | パス                                         |
| ---------------- | -------------------------------------------- |
| 要件定義サマリー | `outputs/phase-1/requirements-summary.md`    |
| 現状棚卸し       | `outputs/phase-1/current-state-inventory.md` |
| 受入条件一覧     | `outputs/phase-1/acceptance-criteria.md`     |

## 完了条件

- [ ] P0 既実装確認コマンドを実行し、実装状態テーブルを更新した
- [ ] 受入条件 AC-1〜AC-8 が明確に定義されている
- [ ] スコープ IN/OUT が確定している
- [ ] Phase 2 の設計に必要な前提情報がすべてこの文書に記載されている

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-1/` に配置した
- [ ] `artifacts.json` の Phase 1 を `completed` に更新した

## 次Phase

Phase 1 完了後 → [Phase 2: 設計](phase-02-design.md) へ進む

**Phase 1-3 完了前に Phase 4 へ進まないこと。**
