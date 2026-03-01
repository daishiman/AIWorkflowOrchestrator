# TASK-UI-05 SkillDetailPanel 内部 Molecule 分離 - タスク指示書

## メタ情報

```yaml
issue_number: 951
```

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-UI-05-002                        |
| タスク名   | SkillDetailPanel 内部 Molecule 分離 |
| 分類       | 改善                                |
| 対象機能   | SkillCenterView 詳細パネル          |
| 優先度     | 中                                  |
| ステータス | 未実施                              |
| 発見元     | TASK-UI-05 Phase 10 MINOR-2         |
| 発見日     | 2026-03-01                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillDetailPanel.tsx` に複数責務（権限表示、説明表示、Danger Zone、メタ情報表示）が集約されており、コンポーネントの見通しと再利用性が低下している。

### 1.2 問題点

- Atomic Design の Molecule 粒度を満たさず、テスト境界が曖昧。
- 仕様差分（FR-5-6 等）の追跡時に影響範囲が広くなる。
- UI変更が1ファイル集中となり、レビューコストが増える。

### 1.3 放置影響

- 保守時の回帰リスクが上がる。
- フォーク/拡張時に差分が肥大化し、後続UT（UT-UI-05-005）実装が難化する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillDetailPanel` 内部責務を Molecule 単位へ分離し、可読性・テスト性・再利用性を改善する。

### 2.2 完了イメージ

- `SkillCapabilities`, `SkillPermissions`, `SkillDangerZone`, `SkillMetaInfo` を独立コンポーネント化。
- `SkillDetailPanel.tsx` はレイアウト統合とイベント配線に責務限定。
- 既存テストを分割更新し、回帰なしを確認。

### 2.3 スコープ

- 含む: コンポーネント分離、Props定義、テスト再配置。
- 含まない: UIデザイン変更、文言変更、機能追加。

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/` の編集権限。
- SkillCenterView テストが実行可能。

### 3.2 推奨アプローチ

1. 既存 `SkillDetailPanel.tsx` を責務ごとに抽出対象へ区分する。
2. Molecule ごとに `Props` を明示し、UIロジックを移譲する。
3. 統合テストで表示内容とイベント配線の不変を検証する。

### 3.3 実装課題と解決策（親タスクからの教訓）

| 課題                                | 解決策                                       |
| ----------------------------------- | -------------------------------------------- |
| 1ファイル集中で差分レビューが難しい | 内部セクションを分離し、単機能ファイルにする |
| 仕様との差分が視認しづらい          | Molecule単位でテストIDと責務名を合わせる     |

---

## 4. 実行手順

1. `SkillDetailPanel.tsx` のセクション境界を確認し、分離候補を確定する。
2. `components/SkillDetailPanel/` 配下に Molecule ファイルを新規作成する。
3. 既存 JSX を抽出し、Props 経由でデータ注入する。
4. 既存テストを更新し、Molecule 単体の表示/イベントを追加検証する。
5. 仕様書（`ui-ux-feature-components.md`）に構成更新が必要か確認する。

---

## 5. 完了条件チェックリスト

- [ ] `SkillDetailPanel.tsx` の責務が統合レイヤーに限定されている。
- [ ] Molecule 分離後も既存のUI/操作が同等動作する。
- [ ] 追加・更新テストがPASSする。

---

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx
```

---

## 7. リスクと対策

| リスク                           | 対策                                                 |
| -------------------------------- | ---------------------------------------------------- |
| Props分割時の型不整合            | `SkillMetadata`/`ImportedSkill` の利用境界を明示する |
| data-testid 変更によるテスト破壊 | 既存IDを維持し、必要時は移行テーブルを作る           |

---

## 8. 参照情報

- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`
- `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

---

## 9. 備考

UT-UI-05-005（Markdown全文表示）より先に構造分離を行うと、実装差分とテスト差分を局所化できる。
