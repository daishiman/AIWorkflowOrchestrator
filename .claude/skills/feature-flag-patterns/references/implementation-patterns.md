# 実装パターン

## クライアント実装

### React Hook

```typescript
function useFeatureFlag(flagName: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = flagService.subscribe(flagName, setIsEnabled);
    return unsubscribe;
  }, [flagName]);

  return isEnabled;
}

// 使用例
function MyComponent() {
  const showNewUI = useFeatureFlag("new-ui");
  return showNewUI ? <NewUI /> : <OldUI />;
}
```

### HOC パターン

```typescript
function withFeatureFlag<P>(
  Component: React.ComponentType<P>,
  flagName: string,
  FallbackComponent?: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    const isEnabled = useFeatureFlag(flagName);
    if (isEnabled) return <Component {...props} />;
    if (FallbackComponent) return <FallbackComponent {...props} />;
    return null;
  };
}
```

## サーバー実装

### Middleware パターン

```typescript
function featureFlagMiddleware(flagName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const isEnabled = await flagService.isEnabled(flagName, {
      userId: req.user?.id,
      sessionId: req.sessionId,
    });

    req.featureFlags = req.featureFlags || {};
    req.featureFlags[flagName] = isEnabled;

    next();
  };
}
```

### Decorator パターン

```typescript
function FeatureFlag(flagName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const isEnabled = await flagService.isEnabled(flagName);
      if (!isEnabled) {
        throw new FeatureDisabledError(flagName);
      }
      return originalMethod.apply(this, args);
    };
  };
}

// 使用例
class PaymentService {
  @FeatureFlag("new-payment")
  async processPayment(order: Order) {
    // 新しい決済処理
  }
}
```

## テストパターン

### フラグのモック

```typescript
describe("MyComponent", () => {
  it("shows new UI when flag is enabled", () => {
    jest.spyOn(flagService, "isEnabled").mockReturnValue(true);

    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId("new-ui")).toBeInTheDocument();
  });

  it("shows old UI when flag is disabled", () => {
    jest.spyOn(flagService, "isEnabled").mockReturnValue(false);

    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId("old-ui")).toBeInTheDocument();
  });
});
```
