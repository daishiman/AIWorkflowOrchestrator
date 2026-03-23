# Phase 2: 検証マトリクス

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23

## 1. Phase 3 設計レビュー観点

| ID   | 観点                                      | 検証方法                                           | PASS 基準                                                | drift リスク                    |
| ---- | ----------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | ------------------------------- |
| V-01 | Concern 1-3 が AC-1〜AC-4 を網羅          | AC ↔ Concern マッピング表                          | 全 AC に対応する Concern がある                          | 低                              |
| V-02 | no-op 排除パターンが Store/IPC 契約と整合 | 既存 Store action / IPC channel の存在確認         | 全 handler に対応する Store action or IPC channel がある | 中（Store action 未実装の場合） |
| V-03 | simpler alternative の棄却理由が妥当      | AC 充足確認                                        | 棄却した代替案が AC のいずれかを満たさない               | 低                              |
| V-04 | lane 数が 3 以下                          | lane 一覧表                                        | lane 数 <= 3                                             | 低                              |
| V-05 | mainline 侵食がない                       | ChatPanel が primary lane CTA を奪わないことの確認 | ChatPanel の primary lane フラグが false                 | 中                              |

## 2. Phase 4 テスト設計観点

| TC-ID | テスト種別  | 対象            | 検証内容                                                       |
| ----- | ----------- | --------------- | -------------------------------------------------------------- |
| TC-01 | contract    | State Contract  | 8 状態ユニオンの各状態で正しい UI コンポーネントが表示される   |
| TC-02 | contract    | Action Contract | 全アクションが no-op でないこと（`() => {}` が 0 件）          |
| TC-03 | contract    | Ownership       | ChatPanel.tsx のみが変更対象で、子コンポーネント内部は変更不可 |
| TC-04 | integration | State → CTA     | blocked 状態で設定遷移 CTA が actionable                       |
| TC-05 | integration | State → CTA     | handoff 状態で terminal 起動 CTA が actionable                 |
| TC-06 | integration | Streaming flow  | idle → streaming → completed の遷移が正常                      |
| TC-07 | regression  | No-op 検出      | `grep -rn "() => {}" ChatPanel.tsx` が 0 件                    |
| TC-08 | regression  | P31 対策        | 個別セレクタが使用されていること                               |
| TC-09 | regression  | P62 対策        | DEFAULT_CONFIG fallback がないこと                             |

## 3. Phase 11 手動テスト観点

| MT-ID | walkthrough シナリオ                   | capture 対象                         | 期待状態                        |
| ----- | -------------------------------------- | ------------------------------------ | ------------------------------- |
| MT-01 | ChatPanel を review-empty 状態で表示   | UX-06 screenshot                     | review-only role が視認可能     |
| MT-02 | blocked 状態で設定遷移 CTA をクリック  | settings 画面遷移                    | 設定画面に遷移する              |
| MT-03 | handoff 状態で terminal CTA をクリック | terminal 起動                        | terminal が起動する             |
| MT-04 | streaming 中に Escape でキャンセル     | cancelled 状態                       | ストリーミングが停止する        |
| MT-05 | RuntimeBanner の capability 表示確認   | Integrated / Handoff / Guidance-only | resolvedCapability に応じた表示 |

## 4. Phase 12 ドキュメント観点

| DOC-ID | 対象                           | 内容                                                     |
| ------ | ------------------------------ | -------------------------------------------------------- |
| DOC-01 | implementation-guide.md Part 1 | 「レストランの注文票」アナロジーで review harness を説明 |
| DOC-02 | implementation-guide.md Part 2 | no-op 排除の具体的コード変更手順                         |
| DOC-03 | system-spec-update-summary.md  | ui-ux-panels.md への review harness role セクション追加  |
| DOC-04 | unassigned-task-detection.md   | MINOR 未タスクの formalize 対象                          |

## 5. AC ↔ Concern ↔ 検証マトリクス

| AC-ID | AC 内容                             | 対応 Concern | 検証 Phase                                                       | 検証 ID            |
| ----- | ----------------------------------- | ------------ | ---------------------------------------------------------------- | ------------------ |
| AC-1  | role が review harness として明文化 | Concern 1    | Phase 3: V-01, Phase 4: TC-03, Phase 11: MT-01                   | V-01, TC-03, MT-01 |
| AC-2  | no-op を許さない contract が定義    | Concern 2    | Phase 3: V-02, Phase 4: TC-02/TC-07, Phase 11: MT-02/MT-03       | V-02, TC-02, TC-07 |
| AC-3  | mainline と harness の差分が表形式  | Concern 3    | Phase 3: V-01, Phase 4: TC-01                                    | V-01, TC-01        |
| AC-4  | panel 統合パターンと UX が整合      | Concern 1+3  | Phase 3: V-05, Phase 4: TC-04/TC-05/TC-06, Phase 11: MT-04/MT-05 | V-05, TC-04-06     |
