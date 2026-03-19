# Phase 2 設計 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                               |
| Phase      | 2 - 設計                                                                  |
| ステータス | 未着手                                                                    |
| 前提 Phase | Phase 1 完了（`outputs/phase-1/requirements-analysis.md` が存在すること） |
| 成果物     | `outputs/phase-2/design-document.md`                                      |
| 次 Phase   | Phase 3 設計レビュー                                                      |

## 目的

Phase 1 で確定した terminal handoff 5契約の受入基準をもとに、以下4点の詳細設計を行う。

1. SkillLifecyclePanel ヘッダーへの Terminal ボタン追加設計
2. TerminalHandoffCard の SkillLifecyclePanel 内埋め込み設計
3. `TerminalHandoffBuilder.buildForSkillImprovement()` 新メソッド設計
4. handoffGuidance ストア状態の SkillLifecyclePanel 接続設計

## 実行タスク

### Task 2-1: Terminal ボタン追加設計

`ui-ux-diagrams.md` の画面構成図（L27-36）で `[Terminal]` がヘッダー右端に配置されることを根拠として、以下を設計する。

**配置位置**:

- `SkillLifecyclePanel.tsx` の L419-435 に存在する `flex flex-wrap gap-2` ボタン群の右端（「一覧へ戻る」ボタンの右側、ボタン群の最右端）に追加する
- `data-testid="skill-lifecycle-open-terminal"` を付与する

**スタイル**:

- `lifecycleButtonStyles.subtle` を使用する（「一覧へ戻る」と同等の視覚的重みを維持し、`TH-04` 「固定 Terminal ボタン」の常時可視性を確保する）

**onClick ハンドラ**:

- クリック時に `setHandoffGuidance` を呼び出して手動 handoff を開始する
- handoff 対象の surface は現在の内部状態から導出する:
  - `createdSkillName === null` の場合: create フェーズ相当
  - `shouldShowStreaming === true` の場合: execute フェーズ相当
  - `creatorImproveResult` が非 null の場合: improve フェーズ相当
- handoff の reason 文字列は固定値 `"ユーザー操作による terminal 起動"` とする

**設計制約**:

- ボタンラベルは `Terminal` とし、画面ごとに別名を付けない（`ui-ux-realization.md` L71 UX 禁止事項への準拠）
- ボタンは lifecycle フェーズによらず常に表示する（`TH-04` 契約）

### Task 2-2: TerminalHandoffCard 埋め込み設計

**表示条件**:

- `useHandoffGuidance()` の戻り値（`handoffGuidance: HandoffGuidance | null`）が `null` でない場合のみ表示する
- 表示位置: SkillLifecyclePanel の Phase 情報グリッド（L438 以降の `md:grid-cols-4` 領域）の直下、次のアクションボタン領域の直前
- `data-testid="skill-lifecycle-terminal-handoff-card"` を付与する

**props マッピング**:

| TerminalHandoffCard props  | 供給元                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `guidance.terminalCommand` | `handoffGuidance.terminalCommand`                                                       |
| `guidance.contextSummary`  | `handoffGuidance.contextSummary`                                                        |
| `guidance.reason`          | `handoffGuidance.reason`                                                                |
| `onCopyCommand`            | `navigator.clipboard.writeText(handoffGuidance.terminalCommand)` を呼び出すコールバック |
| `onDismiss`                | `clearHandoffGuidance()` を呼び出すコールバック                                         |

**状態管理**:

- `useHandoffGuidance`・`useClearHandoffGuidance`・`useSetHandoffGuidance` の3セレクタを `store/index.ts` から import する（既存セレクタ L805-812 を使用し、新規追加は行わない）

### Task 2-3: buildForSkillImprovement() 新メソッド設計

`apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` に以下のメソッドを追加する。

**メソッドシグネチャ**:

```typescript
export interface SkillImprovementHandoffRequest {
  skillName?: string;
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
  improvementSummary?: string;  // 前回改善結果の要約（suggestions の要約テキスト）
  improvementCount?: number;    // 改善提案件数
}

buildForSkillImprovement(
  request: SkillImprovementHandoffRequest,
  reason: string,
): HandoffGuidance
```

**実装要件**:

