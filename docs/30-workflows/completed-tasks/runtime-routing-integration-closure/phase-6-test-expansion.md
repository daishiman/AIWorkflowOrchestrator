# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 6                                                          |
| Phase名    | テスト拡充                                                 |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 5（実装）                                            |
| 後続Phase  | Phase 7（カバレッジ確認）                                  |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 5 の実装後にカバレッジ不足箇所を特定し、異常系・境界値・統合テストを追加することでカバレッジ基準（Line 80%、Branch 60%、Function 80%）を達成する。既存テストが全て PASS していることを維持しながら、テストの網羅性を高める。

## 実行タスク

- カバレッジ測定: Phase 5 実装のカバレッジを測定し、不足箇所を特定する
- エッジケーステスト追加: 異常系・境界値テスト（authMode 不正値、API Key 不在、IPC エラー）を追加する
- 統合テスト追加: RuntimeResolver → IPC → Renderer の接続テストを追加する
- 既存テスト維持確認: 既存テストが全て PASS していることを確認する

## 参照資料

| 参照資料                   | パス                                                                                                        | 内容                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 4 テスト設計書       | `outputs/phase-4/test-design.md`                                                                            | テストケース一覧と E2E シナリオ         |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                                                 | 変更ファイル一覧と Pitfall 対策適用結果 |
| RuntimeResolver テスト     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeResolver.test.ts`                                  | Phase 4 で作成済みのテスト（拡充対象）  |
| skillHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`                                         | Phase 4 で作成済みのテスト（拡充対象）  |
| agentHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`                                         | Phase 4 で作成済みのテスト（拡充対象）  |
| TerminalHandoffCard テスト | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx` | Phase 4 で作成済みのテスト（拡充対象）  |
| useSkillExecution テスト   | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.runtime.test.ts`                               | Phase 4 で作成済みのテスト（拡充対象）  |
| useAgent テスト            | `apps/desktop/src/renderer/hooks/__tests__/useAgent.runtime.test.ts`                                        | Phase 4 で作成済みのテスト（拡充対象）  |

### システム仕様（aiworkflow-requirements）

> カバレッジ不足箇所の補完テスト作成時に以下の正本仕様を参照する。

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |

## 実行手順

### ステップ1: カバレッジを測定する

```bash
# apps/desktop パッケージのカバレッジ測定
cd apps/desktop
pnpm vitest run --coverage \
  src/main/services/runtime/ \
  src/main/ipc/skillHandlers.ts \
  src/main/ipc/agentHandlers.ts \
  src/renderer/components/organisms/TerminalHandoffCard/ \
  src/renderer/hooks/useSkillExecution.ts \
  src/renderer/hooks/useAgent.ts \
  src/renderer/store/slices/agentSlice.ts
```

カバレッジレポートから以下を特定する:

- 実行されていない行（Line Coverage 不足）
- 未テストの分岐（Branch Coverage 不足）
- テストされていない関数（Function Coverage 不足）

注意: **P41対策**: v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする。オプションオブジェクト内のコールバックが実行されていない場合、Function Coverage が低下する可能性がある。

### ステップ2: 不足テストを特定しリストアップする

カバレッジレポートを基に、不足テストを以下のフォーマットで `outputs/phase-6/test-expansion-summary.md` に記録する:

| ファイル                | 不足カテゴリ      | 不足箇所               | 追加するテスト内容                 |
| ----------------------- | ----------------- | ---------------------- | ---------------------------------- |
| RuntimeResolver.ts      | Branch Coverage   | エラーハンドリング分岐 | Service が例外を投げた場合のテスト |
| skillHandlers.ts        | Line Coverage     | 後方互換パス           | runtimeResolver 未注入時のテスト   |
| TerminalHandoffCard.tsx | Function Coverage | コピー後の状態変化     | コピー成功フィードバックのテスト   |

### ステップ3: 異常系・境界値テストを追加する

以下の異常系・境界値テストを各テストファイルに追加する:

**RuntimeResolver.test.ts への追加テスト**:

| テストケース                    | 前提条件                                               | 期待結果                                 |
| ------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| IAuthKeyService が例外を投げる  | `getKey()` が `Error("service_unavailable")` を投げる  | エラーを上位に伝播する（握りつぶさない） |
| IAuthModeService が例外を投げる | `getMode()` が `Error("service_unavailable")` を投げる | エラーを上位に伝播する（握りつぶさない） |
| authMode が不正値（空文字列）   | `getMode()` が `""` を返す                             | `handoff` 型を返す（デフォルト安全側）   |
| authMode が不正値（null）       | `getMode()` が `null` を返す                           | `handoff` 型を返す（デフォルト安全側）   |

**skillHandlers.runtime.test.ts への追加テスト**:

| テストケース                          | 前提条件                            | 期待結果                                                 |
| ------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| RuntimeResolver が例外を投げる        | `resolve()` が例外を投げる          | IPC エラーレスポンスが返される（内部エラーは漏洩しない） |
| TerminalHandoffBuilder が例外を投げる | `build()` が例外を投げる            | IPC エラーレスポンスが返される                           |
| runtimeResolver 未注入（後方互換）    | runtimeResolver が undefined の場合 | 既存の execute フローが呼ばれる                          |
| 同時並行リクエスト                    | 同一チャンネルへの同時2リクエスト   | それぞれ独立して処理される（レース条件なし）             |

**useSkillExecution.runtime.test.ts への追加テスト**:

| テストケース                         | 前提条件                                                   | 期待結果                                      |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------------- |
| IPC が ネットワークエラーで失敗する  | `window.electronAPI.skill.execute` が reject               | エラーが上位コンポーネントに伝播する          |
| handoff 結果に guidance が含まれない | `result.type === "handoff"` だが `result.guidance` が null | Store に guidance が設定されない              |
| authMode が変わった後の再実行        | subscription → api-key に変更後に execute                  | 新しい authMode に基づいたフローが実行される  |
| 連続実行時の handoffGuidance クリア  | subscription モードで2回連続実行                           | 2回目の実行前に前回の guidance がクリアされる |

**TerminalHandoffCard.test.tsx への追加テスト**:

| テストケース                      | 前提条件                                            | 期待結果                                                 |
| --------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| 長いコマンド文字列の表示          | `terminalCommand` が200文字以上                     | テキストがコンテナから溢れず、スクロール可能             |
| コピー後のフィードバック表示      | コピーボタン押下後                                  | ボタンテキストまたはアイコンが変化しフィードバックを示す |
| ライトモード / ダークモードの切替 | CSS変数（`--border`, `--text`）が設定されている環境 | スタイルが正しく適用される（コントラスト比テスト）       |
| キーボードナビゲーション          | Tabキーでフォーカスをコピー→閉じるボタンに移動      | フォーカスが正しく移動し、Enterキーで各ボタンが動作する  |

注意事項:

- **P39対策**: `fireEvent.keyDown` / `fireEvent.keyUp` を使用する（`userEvent.keyboard` 禁止）
- キーボードテストは `fireEvent.keyDown(button, { key: "Enter" })` で実装する

### ステップ4: 統合テストを追加する

RuntimeResolver → IPC → Renderer の接続を検証する統合テストを追加する。

配置先: 新規ファイル `apps/desktop/src/main/ipc/__tests__/runtimeRouting.integration.test.ts`

統合テストケース:

| テストケース                            | テスト範囲                      | 期待結果                                        |
| --------------------------------------- | ------------------------------- | ----------------------------------------------- |
| api-key モードの integrated フロー      | RuntimeResolver → skillHandlers | execute フローが呼ばれ、skill が実行される      |
| subscription モードの handoff フロー    | RuntimeResolver → skillHandlers | HandoffGuidance が返され、execute が呼ばれない  |
| Agent api-key フロー                    | RuntimeResolver → agentHandlers | agent execute フローが呼ばれる                  |
| Agent subscription handoff フロー       | RuntimeResolver → agentHandlers | Agent HandoffGuidance が返される                |
| chatEditHandlers との DI 競合がないこと | composition root での DI 注入   | 各ハンドラが独立した runtimeResolver を共有する |

### ステップ5: 既存テストの PASS を確認する

```bash
# 全テスト実行（既存テストが壊れていないことを確認）
cd apps/desktop
pnpm test

