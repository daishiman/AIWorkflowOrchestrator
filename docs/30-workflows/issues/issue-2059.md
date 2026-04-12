# [#2059] "[UT-W3-SKILL-WIZARD-EVENTS-SHARED-001] SkillWizardEvents型をpackages/sharedへ移動"

## メタ情報

```yaml
task_id: UT-W3-SKILL-WIZARD-EVENTS-SHARED-001
task_name: SkillWizardEvents型をpackages/sharedへ移動
category: リファクタリング
target_feature: スキル作成ウィザード - イベント型定義の shared 移動
priority: 低
scale: 小規模
status: 未実施
source_phase: W3-seq-04（usage tracking）Phase 12 unassigned-task-detection.md の将来潜在タスク
created_date: 2026-04-08
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-W3-SKILL-WIZARD-EVENTS-SHARED-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillWizardEvents` は現在 `apps/desktop/src/renderer/utils/trackEvent.ts` に
renderer-local として定義されている。W3-seq-04（usage tracking）の Phase 12 では、
IPC/preload 契約への変更を回避するため「no-op（N/A）」と判断し、shared 移動を見送った。

しかし将来、以下のいずれかの条件が満たされた場合、shared への移動が必要になる:

1. `SkillAnalytics` / `AnalyticsStore`（execution-centric 基盤）との統合が計画される
2. Main プロセスでウィザードイベントを受信・処理する要件が発生する
3. Renderer 外のコンテキスト（e2e テスト基盤など）から `SkillWizardEvents` を参照する必要が生じる

現時点では renderer-local のままで十分機能しているが、上記の前提が変わる際に
型の移動が必要になるタイミングを見逃さないよう、本タスクとして記録する。

### 1.2 問題点・課題

- `SkillWizardEvents` が `apps/desktop` の renderer 層に閉じており、
  Main プロセスや他パッケージからは型を参照できない
- 将来の execution-centric 基盤（`SkillAnalytics`/`AnalyticsStore`）との統合時に
  型の置き場所を後から変更すると、import パスの一括変更が必要になる
- W3-seq-04 Phase 12 の判断（no-op）は「IPC/preload 契約変更を回避」という前提に基づいており、
  その前提が崩れた時点で本タスクのトリガーとなる

### 1.3 放置した場合の影響

- Main プロセスでウィザードイベントを処理する要件が発生した際に、
  後追いで型定義を移動する手戻りコストが生じる
- `SkillAnalytics`/`AnalyticsStore` との統合時に概念的な境界が曖昧になり、
  型設計の一貫性が損なわれるリスクがある
- 循環依存が事後的に発覚した場合、修正範囲が広がる可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/utils/trackEvent.ts` で定義されている `SkillWizardEvents` 型を
`packages/shared/src/types/skillCreator.ts` へ移動し、Main プロセス・Renderer 双方から
型安全に参照できる状態にする。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `SkillWizardEvents` が `packages/shared/src/types/skillCreator.ts` に定義されている                                          |
| AC-2 | `apps/desktop/src/renderer/utils/trackEvent.ts` が `@repo/shared/types/skillCreator` から `SkillWizardEvents` を import する |
| AC-3 | `SkillAnalytics`/`AnalyticsStore` との概念的な分離が型コメントで明示されている                                               |
| AC-4 | 循環依存が発生していないこと（`madge` または `pnpm build` で確認）                                                           |
| AC-5 | IPC/preload 契約への影響評価ドキュメントが存在すること                                                                       |
| AC-6 | 既存の `trackEvent` 呼び出し箇所がすべて型エラーなしに動作すること                                                           |
| AC-7 | `packages/shared` のビルドが正常に完了すること                                                                               |
| AC-8 | `trackEvent.ts` のテストカバレッジが移動前と同等以上を維持すること                                                           |

### 2.3 スコープ

含むもの:

- `SkillWizardEvents` 型定義の `packages/shared/src/types/skillCreator.ts` への追記
- `apps/desktop/src/renderer/utils/trackEvent.ts` の import 元変更
- `packages/shared` のビルド正常性確認
- 循環依存チェック
- IPC/preload 契約への影響評価

含まないもの:

- `SkillAnalytics`/`AnalyticsStore` との実装統合
- Main プロセスでのウィザードイベント処理の実装
- IPC チャンネルの追加・変更
- preload API の変更

### 2.4 移動対象の型定義

現在 `apps/desktop/src/renderer/utils/trackEvent.ts` に定義されている型:

```typescript
export type SkillWizardEvents = {
  skill_wizard_started: Record<string, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: WizardSkillCategory;
    hasExternalIntegration: boolean;
  };
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip";
  };
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another";
  };
};
```

移動先: `packages/shared/src/types/skillCreator.ts`（既存の `SkillCategory` / `SkillInfoFormData` 等の近傍に配置）

### 2.5 成果物

| 種別 | ファイルパス                                                                              |
| ---- | ----------------------------------------------------------------------------------------- |
| 修正 | `packages/shared/src/types/skillCreator.ts`                                               |
| 修正 | `apps/desktop/src/renderer/utils/trackEvent.ts`                                           |
| 修正 | `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                            |
| 新規 | `docs/30-workflows/unassigned-task/UT-W3-SKILL-WIZARD-EVENTS-SHARED-001.md`（本ファイル） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: W3-seq-04（`SkillWizardEvents` 計装実装）が完了していること
- `packages/shared/src/types/skillCreator.ts` が既に存在し、`SkillCategory` などの関連型が定義済みであること
- `pnpm --filter @repo/shared build` が正常に完了する状態であること

