# Phase 6 テスト拡充 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                        |
| Phase      | 6 - テスト拡充                                                                                                     |
| ステータス | 未着手                                                                                                             |
| 前提 Phase | Phase 5 完了（`SkillLifecyclePanel.tsx` Terminal ボタン追加・`TerminalHandoffBuilder.ts` 新メソッド追加済み）      |
| 成果物     | 追加テストファイル（`SkillLifecyclePanel.test.tsx`・`TerminalHandoffBuilder.test.ts`・IPC ハンドラテストへの追記） |
| 次 Phase   | Phase 7 カバレッジ確認                                                                                             |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Phase 5 実装後のカバレッジ計測で不足した箇所を特定し、テストを追加することで、カバレッジ基準（Line 80%・Branch 60%・Function 80%）を充足する。

## 実行タスク

### Task 6-1: カバレッジ計測と GAP 分析

以下のコマンドを実行して、対象ファイルのカバレッジを計測する。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/skill/SkillLifecyclePanel.tsx \
  src/main/services/runtime/TerminalHandoffBuilder.ts
```

計測結果を以下の表に記録する。

| ファイル                     | Line Coverage | Branch Coverage | Function Coverage | 基準達成 |
| ---------------------------- | ------------- | --------------- | ----------------- | -------- |
| SkillLifecyclePanel.tsx      | 未計測        | 未計測          | 未計測            | -        |
| TerminalHandoffBuilder.ts    | 未計測        | 未計測          | 未計測            | -        |
| IPC ハンドラ（該当ファイル） | 未計測        | 未計測          | 未計測            | -        |

カバレッジ基準（`02-code-quality.md` より）:

| 指標              | 最低基準（必達） | 推奨基準 |
| ----------------- | ---------------- | -------- |
| Line Coverage     | 80%              | 90%      |
| Branch Coverage   | 60%              | 70%      |
| Function Coverage | 80%              | 90%      |

基準未達の箇所を特定し、Task 6-2〜6-5 で補完するテストケースを決定する。

### Task 6-2: Terminal ボタン × lifecycle フェーズ組合せテスト追加

`SkillLifecyclePanel.test.tsx` に以下のテストを追加する。

**T-6-2-1: create フェーズでの Terminal ボタンクリック**

- 前提: `createdSkillName === null`（create フェーズ相当）の状態で SkillLifecyclePanel を描画する
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { skillStore: { createdSkillName: null } })`
- 操作: `data-testid="skill-lifecycle-open-terminal"` の Terminal ボタンを `fireEvent.click()` する（P39 準拠: happy-dom 環境では `fireEvent` を使用）
- 検証: `handoffGuidance.contextSummary` が `"surface=skill"` を含む文字列であること
- 検証: `handoffGuidance.reason` が `"ユーザー操作による terminal 起動"` であること
- 検証: `data-testid="skill-lifecycle-terminal-handoff-card"` が表示されること

**T-6-2-2: execute フェーズでの Terminal ボタンクリック**

- 前提: `shouldShowStreaming === true`（execute フェーズ相当）の状態で SkillLifecyclePanel を描画する
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { agentStore: { shouldShowStreaming: true } })`
- 操作: Terminal ボタンを `fireEvent.click()` する
- 検証: `handoffGuidance.contextSummary` に execute フェーズを示す情報が含まれること
- 検証: TerminalHandoffCard が表示されること

**T-6-2-3: improve フェーズでの Terminal ボタンクリック**

- 前提: `creatorImproveResult` が非 null（improve フェーズ相当）の状態で SkillLifecyclePanel を描画する
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { skillStore: { creatorImproveResult: { suggestions: ["改善点1"] } } })`
- 操作: Terminal ボタンを `fireEvent.click()` する
- 検証: `handoffGuidance.contextSummary` が `"improve=true"` を含む文字列であること（`buildForSkillImprovement()` が生成する `surface=skill skill={token} improve=true` フォーマット）
- 検証: TerminalHandoffCard が表示されること

**T-6-2-4: TerminalHandoffCard の onDismiss 後に非表示になること**

- 前提: `handoffGuidance` がセットされた状態で SkillLifecyclePanel を描画する
- 操作: `data-testid="skill-lifecycle-terminal-handoff-card"` 内の dismiss ボタンを `fireEvent.click()` する
- 検証: `clearHandoffGuidance()` が呼ばれ、TerminalHandoffCard が DOM から除去されること

### Task 6-3: buildForSkillImprovement() 境界値テスト追加

`TerminalHandoffBuilder.test.ts` に以下のテストを追加する。

**T-6-3-1: skillName が 1000 文字以上の場合**

- 入力: `skillName` = 1000 文字の文字列
- 検証: エラーをスローせず `HandoffGuidance` を返すこと
- 検証: `contextSummary` に `skillName` の先頭部分が含まれること（切り捨て or そのまま）
- 注記: 現在の実装が切り捨てを行うかどうかを確認し、期待値をそれに合わせること

**T-6-3-2: improvementSummary にシェルメタ文字が含まれる場合（P55 準拠）**

