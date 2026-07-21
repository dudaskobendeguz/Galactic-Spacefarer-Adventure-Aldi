import cds from '@sap/cds';

// Define a constant for the notification event name to ensure consistency across the application
export const NOTIFICATION_EVENT: 'notifyOnboarder' = 'notifyOnboarder';

export type NotificationPayload = {
    to: string;
    subject: string;
    body: string;
    [key: string]: any;
};

/**
 * NotificationServiceBase is an abstract class that extends the cds.Service class, providing a base implementation for notification services.
 * It defines the structure for sending notifications and handling notification events, while allowing subclasses to implement the actual notification sending logic.
 * Subclasses must implement the sendNotification method to define how notifications are sent (e.g., via email, SMS, push notifications).
 * ```
 */
export abstract class NotificationServiceBase extends cds.Service {
    protected readonly logger;

    constructor(loggerName: string) {
        super();
        this.logger = cds.log(loggerName);
    }


    async init(): Promise<void> {

        /**
        *  Handles the 'notifyOnboarder' event by sending a notification based on the provided payload.
        *  If the notification sending fails, it logs the error and re-throws it to ensure that the failure is propagated.
        * @param req The request object containing the notification payload.
        */
        this.on(NOTIFICATION_EVENT, async (req: cds.Request<NotificationPayload>): Promise<void> => {
            const payload: NotificationPayload = req.data;

            try {
                await this.sendNotification(payload);
            } catch (error) {
                this.logger.error('Failed to send notification', {
                    error: error instanceof Error ? error.message : String(error),
                    to: payload.to
                });
                throw error; // Re-throw the error to ensure that the failure is propagated and can be handled appropriately by the caller.
            }
        });

        return super.init();
    }

    /**
     * Sends a notification based on the provided payload. This method is abstract and must be implemented by subclasses to define the actual notification sending logic.
     * @param payload The notification payload containing the recipient, subject, and body of the notification.
     */
    protected abstract sendNotification(payload: NotificationPayload): Promise<void>;
}

export class ProductionNotificationService extends NotificationServiceBase {
    constructor() {
        super('notification-service');
    }

    protected sendNotification(payload: NotificationPayload): Promise<void> {
        // In a real production implementation, you would integrate with an actual notification service (e.g., email service, SMS service, push notification service) here.
        this.logger.warn('[PROD] Notification service is not yet implemented.', {
            to: payload.to,
            subject: payload.subject
        });
        return Promise.resolve();
    }

}

export default ProductionNotificationService;
