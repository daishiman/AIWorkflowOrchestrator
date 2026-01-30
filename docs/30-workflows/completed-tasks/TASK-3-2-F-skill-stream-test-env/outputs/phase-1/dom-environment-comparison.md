# DOM環境比較レポート - TASK-3-2-F Phase 1

## happy-dom vs jsdom 機能比較

| 機能                  | happy-dom (v20.0.11)           | jsdom (v27.4.0)                         | 備考                                           |
| --------------------- | ------------------------------ | --------------------------------------- | ---------------------------------------------- |
| React concurrent mode | 非対応（act()警告発生）        | 対応（React公式推奨環境）               | jsdomはReact Testing Libraryの標準環境         |
| navigator.clipboard   | 制限あり（モック困難）         | 対応（Object.definePropertyでモック可） | jsdomではclipboard APIのモック設定が正常に機能 |
| act() 互換性          | 警告発生                       | 正常（警告なし）                        | jsdomはReact 18のconcurrent renderingに対応    |
| DOM API網羅性         | 中（軽量実装のため一部未実装） | 高（W3C準拠の完全実装）                 | jsdomはより多くのWeb APIをサポート             |
| パフォーマンス        | 高速（軽量）                   | やや低速（完全実装のため）              | happy-domの方がテスト実行が速い傾向            |
| メモリ使用量          | 少ない                         | やや多い                                | 完全なDOM実装のためメモリ消費が増加            |
| Vitest統合            | ネイティブサポート             | ネイティブサポート                      | 両方ともvitestのenvironment設定で切り替え可    |
| TypeScript型定義      | あり                           | あり                                    | 両環境ともTypeScriptで問題なく使用可能         |

## happy-dom の既知の制限事項

1. **React concurrent mode非対応**: React 18のconcurrent features（Suspense, startTransition等）との互換性に問題がある。非同期レンダリング中に`act()`警告が多発する。
2. **navigator.clipboard制限**: `navigator.clipboard`オブジェクトへの`Object.defineProperty`によるモック設定が正しく反映されない。プロパティの書き換えが制限されている。
3. **一部Web API未実装**: `IntersectionObserver`, `ResizeObserver`等の一部APIが未実装または不完全。

## jsdom の優位点

1. **React公式推奨**: React Testing Libraryの公式ドキュメントでjsdomが推奨環境として記載されている。
2. **Clipboard APIモック**: `Object.defineProperty`によるモック設定が正常に動作する。
3. **concurrent mode対応**: React 18の非同期レンダリングとの互換性が高い。
4. **既にインストール済み**: `apps/desktop/package.json`のdependenciesにjsdom v27.4.0が既に含まれている。

## jsdom の懸念点

1. **パフォーマンス低下**: happy-domと比較してテスト実行速度が低下する可能性がある（推定+10-20%）。
2. **メモリ消費増加**: 完全なDOM実装のためメモリ使用量が増加する。
3. **他テストへの影響**: vitest.config.tsのenvironment変更はデフォルト環境を変更するため、`@vitest-environment happy-dom`ディレクティブを持つ他テストへの影響を確認する必要がある。

## 推奨アプローチ

**アプローチA: jsdom切り替え**を推奨。

理由:

- 5つのdescribe.skipの根本原因（Clipboard APIモック + React concurrent mode）を両方解決できる
- jsdomは既にdependenciesに含まれており、追加インストール不要
- React Testing Libraryの公式推奨環境であり、長期的な互換性が保証される
- 他テストファイルは`@vitest-environment happy-dom`ディレクティブで個別に環境指定可能
