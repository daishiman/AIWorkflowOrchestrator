# Phase 8 リファクタリング - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                     |
| Phase      | 8 - リファクタリング                                                                            |
| ステータス | 未着手                                                                                          |
| 前提 Phase | Phase 7 完了（`outputs/phase-7/coverage-report.md` が存在し、カバレッジ基準を達成していること） |
| 成果物     | `outputs/phase-8/refactor-report.md`                                                            |
| 次 Phase   | Phase 9 品質検証                                                                                |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Phase 5 で実装したプロダクションコードの品質を改善する。外部から観測可能な動作を変更せず、コードの可読性・保守性・テスタビリティを高める。

## リファクタリング制約

- 外部から観測可能な動作（IPC チャンネル名、props インターフェース、テスト ID 値）を変更しない
- リファクタリング前後で全テストが PASS し続けること
- リファクタリング前後の `git diff --stat` 差分行数を成果物に記録する
- 機能追加は行わない。判断が困難な改善点は未タスクとして記録する

## 実行タスク

### Task 8-1: Terminal ボタン onClick ハンドラの抽出

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**目的**: インライン定義されている onClick ハンドラを名前付き関数として抽出し、可読性と再利用性を向上させる。

**実施内容**:

1. Terminal ボタンの onClick に渡しているインライン Arrow Function を `handleOpenTerminal` として抽出する
2. `useCallback` でメモ化し、依存配列に必要な値のみを列挙する
3. 内部状態からのフェーズ導出ロジックを `handleOpenTerminal` 内で明確に分離する（フェーズ判定と `setHandoffGuidance` 呼び出しを別ステップとして記述する）:
   - `createdSkillName === null` → create フェーズ相当
   - `shouldShowStreaming === true` → execute フェーズ相当
   - `creatorImproveResult` が非 null → improve フェーズ相当
4. P31 対策として、依存配列には `useSetHandoffGuidance()` 等の個別セレクタから取得した関数参照を使用し、合成 Store Hook（`useAgentStore()` 等）の戻り値関数を依存配列に含めない

**検証基準**:

- リファクタリング前後で Terminal ボタンの onClick 動作が変化しないこと
- 依存配列に不要な値が含まれていないこと（ESLint `react-hooks/exhaustive-deps` が PASS すること）

---

### Task 8-2: TerminalHandoffCard props マッピングの整理

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**目的**: TerminalHandoffCard への props 渡しに使用しているコールバックを `useCallback` 化し、不要な再生成を防ぐ。

**実施内容**:

1. `onCopyCommand` に渡しているインライン Arrow Function を `handleCopyCommand` として抽出し、`useCallback` でメモ化する
2. `onDismiss` に渡しているインライン Arrow Function を `handleDismiss` として抽出し、`useCallback` でメモ化する
3. `navigator.clipboard.writeText()` のエラーハンドリングが実装されているかを確認する。未実装の場合は `try/catch` を追加する（エラー発生時はログ出力のみとし、例外を外部に伝播させない）
4. TerminalHandoffCard への props 渡しでスプレッド構文（`{...props}`）を使用していないことを確認する。使用している場合は明示的なフィールドマッピングに変更する

**検証基準**:

- リファクタリング前後で `onCopyCommand` / `onDismiss` の動作が変化しないこと
- `clipboard.writeText` 失敗時にコンポーネントがクラッシュしないこと

---

### Task 8-3: buildForSkillImprovement() と既存メソッドの共通化検討

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

**目的**: `buildForSkillImprovement()` と `buildForSkillExecution()` の共通ロジックを特定し、重複排除の可否を判断する。

**実施内容**:

1. `buildForSkillImprovement()` と `buildForSkillExecution()` の実装を比較し、以下の観点で共通ロジックを列挙する:
   - `sanitizePrompt()` 呼び出し
   - `contextSummary` 文字列生成（`surface=skill skill={token}` 形式）
   - `HandoffGuidance` オブジェクト組み立て

2. 共通化の判断基準:
   - 抽出した共通ロジックが 3 行以上かつ 2 箇所以上で重複する場合 → `private` メソッドとして抽出する
   - 重複が 1 箇所のみ、または 3 行未満の場合 → 過度な抽象化を避け、共通化しない。理由を成果物に記録する

3. 共通化する場合は `private buildContextSummary(token: string, isImprove: boolean): string` 等のメソッドを追加し、両メソッドから呼び出す

**検証基準**:

- リファクタリング前後で `buildForSkillImprovement()` / `buildForSkillExecution()` の戻り値が変化しないこと（既存テストが PASS すること）
- 共通化の判断（実施 / 不実施）と理由が成果物に記録されていること

---

### Task 8-4: 命名規則と一貫性確認

