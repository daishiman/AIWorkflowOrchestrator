# Phase 5 実装 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                    |
| Phase      | 5 - 実装                                                                       |
| ステータス | 未着手                                                                         |
| 前提 Phase | Phase 4 完了（`outputs/phase-4/` の全テストファイルが Red 状態で存在すること） |
| 成果物     | 各実装対象ファイルへの変更（下記「成果物テーブル」参照）                       |
| 次 Phase   | Phase 6 テスト拡充                                                             |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを `grep -n "^import" <対象テスト>.test.ts` で確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Phase 4 で作成した Red テスト（T-01〜T-20）を Green にするプロダクションコードを実装する。GAP C-02・C-03・C-07・D-02 を解消し、terminal handoff 5契約（TH-01〜TH-05）を全て満たす状態にする。

## 実装制約

以下の制約を全ての実装タスクで厳守すること。

| 制約                                                                                | 根拠                                           |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| Renderer から TerminalHandoffBuilder を直接 import しない                           | `01-architecture.md` レイヤー依存方向          |
| IPC チャンネル名はホワイトリスト定数で管理する                                      | `04-electron-security.md` IPC セキュリティ原則 |
| non-null assertion (`!`) を使用しない                                               | P48 準拠                                       |
| `as` キャストによるバリデーション回避をしない                                       | P19・P49 準拠                                  |
| 文字列引数は3段バリデーション（型チェック → 空文字列 → `.trim() === ""`）を適用する | P42 準拠                                       |
| IPC ハンドラ登録関数の引数型はインターフェースを使用する                            | P61 DIP 準拠                                   |

## 実行タスク

### Task 5-1: SkillLifecyclePanel Terminal ボタン追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**変更内容**:

1. `L419-435` の `flex flex-wrap gap-2` ボタン群の右端（「一覧へ戻る」ボタンの右側、ボタン群の最右端）に Terminal ボタンを追加する
2. スタイルは `lifecycleButtonStyles.subtle` を適用する（「一覧へ戻る」と同等の視覚的重み）
3. `data-testid="skill-lifecycle-open-terminal"` を付与する
4. ボタンラベルは `"Terminal"` で固定する（フェーズごとに変更しない）
5. `onClick` ハンドラで以下を実行する:
   - 内部状態からフェーズを導出して `surface` 種別を決定する:
     - `createdSkillName === null` → create フェーズ相当
     - `shouldShowStreaming === true` → execute フェーズ相当（IPC 経由で `buildForSkillExecution()` を呼び出す）
     - `creatorImproveResult` が非 null → improve フェーズ相当（IPC 経由で `buildForSkillImprovement()` を呼び出す）
   - `HandoffGuidance` オブジェクトをインラインで組み立てる（Renderer 側で完結させ、IPC 経由での組み立ては Task 5-4 で対応）
   - `setHandoffGuidance(guidance)` を呼び出して状態を更新する
   - `reason` は固定値 `"ユーザー操作による terminal 起動"` とする

**インポートに追加するもの**:

- `useSetHandoffGuidance` セレクタ（`store/index.ts` の既存セレクタを使用）

**実装禁止事項**:

- `TerminalHandoffBuilder` の直接 import は禁止（アーキテクチャ違反）
- ボタンのラベルをフェーズ別に変更することは禁止（UX 禁止事項 L71）

### Task 5-2: TerminalHandoffCard 埋め込み

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**変更内容**:

1. ファイル先頭の import に `TerminalHandoffCard` を追加する:

   ```
   import { TerminalHandoffCard } from "../organisms/TerminalHandoffCard/TerminalHandoffCard";
   ```

   （実際のパスは `TerminalHandoffCard.tsx` の配置を確認してから記述すること）

2. `useHandoffGuidance` と `useClearHandoffGuidance` セレクタを `store/index.ts` から import する（L805-812 の既存セレクタを使用し、新規セレクタの追加は行わない）

