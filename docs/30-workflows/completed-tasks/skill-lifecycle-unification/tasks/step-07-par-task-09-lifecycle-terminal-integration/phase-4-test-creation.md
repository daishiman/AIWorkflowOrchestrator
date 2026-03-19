# Phase 4 テスト作成 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                                                                                            |
| Phase      | 4 - テスト作成                                                                                                                                                                         |
| ステータス | 未着手                                                                                                                                                                                 |
| 前提 Phase | Phase 3 完了（`outputs/phase-3/design-review-report.md` が存在し、判定が PASS または MINOR 対応完了であること）                                                                        |
| 成果物     | `outputs/phase-4/SkillLifecyclePanel.terminal.test.tsx`、`outputs/phase-4/TerminalHandoffBuilder.improvement.test.ts`、`outputs/phase-4/skill-buildImprovementHandoff.handler.test.ts` |
| 次 Phase   | Phase 5 実装                                                                                                                                                                           |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを `grep -n "^import" <対象テスト>.test.ts` で確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Phase 2 設計に基づき、以下4点の受入テストを Red 状態（実装前に失敗する状態）で作成する。

1. SkillLifecyclePanel ヘッダーへの Terminal ボタン表示テスト（GAP C-02 対応）
2. TerminalHandoffCard の表示・非表示・操作テスト（GAP C-03 対応）
3. `TerminalHandoffBuilder.buildForSkillImprovement()` の入出力テスト（GAP C-07 対応）
4. IPC ハンドラ `skill:buildImprovementHandoff` のバリデーション・正常系テスト（GAP D-02 対応含む）

## テスト環境の注意事項

以下の既知の落とし穴を回避するため、テスト記述時に厳守すること。

| 規則                       | 根拠                    | 具体的な対応                                                                                     |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| userEvent を使用しない     | P39（happy-dom 非互換） | `fireEvent` を使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む |
| テスト実行ディレクトリ     | P40（モノレポ）         | `cd apps/desktop && pnpm vitest run` で実行する                                                  |
| テスト間で状態を共有しない | P9                      | `beforeEach` で全モックをリセットし、各テストを独立させる                                        |
| IPC レスポンス形式         | P60                     | ハンドラの戻り値を `{ success: boolean, data?, error? }` の wrapper 形式でアサートする           |

## 実行タスク

### Task 4-1: Terminal ボタン表示テスト設計

**テスト対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**出力先**: `outputs/phase-4/SkillLifecyclePanel.terminal.test.tsx`

以下のテストケースを実装する。

#### T-01: 全ライフサイクルフェーズで Terminal ボタンが常時表示される

- `createdSkillName: null`（create フェーズ相当）のとき、`data-testid="skill-lifecycle-open-terminal"` を持つ要素が DOM に存在すること
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { skillStore: { createdSkillName: null } })`
- `shouldShowStreaming: true`（execute フェーズ相当）のとき、同要素が DOM に存在すること
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { agentStore: { shouldShowStreaming: true } })`
- `creatorImproveResult` が非 null（improve フェーズ相当）のとき、同要素が DOM に存在すること
  - セットアップ例: `renderWithStore(<SkillLifecyclePanel />, { skillStore: { creatorImproveResult: { suggestions: [] } } })`
- フェーズが切り替わっても Terminal ボタンが消えないこと（TH-04 契約の検証）

#### T-02: Terminal ボタンのラベルが "Terminal" 固定である

- ボタンのテキストコンテンツが `"Terminal"` であること
- 内部状態（createdSkillName / shouldShowStreaming / creatorImproveResult）の値によらず、ラベルが変化しないこと（UX 禁止事項 L71 準拠の検証）

#### T-03: Terminal ボタンクリックで setHandoffGuidance が呼び出される

- `fireEvent.click` でボタンをクリックした後、`setHandoffGuidance` が1回呼び出されること
- 渡される `HandoffGuidance` オブジェクトが `terminalCommand`・`contextSummary`・`reason` フィールドを持つこと
- `reason` が `"ユーザー操作による terminal 起動"` であること

### Task 4-2: TerminalHandoffCard 表示条件テスト設計

**テスト対象**: `SkillLifecyclePanel.tsx` の TerminalHandoffCard 埋め込み部分

**テストケース**: `outputs/phase-4/SkillLifecyclePanel.terminal.test.tsx` に追記する

#### T-04: handoffGuidance が null の場合、カードが表示されない

- `useHandoffGuidance()` が `null` を返すとき、`data-testid="skill-lifecycle-terminal-handoff-card"` を持つ要素が DOM に存在しないこと

#### T-05: handoffGuidance がセットされた場合、カードが表示される