**対象ファイル**:

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（テスト ID）
- `apps/desktop/src/preload/channels.ts`（チャンネル定数）
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`（インターフェースフィールド名）

**目的**: 追加した実装が既存コードの命名規則に準拠していることを確認し、乖離があれば修正する。

**確認項目**:

| 確認対象                                           | 規則                                                                      | 合否基準                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Terminal ボタンの `data-testid`                    | `"skill-lifecycle-"` プレフィックスを使用しているか                       | 他ボタンの testid（例: `"skill-lifecycle-back-to-list"`）と同一プレフィックス |
| IPC チャンネル名 `"skill:buildImprovementHandoff"` | 既存チャンネル（`"skill:import"`, `"skill:remove"` 等）の命名規則に従うか | `"skill:"` プレフィックス + camelCase のアクション名                          |
| `SkillImprovementHandoffRequest` のフィールド名    | 既存 `SkillHandoffBuildRequest` のフィールド名と一貫しているか            | 同一概念のフィールドに異なる命名が存在しないこと                              |

**実施内容**:

1. 上記3項目を確認し、合否と根拠を記録する
2. 不一致がある場合は修正する。修正範囲は命名の変更のみとし、ロジックを変更しない
3. 命名変更を行った場合は、参照箇所（テストファイル含む）を全て更新する

**検証基準**:

- 3項目が全て合格、または合格に修正されていること
- 修正した場合は全テストが PASS すること

## 参照資料

| 資料                        | パス                                                                 | 参照目的                              |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| Phase 5 実装成果物          | `outputs/phase-5/implementation-report.md`                           | リファクタリング対象コードの把握      |
| Phase 7 成果物              | `outputs/phase-7/refactor-report.md`                                 | 前 Phase のリファクタリング結果の確認 |
| SkillLifecyclePanel         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | リファクタリング対象コードの確認      |
| TerminalHandoffBuilder      | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | 共通化検討の対象コード                |
| IPC チャンネル定数          | `apps/desktop/src/preload/channels.ts`                               | チャンネル命名規則の確認              |
| agentSlice 個別セレクタ     | `apps/desktop/src/renderer/store/index.ts` L805-812                  | P31 対策の依存配列参照                |
| P31 Zustand 無限ループ対策  | `.claude/rules/06-known-pitfalls.md#P31`                             | useCallback 依存配列の設計根拠        |
| P48 non-null assertion 禁止 | `.claude/rules/06-known-pitfalls.md#P48`                             | リファクタリング後の型安全性確認      |
| コーディング規約            | `.claude/rules/02-code-quality.md`                                   | リファクタリング後のコード品質基準    |

## 実行手順

1. `outputs/phase-5/implementation-report.md` を読み取り、Phase 5 で実装したコードの概要を把握する
2. `git diff --stat HEAD~1` または相当コマンドで現在の変更差分行数を記録する（リファクタリング前のベースライン）
3. Task 8-1: `SkillLifecyclePanel.tsx` の Terminal ボタン onClick ハンドラを `handleOpenTerminal` として抽出し、`useCallback` でメモ化する
4. Task 8-2: `onCopyCommand` / `onDismiss` のコールバックを `handleCopyCommand` / `handleDismiss` として抽出し、`useCallback` でメモ化する。`clipboard.writeText` のエラーハンドリングを確認・追加する
5. Task 8-3: `buildForSkillImprovement()` と `buildForSkillExecution()` の共通ロジックを比較し、共通化の可否を判断して実施する
6. Task 8-4: Terminal ボタン testid・IPC チャンネル名・インターフェースフィールド名の命名規則を確認し、不一致があれば修正する
7. 全テストを実行して PASS を確認する（`cd apps/desktop && pnpm vitest run`）
8. リファクタリング後の `git diff --stat` 差分行数を記録する
9. `outputs/phase-8/refactor-report.md` に実施内容・判断根拠・差分行数を記録する

## 成果物テーブル

| 成果物             | パス                                 | 完了条件                                                           |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| refactor-report.md | `outputs/phase-8/refactor-report.md` | Task 8-1〜8-4 の実施内容・判断根拠・前後の差分行数が記録されている |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスクを実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

リファクタリング前後で全テスト（Phase 4 + Phase 6）が PASS し続けることが必須条件。

- `cd apps/desktop && pnpm vitest run` の実行結果を成果物に記録する
- テスト PASS 数が変化した場合は、リファクタリングにより外部動作が変わった可能性があるため差分を調査する

## 多角的チェック観点

| 観点         | 確認内容                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| 外部動作不変 | IPC チャンネル名・props インターフェース・data-testid 値が変更されていないこと            |
| コード重複   | buildForSkillExecution と buildForSkillImprovement の共通ロジックが適切に抽出されているか |
| 命名一貫性   | skillName / skillId の命名が全レイヤーで統一されているか（P45 対策）                      |

## 完了条件チェックリスト

- [ ] Task 8-1: `handleOpenTerminal` が `useCallback` でメモ化され、依存配列に合成 Store Hook の戻り値関数が含まれていないこと（P31 準拠）
- [ ] Task 8-1: 内部状態（createdSkillName / shouldShowStreaming / creatorImproveResult）からのフェーズ導出ロジックと `setHandoffGuidance` 呼び出しが明確に分離されていること
- [ ] Task 8-2: `handleCopyCommand` / `handleDismiss` が `useCallback` でメモ化されていること
- [ ] Task 8-2: `navigator.clipboard.writeText()` のエラーハンドリングが実装されていること（`try/catch` で例外をキャッチしてログ出力）
- [ ] Task 8-2: TerminalHandoffCard への props 渡しでスプレッド構文が使用されていないこと
- [ ] Task 8-3: `buildForSkillImprovement()` と `buildForSkillExecution()` の共通ロジック比較結果と共通化判断（実施 / 不実施）の理由が成果物に記録されていること
- [ ] Task 8-4: Terminal ボタンの `data-testid` が `"skill-lifecycle-"` プレフィックスを使用していること
- [ ] Task 8-4: IPC チャンネル名が `"skill:"` プレフィックス + camelCase の命名規則に従っていること
- [ ] Task 8-4: `SkillImprovementHandoffRequest` のフィールド名が既存インターフェースと一貫していること
- [ ] リファクタリング前後で全テストが PASS していること
- [ ] リファクタリング前後の `git diff --stat` 差分行数が成果物に記録されていること
- [ ] `outputs/phase-8/refactor-report.md` が作成されていること

## 次 Phase

Phase 9 品質検証 (`phase-9-quality.md`)

- 入力: `outputs/phase-8/refactor-report.md`、Phase 8 完了後のソースコード
- 目的: ESLint・型チェック・全テスト・Prettier による品質ゲート確認
