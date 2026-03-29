# Implementation Guide — TASK-RT-04: API Key Management UI

## Part 1: 概念説明（中学生レベル）

### APIキーって何？

APIキーは、コンピュータ同士が話をするときに使う「合言葉」のようなものです。このアプリはAI（人工知能）を使ってスキルを作ります。AIに仕事を頼むには、まず「自分は正しい利用者です」と証明する必要があります。その証明に使うのがAPIキーです。

### この機能は何をするの？

今まで、AIに「合言葉」を教える画面がありませんでした。裏側の仕組みは完成していたのに、ユーザーが合言葉を入力する入口がなかったのです。

この機能は：

1. **入力フォーム** — 合言葉を入力できる画面を追加
2. **チェック機能** — 入力された合言葉が正しい形式かを確認
3. **保存機能** — 合言葉を安全に暗号化して保存
4. **削除機能** — 不要になった合言葉を削除
5. **状態表示** — 「未設定」「検証中」「設定済み」「エラー」を分かりやすく表示

### セキュリティ

合言葉はパスワードのように `***` で隠して表示され、OSの暗号化機能で安全に保管されます。

## Part 2: 技術詳細

### アーキテクチャ

```
[Renderer] ApiKeySettingsPanel
    ↓ window.electronAPI.authKey.set/exists/delete
[Preload] safeInvoke(IPC_CHANNELS.AUTH_KEY_*)
    ↓ ipcMain.handle
[Main] AuthKeyService → safeStorage → electron-store
```

### 変更ファイル一覧

| ファイル                                                                            | 変更種別      | 説明                      |
| ----------------------------------------------------------------------------------- | ------------- | ------------------------- |
| `packages/shared/src/types/skillCreator.ts:209`                                     | 型追加        | `ApiKeyStatus` union type |
| `packages/shared/src/types/index.ts:166`                                            | re-export追加 | `ApiKeyStatus`            |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                | 新規作成      | 全APIキー管理UI           |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | 2行追加       | import + JSX配置          |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx` | 新規作成      | 26テスト                  |

### 主要設計判断

1. **既存 `window.electronAPI.authKey` を使用** — `skill-creator-api.ts` への重複追加を避けた
2. **ローカルstate管理** — Redux不要（パネル内で完結する状態）
3. **クライアントサイドバリデーション** — UX向上のため、IPC前に早期フィードバック
4. **常時表示** — APIキーはスキル操作の前提条件

### テスト結果

26テスト全通過 (Vitest v2.1.9)

- AC-1: 4テスト (描画)
- AC-2: 6テスト (バリデーション + 境界値)
- AC-3: 5テスト (状態表示)
- AC-4: 5テスト (削除 + エラー)
- AC-5: 2テスト (コールバック)
- Edge case: 4テスト (入力連動)

### TypeScript型チェック

`tsc --noEmit` — 0 errors
