# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| Phase               | 1                                                                        |
| タスクID            | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| 機能名              | LOGS.md アーカイブポリシー詳細化                                         |
| 前提Phase           | -                                                                        |
| 後続Phase           | Phase 2                                                                  |
| 作成日              | 2026-04-19                                                               |
| Issue               | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| ステータス          | completed                                                                |
| タスク種別          | docs-only / NON_VISUAL                                                   |
| implementation_mode | `verify_existing`                                                        |

## 目的

`.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` のアーカイブ閾値と
archive 先パス規則を統一ポリシーとして確定する。
Phase 1 では現行の運用実態と課題を整理し、Phase 2（設計）で採用する閾値候補と
パス規則候補の比較軸（行数・バイトサイズ・期間・ファイル命名）を確定させる。

## 背景

- `task-specification-creator/references/logs-archive-*.md` のパターンから月次アーカイブの実績は存在する
- しかし統一ポリシーが未文書化で、スキルごとの対応が属人化している
- LOGS.md の肥大化により worktree 間マージのコンフリクトが頻発
- TASK-CONFLICT-PREVENT-001 の unassigned-task-detection.md が本タスクの発火源となった

## 4条件の一次結論

| 条件         | 一次結論                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| 矛盾なし     | 文書執筆、mirror 同期、index 反映、blocked PR を責務分離すれば成立可能               |
| 漏れなし     | canonical 骨格と Phase 12 成果物定義の追補が必要                                     |
| 整合性あり   | docs-only / NON_VISUAL / `verify_existing` を全 Phase の前提として固定する必要がある |
| 依存関係整合 | 正本文書作成 → mirror 同期 → index 更新 → Phase 12 close-out の順序で閉じる          |

## 実行タスク

- 現行 LOGS.md の行数・バイトサイズの計測（スキル別集計）
- 既存 `logs-archive-*.md` の命名パターン・内部構造の棚卸し
- アーカイブ閾値候補の 3 軸整理（行数 / バイトサイズ / 期間）
- 採用方針の合意形成（月次 or サイズ閾値 or ハイブリッド）
- mirror sync 機構との整合確認

## 参照資料

