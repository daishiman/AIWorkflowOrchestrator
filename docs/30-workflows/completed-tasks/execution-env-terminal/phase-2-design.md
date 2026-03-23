# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

`ExecutionEnvironment.terminal` 本実装と `assertNoSilentFallback` ガードのアーキテクチャ・インターフェース設計を行う。

## 設計概要

本タスクは 3 つの Concern に分解される:

| Concern | 名称                          | 所有層   | 責務                                                |
| ------- | ----------------------------- | -------- | --------------------------------------------------- |
| C-1     | Terminal 環境本実装           | Renderer | placeholder → `TerminalHandoffCard` 表示への移行    |
| C-2     | assertNoSilentFallback ガード | Main     | LLM 呼び出し前の Provider/Model 未選択検出          |
| C-3     | 未選択時エラー表示            | Renderer | ユーザーへのエラーフィードバック + 設定画面遷移 CTA |

## 依存関係

```
C-2 (assertNoSilentFallback) ← C-1 (terminal 本実装)
                              ← C-3 (エラー表示)
```

C-2 が基盤であり、C-1・C-3 は C-2 に依存する。

## C-1: Terminal 環境本実装

### 変更対象ファイル

| ファイル                                                                        | 変更内容                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | `case "terminal"` の placeholder → `TerminalHandoffCard` 表示 |

### 現在の実装（L140-162）

```typescript
case "terminal":
  return <Placeholder {...PLACEHOLDER_CONFIG.terminal} />;
```

### 設計後の実装

```typescript
case "terminal":
  if (!handoffGuidance) {
    return (
      <EmptyState
        title="ターミナル環境"
        description="HandoffGuidance が利用可能になると、ここにターミナル操作ガイドが表示されます"
        testId="terminal-empty-state"
      />
    );
  }
  return (
    <TerminalHandoffCard
      guidance={handoffGuidance}
      testId="terminal-handoff-card"
    />
  );
```

### Props 拡張

`ExecutionEnvironmentProps` に `handoffGuidance` を追加:

```typescript
export interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  handoffGuidance?: HandoffGuidance | null; // NEW: terminal 用
  onRefresh?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

### EmptyState コンポーネント

既存の `Placeholder` を再利用するか、terminal 用のカスタム empty state を作成する。設計上は `Placeholder` の title/subtitle を変更して再利用する方針（新コンポーネント不要）:

```typescript
case "terminal":
  if (!handoffGuidance) {
    return (
      <Placeholder
        iconPath={PLACEHOLDER_CONFIG.terminal.iconPath}
        title="ターミナル環境"
        subtitle="実行コンテキストを待機中..."
        testId="terminal-waiting"
      />
    );
  }
  return (
    <TerminalHandoffCard
      guidance={handoffGuidance}
      testId="terminal-handoff-card"
    />
  );
```

## C-2: assertNoSilentFallback ガード

### 配置先

| ファイル                                         | 責務             |
| ------------------------------------------------ | ---------------- |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts` | ガード関数の定義 |

### インターフェース設計

```typescript
/**
 * P62 対策: Provider/Model 未選択時に DEFAULT_CONFIG への暗黙 fallback を防止する。
 * LLM 呼び出し前の全エントリポイントで呼び出すこと。
 *
 * @throws {LLMConfigNotSelectedError} Provider/Model が未選択の場合
 * @returns 選択済みの LLM 設定（non-null 保証）
 */
export function assertNoSilentFallback(): SelectedLLMConfig {
  const config = currentConfig;
  if (config === null) {
    throw new LLMConfigNotSelectedError(
      "LLM Provider/Model が選択されていません。設定画面で選択してください。",
    );
  }
  return config;
}
```

### エラー型

```typescript
export class LLMConfigNotSelectedError extends Error {
  readonly code = "LLM_CONFIG_NOT_SELECTED" as const;

  constructor(message: string) {
    super(message);
    this.name = "LLMConfigNotSelectedError";
  }
}
```

### ガード適用箇所

`grep -rn "getSelectedLLMConfig" apps/desktop/src/main/` で特定した全てのエントリポイントで `assertNoSilentFallback()` を使用する。具体的な適用箇所は Phase 4（テスト作成）で確定する。

### 設計判断

| 判断事項                | 決定                             | 理由                                                               |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------ |
| 同期 vs 非同期          | 同期（NFR-1）                    | `currentConfig` は in-memory。await 忘れリスクを排除               |
| 戻り値型                | `SelectedLLMConfig`（non-null）  | 呼び出し元で null チェック不要になる                               |
| エラー型                | カスタムエラークラス             | `instanceof` で判別可能、エラーコード付き                          |
| ガード配置              | `llmConfigProvider.ts` に同居    | `currentConfig` と同じモジュールスコープでアクセス                 |
| DEFAULT_CONFIG コメント | 削除せずコメントアウトのまま維持 | 将来の参照用として残す設計意図を尊重（ガードで実質的に無効化済み） |

