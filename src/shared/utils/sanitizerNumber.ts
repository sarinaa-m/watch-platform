export const sanitizerNumber = (text: string) => {
  let str = text.toString();
  const charMap = [
    ['\u0649', '\u06CC'],
    ['\u064A', '\u06CC'],
    ['\u0643', '\u06A9'],
    ['\u0660', '\u0030'],
    ['\u0661', '\u0031'],
    ['\u0662', '\u0032'],
    ['\u0663', '\u0033'],
    ['\u0664', '\u0034'],
    ['\u0665', '\u0035'],
    ['\u0666', '\u0036'],
    ['\u0667', '\u0037'],
    ['\u0668', '\u0038'],
    ['\u0669', '\u0039'],
    ['\u06F0', '\u0030'],
    ['\u06F1', '\u0031'],
    ['\u06F2', '\u0032'],
    ['\u06F3', '\u0033'],
    ['\u06F4', '\u0034'],
    ['\u06F5', '\u0035'],
    ['\u06F6', '\u0036'],
    ['\u06F7', '\u0037'],
    ['\u06F8', '\u0038'],
    ['\u06F9', '\u0039'],
  ];

  charMap.forEach((character) => {
    str = str.replaceAll(character[0], character[1]);
  });
  return str;
};
