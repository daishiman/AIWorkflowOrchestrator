# Electron ライフサイクルイベント IPC リスナー管理監査 - タスク指示書

## メタ情報

```yaml
issue_number: 822
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | task-sec-ipc-lifecycle-audit-001                           |
| タスク名     | Electron ライフサイクルイベント IPC リスナー管理監査       |
| 分類         | セキュリティ                                               |
| 対象機能     | Main Process ライフサイクル管理                            |
| 優先度       | 中                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所） |
| 発見日       | 2026-02-14                                                 |
| 関連タスク   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-IPC-HANDLER-DOUBLE-REG-001（IPC ハンドラ二重登録防止修正）の実装時に、`unregisterAllIpcHandlers()` が `Object.values(IPC_CHANNELS)` で IPC チャンネルを一括走査する設計にしたが、**IPC チャンネル以外のネイティブイベントリスナー（`nativeTheme.on("updated")`）が IPC_CHANNELS の走査対象外であること**に気づくまで時間を要した。現在は `themeWatcherUnsubscribe` をモジュールスコープ変数で個別管理しているが、今後同様の非 IPC リスナーが増えた場合に解除漏れが発生するリスクがある。

また、Electron のライフサイクルイベント（`ready`, `activate`, `before-quit`, `window-all-closed` 等）全体を通して、どのイベントでどのリスナーが登録・解除されるかの全体像が文書化されていない。`activate` イベント以外にも、`before-quit` や `will-quit` 等のイベントでリスナーのクリーンアップが必要になる可能性がある。

### 1.2 問題点・課題

| 問題点                                             | 影響                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| 非 IPC リスナーの管理が個別対応                    | 新規リスナー追加時に解除漏れが発生しやすい                         |
| ライフサイクルイベント全体のリスナー管理が未文書化 | どのイベントでどのリスナーが登録/解除されるか不明確                |
| `themeWatcherUnsubscribe` が唯一の非 IPC リスナー  | 今後増えた場合の管理パターンが未確立                               |
| 15個のハンドラ登録関数のクロージャキャプチャ       | `mainWindowRef` のクロージャキャプチャパターンが文書化されていない |

### 1.3 放置した場合の影響

| 影響                                             | 深刻度 |
| ------------------------------------------------ | ------ |
| 新規リスナー追加時の解除漏れによるメモリリーク   | 中     |
| macOS ドックアイコンクリック時の予期しない挙動   | 中     |
| ライフサイクルイベントの理解不足による将来のバグ | 中     |
| リスナー累積による同一イベントの多重処理         | 高     |

---

## 2. 何を達成するか（What）

### 2.1 目的

Electron Main Process のライフサイクルイベント全体を通じたリスナー（IPC ハンドラ + 非 IPC リスナー）の登録・解除フローを監査し、網羅的な管理パターンを確立する。

### 2.2 最終ゴール

| ゴール                                               | 検証方法                 |
| ---------------------------------------------------- | ------------------------ |
| ライフサイクルイベントとリスナーの対応表が完成       | ドキュメント目視確認     |
| 非 IPC リスナーの管理パターンが確立                  | 設計ドキュメントレビュー |
| 全リスナーが `unregisterAllIpcHandlers()` で解除可能 | テスト実行               |
| クロージャキャプチャパターンが文書化                 | 実装ガイドレビュー       |

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/index.ts` のライフサイクルイベント全体の監査
- `apps/desktop/src/main/ipc/index.ts` の全ハンドラ登録関数の監査
- 非 IPC リスナー（`nativeTheme.on()` 等）の網羅的な洗い出し
- リスナー管理パターンの設計と実装
- ライフサイクルイベント × リスナー対応表の作成

#### 含まないもの

- Renderer Process 側のリスナー管理（別ドメイン）
- IPC チャンネルの追加・削除（本タスクは管理パターンの確立のみ）
- Preload スクリプトのリスナー管理

### 2.4 成果物

| 成果物                          | ファイルパス                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| ライフサイクル監査レポート      | `docs/30-workflows/{{TASK_DIR}}/outputs/phase-1/audit-report.md`    |
| リスナー管理設計ドキュメント    | `docs/30-workflows/{{TASK_DIR}}/outputs/phase-2/design-document.md` |
| 非 IPC リスナー管理の実装コード | `apps/desktop/src/main/ipc/index.ts`                                |
| ライフサイクル × リスナー対応表 | システム仕様書に統合                                                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 条件                                     | 確認方法              |
| ---------------------------------------- | --------------------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001 が完了 | artifacts.json で確認 |
| `unregisterAllIpcHandlers()` が実装済み  | `ipc/index.ts` で確認 |
| IPC_CHANNELS 定数がフラット構造である    | `channels.ts` で確認  |

