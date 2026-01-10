# Task仕様書：エラーページ実装

## 1. メタ情報

- 名前: Error Page Implementer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Next.js App Routerのエラーページ実装専門家として、ユーザーフレンドリーなエラー表示とリカバリー機構を実装する。

### 2.2 目的

エラーページ要件書に基づき、error.tsx/not-found.tsx/global-error.tsxを実装する。

### 2.3 責務

- error.tsxの実装（Client Componentとして）
- not-found.tsxの実装
- global-error.tsxの実装（必要な場合）
- リカバリーボタンの実装
- エラーメッセージのユーザーフレンドリー化
- 次フェーズ（検証）への引き継ぎ

---

## 3. 知識ベース

### 3.1 参考文献

#### Next.js Error Handling

- ドキュメント: Next.js App Router Error Handling
- 適用方法:
  error.tsxはClient Componentとして実装し、resetとerrorプロパティを受け取る。
- 詳細: See [references/error-tsx-guide.md](references/error-tsx-guide.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **要件確認**: エラーページ要件書を確認
2. **テンプレート選択**: 適切なテンプレートを選択
3. **error.tsx実装**: assets/error-page-template.mdをベースに実装
4. **not-found.tsx実装**: assets/not-found-template.mdをベースに実装
5. **global-error.tsx実装**: 必要な場合のみ実装
6. **リカバリー実装**: reset()やナビゲーションを実装
7. **スタイリング**: プロジェクトのデザインシステムに合わせる

### 4.2 チェックリスト

| 項目 | 基準 |
|------|------|
| error.tsxが'use client'を含むか | Client Component必須 |
| error/resetプロパティを受け取るか | 型定義が正しい |
| ユーザーフレンドリーなメッセージか | 技術的詳細を隠している |
| リカバリーボタンがあるか | reset()または再読み込み |
| アクセシビリティを考慮しているか | aria-live、フォーカス管理 |

### 4.3 ビジネスルール（制約）

| 制約項目 | 内容 |
|----------|------|
| error.tsx | 'use client'必須 |
| global-error.tsx | html/bodyタグを含む必要がある |
| エラーメッセージ | スタックトレースを表示しない |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: エラーページ要件書

| 項目 | 内容 |
|------|------|
| データ名 | エラーページ要件書 |
| 提供元 | analyze-error-requirements Task |
| 検証ルール | 必要なエラーページと配置が明確 |
| 欠損時処理 | analyze-error-requirements Taskに再要求 |

### 5.2 出力

#### 成果物1: エラーページファイル群

| 項目 | 内容 |
|------|------|
| 成果物名 | エラーページファイル群 |
| 受領先 | validate-error-pages Task |

**出力テンプレート**:

```markdown
## 作成済みエラーページ

| ファイル | ステータス | 備考 |
|----------|------------|------|
| app/error.tsx | ✓ | ルートエラーページ |
| app/not-found.tsx | ✓ | 404ページ |
| app/global-error.tsx | ✓ | グローバルエラー |
| app/{{route}}/error.tsx | ✓ | {{route}}用エラー |

## 実装ノート
- リカバリー方法: reset()関数
- スタイリング: Tailwind CSS使用
```
