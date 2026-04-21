# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 6                                                      |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| 前Phase  | [phase-5-implementation.md](phase-5-implementation.md) |
| 次Phase  | [phase-7-coverage.md](phase-7-coverage.md)             |

## 目的

Phase 4 で定義した 4 シナリオに対し、境界値・再登録挙動・並行実行といったエッジケースを追加し、
`planId` フィルタが実運用で期待通り動作することを担保する。

## 拡充シナリオ

| TC    | 観点               | 内容                                                                                           | AC          |
| ----- | ------------------ | ---------------------------------------------------------------------------------------------- | ----------- |
| TC-E1 | 空文字列 planId    | `options.planId = ""` / `progress.planId = ""` のとき、undefined 扱いしない（厳密一致）        | AC-4 / AC-5 |
| TC-E2 | useEffect 依存配列 | `options.planId` が session 中に変更された場合、古いリスナーが解除され新 planId で再登録される | AC-3        |
| TC-E3 | session-restore    | 一時停止から再開した skill-creator セッションで planId が維持され、再開後も通知が通過する      | AC-3 / AC-4 |
| TC-E4 | 並行 executePlan   | 2 つの plan が並行実行されるとき、互いの progress が filter miss で隔離される                  | AC-5        |
| TC-E5 | 後方互換混在       | legacy payload（planId なし）と新 payload（planId 有り）が混在してもすべて受理される           | AC-6        |
| TC-E6 | 全通知許容         | `options.planId` 未指定のとき、planId 有無に関わらず全 progress が受理される                   | AC-7        |

## エッジケースの焦点

| 観点         | 補足                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 境界値       | `""` / `undefined` / `null` の扱い（`null` は TypeScript 型上禁止だが runtime 安全性を確認） |
| 再登録ループ | useEffect 依存配列に `options?.planId` を含める／含めないの選択理由を記録                    |
| 並行性       | 異なる planId の並行 emit 時、両 Hook が互いの通知を reject する                             |
| 後方互換     | 古い Main 実装が planId を emit しなくても Renderer 側でクラッシュしない                     |

## 検証コマンド

```bash
pnpm --filter @repo/desktop test -- --run useStreamingProgress
pnpm --filter @repo/desktop test -- --run skill-creator
```

## 実行タスク

- 境界値・再登録・session-restore・並行実行の追加ケースを定義する
- AC と追加ケースの対応関係を明文化する
- Phase 7 の coverage 取得に必要な観点を揃える

## 成果物

| 成果物                    | パス                                           |
| ------------------------- | ---------------------------------------------- |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` |

## 参照資料

- [phase-4-test-creation.md](phase-4-test-creation.md) TC-01 〜 TC-04
- [phase-2-design.md](phase-2-design.md) Hook filter 擬似コード
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`

## 統合テスト連携

- Phase 6 は targeted test を拡張して疑似統合ケースを定義する
- ここで定義した並行実行・復元ケースを Phase 7 coverage と Phase 9 品質ゲートに引き継ぐ

## 完了条件

- [ ] TC-E1 〜 TC-E6 が AC にマッピングされている
- [ ] useEffect 依存配列方針が記録されている
- [ ] 並行 executePlan シナリオが含まれている
- [ ] session-restore シナリオが含まれている
