import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Dynamic Params
        const title = searchParams.get('title') || 'Scrisoarea Mea'
        const subtitle = searchParams.get('subtitle') || 'Îndeplinește o dorință.'
        const label = searchParams.get('label') || 'ONG'
        const progress = searchParams.get('progress')

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        padding: '40px 80px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '40px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#0f172a',
                            borderRadius: '50%',
                            marginRight: '16px'
                        }}></div>
                        <span style={{ fontSize: 32, fontWeight: 'bold', color: '#0f172a' }}>Scrisoarea Mea</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            padding: '4px 12px',
                            borderRadius: '99px',
                            fontSize: 20,
                            alignSelf: 'flex-start',
                            fontWeight: 600
                        }}>
                            {label}
                        </div>
                        <h1 style={{
                            fontSize: 72,
                            fontWeight: 'bold',
                            color: '#0f172a',
                            lineHeight: 1.1,
                            margin: '0',
                            maxWidth: '900px'
                        }}>
                            {title}
                        </h1>
                        <p style={{
                            fontSize: 32,
                            color: '#64748b',
                            marginTop: '10px',
                            maxWidth: '800px'
                        }}>
                            {subtitle}
                        </p>

                        {progress && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: '20px',
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#059669'
                            }}>
                                Finanțat: {progress}%
                            </div>
                        )}
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '80px',
                        fontSize: 20,
                        color: '#94a3b8'
                    }}>
                        scrisoareamea.ro • Verified Platform
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        )
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
