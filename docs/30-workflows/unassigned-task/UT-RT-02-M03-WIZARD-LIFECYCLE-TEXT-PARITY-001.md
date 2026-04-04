# UT-RT-02-M03-WIZARD-LIFECYCLE-TEXT-PARITY-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ステータス | 未着手                                          |
| 優先度     | Medium                                          |
| 起票日     | 2026-04-04                                      |
| 起票元     | TASK-RT-02 Phase 11 (手動テスト未検証項目 M-03) |
| 関連タスク | TASK-RT-02 (stub-response-error-notification)   |
| Issue番号  | #1901                                           |

## 1. なぜこのタスクが必要か（Why）

TASK-RT-02 では `SkillCreateWizard.tsx` と `SkillLifecyclePanel.tsx` の両コンポーネントに
plan logical error の表示を追加した。両者は異なるエントリポイントから同じ degraded エラーを
受け取るが、表示文言・エラーメッセージのフォーマット・コンポーネント構造が統一されているか
Phase 11 の手動テストで検証が未実施のままである。

文言差異が存在する場合、ユーザーは同一エラーに対して異なる表現を目にし、一貫性のない
UX となる。また、将来の i18n 対応（UT-RT-02-I18N-ERROR-MESSAGE-001）の前提として、
エラー表示の責務箇所が統一されていることが必要。

## 2. 何を達成するか（What）

`SkillCreateWizard.tsx` と `SkillLifecyclePanel.tsx` の plan error 表示について、
以下の一貫性を確認・修正する。

- 表示文言（日本語メッセージ）が同一またはコンテキストに適した差異に収まっていること
- エラー表示コンポーネント（`Alert` / `ErrorBanner` / inline text など）が統一されていること
- `success: false` の error.message をそのまま表示しているか、ラップしているかが一致していること

スコープ内:

- `SkillCreateWizard.tsx` の `handleLlmGenerate` 内 plan error 表示ロジック
- `SkillLifecyclePanel.tsx` の `handlePrepare` 内 plan error 表示ロジック
- 対応するレンダラーテスト（表示確認ケース）

スコープ外:

- improve / execute のエラー表示（別トピック）
- i18n キー化（UT-RT-02-I18N-ERROR-MESSAGE-001 で対応）

## 3. どのように実行するか（How）

1. 両コンポーネントの plan error 表示コードを並べて差異を抽出する
2. 差異が意図的か非意図的かをコードレビューで判定する
3. 非意図的差異を修正し、コンポーネント間の表示パリティを達成する
4. 修正内容を反映したテストケースを追加または更新する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                | 原因                                                                          | 解決策                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 2コンポーネントが独立して実装されている | SkillCreateWizard（新規作成フロー）と SkillLifecyclePanel（既存スキル管理）は | 共通エラー表示コンポーネントへの抽出、またはエラー形式の共通化 |
|                                         | 設計上別物であり、エラー表示を共有する仕組みがなかった                        |                                                                |
| Phase 11 手動テストでの文言確認が未実施 | TASK-RT-02 の実装フェーズで両コンポーネントへの変更が別 wave で入ったため、   | 本タスクで改めて並べて確認し、差異を文書化する                 |
|                                         | 横断的なパリティ確認が後回しになった                                          |                                                                |

## 4. 実行手順

1. `SkillCreateWizard.tsx` の plan error 表示コードを読む（`handleLlmGenerate` 周辺）
2. `SkillLifecyclePanel.tsx` の plan error 表示コードを読む（`handlePrepare` 周辺）
3. 表示文言・コンポーネント・エラーハンドリング方針の差異を一覧化する
4. 意図的差異と非意図的差異を分類し、非意図的差異を修正する
5. 対応テストに表示文言の確認ケースを追加する

## 5. 完了条件チェックリスト

- [ ] SkillCreateWizard.tsx と SkillLifecyclePanel.tsx の plan error 表示差異を文書化した
- [ ] 非意図的な差異がすべて修正されている
- [ ] 両コンポーネントのテストに plan error 表示確認ケースが存在する
- [ ] `pnpm lint` / `pnpm typecheck` が通る

## 6. 検証方法

```bash
# plan error 表示が両コンポーネントに存在することを確認
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/wizard/__tests__/
```

## 7. リスクと対策

| リスク                           | 影響度 | 対策                                                                   |
| -------------------------------- | ------ | ---------------------------------------------------------------------- |
| 差異が意図的だった場合の無駄修正 | Low    | 変更前にコードオーナーにレビューを依頼し、意図確認をドキュメント化する |
| 修正によって既存テストが失敗する | Medium | テストを先に読んで変更影響を把握してから修正する                       |

## 8. 参照情報

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-5/implementation-record.md`
- 関連: `UT-RT-02-I18N-ERROR-MESSAGE-001.md`

## 9. 備考

本タスクは TASK-RT-02 の Phase 11 手動テスト未検証項目 M-03 を formal な未タスクとして記録したもの。
UI 文言パリティの確認後、i18n 対応（UT-RT-02-I18N-ERROR-MESSAGE-001）と統合して実施することを推奨する。
