import cds from '@sap/cds';
import type { Department as DepartmentRow, SpaceFarer as SpaceFarerRow, Position as PositionRow, SpacesuitColorBoundary as SpacesuitColorBoundaryRow } from '#cds-models/galactic/spacefarer/adventure/index.js';
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

// make business-required fields required (example set)
type SpaceFarerCreateBody =
    Required<Pick<SpaceFarerCreateBodyBase, 'firstName' | 'lastName' | 'email' | 'department_ID'>> &
    Partial<Omit<SpaceFarerCreateBodyBase, 'firstName' | 'lastName' | 'email' | 'department_ID'>>

type SpaceFarerCreateRequest = cds.Request<SpaceFarerCreateBody>

type SpaceFarerUpdateBody = Partial<Pick<SpaceFarerCreateBody, 'wormholeNavigationSkill' | 'stardustCollection' | 'position_ID' | 'spacesuitColor' | 'email' | 'department_ID'>> & {
    ID: NonNullable<SpaceFarerRow['ID']>;
}

type SpaceFarerUpdateRequest = cds.Request<SpaceFarerUpdateBody>

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

type Department = {
    ID: NonNullable<DepartmentRow['ID']>;
    name: NonNullable<DepartmentRow['name']>;
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
            LOG.debug('Before CREATE SpaceFarer', { data });
            data.email = this.validateEmail(req, data.email);

            data.firstName = this.validateFirstName(req, data.firstName);
            data.lastName = this.validateLastName(req, data.lastName);
            data.department_ID = await this.validateDepartmentId(req, data.department_ID);

            const { wormholeNavigationSkill, stardustCollection } = data;
            // Find the position that matches the spacefarer's wormholeNavigationSkill
            const matchingPosition: Position | null = await this._getPositionBySkill(req, wormholeNavigationSkill);

            if (!matchingPosition) {
                throw req.reject({ status: 422, code: 'SPACEFARER_POSITION_NOT_FOUND', args: [wormholeNavigationSkill] });
            }
            LOG.debug('Auto-assigning position based on skill level', { skill: wormholeNavigationSkill, position: matchingPosition.title });
            data.position_ID = matchingPosition.ID;


            // Find and auto-assign the spacesuit color based on stardustCollection
            const matchingColorBoundary: SpacesuitColorBoundary | null = await this._getMatchingColorBoundary(req, stardustCollection);

            if (!matchingColorBoundary) {
                throw req.reject({ status: 422, code: 'SPACEFARER_SUIT_NOT_FOUND', args: [stardustCollection] });
            }
            LOG.debug('Auto-assigning spacesuit color based on stardust collection', { stardust: stardustCollection, color: matchingColorBoundary.color });
            data.spacesuitColor = matchingColorBoundary.color;


            LOG.debug('Requested SpaceFarer', { data, position: matchingPosition });
        });

        this.before('UPDATE', SpaceFarer, async (req: SpaceFarerUpdateRequest): Promise<void> => {
            const data: SpaceFarerUpdateBody = req.data;
            LOG.debug('Before UPDATE SpaceFarer', { data });
            const { wormholeNavigationSkill, stardustCollection, spacesuitColor, position_ID, email, department_ID } = data;

            if (email !== undefined) {
                data.email = this.validateEmail(req, email);
            }

            if (data.department_ID !== undefined) {
                data.department_ID = await this.validateDepartmentId(req, department_ID);
            }

            if (position_ID !== undefined && wormholeNavigationSkill === undefined) {
                throw req.reject({ status: 400, code: 'SPACEFARER_POSITION_DERIVED', target: 'wormholeNavigationSkill' });
            }

            if (spacesuitColor !== undefined && stardustCollection === undefined) {
                throw req.reject({ status: 400, code: 'SPACEFARER_SUIT_DERIVED', target: 'stardustCollection' });
            }

            if (wormholeNavigationSkill !== undefined) {
                const validatedWormholeNavigationSkill = this.validateWormholeNavigationSkill(req, data.wormholeNavigationSkill);
                // Find the position that matches the spacefarer's wormholeNavigationSkill
                const matchingPosition: Position | null = await this._getPositionBySkill(req, validatedWormholeNavigationSkill);

                if (!matchingPosition) {
                    throw req.reject({ status: 422, code: 'SPACEFARER_POSITION_NOT_FOUND', args: [validatedWormholeNavigationSkill] });
                }
                LOG.debug('Auto-assigning position based on skill level', { skill: validatedWormholeNavigationSkill, position: matchingPosition.title });
                data.position_ID = matchingPosition.ID;
            }

            if (stardustCollection !== undefined) {
                const validatedStardustCollection = this.validateStardustCollection(req, data.stardustCollection);
                // Find and auto-assign the spacesuit color based on stardustCollection
                const matchingColorBoundary: SpacesuitColorBoundary | null = await this._getMatchingColorBoundary(req, validatedStardustCollection);

                if (!matchingColorBoundary) {
                    throw req.reject({ status: 422, code: 'SPACEFARER_SUIT_NOT_FOUND', args: [validatedStardustCollection] });
                }
                LOG.debug('Auto-assigning spacesuit color based on stardust collection', { stardust: validatedStardustCollection, color: matchingColorBoundary.color });
                data.spacesuitColor = matchingColorBoundary.color;
            }
        });

        /**
         * After hook: runs after the CREATE operation is executed, allowing us to perform actions based on the created entity.
         * Use case: send a notification to the spacefarer after they have been successfully created.
         * @see(https://cap.cloud.sap/docs/node.js/core-services#srv-after-request)
         */
        this.after('CREATE', SpaceFarer, async (
            _createdSpaceFarer,
            req: SpaceFarerCreateRequest
        ): Promise<void> => {
            // CAP passes an InsertResult (raw DB result) as the first argument for CREATE,
            // not the entity row. req.data holds the full payload as modified by the before hook.
            const spacefarer = req.data as SpaceFarerRow;
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

    private async validateDepartmentId(req: SpaceFarerCreateRequest | SpaceFarerUpdateRequest, departmentId: string | null | undefined): Promise<string> {
        if (!departmentId) {
            throw req.reject({ status: 400, code: 'SPACEFARER_DEPARTMENT_REQUIRED', target: 'department_ID' });
        }

        const department: Department | null = await cds.tx(req).run(
            SELECT.one
                .from('galactic.spacefarer.adventure.Department')
                .columns('ID', 'name')
                .where({ ID: departmentId })
        );

        if (!department) {
            throw req.reject({ status: 422, code: 'SPACEFARER_DEPARTMENT_NOT_FOUND', target: 'department_ID', args: [departmentId] });
        }

        return departmentId;
    }

    private validateStardustCollection(req: cds.Request, stardustCollection: number | null | undefined) {
        if (!stardustCollection && stardustCollection !== 0) {
            throw req.reject({ status: 400, code: 'SPACEFARER_STARDUST_REQUIRED', target: 'stardustCollection' });
        }
        if (stardustCollection < 0 || stardustCollection > 100) {
            throw req.reject({ status: 422, code: 'SPACEFARER_STARDUST_RANGE', target: 'stardustCollection' });
        }
        return stardustCollection;
    }

    private validateWormholeNavigationSkill(req: cds.Request, wormholeNavigationSkill: number | null | undefined) {
        if (!wormholeNavigationSkill && wormholeNavigationSkill !== 0) {
            throw req.reject({ status: 400, code: 'SPACEFARER_WORMHOLE_REQUIRED', target: 'wormholeNavigationSkill' });
        }
        if (wormholeNavigationSkill < 0 || wormholeNavigationSkill > 100) {
            throw req.reject({ status: 422, code: 'SPACEFARER_WORMHOLE_RANGE', target: 'wormholeNavigationSkill' });
        }
        return wormholeNavigationSkill;
    }

    private validateFirstName(req: SpaceFarerCreateRequest, firstName: string | null): string | null {
        if (!firstName || firstName.trim() === '') {
            throw req.reject({ status: 400, code: 'SPACEFARER_FIRSTNAME_REQUIRED', target: 'firstName' });
        }
        return firstName;

    }

    private validateLastName(req: SpaceFarerCreateRequest, lastName: string | null): string | null {
        if (!lastName || lastName.trim() === '') {
            throw req.reject({ status: 400, code: 'SPACEFARER_LASTNAME_REQUIRED', target: 'lastName' });
        }
        return lastName;
    }

    private validateEmail(req: cds.Request, email: string | null | undefined): string {
        if (!email) {
            throw req.reject({ status: 400, code: 'SPACEFARER_EMAIL_REQUIRED', target: 'email' });
        }

        const normalizedEmail = email.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            throw req.reject({ status: 422, code: 'SPACEFARER_EMAIL_INVALID', target: 'email' });
        }

        return normalizedEmail;
    }

    private async _getMatchingColorBoundary(req: SpaceFarerCreateRequest | SpaceFarerUpdateRequest, stardustCollection: number | null | undefined): Promise<SpacesuitColorBoundary | null> {
        const validatedStardustCollection = this.validateStardustCollection(req, stardustCollection);

        return cds.tx(req).run( // https://cap.cloud.sap/docs/node.js/cds-tx
            SELECT.one // https://cap.cloud.sap/docs/node.js/cds-ql#one
                .from('galactic.spacefarer.adventure.SpacesuitColorBoundary') // https://cap.cloud.sap/docs/node.js/cds-ql#select-from
                .columns('ID', 'color', 'stardustCollection_min', 'stardustCollection_max') // https://cap.cloud.sap/docs/node.js/cds-ql#columns
                .where({
                    stardustCollection_min: { '<=': validatedStardustCollection },
                    stardustCollection_max: { '>=': validatedStardustCollection }
                }) // https://cap.cloud.sap/docs/node.js/cds-ql#where
        );
    }

    private async _getPositionBySkill(req: SpaceFarerCreateRequest | SpaceFarerUpdateRequest, wormholeNavigationSkill: number | null | undefined): Promise<Position | null> {
        const validatedWormholeNavigationSkill = this.validateWormholeNavigationSkill(req, wormholeNavigationSkill);

        return cds.tx(req).run(
            SELECT.one
                .from('galactic.spacefarer.adventure.Position')
                .columns('ID', 'title', 'skillBoundary_min', 'skillBoundary_max')
                .where({
                    skillBoundary_min: { '<=': validatedWormholeNavigationSkill },
                    skillBoundary_max: { '>=': validatedWormholeNavigationSkill }
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

export default SpacefarerService;