# テスト改善タスク仕様書

## タスク概要

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスク名   | login-only-auth テスト品質強化                            |
| 対象機能   | 認証画面（AuthView/AuthGuard/AccountSection）のテスト拡充 |
| 優先度     | 中                                                        |
| 見積もり   | 小規模                                                    |
| ステータス | 未実施                                                    |

## 背景と目的

Phase 5.5 Final Review Gate において、`.claude/agents/frontend-tester.md` エージェントによるテスト品質レビューで以下の改善点が指摘された：

1. **状態遷移テストの不足**
2. **キーボードナビゲーションテストの不足**
3. **ARIA live region テストの不足**
4. **エッジケーステストの不足**

これらのテストを追加し、テストカバレッジと品質を向上させる。

## 実施方針

### フェーズ構成

```
Phase 1: 要件定義・テスト設計
Phase 2: 状態遷移テスト追加
Phase 3: キーボードナビゲーションテスト追加
Phase 4: ARIA/アクセシビリティテスト追加
Phase 5: エッジケーステスト追加
Phase 6: カバレッジ検証
```

## Phase 1: 要件定義・テスト設計

### 1.1 状態遷移テスト要件

#### 機能要件

| ID         | 要件                                                     | 優先度 |
| ---------- | -------------------------------------------------------- | ------ |
| TEST-ST-01 | checking → authenticated 遷移テスト                      | 必須   |
| TEST-ST-02 | checking → unauthenticated 遷移テスト                    | 必須   |
| TEST-ST-03 | authenticated → unauthenticated 遷移テスト（ログアウト） | 必須   |
| TEST-ST-04 | unauthenticated → authenticated 遷移テスト（ログイン）   | 必須   |
| TEST-ST-05 | 高速な状態変更時の挙動テスト                             | 推奨   |

#### テスト設計

```typescript
// apps/desktop/src/renderer/components/AuthGuard/AuthGuard.state-transitions.test.tsx

describe("AuthGuard State Transitions", () => {
  describe("checking → authenticated", () => {
    it("should transition from loading to showing children", async () => {
      const { rerender } = render(
        <TestWrapper initialState={{ isLoading: true, isAuthenticated: false }}>
          <AuthGuard>
            <div data-testid="protected">Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      );

      // 初期状態: ローディング
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByTestId("protected")).not.toBeInTheDocument();

      // 状態変更: 認証完了
      act(() => {
        mockSetState({ isLoading: false, isAuthenticated: true });
      });

      // 遷移後: 子コンポーネント表示
      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByTestId("protected")).toBeInTheDocument();
      });
    });
  });

  describe("authenticated → unauthenticated (logout)", () => {
    it("should show AuthView when user logs out", async () => {
      const { rerender } = render(
        <TestWrapper initialState={{ isLoading: false, isAuthenticated: true }}>
          <AuthGuard>
            <div data-testid="protected">Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      );

      // 初期状態: 認証済み
      expect(screen.getByTestId("protected")).toBeInTheDocument();

      // 状態変更: ログアウト
      act(() => {
        mockSetState({ isAuthenticated: false });
      });

      // 遷移後: ログイン画面
      await waitFor(() => {
        expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
        expect(screen.getByRole("region", { name: "アカウント設定" })).toBeInTheDocument();
      });
    });
  });

  describe("rapid state changes", () => {
    it("should handle rapid state changes without race conditions", async () => {
      // 高速な状態変更をシミュレート
      const states = [
        { isLoading: true, isAuthenticated: false },
        { isLoading: false, isAuthenticated: true },
        { isLoading: true, isAuthenticated: false },
        { isLoading: false, isAuthenticated: false },
      ];

      // 各状態変更後の表示が正しいことを確認
      // ...
    });
  });
});
```

### 1.2 キーボードナビゲーションテスト要件

#### 機能要件

| ID         | 要件                                     | 優先度 |
| ---------- | ---------------------------------------- | ------ |
| TEST-KB-01 | Tab キーによるフォーカス移動テスト       | 必須   |
| TEST-KB-02 | Enter キーによるボタン操作テスト         | 必須   |
| TEST-KB-03 | Escape キーによるキャンセル操作テスト    | 推奨   |
| TEST-KB-04 | フォーカストラップのテスト（モーダル時） | 推奨   |

#### テスト設計

```typescript
// apps/desktop/src/renderer/views/AuthView/AuthView.keyboard.test.tsx

describe("AuthView Keyboard Navigation", () => {
  describe("Tab navigation", () => {
    it("should navigate through OAuth buttons with Tab", async () => {
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /Google/ });
      const githubButton = screen.getByRole("button", { name: /GitHub/ });
      const discordButton = screen.getByRole("button", { name: /Discord/ });

      // 最初のボタンにフォーカス
      googleButton.focus();
      expect(document.activeElement).toBe(googleButton);

      // Tab で次へ
      await userEvent.tab();
      expect(document.activeElement).toBe(githubButton);

      // Tab で次へ
      await userEvent.tab();
      expect(document.activeElement).toBe(discordButton);
    });

    it("should have correct tab order", async () => {
      render(<AuthView />);

      const buttons = screen.getAllByRole("button");
      const tabOrder = buttons.map((btn) => btn.getAttribute("tabindex") ?? "0");

      // tabindex が正しい順序であることを確認
      expect(tabOrder.every((idx) => idx === "0" || idx === null)).toBe(true);
    });
  });

  describe("Enter key activation", () => {
    it("should trigger login when Enter pressed on OAuth button", async () => {
      const mockLogin = vi.fn();
      mockUseAppStore.mockReturnValue({ login: mockLogin });

      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /Google/ });
      googleButton.focus();

      await userEvent.keyboard("{Enter}");

      expect(mockLogin).toHaveBeenCalledWith("google");
    });
  });
});
```

