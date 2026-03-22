# TASK-FIX-LLM-CONFIG-PERSISTENCE 実装ガイド

## Part 1: 概念説明（中学生レベル）

### なぜこの修正が必要か

この修正が必要だった理由は、アプリを閉じて開き直すたびに、LLM の provider と model の選択が消えていたからです。
何をしたかより先に言うと、これは「前に選んだ設定を覚えていない」ことが問題でした。毎回設定し直すと使い勝手が悪いだけでなく、存在しない provider を覚えていた場合に、勝手に別の設定へ切り替わる危険もあります。

### 何をしたか

今回やったことは 3 つです。

1. 選んだ provider / model を `knowledge-studio-store` に保存するようにした
2. 古い保存形式を新しい形式へ移し替える migrate を追加した
3. 保存されていた値が今も有効かを起動時に確認し、無効なら `null` に戻すようにした

### 永続化（persist）とは

永続化とは、アプリを閉じても設定が残る仕組みです。
たとえば、メモ帳に書いた内容は閉じても残りますが、ホワイトボードの文字は消したら残りません。今回の persist は、選んだ AI 設定を「メモ帳」に書き残す役目です。

### マイグレーション（migrate）とは

マイグレーションとは、古い形式のデータを新しい形式に直す作業です。
たとえば、昔の名簿に「クラス」と「名前」しかなかったのを、新しい名簿では「出席番号」も必要になったとします。そのとき古い名簿を捨てずに、新しい列を足して使える形へ直すのが migrate です。

### バリデーション（validation）とは

バリデーションとは、保存してあった値が今でも使えるかを確かめることです。
たとえば、お店の会員カードを使う前に「そのお店はまだあるかな」と確認するのと同じです。もう存在しないお店のカードなら、そのまま使わずに外します。今回の実装では、存在しない provider や model を見つけたら `null` に戻します。

## Part 2: 開発者向け実装詳細

### 変更ファイルと変更内容

| ファイル                                                          | 変更内容                                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/index.ts`                        | `partialize` に `selectedProviderId` / `selectedModelId` を追加し、persist version を `2` へ更新、v0/v1 からの migrate を追加    |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`              | `validateAndSyncPersistedConfig()` を追加し、`fetchProviders()` 内で persisted selection を検証してから state と Main 同期を行う |
| `apps/desktop/src/renderer/phase11-llm-config-persistence.tsx`    | Phase 11 専用 harness を追加し、valid / invalid / legacy / reload の 4 状態を 1 画面で確認できるようにした                       |
| `apps/desktop/scripts/capture-llm-config-persistence-phase11.mjs` | dedicated harness を capture する Playwright 入口を追加                                                                          |

### TypeScript の型定義

```ts
type PersistedSelection = {
  selectedProviderId: LLMProviderId | null;
  selectedModelId: string | null;
};

function validateAndSyncPersistedConfig(
  persistedProviderId: LLMProviderId | null,
  persistedModelId: string | null,
  availableProviders: LLMProvider[],
): PersistedSelection;
```

### APIシグネチャ / CLIシグネチャ

```ts
validateAndSyncPersistedConfig(
  persistedProviderId,
  persistedModelId,
  providers,
);
```

```bash
pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE --json
```

### 使用例

persist 値の復元時は、provider 一覧取得後に validate を通してから Main へ同期します。

```ts
const validated = validateAndSyncPersistedConfig(
  currentState.selectedProviderId,
  currentState.selectedModelId,
  providers,
);

if (validated.providerId && validated.modelId) {
  await window.electronAPI.llm.setSelectedConfig({
    providerId: validated.providerId,
    modelId: validated.modelId,
  });
}
```

### 設計上の重要な判断

1. `DEFAULT_CONFIG` への暗黙 fallback は禁止した。
   理由は、無効な provider を別の有効 provider にすり替えると、ユーザーの意図と違うモデルで送信されるためです。

2. `availableProviders.length === 0` のときは判断を保留する。
   何をするかより先に必要なのは誤消去防止で、取得失敗や未取得の瞬間に `null` へ消すと正常復旧時にも選択を戻せなくなるからです。

3. persist version は `v0/v1 -> v2` へ上げた。
   既存ストアに新フィールドを後付けするため、migrate なしで version だけ上げると state 全体リセットの危険があります。

4. 初回起動だけ first provider を自動選択する。
   これは `persistedProviderId === null` かつ current も `null` のときに限定し、P62 で null クリアされたケースには適用しません。

### エラーハンドリング

- `fetchProviders()` が失敗した場合は `llmError` に retryable error を入れ、永続化値のクリアは行いません。
- 無効な provider は `providerId=null`, `modelId=null` にして終了します。
- provider は有効だが model だけ無効な場合は `providerId` を保持しつつ `modelId=null` にします。
- Main 同期 `window.electronAPI.llm.setSelectedConfig()` が失敗しても UI 選択自体は保持し、warning のみを出します。

### エッジケース

- providers が空配列: 判定保留
- legacy persist version 1: `selectedProviderId` / `selectedModelId` を `null` で補う
- invalid provider + invalid model: 両方 `null`
- valid provider + invalid model: model だけ `null`
- reload 直後: sessionStorage の reload count を使って保持状態を視覚確認

### テスト戦略

| テストグループ | テスト数 | 目的                                          |
| -------------- | -------- | --------------------------------------------- |
| partialize     | 6        | persist 対象フィールドの固定                  |
| migration      | 7        | v0/v1 -> v2 の安全性                          |
| validation     | 6        | `validateAndSyncPersistedConfig()` の判定確認 |
| sync           | 5        | Main 同期タイミングの確認                     |
| extended       | 8        | null / 空配列 / invalid 値の追加境界          |
| 合計           | 32       | Task 03 の新規回帰                            |

### 設定と定数

| 設定項目 / 定数    | 値                                                                       | 用途                              |
| ------------------ | ------------------------------------------------------------------------ | --------------------------------- |
| persist key        | `knowledge-studio-store`                                                 | Renderer localStorage の保存先    |
| persist version    | `2`                                                                      | LLM selection を含む形式          |
| reload count key   | `phase11-llm-config-persistence-reload-count`                            | Phase 11 harness の再読み込み確認 |
| screenshot command | `pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence` | dedicated harness capture         |

### 既知の制約

- `electron-vite build` は current 環境の `esbuild` アーキテクチャ不一致に影響される
- `syncSelectedConfigToMain()` は hydrate 完了前に呼ぶと stale 値を送るため、`fetchProviders()` 完了後に限定する
- dedicated harness は review surface であり、product shell 全体の navigation までは検証対象にしない
