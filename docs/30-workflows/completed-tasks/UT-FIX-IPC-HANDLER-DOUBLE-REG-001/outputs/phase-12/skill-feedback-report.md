# スキルフィードバックレポート - UT-FIX-IPC-HANDLER-DOUBLE-REG-001

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| Phase      | 12                                |
| 実行日     | 2026-02-14                        |
| ステータス | 完了                              |

---

## 1. ワークフロー改善点

タスク仕様書の品質は高く、Phase 1-12 の実行はスムーズに進行した。改善点は以下の1点:

- **IPC関連バグ修正の共通テンプレート**: `ipcMain.handle()` と `ipcMain.on()` の挙動差異は他のバグ修正でも再発する可能性がある。Phase 2 の設計テンプレートに「IPC ハンドラ登録パターンの検証」チェック項目を追加することを推奨。具体的には、以下の確認項目を設計レビューチェックリストに含めることが望ましい:
  1. ハンドラ登録が複数回呼ばれる可能性のあるコードパスに存在しないか
  2. `ipcMain.handle()` と `ipcMain.on()` の二重登録時の挙動差異を考慮しているか
  3. ハンドラの解除ロジックが全チャンネルを網羅しているか

## 2. 技術的教訓

### 2.1 ipcMain.handle() と ipcMain.on() の二重登録挙動

| API              | 二重登録時の挙動           | 影響                             |
| ---------------- | -------------------------- | -------------------------------- |
| ipcMain.handle() | 例外送出（Error thrown）   | アプリケーションがクラッシュする |
| ipcMain.on()     | リスナー追加（累積される） | 同一イベントが複数回処理される   |

この差異は Electron 公式ドキュメントには明記されているが、実装時に見落としやすい。特にハンドラ登録を関数に集約している場合、二重呼び出しの検出が遅れる傾向がある。

**根本原因**: `ipcMain.handle()` は1チャンネルに対して1ハンドラのみを許可する設計（invoke/handle パターンは RPC モデルのため）。一方 `ipcMain.on()` はイベントリスナーモデルのため、同一イベントに複数リスナーを登録可能。この設計思想の違いが二重登録時の挙動差異を生む。

### 2.2 IPC_CHANNELS 定数の網羅性確認方法

`Object.values(IPC_CHANNELS)` で全チャンネル名を配列として取得することで、ハードコードされたチャンネル名に頼らず全チャンネルの一括操作が可能。チャンネル追加時の unregister 漏れを自動的に防止できる設計パターン。

```typescript
// 全チャンネルの一括解除パターン
export function unregisterAllIpcHandlers(): void {
  const allChannels = Object.values(IPC_CHANNELS);
  for (const channel of allChannels) {
    ipcMain.removeHandler(channel);
  }
}
```

このパターンにより:

- 新規チャンネル追加時に `IPC_CHANNELS` に定義するだけで解除対象に含まれる
- ハードコード文字列による解除漏れが発生しない（P27 対策にもなる）

### 2.3 ipcMain.removeHandler() の安全性

未登録チャンネルに対して `ipcMain.removeHandler()` を呼び出してもエラーは送出されない。これにより、冪等な全チャンネル走査が安全に実行可能。

- `removeHandler()`: 未登録でもエラーなし（安全）
- `removeAllListeners(channel)`: 未登録でもエラーなし（安全）

この性質により、「まず全解除してから再登録」というパターンが安全に実装できる。

## 3. 新規 Pitfall 候補

### P5 拡張の検討

既存の P5（リスナー二重登録）は React StrictMode での `useEffect` 二重実行に関する教訓。本タスクは **Main Process 側で同様のパターンが発生するケース** であり、P5 の拡張として以下の追記を推奨:

> **P5 拡張: Main Process での IPC ハンドラ二重登録**
>
> - `ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する
> - `ipcMain.on()` は同一チャンネルへの二重登録でリスナーが累積される
> - macOS の `activate` イベントなど、ライフサイクルイベントでの再登録に注意
> - 対策: `unregisterAllIpcHandlers()` パターンで全解除後に再登録

**判定**: 06-known-pitfalls.md への追記を推奨。P5 の「教訓」に Main Process 側のケースとして追記するのが適切。ただし本タスクのスコープ外とし、必要に応じて後続で実施。

### 追記推奨箇所

```markdown
### P5: リスナー二重登録

- **教訓（Renderer側）**: React StrictMode では `useEffect` が2回実行される。リスナー登録はモジュールレベルでガードが必要
- **教訓（Main Process側）**: `ipcMain.handle()` は同一チャンネルへの二重登録で例外送出。macOS `activate` イベント等でのハンドラ再登録時に発生しやすい。`unregisterAllIpcHandlers()` で全解除後に再登録するパターンで防止
- **関連タスク**: UT-FIX-IPC-HANDLER-DOUBLE-REG-001
```

## 4. スキル定義の改善提案

提案なし。タスク仕様書の品質は高く、Phase 12 の指示も十分に詳細だった。

強いて挙げるなら、ランタイムバグ修正タスクでは Phase 11（手動テスト）の検証方式について「UIを伴うテスト」と「コードレビューベース検証」のどちらを採用するかの判断基準を仕様書テンプレートに明記すると、Phase 11 の実行がスムーズになる可能性がある。

## 5. 苦戦箇所の記録

### 5.1 全チャンネルの列挙方法の調査

IPC_CHANNELS 定数の構造を確認し、`Object.values()` で全チャンネルを取得できることを確認するまでに、`channels.ts` と `ipc/index.ts` の両方を読む必要があった。IPC_CHANNELS がネストされたオブジェクト構造の場合は `Object.values()` だけでは不十分になるため、フラットな構造であることの確認が必要だった。

- **lessons-learned.md への記録**: 推奨
- **記録内容**: 「IPC_CHANNELS 定数は `Object.values()` で全チャンネルを取得でき、一括操作に利用可能。ネスト構造の場合はフラット化が別途必要」

### 5.2 setupThemeWatcher の unsubscribe 管理

`setupThemeWatcher()` が `nativeTheme.on("updated", ...)` を内部で登録しており、IPC_CHANNELS の走査だけでは解除されないことに気づくまで少し時間がかかった。IPC ハンドラ以外のネイティブイベントリスナーも、ウィンドウ再生成時のライフサイクルに含める必要がある。

- **lessons-learned.md への記録**: 推奨
- **記録内容**: 「IPC ハンドラ以外のリスナー（`nativeTheme.on()` 等）も、ウィンドウ再生成時の unregister/register ライフサイクルに含める必要がある。`unregisterAllIpcHandlers()` だけでは網羅できないリスナーが存在する」

### 5.3 苦戦箇所の全体評価

全体として苦戦箇所は軽微であり、タスクの複雑度に対して実装・テストともにスムーズに進行した。これはタスク仕様書で「二重登録の根本原因」と「修正方針」が明確に記載されていたことに起因する。

---

## 完了条件チェック

- [x] 5つの確認観点全てに対する記録がある
- [x] 新規 Pitfall 候補（P5 拡張）の検討結果が明記されている
- [x] 苦戦箇所を lessons-learned.md に記録すべきか判断した
- [x] P28 対策: スキル改善点がない場合でもレポートを作成した
