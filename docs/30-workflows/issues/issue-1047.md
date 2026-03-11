# [#1047] [UT-IMP-VIEWHISTORY-CORRUPT-GUARD-REGRESSION-001] viewHistory 破損入力回帰テスト強化

## メタ情報

```yaml
issue_number: 1047
title: [UT-IMP-VIEWHISTORY-CORRUPT-GUARD-REGRESSION-001] viewHistory 破損入力回帰テスト強化
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-07
updated_date: 2026-03-07
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1047
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`useCanGoBack` セレクタに追加した `Array.isArray(state.viewHistory)` ガード（DD-03）の有効性を検証する回帰テストを追加する。

## 背景

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 で DD-03 ガードを追加したが、`navigationSlice.test.ts` に破損入力（null / undefined / number / string / object）の異常系テストが存在しない。

## 完了条件

- [ ] `viewHistory` の破損入力5パターンのテストが追加
- [ ] 各パターンで `useCanGoBack` が `false` を返すことを検証
- [ ] 全テスト PASS
- [ ] 既存テストが破壊されていない

## 苦戦箇所

| 課題                                                   | 解決策                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| useCanGoBack は Store セレクタなので単体テストが難しい | renderHook パターンまたは useAppStore.setState で破損値注入                  |
| happy-dom での userEvent 非互換（P39）                 | fireEvent を使用（Store セレクタテストなのでイベント発火は不要な場合が多い） |

## 仕様書リンク

`docs/30-workflows/unassigned-task/task-imp-viewhistory-corrupt-guard-regression-001.md`

## 参照

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts`
- `apps/desktop/src/renderer/store/index.ts` — useCanGoBack
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — DD-03
- `.claude/rules/06-known-pitfalls.md` — P31, P39, P40
