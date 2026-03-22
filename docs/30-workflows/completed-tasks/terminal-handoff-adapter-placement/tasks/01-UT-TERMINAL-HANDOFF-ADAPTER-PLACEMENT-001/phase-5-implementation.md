# Phase 5: 実装

## メタ情報

| 項目          | 内容                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                                         |
| 機能名        | terminal-handoff-adapter-placement (UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001)                                            |
| 作成日        | 2026-03-22                                                                                                                |
| 担当          | -                                                                                                                         |
| ステータス    | 未着手                                                                                                                    |
| 前Phase成果物 | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-4-test.md` |

## 目的

Phase 4 で作成したテスト（Red 状態）を Green（全 PASS）にするための実装を行う。`toHandoffGuidance` adapter 関数を `apps/desktop/src/main/adapters/handoff/` に配置し、Discriminated Union（`HandoffSource`）を受け取って `HandoffGuidance` を返す純粋関数として実装する。既存の `TerminalHandoffBuilder`（chat-edit / runtime）は維持し、破壊的変更を加えない。

## 実行タスク

### タスク0: 実装前の現状確認（P50対策）

```bash
# adapter ディレクトリが既に存在するか確認
find apps/desktop/src/main/adapters -type d 2>/dev/null

# 既存の HandoffGuidance 型定義を確認
grep -rn "HandoffGuidance" apps/desktop/src/ 2>/dev/null

# 既存の TerminalHandoffBuilder の構造を確認（破壊的変更禁止の前提確認）
cat apps/desktop/src/main/chat-edit/TerminalHandoffBuilder.ts 2>/dev/null | head -30
cat apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts 2>/dev/null | head -30

# HandoffBlock.tsx の現在の型import元を確認（FR-06対策）
grep -n "import.*HandoffGuidance\|interface.*HandoffGuidance\|type.*HandoffGuidance" \
  apps/desktop/src/renderer/components/chat/HandoffBlock.tsx 2>/dev/null
```

### タスク1: types.ts の作成（Discriminated Union 型定義）

**対象ファイル**: `apps/desktop/src/main/adapters/handoff/types.ts`

```typescript
import type { HandoffGuidance } from "@repo/shared/types";
import type { SendWithContextRequest } from "../../services/chat-edit/types";

/**
 * HandoffSource Discriminated Union
 *
 * 4種の呼び出し元（surface）から toHandoffGuidance adapter への入力型。
 * `kind` フィールドで判別し、kind 別に必要なフィールドが異なる。
 */

/** Chat Edit 画面からの handoff */
export interface ChatEditHandoffSource {
  readonly kind: "chat-edit";
  readonly request: SendWithContextRequest;
}

/** Agent 実行からの handoff（既存 AgentHandoffBuildRequest と一致） */
export interface AgentHandoffSource {
  readonly kind: "agent";
  readonly skillId?: string;
  readonly prompt?: string;
  readonly workingDirectory?: string;
}

/** Skill 実行からの handoff（既存 SkillHandoffBuildRequest と一致） */
export interface SkillHandoffSource {
  readonly kind: "skill";
  readonly skillName?: string;
  readonly skillId?: string;
  readonly prompt?: string;
  readonly workingDirectory?: string;
}

/** Bundle（プロンプトバンドル）からの handoff */
export interface BundleHandoffSource {
  readonly kind: "bundle";
  readonly launcher: string;
  readonly promptBundle: string;
}

/** Discriminated Union: 4種の HandoffSource */
export type HandoffSource =
  | ChatEditHandoffSource
  | AgentHandoffSource
  | SkillHandoffSource
  | BundleHandoffSource;

// HandoffGuidance 型は @repo/shared/types から re-export
export type { HandoffGuidance };
```

### タスク2: toHandoffGuidance.ts の作成（adapter 関数本体）

**対象ファイル**: `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`

adapter 関数と内部ヘルパー関数の構成:

```typescript
import type { HandoffSource, HandoffGuidance } from "./types";

/**
 * shell injection 対策: 4種エスケープ
 * - $ 変数展開
 * - バッククォート（コマンド置換）
 * - ダブルクォート
 * - シングルクォート
 */
