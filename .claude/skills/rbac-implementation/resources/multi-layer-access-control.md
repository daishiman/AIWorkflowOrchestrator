# 多層アクセス制御の設計

## 3層防御アーキテクチャ

### Layer 1: ミドルウェア（ネットワーク層）

**目的**: 早期認証チェックとルートレベル権限検証

**処理内容**:
- 認証状態の確認（セッションの有無）
- ルートベースの基本権限チェック
- 未認証ユーザーのリダイレクト

**メリット**:
- リクエスト処理の早期段階で不正アクセスを遮断
- パフォーマンス最適化（不要な処理をスキップ）

### Layer 2: APIルート/ページルート（アプリケーション層）

**目的**: エンドポイント固有の詳細権限検証

**処理内容**:
- 操作固有の権限チェック（create、update、delete等）
- リソース所有権の事前確認
- ビジネスロジックレベルの権限判定

**メリット**:
- 細粒度のアクセス制御
- エンドポイントごとのカスタマイズ可能

### Layer 3: データ層（データベース層）

**目的**: リソースレベルの所有権検証

**処理内容**:
- データ取得時の所有者確認
- Row-Level Security（RLS）適用
- データレベルのフィルタリング

**メリット**:
- データ漏洩の最終防衛線
- SQLインジェクション対策

## 実装例

### Layer 1: ミドルウェア
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 認証チェック
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 管理者ルート保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}
```

### Layer 2: APIルート
```typescript
// app/api/workflows/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  // 権限チェック
  if (!hasPermission(session, 'workflow:delete')) {
    return new Response('Forbidden', { status: 403 });
  }

  // 所有権事前確認
  const workflow = await getWorkflow(params.id);
  if (workflow.userId !== session.userId && session.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }

  await deleteWorkflow(params.id);
  return new Response('OK', { status: 200 });
}
```

### Layer 3: データ層
```typescript
// repositories/workflow-repository.ts
export async function getWorkflow(
  workflowId: string,
  userId: string
): Promise<Workflow | null> {
  return await db.workflows.findFirst({
    where: {
      id: workflowId,
      // 所有者またはパブリックのみ
      OR: [
        { userId: userId },
        { isPublic: true },
      ],
    },
  });
}
```

## Defense in Depth（多層防御）の利点

1. **冗長性**: 1層が破られても他の層で保護
2. **特化**: 各層が最適な防御を提供
3. **監査**: 各層でログ記録、異常検出
4. **柔軟性**: 層ごとに異なるポリシー適用可能

## まとめ

多層アクセス制御は、セキュリティの基本原則である「Defense in Depth」を実現します。
各層が異なる視点で権限を検証することで、堅牢なアクセス制御を構築できます。
