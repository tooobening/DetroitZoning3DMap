require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Home",
  "esri/widgets/Search",
], (Map, SceneView, FeatureLayer, Legend, Home, Search) => {
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
      position: [-83.045753, 42.308429, 2000],
      tilt: 60,
      heading: 20,
    },
  });

  const renderers = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    defaultSymbol: getSymbol("#0080FF80"),
    defaultLabel: "Other",
    visualVariables: [
      {
        type: "size",
        field: "median_hgt",
      },
    ],
  };

  const layerZoning = new FeatureLayer({
    url: "https://services2.arcgis.com/HsXtOCMp1Nis1Ogr/arcgis/rest/services/Detroit_Zoning/FeatureServer",
    title: "Zoning",
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
              fieldName: "ZDESCR",
              label: "Description",
            },
          ],
        },
      ],
    },
    outFields: ["ZONING_REV", "ZDESCR"],
  });

  const layerFootprint = new FeatureLayer({
    url: "https://services1.arcgis.com/xUx8EjNc6egUPYWh/arcgis/rest/services/Building_Footprints/FeatureServer",
    renderer: renderers,
    elevationInfo: {
      mode: "on-the-ground",
    },
    title: "Extruded building footprints", //show on legend
    popupTemplate: {
      // autocasts as new PopupTemplate()
      title: "Building {building_id}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "median_hgt",
              label: "Height (ft)",
            },
            {
              fieldName: "source",
              label: "Source",
            },
          ],
        },
      ],
      outFields: ["median_hgt", "source"],
    },
  });

  map.add(layerFootprint);
  map.add(layerZoning);

  /*****************************************************************
     /*  * Create a function that generates symbols for extruded polygons.
     /* *****************************************************************/

  function getSymbol(color) {
    return {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: color,
          },
          //   edges: {
          //     type: "none",
          //     color: "#999",
          //     size: 0.5,
          //   },
        },
      ],
    };
  }
  const legend = new Legend({
    view: view,
  });
  const homeWidget = new Home({
    view: view,
  });
  const searchWidget = new Search({
    view: view,
  });

  // Add the search widget to the top right corner of the view
  view.ui.add(searchWidget, { position: "top-right" });
  view.ui.add(legend, "bottom-right");
  view.ui.add(homeWidget, "top-left");
});