3. Phase 情報グリッド（`md:grid-cols-4` 領域、`L438` 以降）の直下、次のアクションボタン領域の直前に、以下の条件付きレンダリングを追加する:

   ```tsx
   {
     handoffGuidance !== null && (
       <div data-testid="skill-lifecycle-terminal-handoff-card">
         <TerminalHandoffCard
           guidance={handoffGuidance}
           onCopyCommand={() =>
             navigator.clipboard.writeText(handoffGuidance.terminalCommand)
           }
           onDismiss={clearHandoffGuidance}
         />
       </div>
     );
   }
   ```

4. `data-testid="skill-lifecycle-terminal-handoff-card"` は TerminalHandoffCard の wrapper div に付与する（コンポーネント内部の data-testid とは別）

**props マッピング**:

| TerminalHandoffCard props  | 供給元                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| `guidance.terminalCommand` | `handoffGuidance.terminalCommand`                                      |
| `guidance.contextSummary`  | `handoffGuidance.contextSummary`                                       |
| `guidance.reason`          | `handoffGuidance.reason`                                               |
| `onCopyCommand`            | `() => navigator.clipboard.writeText(handoffGuidance.terminalCommand)` |
| `onDismiss`                | `clearHandoffGuidance`                                                 |

**実装禁止事項**:

- `handoffGuidance!.terminalCommand` のような non-null assertion 禁止（P48）
- `handoffGuidance as HandoffGuidance` のような型キャスト禁止（P49）

### Task 5-3: buildForSkillImprovement() 実装

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

**変更内容**:

1. ファイル先頭（または既存インターフェース定義の直後）に `SkillImprovementHandoffRequest` インターフェースを追加する:

   ```typescript
   export interface SkillImprovementHandoffRequest {
     skillName?: string;
     skillId?: string;
     prompt?: string;
     workingDirectory?: string;
     improvementSummary?: string;
     improvementCount?: number;
   }
   ```

2. クラスに `buildForSkillImprovement()` メソッドを追加する:

   **メソッドシグネチャ**:

   ```typescript
   buildForSkillImprovement(
     request: SkillImprovementHandoffRequest,
     reason: string,
   ): HandoffGuidance
   ```

   **skillToken 決定ロジック（P42 準拠3段バリデーション）**:
   - `request.skillName` について `typeof === "string"` かつ `!== ""` かつ `.trim() !== ""` を確認する
   - 上記を満たす場合は `request.skillName.trim()` を skillToken とする
   - 満たさない場合は `request.skillId` に対して同じ3段バリデーションを適用する
   - どちらも満たさない場合は `skillToken = "unknown"` とする

   **prompt 生成ロジック**:
   - `request.prompt` が指定されている（3段バリデーション通過）場合: そのまま使用する
   - `request.prompt` が空の場合:
     - `request.improvementSummary` が3段バリデーション通過する場合:
       `「{skillName}」の改善を続けてください。前回の改善点: {improvementSummary}` の形式で生成する
     - `request.improvementSummary` が空の場合:
       `「{skillName}」の改善を続けてください（改善点{improvementCount}件）` の形式で生成する（`improvementCount` が未指定の場合は `0` を使用する）

   **contextSummary フォーマット**:

   ```
   surface=skill skill={skillToken} improve=true
   ```

   **sanitizePrompt() の適用（P55 準拠）**:
   - 生成した prompt 文字列に既存の `sanitizePrompt()` メソッドを適用する
   - `reason` パラメータはメソッド内でハードコードせず、呼び出し元から受け取った値をそのまま使用する

### Task 5-4: IPC ハンドラ登録

**対象ファイル（複数）**:

- `apps/desktop/src/preload/channels.ts`: チャンネル定数追加
- Main Process のハンドラ登録ファイル（`apps/desktop/src/main/handlers/` 配下の適切なファイル）: ハンドラ登録関数追加

#### Step 5-4-1: channels.ts にチャンネル定数を追加する

`apps/desktop/src/preload/channels.ts` に以下の定数を追加する:

```typescript
SKILL_BUILD_IMPROVEMENT_HANDOFF: "skill:buildImprovementHandoff",
```

