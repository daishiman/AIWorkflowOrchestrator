# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 8                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

TDD の Refactor フェーズとして、`execute()` に追加した `terminal_handoff` 分岐が `plan()` / `improve()` と一貫したパターンになっているかを確認する。重複コードの排除余地を検討し、必要な場合のみ共通ヘルパーを抽出する。本タスクは小規模修正であるため、大規模リファクタリングは行わない。

## 実行タスク

1. パターン一貫性の確認（`plan` / `improve` / `execute` 3メソッド横断）
2. 重複排除の要否判断
3. 型定義の整合性確認（`RuntimeSkillCreatorExecuteResponse`）
4. コードコメントの整備

## 参照資料

- Phase 5 成果物: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-05-implementation.md`
- Phase 4 成果物: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-04-test-creation.md`
- 修正対象ファイル:
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `packages/shared/src/types/skillCreator.ts`

## 実行手順

### Step 1: 3メソッドのパターン比較

`RuntimeSkillCreatorFacade.ts` を開き、`plan()` / `improve()` / `execute()` の各メソッドを横断的に確認する。

確認ポイント:

- `handoffBuilder.build()` の呼び出しパターンが統一されているか
- `terminal_handoff` 分岐の条件式（`response.type === "terminal_handoff"`）が一貫しているか
- エラーハンドリングのパターンが揃っているか
- `Result<T, E>` の返却形式が統一されているか

### Step 2: 重複排除の要否判断

以下の観点で共通ヘルパー抽出の必要性を評価する。

| 観点           | 判断基準                                                        |
| -------------- | --------------------------------------------------------------- |
| 重複行数       | 3メソッド × 同一ロジック行数が 10 行以上なら抽出を検討          |
| 将来の変更頻度 | `terminal_handoff` の処理が今後変わる可能性が高ければ集約が有利 |
| 可読性         | ヘルパー抽出後に各メソッドの責務が明確になるか                  |
| テスト容易性   | ヘルパーを独立してテストできるか                                |

**本タスクの判断**: `execute()` の追加は小規模（数行〜十数行程度）であり、重複コード量が閾値未満の場合はヘルパー抽出を見送る。判断結果を実行手順 Step 4 に記録する。

### Step 3: `RuntimeSkillCreatorExecuteResponse` 型の確認

`packages/shared/src/types/skillCreator.ts` を確認し、以下を検証する。

- `RuntimeSkillCreatorExecuteResponse` が正しく定義されていること
- `export` が付与されていること（Phase 9 の grep 確認に対応）
- `terminal_handoff` ケースの型フィールドが `plan` / `improve` の対応型と整合していること

型フィールドの対応表（確認用）:

| レスポンス型                         | 通常ケース（Result 型）            | terminal_handoff ケース                                       |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------- |
| `RuntimeSkillCreatorPlanResponse`    | `RuntimeSkillCreatorPlanResult`    | `{ type: "terminal_handoff"; bundle: TerminalHandoffBundle }` |
| `RuntimeSkillCreatorImproveResponse` | `RuntimeSkillCreatorImproveResult` | `{ type: "terminal_handoff"; bundle: TerminalHandoffBundle }` |
| `RuntimeSkillCreatorExecuteResponse` | `RuntimeSkillCreatorExecuteResult` | `{ type: "terminal_handoff"; bundle: TerminalHandoffBundle }` |

### Step 4: コードコメントの整備

以下の箇所にコメントが必要か確認し、必要な場合のみ追加する。

- `execute()` の `terminal_handoff` 分岐に、なぜ `SkillExecutor` を呼ばないかの理由コメント
  - 例: `// terminal_handoff: SkillExecutorは呼び出さず、ハンドオフガイダンスを返してCallerに委ねる`
- 重複排除を見送った場合、その理由を TODO/FIXME コメントとして残す必要はない（判断根拠はこのドキュメントに記録する）

### Step 5: `void decision` の不在確認

リファクタリング後、`void` キーワードを誤用している箇所がないかを確認する。

```bash
grep -rn "void decision\|void result\|void response" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

0件であることを確認する。

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本フェーズでのリファクタリング変更後、Phase 4 で作成したテストが引き続き全 PASS であることを確認する。

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

リファクタリングによってテストが破壊された場合、テスト変更ではなく実装を修正する（テストが仕様の守護者であるため）。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物                           | パス                                                                  | 説明                                              |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| リファクタリング済み実装ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 必要な場合のみ変更あり                            |
| パターン一貫性確認レポート       | 本ドキュメントの Step 2 記録欄                                        | 3メソッドのパターン比較結果と重複排除判断         |
| 型整合確認済みファイル           | `packages/shared/src/types/skillCreator.ts`                           | RuntimeSkillCreatorExecuteResponse の整合確認済み |

## 完了条件

- [ ] `plan()` / `improve()` / `execute()` の `terminal_handoff` 処理パターンが一貫している
- [ ] 重複排除の要否を判断し、判断根拠を記録した
- [ ] `RuntimeSkillCreatorExecuteResponse` が `export` されており、型フィールドが整合している
- [ ] `void decision` 等の誤用が 0 件
- [ ] リファクタリング後もテストが全 PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 9: 品質検証 (`phase-09-quality.md`)
