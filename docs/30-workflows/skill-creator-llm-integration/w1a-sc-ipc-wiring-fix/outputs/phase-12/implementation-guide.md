# 実装ガイド

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 12 - ドキュメント

---

## Part 1: 概念説明（日常アナロジー）

### 放送室の比喩

学校の放送室を想像してください。

**放送室（Main Process）** には放送機器があり、**教室（Renderer）** にはスピーカーがあります。教室から放送室に連絡するには、**内線電話（IPC）** を使います。

#### P65 の問題: 2つの放送室

以前の状態は、正規の放送室（`skill-creator:*`）の隣に、勝手に作られた小さな放送室（`creator:*`）がある状態でした。教室の電話帳（allowlist）には正規の放送室の番号しか載っていないため、小さな放送室に電話をかけることはできません。これが「dead-end namespace」です。

#### 解決策: 放送室の統一

小さな放送室を正規の放送室に統合しました。全ての放送（16チャネル）が1つの電話帳（`skill-creator:` prefix）で管理されています。

#### ガードレール: 見張り番

新しい放送室が勝手に作られないように、4人の見張り番（テスト）を配置しました:

- IPC-P65-001: 不正な放送室がないか巡回
- IPC-P65-002: 全ての放送室が正しい名前か確認
- IPC-AL-001/002: 電話帳に全番号が載っているか確認

---

## Part 2: 技術詳細

### アーキテクチャ

```
Renderer
  ↓ safeInvoke("skill-creator:plan", args)
Preload (contextBridge)
  ↓ ipcRenderer.invoke("skill-creator:plan", args)
  ↓ [allowlist チェック]
Main Process
  ↓ ipcMain.handle("skill-creator:plan", handler)
  ↓ [creatorHandlers.ts]
RuntimeSkillCreatorFacade
```

### ファイル構成

| ファイル                  | 責務                                        |
| ------------------------- | ------------------------------------------- |
| `channels.ts`             | 全16チャネル定数定義                        |
| `skillCreatorHandlers.ts` | 既存 Skill Creator ハンドラ（13チャネル）   |
| `creatorHandlers.ts`      | Runtime Skill Creator ハンドラ（3チャネル） |
| `preload/allowlist.ts`    | invoke/on allowlist 管理                    |

### 新規チャネル追加手順

1. `channels.ts` に定数を追加
2. 該当ハンドラファイルに `ipcMain.handle` を追加
3. Preload allowlist に定数を追加
4. テストを追加（ハンドラ + allowlist 網羅性）
5. IPC-P65-002 テストが自動で prefix 統一を検証

### 変更時の注意事項

- 新規 namespace の作成は禁止（P65 再発防止）
- 全チャネルは `IPC_CHANNELS` 定数経由で参照（P27 準拠）
- 文字列引数は3段バリデーション（P42 準拠）