- 入力: `improvementSummary` = `"; rm -rf /"`
- 検証: `sanitizePrompt()` が適用されて、戻り値の `terminalCommand` または `prompt` にシェルメタ文字がそのまま含まれないこと
- 検証: `HandoffGuidance` が返されること（例外をスローしないこと）

**T-6-3-3: skillName と skillId が両方空の場合**

- 入力: `skillName` = `""`, `skillId` = `""`（または両方 `undefined`）
- 検証: `contextSummary` が `"skill=unknown"` を含む文字列であること（仕様: `skillToken` が `"unknown"` になる）

**T-6-3-4: improvementCount が 0 の場合**

- 入力: `improvementSummary` = `""`, `improvementCount` = `0`
- 検証: 生成された `prompt` が `"（改善点0件）"` を含む文字列であること
- 検証: エラーをスローしないこと

**T-6-3-5: improvementSummary がある場合（正常系確認）**

- 入力: `skillName` = `"my-skill"`, `improvementSummary` = `"エラーハンドリング改善"`, `improvementCount` = `3`
- 検証: 生成された `prompt` が `"「my-skill」の改善を続けてください。前回の改善点: エラーハンドリング改善"` であること

### Task 6-4: IPC ハンドラ エラーパス網羅テスト追加

`skill:buildImprovementHandoff` ハンドラのテストファイルに以下のテストを追加する。

**T-6-4-1: TerminalHandoffBuilder が例外をスローした場合**

- 前提: `TerminalHandoffBuilder.buildForSkillImprovement()` が `new Error("内部エラー")` をスローするようにモックする
- 操作: IPC ハンドラを呼び出す（有効な引数を渡す）
- 検証: レスポンスが `{ success: false, error: { code: string, message: string } }` の形式であること（P60 準拠: wrapper 形式を使用）

**T-6-4-2: 送信元ウィンドウ検証の失敗ケース**

- 前提: `validateIpcSender()` が `false` を返すようにモックする（`04-electron-security.md` IPC セキュリティ原則）
- 操作: IPC ハンドラを呼び出す
- 検証: レスポンスが `{ success: false, error: { code: "UNAUTHORIZED" } }` の形式であること

**T-6-4-3: 引数 skillName が number 型の場合（型バリデーション）**

- 操作: `skillName` = `123`（number 型）を引数として渡す
- 検証: レスポンスが `{ success: false, error: { code: "VALIDATION_ERROR" } }` の形式であること
- 検証: `TerminalHandoffBuilder.buildForSkillImprovement()` が呼び出されないこと

**T-6-4-4: 引数 skillName がスペースのみの場合（P42 準拠トリム検証）**

- 操作: `skillName` = `"   "`（スペースのみ）を引数として渡す
- 検証: レスポンスが `{ success: false, error: { code: "VALIDATION_ERROR" } }` の形式であること（P42: `.trim() === ""` チェック）

### Task 6-5: アクセシビリティテスト追加

`SkillLifecyclePanel.test.tsx` に以下のテストを追加する。

**T-6-5-1: Terminal ボタンに aria-label が付与されていること**

- 操作: SkillLifecyclePanel を描画する
- 検証: `data-testid="skill-lifecycle-open-terminal"` の要素が `aria-label` 属性を持つこと
- 検証: `aria-label` の値が空でないこと

**T-6-5-2: TerminalHandoffCard が role 属性を持つこと**

- 前提: `handoffGuidance` がセットされた状態で SkillLifecyclePanel を描画する
- 検証: `data-testid="skill-lifecycle-terminal-handoff-card"` の要素、またはその直接の親要素が `role` 属性を持つこと
- 許容 `role` 値: `"region"` または `"complementary"`（情報の補完的な領域であることを示す）

**T-6-5-3: キーボード操作で Terminal ボタンが操作可能であること**

- 操作: SkillLifecyclePanel を描画し、`data-testid="skill-lifecycle-open-terminal"` にフォーカスを当てる（`element.focus()`）
- 操作: `fireEvent.keyDown(element, { key: "Enter" })` を実行する
- 検証: `handoffGuidance` がセットされ、TerminalHandoffCard が表示されること

## テスト環境注意事項

| 注意事項   | 詳細                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P39 準拠   | happy-dom 環境では `userEvent.setup()` を使用しない。`fireEvent.click()` を使用し、非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む        |
| P40 準拠   | テスト実行は `cd apps/desktop && pnpm vitest run src/...` で実行する。プロジェクトルートからの実行は happy-dom 設定が適用されないため禁止                          |
| P63 準拠   | サブエージェントに委譲する場合、既存テストのインポートパスを `grep -n "^import" src/renderer/components/skill/SkillLifecyclePanel.test.tsx` で確認してから記述する |
| モック設計 | `beforeEach` でモックをリセットし、テスト間の状態リークを防ぐ（P9 準拠）                                                                                           |

## 参照資料

