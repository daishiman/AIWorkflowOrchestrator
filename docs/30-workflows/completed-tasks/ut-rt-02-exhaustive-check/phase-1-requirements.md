# Phase 1: 要件定義

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 1                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

`assertNever` の既存実装有無を確認し、`RuntimeSkillCreatorExecuteResult` union 型の現状を把握する。タスク分類（NON_VISUAL / docs-only か実装タスクか）を明示し、受け入れ基準を確定する。

## 実行タスク

- P50チェック: 対象ファイルの現在の実装状態を確認
- assertNever調査: プロジェクト内のassertNever実装を検索
- union型調査: `RuntimeSkillCreatorExecuteResult`の全バリアント列挙
- タスク分類宣言: UI task / NON_VISUAL taskの分類を記録
- 受け入れ基準定義: 検証可能な受け入れ条件を列挙

## 参照資料

| 資料名             | パス                                                                                              | 説明                       |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------- |
| 実装対象ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | executeAsync()の現実装     |
| 既存テスト         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-06テスト           |
| 元未タスク仕様書   | `docs/30-workflows/unassigned-task/task-runtime-execute-response-exhaustive-check.md`             | 背景・問題点の詳細         |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`       | TypeScript union型パターン |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             | エラーカテゴリ体系         |

## 実行手順

### ステップ0: P50チェック — 既実装状態の調査【必須】

```bash
# ブランチ変更の取得（untracked を含める）
git status --short --branch
git diff --stat
git diff --name-only

# 対象ファイルの最近のコミット履歴
git log --oneline -10 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# executeAsync関数の現実装確認
grep -n "executeAsync\|isStructuredError\|assertNever\|switch" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

| 判定             | 条件                              | 対応                        |
| ---------------- | --------------------------------- | --------------------------- |
| 既にswitch化済み | `assertNever`が既に実装されている | テスト整合モードに切り替え  |
| if-else のみ     | `isStructuredError`の条件分岐のみ | TDDで新規実装（通常フロー） |
| 関数が存在しない | `executeAsync`が見つからない      | ユーザーに確認              |

**補足**: `git diff` だけでは未追跡ファイルを拾えないため、`git status --short --branch` を必ず併用する。

### ステップ1: assertNever既存実装の確認

```bash
# プロジェクト全体でassertNeverを検索
grep -rn "assertNever\|export function.*never" packages/shared/src/ apps/desktop/src/
grep -rn "assertNever" packages/ apps/
```

確認事項：

- `packages/shared/src/utils/` 配下に `assertNever` が存在するか
- `apps/desktop/src/` 配下に同等の関数が存在するか
- 関数のシグネチャ: `(x: never): never` 形式になっているか

### ステップ2: union型現状調査

```bash
# RuntimeSkillCreatorExecuteResponseまたはResultの型定義を確認
grep -rn "RuntimeSkillCreatorExecute\|RuntimeSkillCreatorTerminalHandoff" \
  packages/shared/src/ apps/desktop/src/main/services/runtime/

# 型定義ファイルを特定
grep -rn "type RuntimeSkillCreatorExecute" apps/desktop/src/ packages/
```

確認事項：

- union 型の全バリアントを列挙（`RuntimeSkillCreatorTerminalHandoff` / `RuntimeSkillCreatorExecuteErrorResponse` / `SkillExecuteResult`）
- 各バリアントの判別子プロパティ（discriminant）が `boolean` か `literal` 型かを確認

### ステップ3: executeAsync()の現分岐確認

```bash
# executeAsyncの実装ブロックを確認
grep -A 30 "executeAsync" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

確認事項：

- 現在の `if (!result.success)` パターンの全分岐を把握
- switch 化対象箇所の特定

### ステップ4: タスク分類宣言

本タスクの分類を以下の通り確定する：

| 分類項目   | 判定                     | 理由                               |
| ---------- | ------------------------ | ---------------------------------- |
| タスク種別 | 実装タスク（リファクタ） | コード変更を伴う                   |
| UI変更     | NON_VISUAL               | Main Processの変更のみ、UI変更なし |
| テスト戦略 | ユニットテスト主体       | Vitestで自動テスト済み             |

## 受け入れ基準（Acceptance Criteria）

| AC ID | 基準                                                                   | 検証方法                                |
| ----- | ---------------------------------------------------------------------- | --------------------------------------- |
| AC-1  | `executeAsync()` が switch 文 + `assertNever` パターンで実装されている | コードレビュー                          |
| AC-2  | `assertNever` が switch の default case に配置されている               | コードレビュー                          |
| AC-3  | union 型に仮バリアントを追加するとコンパイルエラーが発生する           | `pnpm typecheck` で確認                 |
| AC-4  | 既存テスト T-01〜T-06 が全て PASS する（回帰なし）                     | `pnpm vitest run <testfile>`            |
| AC-5  | TypeScript 型チェックエラー 0 件                                       | `pnpm --filter @repo/desktop typecheck` |
| AC-6  | ESLint エラー 0 件                                                     | `pnpm --filter @repo/desktop lint`      |

## 統合テスト連携

本タスクはリファクタリングのみで API/IPC に変更なし。統合テスト連携は「既存テストの回帰確認」が主体となる。

| 連携項目     | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| 回帰確認対象 | T-01〜T-06 (RuntimeSkillCreatorFacade.executeAsync.test.ts) |
| 型レベル確認 | `pnpm typecheck` で型エラー 0 件                            |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                             |
| ------------------ | ---- | ---------------------------------------------------- |
| アーキテクチャ     | ✅   | assertNever の配置場所がプロジェクト慣習と整合するか |
| エラーハンドリング | ✅   | structured error パスの分岐が網羅されているか        |
| セキュリティ       | N/A  | 認証・認可変更なし                                   |
| UI/UX              | N/A  | UI変更なし（NON_VISUAL）                             |

## 成果物

| 成果物         | パス                                     | 説明                                   |
| -------------- | ---------------------------------------- | -------------------------------------- |
| 要件定義メモ   | `outputs/phase-1/requirements.md`        | assertNever有無・union型バリアント一覧 |
| タスク分類記録 | `outputs/phase-1/task-classification.md` | NON_VISUAL宣言・受け入れ基準           |

## 完了条件

- [ ] assertNever の有無が確認済み（パスも記録）
- [ ] union 型の全バリアントが列挙されている
- [ ] 各バリアントの判別子プロパティの型（literal or boolean）が確認済み
- [ ] executeAsync() の現在の分岐構造が把握済み
- [ ] タスク分類（NON_VISUAL / リファクタリング）が宣言されている
- [ ] 受け入れ基準（AC-1〜AC-6）が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. P50チェック（実装状態調査）
2. assertNever既存実装の確認
3. union型バリアント列挙
4. executeAsync()現分岐確認
5. タスク分類宣言・受け入れ基準記録
6. 成果物（requirements.md / task-classification.md）の作成

## 次のPhase

Phase 2: 設計

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 1
```
