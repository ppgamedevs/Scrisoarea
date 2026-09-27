import { GET as llms } from "../llms.txt/route"

export const dynamic = "force-static"

export function GET() {
    return llms()
}
