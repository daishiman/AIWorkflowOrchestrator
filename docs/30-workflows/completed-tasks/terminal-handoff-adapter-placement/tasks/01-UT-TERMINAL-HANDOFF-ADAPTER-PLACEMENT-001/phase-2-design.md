# Phase 2: 設計

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

`toHandoffGuidance()` adapter 関数の配置先、インターフェース設計、依存関係を確定する。

## 実行タスク

- 配置先の選定: 3 候補から最適な配置先を選定
- インターフェース設計: adapter 関数のシグネチャと型定義
- 依存関係設計: import パスと依存方向の確定
- 既存コード統合方針: 既存 Builder との関係整理

## 参照資料

| 資料名               | パス                                   | 説明                    |
| -------------------- | -------------------------------------- | ----------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`              | FR/NFR/AC 定義          |
| LLM Adapter パターン | `apps/desktop/src/main/adapters/llm/`  | 既存 adapter 構成の参考 |
| HandoffGuidance 型   | `packages/shared/src/types/handoff.ts` | 統一 DTO 型             |

## 実行手順

### 1. 配置先の選定

#### 候補比較

| #   | 候補                                      | メリット                                        | デメリット                                | 判定     |
| --- | ----------------------------------------- | ----------------------------------------------- | ----------------------------------------- | -------- |
| A   | `packages/shared/src/adapters/handoff/`   | 全パッケージから import 可能                    | shared に Main Process 依存ロジックが入る | 不採用   |
| B   | 各 service 内（現状維持）                 | 変更量が最小                                    | 変換ロジックが分散したまま                | 不採用   |
| C   | `apps/desktop/src/main/adapters/handoff/` | 既存パターン踏襲、Main 層の責務に一致、集約可能 | desktop アプリ専用                        | **採用** |

#### 選定理由（候補 C）

1. **既存パターンとの一貫性**: `adapters/llm/` と同階層に配置され、adapter 層の凝集度が向上する
2. **依存方向の正しさ**: `Main → shared` の一方向依存を維持。shared に Main 依存ロジックを入れない
3. **Consumer 集約**: C1-C3 の全変換ロジックを 1 モジュールに集約可能
4. **import サイクル回避**: `adapters/handoff/` → `packages/shared/types` の単方向依存のみ

### 2. ディレクトリ構成

```text
apps/desktop/src/main/adapters/
  handoff/
    index.ts                      # re-export
    toHandoffGuidance.ts          # adapter 関数本体
    types.ts                      # adapter 固有の型定義（入力型の union）
    __tests__/
      toHandoffGuidance.test.ts   # ユニットテスト
```

### 3. インターフェース設計

#### 3.1 adapter 関数シグネチャ

```typescript
// apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts

import type { HandoffGuidance } from "@repo/shared/types";
import type { HandoffSource } from "./types";

/**
 * 各 Consumer の入力を HandoffGuidance 統一 DTO に変換する。
 *
 * @param source - Consumer 固有の入力データ
 * @param reason - handoff になった理由
 * @returns HandoffGuidance
 */
export function toHandoffGuidance(
  source: HandoffSource,
  reason: string,
): HandoffGuidance;
```

#### 3.2 入力型定義（Discriminated Union）

```typescript
// apps/desktop/src/main/adapters/handoff/types.ts

import type { SendWithContextRequest } from "../../services/chat-edit/types";

/**
 * Chat Edit consumer からの入力
 */
export interface ChatEditHandoffSource {
  kind: "chat-edit";
  request: SendWithContextRequest;
}

/**
 * Agent 実行 consumer からの入力
 */
export interface AgentHandoffSource {
  kind: "agent";
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
}

/**
 * Skill 実行 consumer からの入力
 */
export interface SkillHandoffSource {
  kind: "skill";
  skillName?: string;
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
}

/**
 * TerminalHandoffBundle からの変換（汎用）
 */
export interface BundleHandoffSource {
  kind: "bundle";
  launcher: string;
  promptBundle: string;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}

/**
 * Discriminated Union: 全 Consumer の入力型
 */
export type HandoffSource =
  | ChatEditHandoffSource
  | AgentHandoffSource
  | SkillHandoffSource
  | BundleHandoffSource;
