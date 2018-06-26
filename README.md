# angular-minimal-grid

## ATENÇÃO:
### Este repositório é uma copia com algumas modificações pessoais, o repositório original é https://github.com/saulsluz/angular-minimal-grid 

Implementation of data grid using bootstrap (^3.x.x) for angular applications (^1.x.x).

Uses custom style of [dataTable](https://github.com/DataTables/DataTables).

### Installation

#### Bower

`$ bower install angular-minimal-grid`

Embed it in your HTML:

```html
<link href="./bower_components/angular-minimal-grid/css/minimal-grid.css" rel="stylesheet">
<script src="./bower_components/angular-minimal-grid/js/minimal-grid.js"></script>
```

#### NPM

`$ npm install angular-minimal-grid`

Embed it in your HTML:

```html
<link href="./node_modules/angular-minimal-grid/css/minimal-grid.css" rel="stylesheet">
<script src="./node_modules/angular-minimal-grid/js/minimal-grid.js"></script>
```

#### Dependency injection

Inject `angular-minimal-grid` module as a dependency into your app:

```js
var app = angular.module('app', [
  'ngMinimalGrid'
])
```

### Usage

Example of minimum usage:

```html
<minimal-grid columns="myColumns" rows="myRows"></minimal-grid>
```

In controller:

```js
$scope.myColumns = [
  { key: 'name', title: 'Name' },
  { key: 'lastName', title: 'Last Name' },
  { key: 'age', title: 'Age' }
]
$scope.myRows = [
  { name: 'John ', lastName: 'Doe', age: 30 },
  { name: 'Marie ', lastName: 'Doe', age: 28 }
]
```

![image](https://user-images.githubusercontent.com/2475044/27923800-08b6465e-6256-11e7-8319-c32bc53e0dd3.png)

That's all.

### Customization

#### Custom labels

It's suportted custom labels by Provider methods:

|           method          |   property       |          default value             |
| ------------------------- | ---------------- | ---------------------------------- |
| setStatsMessage(`String`) | statsMessage     | `'Showing %1 to %2 of %3 results'` |
| setFirstLabel(`String`)   | firstButtonLabel | `First`                            |
| setLastLabel(`String`)    | lastButtonLabel  | `Last`                             |

```js
app.config(function(minimalGridConfigProvider){
  minimalGridConfigProvider
    .setStatsMessage('Mostrando %1 à %2 de %3 resultados')
    .setFirstLabel('Primeiro')
    .setLastLabel('Último')
})
```

#### Custom rendering

It's suportted custom rendering of cell value: uses `onRender`

```js
$scope.myColumns = [
  { key: 'name', title: 'Name' },
  { key: 'lastName', title: 'Last Name' },
  { key: 'age', title: 'Age', onRender: function(val){
    if (val%2 == 0)
      return '<b>'+val+'</b>' // HTML allowed
    else
      return val
  } }
]
$scope.myRows = [
  { name: 'John ', lastName: 'Doe', age: 30 },
  { name: 'Marie ', lastName: 'Doe', age: 28 }
]
```

#### Max limit per page

Set the max rows peer page. Default is `10`.

```html
<minimal-grid columns="myColumns" rows="myRows"
  pagination-max="15"
  ></minimal-grid>
```

##### Max limit of pagination

Set the range of number's page to show. Default is `5`.

```html
<minimal-grid columns="myColumns" rows="myRows"
  pagination-range="3"
  ></minimal-grid>
```

#### Nested objects

It's suportted nested objects: uses [angular's parse](https://docs.angularjs.org/api/ng/service/$parse).

```js
$scope.myColumns = [
  { key: 'person.user.name', title: 'Name' },
  { key: 'lastName', title: 'Last Name' },
  { key: 'age', title: 'Age' }
]
$scope.myRows = [
  { person: { user: { name: 'John ' } }, lastName: 'Doe', age: 30 },
  { person: { user: { name: 'Marie ' } }, lastName: 'Doe', age: 28 }
]
```

### Getting the control

Keep in mind: this implementation uses the power of callbacks to do anything by out of the grid directive.

The isolated scope binding:

|          property      |   type   | required |
| ---------------------- | -------- | -------- |
| columns                | array    | yes      |
| rows                   | array    | yes      |
| fake                   | bool     |          |
| totalRows              | integer  |          |
| pagination-max         | integer  |          |
| pagination-range       | integer  |          |
| on-change-order-by     | function |          |
| on-change-paginate     | function |          |
| on-click-row           | function |          |

##### on-click-row

If you want to do somenthing when the user clicks on a row just add a binding on a click:

```html
<minimal-grid columns="myColumns" rows="myRows"
  on-click-row="myCallbackClick(row)"
  ></minimal-grid>
```

`row` will be something like this:

```js
{
  name: "John", 
  lastName: "Doe", 
  age: 30
}
```

It's important to pass "row" as parameter: Uses [angular's parameter by reference](https://docs.angularjs.org/guide/directive).

##### on-change-paginate

If you want to do somenthing when the user clicks on a page number (previous or next) just add a binding on a paginate:

```html
<minimal-grid columns="myColumns" rows="myRows"
  on-change-paginate="myCallbackPaginate(pages)"
  ></minimal-grid>
```

`pages` will be something like this:

```js
{
  current: 2,
  first: 1, 
  last: 10, 
  max: 10, 
  next: 3, 
  pagination: 1, 
  previous: 1, 
  range: 5, 
  total: Array(10) 
}
```

It's important to pass "pages" as parameter: Uses [angular's parameter by reference](https://docs.angularjs.org/guide/directive).

##### on-change-order-by

If you want to do somenthing when the user clicks on a header (to change the order by) just add a binding on a order by:

```html
<minimal-grid columns="myColumns" rows="myRows"
  on-change-order-by="myCallbackOrderBy(orderBy)"
  ></minimal-grid>
```

`orderBy` will be something like this:

```js
{
  orderdirection: "asc", 
  orderby: "name"
}
```

It's important to pass "orderby" as parameter: Uses [angular's parameter by reference](https://docs.angularjs.org/guide/directive).

##### fake mode

Here's the trick! Setting `fake="true"` makes the grid perform ordernation and pagination just visualy. This way it's possible to perform yourself ordenation or pagination or whatever you want. Perfect to make async calls and server things.

```html
<minimal-grid columns="myColumns" rows="myRows"
  fake="true"
  ></minimal-grid>
```

Using this mode you will need to set the row's length by setting `totalRows`

```html
<minimal-grid columns="myColumns" rows="myRows"
  fake="true"
  total-rows="myRowsLenght"
  ></minimal-grid>
```

Combine with callbacks and feel the power.

### Tests

To run the package's test, first install the dependencies, then run `npm test`:

```bash
$ npm install --only=dev
$ bower install
```

or 

```bash
$ npm install
```

### License

MIT License
