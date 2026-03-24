# 実装ガイド: UiState 8 値拡張

## Part 1: 概念説明（中学生レベル）

### UiState って何？

アプリの「今の状態」を表す名札のようなものです。

**お店の例えで考えてみましょう：**

お店には8つの状態があります：

1. **ready（準備完了）** - お店が開いていて、すぐ買い物できる
2. **blocked（ブロック）** - 会員証が必要で、受付で止められている
3. **unavailable（利用不可）** - お店がお休みで、何もできない
4. **streaming（配信中）** - 注文した料理が今まさに運ばれてきている途中
5. **handoff（引き渡し）** - このお店では売ってないけど、隣のお店（ターミナル）で買える
6. **terminal-only（ターミナル専用）** - 隣のお店でしか買えない商品
7. **guidance-only（案内のみ）** - 買い方の説明だけもらえる状態
8. **degraded（品質低下）** - お店は開いてるけど、一部の商品しかない

### CTA（ボタン）は何が変わるの？

お店の状態によって、お客さんに見せるボタンが変わります：

- **ready** → 「買う」ボタンを表示
- **streaming** → 「停止」ボタンを表示（料理を止められる）
- **unavailable** → ボタンを消して「セットアップガイド」リンクだけ表示

## Part 2: 開発者向け実装詳細

### アーキテクチャ

```
ExecutionCapabilityInput → resolveCapability() → AccessCapability (4値)
                                                        ↓
CapabilityContext ──────→ resolveUiState()    → UiState (8値) + UiStateResult
                                                        ↓
CtaInput ───────────────→ resolveCtaContract() → CtaContract (primary + secondary)
```

3つの Concern (A/B/C) が pure function のパイプラインで構成されています。

### Concern B: resolveUiState() の P1-P8 優先順位

```typescript
// 評価順序（先に一致したものが勝つ）
P1: isStreaming === true           → "streaming"
P2: isHandoffRequired + terminal系 → "handoff"
P3: terminalSurface のみ          → "terminal-only" / "unavailable"
P4: isDegraded + capability有り   → "degraded"
P5: integratedRuntime / both      → "ready"
P6: hasAlternativeGuidance        → "guidance-only"
P7: hasResolutionAction           → "blocked"
P8: デフォルト                     → "unavailable"
```

### Concern C: resolveCtaContract() の新 5 状態

| uiState       | primary CTA                          | secondary CTA                             |
| ------------- | ------------------------------------ | ----------------------------------------- |
| streaming     | 停止 / stopStreaming                 | 最新へ移動 / scrollToLatest               |
| handoff       | terminal を開く / openTerminal       | コマンドをコピー / copyCommandToClipboard |
| terminal-only | terminal を開く / openTerminal       | コマンドをコピー / copyCommandToClipboard |
| guidance-only | 設定を見る / openSettings            | ヘルプを表示 / openHelp                   |
| degraded      | manual fallback / openManualFallback | ヘルプを表示 / openHelp                   |

### Guard 関数

| 関数                        | 条件                           | 動作  |
| --------------------------- | ------------------------------ | ----- |
| assertStreamingCtaContract  | streaming + primary !== "停止" | throw |
| assertHandoffGuidanceExists | handoff + !handoffGuidance     | throw |

### 後方互換性

- `resolveUiState` の overload 2 は変更なし（3 値のみ返す）
- `resolveCtaContract` の CtaInput オブジェクト形式は変更なし
- 新フィールドは全て optional（デフォルト false）
- UiState union 拡張は既存コードに assignable