```

#### 3.3 変換ロジック設計（kind 別分岐）

```typescript
export function toHandoffGuidance(
  source: HandoffSource,
  reason: string,
): HandoffGuidance {
  switch (source.kind) {
    case "chat-edit":
      return buildFromChatEdit(source, reason);
    case "agent":
      return buildFromAgent(source, reason);
    case "skill":
      return buildFromSkill(source, reason);
    case "bundle":
      return buildFromBundle(source, reason);
    default:
      // exhaustive check
      const _exhaustive: never = source;
      throw new Error(
        `Unknown handoff source kind: ${(_exhaustive as HandoffSource).kind}`,
      );
  }
}
```

### 4. 既存コードとの統合方針

#### 4.1 段階的移行（破壊的変更なし）

既存の `TerminalHandoffBuilder` クラスは**そのまま維持**し、adapter 関数は**新規追加**とする:

| ステップ | 内容                                                     | 破壊的変更 |
| -------- | -------------------------------------------------------- | ---------- |
| Step 1   | `adapters/handoff/` に adapter 関数を新規作成            | なし       |
| Step 2   | adapter 内部で既存 Builder のロジックを再利用            | なし       |
| Step 3   | `HandoffBlock.tsx` の型 import 元を変更                  | 軽微       |
| Step 4   | 将来的に Builder を adapter に委譲（本タスクスコープ外） | -          |

#### 4.2 既存 Builder との依存関係

```text
adapters/handoff/toHandoffGuidance.ts
  ├── packages/shared/types/handoff.ts      (HandoffGuidance 型)
  ├── services/chat-edit/types.ts           (SendWithContextRequest 型のみ)
  └── (内部ロジック: Builder と同等の変換を実装)

※ Builder クラスへの直接依存は作らない（密結合回避）
```

#### 4.3 `HandoffBlock.tsx` の型統一

```typescript
// Before（P23 リスク）
export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

// After（正本 import）
import type { HandoffGuidance } from "@repo/shared/types";
// ローカル型定義を削除
```

### 5. セキュリティ設計

#### 5.1 terminalCommand のサニタイズ

adapter 関数内で以下のサニタイズを実施する（既存 Builder の `sanitizePrompt` と同等）:

| サニタイズ対象   | 処理               | 理由                 |
| ---------------- | ------------------ | -------------------- |
| バックスラッシュ | `\` → `\\`         | シェルエスケープ     |
| ダブルクォート   | `"` → `\"`         | コマンド引数の安全性 |
| 変数展開         | `$` → `\$`         | shell injection 防止 |
| バッククォート   | `` ` `` → `` \` `` | コマンド置換防止     |

#### 5.2 機密情報の除外

- API キー、トークン、パスワードを `terminalCommand` に含めない
- `contextSummary` にユーザーの PII を含めない
- テストケースで機密情報の非含有を検証する

### 6. IPC レスポンス形式

adapter の出力 `HandoffGuidance` は IPC 経由で Renderer に転送される。レスポンス形式:

```typescript
// IPC レスポンス wrapper
{
  success: true,
  data: {
    handoff: HandoffGuidance  // adapter の出力
  }
}
```

## 統合テスト連携（Phase 2）

- 設計段階のため統合テストの実行はなし
- Phase 4 のテスト設計で統合テストのシナリオを定義する

## 多角的チェック観点

| 観点           | チェック項目                                 | 結果 |
| -------------- | -------------------------------------------- | ---- |
| アーキテクチャ | adapter 配置先が Main Process 層内で完結     | 適合 |
| セキュリティ   | サニタイズ処理が設計に含まれている           | 適合 |
| DIP            | adapter が具象クラスではなく型に依存している | 適合 |

## 成果物

| 成果物 | パス                                | 説明           |
| ------ | ----------------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design-summary.md` | 本ドキュメント |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 配置先の選定・ディレクトリ構成定義
3. インターフェース設計（シグネチャ・型定義）
4. 既存コード統合方針の策定
5. セキュリティ設計
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 2
```

## 完了条件

- [ ] 配置先が候補比較を経て確定している（候補 C 採用）
- [ ] ディレクトリ構成が定義されている
- [ ] adapter 関数のシグネチャが定義されている
- [ ] 入力型（Discriminated Union）が設計されている
- [ ] 既存コードとの統合方針が明確である
- [ ] セキュリティ設計（サニタイズ、機密除外）が含まれている
- [ ] IPC レスポンス形式が定義されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビュー
