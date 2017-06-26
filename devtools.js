// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* Sidebar extension to display details about Ractive Components
 * Currently displays:
 * Component name
 * Data properties
 * Computed properties
 */
chrome.devtools.panels.elements.createSidebarPane(
    "Ractive Data Test",
    function(sidebar) {

        /*
         *  Queries the name of the selected component and passes the result to updatePane
         */
        function update() {
            chrome.devtools.inspectedWindow.eval('Ractive.getNodeInfo($0).ractive.component.name', updatePane);
        }

        /*
         *  Parses the getQuery function to a string then wraps it to make it evaluate as an expression. 
         *  Sends the result to the sidebar
         *  @param compName the name of the component being queried
         */
        function updatePane(compName) {
            var query = "(" + getQuery.toString() + ")()";
            sidebar.setExpression(query, compName);
        }
        
        /*
         * The chrome console query, can use all libraries available to the console as it is not called outside that context.
         */
        function getQuery() {

            var properties = {};

            // Data properties
            if (!$0 || !$0._ractive) { // if there is no (ractive) node selected
                return {message: 'Select a Ractive node for more details'};
            } else if ($0._ractive.root) { // Ractive version 0.7
                Object.assign(properties, Ractive.getNodeInfo($0).ractive.get());       //{{potential better query?}}
                //Object.assign(properties, $0._ractive.root.get($0._ractive.keypath.str));
            } else if ($0._ractive.fragment &&$0._ractive.fragment.findContext) { // Ractive version 0.8
                Object.assign(properties, $0._ractive.fragment.findContext.get());
            } else {
                return {message: 'Unsupported Ractive version, 0.7 and 0.8 are currently supported'};
            }

            // computed properties
            var comp = Ractive.getNodeInfo($0).ractive.viewmodel.computations;
            
            // adds computed properties to data properties and returns the result
            return Object.keys(comp)
                .filter(key => !key.startsWith('${'))
                .reduce((acc, key) => {
                    acc[key] = comp[key].getter();
                    return acc;
                }, properties);
            
        }

        // runs initial update
        update();
        // every time the selection changes in the elements panel, update is called
        chrome.devtools.panels.elements.onSelectionChanged.addListener(update); 
    }
);