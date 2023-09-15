import { printer as PRINT_CONSTANT } from "../../constants";
import {
  getEmulationFromModalName,
  generateStarReceiptCommands,
} from "./StarPrintCommands";
import { checkBluetoothConnectPermission } from "../permissionUtil";
import { Platform } from "react-native";
import { StarPRNT } from "react-native-star-prnt";

export const connectPrinter = (printer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (printer.type === PRINT_CONSTANT.PRINTER_TYPE.STAR) {
        var emulation = getEmulationFromModalName(printer.modelName);
        await StarPRNT.connect(printer.portName, emulation, false);
        resolve(true);
      } else {
        resolve(true);
      }
    } catch (err) {
      resolve(false);
    }
  });
};

export const disconnectPrinter = (printer) => {
  return new Promise(async (resolve, reject) => {
    try {
      await StarPRNT.disconnect(printer.portName);
      resolve(true);
    } catch (err) {
      resolve(true);
    }
  });
};

export const selectPrinter = (printers, printerFunction) => {
  return printers?.filter((printer) =>
    printer.printerFunctions?.includes(printerFunction)
  )?.[0];
};

export const initStarPrinter = (printer, type, status) => {
  let _printer = {
    type,
    modelName: printer.modelName,
    macAddress: printer.macAddress,
    portName: printer.portName,
    printerFunctions: [PRINT_CONSTANT.PRINTER_FUNCTION.RECEIPT],
    status,
  };
  return _printer;
};

export const scanStarPrinters = async () => {
  try {
    const hasBluetoothPermission = await checkBluetoothConnectPermission();
    if (hasBluetoothPermission) {
      let printers = await StarPRNT.portDiscovery("All");
      return printers;
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
  }
};

export const printReceipt = async (printer, order) => {
  try {
    if (printer.type === PRINT_CONSTANT.PRINTER_TYPE.STAR) {
      var emulation = getEmulationFromModalName(printer.modelName);
      let commands = generateStarReceiptCommands(order);
      console.log("receipt commands", JSON.stringify(commands));
      await StarPRNT.print(emulation, commands, printer.portName);
    }
  } catch (error) {
    return false;
  }
};

export const openCashDrawer = async (printer) => {
  try {
    var emulation = getEmulationFromModalName(printer.modelName);
    let commands = [{ openCashDrawer: 1 }];
    await StarPRNT.print(emulation, commands, printer.portName);
  } catch (error) {}
};
