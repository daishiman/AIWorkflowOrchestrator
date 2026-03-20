# [#1316] [TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001] SkillCenterView ヘッダー CTA レスポンシブ対応

## メタ情報

```yaml
issue_number: 1316
title: [TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001] SkillCenterView ヘッダー CTA レスポンシブ対応
state: CLOSED
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1316
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

SkillCenterView ヘッダーの「+ 新規作成」CTA ボタンのテキスト表示を、設計仕様に準拠したレスポンシブ対応にする。

- **タスクID**: TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001
- **分類**: UI改善
- **優先度**: LOW
- **見積もり規模**: XS（1行変更）

## 背景

TASK-SKILL-LIFECYCLE-02（SkillCenter 新規作成ルート）の実装において、SkillCenterView のヘッダー領域に「+ 新規作成」CTA ボタンを追加した。Phase 10（最終レビュー）の AC-7（モバイル対応 768px 未満）検証で、ヘッダー CTA のテキスト「新規作成」にレスポンシブ対応クラス `hidden md:inline` が未適用であることが MINOR-01 として検出された。

設計仕様（`ui-ux-navigation.md` v1.7.7）では、768px 未満の画面幅ではテキストを非表示にしアイコンのみ表示する方針が定められている。現在の実装（`index.tsx` L394）では `<span>新規作成</span>` がそのまま記述されており、画面幅に関わらずテキストが常時表示される状態になっている。

## スコープ

| 対象       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| スコープ内 | `index.tsx` のヘッダー CTA テキスト span 要素へのクラス追加 |
| スコープ外 | JourneyPanel 内 CTA のレスポンシブ対応（既に対応済み）      |
| スコープ外 | CTA ボタンのスタイル・色・サイズ変更                        |

## 実装方針

`apps/desktop/src/renderer/views/SkillCenterView/index.tsx` L394 の `<span>新規作成</span>` に `className="hidden md:inline"` を追加する1行変更で完結する。

```tsx
// Before（現在の実装）
<span>新規作成</span>

// After（修正後）
<span className="hidden md:inline">新規作成</span>
```

## 受入基準

- [ ] 768px 未満の画面幅でヘッダー CTA のテキスト「新規作成」が非表示になること
- [ ] 768px 以上の画面幅でヘッダー CTA のテキスト「新規作成」が表示されること
- [ ] `+` アイコンは画面幅に関わらず常時表示されること
- [ ] 既存テスト（`SkillCenterView.cta.test.tsx` 26テスト）が全て PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること

## 参照

- タスク仕様書: `docs/30-workflows/completed-tasks/skill-lifecycle-routing/unassigned-task/task-imp-skillcenter-header-cta-responsive-001.md`
- 発見元: TASK-SKILL-LIFECYCLE-02 Phase 10 MINOR-01
- 設計仕様: `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`（v1.7.7）
