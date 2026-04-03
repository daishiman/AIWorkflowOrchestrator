# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 7                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

Phase 6までのテストでカバレッジ基準を満たしているか検証し、
不足箇所があれば補完テストを追加する。

## 実行タスク

- カバレッジ計測: `SkillLifecyclePanel.tsx`の変更部分のカバレッジ測定
- 基準判定: Line 80%+ / Branch 60%+ / Function 80%+ を確認
- 補完テスト: 不足カバレッジがあればテストを追加

## 参照資料

| 資料名             | パス                                                                 | 説明               |
| ------------------ | -------------------------------------------------------------------- | ------------------ |
| Phase 5成果物      | `outputs/phase-5/implementation-summary.md`                          | 実装結果・差分確認 |
| Phase 6成果物      | `outputs/phase-6/test-expansion-report.md`                           | 拡充済みテスト一覧 |
| 実装コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | カバレッジ対象     |

## 実行手順

### Step 1: カバレッジ計測

```bash
# SkillLifecyclePanelのカバレッジを計測
pnpm --filter @repo/desktop test -- --run --coverage \
  --coverage.include="apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx" \
  2>&1 | tail -30
```

### Step 2: カバレッジ基準の判定

| 指標     | 基準 | 計測結果   | 判定 |
| -------- | ---- | ---------- | ---- |
| Line     | 80%+ | {{RESULT}} | -    |
| Branch   | 60%+ | {{RESULT}} | -    |
| Function | 80%+ | {{RESULT}} | -    |

**主要カバレッジ対象**:

- `checksByLayer` useMemoのグルーピングロジック
- `toggleLayer`関数
- 空Layer非表示の条件分岐（`filter(layer => length > 0)`）
- severityアイコン・集計バッジのマッピング
- アコーディオン展開/折りたたみ条件分岐

### Step 3: 不足カバレッジの補完

Branch 60%未満の場合、不足している分岐を特定してテストを追加する。

```bash
# HTMLカバレッジレポートで詳細確認
pnpm --filter @repo/desktop test -- --run --coverage --coverage.reporter=html
open coverage/index.html
```

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果                 |
| ------------------------ | ---- | -------------------- |
| ユニットテストLine       | 80%+ | {{RESULT}}           |
| ユニットテストBranch     | 60%+ | {{RESULT}}           |
| ユニットテストFunction   | 80%+ | {{RESULT}}           |
| 結合テストAPI            | 100% | N/A（IPCは変更なし） |
| 結合テストシナリオ正常系 | 100% | {{RESULT}}           |

## 成果物

| 成果物             | パス                                 | 説明                           |
| ------------------ | ------------------------------------ | ------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・判定・補完内容の記録 |

## 完了条件

- [ ] `SkillLifecyclePanel.tsx`変更部分のLine 80%+を達成している
- [ ] Branch 60%+を達成している
- [ ] Function 80%+を達成している
- [ ] 不足カバレッジがあれば補完テストを追加してGreen確認済み
- [ ] カバレッジレポートが`outputs/phase-7/coverage-report.md`に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 7
```

## 次のPhase

Phase 8: リファクタリング
