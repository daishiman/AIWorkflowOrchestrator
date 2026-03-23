# Phase 9: 品質チェックリスト

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

V-Q1~V-Q7の品質観点を展開し、UX・アーキテクチャ・IPC・セキュリティ・ワークフローの横断確認を行う。

---

## V-Q1: UX品質確認

### チェック項目

- [ ] OP-1（選択範囲をチャットへ送る）のツールバーがテキスト選択後300ms以内に表示される
- [ ] `TranscriptSelectionToolbar` のボタンラベルが直感的で、操作の結果が予測できる
- [ ] `TranscriptProvenanceChip` の表示が、チャットメッセージの視覚的優先順位を損なわない（コンテンツが主役、チップは補足）
- [ ] OP-3（セッションを貼り付ける）で大量テキストが貼り付けられる場合、truncationの視覚的フィードバックがある
- [ ] エラー発生時（例: セッション取得失敗）のエラーメッセージが具体的で修正方法を示している
- [ ] `TranscriptPanel` と `WorkspaceChatPanel` を同時に表示した際に、レイアウトが崩れない
- [ ] Apple HIG準拠: systemBlue(`#007AFF`)以外のアクセントカラーを使用していない（ライトモード）
- [ ] Apple HIG準拠: ダークモード時のコントラスト比が4.5:1以上を維持している

**判定基準**: 全項目PASSで V-Q1 PASS。

---

## V-Q2: アーキテクチャ品質確認

### チェック項目

- [ ] `TranscriptProvenance` 型が `packages/shared` に配置されており、`apps/desktop` と `apps/web` の両方から参照できる
- [ ] レイヤー依存方向が維持されている: `Renderer -> Preload (contextBridge) -> Main`
- [ ] `WorkspaceChatMessage.transcriptProvenance` はオプショナル（`?`）であり、provenance未付与のメッセージが既存コードで正常動作する
- [ ] `TranscriptPanel`・`TranscriptSelectionToolbar`・`TranscriptProvenanceChip` がAtomicDesignの原則に従って配置されている（atoms/molecules/organisms）
- [ ] 新規コンポーネントが `React.HTMLAttributes` を extends する場合、衝突属性を `Omit` で除外している（P46対策）
- [ ] `useTranscriptSelection`・`useTranscriptShare` が `useState`/`useReducer` を使用しており、グローバルStore（Zustand）への依存を最小化している
- [ ] 派生セレクタが `.filter()`/`.map()` を返す場合、`useShallow` を適用している（P48対策）

**判定基準**: 全項目PASSで V-Q2 PASS。

---

## V-Q3: IPC品質確認

### チェック項目

- [ ] IPCチャンネル名が `IPC_CHANNELS` 定数で管理されており、文字列リテラル直書きがない（P27対策）
- [ ] 全IPCハンドラで引数バリデーション（型チェック → 空文字列 → トリム空文字列）の3段バリデーションが実施されている（P42対策）
- [ ] IPCハンドラの引数名が実際に渡される値のセマンティクスと一致している（P45対策）
- [ ] IPC経由のレスポンスに `Date` オブジェクトが含まれていない（structured clone制約、P48対策）
- [ ] 新規IPCハンドラが `ipc-contract-checklist.md` Phase 1-6 に準拠している
- [ ] Preload `contextBridge.exposeInMainWorld` のホワイトリストに新規チャンネルが追加されている
- [ ] エラーレスポンスがサニタイズされており、内部パス・スタックトレースがRendererに漏洩しない（P55対策）

**判定基準**: 全項目PASSで V-Q3 PASS。

---

## V-Q4: セキュリティ品質確認

### チェック項目

- [ ] `contextIsolation: true`・`nodeIntegration: false`・`sandbox: true` の設定が維持されている
- [ ] OP-1/OP-2/OP-3のいずれもauto-sendを実装していない（ユーザーの明示的送信が必須）
- [ ] `originalContent` にAPIキー・パスワード・PII等の機密情報が含まれる場合の警告またはマスク処理が実装されている
- [ ] `originalContent` の文字数上限が設定されており、巨大なペイロードによるIPC負荷を防いでいる（M-3対応）
- [ ] `TranscriptProvenance.sharedAt` が偽装されない（Main Process側で `new Date().toISOString()` でセット）
- [ ] OP-3で貼り付けられるセッション内容が、現在のワークスペース権限の範囲内のみを対象としている

