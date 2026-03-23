# Phase 2: 設計サマリー

## メタ情報

| 項目     | 内容                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001                                         |
| Phase    | 2                                                                                             |
| 作成日   | 2026-03-23                                                                                    |
| 前提     | Phase 1 成果物（requirements-definition.md, scope-definition.md, current-state-inventory.md） |

## 1. Concern 分解（3つ以下に整理）

### Concern A: Legacy Lane Inventory と Direct SDK Path 整理

**責務**: agent-client.ts の direct SDK path と modifier-skill.ts の legacy 実装を棚卸しし、integrated runtime への移行順序を定義する。

| 対象ファイル      | 現状             | 整理方針                             | ownership          |
| ----------------- | ---------------- | ------------------------------------ | ------------------ |
| agent-client.ts   | direct SDK 利用  | Agent SDK adapter 経由に移行         | UT-SLIDE-IMPL-001  |
| modifier-skill.ts | legacy 実装      | ModifierResponse 拡張後に adapter 化 | UT-SLIDE-IMPL-001  |
| skill-executor.ts | lane 分岐 active | integrated/manual 分岐の契約を明示化 | Task08（本タスク） |

**整理順序**:

1. skill-executor.ts の lane 分岐契約を確定（Task08）
2. ModifierResponse に fallback 情報を追加（Task08 設計 → UT-SLIDE-IMPL-001 実装）
3. agent-client.ts を Agent SDK adapter 経由に移行（UT-SLIDE-IMPL-001）
4. modifier-skill.ts を新契約に合わせて更新（UT-SLIDE-IMPL-001）

### Concern B: Manual Fallback Card と UI 4領域

**責務**: SlideWorkspace の UI 4領域（progress row, guidance block, fallback card, terminal launcher）の表示契約と状態遷移を設計する。

**状態遷移**:

```
synced → running → synced（正常終了）
                 → degraded（品質低下、fallback card 表示）
                 → guidance（操作ガイダンス表示）

degraded → guidance（ユーザーが fallback card の CTA をクリック）
         → synced（手動復旧成功）

guidance → synced（ユーザーがガイダンスに従って操作完了）
```

**UI 4領域の表示ルール**:

| 領域              | synced | running | degraded | guidance |
| ----------------- | ------ | ------- | -------- | -------- |
| progress row      | show   | show    | show     | show     |
| guidance block    | hide   | hide    | show     | show     |
| fallback card     | hide   | hide    | show     | hide     |
| terminal launcher | hide   | hide    | hide     | show     |

### Concern C: Cleanup Ordering と Task09 Governance Follow-up

**責務**: legacy path の cleanup 順序と Task09 governance が拾う follow-up ルールを定義する。

**Cleanup 順序（Phase Gate 付き）**:

| 順序 | 作業                                   | Gate 条件                  | 担当タスク               |
| ---- | -------------------------------------- | -------------------------- | ------------------------ |
| 1    | lane 分離契約の確定                    | Task08 Phase 3 PASS        | Task08                   |
| 2    | UI 4領域契約の確定                     | Task08 Phase 3 PASS        | Task08                   |
| 3    | ModifierResponse 型拡張の実装          | Task08 完了                | UT-SLIDE-IMPL-001        |
| 4    | SlideWorkspace UI 4領域反映            | 3 完了                     | UT-SLIDE-UI-001          |
| 5    | agent-client.ts → Agent SDK adapter 化 | 4 完了 + Task09 governance | UT-SLIDE-IMPL-001        |
| 6    | IPC namespace 統一                     | 5 完了                     | Task09 follow-up         |
| 7    | silent fallback 明示化                 | 6 完了                     | UT-SLIDE-IMPL-001        |
| 8    | P31 無限ループ対策                     | 4 完了                     | UT-SLIDE-P31-001         |
| 9    | terminal handoff 重複解消              | 2 完了 + Task05 完了       | UT-SLIDE-HANDOFF-DUP-001 |

## 2. Simpler Alternative と不採用理由

### Alternative 1: agent-client.ts を即時削除し、stub に置き換え

- **概要**: direct SDK path を即時削除し、stub 関数で fallback card を常時表示
- **利点**: 即時 legacy 排除
- **不採用理由**: 既存の slide 機能が完全に停止する。段階的移行が必要

### Alternative 2: UI 4領域を簡略化し、progress row + 汎用 banner のみ

- **概要**: guidance block / fallback card / terminal launcher を統合した汎用 banner で代替
- **利点**: UI 実装コストが低い
- **不採用理由**: ui-ux-realization.md の screenshot 契約（UX-07）で degraded / fallback / guidance の3状態を区別する要件がある。汎用 banner では状態の明示性が不足する

### Alternative 3: IPC namespace 統一を Task08 で実施

- **概要**: legacy channel 名残存の cleanup も Task08 で同時に行う
- **利点**: 一括整理で drift リスク低減
- **不採用理由**: Task08 は設計タスクであり、IPC channel のリネームはプロダクションコード変更を伴う。Task09 governance に委譲して影響範囲を管理する

## 3. Phase 3 Review 観点

### drift しやすい箇所

| 箇所                        | drift リスク                                   | 検証方法                                       |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| skill-executor.ts lane 分岐 | integrated/manual の判定条件が曖昧化する       | Phase 4 テストマトリクスで分岐条件を網羅       |
| ModifierResponse 型拡張     | 既存の消費箇所が拡張フィールドを無視する       | Phase 5 file-change-scope で全消費箇所をリスト |
| UI 4領域の表示ルール        | 状態遷移と表示ルールの不整合が発生する         | Phase 11 screenshot 契約で視覚検証             |
| cleanup 順序                | 依存関係を無視した並列実行で contract が壊れる | Phase 10 最終レビューで依存グラフを再検証      |

### blocked 条件

| 条件                                                | blocked される Phase                      |
| --------------------------------------------------- | ----------------------------------------- |
| Task05（terminal handoff）未完了                    | Phase 5（terminal launcher 契約が未確定） |
| ui-ux-realization.md の UX-07 screenshot 契約が変更 | Phase 11                                  |
| Task09 governance の follow-up ルール形式が変更     | Phase 12                                  |
