# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 7                                       |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 6 成果物（`outputs/phase-6/`）    |

## 目的

Phase 6 で追加したテストを含めた全テストのカバレッジを計測し、基準値を充足しているかを確認する。基準未達の場合は Phase 6 へ戻り追加テストを実施する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 参照資料

- Phase 6 成果物: `outputs/phase-6/`
- コード品質ルール: `.claude/rules/02-code-quality.md`
- テスト設定: `apps/desktop/vitest.config.ts`

## 実行タスク

- タスク 1: 対象テストのカバレッジ計測を実行する
- タスク 2: 対象ファイルごとのカバレッジを基準値と照合する
- タスク 3: 未達観点を `gap-analysis.md` に記録する
- タスク 4: PASS/FAIL 判定を行い、必要なら Phase 6 へ差し戻す

## 実行手順

### Step 1: カバレッジ計測コマンドの実行

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/SkillDetailPanel \
  src/renderer/hooks/useSkillCenter
```

### Step 2: 対象ファイルのカバレッジ確認

以下のファイルについてカバレッジレポートを確認する。

- `src/renderer/components/SkillDetailPanel/index.tsx`
- `src/renderer/components/SkillDetailPanel/ActionButtons.tsx`
- `src/renderer/hooks/useSkillCenter.ts`（handleEditSkill / handleAnalyzeSkill に関する部分）

### Step 3: 基準値の照合

各指標について最低基準を満たしているか確認する。

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上（`isImported` 分岐を含む）
- [ ] Function Coverage 80% 以上

### Step 4: 基準未達の場合

未達指標が存在する場合は Phase 6 へ戻り、不足テストケースを追加する。

- `isImported === true` 時のボタン表示 (TC-01)
- `isImported === false` 時のボタン非表示 (TC-02)
- `handleEditSkill` 呼び出し (TC-03)
- `handleAnalyzeSkill` 呼び出し (TC-04)
- エラーケース・境界値

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| ファイル                              | 内容                         |
| ------------------------------------- | ---------------------------- |
| `outputs/phase-7/coverage-report.txt` | カバレッジ計測結果の全文     |
| `outputs/phase-7/coverage-summary.md` | 指標別サマリと基準充足判定   |
| `outputs/phase-7/gap-analysis.md`     | 基準未達の場合の不足箇所分析 |

## 完了条件

- [ ] カバレッジ計測コマンドが正常終了している
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] `outputs/phase-7/coverage-summary.md` に全指標の結果が記録されている
- [ ] 基準未達がある場合は Phase 6 へ戻り再テストを実施している

**本Phase内の全タスクを100%実行完了** してから次フェーズへ進むこと。

## 次 Phase

- 基準充足: Phase 8（リファクタリング）へ進む
- 基準未達: Phase 6（テスト拡充）へ戻る