# 新規テストのみ実行
pnpm vitest run src/main/ipc/__tests__/runtimeRouting.integration.test.ts
```

既存テストが失敗した場合は、原因を特定して修正する（テストの `.skip` は理由とIssue番号が必要）。

## 統合テスト連携

- カバレッジレポートから不足箇所を特定し、テスト追加後に再測定して基準達成を確認する
- 異常系テスト（authMode 不正値、API Key 不在、IPC エラー）を追加し、フェイルセキュア動作を検証する
- 統合テストで RuntimeResolver → IPC → Renderer の接続が正常であることを確認する

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                               | 仕様参照先                                                  |
| -------------- | -------------------------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（フェイルセキュア動作の検証）     | `aiworkflow-requirements: security-skill-execution.md`      |
| アーキテクチャ | 該当（統合テストの接続検証）           | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（異常系 IPC レスポンスの検証）    | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| 状態管理       | 該当（handoffGuidance 状態変化の検証） | `aiworkflow-requirements: arch-state-management.md`         |

## 成果物

| 成果物                              | パス                                                                                                        | 内容                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| テスト拡充サマリー                  | `outputs/phase-6/test-expansion-summary.md`                                                                 | 不足テストの特定結果、追加テスト一覧、カバレッジ改善結果 |
| 拡充済み RuntimeResolver テスト     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeResolver.test.ts`                                  | 異常系テスト追加済み                                     |
| 拡充済み skillHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`                                         | 異常系・境界値テスト追加済み                             |
| 拡充済み agentHandlers テスト       | `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`                                         | 異常系・境界値テスト追加済み                             |
| 拡充済み TerminalHandoffCard テスト | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx` | 長文・キーボード・テーマテスト追加済み                   |
| 拡充済み useSkillExecution テスト   | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.runtime.test.ts`                               | エラー伝播・連続実行テスト追加済み                       |
| 拡充済み useAgent テスト            | `apps/desktop/src/renderer/hooks/__tests__/useAgent.runtime.test.ts`                                        | エラー伝播・連続実行テスト追加済み                       |
| 統合テスト                          | `apps/desktop/src/main/ipc/__tests__/runtimeRouting.integration.test.ts`                                    | RuntimeResolver → IPC → Renderer 接続テスト              |

## 完了条件

- [ ] カバレッジ測定が実施され、不足箇所が `outputs/phase-6/test-expansion-summary.md` にリストアップされている
- [ ] P41 対策として、インライン arrow function のカバレッジが確認されている
- [ ] 異常系テスト（Service 例外、IPC エラー、authMode 不正値）が追加されている
- [ ] 境界値テスト（空文字列、null、スペースのみ、長文）が追加されている
- [ ] 統合テスト（RuntimeResolver → IPC 接続）が追加されている
- [ ] P39 対策として、新規テストで `userEvent` を使わず `fireEvent` を使用している
- [ ] P9 対策として、全新規テストで `beforeEach` によるリセットが実装されている
- [ ] 既存テストが全て PASS していることが確認されている（リグレッションなし）
- [ ] Phase 7 での再測定に備え、カバレッジ基準の達成見込みが `test-expansion-summary.md` に記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
