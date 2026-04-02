# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

`getDisclosureInfo()` の placeholder 実装を廃止し、実際の runtime state から
disclosure 情報を動的取得するための機能要件・非機能要件・受入基準を明文化する。

## 実行タスク

- **P50チェック**: 対象ファイルの現在の実装状態を確認
- **要件抽出**: Issue #1804 と unassigned-task 仕様書から機能要件・非機能要件を抽出
- **受入基準作成**: 各要件に対して検証可能な AC（Acceptance Criteria）を定義
- **FR/NFR分類**: 機能要件と非機能要件を分類し優先度を設定

## 実行手順

### 0. P50チェック: 既実装状態の調査

```bash
# placeholder実装の確認
grep -n "TODO(DI)\|getDisclosureInfo\|anthropic\|claude-sonnet" \
  apps/desktop/src/main/ipc/index.ts

# disclosureHandlers の実装確認
cat apps/desktop/src/main/ipc/disclosureHandlers.ts

# 独立テストの存在確認
ls apps/desktop/src/main/ipc/__tests__/ | grep disclosure
```

**確認結果**:

- `apps/desktop/src/main/ipc/index.ts` L907-918 に `TODO(DI)` placeholder が存在
- `disclosureHandlers.ts` は実装済み（IPCハンドラー定義）
- `disclosureHandlers.test.ts` は未作成（UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001）
- IPC チャンネル `execution:get-disclosure-info` は配線済み

### 1. 機能要件（FR）

| ID   | 要件                                                                                   | 優先度 |
| ---- | -------------------------------------------------------------------------------------- | ------ |
| FR-1 | `getDisclosureInfo()` が authMode（subscription/api-key）から aiServiceName を動的取得 | 高     |
| FR-2 | `getDisclosureInfo()` が LLM adapter 設定からモデル名を動的取得                        | 高     |
| FR-3 | provider 未設定時の fallback 値（"unknown"）が定義されている                           | 高     |
| FR-4 | `disclosureHandlers.test.ts` が独立テストとして存在する                                | 中     |

### 2. 非機能要件（NFR）

| ID    | 要件                                                                                     | 優先度 |
| ----- | ---------------------------------------------------------------------------------------- | ------ |
| NFR-1 | API key / token を renderer に返さない（DENY-5 準拠）                                    | 高     |
| NFR-2 | sender 検証（mainWindow.webContents と一致しない場合は UNAUTHORIZED を返す）             | 高     |
| NFR-3 | disclosure 取得失敗時は `{ success: false, error: { code: "DISCLOSURE_ERROR" } }` を返す | 中     |
| NFR-4 | TypeScript 型安全性: `DisclosureInfo` 型に準拠した値を返す                               | 高     |

### 3. 受入基準（AC）

| AC ID | 基準                                                                           | 検証方法       |
| ----- | ------------------------------------------------------------------------------ | -------------- |
| AC-1  | authMode が "subscription" のとき aiServiceName が "Claude Code CLI" になる    | ユニットテスト |
| AC-2  | authMode が "api-key" のとき aiServiceName が "Anthropic API" になる           | ユニットテスト |
| AC-3  | provider 未設定時（authMode が null/undefined）の fallback が "unknown" になる | ユニットテスト |
| AC-4  | `externalDestinations` には API key / token が含まれない                       | ユニットテスト |
| AC-5  | 送信元が mainWindow でない場合 UNAUTHORIZED エラーが返る                       | ユニットテスト |
| AC-6  | `getDisclosureInfo()` が例外を投げた場合 DISCLOSURE_ERROR が返る               | ユニットテスト |
| AC-7  | `disclosureHandlers.test.ts` が新規作成され全テストが PASS する                | CI確認         |

### 4. スコープ定義

**含む**:

- `apps/desktop/src/main/ipc/index.ts` の DI 接続変更（L907-918）
- `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` の新規作成
- `DisclosureService` または同等のファクトリ関数の作成（必要に応じて）

**含まない**:

- `disclosureHandlers.ts` の IPC ハンドラー本体ロジックの変更（既存実装を維持）
- Renderer 側 UI の変更
- `preload/types.ts` の型変更
- `externalDestinations` の実際の送信先リスト収集（Phase 12 以降の将来タスク）

