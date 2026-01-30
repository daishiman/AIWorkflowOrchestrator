# Vitest設定変更設計書 - TASK-3-2-F Phase 2

## 変更対象

`apps/desktop/vitest.config.ts`

## 変更内容

### 変更箇所1: テスト環境設定

```diff
  test: {
    globals: true,
-   environment: "happy-dom",
+   environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
```

**変更理由**: happy-domのClipboard APIモック制限とReact concurrent mode非互換を解消するため。

### 変更箇所2: その他の設定

変更なし。以下の設定はjsdom環境でも互換性がある:

- `pool: "forks"` - jsdomでも同一のプール設定が使用可能
- `poolOptions.forks.maxForks: 2` - 環境非依存
- `testTimeout: 10000` - 環境非依存
- `setupFiles: ["./src/test/setup.ts"]` - セットアップファイルの変更はPhase 5タスク2で実施

## 副作用分析

### @vitest-environment ディレクティブを持つファイル（17ファイル）

これらのファイルはファイルレベルで`@vitest-environment happy-dom`を指定しているため、vitest.config.tsのdefault environmentをjsdomに変更しても、これらのファイルは引き続きhappy-dom環境で実行される。

**影響**: なし（ファイルレベルディレクティブが優先される）

### SkillStreamDisplayテストファイル

SkillStreamDisplayテストファイル（4ファイル）も`@vitest-environment happy-dom`ディレクティブを持っている。これらのファイルでjsdom環境を使用するには、ディレクティブを変更する必要がある。

**対応方針**:

- SkillStreamDisplay関連の4テストファイルの`@vitest-environment happy-dom`を`@vitest-environment jsdom`に変更する
- これにより、SkillStreamDisplay関連テストのみjsdom環境で実行される

### 変更前後の差分

```diff
// vitest.config.ts (L9)
- environment: "happy-dom",
+ environment: "jsdom",

// SkillStreamDisplay.test.tsx (先頭コメント)
- // @vitest-environment happy-dom
+ // @vitest-environment jsdom

// SkillStreamDisplay.i18n.test.tsx (先頭コメント)
- // @vitest-environment happy-dom
+ // @vitest-environment jsdom

// SkillStreamDisplay.i18n.integration.test.tsx (先頭コメント)
- // @vitest-environment happy-dom
+ // @vitest-environment jsdom

// SkillStreamDisplay.permission.test.tsx (先頭コメント)
- // @vitest-environment happy-dom
+ // @vitest-environment jsdom
```

## jsdomパッケージ

jsdomは`apps/desktop/package.json`のdependencies（非devDependencies）に既にv27.4.0としてインストール済み。追加のパッケージインストールは不要。ただし、devDependenciesに移動することを検討する（テスト環境のみで使用するため）。
