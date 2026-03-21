# Phase 1: 要件定義 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001          |
| Phase      | 1 - 要件定義                                         |
| 関連Issue  | #1434                                                |
| 前提タスク | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001（完了済み） |
| 関連タスク | TASK-9B-H（SkillCreator IPC 基盤、完了済み）         |

## 目的

`RuntimeSkillCreatorFacade` の plan / execute / improve を、
実アプリの public `skill-creator:*` IPC / preload / shared contract に矛盾なく接続する。
あわせて、runtime service 不在時も `No handler registered` ではなく固定失敗メッセージで
graceful degradation する public surface を要件化する。

## 実行タスク

- 現状差分整理: 着手時点の channel / preload / shared types / handler registration の drift を棚卸しする
- 公開契約定義: `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` の request / response / error envelope を固定する
- 実装境界定義: `skillCreatorHandlers.ts` を public entrypoint とし、runtime helper を内部統合する責務境界を定める
- 品質ゲート定義: sender validation / sanitize / P42 3段バリデーション / shared typecheck / runtime tests の受入条件を明文化する

## 参照資料

| 資料名                        | パス                                                                                                | 用途                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| task-spec skill               | `.claude/skills/task-specification-creator/SKILL.md`                                                | Phase 1 テンプレートの正本確認                 |
| task-spec Phase 1 template    | `.claude/skills/task-specification-creator/references/phase-template-phase1.md`                     | 必須見出し・統合テスト連携の確認               |
| aiworkflow resource map       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                    | 参照すべき system spec の選定                  |
| Skill Creator IPC 正本        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                           | `skill-creator:*` 契約の正本                   |
| IPC セキュリティ              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md`                | sender validation / sanitize / whitelist 基準  |
| 実装パターン                  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-details.md` | handler 統合と graceful degradation の判断基準 |
| Runtime handler 実装          | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                      | public runtime helper の実装対象               |
| Public skill-creator handlers | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                                 | 既存 public surface の統合先                   |
| IPC registration              | `apps/desktop/src/main/ipc/index.ts`                                                                | DI / handler registration 導線                 |
| Shared runtime contract       | `packages/shared/src/types/skillCreator.ts`                                                         | preload / main 共通型の追加先                  |

## 現状分析

### 着手時に確認した差分

| 観点              | 着手時の状態                                               | 要件化した到達点                                                            |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Public channel    | runtime 3 操作が `skill-creator:*` public surface に未露出 | public channel 3 件を `IPC_CHANNELS` と whitelist で管理する                |
| Preload API       | runtime 3 操作の Renderer 向け method が未定義             | `planSkill` / `executePlan` / `improveSkillWithFeedback` を公開する         |
| Shared DTO        | preload / main 間の runtime request / response 型が未定義  | `packages/shared/src/types/skillCreator.ts` に共通 contract を置く          |
| Main registration | runtime facade への導線が public entrypoint から分離       | `registerSkillCreatorHandlers(..., runtimeSkillCreatorService?)` に統合する |
| Security          | sender validation / sanitize / P42 適用が揃っていない      | 全 runtime public handler に同一 security gate を適用する                   |
| Fallback          | service 不在時に public surface が未登録になるリスク       | 固定 failure message を返す degraded path を持つ                            |
| Auth fallback     | `api-key` mode で `apiKey` 未指定時の解決経路が曖昧        | `authKeyService` 経由の fallback を明示的に扱う                             |

### 主要コンポーネントと責務

| コンポーネント              | 現責務                                              | 本タスクで固定する責務                                     |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `SkillCreatorService`       | ファイル作成・既存 skill-creator 12 invoke          | 既存 surface を維持する                                    |
| `RuntimeSkillCreatorFacade` | runtime routing / terminal handoff / integrated API | runtime 3 操作の実装責務を担う                             |
| `creatorHandlers.ts`        | runtime helper                                      | public `skill-creator:*` runtime helper として動作する     |
| `skillCreatorHandlers.ts`   | public entrypoint                                   | 標準 12 invoke + 1 progress に runtime 3 invoke を統合する |

## スコープ

### 含む

- `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` の public runtime surface 定義
- `channels.ts` / `skill-creator-api.ts` / `packages/shared/src/types/skillCreator.ts` の契約拡張
- `ipc/index.ts` からの `RuntimeSkillCreatorFacade` DI と `skillCreatorHandlers.ts` 経由の登録
- `creatorHandlers.ts` での `validateIpcSender` / `sanitizeErrorMessage` / P42 準拠バリデーション
- runtime service 不在時の graceful degradation と固定 failure message
- runtime public IPC に対応する unit / integration / preload tests
- aiworkflow 正本仕様への同期

### 含まない

- `SkillCreatorService` と `RuntimeSkillCreatorFacade` のクラス統合
- Renderer UI コンポーネントの追加
- 旧 `creator:*` 名前空間の完全撤去
- コミット / PR 作成