| 資料                       | パス                                                                                                                       | 参照目的                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 5 実装ファイル（主） | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                       | Terminal ボタン・TerminalHandoffCard の実装確認       |
| Phase 5 実装ファイル（主） | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                                                         | buildForSkillImprovement() の実装確認                 |
| Phase 5 IPC ハンドラ       | `apps/desktop/src/main/handlers/`（該当ファイル）                                                                          | skill:buildImprovementHandoff ハンドラの実装確認      |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                                         | カバレッジ基準（Line 80%・Branch 60%・Function 80%）  |
| 既知の落とし穴（P39）      | `.claude/rules/06-known-pitfalls.md#P39`                                                                                   | happy-dom 環境での fireEvent 使用ルール               |
| 既知の落とし穴（P40）      | `.claude/rules/06-known-pitfalls.md#P40`                                                                                   | テスト実行ディレクトリ依存（モノレポ）                |
| 既知の落とし穴（P42）      | `.claude/rules/06-known-pitfalls.md#P42`                                                                                   | .trim() バリデーション漏れ防止                        |
| 既知の落とし穴（P55）      | `.claude/rules/06-known-pitfalls.md#P55`                                                                                   | 正規表現メタ文字エスケープ（sanitizePrompt 動作確認） |
| 既知の落とし穴（P60）      | `.claude/rules/06-known-pitfalls.md#P60`                                                                                   | IPC テスト応答 wrapper 形式の確認                     |
| Phase 2 設計書             | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/phase-2-design.md` | IPC レスポンス形式・props マッピングの確認            |

## 実行手順

1. `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/SkillLifecyclePanel.tsx src/main/services/runtime/TerminalHandoffBuilder.ts` を実行してカバレッジを計測する
2. Task 6-1 の記録表にカバレッジ値を記入し、基準未達の箇所を特定する
3. Task 6-2: `SkillLifecyclePanel.test.tsx` に T-6-2-1〜T-6-2-4 を追加する
4. Task 6-3: `TerminalHandoffBuilder.test.ts` に T-6-3-1〜T-6-3-5 を追加する
5. Task 6-4: IPC ハンドラのテストファイルに T-6-4-1〜T-6-4-4 を追加する
6. Task 6-5: `SkillLifecyclePanel.test.tsx` に T-6-5-1〜T-6-5-3 を追加する
7. `cd apps/desktop && pnpm vitest run src/renderer/components/skill/SkillLifecyclePanel.test.tsx src/main/services/runtime/TerminalHandoffBuilder.test.ts` を実行して全テストが PASS することを確認する
8. カバレッジを再計測して基準達成を確認する（Phase 7 へのインプット）

## 成果物

| 成果物                               | パス                                                                      | 完了条件                                             |
| ------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| 追加テスト（SkillLifecyclePanel）    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx` | T-6-2-1〜T-6-2-4、T-6-5-1〜T-6-5-3 が追加され全 PASS |
| 追加テスト（TerminalHandoffBuilder） | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.test.ts`   | T-6-3-1〜T-6-3-5 が追加され全 PASS                   |
| 追加テスト（IPC ハンドラ）           | 該当テストファイル（Phase 5 で確定）                                      | T-6-4-1〜T-6-4-4 が追加され全 PASS                   |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスクを実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

本 Phase で追加するテストは、Phase 7 のカバレッジ計測で基準充足を判定するために使用される。

- Phase 4 で作成した基本テスト（T-01〜T-20）を基盤として、カバレッジ未達の分岐・エラーパスを補完する
- Phase 8 リファクタリング後も全テストが PASS し続けることが前提

## 多角的チェック観点

| 観点             | 確認内容                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------- |
| カバレッジ GAP   | Phase 5 実装後のカバレッジ計測結果から、Line/Branch/Function の各不足箇所を特定しているか |
| エラーパス       | IPC バリデーションの全エラーコード（VALIDATION_ERROR 等）がテストされているか             |
| アクセシビリティ | ARIA 属性・キーボード操作のテストが含まれているか                                         |

## 完了条件チェックリスト

- [ ] Task 6-1: カバレッジ計測を実行し、Line/Branch/Function カバレッジ値を記録している
- [ ] Task 6-1: 基準未達の箇所が特定されている（全て基準達成の場合は「全基準達成」と明記）
- [ ] Task 6-2: T-6-2-1〜T-6-2-4 の4テストケースが追加されており、全て PASS している
- [ ] Task 6-3: T-6-3-1〜T-6-3-5 の5テストケースが追加されており、全て PASS している
- [ ] Task 6-4: T-6-4-1〜T-6-4-4 の4テストケースが追加されており、全て PASS している
- [ ] Task 6-5: T-6-5-1〜T-6-5-3 の3テストケースが追加されており、全て PASS している
- [ ] 全テスト追加後に `cd apps/desktop && pnpm vitest run` を実行し、既存テストへの影響がないことを確認している
- [ ] カバレッジが Line 80%・Branch 60%・Function 80% の最低基準を満たしていることを確認している（Phase 7 確認前の自己チェック）

## 次 Phase

Phase 7 カバレッジ確認 (`phase-7-coverage.md`)
