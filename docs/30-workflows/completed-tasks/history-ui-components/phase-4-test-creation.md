# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 4                     |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 使用スキル

| スキル                    | 選定理由                        |
| ------------------------- | ------------------------------- |
| `tdd-principles`          | TDD原則に基づくテスト設計       |
| `frontend-testing`        | Reactコンポーネントのテスト手法 |
| `test-naming-conventions` | 一貫したテスト命名規則の適用    |
| `boundary-value-analysis` | 境界値テストの設計              |

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略 |

## 実行手順

### ステップ1: テストシナリオ設計

`tdd-principles`スキルを参照し、受け入れ基準からテストシナリオを導出する。

### ステップ2: ユニットテスト作成

`frontend-testing`スキルを参照し、各コンポーネント・フックのユニットテストを作成する。

**テストファイル構成:**

```
apps/desktop/src/renderer/
├── components/history/__tests__/
│   ├── VersionHistory.test.tsx
│   ├── VersionDetail.test.tsx
│   ├── ConversionLogs.test.tsx
│   └── RestoreDialog.test.tsx
└── hooks/__tests__/
    ├── useVersionHistory.test.ts
    ├── useConversionLogs.test.ts
    ├── useVersionDetail.test.ts
    └── useRestore.test.ts
```

**VersionHistory テストケース:**

```typescript
describe("VersionHistory", () => {
  // FR-01: 履歴一覧表示
  describe("履歴一覧表示", () => {
    it("ファイルIDを指定して履歴一覧を表示する", async () => {
      // Given: ファイルID "file-123" が存在する
      // When: VersionHistoryコンポーネントにfileIdを渡す
      // Then: 履歴アイテムが時系列順（新しい順）で表示される
    });

    it("各アイテムにバージョン番号、作成日時、サイズが表示される", async () => {
      // Given: 履歴が存在する
      // When: 履歴一覧を表示する
      // Then: 各アイテムの情報が表示される
    });

    it("現在のバージョンに「現在」ラベルが表示される", async () => {
      // Given: ファイルに複数のバージョンがある
      // When: 履歴一覧を表示する
      // Then: 最新バージョンに「現在」ラベルが表示される
    });

    it("最新バージョンには復元ボタンが表示されない", async () => {
      // Given: 最新バージョンが表示されている
      // Then: 復元ボタンが表示されない
    });

    it("履歴が空の場合、メッセージを表示する", async () => {
      // Given: ファイルに履歴がない
      // When: 履歴一覧を表示する
      // Then: 「履歴がありません」メッセージが表示される
    });
  });

  // NFR-02: ローディング状態
  describe("ローディング状態", () => {
    it("読み込み中はローディングスピナーが表示される", async () => {
      // Given: データ取得中
      // Then: ローディングスピナーが表示される
    });
  });

  // NFR-03: エラー状態
  describe("エラー状態", () => {
    it("エラー時はエラーメッセージが表示される", async () => {
      // Given: API呼び出しがエラーを返す
      // Then: エラーメッセージが表示される
    });
  });

  // FR-06: ページネーション
  describe("ページネーション", () => {
    it("「さらに読み込む」ボタンで追加データを取得する", async () => {
      // Given: 履歴が20件以上ある
      // When: 「さらに読み込む」ボタンをクリック
      // Then: 次の20件が追加表示される
    });

    it("すべて読み込み済みの場合、ボタンは表示されない", async () => {
      // Given: すべての履歴を読み込んだ
      // Then: 「さらに読み込む」ボタンは非表示
    });
  });

  // NFR-01: アクセシビリティ
  describe("アクセシビリティ", () => {
    it("キーボードで履歴アイテムを選択できる", async () => {
      // Given: 履歴一覧にフォーカスがある
      // When: Enter/Spaceキーを押す
      // Then: アイテムが選択される
    });

    it("適切なaria-label属性が設定されている", async () => {
      // Then: 各要素にaria属性が設定されている
    });
  });
});
```

**ConversionLogs テストケース:**

```typescript
describe("ConversionLogs", () => {
  // FR-05: ログ表示
  describe("ログ一覧表示", () => {
    it("ログ一覧を時系列順で表示する", async () => {
      // Given: ファイルに変換ログがある
      // When: ConversionLogsコンポーネントにfileIdを渡す
      // Then: ログが新しい順で表示される
    });

    it("各ログにレベル、メッセージ、タイムスタンプが表示される", async () => {
      // Given: ログが存在する
      // Then: 各ログの情報が表示される
    });
  });

  // FR-05: フィルタリング
  describe("フィルタリング", () => {
    it("レベルでフィルタリングできる", async () => {
      // Given: ログ一覧が表示されている
      // When: フィルタを「Error」に設定
      // Then: errorレベルのログのみ表示される
    });

    it("「すべて」を選択すると全レベルが表示される", async () => {
      // Given: フィルタが「Error」に設定されている
      // When: 「すべて」を選択
      // Then: 全レベルのログが表示される
    });
  });

  // ログ詳細
  describe("ログ詳細", () => {
    it("詳細を展開できる", async () => {
      // Given: ログにdetailsがある
      // When: 「詳細を表示」をクリック
      // Then: detailsがJSON形式で表示される
    });
  });
});
```

