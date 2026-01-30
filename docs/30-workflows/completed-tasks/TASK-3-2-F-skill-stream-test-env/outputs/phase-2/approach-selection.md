# アプローチ選定書 - TASK-3-2-F Phase 2

## アプローチ比較評価

| 評価軸               | アプローチA: jsdom切り替え                                                                                                                     | アプローチB: happy-domモック強化                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| concurrent mode対応  | jsdomはReact 18 concurrent modeに対応。act()警告が解消される                                                                                   | happy-dom自体の改修が必要。外部ライブラリの制約により根本解決が困難         |
| Clipboard API対応    | jsdom環境ではObject.definePropertyによるnavigator.clipboardモックが正常動作                                                                    | happy-dom環境でのモック実装にはカスタムパッチが必要。安定性に不安           |
| act()警告解消        | jsdomはReact Testing Libraryの標準環境であり、act()警告が発生しない                                                                            | happy-domの内部実装に依存するため、確実な解消が保証されない                 |
| 既存テストへの影響   | vitest.config.tsのdefault environment変更だが、各テストファイルの`@vitest-environment happy-dom`ディレクティブにより個別制御可能。影響は限定的 | 既存テストへの影響なし（環境変更なし）                                      |
| パフォーマンス影響   | jsdomはhappy-domより約10-20%遅い傾向。AC-6の+20%以内は達成見込み                                                                               | 変化なし                                                                    |
| 実装コスト           | 低（vitest.config.ts変更 + setup.tsにClipboard APIモック追加）                                                                                 | 高（happy-domのカスタムパッチ作成、不安定な回避策の実装）                   |
| 長期的メンテナンス性 | 高（React公式推奨環境、コミュニティサポート充実）                                                                                              | 低（カスタムパッチのメンテナンス負担、happy-domバージョンアップ時の再検証） |

## 選定結果

**アプローチA: jsdom切り替え**を採用する。

## 選定理由

1. **根本解決**: 5つのdescribe.skipの原因（Clipboard APIモック制限 + React concurrent mode非互換）を同時に解決できる
2. **低コスト**: jsdomはdependenciesに既にインストール済み（v27.4.0）。vitest.config.tsの1行変更 + setup.tsへのモック追加で実装可能
3. **標準準拠**: React Testing Libraryの公式推奨環境であり、長期的な互換性が保証される
4. **既存テスト保護**: 他テストファイルは`@vitest-environment happy-dom`ディレクティブで個別に環境指定されているため、影響を受けない
5. **リスク低**: jsdomへの切り替えはVitestの標準機能であり、ロールバックも容易（1行変更で戻せる）

## ロールバック計画

問題発生時は`vitest.config.ts`の`environment`を`happy-dom`に戻すだけで元の状態に復元可能。
