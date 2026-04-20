# Phase 2 成果物: 設計書

- タスクID: TASK-LOGS-ARCHIVE-POLICY-001
- 作成日: 2026-04-19
- 前提: Phase 1 成果物（outputs/phase-1/requirements.md, spec-extraction-map.md）

## 1. 設計決定（採用案）

### D-1: アーカイブ閾値（ハイブリッド OR 方式）

| 閾値種別     | 値       | 判定タイミング            |
| ------------ | -------- | ------------------------- |
| 行数         | 300 行超 | 毎月初 第 1 営業日 に評価 |
| バイトサイズ | 30 KB 超 | 毎月初 第 1 営業日 に評価 |
| 期間         | 月次     | 毎月初に前月分を評価      |

採用理由: Phase 1 の計測で `claude-agent-sdk` が 336 行 / 26.4 KB となり、
300 行 / 30 KB を同時に採用すれば行数と KB の**どちらか片方**でも発火するため漏れない。
既存 feb/march/2026-03-topic 群の運用実績とも整合する。

### D-2: archive 先パス規則

```
.claude/skills/<skill-name>/LOGS.md                          # 現役ログ
.claude/skills/<skill-name>/logs-archive-<YYYY-MM>.md        # 月次アーカイブ
.agents/skills/<skill-name>/LOGS.md                          # mirror 現役
.agents/skills/<skill-name>/logs-archive-<YYYY-MM>.md        # mirror 月次
```

- 命名正規表現: `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$`
- legacy（feb/march / YYYY-MM-<topic>）は残置・リネーム禁止（F-001 対応）

### D-3: ポリシー文書の配置

| 配置先                                                                     | 種別   |
| -------------------------------------------------------------------------- | ------ |
| `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 正本   |
| `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | mirror |

mirror sync は TASK-CONFLICT-PREVENT-001 由来の機構を流用。対象外なら手動コピー。

### D-4: 3 インデックスへの参照追加

- `indexes/topic-map.md`: 1 行追加
- `indexes/quick-reference.md`: 1 行追加
- `indexes/resource-map.md`: references エントリ追加

## 2. ポリシー文書骨子（必須 6 セクション）

| #   | セクション         | 必須内容                                                                            |
| --- | ------------------ | ----------------------------------------------------------------------------------- |
| 1   | 適用範囲           | 対象 / 除外                                                                         |
| 2   | アーカイブ閾値     | 行数 / サイズ / 期間 + 判定タイミング（F-003）                                      |
| 3   | archive 先パス規則 | パス + 命名正規表現 + legacy 共存方針（F-001）                                      |
| 4   | アーカイブ手順     | 6 ステップ（検知→抽出→追記→削除→sync→確認）                                         |
| 5   | 運用ルール         | 見直しサイクル 6 か月 + 最終更新日/次回見直し日（F-004）+ エスカレーション（F-005） |
| 6   | 参照               | 既存 logs-archive-\*.md リンク集                                                    |

## 3. 不変条件（Invariants）

| ID  | 内容                                                             | 検証手段                                   |
| --- | ---------------------------------------------------------------- | ------------------------------------------ |
| I-1 | 命名規則の不変性（`logs-archive-YYYY-MM.md` と過去形式の共存性） | 正規表現マッチ / legacy 記述 grep          |
| I-2 | 閾値の一貫性（300 行 / 30 KB / 月次 が正本・mirror 両側で同一）  | `rg` による閾値抽出と diff                 |
| I-3 | mirror 対称性（正本と mirror が常に diff=0）                     | `diff .claude/... .agents/...`             |
| I-4 | references 配置（topic-map.md から参照可能）                     | `ls` 存在確認 + `grep logs-archive-policy` |

## 4. エラーハンドリング設計

| 失敗シナリオ             | 検知                                        | 対応                                                          |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------- |
| mirror sync 失敗         | Phase 3 の `ls` 存在確認・`diff` 差分       | 手動コピー + TASK-CONFLICT-PREVENT-001 担当へエスカレーション |
| topic-map 参照追加漏れ   | `grep logs-archive-policy topic-map.md`     | 参照行を追加（D-4 再実行）                                    |
| 必須セクション欠落       | セクション存在確認コマンド（Phase 4 TC-01） | 欠落セクション追記                                            |
| 既存 legacy との命名衝突 | `ls logs-archive-*.md` 事前確認             | 命名規則側で legacy を明記（F-001 対応）                      |

## 5. validation matrix（Phase 4 へ引き渡し）

| 検証項目                | 対応 TC | AC   |
| ----------------------- | ------- | ---- |
| 必須 6 セクション       | TC-01   | AC-1 |
| 閾値 3 種               | TC-02   | AC-2 |
| 命名規則（文字列）      | TC-03   | AC-2 |
| 手順 6 ステップ         | TC-04   | AC-3 |
| 命名正規表現            | TC-05   | AC-2 |
| F-001 legacy 共存       | TC-06   | AC-4 |
| mirror 存在             | TC-07   | AC-5 |
| mirror 差分ゼロ         | TC-08   | AC-5 |
| topic-map 参照          | TC-09   | AC-6 |
| F-003 判定タイミング    | TC-10   | AC-4 |
| F-004 最終/次回見直し日 | TC-11   | AC-4 |
| F-005 エスカレーション  | TC-12   | AC-4 |

## 6. Phase 11 primary evidence 設計（NON_VISUAL）

- スクリーンショット不要。正本は `outputs/phase-11/manual-test-result.md`。
- `implementation-guide.md` の `## 視覚証跡` には固定文言 `UI/UX変更なしのため Phase 11 スクリーンショット不要` を記述。
