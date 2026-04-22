# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 3                |
| タスクID   | UT-CANCEL-004-01 |
| ステータス | 未実施           |
| 作成日     | 2026-04-22       |
| 入力       | Phase 2 成果物   |

## 目的

Phase 2 の設計が、skill 準拠、4条件、後方互換性、Step 2 判定基準の観点で破綻していないかをレビューし、Phase 4 進行可否を判定する。

## 実行タスク

### タスク 1: 契約レビュー

- `signal` が `createSkill` 第4引数に限定されているか
- `signal` を IPC に渡す記述が残っていないか
- `cancelGeneration()` を Main 側停止経路として扱っているか

### タスク 2: 互換性レビュー

- 既存呼び出し元が `signal` 省略のまま利用できるか
- `window.electronAPI.skill.create()` の public shape を変更しないことが明記されているか

### タスク 3: close-out 影響レビュー

- Step 2 が public IPC 変更ではなく state / data flow 変更として再判定対象であること
- Phase 11 / 12 の NON_VISUAL 成果物が artifacts と同期していること

## レビューゲート判定基準

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ     |
| MAJOR    | 重大な問題あり           | Phase 2 へ差し戻す         |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

## 参照資料

| 参照資料       | パス                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| Phase 2 設計書 | `outputs/phase-2/design-doc.md`                                                         |
| Step 2 基準    | `.claude/skills/task-specification-creator/references/spec-update-step2-domain-sync.md` |
| Phase template | `.claude/skills/task-specification-creator/references/phase-template-core.md`           |

## 実行手順

1. 契約レビューを行う
2. 互換性レビューを行う
3. close-out 影響を確認する
4. gate 判定を `PASS / MINOR / MAJOR` で記録する

## 統合テスト連携

- PASS の場合のみ Phase 4 へ進む
- MAJOR なら Phase 2 へ差し戻す
- Phase 4 のテスト ID は gate 結果に従って固定する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                             |
| ------------ | -------------------------------------------------------- |
| 矛盾なし     | IPC 伝播の誤記述が残っていないか                         |
| 漏れなし     | 互換性、Step 2 判定、NON_VISUAL close-out が見えているか |
| 整合性       | artifacts と Phase 11/12 方針が一致するか                |
| 依存関係整合 | cancel hook / store / IPC の責務境界が崩れていないか     |

## サブタスク管理

| サブタスクID | 内容                   | ステータス |
| ------------ | ---------------------- | ---------- |
| ST-3-01      | 契約レビュー           | 未実施     |
| ST-3-02      | 互換性レビュー         | 未実施     |
| ST-3-03      | close-out 影響レビュー | 未実施     |

## 成果物

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gate-decision.md`

## 完了条件

- [ ] 契約レビューが完了している
- [ ] 互換性レビューが完了している
- [ ] Step 2 / NON_VISUAL 影響が記録されている
- [ ] Gate 判定が明記されている

## タスク 100% 実行確認【必須】

- [ ] 全タスクを実行した
- [ ] Phase 4 進行可否が確定した
- [ ] 差し戻し条件が明記されている

## 次Phase

[phase-4-test-creation.md](phase-4-test-creation.md)
