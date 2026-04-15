# Phase 12: System Spec Update Summary

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 12                                     |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## Step 1-A: 完了タスク記録

### task-workflow-backlog.md 更新

- `UT-HEALTH-POLICY-RUNTIME-INJECTION-001` を backlog から completed へ移管
- 完了日: 2026-04-14

### task-workflow-completed.md 追加記録

```
| UT-HEALTH-POLICY-RUNTIME-INJECTION-001 | healthPolicy DI 注入 | completed | 2026-04-14 |
```

### arch-execution-capability-contract.md 更新

`RuntimePolicyResolver` の `healthPolicy` 関連行を `completed` に更新:

| コンポーネント                          | 変更内容                                                            | 状態      |
| --------------------------------------- | ------------------------------------------------------------------- | --------- |
| `RuntimeSkillCreatorFacadeDeps`         | `healthPolicy?: HealthPolicy` 追加                                  | completed |
| `RuntimeSkillCreatorFacade` constructor | `deps.healthPolicy` DI 完了                                         | completed |
| `index.ts` DI 組み立て                  | `resolveHealthPolicy()` 生成、共通 policy 注入（Resolver / Facade） | completed |

---

## Step 1-B: 実装状況テーブル更新

| 実装項目                                      | ファイル                           | 状態    |
| --------------------------------------------- | ---------------------------------- | ------- |
| `RuntimeSkillCreatorFacadeDeps.healthPolicy?` | `RuntimeSkillCreatorFacade.ts:133` | ✅ 完了 |
| constructor DI 追加                           | `RuntimeSkillCreatorFacade.ts:259` | ✅ 完了 |
| `index.ts` healthPolicy 共通注入              | `index.ts:1055`                    | ✅ 完了 |

---

## Step 1-C: 関連タスクテーブル更新

| タスク ID                               | 状態       | 備考                                           |
| --------------------------------------- | ---------- | ---------------------------------------------- |
| TASK-IMP-HEALTH-POLICY-UNIFICATION-001  | completed  | 前提タスク（`resolveHealthPolicy()` 実装済み） |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 | unassigned | Renderer 側移行タスク（本タスクと独立）        |

---

## Step 1-D: topic-map 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

`topic-map.md` / `keywords.json` の更新対象:

- `healthPolicy` キーワード: `RuntimeSkillCreatorFacadeDeps` → `completed` に更新
- `DI injection` タグ: `UT-HEALTH-POLICY-RUNTIME-INJECTION-001` に `completed` 追加

---

## Step 2: システム仕様更新判断

**新規インターフェース**: `RuntimeSkillCreatorFacadeDeps.healthPolicy?` → shared に記録すべき

**更新対象**:

- `arch-execution-capability-contract.md` の runtime bridge 記述に healthPolicy DI 完了を追記
- その他の仕様書: 内部リファクタリングのみのため更新不要

**更新不要の理由**:

- IPC チャンネル変更なし
- Preload API 変更なし
- Renderer 側 API 変更なし
- 公開インターフェース変更なし（Deps は internal）
