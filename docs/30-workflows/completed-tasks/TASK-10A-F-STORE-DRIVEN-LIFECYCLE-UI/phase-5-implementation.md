# Phase 5: 実装

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |
| モード | P50該当: 実装検証                    |

## 目的

既存コードが Phase 2 設計どおりに実装されていることを確認する。

## 実行タスク

- hook監査: `useSkillAnalysis.ts` の direct IPC 排除を確認する
- view監査: `SkillAnalysisView.tsx` の表示責務を確認する
- wizard監査: `SkillCreateWizard.tsx` の `useCreateSkill()` 利用を確認する
- 境界監査: 残存直接 IPC の対象外境界を確認する

## 参照資料

| 資料名      | パス                                                                   | 説明       |
| ----------- | ---------------------------------------------------------------------- | ---------- |
| Phase 4     | `phase-4-test-creation.md`                                             | テスト観点 |
| Phase 2     | `phase-2-design.md`                                                    | 設計基準   |
| Hook 実装   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 監査対象   |
| View 実装   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     | 表示責務   |
| Wizard 実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | 作成導線   |

## 実行手順

### ステップ1: hook 実装確認

```bash
rg -n 'window\\.electronAPI\\.skill\\.(analyze|applyImprovements|autoImprove)' \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts
```

### ステップ2: wizard 実装確認

```bash
rg -n 'useCreateSkill|window\\.electronAPI\\.skill\\.create' \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### ステップ3: 残存境界確認

- `SkillImportDialog` は本タスク対象外
- `SkillEditor` は後続 TASK-10A-G 側

## 統合テスト連携

- 実装確認結果を Phase 9 の grep / test 判定へ接続する

## 多角的チェック観点

| 観点           | 確認内容                                            |
| -------------- | --------------------------------------------------- |
| アーキテクチャ | hook / view / wizard の責務分離                     |
| 依存関係       | Store action へ依存し、Renderer direct IPC がないか |
| スコープ       | 対象外ファイルを巻き込まないか                      |

## 成果物

| 成果物       | パス                                                                                                              | 説明             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| 実装検証結果 | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-5/implementation-result.md` | 実装監査レポート |
| コード成果物 | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                                            | 既存実装の正本   |

## 完了条件

- [ ] hook に direct IPC が残っていない
- [ ] wizard が `useCreateSkill()` を使う
- [ ] view が描画責務に留まる
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. hook確認
2. view確認
3. wizard確認
4. 境界確認
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 6: テスト拡充
