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
export default function UserHomeLinksController( customerService, 
                                               types, utils, dashboardUtils, widgetService, userService,
                                             dashboardService, timeService, entityService, itembuffer, importExport, hotkeys, $window, $rootScope,
                                             $scope, $element, $state, $stateParams, $mdDialog, $mdMedia, $timeout, $document, $q, $translate) {
    var vm = this;
    vm.types = types;
    
	vm.dashboardGridConfig = {
		getItemTitleFunc: getDashboardTitle,
		parentCtl: vm,
		onGridInited: gridInited,
		noItemsText: function() { return $translate.instant('dashboard.no-dashboards-text') }
	};
	
	if (angular.isDefined($stateParams.items) && $stateParams.items !== null) {
		vm.dashboardGridConfig.items = $stateParams.items;
	}
	
	if (angular.isDefined($stateParams.topIndex) && $stateParams.topIndex > 0) {
		vm.dashboardGridConfig.topIndex = $stateParams.topIndex;
	}
	
	vm.dashboardsScope = $state.$current.data.dashboardsType;
	vm.user = userService.getCurrentUser();
	
	vm.dashboardsScope = 'customer_user';
	vm.currentCustomerId = vm.user.customerId;
	
	if (vm.currentCustomerId) {
		vm.customerDashboardsTitle = $translate.instant('customer.dashboards');
		customerService.getShortCustomerInfo(vm.currentCustomerId).then(
			function success(info) {
				if (info.isPublic) {
					vm.customerDashboardsTitle = $translate.instant('customer.public-dashboards');
				}
			}
		);
	}
	
	var fetchDashboardsFunction = function (pageLink) {
		return dashboardService.getCustomerDashboards(vm.currentCustomerId, pageLink);
	};
	
	var refreshDashboardsParamsFunction = function () {
		return {"customerId": vm.currentCustomerId, "topIndex": vm.topIndex};
	};
	
	vm.dashboardGridConfig.refreshParamsFunc = refreshDashboardsParamsFunction;
	vm.dashboardGridConfig.fetchItemsFunc = fetchDashboardsFunction;
	
	function getDashboardTitle(dashboard) {
		return dashboard ? dashboard.title : '';
	}
	
	function gridInited(grid) {
		vm.grid = grid;
	}
}

