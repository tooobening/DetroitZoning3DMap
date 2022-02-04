require(["esri/Map", "esri/views/SceneView", "esri/layers/FeatureLayer"], (
  Map,
  SceneView,
  FeatureLayer
) => {
  // Create Map
  const map = new Map({
    basemap: "dark-gray-vector",
    ground: "world-elevation",
  });

  // Create the SceneView
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: [-83.045753, 42.331429, 707],
      tilt: 81,
      heading: 50,
    },
  });

  const layer = new FeatureLayer({
    url: "https://uw-mad.maps.arcgis.com/home/item.html?id=201984878b3b456a924f2a5ea391af02",
    popupTemplate: {
      // autocasts as new PopupTemplate()
      title: "{ZONING_REV}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "ZONING_REV",
              label: "Zoning",
            },
            {
              fieldName: "ZDESCR_N",
              label: "Description",
            },
          ],
        },
      ],
    },
  });

  map.add(layer);
});
