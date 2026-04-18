# Phase 12: スキルフィードバックレポート

> 作成日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## task-specification-creator への提案

### FB-TSC-001: verification task の Phase 5 モード明示

**現状**: Phase 5 の仕様書で「差分確認・最小修正」と書かれているが、
「current branch が既に仕様充足の場合は no-op」という判定フローが Phase 1 に依存していることが不明瞭。

**提案**: Phase 5 の冒頭に「Phase 1 結論が E-1（実装充足済み）の場合、Step 1 の差分確認のみで完了」という
明示的な分岐説明を追加する。

**重要度**: LOW

---

### FB-TSC-002: NON_VISUAL タスクの outputs parity drift 検知強化

**現状**: Phase 12 Step 6（準拠チェック）で parity を確認する設計はあるが、
実ファイルが存在していても root / outputs の status 差分を見落とすケースがありうる。

**提案**: 「存在する場合のみ確認」に加えて、存在時は root / outputs の `status` と各 phase status を機械的に比較する validator 実行を標準化する。

**重要度**: LOW

---

## aiworkflow-requirements への提案

### FB-AWR-001: verification task の completed ledger 区別記述

**現状**: `task-workflow-completed.md` に verification task と実装 task の区別が記述ルール上明文化されていない。

**提案**: completed ledger の記録テンプレートに `種別: verification / implementation / docs-only` フィールドを追加する。

**重要度**: LOW

---

### FB-AWR-002: completed index / recent bundle / stale task の same-wave 同期

**現状**: detailed completed record だけ更新され、`task-workflow-completed.md` 冒頭 index・recent bundle・未タスク導線の同期が抜けると、
実装完了済みでも stale `open` が残りやすい。

**提案**: same-wave チェックリストに「completed index」「recent bundle」「stale unassigned-task / 親子タスク状態」の3点を追加する。

**重要度**: LOW

---

## 改善なし項目

- Phase 12 の6成果物定義は明確で実行しやすかった
- NON_VISUAL タスクの close-out フローは `manual-test-result.md` を正本とする方針が機能した
- Phase 13 blocked 運用は commit / PR 禁止ポリシーと矛盾なく運用できた
