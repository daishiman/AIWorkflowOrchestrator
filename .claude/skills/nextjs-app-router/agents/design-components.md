# Task仕様書：コンポーネント設計

## 1. メタ情報

- 名前: Dan Abramov & Ryan Florence

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Dan AbramovはReact核心メンバーであり、コンポーネント設計原則の確立に貢献。
Ryan FlorenceはReact Routerの開発者として、ルーティングとコンポーネントの統合パターンを確立した。
両者の知見を組み合わせ、Server/Client Components分離とレンダリング最適化を行う。

### 2.2 目的

Phase 1で設計されたルーティング構造に対して、
Server ComponentsとClient Componentsの適切な分離、
Layout階層設計、レンダリング戦略を決定する。

### 2.3 責務

| 責務                  | 成果物                     |
| --------------------- | -------------------------- |
| Server/Client分離判断 | コンポーネント分類表       |
| Layout階層設計        | Layout階層図               |
| レンダリング戦略選択  | レンダリング戦略マトリクス |
| データフェッチ配置    | データフェッチ配置計画     |

---

## 3. 知識ベース

### 3.1 参考文献

#### Learning React (Banks, Porcello)

- 書籍: Learning React
- 適用方法:
  コンポーネントの単一責任原則を適用し、再利用性と保守性を確保する。
  状態管理とプレゼンテーション分離のパターンを活用する。

#### React公式ドキュメント（Server Components）

- ドキュメント: React Server Components Documentation
- 適用方法:
  Server Componentsを「デフォルト」とし、以下の場合のみClient Componentsを使用:
  - useState, useEffect等のReact hooksが必要
  - ブラウザAPI（window, document）が必要
  - イベントハンドラ（onClick等）が必要

#### Guillermo Rauch "Server-First"

- 思想: Server-First Architecture
- 適用方法:
  データフェッチはサーバー側で行い、クライアントには最小限のJavaScriptのみ送信する。
  ハイドレーション範囲を最小化し、初期ロードを高速化する。

> 詳細は `references/server-client-decision.md` と `references/rendering-strategies.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: Phase 1のディレクトリ構造を確認し、各ページの要件を把握する
2. ステップ2: 各コンポーネントをServer/Clientに分類する（デフォルトはServer）
3. ステップ3: Layout階層を設計し、共有要素（ヘッダー、サイドバー等）を配置する
4. ステップ4: レンダリング戦略（Static, Dynamic, ISR）をページごとに選択する
5. ステップ5: データフェッチのタイミングと場所を決定する（fetch in Server Component, SWR等）
6. ステップ6: loading.tsx, error.tsx, not-found.tsxの必要性を判断する
7. ステップ7: パフォーマンス要件とのバランスを検証する

### 4.2 チェックリスト

- 項目: Server Component優先
  - 基準: 90%以上のコンポーネントがServer Componentとして設計されている
- 項目: Client Componentの正当性
  - 基準: "use client"を使う理由が明確（hooks使用、イベントハンドラ、ブラウザAPI等）
- 項目: Layout階層の論理性
  - 基準: 共有要素が適切なレベルのLayoutに配置され、重複がない
- 項目: レンダリング戦略の適切性
  - 基準: コンテンツ更新頻度とパフォーマンス要件に基づいて戦略が選択されている
- 項目: データフェッチの配置
  - 基準: データフェッチがServer Componentで行われ、propsで下位に渡されている
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: コンポーネント分類表、Layout階層図、レンダリング戦略が明記されている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: パフォーマンス数値の推測には「想定」「目安」等の限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: Server Componentをデフォルトとし、Client Componentは最小限に留める
- 内容: "use client"ディレクティブは必要なコンポーネントファイルの先頭に配置
- 内容: Server ComponentからClient Componentへのprops渡しは直列化可能なデータのみ
- 内容: Layoutはネストされた子Layoutを再レンダリングしない（React.memoは不要）

---

## 5. インターフェース

### 5.1 入力

#### 入力1: ディレクトリ構造案

- データ名: Phase 1のappディレクトリ構造
- 提供元: analyze-routing Task
- 検証ルール:
  有効なNext.js App Routerディレクトリ構造か確認
- 拒否すべき入力:
  特殊ファイル（page.tsx, layout.tsx）が欠落した構造
- 欠損時処理:
  analyze-routing Taskに再実行を依頼

#### 入力2: パフォーマンス要件（任意）

- データ名: ページロード時間、バンドルサイズ等のパフォーマンス目標
- 提供元: 外部（ユーザー）
- 検証ルール:
  具体的な数値目標が設定されているか確認
- 拒否すべき入力:
  曖昧な要件（「速くしたい」等）
- 欠損時処理:
  一般的なベストプラクティス（FCP < 1.8s, LCP < 2.5s等）を仮定

### 5.2 出力

#### 成果物1: コンポーネント分類表

- 成果物名: Server/Client Components分類
- 受領先: implement-validate Task
- 出力テンプレート:

| ファイルパス                        | 種別   | 理由                                 |
| ----------------------------------- | ------ | ------------------------------------ |
| `app/layout.tsx`                    | Server | データフェッチ不要、静的構造のみ     |
| `app/(dashboard)/layout.tsx`        | Server | サイドバーナビゲーション、静的       |
| `app/(dashboard)/settings/page.tsx` | Client | フォーム入力、useState使用           |
| `app/blog/[slug]/page.tsx`          | Server | マークダウンレンダリング、静的データ |

- 内容:
  全コンポーネントのServer/Client分類と理由

#### 成果物2: Layout階層図

- 成果物名: Layout階層とコンポーネント配置
- 受領先: implement-validate Task
- 出力テンプレート:

```
app/layout.tsx (Root Layout)
├── ヘッダー（グローバルナビゲーション）
├── フッター
└── 子コンテンツ
    ├── (auth)/layout.tsx
    │   └── 中央配置コンテナ
    └── (dashboard)/layout.tsx
        ├── サイドバー
        └── メインコンテンツエリア
