# Use Case設計書

## 概要

本文書は、チャット履歴機能のUse Case（アプリケーションサービス）設計を定義する。各Use Caseは単一責務の原則に従い、1つのユースケースを担当する。

**作成日**: 2026-01-18
**配置場所**: `packages/shared/src/features/chat-history/application/use-cases/`

---

## 1. Use Case一覧

| Use Case                   | 責務                       | 依存リポジトリ         |
| -------------------------- | -------------------------- | ---------------------- |
| CreateChatSessionUseCase   | セッション作成             | IChatSessionRepository |
| GetChatSessionUseCase      | セッション取得             | IChatSessionRepository |
| ListChatSessionsUseCase    | セッション一覧取得         | IChatSessionRepository |
| UpdateChatSessionUseCase   | セッション更新             | IChatSessionRepository |
| DeleteChatSessionUseCase   | セッション削除             | 両Repository           |
| AddUserMessageUseCase      | ユーザーメッセージ追加     | 両Repository           |
| AddAssistantMessageUseCase | アシスタントメッセージ追加 | 両Repository           |
| GetMessagesUseCase         | メッセージ一覧取得         | IChatMessageRepository |
| SearchSessionsUseCase      | セッション検索             | IChatSessionRepository |
| ExportToMarkdownUseCase    | Markdownエクスポート       | 両Repository           |
| ExportToJsonUseCase        | JSONエクスポート           | 両Repository           |
| ToggleFavoriteUseCase      | お気に入り切り替え         | IChatSessionRepository |
| TogglePinnedUseCase        | ピン留め切り替え           | IChatSessionRepository |

---

## 2. CreateChatSessionUseCase

### 2.1 責務

新しいチャットセッションを作成する

### 2.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/CreateChatSessionUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { ChatSession } from "../../domain/entities/ChatSession.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { ChatSessionDTO } from "../dto/ChatSessionDTO.js";
import { ChatSessionMapper } from "../../../../infrastructure/persistence/mappers/ChatSessionMapper.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";

export interface CreateChatSessionInput {
  userId: string;
  title?: string;
}

export interface CreateChatSessionOutput {
  session: ChatSessionDTO;
}

