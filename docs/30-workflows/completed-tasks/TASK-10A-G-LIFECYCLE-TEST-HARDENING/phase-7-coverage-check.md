# Phase 7: テストカバレッジ確認 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                        |
| --------- | --------------------------- |
| タスクID  | TASK-10A-G                  |
| Phase     | 7                           |
| 名称      | テストカバレッジ確認        |
| 依存Phase | Phase 6（テスト拡充）       |
| 次Phase   | Phase 8（リファクタリング） |

---

## 目的

Phase 6 までに作成した全55テストケース（Layer 1: 25, Layer 2: 14, Layer 3: 16）を前提に、Layer 1 の `skill:create` ハンドラ範囲をゲート対象として計測し、Layer 2/3 は参考値として整合確認する。未達の場合は不足箇所を特定し Phase 6 に戻る。

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                            |
| ----------------- | -------- | -------- | ------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `skillHandlers.ts` の `skill:create` ハンドラー部分     |
| Branch Coverage   | 60%      | 70%      | バリデーション分岐（description/options）の網羅         |
| Function Coverage | 80%      | 90%      | `sanitizeErrorMessage`, `validateIpcSender`, ハンドラー |

---

## 実行タスク

- Task 1: Layer 1〜3 のカバレッジを計測する
- Task 2: 未カバー箇所と未達指標を特定する
- Task 3: PASS/FAIL 判定と Phase 6 へのフィードバックを確定する

### Task 1: カバレッジ計測実行

#### Step 1-1: Layer 1 カバレッジ計測

```bash
cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:create
```

- `coverage-by-handler.ts` を使い、`skill:create` の行範囲だけをゲート対象として集計する
- `pnpm vitest run --coverage` の生実行は global threshold と衝突するため、ゲート判定コマンドには使わない

#### Step 1-2: Layer 2 カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

#### Step 1-3: Layer 3 カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### Task 2: カバレッジレポート分析

#### Step 2-1: Layer 1 カバレッジ分析

以下のファイルのカバレッジを確認する:

| 対象ファイル                           | Line | Branch | Function | 基準達成 |
| -------------------------------------- | ---- | ------ | -------- | -------- |
| `skillHandlers.ts`（skill:create部分） | 96.9 | 88.9   | 100.0    | PASS     |
| `sanitizeErrorMessage` 関数            | 100  | 100    | 100      | PASS     |
| `getAllowedWindows` コールバック       | 100  | -      | 100      | PASS     |

**P41 注意**: v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする。`validateIpcSender` のオプションオブジェクト内コールバック（`getAllowedWindows: () => [mainWindow]`）が実行されないと Function Coverage が低下する。

#### Step 2-2: 未カバー箇所の特定

カバレッジレポートの HTML 出力（`coverage/index.html`）を確認し、以下を記録する:

| カテゴリ   | 未カバー箇所             | 対応方針             |
| ---------- | ------------------------ | -------------------- |
| 未実行行   | 行番号と内容             | Phase 6 でテスト追加 |
| 未通過分岐 | 条件式と未通過の分岐方向 | Phase 6 でテスト追加 |
| 未呼出関数 | 関数名とファイル         | Phase 6 でテスト追加 |

### Task 3: カバレッジゲート判定

#### Step 3-1: 基準達成判定

| 指標              | 計測値 | 基準値 | 判定    |
| ----------------- | ------ | ------ | ------- |
| Line Coverage     | 96.9%  | 80%    | PASS    |
| Branch Coverage   | 88.9%  | 60%    | PASS    |
| Function Coverage | 100.0% | 80%    | PASS    |
| 総合判定          | PASS   | -      | Phase 8 |

#### Step 3-2: ゲート判定基準

| 判定                   | 条件                                          | 対応           |
| ---------------------- | --------------------------------------------- | -------------- |
| PASS（Phase 8 へ）     | Line 80%+ かつ Branch 60%+ かつ Function 80%+ | Phase 8 へ進む |
| FAIL（Phase 6 へ戻り） | いずれかの指標が基準未達                      | Phase 6 に戻る |

#### Step 3-3: Phase 6 へのフィードバック（FAIL時）

Phase 6 に戻る場合、以下の情報を提供する:

1. **未達指標と差分**: Line Coverage 75% → あと5%（推定3-4行）
2. **未カバー箇所の具体的な行番号とコード**
3. **追加すべきテストケースの候補**
4. **推定追加テスト数**

### Task 4: カバレッジレポートの記録

テストカバレッジ結果を `outputs/phase-7/coverage-report.md` に記録する。以下の情報を含める:

- 各対象ファイルのカバレッジ数値（Line / Branch / Function）
- ゲート判定結果（PASS / FAIL）
- 未カバー箇所の一覧（FAIL時）
- Phase 6 フィードバック内容（FAIL時）
- テスト実行時間

---

## 参照資料

| 参照資料        | パス                                                                                              | 使用セクション               |
| --------------- | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5 成果物  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md` | Green調整後のテスト実体確認  |
| Phase 6 成果物  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-6-test-expansion.md` | テスト拡充結果               |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       | カバレッジ基準定義           |
| テストパターン  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                 | テスト構成の参照             |
| IPC API仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                              | カバレッジ対象の特定         |
| エラー仕様      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             | エラー分岐のカバレッジ       |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                      | セキュリティ分岐のカバレッジ |

---

## 統合テスト連携

### カバレッジ対象の範囲

| Layer   | カバレッジ対象ファイル                                     | 計測対象                |
| ------- | ---------------------------------------------------------- | ----------------------- |
| Layer 1 | `apps/desktop/src/main/ipc/skillHandlers.ts`               | skill:create ハンドラー |
| Layer 1 | `apps/desktop/src/main/ipc/utils/sanitizeError.ts`（相当） | sanitizeErrorMessage    |
| Layer 2 | Rendererコンポーネント群                                   | 参考値のみ              |
| Layer 3 | ChatPanelコンポーネント                                    | 参考値のみ              |

Layer 2 / Layer 3 はテストPASSと状態遷移の整合を主判定とし、カバレッジ値はゲート対象にしない。参考値としては `agentSlice.ts` 34.3% / 50% / 11.66%、`ChatPanel.tsx` 87.32% / 93.75% / 33.33% を確認した。

### Phase 6 ループの上限

Phase 6 -> Phase 7 のループは最大3回とする。3回実行してもカバレッジ基準を満たせない場合は、未達の理由を記録して Phase 8 に進む。

---

## 成果物

| 成果物             | パス                                 | 種別 |
| ------------------ | ------------------------------------ | ---- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 新規 |

---

## 完了条件

- [ ] Layer 1 のカバレッジ計測が実行されている
- [ ] Layer 2 のカバレッジ計測が実行されている（参考値）
- [ ] Layer 3 のカバレッジ計測が実行されている（参考値）
- [ ] `skillHandlers.ts` の skill:create 部分で Line Coverage 80%以上
- [ ] `skillHandlers.ts` の skill:create 部分で Branch Coverage 60%以上
- [ ] `skillHandlers.ts` の skill:create 部分で Function Coverage 80%以上
- [ ] P41（v8インライン関数カウント）への対策が実施されている
- [ ] ゲート判定（PASS / FAIL）が明示されている
- [ ] FAIL の場合、Phase 6 へのフィードバック情報が記載されている
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に出力されている

---

## 次Phase

- **PASS判定時**: Phase 8（リファクタリング）へ進む
- **FAIL判定時**: Phase 6（テスト拡充）に戻り、未カバー箇所のテストを追加する（最大3回ループ）
