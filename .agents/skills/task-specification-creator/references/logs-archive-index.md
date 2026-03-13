# Logs Archive Index

## 目的

`LOGS.md` を rolling log に保ちつつ、過去の実装・再監査・spec_created task の履歴を辿れるようにする。

## archive 一覧

| file | 期間 | 内容 |
| --- | --- | --- |
| [logs-archive-2026-march.md](logs-archive-2026-march.md) | 2026-03 | 直近の UI / auth / workflow 再監査と line budget reform |
| [logs-archive-2026-feb.md](logs-archive-2026-feb.md) | 2026-02 | Phase 12 ガード整備と validation 導入期 |
| [logs-archive-legacy.md](logs-archive-legacy.md) | 2026-01 以前 | 初期リファクタと major version 変遷 |
| [changelog-archive.md](changelog-archive.md) | version history | 詳細 version changelog |

## 運用ルール

1. rolling log は最新再利用情報だけを残す。
2. 月次 archive は 1 entry 1 line の summary へ圧縮する。
3. line budget を超えたら月次 archive を追加する。
