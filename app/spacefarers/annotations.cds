using SpaceFarerService as service from '../../srv/spacefarer-service';
annotate service.SpaceFarer with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
        {
            $Type : 'UI.DataField',
            Label : 'First Name',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Last Name',
            Value : lastName,
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@Communication.Contact#contact',
            Label : 'Contact',
        },
        {
            $Type : 'UI.DataField',
            Value : originPlanet,
            Label : 'Planet',
        },
        {
            $Type : 'UI.DataField',
            Value : position.title,
            Label : 'Title',
            @UI.Importance : #High,
        },
            {
                $Type : 'UI.DataField',
                Value : wormholeNavigationSkill,
                Label : 'Wormhole Navigation Skill',
            },
            {
                $Type : 'UI.DataField',
                Value : stardustCollection,
                Label : 'Stardust Collection',
            },
    ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : position.title,
            Label : 'Title',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Label : 'First Name',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Last Name',
            Value : lastName,
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@Communication.Contact#contact',
            Label : 'Contact',
        },
        {
            $Type : 'UI.DataField',
            Value : originPlanet,
            Label : 'Planet',
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.DataPoint#wormholeNavigationSkill',
            Label : 'Wormhole Navigation Skill',
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.Chart#stardustCollection',
            Label : 'Stardust Collection',
        },
    ],
    UI.SelectionFields : [
        position.title,
    ],
    UI.SelectionPresentationVariant #tableView : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem',
            ],
            SortOrder : [
                {
                    $Type : 'Common.SortOrderType',
                    Property : wormholeNavigationSkill,
                    Descending : true,
                },
                {
                    $Type : 'Common.SortOrderType',
                    Property : lastName,
                    Descending : false,
                },
                {
                    $Type : 'Common.SortOrderType',
                    Property : originPlanet,
                    Descending : false,
                },
            ],
            GroupBy : [
                spacesuitColor,
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : 'Table View',
    },
    UI.LineItem #tableView : [
    ],
    UI.SelectionPresentationVariant #tableView1 : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#tableView',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : 'Table View 1',
    },
    UI.DataPoint #wormholeNavigationSkill : {
        Value : wormholeNavigationSkill,
        Visualization : #Progress,
        TargetValue : 100,
        @Common.QuickInfo : position.title,
    },
    Communication.Contact #contact : {
        $Type : 'Communication.ContactType',
        fn : email,
        title : position.title,
        role : department.name,
        email : [
            {
                $Type : 'Communication.EmailAddressType',
                type : #work,
                address : email,
            },
        ],
        adr : [
            {
                $Type : 'Communication.AddressType',
                type : #work,
                country : originPlanet,
            },
        ],
    },
    UI.DataPoint #wormholeNavigationSkill1 : {
        Value : wormholeNavigationSkill,
        TargetValue : position.skillBoundary_max,
    },
    UI.Chart #wormholeNavigationSkill : {
        ChartType : #Donut,
        Measures : [
            wormholeNavigationSkill,
        ],
        MeasureAttributes : [
            {
                DataPoint : '@UI.DataPoint#wormholeNavigationSkill1',
                Role : #Axis1,
                Measure : wormholeNavigationSkill,
            },
        ],
    },
    UI.DataPoint #stardustCollection : {
        Value : stardustCollection,
        TargetValue : 100,
    },
    UI.Chart #stardustCollection : {
        ChartType : #Donut,
        Measures : [
            stardustCollection,
        ],
        MeasureAttributes : [
            {
                DataPoint : '@UI.DataPoint#stardustCollection',
                Role : #Axis1,
                Measure : stardustCollection,
            },
        ],
    },
    UI.FieldGroup #Updatedetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : wormholeNavigationSkill,
                Label : 'Wormhole Navigation Skill',
            },
            {
                $Type : 'UI.DataField',
                Value : stardustCollection,
                Label : 'Stardust Collection',
            },
        ],
    },
);

annotate service.SpaceFarer with {
    stardustCollection @(
        Common.Label : 'Stardust Collection',
        Validation.Minimum : 0,
        Validation.Maximum : 100,
    );

    wormholeNavigationSkill @(
        Common.Label : 'Wormhole Navigation Skill',
        Validation.Minimum : 0,
        Validation.Maximum : 100,
    );
};

annotate service.SpaceFarer with {
    position @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Position',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : position_ID,
                ValueListProperty : 'ID',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'title',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'skillBoundary_min',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'skillBoundary_max',
            },
        ],
    }
};

annotate service.SpaceFarer with {
    spacesuitColor @(
        Common.Label : 'spacesuitColor',
        Common.Text : lastName,
        )
};

annotate service.Position with {
    title @Common.Label : 'position/title'
};

annotate service.SpaceFarer with {
    stardustCollection @Measures.Unit : '%'
};

annotate service.SpaceFarer with {
    wormholeNavigationSkill @Measures.Unit : '/100'
};
// https://github.com/capire/xtravels/blob/b147a1daad27d11352e0d39b525b25ed3241c016/app/travels/capabilities.cds#L3
// https://cap.cloud.sap/docs/guides/uis/fiori#draft-enabled-entities
annotate service.SpaceFarer with @odata.draft.enabled: true;


