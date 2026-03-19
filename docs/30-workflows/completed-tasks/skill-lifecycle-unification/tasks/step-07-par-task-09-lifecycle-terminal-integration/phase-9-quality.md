# Phase 9 品質検証 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                         |
| Phase      | 9 - 品質検証                                                        |
| ステータス | 未着手                                                              |
| 前提 Phase | Phase 8 完了（`outputs/phase-8/refactor-report.md` が存在すること） |
| 成果物     | `outputs/phase-9/quality-report.md`                                 |
| 次 Phase   | Phase 10 最終レビュー                                               |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

ESLint・TypeScript 型チェック・全テスト・Prettier による品質ゲートを通過させ、Phase 10 最終レビューへ安全に進めるかを確認する。全ツールでエラー 0 件を達成することが完了条件である。

## 品質基準テーブル

| 検証ツール | 合格基準                   | コマンド                             |
| ---------- | -------------------------- | ------------------------------------ |
| ESLint     | error 0 件、warning 0 件   | `pnpm lint`                          |
| TypeScript | error 0 件                 | `pnpm typecheck`                     |
| Vitest     | 全テスト PASS（失敗 0 件） | `cd apps/desktop && pnpm vitest run` |
| Prettier   | フォーマット差分 0 件      | `pnpm prettier --check`              |

## 実行タスク

### Task 9-1: ESLint 実行

**コマンド**: `pnpm lint`

**確認項目**:

1. コマンドを実行し、終了コードが 0 であることを確認する
2. `no-unused-vars` ルール: Phase 8 リファクタリングで抽出した変数・関数（`handleOpenTerminal`、`handleCopyCommand`、`handleDismiss`）が全て使用されていること
3. `no-unused-imports` ルール: Phase 5 実装で追加した import が全て使用されていること（`useCallback` 等）
4. `react-hooks/exhaustive-deps` ルール: `useCallback` の依存配列に過不足がないこと（P31 対策で設定した個別セレクタ参照が正しいこと）
5. 新規追加ファイル（`TerminalHandoffBuilder.ts` に追加したメソッド等）が `.eslintrc` の対象ディレクトリに含まれていること

**エラー時の対応**:

- `no-unused-vars` / `no-unused-imports`: 不要な変数・import を削除する
- `react-hooks/exhaustive-deps`: 依存配列を修正する。依存配列から外す場合は理由を成果物に記録する

---

### Task 9-2: TypeScript 型チェック実行

**コマンド**: `pnpm typecheck`

**確認項目**:

1. コマンドを実行し、終了コードが 0 であることを確認する
2. `HandoffGuidance | null` 型の安全性確認: `handoffGuidance` が `null` の場合に `TerminalHandoffCard` へ渡されないことが型レベルで保証されていること（`strictNullChecks` で検証）
3. `SkillImprovementHandoffRequest` インターフェースの全フィールドが `any` 型を使用していないこと
4. non-null assertion（`!`）が使用されていないこと（P48 準拠）: 対象ファイルを `grep -n '!' apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 等で確認する
5. `as` キャストが使用されていないこと（P19 / P49 準拠）: 対象ファイルで `as` の使用箇所を確認する
6. IPC ハンドラ登録関数の引数型がインターフェース（具象クラスではない）であること（P61 DIP 準拠）

**エラー時の対応**:

- `null` 安全性エラー: 条件分岐（`if (handoffGuidance !== null)`）でガードを追加する
- `any` 型使用: 具体的な型定義に置き換える。置き換えが困難な場合は理由を成果物に記録し未タスク化する
- non-null assertion: P48 準拠の実行時型検証（`Array.isArray()` / optional chaining）に置き換える
- `as` キャスト: `in` 演算子と `typeof` による実行時型ナロイング（P49 準拠）に置き換える

---

### Task 9-3: 全テスト実行

**コマンド**: `cd apps/desktop && pnpm vitest run`

**注意事項**: P40 準拠により、テスト実行は必ず `apps/desktop/` ディレクトリから行う。プロジェクトルートから実行すると `vitest.config.ts` の `environment` 設定（happy-dom）が適用されない。

**確認項目**:

1. コマンドを実行し、失敗テスト 0 件であることを確認する
2. 新規テストファイルのパスが `apps/desktop/vitest.config.ts` の `include` パターンに含まれていること
3. Phase 8 リファクタリング後に既存テストが全て PASS していること（リファクタリング前と比較して失敗テストが増えていないこと）
4. `buildForSkillImprovement()` 関連のテストが PASS していること
5. `SkillLifecyclePanel` の Terminal ボタン・`TerminalHandoffCard` 表示のテストが PASS していること
6. happy-dom 環境でのテストに `userEvent.setup()` を使用していないこと（P39 準拠）。使用している場合は `fireEvent` に置き換える

**エラー時の対応**:

- テスト失敗: Phase 8 のリファクタリングが動作を変更していないかを確認する。実装の問題であれば修正する。リファクタリング前後で動作が同じにもかかわらず失敗する場合は、テスト自体の問題として修正する
- タイムアウト: P13 準拠で `advanceTimersByTime` を使用する。`runAllTimers` 系は使用しない

---

### Task 9-4: Prettier フォーマット確認

**コマンド**: `pnpm prettier --check`

**確認項目**:

1. コマンドを実行し、フォーマット差分 0 件であることを確認する
2. Phase 5 実装・Phase 8 リファクタリングで変更した全ファイルがフォーマット済みであること

**エラー時の対応**:

- フォーマット差分がある場合: `pnpm prettier --write` で自動修正する
- 自動修正後に再度 `pnpm prettier --check` を実行して差分 0 件を確認する

---

### Task 9-5: セキュリティ確認

**対象ファイル**:

- `apps/desktop/src/preload/channels.ts`（チャンネルホワイトリスト）
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`（sanitizePrompt）
- IPC ハンドラ登録ファイル（`skill:buildImprovementHandoff` を登録したファイル）