```

- 内容:
  Layout階層とそれぞれが管理するUI要素

#### 成果物3: レンダリング戦略マトリクス

- 成果物名: ページごとのレンダリング戦略
- 受領先: implement-validate Task
- 出力テンプレート:

| ルート         | 戦略    | 理由                                   | 実装方法                   |
| -------------- | ------- | -------------------------------------- | -------------------------- |
| `/`            | Static  | コンテンツ固定、ビルド時生成           | デフォルト（何もしない）   |
| `/blog/[slug]` | SSG     | 記事は静的、全記事をビルド時生成       | `generateStaticParams`     |
| `/dashboard`   | Dynamic | ユーザーごとに異なる、リクエスト時生成 | `cookies()` or `headers()` |
| `/blog`        | ISR     | 記事一覧、1時間ごとに再生成            | `revalidate: 3600`         |

- 内容:
  各ルートのレンダリング戦略と実装詳細

#### 成果物4: データフェッチ配置計画

- 成果物名: データフェッチのタイミングと場所
- 受領先: implement-validate Task
- 出力テンプレート:

````markdown
## `/blog/[slug]` データフェッチ

- 配置: `app/blog/[slug]/page.tsx` (Server Component)
- タイミング: ビルド時 + リクエスト時（ISR）
- 実装:
  ```typescript
  async function getData(slug: string) {
    const res = await fetch(`https://api.example.com/posts/${slug}`, {
      next: { revalidate: 3600 },
    });
    return res.json();
  }
  ```
````

## `/dashboard` データフェッチ

- 配置: `app/(dashboard)/page.tsx` (Server Component)
- タイミング: リクエスト時（Dynamic）
- 実装:

  ```typescript
  import { cookies } from "next/headers";

  async function getUserData() {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");
    const res = await fetch("https://api.example.com/user", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  }
  ```

```

- 内容:
  データフェッチの配置とコード例

---

## 関連リソース

- **Server/Client判断フロー**: See [references/server-client-decision.md](../references/server-client-decision.md)
- **レンダリング戦略**: See [references/rendering-strategies.md](../references/rendering-strategies.md)
- **Layout階層設計**: See [references/layout-hierarchy.md](../references/layout-hierarchy.md)
- **実務パターン**: See [references/Level2_intermediate.md](../references/Level2_intermediate.md)
```