### 3.2 依存タスク

| タスク ID / Wave                      | 状態 | 内容                                                             |
| ------------------------------------- | ---- | ---------------------------------------------------------------- |
| UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 | 前提 | `SkillWizardEvents` 計装実装（移動元の型が確定している必要あり） |

依存グラフ:

```
UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 → UT-W3-SKILL-WIZARD-EVENTS-SHARED-001（本タスク）
```

### 3.3 推奨アプローチ

1. **影響評価**: `trackEvent.ts` の現状を確認し、IPC/preload 契約への影響を評価するドキュメントを作成する
2. **循環依存チェック**: 移動前に `madge` または `pnpm --filter @repo/shared build` で依存グラフを確認する
3. **型定義の移動**: `SkillWizardEvents` を `packages/shared/src/types/skillCreator.ts` の
   「Skill Wizard Shared Contracts」セクション末尾に追記する（`SkeletonQualityFeedback` の近傍）
4. **import 元の変更**: `trackEvent.ts` の `SkillWizardEvents` を削除し、`@repo/shared/types/skillCreator` から import する
5. **ビルド確認**: `pnpm --filter @repo/shared build` と `pnpm --filter @repo/desktop typecheck` を実行する
6. **テスト確認**: 既存の `trackEvent.test.ts` が全て通ることを確認する

### 3.4 IPC/preload 契約への影響評価方法

本タスクは型定義の移動のみであり、IPC チャンネル・preload API の変更を含まない。
ただし以下を確認すること:

- `SkillWizardEvents` が preload の型定義（`apps/desktop/src/preload/types.ts`）で参照されていないか
- Main プロセス側のハンドラーで `SkillWizardEvents` を使用していないか
- 移動後に preload 契約が変化しないことを `ipc-preload-spec-sync-guardian` スキルで確認する

---

## 4. 実行手順（Phase 1-13 の概要）

詳細は `docs/30-workflows/skill-wizard-redesign-lane/index.md` の W3-seq-04 と
`task-specification-creator` スキルの Phase テンプレートを正とし、ここでは要点のみ記述する。

