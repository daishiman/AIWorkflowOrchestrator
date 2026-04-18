# Phase 5: 実装

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| Phase名    | 実装                                    |
| 対象機能   | TASK-SW-STREAM-FUP-03                   |
| 前提Phase  | Phase 4: テスト作成（TDD Red 確認済み） |
| 次Phase    | Phase 6: テスト拡充                     |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-17                              |

## 目的

TDD Green フェーズとして、mode 別 progress flow を `SkillCreatorService.ts` に実装する。

## 差分確認（P50チェック結果反映）

Phase 1 で確認した P50チェック結果に基づき、以下を先に確認する：

- upstream（main等）に既に実装が存在する場合 → 差分確認のみ行い、実装をスキップする
- `update`/`improve-prompt` のワークフローメソッドが存在しない場合 → progress flow 定義に step を追加し、`createSkill()` の mode 分岐で実行する

## 実装ステップ

### Step 1: progress flow 定義と helper の追加

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

FUP-02 定数化が完了している場合は定数ファイルを参照する。
未完了の場合はファイル先頭付近に private な progress flow 定義を置く。
定義は mode ごとの progress payload と step 実行を 1 つの sequence にまとめる。

```typescript
type SkillCreatorProgressStep = {
  progress: SkillCreatorProgressData;
  run: () => Promise<void>;
};

const PROGRESS_FLOW_BY_MODE: Record<
  SkillCreatorMode,
  readonly SkillCreatorProgressStep[]
> = {
  // mode ごとの step 配列を 1 箇所に集約する
} as const;

const emitProgressStep = async (
  step: SkillCreatorProgressStep,
  onProgress?: SkillCreatorProgressCallback,
): Promise<void> => {
  onProgress?.(step.progress);
  await step.run();
};
```

### Step 2: createSkill() の orchestration を flow driven に変更

`createSkill()` は mode を見て progress flow を 1 回だけ解決し、`emitProgressStep` のような共通 helper を通して各 step を順番に実行する。
private method は progress literal を持たず、step の `run` によって呼ばれる業務ロジックだけを担当する。
`update` / `improve-prompt` に専用 private method が存在しない場合は、`createSkill()` 内の mode 分岐に step を置いてよいが、progress contract は必ず flow 定義に閉じる。

### Step 3: create モード回帰の保持

`create` モードの 5 段階フロー（planning → generating-skill → generating-agents → validating → done）は変更しない。

### Step 4: TDD Green 確認

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService.progress"
```

TC-01〜TC-14 が全件 PASS することを確認する。

## 修正ファイル一覧

| ファイル                                                      | 変更種別 | 変更内容                                                   |
| ------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 修正     | progress flow 定義追加・共通 helper 追加・work step の整理 |

（`SkillCreatorService.progress.test.ts` は Phase 4 で作成済み）

## 注意事項

- `create` モードの既存 `emitProgress` 呼び出し（`planning` 〜 `done`）は**変更禁止**
- `done` フェーズは progress flow 定義の終端 step で 1 回だけ発火する
- private method には progress literal を複製しない

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                                       | パス                                                           |
| -------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-implementation-plan.md | `outputs/phase-5/TASK-SW-STREAM-FUP-03-implementation-plan.md` |

## 完了条件

- [ ] Step 1〜4 を全て実行した
- [ ] TDD Green: TC-01〜TC-14 が全件 PASS した
- [ ] `create` モードの既存テスト14件が全件 PASS し続けている
- [ ] 成果物が生成されている

## タスク100%実行確認【必須】

- [ ] progress flow 定義を追加した
- [ ] createSkill() の orchestration を変更した
- [ ] progress literal の重複を排除した
- [ ] TDD Green を確認した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
