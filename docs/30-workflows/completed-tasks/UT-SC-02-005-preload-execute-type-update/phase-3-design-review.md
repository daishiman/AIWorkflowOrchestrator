# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 3                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

Phase 2 の設計の妥当性を検証し、Phase 4 へ進めるか判定する。

## 実行タスク

- タスク1: plan/improve/execute の型統一性レビュー
- タスク2: 型ナロイングパターンの一貫性確認
- タスク3: simpler alternative の検討

---

### タスク1: plan/improve/execute の型統一性レビュー

以下の3メソッドで Union 型の扱いが統一されているか確認する。

| メソッド     | Preload 戻り値型                                         | IPC ハンドラ戻り値型                            | 統一済み |
| ------------ | -------------------------------------------------------- | ----------------------------------------------- | -------- |
| planSkill    | `IpcResult<RuntimeSkillCreatorPlanResponse>`             | `IpcResult<RuntimeSkillCreatorPlanResponse>`    | 確認対象 |
| executePlan  | `IpcResult<RuntimeSkillCreatorExecuteResponse>` (修正後) | `IpcResult<RuntimeSkillCreatorExecuteResponse>` | 確認対象 |
| improveSkill | 確認対象                                                 | 確認対象                                        | 確認対象 |

```bash
# 3メソッドの Preload 戻り値型を一括確認
grep -A5 "planSkill\|executePlan\|improveSkill" apps/desktop/src/preload/skill-creator-api.ts | grep "Promise"

# 3メソッドの IPC ハンドラ戻り値型を一括確認
grep "Promise<IpcResult" apps/desktop/src/main/ipc/creatorHandlers.ts
```

### タスク2: 型ナロイングパターンの一貫性確認

Renderer 側で plan/improve の `terminal_handoff` 型ナロイングがどのパターンで実装されているか確認し、execute も同じパターンを採用しているか検証する。

```bash
# planSkill の型ナロイングパターンを確認
grep -B2 -A5 "terminal_handoff\|\"type\" in" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### タスク3: simpler alternative の検討

| 代替案                                               | 採否   | 理由                                                       |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------- |
| 型変更せず `as` キャストで対応                       | 不採用 | 型安全性を損なう。P44 パターンの根本解決にならない         |
| `RuntimeSkillCreatorExecuteResult` に `type?` を追加 | 不採用 | SSoT（packages/shared）の型定義を不必要に変更する          |
| Union 型 + `"type" in` 型ナロイング（Phase 2 設計）  | 採用   | 標準的な discriminated union パターン。plan/improve と統一 |

## レビュー結果判定

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ     |
| MAJOR    | 重大な問題あり           | Phase 2 へ戻り設計修正     |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

### レビュー観点

| #   | 観点                            | 確認内容                                                                | 結果   |
| --- | ------------------------------- | ----------------------------------------------------------------------- | ------ |
| 1   | plan/improve/execute の型統一性 | 3メソッド全てで Union 型レスポンスを使用しているか                      | 未実施 |
| 2   | 型ナロイングパターンの一貫性    | Renderer 側で同じ `"type" in` パターンを使用しているか                  | 未実施 |
| 3   | バレルエクスポートの存在確認    | `RuntimeSkillCreatorExecuteResponse` が shared から export されているか | 未実施 |
| 4   | 影響範囲の網羅性                | 修正対象ファイルが全て特定されているか                                  | 未実施 |
| 5   | P44/P45 パターンの根本対策      | 型の不整合が構造的に解消されるか                                        | 未実施 |

### MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |
| （なし） | -        | -             | -             | -    |

## Phase 4 開始条件

- [ ] Phase 3 レビュー判定が PASS または MINOR（全 MINOR 追跡済み）
- [ ] plan/improve/execute の3メソッドで Union 型の扱いが統一されていることが確認されている
- [ ] Phase 2 設計の影響範囲が網羅的であることが確認されている

## Phase 13 blocked 条件

- Phase 12 まで全て完了し、ユーザーの明示的な承認があるまで Phase 13 は blocked

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

- [ ] IPC 3層の型契約が一致することの設計確認
- [ ] Renderer 側の型ナロイングが全てのレスポンスパターンをカバーすることの確認

## 参照資料

| 参照資料         | パス                                                | 内容                    |
| ---------------- | --------------------------------------------------- | ----------------------- |
| Phase 1 要件     | `phase-1-requirements.md`                           | 受け入れ基準 AC-1〜AC-4 |
| Phase 2 設計書   | `phase-2-design.md`                                 | 変更内容の詳細設計      |
| P44/P45 修正手順 | `references/lessons-learned-ipc-preload-runtime.md` | IPC型不整合の教訓       |

## 成果物

| 成果物       | パス                               | 説明     |
| ------------ | ---------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/gate-decision.md` | 判定結果 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

## 完了条件

- [ ] 全レビュー観点で確認が完了している
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

- [ ] タスク1: plan/improve/execute の型統一性レビュー完了
- [ ] タスク2: 型ナロイングパターンの一貫性確認完了
- [ ] タスク3: simpler alternative の検討完了
- [ ] レビュー結果判定（PASS/MINOR/MAJOR/CRITICAL）を記録した
- [ ] 成果物を所定パスに出力した

## 次Phase

Phase 4: テスト作成
