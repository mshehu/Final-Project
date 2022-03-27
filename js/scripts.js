mapboxgl.accessToken = 'pk.eyJ1IjoibXRzaGVodSIsImEiOiJja3pxcWxhamUwNTZrMnZvdzV5ZGN6emQzIn0.NovLA1r6sNV2eZAHxt2UFA'

// lngLat for the map center location
// var mapCenter = [-73.997456, 40.730831]
var mapCenter = [-73.91704349834193, 40.86702665516237]
var cityBounds = [[-74.333496,40.469935], [-73.653717,40.932190]]
var geocodingBounds = [-74.333496, 40.469935, -73.653717, 40.932190]
// initialize the map
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: mapCenter,
  // bounds: cityBounds, // sets initial bounds instead of center + zoom
  maxBounds: cityBounds, // sets the max bounds, limited where the user can pan to
  zoom: 12,
  minZoom: 8,
  maxZoom: 14
});
// add the mapbox geocoder plugin
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    bbox: geocodingBounds // bounding geocoding search
  })
);
// add navigation controls to the map
map.addControl(new mapboxgl.NavigationControl());

$.getJSON('./data/line.geojson', function(lines) {
  $.getJSON('./data/point.geojson', function(points) {
    // add source and layer when the map is finished loading
    map.on('load', function() {
      map.addSource('nyc-lines', {
        type: 'geojson',
        data: lines
      })
      map.addLayer({
        id: 'nyc-lines-fill',
        type: 'fill',
        source: 'nyc-lines',
        paint: {
          'fill-color': '#81C784', // use the color property assigned above as the fill color
          'fill-opacity': 0.7
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
            'property': 'pedestr',
            'stops': [
                [{zoom: 8, value: 0}, 0],
                [{zoom: 8, value: 1}, 1],
                [{zoom: 8, value: 50}, 1],
                [{zoom: 11, value: 0}, 0],
                [{zoom: 11, value: 1}, 1],
                [{zoom: 11, value: 50}, 4],
                [{zoom: 13, value: 0}, 0],
                [{zoom: 13, value: 0}, 4],
                [{zoom: 13, value: 50}, 20],
            ]
            },
          'circle-color': '#1B5E20'
        }
      })

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

// listen for clicks on the neighborhood flyto buttons
$('.flyto').on('click', function() {
  if ($(this).hasClass('flyto-the-village')) {
    newCenter = [-74.001745,40.729778]
  }

  if ($(this).hasClass('flyto-fidi')) {
    newCenter = [-74.009485,40.707873]
  }

  if ($(this).hasClass('flyto-washington-heights')) {
    newCenter = [-73.941626,40.840029]
  }

  map.flyTo({
    center: newCenter,
    zoom: 12
  })
})

// listen for click on the 'Back to City View' button
$('.reset').on('click', function() {
  map.fitBounds(cityBounds)
})