- `useHandoffGuidance()` が有効な `HandoffGuidance` オブジェクトを返すとき、`data-testid="skill-lifecycle-terminal-handoff-card"` を持つ要素が DOM に存在すること

#### T-06: guidance の各フィールドが TerminalHandoffCard に正しくマッピングされる

- `handoffGuidance.terminalCommand` の値がカード内に表示されること
- `handoffGuidance.contextSummary` の値がカード内に表示されること（またはローカライズ後の文字列として表示されること）
- `handoffGuidance.reason` の値がカード内に表示されること

#### T-07: onCopyCommand でクリップボードにコマンドがコピーされる

- カード内のコピーボタンをクリックしたとき、`navigator.clipboard.writeText` が `handoffGuidance.terminalCommand` を引数として呼び出されること
- テスト内で `navigator.clipboard.writeText` をモック化すること

#### T-08: onDismiss で clearHandoffGuidance が呼ばれ、カードが非表示になる

- カード内の閉じるボタンをクリックしたとき、`clearHandoffGuidance` が1回呼び出されること
- `clearHandoffGuidance` 呼び出し後に `useHandoffGuidance()` が `null` を返す状態になると、カードが DOM から消えること

### Task 4-3: buildForSkillImprovement() テスト設計

**テスト対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

**出力先**: `outputs/phase-4/TerminalHandoffBuilder.improvement.test.ts`

以下のテストケースを実装する。

#### T-09: improvementSummary ありの場合、prompt に含まれる（正常系）

- `request.skillName = "my-skill"`, `request.improvementSummary = "パフォーマンス改善が必要"` を渡したとき
- 戻り値の `terminalCommand` に `"パフォーマンス改善が必要"` の文字列が含まれること
- 戻り値の `terminalCommand` に `"my-skill"` の文字列が含まれること
- 戻り値の `contextSummary` が `"surface=skill skill=my-skill improve=true"` であること

#### T-10: improvementSummary なしの場合、improvementCount ベースの prompt が生成される（正常系）

- `request.skillName = "my-skill"`, `request.improvementSummary = ""`, `request.improvementCount = 3` を渡したとき
- 戻り値の `terminalCommand` に `"3件"` または `3` の文字列が含まれること
- 戻り値の `contextSummary` が `"surface=skill skill=my-skill improve=true"` であること

#### T-11: contextSummary が "surface=skill skill={token} improve=true" 形式である

- `request.skillName = "test-skill"` を渡したとき、`contextSummary` が `"surface=skill skill=test-skill improve=true"` に完全一致すること

#### T-12: sanitizePrompt() が適用される（shell injection 対策）

- `request.improvementSummary` に shell injection 用の文字列（例: `"; rm -rf /"` または `"$(evil_command)"`）を含めたとき
- 戻り値の `terminalCommand` にそのまま反映されず、サニタイズされた値が返ること
- P55 準拠: `os.homedir()` 等の特殊文字がエスケープされること

#### T-13: P42 準拠 - skillName が空文字列の場合のバリデーション

- `request.skillName = ""` を渡したとき、`skillToken` が `"unknown"` となること（例外を投げずに fallback する）

#### T-14: P42 準拠 - skillName がスペースのみの場合のバリデーション

- `request.skillName = "   "` を渡したとき、`.trim() === ""` 判定で `skillToken` が `"unknown"` となること

#### T-15: skillName と skillId が両方空の場合、skillToken が "unknown" になる

- `request.skillName = ""`, `request.skillId = ""` を渡したとき、`contextSummary` が `"surface=skill skill=unknown improve=true"` であること

#### T-XX: buildForSkillExecution に「自動実行しない」旨の文言が含まれること（TH-02 対応）

- 前提条件: `shouldShowStreaming === true`（execute フェーズ相当）の状態で Terminal ボタンをクリックする
- 操作: `buildForSkillExecution()` または execute フェーズ相当の handoff 構築を呼び出す
- 期待結果: 生成された `HandoffGuidance` の `contextSummary` または `reason` に「この画面では自動実行しない」相当の文言が含まれること
- 分類: TH-02 対応（`ui-ux-realization.md` TH-02「execute を terminal へ渡す: この画面では自動実行しないことを明記する」の受入基準）

### IPC レスポンス形式の事前合意（P60 対策）

Phase 5 実装との wrapper 形式不整合を防ぐため、テスト作成前に以下の形式を合意する。