| Phase | 名称             | 主な作業（要点）                                                                                                                                                                                   |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | `trackEvent.ts` 現状調査、`SkillWizardEvents` の移動可否確認、循環依存の事前評価、IPC/preload 契約への影響有無の確認、AC-1〜AC-8 固定                                                              |
| 2     | 設計             | 移動先セクションの決定（`skillCreator.ts` 内の配置場所）、import パス変更計画、`SkillAnalytics`/`AnalyticsStore` との概念的分離を示す型コメント設計                                                |
| 3     | 設計レビュー     | 循環依存の最終確認、既存 `SkillCategory` 等との型整合性確認、Phase 4 進行可否判定                                                                                                                  |
| 4     | テスト作成       | TDD Red: `trackEvent.ts` が shared から import した場合のテスト、ビルド確認スクリプトの整備                                                                                                        |
| 5     | 実装             | `skillCreator.ts` への `SkillWizardEvents` 追記、`trackEvent.ts` の import 元変更、型コメント追加                                                                                                  |
| 6     | テスト拡充       | `packages/shared` の build テスト、import パス変更後の回帰テスト追加                                                                                                                               |
| 7     | カバレッジ確認   | `trackEvent.ts` のカバレッジが移動前と同等以上を維持、`packages/shared` のビルド成功確認                                                                                                           |
| 8     | リファクタリング | 型コメントの整備・命名揺れ修正（`対象/Before/After/理由` テーブル形式で記録）                                                                                                                      |
| 9     | 品質保証         | `pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint` / `pnpm --filter @repo/desktop test:run` の全通過確認                        |
| 10    | 最終レビュー     | AC-1〜AC-8 の充足確認、IPC/preload 契約への影響なしの最終確認                                                                                                                                      |
| 11    | 手動テスト       | NON_VISUAL: `pnpm --filter @repo/shared build` 出力確認・`pnpm --filter @repo/desktop typecheck` 出力確認・Vitest カバレッジレポートを主証跡として取得                                             |
| 12    | ドキュメント更新 | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` |
| 13    | PR 作成          | ユーザー明示承認後のみ実施（blocked 維持）                                                                                                                                                         |

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: `SkillWizardEvents` が `packages/shared/src/types/skillCreator.ts` に定義されている
- [ ] AC-2: `trackEvent.ts` が `@repo/shared/types/skillCreator` から `SkillWizardEvents` を import している
- [ ] AC-3: `SkillAnalytics`/`AnalyticsStore` との概念的な分離が型コメントで明示されている
- [ ] AC-4: 循環依存が発生していないことが確認されている
- [ ] AC-5: IPC/preload 契約への影響評価ドキュメントが存在する
- [ ] AC-6: 既存の `trackEvent` 呼び出し箇所がすべて型エラーなしに動作する

### ビルド・型チェック要件

- [ ] AC-7: `pnpm --filter @repo/shared build` が PASS
- [ ] `pnpm --filter @repo/shared typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS

### テストカバレッジ要件

- [ ] AC-8: `trackEvent.ts` のテストカバレッジが移動前と同等以上を維持

### 品質要件

- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] 既存の `trackEvent` 利用箇所への影響がない（回帰なし）

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 6. 検証方法

### ビルド確認

```bash
# shared パッケージのビルド確認
pnpm --filter @repo/shared build

# shared の型チェック
pnpm --filter @repo/shared typecheck

# desktop の型チェック（import パス変更後）
pnpm --filter @repo/desktop typecheck
```

### ユニットテスト実行

```bash
# trackEvent.ts のテスト（import パス変更後の回帰確認）
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# 全テスト
pnpm --filter @repo/desktop test:run
```

### 循環依存チェック

```bash
# madge による循環依存確認（インストール済みの場合）
npx madge --circular packages/shared/src/types/skillCreator.ts

# または pnpm build でエラーがないか確認
pnpm --filter @repo/shared build
```

### カバレッジ確認

```bash
# trackEvent.ts のカバレッジ確認
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/trackEvent.ts
```

---

## 7. リスクと対策