既存の定数命名規則（`SNAKE_CASE` の定数名、`namespace:camelCase` のチャンネル名）に準拠すること。

#### Step 5-4-2: IPC ハンドラ登録関数を実装する

Main Process の既存ハンドラファイル（`skill:` プレフィックスのチャンネルを扱うファイル）に以下の関数を追加する。

**P61 DIP 準拠**: 引数型は `TerminalHandoffBuilder` の具象クラスではなく、`TerminalHandoffBuilderPort` インターフェース（または同等の抽象型）を使用すること。

**ハンドラのバリデーション（P42 準拠3段バリデーション）**:

`skillName` の検証:

```typescript
if (
  typeof args?.skillName !== "string" ||
  args.skillName === "" ||
  args.skillName.trim() === ""
) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    },
  };
}
```

`improvementSummary` の検証（P42 準拠3段バリデーション）:

```typescript
if (
  typeof args?.improvementSummary !== "string" ||
  args.improvementSummary.trim() === ""
) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "improvementSummary must be a non-empty string",
    },
  };
}
```

**レスポンス形式（P60 準拠 wrapper 形式）**:

```typescript
// 正常系
return { success: true, data: guidance };

// 異常系
return { success: false, error: { code: "VALIDATION_ERROR", message: "..." } };
```

**エラーハンドリング**:

- `buildForSkillImprovement()` が例外を投げた場合は catch して `{ success: false, error: { code: "INTERNAL_ERROR", message: "..." } }` を返す
- 内部エラーメッセージに `os.homedir()` などのパス情報を含めない（P55 準拠）

#### Step 5-4-3: register/unregister ペアの確認

`ipcMain.handle()` で登録したハンドラには対応する `ipcMain.removeHandler()` が `unregisterAllIpcHandlers()` 等のクリーンアップ関数に含まれていることを確認する（P5 対策: リスナー二重登録防止）。

確認コマンド:

```bash
grep -n "removeHandler\|removeAllHandlers\|unregister" apps/desktop/src/main/ -r
```

### Task 5-5: Preload API 接続

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`（または既存の Preload API ファイル）

**変更内容**:

1. `buildImprovementHandoff` メソッドを追加する:

   ```typescript
   buildImprovementHandoff: (args: {
     skillName: string;
     improvementSummary: string;
     improvementCount: number;
     workingDirectory?: string;
   }) => safeInvoke(IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF, args),
   ```

2. チャンネル名は `IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF` 定数を使用する（文字列リテラル `"skill:buildImprovementHandoff"` の直書き禁止、P27 対策）

3. 実装後に `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"` を実行して文字列リテラル使用箇所がないことを確認する

## 参照資料

| 資料                       | パス                                                                                         | 参照目的                                            |
| -------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Phase 4 テストファイル     | `outputs/phase-4/` 配下の全テストファイル                                                    | Green にすべきテストの仕様確認                      |
| Phase 2 設計書             | `outputs/phase-2/design-document.md`                                                         | 実装の根拠となるインターフェース・フロー設計        |
| SkillLifecyclePanel        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 埋め込み位置（L419-435、L438 以降）の確認           |
| TerminalHandoffCard        | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | Props インターフェースの確認                        |
| TerminalHandoffBuilder     | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                           | 既存メソッド・sanitizePrompt() の確認               |
| channels.ts                | `apps/desktop/src/preload/channels.ts`                                                       | 既存定数の命名規則確認・新規定数の追加先            |
| agentSlice                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L179・L408・L1038-1040                | HandoffGuidance 型・setHandoffGuidance の確認       |
| ストアセレクタ             | `apps/desktop/src/renderer/store/index.ts` L805-812                                          | useHandoffGuidance / useClearHandoffGuidance の確認 |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                           | レイヤー依存方向（Renderer→Main 直接 import 禁止）  |
| IPC セキュリティルール     | `.claude/rules/04-electron-security.md`                                                      | チャンネルホワイトリスト管理                        |
| P19・P48・P49 型安全ルール | `.claude/rules/06-known-pitfalls.md`                                                         | non-null assertion・型キャスト禁止                  |
| P27 ハードコード禁止       | `.claude/rules/06-known-pitfalls.md#P27`                                                     | safeInvoke の文字列リテラル禁止                     |
| P42 trim バリデーション    | `.claude/rules/06-known-pitfalls.md#P42`                                                     | 3段バリデーションの実装パターン                     |
| P55 RegExp エスケープ      | `.claude/rules/06-known-pitfalls.md#P55`                                                     | sanitizePrompt() でのパスメタ文字エスケープ         |
| P60 IPC レスポンス形式     | `.claude/rules/06-known-pitfalls.md#P60`                                                     | wrapper 形式レスポンスの実装パターン                |
| P61 DIP 準拠               | `.claude/rules/06-known-pitfalls.md#P61`                                                     | IPC ハンドラ引数型をインターフェースにする根拠      |

