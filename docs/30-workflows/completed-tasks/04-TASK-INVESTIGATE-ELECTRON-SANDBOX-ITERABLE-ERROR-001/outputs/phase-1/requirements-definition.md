# Phase 1 要件定義書

## 1. 問題定義

- 事象: OAuthセッション確立後に `sandbox bundle` 側で `is not iterable` 系エラーが出る。
- 影響: 主因（IPC契約崩れ）と副作用ログ（DevTools/再描画/通信系）が混在し、調査が遅延する。
- 対象境界: Main IPC (`AUTH_STATE_CHANGED`) / Renderer Store (`linkedProviders`)。

## 2. SubAgent並列分析

### SubAgent-A（Main/IPC責務）

- `PROFILE_UNLINK_PROVIDER` 成功通知で、Renderer契約型ではなく生のSupabase Userを送る経路が存在。
- `AUTH_STATE_CHANGED` の `user` 形状がケースによって揺れる。

### SubAgent-B（Preload/API契約）

- Preloadチャネル定義は既存契約を満たしており、新規チャネル追加は不要。
- 問題はチャネル有無ではなく payload shape のランタイム不整合。

### SubAgent-C（Renderer/UX契約）

- `authSlice` が `linkedProviders` を配列前提で扱う経路に防御不足があり、契約崩れ時に `iterable` 例外へ波及。
- UI実装差分は不要、Store層の防御強化が主対象。

### SubAgent-D（統合監査）

- 根因: Main→Rendererでの契約形状不一致 + Renderer側の正規化不足。
- 再発防止方針: 「Mainで正規化」「Rendererで防御」の二重ガード。

## 3. 機能要件（FR）

- FR-01: `AUTH_STATE_CHANGED` の `user` は常に `AuthUser` 形状で送信する。
- FR-02: `linkedProviders` が不正形でも Renderer がクラッシュせず処理継続する。
- FR-03: `linkProvider`/`unlinkProvider` で配列前提の崩壊を自己修復する。
- FR-04: 追加テストで契約崩れケースを再現し、回帰を防止する。

## 4. 非機能要件（NFR）

- NFR-01: 既存IPCチャネル・型定義・API公開境界を変更しない（後方互換維持）。
- NFR-02: 既存Authテスト群の合格を維持する。
- NFR-03: 調査ログと副作用ログを分離して記録可能にする。

## 5. スコープ

- In Scope
  - `authSlice.ts` のランタイム正規化
  - `profileHandlers.ts` の通知payload正規化
  - 関連ユニットテスト追加
- Out of Scope
  - OAuth画面/デザイン変更
  - 新規IPCチャネル追加
  - Supabaseスキーマ変更

## 6. 受け入れ判定に使う実測根拠

- `pnpm --filter @repo/desktop test:run ...`（3 files / 169 tests）PASS
- `pnpm --filter @repo/desktop typecheck` PASS
- `authSlice` カバレッジ（対象計測）: Lines 81.38 / Branches 84.88 / Functions 86.95
