# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 8                                |
| タスクID  | TASK-9E-SKILL-FORK               |
| 機能名    | skill-fork（スキルフォーク機能） |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 7（テストカバレッジ確認）  |
| 次Phase   | Phase 9（品質保証）              |

## 目的

Phase 5〜7 で実装・テスト済みの SkillForker の動作を変えずに、コード品質を改善する。重複排除、命名改善、構造整理を行い、保守性・可読性を向上させる。

## 背景

SkillForker はディレクトリコピー、SKILL.md 書き換え、fork-metadata.json 生成という複数の責務を持つ。Phase 5 の実装では動作優先で書かれた箇所があり、TDD の Refactor フェーズとしてコード品質を引き上げる。

## 実行タスク

- タスク1: SkillForker のメソッド分割で責務境界を明確化する
- タスク2: ディレクトリコピーロジックの重複を共通化する
- タスク3: エラーメッセージ定数化で保守性を高める
- タスク4: P42準拠の共通バリデーションロジックを抽出する
- タスク5: 命名規則・型定義を監査しドリフトを解消する

### タスク1: SkillForker のメソッド分割（責務の明確化）

**目的**: 単一メソッドに集中した処理を、責務ごとに独立したメソッドへ分割する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillForker.ts` の全メソッドを確認
2. 1メソッドあたり30行超の処理を特定
3. 以下の責務単位でメソッド分割を検討:
   - ディレクトリコピーロジック
   - SKILL.md 書き換えロジック
   - fork-metadata.json 生成ロジック
   - SkillForkOptions バリデーションロジック
4. 分割後にテストを実行し、全テストが成功することを確認

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
```

**期待される成果物**: `outputs/phase-8/refactoring-notes.md`

### タスク2: ディレクトリコピーロジックの汎用化

**目的**: agents/references/scripts/assets の各サブディレクトリコピー処理で重複しているロジックを共通関数に抽出する。

**実行手順**:

1. `copyAgents`、`copyReferences`、`copyScripts`、`copyAssets` の各コピー処理を比較
2. 共通パターン（存在確認→ディレクトリ作成→ファイルコピー→結果記録）を抽出
3. 汎用的な `copySubdirectory(source, target, dirName)` 関数への統合を検討
4. 分割後にテストを実行し、全テストが成功することを確認

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
```

**期待される成果物**: `outputs/phase-8/refactoring-notes.md`

### タスク3: エラーメッセージの定数化

**目的**: ハードコードされたエラーメッセージ文字列を定数に抽出し、一元管理する。

**実行手順**:

1. SkillForker 内のエラーメッセージ文字列を全て列挙
2. IPCハンドラー（skillHandlers.ts）内のバリデーションエラーメッセージも列挙
3. 定数ファイル（またはクラス内定数）への抽出を実施
4. テスト内のエラーメッセージ期待値も定数参照に更新

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
```

**期待される成果物**: `outputs/phase-8/refactoring-notes.md`

### タスク4: 共通バリデーションロジックの抽出

**目的**: SkillForkOptions のバリデーション処理を、IPCハンドラーとサービス層で共有可能な形に抽出する。

**実行手順**:

1. IPCハンドラー（skillHandlers.ts）での `skill:fork` 引数バリデーションを確認
2. SkillForker 内のバリデーション処理を確認
3. P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が両方で適用されていることを確認
4. 重複するバリデーションロジックを共通ユーティリティに抽出

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts
```

**期待される成果物**: `outputs/phase-8/refactoring-notes.md`

### タスク5: 命名規則・型定義統一確認

**目的**: 変数名・メソッド名・型定義がプロジェクト規約に準拠していることを確認する。

**実行手順**:

1. boolean 変数名が `is`/`has`/`can`/`should` プレフィックスを持つことを確認
2. SkillForkOptions/SkillForkResult/SkillForkMetadata の型定義が `packages/shared/src/types/skill-fork.ts` と `apps/desktop/src/preload/skill-api.ts` で一致していることを確認（P32 対策）
3. 引数名のセマンティクスが実際の値と一致していることを確認（P45 対策）
4. 不一致がある場合は修正し、テストを再実行

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
pnpm --filter @repo/shared exec tsc --noEmit
```

