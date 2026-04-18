# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 7                                |
| 後続Phase  | Phase 9                                |
| 作成日     | 2026-04-15                             |
| ステータス | completed                              |

## 目的

Phase 5 で実装したコールバック接続コードを品質の観点で見直し、
可読性・保守性を改善する。動作を変えないリファクタリングのみを行う。

## 実行タスク

- コールバック接続コードの可読性確認
- 命名・コメントの改善（必要な場合）
- コード重複の確認・解消（必要な場合）
- リファクタリング後のテスト全件 PASS 確認

## 参照資料

| 資料名         | パス                                                                        | 用途                 |
| -------------- | --------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件   | `outputs/phase-1/requirements-definition.md`                                | 変更境界の再確認     |
| Phase 2 設計   | `outputs/phase-2/design.md`                                                 | 設計意図の再確認     |
| 実装ファイル   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         | リファクタリング対象 |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | 動作確認用           |
| Phase 6 記録   | `outputs/phase-6/test-expansion-record.md`                                  | 追加テストの維持確認 |

## 実行手順

### 1. コード品質チェック

以下の観点でコールバック接続コードを確認する:

| 観点     | チェック内容                                                           |
| -------- | ---------------------------------------------------------------------- |
| 可読性   | インライン関数の記述が適切か（必要であれば名前付き関数への抽出を検討） |
| コメント | `sendSkillCreatorProgress` の役割がコードから明確か                    |
| 型安全性 | コールバック引数の型が明示的に記述されているか                         |
| 一貫性   | 同ファイル内の他のコールバックパターンと一貫したスタイルか             |

### 2. リファクタリング方針

**変更が必要な場合のみ**実施する。小規模なタスクのため、大規模なリファクタリングは不要。

主なリファクタリング候補:

```typescript
// パターン1: インライン関数（現設計）
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);

// パターン2: 名前付き関数への抽出（可読性が向上する場合）
const onSkillCreatorProgress = (progress: SkillCreatorProgressData) => {
  sendSkillCreatorProgress(mainWindow, progress);
};
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  onSkillCreatorProgress,
);
```

**判断基準**: インライン関数で十分読みやすい場合は変更不要。
コードレビューでの可読性を優先して判断する。

### 3. リファクタリング後の確認

```bash
# テスト全件実行（動作が変わっていないことを確認）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: 全 PASS（TC-01〜TC-12）

# 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: 0 error

# lint
pnpm --filter @repo/desktop lint
# 期待: 0 error
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認。

| 判定項目        | 基準              | 結果    |
| --------------- | ----------------- | ------- |
| テスト全件 PASS | TC-01〜TC-12 PASS | pending |
| 型チェック      | 0 error           | pending |
| lint            | 0 error           | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                   |
| -------------- | -------------------------------------------------------------- |
| 動作保証       | リファクタリング後もテストが全て PASS していることを確認したか |
| 最小変更       | 動作を変えない変更のみを行ったか（機能追加を含んでいないか）   |
| スタイル一貫性 | 同ファイル内の他のハンドラーと一貫したコーディングスタイルか   |

## 成果物

| 成果物               | パス                                 | 説明                               |
| -------------------- | ------------------------------------ | ---------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更内容・変更しなかった理由の記録 |

## 完了条件

- [ ] コード品質チェックが完了済み
- [ ] 必要なリファクタリングが実施済み（または不要と判断）
- [ ] リファクタリング後のテスト全件が PASS
- [ ] `pnpm typecheck` が 0 error
- [ ] `pnpm lint` が 0 error
- [ ] リファクタリング記録が `outputs/phase-8/refactoring-log.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. コード品質チェック（可読性・命名・コメント・型安全性）
2. リファクタリング方針の決定
3. リファクタリング実施（または不要と判断して記録）
4. テスト全件実行確認
5. 型チェック・lint 確認
6. リファクタリング記録の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 9: 品質保証
