# Phase 9: 品質保証

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 9                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 8: リファクタリング                |
| 次Phase  | Phase 10: 最終レビューゲート             |

---

## 目的

全テスト・ESLint・TypeScript型チェックを一括実行し品質を確認する。

---

## 実行タスク

### タスク1: テスト実行

desktop パッケージおよび shared パッケージのテストを実行し、型定義変更の影響がないことを確認する。

```bash
pnpm --filter @repo/desktop exec vitest run
```

```bash
pnpm --filter @repo/shared exec vitest run
```

- 全テスト PASS であること。

---

### タスク2: Lint実行

```bash
pnpm lint
```

- lint 警告・エラーが 0 件であること。

---

### タスク3: 型チェック

```bash
pnpm typecheck
```

- 型エラーが 0 件であること。

---

### タスク4: MINOR 解決確認

| MINOR ID  | 指摘内容                              | 解決予定Phase | 確認内容                                                                        |
| --------- | ------------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| TECH-M-01 | `checkId` null 安全性                 | Phase 5       | `c.checkId ?? c.name` の null 安全性が Phase 5 で解決されたか確認               |
| TECH-M-02 | プロンプト言語統一（日本語/英語混在） | Phase 5       | `buildImproveFeedback` のプロンプト文面が既存プロンプトの言語と統一されたか確認 |

---

### タスク5: line budget 確認

`buildImproveFeedback` の変更が過度に行数を増やしていないか確認する。

| 確認項目                        | 基準                                       |
| ------------------------------- | ------------------------------------------ |
| `buildImproveFeedback` の総行数 | Phase 2 設計の見積もりから大幅に逸脱しない |
| 不要なコメント・空行の混入      | なし                                       |
| 過度に複雑なロジックの発生      | なし                                       |

---

## 参照資料

| 参照資料             | パス                       | 内容                   |
| -------------------- | -------------------------- | ---------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`  | AC 定義、スコープ      |
| Phase 2 設計         | `phase-2-design.md`        | 型設計、ループ変更設計 |
| Phase 3 設計レビュー | `phase-3-design-review.md` | MINOR 追跡テーブル     |
| Phase 8 リファクタ   | `phase-8-refactoring.md`   | リファクタリング記録   |

---

## 成果物

| 成果物           | パス                                | 状態    |
| ---------------- | ----------------------------------- | ------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | pending |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop exec vitest run` が全テスト PASS
- [ ] `pnpm --filter @repo/shared exec vitest run` が全テスト PASS
- [ ] `pnpm lint` が警告・エラー 0 件
- [ ] `pnpm typecheck` が型エラー 0 件
- [ ] TECH-M-01（checkId null 安全性）の解決を確認した
- [ ] TECH-M-02（プロンプト言語統一）の解決を確認した
- [ ] `buildImproveFeedback` の line budget が適切であることを確認した
- [ ] 品質保証レポートを `outputs/phase-9/quality-report.md` に記録した

---

## タスク100%実行確認【必須】

Phase 9 の全タスク（テスト実行、Lint実行、型チェック、MINOR 解決確認、line budget 確認）を100%実行し完遂した。

---

## 次Phase

Phase 10: 最終レビューゲート -- AC-1〜AC-4 の最終充足確認と PR 可否判定を行う。

### Phase 13 blocked 条件

Phase 13（PR作成）はユーザーの明示承認後のみ実施する。
