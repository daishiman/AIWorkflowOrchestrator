# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 8                                       |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 7 成果物（`outputs/phase-7/`）    |

## 目的

機能動作を変えずにコードの可読性・保守性・再利用性を向上させる。ボタンスタイルの共通化とテストの重複排除を主要な対象とする。

## 参照資料

- Phase 1 成果物: `outputs/phase-1/` / `phase-1-requirements.md`
- Phase 2 成果物: `outputs/phase-2/` / `phase-2-design.md`
- Phase 5 成果物: `outputs/phase-5/`
- Phase 6 成果物: `outputs/phase-6/`
- Phase 7 成果物: `outputs/phase-7/`
- コード品質ルール: `.claude/rules/02-code-quality.md`
- アーキテクチャルール: `.claude/rules/01-architecture.md`

### システム仕様（aiworkflow-requirements）

> リファクタリングでは child companion の責務境界を崩さないことを優先する。

| 参照資料                                                                     | パス                                                                                                                                                 | 内容                                                                   |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ui-ux-feature-components-reference                                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                                                            | `SkillDetailPanel` / `useSkillCenter` / SkillCenter surface の責務境界 |
| arch-state-management-reference-permissions-import-lifecycle                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md`                                  | `useSkillCenter` の個別セレクタ運用と状態境界                          |
| architecture-implementation-patterns-reference-agent-view-selector-migration | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-agent-view-selector-migration.md`                  | selector migration / P31/P48 の具体パターン                            |
| ui-ux-components / ui-ux-design-system                                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` / `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | Button variant、spacing、8px grid の非機能要件                         |

## 実行タスク

### Task 1: ボタンスタイルの共通化

`SkillDetailPanel` 内のアクションボタン（「エディタで開く」「分析する」）は同一のベーススタイルを持つ。スタイル定義を共通化し、ハードコードの重複を排除する。

**対象ファイル:**

- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`

**リファクタリング方針:**

- `buttonBaseStyle` 等の定数をモジュールスコープに抽出し、各ボタン定義から参照する
- ボタン種別ごとの差分スタイルのみを個別に定義する
- P47 準拠: `variantStyles` を `Record<variant, string>` 型でエクスポートし、テストからも参照可能にする

```typescript
// 例: モジュールスコープへの抽出
export const actionButtonVariants: Record<"edit" | "analyze", string> = {
  edit: "...",
  analyze: "...",
};
```

### Task 2: テストの重複排除

Phase 4〜6 で作成したテストコードに重複するセットアップ処理が存在する場合は整理する。

**対象ファイル:**

- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`（handleEditSkill / handleAnalyzeSkill 関連部分）

**リファクタリング方針:**

- 共通の mock オブジェクト定義を `beforeEach` に集約する
- テストヘルパー関数（`renderWithImported(isImported: boolean)` 等）を定義してテスト間の重複レンダリング処理を排除する
- P9 準拠: `beforeEach` でモジュールスコープ変数をリセットする

### Task 3: 型定義の整理

`handleEditSkill` / `handleAnalyzeSkill` の引数・戻り値の型を明示する。

**対象ファイル:**

- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`

**リファクタリング方針:**

- 引数の public contract は `skillName: string` のまま維持し、Phase 2 / 5 / 10 の契約と一致させる
- 戻り値型を `void` で明示し、同期遷移ハンドラであることを固定する
- `Skill` オブジェクト受け渡しへの拡張は本タスク範囲外とし、`skillName` 契約を広げない
- `any` 型が残っている場合は厳密な型定義に置き換える

### Task 4: リファクタリング後の動作確認

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts
```

テストが全件 PASS していることを確認する。

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| ファイル                                 | 内容                                 |
| ---------------------------------------- | ------------------------------------ |
| `outputs/phase-8/refactoring-summary.md` | 実施したリファクタリングの一覧と差分 |
| `outputs/phase-8/test-result-after.txt`  | リファクタリング後のテスト実行結果   |

## 完了条件

- [ ] ボタンスタイルが共通定数として抽出されている
- [ ] テスト間の重複セットアップが `beforeEach` またはヘルパー関数に集約されている
- [ ] `handleEditSkill` / `handleAnalyzeSkill` の引数・戻り値型が明示されている
- [ ] `any` 型の使用箇所がゼロである
- [ ] リファクタリング後もテストが全件 PASS している
- [ ] `outputs/phase-8/refactoring-summary.md` に変更内容が記録されている

**本Phase内の全タスクを100%実行完了** してから次フェーズへ進むこと。

## 次 Phase

Phase 9（品質検証）へ進む。
