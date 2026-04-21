# [#2353] feat(skill-creator): TASK-SC-08-FUP-03 SkillCreatorProgress.planId required 化 migration

## メタ情報

```yaml
issue_number: 2353
title: feat(skill-creator): TASK-SC-08-FUP-03 SkillCreatorProgress.planId required 化 migration
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-20
updated_date: 2026-04-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2353
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`SkillCreatorProgress.planId` / `requestId` を optional から required に昇格させ、全送信側で `planId` 必須化する migration タスク。後方互換のため FUP-02 で optional 追加済み。一定期間の観測と呼び出し元網羅整備を経て required 化することで filter ロジック単純化と型安全強化を得る。

## 参照仕様書

- 正本: [docs/30-workflows/unassigned-task/TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED.md](../blob/main/docs/30-workflows/unassigned-task/TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED.md)
- 親 task: #2300 (TASK-SC-08-FUP-02, CLOSED) — optional 実装完了
- 実装ガイド参考: `docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md`

## 前提条件

- FUP-02 (#2300) の実コード導入後、1〜2 リリース程度の観測期間を経ていること
- 全送信経路（Main IPC / Runtime Facade / 他 Service）の `planId` 貫通が定着していること（FUP-02 NV-02 / NV-03 で確認）
- Phase 11 NV-05 の unit test 環境 blocker が解消していること
- FUP-04 (filter-by-id パターン水平展開) の影響範囲が整理されていること

## スコープ

### 含む

- `planId: string` 型の required 化
- 未付与箇所の修正（Main IPC / Runtime Facade の全 emit 経路）
- テスト更新（optional 前提の後方互換テストを required 前提へ）
- 後方互換ロジックの除去
- migration リリースノート

### 含まない

- progress チャンネル多重化設計（別チャンネル案）
- `requestId` required 化（運用パターン確定後の別タスク）

## 苦戦箇所・学習事項 (FUP-02 由来)

- **後方互換 3 条件**（progress.planId 未設定 / options.planId 未指定 / 両方設定の一致判定）のテスト網羅
- **emit 経路二系統**（Runtime Facade と Main IPC）の貫通漏れリスク
- 空文字 `""` と `undefined` の厳密等価エッジケース
- `useEffect` 依存配列に `planId` を入れ忘れると cleanup が動かずリーク

## 起票タイミング

FUP-02 実コード導入後、1〜2 リリース観測期間を挟んでから formalize。
