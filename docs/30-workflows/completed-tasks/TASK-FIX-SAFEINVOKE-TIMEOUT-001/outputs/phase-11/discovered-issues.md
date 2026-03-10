# Phase 11 発見事項

## 概要

スクリーンショット再監査で current task scope 外の副次不具合を 2 件検出した。

## 発見事項

| ID       | 種別          | 内容                                                              | 対応                                                                  |
| -------- | ------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| UI-11-01 | UI            | Settings shell のライトテーマで文字色と背景色のコントラストが弱い | 未タスク `task-fix-settings-light-theme-contrast-001.md`              |
| UI-11-02 | React warning | `AccountSection` が list child key warning を出す                 | 未タスク `task-fix-accountsection-linked-provider-key-warning-001.md` |
