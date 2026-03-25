# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 10                                             |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

多角的な品質・整合性検証を行い、Phase 11 への進行可否を判定する。

## 実行タスク

- AC充足判定: AC-1〜AC-4の全受入基準の充足を検証
- 横断品質チェック: 型整合性・Record同期・ショートカットマッピング等の横断確認
- 未解決事項確認: 設計サマリーとの整合・MINOR指摘・未タスク検出の確認
- レビュー判定: PASS/MINOR/MAJOR/CRITICALの判定と記録

## 参照資料

| 資料名               | パス                                | 説明             |
| -------------------- | ----------------------------------- | ---------------- |
| Phase 1 受入基準     | `phase-1-requirements.md`           | AC-1〜AC-4の定義 |
| Phase 9 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果     |
| Phase 2 設計         | `phase-2-design.md`                 | 設計サマリー     |

## AC Fulfillment 判定

### AC-1: grep ヒット数

```bash
grep "executionConsole" apps/desktop/src/renderer/navigation/navContract.ts
```

期待: DockViewType union + NAV_SECTIONS + NAV_SHORTCUT_TO_VIEW で 3 件以上ヒット。

### AC-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待: 0 errors。

### AC-3: GlobalNavStrip 表示

navContract.ts の `NAV_SECTIONS` に追加されることで、`GlobalNavStrip/constants.ts` の `GLOBAL_NAV_SECTIONS` に自動的に反映される（`NAV_SECTIONS satisfies readonly NavSectionConfig[]`）。

### AC-4: テスト PASS

全テスト PASS であること。

## 横断品質チェック

| チェック項目                                            | 期待結果                                |
| ------------------------------------------------------- | --------------------------------------- |
| `DockViewType` が `Extract<ViewType, ...>` を維持       | `"executionConsole"` が ViewType に存在 |
| `IconName` と `iconMap` の Record 型が同期              | `"play-circle"` が両方に存在            |
| `NAV_SHORTCUT_TO_VIEW` のキーが全 DockViewType をカバー | `executionConsole` がマッピング済み     |
| `APP_DOCK_NAV_ITEMS` に自動的に含まれる                 | NAV_SECTIONS 展開で含まれる             |

## 未解決事項チェック

| 項目                 | 状態            |
| -------------------- | --------------- |
| 設計サマリーとの整合 | 確認する        |
| Phase 3 MINOR 指摘   | なし            |
| 新規未タスクの検出   | Phase 12 で対応 |

## レビュー判定テンプレート

| 判定       | PASS / MINOR / MAJOR / CRITICAL |
| ---------- | ------------------------------- |
| 判定理由   | （Phase 実行時に記入）          |
| MINOR 指摘 | （Phase 実行時に記入）          |

## 統合テスト連携

| レビュー項目 | 確認内容              |
| ------------ | --------------------- |
| 全テスト結果 | ユニット/統合全て成功 |
| カバレッジ   | 基準達成              |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点           | 適用判断                               | 仕様参照先                                   |
| -------------- | -------------------------------------- | -------------------------------------------- |
| UI/UX          | GlobalNavStripへのnav item追加         | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ | navContract.ts型拡張・DockViewType拡張 | `aiworkflow-requirements: architecture-*.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断             | 仕様参照先                            |
| -------------------------- | -------------------- | ------------------------------------- |
| フロントエンド（Renderer） | Icon/navContract変更 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物       | パス                                      | 説明                 |
| ------------ | ----------------------------------------- | -------------------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 最終レビュー判定結果 |

## 完了条件

- [ ] AC-1〜AC-4 の全判定が PASS
- [ ] 横断品質チェック完了
- [ ] レビュー判定が PASS
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 11: 手動テスト
