# agentview-permission-api-fix - タスク実行仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 機能名     | agentview-permission-api-fix |
| タスクID   | TASK-AGENTVIEW-PERM-FIX      |
| 作成日     | 2026-03-30                   |
| ステータス | 設計中                       |
| 総Phase数  | 13                           |

## 概要

AgentView が存在しない `window.electronAPI.permissions` にアクセスしている不整合を是正し、実在する `window.permissionAPI` と renderer 側の利用形態を一致させる。修正対象は小さいが、Permission API の責務境界と AgentView 側のローカル state 管理を混同しないことを重視する。

## 一次結論

1. 真の論点は「APIパス誤り」だけでなく、「AgentView が preload に存在しない権限モード概念まで仮定している」点にある。
2. 依存関係上の主問題は、renderer の期待契約が preload 正本仕様から乖離していることにある。
3. 価値とコストの均衡上、今回の最適解は API 追加ではなく、既存 `permissionAPI` に合わせた最小修正である。
4. 改善優先順位は、実行時エラー解消、件数表示整合、リセット動作整合、将来タスクの分離、Phase 12 記録整備の順とする。
5. 4条件評価では、矛盾なし・漏れなし・整合性あり・依存関係整合を満たすため、workflow pack 全体の構造同期も本タスクに含める。

## 対象とスコープ

| 区分         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 直接修正     | `apps/desktop/src/renderer/views/AgentView/index.tsx` と関連テスト         |
| 参照正本     | preload 型/公開面、PermissionSettings 既存実装、AgentView 関連 UI/契約仕様 |
| 今回含む     | workflow pack の Phase 1-13 構造整備、Phase 12 close-out 方針整備          |
| 今回含まない | 新規 IPC 追加、権限モード永続化、コミット、PR作成、push                    |

## 背景

```
TypeError: Cannot read properties of undefined (reading 'permissions')
    at getPermissionApi (index.tsx:89:5)
```

原因は、AgentView が `window.electronAPI.permissions` を参照している一方で、preload 正本は `window.permissionAPI` を expose していることにある。さらに `getMode()` / `setMode()` は preload 契約に存在せず、ローカル UI state と外部 API の責務が混線している。

## Phase一覧

| Phase | 名称             | 仕様書                                                       | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓
                    (FAILなら差し戻し)
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13
                         ↓
                    (FAILなら差し戻し)
```

## 主要参照仕様

| 種別           | パス                                                                                      | 用途                                                |
| -------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| preload 公開面 | `apps/desktop/src/preload/index.ts`                                                       | `window.permissionAPI` の正本確認                   |
| preload 型     | `apps/desktop/src/preload/types.ts`                                                       | `PermissionAPI` 契約確認                            |
| 既存参照実装   | `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx`              | `getAllowedTools()` / `clearAll()` 利用パターン確認 |
| UI/契約仕様    | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md` | AgentView / Permission API 関連仕様確認             |
| UI 詳細        | `.agents/skills/aiworkflow-requirements/references/ui-ux-settings-details.md`             | PermissionSettings 系の既存 UX 確認                 |
| セキュリティ   | `.agents/skills/aiworkflow-requirements/references/security-skill-execution.md`           | 許可済みツール管理 API の意味確認                   |

## 完了原則

1. skill準拠を優先し、過剰な API 追加や docs-only close-out の虚偽記録を避ける。
2. `index.md`、`phase-*.md`、`artifacts.json`、`outputs/artifacts.json` を同一波で同期する。
3. Phase 13 はユーザーの明示承認があるまで `blocked` とする。
