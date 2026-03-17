# Phase 1: 実装インベントリ

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 1. 新規作成ファイル

### 1-1. DefaultSafetyGate 実装

| 項目     | 値                                                                |
| -------- | ----------------------------------------------------------------- |
| パス     | `apps/desktop/src/main/permissions/default-safety-gate.ts`        |
| 責務     | SafetyGatePort 具象実装（5種安全性チェック + グレード集約）       |
| 依存     | IPermissionStore, ToolRiskLevel, TOOL_RISK_CONFIG, SafetyGatePort |
| 推定行数 | 150-200行                                                         |

**エクスポート一覧:**

| エクスポート名          | 種類      | 説明                      |
| ----------------------- | --------- | ------------------------- |
| `DefaultSafetyGate`     | class     | SafetyGatePort 実装クラス |
| `SkillMetadataProvider` | interface | メタデータ取得の DI 境界  |

### 1-2. DefaultSafetyGate テスト

| 項目           | 値                                                              |
| -------------- | --------------------------------------------------------------- |
| パス           | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` |
| 責務           | DefaultSafetyGate の単体テスト                                  |
| テストケース数 | 約30-40件（Phase 4 + Phase 6）                                  |

### 1-3. IPC ハンドラ

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| パス     | `apps/desktop/src/main/ipc/safetyGateHandlers.ts` |
| 責務     | `skill:evaluate-safety` IPC ハンドラ登録          |
| 依存     | BrowserWindow, DefaultSafetyGate, IPC_CHANNELS    |
| 推定行数 | 40-60行                                           |

**エクスポート一覧:**

| エクスポート名               | 種類     | 説明                 |
| ---------------------------- | -------- | -------------------- |
| `registerSafetyGateHandlers` | function | IPC ハンドラ登録関数 |

### 1-4. IPC ハンドラテスト

| 項目           | 値                                                               |
| -------------- | ---------------------------------------------------------------- |
| パス           | `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.test.ts` |
| 責務           | IPC ハンドラの単体テスト（バリデーション・送信元検証）           |
| テストケース数 | 約7-10件                                                         |

## 2. 修正ファイル

### 2-1. channels.ts

| 項目           | 値                                                                        |
| -------------- | ------------------------------------------------------------------------- |
| パス           | `apps/desktop/src/preload/channels.ts`                                    |
| 変更内容       | `SKILL_EVALUATE_SAFETY: "skill:evaluate-safety"` を `IPC_CHANNELS` に追加 |
| 追加位置       | SKILL 系チャンネル群の末尾                                                |
| ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` に追加                                          |

### 2-2. index.ts（IPC 登録）

| 項目     | 値                                                    |
| -------- | ----------------------------------------------------- |
| パス     | `apps/desktop/src/main/ipc/index.ts`                  |
| 変更内容 | `registerSafetyGateHandlers` の import と呼び出し追加 |
| 追加位置 | Permission Store ハンドラ登録の近辺                   |
| 依存注入 | mainWindow, DefaultSafetyGate インスタンス            |

## 3. 前提ファイル（変更不要・参照のみ）

| パス                                            | 提供する型・定数                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/shared/src/constants/security.ts`     | TOOL_RISK_CONFIG, ToolRiskLevel, ToolRiskConfig                                 |
| `packages/shared/src/types/permission-store.ts` | IPermissionStore                                                                |
| `packages/shared/src/types/safety-gate.ts`      | SafetyGatePort, SafetyGateResult, SafetyCheckDetail, SafetyGrade, SafetyCheckId |
| `apps/desktop/src/main/ipc/validation.ts`       | validateString（参考パターン）                                                  |

## 4. ファイル間依存関係図

```
packages/shared/
  constants/security.ts ──────────────────┐
  types/safety-gate.ts ──────────────┐    │
  types/permission-store.ts ─────┐   │    │
                                 │   │    │
apps/desktop/src/main/           │   │    │
  permissions/                   │   │    │
    default-safety-gate.ts ◄─────┴───┴────┘
    default-safety-gate.test.ts ◄── default-safety-gate.ts
                                 │
  ipc/                           │
    safetyGateHandlers.ts ◄──────┘
    __tests__/safetyGateHandlers.test.ts ◄── safetyGateHandlers.ts
    index.ts ◄── safetyGateHandlers.ts (import)
                                 │
apps/desktop/src/preload/        │
  channels.ts ◄──────────────────┘ (SKILL_EVALUATE_SAFETY)
```
