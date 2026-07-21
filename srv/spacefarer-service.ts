import cds from '@sap/cds';
import type { SpaceFarer as SpaceFarerRow, Position as PositionRow, SpacesuitColorBoundary as SpacesuitColorBoundaryRow } from '#cds-models/galactic/spacefarer/adventure/index.js';
import { NOTIFICATION_EVENT, type NotificationPayload } from './notification-production-service.js';

// fields that should not come from client POST body
type ServerManagedFields =
    | 'ID'
    | 'createdAt'
    | 'createdBy'
    | 'modifiedAt'
    | 'modifiedBy'

// base payload from entity
type SpaceFarerCreateBodyBase = Omit<SpaceFarerRow, ServerManagedFields>

type SpaceFarerDepartmentCreateBody = {
    name: string;
}

// make business-required fields required (example set)
type SpaceFarerCreateBody =
    Required<Pick<SpaceFarerCreateBodyBase, 'firstName' | 'lastName' | 'email'>> &
    Partial<Omit<SpaceFarerCreateBodyBase, 'firstName' | 'lastName' | 'email'>> & {
        department: SpaceFarerDepartmentCreateBody;
    }

type SpaceFarerCreateRequest = cds.Request<SpaceFarerCreateBody>

type SpaceFarerReadResults = SpaceFarerRow | SpaceFarerRow[] | null;

type Position = {
    ID: NonNullable<PositionRow['ID']>;
    title: NonNullable<PositionRow['title']>;
    skillBoundary_min: NonNullable<PositionRow['skillBoundary_min']>;
    skillBoundary_max: NonNullable<PositionRow['skillBoundary_max']>;
};

type SpacesuitColorBoundary = {
    ID: NonNullable<SpacesuitColorBoundaryRow['ID']>;
    color: NonNullable<SpacesuitColorBoundaryRow['color']>;
    stardustCollection_min: NonNullable<SpacesuitColorBoundaryRow['stardustCollection_min']>;
    stardustCollection_max: NonNullable<SpacesuitColorBoundaryRow['stardustCollection_max']>;
};

class SpacefarerService extends cds.ApplicationService {
    #logger: ReturnType<typeof cds.log> = cds.log('spacefarer-service');
    #notificationService: cds.Service | null = null;

    async init(): Promise<void> {
        const { SpaceFarer } = this.entities;
        const LOG = this.#logger;

        // Get the notification service from CAP's service registry
        // This is registered in package.json under cds.requires.notificationService
        this.#notificationService = await cds.connect.to('notificationService');

        /** Before hook: runs before the CREATE operation is executed, allowing us to intercept and modify request data.
         * Use case: auto-assign position based on wormholeNavigationSkill and spacesuit color based on stardustCollection
         * @see(https://cap.cloud.sap/docs/node.js/core-services#srv-before-request)
         */
        this.before('CREATE', SpaceFarer, async (req: SpaceFarerCreateRequest): Promise<void> => {
            const data: SpaceFarerCreateBody = req.data;
            this.#logger.debug('Before CREATE SpaceFarer', { data });
            const { wormholeNavigationSkill, stardustCollection } = data;

            if (!wormholeNavigationSkill && wormholeNavigationSkill !== 0) {
                throw cds.error(400, 'wormholeNavigationSkill is required');
            }
            if (wormholeNavigationSkill < 0 || wormholeNavigationSkill > 100) {
                throw cds.error(422, 'wormholeNavigationSkill must be between 0 and 100');
            }

            // Find the position that matches the spacefarer's wormholeNavigationSkill
            const matchingPosition: Position | null = await this._getPositionBySkill(req, wormholeNavigationSkill);

            if (!matchingPosition) {
                throw cds.error(422, `No position found for wormholeNavigationSkill level ${wormholeNavigationSkill}`);
            }
            LOG.debug('Auto-assigning position based on skill level', { skill: wormholeNavigationSkill, position: matchingPosition.title });
            data.position_ID = matchingPosition.ID;

            if (!stardustCollection && stardustCollection !== 0) {
                throw cds.error(400, 'stardustCollection is required');
            }
            if (stardustCollection < 0 || stardustCollection > 100) {
                throw cds.error(422, 'stardustCollection must be between 0 and 100');
            }

            // Find and auto-assign the spacesuit color based on stardustCollection
            const matchingColorBoundary: SpacesuitColorBoundary | null = await this._getMatchingColorBoundary(req, stardustCollection);

            if (!matchingColorBoundary) {
                throw cds.error(422, `No spacesuit color found for stardustCollection level ${stardustCollection}`);
            }
            LOG.debug('Auto-assigning spacesuit color based on stardust collection', { stardust: stardustCollection, color: matchingColorBoundary.color });
            data.spacesuitColor = matchingColorBoundary.color;


            LOG.debug('Requested SpaceFarer', { data, position: matchingPosition });
        });

        /**
         * After hook: runs after the CREATE operation is executed, allowing us to perform actions based on the created entity.
         * Use case: send a notification to the spacefarer after they have been successfully created.
         * @see(https://cap.cloud.sap/docs/node.js/core-services#srv-after-request)
         */
        this.after('CREATE', SpaceFarer, async (
            createdSpaceFarer: SpaceFarerRow[],
            req: SpaceFarerCreateRequest
        ): Promise<void> => {
            const spacefarer = Array.isArray(createdSpaceFarer) ? createdSpaceFarer[0] : createdSpaceFarer;
            const spacefarerId = spacefarer.ID;

            LOG.debug('After CREATE SpaceFarer', { spacefarerId, spacefarer });

                        
            if (!this.#notificationService) {
                LOG.warn('Cannot send notification: notification service is not available', { spacefarerId });
                return;
            }

            if (!spacefarer?.email) {
                LOG.warn('Cannot send notification: spacefarer email missing from request', { spacefarerId });
                return;
            }
            
            // Retrieve the position title for the spacefarer to include in the notification email
            const position: Pick<PositionRow, 'title'> | null = spacefarer.position_ID
                ? await cds.tx(req).run(
                    SELECT.one.from('galactic.spacefarer.adventure.Position')
                        .columns('title')
                        .where({ ID: spacefarer.position_ID })
                )
                : null;

            LOG.debug('Sending cosmic notification email', { email: spacefarer.email, spacefarerId });

            const emailBody = this._generateEmailBody(spacefarer, position);

            const notificationPayload: NotificationPayload = {
                to: spacefarer.email,
                subject: `Welcome to the Galactic Spacefarer Adventure, ${spacefarer.firstName}! 🚀`,
                body: emailBody
            };

            try {
                await this.#notificationService.send(NOTIFICATION_EVENT, notificationPayload);
                LOG.info('✅ Cosmic notification sent successfully', { email: spacefarer.email });
            } catch (error) {
                LOG.error('❌ Failed to send cosmic notification', { error, email: spacefarer.email });
                // Don't throw - we don't want to fail the CREATE if email fails
            }
        });
        // Log any errors that occur during request processing
        // http://cap.cloud.sap/docs/node.js/core-services#srv-on-error
        this.on('error', (error: Error, request: cds.Request): void => {
            LOG.error('Error in SpacefarerService', { error, request });
        });

        return super.init();
    }

