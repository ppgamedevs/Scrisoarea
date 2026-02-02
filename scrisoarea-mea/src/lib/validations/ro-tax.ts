export function validateCNP(cnp: string): boolean {
    if (cnp.length !== 13) return false;
    if (!/^\d+$/.test(cnp)) return false;

    const controlKey = "279146358279";
    let sum = 0;

    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnp[i]) * parseInt(controlKey[i]);
    }

    let remainder = sum % 11;
    if (remainder === 10) remainder = 1;

    return remainder === parseInt(cnp[12]);
}

export function validateCUI(cui: string): boolean {
    if (!cui || typeof cui !== 'string') return false;

    const cleanCui = cui.replace(/^ro/i, '').trim();

    if (!/^\d+$/.test(cleanCui)) return false;
    if (cleanCui.length > 10 || cleanCui.length < 2) return false;

    const controlKey = "753217532";
    const cuiDigits = cleanCui.split('').map(Number);
    const controlDigits = controlKey.split('').reverse().map(Number); // Align from right? 
    // Standard algorithm:
    // Align control key to CUI from right? No, standard is 753217532 aligned to CUI digits 
    // BUT usually key is 753217532 (length 9).
    // If CUI is short, we pad or just use corresponding weights.
    // The standard test key is 753217532.
    // Let's implement robust one.

    // Reverse CUI to align with weights if that's the method, OR:
    // Weights: 7 5 3 2 1 7 5 3 2
    // CUI 123456 (6 digits). Last is control.
    // 1*7 + 2*5 + 3*3 + 4*2 + 5*1 => sum.

    const vCui = cleanCui.substr(0, cleanCui.length - 1);
    const controlDigit = parseInt(cleanCui.substr(cleanCui.length - 1));

    const weight = "753217532";
    let sum = 0;

    // Pad vCui to match weight length? No. 
    // We reverse both to align from right (excluding control digit).
    // Actually, algorithm is: apply weights from right to left?
    // RO CUI Algorithm:
    // Key: 753217532.
    // Reverse CUI (without last digit).
    // clean: 123456. vCui: 12345.
    // Reversed vCui: 54321.
    // Key Reversed: 235712357.
    // Multiply & Sum.

    const vCuiRev = vCui.split('').reverse().join('');
    const weightRev = weight.split('').reverse().join('');

    for (let i = 0; i < vCuiRev.length; i++) {
        sum += parseInt(vCuiRev[i]) * parseInt(weightRev[i]);
    }

    let result = (sum * 10) % 11;
    if (result === 10) result = 0;

    return result === controlDigit;
}

export function extractBirthYearFromCNP(cnp: string): number | null {
    if (!validateCNP(cnp)) return null;
    // S AA LL ZZ ...
    // S: 1,2 (1900-1999), 5,6 (2000-2099)
    const s = parseInt(cnp[0]);
    const yearPart = parseInt(cnp.substr(1, 2));

    let century = 1900;
    if (s === 5 || s === 6) century = 2000;
    if (s === 3 || s === 4) century = 1800;

    return century + yearPart;
}
