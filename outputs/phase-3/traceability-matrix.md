# トレーサビリティマトリクス - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (design-review skill)              |

---

## 2. 機能要件 → 設計対応マトリクス

### 2.1 コア機能

| 要件ID | 要件概要                                   | 設計対応箇所                                                       | 対応状況 | 検証結果 |
| ------ | ------------------------------------------ | ------------------------------------------------------------------ | -------- | -------- |
| FR-01  | structure.md変更時にindex.htmlを自動再生成 | SlideFileWatcher.onStructureChange → SkillExecutor.execute('html') | ✅       | OK       |
| FR-02  | リアルタイム変更検知                       | chokidar (awaitWriteFinish: 500ms)                                 | ✅       | OK       |
| FR-03  | hearing-facilitatorスキル呼び出し          | SkillExecutor.execute('hearing', projectPath)                      | ✅       | OK       |
| FR-04  | structure-designerスキル呼び出し           | SkillExecutor.execute('structure', projectPath)                    | ✅       | OK       |
| FR-05  | html-generatorスキル呼び出し               | SkillExecutor.execute('html', projectPath)                         | ✅       | OK       |
| FR-06  | slide-modifierスキル呼び出し               | SkillExecutor.execute('modifier', projectPath)                     | ✅       | OK       |
| FR-07  | 同期状態のUI表示                           | SyncStatusIndicator + Zustand Store (syncStatus)                   | ✅       | OK       |

### 2.2 補助機能

| 要件ID | 要件概要                   | 設計対応箇所                                   | 対応状況 | 検証結果 |
| ------ | -------------------------- | ---------------------------------------------- | -------- | -------- |
| FR-08  | 手動同期ボタン             | slideApi.manualSync() + SyncManager.sync()     | ✅       | OK       |
| FR-09  | スキル実行進捗表示         | slide:executionProgress イベント + ProgressBar | ✅       | OK       |
| FR-10  | スキル実行キャンセル       | SkillExecutor.cancel() + AbortController       | ✅       | OK       |
| FR-11  | プロジェクト選択ダイアログ | ProjectSelector.tsx                            | ✅       | OK       |
| FR-12  | 複数プロジェクト切り替え   | (Could) 将来実装                               | △        | N/A      |
| FR-13  | ウォッチャー起動/停止      | slideApi.startWatching/stopWatching            | ✅       | OK       |
| FR-14  | 実行履歴表示               | (Could) executionHistory in Zustand Store      | ✅       | OK       |

---

## 3. 非機能要件 → 設計対応マトリクス

### 3.1 パフォーマンス効率性

| 要件ID | 要件概要           | 設計対応箇所                                  | 対応状況 | 検証結果 |
| ------ | ------------------ | --------------------------------------------- | -------- | -------- |
| NFR-01 | 変更検知レイテンシ | awaitWriteFinish: { stabilityThreshold: 500 } | ✅       | OK       |
| NFR-02 | UI応答性維持       | Main/Renderer分離 + 非同期IPC                 | ✅       | OK       |
| NFR-03 | メモリ使用量       | 監視対象を2ファイルに限定                     | ✅       | OK       |
| NFR-06 | 初回読込時間       | 非同期初期化                                  | ✅       | OK       |

### 3.2 信頼性

| 要件ID | 要件概要           | 設計対応箇所                                           | 対応状況 | 検証結果 |
| ------ | ------------------ | ------------------------------------------------------ | -------- | -------- |
| NFR-04 | 無限ループ防止     | changeContextMap + markAsSkillChange + 1秒タイムアウト | ✅       | OK       |
| NFR-05 | エラーリカバリー   | 自動リトライ3回 (exponential backoff)                  | ✅       | OK       |
| NFR-07 | ファイルロック対応 | awaitWriteFinish + エラーハンドリング                  | ✅       | OK       |

### 3.3 使用性

| 要件ID | 要件概要             | 設計対応箇所                              | 対応状況 | 検証結果 |
| ------ | -------------------- | ----------------------------------------- | -------- | -------- |
| NFR-08 | 同期状態視認性       | useSyncStatusColor() → 3色表示 (緑/黄/赤) | ✅       | OK       |
| NFR-09 | スキルフェーズ理解性 | SkillPhasePanel + 明確なボタンラベル      | ✅       | OK       |
| NFR-10 | エラーメッセージ     | SlideError.suggestedAction                | ✅       | OK       |

### 3.4 保守性

| 要件ID | 要件概要             | 設計対応箇所                     | 対応状況 | 検証結果 |
| ------ | -------------------- | -------------------------------- | -------- | -------- |
| NFR-11 | テストカバレッジ     | テスト戦略設計 (state-design.md) | ✅       | OK       |
| NFR-12 | モジュール疎結合     | Layered Architecture + Interface | ✅       | OK       |
| NFR-13 | TypeScript厳密モード | 型定義完備 (types.ts)            | ✅       | OK       |

### 3.5 セキュリティ

