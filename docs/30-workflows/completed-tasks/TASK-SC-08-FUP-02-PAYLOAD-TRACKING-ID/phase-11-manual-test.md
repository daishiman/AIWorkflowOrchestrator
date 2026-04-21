# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 11                                                     |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| タスク種別 | NON_VISUAL code task                                   |
| 前Phase    | [phase-10-final-review.md](phase-10-final-review.md)   |
| 次Phase    | [phase-12-documentation.md](phase-12-documentation.md) |

## 目的

UI 変更を伴わない code task として、`SkillCreatorProgress` への `planId` / `requestId` 付与と `useStreamingProgress` の planId フィルタリング挙動を代替証跡（grep / dev server smoke / main プロセスログ観察）で確認する。

## 判定

| 区分                   | 判定   | 理由                                                                           |
| ---------------------- | ------ | ------------------------------------------------------------------------------ |
| docs-only/spec_created | いいえ | 型・Main 送信関数・Runtime Facade・Renderer Hook の 4 ファイルで behavior 変更 |
| UI task                | いいえ | 画面レイアウト / 配色 / インタラクションの視覚差分なし                         |
| NON_VISUAL code task   | はい   | IPC payload 拡張と Hook フィルタ追加のみ。UI スクリーンショット不要            |

## 正本ポリシー

- 一次ソースは `outputs/phase-11/manual-test-result.md`
- 補助成果物として `manual-test-checklist.md` と `discovered-issues.md` を持つ
- UI スクリーンショットは不要（`NON_VISUAL code task`）

## 代替証跡（NON_VISUAL 用）

| 証跡 ID | 観点                              | 実行コマンド / 確認方法                                                                                                                     |
| ------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| NV-01   | 型利用箇所の一貫性                | `grep -rn "SkillCreatorProgress" apps/desktop/src/` で型参照全箇所が新フィールドに適合しているかを確認する                                  |
| NV-02   | Main 側送信呼び出しの planId 付与 | `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/` で全呼び出し元が planId を渡しているかを確認する                               |
| NV-03   | Runtime 経路 emit 漏れ検出        | `grep -REn 'onProgress                                                                                                                      | emitProgress | webContents\\.send' apps/desktop/src/main/services/runtime/ apps/desktop/src/main/ipc/` で Facade 以外の emit 経路を洗い出す |
| NV-04   | dev server 起動スモーク           | `pnpm --filter @repo/desktop dev` を起動し、スキル生成を 1 件トリガして main プロセス console に planId が含まれていることを目視確認する    |
| NV-05   | Hook filter 回帰                  | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` で match / miss / legacy / no-options 4 シナリオが PASS することを確認する |

## walkthrough 観点

| 観点                | 内容                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| code/spec 一致      | AC-1 〜 AC-9 の検証方法（型定義 review / vitest / grep）が実装差分に合致しているか                     |
| regression evidence | `useStreamingProgress` 既存テストが全て PASS していることが `manual-test-result.md` に記録されているか |
| artifact parity     | Phase 10 / 11 / 12 の成果物名が `artifacts.json` と一致しているか                                      |

## 発見事項分類欄

| #   | シナリオ                           | 発見事項     | 分類                  | 対応方針     |
| --- | ---------------------------------- | ------------ | --------------------- | ------------ |
| 1   | NV-02 Main 呼び出し grep           | 実施後に記入 | Blocker / Note / Info | 実施後に記入 |
| 2   | NV-03 Runtime 経路 emit 漏れ調査   | 実施後に記入 | Blocker / Note / Info | 実施後に記入 |
| 3   | NV-04 dev server main プロセスログ | 実施後に記入 | Blocker / Note / Info | 実施後に記入 |

## 実行タスク

- NV-01 から NV-05 の代替証跡を実行または blocked 判定する
- 一次ソースと補助成果物へ結果を転記する
- 発見事項を Blocker / Note / Info に分類する

## 成果物

| 成果物                | パス                                        |
| --------------------- | ------------------------------------------- |
| manual test result    | `outputs/phase-11/manual-test-result.md`    |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     |

## 参照資料

- `phase-1-requirements.md` の AC-1 〜 AC-9
- `phase-2-design.md` の検証導線 5 ステップ
- `.claude/skills/task-specification-creator/references/phase-11-guide.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md`

## 統合テスト連携

- NV-05 では `useStreamingProgress` の targeted test を実行し、Phase 9 の品質ゲート結果と整合しているか確認する
- dev server smoke と grep 結果を組み合わせ、Phase 12 の documentation close-out へ証跡を引き渡す

## 完了条件

- [ ] `manual-test-result.md` を一次ソースとして定義している
- [ ] `manual-test-checklist.md` と `discovered-issues.md` が定義されている
- [ ] NON_VISUAL 代替証跡方針（NV-01 〜 NV-05）が明記されている
- [ ] UI スクリーンショット不要の理由（UI 差分なし）が明記されている
- [ ] dev server main プロセスログ観察による planId 貫通の確認が含まれている
- [ ] Runtime ルート emit 漏れ調査（NV-03）が含まれている
