# UT-RT-02-01-reason-code-i18n-standardization

## メタ情報

| 項目       | 値                  |
| ---------- | ------------------- |
| ステータス | 未着手              |
| 優先度     | Low                 |
| 起票日     | 2026-03-29          |
| 起票元     | TASK-RT-02 Phase 12 |
| 関連タスク | TASK-RT-02          |
| Issue番号  | #1711               |

## 1. なぜこのタスクが必要か（Why）

`DEGRADED_REASON_MESSAGES` の文言が日本語ハードコードのため、将来 i18n 基盤へ移行する際に runtime と renderer の責務分離が崩れる可能性がある。
`RuntimeSkillCreatorDegradedReason` 型の reason code が文言と同一ファイルに混在しており、「reason code の生成」と「表示文言の解決」という別責務が結合している。

## 2. 何を達成するか（What）

reason code 文言を i18n キー経由で解決できる状態にし、表示文言の多言語切替を可能にする。

## 3. どのように実行するか（How）

- `RuntimeSkillCreatorDegradedReason` をキーにした message resolver を導入
- renderer 側で表示文言を i18n レイヤーへ移譲
- 既存テストを更新し、reason code と表示文言の責務境界を固定

## 3.5 苦戦箇所と解決策

| 苦戦箇所                        | 原因                                                                                                                             | 解決策                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| runtime/renderer 責務境界の整理 | `DEGRADED_REASON_MESSAGES` が `RuntimeSkillCreatorFacade.ts`（Main Process）に定義されているが、表示文言は本来 renderer 側の責務 | Main Process は reason code のみを返す設計に変更し、renderer 側で文言解決を行う |
| テスト期待値の二重管理          | 契約テスト・unit テスト・UI テストそれぞれが日本語文言を期待値として持つ可能性                                                   | reason code を primary assertion に変更し、文言は i18n mock 経由で検証          |
| i18n キー命名の競合リスク       | 既存の i18n キー体系が未整備の場合、新規キー追加で衝突が起きる                                                                   | キー命名規則（`skill-creator.degraded.*`）を事前に確定してから着手              |

## 4. 実行手順

1. 現状の reason code 生成箇所を棚卸しする
2. i18n キー定義と fallback 方針を決める
3. runtime/renderer の責務境界を反映して実装
4. 単体テストと契約テストを更新する

## 5. 完了条件チェックリスト

- [ ] reason code は固定コードのみを返す
- [ ] 文言解決は i18n 経由で実施
- [ ] 既存挙動（エラー検出・execute 抑止）を回帰させない
- [ ] テストが green

## 6. 検証方法

```bash
pnpm --filter @repo/shared test:run -- src/types/__tests__/skillCreator.contract-parity.test.ts
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 7. リスクと対策

- リスク: 文言責務を移す過程で error 表示が欠落する
- 対策: reason code 固定テスト + UI 表示テストを同時更新する

## 8. 参照情報

- `docs/30-workflows/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-12/unassigned-task-detection.md`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

## 9. 備考

本タスクは改善系（Low）として backlog 管理し、i18n 基盤の整備波で着手する。
`UT-RT-02-I18N-ERROR-MESSAGE-001.md` と同一トピックのため、着手時は統合して実施すること。
