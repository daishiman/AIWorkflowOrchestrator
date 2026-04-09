# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 9                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 8                                                    |
| 後続Phase  | Phase 10                                                   |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

実装完了後の品質を総合的に評価し、Phase 10 の最終レビューへの準備を整える。  
QA 基準（`git delete OR export {} stub化かつ live import ゼロ`）への適合を確認する。

---

## 実行タスク

- **QA 基準チェック**: Phase 9 QA 基準の達成状況を確認
- **全テスト実行**: 全テストスイートの実行と PASS 確認
- **品質指標計測**: カバレッジ・型チェック・lint の最終確認
- **リスク評価**: 未解決リスクの評価と記録

---

## 参照資料

| 資料名             | パス                                              | 用途                     |
| ------------------ | ------------------------------------------------- | ------------------------ |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`          | AC 一覧との照合          |
| リファクタ計画     | `outputs/phase-8/refactoring-plan.md`             | リファクタリング内容確認 |
| カバレッジレポート | `outputs/phase-7/traceability-coverage-report.md` | カバレッジ確認           |

---

## Phase 9 QA 基準チェック

**必須基準**: `git delete OR export {} stub化かつ live import ゼロ`

| チェック項目                                                     | 確認コマンド                                                                                             | 結果 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---- |
| `skill-lifecycle-request-input` が完全に削除されている           | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/`                                    | TBD  |
| `skill-lifecycle-execution-input` が完全に削除されている         | `grep -rn "skill-lifecycle-execution-input" apps/desktop/src/renderer/`                                  | TBD  |
| 削除した state (`request`/`executionPrompt`) の live import ゼロ | `grep -rn "request\|executionPrompt" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | TBD  |
| 不要 import がゼロ                                               | `pnpm --filter @repo/desktop typecheck`                                                                  | TBD  |

---

## 品質指標確認

### テスト

```bash
# 全テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/

# カバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/renderer/components/skill/__tests__/
```

### 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### Lint

```bash
pnpm --filter @repo/desktop lint
```

---

## 品質指標サマリー

| 指標              | 目標値 | 計測値 | 判定 |
| ----------------- | ------ | ------ | ---- |
| テスト PASS 率    | 100%   | TBD    | TBD  |
| Line Coverage     | 80%+   | TBD    | TBD  |
| Branch Coverage   | 60%+   | TBD    | TBD  |
| Function Coverage | 80%+   | TBD    | TBD  |
| 型チェック        | PASS   | TBD    | TBD  |
| Lint              | PASS   | TBD    | TBD  |

---

## リスク評価

| リスク ID | リスク内容                                               | 重大度 | 対応状況                 |
| --------- | -------------------------------------------------------- | ------ | ------------------------ |
| R-01      | `approvedSkillSpec` state の削除が他機能に影響する可能性 | 中     | TBD                      |
| R-02      | `onOpenWizard` / `onOpenSkillWizard` の導線取り違え      | 低     | current facts で解消済み |

---

## 統合テスト連携

- 品質保証で全テスト結果を確認する
- QA 基準（`git delete OR export {} stub化かつ live import ゼロ`）の適合を記録する

---

## 成果物

| 成果物         | パス                                   | 説明                 |
| -------------- | -------------------------------------- | -------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質指標の計測結果   |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク評価と対応状況 |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 変更の因果ループ確認 |

---

## 完了条件

- [ ] Phase 9 QA 基準（`git delete OR export {} stub化かつ live import ゼロ`）を満たした
- [ ] 全テストが PASS した
- [ ] TypeScript 型チェックが通過した
- [ ] Lint が通過した
- [ ] カバレッジ目標値を達成した
- [ ] リスク評価が完了した
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 品質指標を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 9
```

---

## 次のPhase

Phase 10: 最終レビューゲート