export class CreateChatSessionUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  async execute(
    input: CreateChatSessionInput,
  ): Promise<Result<CreateChatSessionOutput, UseCaseError>> {
    // 1. エンティティを作成
    const sessionResult = ChatSession.create({
      userId: input.userId,
      title: input.title,
    });

    if (!sessionResult.ok) {
      return err(
        new UseCaseError("CREATE_SESSION_FAILED", sessionResult.error.message),
      );
    }

    const session = sessionResult.value;

    // 2. リポジトリに保存
    try {
      await this.sessionRepository.save(session);
    } catch (error) {
      return err(
        new UseCaseError(
          "REPOSITORY_ERROR",
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
    }

    // 3. DTOに変換して返却
    return ok({
      session: ChatSessionMapper.toDTO(session),
    });
  }
}
```

---

## 3. AddUserMessageUseCase

### 3.1 責務

ユーザーメッセージをセッションに追加する

### 3.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/AddUserMessageUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import type { ChatSessionDTO } from "../dto/ChatSessionDTO.js";
import type { ChatMessageDTO } from "../dto/ChatMessageDTO.js";
import { ChatSessionMapper } from "../../../../infrastructure/persistence/mappers/ChatSessionMapper.js";
import { ChatMessageMapper } from "../../../../infrastructure/persistence/mappers/ChatMessageMapper.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";

export interface AddUserMessageInput {
  sessionId: string;
  content: string;
}

export interface AddUserMessageOutput {
  message: ChatMessageDTO;
  updatedSession: ChatSessionDTO;
}

export class AddUserMessageUseCase {
  constructor(
    private readonly sessionRepository: IChatSessionRepository,
    private readonly messageRepository: IChatMessageRepository,
  ) {}

  async execute(
    input: AddUserMessageInput,
  ): Promise<Result<AddUserMessageOutput, UseCaseError>> {
    // 1. セッションIDの検証
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new UseCaseError("INVALID_SESSION_ID", "Invalid session ID"));
    }

    // 2. セッションの存在確認
    const session = await this.sessionRepository.findById(
      sessionIdResult.value,
    );
    if (!session) {
      return err(new UseCaseError("SESSION_NOT_FOUND", "Session not found"));
    }

    // 3. 次のmessageIndexを取得
    const nextIndex = await this.messageRepository.getNextMessageIndex(
      sessionIdResult.value,
    );

    // 4. メッセージエンティティを作成
    const messageResult = ChatMessage.createUserMessage({
      sessionId: input.sessionId,
      content: input.content,
      messageIndex: nextIndex,
    });

    if (!messageResult.ok) {
      return err(
        new UseCaseError("CREATE_MESSAGE_FAILED", messageResult.error.message),
      );
    }

    const message = messageResult.value;

    // 5. メッセージを保存
    try {
      await this.messageRepository.save(message);
    } catch (error) {
      return err(
        new UseCaseError(
          "REPOSITORY_ERROR",
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
    }

    // 6. セッションを更新（メッセージカウント、プレビュー）
    session.incrementMessageCount();
    session.updatePreview(input.content);

    try {
      await this.sessionRepository.save(session);
    } catch (error) {
      return err(
        new UseCaseError(
          "REPOSITORY_ERROR",
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
    }

    // 7. DTOに変換して返却
    return ok({
      message: ChatMessageMapper.toDTO(message),
      updatedSession: ChatSessionMapper.toDTO(session),
    });
  }
}
```

---

## 4. AddAssistantMessageUseCase

### 4.1 責務

アシスタントメッセージをセッションに追加する（LLMメタデータ必須）

### 4.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/AddAssistantMessageUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import type { ChatSessionDTO } from "../dto/ChatSessionDTO.js";
import type { ChatMessageDTO } from "../dto/ChatMessageDTO.js";
import type { LLMMetadataDTO } from "../dto/LLMMetadataDTO.js";
import { ChatSessionMapper } from "../../../../infrastructure/persistence/mappers/ChatSessionMapper.js";
import { ChatMessageMapper } from "../../../../infrastructure/persistence/mappers/ChatMessageMapper.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";

export interface AddAssistantMessageInput {
  sessionId: string;
  content: string;
  llmProvider: string;
  llmModel: string;
  llmMetadata: LLMMetadataDTO;
}

export interface AddAssistantMessageOutput {
  message: ChatMessageDTO;
  updatedSession: ChatSessionDTO;
}

export class AddAssistantMessageUseCase {
  constructor(
    private readonly sessionRepository: IChatSessionRepository,
    private readonly messageRepository: IChatMessageRepository,
  ) {}

  async execute(
    input: AddAssistantMessageInput,
  ): Promise<Result<AddAssistantMessageOutput, UseCaseError>> {
    // 1. セッションIDの検証
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new UseCaseError("INVALID_SESSION_ID", "Invalid session ID"));
    }

    // 2. セッションの存在確認
    const session = await this.sessionRepository.findById(
      sessionIdResult.value,
    );
    if (!session) {
      return err(new UseCaseError("SESSION_NOT_FOUND", "Session not found"));
    }

    // 3. 次のmessageIndexを取得
    const nextIndex = await this.messageRepository.getNextMessageIndex(
      sessionIdResult.value,
    );

    // 4. メッセージエンティティを作成
    const messageResult = ChatMessage.createAssistantMessage({
      sessionId: input.sessionId,
      content: input.content,
      messageIndex: nextIndex,
      llmProvider: input.llmProvider,
      llmModel: input.llmModel,
      llmMetadata: input.llmMetadata,
    });

    if (!messageResult.ok) {
      return err(
        new UseCaseError("CREATE_MESSAGE_FAILED", messageResult.error.message),
      );
    }

    const message = messageResult.value;

    // 5. メッセージを保存
    await this.messageRepository.save(message);

    // 6. セッションを更新
    session.incrementMessageCount();
    session.updatePreview(input.content);
    await this.sessionRepository.save(session);

    // 7. DTOに変換して返却
    return ok({
      message: ChatMessageMapper.toDTO(message),
      updatedSession: ChatSessionMapper.toDTO(session),
    });
  }
}
```

---

## 5. SearchSessionsUseCase

### 5.1 責務

キーワード・フィルタによるセッション検索

### 5.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/SearchSessionsUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { ChatSessionDTO } from "../dto/ChatSessionDTO.js";
import { ChatSessionMapper } from "../../../../infrastructure/persistence/mappers/ChatSessionMapper.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";
import { UserId } from "../../domain/value-objects/UserId.js";

export interface SearchSessionsInput {
  userId: string;
  keyword?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchSessionsOutput {
  sessions: ChatSessionDTO[];
  total: number;
}

export class SearchSessionsUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  async execute(
    input: SearchSessionsInput,
  ): Promise<Result<SearchSessionsOutput, UseCaseError>> {
    // 1. UserIdの検証
    const userIdResult = UserId.create(input.userId);
    if (!userIdResult.ok) {
      return err(new UseCaseError("INVALID_USER_ID", "Invalid user ID"));
    }

    // 2. 検索実行
    const sessions = await this.sessionRepository.search({
      userId: userIdResult.value,
      keyword: input.keyword,
      isFavorite: input.isFavorite,
      isPinned: input.isPinned,
      limit: input.limit,
      offset: input.offset,
    });

    // 3. DTOに変換して返却
    return ok({
      sessions: sessions.map((s) => ChatSessionMapper.toDTO(s)),
      total: sessions.length,
    });
  }
}
```

