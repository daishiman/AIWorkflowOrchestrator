# Phase 2: 設計

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 2                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

SkillLifecyclePanel に追加する最小 UI、再利用する preload 契約、状態遷移、SubAgent lane を設計する。

## 実行タスク

- AuthKey 導線 UI の topology を設計する
- `authKey` / `apiKey` 契約の使い分けを設計する
- 状態マトリクスと validation path を設計する
- 並列実行可能な lane を定義する

## 参照資料

| 資料名          | パス                                                                       | 説明              |
| --------------- | -------------------------------------------------------------------------- | ----------------- |
| Phase 1         | `phase-1-requirements.md`                                                  | 要件定義          |
| Skill UI        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`       | 統合先            |
| Settings UI     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | 重複防止参照      |
| preload authKey | `apps/desktop/src/preload/authKeyApi.ts`                                   | 再利用契約        |
| preload bridge  | `apps/desktop/src/preload/index.ts`                                        | window API        |
| UI spec         | `.agents/skills/aiworkflow-requirements/references/ui-ux-settings-core.md` | Settings 設計基準 |

## 実行手順

### ステップ1: UI topology を決める

1. inline 入力方式、status + CTA 方式、Settings 遷移方式を比較する。
2. Anthropic/AuthKey 専用導線として最小構成を選ぶ。
3. `SkillLifecyclePanel` 内の配置位置と close/open 条件を決める。

### ステップ2: 契約境界を決める

1. `window.electronAPI.authKey` を primary contract とする。
2. `window.electronAPI.apiKey` は汎用 provider 管理の参照に限定する。
3. `skill-creator-api.ts` に重複追加しない方針を明文化する。

### ステップ3: lane 設計を行う

1. Lane-A: UI component / state 設計
2. Lane-B: preload / renderer contract 確認
3. Lane-C: テスト / screenshot / close-out 設計

## 統合テスト連携

- Phase 4 に UI lane / contract lane / evidence lane の3系統テストを分配する。
- Phase 11 screenshot plan はこの Phase の状態マトリクスを入力源にする。

## 成果物

| 成果物         | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| 設計書         | `outputs/phase-2/architecture-design.md`     | 全体設計       |
| 状態マトリクス | `outputs/phase-2/authkey-ui-state-matrix.md` | 表示・操作状態 |
| lane 計画      | `outputs/phase-2/subagent-lane-plan.md`      | 並列実行計画   |

## 完了条件

- [ ] UI topology が 1 案に絞られている
- [ ] `authKey` / `apiKey` / `skill-creator-api` の責務境界が明文化されている
- [ ] 状態マトリクスが定義されている
- [ ] lane 切り分けと merge 点が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
