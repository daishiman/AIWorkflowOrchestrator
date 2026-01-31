# リトライ設定UI - タスク指示書

## メタ情報

```yaml
issue_number: 613
```


## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | -                                          |
| タスク名     | リトライ設定UI                             |
| 分類         | 改善                                       |
| 対象機能     | SkillExecutor設定画面                      |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | TASK-SKILL-RETRY-001 Phase 12 未タスク検出 |
| 発見日       | 2026-01-31                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-RETRY-001にてSkillExecutorにリトライ機構（指数バックオフ + Jitter）を実装した。RetryConfig型として`maxRetries`、`baseDelayMs`、`maxDelayMs`、`jitterFactor`、`backoffMultiplier`の5パラメータが定義され、`DEFAULT_RETRY_CONFIG`定数でデフォルト値が設定されている。しかし、これらのパラメータを変更するには直接コードを編集するか、`SkillExecutionRequest.retryConfig`にプログラム的に値を渡す必要がある。

### 1.2 問題点・課題

- ユーザーがリトライパラメータをカスタマイズする手段がない
- デフォルト値（maxRetries=3、baseDelayMs=1000ms等）の変更にはコード変更が必要
- スキルごとに異なるリトライ戦略を設定する仕組みがない
- 設定の永続化機構が未実装のため、アプリ再起動時に設定が失われる

### 1.3 放置した場合の影響

- ネットワーク環境やAPIプロバイダの特性に合わせた調整ができず、不要なリトライ待機や不十分なリトライ回数が発生する
- 技術者以外のユーザーがリトライ挙動を制御できない
- スキル種別に応じた最適なリトライ戦略を適用できない

---

## 2. 何を達成するか（What）

### 2.1 目的

設定画面にリトライ設定セクションを追加し、RetryConfigの全パラメータをユーザーがGUIから変更可能にする。

### 2.2 最終ゴール

- 設定画面にリトライ設定セクションが表示されている
- RetryConfigの5パラメータ（maxRetries、baseDelayMs、maxDelayMs、jitterFactor、backoffMultiplier）を変更できる
- 設定値がバリデーションされ、不正値は拒否される
- 設定がアプリ再起動後も永続化される
- SkillExecutionRequestのretryConfigフィールドにUIから設定した値が反映される

### 2.3 スコープ

#### 含むもの

- 設定画面UIコンポーネント（リトライ設定セクション）
- RetryConfig値のバリデーションロジック（min/max制約、型チェック）
- 設定の永続化（ElectronStore または SQLite）
- 「デフォルトに戻す」ボタン
- 各パラメータのツールチップ説明

#### 含まないもの

- リトライロジック自体の変更（既存のexecuteWithRetryはそのまま）
- スキルごとの個別リトライ設定（将来拡張）
- リトライ履歴表示（別タスク: UT-002）

### 2.4 成果物

- `apps/desktop/src/renderer/components/Settings/RetryConfigSection.tsx` - 設定UIコンポーネント
- `apps/desktop/src/main/services/skill/RetryConfigStore.ts` - 永続化ロジック
- 対応するテストファイル
- UIコンポーネントのStorybook（オプション）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-RETRY-001（SkillExecutorリトライ機構）が完了していること（完了済み）
- 設定画面の基盤コンポーネントが存在すること

### 3.2 依存タスク

| タスクID             | タスク名                       | ステータス |
| -------------------- | ------------------------------ | ---------- |
| TASK-SKILL-RETRY-001 | SkillExecutor リトライ機構実装 | 完了       |

### 3.3 必要な知識

- React / TypeScript コンポーネント開発
- Electron IPC通信（Renderer → Main）
- RetryConfig型の各パラメータの意味と有効範囲
- フォームバリデーション
- 永続化パターン（ElectronStore / SQLite）

### 3.4 推奨アプローチ

#### UIコンポーネント設計

```typescript
// RetryConfigSection.tsx
interface RetryConfigFormValues {
  maxRetries: number; // 1-10, default: 3
  baseDelayMs: number; // 100-10000, default: 1000
  maxDelayMs: number; // 1000-120000, default: 30000
  jitterFactor: number; // 0-1, default: 0.2
  backoffMultiplier: number; // 1-5, default: 2
}
```

各パラメータにスライダー + 数値入力のハイブリッドUIを採用し、直感的な操作性を実現する。

#### 永続化

Main ProcessにRetryConfigStoreを実装し、IPC経由で設定の読み書きを行う。SkillExecutor.execute()呼び出し時にStoreから設定を読み込み、SkillExecutionRequest.retryConfigにマージする。

---

## 4. 実行手順

### Phase構成

3フェーズ構成（UI実装タスク）

### Phase 1: 永続化レイヤー実装

#### 目的

RetryConfigの保存・読み込み機構を実装する

#### 手順

