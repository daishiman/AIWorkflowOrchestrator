# [#2359] test(embedding): XenovaTransformerEncoder Electron E2E検証 [EMB-005-B]

## メタ情報

```yaml
issue_number: 2359
title: test(embedding): XenovaTransformerEncoder Electron E2E検証 [EMB-005-B]
state: OPEN
priority: 低
scale: 中規模
category: testing
status: 未実施
created_date: 2026-04-20
updated_date: 2026-04-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2359
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`XenovaTransformerEncoder` は Node テスト環境では全35件パスしているが、Electron レンダラープロセスの `contextIsolation` 下での動作検証が未了。

## 背景

- 発見元: UNASSIGNED-EMB-005-A Phase 12 未タスク検出
- 発見日: 2026-04-20
- 依存タスク: UNASSIGNED-EMB-005-A（完了済み）

## 目標

- Electron実行環境で `new XenovaTransformerEncoder().encode()` が成功することを確認
- 初回モデルロードとキャッシュ再利用の挙動確認
- 失敗時にrenderer/preload/mainのどこで崩れるかを切り分け

## スコープ

**含む:**

- Electron上のスモークテスト
- 実モデルロードの動作確認（`Xenova/all-MiniLM-L6-v2`）
- キャッシュディレクトリとログの確認
- 必要なら Playwright / Electron harness 追加

**含まない:**

- `LateChunkingService` の仕様変更
- UIコンポーネントの改修
- 追加モデル対応

## 完了条件

- [ ] Electron実行環境で `XenovaTransformerEncoder` が少なくとも1回成功する
- [ ] 失敗時の再現手順と原因が成果物に残る
- [ ] 実行証跡が `outputs/phase-11/` 相当へ保存される

## 技術的な注意点

- `@xenova/transformers` の初回モデル取得は時間がかかる可能性がある
- `contextIsolation` / CSP / preload境界の影響を確認
- 必要なら別途 CI 非対象のローカル専用検証として切り出す

## 関連

- 実装: `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`
- タスク仕様書: `docs/30-workflows/unassigned-task/EMB-005-B-electron-e2e.md`
