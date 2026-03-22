# Phase 10: 最終レビュー - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 10 - 最終レビュー                           |
| 関連Issue | #1434                                       |
| 前提Phase | Phase 9（品質検証）                         |
| 作成日    | 2026-03-21                                  |

## 目的

実装全体を多角的に検証し、品質・整合性・セキュリティの観点から最終確認を行う。
PASS/MINOR/MAJOR/CRITICAL の4段階で判定し、MINOR 以上の指摘は全て未タスク仕様書に変換する。

## 実行タスク

1. セキュリティレビュー: `validateIpcSender` / `sanitizeErrorMessage` の全適用を確認する
2. IPC 契約三方整合検証: `channels.ts` ↔ `creatorHandlers.ts` ↔ `skill-creator-api.ts` の定義一致を確認する
3. DI 整合確認: `SkillExecutor` / `authKeyService` の注入パスが正しく通ることを確認する
4. テストカバレッジ確認: Line 80%+、Branch 60%+、Function 80%+ の充足を確認する
5. 既存テスト回帰確認: `skillCreatorHandlers` 系 85 テストが全 PASS であることを確認する
6. 既知落とし穴照合: P44（internal role 非公開）、P5（二重登録防止）、P42（3段バリデーション）との整合を確認する
7. レビューゲート判定: PASS / MINOR / MAJOR / CRITICAL を判定する

## 参照資料

| 資料名                 | パス                                                                                 | 説明                         |
| ---------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 要件定義書     | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-01-requirements.md`        | 受入条件 AC-1〜AC-5          |
| Phase 2 設計書         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`              | アーキテクチャ設計           |
| 設計レビュー           | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-03-design-review.md`       | MINOR-01/02 指摘事項         |
| Phase 5 実装書         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`      | 実装判断の正本               |
| channels.ts            | `apps/desktop/src/preload/channels.ts`                                               | チャンネル定数定義           |
| creatorHandlers.ts     | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                       | IPC ハンドラ実装             |
| ipc/index.ts           | `apps/desktop/src/main/ipc/index.ts`                                                 | ハンドラ登録エントリポイント |
| skill-creator-api.ts   | `apps/desktop/src/preload/skill-creator-api.ts`                                      | Preload API 実装             |
| preload/types.ts       | `apps/desktop/src/preload/types.ts`                                                  | SkillCreatorAPI 型定義       |
| skillHandlers.ts       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                         | getSkillExecutorInstance()   |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md` | セキュリティ基準             |
| 落とし穴               | `.claude/rules/06-known-pitfalls.md`                                                 | P5, P42, P44, P54            |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`        | Phase 1-6 検証手順           |

## 実行手順

### ステップ 1: セキュリティレビュー

#### 1.1 validateIpcSender 適用確認

| ハンドラチャンネル            | validateIpcSender 適用 | 送信元ウィンドウ検証 | 判定 |
| ----------------------------- | ---------------------- | -------------------- | ---- |
| `skill-creator:plan`          | -                      | -                    | -    |
| `skill-creator:execute-plan`  | -                      | -                    | -    |
| `skill-creator:improve-skill` | -                      | -                    | -    |

確認コマンド:

```bash
grep -n "validateIpcSender" apps/desktop/src/main/ipc/creatorHandlers.ts
```

期待: 3箇所に `validateIpcSender` が存在する。

#### 1.2 sanitizeErrorMessage 適用確認

| ハンドラチャンネル            | sanitizeErrorMessage 適用 | 判定 |
| ----------------------------- | ------------------------- | ---- |
| `skill-creator:plan`          | -                         | -    |
| `skill-creator:execute-plan`  | -                         | -    |
| `skill-creator:improve-skill` | -                         | -    |

確認コマンド:

```bash
grep -n "sanitizeErrorMessage" apps/desktop/src/main/ipc/creatorHandlers.ts
```

#### 1.3 内部情報漏洩チェック

| チェック項目                                                                        | 判定 |
| ----------------------------------------------------------------------------------- | ---- |
| エラーレスポンスにスタックトレースが含まれていないか                                | -    |
| P44準拠: internal role名（Planner/Executor/Improver）がレスポンスに含まれていないか | -    |
| ファイルパス・環境変数がエラーメッセージに含まれていないか（P55対策）               | -    |

### ステップ 2: IPC 契約三方整合検証

