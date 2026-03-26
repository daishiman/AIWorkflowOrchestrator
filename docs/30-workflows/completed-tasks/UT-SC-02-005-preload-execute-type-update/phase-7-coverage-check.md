# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 7                                        |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

Phase 4-6 で作成・拡充したテストのカバレッジがプロジェクト基準を達成していることを確認する。不足箇所があれば追加テストを作成する。

## 背景

本タスクは小規模修正（Preload 型修正 + Renderer 型ナロイング追加）であるが、変更対象ファイルのカバレッジがプロジェクト基準を満たしていることを確認する必要がある。特に `terminal_handoff` 分岐のブランチカバレッジが重要である。

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                               |
| ----------------- | -------- | -------- | ---------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `skill-creator-api.ts`, `SkillLifecyclePanel.tsx`          |
| Branch Coverage   | 60%      | 70%      | `SkillLifecyclePanel.tsx`（`terminal_handoff` 分岐を含む） |
| Function Coverage | 80%      | 90%      | `skill-creator-api.ts`, `SkillLifecyclePanel.tsx`          |

## 実行タスク

- タスク1: カバレッジレポートの生成と確認
- タスク2: カバレッジ不足箇所を特定し、不足がある場合は追加テストを作成する

---

### タスク1: カバレッジレポートの生成と確認

**検証コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop exec vitest run --coverage

# 特定ファイルのカバレッジを確認
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=verbose
```

**確認ポイント**:

| 確認項目                                       | 基準    | 結果   |
| ---------------------------------------------- | ------- | ------ |
| `skill-creator-api.ts` の Line Coverage        | 80%以上 | 未実施 |
| `SkillLifecyclePanel.tsx` の Line Coverage     | 80%以上 | 未実施 |
| `SkillLifecyclePanel.tsx` の Branch Coverage   | 60%以上 | 未実施 |
| `skill-creator-api.ts` の Function Coverage    | 80%以上 | 未実施 |
| `SkillLifecyclePanel.tsx` の Function Coverage | 80%以上 | 未実施 |

---

### タスク2: カバレッジ不足箇所の追加テスト作成

カバレッジが基準を下回る場合、以下の優先順位で追加テストを作成する。

**優先順位**:

1. `terminal_handoff` 分岐のブランチカバレッジ（Branch Coverage）
2. `executePlan` の正常系・異常系のラインカバレッジ（Line Coverage）
3. その他の未カバー関数（Function Coverage）

---

## 参照資料

| 参照資料           | パス                                          | 内容               |
| ------------------ | --------------------------------------------- | ------------------ |
| Phase 2 設計書     | `phase-2-design.md`                           | 影響範囲サマリー   |
| Phase 4 テスト     | `phase-4-test-creation.md`                    | 正常系テストケース |
| Phase 5 Green結果  | `outputs/phase-5/green-state-verification.md` | 実装後の回帰結果   |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                   | 異常系テストケース |
| index              | `index.md`                                    | カバレッジ目標定義 |

## 統合テスト連携【必須】

カバレッジ確認の統合観点:

| 統合ポイント               | カバレッジ確認内容                                             | ステータス |
| -------------------------- | -------------------------------------------------------------- | ---------- |
| Preload → Main IPC 通信    | `executePlan` の IPC 呼び出しパスがカバーされている            | 未実施     |
| Renderer → Preload API呼出 | `handleExecutePlan` の全分岐がカバーされている                 | 未実施     |
| terminal_handoff 分岐      | `"type" in result.data` の true/false 両パスがカバーされている | 未実施     |

## 成果物

| 成果物               | パス                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` | カバレッジ数値と達成状況 |
| 追加テスト（必要時） | `apps/desktop/src/**/*.test.ts`      | カバレッジ補完テスト     |

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

- [ ] カバレッジレポートが生成されている
- [ ] Line Coverage が 80%以上であることが確認されている
- [ ] Branch Coverage が 60%以上であることが確認されている
- [ ] Function Coverage が 80%以上であることが確認されている
- [ ] カバレッジ不足箇所がある場合、追加テストが作成されている
- [ ] 全テストが PASS している
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

- [ ] タスク1: カバレッジレポート生成・確認完了
- [ ] タスク2: カバレッジ不足箇所の追加テスト作成完了（または不要確認済み）
- [ ] 全カバレッジ基準達成確認完了

## 次Phase

Phase 8: リファクタリング（TDD: Refactor）
