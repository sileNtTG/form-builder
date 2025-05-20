// import { promises as fs } from "fs";
// import * as path from "path";
// import { useServerFormImporter } from "../composables/useServerFormImporter";
// import { fileURLToPath } from "url";

// // Recreate __dirname for ES modules if running in an ESM context
// // For ts-node, ensure your tsconfig.json has "module": "NodeNext" or similar, or ts-node handles it.
// // If import.meta.url is problematic, paths might need to be relative to process.cwd()
// let currentDir = "";
// try {
//   const __filename = fileURLToPath(import.meta.url);
//   currentDir = path.dirname(__filename);
// } catch (e) {
//   // Fallback for environments where import.meta.url might not be set up as expected by ts-node
//   // or if not running as a module.
//   currentDir = __dirname; // This would work if in CommonJS context
//   if (typeof currentDir === "undefined") {
//     currentDir = process.cwd() + "/src/test-files"; // Best guess fallback
//     console.warn(
//       "Warning: Could not determine script directory reliably. Assuming 'src/test-files' relative to CWD."
//     );
//   }
// }

// async function main() {
//   try {
//     // Adjust path resolution if necessary
//     const responseJsonPath = path.resolve(currentDir, "user/Response.json");
//     const serverJsonString = await fs.readFile(responseJsonPath, "utf-8");
//     const serverJson = JSON.parse(serverJsonString);

//     if (!serverJson.attributes || !serverJson.attributes.name) {
//       console.error(
//         "Error: Input JSON 'Response.json' must have 'attributes.name' to determine output filename."
//       );
//       process.exit(1); // Exit with error
//     }
//     const formName = serverJson.attributes.name;

//     const { transformServerFormToVisual } = useServerFormImporter();
//     // The transformServerFormToVisual expects an object with a 'children' property.
//     // The root of Response.json itself is the 'form' definition, and its 'children' are the elements.
//     const visualElements = transformServerFormToVisual({
//       children: serverJson.children,
//     });

//     const outputFileName = `${formName}.visual.json`;
//     const outputPath = path.resolve(currentDir, "user", outputFileName);
//     await fs.writeFile(outputPath, JSON.stringify(visualElements, null, 2));

//     console.log(`Successfully transformed form '${formName}'.`);
//     console.log(`Output saved to: ${outputPath}`);
//     // To see the output directly in the console, uncomment the next line:
//     // console.log('\nTransformed Elements:\n', JSON.stringify(visualElements, null, 2));
//   } catch (error) {
//     console.error("\nError during transformation script execution:");
//     console.error(error);
//     process.exit(1); // Exit with error
//   }
// }

// main();
