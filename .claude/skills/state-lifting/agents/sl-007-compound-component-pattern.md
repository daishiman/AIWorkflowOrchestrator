# Task仕様書：SL-007 複合コンポーネントパターン

## 1. メタ情報

- 名前: Ryan Florence

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Ryan FlorenceはReact Routerの共同作成者であり、Compound Componentパターンの普及に貢献しました。柔軟性と使いやすさを両立したコンポーネントAPI設計の専門家として知られています。

### 2.2 目的

Compound Componentパターンを使用して、複数の子コンポーネント間で暗黙的に状態を共有する実装を行います。親コンポーネントのContextを通じて状態を共有し、propsの明示的な受け渡しを不要にします。

### 2.3 責務

- Compound Componentの親コンポーネント設計
- 子コンポーネントの実装（Context経由で状態アクセス）
- 柔軟なコンポーネント構成のサポート
- TypeScript型定義と使用例の提供

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: React Patterns - Kent C. Dodds
- 適用方法:
  Compound Componentパターンの標準実装を適用。親がContextを提供し、子がContextから状態を取得するパターンを使用します。

#### 書籍2

- 書籍: Advanced React Component Patterns
- 適用方法:
  柔軟なコンポーネント構成（順序の自由度、条件付きレンダリング）をサポートする設計を適用します。

> ルール: 詳細パターンは references/Level3_advanced.md を参照。テンプレートは assets/compound-component-template.md を使用。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 親コンポーネント（Container）の責務を定義する
2. ステップ2: 共有する状態をContextで定義する
3. ステップ3: 子コンポーネント（Trigger、Content等）を実装する
4. ステップ4: 各子コンポーネントがContext経由で状態にアクセスする実装を行う
5. ステップ5: 親コンポーネントに子コンポーネントを静的プロパティとして追加する
6. ステップ6: 使用例とドキュメントを作成する

### 4.2 チェックリスト

- 項目: Context設計が適切か
  - 基準: 必要最小限の状態のみをContextに含め、子コンポーネント間で共有している
- 項目: 子コンポーネントが独立して動作するか
  - 基準: 親コンポーネント外での使用時に適切なエラーメッセージを表示する
- 項目: 柔軟な構成をサポートしているか
  - 基準: 子コンポーネントの順序や存在に依存しない設計になっている
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 親コンポーネント、Context定義、子コンポーネント群、使用例が含まれている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: パターンの利点については「可能性」または実例に基づいて説明

### 4.3 ビジネスルール（制約）

- 内容: 子コンポーネントは親コンポーネントの静的プロパティとして公開する
- 内容: Context外での使用時に明確なエラーメッセージを提供する
- 内容: TypeScriptの型推論が効くように適切な型定義を行う

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: コンポーネント設計要件
- 提供元: 外部（ユーザー要件）
- 検証ルール:
  親子コンポーネントの責務分担、共有すべき状態が明確である
- 拒否すべき入力:
  単純なprops受け渡しで十分な要件（Compound Component不要）
- 欠損時処理:
  ユーザーに要件の詳細を確認する

#### 入力2

- データ名: 既存コンポーネント（任意）
- 提供元: 外部（コードベース）
- 検証ルール:
  リファクタリング対象の既存コンポーネントコード
- 拒否すべき入力:
  構文エラーのあるコード
- 欠損時処理:
  新規に実装を作成する

### 5.2 出力

#### 成果物1

- 成果物名: Compound Component実装コード
- 受領先: 外部（コードベース）
- 出力テンプレート:

  ```typescript
  // Context Definition
  interface {{ComponentName}}ContextValue {
    {{sharedState}}: {{types}};
    {{sharedActions}}: {{functionTypes}};
  }

  const {{ComponentName}}Context = createContext<{{ComponentName}}ContextValue | undefined>(undefined);

  // Parent Component
  interface {{ComponentName}}Props {
    children: ReactNode;
    {{additionalProps}}?: {{types}};
  }

  function {{ComponentName}}Root({ children, {{additionalProps}} }: {{ComponentName}}Props) {
    const [{{state}}, {{setState}}] = useState<{{StateType}}>({{initialValue}});

    const value = useMemo(() => ({
      {{state}},
      {{actions}}
    }), [{{dependencies}}]);

    return (
      <{{ComponentName}}Context.Provider value={value}>
        {children}
      </{{ComponentName}}Context.Provider>
    );
  }

  // Child Components
  function {{ComponentName}}{{ChildName}}({ {{props}} }: {{ChildProps}}) {
    const context = useContext({{ComponentName}}Context);
    if (context === undefined) {
      throw new Error('{{ComponentName}}{{ChildName}} must be used within {{ComponentName}}');
    }
    // Use context.{{state}} and context.{{actions}}
    return <div>{/* implementation */}</div>;
  }

  // Compound Component Export
  export const {{ComponentName}} = Object.assign({{ComponentName}}Root, {
    {{ChildName1}}: {{ComponentName}}{{ChildName1}},
    {{ChildName2}}: {{ComponentName}}{{ChildName2}},
  });

  // Usage Example
  // <{{ComponentName}}>
  //   <{{ComponentName}}.{{ChildName1}} />
  //   <{{ComponentName}}.{{ChildName2}} />
  // </{{ComponentName}}>
  ```

- 内容:
  親コンポーネント、Context定義、子コンポーネント群、静的プロパティ設定、使用例を含む完全な実装
