# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 前提Phase  | Phase 5                  |
| 後続Phase  | Phase 7                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

Phase 4で作成した基本テストに加え、エッジケース、境界条件、異常系のテストを追加する。カバレッジ目標（Line 80%以上、Branch 60%以上）を達成するためのテストを拡充する。

## 背景

Phase 5で基本実装が完了し、テストがGreen状態になった。次のステップとして、より堅牢なテストスイートを構築し、リグレッションを防止する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステストの追加（設定管理サービス）

**目的**: 設定管理サービスの境界条件・エッジケースをテストする

**実行手順**:

1. 以下のエッジケーステストを追加:

```typescript
describe("SlideSettingsStore - エッジケース", () => {
  describe("パス処理", () => {
    it("空文字列のパスを拒否する");
    it("非常に長いパス（1000文字以上）を拒否する");
    it("特殊文字を含むパス（日本語、スペース）を正しく処理");
    it("末尾のスラッシュを正規化する");
    it("Windowsパス形式（バックスラッシュ）を正しく処理");
  });

  describe("ホームディレクトリ展開", () => {
    it("~/ を正しく展開する");
    it("~user/ 形式を正しく展開する（macOS/Linux）");
    it("$HOME を正しく展開する");
  });

  describe("パストラバーサル防止", () => {
    it("../を含むパスを拒否");
    it("..\\を含むパス（Windows形式）を拒否");
    it("URL形式のパスを拒否");
    it("null文字を含むパスを拒否");
    it("encoded ../（%2e%2e%2f）を拒否");
  });

  describe("並行アクセス", () => {
    it("複数の同時読み込みを正しく処理");
    it("読み込み中の書き込みを正しく処理");
  });

  describe("破損データ", () => {
    it("JSON構文エラーのファイルでデフォルト値にフォールバック");
    it("不正なschemaVersionでマイグレーションを試行");
    it("必須フィールド欠損でデフォルト値を補完");
  });
});
```

2. `apps/desktop/src/main/settings/__tests__/slideSettingsStore.edge.test.ts` に追加

**期待される成果物**:

- `apps/desktop/src/main/settings/__tests__/slideSettingsStore.edge.test.ts`

---

### タスク2: 異常系テストの追加（IPC通信）

**目的**: IPC通信の異常系・エラーパスをテストする

**実行手順**:

1. 以下の異常系テストを追加:

```typescript
describe("SlideSettingsHandlers - 異常系", () => {
  describe("sender検証", () => {
    it("DevToolsからの呼び出しを拒否");
    it("存在しないwindowからの呼び出しを拒否");
    it("不正なwebContentsからの呼び出しを拒否");
  });

  describe("入力バリデーション", () => {
    it("undefined引数でエラーを返す");
    it("null引数でエラーを返す");
    it("数値型引数でエラーを返す");
    it("オブジェクト型引数でエラーを返す");
  });

  describe("ダイアログエラー", () => {
    it("ダイアログがキャンセルされた場合nullを返す");
    it("ダイアログがエラーで閉じた場合エラーを返す");
    it("複数のダイアログが同時に開かれた場合の処理");
  });

  describe("ストアエラー", () => {
    it("ストアの読み込みエラーを適切にハンドル");
    it("ストアの書き込みエラーを適切にハンドル");
    it("ストアのロックエラーを適切にハンドル");
  });
});
```

2. `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.error.test.ts` に追加

**期待される成果物**:

- `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.error.test.ts`

---

### タスク3: UIコンポーネントの追加テスト

**目的**: UIの境界条件・ユーザーインタラクションをテストする

**実行手順**:

1. 以下のUIテストを追加:

