# Phase 12 実装ガイド

## Part 1（中学生向け）

### この修正で何を直したか

- スキルを実行するときに使う「鍵（APIキー）」の確認ルートを1本にそろえました。
- これまでは、場所によって別々の確認方法になっていて、
  - 画面では「鍵なし」
  - 実行側では「鍵あり」
    のようなズレが起きる可能性がありました。

### 日常のたとえ

- 学校の入室チェックを想像してください。
- 入口Aと入口Bで別々の名簿を使うと、ある入口では入れて別の入口では入れないことがあります。
- 今回は「名簿を1冊に統一」して、どの入口でも同じ判定になるようにしました。

### 何がうれしいか

- 認証エラーの挙動が安定する。
- テストで「同じ鍵インスタンスを使っている」ことを確認済みなので、再発しにくい。

## Part 2（技術者向け）

### 変更対象

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

### 型・APIシグネチャ

- `registerSkillHandlers(mainWindow, skillService, authKeyService?)`
  - 第3引数 `authKeyService?: IAuthKeyService` を受理
- `new SkillExecutor(mainWindow, undefined, authKeyService)`
  - `SkillExecutor` に明示DI

### 実装契約

- `registerAllIpcHandlers` が `AuthKeyService` を1回だけ生成
- 同一インスタンスを以下へ注入
  - `registerSkillHandlers`
  - `registerAuthKeyHandlers`
- 後方互換
  - `registerSkillHandlers` 第3引数は optional

### エッジケース

- Supabase未設定時のfallback authチャネル
- `AUTHENTICATION_ERROR` 伝搬（Main -> Preload -> Renderer）
- 既存2引数呼び出し互換

### 設定値一覧

- `ANTHROPIC_API_KEY`
  - `AuthKeyService` 未設定時の fallback 判定で参照

### 検証結果

- 回帰セット: 5 files / 148 tests PASS
- カバレッジ計測: 対象ファイル契約は維持、global threshold failは部分実行由来
