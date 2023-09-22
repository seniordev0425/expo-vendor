import * as _ from "lodash";
import moment from "moment";
import { isEmpty, groupBy, sumBy, find } from "lodash";
import { Images } from "../../constants";
import { Asset } from "expo-asset";
import config from "../../config";

const EMULATIONS = {
  mPOP: "StarPRNT",
  FVP10: "StarLine",
  TSP100: "StarGraphic",
  TSP650II: "StarLine",
  TSP700II: "StarLine",
  TSP800II: "StarLine",
  SP700: "StarDotImpact",
  "SM-S210i": "EscPosMobile",
  "SM-S220i": "EscPosMobile",
  "SM-S230i": "EscPosMobile",
  "SM-T300i/T300": "EscPosMobile",
  "SM-T400i": "EscPosMobile",
  "SM-L200": "StarPRNT",
  "SM-L300": "StarPRNT",
  BSC10: "EscPos",
  "SM-S210i StarPRNT": "StarPRNT",

  "SM-S220i StarPRNT": "StarPRNT",
  "SM-S230i StarPRNT": "StarPRNT",
  "SM-T300i/T300 StarPRNT": "StarPRNT",
  "SM-T400i StarPRNT": "StarPRNT",
};

export const getEmulationFromModalName = (modalName) => {
  for (let modal in EMULATIONS) {
    if (modalName.includes(modal)) return EMULATIONS[modal];
  }
  return "StarGraphic";
};

export const STAR_PRINT_FONTS = {
  FONT_LARGE_60: {
    size: 60,
    charLen: 16,
  },
  FONT_LARGE_54: {
    size: 54,
    charLen: 18,
  },
  FONT_LARGE_46: {
    size: 46,
    charLen: 20,
  },
  FONT_LARGE_44: {
    size: 44,
    charLen: 22,
  },
  FONT_LARGE_42: {
    size: 42,
    charLen: 23,
  },
  FONT_LARGE_40: {
    size: 40,
    charLen: 24,
  },
  FONT_LARGE: {
    size: 28,
    charLen: 33,
  },
  FONT_MEDIUM: {
    size: 24,
    charLen: 41,
  },
};

const wordChunk = (words, maxLength) => {
  result = [];
  chunk = "";
  for (let index = 0; index < words.length; index++) {
    word = words[index];
    if (chunk.length + word.length + 1 < maxLength) {
      chunk += word + " ";
    } else {
      result.push(chunk);
      chunk = word + " ";
    }
  }
  if (chunk.length > 0) {
    result.push(chunk);
  }
  return result;
};

export const makeLine = (text, font) => {
  var length = font.charLen;
  if (text.length < length) {
    //returns a single command object
    return [{ appendRasterText: text, fontSize: font.size }];
  } else {
    words = _.split(text, " ");
    textChunks = wordChunk(words, length);

    //returns an array of command objects
    return [
      ...textChunks.map((textChunk) => {
        return { appendRasterText: textChunk, fontSize: font.size };
      }),
    ];
  }
};

export const makeCenterLine = (text, font) => {
  var length = font.charLen;
  if (text.length < length) {
    remainingLength = length - text.length;
    sidePad = Math.floor(remainingLength / 2);
    paddedText = _.pad(text, length);
    //returns a single command object
    return [{ appendRasterText: paddedText, fontSize: font.size }];
  } else {
    words = _.split(text, " ");
    textChunks = wordChunk(words, length);

    //returns an array of command objects
    return [
      ...textChunks.map((textChunk) => {
        remainingLength = length - textChunk.length;
        sidePad = Math.floor(remainingLength / 2);
        paddedText = _.pad(textChunk, length);
        return { appendRasterText: paddedText, fontSize: font.size };
      }),
    ];
  }
};

export const makeRightLine = (right, font) => {
  var length = font.charLen;
  let line = _.padStart(right, length, " ");
  return { appendRasterText: line, fontSize: font.size };
};

export const makeLeftRightCenterLine = (
  left,
  center,
  right,
  font,
  leftLenInPercent = 50
) => {
  var length = font.charLen;
  var length1 = parseInt((length * leftLenInPercent) / 100) - 1;
  var length2 = length - length1;
  if (length > left.length + center.length + right.length + 1) {
    let line1 = _.padEnd(left, length1, " ");
    let line2 = center + _.padStart(right, length2 - center.length, " ");
    return { appendRasterText: line1 + line2, fontSize: font.size };
  } else {
    let leftWords = _.split(left, " ");
    let leftTextChunks = wordChunk(leftWords, length1);
    let lines = [];
    for (let index = 0; index < leftTextChunks.length; index++) {
      const leftTextChunk = leftTextChunks[index];

      if (index === 0) {
        line = _.padEnd(leftTextChunk, length1, " ");
        right = center + _.padStart(right, length2 - center.length, " ");
        line += right;
        lines.push(line);
      } else {
        lines.push(leftTextChunk);
      }
    }
    return lines.map((line) => {
      return { appendRasterText: line, fontSize: font.size };
    });
  }
};

export const makeLeftRightLine = (left, right, font) => {
  var length = font.charLen;
  if (left.length + 1 < length && left.length + right.length + 1 < length) {
    line = left + " ";
    remainingLength = length - line.length;
    right = _.padStart(right, remainingLength, " ");
    line += right;
    return { appendRasterText: line, fontSize: font.size };
  } else {
    leftWords = _.split(left, " ");
    leftTextChunks = wordChunk(leftWords, length);
    lines = [];

    for (let index = 0; index < leftTextChunks.length; index++) {
      const leftTextChunk = leftTextChunks[index];

      if (index === 0) {
        line = leftTextChunk + " ";
        remainingLength = length - line.length;
        right = _.padStart(right, remainingLength, " ");
        line += right;
        lines.push(line);
      } else {
        lines.push(leftTextChunk);
      }
    }

    return lines.map((line) => {
      return { appendRasterText: line, fontSize: font.size };
    });
  }
};

