# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| Phase名    | 設計                              |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 1: 要件定義                 |
| 後続Phase  | Phase 3: 設計レビューゲート       |
| ステータス | 完了                              |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

Phase 1 で確定した要件に基づき、baseline drift 是正の実施方針・手順・設計を文書化する。

## 背景

Phase 1 の調査で、diff の起点は `51b3fc0c2` における意図した UI 変更と baseline 再生成の一時的なタイミング差であることが判明した。
今回の設計では、UI バグ修正は不要とし、dark-mode の再現性向上（`colorScheme: "dark"` の明示的固定）を中心とした設定強化を方針とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 判定フローの設計

**目的**: UI 変更起因か regression 起因かを判定する手順を設計する。

**判定フロー**:

1. `git log --follow -- apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` を確認する。
2. `git log -- apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` を確認する。
3. `51b3fc0c2` で UI と snapshots が同時更新されている場合は、UI 変更起因と判断する。
4. regression 起因なら `apps/desktop/src/renderer/` の関連 UI を修正する。

**期待される成果物**:

- 判定フローが明文化されていること

---

### タスク2: baseline 更新設計

**目的**: 安全に baseline を更新するための手順を設計する。

**設計内容**:

- 更新は `--update-snapshots` を使って `ui-ux-layer2` のみ実行する。
- 更新後は `git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` で 3 surface だけを確認する。
- 3 surface 以外が変わった場合は `git restore --source=HEAD -- <path>` で戻す。

**実施コマンド設計**:

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --update-snapshots
git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
```

**期待される成果物**:

- baseline 更新手順が設計されていること

---

### タスク3: UI 修正設計（regression 起因の場合）

**目的**: regression 起因と判定された場合の修正設計を準備する。

**設計内容**:

- regression 起因なら `error-display` / `loading-state` / `dark-mode` の該当コンポーネントだけ修正する。
- 修正後は `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` を再実行する。

**期待される成果物**:

- regression 起因時の修正方針が設計されていること

---

### タスク4: dark-mode 安定化設計

**目的**: OS テーマに依存しない dark-mode テスト環境を設計する。

**設定箇所**:

- `apps/desktop/playwright.config.ts:54`
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts:18`

**設計意図**:

- `ui-ux-layer2` だけに `colorScheme: "dark"` を当てて、OS テーマ依存を切り離す。
- `maxDiffPixels` は `20 / 30 / 50` のまま維持し、200px の上限を超えない。

**期待される成果物**:

- dark-mode 固定設定の設計が文書化されていること

---

## 参照資料

| 参照資料          | パス                                                      | 内容                 |
| ----------------- | --------------------------------------------------------- | -------------------- |
| 要件定義書        | `outputs/phase-1/requirements.md`                         | FR・AC・方針決定     |
| playwright 設定   | `apps/desktop/playwright.config.ts`                       | colorScheme 設定箇所 |
| Layer 2 テスト    | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`            | テスト実装           |
| baseline snapshot | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` | 現行 baseline        |

---

## 成果物

| 成果物 | パス                        | 内容                                          |
| ------ | --------------------------- | --------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 判定フロー・baseline更新・dark-mode安定化設計 |

---

## 完了条件

- [x] UI 変更起因 / regression 起因の判定フローが設計されている
- [x] baseline 更新手順（`--update-snapshots` + 3 surface 限定確認）が設計されている
- [x] regression 起因時の UI 修正方針が設計されている
- [x] `colorScheme: "dark"` による dark-mode 安定化設計が完了している
- [x] `outputs/phase-2/design.md` に設計内容を記録した
