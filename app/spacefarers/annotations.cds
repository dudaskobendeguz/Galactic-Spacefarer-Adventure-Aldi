using SpaceFarerService as service from '../../srv/spacefarer-service';
annotate service.SpaceFarer with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>labelFirstName}',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>labelLastName}',
            Value : lastName,
        },
            {
                $Type : 'UI.DataField',
                Value : email,
                Label : '{i18n>labelContact}',
            },
        {
            $Type : 'UI.DataField',
            Value : originPlanet,
            Label : '{i18n>labelPlanet}',
        },
        {
            $Type : 'UI.DataField',
            Value : position.title,
            Label : '{i18n>labelTitleDerived}',
            @UI.Importance : #High,
        },
            {
                $Type : 'UI.DataField',
                Value : wormholeNavigationSkill,
                Label : '{i18n>labelWormholeNavigationSkill}',
            },
            {
                $Type : 'UI.DataField',
                Value : stardustCollection,
                Label : '{i18n>labelStardustCollection}',
            },
    ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : '{i18n>labelGeneralInformation}',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Department',
            ID : 'Department',
            Target : '@UI.FieldGroup#Department',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : position.title,
            Label : '{i18n>labelTitleDerived}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>labelFirstName}',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>labelLastName}',
            Value : lastName,
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@Communication.Contact#contact',
            Label : '{i18n>labelContact}',
        },
        {
            $Type : 'UI.DataField',
            Value : originPlanet,
            Label : '{i18n>labelPlanet}',
        },
        {
            $Type : 'UI.DataField',
            Value : department.name,
            Label : '{i18n>LabelDepartment}',
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.DataPoint#wormholeNavigationSkill',
            Label : '{i18n>labelWormholeNavigationSkill}',
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.Chart#stardustCollection',
            Label : '{i18n>labelStardustCollection}',
        },
    ],
    UI.SelectionFields : [
        firstName,
        lastName,
        position.title,
        department.name,
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
                    Property : firstName,
                    Descending : false,
                },
                {
                    $Type : 'Common.SortOrderType',
                    Property : lastName,
                    Descending : false,
                },
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : '{i18n>textTableView}',
    },
    UI.LineItem #tableView : [
    ],
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
                Label : '{i18n>labelWormholeNavigationSkill}',
            },
            {
                $Type : 'UI.DataField',
                Value : stardustCollection,
                Label : '{i18n>labelStardustCollection}',
            },
        ],
    },
    UI.FieldGroup #Department : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : department_ID,
                Label : '{i18n>labelDepartmentName}',
            },
        ],
    },
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : firstName,
        },
        TypeName : '',
        TypeNamePlural : '',
    },
);

annotate service.SpaceFarer with {
    stardustCollection @(
        Common.Label : '{i18n>labelStardustCollection}',
        Validation.Minimum : 0,
        Validation.Maximum : 100,
    );

    wormholeNavigationSkill @(
        Common.Label : '{i18n>labelWormholeNavigationSkill}',
        Validation.Minimum : 0,
        Validation.Maximum : 100,
    );
};

annotate service.SpaceFarer with {
    position @(
        Common.FieldControl : #ReadOnly,
        Common.Text : position.title,
        Common.Text.@UI.TextArrangement : #TextOnly,
    )
};

annotate service.SpaceFarer with {
    spacesuitColor @(
        Common.Label : '{i18n>labelSpacesuitColorDerived}',
        Common.FieldControl : #ReadOnly,
        )
};

annotate service.Position with {
    title @(
        Common.Label : '{i18n>labelTitle}',
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Position',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : title,
                    ValueListProperty : 'title',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
        )
};

annotate service.SpaceFarer with {
    stardustCollection @Measures.Unit : '%'
};

annotate service.SpaceFarer with {
    firstName @(
        Common.Label : '{i18n>labelFirstName}',
        )
};

annotate service.SpaceFarer with {
    lastName @(
        Common.Label : '{i18n>labelLastName}',
        )
};

annotate service.SpaceFarer with {
    department_ID @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Department',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : department_ID,
                    ValueListProperty : 'ID',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
        Common.Text : department.name,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.Department with {
    name @(
        Common.Label : '{i18n>labelDepartmentName}',
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Department',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : name,
                    ValueListProperty : 'name',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    )
};

annotate service.Department with {
    ID @(
        Common.Text : name,
        Common.Text.@UI.TextArrangement : #TextOnly,
    )
};