**期待される成果物**: `outputs/phase-8/refactoring-notes.md`

## 参照資料

| 資料名            | パス                                                                                              | 説明                                |
| ----------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 成果物    | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-1/requirements-definition.md` | 要件制約の再確認                    |
| Phase 2 成果物    | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-2/architecture-design.md`     | 設計意図の再確認                    |
| Phase 5 実装      | `apps/desktop/src/main/services/skill/SkillForker.ts`                                             | SkillForker 実装コード              |
| Phase 6 成果物    | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-6/test-expansion.md`          | 拡充テストで検出した弱点            |
| Phase 7 成果物    | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-7/coverage-report.md`         | カバレッジゲート判定結果            |
| Phase 4 テスト    | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                              | テストコード                        |
| IPCハンドラー     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                      | skill:fork ハンドラー               |
| 型定義（共有）    | `packages/shared/src/types/skill-fork.ts`                                                         | SkillForkOptions/SkillForkResult 型 |
| 型定義（Preload） | `apps/desktop/src/preload/skill-api.ts`                                                           | Preload 層の型定義                  |
| 既知の落とし穴    | `.claude/rules/06-known-pitfalls.md`                                                              | P32, P42, P45 対策                  |

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts

# 全テスト成功確認
cd apps/desktop && pnpm vitest run
```

| テスト対象       | 確認内容                          | 期待結果 |
| ---------------- | --------------------------------- | -------- |
| SkillForker 単体 | 全テストケースが成功              | ALL PASS |
| IPCハンドラー    | skill:fork ハンドラーテストが成功 | ALL PASS |
| 型チェック       | TypeScript コンパイルエラーなし   | エラー 0 |
| カバレッジ       | Phase 7 確認時のカバレッジ維持    | 基準以上 |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                               |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | ✅       | パストラバーサル防止ロジックがリファクタリング後も機能 |
| アーキテクチャ     | ✅       | SRP・DIP 準拠、レイヤー依存方向の維持                  |
| API設計            | ✅       | IPC チャンネル契約がリファクタリング後も不変           |
| エラーハンドリング | ✅       | エラーメッセージの定数化後もユーザーフレンドリー       |

## 成果物

| 成果物                       | パス                                   | 説明                         |
| ---------------------------- | -------------------------------------- | ---------------------------- |
| メソッド分割分析             | `outputs/phase-8/refactoring-notes.md` | SkillForker メソッド分割結果 |
| ディレクトリコピーリファクタ | `outputs/phase-8/refactoring-notes.md` | コピーロジック共通化結果     |
| エラーメッセージ定数化       | `outputs/phase-8/refactoring-notes.md` | 定数化実施結果               |
| バリデーションリファクタ     | `outputs/phase-8/refactoring-notes.md` | バリデーション共通化結果     |
| 命名規則・型監査             | `outputs/phase-8/refactoring-notes.md` | 命名規則・型定義の監査結果   |

## 完了条件

- [ ] SkillForker の全テストが成功（リファクタリング前後で動作不変）
- [ ] IPCハンドラーテストが全て成功
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] カバレッジが Phase 7 確認時と同等以上
- [ ] メソッド分割による責務の明確化が完了
- [ ] ディレクトリコピーロジックの重複が排除されている
- [ ] エラーメッセージが定数化されている
- [ ] P42 準拠の3段バリデーションが維持されている
- [ ] P32 準拠の型定義一致が確認されている
- [ ] P45 準拠の引数名セマンティクス一致が確認されている
- [ ] 5つの分析レポートが `outputs/phase-8/` に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] カバレッジが低下していないことを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: SkillForker のメソッド分割
3. タスク2: ディレクトリコピーロジックの汎用化
4. タスク3: エラーメッセージの定数化
5. タスク4: 共通バリデーションロジックの抽出
6. タスク5: 命名規則・型定義統一確認
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9: 品質保証