1. `prompt` が指定されていない場合、`improvementSummary` と `skillName` から以下の形式で生成する:
   - 形式: `「{skillName}」の改善を続けてください。前回の改善点: {improvementSummary}`
   - `improvementSummary` が空の場合: `「{skillName}」の改善を続けてください（改善点{improvementCount}件）`
2. `contextSummary` は `surface=skill skill={skillToken} improve=true` の形式とする（改善フェーズであることを明示）
3. `sanitizePrompt()` を適用して shell injection 対策を施す（既存メソッドと同様、P55 準拠）
4. `reason` は呼び出し元から渡す（メソッド内でハードコードしない）

**バリデーション**:

- P42 準拠の3段バリデーション: `typeof === "string"` → `=== ""` → `.trim() === ""`
- `skillName` と `skillId` が両方空の場合、`skillToken` を `"unknown"` とする

### Task 2-4: handoffGuidance ストア状態の接続設計

**接続フロー**:

```
[Terminal ボタン クリック]
        ↓
内部状態からフェーズを導出:
  - createdSkillName === null → create フェーズ相当
  - shouldShowStreaming === true → execute フェーズ相当
  - creatorImproveResult が非 null → improve フェーズ相当
        ↓
TerminalHandoffBuilder（Renderer 側での直接利用 vs IPC 経由）の選択
  - Renderer 側でコマンド文字列を生成 → setHandoffGuidance() で直接セット
  - または: ipc:skill:buildTerminalHandoff を新規追加して Main Process に委譲
        ↓
setHandoffGuidance(guidance) → agentSlice.handoffGuidance が更新
        ↓
TerminalHandoffCard が表示される
```

**選択判断**:

- `TerminalHandoffBuilder` は Main Process のサービスであるため、Renderer 側から直接 import して使用することはアーキテクチャルール違反（`01-architecture.md` レイヤー依存方向）
- Renderer 側では `HandoffGuidance` の組み立てをインライン関数として行い、`setHandoffGuidance()` で状態をセットする
- Main Process での buildForSkillImprovement() は、IPC ハンドラ（`skill:buildImprovementHandoff`）経由で呼び出す

**IPC ハンドラ設計（新規）**:

| 項目           | 内容                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チャンネル     | `skill:buildImprovementHandoff`                                                                                                                                                                              |
| 引数           | `{ skillName: string; improvementSummary: string; improvementCount: number; workingDirectory?: string }`                                                                                                     |
| 戻り値         | `{ success: boolean; data?: HandoffGuidance; error?: { code: string; message: string } }`                                                                                                                    |
| バリデーション | P42 準拠の3段バリデーション（skillName、improvementSummary）。`improvementSummary` にも `typeof args?.improvementSummary !== "string" \|\| args.improvementSummary.trim() === ""` の trim チェックを適用する |

## 参照資料

| 資料                     | パス                                                                                         | 参照目的                                           |
| ------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 成果物           | `outputs/phase-1/requirements-analysis.md`                                                   | 受入基準と GAP 対応表の参照                        |
| UI/UX 正本               | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L44-72                  | terminal handoff 契約と UX 禁止事項の確認          |
| UI/UX 図解（画面構成図） | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md` L27-36                     | Terminal ボタン配置位置の確認                      |
| TerminalHandoffCard      | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | props マッピングの設計根拠                         |
| TerminalHandoffBuilder   | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                           | 既存メソッドとの整合性確認                         |
| SkillLifecyclePanel      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` L400-500                | 埋め込み位置と既存状態変数の確認                   |
| agentSlice               | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L179、L408、L796-824、L1038-1040      | handoffGuidance の型と初期値・更新タイミングの確認 |
| ストアセレクタ           | `apps/desktop/src/renderer/store/index.ts` L805-812                                          | 利用するセレクタの確認                             |
| アーキテクチャルール     | `.claude/rules/01-architecture.md` レイヤー依存方向                                          | Renderer→Main の依存方向違反を防ぐ                 |
| IPC チャンネル定数       | `apps/desktop/src/preload/channels.ts`（または同等のファイル）                               | 新規チャンネル名の定数登録先                       |

## 実行手順