## 前提条件

1. `RuntimeSkillCreatorFacade` の plan / execute / improve 自体は既存 runtime routing 基盤の上に成立していること
2. `getSkillExecutorInstance()` と `authKeyService` から runtime facade を main process で組み立てられること
3. 既存 `skill-creator:*` 12 invoke + 1 progress surface の後方互換性を崩さないこと

## 受入条件

### AC-1: Public IPC / Preload / Shared Contract

- [ ] `channels.ts` に `SKILL_CREATOR_PLAN` / `SKILL_CREATOR_EXECUTE_PLAN` / `SKILL_CREATOR_IMPROVE_SKILL` が定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に 3 チャンネルが追加されている
- [ ] `skill-creator-api.ts` に `planSkill` / `executePlan` / `improveSkillWithFeedback` が追加されている
- [ ] `packages/shared/src/types/skillCreator.ts` に runtime request / response / terminal handoff contract が追加されている

### AC-2: Main Registration / DI

- [ ] `registerSkillCreatorHandlers(mainWindow, skillCreatorService, runtimeSkillCreatorService?)` が public entrypoint として使われる
- [ ] `ipc/index.ts` で `getSkillExecutorInstance()` と `authKeyService` から runtime facade を構築できる
- [ ] runtime facade 不在でも public runtime handler は登録され、固定 failure message で degraded response を返す

### AC-3: Security / Error Contract

- [ ] runtime public 3 ハンドラすべてに `validateIpcSender` が適用されている
- [ ] 文字列引数に P42 準拠の 3 段バリデーションが適用されている
- [ ] 例外パスのメッセージが `sanitizeErrorMessage` でサニタイズされている
- [ ] internal role 名（Planner / Executor / Improver）が IPC payload に露出しない

### AC-4: Runtime 挙動

- [ ] `plan` / `improve` は `integrated_api` と `terminal_handoff` の両分岐を維持する
- [ ] `api-key` mode で `apiKey` 未指定時は `authKeyService` fallback を使う
- [ ] `execute` は stable な success/error envelope を返し、public namespace から internal detail を漏らさない

### AC-5: 検証 / 仕様同期

- [ ] runtime public handler / preload / integration の回帰テストが追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] aiworkflow 正本仕様と workflow 仕様書に contract drift がない

## 制約

- P44 準拠: internal role 名を public contract に含めない
- P42 準拠: 文字列入力は型チェック / 空文字列 / trim 空文字列を分けて検証する
- P5 準拠: runtime handler を含めて二重登録しない
- 既存 `skill-creator:*` 12 invoke + 1 progress の挙動を壊さない

## リスク

| リスク                                           | 影響度 | 軽減策                                                        |
| ------------------------------------------------ | ------ | ------------------------------------------------------------- |
| public namespace と内部 helper の drift 再発     | 高     | `skillCreatorHandlers.ts` を単一 public entrypoint に固定する |
| `api-key` fallback の判定漏れ                    | 中     | `authMode` / `apiKey` 組み合わせごとの unit test を追加する   |
| runtime service 不在で public handler が失われる | 中     | fixed failure message を返す degraded path を契約化する       |
| system spec の stale 化                          | 中     | canonical child companion files を先に確定してから更新する    |

## 統合テスト連携【必須】

| テスト項目       | 対象                                                                         | 期待結果                                                 | 主な検証フェーズ |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------- |
| IPC 契約整合     | `channels.ts` / `creatorHandlers.ts` / `skill-creator-api.ts` / shared types | request / response / channel 名が一致する                | Phase 4, 10      |
| Security gate    | sender validation / sanitize / P42                                           | 3 runtime public handler 全てに適用される                | Phase 4, 9, 10   |
| Runtime fallback | service 不在時の degraded response                                           | `No handler registered` ではなく固定失敗メッセージを返す | Phase 4, 6, 10   |
| Regression       | 既存 `skill-creator:*` 12 invoke + 1 progress                                | runtime 追加後も既存 surface が壊れない                  | Phase 6, 10, 11  |
| Spec sync        | workflow / aiworkflow 正本                                                   | current implementation と整合する                        | Phase 10, 12     |

## 成果物

| 成果物             | パス                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-01-requirements.md`                   |
| 要件定義サマリー   | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-1/requirements-definition.md` |
| 現状棚卸し         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-1/current-state-inventory.md` |
| 受入条件一覧       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-1/acceptance-criteria.md`     |

## 完了条件

- [x] 着手時の contract drift と責務分割が明文化されている
- [x] AC-1 から AC-5 までが検証可能な粒度で定義されている
- [x] スコープ / 制約 / リスクが Phase 2 以降の判断材料として整理されている
- [x] Phase 1 outputs 3 点が workflow 配下に実体として存在する
- [x] `## 統合テスト連携` を含む Phase 1 テンプレート必須見出しが揃っている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

Phase 2: 設計
