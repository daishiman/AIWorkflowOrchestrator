# Phase 3: 設計レビュー - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 3 - 設計レビュー                            |
| 前提Phase | Phase 2（設計）                             |
| 関連Issue | #1434                                       |

## 目的

Phase 2 の unified public surface 設計が、既存 skill creator 契約を壊さずに runtime wiring を吸収できるかを判定する。

## 実行タスク

- AC ごとに設計要素を照合する
- public channel / shared 型 / DI / security の 4 軸で矛盾を洗う
- graceful degradation と既存 error shape の妥当性を判定する

## 参照資料

| 資料名                | パス                                                                          | 説明                   |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件          | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-01-requirements.md` | AC 基準                |
| Phase 2 設計          | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`       | 対象設計               |
| security-electron-ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | sender validation 基準 |
| api-ipc-system        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | public IPC 命名基準    |

## 1. レビュー観点

### 1.1 要件との整合性

| 受入条件                  | 設計でカバーされているか                                        | 判定 |
| ------------------------- | --------------------------------------------------------------- | ---- |
| AC-1: IPC チャンネル定義  | `channels.ts` に 3 定数追加 + allowlist 追加                    | PASS |
| AC-2: IPC ハンドラ登録    | `skillCreatorHandlers.ts` entrypoint + `ipc/index.ts` DI が明示 | PASS |
| AC-3: Preload API         | 3メソッド追加と shared contract 集約が明示                      | PASS |
| AC-4: Contract Drift 解消 | `creator:*` dead-end を増やさず public surface へ統合する方針   | PASS |
| AC-5: テスト              | runtime 専用 test file と既存回帰テストの配置が明示             | PASS |

### 1.2 アーキテクチャ整合性

| 観点                     | 判定 | 備考                                                      |
| ------------------------ | ---- | --------------------------------------------------------- |
| レイヤー依存方向         | PASS | shared → preload/main → renderer の境界を維持             |
| public surface 一元化    | PASS | `skillCreatorHandlers.ts` / `skill-creator-api.ts` に集約 |
| graceful degradation     | PASS | runtime service 不在でも handler 不在にしない             |
| P44 internal role 非公開 | PASS | channel 名に role 名を露出しない                          |
| P5 二重登録防止          | PASS | unregister を public channel 単位で対称に定義             |

### 1.3 DI設計の検証

| 観点                   | 判定 | 備考                                                                   |
| ---------------------- | ---- | ---------------------------------------------------------------------- |
| SkillExecutor 取得方法 | PASS | `getSkillExecutorInstance()` で取得し、未取得時は degrade              |
| authKeyService 共有    | PASS | 既存インスタンスを直接参照                                             |
| 登録順序保証           | PASS | `registerSkillHandlers()` 後に `registerSkillCreatorHandlers()` を呼ぶ |

### 1.4 セキュリティ検証

| 観点                     | 判定 | 備考                                                                |
| ------------------------ | ---- | ------------------------------------------------------------------- |
| 送信元ウィンドウ検証     | PASS | validateIpcSender を全 runtime handler に追加                       |
| エラーサニタイズ         | PASS | sanitizeErrorMessage を共通 util から参照                           |
| チャンネルホワイトリスト | PASS | ALLOWED_INVOKE_CHANNELS に3チャンネル追加                           |
| P42 3段バリデーション    | PASS | `prompt` / `planId` / `skillSpec` / `skillName` / `feedback` に適用 |

## 2. 指摘事項

指摘なし。Phase 2 の設計は、public surface 一本化・shared 型集約・graceful degradation の 3 点で整合している。

## 3. 判定

### 結果: **PASS**

致命的な問題はなく、Phase 4 に進行可能。

## 実行手順

1. Phase 1 の受入条件と Phase 2 の設計方針を突合する
2. public channel / shared 型 / DI / security の 4 軸で PASS/FAIL を判定する
3. MINOR 以上の指摘がある場合のみ未タスク化へ送る

## 統合テスト連携

| レイヤー        | 後続テスト                             | 目的                                      |
| --------------- | -------------------------------------- | ----------------------------------------- |
| Main helper     | `creatorHandlers.test.ts`              | runtime public 3 チャンネルの契約固定     |
| Main entrypoint | `skillCreatorHandlers.runtime.test.ts` | entrypoint 経由の登録整合                 |
| Preload         | `skill-creator-api.runtime.test.ts`    | renderer surface と channel wiring の一致 |
| Runtime service | `RuntimeSkillCreatorFacade.test.ts`    | fallback / handoff / execute 委譲の確認   |

## 4. 成果物

| 成果物               | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| Phase 3 設計レビュー | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-03-design-review.md` |

## 完了条件

- [ ] AC 1-5 の設計カバレッジがすべて PASS である
- [ ] public surface / shared 型 / DI / security の 4 軸で矛盾がない
- [ ] Phase 4 へ進める阻害要因がない
