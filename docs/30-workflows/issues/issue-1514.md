# [#1514] "[UT-SC-01-DIP-INTERFACE] registerSkillCreatorHandlers DIP準拠化"

## メタ情報

```yaml
task_id: UT-SC-01-DIP-INTERFACE
task_name: registerSkillCreatorHandlers DIP準拠化
category: リファクタリング
target_feature: -
priority: 中
scale: 小規模
status: 未着手
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-SC-01-DIP-INTERFACE.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 概要

`registerSkillCreatorHandlers()` と `registerRuntimeSkillCreatorHandlers()` の引数型が具象クラス (`SkillCreatorService` / `RuntimeSkillCreatorFacade`) に依存している (P61 DIP違反)。インターフェースに変更すべき。

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `ISkillCreatorService` / `IRuntimeSkillCreatorFacade` インターフェースを定義
2. ハンドラ登録関数の引数型をインターフェースに変更
3. 既存テストが全 PASS することを確認

## 参照

- P61: `.claude/rules/06-known-pitfalls.md#P61`
