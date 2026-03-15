# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 9                                                          |
| Phase名    | 品質検証                                                   |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 8（リファクタリング）                                |
| 後続Phase  | Phase 10（最終レビュー）                                   |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

定義された品質ゲートをすべて満たすことを測定・確認する。全テスト PASS、Lint / TypeCheck クリア、カバレッジ基準達成、セキュリティ要件充足、IPC 契約整合の5点を検証する。

## 実行タスク

- **全テスト実行**: SkillExecutor / AgentExecutor / SkillCreatorService / TerminalHandoffCard / Renderer Hook のユニットテストと統合テストを実行する
- **Lint / TypeCheck 実行**: ESLint と TypeScript strict mode による静的解析を実行する
- **カバレッジ測定**: Line 80%+ / Branch 60%+ / Function 80%+ の基準達成を確認する
- **セキュリティ検証**: API Key が TerminalHandoffCard の props またはログに漏洩していないことを確認する
- **IPC 契約検証**: P42 / P44 / P45 対策チェックリストを実行し、ハンドラ引数形式と Preload 呼び出し形式の一致を確認する

## 参照資料

| 参照資料                         | パス                                                                           | 内容                                    |
| -------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| Phase 5 実装サマリー             | `outputs/phase-5/implementation-summary.md`                                    | 実装対象と品質監査対象の一致確認        |
| Phase 8 リファクタリングサマリー | `outputs/phase-8/refactoring-summary.md`                                       | リファクタリング後の変更内容一覧        |
| Phase 7 カバレッジレポート       | `outputs/phase-7/coverage-report.md`                                           | Phase 7 時点のカバレッジベースライン    |
| skillHandlers                    | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   | skill 実行 IPC ハンドラ（P42/P44 対象） |
| agentHandlers                    | `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | agent 実行 IPC ハンドラ（P42/P44 対象） |
| TerminalHandoffCard              | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | API Key 漏洩チェック対象                |
| ipc-contract-checklist           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 契約検証チェックリスト（Phase 1-6） |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`       | Agent SDK UI / Hook の正本     |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |

## 実行手順

### ステップ1: 全テスト実行

```bash
pnpm --filter @repo/desktop test
```

結果を品質ゲート表に記録する。失敗したテストがある場合は、フェイルログを `quality-report.md` に記録し、原因を特定する。テスト修正が必要な場合は Phase 6 に戻る。

### ステップ2: Lint / TypeCheck の実行

```bash
# ESLint
pnpm --filter @repo/desktop lint

# TypeScript strict mode
pnpm --filter @repo/desktop typecheck
```

エラーが0件であることを確認する。警告（warning）がある場合は内容を記録し、対応が必要かを判断する。

### ステップ3: カバレッジ測定

```bash
pnpm --filter @repo/desktop test -- --coverage
```

以下の基準をすべて満たしていることを確認する:

| カバレッジ指標    | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

基準未達の場合は Phase 6（テスト拡充）に戻る。

### ステップ4: API Key 漏洩チェック

TerminalHandoffCard の props と実装に API Key が含まれていないことを確認する。

```bash
# TerminalHandoffCard の props に apiKey / key / token が含まれていないか
grep -n "apiKey\|api_key\|apiToken\|authKey" \
  apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx

# TerminalHandoffCard を使用する箇所で API Key が渡されていないか
grep -rn "TerminalHandoffCard" apps/desktop/src/renderer/ | \
  grep -v ".test.tsx\|.spec.tsx"

# ログ出力に API Key が含まれていないか
grep -n "console.log\|logger.info\|logger.debug" \
  apps/desktop/src/main/services/runtime/RuntimeResolver.ts \
  apps/desktop/src/main/services/skill/SkillExecutor.ts \
  apps/desktop/src/main/services/agent/AgentExecutor.ts
```

API Key に関連するキーワードが検出された場合、該当箇所を修正し再テストを実行する。

### ステップ5: IPC 契約検証（P42 / P44 / P45 対策）

ipc-contract-checklist.md の Phase 1-6 を実行し、以下の項目を確認する:

**P42 検証: 3段バリデーション確認**

