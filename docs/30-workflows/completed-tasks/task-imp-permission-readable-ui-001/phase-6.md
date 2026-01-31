# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 6                                   |
| フェーズ名   | テスト拡充                          |
| カテゴリ     | 品質                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 5の実装に対して、エッジケース・異常系・アクセシビリティ・セキュリティのテストを拡充する。カバレッジ基準（Line 80%, Branch 60%, Function 80%）の達成を目指す。

---

## タスク

- Task 1: permissionDescriptions エッジケーステスト拡充
  - 境界値テストの追加（空文字列、非常に長い文字列、Unicode文字）
  - 型不正テストの追加（数値が渡された場合、配列が渡された場合）
  - 複合引数テストの追加（Bashのcommand+description等）
  - テンプレート内の引数欠損パターンの網羅

- Task 2: PermissionDialog UIエッジケーステスト拡充
  - 連続クリック時の動作テスト（高速なトグル操作）
  - ダイアログ再表示時の状態リセットテスト
  - 長い説明文の表示テスト
  - 複数権限リクエストの連続処理テスト

- Task 3: アクセシビリティテスト拡充
  - スクリーンリーダー対応テスト（aria-label, aria-describedby）
  - Tab順序テスト（折りたたみボタンがフォーカス順序に含まれる）
  - 高コントラストモード対応テスト
  - フォーカス移動テスト（展開時にフォーカスが適切に移動する）

- Task 4: XSSセキュリティテスト拡充
  - HTMLタグ含有引数のテスト（`<script>alert('xss')</script>`）
  - イベントハンドラ含有引数のテスト（`onload=alert(1)`）
  - エスケープシーケンス含有引数のテスト
  - URL含有引数のテスト（`javascript:alert(1)`）

---

## 参照資料

| ドキュメント         | パス                                                                                      | 説明                     |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4テスト        | `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts`     | 拡充対象テスト           |
| Phase 4テスト        | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` | 拡充対象テスト           |
| Phase 5実装          | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`                    | テスト対象モジュール     |
| Phase 5実装          | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                         | テスト対象コンポーネント |
| セキュリティ入力検証 | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`          | XSSテスト基準            |
| UI/UXデザイン原則    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`            | アクセシビリティ基準     |

---

## 手順

### Task 1 実行手順

1. `permissionDescriptions.test.ts` に以下のテストを追加する：

**境界値テスト**:

- 空文字列コマンド: `getDescription('Bash', { command: '' })` → 安全なフォールバック
- 1000文字超のコマンド: 切り詰め or 全文表示の動作確認
- 日本語パス: `getDescription('Read', { path: '/home/ユーザー/ドキュメント/ファイル.txt' })`
- 特殊文字パス: `getDescription('Read', { path: '/path/with spaces/file (1).txt' })`

**型不正テスト**:

- 数値引数: `getDescription('Bash', { command: 123 as unknown as string })`
- 配列引数: `getDescription('Read', { path: ['a', 'b'] as unknown as string })`
- null引数: `getDescription('Read', { path: null })`

**複合引数テスト**:

- Bash with description: `getDescription('Bash', { command: 'ls', description: 'ファイル一覧' })`
- Edit with old_string/new_string: 全引数パターン

### Task 2 実行手順

1. `PermissionDialog.readable.test.tsx` に以下のテストを追加する：

**UIエッジケース**:

- 連続クリック: 折りたたみボタンを素早く5回クリック → 最終状態が正しい
- ダイアログ再表示: `pendingPermission`がnull→値→nullと変化した時に`isDetailExpanded`がリセットされる
- 長い説明文: 200文字超の説明文が正しく表示される（レイアウト崩れなし）

### Task 3 実行手順

1. アクセシビリティテストを追加する：

- `aria-expanded="false"` → クリック後 `aria-expanded="true"`
- `aria-controls` が正しい要素IDを参照
- Tab キーで折りたたみボタンにフォーカス可能
- 展開後、Shift+Tab でボタンに戻れる

### Task 4 実行手順

1. XSSテストを追加する：

- `getDescription('Bash', { command: '<img src=x onerror=alert(1)>' })` → HTMLがエスケープされて表示
- `getDescription('Read', { path: 'javascript:alert(1)' })` → 安全に表示
- React DOMにレンダリングして `innerHTML` にスクリプトタグが含まれないことを確認

---

## 統合テストアクション

| カテゴリ           | 確認内容                                               |
| ------------------ | ------------------------------------------------------ |
| エラーハンドリング | 不正入力時のフォールバック動作が全パターンでテスト済み |
| セキュリティ       | XSSベクターが全て安全にハンドリングされている          |
| UI統合             | エッジケースでもUIレイアウトが維持される               |

---

## 成果物

| 成果物名                     | パス                                                                                      | 種別 | 説明           |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ---- | -------------- |
| permissionDescriptionsテスト | `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts`     | code | 拡充済みテスト |
| PermissionDialog拡張テスト   | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` | code | 拡充済みテスト |

---

## 完了条件

- [ ] 境界値テスト（空文字列、長文、Unicode、特殊文字）が追加されている
- [ ] 型不正テスト（数値、配列、null/undefined）が追加されている
- [ ] 複合引数テストが追加されている
- [ ] UI連続操作テストが追加されている
- [ ] ダイアログ再表示時の状態リセットテストが追加されている
- [ ] アクセシビリティテスト（aria属性、Tab順序、フォーカス管理）が追加されている
- [ ] XSSセキュリティテスト（HTMLタグ、イベントハンドラ、javascript:プロトコル）が追加されている
- [ ] すべてのテストがPASSしている
- [ ] 既存テスト（`PermissionDialog.test.tsx`）がPASSしている

---

## 次のフェーズ

Phase 7: テストカバレッジ確認 → カバレッジ基準達成を確認