**RestoreDialog テストケース:**

```typescript
describe("RestoreDialog", () => {
  // FR-03/FR-04: 復元操作
  describe("復元確認", () => {
    it("isOpen=trueの場合、ダイアログが表示される", () => {
      // Given: isOpen=true
      // Then: ダイアログが表示される
    });

    it("isOpen=falseの場合、何も表示されない", () => {
      // Given: isOpen=false
      // Then: nullがレンダリングされる
    });

    it("復元対象のバージョン情報が表示される", () => {
      // Given: version情報が渡されている
      // Then: バージョン番号と日時が表示される
    });
  });

  describe("復元実行", () => {
    it("「復元する」クリックでonConfirmが呼ばれる", async () => {
      // Given: ダイアログが表示されている
      // When: 「復元する」をクリック
      // Then: onConfirmが呼ばれる
    });

    it("復元中はボタンがdisabledになる", () => {
      // Given: isRestoring=true
      // Then: 復元ボタンがdisabled
    });

    it("復元中は「復元中...」と表示される", () => {
      // Given: isRestoring=true
      // Then: ボタンテキストが「復元中...」
    });
  });

  describe("キャンセル", () => {
    it("「キャンセル」クリックでonCancelが呼ばれる", async () => {
      // Given: ダイアログが表示されている
      // When: 「キャンセル」をクリック
      // Then: onCancelが呼ばれる
    });
  });
});
```

**useVersionHistory テストケース:**

```typescript
describe("useVersionHistory", () => {
  describe("初期読み込み", () => {
    it("初期状態でisLoading=trueを返す", () => {
      // Given: フック初期化
      // Then: isLoading=true
    });

    it("データ取得後にhistoryを返す", async () => {
      // Given: APIが成功レスポンスを返す
      // When: フック初期化
      // Then: history配列が設定される
    });

    it("エラー時にerrorを設定する", async () => {
      // Given: APIがエラーを返す
      // When: フック初期化
      // Then: errorが設定される
    });
  });

  describe("ページネーション", () => {
    it("loadMore()で追加データを取得する", async () => {
      // Given: hasMore=true
      // When: loadMore()を呼ぶ
      // Then: 追加データがhistoryに追加される
    });

    it("すべて読み込み後はhasMore=falseになる", async () => {
      // Given: 最後のページを読み込み済み
      // Then: hasMore=false
    });
  });

  describe("リフレッシュ", () => {
    it("refresh()でデータを再取得する", async () => {
      // Given: 初期データが読み込まれている
      // When: refresh()を呼ぶ
      // Then: データが最初から再取得される
    });
  });
});
```

### ステップ3: 境界値テスト

`boundary-value-analysis`スキルを参照し、エッジケースのテストを追加する。

```typescript
describe("境界値テスト", () => {
  describe("VersionHistory", () => {
    it("履歴が0件の場合", async () => {
      // 空配列のケース
    });

    it("履歴が1件の場合", async () => {
      // 単一アイテムのケース
    });

    it("履歴が最大表示件数（20件）の場合", async () => {
      // ページサイズ境界のケース
    });

    it("履歴が21件（ページング発生）の場合", async () => {
      // ページング境界のケース
    });
  });

  describe("ConversionLogs", () => {
    it("ログメッセージが空文字の場合", async () => {
      // 空メッセージのケース
    });

    it("ログメッセージが非常に長い場合（1000文字）", async () => {
      // 長文メッセージのケース
    });

    it("detailsがnullの場合", async () => {
      // 詳細なしのケース
    });
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                   | テストファイル    |
| ------------------ | ------------------------------------------ | ----------------- |
| IPC接続テスト      | window.historyAPI呼び出しとIPC通信         | `*.ipc.test.ts`   |
| データフローテスト | Renderer→IPC→Service→Repository→レスポンス | `*.flow.test.ts`  |
| エラーハンドリング | IPC通信失敗時のUI表示                      | `*.error.test.ts` |
| 状態同期テスト     | 復元後の履歴一覧再取得                     | `*.sync.test.ts`  |

## 成果物

| 成果物             | パス                                          | 説明               |
| ------------------ | --------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`       | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`               | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`  | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/renderer/**/__tests__/*.ts` | 実際のテストコード |

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. tdd-principlesスキルの実行
3. frontend-testingスキルの実行
4. test-naming-conventionsスキルの実行
5. boundary-value-analysisスキルの実行
6. 統合テストシナリオの作成
7. テストコードの作成
8. Red状態の確認

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
