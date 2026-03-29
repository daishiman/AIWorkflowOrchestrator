# [#1711] [UT-RT-02-I18N] DEGRADED_REASON_MESSAGES の i18n 対応と runtime/renderer 責務分離

## メタ情報

```yaml
issue_number: 1711
task_id: UT-RT-02-I18N
task_name: DEGRADED_REASON_MESSAGES の i18n 対応と runtime/renderer 責務分離
category: 改善
target_feature: RuntimeSkillCreatorFacade / i18n / renderer
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-RT-02 Phase 12
created_date: 2026-03-29
dependencies: []
spec_path:
  - docs/30-workflows/unassigned-task/UT-RT-02-01-reason-code-i18n-standardization.md
  - docs/30-workflows/unassigned-task/UT-RT-02-I18N-ERROR-MESSAGE-001.md
parent_workflow: docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/index.md
note: UT-RT-02-01 と UT-RT-02-I18N-ERROR-MESSAGE-001 は同一トピックのため統合して実施する
```

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-RT-02-I18N                                                     |
| タスク名     | DEGRADED_REASON_MESSAGES の i18n 対応と runtime/renderer 責務分離 |
| 分類         | 改善                                                              |
| 対象機能     | `RuntimeSkillCreatorFacade` / i18n / renderer エラー表示          |
| 優先度       | 低                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | TASK-RT-02 Phase 12                                               |
| 発見日       | 2026-03-29                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`RuntimeSkillCreatorFacade.ts` の `DEGRADED_REASON_MESSAGES` は日本語文字列がハードコードで定義されており、多言語展開時の差し替えポイントが分離されていない。reason code（`llm_adapter_unavailable` / `resource_loader_unavailable`）と表示文言が同一箇所に混在している。

### 1.2 問題点・課題

- runtime（Main Process）と renderer の責務境界が崩れており、表示文言の管理が Main Process 側に漏れている
- 将来の i18n 基盤移行時に変更コストが高くなる
- テストが日本語文言を直接 assert しており、言語変更時に広範な更新が必要

### 1.3 放置した場合の影響

- i18n 対応時に runtime と renderer の両方を同時に修正する必要が生じる
- 文言の変更が単体では済まず、回帰リスクが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

reason code メッセージを i18n 対応し、日本語ハードコードを Runtime facade から除去する。

### 2.2 最終ゴール

- runtime は reason code のみを返す
- renderer 側で i18n キー経由に文言解決を行う

### 2.3 スコープ

#### 含むもの

- `DEGRADED_REASON_MESSAGES` の Runtime facade からの除去
- renderer 側 i18n レイヤーへの移動
- テストを reason code ベースのアサーションに更新

#### 含まないもの

- i18n 基盤の新規導入（既存基盤の活用前提）
- アプリ全体の i18n 対応

### 2.4 成果物

- 修正された `RuntimeSkillCreatorFacade.ts`
- 更新されたテストファイル群

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- i18n 基盤（`next-i18next` 等）が整備済みであること
- または i18n 基盤整備波での着手

### 3.2 依存タスク

- i18n 基盤整備タスク（先行して整備が必要な場合）

### 3.3 推奨アプローチ

1. `DEGRADED_REASON_MESSAGES` の現在の参照箇所を棚卸しする
2. i18n キー定義と fallback 方針（英語 fallback）を決める
3. runtime は reason code のみを返すよう修正する
4. renderer 側で i18n 解決を行うよう修正する
5. テストを更新する

---

## 4. 実行手順

1. `DEGRADED_REASON_MESSAGES` の参照箇所を棚卸しする
2. i18n キー命名規則（`skill-creator.degraded.*`）を確定する
3. runtime/renderer の責務境界を反映して実装する
4. 単体テストと契約テストを更新する

---

## 5. 完了条件チェックリスト

- [ ] `DEGRADED_REASON_MESSAGES` が Runtime facade から除去される
- [ ] reason code のみが runtime から返される
- [ ] renderer 側で i18n 経由の表示文言解決が行われる
- [ ] テストが green

---

## 6. 検証方法

```bash
pnpm --filter @repo/shared test:run -- src/types/__tests__/skillCreator.contract-parity.test.ts
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                 |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 文言責務を移す過程で error 表示が欠落する | 中     | 中       | reason code 固定テスト + UI 表示テストを同時更新する |
| i18n キー命名の競合                       | 低     | 低       | キー命名規則を事前に確定してから着手する             |

---

## 8. 参照情報

- spec 1: `docs/30-workflows/unassigned-task/UT-RT-02-01-reason-code-i18n-standardization.md`
- spec 2: `docs/30-workflows/unassigned-task/UT-RT-02-I18N-ERROR-MESSAGE-001.md`
- detection: `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-12/unassigned-task-detection.md`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

---

## 9. 備考

`UT-RT-02-01-reason-code-i18n-standardization.md` と `UT-RT-02-I18N-ERROR-MESSAGE-001.md` は同一トピックのため、着手時は統合して実施すること。本タスクは Low 優先度の改善系として backlog 管理し、i18n 基盤の整備波で着手する。
