# UT-RT-02-I18N-ERROR-MESSAGE-001

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| ステータス | 未着手                                        |
| 優先度     | Low                                           |
| 起票日     | 2026-03-29                                    |
| 起票元     | TASK-RT-02 Phase 12                           |
| 関連タスク | TASK-RT-02 (stub-response-error-notification) |

## 1. なぜこのタスクが必要か（Why）

`RuntimeSkillCreatorFacade.ts` の `DEGRADED_REASON_MESSAGES` は日本語文字列がハードコードで定義されており、多言語展開時の差し替えポイントが分離されていない。reason code（`llm_adapter_unavailable` / `resource_loader_unavailable`）と表示文言が同一箇所に混在しているため、将来の i18n 基盤移行時に変更コストが高くなる。

## 2. 何を達成するか（What）

reason code メッセージを i18n 対応し、日本語ハードコードを Runtime facade から除去する。

## 3. どのように実行するか（How）

1. reason code（`RuntimeSkillCreatorDegradedReason`）と表示文言を i18n キーで分離する
2. renderer 側のエラー表示を i18n 解決経由に統一する
3. 既存テストに i18n キー解決後の表示確認を追加する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                       | 原因                                                                         | 解決策                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| runtime と renderer の責務境界 | reason code 生成（runtime）と文言表示（renderer）が同一ファイルに混在        | `DEGRADED_REASON_MESSAGES` を renderer 側 i18n レイヤーへ移動し、runtime は reason code のみを返す設計に変更 |
| 既存テストの期待値更新         | plan/improve の logical error テストが日本語文言で assertions している可能性 | reason code ベースのテストに書き換え、文言テストは i18n mock を使用                                          |

## 4. 実行手順

1. `DEGRADED_REASON_MESSAGES` の現在の参照箇所を棚卸しする
2. i18n キー定義と fallback 方針（英語 fallback）を決める
3. runtime は reason code のみを返すよう修正する
4. renderer 側で i18n 解決を行うよう修正する
5. 単体テストと契約テストを更新する

## 5. 完了条件チェックリスト

- [ ] `DEGRADED_REASON_MESSAGES` が Runtime facade から除去される
- [ ] reason code のみが runtime から返される
- [ ] renderer 側で i18n 経由の表示文言解決が行われる
- [ ] plan/improve logical error の回帰テストが green

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
`UT-RT-02-01-reason-code-i18n-standardization.md` と同一トピックのため、着手時は統合して実施すること。
