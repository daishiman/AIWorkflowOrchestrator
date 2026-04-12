# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 9                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 8                                                      |
| 後続Phase  | Phase 10                                                     |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

`pnpm typecheck` / `pnpm lint` / `pnpm test`の全通過確認・CSP設定のE2E動作確認・
セキュリティポリシーの最終確認を行う。

## 実行タスク

### タスク1: 型チェック・Lint・テスト全通過確認

**目的**: CI相当の品質チェックが全て通ることを確認する

**実行手順**:

1. TypeScript型チェックを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

2. ESLint（Lintチェック）を実行する:

```bash
pnpm --filter @repo/desktop lint
```

3. テストスイートを実行する:

```bash
pnpm --filter @repo/desktop test:run
```

4. 全てPASSすることを確認し、結果を記録する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

### タスク2: セキュリティ確認

**目的**: Electronセキュリティポリシーが維持されていることを確認する

**実行手順**:

1. CSP設定が変更された場合、変更内容がセキュリティ要件を満たしているか確認する
2. Electronの`webSecurity`設定が緩められていないことを確認する
3. `ALLOWED_INVOKE_CHANNELS`への追加が`analytics:send`のみであることを確認する
4. 新規IPCチャネルが必要最小限であることを確認する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（セキュリティセクション）

### タスク3: 依存関係・削除確認

**目的**: スタブ化・削除されたファイルへの参照がないことを確認する

**実行手順**:

1. 削除または修正したファイルへの参照を確認する:

```bash
# analyticsAdapter インポート確認
grep -rn "import.*analyticsAdapter" apps/desktop/src/
```

2. 廃止されたパターン（直接`console.info`のみの送信）が`trackEvent.ts`から除去されていることを確認する
3. 孤立したインポート・未使用変数がないことを確認する（[FB-UI-02-1]対策）

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（依存関係セクション）

### タスク4: リスクレジスター作成

**目的**: 残存リスクを特定し、対策を記録する

**実行手順**:

1. analytics provider選定に関するリスクを評価する
2. オフラインキューのメモリ使用量リスクを評価する
3. オプトアウト設定未整備の場合のリスクを評価する
4. 残存リスクと軽減策を記録する

**期待される成果物**:

- `outputs/phase-9/risk-register.md`

### タスク5: 文書整合性確認

**目的**: workflow 文書のリンク、行数、phase status の整合を確認する

**実行手順**:

1. 各 `phase-*.md` と `index.md` の markdown link 切れを確認する
2. 各ファイルが 500 行以内であることを確認する（超過時は分割済みであること）
3. `artifacts.json` と `index.md` の phase status / artifact 名が一致していることを確認する
4. `.claude` canonical 参照が `.agents` mirror に逸脱していないことを確認する

**期待される成果物**:

- `outputs/phase-9/documentation-integrity-report.md`

## 品質チェックリスト

### 機能検証

- [ ] `analyticsAdapter.test.ts`全テスト成功
- [ ] `analyticsHandler.test.ts`全テスト成功（IPC経由の場合）
- [ ] `trackEvent.test.ts`全テスト成功（回帰なし）
- [ ] `SkillCreateWizard.tracking.test.tsx`全テスト成功（回帰なし）

### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] `pnpm --filter @repo/desktop lint` PASS
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] `analyticsAdapter.ts` Line 90%+、Branch 80%+
- [ ] `trackEvent.ts` Line 100%、Branch 100%
- [ ] workflow 文書の markdown link 切れなし
- [ ] workflow 文書の 500 行超過なし
- [ ] `artifacts.json` と `index.md` の phase status 一致

### セキュリティ

- [ ] CSP設定がElectronセキュリティ要件を満たしている
- [ ] `webSecurity`設定が緩められていない
- [ ] IPC経由アプローチによりCSP制限回避が確立されている

## 参照資料

| 参照資料                     | パス                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Phase 8 リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`                |
| Phase 7 カバレッジレポート   | `outputs/phase-7/traceability-coverage-report.md`    |
| FB-UI-02-1: 削除確認基準     | `.claude/skills/task-specification-creator/SKILL.md` |

## 成果物

| 成果物             | パス                                                | 内容                              |
| ------------------ | --------------------------------------------------- | --------------------------------- |
| 品質レポート       | `outputs/phase-9/quality-report.md`                 | 全品質チェック結果                |
| リスクレジスター   | `outputs/phase-9/risk-register.md`                  | 残存リスクと軽減策                |
| 因果ループ確認     | `outputs/phase-9/causal-loop-check.md`              | 実装による因果ループ解消確認      |
| 文書整合性レポート | `outputs/phase-9/documentation-integrity-report.md` | link / line budget / phase parity |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] `pnpm --filter @repo/desktop lint` PASS
- [ ] `pnpm --filter @repo/desktop test:run` PASS（全テスト）
- [ ] セキュリティ確認完了（CSP・webSecurity）
- [ ] 依存関係確認完了（孤立インポートなし）
- [ ] リスクレジスター作成完了
- [ ] 文書整合性確認完了
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 10: 最終レビューゲート
