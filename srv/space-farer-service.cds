using {galactic.spacefarer.adventure as my} from '../db/schema.cds';


/**
 * Service definition for the SpaceFarerService, exposing the SpaceFarer, Department, and Position entities.
 * - The service is defined in the 'galactic.spacefarer.adventure' namespace and provides access to the core entities of the Galactic Spacefarer Adventure application.
 * - The service is designed to [facilitate CRUD operations](https://cap.cloud.sap/docs/guides/services/served-ootb#serving-crud)
 *  on the SpaceFarer, Department, and Position entities, allowing clients to manage spacefarers and their associated departments and positions.
 * - The service is accessible via the path '/spacefarer-service'.
 */
@requires: 'authenticated-user'
service SpaceFarerService @(path: '/spacefarer-service') {
    @restrict: [
        {
            grant: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
            to   : 'SpacefarerViewer',
            where: [(originPlanet = $user.attr.planet)]
        },
        {
            grant: ['READ'],
            to   : 'SpacefarerAdmin'
        }
    ]
    entity SpaceFarer as projection on my.SpaceFarer;

    @readonly
    entity Department as projection on my.Department;

    @readonly
    entity Position   as projection on my.Position;
}
