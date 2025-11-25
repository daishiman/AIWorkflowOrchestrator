# Chain of Responsibility Pattern（責任の連鎖パターン）

## 概要

Chain of Responsibilityパターンは、リクエストの送信者と受信者を疎結合にし、
複数のオブジェクトにリクエストを処理する機会を与える。
リクエストを受け取ったオブジェクトは、自分で処理するか、次のオブジェクトに渡す。

## パターン構造

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                     Handler Chain                        │
│                                                          │
│ ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│ │ Handler1 │────▶│ Handler2 │────▶│ Handler3 │──▶ null  │
│ └──────────┘     └──────────┘     └──────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 構成要素

### 1. Handler（ハンドラインターフェース）

リクエスト処理の共通インターフェースを定義。

```
Handler:
  - successor: Handler | null

  + setSuccessor(handler: Handler): void
  + handle(request: Request): Response | null
```

### 2. ConcreteHandler（具体ハンドラ）

特定のリクエストを処理する具体的な実装。

**責務**:
- 自分が処理できるリクエストを判定
- 処理できる場合は処理を実行
- 処理できない場合は次のハンドラに委譲

### 3. Client（クライアント）

チェーンの最初のハンドラにリクエストを送信。

## 処理フロー

```
リクエスト受信
    │
    ▼
Handler1: 処理できる？
    │
    ├─ Yes → 処理して結果を返す
    │
    └─ No
        │
        ▼
    Handler2: 処理できる？
        │
        ├─ Yes → 処理して結果を返す
        │
        └─ No
            │
            ▼
        Handler3: 処理できる？
            │
            ├─ Yes → 処理して結果を返す
            │
            └─ No → null（未処理）または例外
```

## ワークフローエンジンへの適用

### バリデーションチェーン

```
ValidationChain:
  - handlers: ValidationHandler[]

  validate(input: unknown): ValidationResult
    for handler in handlers:
      result = handler.validate(input)
      if not result.valid:
        return result
    return { valid: true }
```

### ミドルウェアパイプライン

```
MiddlewarePipeline:
  - middlewares: Middleware[]

  process(request: Request, context: Context): Response
    for middleware in middlewares:
      result = middleware.process(request, context)
      if result.shouldStop:
        return result.response
      request = result.transformedRequest
    return executeCore(request, context)
```

### エラーハンドリングチェーン

```
ErrorHandlerChain:
  - handlers: ErrorHandler[]

  handle(error: Error, context: ExecutionContext): ErrorResponse
    for handler in handlers:
      if handler.canHandle(error):
        return handler.handle(error, context)
    return defaultErrorResponse(error)
```

## 実装バリエーション

### 1. Pure Chain（純粋な連鎖）

処理できるハンドラが見つかったら終了。

```
handle(request):
  if canHandle(request):
    return doHandle(request)
  else if successor:
    return successor.handle(request)
  else:
    return null
```

### 2. Processing Pipeline（処理パイプライン）

すべてのハンドラが順番に処理。

```
handle(request):
  result = doHandle(request)
  if successor:
    return successor.handle(result)
  else:
    return result
```

### 3. Filtering Chain（フィルタリングチェーン）

条件に合うハンドラのみが処理。

```
handle(request):
  if shouldProcess(request):
    doHandle(request)
  if successor:
    successor.handle(request)
```

## 利点

- **疎結合**: 送信者と受信者の分離
- **柔軟性**: チェーンの順序を動的に変更可能
- **単一責任**: 各ハンドラは特定の処理に特化
- **拡張性**: 新しいハンドラの追加が容易

## 欠点

- **保証なし**: リクエストが処理される保証がない
- **デバッグ困難**: チェーンが長いとデバッグが複雑
- **パフォーマンス**: チェーンが長いと処理時間が増加

## 検証チェックリスト

- [ ] 各ハンドラは単一の責任を持つか？
- [ ] チェーンの順序は論理的か？
- [ ] 未処理のリクエストに対する対応は定義されているか？
- [ ] チェーンの終端は明確か？
- [ ] パフォーマンスへの影響は許容範囲か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Composite | ハンドラの階層構造 |
| Decorator | 処理の追加 |
| Command | リクエストのカプセル化 |
