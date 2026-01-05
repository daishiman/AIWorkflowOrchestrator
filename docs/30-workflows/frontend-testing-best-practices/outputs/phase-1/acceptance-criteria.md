# 受け入れ基準 - フロントエンドテストベストプラクティス

## AC-1: MSW導入

### AC-1.1: MSWインストール

- Given: プロジェクトにMSWがインストールされていない
- When: `pnpm --filter @repo/desktop add -D msw` を実行
- Then: MSWパッケージがdevDependenciesに追加される

### AC-1.2: Supabase Auth APIモック

- Given: MSWサーバーが起動している
- When: テストがSupabase Auth APIを呼び出す
- Then: モックレスポンスが返却される（実際のAPIは呼ばれない）

### AC-1.3: Anthropic APIモック

- Given: MSWサーバーが起動している
- When: テストがAnthropic Messages APIを呼び出す
- Then: モックレスポンスが返却される

### AC-1.4: テスト実行速度

- Given: MSW環境でテストを実行
- When: `pnpm test:run` を実行
- Then: テスト実行時間が10秒以下

---

## AC-2: Vitest UI導入

### AC-2.1: UIパッケージインストール

- Given: @vitest/uiがインストールされていない
- When: `pnpm add -D @vitest/ui` を実行
- Then: パッケージがdevDependenciesに追加される

### AC-2.2: UI起動

- Given: Vitest UIがインストールされている
- When: `pnpm test:ui` を実行
- Then: ブラウザでVitest UIが起動する

### AC-2.3: カバレッジマップ表示

- Given: Vitest UIが起動している
- When: カバレッジタブを開く
- Then: ファイルごとのカバレッジマップが表示される

---

## AC-3: E2Eテスト拡充

### AC-3.1: E2Eテスト数

- Given: 現在7本のE2Eテストがある
- When: 新規E2Eテストを追加
- Then: 合計10本以上のE2Eテストが存在する

### AC-3.2: ローカル実行

- Given: すべてのE2Eテストが実装されている
- When: `pnpm --filter @repo/desktop test:e2e` を実行
- Then: すべてのテストが成功する

### AC-3.3: 安定性

- Given: E2Eテストを3回連続実行
- When: 各実行結果を確認
- Then: すべての実行で同じ結果（flaky test 0%）

---

## AC-4: カバレッジ閾値設定

### AC-4.1: desktop閾値

- Given: vitest.config.tsにthresholdsが設定されている
- When: `pnpm test:coverage` を実行
- Then: 行80%, 関数80%, 分岐60%の閾値がチェックされる

### AC-4.2: shared閾値

- Given: shared/vitest.config.tsにthresholdsが設定されている
- When: `pnpm test:coverage` を実行
- Then: 行80%, 関数80%, 分岐60%の閾値がチェックされる

### AC-4.3: 閾値未達

- Given: カバレッジが閾値未満
- When: `pnpm test:coverage` を実行
- Then: テストが失敗ステータスで終了する

---

## AC-5: テストユーティリティ

### AC-5.1: renderWithRouter

- Given: テストでRouter込みのレンダリングが必要
- When: `renderWithRouter(<Component />)` を呼び出す
- Then: BrowserRouter内でコンポーネントがレンダリングされる

### AC-5.2: mockStore

- Given: Zustandストアのモックが必要
- When: `mockStore(useStore, { key: 'value' })` を呼び出す
- Then: ストアの状態が指定した値に設定される

### AC-5.3: ファクトリー

- Given: テストデータが必要
- When: `createMockChatSession()` を呼び出す
- Then: デフォルト値を持つChatSessionオブジェクトが返却される

---

## AC-6: カバレッジ80%達成

### AC-6.1: desktopカバレッジ

- Given: すべてのテストが実装されている
- When: `pnpm --filter @repo/desktop test:coverage` を実行
- Then: 行カバレッジが80%以上

### AC-6.2: sharedカバレッジ

- Given: すべてのテストが実装されている
- When: `pnpm --filter @repo/shared test:coverage` を実行
- Then: 行カバレッジが80%以上