### 5. 依存関係の確認

**既存の依存ツリー**:

```
ipc/index.ts
  └─ registerDisclosureHandlers(deps: DisclosureHandlerDependencies)
       └─ deps.getDisclosureInfo: () => Promise<DisclosureInfo>
            └─ [現在] inline placeholder async () => ({ aiServiceName: "anthropic", ... })
            └─ [変更後] AuthModeService / IAuthKeyService からの動的取得
```

**参照するサービス**:

- `IAuthModeService.getMode()` → "subscription" | "api-key"
- `IAuthKeyService.hasKey()` → boolean

## 参照資料

| 資料名                | パス                                                                                                  | 説明                              |
| --------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| placeholder 実装      | `apps/desktop/src/main/ipc/index.ts` L907-918                                                         | TODO(DI) の現在のplaceholder実装  |
| IPCハンドラー定義     | `apps/desktop/src/main/ipc/disclosureHandlers.ts`                                                     | disclosure IPCハンドラー本体      |
| AuthModeService型     | `apps/desktop/src/main/services/auth/types.ts`                                                        | IAuthModeService インターフェース |
| RuntimeResolver       | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`                                           | authMode/apiKey解決パターンの参考 |
| unassigned-task仕様書 | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` | 起票元仕様書                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                 | 内容                    |
| -------- | ---------------------------------------------------- | ----------------------- |
| IPC仕様  | `.claude/skills/aiworkflow-requirements/references/` | IPC設計・DENY-5ポリシー |

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未計測 |
| ユニットテストBranch     | 60%+ | 未計測 |
| ユニットテストFunction   | 80%+ | 未計測 |
| 結合テストAPI            | 100% | 未計測 |
| 結合テストシナリオ正常系 | 100% | 未計測 |
| 結合テストシナリオ異常系 | 80%+ | 未計測 |

## 多角的チェック観点（AIが判断）

### システム系

- **責務境界**: `getDisclosureInfo` の実装責務は `ipc/index.ts` の DI 注入側にある。`disclosureHandlers.ts` 本体は変更不要。
- **状態所有権**: authMode は `AuthModeService`、apiKey の有無は `AuthKeyService` が所有。IPC ハンドラーはこれらを間接参照する。
- **因果ループ**: placeholder → disclosure 表示が常に静的 → ユーザー信頼低下 → production 品質未達

### 価値系

- **価値**: ユーザーが実際に使用中の AI プロバイダーを確認できるようになる（transparency）
- **コスト**: 変更は DI 接続の差し替えのみで小規模

### 問題解決系

- **真の論点**: IPC 配線は完了しているが、実データとの接続が欠落している（Strangler Fig の中間状態）
- **優先順位**: AC-1〜AC-3（動的取得）> AC-4〜AC-7（セキュリティ・テスト）

## 成果物

| 成果物     | パス                              | 説明                           |
| ---------- | --------------------------------- | ------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ファイルが要件定義書を兼ねる |

## 完了条件

- [x] 機能要件（FR-1〜FR-4）が全て抽出されている
- [x] 非機能要件（NFR-1〜NFR-4）が全て抽出されている
- [x] 受入基準（AC-1〜AC-7）が検証可能な形で定義されている
- [x] スコープ定義（含む/含まない）が明確になっている
- [x] 依存サービスが特定されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク          | 状態 | 備考                            |
| --------------- | ---- | ------------------------------- |
| P50チェック実施 | 完了 | placeholder L907-918 を確認済み |
| 機能要件抽出    | 完了 | FR-1〜FR-4 を定義               |
| 非機能要件抽出  | 完了 | NFR-1〜NFR-4 を定義             |
| 受入基準定義    | 完了 | AC-1〜AC-7 を定義               |
| スコープ定義    | 完了 | 含む/含まないを明記             |
| 依存関係確認    | 完了 | AuthModeService/AuthKeyService  |

## 次のPhase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)

**ゲート**: Phase 1 完了後にのみ Phase 2 へ進む。