    private async _getMatchingColorBoundary(req: SpaceFarerCreateRequest, stardustCollection: number): Promise<SpacesuitColorBoundary | null> {
        return cds.tx(req).run( // https://cap.cloud.sap/docs/node.js/cds-tx
            SELECT.one // https://cap.cloud.sap/docs/node.js/cds-ql#one
                .from('galactic.spacefarer.adventure.SpacesuitColorBoundary') // https://cap.cloud.sap/docs/node.js/cds-ql#select-from
                .columns('ID', 'color', 'stardustCollection_min', 'stardustCollection_max') // https://cap.cloud.sap/docs/node.js/cds-ql#columns
                .where({
                    stardustCollection_min: { '<=': stardustCollection },
                    stardustCollection_max: { '>=': stardustCollection }
                }) // https://cap.cloud.sap/docs/node.js/cds-ql#where
        );
    }

    private async _getPositionBySkill(req: SpaceFarerCreateRequest, wormholeNavigationSkill: number): Promise<Position | null> {
        return cds.tx(req).run(
            SELECT.one
                .from('galactic.spacefarer.adventure.Position')
                .columns('ID', 'title', 'skillBoundary_min', 'skillBoundary_max')
                .where({
                    skillBoundary_min: { '<=': wormholeNavigationSkill },
                    skillBoundary_max: { '>=': wormholeNavigationSkill }
                })
        );
    }

    private _generateEmailBody(spacefarer: SpaceFarerRow, position: Pick<PositionRow, "title"> | null) {
        return `
Dear ${spacefarer.firstName} ${spacefarer.lastName},

🚀 Congratulations on embarking on your cosmic journey! 🚀

You have been successfully registered as a galactic spacefarer and assigned to the cosmic adventure program.

Your Cosmic Profile:
─────────────────────────────────────────
📍 Origin Planet: ${spacefarer.originPlanet || 'Unknown'}
🎓 Position: ${position?.title || 'To be determined'}
🌟 Wormhole Navigation Skill: ${spacefarer.wormholeNavigationSkill}/100
💫 Stardust Collection: ${spacefarer.stardustCollection}/100
👽 Spacesuit Color: ${spacefarer.spacesuitColor}
─────────────────────────────────────────

Your journey through the vast expanse of space awaits! May the cosmic winds guide you through wormholes and distant star systems. 

Welcome to the Galactic Spacefarer Adventure!

Best regards,
The Galactic Command Center 🌌`;
    }
}

module.exports = SpacefarerService;