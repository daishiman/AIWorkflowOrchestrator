# Phase 9: 品質保証 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                        |
| --------- | --------------------------- |
| タスクID  | TASK-10A-G                  |
| Phase     | 9                           |
| 名称      | 品質保証                    |
| 依存Phase | Phase 8（リファクタリング） |
| 次Phase   | Phase 10（最終レビュー）    |

---

## 目的

Lint、TypeCheck、全テスト実行を通じて、Phase 4-8の成果物が品質基準を満たしていることを検証する。既存テストスイート全体への回帰影響がないことを確認する。

---

## 実行タスク

- Task 1: Lint と TypeCheck を通して静的品質を確認する
- Task 2: Layer 1〜3 と既存テスト群の回帰を確認する
- Task 3: 5ステップ品質ゲートを統合実行し、記録を残す

### Task 1: Lint実行・修正

`pnpm --filter @repo/desktop lint` を実行し、新規テストファイルにLintエラーがないことを確認する。

#### 実行コマンド

```bash
cd apps/desktop && pnpm lint
```

#### 確認対象ファイル

| ファイル                                                                      | Lint対象               |
| ----------------------------------------------------------------------------- | ---------------------- |
| `src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 対象                   |
| `src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 対象                   |
| `src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 対象（追加分のみ修正） |

#### Lintエラー修正方針

| エラー種別               | 対応方針                                              |
| ------------------------ | ----------------------------------------------------- |
| unused-imports           | 未使用importを削除する                                |
| no-explicit-any          | `unknown` 型または具体型に置換する                    |
| prefer-const             | `let` を `const` に変更する                           |
| no-unused-vars           | 未使用変数を削除するか `_` プレフィックスを付与する   |
| テストファイル固有の除外 | `vi.fn()` 等のVitestパターンは `.eslintrc` で許可済み |

#### 完了基準

- `pnpm lint` の終了コードが0（エラー0件）

### Task 2: TypeCheck実行・修正

`pnpm --filter @repo/desktop typecheck` を実行し、型エラーがないことを確認する。

#### 前提条件

```bash
# shared パッケージのビルドが必要（型定義の参照解決）
pnpm --filter @repo/shared build
```

#### 実行コマンド

```bash
cd apps/desktop && pnpm typecheck
```

#### 型エラー修正方針

| エラー種別                 | 対応方針                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| TS2345（型の不一致）       | モックの戻り値型を実際のIPC契約に合わせる                           |
| TS2339（プロパティ不存在） | 型定義を確認し、正しいプロパティ名に修正する                        |
| TS7006（暗黙的any）        | 引数に明示的な型注釈を付与する                                      |
| TS2352（型キャスト不可）   | `as unknown as TargetType` パターンを使用する（テストモックに限定） |

#### 完了基準

- `pnpm typecheck` の終了コードが0（エラー0件）

### Task 3: 対象テストファイル個別実行

3つのテストファイルを個別に実行し、全件PASSを確認する。

#### 実行手順

```bash
# Step 1: Layer 1 - Main IPC契約テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Step 2: Layer 2 - Renderer統合テスト
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Step 3: Layer 3 - 既存テスト整合
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

#### 期待結果

| ファイル                            | 期待PASS件数 | 期待FAIL件数 | 実行時間上限 |
| ----------------------------------- | ------------ | ------------ | ------------ |
| skillHandlers.create.test.ts        | 14件         | 0件          | 10秒         |
| SkillLifecycle.integration.test.tsx | 10件         | 0件          | 15秒         |
| ChatPanel.skill-management.test.tsx | 既存+4件     | 0件          | 15秒         |

### Task 4: 既存テストスイート回帰確認

新規テストファイルの追加が既存テストスイートに回帰影響を与えていないことを確認する。

#### 実行コマンド

```bash
# 既存のスキル関連テストを全件実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/
```

#### 回帰確認観点

