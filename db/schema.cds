using {
    cuid,
    managed
} from '@sap/cds/common';

// ─────────────────────────────────────────────
//  Spacefarer – Core Entity
// ───────────────────────────────────────────────
// [managed](https://cap.cloud.sap/docs/cds/common#aspect-managed) -> adds createdAt, createdBy, modifiedAt, modifiedBy
// [cuid](https://cap.cloud.sap/docs/cds/common#aspect-cuid) -> shrtcut to UUID
define entity SpaceFarer : cuid, managed { 
    // Personal information
    firstName   : String(50)  @mandatory @assert.pattern: '^[A-Za-z]+$'; // Only letters allowed
    lastName    : String(50)  @mandatory @assert.pattern: '^[A-Za-z]+$'; // Only letters allowed
    email       : String(255) @mandatory @assert.format : 'email'; // email format validation

    // Cosmic fields (Task 1 requirements)
    starudstCollection      : Decimal(10, 2) @assert.range: [(0), 100] default 0.0; // Stardust collection in decimal format with a range constraint
    wormholeNavigationSkill : UInt8          @assert.range: [(0), 100] default 1; // skill level 1–100 https://cap.cloud.sap/docs/guides/services/constraints#assertrange
    originPlanet            : originPlanet;
    spacesuitColor          : spacesuitColor;               // e.g. "Nebula Blue"
}


// ─────────────────────────────────────────────
//  Spacefarer – Spacesuit Color Enum
// ─────────────────────────────────────────────
define type spacesuitColor : String(30) enum {
    NEBULA_BLUE = 'Nebula Blue';
    COSMIC_RED = 'Cosmic Red';
    GALACTIC_GREEN = 'Galactic Green';
    STELLAR_SILVER = 'Stellar Silver';
    QUANTUM_PURPLE = 'Quantum Purple';
};


// ─────────────────────────────────────────────
//  Spacefarer – Origin Planet Enum
// ─────────────────────────────────────────────
define type originPlanet : String(20) @assert.pattern: '^[A-Za-z0-9- ]+$'; // Only letters, numbers, hyphens, and spaces allowed
