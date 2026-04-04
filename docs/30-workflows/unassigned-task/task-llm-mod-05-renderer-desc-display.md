# TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY: モデル description の Renderer 表示実装

## メタ情報

```yaml
issue_number: 1782
```

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| タスクID | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY               |
| 優先度   | 低                                                  |
| 発見元   | TASK-LLM-MOD-05 Phase 12 未タスク検出（2026-03-30） |
| 関連     | TASK-LLM-MOD-05                                     |

## 目的

TASK-LLM-MOD-05 により全19モデルに `description` フィールドが設定され、IPC 経由で Renderer に到達している。現時点では UI（InlineModelSelector 等）への表示が未実装のため、ユーザーにモデルの補足説明が届いていない。

ツールチップまたはサブテキストを用いて `description` を表示し、モデル選択時のユーザー体験を向上させる。

## 苦戦箇所

TASK-LLM-MOD-05 の実装において以下の点が苦戦箇所となった。将来の同様課題解決に役立てること。

- **`PROVIDER_CONFIGS` のインライン型と `LLMModelSchema` の乖離**: Zod スキーマ（`LLMModelSchema`）には `description?: string` が定義済みだったが、`PROVIDER_CONFIGS` のインライン型定義には未追加だった。型の一元管理（SSOT）が徹底されていないと同様の乖離が発生する。型定義の追加は Zod スキーマを正本とし、インライン型は `z.infer<typeof LLMModelSchema>` を参照する形に統一することが望ましい。
- **Phase-12 outputs ディレクトリが phase-10 止まりで phase-11/12 の outputs/ サブディレクトリが欠落**: ドキュメンテーション系タスクでは Phase 11/12 の成果物を `outputs/phase-12/` ではなくルートのファイルとして出力するパターンがあり、完了判定基準との整合が難しい。Phase 12 完了条件に「`outputs/phase-12/` ディレクトリ作成」を明記するか、ルート出力を許容する旨を仕様書に記載しておくと判定ミスを防げる。

## 対象ファイル

| ファイル                                                                       | 変更内容                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`             | 各モデル選択肢にツールチップ or サブテキストで description 表示 |
| `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`                   | フルパネル版のモデル一覧でも description を表示                 |
| 関連 CSS / Tailwind クラス（上記コンポーネントと同ファイル内 or 外部スタイル） | ツールチップ・サブテキスト用スタイル追加                        |

## 実行タスク

1. `InlineModelSelector.tsx` を確認し、各モデルオプションの描画箇所を特定する
2. モデルオブジェクトから `description` プロパティを参照する型安全な実装を追加する（`description?.length > 0` ガード必須）
3. ツールチップ実装（高優先）: モデル名ホバー時に description をツールチップで表示する
4. サブテキスト実装（中優先）: ドロップダウン内のモデル名下に小さく description を表示する
5. アクセシビリティ対応（必須）: `aria-describedby` / `title` 属性を適切に追加する
6. `ModelSelector.tsx`（フルパネル版）にも同様の変更を適用する
7. 既存テストが PASS を維持することを確認する
8. 新規テストケースを追加する（description 表示・非表示の両ケース）

## 完了条件

- [ ] `InlineModelSelector` の各モデル選択肢で `description` が参照可能になっている
- [ ] `description` が空の場合は表示なし（`description?.length > 0` ガードが実装されている）
- [ ] ツールチップ または サブテキストで description がユーザーに提示されている
- [ ] `aria-describedby` / `title` によるアクセシビリティ対応が実装されている
- [ ] 既存テストが PASS を維持している
- [ ] description 表示ケース・非表示ケースの両方を検証する新規テストが追加されている