### 3.2 依存タスク

| タスクID                          | ステータス |
| --------------------------------- | ---------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001 | 完了       |

### 3.3 必要な知識

| 知識領域                    | 重要度 |
| --------------------------- | ------ |
| Electron ライフサイクル API | 高     |
| ipcMain.handle() / on()     | 高     |
| nativeTheme API             | 中     |
| Node.js EventEmitter        | 中     |

### 3.4 推奨アプローチ

**アプローチ: リスナーレジストリパターン**

非 IPC リスナーを配列で管理し、`unregisterAllIpcHandlers()` 内で一括解除する。

```typescript
// 推奨パターン例
const nonIpcCleanups: Array<() => void> = [];

export function registerNonIpcListener(cleanup: () => void): void {
  nonIpcCleanups.push(cleanup);
}

export function unregisterAllIpcHandlers(): void {
  // IPC ハンドラの解除
  const allChannels = Object.values(IPC_CHANNELS);
  for (const channel of allChannels) {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  }
  // 非 IPC リスナーの一括解除
  for (const cleanup of nonIpcCleanups) {
    cleanup();
  }
  nonIpcCleanups.length = 0;
}
```

| 利点                               | 欠点                                |
| ---------------------------------- | ----------------------------------- |
| 新規リスナー追加時の解除漏れを防止 | リスナー登録時に cleanup 登録が必要 |
| 一括解除の網羅性が保証される       | 配列管理のオーバーヘッド（軽微）    |
| テストが容易                       | -                                   |

### 3.5 実装上の注意点（親タスクからの教訓）

以下は UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の実装で苦戦した箇所であり、本タスクでも同様の課題に直面する可能性が高い。

#### 教訓 1: `ipcMain.handle()` と `ipcMain.on()` の挙動差異

| API              | 二重登録時の挙動           | 影響                             |
| ---------------- | -------------------------- | -------------------------------- |
| ipcMain.handle() | 例外送出（Error thrown）   | アプリケーションがクラッシュする |
| ipcMain.on()     | リスナー追加（累積される） | 同一イベントが複数回処理される   |

`handle()` は RPC モデル（1チャンネル1ハンドラ）、`on()` はイベントリスナーモデル（複数リスナー可）という設計思想の違いが根本原因。

#### 教訓 2: IPC_CHANNELS 構造の確認が必須

`Object.values(IPC_CHANNELS)` で全チャンネルを取得できるのは、IPC_CHANNELS がフラットな構造の場合のみ。ネストされたオブジェクト構造の場合は再帰的なフラット化が必要になる。実装前に必ず `channels.ts` の構造を確認すること。

#### 教訓 3: 非 IPC リスナーの見落とし

`setupThemeWatcher()` が `nativeTheme.on("updated", ...)` を内部で登録しており、`IPC_CHANNELS` の走査だけでは解除されない。IPC ハンドラ以外のネイティブイベントリスナーも、ウィンドウ再生成時のライフサイクルに含める必要がある。

#### 教訓 4: `mainWindowRef` のクロージャキャプチャ

15個のハンドラ登録関数は `mainWindowRef` をクロージャでキャプチャしている。ウィンドウ再生成時に新しい `mainWindowRef` を渡して再登録しないと、古いウィンドウ参照を保持し続ける問題がある。

#### 教訓 5: アプローチ選択の複雑性

3つのアプローチ（A: 削除後再登録、B: フラグガード、C: 再登録しない）を比較検討した結果、A案を採用した。B案は `mainWindowRef` の更新不可、C案は15ファイル以上の大規模修正が必要という問題があった。本タスクでもアプローチ選択時にこれらの制約を考慮すること。

---

## 4. 実行手順

### Phase 構成

| Phase | 名称         | 主要タスク                                             |
| ----- | ------------ | ------------------------------------------------------ |
| 1     | 要件定義     | ライフサイクルイベント全体の監査、リスナー一覧作成     |
| 2     | 設計         | リスナー管理パターンの設計                             |
| 3     | 設計レビュー | 設計の妥当性検証                                       |
| 4     | テスト作成   | リスナー管理のテストケース設計                         |
| 5     | 実装         | リスナーレジストリパターンの実装                       |
| 6-9   | 品質検証     | テスト拡充・カバレッジ確認・リファクタリング・品質検証 |
| 10    | 最終レビュー | 多角的品質検証                                         |
| 11    | 手動テスト   | macOS ドックアイコンクリック等の動作確認               |
| 12    | ドキュメント | ライフサイクル対応表のシステム仕様書統合               |
| 13    | 完了         | PR準備                                                 |

