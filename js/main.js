require([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
], (WebScene, SceneView, FeatureLayer, Legend) => {
  /*****************************************************************
   * Create a function that generates symbols for extruded polygons.
   *****************************************************************/

  function getSymbol(color) {
    return {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: color,
          },
          edges: {
            type: "solid",
            color: "#999",
            size: 0.5,
          },
        },
      ],
    };
  }

  /*****************************************************************
   * Set each unique value directly in the renderer's constructor.
   * At least one field must be used (in this case the "DESCLU" field).
   * The label property of each unique value will be used to indicate
   * the field value and symbol in the legend.
   *
   * The size visual variable sets the height of each building as it
   * exists in the real world according to the "ELEVATION" field.
   *****************************************************************/

  const renderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    defaultSymbol: getSymbol("#FFFFFF"),
    defaultLabel: "Other",
    field: "TYPE",
    //   uniqueValueInfos: [
    //     {
    //       value: "Residential",
    //       symbol: getSymbol("#A7C636"),
    //       label: "Residential"
    //     },
    //     {
    //       value: "Commercial",
    //       symbol: getSymbol("#FC921F"),
    //       label: "Commercial"
    //     },
    //     {
    //       value: "Hotel/Motel",
    //       symbol: getSymbol("#ED5151"),
    //       label: "Hotel/Motel"
    //     },
    //     {
    //       value: "Apartment Rentals",
    //       symbol: getSymbol("#149ECE"),
    //       label: "Apartment Rentals"
    //     }
    //   ],
    visualVariables: [
      {
        type: "size",
        field: "HEIGHT",
        units: "FEET",
      },
    ],
  };

  // Set the renderer on the layer
  const buildingsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/xUx8EjNc6egUPYWh/arcgis/rest/services/Building_Footprints/FeatureServer",
    renderer: renderer,
    elevationInfo: {
      mode: "on-the-ground",
    },
    title: "Extruded building footprints",
    popupTemplate: {
      // autocasts as new PopupTemplate()
      title: "{BUILD_TYPE}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "TYPE",
              label: "Type",
            },
            {
              fieldName: "MEDIAN_HGT",
              label: "Height",
            },
          ],
        },
      ],
    },
    outFields: ["BUILD_TYPE", "HEIGHT"],
  });

  const map = new WebScene({
    portalItem: {
      id: "397c462348464d069a7a63b97644086e",
    },
  });

  map.add(buildingsLayer);

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: [-75.09519011, 38.32524201, 682.98652],
      heading: 53.86,
      tilt: 48.52,
    },
  });

  const legend = new Legend({
    view: view,
  });

  view.ui.add(legend, "bottom-right");
});
