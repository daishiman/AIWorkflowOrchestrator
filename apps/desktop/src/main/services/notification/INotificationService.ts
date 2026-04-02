/**
 * INotificationService - OS ネイティブ通知サービスインターフェース
 *
 * TASK-NOTIFICATION-SERVICE-001
 * AC-1: notify(title, body) が型安全に定義される
 */

export interface INotificationService {
  notify(title: string, body: string): void;
}
