/*
 * Copyright © 2016-2017 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*@ngInject*/
export default function UserHomeLinksController(userService, dashboardService, customerService, importExport, types,
                                             $state, $stateParams, $mdDialog, $document, $q, $translate) {
    var customerId = $stateParams.customerId;
    var vm = this;
    vm.types = types;

    vm.dashboardGridConfig = {
        loadItemDetailsFunc: loadDashboard,
        clickItemFunc: openDashboard,
        getItemTitleFunc: getDashboardTitle,
        parentCtl: vm,
        onGridInited: gridInited,
        noItemsText: function() { return $translate.instant('dashboard.no-dashboards-text') },
        itemDetailsText: function() { return $translate.instant('dashboard.dashboard-details') },
        isDetailsReadOnly: function () { return vm.dashboardsScope === 'customer_user';},
        isSelectionEnabled: function () { return !(vm.dashboardsScope === 'customer_user');}
    };

    if (angular.isDefined($stateParams.items) && $stateParams.items !== null) {
        vm.dashboardGridConfig.items = $stateParams.items;
    }

    if (angular.isDefined($stateParams.topIndex) && $stateParams.topIndex > 0) {
        vm.dashboardGridConfig.topIndex = $stateParams.topIndex;
    }

    vm.dashboardsScope = $state.$current.data.dashboardsType;
    initController();
    function initController() {
        var fetchDashboardsFunction = null;
        var deleteDashboardFunction = null;
        var refreshDashboardsParamsFunction = null;

        var user = userService.getCurrentUser();

        if (user.authority === 'CUSTOMER_USER') {
            vm.dashboardsScope = 'customer_user';
            customerId = user.customerId;
        }

        if (customerId) {
            vm.customerDashboardsTitle = $translate.instant('customer.dashboards');
            customerService.getShortCustomerInfo(customerId).then(
                function success(info) {
                    if (info.isPublic) {
                        vm.customerDashboardsTitle = $translate.instant('customer.public-dashboards');
                    }
                }
            );
        }

        fetchDashboardsFunction = function (pageLink) {
            return dashboardService.getCustomerDashboards(customerId, pageLink);
        };

        refreshDashboardsParamsFunction = function () {
            return {"customerId": customerId, "topIndex": vm.topIndex};
        };

        vm.dashboardGridConfig.refreshParamsFunc = refreshDashboardsParamsFunction;
        vm.dashboardGridConfig.fetchItemsFunc = fetchDashboardsFunction;
        vm.dashboardGridConfig.deleteItemFunc = deleteDashboardFunction;
    }
    
    function loadDashboard(dashboard) {
        return dashboardService.getDashboard(dashboard.id.id);
    }

    function openDashboard($event, dashboard) {
        if ($event) {
            $event.stopPropagation();
        }
        if (vm.dashboardsScope === 'customer') {
            $state.go('home.customers.dashboards.dashboard', {
                customerId: customerId,
                dashboardId: dashboard.id.id
            });
        } else {
            $state.go('home.dashboards.dashboard', {dashboardId: dashboard.id.id});
        }
    }

    function getDashboardTitle(dashboard) {
        return dashboard ? dashboard.title : '';
    }

    function gridInited(grid) {
        vm.grid = grid;
    }
}

