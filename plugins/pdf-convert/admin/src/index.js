import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
// import App from "./containers/App";
// import Initializer from "./containers/Initializer";
// import lifecycles from "./lifecycles";
import trads from "./translations";
import PdfConverter from "./components/PdfConverter";

export default (strapi) => {
  const pluginDescription =
    pluginPkg.strapi.description || pluginPkg.description;
  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: null, //Initializer,
    injectedComponents: [],
    isReady: true, //false,
    // isRequired: pluginPkg.strapi.required || false,
    // layout: null,
    // lifecycles,
    leftMenuLinks: [],
    leftMenuSections: [],
    mainComponent: null, //App,
    name,
    preventComponentRendering: false,
    trads,
    // menu: {
    //   pluginsSectionLinks: [
    //     {
    //       destination: `/plugins/${pluginId}`,
    //       icon,
    //       label: {
    //         id: `${pluginId}.plugin.name`,
    //         defaultMessage: name,
    //       },
    //       name,
    //       permissions: [
    //         // Uncomment to set the permissions of the plugin here
    //         // {
    //         //   action: '', // the action name should be plugins::plugin-name.actionType
    //         //   subject: null,
    //         // },
    //       ],
    //     },
    //   ],
    // },
  };

  strapi.registerField({ type: "pdfconverter", Component: PdfConverter });

  return strapi.registerPlugin(plugin);
};