| 要件ID | 要件概要              | 設計対応箇所                       | 対応状況 | 検証結果 |
| ------ | --------------------- | ---------------------------------- | -------- | -------- |
| NFR-14 | パス検証              | validateProjectPath + basePath制限 | ✅       | OK       |
| NFR-15 | IPC通信バリデーション | Zodスキーマ + contextIsolation     | ✅       | OK       |

### 3.6 互換性

| 要件ID | 要件概要               | 設計対応箇所              | 対応状況 | 検証結果 |
| ------ | ---------------------- | ------------------------- | -------- | -------- |
| NFR-16 | クロスプラットフォーム | Node.js標準API + chokidar | ✅       | OK       |
| NFR-17 | Node.jsバージョン      | Node.js 18+対応           | ✅       | OK       |

---

## 4. 制約 → 設計対応マトリクス

| 制約ID | 制約内容         | 設計対応箇所                      | 対応状況 | 検証結果 |
| ------ | ---------------- | --------------------------------- | -------- | -------- |
| CON-01 | Electron環境前提 | Main/Renderer/Preload分離設計     | ✅       | OK       |
| CON-02 | Agent SDK統合    | SkillExecutor.executeWithAgentSDK | ✅       | OK       |
| CON-03 | 既存IPC設計準拠  | electron-ipc-spec.md参照設計      | ✅       | OK       |
| CON-04 | task-002依存     | プロジェクトパス設定機能との連携  | ✅       | OK       |
| CON-05 | task-001依存     | Agent SDK統合基盤との連携         | ✅       | OK       |

---

## 5. IPC通信 → 設計対応マトリクス

### 5.1 IPCハンドラ

| チャネル名            | 要件対応     | 設計対応                   | 対応状況 |
| --------------------- | ------------ | -------------------------- | -------- |
| slide:executePhase    | FR-03〜FR-06 | api-specification.md 3.1節 | ✅       |
| slide:startWatching   | FR-02, FR-13 | api-specification.md 3.2節 | ✅       |
| slide:stopWatching    | FR-13        | api-specification.md 3.3節 | ✅       |
| slide:getSyncStatus   | FR-07        | api-specification.md 3.4節 | ✅       |
| slide:manualSync      | FR-08        | api-specification.md 3.5節 | ✅       |
| slide:cancelExecution | FR-10        | api-specification.md 3.6節 | ✅       |

### 5.2 IPCイベント

| イベント名              | 要件対応  | 設計対応                   | 対応状況 |
| ----------------------- | --------- | -------------------------- | -------- |
| slide:structureChanged  | FR-01     | api-specification.md 4.1節 | ✅       |
| slide:syncStatusChanged | FR-07     | api-specification.md 4.2節 | ✅       |
| slide:executionProgress | FR-09     | api-specification.md 4.3節 | ✅       |
| slide:executionComplete | FR-03〜06 | api-specification.md 4.4節 | ✅       |
| slide:executionError    | NFR-10    | api-specification.md 4.5節 | ✅       |

---

## 6. 統合ポイント対応状況

### 6.1 外部システム連携

| 連携先           | 要件対応      | 設計対応                | 対応状況 |
| ---------------- | ------------- | ----------------------- | -------- |
| chokidar         | FR-02, NFR-01 | SlideFileWatcher        | ✅       |
| Claude Agent SDK | FR-03〜FR-06  | SkillExecutor           | ✅       |
| Zustand          | FR-07, NFR-08 | slideProjectStore       | ✅       |
| Electron IPC     | 全通信        | slideApi + ipc-handlers | ✅       |

### 6.2 内部モジュール連携

| 連携元 → 連携先             | 設計対応             | 対応状況 |
| --------------------------- | -------------------- | -------- |
| FileWatcher → SkillExecutor | イベント駆動         | ✅       |
| SkillExecutor → SyncManager | 実行結果通知         | ✅       |
| Store → Components          | Zustand Subscribe    | ✅       |
| IPC Events → Store          | useIpcEventListeners | ✅       |

---

## 7. トレーサビリティサマリー

### 7.1 カバレッジ統計

| カテゴリ   | 総数   | 対応済み | 未対応 | カバレッジ |
| ---------- | ------ | -------- | ------ | ---------- |
| 機能要件   | 14     | 13       | 1      | 92.9%      |
| 非機能要件 | 17     | 17       | 0      | 100%       |
| 制約       | 5      | 5        | 0      | 100%       |
| IPC通信    | 11     | 11       | 0      | 100%       |
| **総計**   | **47** | **46**   | **1**  | **97.9%**  |

### 7.2 未対応項目

| 要件ID | 内容                     | 理由              | 対応方針          |
| ------ | ------------------------ | ----------------- | ----------------- |
| FR-12  | 複数プロジェクト切り替え | Could優先度のため | Phase 5以降で検討 |

### 7.3 検証結果

- **結果**: PASS
- **全要件の設計対応が確認できた**
- **未対応1件はCould優先度のため許容範囲**

---

## 8. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
