mapboxgl.accessToken = 'pk.eyJ1IjoibXRzaGVodSIsImEiOiJja3pxcWxhamUwNTZrMnZvdzV5ZGN6emQzIn0.NovLA1r6sNV2eZAHxt2UFA'

// lngLat for the map center location
var mapCenter = [-73.8882310617716, 40.704560752725975]
var cityBounds = [[-74.333496,40.469935], [-73.653717,40.932190]]


// variable that makes sure there is no search outside this boundary
var geocodingBounds = [-74.333496, 40.469935, -73.653717, 40.932190]


// initialize the map
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v10',
  center: mapCenter,
  // bounds: cityBounds, // sets initial bounds instead of center + zoom
  maxBounds: cityBounds, // sets the max bounds, limited where the user can pan to
  zoom: 6,
  minZoom: 6,
  maxZoom: 14
});
// add the mapbox geocoder plugin
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    bbox: geocodingBounds // bounding geocoding search makes sure there is no search outside this boundary
  })
);
// add navigation controls to the map
map.addControl(new mapboxgl.NavigationControl());

$.getJSON('./data/FINAL ROADS.geojson', function(lines) {
  $.getJSON('./data/intersection.geojson', function(points) {
    // add source and layer when the map is finished loading
    map.on('load', function() {
      map.addSource('nyc-lines', {
        type: 'geojson',
        data: lines
      })
      map.addLayer({
        id: 'nyc-lines-fill',
        type: 'line',
        source: 'nyc-lines',
        paint: {
          'line-color': '#99CCFF', // use the color property assigned above as the fill color
          'line-opacity': 0.8,
          'line-width': {
            'property': 'Count_',
            'stops': [// the stops change the size fo teh features based on zoom level
                [{zoom: 6, value: 0}, 0.1],
                [{zoom: 6, value: 13462}, 2],
                [{zoom: 9, value: 0}, 0.1],
                [{zoom: 9, value: 13462}, 10],
                [{zoom: 11, value: 0}, 0.1],
                [{zoom: 11, value: 13462}, 20],
                [{zoom: 14, value: 0}, 0.1],
                [{zoom: 14, value: 13462}, 30],
            ]
          },
        }
      })
      map.addSource('nyc-points', {
        type: 'geojson',
        data: points
      })
      map.addLayer({
        id: 'nyc-points-fill',
        type: 'circle',
        source: 'nyc-points',
        paint: {
          'circle-radius': {
            'property': 'aksidente',
            'stops': [// the stops change the size fo teh features based on zoom level
                [{zoom: 6, value: 0}, 0.1],
                [{zoom: 6, value: 942}, 2],
                [{zoom: 9, value: 0}, 0.1],
                [{zoom: 9, value: 942}, 10],
                [{zoom: 11, value: 0}, 0.1],
                [{zoom: 11, value: 942}, 20],
                [{zoom: 14, value: 0}, 0.1],
                [{zoom: 14, value: 942}, 30],
            ]
            },
          'circle-color': '#33CCFF'
        }
      })

      // makes sure that the points layer is on top of the hierarchy so when both toggles are selected it will give the attributes of the layer on top
      map.moveLayer('nyc-points-fill')

      // listen layer toggles
      $('.toggle-lines').on('click', function() {
        if ($(this).hasClass('btn-toggled')) {
          map.setLayoutProperty('nyc-lines-fill', 'visibility', 'none');
        } else {
          map.setLayoutProperty('nyc-lines-fill', 'visibility', 'visible');
        }

        $(this).toggleClass('btn-toggled')
      })
      $('.toggle-points').on('click', function() {
        if ($(this).hasClass('btn-toggled')) {
          map.setLayoutProperty('nyc-points-fill', 'visibility', 'none');
        } else {
          map.setLayoutProperty('nyc-points-fill', 'visibility', 'visible');
        }

        $(this).toggleClass('btn-toggled')
      })
    })
  })
})

map.on('click', function(e) {
  var features = map.queryRenderedFeatures(e.point)
  if (features.length == 0) {
    return
  }

  var isIntersection = features[0].layer.id == 'nyc-points-fill';

  var featureProperties = features[0].properties
  var featureGeometry = features[0].geometry // get features on click

  var accidents = ''
  var streets = ''
  var borocode = ''

// get 3 attributes from each layer
  if (isIntersection) {//if the intersections are selected get their attributes
    accidents = featureProperties['aksidente']
    streets = featureProperties['full_stree']
    borocode = featureProperties['borocode']
  } else {// if intersections are not selected but the roads are then get roads attributes
    accidents = featureProperties['Count_']
    streets = featureProperties['full_stree']
    borocode = featureProperties['borocode']
  }

  if (streets !== undefined) {
    $('#point-details').html(`
        <h5>Details</h5>
        <p>Street: ${streets}</p>
        <p>Accidents: ${accidents}</p>
        <p>Borocode: ${borocode}</p>
    `)
        
  } else {
    $('#point-details').html('')
  }
})

// listen for clicks on the neighborhood flyto buttons
$('.flyto').on('click', function() {
  if ($(this).hasClass('flyto-Manhattan')) {
    newCenter = [-73.9706495110109,40.77582506463117]
  }

  if ($(this).hasClass('flyto-Brooklyn')) {
    newCenter = [-73.9490201778399,40.643880280459726]
  }

  if ($(this).hasClass('flyto-Queens')) {
    newCenter = [-73.89786508759006,40.73473422098975]
  }

  if ($(this).hasClass('flyto-Bronx')) {
    newCenter = [-73.8772657223384,40.844166784160755]
  }

  if ($(this).hasClass('flyto-Staten-Island')) {
    newCenter = [-74.13725347311275,40.5949246588476]
  }

  map.flyTo({
    center: newCenter,
    zoom: 11
  })
})

// listen for click on the 'Back to City View' button
$('.reset').on('click', function() {
  map.fitBounds(cityBounds)
})