| 資料名                            | パス                                                                              | 用途                   |
| --------------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| Issue #2282                       | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282                   | 要件原本               |
| logs-archive-2026-feb.md          | `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`   | 既存月次アーカイブ実例 |
| logs-archive-2026-march.md        | `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md` | 既存月次アーカイブ実例 |
| logs-archive-index.md             | `.claude/skills/task-specification-creator/references/logs-archive-index.md`      | 既存インデックス       |
| logs-archive-legacy.md            | `.claude/skills/task-specification-creator/references/logs-archive-legacy.md`     | レガシーアーカイブ     |
| aiworkflow-requirements topic-map | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                     | 参照追加先             |
| TASK-CONFLICT-PREVENT-001 成果物  | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/` 等               | 前提タスクの成果物参照 |

## 実行手順

### 0. P50 チェック: 既存アーカイブパターンの把握

```bash
ls .claude/skills/task-specification-creator/references/logs-archive-*.md
wc -l .claude/skills/task-specification-creator/references/logs-archive-*.md
rg -n "^# |^## " .claude/skills/task-specification-creator/references/logs-archive-2026-march.md | head -20
```

### 1. LOGS.md 現状計測

| 計測対象          | 計測内容                               | 集計方法                   |
| ----------------- | -------------------------------------- | -------------------------- |
| `.claude/skills/` | 全 LOGS.md の行数・バイトサイズ        | `wc -l` / `wc -c`          |
| `.agents/skills/` | mirror 側 LOGS.md の行数・バイトサイズ | `wc -l` / `wc -c`          |
| 最大ファイル      | 最大行数・最大バイトサイズのファイル   | `sort -nr`                 |
| 月次増加量        | 直近 3 か月の増加推移                  | `git log --since=3.months` |

### 2. 閾値候補の 3 軸整理

| 軸           | 候補 A | 候補 B | 候補 C  | 採用判断基準           |
| ------------ | ------ | ------ | ------- | ---------------------- |
| 行数         | 300 行 | 500 行 | 1000 行 | マージコンフリクト頻度 |
| バイトサイズ | 30 KB  | 50 KB  | 100 KB  | clone/操作レスポンス   |
| 期間         | 月次   | 四半期 | 半期    | 検索性と運用コスト     |

### 3. 採用案の事前選定（Phase 2 で確定）

- 基準案: 月次アーカイブ + 300 行超 or 30 KB 超のいずれかを満たした時点で archive
- archive 先: `logs-archive-YYYY-MM.md`（同一ディレクトリ内）
- 既存 `logs-archive-*.md` 命名規則との互換性を維持

### 4. mirror sync との整合確認

- TASK-CONFLICT-PREVENT-001 で構築された mirror sync 機構が `references/` 配下を同期対象とすることを確認
- `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` → `.agents/skills/` への同期経路が機能することを確認

## 統合テスト連携【必須】

| 判定項目                   | 基準                               | 結果 |
| -------------------------- | ---------------------------------- | ---- |
| docs-only 前提固定         | index / artifacts / Phase 1 が一致 | PASS |
| `verify_existing` 前提固定 | P50 チェックと整合                 | PASS |
| 4条件一次結論              | Phase 2 設計へ引き渡し可能         | PASS |

## 成果物

| 成果物         | パス                                     | 説明                              |
| -------------- | ---------------------------------------- | --------------------------------- |
| 要件整理メモ   | `outputs/phase-1/requirements.md`        | 現状計測、候補比較、4条件一次結論 |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md` | skill 要件と workflow の対応表    |

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                        | 検証方法                         |
| ---- | ------------------------------------------------------------------- | -------------------------------- |
| AC-1 | 現行 LOGS.md の行数・バイトサイズ計測結果が表形式で整理されている   | Phase 1 成果物の計測表を確認     |
| AC-2 | 閾値候補が行数・バイトサイズ・期間の 3 軸で 2 案以上提示されている  | Phase 1 成果物の候補表を確認     |
| AC-3 | 既存 `logs-archive-*.md` 命名パターンとの整合性確認が記述されている | 既存パターン調査結果の記載を確認 |
| AC-4 | Phase 2 への引き継ぎ事項（採用案・未決事項）が明示されている        | 引き継ぎセクションを確認         |

## スコープ

### 含むもの

- アーカイブ閾値候補の調査・比較
- archive 先パス規則候補の調査
- 既存パターンとの整合確認
- Phase 2 への引き継ぎ事項整理

### 含まないもの

- ポリシー文書の執筆（Phase 2 で実施）
- mirror への同期実行（Phase 3 で実施）
- アーカイブ自動化スクリプトの実装（別タスク）
- 過去 LOGS.md への遡及適用（別タスク）

## リスクと前提

| リスク                                       | 影響 | 対策                                               |
| -------------------------------------------- | ---- | -------------------------------------------------- |
| 閾値が低すぎて頻繁なアーカイブ操作が発生する | 中   | 300 行・30 KB を起点とし運用 3 か月後に見直し      |
| 既存 `logs-archive-*.md` 命名と衝突する      | 低   | 命名規則を Phase 1 で棚卸ししてから Phase 2 で固定 |
| mirror sync が references/ をカバーしない    | 中   | Phase 3 で同期を実行する前に sync 機構を検証       |

## 完了条件

- [ ] docs-only / NON_VISUAL / `verify_existing` の前提が固定されている
- [ ] 閾値候補と命名候補が比較可能な形で整理されている
- [ ] 4条件の一次結論が記録されている
- [ ] `outputs/phase-1/requirements.md` と `spec-extraction-map.md` の生成方針が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 現状計測観点を全件洗い出した
- [ ] skill 準拠観点を Phase 2 へ引き継いだ
- [ ] docs-only / NON_VISUAL / `verify_existing` の分類を明文化した
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認した

## 次Phase

- 採用する閾値案（行数・サイズ・期間のいずれ・組合せ）
- 採用するファイル命名規則（`logs-archive-YYYY-MM.md` 等）
- Phase 2 設計で意思決定が必要な項目の一覧
- Phase 2: 設計
