import axios from "axios";
import ConsoleManager from "../logs/ConsoleManager";

declare global {
    var pendingMetadatas: { accessToken: string, body: any }[];
    var pendingMetadatasInterval: NodeJS.Timeout;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!global.pendingMetadatas) {
    global.pendingMetadatas = [];
}

// Only set up interval in non-serverless environments
if (!global.pendingMetadatasInterval && !isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
    global.pendingMetadatasInterval = setInterval(async () => {
        if (global.pendingMetadatas.length > 0) {
            const metadata = global.pendingMetadatas.pop();
            if (!metadata) {
                return;
            }
            const url = `https://discord.com/api/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;

            const response = await axios.put(url, metadata.body, {
                headers: {
                    Authorization: `Bearer ${metadata.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }).catch((err) => {
                ConsoleManager.error('MetadataUtil', 'Error pushing discord metadata: ' + err);
                throw err;
            });

            if (response.status !== 200) {
                ConsoleManager.error('MetadataUtil', `Error pushing discord metadata: [${response.status}] ${response.statusText}`);
            } else {
                ConsoleManager.info('MetadataUtil', 'Discord metadata pushed: ' + JSON.stringify(metadata.body));
            }
        }
    }, 1000);
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
export function pushMetadata(accessToken: string, metadata?: {
    oyuncu: number;
    cirak: number;
    asil: number;
    soylu: number;
    senyor: number;
}) {
    // PUT /users/@me/applications/:id/role-connection
    const body = {
        platform_name: 'IvyMC Role Connection',
        metadata: metadata || {}
    };
    global.pendingMetadatas.push({ accessToken, body });
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
export async function getMetadata(accessToken: string): Promise<{
    metadata: {
        oyuncu: number;
        cirak: number;
        asil: number;
        soylu: number;
        senyor: number;
    };
}> {
    // GET /users/@me/applications/:id/role-connection
    const url = `https://discord.com/api/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (response.status !== 200) {
        throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`);
    }

    return response.data;
}

export async function registerMetadata() {
    const url = `https://discord.com/api/applications/${process.env.CLIENT_ID}/role-connections/metadata`;
    // supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8

    const body = [
        {
            key: 'oyuncu',
            name: 'Oyuncu',
            description: 'Discord hesabını eşlemiş oyuncu',
            type: 7,
        },
        {
            key: 'cirak',
            name: 'Çırak',
            description: 'Çırak rütbesine sahip oyuncu',
            type: 7,
        },
        {
            key: 'asil',
            name: 'Asil',
            description: 'Asil rütbesine sahip oyuncu',
            type: 7,
        },
        {
            key: 'soylu',
            name: 'Soylu',
            description: 'Soylu rütbesine sahip oyuncu',
            type: 7,
        },
        {
            key: 'senyor',
            name: 'Senyor',
            description: 'Senyor rütbesine sahip oyuncu',
            type: 7,
        },
    ];

    const response = await axios.put(url, body, {
        headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
            'Content-Type': 'application/json',
        },
    }).catch((err) => {
        ConsoleManager.error('MetadataUtil', 'Error pushing discord metadata schema: ' + err);
        throw err;
    });

    if (response.status !== 200) {
        throw new Error(`Error pushing discord metadata schema: [${response.status}] ${response.statusText}`);
    } else {
        ConsoleManager.info('MetadataUtil', 'Discord metadata schema registered: ' + JSON.stringify(body));
    }
}