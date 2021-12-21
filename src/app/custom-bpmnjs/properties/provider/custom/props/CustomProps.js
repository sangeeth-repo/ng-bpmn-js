import entryFactory from "bpmn-js-properties-panel/lib/factory/EntryFactory";

import { is } from "bpmn-js/lib/util/ModelUtil";

let taskOptions = [
    {
        name: 'Select a task',
        value: ''
    },
    {
        "name": "Get User",
        "value": {}
    },
    {
        "name": "Add User",
        "value": {}
    }
];

export default function (group, element, translate) {
    // Only return an entry, if the currently selected
    // element is a service task event.

    if (is(element, "bpmn:ServiceTask")) {
        group.entries.push(
            entryFactory.selectBox(translate, {
                id: "task",
                label: "Task",
                modelProperty: "task",
                selectOptions: taskOptions
            })
        );
    }
}
