// Require your custom property entries.
import customProps from "./props/CustomProps";

var LOW_PRIORITY = 500;

export default function CustomPropertiesProvider(propertiesPanel, translate) {
    this.getTabs = function (element) {
        return function (entries) {
            let generalTab = entries.find((e) => e.id === "general");
            const groups = generalTab.groups;

            let generalGroup = groups.find((e) => e.id === "general");

            /*             let connectorTab = entries.find((e) => e.id === "connector");
                        const connectorGroups = connectorTab.groups;
                        console.log("connectorGroups", connectorGroups);
                        //          generalGroup.entries.concat(connectorGroups);
                        console.log("generalGroup", generalGroup); */

            if (element.type === "bpmn:ServiceTask") {
                generalTab.id = "config";
                generalTab.label = "Configuration";
                generalGroup.id = "config";
                generalGroup.label = "Configuration";
                //                customProps(generalGroup, element, translate);
                generalTab.groups = [generalGroup];
                /*     connectorGroups.forEach(connectorGroup => {
                        generalTab.groups.push(connectorGroup);
                    }); */


                entries = [generalTab];
            }

            return entries;
        };
    };

    // Register our custom  properties provider.
    // Use a lower priority to ensure it is loaded after the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ["propertiesPanel", "translate"];
