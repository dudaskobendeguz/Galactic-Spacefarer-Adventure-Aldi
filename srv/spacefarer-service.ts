import cds from '@sap/cds';
import type { SpaceFarer as SpaceFarerRow, Position as PositionRow } from '#cds-models/galactic/spacefarer/adventure/index.js';

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
        position_ID: string;
        department: SpaceFarerDepartmentCreateBody;
    }

type SpaceFarerCreateRequest = cds.Request<SpaceFarerCreateBody>

type SpaceFarerReadResults = SpaceFarerRow | SpaceFarerRow[] | null;

type Position = {
    title: NonNullable<PositionRow['title']>;
    skillBoundary_min: NonNullable<PositionRow['skillBoundary_min']>;
    skillBoundary_max: NonNullable<PositionRow['skillBoundary_max']>;
};

class SpacefarerService extends cds.ApplicationService {
    #logger: ReturnType<typeof cds.log> = cds.log('spacefarer-service');

    async init(): Promise<void> {
        const { SpaceFarer } = this.entities;
        const LOG = this.#logger;

        // Inspect the requested key before the CREATE operation to validate the payload against the Position's skill boundaries
        // https://cap.cloud.sap/docs/node.js/core-services#srv-before-request
        this.before('CREATE', SpaceFarer, async (req: SpaceFarerCreateRequest): Promise<void> => {
            const data: SpaceFarerCreateBody = req.data;

            // get position from DB to validate against skill boundaries
            const position: Position | null = await cds.tx(req).run(
                SELECT.one
                    .from('galactic.spacefarer.adventure.Position')
                    .where({ ID: data.position_ID })
                    .columns('title', 'skillBoundary_min', 'skillBoundary_max')
            );

            if (!position) {
                throw cds.error(404, `Position with ID ${data.position_ID} not found`);
            }

            await this.validateCreateSpaceFarer(data, position);

            LOG.debug('Requested SpaceFarer', { data, position });
        });

        this.after('CREATE', SpaceFarer, async function readSpaceFarer(
            results: SpaceFarerReadResults,
            req: SpaceFarerCreateRequest
        ): Promise<void> {
            const id: string | undefined = req.params?.[0]?.ID;

            if (!id) return;

            LOG.debug('Responding with SpaceFarer', { id, results });
        });

        // Log any errors that occur during request processing
        // http://cap.cloud.sap/docs/node.js/core-services#srv-on-error
        this.on('error', (error: Error, request: cds.Request): void => {
            LOG.error('Error in SpacefarerService', { error, request });
        });

        return super.init();
    }
    private async validateCreateSpaceFarer(data: SpaceFarerCreateBody, position: Position): Promise<void> {
        this.#logger.debug('Validating SpaceFarer creation', { data, position });
        if (!data?.wormholeNavigationSkill || data.wormholeNavigationSkill < 0 || data.wormholeNavigationSkill > 100) {
            throw cds.error(422, 'wormholeNavigationSkill must be between 0 and 100');
        }
        if (data.wormholeNavigationSkill < position.skillBoundary_min || data.wormholeNavigationSkill > position.skillBoundary_max) {
            throw cds.error(422, `wormholeNavigationSkill must be between ${position.skillBoundary_min} and ${position.skillBoundary_max} for position ${position.title}`);
        }
    }
}

module.exports = SpacefarerService;