# Phase 11 Discovered Issues

## Blocker

- なし

## Note

- N-01: 実スキルの SKILL.md が `## 概要` / `## Trigger` セクション名と一致しない場合がある。L2 チェックのセクション名は今後の Layer 2 拡張で柔軟化の余地あり (TASK-P0-01 スコープ外)
- N-02: agent spec の `## 責務` セクションが別名 (e.g. `## Role`, `## Responsibility`) で書かれているケースで warning が出る (TASK-P0-01 スコープ外)

## Info

- verify engine は UI 変更なし。Phase 11 は command/result evidence を主証跡とする
- 339 既存テスト全通過、リグレッションなし
