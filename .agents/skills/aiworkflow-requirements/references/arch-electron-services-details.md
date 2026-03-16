# Electron Main Process サービス / detail specification

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 役割: detail specification（インデックス）

このファイルは行数超過のため分割されました。内容は以下の2ファイルに移動されています。

## 分割先ファイル

| ファイル | 内容 |
| --- | --- |
| [arch-electron-services-details-part1.md](arch-electron-services-details-part1.md) | スキル管理サービス基盤・SkillScanner・IPC APIチャネル・SkillService/SkillCreatorService API |
| [arch-electron-services-details-part2.md](arch-electron-services-details-part2.md) | SkillForker・RuntimeResolver・SkillScheduler/ScheduleStore・DI統合・キャッシュ・永続化・SkillImportManager詳細 |

## 目次（クイックリファレンス）

### Part 1 — スキル管理基盤

- スキル管理サービス 概要・コンポーネント構成・ファイル構成・型定義
- SkillScanner（TASK-2A）: スキャン対象ディレクトリ・API・セキュリティ対策・データフロー・E2Eフィクスチャ・将来改善ロードマップ
- IPC APIチャネル一覧（`skill:list` / `skill:import` / `skill:fork` / `skill:schedule:*` 等）
- データフロー（Renderer → IPC → SkillService）
- SkillService（Facade）API
- SkillCreatorService（Facade）API

### Part 2 — 高度なサービス・統合・永続化

- SkillForker（TASK-9E）
- RuntimeResolver（runtime routing 共通化）
- SkillScheduler / ScheduleStore（TASK-9G）
- SkillService と SkillExecutor の統合（TASK-FIX-7-1、Setter Injection パターン）
- Runtime routing / handoff DI 統合（Composition root 配線・セキュリティ境界）
- キャッシュ機構
- 永続化（electron-store）
- SkillImportManager 永続化実装詳細（TASK-FIX-4-2）
