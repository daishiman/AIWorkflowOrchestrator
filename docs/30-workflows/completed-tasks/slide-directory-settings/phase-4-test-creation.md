# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 前提Phase  | Phase 3                  |
| 後続Phase  | Phase 5                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

TDDのRed段階として、失敗するテストを先に作成する。設定管理サービス、IPC通信、UIコンポーネントの各レイヤーに対するユニットテストと統合テストを作成する。

## 背景

TDD（テスト駆動開発）の原則に従い、実装前にテストを作成する。これにより、要件を満たす実装の指針が明確になり、リグレッションを防止できる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 設定管理サービスのユニットテスト作成

**目的**: electron-storeを使用した設定管理サービスのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/settings/__tests__/slideSettingsStore.test.ts`

2. 以下のテストケースを作成:

```typescript
describe("SlideSettingsStore", () => {
  describe("getSettings", () => {
    it("デフォルト設定を返す（初回起動時）");
    it("保存された設定を返す");
    it("破損時はデフォルト値にフォールバックする");
  });

  describe("setDirectory", () => {
    it("有効なディレクトリパスを保存する");
    it("無効なパスでエラーを返す");
    it("パストラバーサル攻撃を拒否する");
  });

  describe("validateDirectory", () => {
    it("存在するディレクトリは有効と判定");
    it("存在しないディレクトリは警告を返す");
    it("書き込み権限がないディレクトリはエラー");
    it("相対パス（../）を拒否する");
  });

  describe("migration", () => {
    it("古いschemaVersionから自動マイグレーション");
  });
});
```

3. モック設定:
   - `electron-store` をモック化
   - `fs` モジュールをモック化（ディレクトリ存在確認用）
   - `path` モジュールは実際の実装を使用

**期待される成果物**:

- `apps/desktop/src/main/settings/__tests__/slideSettingsStore.test.ts`

---

### タスク2: IPC通信のテスト作成

**目的**: Main-Renderer間のIPC通信のテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.test.ts`

2. 以下のテストケースを作成:

```typescript
describe("SlideSettingsHandlers", () => {
  describe("slideSettings:getDirectory", () => {
    it("現在のディレクトリパスを返す");
    it("Result<string>形式で返す");
  });

  describe("slideSettings:setDirectory", () => {
    it("有効なパスで設定を更新する");
    it("無効なパスでエラーを返す");
    it("sender検証に失敗するとエラー");
  });

  describe("slideSettings:selectDirectory", () => {
    it("ダイアログで選択されたパスを返す");
    it("キャンセル時はnullを返す");
  });

  describe("slideSettings:validateDirectory", () => {
    it("存在するディレクトリでvalid=trueを返す");
    it("存在しないディレクトリでwarning付きを返す");
    it("パストラバーサルでinvalidを返す");
  });

  describe("slideSettings:getAllSettings", () => {
    it("全設定をSlideSettings型で返す");
  });
});
```

3. モック設定:
   - `dialog.showOpenDialog` をモック化
   - `validateIpcSender` をモック化
   - `SlideSettingsStore` をモック化

**期待される成果物**:

- `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.test.ts`

---

### タスク3: UIコンポーネントのテスト作成

**目的**: React UIコンポーネントのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/SlideDirectorySettings.test.tsx`

2. 以下のテストケースを作成:

```typescript
describe("SlideDirectorySettings", () => {
  describe("初期表示", () => {
    it("現在のディレクトリパスを表示する");
    it("自動作成チェックボックスが表示される");
    it("選択ボタンが表示される");
  });

  describe("ディレクトリ選択", () => {
    it("選択ボタンクリックでダイアログが開く");
    it("選択後にパスが更新される");
    it("キャンセル時はパスが変更されない");
  });

  describe("バリデーション", () => {
    it("無効なパスでエラーメッセージを表示");
    it("存在しないパスで警告メッセージを表示");
    it("有効なパスでエラーがクリアされる");
  });

  describe("保存", () => {
    it("保存ボタンで設定が永続化される");
    it("保存成功でフィードバックを表示");
    it("保存失敗でエラーを表示");
  });
});
```

3. テスト用ユーティリティ:
   - `@testing-library/react` を使用
   - `slideSettingsAPI` をモック化
   - `renderWithProviders` ヘルパー関数を作成

**期待される成果物**:

- `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/SlideDirectorySettings.test.tsx`

---

### タスク4: カスタムフックのテスト作成

**目的**: useSlideSettingsフックのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/hooks/__tests__/useSlideSettings.test.ts`

