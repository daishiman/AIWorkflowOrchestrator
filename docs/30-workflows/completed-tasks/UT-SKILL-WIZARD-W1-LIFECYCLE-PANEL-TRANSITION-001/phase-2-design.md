# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 2                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 1                                                    |
| 後続Phase  | Phase 3                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

Phase 1 で確定した要件に基づき、`SkillLifecyclePanel.tsx` のコンポーネント設計を行う。  
削除する UI 要素・state・ハンドラ、追加するウィザード遷移ボタンの設計を確定する。

---

## 実行タスク

- **UI 構造設計**: テキストエリア削除後のコンポーネントレイアウト設計
- **state 整理設計**: 削除対象 state とその依存関係の整理方針
- **ウィザードボタン設計**: 追加するボタンの配置・スタイリング・data-testid
- **テスト設計方針**: 6 本のテストファイル更新方針の確定

---

## 参照資料

| 資料名             | パス                                                                         | 用途           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                 | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                     | AC 一覧        |
| 削除対象分析       | `outputs/phase-1/deletion-target-analysis.md`                                | 削除対象の全量 |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`         | 変更対象       |
| UI/UX 仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-lifecycle.md` | 画面仕様       |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | state 設計根拠 |

---

## 実行手順

### ステップ 1: concern 分類

本タスクの concern は以下の 2 つ（5 未満のため単一ファイルで管理）:

| concern    | 対象                                         | 変更種別   |
| ---------- | -------------------------------------------- | ---------- |
| UI 変更    | テキストエリア → ウィザードボタン            | 削除・追加 |
| state 整理 | `request` / `executionPrompt` / 依存ハンドラ | 削除・整理 |

### ステップ 2: 削除対象の設計

**削除する UI 要素:**

| data-testid                       | 要素タイプ | 関連 state        |
| --------------------------------- | ---------- | ----------------- |
| `skill-lifecycle-request-input`   | textarea   | `request`         |
| `skill-lifecycle-execution-input` | textarea   | `executionPrompt` |

**削除する state・ハンドラ（確認後に確定）:**

| 名称                | 種別    | 依存先                 | 削除可否         |
| ------------------- | ------- | ---------------------- | ---------------- |
| `request`           | state   | textarea onChange      | 削除可           |
| `executionPrompt`   | state   | textarea onChange      | 削除可           |
| `approvedSkillSpec` | state   | `executePlan` ハンドラ | 要確認           |
| onChange handlers   | handler | 上記 state の更新関数  | state 削除に従う |

> **注意**: `approvedSkillSpec` は `executePlan` ハンドラとの依存があるため、フロー全体を確認してから削除可否を判定する。

### ステップ 3: ウィザードボタン設計

**追加するボタン:**

```tsx
<button
  data-testid="skill-lifecycle-open-wizard-button"
  onClick={onOpenWizard}
  className="..." // Tailwind CSS でスタイリング
>
  スキルを作成する
</button>
```

**props 設計:**

| prop 名          | 型           | 必須 | 説明                                                     |
| ---------------- | ------------ | ---- | -------------------------------------------------------- |
| `onOpenWizard`   | `() => void` | 必須 | ウィザードを開くコールバック（current facts で実装済み） |
| `onOpenSettings` | `() => void` | 任意 | 設定画面を開くコールバック（banner 用）                  |

> **スコープ境界**: `onOpenWizard` / `onOpenSettings` の配線は current facts で完了済み。本タスクは UI 配置と整合確認を担う。

### ステップ 4: テスト更新方針

| テストファイル                                 | 更新内容                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `SkillLifecyclePanel.test.tsx`                 | `skill-lifecycle-request-input` / `skill-lifecycle-execution-input` 参照削除、ウィザードボタンテスト追加 |
| `SkillLifecyclePanelAdapterStatus.test.tsx`    | textarea 参照削除（影響がある場合）                                                                      |
| `SkillLifecyclePanelApproval.test.tsx`         | textarea 参照削除（影響がある場合）                                                                      |
| `SkillLifecyclePanelAuthRegression.test.tsx`   | textarea 参照削除（影響がある場合）                                                                      |
| `SkillLifecyclePanelErrorPersistence.test.tsx` | textarea 参照削除（影響がある場合）                                                                      |
| `SkillLifecyclePanelLlmGeneration.test.tsx`    | textarea 参照削除（影響がある場合）                                                                      |

### ステップ 5: レイアウト設計

テキストエリア削除後のレイアウト方針:

- テキストエリアが占めていたスペースにウィザード遷移ボタンを配置
- ボタンは Tailwind CSS で現行デザインに合わせてスタイリング
- `data-testid="skill-lifecycle-open-wizard-button"` を付与

---

## 統合テスト連携

- ウィザード遷移インターフェース（`onOpenWizard` prop）と settings 導線（`onOpenSettings` prop）を設計書に明記する
- テストではボタンのレンダリング確認と `onOpenWizard` / `onOpenSettings` の呼び出し確認を設計する
- `onOpenWizard` / `onOpenSettings` の配線は current facts として設計書に固定する

---

## 多角的チェック観点

| 思考法       | 確認内容                                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| 依存関係思考 | `approvedSkillSpec` state の削除前に `executePlan` との依存を確認               |
| 型整合思考   | `onOpenWizard` / `onOpenSettings` prop 追加後の TypeScript 型エラーがないか確認 |
| テスト影響   | 削除した data-testid が 6 本のテストで参照されていないか確認                    |
| スコープ境界 | 追加のウィザード統合機能が本タスクに混入しないか確認                            |

---

## 成果物

| 成果物            | パス                                      | 説明                           |
| ----------------- | ----------------------------------------- | ------------------------------ |
| 設計書            | `outputs/phase-2/design-document.md`      | コンポーネント設計・state 整理 |
| テスト更新方針    | `outputs/phase-2/test-update-strategy.md` | 6 本のテストファイル更新方針   |
| UI レイアウト設計 | `outputs/phase-2/ui-layout-design.md`     | 削除後のレイアウト設計         |

---

## 完了条件

- [ ] 削除する UI 要素・state・ハンドラの設計が完了した
- [ ] ウィザード遷移ボタンの設計（data-testid・props・スタイリング方針）が完了した
- [ ] 6 本のテストファイルの更新方針が確定した
- [ ] `approvedSkillSpec` state の削除可否が判定された
- [ ] 追加のウィザード統合機能との境界が明示された
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 2
```

---

## 次のPhase

Phase 3: 設計レビューゲート