```bash
# skill / agent ハンドラの引数バリデーションを確認
grep -n "typeof\|trim()\|=== \"\"" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/main/ipc/agentHandlers.ts
```

各文字列引数に以下の3段バリデーションが実装されていることを確認する:

1. `typeof args !== "string"` （型チェック）
2. `args === ""` （空文字列チェック）
3. `args.trim() === ""` （トリム空文字列チェック）

**P44 / P45 検証: ハンドラ引数形式と Preload 呼び出し形式の一致**

```bash
# ハンドラ側の引数形式を確認
grep -n "ipcMain.handle\|async.*event.*args" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/main/ipc/agentHandlers.ts

# Preload 側の呼び出し形式を確認
grep -n "safeInvoke\|IPC_CHANNELS" \
  apps/desktop/src/preload/skill-api.ts \
  apps/desktop/src/preload/agent-api.ts
```

ハンドラが受け取る引数の型・形式・命名が Preload 側の呼び出しと完全に一致していることを確認する。

### ステップ6: 品質ゲート表の作成

全項目の結果を品質ゲート表にまとめる:

| 品質ゲート         | 基準                                     | 結果 | 詳細 |
| ------------------ | ---------------------------------------- | ---- | ---- |
| 全テスト PASS      | 失敗0件                                  | -    | -    |
| ESLint             | エラー0件                                | -    | -    |
| TypeCheck          | エラー0件                                | -    | -    |
| Line Coverage      | 80%+                                     | -%   | -    |
| Branch Coverage    | 60%+                                     | -%   | -    |
| Function Coverage  | 80%+                                     | -%   | -    |
| API Key 非漏洩     | TerminalHandoffCard に apiKey props なし | -    | -    |
| P42 バリデーション | 全文字列引数に3段チェック実装            | -    | -    |
| P44/P45 IPC 契約   | ハンドラ引数と Preload 形式が一致        | -    | -    |

全項目が基準を満たした場合のみ Phase 10 に進む。

## 統合テスト連携

品質ゲート表を作成し、全項目 PASS を確認する。以下の統合テストを明示的に確認する:

- RuntimeResolver → SkillExecutor / AgentExecutor / SkillCreatorService の DI 接続が PASS
- IPC ハンドラ → Preload → Renderer Hook の handoff 応答経路が PASS
- TerminalHandoffCard の表示条件（`handoffGuidance !== null`）と非表示条件（`handoffGuidance === null`）が PASS

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                     | 仕様参照先                                                  |
| -------------- | -------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（API Key 漏洩チェック）                 | `aiworkflow-requirements: security-skill-execution.md`      |
| IPC通信        | 該当（P42/P44/P45 対策チェックリスト実行）   | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| アーキテクチャ | 該当（DI 接続の統合テスト確認）              | `aiworkflow-requirements: arch-electron-services.md`        |
| 状態管理       | 該当（P31/P48 準拠の Hook テスト確認）       | `aiworkflow-requirements: arch-state-management.md`         |
| UI/UX          | 該当（TerminalHandoffCard の表示テスト確認） | `aiworkflow-requirements: ui-ux-agent-execution.md`         |

## 成果物

| 成果物       | パス                                | 内容                                           |
| ------------ | ----------------------------------- | ---------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート表（全項目の結果・数値・詳細を記録） |

## 完了条件

- [ ] `pnpm test` で全テストが PASS している（失敗0件）
- [ ] `pnpm lint` でエラーが0件である
- [ ] `pnpm typecheck` でエラーが0件である
- [ ] Line Coverage が 80% 以上、Branch Coverage が 60% 以上、Function Coverage が 80% 以上である
- [ ] TerminalHandoffCard の props に `apiKey` / `api_key` / `authKey` / `token` が含まれていない（`grep` で0件確認済み）
- [ ] 新規実装した全文字列 IPC 引数に3段バリデーション（型 → 空文字列 → トリム空文字列）が実装されている（P42 準拠）
- [ ] 全 IPC ハンドラの引数形式と Preload 呼び出し形式が一致している（P44/P45 準拠）
- [ ] `quality-report.md` に品質ゲート表（全9項目）の結果が具体的な数値と共に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