| リスク                                                                 | 影響度 | 発生確率 | 対策                                                                                                                                      |
| ---------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared` ビルド出力の変更により他パッケージの import が壊れる | 高     | 中       | Phase 1 で `SkillWizardEvents` が他パッケージから参照されていないか調査し、影響範囲を最小化する                                           |
| `SkillAnalytics`/`AnalyticsStore` との概念的分離が不明確になる         | 中     | 中       | 移動先に「UI 計装専用型であり execution-centric 基盤とは独立」と明示する型コメントを追加する                                              |
| renderer-local 型を shared に移動することで循環依存が発生する          | 高     | 低       | Phase 1 で `madge` による依存グラフを確認し、循環依存が発生しないことを事前検証する                                                       |
| IPC/preload 契約への影響が見落とされる                                 | 中     | 低       | `apps/desktop/src/preload/types.ts` および Main プロセスハンドラーを Phase 1 で全件検索し、`SkillWizardEvents` の参照がないことを確認する |
| `WizardSkillCategory` の import 元が変わり trackEvent.ts が壊れる      | 中     | 中       | `SkillWizardEvents` 移動時に `WizardSkillCategory`（`SkillCategory` の別名）の import も確認し、整合を保つ                                |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                  | パス                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| skill-wizard-redesign-lane インデックス       | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                      |
| W3-seq-04 usage tracking 完了済みタスク仕様書 | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001.md` |
| task-specification-creator スキル             | `.claude/skills/task-specification-creator/SKILL.md`                         |
| ipc-preload-spec-sync-guardian スキル         | `.claude/skills/ipc-preload-spec-sync-guardian/SKILL.md`                     |

### 関連ソースコード

| 対象                           | パス                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| SkillWizardEvents 現在の定義   | `apps/desktop/src/renderer/utils/trackEvent.ts`                |
| 移動先の shared 型定義         | `packages/shared/src/types/skillCreator.ts`                    |
| trackEvent テスト              | `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts` |
| preload 型定義（影響評価対象） | `apps/desktop/src/preload/types.ts`                            |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                           | 原因・背景                                                                                                                                                                | 推奨アプローチ                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared` ビルド出力への影響と他パッケージ import パス変更 | `packages/shared` に型を追加するとビルド成果物が変わり、`@repo/shared` を利用する全パッケージの型解決に影響が及ぶ可能性がある                                             | Phase 1 で `SkillWizardEvents` が現時点で他パッケージから参照されていないことを確認し、追加のみで Breaking Change を生じないことを事前検証する  |
| `SkillAnalytics`/`AnalyticsStore` との概念的分離の維持             | execution-centric 基盤の型と UI 計装イベント型が同ファイルに混在すると、将来の統合設計が曖昧になるリスクがある                                                            | 移動先のセクションを「Skill Wizard UI Instrumentation Events」として明示分離し、`SkillAnalytics` との統合は別タスクで扱う旨をコメントで記述する |
| Renderer-local 型を shared に移動した場合の循環依存                | `apps/desktop` が `@repo/shared` を参照し、`@repo/shared` が `apps/desktop` のモジュールを参照する循環が発生すると、ビルドが失敗または型推論が壊れる                      | `madge` による事前調査を必須とし、`SkillWizardEvents` の依存グラフが `@repo/shared` の外に出ないことを確認してから移動する                      |
| IPC/preload 契約への影響評価                                       | W3-seq-04 Phase 12 で「no-op（N/A）」と判断した根拠は「Main プロセスが `SkillWizardEvents` を参照しない」という前提であり、本タスク実行前にその前提を再確認する必要がある | `apps/desktop/src/preload/types.ts` と Main プロセスの IPC ハンドラーを全件 grep し、`SkillWizardEvents` の参照がないことを Phase 1 で確認する  |

### W3-seq-04 の判断経緯（参考）

W3-seq-04（usage tracking）Phase 12 では、`SkillWizardEvents` を shared に移動することを
「将来潜在タスク」として識別した。当時の判断は以下の通り:

- **移動を見送った理由**: IPC/preload 契約変更を回避するため（Main プロセスが `SkillWizardEvents` を
  現時点では必要としない）
- **移動のトリガー条件**: `SkillAnalytics`/`AnalyticsStore` との統合、または Main プロセスでの
  イベント処理が必要になった時点
- **現状**: `SkillWizardEvents` は Renderer 内部の薄い計装抽象として renderer-local で十分機能している

本タスクを実行するタイミングは、上記トリガー条件が満たされた時点とする。

### 実行時の注意事項

- Phase 13（PR 作成）はユーザーの明示的な承認があるまで blocked 状態を維持する
- コミット・push は禁止（承認後のみ）
- `SkillWizardEvents` の移動は型定義のみとし、実装ロジックの変更は含めない
- IPC/preload 契約変更を伴う場合は別タスクとして分離すること