**確認項目**:

1. IPC チャンネルホワイトリスト登録確認: `skill:buildImprovementHandoff` チャンネルが `channels.ts`（または同等のホワイトリスト管理ファイル）に登録されていること。未登録の場合は Renderer から呼び出せないため追加する（`04-electron-security.md` IPC セキュリティ原則準拠）

2. Shell Injection 防止確認: `buildForSkillImprovement()` が `sanitizePrompt()` を呼び出して入力値をサニタイズしていること。`sanitizePrompt()` の実装がシェルメタ文字（`;`, `|`, `&`, `$`, `` ` `` 等）を適切に除去またはエスケープしていること

3. IPC ハンドラ送信元検証確認: `skill:buildImprovementHandoff` ハンドラが `validateIpcSender()` 等の送信元ウィンドウ検証を実装していること。未実装の場合は他の IPC ハンドラの実装パターンに合わせて追加する（`04-electron-security.md` IPC セキュリティ原則準拠）

4. P42 バリデーション確認: `skill:buildImprovementHandoff` ハンドラの文字列引数（`skillName`、`improvementSummary`）に3段バリデーション（`typeof === "string"` → `=== ""` → `.trim() === ""`）が実装されていること

**確認方法**:

```bash
# チャンネルホワイトリスト確認
grep -n "buildImprovementHandoff" apps/desktop/src/preload/channels.ts

# sanitizePrompt 呼び出し確認
grep -n "sanitizePrompt" apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts

# 送信元検証確認
grep -n "validateIpcSender\|buildImprovementHandoff" apps/desktop/src/main/handlers/
```

**エラー時の対応**:

- チャンネル未登録: `channels.ts` に `SKILL_BUILD_IMPROVEMENT_HANDOFF: "skill:buildImprovementHandoff"` を追加する
- `sanitizePrompt` 未呼び出し: `buildForSkillImprovement()` 内の prompt 組み立て後に `sanitizePrompt()` を適用する
- 送信元検証未実装: 既存ハンドラの検証パターンを参照して追加する

## 参照資料

| 資料                           | パス                                                                 | 参照目的                                     |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------------------- |
| Phase 8 成果物                 | `outputs/phase-8/refactor-report.md`                                 | リファクタリング済みコードの把握             |
| SkillLifecyclePanel            | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 型安全性・non-null assertion の確認対象      |
| TerminalHandoffBuilder         | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | sanitizePrompt・型定義の確認対象             |
| IPC チャンネル定数             | `apps/desktop/src/preload/channels.ts`                               | チャンネルホワイトリスト確認                 |
| IPC セキュリティルール         | `.claude/rules/04-electron-security.md` IPC セキュリティ原則         | 送信元検証・ホワイトリスト管理の基準         |
| P19 型キャスト禁止             | `.claude/rules/06-known-pitfalls.md#P19`                             | as キャスト不使用の確認根拠                  |
| P39 happy-dom userEvent 禁止   | `.claude/rules/06-known-pitfalls.md#P39`                             | テスト環境固有の制約確認                     |
| P40 テスト実行ディレクトリ     | `.claude/rules/06-known-pitfalls.md#P40`                             | `cd apps/desktop` からのテスト実行根拠       |
| P42 文字列バリデーション       | `.claude/rules/06-known-pitfalls.md#P42`                             | IPC ハンドラの3段バリデーション確認根拠      |
| P48 non-null assertion 禁止    | `.claude/rules/06-known-pitfalls.md#P48`                             | non-null assertion 不使用の確認根拠          |
| P49 as キャスト禁止            | `.claude/rules/06-known-pitfalls.md#P49`                             | in 演算子による型ナロイングの確認根拠        |
| P55 正規表現メタ文字エスケープ | `.claude/rules/06-known-pitfalls.md#P55`                             | sanitizePrompt のパスマスク実装確認          |
| P61 DIP 準拠                   | `.claude/rules/06-known-pitfalls.md#P61`                             | IPC ハンドラ引数型のインターフェース確認根拠 |
| コーディング規約               | `.claude/rules/02-code-quality.md`                                   | any 型禁止・strict 型チェックの基準          |

