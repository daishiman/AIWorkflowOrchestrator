# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装                              |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 4: テスト検証準備           |
| 後続Phase  | Phase 6: テスト拡充               |
| ステータス | 完了                              |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

Phase 4 の調査結果（UI 変更起因と判定）に基づき、dark-mode テストの再現性を高める `colorScheme: "dark"` 固定を実装する。

## 背景

Phase 4 の diff 分析で、`TC-11-05 error-display`・`TC-11-06 loading-state`・`TC-11-07 dark-mode` の過去 diff は意図した UI 変更（`51b3fc0c2`）と baseline の一時的なタイミング差であり、regression ではないと判定された。
現行 worktree ではテストは既に 10/10 PASS している。
今回の実装は regression 修正ではなく、OS テーマ依存を排除して CI での再現性を確保する設定強化に特化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: playwright.config.ts への colorScheme 固定追加

**目的**: `ui-ux-layer2` プロジェクトに `colorScheme: "dark"` を明示的に設定する。

**実行手順**:

1. `apps/desktop/playwright.config.ts` の `ui-ux-layer2` プロジェクト設定を確認する

   ```bash
   grep -n -A 10 "ui-ux-layer2" apps/desktop/playwright.config.ts
   ```

2. `use` ブロックに `colorScheme: "dark"` を追加する

   ```typescript
   // playwright.config.ts の ui-ux-layer2 プロジェクト設定
   {
     name: 'ui-ux-layer2',
     use: {
       colorScheme: 'dark',
       // ... 既存設定
     },
   }
   ```

**期待される成果物**:

- `playwright.config.ts` の `ui-ux-layer2` に `colorScheme: "dark"` が追加されていること

---

### タスク2: layer2-visual.spec.ts への test.use 追加

**目的**: テストファイルレベルでも `colorScheme: "dark"` を明示し、二重に保護する。

**実行手順**:

1. `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` の先頭付近を確認する

   ```bash
   grep -n "test.use\|colorScheme" apps/desktop/e2e/ui-ux/layer2-visual.spec.ts
   ```

2. `test.use({ colorScheme: 'dark' })` を追加する

   ```typescript
   // layer2-visual.spec.ts の先頭付近
   test.use({ colorScheme: "dark" });
   ```

**期待される成果物**:

- `layer2-visual.spec.ts` に `test.use({ colorScheme: 'dark' })` が追加されていること

---

### タスク3: テスト再実行による動作確認

**目的**: 実装後もテストが全 PASS することを確認する。

**実行手順**:

1. Layer 2 テストを実行する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
   ```

2. 結果を確認する
   - 全件 PASS していること
   - TC-11-05 / TC-11-06 / TC-11-07 が PASS していること

3. snapshot diff が 3 surface に限定されていることを確認する

   ```bash
   git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

**期待される成果物**:

- テストが全件 PASS していること
- 3 surface 以外の snapshot 変更が発生していないこと

---

### タスク4: 実施内容と判断根拠の記録

**目的**: Phase 5 で実施した変更内容と判断根拠を文書化する。

**記録内容**:

| 項目             | 内容                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| 判定結果         | UI 変更起因                                                              |
| baseline 更新    | 既に同期済みのため追加更新不要                                           |
| UI 修正          | 不要                                                                     |
| 実施した変更 (1) | `playwright.config.ts` の `ui-ux-layer2` に `colorScheme: "dark"` を追加 |
| 実施した変更 (2) | `layer2-visual.spec.ts` に `test.use({ colorScheme: "dark" })` を追加    |

**判断根拠**:

- `git log --follow` では `OnboardingWizard` と snapshots が `51b3fc0c2` で同時更新されている
- よって、過去の 113px diff は regression ではなく、UI 変更と baseline の一時的なタイミング差
- 今回の作業は regression 修正ではなく、実行環境の安定化に寄せた設定強化

**期待される成果物**:

- `outputs/phase-5/implementation-log.md` に実施内容が記録されていること
- `outputs/phase-5/decision-basis.md` に判断根拠が記録されていること

---

## 参照資料

| 参照資料          | パス                                           | 内容                                |
| ----------------- | ---------------------------------------------- | ----------------------------------- |
| diff 分析レポート | `outputs/phase-4/diff-analysis.md`             | 実施前の調査結果・判定根拠          |
| 設計書            | `outputs/phase-2/design.md`                    | baseline 更新・dark-mode 安定化設計 |
| playwright 設定   | `apps/desktop/playwright.config.ts`            | colorScheme 設定対象                |
| Layer 2 テスト    | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` | テスト実装                          |

---

## 成果物

| 成果物       | パス                                    | 内容                               |
| ------------ | --------------------------------------- | ---------------------------------- |
| 実施内容記録 | `outputs/phase-5/implementation-log.md` | 実施した変更内容・テスト再実行結果 |
| 判断根拠記録 | `outputs/phase-5/decision-basis.md`     | UI 変更起因の判定根拠              |

---

## 完了条件

- [x] `playwright.config.ts` の `ui-ux-layer2` に `colorScheme: "dark"` を追加した
- [x] `layer2-visual.spec.ts` に `test.use({ colorScheme: "dark" })` を追加した
- [x] 実装後のテストが全件 PASS していること
- [x] 3 surface 以外の snapshot 変更が発生していないことを確認した
- [x] `outputs/phase-5/implementation-log.md` に実施内容を記録した
- [x] `outputs/phase-5/decision-basis.md` に判断根拠を記録した
