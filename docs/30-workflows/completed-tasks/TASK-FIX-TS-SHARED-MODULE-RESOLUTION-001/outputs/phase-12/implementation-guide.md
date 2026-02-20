# Phase 12: 実装ガイド — @repo/shared モジュール解決エラー修正

## Part 1: 中学生でもわかる概念説明

### 何が問題だったの？

想像してみてください。大きな図書館（プロジェクト）があって、その中に「共有コーナー」（@repo/shared）があります。共有コーナーには27冊の本（モジュール）が並んでいます。

「デスクトップアプリ」セクション（apps/desktop）から共有コーナーの本を読みたいのに、**図書館の案内図（tsconfig.json）に共有コーナーへの道順が書いてなかった**のです。

「共有コーナーの本棚リスト」（package.json exports）はちゃんとあるのに、「デスクトップセクションからの行き方」（paths マッピング）が書いてなかったので、228回も「本が見つかりません！」（エラー）と言われていました。

### どうやって直したの？

1. **案内図を更新**: デスクトップセクションの案内図（tsconfig.json）に、共有コーナーの27冊全ての場所を書き加えました
2. **補助案内を設置**: 共有コーナーの入口に「裏側にある目次」（typesVersions）も追加して、別の方法でも本が見つかるようにしました
3. **テスト用の道順も整備**: テスト実行用の地図（vitest.config.ts）にも不足していた3つの道順を追加しました

### なぜ大切なの？

案内図が不完全だと、コードを書くときにエディタが「この本は存在しません」と嘘のエラーを出します。開発者は228回もこのエラーを無視しなければならず、本当のエラーを見つけにくくなっていました。

---

## Part 2: 開発者向け技術詳細

### 根本原因

`apps/desktop/tsconfig.json` の `moduleResolution: "bundler"` 設定下で、`@repo/shared` のサブパスインポートが TypeScript コンパイラに解決されなかった。

原因チェーン:

1. `moduleResolution: "bundler"` は `package.json` の `exports` フィールドを参照する
2. モノレポの `workspace:*` 参照では、ビルド前に `./dist/` 配下の `.d.ts` ファイルが存在しない
3. `tsconfig.json` に `paths` マッピングがなく、フォールバック先もない
4. 結果: 228件の TS2307 エラー（うち169件が `@repo/shared` 関連）

### 修正内容

#### 1. tsconfig.json paths 追加（Approach B — 主解決策）

```json
// apps/desktop/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@repo/shared": ["../../packages/shared/index.ts"],
      "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],
      "@repo/shared/agent": ["../../packages/shared/src/agent/index.ts"]
      // ... 合計27エントリ
    }
  }
}
```

パスマッピングの二重構造に注意:

- ルートレベル: `@repo/shared/core` → `../../packages/shared/core/index.ts`
- src配下: `@repo/shared/types` → `../../packages/shared/src/types/index.ts`

#### 2. typesVersions 追加（Approach A — フォールバック）

```json
// packages/shared/package.json
{
  "typesVersions": {
    "*": {
      "core": ["./core/index.ts"],
      "types": ["./src/types/index.ts"]
      // ... 合計26エントリ（ルート"."を除く）
    }
  }
}
```

#### 3. Vitest alias 整備

不足3エントリ追加: `core`, `infrastructure`, `infrastructure/database`

### テスト構成

| テストファイル                                              | 目的                        | テスト数 |
| ----------------------------------------------------------- | --------------------------- | -------- |
| packages/shared/src/**tests**/module-resolution.test.ts     | exports ↔ tsup entry 整合性 | 57       |
| apps/desktop/src/**tests**/shared-module-resolution.test.ts | paths ↔ exports 整合性      | 59       |
| apps/desktop/src/**tests**/vitest-alias-consistency.test.ts | alias ↔ paths 整合性        | 108      |

### 新規サブパス追加手順

新しいサブパスを追加する際は以下の4ファイルを同時更新:

1. `packages/shared/package.json` — `exports` と `typesVersions`
2. `packages/shared/tsup.config.ts` — `entry`
3. `apps/desktop/tsconfig.json` — `paths`
4. `apps/desktop/vitest.config.ts` — `resolve.alias`

詳細は `outputs/phase-8/subpath-addition-guide.md` を参照。
