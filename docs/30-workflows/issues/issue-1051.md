# [#1051] [UT-IMP-PERSIST-HYDRATE-GUARD-ROLLOUT-001] persist hydrate ガードパターン横展開

## メタ情報

```yaml
issue_number: 1051
title: [UT-IMP-PERSIST-HYDRATE-GUARD-ROLLOUT-001] persist hydrate ガードパターン横展開
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-03-07
updated_date: 2026-03-07
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1051
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 で確立した persist hydrate ガードパターンを全 Store の Set/Map/カスタム型に横展開する。

## 背景

`customStorage` の `expandedFolders` に iterable guard（DD-01/DD-02）を実装したが、同パターンの脆弱性が他の persist 対象に潜在している可能性がある。汎用ガード関数（hydrateSet/hydrateArray/serializeSet）を作成し、将来の Set/Map 追加時にも自動適用される仕組みを構築する。

## 完了条件

- [ ] persist 使用箇所の監査結果一覧が作成されている
- [ ] 汎用ガード関数（hydrateSet / hydrateArray / serializeSet）が実装されている
- [ ] `customStorage` がリファクタリングされて汎用ガード関数を使用
- [ ] 各ガード関数に破損入力5パターン以上のテスト
- [ ] カバレッジ基準達成（Line >= 80%, Branch >= 60%）

## 苦戦箇所

| 課題                                                    | 解決策                                   |
| ------------------------------------------------------- | ---------------------------------------- |
| `new Set(...)` に非配列を渡すと object is not iterable  | `Array.isArray` を前提条件にする         |
| setItem で instanceof Set と Array.isArray の両方が必要 | 入力の型を信頼せず複数型に対応           |
| viewHistory も破損リスクがある                          | ストアの全永続化フィールドに型検証を適用 |

## 仕様書リンク

`docs/30-workflows/unassigned-task/task-imp-persist-hydrate-guard-rollout-001.md`

## 参照

- `apps/desktop/src/renderer/store/index.ts` — customStorage
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — persist復旧契約
- `.claude/rules/06-known-pitfalls.md` — P19, P48
