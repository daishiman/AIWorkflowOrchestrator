# [#2049] refactor(skill-wizard): handleRetry テスト名・仕様書表現統一 [UT-W2-03A-RETRY-NAMING-UNIFICATION-001]

## メタ情報

```yaml
issue_number: 2049
title: refactor(skill-wizard): handleRetry テスト名・仕様書表現統一 [UT-W2-03A-RETRY-NAMING-UNIFICATION-001]
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2049
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

W2-seq-03a で実装された `handleRetry()` に関するテスト名・仕様書見出しの表現ゆれを統一する。

## 背景

「復帰」「やり直し」「リトライ」の3種類の日本語表現が混在しており、同じ機能を指しているかの判断に時間がかかる。

## 変更内容

- `SkillCreateWizard.test.tsx` の `handleRetry` 関連テスト名を統一
- `SkillCreateWizard.W2-seq-03a.test.tsx` の `handleRetry` 関連テスト名を統一
- 仕様書見出しの表現を「リトライ（Step 0 復帰）」に統一

## 完了条件

- [ ] `handleRetry` 関連の describe/it 名称が統一されている
- [ ] 「復帰」「やり直し」「リトライ」の混在がなくなっている
- [ ] 既存テストが全て PASS

## 発見元

W2-seq-03a Phase 12 スキルフィードバックレポート（2026-04-08）

## 仕様書

`docs/30-workflows/unassigned-task/UT-W2-03A-RETRY-NAMING-UNIFICATION-001.md`
