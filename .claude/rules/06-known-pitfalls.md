# 既知の落とし穴と防止策

> 本ファイルは**過去のインシデントから学んだ教訓**のみを記録する。
> 汎用的な DO/DON'T ルールは各ドメインファイル（01〜05, 07）に記載。

## Phase 12 インシデント

### P1: LOGS.md 2ファイル更新漏れ

- **教訓**: LOGS.md は2箇所あり、片方の更新忘れが起きやすい
- **チェックリスト**: [05-task-execution.md#Step 1-A](./05-task-execution.md)

### P2: topic-map.md 再生成忘れ

- **教訓**: 仕様書更新後に topic-map の再生成を忘れると、インデックスが古いまま残る
- **チェックリスト**: [05-task-execution.md#Step 1-D](./05-task-execution.md)

### P3: 未タスク管理の3ステップ不完全

- **教訓**: 指示書作成だけでは不十分。①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップが必要
- **チェックリスト**: [05-task-execution.md#Task 4](./05-task-execution.md)

### P4: documentation-changelog への早期「完了」記載

- **教訓**: 全 Step 完了前に「完了」と書くと、後続 Step の漏れに気付けない
- **チェックリスト**: [05-task-execution.md#Task 3](./05-task-execution.md)

## Electron / ランタイム

### P5: リスナー二重登録

- **教訓**: React StrictMode では `useEffect` が2回実行される。リスナー登録はモジュールレベルでガードが必要
- **ルール**: [03-state-management.md#リスナー管理](./03-state-management.md)

### P6: OAuth コールバックパース誤り

- **教訓**: OAuth コールバックではレスポンスモードに応じたパース先を選択する（fragment `#` vs query `?`）。PKCE 移行後は両経路が共存しうる
- **ルール**: [04-electron-security.md#認証セキュリティ](./04-electron-security.md)

### P12: 外部 SDK 自動処理との競合

- **教訓**: 外部 SDK のデフォルト自動処理（トークンリフレッシュ等）をカスタム実装で置き換える場合、元の自動処理を必ず無効化する

### P14: カスタムプロトコル URL パース

- **教訓**: `new URL("myapp://path/to")` では RFC 3986 の authority 規則により pathname が期待どおりにならない。カスタムプロトコルでは手動パースが安全

## ビルド / 環境

### P7: ネイティブモジュールのバイナリ不一致

- **教訓**: Node.js バージョン更新後は `pnpm store prune && pnpm install --force` が必要。通常の install ではキャッシュされた古いバイナリが残る
- **関連**: [07-git-and-tooling.md#Husky Hooks](./07-git-and-tooling.md)

### P8: 幽霊依存

- **教訓**: テスト環境では通るが実行時にモジュール未検出エラーになる。`import` するライブラリは必ず自身の `package.json` に宣言
- **ルール**: [01-architecture.md#モノレポ構造](./01-architecture.md)

## テスト

### P9: モジュールスコープ変数のテスト間リーク

- **教訓**: モジュールレベルの変数がテスト間で共有され、実行順序で結果が変わる。テストごとにリセット必須
- **ルール**: [02-code-quality.md#テスト設計の注意](./02-code-quality.md)

### P13: タイマーテストの無限ループ

- **教訓**: setTimeout + Promise + 再スケジュールのパターンでは `runAllTimers` 系が無限ループする。`advanceTimersByTime` で1ステップずつ進めること

## Claude Code Hooks

### P11: PostToolUse フックによる Edit 失敗

- **教訓**: Prettier / ESLint の自動修正がファイルを変更し、後続の Edit の文字列マッチが失敗する。大量編集後は `git diff --stat` で変更数を検証

## 仕様書スクリプト

### P10: 正規表現の見出しレベル誤検出

- **教訓**: `/^##/` は H3 以降にもマッチする。見出しレベルを正確に検出するには否定文字クラス（`/^## [^#]/`）を使う
