# 実行パターン集

> 読み込み条件: task-9D〜9J の仕様同期時

## 成功パターン

### 1. 監査指標の分離

- 状況: 差分が複数種類（参照パス/命名/artifacts）に跨る
- アプローチ: `oldPaths` と `missingArtifacts` を別指標で集計
- 結果: 修正順序が安定し、再監査が短時間化
- 適用条件: 仕様書のみ修正タスク

### 2. artifacts 先行固定

- 状況: taskごとに modifies/creates がばらつく
- アプローチ: 先に必須4項目（channels/skill-api/types/index）を固定
- 結果: 実装時の追記漏れを抑制
- 適用条件: IPC/Preload 拡張系タスク

### 3. externalizeDepsPlugin exclude + resolve.alias 組み合わせ

- 状況: preload で workspace パッケージ（例: `@repo/shared/src/ipc/channels`）をバンドルにインライン化したい
- アプローチ: `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` + `resolve.alias` を併用する
- 結果: `rollupOptions.external` から `@repo/shared` の正規表現が除去され、alias が解決されてインライン化される
- 適用条件: electron-vite の preload セクションで monorepo 内パッケージのサブパスをインライン化する場合。`resolve.alias` 単独では機能しない（Rollup の external チェックが `resolveId` フックより先に実行されるため）
- 注意: `@repo/shared` の他サブパスが `import type` のみであることを事前確認すること

### 4. External API IPC チャネルグループ監査

- 状況: `SKILL_CREATOR_EXTERNAL_API_CHANNELS` のような定数グループが shared に定義され、preload でスプレッド取り込みされる
- アプローチ: shared の定数グループ定義 → preload のスプレッド取り込み → Preload API の型使用 → IpcBridge のハンドラ登録を一気通貫で監査する
- 結果: チャネル追加時の取り込み漏れ（preload でスプレッドし忘れ）を早期検出できる
- 適用条件: `packages/shared/src/ipc/channels.ts` に新しい定数グループが追加された場合
- 注意: `EXTERNAL_API_CONFIG_REQUIRED` は `SKILL_CREATOR_SESSION_CHANNELS` 側に定義されているため、グループ横断の整合も確認が必要

## 失敗パターン（避けるべきこと）

### 1. 正本と補助資料の混同

- 状況: task-9正本と計画書の推奨案が不一致
- 問題: 先に補助資料へ合わせると契約が崩れる
- 原因: 変更優先順位が未定義
- 教訓: 仕様正本（task-9）を優先し、補助資料は注釈扱いにする

### 2. 残課題テーブルの更新漏れ

- 状況: 実施済みなのに未タスク欄が未更新
- 問題: 進捗誤読と再着手が発生
- 原因: 完了記録と未タスク更新が分断
- 教訓: 完了反映時に「完了セクション追加 + 残課題状態更新」を同時実施する