### Phase 1: 監査

#### 手順

1. `apps/desktop/src/main/index.ts` の全ライフサイクルイベント（`ready`, `activate`, `window-all-closed`, `before-quit`, `will-quit`）を列挙
2. 各イベントで登録・解除されるリスナーを洗い出し
3. `apps/desktop/src/main/ipc/` 配下の全ハンドラ登録関数を列挙
4. 非 IPC リスナー（`nativeTheme.on()`, `app.on()` 等）を `grep` で網羅的に検出
5. ライフサイクルイベント × リスナー対応表を作成

#### 推奨コマンド

```bash
# 非 IPC リスナーの検出
grep -rn "\.on(" apps/desktop/src/main/ --include="*.ts" | grep -v "ipcMain\." | grep -v "__tests__"
grep -rn "nativeTheme\." apps/desktop/src/main/ --include="*.ts"
grep -rn "app\.on\|app\.once" apps/desktop/src/main/ --include="*.ts"
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ライフサイクルイベント × リスナー対応表が完成している
- [ ] 非 IPC リスナーが全て洗い出されている
- [ ] 全リスナーが `unregisterAllIpcHandlers()` で解除可能である
- [ ] `activate` イベント以外のライフサイクルイベントでのリスナー管理が検証されている

### 品質要件

- [ ] テストカバレッジ 90% 以上
- [ ] 型安全（`any` 型なし）
- [ ] ESLint / Prettier 準拠

### ドキュメント要件

- [ ] ライフサイクル対応表がシステム仕様書（`security-electron-ipc.md` または `architecture-implementation-patterns.md`）に統合されている
- [ ] クロージャキャプチャパターンが文書化されている

---

## 6. 検証方法

### テストケース

| テストケース                          | 期待結果                                         |
| ------------------------------------- | ------------------------------------------------ |
| 非 IPC リスナー登録後の一括解除       | 全リスナーが解除される                           |
| 新規非 IPC リスナー追加後の一括解除   | 新規リスナーも解除対象に含まれる                 |
| activate イベントでのリスナー再登録   | 古いリスナーが解除され新しいリスナーが登録される |
| `unregisterAllIpcHandlers()` の冪等性 | 複数回呼び出しでもエラーなし                     |

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/` でテスト実行
2. カバレッジレポートで全コードパスのカバーを確認
3. `pnpm --filter @repo/desktop exec tsc --noEmit` で型チェック

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                           |
| ------------------------------------------ | ------ | -------- | ---------------------------------------------- |
| リスナーレジストリの導入が既存テストを破壊 | 中     | 中       | 段階的導入（まず themeWatcher を移行して検証） |
| `before-quit` でのクリーンアップ漏れ       | 中     | 低       | ライフサイクルイベント対応表で事前検証         |
| 15ハンドラ関数のシグネチャ変更             | 中     | 低       | 既存インターフェースを維持し、内部実装のみ変更 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| IPC セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                    |
| アーキテクチャ実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                     |
| 既知の落とし穴（P5）         | `.claude/rules/06-known-pitfalls.md`                                                                            |
| 親タスク設計ドキュメント     | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-2/design-document.md`        |
| 親タスク実装ガイド           | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/implementation-guide.md`  |
| 親タスクスキルフィードバック | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/skill-feedback-report.md` |

### 参考資料

| 資料                   | 内容                                            |
| ---------------------- | ----------------------------------------------- |
| Electron App Lifecycle | `ready`, `activate`, `before-quit`, `will-quit` |
| Electron ipcMain API   | `handle()`, `on()`, `removeHandler()`           |
| Node.js EventEmitter   | `removeAllListeners()`, `removeListener()`      |

---

## 9. 備考

### 発見元の原文（スキルフィードバックレポート Section 5.2）

> `setupThemeWatcher()` が `nativeTheme.on("updated", ...)` を内部で登録しており、IPC_CHANNELS の走査だけでは解除されないことに気づくまで少し時間がかかった。IPC ハンドラ以外のネイティブイベントリスナーも、ウィンドウ再生成時のライフサイクルに含める必要がある。

### 補足事項

- 現在の非 IPC リスナーは `themeWatcherUnsubscribe` の1件のみだが、将来の拡張を見据えた管理パターンの確立が目的
- 本タスクは `unregisterAllIpcHandlers()` の名称変更（`unregisterAllHandlers()` 等）も検討対象に含む
- `before-quit` / `will-quit` イベントでのクリーンアップ必要性は Phase 1 の監査で判断する