| シナリオ             | レスポンス形式                                                             |
| -------------------- | -------------------------------------------------------------------------- |
| 正常系               | `{ success: true, data: HandoffGuidance }`                                 |
| バリデーションエラー | `{ success: false, error: { code: "VALIDATION_ERROR", message: string } }` |
| 内部エラー           | `{ success: false, error: { code: "INTERNAL_ERROR", message: string } }`   |
| 送信元検証失敗       | `{ success: false, error: { code: "UNAUTHORIZED", message: string } }`     |

### Task 4-4: IPC ハンドラ skill:buildImprovementHandoff テスト設計

**テスト対象**: `skill:buildImprovementHandoff` IPC ハンドラ登録関数

**出力先**: `outputs/phase-4/skill-buildImprovementHandoff.handler.test.ts`

以下のテストケースを実装する。P60 対策として、全テストのアサーションは wrapper 形式（`{ success, data?, error? }`）で記述すること。

#### T-16: 有効な引数を渡した場合、{ success: true, data: HandoffGuidance } が返る（正常系）

- 引数: `{ skillName: "my-skill", improvementSummary: "改善が必要", improvementCount: 2 }`
- 戻り値が `{ success: true, data: { terminalCommand: string, contextSummary: string, reason: string } }` 形式であること
- `data.contextSummary` が `"surface=skill skill=my-skill improve=true"` であること

#### T-17: skillName が未指定の場合、VALIDATION_ERROR が返る（異常系）

- 引数: `{}` または `{ improvementSummary: "改善" }`
- 戻り値が `{ success: false, error: { code: "VALIDATION_ERROR", message: string } }` であること

#### T-18: skillName が空文字列の場合、VALIDATION_ERROR が返る（異常系）

- 引数: `{ skillName: "", improvementSummary: "改善" }`
- 戻り値が `{ success: false, error: { code: "VALIDATION_ERROR" } }` であること

#### T-19: skillName がスペースのみの場合、VALIDATION_ERROR が返る（P42 trim チェック異常系）

- 引数: `{ skillName: "   ", improvementSummary: "改善" }`
- `.trim() === ""` 判定により `{ success: false, error: { code: "VALIDATION_ERROR" } }` が返ること

#### T-20: improvementSummary がスペースのみの場合、VALIDATION_ERROR が返る（P42 trim チェック異常系）

- 引数: `{ skillName: "my-skill", improvementSummary: "   " }`
- P42 準拠 `typeof args?.improvementSummary !== "string" || args.improvementSummary.trim() === ""` の判定により `{ success: false, error: { code: "VALIDATION_ERROR" } }` が返ること

## 参照資料

| 資料                       | パス                                                                                         | 参照目的                                              |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 2 設計書             | `outputs/phase-2/design-document.md`                                                         | テスト設計の根拠となるインターフェース・フロー確認    |
| Phase 3 設計レビュー結果   | `outputs/phase-3/design-review-report.md`                                                    | MINOR 指摘事項の反映確認                              |
| SkillLifecyclePanel        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 埋め込み位置・既存ボタン群・既存テスト構造の確認      |
| TerminalHandoffCard        | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | Props インターフェースと data-testid の確認           |
| TerminalHandoffBuilder     | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                           | 既存メソッドの構造・sanitizePrompt() の確認           |
| agentSlice                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                       | HandoffGuidance 型・setHandoffGuidance アクション確認 |
| ストアセレクタ             | `apps/desktop/src/renderer/store/index.ts` L805-812                                          | useHandoffGuidance / useClearHandoffGuidance の確認   |
| P39 happy-dom 非互換       | `.claude/rules/06-known-pitfalls.md#P39`                                                     | userEvent → fireEvent への切り替え根拠                |
| P40 テスト実行ディレクトリ | `.claude/rules/06-known-pitfalls.md#P40`                                                     | apps/desktop/ からの実行根拠                          |
| P42 trim バリデーション    | `.claude/rules/06-known-pitfalls.md#P42`                                                     | 3段バリデーションのテストパターン                     |
| P60 IPC レスポンス形式     | `.claude/rules/06-known-pitfalls.md#P60`                                                     | wrapper 形式アサーションの根拠                        |

## 実行手順

0. **既存ユーティリティ重複検出【必須】**: 以下のコマンドでテスト対象に類似の既存ユーティリティやヘルパーがないか確認する。重複がある場合は既存を再利用する。

   ```bash
   grep -rn "handoffGuidance\|TerminalHandoff\|buildForSkill" apps/desktop/src/ --include="*.test.*"
   ```