## 実行手順

0. **既存テスト回帰確認【必須】**: 実装着手前に既存テストが全 PASS していることを確認する。

   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/components/skill/SkillLifecyclePanel.test.tsx
   cd apps/desktop && pnpm vitest run src/main/services/runtime/TerminalHandoffBuilder.test.ts
   ```

   - 既存テストに失敗がある場合は、先に修正してから Phase 5 を開始する

1. `outputs/phase-4/` の全テストファイルを読み取り、Green にすべきテストケース一覧（T-01〜T-20）を把握する
2. `outputs/phase-2/design-document.md` を読み取り、設計仕様を確認する
3. Task 5-3 を最初に実装する（他の Task の依存元となるため）:
   - `TerminalHandoffBuilder.ts` を読み取り、既存メソッドの構造を確認する
   - `SkillImprovementHandoffRequest` インターフェースと `buildForSkillImprovement()` を実装する
4. Task 5-4 を実装する:
   - `channels.ts` を読み取り、既存定数の命名規則を確認してから `SKILL_BUILD_IMPROVEMENT_HANDOFF` を追加する
   - Main Process の既存ハンドラファイルを特定し（`grep -rn "skill:" apps/desktop/src/main/handlers/`）、ハンドラ登録関数を実装する
5. Task 5-5 を実装する:
   - Preload API ファイルを読み取り、`buildImprovementHandoff` メソッドを追加する
6. Task 5-1 を実装する:
   - `SkillLifecyclePanel.tsx` の L419-435 を読み取り、ボタン群の構造を確認してから Terminal ボタンを追加する
7. Task 5-2 を実装する:
   - `TerminalHandoffCard.tsx` を読み取り、Props インターフェースを確認してから埋め込みコードを追加する
   - `store/index.ts` の L805-812 を読み取り、セレクタ名を確認してから import を追加する
8. `cd apps/desktop && pnpm vitest run outputs/phase-4/` を実行し、T-01〜T-20 が全て Green になることを確認する
9. テスト失敗が残る場合は、該当テストのアサーション内容と実装を照合して修正する
10. `pnpm typecheck` を実行し、型エラーがないことを確認する

## 成果物テーブル

| 成果物                                           | ファイルパス                                                         | 完了条件                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| SkillLifecyclePanel Terminal ボタン              | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | T-01〜T-03 が Green になること                                                              |
| SkillLifecyclePanel TerminalHandoffCard 埋め込み | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | T-04〜T-08 が Green になること                                                              |
| SkillImprovementHandoffRequest インターフェース  | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | `SkillImprovementHandoffRequest` が export されていること                                   |
| buildForSkillImprovement() 実装                  | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | T-09〜T-15 が Green になること                                                              |
| SKILL_BUILD_IMPROVEMENT_HANDOFF 定数             | `apps/desktop/src/preload/channels.ts`                               | 定数が追加され、ホワイトリストに登録されていること                                          |
| skill:buildImprovementHandoff ハンドラ           | Main Process ハンドラファイル                                        | T-16〜T-20 が Green になること                                                              |
| buildImprovementHandoff Preload API              | `apps/desktop/src/preload/skill-api.ts`（または同等ファイル）        | Renderer から `window.electronAPI.skill.buildImprovementHandoff()` 呼び出しが可能であること |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスク（Task 5-1〜5-5）を実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

本 Phase の実装完了は、Phase 4 で作成したテストの Red→Green 転換で検証する。

- Phase 4 テスト（T-01〜T-20）が全て PASS に転じることを実装完了の最低条件とする
- Phase 6 でカバレッジ不足箇所が特定された場合、追加テストと合わせて補完する
- IPC ハンドラ実装（Task 5-4）は Phase 9 の全テスト実行でエンドツーエンド整合を確認する

## 多角的チェック観点

| 観点              | 確認内容                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| レイヤー分離      | Renderer から TerminalHandoffBuilder を直接 import していないこと      |
| DIP 準拠          | IPC ハンドラ登録関数の引数型がインターフェースであること（P61）        |
| secret 非中継     | terminalCommand に API key が含まれないこと                            |
| 3段バリデーション | 全文字列引数に P42 準拠の型→空文字列→trim チェックが適用されていること |

## 完了条件チェックリスト

- [ ] Task 5-1: `SkillLifecyclePanel.tsx` に Terminal ボタンが追加され、`data-testid="skill-lifecycle-open-terminal"` が付与されている
- [ ] Task 5-1: ボタンラベルが `"Terminal"` 固定であり、lifecycle フェーズによって変化しない
- [ ] Task 5-1: ボタンに `lifecycleButtonStyles.subtle` スタイルが適用されている
- [ ] Task 5-1: `onClick` で `setHandoffGuidance` が呼び出され、`reason` が `"ユーザー操作による terminal 起動"` である
- [ ] Task 5-2: `TerminalHandoffCard` が `SkillLifecyclePanel.tsx` に import されている
- [ ] Task 5-2: `handoffGuidance !== null` のときのみカードが表示される条件付きレンダリングが実装されている
- [ ] Task 5-2: `data-testid="skill-lifecycle-terminal-handoff-card"` が付与されている
- [ ] Task 5-2: `onDismiss` が `clearHandoffGuidance` を呼び出している
- [ ] Task 5-3: `SkillImprovementHandoffRequest` インターフェースが定義・export されている
- [ ] Task 5-3: `buildForSkillImprovement()` が skillToken の P42 準拠3段バリデーションを実装している
- [ ] Task 5-3: `contextSummary` が `"surface=skill skill={token} improve=true"` 形式である
- [ ] Task 5-3: `sanitizePrompt()` が生成 prompt に適用されている
- [ ] Task 5-4: `channels.ts` に `SKILL_BUILD_IMPROVEMENT_HANDOFF` 定数が追加されている
- [ ] Task 5-4: IPC ハンドラ登録関数の引数型がインターフェース（P61 DIP 準拠）である
- [ ] Task 5-4: レスポンスが `{ success: boolean, data?, error? }` の wrapper 形式である（P60）
- [ ] Task 5-4: `skillName` と `improvementSummary` の両方に P42 準拠3段バリデーション（`typeof !== "string"` → `=== ""` → `.trim() === ""`）が適用されている
- [ ] Task 5-5: Preload API に `buildImprovementHandoff` メソッドが追加されている
- [ ] Task 5-5: チャンネル名が `IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF` 定数で参照されている（P27）
- [ ] `cd apps/desktop && pnpm vitest run outputs/phase-4/` で T-01〜T-20 が全て Green であること
- [ ] `pnpm typecheck` が 0 エラーで通過していること
- [ ] `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"` の出力が空であること（P27 確認）
- [ ] 実装ファイルに `handoffGuidance!` のような non-null assertion が存在しないこと（P48 確認）

## 次 Phase

Phase 6 テスト拡充 (`phase-6-test-expansion.md`)

- 入力: Phase 5 実装済みのコード、`outputs/phase-4/` のテストファイル
- 目的: カバレッジ不足箇所（境界値・異常系の網羅）のテスト追加