| 観点                       | 確認方法                                                   |
| -------------------------- | ---------------------------------------------------------- |
| 既存テストのPASS件数維持   | 新規テスト追加前のPASS件数と比較する                       |
| モック汚染がないこと       | `vi.mock` のスコープが新規ファイル内に閉じていることを確認 |
| テスト実行順序の非依存性   | テストファイルの実行順序を変えても結果が同一であること     |
| 共有モジュールの副作用なし | Store・electronAPIのモック定義がファイル間で衝突しない     |

#### 完了基準

- 既存テストスイートの全件PASS（FAIL件数0）
- テスト実行時間が既存ベースラインから30%以上増加していない

### Task 5: 品質ゲート統合実行

Phase 2で定義した品質ゲートの5ステップを通しで実行する。

#### 統合実行手順

```bash
# Step 1: 共有パッケージビルド
pnpm --filter @repo/shared build

# Step 2: TypeCheck
pnpm --filter @repo/desktop typecheck

# Step 3: Layer 1 テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Step 4: Layer 2 テスト
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Step 5: Layer 3 テスト
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

#### 完了基準

- 5ステップ全てが終了コード0で完了する
- 全ステップの合計実行時間が120秒以内

---

## 品質基準

### カバレッジ基準（Phase 7で確認済みの値を再検証）

| 指標              | 基準値  | 対象                                            |
| ----------------- | ------- | ----------------------------------------------- |
| Line Coverage     | 80%以上 | `skillHandlers.ts` の `skill:create` ハンドラー |
| Branch Coverage   | 60%以上 | バリデーション分岐の網羅                        |
| Function Coverage | 80%以上 | `sanitizeErrorMessage`, `validateIpcSender`     |

### 実行時間基準

| ゲート                          | 上限  |
| ------------------------------- | ----- |
| 全テスト実行（Layer 1+2+3）     | 30秒  |
| 品質ゲート統合（typecheck含む） | 120秒 |

---

## 参照資料

| 参照資料         | パス                                                                                              | 使用セクション     |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md` | Green後の実体確認  |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       | カバレッジ基準     |
| テストパターン   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                 | テスト実行パターン |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             | エラーコード検証   |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                        | Phase 9 実行ルール |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                      | セキュリティテスト |

---

## 成果物

| 成果物       | パス                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| 品質レポート | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-9/quality-report.md` |

---

## 統合テスト連携

| 連携対象     | このPhaseで確認する内容         | 次Phaseへの受け渡し     |
| ------------ | ------------------------------- | ----------------------- |
| Layer 1/2/3  | 個別実行と統合実行の両方で PASS | Phase 10 のレビュー証跡 |
| 既存スイート | 回帰・実行時間増分の有無        | Phase 10 の判定材料     |

### 品質レポート記載内容

| セクション         | 記載内容                               |
| ------------------ | -------------------------------------- |
| Lint結果           | エラー件数、修正内容、修正前後のdiff   |
| TypeCheck結果      | エラー件数、修正内容、修正前後のdiff   |
| テスト実行結果     | 各ファイルのPASS/FAIL件数、実行時間    |
| 回帰確認結果       | 既存テストスイートのPASS件数、影響有無 |
| 品質ゲート統合結果 | 5ステップの実行結果、合計実行時間      |
| カバレッジ         | Line/Branch/Function の各値            |

---

## 完了条件

- [ ] `pnpm lint` がエラー0件で完了している
- [ ] `pnpm typecheck` がエラー0件で完了している
- [ ] Layer 1 テスト: 14件PASS、0件FAIL
- [ ] Layer 2 テスト: 10件PASS、0件FAIL
- [ ] Layer 3 テスト: 全件PASS（既存+追加4件）、0件FAIL
- [ ] 既存テストスイート全体に回帰なし
- [ ] 品質ゲート5ステップが全て終了コード0で完了している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲート合計実行時間が120秒以内
- [ ] 品質レポートが作成されている

---

## 次Phase

Phase 10（最終レビュー）: 多角的品質・整合性検証を実施し、PASS/MINOR/MAJOR/CRITICAL判定を行う。