1. `outputs/phase-2/design-document.md` を読み取り、Task 2-1〜2-4 の設計仕様を把握する
2. `outputs/phase-3/design-review-report.md` を読み取り、MINOR 指摘事項が存在する場合は修正反映を確認する
3. `TerminalHandoffCard.tsx` を読み取り、Props インターフェースと `data-testid` 値を確認する
4. `agentSlice.ts` の L179・L408・L796-824・L1038-1040 を読み取り、`HandoffGuidance` 型と各セレクタ名を確認する
5. **テスト対象ファイルの import 副作用チェック**: `SkillLifecyclePanel.tsx`・`TerminalHandoffBuilder.ts` を読み取り、モジュールレベルの副作用（グローバル変数初期化、イベントリスナー登録等）がテストに影響しないことを確認する
6. Task 4-1: `SkillLifecyclePanel.terminal.test.tsx` に T-01〜T-03 を実装する（Red 状態で保存）
7. Task 4-2: 同ファイルに T-04〜T-08 を追記する（Red 状態で保存）
8. Task 4-3: `TerminalHandoffBuilder.improvement.test.ts` に T-09〜T-15 を実装する（Red 状態で保存）
9. Task 4-4: `skill-buildImprovementHandoff.handler.test.ts` に T-16〜T-20 を実装する（Red 状態で保存）
10. `cd apps/desktop && pnpm vitest run outputs/phase-4/` を実行し、全テストが Red（失敗）であることを確認する
11. テストが意図しない理由で失敗している場合（import エラー等）は修正し、「実装がないために失敗している」状態にする

## 成果物テーブル

| 成果物                                       | パス                                                            | 完了条件                                               |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| SkillLifecyclePanel terminal テスト          | `outputs/phase-4/SkillLifecyclePanel.terminal.test.tsx`         | T-01〜T-08 が全て Red 状態（実装前失敗）で動作すること |
| TerminalHandoffBuilder improvement テスト    | `outputs/phase-4/TerminalHandoffBuilder.improvement.test.ts`    | T-09〜T-15 が全て Red 状態で動作すること               |
| skill:buildImprovementHandoff ハンドラテスト | `outputs/phase-4/skill-buildImprovementHandoff.handler.test.ts` | T-16〜T-20 が全て Red 状態で動作すること               |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスク（Task 4-1〜4-4）を実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

本 Phase で作成するテストは、Phase 5 実装の Red→Green 確認に使用される。以下の連携ポイントに注意する。

- T-01〜T-03（Terminal ボタン表示テスト）は Phase 5 Task 5-1 で Green 化する
- T-04〜T-08（TerminalHandoffCard 表示テスト）は Phase 5 Task 5-2 で Green 化する
- T-09〜T-15（buildForSkillImprovement テスト）は Phase 5 Task 5-3 で Green 化する
- T-16〜T-20（IPC ハンドラテスト）は Phase 5 Task 5-4 で Green 化する

## 多角的チェック観点

| 観点         | 確認内容                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| 境界値       | 空文字列・null・undefined・超長文字列の入力テストが含まれているか                               |
| セキュリティ | sanitizePrompt テスト（T-12）がシェルメタ文字を網羅しているか                                   |
| UX 禁止事項  | Terminal ボタンのラベルが固定 "Terminal" であるテスト（T-02）で role 名の非露出を確認しているか |
| IPC 契約     | P60 wrapper 形式のアサーションが全 IPC テストに適用されているか                                 |

## 完了条件チェックリスト

- [ ] Task 4-1: T-01〜T-03（Terminal ボタン表示テスト）が `outputs/phase-4/SkillLifecyclePanel.terminal.test.tsx` に実装されている
- [ ] Task 4-2: T-04〜T-08（TerminalHandoffCard 表示条件テスト）が同ファイルに追記されている
- [ ] Task 4-3: T-09〜T-15（buildForSkillImprovement テスト）が `outputs/phase-4/TerminalHandoffBuilder.improvement.test.ts` に実装されている
- [ ] Task 4-4: T-16〜T-20（IPC ハンドラテスト）が `outputs/phase-4/skill-buildImprovementHandoff.handler.test.ts` に実装されている
- [ ] 全テストファイルのインポートパスが、同ディレクトリの既存テストファイルを参照して記述されている（P63 対策）
- [ ] テスト内で `userEvent` を使用していない（P39 対策）
- [ ] IPC ハンドラテストの全アサーションが `{ success, data?, error? }` wrapper 形式で記述されている（P60 対策）
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが Red 状態（実装前失敗）であることが確認されている
- [ ] テスト間で状態を共有せず、`beforeEach` でモックがリセットされている（P9 対策）

## 次 Phase

Phase 5 実装 (`phase-5-implementation.md`)

- 入力: `outputs/phase-4/` の全テストファイル（Red 状態）、`outputs/phase-2/design-document.md`
- 目的: Phase 4 テストを Green にするプロダクションコード実装
