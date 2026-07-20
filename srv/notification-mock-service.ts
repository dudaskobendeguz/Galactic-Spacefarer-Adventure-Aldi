/**
 * Mock Notification Service - for local development
 * Registered in package.json under cds.requires.notificationService
 * Used in [development] profile
 */

import type { NotificationPayload } from './notification-production-service.js';
import { NotificationServiceBase } from './notification-production-service.js';

/**
 * MockNotificationService is a mock implementation of the NotificationServiceBase class, designed for local development and testing purposes. 
 * It simulates the behavior of sending notifications without actually integrating with a real notification service.
 * This service logs the notification details to the console, 
 * allowing developers to verify that notifications are being "sent" during development without sending real emails or messages.
 */
export class MockNotificationService extends NotificationServiceBase {
    constructor() {
        super('notification-service-mock');
    }

    protected sendNotification(payload: NotificationPayload): Promise<void> {
        this.logger.info('[MOCK] Notification sent', {
            to: payload.to,
            subject: payload.subject,
            timestamp: new Date().toISOString()
        });

        this.logger.info('[MOCK] Notification body', {
            body: payload.body
        });
        return Promise.resolve();
    }
}

export default MockNotificationService;