function sanitizeForShell(input: string): string {
  return input
    .replace(/\\/g, "\\\\") // バックスラッシュを先にエスケープ
    .replace(/'/g, "'\\''") // シングルクォート
    .replace(/"/g, '\\"') // ダブルクォート
    .replace(/`/g, "\\`") // バッククォート
    .replace(/\$/g, "\\$"); // $ 変数展開
}

/**
 * 機密情報のサニタイズ
 * - API キーパターン（sk-xxx, key-xxx 等）を除外
 * - Bearer トークン等を除外
 */
function redactSecrets(input: string): string {
  return input
    .replace(/sk-[a-zA-Z0-9]{10,}/g, "[REDACTED]")
    .replace(/key-[a-zA-Z0-9]{10,}/g, "[REDACTED]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]");
}

/** kind 別 build: chat-edit */
function buildFromChatEdit(
  source: ChatEditHandoffSource,
  reason: string,
): HandoffGuidance {
  // ...実装
}

/** kind 別 build: agent */
function buildFromAgent(
  source: AgentHandoffSource,
  reason: string,
): HandoffGuidance {
  // ...実装
}

/** kind 別 build: skill */
function buildFromSkill(
  source: SkillHandoffSource,
  reason: string,
): HandoffGuidance {
  // ...実装
}

/** kind 別 build: bundle */
function buildFromBundle(
  source: BundleHandoffSource,
  reason: string,
): HandoffGuidance {
  // ...実装
}

/**
 * HandoffSource -> HandoffGuidance adapter 関数
 *
 * Discriminated Union の kind フィールドで分岐し、
 * 適切な build 関数に委譲する純粋関数。
 *
 * @param source - Consumer 固有の入力データ
 * @param reason - handoff になった理由
 * @returns HandoffGuidance
 */
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
    default: {
      // exhaustive check: 未知の kind が追加された場合にコンパイルエラーにする
      const _exhaustive: never = source;
      throw new Error(
        `Unknown HandoffSource kind: ${JSON.stringify(_exhaustive)}`,
      );
    }
  }
}
```

**実装上の注意点**:

- `toHandoffGuidance` は純粋関数として実装し、副作用を持たない
- `sanitizeForShell` は全 kind の terminalCommand 生成時に共通適用する
- `redactSecrets` は prompt 由来の文字列を terminalCommand に含める前に適用する
- `contextSummary` には `surface=<kind>` を含めて、どの surface からの handoff かを明示する
- exhaustive check により、将来新しい kind が追加された場合にコンパイル時に検出する

### タスク3: index.ts の作成（re-export）

**対象ファイル**: `apps/desktop/src/main/adapters/handoff/index.ts`

```typescript
// adapter 関数
export { toHandoffGuidance } from "./toHandoffGuidance";

// 型定義
export type {
  HandoffSource,
  ChatEditHandoffSource,
  AgentHandoffSource,
  SkillHandoffSource,
  BundleHandoffSource,
  HandoffGuidance,
} from "./types";
```

### タスク4: HandoffBlock.tsx の型 import 元変更（FR-06）

**対象ファイル**: `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`

#### 事前調査: HandoffBlock.tsx の波及確認

```bash
# HandoffBlock.tsx から HandoffGuidance を import している他ファイルの確認
grep -rn "import.*HandoffGuidance.*from.*HandoffBlock" apps/desktop/src/
grep -rn "import.*from.*HandoffBlock" apps/desktop/src/
```

HandoffBlock.tsx 内でローカルに定義されている `HandoffGuidance` 型（または同等のインターフェース）を、`@repo/shared` または `apps/desktop/src/main/adapters/handoff/types.ts` からの import に置換する。

```bash
# 現在のローカル型定義を確認
grep -n "interface\|type" apps/desktop/src/renderer/components/chat/HandoffBlock.tsx 2>/dev/null
```

**注意**: Renderer から Main Process のモジュールを直接 import することは禁止されている（01-architecture.md のレイヤー依存方向ルール）。HandoffGuidance 型が Renderer 側で必要な場合は、以下のいずれかで対応する:

1. `packages/shared` に型定義を配置し、Main/Renderer 両方から参照する
2. Preload bridge 経由で型のみを共有する

Phase 5 実行時に、タスク0 の調査結果を踏まえて最適な方式を選択する。

### タスク5: MN-1 対応（Skill Docs Consumer の TODO コメント追加）

Consumer C4（Skill Docs）は未実装のため、adapter 関数内に TODO コメントを追加する。

```typescript
// TODO: [MN-1] Skill Docs Consumer (C4) の handoff source 追加
// - Skill Docs 画面からの handoff 起点が実装された時点で、
//   SkillDocsHandoffSource を HandoffSource union に追加する
// - 対応する buildFromSkillDocs 関数を実装する
// - 関連タスク: C4 Skill Docs Consumer
```

### タスク6: テスト実行で Green 確認

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# toHandoffGuidance のテスト実行
pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts

# 既存テストへの影響確認（リグレッション防止）
pnpm vitest run src/main/chat-edit/
pnpm vitest run src/main/runtime/
```

## 参照資料

### システム仕様

| 資料名                     | パス                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                          |
| セキュリティルール         | `.claude/rules/04-electron-security.md`                                                     |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| TerminalHandoffBuilder DTO | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`              |

### 前Phase成果物

| 資料名             | パス                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト設計 | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-4-test.md` |

### 関連ソースコード

| ファイル                         | パス                                                          | 操作         |
| -------------------------------- | ------------------------------------------------------------- | ------------ |
| types.ts（新規）                 | `apps/desktop/src/main/adapters/handoff/types.ts`             | 新規作成     |
| toHandoffGuidance.ts（新規）     | `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts` | 新規作成     |
| index.ts（新規）                 | `apps/desktop/src/main/adapters/handoff/index.ts`             | 新規作成     |
| HandoffBlock.tsx（既存・修正）   | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`  | 型import変更 |
| Chat Edit TerminalHandoffBuilder | `apps/desktop/src/main/chat-edit/TerminalHandoffBuilder.ts`   | 変更なし     |
| Runtime TerminalHandoffBuilder   | `apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts`     | 変更なし     |

**注意**: コード成果物は `apps/desktop/src/` 配下に配置する。`outputs/` ディレクトリには配置しない。

### 既知の落とし穴

| 落とし穴ID | 説明                              | 対策                                                    |
| ---------- | --------------------------------- | ------------------------------------------------------- |
| P42        | .trim() バリデーション漏れ        | sanitizeForShell 内で入力文字列の trim を考慮する       |
| P50        | 既実装防御の発見による Phase 転換 | タスク0のチェックを必ず実施する                         |
| P55        | 正規表現メタ文字を含むパス        | redactSecrets の正規表現でメタ文字をエスケープする      |
| P40        | テスト実行ディレクトリ依存        | `apps/desktop` ディレクトリからテストを実行する         |
| P23        | API 二重定義の型管理複雑性        | HandoffGuidance 型は types.ts に一元化し re-export する |
| P32        | 型定義の二箇所同時更新必須        | FR-06 で HandoffBlock の型を共有元に切り替える          |

## 実行手順

1. **タスク0の実施**: P50チェックを行い、既実装状況と既存コードを確認する
2. **タスク1の実施**: types.ts に Discriminated Union 型定義を作成する
3. **タスク2の実施**: toHandoffGuidance.ts に adapter 関数と sanitize / redact ヘルパーを実装する
4. **タスク3の実施**: index.ts に re-export を追加する
5. **タスク4の実施**: HandoffBlock.tsx のローカル型定義を共有型の import に置換する（FR-06）
6. **タスク5の実施**: MN-1 対応として TODO コメントを追加する
7. **タスク6の実施**: 全テスト PASS を確認し、リグレッションを確認する

## 統合テスト連携

- 現行実装（`TerminalHandoffBuilder`）との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 既存の `TerminalHandoffBuilder`（chat-edit / runtime）は変更せず維持する（破壊的変更なし）
- Consumer C5（GuidanceBlock UI）は P23 要修正だが、本タスクのスコープ外。将来の統合タスクで対応する

## 成果物

| 成果物                       | パス                                                                                                                                | 説明                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 5 仕様書（本ファイル） | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-5-implementation.md` | 実装手順書                         |
| types.ts                     | `apps/desktop/src/main/adapters/handoff/types.ts`                                                                                   | Discriminated Union 型定義（新規） |
| toHandoffGuidance.ts         | `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`                                                                       | adapter 関数本体（新規）           |
| index.ts                     | `apps/desktop/src/main/adapters/handoff/index.ts`                                                                                   | re-export（新規）                  |
| HandoffBlock.tsx 更新        | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`                                                                        | 型 import 元変更（FR-06）          |

**注意**: コード成果物は `apps/desktop/src/` 配下に配置する。`outputs/` ディレクトリには配置しない。

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                       | 仕様参照先                                          |
| -------------- | ---------------------------------------------- | --------------------------------------------------- |
| セキュリティ   | shell injection サニタイズ・機密情報除外の実装 | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ | adapter 配置先が Main Process 層内で完結       | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                       | 仕様参照先                                          |
| -------------------- | ------------------------------ | --------------------------------------------------- |
| バックエンド（Main） | adapter 実装は Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## 完了条件

- [ ] タスク0の P50 チェックを実施し、既実装状況を確認した
- [ ] `types.ts` に HandoffSource Discriminated Union と HandoffGuidance 型が定義された
- [ ] `toHandoffGuidance.ts` に adapter 関数が実装された
- [ ] `sanitizeForShell` で4種エスケープ（$, バッククォート, ダブルクォート, シングルクォート）が実装された
- [ ] `redactSecrets` で API キーパターンのサニタイズが実装された
- [ ] `contextSummary` に `surface=<kind>` が含まれている（kind 別に確認）
- [ ] exhaustive check により未知の kind でコンパイルエラーが発生することを確認した
- [ ] `index.ts` に re-export が追加された
- [ ] HandoffBlock.tsx のローカル型定義が共有元の import に置換された（FR-06）
- [ ] MN-1 対応の TODO コメントが追加された
- [ ] T-01 〜 T-08 の全テストが Green（PASS）になった
- [ ] 既存の chat-edit / runtime テストが全て PASS のまま（リグレッションなし）
- [ ] 既存の `TerminalHandoffBuilder` に破壊的変更がないことを `git diff` で確認した

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