## C-3: 未選択時エラー表示

### 設計方針

`assertNoSilentFallback()` が throw した `LLMConfigNotSelectedError` を IPC レスポンスとして Renderer に返却する。Renderer 側では `TerminalHandoffCard` の代わりにエラー状態を表示する。

### エラーレスポンス形式

IPC レスポンスの wrapper 形式（P60 対策）に準拠:

```typescript
{
  success: false,
  error: {
    code: "LLM_CONFIG_NOT_SELECTED",
    message: "LLM Provider/Model が選択されていません。設定画面で選択してください。"
  }
}
```

### Renderer 側のエラー表示

`ExecutionEnvironment.terminal` のエラー状態は、既存の `Placeholder` コンポーネントを使用してエラーメッセージ + 設定画面遷移 CTA を表示する:

```typescript
// エラー状態（Provider/Model 未選択）
<div data-testid="terminal-config-error">
  <Placeholder
    iconPath={ERROR_ICON_PATH}
    title="LLM 設定が必要です"
    subtitle="Provider と Model を選択してください"
  />
  <button onClick={navigateToSettings}>
    設定画面を開く
  </button>
</div>
```

## セキュリティチェックリスト

| チェック項目                           | 対応方針                                                       | Pitfall |
| -------------------------------------- | -------------------------------------------------------------- | ------- |
| P62: DEFAULT_CONFIG fallback 禁止      | `assertNoSilentFallback()` で null 時に throw                  | P62     |
| P42: IPC 文字列引数 3 段バリデーション | 本タスクで新規 IPC ハンドラは追加しないため該当なし            | P42     |
| P44: IPC インターフェース整合          | 既存ハンドラの変更なし                                         | P44     |
| エラーメッセージに内部情報を含めない   | `LLMConfigNotSelectedError` のメッセージはユーザー向け文言のみ | -       |

## 影響範囲分析

### 変更ファイル

| ファイル                                                       | 変更種別 | 内容                                  |
| -------------------------------------------------------------- | -------- | ------------------------------------- |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`               | 追加     | `assertNoSilentFallback()` + エラー型 |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/index.tsx` | 変更     | terminal case の placeholder → 本実装 |

### 新規ファイル

| ファイル                                                                         | 内容                      |
| -------------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`             | ガードの unit test        |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/__tests__/terminal.test.tsx` | terminal 表示の unit test |

### 変更なし（既存再利用）

| ファイル                                                           | 理由                             |
| ------------------------------------------------------------------ | -------------------------------- |
| `apps/desktop/src/renderer/.../TerminalHandoffCard/`               | 既存コンポーネントをそのまま使用 |
| `packages/shared/src/types/handoff.ts`                             | `HandoffGuidance` 型変更なし     |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`  | 分岐ロジック変更なし             |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` | DTO 構築ロジック変更なし         |

## 参照資料

| 資料名                         | パス                                                                                                                           | 説明                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Phase 1 要件定義               | `docs/30-workflows/execution-env-terminal/phase-1-requirements.md`                                                             | 本タスクの要件定義                    |
| design-summary.md              | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md` | Terminal Handoff Surface 設計サマリー |
| interfaces-agent-sdk-skill-ref | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md`              | Agent SDK Skill 仕様                  |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                       | 内容                       |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------- |
| error-handling.md      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`      | エラーハンドリング設計原則 |
| security-principles.md | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | セキュリティ設計原則       |

## 統合テスト連携

| テスト対象                           | テスト種別     | 検証内容                             |
| ------------------------------------ | -------------- | ------------------------------------ |
| `assertNoSilentFallback()`           | unit test      | null 時の throw、non-null 時の戻り値 |
| `ExecutionEnvironment` terminal case | component test | TerminalHandoffCard 表示、空状態表示 |
| `LLMConfigNotSelectedError`          | unit test      | エラーコード、instanceof 判定        |

## 成果物

| 成果物 | パス                                                         | 説明           |
| ------ | ------------------------------------------------------------ | -------------- |
| 設計書 | `docs/30-workflows/execution-env-terminal/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] C-1〜C-3 の設計が完了している
- [ ] `assertNoSilentFallback()` のインターフェース設計が定義されている
- [ ] `LLMConfigNotSelectedError` のエラー型設計が定義されている
- [ ] `ExecutionEnvironment` の Props 拡張が設計されている
- [ ] 影響範囲分析（変更/新規/変更なしファイル一覧）が完了している
- [ ] セキュリティチェックリスト（P62 対策）が確認されている
- [ ] IPC レスポンス wrapper 形式（P60 対策）が設計に反映されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビュー
