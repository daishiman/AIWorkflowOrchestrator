# Phase 8: リファクタリング記録

| 対象                | Before                 | After                                             | 理由                         |
| ------------------- | ---------------------- | ------------------------------------------------- | ---------------------------- |
| validation 手順     | Phase 2 / 4 / 7 に重複 | `phase-2/validation-matrix.md` を正規手順に一本化 | 読み筋を単純化する           |
| grep 範囲           | root 全体想定          | 対象ファイル限定                                  | `automation-30` 誤検知を防ぐ |
| dependency ID       | 古い follow-up 名      | `UNASSIGNED-EVALS-VALIDATOR-GUARD-001`            | 実在タスクへ整合             |
| implementation_mode | `bugfix`               | `new`                                             | template 準拠へ是正          |