---

## 6. TogglePinnedUseCase

### 6.1 責務

セッションのピン留め状態を切り替える（上限10件チェック）

### 6.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/TogglePinnedUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { ChatSessionDTO } from "../dto/ChatSessionDTO.js";
import { ChatSessionMapper } from "../../../../infrastructure/persistence/mappers/ChatSessionMapper.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";

export interface TogglePinnedInput {
  sessionId: string;
}

export interface TogglePinnedOutput {
  session: ChatSessionDTO;
}

export class TogglePinnedUseCase {
  private static readonly MAX_PINNED = 10;

  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  async execute(
    input: TogglePinnedInput,
  ): Promise<Result<TogglePinnedOutput, UseCaseError>> {
    // 1. セッションIDの検証
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new UseCaseError("INVALID_SESSION_ID", "Invalid session ID"));
    }

    // 2. セッションの取得
    const session = await this.sessionRepository.findById(
      sessionIdResult.value,
    );
    if (!session) {
      return err(new UseCaseError("SESSION_NOT_FOUND", "Session not found"));
    }

    // 3. ピン留め状態の切り替え
    if (!session.isPinned) {
      // ピン留めにする場合、上限チェック
      const pinnedCount = await this.sessionRepository.countPinned(
        session.userId,
      );
      if (pinnedCount >= TogglePinnedUseCase.MAX_PINNED) {
        return err(
          new UseCaseError(
            "PIN_LIMIT_EXCEEDED",
            `ピン留めは最大${TogglePinnedUseCase.MAX_PINNED}件までです`,
          ),
        );
      }

      // 次のpinOrderを計算
      const nextPinOrder = pinnedCount + 1;
      session.setPinned(true, nextPinOrder);
    } else {
      // ピン留め解除
      session.unpin();
    }

    // 4. 保存
    await this.sessionRepository.save(session);

    // 5. DTOに変換して返却
    return ok({
      session: ChatSessionMapper.toDTO(session),
    });
  }
}
```

---

## 7. ExportToMarkdownUseCase

### 7.1 責務

セッションをMarkdown形式でエクスポート

### 7.2 設計

```typescript
// packages/shared/src/features/chat-history/application/use-cases/ExportToMarkdownUseCase.ts

import { Result, ok, err } from "../../../../core/Result.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import { UseCaseError } from "../../../../core/errors/UseCaseError.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";

export interface ExportToMarkdownInput {
  sessionId: string;
  includeMetadata?: boolean;
}

export interface ExportToMarkdownOutput {
  markdown: string;
  filename: string;
}

export class ExportToMarkdownUseCase {
  constructor(
    private readonly sessionRepository: IChatSessionRepository,
    private readonly messageRepository: IChatMessageRepository,
  ) {}

