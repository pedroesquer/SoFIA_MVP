import { ChatGoogle } from '@langchain/google';

let sofiaModel: ChatGoogle | null = null;

export function getSofiaModel(): ChatGoogle {
    if (sofiaModel) {
        return sofiaModel;
    }
    const apiKey = process.env.GEMINI_API_KEY;

    if(!apiKey || apiKey == 'MY_GEMINI_API_KEY') {
        throw new Error(
            'GEMINI_API_KEY no está configurada correctamente.',
        );
    }

    sofiaModel = new ChatGoogle({
        apiKey,
        model: 'gemini-3.1-flash-lite',
        temperature: 0.2,
        maxOutputTokens: 4096,
    });

    return sofiaModel;
}