2. 以下のテストケースを作成:

```typescript
describe("useSlideSettings", () => {
  describe("initialize", () => {
    it("初期化時に設定を読み込む");
    it("読み込みエラー時にエラー状態を設定");
    it("ローディング状態を管理する");
  });

  describe("setDirectory", () => {
    it("ディレクトリを設定する");
    it("バリデーションエラーを処理する");
    it("楽観的UI更新を行う");
  });

  describe("selectDirectory", () => {
    it("ダイアログを開いて結果を返す");
    it("キャンセル時は状態を変更しない");
  });

  describe("save", () => {
    it("設定を永続化する");
    it("保存成功でisModifiedをfalseに");
    it("保存失敗でエラーを返す");
  });
});
```

3. `@testing-library/react-hooks` を使用

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/__tests__/useSlideSettings.test.ts`

---

### タスク5: 統合テストシナリオの作成

**目的**: Main-Renderer間の統合テストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/__tests__/integration/slideSettings.integration.test.ts`

2. 以下のテストシナリオを作成:

```typescript
describe("SlideSettings Integration", () => {
  describe("設定読み込みフロー", () => {
    it("Renderer起動時にMain経由で設定を読み込む");
  });

  describe("ディレクトリ選択フロー", () => {
    it("選択→バリデーション→保存の一連のフロー");
  });

  describe("永続化フロー", () => {
    it("保存した設定がアプリ再起動後も維持される");
  });

  describe("エラーハンドリングフロー", () => {
    it("IPC失敗時にRendererでエラーを表示");
  });
});
```

**期待される成果物**:

- `apps/desktop/src/__tests__/integration/slideSettings.integration.test.ts`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                 |
| -------------------- | ---------------------------------------------------------------------------- | -------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ基準 |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPCテストパターン    |

### 関連ドキュメント

| 参照資料        | パス               | 内容                        |
| --------------- | ------------------ | --------------------------- |
| Phase 2設計     | `outputs/phase-2/` | IPC設計・コンポーネント設計 |
| Phase 3レビュー | `outputs/phase-3/` | レビュー結果                |

---

## 成果物

| 成果物       | パス                                                                               | 内容                   |
| ------------ | ---------------------------------------------------------------------------------- | ---------------------- |
| Store テスト | `apps/desktop/src/main/settings/__tests__/slideSettingsStore.test.ts`              | 設定管理サービステスト |
| IPC テスト   | `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.test.ts` | IPCハンドラーテスト    |
| UI テスト    | `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/`  | UIコンポーネントテスト |
| Hook テスト  | `apps/desktop/src/renderer/hooks/__tests__/useSlideSettings.test.ts`               | カスタムフックテスト   |
| 統合テスト   | `apps/desktop/src/__tests__/integration/slideSettings.integration.test.ts`         | 統合テスト             |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション**:

- Main-Renderer間通信の統合テストシナリオを作成
- IPC通信の正常系・異常系テストを網羅
- 永続化フローの統合テストを含める

---

## 完了条件

- [ ] 設定管理サービスのテストが作成されている
- [ ] IPCハンドラーのテストが作成されている
- [ ] UIコンポーネントのテストが作成されている
- [ ] カスタムフックのテストが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] **全てのテストが失敗状態（Red）**であることを確認
- [ ] 統合テスト連携アクションが完了している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-5-implementation.md`
