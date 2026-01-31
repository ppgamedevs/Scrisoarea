export type LogSeverity = 'INFO' | 'WARN' | 'ERROR'

export function log(message: string, severity: LogSeverity = 'INFO', meta?: any) {
    const timestamp = new Date().toISOString()
    const payload = { timestamp, severity, message, ...meta }

    if (severity === 'ERROR') {
        console.error(JSON.stringify(payload))
    } else if (severity === 'WARN') {
        console.warn(JSON.stringify(payload))
    } else {
        console.log(JSON.stringify(payload))
    }
}
