# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| Phase名    | リファクタリング                              |
| 前提Phase  | Phase 7                                       |
| 後続Phase  | Phase 9                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 7 でカバレッジ目標を達成した実装を対象に、コードの重複排除・共通化を行い、保守性を向上させる。リファクタ後も全テストが成功することを TDD の観点で確認する。

## 背景

TASK-SC-06（SkillLifecyclePanel）と本タスク（SkillCreateWizard）の両方に `getSkillCreatorApi` 相当のロジックと `SkillCreatorRuntimeApi` 型が存在している可能性がある。重複をそのまま放置すると、Preload API 変更時に複数箇所の修正が必要になりバグの温床となる。また、SkillCreateWizard 内でもステップ間で共通化できるロジックがある場合、早期に整理しておく。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複コードの洗い出し

**目的**: リファクタリング対象を特定する

**実行手順**:

1. 以下のファイルを読み込み、`getSkillCreatorApi` 相当の関数・ロジックを抽出する:
   - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
   - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
2. `SkillCreatorRuntimeApi` 型（または相当する型）の定義箇所を両ファイルで比較する
3. 以下の観点で重複・類似コードをリストアップする:
   - `window.electronAPI.skillCreator` へのアクセスパターン
   - `planSkill` / `executePlan` 呼び出しの引数構築ロジック
   - エラーハンドリングパターン（try-catch の構造）
   - 生成状態クリア処理（`clearGenerationState` + ローカル state リセット）
4. 結果を `outputs/phase-8/duplication-report.md` に記録する

**期待される成果物**:

- `outputs/phase-8/duplication-report.md`（重複コード一覧）

---

### タスク2: SkillCreatorRuntimeApi 型の共通化

**目的**: 型定義の Single Source of Truth を確立する

**実行手順**:

1. `SkillCreatorRuntimeApi` 型が複数箇所に定義されている場合、共通化先を決定する
2. 共通化の候補として以下を検討する:
   - `packages/shared/src/types/` への移動
   - `apps/desktop/src/renderer/types/` への集約
   - `apps/desktop/src/preload/skill-creator-api.ts` からの直接 re-export
3. **判断基準**:
   - Preload API の型と完全一致する場合 → Preload 側から import
   - Renderer 固有の拡張が含まれる場合 → Renderer 共通ファイルに定義
4. 決定した方針に従いリファクタリングを実施する
5. 変更後、該当ファイルで型エラーがないことを確認する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
6. 結果を `outputs/phase-8/type-consolidation.md` に記録する

**期待される成果物**:

- `outputs/phase-8/type-consolidation.md`（型共通化の決定と実施記録）

---

### タスク3: getSkillCreatorApi の共通化検討

**目的**: `window.electronAPI.skillCreator` へのアクセスを一元化する

**実行手順**:

1. SkillLifecyclePanel と SkillCreateWizard の `getSkillCreatorApi`（または相当処理）を比較する
2. 以下の基準で共通化の可否を判断する:

   | 条件                                       | 判断         |
   | ------------------------------------------ | ------------ |
   | 両コンポーネントで完全に同一のロジック     | 共通化する   |
   | 微妙な差異があるが統一できる               | 共通化する   |
   | コンポーネント固有の文脈に強く依存している | 共通化しない |

3. 共通化する場合、以下のいずれかの方法を選択する:
   - カスタムフック `useSkillCreatorApi()` として `apps/desktop/src/renderer/hooks/` に切り出す
   - ユーティリティ関数として `apps/desktop/src/renderer/utils/` に切り出す
4. 共通化を実施し、両コンポーネントで import して使用する
5. 共通化しない場合は理由を記録し、タスク完了とする
6. 結果を `outputs/phase-8/api-consolidation.md` に記録する

**期待される成果物**:

- `outputs/phase-8/api-consolidation.md`（共通化の決定と実施記録）

---

### タスク4: コンポーネント内の重複コード削除

**目的**: SkillCreateWizard 内の重複を排除する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` 内で以下を確認する:
   - 同一のエラーハンドリングパターンが複数箇所にある場合は共通化する
   - 生成状態クリアのロジックが分散している場合は関数として切り出す（例: `resetGenerationState()`）
   - wizard ステップ間で共通する Props 変換ロジックがあれば整理する
2. リファクタリングを実施する（動作変更は一切行わない）
3. 変更後のコードが読みやすくなっていることをセルフレビューで確認する
4. 結果を `outputs/phase-8/component-refactoring.md` に記録する

**期待される成果物**:

- `outputs/phase-8/component-refactoring.md`（コンポーネント内リファクタリング記録）

---

### タスク5: TDD 確認（リファクタ後テスト実行）

**目的**: リファクタリングにより既存テストが壊れていないことを確認する

**実行手順**:

1. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
2. 失敗しているテストがある場合はリファクタリングのコードを修正する（テストは修正しない）
3. 全テストが成功するまで繰り返す
4. テスト成功を確認後、型チェックも実施する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
5. 結果を `outputs/phase-8/tdd-confirmation.md` に記録する

**期待される成果物**:

- `outputs/phase-8/tdd-confirmation.md`（テスト実行結果）

---

## 参照資料

| 参照資料            | パス                                                                                 | 内容                              |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 | TASK-SC-06 の参考実装（比較対象） |
| SkillCreateWizard   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                   | リファクタリング対象              |
| Preload API         | `apps/desktop/src/preload/skill-creator-api.ts`                                      | 型共通化の検討元                  |
| Phase 7 成果物      | `outputs/phase-7/`                                                                   | カバレッジ達成済み状態の確認      |
| TASK-SC-06 苦戦箇所 | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md` | 既知の落とし穴（C-1, C-2, C-4）   |

---

## 成果物

| 成果物                 | パス                                       | 内容                                        |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| 重複コード一覧         | `outputs/phase-8/duplication-report.md`    | リファクタリング対象の洗い出し結果          |
| 型共通化記録           | `outputs/phase-8/type-consolidation.md`    | SkillCreatorRuntimeApi 型の共通化方針と実施 |
| API共通化記録          | `outputs/phase-8/api-consolidation.md`     | getSkillCreatorApi 共通化の決定と実施       |
| コンポーネント整理記録 | `outputs/phase-8/component-refactoring.md` | SkillCreateWizard 内リファクタリング記録    |
| TDD確認結果            | `outputs/phase-8/tdd-confirmation.md`      | リファクタ後テスト実行結果                  |

---

## 統合テスト連携（Phase 8）

リファクタリングは動作変更を行わないため、統合テストの観点は以下の確認のみ:

- `planSkill` / `executePlan` の IPC 呼び出しシグネチャがリファクタ後も変わっていないこと
- 共通化したユーティリティ/フックが両コンポーネントで正しく動作すること
- Preload API へのアクセスパターンが統一され、型安全性が向上していること

---

## 完了条件

- [ ] 重複コードの洗い出しが完了している（`duplication-report.md` 生成済み）
- [ ] `SkillCreatorRuntimeApi` 型の共通化方針が決定・実施されている
- [ ] `getSkillCreatorApi` 共通化の可否が判断・実施されている
- [ ] SkillCreateWizard 内の重複コードが排除されている
- [ ] リファクタ後も全テストが成功している（`vitest run` グリーン）
- [ ] リファクタ後も型チェックが通過している（`typecheck` エラーなし）
- [ ] リファクタリングにより動作変更が発生していないこと

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了し、カバレッジ目標を達成していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-9-quality-assurance.md`
