# [#1845] feat(governance): UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001 — GovernanceSummaryPanel 手動スクリーンショット収集

## メタ情報

```yaml
issue_number: 1845
title: feat(governance): UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001 — GovernanceSummaryPanel 手動スクリーンショット収集
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-01
updated_date: 2026-04-01
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1845
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` で実装した `GovernanceSummaryPanel` は、IPC ポーリングで `SkillCreatorGovernanceState` を取得し、denial reason / recent denials / session summary を renderer に表示する UI コンポーネントである。

worktree 環境では Electron 実行環境がないため、Phase 11（手動テスト）でスクリーンショット収集を N/A として閉じた。実際のビジュアル証跡（governance 状態の UI 表示確認）が未完のため、手動 QA 環境での再取得が必要。

## 背景・苦戦箇所

- worktree 環境では Electron ビルド・起動ができないため、UI コンポーネントを実装しても視覚的証跡が取れない
- `validate-phase-output.js` は PNG 証跡 0 件の状態では失敗する
- Phase 11 を N/A で閉じる際の根拠記録の粒度が揺れやすい（将来の同様タスクへの教訓）

## スコープ

### 含むもの

- 手動 QA 環境での Electron アプリ起動（`pnpm --filter @repo/desktop dev`）
- `GovernanceSummaryPanel` の 4 状態のスクリーンショット収集
  - TC-01: loading 状態（IPC 接続前）
  - TC-02: error 状態（preload API 未接続）
  - TC-03: no-denials 状態（denial 0 件）
  - TC-04: with-denials 状態（denial 1 件以上）
- `outputs/phase-11/screenshots/` への PNG ファイル配置（4 件）
- `manual-test-result.md` の実測値更新
- `artifacts.json` の Phase 11 ステータス更新

### 含まないもの

- コンポーネント実装の変更（`GovernanceSummaryPanel.tsx` は変更なし）
- ユニットテストの追加・変更
- IPC ハンドラーの変更

## 完了条件

- [ ] `TC-01-governance-loading.png` が存在する
- [ ] `TC-02-governance-error.png` が存在する
- [ ] `TC-03-governance-no-denials.png` が存在する
- [ ] `TC-04-governance-with-denials.png` が存在する
- [ ] `manual-test-result.md` に各 TC の結果が記録されている
- [ ] `artifacts.json` の Phase 11 が `completed` になっている
- [ ] バリデーションスクリプトが PASS している

## 仕様書

`docs/30-workflows/unassigned-task/UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001.md`

## 関連タスク

- 親タスク: `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001`
- 参考フォーマット: `docs/30-workflows/unassigned-task/UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md` (Issue #1785)
