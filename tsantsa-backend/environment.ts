declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
			BD_PG_USER: string;
			BD_PG_HOST: string;
			BD_PG_DATABASE: string;
			BD_PG_PASSWORD: string;
			BD_PG_PORT: string;
			ALFRESCO_HOST: string;
			ALFRESCO_PORT: string;
			ALFRESCO_USER: string;
			ALFRESCO_PASSWORD: string;
			MAILER_HOST: string;
			MAILER_PORT: string;
			MAILER_SECURE: string;
			MAILER_USER: string;
			MAILER_PASSWORD: string;
			KEY_JWT: string;
			PASS_ENCRYPT: string;
		}
	}
}

export {};
