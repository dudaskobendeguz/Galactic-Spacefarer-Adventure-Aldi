import JourneyRunner from "sap/fe/test/JourneyRunner";
import ListReport from "sap/fe/test/ListReport";
import ObjectPage from "sap/fe/test/ObjectPage";
import CustomSpaceFarerListGenerated from "./SpaceFarerList.gen";
import CustomSpaceFarerObjectPageGenerated from "./SpaceFarerObjectPage.gen";

const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("galactic/spacefarer/adventure/spacefarers") + "/test/flp.html#app-preview",
    pages: {
        onTheSpaceFarerListGenerated: new ListReport(
            {
                appId: "galactic.spacefarer.adventure.spacefarers",
                componentId: "SpaceFarerList",
                entitySet: "",
                contextPath: "/SpaceFarer"
            },
            CustomSpaceFarerListGenerated
        ),
        onTheSpaceFarerObjectPageGenerated: new ObjectPage(
            {
                appId: "galactic.spacefarer.adventure.spacefarers",
                componentId: "SpaceFarerObjectPage",
                entitySet: "",
                contextPath: "/SpaceFarer"
            },
            CustomSpaceFarerObjectPageGenerated
        )
    },
    async: true
});

export default runner;
