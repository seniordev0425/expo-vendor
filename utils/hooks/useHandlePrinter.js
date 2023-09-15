import { useState } from "react";
import moment from "moment";
import {
  scanStarPrinters,
  connectPrinter,
  initStarPrinter,
  openCashDrawer,
  selectPrinter,
  printReceipt,
} from "../printUtil";
import { printer as PRINT_CONSTANT } from "../../constants";

export default function useHandlePrinters({ onScanPrinters }) {
  const [isScanning, setIsScanning] = useState(false);

  const scanPrinters = async () => {
    setIsScanning(true);
    let printers = [];
    try {
      let starPrinters = await scanStarPrinters();
      let actionResult;

      for (let printer of starPrinters || []) {
        actionResult = await connectPrinter({
          ...printer,
          type: PRINT_CONSTANT.PRINTER_TYPE.STAR,
        });
        printers.push(
          initStarPrinter(
            printer,
            PRINT_CONSTANT.PRINTER_TYPE.STAR,
            actionResult ? "on" : "off"
          )
        );
      }
      onScanPrinters(printers);
    } catch (e) {
      console.log(JSON.stringify(error));
    }
    setIsScanning(false);
    // onScanPrinters([
    //   {
    //     id: "generateUuid()",
    //     type: "STAR",
    //     modelName: "BT:TSP100 Bluetooth",
    //     macAddress: "printer.macAddress",
    //     portName: "printer.portName",
    //     printerFunctions: ["RECEIPT"],
    //     status: "on",
    //   },
    // ]);
  };

  const handleReceiptPrinting = (printers, order) => {
    const printer = selectPrinter(
      printers,
      PRINT_CONSTANT.PRINTER_FUNCTION.RECEIPT
    );
    if (printer) {
      printReceipt(printer, order);
    }
  };

  return {
    isScanning,
    scanPrinters,
    handleReceiptPrinting,
  };
}
