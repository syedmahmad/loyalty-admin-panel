import { v4 as uuidv4 } from "uuid";
export const numberToOrdinal = (n: any) => {
  if (typeof n !== "number" || n < 1 || n > 9) {
    throw new Error("Input must be a number between 1 and 9.");
  }

  const suffixes = ["th", "st", "nd", "rd"];
  const exception = [11, 12, 13]; // Numbers that are exceptions to the rule

  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  let suffix;
  if (exception.includes(lastTwoDigits)) {
    suffix = "th";
  } else {
    suffix = suffixes[lastDigit < 4 ? lastDigit : 0];
  }

  return `${n}${suffix} Owner`;
};

export const generateRandomCode = () => {
  const hex = uuidv4().replace(/-/g, "").slice(0, 8);
  const chunks = hex.match(/.{1,4}/g) || [];

  return chunks
    .map((part) => parseInt(part, 16).toString(36))
    .join("")
    .slice(0, 6)
    .toUpperCase();
};

export const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
};