### 1.3 ARIA/アクセシビリティテスト要件

#### 機能要件

| ID           | 要件                                  | 優先度 |
| ------------ | ------------------------------------- | ------ |
| TEST-A11Y-01 | aria-live region の通知テスト         | 必須   |
| TEST-A11Y-02 | role 属性の正確性テスト               | 必須   |
| TEST-A11Y-03 | aria-label の適切性テスト             | 必須   |
| TEST-A11Y-04 | スクリーンリーダー用の sr-only テスト | 推奨   |

#### テスト設計

```typescript
// apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.a11y.test.tsx

describe("AccountSection Accessibility", () => {
  describe("ARIA live regions", () => {
    it("should announce auth success via live region", async () => {
      const { rerender } = render(
        <TestWrapper initialState={{ isAuthenticated: false }}>
          <AccountSection />
        </TestWrapper>
      );

      // ログイン成功をシミュレート
      act(() => {
        mockSetState({
          isAuthenticated: true,
          authUser: mockAuthUser,
        });
      });

      // aria-live region で通知されることを確認
      await waitFor(() => {
        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toHaveTextContent(/ログインしました/);
      });
    });

    it("should announce errors via assertive live region", async () => {
      render(
        <TestWrapper initialState={{ authError: "認証に失敗しました" }}>
          <AccountSection />
        </TestWrapper>
      );

      const errorRegion = screen.getByRole("alert");
      expect(errorRegion).toHaveAttribute("aria-live", "assertive");
      expect(errorRegion).toHaveTextContent("認証に失敗しました");
    });
  });

  describe("Role attributes", () => {
    it("should have correct region role with label", () => {
      render(<AccountSection />);

      const section = screen.getByRole("region", { name: "アカウント設定" });
      expect(section).toBeInTheDocument();
    });
  });

  describe("Screen reader support", () => {
    it("should have sr-only text for loading state", () => {
      render(
        <TestWrapper initialState={{ isLoading: true }}>
          <AccountSection />
        </TestWrapper>
      );

      const srOnlyText = screen.getByText("読み込み中");
      expect(srOnlyText).toHaveClass("sr-only");
    });
  });
});
```

### 1.4 エッジケーステスト要件

#### 機能要件

| ID           | 要件                               | 優先度 |
| ------------ | ---------------------------------- | ------ |
| TEST-EDGE-01 | 長い表示名のトランケーションテスト | 必須   |
| TEST-EDGE-02 | アバター画像読み込み失敗テスト     | 必須   |
| TEST-EDGE-03 | ネットワークエラー時の表示テスト   | 必須   |
| TEST-EDGE-04 | 空のプロバイダーリストテスト       | 推奨   |
| TEST-EDGE-05 | セッションタイムアウトテスト       | 推奨   |

#### テスト設計

```typescript
// apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.edge-cases.test.tsx

describe("AccountSection Edge Cases", () => {
  describe("Long display name", () => {
    it("should truncate very long display names", () => {
      const longName = "A".repeat(100);
      render(
        <TestWrapper
          initialState={{
            isAuthenticated: true,
            profile: { displayName: longName },
          }}
        >
          <AccountSection />
        </TestWrapper>
      );

      const nameElement = screen.getByText(longName);
      expect(nameElement).toHaveClass("truncate");
      // 視覚的にトランケーションされていることを確認
    });
  });

  describe("Avatar image error", () => {
    it("should show fallback icon when avatar fails to load", async () => {
      render(
        <TestWrapper
          initialState={{
            isAuthenticated: true,
            profile: { avatarUrl: "invalid-url" },
          }}
        >
          <AccountSection />
        </TestWrapper>
      );

      const img = screen.getByRole("img", { name: /avatar/ });
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      });
    });
  });

  describe("Network errors", () => {
    it("should display offline indicator when network is unavailable", () => {
      render(
        <TestWrapper initialState={{ isOffline: true }}>
          <AccountSection />
        </TestWrapper>
      );

      expect(screen.getByText("オフライン")).toBeInTheDocument();
    });
  });

  describe("Empty provider list", () => {
    it("should handle empty linked providers gracefully", () => {
      render(
        <TestWrapper
          initialState={{
            isAuthenticated: true,
            linkedProviders: [],
          }}
        >
          <AccountSection />
        </TestWrapper>
      );

      // 全てのプロバイダーが「連携する」状態で表示される
      expect(screen.getAllByText("連携する")).toHaveLength(3);
    });
  });
});
```