```typescript
describe("SlideDirectorySettings - 追加テスト", () => {
  describe("ローディング状態", () => {
    it("ローディング中にスピナーを表示");
    it("ローディング中にボタンを無効化");
    it("ローディング完了後にコンテンツを表示");
  });

  describe("エラー状態", () => {
    it("ネットワークエラーでリトライボタンを表示");
    it("バリデーションエラーで該当フィールドをハイライト");
    it("複数のエラーを順番に表示");
  });

  describe("アクセシビリティ", () => {
    it("キーボード操作でディレクトリ選択が可能");
    it("スクリーンリーダー用のaria-labelが設定されている");
    it("フォーカス順序が論理的");
    it("エラーメッセージがaria-liveで通知される");
  });

  describe("レスポンシブ", () => {
    it("狭い画面でレイアウトが崩れない");
    it("長いパスが適切に省略表示される");
  });

  describe("状態遷移", () => {
    it("保存中の再保存を防止");
    it("未保存の変更がある場合に警告を表示");
    it("キャンセル時に変更を破棄");
  });
});
```

2. `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/SlideDirectorySettings.extended.test.tsx` に追加

**期待される成果物**:

- `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/SlideDirectorySettings.extended.test.tsx`

---

### タスク4: 統合テストの拡充

**目的**: End-to-End統合テストを拡充する

**実行手順**:

1. 以下の統合テストを追加:

```typescript
describe("SlideSettings Integration - 拡充", () => {
  describe("設定のライフサイクル", () => {
    it("初期設定 → 変更 → 保存 → 再起動 → 復元の完全フロー");
    it("設定変更 → キャンセル → 元に戻るフロー");
    it("設定破損 → フォールバック → 自動修復フロー");
  });

  describe("エラーリカバリー", () => {
    it("IPC失敗 → リトライ → 成功のフロー");
    it("永続化失敗 → ユーザー通知 → 手動保存のフロー");
  });

  describe("並行操作", () => {
    it("複数ウィンドウでの同時設定変更");
    it("バックグラウンドでのスキル呼び出し中の設定変更");
  });

  describe("マイグレーション", () => {
    it("v1 → v2へのマイグレーション");
    it("不完全なマイグレーションからのリカバリー");
  });
});
```

2. `apps/desktop/src/__tests__/integration/slideSettings.extended.integration.test.ts` に追加

**期待される成果物**:

- `apps/desktop/src/__tests__/integration/slideSettings.extended.integration.test.ts`

---

### タスク5: カバレッジレポートの確認

**目的**: 現在のテストカバレッジを確認し、不足箇所を特定する

**実行手順**:

1. カバレッジレポートを生成:

   ```bash
   pnpm --filter @repo/desktop test:coverage
   ```

2. カバレッジ目標との比較:
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上

3. 不足箇所を特定し、追加テストを作成

4. カバレッジレポートを `outputs/phase-6/coverage-report.md` に出力

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                       |
| -------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ基準       |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティテストパターン |

### 関連ドキュメント

| 参照資料      | パス                             | 内容       |
| ------------- | -------------------------------- | ---------- |
| Phase 4テスト | `apps/desktop/src/**/__tests__/` | 基本テスト |
| Phase 5実装   | `apps/desktop/src/**/`           | 実装コード |

---

## 成果物

| 成果物             | パス                                                                                                 | 内容                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------------------- |
| エッジケーステスト | `apps/desktop/src/main/settings/__tests__/slideSettingsStore.edge.test.ts`                           | ストアのエッジケース |
| 異常系テスト       | `apps/desktop/src/main/infrastructure/ipc/__tests__/slideSettingsHandlers.error.test.ts`             | IPC異常系            |
| UI追加テスト       | `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/__tests__/*.extended.test.tsx` | UI追加テスト         |
| 統合テスト拡充     | `apps/desktop/src/__tests__/integration/slideSettings.extended.integration.test.ts`                  | 統合テスト拡充       |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                                 | カバレッジ状況       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6での統合テスト連携アクション**:

- 統合テストの拡充（異常系・エッジケース）
- 全カテゴリのカバレッジ向上
- エラーハンドリングの統合テスト追加

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] UIコンポーネントの追加テストが完了している
- [ ] 統合テストが拡充されている
- [ ] カバレッジレポートが生成されている
- [ ] Line Coverage 80%以上を達成（または達成に向けた追加テスト完了）
- [ ] Branch Coverage 60%以上を達成（または達成に向けた追加テスト完了）
- [ ] 統合テスト連携アクションが完了している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-7-coverage-check.md`
