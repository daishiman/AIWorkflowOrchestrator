# XenovaTransformerEncoder Electron E2E 検証 - タスク指示書

## メタ情報

```yaml
issue_number: 2359
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | EMB-005-B                                  |
| タスク名     | XenovaTransformerEncoder Electron E2E 検証 |
| 分類         | 検証                                       |
| 対象機能     | Late Chunking / XenovaTransformerEncoder   |
| 優先度       | 低                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | UNASSIGNED-EMB-005-A Phase 12 未タスク検出 |
| 発見日       | 2026-04-20                                 |
| 依存タスク   | UNASSIGNED-EMB-005-A（完了済み）           |
| 関連Issue    | #2359                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`XenovaTransformerEncoder` は Node テスト環境では全 35 件（ユニット29件 + 統合6件）がパスしているが、
Electron レンダラープロセスの `contextIsolation` 下での動作検証は未了の状態で UNASSIGNED-EMB-005-A が close-out された。

### 1.2 問題点・課題

- `@xenova/transformers` は動的 import を使用しているため、`contextIsolation` 有効時のバンドル挙動が未確認
- Electron 環境では CSP（Content Security Policy）の制限が Node.js 単体テストと異なる可能性がある
- 初回モデルダウンロードのキャッシュパスが Electron の sandbox 環境で正常に機能するかが不明

### 1.3 放置した場合の影響

- 本番 Electron アプリで `XenovaTransformerEncoder` を使用した際にランタイムエラーが発生するリスク
- renderer/preload/main のどこで問題が起きるか切り分けられず、デバッグに時間がかかる

---

## 2. 何を達成するか（What）

### 2.1 目的

Electron 実行環境で `XenovaTransformerEncoder` の実動作を確認し、Node テストとの乖離がないことを実証する。

### 2.2 最終ゴール

- `new XenovaTransformerEncoder().encode("テストテキスト")` が Electron レンダラーで成功すること
- 初回ロード・キャッシュ再利用の挙動を実測値で記録すること

### 2.3 スコープ

**含むもの:**

- Electron 上のスモークテスト（手動またはPlaywright/Electron harness使用）
- 実モデルロードの動作確認（`Xenova/all-MiniLM-L6-v2`）
- キャッシュディレクトリとログの確認
- 必要なら Playwright / Electron harness の追加

**含まないもの:**

- `LateChunkingService` の仕様変更
- UI コンポーネントの改修
- 追加モデル対応
- CI への組み込み（ローカル専用検証として扱う）

### 2.4 成果物

- 実行証跡ログ（`outputs/phase-11/` 相当）
- 失敗した場合は再現手順と原因分析ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UNASSIGNED-EMB-005-A が完了していること（`XenovaTransformerEncoder` 実装済み）
- Electron 開発環境が動作すること（`pnpm --filter @repo/desktop dev` が起動できる）
- ネットワーク接続（初回モデルダウンロードのため）

### 3.2 依存タスク

- UNASSIGNED-EMB-005-A: XenovaTransformerEncoder 実装（完了済み）

### 3.3 必要な知識・スキル

- Electron アーキテクチャ（main/renderer/preload の役割）
- `contextIsolation` の仕組み
- `@xenova/transformers` の動的 import パターン

### 3.4 推奨アプローチ

1. まず `apps/desktop` の既存 IPC ハンドラーに `embedTest` チャンネルを仮追加
2. renderer から IPC 経由で `XenovaTransformerEncoder.encode()` を呼び出す
3. 成功・失敗のログを DevTools / main プロセスコンソールで確認
4. CI 非対象のローカル専用検証スクリプトとして切り出す

---

## 4. 実行手順

### Phase 1: 環境セットアップ確認

- `pnpm --filter @repo/desktop dev` が起動することを確認
- `@xenova/transformers` が `packages/shared` に正しく追加されていることを確認

### Phase 2: スモークテスト実装

- main プロセス（または preload）に `embedTest` IPC ハンドラーを仮追加
- `XenovaTransformerEncoder` をインスタンス化して `encode("hello world")` を呼び出す
- 結果をコンソールに出力

### Phase 3: 動作確認・ログ収集

- 初回起動時のモデルダウンロードログを確認
- キャッシュディレクトリ（`env.cacheDir`）のパスを確認
- 2回目起動でキャッシュが再利用されることを確認

### Phase 4: 成果物作成

- 実行証跡を `outputs/phase-11/` 相当に保存
- 失敗した場合は原因分析と対策を記録

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Electron 実行環境で `XenovaTransformerEncoder.encode()` が少なくとも 1 回成功する
- [ ] 初回モデルロード時のログが確認できる
- [ ] 2回目以降のキャッシュ再利用が確認できる

### 品質要件

- [ ] 失敗した場合は再現手順が明確に記録されている
- [ ] renderer/preload/main のどのレイヤーで動作するかが明確

### ドキュメント要件

- [ ] 実行証跡が `outputs/phase-11/` 相当に保存されている
- [ ] 失敗時の原因分析ドキュメントが存在する

---

## 6. 検証方法

### テストケース

| ID     | 内容                               | 期待結果                                |
| ------ | ---------------------------------- | --------------------------------------- |
| E2E-01 | `encode("hello world")` の基本動作 | Float32Array が返る                     |
| E2E-02 | 初回ロード時のキャッシュパス確認   | `env.cacheDir` 配下にモデルが保存される |
| E2E-03 | 2回目起動でのキャッシュ再利用      | ネットワークアクセスなしで動作する      |
| E2E-04 | CJK テキスト（日本語）のエンコード | 正常にベクトルが返る                    |

### 検証手順

1. `pnpm --filter @repo/desktop dev` で Electron を起動
2. DevTools を開き、IPC 経由で `embedTest` を呼び出す
3. コンソールログで成功・失敗を確認
4. ネットワークタブでモデルダウンロードを確認（初回のみ）

---

## 7. リスクと対策

| リスク                                  | 発生確率 | 影響度 | 対策                                                     |
| --------------------------------------- | -------- | ------ | -------------------------------------------------------- |
| `contextIsolation` で動的 import が失敗 | 中       | 高     | preload スクリプトからの呼び出しに変更                   |
| CSP によりモデルダウンロードがブロック  | 低       | 高     | CSP 設定の緩和または `--disable-web-security` フラグ使用 |
| 初回モデルダウンロードがタイムアウト    | 低       | 中     | タイムアウト設定を延長（デフォルト30秒 → 300秒）         |

---

## 8. 参照情報

### 関連ドキュメント

- 実装: `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`
- テスト: `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts`
- タスク仕様書親: `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/`
- Phase 12 未タスク検出: `docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- [@xenova/transformers ドキュメント](https://huggingface.co/docs/transformers.js)
- [Electron contextIsolation 解説](https://www.electronjs.org/docs/latest/tutorial/context-isolation)

---

## 9. 備考

### 苦戦が予想される箇所

UNASSIGNED-EMB-005-A の実装で発生した以下の問題が Electron 環境でも再現する可能性がある：

- `PretrainedOptions` 型不整合: `@xenova/transformers` 側のオプション型が厳密に定義されていないため `Record<string, unknown>` キャストが必要だった。Electron バンドル後も同様の問題が起きる可能性
- モデル遅延ロードの `loadingPromise` キャッシング: ロード失敗時の reset 処理が Electron の lifecycle 管理と干渉する可能性

### 補足

このタスクは CI 非対象として扱い、ローカル開発環境での手動検証が主体。
成功した場合は将来的に Playwright Electron harness に組み込むことを検討。