1. Phase 1 成果物（`outputs/phase-1/requirements-analysis.md`）を読み取り、各契約の受入基準を確認する
2. Task 2-1: Terminal ボタンの配置位置・スタイル・onClick ハンドラの擬似コードを記述する
3. Task 2-2: TerminalHandoffCard の埋め込み位置と props マッピングを仕様化する
4. Task 2-3: `SkillImprovementHandoffRequest` インターフェースと `buildForSkillImprovement()` のシグネチャを確定する
5. Task 2-4: handoffGuidance 接続フロー図を作成し、IPC ハンドラ設計を仕様化する
6. 各設計が `ui-ux-realization.md` の UX 禁止事項（L65-71）に抵触しないことを確認する
7. `outputs/phase-2/design-document.md` に全設計を記録する

## 統合テスト連携

Phase 2 の設計成果物は Phase 4 のテストケース設計の直接入力となる。以下を明確に記載すること。

- Terminal ボタンの `data-testid` 値（`"skill-lifecycle-open-terminal"`）
- TerminalHandoffCard の `data-testid` 値（`"skill-lifecycle-terminal-handoff-card"`）
- `onDismiss` 呼び出し後に `handoffGuidance` が `null` に戻ることの検証方法
- `buildForSkillImprovement()` の入力パターン（improvementSummary が空の場合・ある場合）と期待出力

## 多角的チェック観点

| 観点                     | チェック内容                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| TH-04 契約遵守           | Terminal ボタンが create/execute/improve 全フェーズで常時表示されるか                                       |
| TH-03 契約遵守           | buildForSkillImprovement() が improvementSummary を含む prompt を生成するか                                 |
| UX 禁止事項              | Terminal ボタンのラベルが `Terminal` 固定であり、フェーズごとに別名を付けていないか                         |
| アーキテクチャ準拠       | Renderer 側が TerminalHandoffBuilder を直接 import せず、IPC 経由または Renderer 側組み立てを採用しているか |
| P42 バリデーション       | buildForSkillImprovement() の文字列引数に `.trim() === ""` チェックが含まれているか                         |
| 既存インターフェース整合 | HandoffGuidance 型の使用が agentSlice.ts の定義と一致しているか                                             |
| DIP 準拠（P61）          | IPC ハンドラ登録関数の引数型がインターフェース（TerminalHandoffBuilder の抽象型）であるか                   |

## 成果物テーブル

| 成果物             | パス                                 | 完了条件                                                                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------- |
| design-document.md | `outputs/phase-2/design-document.md` | Task 2-1〜2-4 の全設計が記録され、各設計が terminal handoff 5契約に対応している |

### ラベル日本語化（UX禁止事項 LC-UX-PROHIBIT-01 対応）

`ui-ux-realization.md` の UX 禁止事項「Planner / Executor / Improver を mode switch として露出しない」に対応し、SkillLifecyclePanel の内部オーケストレーションセクションのラベルを以下のように変更する:

- 「内部オーケストレーション」→「進行状況」
- 「Planner」→「方針判定」
- 「Executor」→「実行状況」
- 「Improver」→「改善状況」

この変更はプロダクションコード SkillLifecyclePanel.tsx に既に反映済み。

## 完了条件チェックリスト

- [ ] Task 2-1: Terminal ボタンの配置位置（L419-435 ボタン群の右端、「一覧へ戻る」ボタンの右側）・スタイル（`lifecycleButtonStyles.subtle`）・`data-testid`（`"skill-lifecycle-open-terminal"`）・onClick ハンドラの擬似コードが記述されている
- [ ] Task 2-2: TerminalHandoffCard の表示条件（`handoffGuidance !== null`）・埋め込み位置・props マッピング表・`data-testid`（`"skill-lifecycle-terminal-handoff-card"`）が記述されている
- [ ] Task 2-3: `SkillImprovementHandoffRequest` インターフェースと `buildForSkillImprovement()` のシグネチャ・prompt 生成ロジック・contextSummary フォーマット（`surface=skill skill={token} improve=true`）が確定している
- [ ] Task 2-4: handoffGuidance 接続フロー図と IPC ハンドラ（`skill:buildImprovementHandoff`）の引数・戻り値・バリデーション要件が記述されている
- [ ] 各設計が `ui-ux-realization.md` の UX 禁止事項（L65-71）に抵触しないことが確認されている
- [ ] `outputs/phase-2/design-document.md` が作成されている

## 次 Phase

Phase 3 設計レビュー (`phase-3-design-review.md`)

- 入力: `outputs/phase-1/requirements-analysis.md`、`outputs/phase-2/design-document.md`
- 目的: 要件・設計の妥当性検証
