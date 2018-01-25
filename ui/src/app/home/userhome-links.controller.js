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
export default function UserHomeLinksController(userService, dashboardService, customerService, types,
                                             $state, $stateParams, $translate) {
    var vm = this;
    vm.types = types;

    vm.dashboardGridConfig = {
        loadItemDetailsFunc: loadDashboard,
        clickItemFunc: openDashboard,
        getItemTitleFunc: getDashboardTitle,
        parentCtl: vm,
        onGridInited: gridInited,
        noItemsText: function() { return $translate.instant('dashboard.no-dashboards-text') },
    };

    if (angular.isDefined($stateParams.items) && $stateParams.items !== null) {
        vm.dashboardGridConfig.items = $stateParams.items;
    }

    if (angular.isDefined($stateParams.topIndex) && $stateParams.topIndex > 0) {
        vm.dashboardGridConfig.topIndex = $stateParams.topIndex;
    }

    vm.dashboardsScope = $state.$current.data.dashboardsType;
    var user = userService.getCurrentUser();

    vm.dashboardsScope = 'customer_user';
    var customerId = user.customerId;
    
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

    var fetchDashboardsFunction = function (pageLink) {
        return dashboardService.getCustomerDashboards(customerId, pageLink);
    };

    var refreshDashboardsParamsFunction = function () {
        return {"customerId": customerId, "topIndex": vm.topIndex};
    };

    vm.dashboardGridConfig.refreshParamsFunc = refreshDashboardsParamsFunction;
    vm.dashboardGridConfig.fetchItemsFunc = fetchDashboardsFunction;
    
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

