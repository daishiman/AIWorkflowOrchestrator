# Phase 8: リファクタリング

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 8                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 7: カバレッジ確認                  |
| 次Phase  | Phase 9: 品質保証                        |

---

## 目的

`previousImproveSummary` 除去後のコード整理、命名統一を行う。

---

## 実行タスク

### タスク1: previousImproveSummary 完全除去確認

以下のコマンドで残存がないか確認する:

```bash
grep -rn "previousImproveSummary" apps/desktop/src/
```

- 結果が 0 件であること。
- 残存がある場合は該当箇所を修正する。

---

### タスク2: 変更内容テーブル記録

| 対象                         | Before                           | After                                       | 理由                 |
| ---------------------------- | -------------------------------- | ------------------------------------------- | -------------------- |
| ローカル変数                 | `previousImproveSummary: string` | `feedbackHistory: ImproveFeedbackHistory[]` | 全履歴保持のため     |
| buildImproveFeedback 第2引数 | `previousImproveSummary: string` | `history: ImproveFeedbackHistory[]`         | 構造化データ受け取り |
| プロンプトセクション名       | `## 前回の改善要約`              | `## 過去の改善試行履歴`                     | 複数試行を反映       |

---

### タスク3: リファクタ後のテスト再実行

リファクタリング後、全テストが PASS することを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts
```

- 全テスト PASS であること。
- 失敗がある場合はリファクタリングの誤りを修正する。

---

## 参照資料

| 参照資料           | パス                        | 内容                   |
| ------------------ | --------------------------- | ---------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`   | AC 定義、スコープ      |
| Phase 2 設計       | `phase-2-design.md`         | 型設計、ループ変更設計 |
| Phase 7 カバレッジ | `phase-7-coverage-check.md` | カバレッジ確認結果     |

---

## 成果物

| 成果物               | パス                                 | 状態    |
| -------------------- | ------------------------------------ | ------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | pending |

---

## 完了条件

- [ ] `previousImproveSummary` の残存が 0 件であることを確認した
- [ ] 変更内容テーブル（Before/After/理由）を記録した
- [ ] リファクタ後のテスト再実行で全テスト PASS を確認した
- [ ] リファクタリング記録を `outputs/phase-8/refactoring-log.md` に記録した

---

## タスク100%実行確認【必須】

Phase 8 の全タスク（previousImproveSummary 完全除去確認、変更内容テーブル記録、テスト再実行）を100%実行し完遂した。

---

## 次Phase

Phase 9: 品質保証 -- 全テスト・ESLint・TypeScript型チェックを一括実行し品質を確認する。

### Phase 13 blocked 条件

Phase 13（PR作成）はユーザーの明示承認後のみ実施する。