#### 2.1 チャンネル定数の三方整合

| チャンネル定数                | channels.ts 定義 | creatorHandlers.ts 参照 | skill-creator-api.ts 参照 | 判定 |
| ----------------------------- | ---------------- | ----------------------- | ------------------------- | ---- |
| `SKILL_CREATOR_PLAN`          | -                | -                       | -                         | -    |
| `SKILL_CREATOR_EXECUTE_PLAN`  | -                | -                       | -                         | -    |
| `SKILL_CREATOR_IMPROVE_SKILL` | -                | -                       | -                         | -    |

確認コマンド:

```bash
grep -n "SKILL_CREATOR_PLAN\|SKILL_CREATOR_EXECUTE_PLAN\|SKILL_CREATOR_IMPROVE_SKILL" \
  apps/desktop/src/preload/channels.ts \
  apps/desktop/src/main/ipc/creatorHandlers.ts \
  apps/desktop/src/preload/skill-creator-api.ts
```

#### 2.2 ALLOWED_INVOKE_CHANNELS ホワイトリスト確認

```bash
grep -n "ALLOWED_INVOKE_CHANNELS" apps/desktop/src/preload/channels.ts
```

期待: 3チャンネルが `ALLOWED_INVOKE_CHANNELS` 配列に含まれている。

#### 2.3 Preload メソッドシグネチャ確認

| Preload メソッド           | 引数型 | 戻り値型 | safeInvoke 使用 | 判定 |
| -------------------------- | ------ | -------- | --------------- | ---- |
| `planSkill`                | -      | -        | -               | -    |
| `executePlan`              | -      | -        | -               | -    |
| `improveSkillWithFeedback` | -      | -        | -               | -    |

#### 2.4 SkillCreatorAPI 公開確認

```bash
grep -n "planSkill\|executePlan\|improveSkillWithFeedback" \
  apps/desktop/src/preload/skill-creator-api.ts
rg -n 'skillCreator: import\("./skill-creator-api"\)\.SkillCreatorAPI' \
  apps/desktop/src/preload/types.ts
```

期待: `skill-creator-api.ts` に3メソッドが存在し、`preload/types.ts` が `SkillCreatorAPI` を公開している。

### ステップ 3: DI 整合確認

#### 3.1 SkillExecutor 注入パス

```bash
grep -n "getSkillExecutorInstance\|SkillExecutor" apps/desktop/src/main/ipc/index.ts
grep -n "export.*getSkillExecutorInstance" apps/desktop/src/main/ipc/skillHandlers.ts
```

確認内容:

- `skillHandlers.ts` から `getSkillExecutorInstance()` が export されているか
- `ipc/index.ts` で `getSkillExecutorInstance()` を呼び出し、runtime facade 構築が optional になっているか
- runtime service が無い場合でも runtime public handler が登録され、fixed failure message で degraded response を返すか

| チェック項目                                                                      | 判定 |
| --------------------------------------------------------------------------------- | ---- |
| `getSkillExecutorInstance()` の export が存在する                                 | -    |
| `skillExecutor` 不在時に optional runtime facade へフォールバックする             | -    |
| runtime service 不在でも fixed failure message を返す public handler が維持される | -    |
| Graceful Degradation パターンが適用されている                                     | -    |

#### 3.2 登録順序確認

| 確認項目                                                                 | 判定 |
| ------------------------------------------------------------------------ | ---- |
| `registerSkillCreatorHandlers()` に optional runtime facade を渡している | -    |
| `registerAllIpcHandlers` の単一エントリポイント原則が維持されている      | -    |

### ステップ 4: テストカバレッジ確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/creatorHandlers.ts
```

| 指標              | 基準値 | 実測値 | 判定 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | 80%+   | -      | -    |
| Branch Coverage   | 60%+   | -      | -    |
| Function Coverage | 80%+   | -      | -    |

### ステップ 5: 既存テスト回帰確認

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/creatorHandlers.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts \
  src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts
```

確認内容:

- `skillCreatorHandlers` 関連テスト群が全 PASS であること
- 新規ハンドラ追加による既存ハンドラへの影響がないこと

| 確認項目                                 | 判定 |
| ---------------------------------------- | ---- |
| skillCreatorHandlers 関連テスト群 全PASS | -    |
| creatorHandlers 新規テスト 全PASS        | -    |
| skillCreatorIpc.integration 全PASS       | -    |

