# Phase 2 Output: サブエージェントレーン計画

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 2                         |
| 作成日   | 2026-04-18                |

## 概要

Phase 5（実装）での作業を3レーンに分割し、並列実行可能な範囲と依存順序を確定する。  
レーン数は3以下とし、各レーンの責務を単一責任原則に従い分離する。

---

## レーン構成

| レーン | 名称                                                               | 並列可否                    | 担当範囲     |
| ------ | ------------------------------------------------------------------ | --------------------------- | ------------ |
| Lane A | `.gitattributes` + custom driver bootstrap + session-init チェック | 並列（Lane B と同時実行可） | Git設定層    |
| Lane B | `generate-index.js` deterministic 化（日付除去）                   | 並列（Lane A と同時実行可） | Generator層  |
| Lane C | LOGS / EVALS / Phase 12 close-out                                  | Lane A・B 完了後に着手      | 運用・統合層 |

---

## Lane A: `.gitattributes` + custom driver bootstrap + session-init チェック

### 目的

merge policy を Git に正しく認識させる設定を整備する。

### 作業内容

1. **`.gitattributes` の修正**

   - `indexes/*.md` を `merge=union` から `merge=ours` へ変更
   - 現状の記述と `merge-policy-matrix.md` の設計方針を照合し、差分を修正する

2. **custom driver bootstrap の追加**

   - `git config merge.ours.driver true` の実行を `session-init.sh` に追記する
   - 設定が存在しない場合は警告を出力する check を追加する

3. **設定確認スクリプトの設計**
   - Phase 9 で使用する検証コマンドを定義する
   ```bash
   git config --get merge.ours.driver  # "true" が返ること
   git check-attr merge -- .claude/skills/aiworkflow-requirements/indexes/topic-map.md
   # 出力例: .claude/skills/aiworkflow-requirements/indexes/topic-map.md: merge: ours
   ```

### 完了条件

- [ ] `.gitattributes` の `indexes/*.md` が `merge=ours` になっている
- [ ] `session-init.sh` に `git config merge.ours.driver true` が追記されている
- [ ] 確認コマンドが Phase 9 の validation matrix に記載されている

---

## Lane B: `generate-index.js` deterministic 化（日付除去）

### 目的

`generate-index.js` の出力を deterministic にし、再実行のたびに差分が発生する状況を解消する。

### 作業内容

1. **日付ヘッダーの除去**

   - `topic-map.md` の先頭に出力される `> 自動生成: YYYY-MM-DD` 行を削除する
   - 対象箇所: `generate-index.js` 内の `> 自動生成: ${new Date().toISOString().split("T")[0]}` という記述

2. **行番号索引の維持**

   - discoverability 契約として `topic-map.md` の行番号索引は削除しない
   - 日付のみを除去し、索引構造はそのまま維持する

3. **snapshot テストの設計**
   - Phase 4 で generator の regression test（同じ入力から同じ出力が得られること）を設計する
   - テスト方針: `generate-index.js` を2回実行し、diff がゼロであることを確認する

### 完了条件

- [ ] `generate-index.js` の日付出力コードが削除されている
- [ ] `topic-map.md` を再生成しても日付差分が発生しない
- [ ] 行番号索引が維持されている

---

## Lane C: LOGS / EVALS / Phase 12 close-out

### 目的

append-only log と volatile metadata の運用方針を確定し、Phase 12 close-out の手順を設計する。

### 前提

- Lane A・B の完了後に着手する
- Lane A で確定した `.gitattributes` 設定を前提とする

### 作業内容

1. **LOGS / SKILL-changelog.md の運用確認**

   - `merge=union` 設定が正しく機能することを確認する（built-in のため custom driver 不要）
   - archive policy を記述する：ログが 500 行を超えたら `LOGS-archive-YYYY.md` へ切り出す

2. **EVALS.json の運用確認**

   - `merge=ours` 設定が正しく機能することを確認する（custom driver 必要）
   - schema は本 wave で変更しないことを Phase 12 成果物に明記する

3. **Phase 12 close-out 手順の設計**
   - wave 完了時の手順を以下の順序で定義する：
     1. `generate-index.js` を実行して generated index を再生成する
     2. canonical（`.claude/skills/`）と mirror（`.agents/skills/`）の parity を確認する
     3. root `artifacts.json` と `outputs/artifacts.json` を同期する
     4. `SKILL-changelog.md` に close-out エントリを追記する

### 完了条件

- [ ] LOGS archive policy が `validation-and-regenerate-plan.md` に記載されている
- [ ] EVALS schema 不変方針が Phase 12 成果物に明記されている
- [ ] Phase 12 close-out 手順が `validation-and-regenerate-plan.md` に記載されている

---

## レーン間の依存関係

```
Lane A ─┐
        ├─→ Lane C（A・B 完了後）
Lane B ─┘
```

Lane A と Lane B は互いに独立しており、並列実行できる。  
Lane C は Lane A（`.gitattributes` 確定）と Lane B（generator deterministic 化）の両方が完了してから着手する。  
Lane C の close-out 手順は Lane A の bootstrap 設定と Lane B の regenerate 動作を前提とするためである。