**判定基準**: 全項目PASSで V-Q4 PASS。

---

## V-Q5: ワークフロー品質確認

### チェック項目

- [ ] 状態遷移 `TranscriptVisible -> RangeSelected -> ShareReady -> ChatAttached/ChatPasted -> ProvenanceVisible` が正しい順序で実行される
- [ ] `RangeSelected` 状態でOP-2（直近出力を添付）を実行した場合、選択範囲ではなく直近出力が添付される（操作の独立性）
- [ ] `ChatAttached` 後にTranscriptPanelを閉じても、チャットメッセージの `transcriptProvenance` が消えない（永続性）
- [ ] 同一チャットセッション内でOP-1を連続実行した場合、各メッセージが個別の `transcriptProvenance` を持つ（非干渉性）
- [ ] ワークスペース切り替え時に `TranscriptPanel` の選択状態がリセットされる
- [ ] `ProvenanceVisible` 状態でチップをクリック/ホバーした際に、ソースへのナビゲーションまたはプレビューが機能する

**判定基準**: 全項目PASSで V-Q5 PASS。

---

## V-Q6: 型安全品質確認

### チェック項目

- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore`/`@ts-expect-error` を使用している場合、理由コメントが付与されている
- [ ] 型アサーション（`as`）でバリデーションを回避していない（P19対策）
- [ ] non-null assertion（`!`）を使用している場合、実行時検証で代替されている（P48対策）
- [ ] `TranscriptProvenance` の全フィールドに対して `type predicate` または `in` 演算子による型ガードが実装されている（P49対策）
- [ ] `pnpm typecheck` が0エラーで完了する

**判定基準**: 全項目PASSで V-Q6 PASS。

---

## V-Q7: テスト品質確認

### チェック項目

- [ ] Line Coverage >= 80%（推奨 >= 90%）
- [ ] Branch Coverage >= 60%（推奨 >= 70%）
- [ ] Function Coverage >= 80%（推奨 >= 90%）
- [ ] V-C1~V-C8の全Contractテストが実装されている
- [ ] V-I1~V-I5の全Integrationテストが実装されている
- [ ] テスト間で状態共有がない（`beforeEach` でリセット）（P9対策）
- [ ] `happy-dom` 環境では `userEvent` の代わりに `fireEvent` を使用している（P39対策）
- [ ] テストは対象パッケージのディレクトリから実行している（P40対策）
- [ ] `pnpm vitest run` が0失敗で完了する

**判定基準**: 全項目PASSで V-Q7 PASS。

---

## 総合品質判定

| 観点           | 検証ID | 判定 | 備考                     |
| -------------- | ------ | ---- | ------------------------ |
| UX             | V-Q1   | -    | 設計タスク：実装後に評価 |
| アーキテクチャ | V-Q2   | -    | 設計タスク：実装後に評価 |
| IPC            | V-Q3   | -    | 設計タスク：実装後に評価 |
| セキュリティ   | V-Q4   | -    | 設計タスク：実装後に評価 |
| ワークフロー   | V-Q5   | -    | 設計タスク：実装後に評価 |
| 型安全         | V-Q6   | -    | 設計タスク：実装後に評価 |
| テスト         | V-Q7   | -    | 設計タスク：実装後に評価 |

**設計タスクとしての品質評価**: 本チェックリストは実装フェーズの品質ゲートとして機能する。設計タスク完了時点では、チェック項目の「定義完全性」を評価する。

**設計の完全性評価**:

- [x] V-Q1~V-Q7の全観点でチェック項目が定義されている
- [x] 各チェック項目に判定基準が明記されている
- [x] 既知のPitfall（P19/P27/P39/P40/P42/P44/P45/P46/P48/P49/P55）が対策として組み込まれている
