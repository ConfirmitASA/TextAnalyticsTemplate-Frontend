var styleBundle = require('./main.css');
// import Highcharts from 'highcharts';
// window.Highcharts = Highcharts;
// import 'highcharts-exporting';
// import 'highcharts-more';

//HighchartsExporting(HighchartsMore(Highcharts));
import ArrayFrom from './polyfills/array-from';
ArrayFrom();

import CustomAdminMenu from './adminMenu/adminMenu';

window.addEventListener('load', function() {
  const customMenu = new CustomAdminMenu();
});

import FixedHeader from './aggregatedTable/FixedHeader.js';
import AggregatedTable from './aggregatedTable/AggregatedTable.js';
//import LazyHierarchyFetch from './aggregatedTable/LazyHierarchyFetch.js';

import SortModule from '../node_modules/r-sort-table';
import ReportalBase from '../node_modules/r-reportal-base';
import TAHierarchyTable from  './aggregatedTable/TAHierarchyTable.js';
//import DefaultConfig from './hitlist/hitlist.js';
import Hitlist from './hitlist/hitlist.js';
import CorrelationView from './correlationChart/correlationview.js';
import WordCloud from './wordCloud/cloud.js';
import TrendChart from './trendChart/trendChart.js';
import CustomerJourneyCards from './customerJourneyCards/customerJourneyCards.js';
import SignificantChangesAlerts from './significantChangesAlerts/significantChangesAlerts.js';



window.Reportal = window.Reportal || {};

ReportalBase.mixin(window.Reportal,{
  FixedHeader,
  AggregatedTable,
  Hitlist,
  TAHierarchyTable,
  SortModule,
  CorrelationView,
  WordCloud,
  TrendChart,
  CustomerJourneyCards,
  SignificantChangesAlerts
});
