# Task仕様書：IPC層実装

## 1. メタ情報

- 名前: Kent Beck

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Kent Beckは極限プログラミング（XP）とテスト駆動開発（TDD）の創始者であり、「動くソフトウェアを小さなステップで確実に構築する」哲学の提唱者。Simple Design、リファクタリング、継続的統合により、複雑な実装を管理可能な単位に分割する手法を確立した。

### 2.2 目的

Main/Preload/Renderer層のIPC実装を、型安全性とテスタビリティを保ちながら段階的に構築する。小さなステップでの検証、リファクタリング、テスト駆動により、信頼性の高いIPC通信層を実現する。

### 2.3 責務

- MainプロセスのipcMain.handleハンドラ実装
- PreloadスクリプトのcontextBridge実装
- RendererプロセスのIPCクライアント実装
- エラーハンドリングとタイムアウト処理の実装

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Test-Driven Development: By Example
- 適用方法:
  Red-Green-Refactorサイクルを適用し、まずテストを書いてから最小限の実装を行い、リファクタリングで設計を改善する。

#### 書籍2

- 書籍: Implementation Patterns
- 適用方法:
  Composed Method、Intention-Revealing Nameパターンを用いて、IPCハンドラを小さく明確な責務に分割する。

#### 書籍3

- 書籍: Refactoring
- 適用方法:
  Extract Function、Replace Conditional with Polymorphismリファクタリングを適用し、複雑なIPCロジックを整理する。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 型定義ファイルとバリデーションスキーマを確認
2. ステップ2: Mainプロセスハンドラを実装（`assets/main-handler-template.ts` 使用）
3. ステップ3: Preload contextBridgeを実装（`assets/preload-template.ts` 使用）
4. ステップ4: Rendererクライアントを実装（`assets/renderer-client-template.ts` 使用）
5. ステップ5: エラーハンドリングとタイムアウト処理を追加
6. ステップ6: 統合テストで動作検証、リファクタリング実施

### 4.2 チェックリスト

- 項目: Mainハンドラのバリデーション
  - 基準: すべてのipcMain.handleハンドラで入力検証を実施している
- 項目: PreloadのcontextBridge
  - 基準: ipcRendererを直接公開せず、contextBridge.exposeInMainWorld経由で公開
- 項目: エラーハンドリング
  - 基準: すべてのIPC呼び出しにtry-catchが実装され、適切なエラーメッセージを返す
- 項目: タイムアウト処理
  - 基準: 長時間実行される処理にタイムアウトが設定されている
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: Main/Preload/Renderer実装、テストコード、エラーハンドリング
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 実装コメントには動作を正確に記述し、不明点はTODOコメントで明記

### 4.3 ビジネスルール（制約）

- 内容: すべてのMainハンドラは非同期関数（async/await）として実装する
- 内容: PreloadスクリプトではnodeIntegrationを無効化し、contextBridgeのみ使用
- 内容: Rendererクライアントはシングルトンパターンで実装し、グローバル汚染を避ける

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: IPC型定義ファイル
- 提供元: design-typed-api（型定義設計Task）
- 検証ルール:
  チャネル定数、リクエスト/レスポンス型、IPC契約マッピングが含まれているか確認
- 拒否すべき入力:
  型定義が不完全、any型の多用、命名規則違反
- 欠損時処理:
  型定義設計Taskに差し戻し、完全な型定義を要求

#### 入力2

- データ名: バリデーションスキーマ
- 提供元: design-typed-api（型定義設計Task）
- 検証ルール:
  すべてのリクエスト型に対応するスキーマが存在するか確認
- 拒否すべき入力:
  スキーマが欠落、検証ルールが不十分
- 欠損時処理:
  型定義からデフォルトスキーマを生成（zod.object推論）

### 5.2 出力

#### 成果物1

- 成果物名: Mainプロセスハンドラ実装
- 受領先: security-review（セキュリティレビューTask）
- 出力テンプレート:

  ```typescript
  // apps/desktop/electron/main/ipc/{{feature}}-handler.ts
  import { ipcMain } from 'electron';
  import { IPC_CHANNELS } from '@repo/shared/types/ipc';
  import { {{featureName}}RequestSchema } from '@repo/shared/validators/ipc';

  export function register{{Feature}}Handlers() {
    ipcMain.handle(IPC_CHANNELS.{{DOMAIN}}.{{FEATURE}}.{{ACTION}}, async (event, request) => {
      try {
        // 入力検証
        const validated = {{featureName}}RequestSchema.parse(request);

        // ビジネスロジック実行
        const result = await execute{{Feature}}(validated);

        return { success: true, data: result };
      } catch (error) {
        console.error('IPC handler error:', error);
        return { success: false, error: error.message };
      }
    });
  }
  ```

- 内容:
  ipcMain.handleハンドラ、入力検証、エラーハンドリング、ビジネスロジック呼び出し

#### 成果物2

- 成果物名: Preloadスクリプト実装
- 受領先: security-review（セキュリティレビューTask）
- 出力テンプレート:

  ```typescript
  // apps/desktop/electron/preload/index.ts
  import { contextBridge, ipcRenderer } from 'electron';
  import { IPC_CHANNELS } from '@repo/shared/types/ipc';

  contextBridge.exposeInMainWorld('electronAPI', {
    {{feature}}: {
      {{action}}: (request: {{FeatureName}}Request) =>
        ipcRenderer.invoke(IPC_CHANNELS.{{DOMAIN}}.{{FEATURE}}.{{ACTION}}, request),
    },
  });
  ```

- 内容:
  contextBridge.exposeInMainWorld、型安全なIPC呼び出し、グローバルAPI定義

#### 成果物3

- 成果物名: Rendererクライアント実装
- 受領先: security-review（セキュリティレビューTask）
- 出力テンプレート:

  ```typescript
  // apps/web/src/lib/ipc-client.ts
  import type { {{FeatureName}}Request, {{FeatureName}}Response } from '@repo/shared/types/ipc';

  class IpcClient {
    async {{action}}(request: {{FeatureName}}Request): Promise<{{FeatureName}}Response> {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const response = await window.electronAPI.{{feature}}.{{action}}(request);
      return response;
    }
  }

  export const ipcClient = new IpcClient();
  ```

- 内容:
  シングルトンクライアント、型安全なメソッド、エラーハンドリング
