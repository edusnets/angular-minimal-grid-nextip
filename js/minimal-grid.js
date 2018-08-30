(function () {

  angular.module('ngMinimalGrid', [])

    .provider('minimalGridConfig',function(){
      this.statsMessage = 'Showing %1 to %2 of %3 results'
      this.setStatsMessage = function(message){
        this.statsMessage = message
        return this
      }

      this.firstButtonLabel = 'First'
      this.setFirstLabel = function(label){
        this.firstButtonLabel = label
        return this
      }
      
      this.lastButtonLabel = 'Last'
      this.setLastLabel = function(label){
        this.lastButtonLabel = label
        return this
      }
      
      this.$get = function(){
        return this
      }
    })
    
    .controller('minimalGridCtrl', ['$scope', '$parse', '$filter', 'minimalGridConfig', '$sce', function($scope, $parse, $filter, minimalGridConfig, $sce){
      
      $scope.firstButtonLabel = minimalGridConfig.firstButtonLabel
      $scope.lastButtonLabel = minimalGridConfig.lastButtonLabel

      // model
      if (!angular.isArray($scope.rows)){
        throw new Error('minimalGrid error: rows must be an Array')
      }
      $scope.$watchCollection('rows', function (newRows) {
        setData(newRows)

        if (!$scope.fake) {
          updatePagesTotal($scope.data.length)
          updatePages()

          if ($scope._lastColumnOrderBy) $scope.changeOrderBy($scope._lastColumnOrderBy)
          if ($scope._lastPagePaginate) $scope.changePaginate($scope._lastPagePaginate)
        }
      })

      if ($scope.fake || $scope.totalRows) {
        $scope.$watch('totalRows', function (newTotal) {
          $scope._lastTotalPopulatePages = newTotal
          updatePagesTotal(newTotal)
          updatePages()
        })
      }

      // local binds
      $scope.columnParse = function (assign, obj, columns) {
        var getter = $parse(assign)
        var value = getter(obj)
        if (columns.formatDate) {
          value = $filter('date')(value * 1000, columns.formatDate, '+0000')
        }
        if (!!columns.onRender){
          return $sce.trustAsHtml( (""+columns.onRender(value)).toString() )
        }else{
          return value
        }
      }

      $scope.statsParse = function () {
        var message = minimalGridConfig.statsMessage
        var first = (($scope.pages.current - 1) * $scope.pages.max) > 0 ? (($scope.pages.current - 1) * $scope.pages.max) + 1 : ($scope._data.length > 0) ? 1 : 0;
        if (!$scope.fake) {
          var last = ((($scope.pages.current - 1) * $scope.pages.max) + $scope.pages.max) < $scope._data.length ? ((($scope.pages.current - 1) * $scope.pages.max) + $scope.pages.max) : $scope._data.length
          var total = $scope._data.length
        } else {
          if ($scope._lastTotalPopulatePages != undefined) {
            var last = ((($scope.pages.current - 1) * $scope.pages.max) + $scope.pages.max) < $scope._lastTotalPopulatePages ? ((($scope.pages.current - 1) * $scope.pages.max) + $scope.pages.max) : $scope._lastTotalPopulatePages
            var total = $scope._lastTotalPopulatePages
          } else {
            var last = 0
            var total = 0
          }
        }
        return message.replace('%1', first).replace('%2', last).replace('%3', total)
      }

      $scope.changeOrderBy = function (column) {
        if ($scope._lastColumnOrderBy != column) {
          var classes = column.class
          $scope.columns.map(function (val) {
            val.class = 'sorting'
          })
          column.class = (classes == 'sorting_asc') ? 'sorting_desc' : 'sorting_asc'

          $scope._lastColumnOrderBy = Object.assign({}, column)
        }

        if (!$scope.fake) {
          if ($scope.pages.current != 1) {
            $scope.pages.current = 1
            setData($scope._data)
            updatePages()
          }

          var data = $filter('orderBy')($scope.data, column.key, (column.class == 'sorting_desc'))
          setData(data)
        }

        if (angular.isDefined($scope.changeOrderByCallback)) {
          if (!angular.isFunction($scope.changeOrderByCallback)){
            throw new Error('minimalGrid error: on-change-order-by must be a Function')
          }

          $scope.changeOrderByCallback({
            orderBy: {
              orderdirection: column.class.replace('sorting_', ''),
              orderby: column.key
            }
          })
        }
      }

      $scope.changePaginate = function (page) {
        $scope._lastPagePaginate = Number(page)
        $scope.pages.current = page

        updatePages()

        if (!$scope.fake) {
          setData($scope._data)
          var cut = ($scope.pages.current - 1) > 0 ? ($scope.pages.current - 1) * $scope.pages.max : 0
          $scope.data = $scope.data.slice(cut)
        }

        if ($scope.changePaginateCallback) {
          $scope.changePaginateCallback({ pages: $scope.pages })
        }
      }

      $scope.clickRow = function (row) {
        if ($scope.clickRowCallback) {
          $scope.clickRowCallback({ row: row })
        }
      }

      // local functions
      function updatePagesTotal(totalItems) {
        $scope.pages.total = []
        var totalPages = Math.ceil(totalItems / $scope.pages.max)
        for (var x = 1; x <= totalPages; x++) $scope.pages.total.push(x)
      }

      function updatePages() {
        if ($scope.pages.current > $scope.pages.total.length) {
          $scope.pages.current = 1
          $scope._lastPagePaginate = 1
        }

        $scope.pages.first = 1
        $scope.pages.last = $scope.pages.total.length
        $scope.pages.previous = (($scope.pages.current - 1) > 0) ? ($scope.pages.current - 1) : 1
        $scope.pages.next = (($scope.pages.current + 1) <= $scope.pages.total.length) ? ($scope.pages.current + 1) : $scope.pages.total.length

        $scope.pages.pagination = getPagination()
      }

      function getPagination() {
        var pagination = 0
        
        if (pagination < $scope.pages.range) pagination = $scope.pages.current - Math.ceil($scope.pages.range/2)
        
        var diffTotalRange = ($scope.pages.total.length - $scope.pages.range)
        if (pagination > diffTotalRange) pagination = diffTotalRange
        
        if (pagination < 0) pagination = 0

        return pagination
      }

      function setData(data) {
        $scope._data = data
        $scope.data = Object.assign([], $scope._data)
      }

      $scope._data = []
      $scope.data = []

      $scope._lastColumnOrderBy = undefined
      $scope._lastPagePaginate = undefined
      $scope._lastTotalPopulatePages = undefined

      // behavior control
      $scope.fake = $scope.fake || false

      // column control
      if (!angular.isArray($scope.columns)){
        throw new Error('minimalGrid error: columns must be an Array')
      }
      $scope.columns.map(function (val) {
        val.class = 'sorting'
      })
        if (angular.isDefined($scope.paginationMax) && !angular.isNumber($scope.paginationMax)){
          throw new Error('minimalGrid error: pagination-max must be a Number')
        }

        if (angular.isDefined($scope.paginationRange) && !angular.isNumber($scope.paginationRange)){
          throw new Error('minimalGrid error: pagination-range must be a Number')
        }
      $scope.pages = {
        first: 1,
        last: 1,
        previous: 1,
        next: 1,
        current: 1,
        total: [1],
        max: $scope.paginationMax || 10,
        range: $scope.paginationRange || 5,
        pagination: 0
      }
    }])

    .directive('minimalGrid', [function(){
      return {
        restrict: 'E',
        scope: {
          columns: '<',
          rows: '<',
          fake: '<?',
          totalRows: '<?',
          paginationMax: '<?',
          paginationRange: '<?',
          changeOrderByCallback: '&?onChangeOrderBy',
          changePaginateCallback: '&?onChangePaginate',
          clickRowCallback: '&?onClickRow'
        },
        controller:'minimalGridCtrl',
        template: 
        '<div ng-bind="statsParse()"></div>' +
        '  <table class="dataTable table table-striped table-bordered table-hover no-footer">' +
        '    <thead>' +
        '      <tr>' +
        '        <th ng-click="changeOrderBy(column)" ng-repeat="column in columns" class="{{ column.class }} {{ column.hide }}">{{ column.title }}</th>' +
        '      </tr>' +
        '    </thead>' +
        '    <tbody>' +
        '      <tr class="odd" ng-repeat="dataRow in data | limitTo : pages.max" ng-click="clickRow(dataRow)" >' +
        '        <td ng-repeat="column in columns" class="{{ columns[$index].hide }}">' +
        '          <span ng-if="!!columns[$index].onRender" ng-bind-html="columnParse(columns[$index].key, dataRow, columns[$index])"></span>' +
        '          <span ng-if="!!!columns[$index].onRender" ng-bind="columnParse(columns[$index].key, dataRow, columns[$index])"></span>' +
        '        </td>' +
        '      </tr>' +
        '    </tbody>' +
        '  </table>' +
        '  <div class="pull-right">' +
        '    <ul class="pagination">' +
        '      <li><a href="#" ng-click="changePaginate(pages.first)">{{ firstButtonLabel }}</a></li>' +
        '      <li>' +
        '        <a href="#" ng-click="changePaginate(pages.previous)">' +
        '          << </a>' +
        '      </li>' +
        '      <li class="{{ ( n == pages.current ? \'active\' : \'\') }}"' +
        '        ng-click="changePaginate(n)" ng-repeat="n in pages.total | limitTo : pages.range : pages.pagination"><a href="#">{{ n }}</a></li>' +
        '      <li><a href="#" ng-click="changePaginate(pages.next)"> >> </a></li>' +
        '      <li><a href="#" ng-click="changePaginate(pages.last)">{{ lastButtonLabel }}</a></li>' +
        '    </ul>' +
        '  </div>' +
        '</div>' +
        '<div class="clearfix"></div>'
      }
    }])


})();