  async execute(
    input: ExportToMarkdownInput,
  ): Promise<Result<ExportToMarkdownOutput, UseCaseError>> {
    // 1. セッションIDの検証
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new UseCaseError("INVALID_SESSION_ID", "Invalid session ID"));
    }

    // 2. セッションの取得
    const session = await this.sessionRepository.findById(
      sessionIdResult.value,
    );
    if (!session) {
      return err(new UseCaseError("SESSION_NOT_FOUND", "Session not found"));
    }

    // 3. メッセージの取得
    const messages = await this.messageRepository.findBySessionId(
      sessionIdResult.value,
    );

    // 4. Markdown生成
    const lines: string[] = [];

    // ヘッダー
    lines.push(`# ${session.title.value}`);
    lines.push("");
    lines.push(`**作成日**: ${this.formatDate(session.createdAt)}`);
    lines.push(`**メッセージ数**: ${messages.length}件`);

    if (input.includeMetadata) {
      const totalTokens = this.calculateTotalTokens(messages);
      if (totalTokens > 0) {
        lines.push(`**総トークン数**: ${totalTokens.toLocaleString()}`);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");

    // メッセージ
    for (const message of messages) {
      const roleLabel = message.role.isUser ? "ユーザー" : "アシスタント";
      const timestamp = this.formatDate(message.timestamp);

      lines.push(`## ${roleLabel} (${timestamp})`);
      lines.push("");

      if (
        input.includeMetadata &&
        message.isAssistantMessage &&
        message.llmMetadata
      ) {
        lines.push(
          `**モデル**: ${message.llmMetadata.provider}/${message.llmMetadata.model}`,
        );
        const tokenUsage = message.llmMetadata.tokenUsage;
        if (tokenUsage) {
          lines.push(
            `**トークン**: 入力: ${tokenUsage.inputTokens}, 出力: ${tokenUsage.outputTokens}`,
          );
        }
        lines.push("");
      }

      lines.push(message.content.value);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    const markdown = lines.join("\n");
    const filename = `${session.title.value.replace(/[^\w\s-]/g, "")}_${this.formatDateForFilename(session.createdAt)}.md`;

    return ok({ markdown, filename });
  }

  private formatDate(date: Date): string {
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private calculateTotalTokens(messages: any[]): number {
    return messages.reduce((total, message) => {
      const tokenUsage = message.llmMetadata?.tokenUsage;
      if (tokenUsage) {
        return (
          total + (tokenUsage.inputTokens || 0) + (tokenUsage.outputTokens || 0)
        );
      }
      return total;
    }, 0);
  }
}
```

---

## 8. 共通パターン

### 8.1 Use Caseの構造

```typescript
export class XxxUseCase {
  constructor(
    private readonly repository1: IRepository1,
    private readonly repository2: IRepository2,
  ) {}

  async execute(input: XxxInput): Promise<Result<XxxOutput, UseCaseError>> {
    // 1. 入力の検証（値オブジェクト作成）
    // 2. ドメインエンティティの取得/作成
    // 3. ビジネスロジックの実行
    // 4. リポジトリへの永続化
    // 5. DTOへの変換と返却
  }
}
```

### 8.2 エラーハンドリング

- 入力検証エラー: `UseCaseError("INVALID_XXX", message)`
- 存在確認エラー: `UseCaseError("XXX_NOT_FOUND", message)`
- ビジネスルール違反: `UseCaseError("BUSINESS_RULE_VIOLATION", message)`
- リポジトリエラー: `UseCaseError("REPOSITORY_ERROR", message)`

---

## 9. Use Case Input/Output 型定義

```typescript
// packages/shared/src/features/chat-history/application/use-cases/types.ts

// 共通のInput/Output型をre-export
export type {
  CreateChatSessionInput,
  CreateChatSessionOutput,
} from "./CreateChatSessionUseCase.js";
export type {
  AddUserMessageInput,
  AddUserMessageOutput,
} from "./AddUserMessageUseCase.js";
export type {
  AddAssistantMessageInput,
  AddAssistantMessageOutput,
} from "./AddAssistantMessageUseCase.js";
export type {
  SearchSessionsInput,
  SearchSessionsOutput,
} from "./SearchSessionsUseCase.js";
export type {
  TogglePinnedInput,
  TogglePinnedOutput,
} from "./TogglePinnedUseCase.js";
export type {
  ExportToMarkdownInput,
  ExportToMarkdownOutput,
} from "./ExportToMarkdownUseCase.js";
// ... 他のUse Case
```