## Phase 2: 状態遷移テスト追加

### 2.1 ファイル構成

```
apps/desktop/src/renderer/components/AuthGuard/
├── AuthGuard.test.tsx              # 既存の基本テスト
├── AuthGuard.state-transitions.test.tsx  # 新規追加
└── ...
```

### 2.2 実装手順

1. テストファイルを作成
2. 状態遷移テストケースを実装
3. race condition テストを追加
4. テスト実行・確認

### 2.3 テストケース一覧

| テストID | シナリオ                        | 期待結果             |
| -------- | ------------------------------- | -------------------- |
| ST-01    | checking → authenticated        | children 表示        |
| ST-02    | checking → unauthenticated      | AuthView 表示        |
| ST-03    | authenticated → unauthenticated | AuthView 表示        |
| ST-04    | unauthenticated → authenticated | children 表示        |
| ST-05    | 高速状態変更                    | 最終状態が正しく反映 |

## Phase 3: キーボードナビゲーションテスト追加

### 3.1 ファイル構成

```
apps/desktop/src/renderer/views/AuthView/
├── AuthView.test.tsx              # 既存の基本テスト
├── AuthView.keyboard.test.tsx     # 新規追加
└── ...
```

### 3.2 実装手順

1. `@testing-library/user-event` を使用
2. Tab ナビゲーションテストを追加
3. Enter/Space キー操作テストを追加
4. フォーカス管理テストを追加

### 3.3 テストケース一覧

| テストID | シナリオ               | 期待結果           |
| -------- | ---------------------- | ------------------ |
| KB-01    | Tab でフォーカス移動   | 正しい順序で移動   |
| KB-02    | Shift+Tab で逆方向移動 | 正しい逆順で移動   |
| KB-03    | Enter でボタン操作     | ハンドラー呼び出し |
| KB-04    | Space でボタン操作     | ハンドラー呼び出し |

## Phase 4: ARIA/アクセシビリティテスト追加

### 4.1 ファイル構成

```
apps/desktop/src/renderer/components/organisms/AccountSection/
├── AccountSection.test.tsx        # 既存の基本テスト
├── AccountSection.a11y.test.tsx   # 新規追加
└── ...
```

### 4.2 実装手順

1. ARIA 属性の検証テストを追加
2. live region テストを追加
3. スクリーンリーダー対応テストを追加
4. axe-core によるアクセシビリティ監査を追加（オプション）

### 4.3 テストケース一覧

| テストID | シナリオ             | 期待結果                     |
| -------- | -------------------- | ---------------------------- |
| A11Y-01  | 成功メッセージ通知   | aria-live で通知             |
| A11Y-02  | エラーメッセージ通知 | role="alert" で通知          |
| A11Y-03  | region ラベル        | 適切な aria-label            |
| A11Y-04  | sr-only テキスト     | 視覚的に非表示、読み上げ可能 |

## Phase 5: エッジケーステスト追加

### 5.1 ファイル構成

```
apps/desktop/src/renderer/components/organisms/AccountSection/
├── AccountSection.test.tsx           # 既存の基本テスト
├── AccountSection.edge-cases.test.tsx # 新規追加
└── ...
```

### 5.2 実装手順

1. 長いテキストのテストを追加
2. 画像エラーハンドリングテストを追加
3. ネットワークエラーテストを追加
4. 空データテストを追加

### 5.3 テストケース一覧

| テストID | シナリオ               | 期待結果                     |
| -------- | ---------------------- | ---------------------------- |
| EDGE-01  | 100文字の表示名        | truncate クラス適用          |
| EDGE-02  | 無効なアバターURL      | フォールバックアイコン表示   |
| EDGE-03  | オフライン状態         | オフラインインジケーター表示 |
| EDGE-04  | 空のプロバイダーリスト | 全て「連携する」表示         |

## Phase 6: カバレッジ検証

### 6.1 検証項目

| 項目           | 目標カバレッジ | 検証コマンド                                |
| -------------- | -------------- | ------------------------------------------- |
| AuthGuard      | 90%+           | `pnpm --filter @repo/desktop test:coverage` |
| AuthView       | 90%+           | 同上                                        |
| AccountSection | 85%+           | 同上                                        |

### 6.2 カバレッジレポート確認

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# カバレッジレポート確認
open coverage/lcov-report/index.html
```

## 完了条件

- [ ] 状態遷移テストが全て通過している
- [ ] キーボードナビゲーションテストが全て通過している
- [ ] ARIA/アクセシビリティテストが全て通過している
- [ ] エッジケーステストが全て通過している
- [ ] 各コンポーネントのカバレッジが目標値を達成している
- [ ] `.claude/agents/frontend-tester.md` レビューで PASS 評価

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/design-auth-guard.md`
- `docs/30-workflows/login-only-auth/design-auth-view.md`
- `apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx`
- `apps/desktop/src/renderer/views/AuthView/AuthView.test.tsx`