### ステップ 6: 既知落とし穴照合

| Pitfall | 関連性                     | 確認内容                                                                                  | 判定 |
| ------- | -------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| P5      | リスナー二重登録防止       | `unregisterAllIpcHandlers` で3チャンネルが全て解除されるか                                | -    |
| P42     | 3段バリデーション          | 全ハンドラの文字列引数に「型チェック → 空文字列 → トリム空文字列」が適用されているか      | -    |
| P44     | IPC 引数命名の契約ドリフト | internal role 名（Planner/Executor/Improver）がチャンネル名・レスポンスに含まれていないか | -    |
| P54     | graceful degradation       | runtime facade 不在時でも public runtime handler が degraded response を返すか            | -    |
| P60     | IPC テスト応答形式不一致   | ハンドラのエラー形式がテストのアサーションと一致しているか                                | -    |
| P61     | DIP 違反（具象クラス依存） | ハンドラ登録関数の引数型がインターフェース依存になっているか                              | -    |

### ステップ 7: 受入条件 (AC) 充足マトリクス

| AC-ID | 受入条件概要                                     | 検証方法                                         | 充足状態 |
| ----- | ------------------------------------------------ | ------------------------------------------------ | -------- |
| AC-1  | channels.ts に3定数 + ホワイトリスト追加         | ステップ 2.1 / 2.2 の確認結果                    | -        |
| AC-2  | ipc/index.ts でハンドラ登録 + P42バリデーション  | ステップ 3.1 / ステップ 6 P42 確認結果           | -        |
| AC-3  | skill-creator-api.ts に3メソッド + safeInvoke    | ステップ 2.3 の確認結果                          | -        |
| AC-4  | CREATOR_CHANNELS → IPC_CHANNELS 統合             | channels.ts に CREATOR_CHANNELS 残存がないか確認 | -        |
| AC-5  | 新規3チャンネルのテスト存在 + Line Coverage 80%+ | ステップ 4 / 5 の確認結果                        | -        |

### ステップ 8: レビューゲート判定

| 判定     | 対応                                               |
| -------- | -------------------------------------------------- |
| PASS     | Phase 11 へ進む                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | Phase 1 へ戻り要件再確認                           |

## 統合テスト連携【必須】

| テスト項目               | 確認内容                                                | 期待結果             | 主コマンド                                                                                                                                             |
| ------------------------ | ------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime public handler   | runtime 3 チャンネルの正常系 / 異常系 / degraded path   | PASS                 | `pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` |
| Preload contract         | `skill-creator-api.ts` の 3 method と channel whitelist | PASS                 | `pnpm vitest run apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`                                                                 |
| Shared typecheck         | shared / preload / main の型整合                        | PASS                 | `pnpm --filter @repo/desktop typecheck`                                                                                                                |
| Workflow spec validation | workflow 本文と成果物構造                               | current violations 0 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-skill-creator-ipc-wiring`             |

## 成果物

| 成果物             | パス                                                                                         | 説明              |
| ------------------ | -------------------------------------------------------------------------------------------- | ----------------- |
| Phase 10 仕様書    | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-10-final-review.md`                | 本ファイル        |
| 最終レビュー結果   | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-10/final-review-result.md` | レビュー判定記録  |
| 要件充足マトリクス | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-10/requirements-matrix.md` | 要件-実装の対応表 |

## 完了条件

- [ ] ステップ 1 のセキュリティレビュー全項目がチェック済みである
- [ ] ステップ 2 の IPC 契約三方整合が確認されている（channels.ts / creatorHandlers.ts / skill-creator-api.ts）
- [ ] ステップ 3 の DI 整合が確認されている（optional runtime facade と degraded response 含む）
- [ ] ステップ 4 のテストカバレッジが Line 80%+ / Branch 60%+ / Function 80%+ を満たしている
- [ ] ステップ 5 の `skillCreatorHandlers` 関連テスト群が全 PASS である
- [ ] ステップ 6 の落とし穴照合（P5 / P42 / P44 / P54 / P60 / P61）が完了している
- [ ] ステップ 7 の AC-1〜AC-5 全充足状態が確認されている
- [ ] レビューゲート判定が PASS または MINOR（未タスク化済み）である
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

Phase 11: 手動テスト
