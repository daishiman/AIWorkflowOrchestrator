# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | -                                       |
| 後続Phase  | Phase 2                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

## 目的

`SkillCreatorService.createSkill()` の現状コードを確認し、進捗コールバック引数追加の要件と
受け入れ基準を固定する。フロント・Preload・メインプロセスの3層接続が設計上どこで断絶しているかを
明確にし、本タスクのスコープを確定する。

## 実行タスク

- P50チェック: 対象ファイルの現状確認・既実装コードの inventory 調査
- 断絶箇所の特定: `sendSkillCreatorProgress()` の呼び出し元が存在しない事実を確認
- 受け入れ基準定義: AC-1〜AC-5 を検証可能な形で固定
- タスク分類宣言: 本タスクは **バグ修正タスク / 非UIタスク / NON_VISUAL**

## 参照資料

| 資料名                  | パス                                                                                    | 用途                          |
| ----------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| phase-1-analysis.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` | 問題1の現状分析               |
| phase-2-solution.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 解決策設計                    |
| phase-3-review.md       | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md`   | タスク粒度・スコープ確認      |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 修正対象ファイル              |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                     | sendSkillCreatorProgress 参照 |
| useStreamingProgress.ts | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                               | フロント側接続確認            |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# SkillCreatorService.ts の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/main/services/skill/SkillCreatorService.ts

# createSkill メソッドのシグネチャ確認
grep -n "createSkill" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# onProgress / コールバック引数の既存実装確認
grep -n "onProgress\|callback" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# sendSkillCreatorProgress の実装確認
grep -n "sendSkillCreatorProgress" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# sendSkillCreatorProgress の呼び出し元確認（呼び出し元なしを確認）
grep -rn "sendSkillCreatorProgress" apps/ packages/
```

### 1. 断絶箇所の確認

設計書（phase-1-analysis.md）で特定された断絶箇所を実際のコードで確認する:

| 断絶箇所                                    | 期待する確認内容                                                 |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `sendSkillCreatorProgress` の呼び出し元なし | `grep -rn "sendSkillCreatorProgress"` の結果が定義のみであること |
| `createSkill` にコールバック引数なし        | メソッドシグネチャに `onProgress` 引数が存在しないこと           |
| 処理の節目でコールバック呼び出しなし        | `SkillCreatorService.ts` 内に進捗通知コードが存在しないこと      |

### 2. フロント側接続の確認（変更不要の確認）

```bash
# useStreamingProgress の onProgress 登録確認
grep -n "onProgress\|safeOn\|SKILL_CREATOR_PROGRESS" apps/desktop/src/renderer/hooks/useStreamingProgress.ts

# Preload 側の onProgress 実装確認
grep -n "onProgress\|SKILL_CREATOR_PROGRESS" apps/desktop/src/preload/skill-creator-api.ts
```

フロント・Preload 側はすでに正しく実装済みであることを確認する。

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                         | 検証方法                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| AC-1 | `createSkill()` が第2引数 `onProgress?: (progress: SkillCreatorProgressData) => void` を受け取ること | TypeScript 型チェック（`pnpm typecheck`）が 0 error                         |
| AC-2 | `runCreateWorkflow` 開始時に `onProgress` が `{ phase: "planning", percentage: 10 }` で呼ばれること  | テスト: `onProgress` モックが `planning` フェーズで呼ばれることを検証       |
| AC-3 | SKILL.md 生成・エージェント定義生成・検証・完了の各段階で `onProgress` が適切な値で呼ばれること      | テスト: 4段階分のコールバック呼び出しをモックで検証                         |
| AC-4 | `onProgress` が未指定（`undefined`）の場合でも `createSkill` が正常動作すること                      | テスト: `onProgress` を渡さない既存呼び出しパターンがエラーなく動作すること |
| AC-5 | 既存のテスト（`skillCreatorHandlers.validation.test.ts` 等）が型エラーなしで通過すること             | `pnpm --filter @repo/desktop exec vitest run` が PASS                       |

### 4. タスク分類の宣言

| 分類項目   | 値                                       |
| ---------- | ---------------------------------------- |
| タスク種別 | バグ修正タスク                           |
| UIタスク   | 非UIタスク（UIの見た目変更なし）         |
| 可視性     | NON_VISUAL（メインプロセス内部変更のみ） |
| テスト種別 | ユニットテスト（メインプロセス層）       |

### 5. スコープ外の明確化

本タスク（TASK-SW-STREAM-001）のスコープ外:

- `skillCreatorHandlers.ts` でのコールバック接続（TASK-SW-STREAM-002 のスコープ）
- フロント・Preload 側の変更（変更不要）
- キャンセル処理の IPC 接続（TASK-SW-CANCEL-001〜004 のスコープ）

## 統合テスト連携【必須】

| 判定項目                | 基準 | 結果    |
| ----------------------- | ---- | ------- |
| ユニットテスト Line     | 80%+ | pending |
| ユニットテスト Branch   | 60%+ | pending |
| ユニットテスト Function | 80%+ | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                                     |
| -------------- | -------------------------------------------------------------------------------- |
| 後方互換性     | `onProgress` をオプショナルにすることで既存呼び出し元への影響がないか            |
| 型整合性       | `SkillCreatorProgressData` の型が `useStreamingProgress.ts` の期待型と一致するか |
| スコープ境界   | フロント・Preload 側の変更が本タスクのスコープ外であることが明確か               |
| 依存タスク整合 | TASK-SW-STREAM-002 が本タスクの成果物を前提とすることが明確か                    |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-5 一覧   |

## 完了条件

- [ ] P50チェック実施済み（`createSkill` にコールバック引数がないことを確認）
- [ ] `sendSkillCreatorProgress` の呼び出し元が存在しないことを確認済み
- [ ] フロント・Preload 側が変更不要であることを確認済み
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] タスク分類（バグ修正 / 非UIタスク / NON_VISUAL）を宣言済み
- [ ] スコープ外（TASK-SW-STREAM-002）との境界が明確
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（対象ファイルの現状確認）
2. 断絶箇所の確認（sendSkillCreatorProgress 呼び出し元なし）
3. フロント側接続の確認（変更不要の確認）
4. 受け入れ基準（AC-1〜AC-5）の固定
5. タスク分類の宣言
6. スコープ外の明確化
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