1. `RetryConfigStore`クラスを作成（ElectronStore or SQLite）
2. デフォルト値の定義（DEFAULT_RETRY_CONFIGと同一）
3. バリデーションロジックの実装（各パラメータのmin/max制約）
4. IPC Handlerを追加（`retryConfig:get`、`retryConfig:set`、`retryConfig:reset`）
5. 単体テストの作成

#### 成果物

- `apps/desktop/src/main/services/skill/RetryConfigStore.ts`
- `apps/desktop/src/main/services/skill/__tests__/RetryConfigStore.test.ts`

#### 完了条件

- RetryConfigの保存・読み込みが正常に動作する
- バリデーションが不正値を拒否する
- テストがすべてパスする

### Phase 2: UIコンポーネント実装

#### 目的

設定画面にリトライ設定セクションを追加する

#### 手順

1. `RetryConfigSection`コンポーネントを作成
2. 各パラメータの入力UI（スライダー + 数値入力）を実装
3. ツールチップでパラメータの説明を表示
4. 「デフォルトに戻す」ボタンを実装
5. フォームバリデーションを接続
6. IPC経由でMain Processと通信
7. コンポーネントテストの作成

#### 成果物

- `apps/desktop/src/renderer/components/Settings/RetryConfigSection.tsx`
- 対応するテストファイル

#### 完了条件

- 全パラメータが画面上で変更可能
- バリデーションエラーが表示される
- デフォルト値への復元が動作する

### Phase 3: 統合テスト・動作確認

#### 目的

SkillExecutorとの統合を確認する

#### 手順

1. 設定変更後にSkillExecutor.execute()で設定値が反映されることを確認
2. アプリ再起動後に設定が保持されることを確認
3. 境界値テスト（最小値・最大値）を実施

#### 成果物

- 統合テスト結果レポート

#### 完了条件

- UIで変更した設定がリトライ動作に反映される
- 再起動後も設定が保持される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] RetryConfigの5パラメータすべてがUIから変更可能
- [ ] 設定値のバリデーションが動作する（範囲外の値を拒否）
- [ ] 「デフォルトに戻す」ボタンで初期値に復元される
- [ ] 設定がアプリ再起動後も永続化される
- [ ] SkillExecutionRequestのretryConfigに設定値が反映される

### 品質要件

- [ ] コンポーネントテストがすべてパスする
- [ ] 永続化ロジックのテストがすべてパスする
- [ ] TypeScript型エラーが発生しない
- [ ] ESLintエラーが発生しない

### ドキュメント要件

- [ ] 各パラメータのツールチップ説明が適切
- [ ] コンポーネントにJSDocコメントが記載されている

---

## 6. 検証方法

### テストケース

| No. | テストケース                         | 期待結果                            |
| --- | ------------------------------------ | ----------------------------------- |
| 1   | maxRetriesを5に変更して保存          | 次回実行時にリトライ上限が5回になる |
| 2   | baseDelayMsを50（最小値未満）に設定  | バリデーションエラーが表示される    |
| 3   | 「デフォルトに戻す」ボタンをクリック | 全パラメータがデフォルト値に戻る    |
| 4   | 設定変更後にアプリを再起動           | 変更した設定が保持されている        |
| 5   | jitterFactorを0に設定                | Jitterなしでリトライが実行される    |

### 検証手順

1. 設定画面を開きリトライ設定セクションが表示されることを確認
2. 各パラメータを変更し保存
3. スキルを実行しリトライが発生する状況を再現
4. リトライ動作が変更した設定に従っていることを確認
5. アプリを再起動し設定が保持されていることを確認

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                       |
| ------------------------------- | ------ | -------- | ------------------------------------------ |
| 不正なRetryConfig設定による障害 | 中     | 低       | 厳密なバリデーションとデフォルト値復元機能 |
| 設定画面の既存レイアウト崩れ    | 低     | 中       | 既存設定画面のレイアウトを事前確認         |
| 永続化方式の選択ミス            | 低     | 低       | 既存の設定永続化パターンに合わせる         |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` - RetryConfig型、DEFAULT_RETRY_CONFIG定数
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - エラーハンドリング仕様

### 参考資料

- Exponential Backoff パラメータチューニングのベストプラクティス
- Electron Settings管理パターン

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-SKILL-RETRY-001 Phase 12 未タスク検出:
リトライ設定UIが未実装。RetryConfig（maxRetries, baseDelayMs, maxDelayMs, jitterFactor, backoffMultiplier）は
コードレベルでのみ変更可能であり、ユーザーがカスタマイズする手段がない。
```

### 補足事項

- 本タスクはユーザビリティ向上が主目的
- スキルごとの個別リトライ設定は将来拡張として別タスク化を推奨
- 設定画面の既存UIパターン（Tailwind CSS）に合わせて実装すること
