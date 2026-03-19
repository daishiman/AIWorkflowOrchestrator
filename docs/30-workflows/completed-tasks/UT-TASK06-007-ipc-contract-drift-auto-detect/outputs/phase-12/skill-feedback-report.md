# スキルフィードバックレポート - UT-TASK06-007 Phase 12

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | UT-TASK06-007                                                      |
| 再監査日   | 2026-03-19                                                         |
| 対象スキル | task-specification-creator, aiworkflow-requirements, skill-creator |

## フィードバックサマリー

| ID   | 対象                       | 内容                                                                            | 状態     |
| ---- | -------------------------- | ------------------------------------------------------------------------------- | -------- |
| T-01 | task-specification-creator | 行数目安超過時のエスカレーションを template 側へ持たせたい                      | 未反映   |
| T-02 | task-specification-creator | docs-heavy でも user 要求時は screenshot へ昇格する規則を template に揃える     | 反映済み |
| T-03 | aiworkflow-requirements    | 診断器の能力進化時に workflow / spec / backlog を同ターン更新するチェックを残す | 反映済み |
| T-04 | skill-creator              | Phase 12 の再監査と system spec 追補を再利用しやすい template にする            | 反映済み |

## T-01: NFR行数目安の扱い

### 観測

`check-ipc-contracts.ts` は current branch で 578 行まで増えた。Phase 2 の「200行目安」は目安として残してよいが、超過時の判断手順が template 側に弱い。

### 推奨

- Phase 3 で「超過を許容する根拠」を明文化する欄を設ける
- Phase 8 / 10 で follow-up ID を必ず紐付ける

## T-02: screenshot 昇格規則の template drift

### 観測

`phase-11-12-guide.md` には「ユーザーがスクリーンショットを要求したら docs-only でも昇格」とある一方、`phase-template-phase11.md` と `screenshot-verification-procedure.md` には旧来の `NON_VISUAL` 単独前提が残っていた。

### 対応

- `phase-template-phase11.md` に user request override を追記
- `screenshot-verification-procedure.md` に N/A 例外の但し書きを追記

## T-03: 診断器の能力進化と台帳同期

### 観測

generic / multiline preload 抽出や複数 const object 解決が code では進んでいたが、workflow / LOGS / checklist / backlog の記述が追随していなかった。

### 対応

- `LOGS.md`, `ipc-contract-checklist.md`, `implementation pattern detail`, `task-workflow backlog/completed`, `quick-reference`, `resource-map` を同期
- EXT-002 の意味を current residual scope に再定義

## T-04: Phase 12 再監査テンプレートの不足

### 観測

今回の再監査では、実装内容の system spec 反映、苦戦点の記録、未タスク formalize、subagent 分担メモを毎回ゼロから組み立てる必要があった。`skill-creator` 側に Phase 12 向けの再利用テンプレートがなく、再監査の粒度が担当者依存になりやすかった。

### 対応

- `assets/phase12-system-spec-retrospective-template.md` を追加し、system spec へ「実装事実 / 苦戦箇所 / 簡潔解決手順」を落とし込む型を固定
- `assets/phase12-spec-sync-subagent-template.md` を追加し、subagent に渡す監査観点を標準化
- `references/patterns-success-phase12-advanced.md` を追加し、今回の再監査パターンを知見化
- `LOGS.md` と `SKILL.md` の change history を更新し、UT-TASK06-007 の反映履歴を残した

## 改善点なし

- `phase-11-12-guide.md` 自体の screenshot 昇格ルールは十分だった
- `quality-requirements.md` は concise table として十分で、今回は過剰拡張しない方が整合的だった
