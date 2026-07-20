import cds from '@sap/cds';
import type { SpaceFarer as SpaceFarerRow, Position as PositionRow, SpacesuitColorBoundary as SpacesuitColorBoundaryRow } from '#cds-models/galactic/spacefarer/adventure/index.js';

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

    async init(): Promise<void> {
        const { SpaceFarer } = this.entities;
        const LOG = this.#logger;

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

    private async _getMatchingColorBoundary(req: SpaceFarerCreateRequest, stardustCollection: number): Promise<SpacesuitColorBoundary | null> {
        return cds.tx(req).run(
            SELECT.one
                .from('galactic.spacefarer.adventure.SpacesuitColorBoundary')
                .columns('ID', 'color', 'stardustCollection_min', 'stardustCollection_max')
                .where(`stardustCollection_min <= ${stardustCollection} AND stardustCollection_max >= ${stardustCollection}`)
        );
    }

    private async _getPositionBySkill(req: SpaceFarerCreateRequest, wormholeNavigationSkill: number): Promise<Position | null> {
        return cds.tx(req).run(
            SELECT.one
                .from('galactic.spacefarer.adventure.Position')
                .columns('ID', 'title', 'skillBoundary_min', 'skillBoundary_max')
                .where(`skillBoundary_min <= ${wormholeNavigationSkill} AND skillBoundary_max >= ${wormholeNavigationSkill}`)
        );
    }
}

module.exports = SpacefarerService;