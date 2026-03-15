# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 4                                                          |
| Phase名    | テスト作成                                                 |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 3（設計レビュー）                                    |
| 後続Phase  | Phase 5（実装）                                            |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 2 の設計に基づき、実装前にテストコードを設計・作成する（TDD: Red フェーズ）。RuntimeResolver 共通化、IPC ハンドラ DI、TerminalHandoffCard、Renderer Hook 分岐、Store の handoffGuidance 状態管理に対するテストを網羅的に作成する。

## 実行タスク

- RuntimeResolver 共通化テスト: `resolve()` メソッドの `integrated` / `handoff` 分岐テスト、DI 注入検証テスト
- IPC ハンドラ DI テスト: skillHandlers / agentHandlers への RuntimeResolver 注入テスト、runtime 分岐による応答変化テスト
- TerminalHandoffCard テスト: Props 表示テスト、コピーボタン動作テスト、閉じるボタン動作テスト
- Renderer Hook 分岐テスト: useSkillExecution / useAgent の authMode 分岐テスト（`api-key` / `subscription` 各モード）
- Store テスト: `handoffGuidance` 状態の設定・クリア・セレクタ動作テスト

## 参照資料

| 参照資料                 | パス                                                          | 内容                                      |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------- |
| Phase 1 要件定義書       | `outputs/phase-1/requirements-definition.md`                  | 要件と受入基準（テストケースの根拠）      |
| Phase 3 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                     | レビュー判定と指摘対応内容                |
| Phase 2 設計サマリー     | `outputs/phase-2/design-summary.md`                           | 全設計の概要と判断根拠                    |
| Phase 2 契約マトリクス   | `outputs/phase-2/contract-matrix.md`                          | 変更前後のインターフェース契約対照表      |
| Phase 2 UI/UX 実現仕様   | `outputs/phase-2/ui-ux-realization.md`                        | TerminalHandoffCard の UI 仕様            |
| RuntimeResolver 実装     | `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts` | 既存 runtime 決定ロジック（テスト参考）   |
| chatEditHandlers         | `apps/desktop/src/main/ipc/chatEditHandlers.ts`               | RuntimeResolver 統合パターン（L130-191）  |
| agentSlice               | `apps/desktop/src/renderer/store/slices/agentSlice.ts`        | 既存 Store 構造（handoffGuidance 追加先） |
| useSkillExecution        | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`        | 既存 Hook 実装（テスト対象）              |
| useAgent                 | `apps/desktop/src/renderer/hooks/useAgent.ts`                 | 既存 Hook 実装（テスト対象）              |

### システム仕様（aiworkflow-requirements）

> テスト設計前に以下の正本仕様を確認し、契約に準拠したテストケースを作成する。

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`       | Agent SDK UI / Hook の正本     |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent surface の UI 契約       |

## 実行手順

### ステップ1: テスト配置先を確認し、既存テストとの衝突を防ぐ

```bash
# 既存テストファイルの確認
ls apps/desktop/src/main/services/runtime/__tests__/ 2>/dev/null || echo "ディレクトリ未作成"
ls apps/desktop/src/main/ipc/__tests__/ 2>/dev/null
ls apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/ 2>/dev/null || echo "ディレクトリ未作成"
ls apps/desktop/src/renderer/hooks/__tests__/ 2>/dev/null

# 既存のテストとの重複確認
grep -rn "RuntimeResolver\|TerminalHandoffCard\|handoffGuidance" apps/desktop/src/ --include="*.test.*"
```

### ステップ2: RuntimeResolver 単体テストを作成する

配置先: `apps/desktop/src/main/services/runtime/__tests__/RuntimeResolver.test.ts`

テストケース設計:

| テストケース                         | 前提条件                                     | 期待結果                                                  |
| ------------------------------------ | -------------------------------------------- | --------------------------------------------------------- |
| authMode=api-key かつ API Key 存在   | `IAuthKeyService.getKey()` が有効キーを返す  | `{ type: "integrated" }` を返す                           |
| authMode=subscription                | `IAuthModeService.getMode()` が subscription | `{ type: "handoff", reason: "subscription_mode" }` を返す |
| authMode=api-key かつ API Key 未設定 | `IAuthKeyService.getKey()` が null を返す    | `{ type: "handoff", reason: "api_key_missing" }` を返す   |
| DI 注入検証                          | IAuthKeyService / IAuthModeService をモック  | コンストラクタが正しく DI を受け取る                      |
| resolve() 呼び出し回数               | 複数回呼び出し                               | 毎回 Service を参照して決定する（キャッシュしない）       |

