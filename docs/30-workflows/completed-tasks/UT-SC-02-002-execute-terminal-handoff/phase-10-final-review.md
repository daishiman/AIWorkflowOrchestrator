# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 10                                    |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

実装・リファクタリング・品質検証を経た最終成果物を多角的に検証し、受入基準（AC-1〜AC-6）と非機能要件（NFR-1・NFR-2）を充足しているかを確認する。セキュリティ観点・後方互換性・パターン統一を重点的にレビューし、PASS / MINOR / MAJOR / CRITICAL のいずれかで判定を下す。

## 実行タスク

1. AC-1〜AC-6 の充足確認
2. セキュリティ観点レビュー（`terminal_handoff` 時の `SkillExecutor` 非呼び出し）
3. NFR-1（3メソッドのパターン統一）の確認
4. NFR-2（後方互換性: `integrated_api` パスの動作不変）の確認
5. 判定の決定と指摘事項の記録

## 参照資料

- Phase 1 成果物（受入基準定義）: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-01-requirements.md`
- Phase 2 成果物（設計）: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-02-design.md`
- Phase 9 成果物（品質検証サマリー）: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-09-quality.md`
- セキュリティルール: `.claude/rules/04-electron-security.md`
- 既知の落とし穴: `.claude/rules/06-known-pitfalls.md#P44`（IPC インターフェース不整合）
- 修正対象ファイル:
  - `packages/shared/src/types/skillCreator.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

## 実行手順

### Step 1: 受入基準（AC）の充足確認

以下の各 AC を対象コードと照合し、充足・未充足・部分充足を記録する。

| AC   | 内容（Phase 1 AC との対応）                                                                                     | 充足状況 | 確認箇所 |
| ---- | --------------------------------------------------------------------------------------------------------------- | -------- | -------- |
| AC-1 | `execute()` が `terminal_handoff` 判定時に `SkillExecutor.execute()` を呼ばない                                 |          |          |
| AC-2 | `execute()` が `terminal_handoff` 時に `{ type: "terminal_handoff", bundle: TerminalHandoffBundle }` を返却する |          |          |
| AC-3 | `RuntimeSkillCreatorExecuteResponse` Union型が定義されている                                                    |          |          |
| AC-4 | `void decision;` が除去されている                                                                               |          |          |
| AC-5 | 3メソッド（plan/improve/execute）の terminal_handoff パターンが統一されている                                   |          |          |
| AC-6 | 関連テストが全て PASS する                                                                                      |          |          |

全項目が「充足」であることが PASS の前提条件となる。

### Step 2: セキュリティ観点レビュー

`terminal_handoff` 時に `SkillExecutor` が呼ばれないことは、以下の理由からセキュリティ上重要である。

- `SkillExecutor` はシステムコマンドやファイルアクセスを実行する権限を持つ
- `terminal_handoff` はユーザー確認を経ずに直接実行することを避けるための分岐であり、呼び出し元（Caller）へ処理を委ねる設計
- この分岐を迂回して `SkillExecutor` を直接呼べないかを確認する

確認コマンド（`SkillExecutor` の呼び出しが `integrated_api` 分岐にのみ存在することを検証）:

```bash
grep -n "SkillExecutor\|skillExecutor" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

期待される結果:

- `terminal_handoff` ブロック内に `skillExecutor` の呼び出しが存在しないこと
- `integrated_api` ブロック内にのみ `skillExecutor` の呼び出しが存在すること

この確認が取れない場合は **MAJOR** 判定とし、Phase 5 に戻って実装を修正する。

### Step 3: NFR-1（3メソッドのパターン統一）の確認

`plan()` / `improve()` / `execute()` の各メソッドが、`terminal_handoff` の処理パターンとして統一されているかを確認する。

確認ポイント:

- 条件式が `response.type === "terminal_handoff"` で統一されているか
- `handoffBuilder.build()` の呼び出し引数形式が一致しているか
- 戻り値の構造（`Result<T, E>` の `ok()` / `err()` ラッピング）が一致しているか

```bash
grep -A5 "terminal_handoff" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

各メソッドの該当ブロックを目視で比較し、パターンが揃っていることを確認する。

不統一が見つかった場合は指摘事項として記録する（重大度に応じて MINOR または MAJOR を判定）。

### Step 4: NFR-2（後方互換性）の確認

`integrated_api` パスの動作が変わっていないことを確認する。

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  --reporter=verbose
```

確認ポイント:

- `integrated_api` ケースのテストが全て PASS していること
- `execute()` の `integrated_api` パスに対して、Phase 5 以前から存在するテストケースが変更・削除されていないこと
- 新規追加テストが `integrated_api` の既存挙動に干渉していないこと

既存テストが破壊されている場合は **MAJOR** 判定とし、Phase 5 に戻って実装を修正する。

### Step 5: 指摘事項の記録と判定

以下のテーブルに指摘事項を記録する（実行時に埋める）。

| No. | 重大度 | 指摘内容 | 対応方法 |
| --- | ------ | -------- | -------- |
| 1   |        |          |          |

判定基準:

| 判定     | 条件                                                                             | 対応                                         |
| -------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| PASS     | 全 AC 充足、セキュリティ確認 OK、NFR-1/2 OK、指摘事項なし                        | Phase 11 へ進む                              |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響しない）                                 | 指摘を未タスク仕様書に変換後 Phase 11 へ進む |
| MAJOR    | AC 未充足、セキュリティ問題、NFR 違反のいずれか                                  | 影響範囲に応じて Phase 1〜5 へ戻る           |
| CRITICAL | `terminal_handoff` 時に `SkillExecutor` が実際に呼ばれる等の重大セキュリティ問題 | Phase 1 へ戻り要件を再確認する               |

**判定**: （実行時に記入）

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

Phase 10 において、`RuntimeSkillCreatorFacade` を使用する上流 IPC ハンドラのテストも確認対象とする。

```bash
grep -rn "RuntimeSkillCreatorFacade" \
  apps/desktop/src/main/ \
  --include="*.test.ts"
```

ヒットしたテストファイルが存在する場合、それらも実行して動作確認する。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物                     | パス                  | 説明                                       |
| -------------------------- | --------------------- | ------------------------------------------ |
| AC充足確認テーブル         | 本ドキュメント Step 1 | AC-1〜AC-6 の充足状況と確認箇所            |
| セキュリティ確認grep結果   | 本ドキュメント Step 2 | SkillExecutor 呼び出し箇所の grep 出力     |
| NFR-1パターン統一確認結果  | 本ドキュメント Step 3 | 3メソッドの terminal_handoff パターン比較  |
| NFR-2後方互換性確認結果    | 本ドキュメント Step 4 | integrated_api パスのテスト実行結果        |
| 指摘事項テーブルと最終判定 | 本ドキュメント Step 5 | PASS/MINOR/MAJOR/CRITICAL の判定と指摘内容 |

## 完了条件

- [ ] AC-1〜AC-6 が全て「充足」であること
- [ ] `terminal_handoff` ブロック内に `skillExecutor` の呼び出しが存在しないことを grep で確認済み
- [ ] NFR-1: `plan()` / `improve()` / `execute()` の `terminal_handoff` 処理パターンが統一されていること
- [ ] NFR-2: `integrated_api` パスの既存テストが全 PASS であること
- [ ] 判定が PASS または MINOR（MINOR の場合は未タスク仕様書が作成されていること）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

- PASS / MINOR: Phase 11 手動テスト (`phase-11-manual-test.md`)
- MAJOR: 影響範囲に応じて Phase 1〜5 へ戻る
- CRITICAL: Phase 1 へ戻り要件を再確認する
