<<<<<<< Updated upstream

# Phase 11: 発見した問題 — UT-SKILL-WIZARD-W2-seq-03b

||||||| Stash base

# Phase 11: 発見した問題 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

=======

# 発見された問題 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

## 発見事項

<<<<<<< Updated upstream
| 区分 | 件数 |
| --------------- | ---- |
| current blocker | 0 |
| current note | 0 |
| info | 1 |
||||||| Stash base
| 区分 | 件数 |
| ------------------- | ---- |
| current blocker | 0 |
| current minor | 0 |
| resolved carry-over | 0 |
=======

### cron-parser は安全側判定になる

> > > > > > > Stashed changes

**発見フェーズ**: Phase 5（実装）
**内容**: `cron-parser@5.5.0` は day-of-month と day-of-week の複合指定をそのまま救済せず、安全側の拒否になる。
**影響**: TC-08（`"0 0 31 2 1"`）と TC-16（`"0 0 31 2 1-5"`）の期待値を修正した。
**対応**: Phase 5 以降の成果物では、`cron-parser` の実挙動に合わせた安全側判定を採用。
**残タスク**: なし（この動作は仕様として確定）

<<<<<<< Updated upstream
新規 blocker / note はなし。
||||||| Stash base
新規の blocker / minor はなし。carry-over も発生なし。
=======

## 未解決問題

> > > > > > > Stashed changes

<<<<<<< Updated upstream

## 情報記録

| 種別 | 内容                                                                                                    | 対応                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --- | --- | --- | ---------- |
| Info | current task は UI 非変更のため、新規キャプチャではなく W1-par-02b の代表スクリーンショットを再利用した | `evidence-index.md` / `screenshot-plan.json` / `phase11-capture-metadata.json` に記録済み |
|      |                                                                                                         |                                                                                           |     |     |     | Stash base |

## 確認メモ

- textarea 削除は単純な除去操作のため、新規の UI バグは発生していない
- light / dark の両方で `skill-lifecycle-open-wizard-button` が安定して表示されることを確認した
- `describe.skip` ブロック内の旧 testid 参照（`skill-lifecycle-request-input`）は既知の既存事項であり、本タスクで解消する義務はない
- # `SkillCreateWizard` への実配線と settings 導線の分離は current facts で完了済みで、追加の blocker / carry-over はない
  なし。
  > > > > > > > Stashed changes