注意事項:

- `beforeEach` でモックをリセットし、テスト間の状態共有を防ぐ（P9対策）
- `IAuthKeyService` / `IAuthModeService` は `vi.fn()` でモック化する

### ステップ3: IPC ハンドラ DI テストを作成する

配置先:

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`
- `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`

テストケース設計（skillHandlers.runtime.test.ts）:

| テストケース                         | 前提条件                                  | 期待結果                                              |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------------------- |
| RuntimeResolver が integrated を返す | `runtimeResolver.resolve()` が integrated | 既存の execute フローが呼ばれる                       |
| RuntimeResolver が handoff を返す    | `runtimeResolver.resolve()` が handoff    | `HandoffGuidance` を含む応答が Renderer に返される    |
| RuntimeResolver が注入されない場合   | runtimeResolver なし（後方互換テスト）    | 既存の execute フローが呼ばれる（デフォルト動作維持） |
| P42: 空文字列引数の拒否              | skillName = "" または " "（スペースのみ） | `VALIDATION_ERROR` が返される                         |
| P42: null/undefined 引数の拒否       | skillName = null / undefined              | `VALIDATION_ERROR` が返される                         |

注意事項:

- `beforeEach` でモックをリセットする（P9対策）
- 引数バリデーションは3段（型 → 空文字列 → トリム空文字列）をテストする（P42対策）

### ステップ4: TerminalHandoffCard テストを作成する

配置先: `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx`

テストケース設計:

| テストケース                    | 前提条件                                         | 期待結果                                                 |
| ------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| guidance.reason の表示          | `guidance.reason = "subscription_mode"` を渡す   | 理由テキストが DOM に表示される                          |
| guidance.terminalCommand の表示 | `guidance.terminalCommand = "claude ..."` を渡す | monospace フォントでコマンドが表示される                 |
| guidance.contextSummary の表示  | `guidance.contextSummary = "..." ` を渡す        | コンテキストサマリーが DOM に表示される                  |
| コピーボタン押下                | `onCopyCommand` props を渡す                     | `onCopyCommand` が呼ばれる                               |
| 閉じるボタン押下                | `onDismiss` props を渡す                         | `onDismiss` が呼ばれる                                   |
| guidance = null の場合          | `guidance` props が null                         | コンポーネントが null または空を返す（クラッシュしない） |

注意事項:

- **P39対策**: happy-dom 環境では `userEvent` を使わず `fireEvent` を使用する
  - コピーボタン: `fireEvent.click(copyButton)`
  - 閉じるボタン: `fireEvent.click(dismissButton)`
- 非同期ハンドラがある場合は `await act(async () => { fireEvent.click(el) })` で包む

### ステップ5: Renderer Hook 分岐テストを作成する

配置先:

- `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.runtime.test.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useAgent.runtime.test.ts`

テストケース設計（useSkillExecution.runtime.test.ts）:

| テストケース                              | 前提条件                                    | 期待結果                                   |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| authMode=api-key の execute フロー        | Store に `authMode = "api-key"` を設定      | 既存の IPC execute チャンネルが呼ばれる    |
| authMode=subscription の handoff フロー   | Store に `authMode = "subscription"` を設定 | handoff IPC チャンネルが呼ばれる           |
| handoff 結果が Store に保存される         | subscription モードで実行                   | `handoffGuidance` が Store に設定される    |
| execute 成功後に handoffGuidance がクリア | api-key モードで実行成功                    | `handoffGuidance` が null にリセットされる |

注意事項:

- **P31対策**: `useAuthMode()` 個別セレクタを使用し、合成 Hook（`useAuthModeStore()`）を使わない
- **P48対策**: 派生セレクタが必要な場合は `useShallow` を適用する
- `beforeEach` でモックおよび Store 状態をリセットする（P9対策）

### ステップ6: Store テストを作成する

既存の agentSlice テストファイルに追記するか、新規テストファイルを追加する。

テストケース設計:

| テストケース                       | 前提条件                           | 期待結果                                   |
| ---------------------------------- | ---------------------------------- | ------------------------------------------ |
| setHandoffGuidance アクション      | HandoffGuidance オブジェクトを渡す | Store に guidance が保存される             |
| clearHandoffGuidance アクション    | guidance が設定済みの状態          | `handoffGuidance` が null にリセットされる |
| `useHandoffGuidance()` セレクタ    | guidance が設定されている          | セレクタが guidance を返す                 |
| `useHandoffGuidance()` null の場合 | guidance が未設定（初期状態）      | セレクタが null を返す                     |

注意事項:

- `beforeEach` で Store を初期状態にリセットする（P9対策）
- **P31対策**: `useHandoffGuidance()` を個別セレクタとして実装し、合成 Hook を経由しない

### ステップ7: 統合テストシナリオを設計する

`outputs/phase-4/test-design.md` に以下の統合テストシナリオを記述する:

**E2E シナリオ 1: subscription モードの handoff フロー**

1. authMode を subscription に設定する
2. useSkillExecution.executeSkill() を呼び出す
3. IPC で handoff guidance を要求する
4. Store に handoffGuidance が保存される
5. TerminalHandoffCard に guidance が表示される

**E2E シナリオ 2: api-key モードの integrated フロー**

1. authMode を api-key に設定し、API Key を設定する
2. useSkillExecution.executeSkill() を呼び出す
3. RuntimeResolver が integrated を返す
4. 既存の execute フローが継続される
5. TerminalHandoffCard は表示されない

## 統合テスト連携

- RuntimeResolver → Handler → Preload → Renderer の接続テストシナリオを `outputs/phase-4/test-design.md` に記載する
- authMode 分岐の E2E シナリオ（subscription / api-key）を設計する
- Phase 5 実装後に各テストが Red → Green に変わることを確認する手順を明記する

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                         | 仕様参照先                                                  |
| -------------- | -------------------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（API Key のモック漏洩防止） | `aiworkflow-requirements: security-skill-execution.md`      |
| UI/UX          | 該当（HandoffCard テスト設計）   | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アーキテクチャ | 該当（DI テスト構造）            | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（ハンドラ DI テスト）       | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| 状態管理       | 該当（handoff 状態テスト）       | `aiworkflow-requirements: arch-state-management.md`         |

## 成果物

| 成果物                     | パス                                                                                                        | 内容                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| テスト設計書               | `outputs/phase-4/test-design.md`                                                                            | テストケース一覧、統合テストシナリオ、E2E 設計      |
| RuntimeResolver テスト     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeResolver.test.ts`                                  | RuntimeResolver 単体テスト（全テストが Red）        |
| skillHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`                                         | Skill IPC ハンドラ runtime テスト（全テストが Red） |
| agentHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`                                         | Agent IPC ハンドラ runtime テスト（全テストが Red） |
| TerminalHandoffCard テスト | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx` | UI コンポーネントテスト（全テストが Red）           |
| useSkillExecution テスト   | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.runtime.test.ts`                               | Hook 分岐テスト（全テストが Red）                   |
| useAgent テスト            | `apps/desktop/src/renderer/hooks/__tests__/useAgent.runtime.test.ts`                                        | Hook 分岐テスト（全テストが Red）                   |

## 完了条件

- [ ] RuntimeResolver 単体テストが全テストケースを網羅し、Red 状態で作成されている
- [ ] skillHandlers / agentHandlers の runtime DI テストが作成されている
- [ ] P42 準拠の3段バリデーションテスト（型 → 空文字列 → トリム空文字列）が含まれている
- [ ] TerminalHandoffCard テストが Props 表示・コピー・閉じる動作を網羅している
- [ ] P39 対策として `fireEvent` を使用し、`userEvent` を使っていない
- [ ] useSkillExecution / useAgent の authMode 分岐テストが作成されている
- [ ] P31 対策として `useAuthMode()` 個別セレクタをモックしている
- [ ] P48 対策として派生セレクタに `useShallow` が適用されている（該当する場合）
- [ ] Store の handoffGuidance 設定・クリア・セレクタテストが作成されている
- [ ] `beforeEach` でモックおよび Store 状態がリセットされている（P9対策）
- [ ] 統合テストシナリオ（E2E 設計）が `outputs/phase-4/test-design.md` に記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
