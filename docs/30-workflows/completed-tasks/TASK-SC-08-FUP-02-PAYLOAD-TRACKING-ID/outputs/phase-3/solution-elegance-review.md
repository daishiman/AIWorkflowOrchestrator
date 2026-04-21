# Phase 3 成果物: 解決策 elegance レビュー（solution-elegance-review）

## 目的

Phase 2 で採用した「payload メタデータ戦略」の設計優雅性（elegance）を、
対立案「チャンネル多重化戦略」との比較および逆説思考・素人思考を用いて検証する。

## 採用案と棄却案

### 採用: payload メタデータ戦略

- 既存単一チャンネル `skill-creator:progress` を維持
- `SkillCreatorProgress` payload に `planId?: string` / `requestId?: string` を追加
- Renderer Hook 側で `options.planId` を用いて payload フィルタ

### 棄却: チャンネル多重化戦略

- `skill-creator:progress:{planId}` のように planId 別チャンネルを動的生成
- Renderer は対象 planId 専用チャンネルのみ購読

## チャンネル多重化案の棄却根拠

### 1. Electron IPC チャンネルの動的追加困難性

- Electron の `ipcMain.handle` / `ipcRenderer.on` は事前に channel 名を **ホワイトリスト化** する運用が一般的
  （本プロジェクトでは `preload/channels.ts` の `ALLOWED_ON_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` で管理）
- planId ベースの動的 channel 名を受け入れるとホワイトリスト機構を破壊し、
  `safeOn` / `safeInvoke` の security 前提（IPC validator）が崩れる
- `apps/desktop/src/preload/skill-creator-api.ts` L441-456 の `safeOn` 実装も
  `ALLOWED_ON_CHANNELS.includes(channel)` を前提としており、動的 channel に非対応

### 2. 後方互換性の崩壊

- 既存の `useStreamingProgress()` 呼出（引数なし）は単一チャンネル `skill-creator:progress` を前提
- 多重化に切り替えると全 callsite を `useStreamingProgress({ channel: "..." })` 的に書き換える必要があり、
  既存テスト（約 40 シナリオ）と IPC integration test（13 箇所）を破壊
- オプショナルフィールド追加なら既存呼出を無変更で生かせる（payload 戦略の優位点）

### 3. 運用コストのトレードオン劣位

- チャンネル多重化 = 「創設・破棄ライフサイクル管理」「購読漏れ時の memory leak リスク」を新規導入
- payload メタデータ = 「フィルタ 1 行追加」のみで済み、既存ライフサイクル機構に乗れる
- トレードオン思考: 多重化の潜在利得（完全な分離）より、payload 戦略の低コスト・高互換が上回る

### 4. メタ思考による抽象化

- 「IPC チャンネルは bus、payload はメッセージ」という抽象で捉えると、
  bus 多重化ではなくメッセージに宛先（planId）を書き込む方が標準的な pub/sub パターン
- payload メタデータ = 「message broker における routing key」の同型表現

## 「planId 未設定なら受け入れる」逆説的後方互換ロジック

### 逆説思考の適用

- **通常発想**: フィルタを厳しくして「planId 一致時のみ受け入れる」
- **逆説発想**: フィルタを緩くして「planId 未設定時も受け入れる」
- 逆説発想を採用することで、Main 送信側の planId 付与がまだ完了していない段階でも
  Renderer 側のフィルタ実装を先行導入できる（段階的ロールアウトが可能）

### 素人思考の適用

- 素人の感覚: 「planId が分からない通知」を弾くのは不自然。分からないならとりあえず受け取る
- 「知らないものは弾く」よりも「知らないものは通す」の方が素人には説明しやすい
- これは UX 的にも自然: 既存ユーザーにとって何も変わらない挙動を保証する

### フィルタ条件の妥当性

```
スキップ条件:
  options.planId !== undefined           // 呼出側が planId を指定している
  && progress.planId !== undefined       // 受信 payload にも planId が付いている
  && progress.planId !== options.planId  // 値が不一致
```

この 3 条件 AND の真理値表:

| `options.planId` | `progress.planId` | 一致   | 判定     | 理由                                  |
| ---------------- | ----------------- | ------ | -------- | ------------------------------------- |
| undefined        | undefined         | N/A    | 受け入れ | 既存挙動維持                          |
| undefined        | 定義済            | N/A    | 受け入れ | 呼出側がフィルタ意図なし              |
| 定義済           | undefined         | N/A    | 受け入れ | Main 送信側の planId 付与前段階を許容 |
| 定義済           | 定義済            | 一致   | 受け入れ | 正常                                  |
| 定義済           | 定義済            | 不一致 | スキップ | 混線防止                              |

5 パターン中 4 パターンが「受け入れ」、1 パターンのみ「スキップ」。
これは「保守的に既存挙動を維持する」設計哲学の具現化。

## elegance 判定

### エレガントな点

1. **最小差分**: 4 ファイル × 数行の変更で完結（型 2 行、関数 4 行、Hook 5 行、テスト 4 シナリオ）
2. **既存テスト無破壊**: 既存約 40 シナリオを 1 行も変更せず PASS 維持（AC-8）
3. **段階的ロールアウト可能**: Main 送信側と Renderer 受信側の実装を独立デプロイできる
4. **将来拡張余地**: planId 必須化への移行パス（型を required にするだけ）が残る

### elegance を損なう可能性（MINOR）

- `options?.planId` の `useEffect` 依存配列追加により listener 再登録が発生
  → 「古い planId リスナーのクリーンアップ → 新 planId リスナー登録」が意図通りの挙動のため許容
- `requestId?: string` の用途が現状仕様では未使用（将来の UI インタラクション識別用の placeholder）
  → 将来拡張のため残置する方針

## 結論

- payload メタデータ戦略は **elegance 高**、チャンネル多重化は **elegance 低**
- 逆説思考・素人思考を適用した「planId 未設定なら受け入れる」ロジックは妥当
- Phase 4 以降の実装・テスト設計に進んで良い

## 参照資料

- [phase-2-design.md](../../phase-2-design.md)
- [phase-3-design-review.md](../../phase-3-design-review.md)
- `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md` §5.1, §5.3
