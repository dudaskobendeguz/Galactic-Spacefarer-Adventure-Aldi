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
    firstName               : String(50)     @mandatory  @assert.pattern: '^[A-Za-z]+$'; // Only letters allowed
    lastName                : String(50)     @mandatory  @assert.pattern: '^[A-Za-z]+$'; // Only letters allowed
    email                   : String(255)    @mandatory  @assert.pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$'; // Basic email regex validation

    // Cosmic fields (Task 1 requirements)
    stardustCollection      : Decimal(10, 2) @assert.range: [(0), 100] default 0.0; // Stardust collection in decimal format with a range constraint
    wormholeNavigationSkill : UInt8          @assert.range: [(0), 100] default 1; // skill level 1–100 https://cap.cloud.sap/docs/guides/services/constraints#assertrange
    originPlanet            : OriginPlanet;
    spacesuitColor          : SpacesuitColor; // e.g. "Nebula Blue"

    // Associations to intergalactic departments and positions
    // [composition](https://cap.cloud.sap/docs/cds/common#composition) -> defines a strong ownership relationship between entities - if a SpaceFarer is deleted, the associated Department will also be deleted
    department              : Composition of Department on department.spaceFarer = $self @mandatory; // Each SpaceFarer must belong to one Department
    // [association](https://cap.cloud.sap/docs/cds/common#association) -> defines a relationship between entities - if a SpaceFarer is deleted, the associated Position will not be deleted
    position                : Association to Position @mandatory; // Each SpaceFarer must hold one Position
}


define entity Department : managed {
    //[key](https://cap.cloud.sap/docs/guides/databases/cdl-to-ddl#on-delete-cascade) -> defines the primary key of the entity to delete the child entity when the parent entity is deleted
    key spaceFarer: Association to one SpaceFarer; // Department is keyed by its owning SpaceFarer to enforce strict 1:1 (child) relationship
    name          : String(30) @mandatory;
}

// ─────────────────────────────────────────────
//  Spacefarer – Position Entity
//
define entity Position : cuid, managed {
    title      : PositionTitle @mandatory;
    spaceFarers: Association to many SpaceFarer on spaceFarers.position = $self; // Each Position can be held by multiple SpaceFarers
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
define type OriginPlanet   : String(20) @assert.pattern: '^[A-Za-z0-9- ]+$'; // Only letters, numbers, hyphens, and spaces allowed
