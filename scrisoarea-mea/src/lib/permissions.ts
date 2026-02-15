
import { UserSession } from "@/lib/auth";

type LetterMinimal = {
    institutionId: string
    status: string
}

/**
 * Checks if a user can donate to a specific letter.
 * Rules:
 * - Anonymous users can donate.
 * - DONOR and SPONSOR users can donate.
 * - PARTNER users can donate ONLY if the letter belongs to a DIFFERENT organization.
 * - PARTNER users CANNOT donate to their own organization's letters (to avoid confusion/accidental payment).
 */
export function canDonate(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return true; // Anonymous

    if (user.role === 'ADMIN') return true; // Admins can test donation flow

    if (user.role === 'DONOR' || user.role === 'SPONSOR') return true;

    if (user.role === 'PARTNER') {
        // Prevent donating to own letters
        if (user.institutionId && user.institutionId === letter.institutionId) {
            return false;
        }
        // Requirement: Partner logged in -> treated as "Partner detected" warning in UI.
        // So we return false here so likely UI shows warning or hides donation module.
        return false;
    }

    return false;
}

/**
 * Checks if a user can manage (edit, upload proof) a specific letter.
 */
export function canManageLetter(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return false;

    if (user.role === 'ADMIN') return true;

    if (user.role === 'PARTNER') {
        return user.institutionId === letter.institutionId;
    }

    return false;
}

export function isPartnerForLetter(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return false;
    return user.role === 'PARTNER' && user.institutionId === letter.institutionId;
}