export const makeSeparateLine = (font) => {
  return { appendRasterText: "-".repeat(font.charLen), fontSize: font.size };
};

export const makeBr = (number, font) => {
  let arr = [];
  for (let i = 0; i < number; i++) {
    arr.push({ appendRasterText: "\n", fontSize: font.size });
  }
  return arr;
};

export const makeQrCode = (code, cell, position) => {
  return {
    appendQrCode: code,
    QrCodeModel: "No2",
    QrCodeLevel: "L",
    cell: cell,
    absolutePosition: position,
  };
};

export const makeBarcode = (code, width, height, position) => {
  return {
    appendBarcode: "{B" + code,
    BarcodeSymbology: "Code128",
    BarcodeWidth: width,
    height,
    hri: false,
    absolutePosition: position,
  };
};

export const makeBitmap = (logo) => {
  return {
    appendBitmap: logo,
    diffusion: true,
    width: 300,
    bothScale: true,
    absolutePosition: 150,
  };
};

const getItemName = (item) => {
  return item.name;
};

export const generateStarReceiptCommands = (order) => {
  let commands = [];
  try {
    commands = commands.concat(
      makeRightLine(`Date: ${order.time_created}`, STAR_PRINT_FONTS.FONT_MEDIUM)
    );
    commands = commands.concat(makeBr(1, STAR_PRINT_FONTS.FONT_MEDIUM));
    commands = commands.concat(
      makeCenterLine(`Order: #${order.id}`, STAR_PRINT_FONTS.FONT_LARGE_40)
    );
    commands = commands.concat(makeBr(1, STAR_PRINT_FONTS.FONT_MEDIUM));
    commands = commands.concat(
      makeCenterLine(order.restorant?.name, STAR_PRINT_FONTS.FONT_LARGE)
    );
    commands = commands.concat(makeBr(1, STAR_PRINT_FONTS.FONT_MEDIUM));
    if (order.delivery_method === 1 || order.delivery_method === 2) {
      // Delivery, Takeaway order
      commands = commands.concat(
        makeLine(
          order.delivery_method === 1 ? "Delivery order" : "Pickup order",
          STAR_PRINT_FONTS.FONT_MEDIUM
        )
      );
      commands = commands.concat(
        makeLine(
          `Client name: ${order.client?.name}`,
          STAR_PRINT_FONTS.FONT_MEDIUM
        )
      );
      commands = commands.concat(
        makeLine(`Client phone: ${order.phone}`, STAR_PRINT_FONTS.FONT_MEDIUM)
      );
      commands = commands.concat(
        makeLine(`Time: ${order.time_formated}`, STAR_PRINT_FONTS.FONT_MEDIUM)
      );
    }
    if (order.delivery_method === 3) {
      // Table order
      const tableAssigned = order.tableassigned?.[0];
      if (tableAssigned) {
        commands = commands.concat(
          makeLine(
            `Area: ${tableAssigned.restoarea?.name}`,
            STAR_PRINT_FONTS.FONT_MEDIUM
          )
        );
        commands = commands.concat(
          makeLine(`Table: ${tableAssigned.name}`, STAR_PRINT_FONTS.FONT_MEDIUM)
        );
      }
    }
    if (order.comment?.length > 1) {
      commands = commands.concat(
        makeLine(`Comment: ${order.comment}`, STAR_PRINT_FONTS.FONT_MEDIUM)
      );
    }
    commands = commands.concat(
      makeLeftRightCenterLine(
        "Item",
        "Qty",
        "Subtotal",
        STAR_PRINT_FONTS.FONT_MEDIUM,
        65
      )
    );
    commands = commands.concat(makeSeparateLine(STAR_PRINT_FONTS.FONT_MEDIUM));
    order.items.forEach((item) => {
      commands = commands.concat(
        makeLeftRightCenterLine(
          getItemName(item),
          item.pivot.qty?.toString(),
          `A$${(item.price * item.pivot.qty)?.toFixed(2)}`,
          STAR_PRINT_FONTS.FONT_MEDIUM,
          65
        )
      );
    });
    commands = commands.concat(
      makeRightLine(
        `Tax Inc.  A$${order.vatvalue?.toFixed(2)}`,
        STAR_PRINT_FONTS.FONT_MEDIUM
      )
    );
    if (order.delivery_method === 1) {
      commands = commands.concat(
        makeRightLine(
          `Delivery  A$${order.delivery_price?.toFixed(2)}`,
          STAR_PRINT_FONTS.FONT_MEDIUM
        )
      );
    }
    commands = commands.concat(makeBr(1, STAR_PRINT_FONTS.FONT_MEDIUM));
    commands = commands.concat(
      makeLine(
        `Total       A$${(order.order_price + order.delivery_price)?.toFixed(
          2
        )}`,
        STAR_PRINT_FONTS.FONT_MEDIUM
      )
    );
    commands = commands.concat(makeBr(1, STAR_PRINT_FONTS.FONT_MEDIUM));
    commands = commands.concat(
      makeCenterLine("Powered by", STAR_PRINT_FONTS.FONT_LARGE)
    );
    commands = commands.concat(
      makeCenterLine(config.APP_NAME.toUpperCase(), STAR_PRINT_FONTS.FONT_LARGE)
    );

    commands.push({ appendCutPaper: "PartialCutWithFeed" });
  } catch (e) {
    console.log("error", e);
  }
  return commands;
};
