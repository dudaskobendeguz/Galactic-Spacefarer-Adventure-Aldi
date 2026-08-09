using {
    cuid,
    managed
} from '@sap/cds/common';

namespace galactic.spacefarer.adventure;
// ─────────────────────────────────────────────
//  Spacefarer – Core Entity
// ───────────────────────────────────────────────
// [managed](https://cap.cloud.sap/docs/cds/common#aspect-managed) -> adds createdAt, createdBy, modifiedAt, modifiedBy
// [cuid](https://cap.cloud.sap/docs/cds/common#aspect-cuid) -> shrtcut to UUID
define entity SpaceFarer : cuid, managed {
    // Personal information
    firstName               : String(50)     @mandatory  @assert.format: '^[A-Za-z0-9-]+$' @assert.format.message: '{i18n>SPACEFARER_FIRSTNAME_FORMAT}'; // Only letters, numbers, and hyphens allowed
    lastName                : String(50)     @mandatory  @assert.format: '^[A-Za-z0-9-]+$' @assert.format.message: '{i18n>SPACEFARER_LASTNAME_FORMAT}'; // Only letters, numbers, and hyphens allowed
    email                   : String(255)    @mandatory  @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$' @assert.format.message: '{i18n>SPACEFARER_EMAIL_FORMAT_MODEL}'; // Basic email regex validation

    // Cosmic fields (Task 1 requirements)
    stardustCollection      : Decimal(10, 2) @assert.range: [(0), 100] default 0.0; // Stardust collection in decimal format with a range constraint
    wormholeNavigationSkill : Integer        @mandatory @assert.range: [(0), 100] default 1; // skill level 1–100 https://cap.cloud.sap/docs/guides/services/constraints#assertrange
    originPlanet            : OriginPlanet;
    // spacesuitColor is auto-assigned based on stardustCollection
    spacesuitColor          : SpacesuitColor; // e.g. "Nebula Blue"

    // Associations to intergalactic departments and positions
    department_ID           : UUID           @mandatory @assert.mandatory.message: '{i18n>SPACEFARER_DEPARTMENT_MANDATORY}';
    // [association](https://cap.cloud.sap/docs/cds/common#association) -> SpaceFarer references an existing Department master record
    department              : Association to Department on department.ID = $self.department_ID; // Each SpaceFarer must belong to one Department
    position_ID             : UUID;
    // [association](https://cap.cloud.sap/docs/cds/common#association) -> defines a relationship between entities - if a SpaceFarer is deleted, the associated Position will not be deleted
    position                : Association to Position on position.ID = $self.position_ID; // Each SpaceFarer must hold one Position (auto-assigned based on wormholeNavigationSkill)
}


// ─────────────────────────────────────────────
//  Spacefarer – Department Entity
// ─────────────────────────────────────────────
define entity Department : cuid, managed {
    name          : String(30) @mandatory;
    spaceFarers   : Association to many SpaceFarer on spaceFarers.department = $self;
}

// ─────────────────────────────────────────────
//  Spacefarer – Spacesuit Color Boundary Entity
// ─────────────────────────────────────────────
define entity SpacesuitColorBoundary : cuid, managed {
    color                       : SpacesuitColor @mandatory;
    stardustCollection_min      : Decimal(10, 2) @assert.range: [(0), 100] @mandatory; // Minimum stardust collection level
    stardustCollection_max      : Decimal(10, 2) @assert.range: [(0), 100] @mandatory; // Maximum stardust collection level
}

// ─────────────────────────────────────────────
//  Spacefarer – Position Entity
// 
define entity Position : cuid, managed {
    title               : PositionTitle @mandatory;
    skillBoundary_min   : UInt8 @assert.range: [(0), 100] @mandatory; // Minimum wormholeNavigationSkill level required
    skillBoundary_max   : UInt8 @assert.range: [(0), 100] @mandatory; // Maximum wormholeNavigationSkill level allowed
    spaceFarers         : Association to many SpaceFarer on spaceFarers.position = $self; // Each Position can be held by multiple SpaceFarers
}

// ─────────────────────────────────────────────
//  Spacefarer – Position Title Enum
// ─────────────────────────────────────────────
define type PositionTitle  : String(30) enum {
    CAPTAIN = 'Captain';
    COMMANDER = 'Commander';
    LIEUTENANT_COMMANDER = 'Lieutenant Commander';
    LIEUTENANT = 'Lieutenant';
    NAVIGATOR = 'Navigator';
    SCIENCE_OFFICER = 'Science Officer';
    CHIEF_ENGINEER = 'Chief Engineer';
};


// ─────────────────────────────────────────────
//  Spacefarer – Spacesuit Color Enum
// ─────────────────────────────────────────────
define type SpacesuitColor : String(30) enum {
    NEBULA_BLUE = 'Nebula Blue';
    COSMIC_RED = 'Cosmic Red';
    GALACTIC_GREEN = 'Galactic Green';
    STELLAR_SILVER = 'Stellar Silver';
    QUANTUM_PURPLE = 'Quantum Purple';
};


// ─────────────────────────────────────────────
//  Spacefarer – Origin Planet Type Definition
// ─────────────────────────────────────────────
define type OriginPlanet   : String(20) @assert.format: '^[A-Za-z0-9- ]+$' @assert.format.message: '{i18n>SPACEFARER_ORIGIN_PLANET_FORMAT}'; // Only letters, numbers, hyphens, and spaces allowed