## 実行手順

1. `outputs/phase-8/refactor-report.md` を読み取り、Phase 8 で変更したファイルと内容を把握する
2. Task 9-1: `pnpm lint` を実行する。エラーがあれば修正してから次へ進む
3. Task 9-2: `pnpm typecheck` を実行する。エラーがあれば修正してから次へ進む。non-null assertion / as キャストを `grep` で確認する
4. Task 9-3: `cd apps/desktop && pnpm vitest run` を実行する。失敗テストがあれば修正してから次へ進む
5. Task 9-4: `pnpm prettier --check` を実行する。差分がある場合は `pnpm prettier --write` で修正し、再確認する
6. Task 9-5: セキュリティ確認の `grep` コマンドを実行し、チャンネルホワイトリスト・sanitizePrompt・送信元検証・バリデーションを確認する。不備があれば修正する
7. 全ツールでエラー 0 件を達成したことを確認し、各ツールの実行結果（終了コード・件数）を成果物に記録する
8. `outputs/phase-9/quality-report.md` に実行結果を記録する

## 成果物テーブル

| 成果物            | パス                                | 完了条件                                                                   |
| ----------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| quality-report.md | `outputs/phase-9/quality-report.md` | Task 9-1〜9-5 の実行結果（各ツールの終了コード・件数）が全て記録されている |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスクを実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

本 Phase の品質検証結果は、Phase 10 最終レビューの前提条件として参照される。

- 全ツールでエラー 0 件を達成していない場合、Phase 10 へ進めない
- セキュリティ検証結果は Phase 10 Task 10-4 の入力として使用される

## 多角的チェック観点

| 観点         | 確認内容                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Lint 完全性  | 対象ファイルだけでなくプロジェクト全体で ESLint error/warning が 0 件であること                    |
| 型安全       | non-null assertion（P48）や as キャスト（P49）が残存していないこと                                 |
| テスト安定性 | happy-dom 環境での実行が安定していること（P39 対策）                                               |
| セキュリティ | sanitizePrompt・チャンネルホワイトリスト・送信元検証・P42 バリデーションの全確認が完了していること |

## 完了条件チェックリスト

- [ ] Task 9-1: `pnpm lint` が error 0 件・warning 0 件で終了していること
- [ ] Task 9-1: `no-unused-vars` / `no-unused-imports` のエラーが 0 件であること
- [ ] Task 9-1: `react-hooks/exhaustive-deps` のエラーが 0 件であること
- [ ] Task 9-2: `pnpm typecheck` が error 0 件で終了していること
- [ ] Task 9-2: `HandoffGuidance | null` 型の null 安全性が型レベルで保証されていること
- [ ] Task 9-2: `SkillImprovementHandoffRequest` の全フィールドに `any` 型が含まれていないこと
- [ ] Task 9-2: non-null assertion（`!`）が使用されていないこと（P48 準拠）
- [ ] Task 9-2: `as` キャストが使用されていないこと（P19 / P49 準拠）
- [ ] Task 9-2: IPC ハンドラ登録関数の引数型がインターフェースであること（P61 DIP 準拠）
- [ ] Task 9-3: `cd apps/desktop && pnpm vitest run` で全テスト PASS であること
- [ ] Task 9-3: happy-dom 環境で `userEvent.setup()` を使用していないこと（P39 準拠）
- [ ] Task 9-4: `pnpm prettier --check` でフォーマット差分 0 件であること
- [ ] Task 9-5: `skill:buildImprovementHandoff` チャンネルが `channels.ts` のホワイトリストに登録されていること
- [ ] Task 9-5: `buildForSkillImprovement()` が `sanitizePrompt()` を呼び出していること
- [ ] Task 9-5: `skill:buildImprovementHandoff` ハンドラに送信元ウィンドウ検証が実装されていること
- [ ] Task 9-5: `skill:buildImprovementHandoff` ハンドラの文字列引数に P42 準拠の3段バリデーションが実装されていること
- [ ] `outputs/phase-9/quality-report.md` が作成されていること

## 次 Phase

Phase 10 最終レビュー (`phase-10-final-review.md`)

- 入力: `outputs/phase-9/quality-report.md`、Phase 9 完了後のソースコード
- 目的: 多角的品質・整合性検証（PASS / MINOR / MAJOR / CRITICAL 判定）
