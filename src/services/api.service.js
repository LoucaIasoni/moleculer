"use strict";

const ApiGateway = require("moleculer-web");


module.exports = {
	name: "api",
	mixins: [ ApiGateway],

	settings: {
		port: process.env.PORT || 9000,

        cors: {
            // Configures the Access-Control-Allow-Origin CORS header.
            origin: "*",
            // Configures the Access-Control-Allow-Methods CORS header.
            methods: ["GET", "PATCH", "OPTIONS", "POST", "PUT", "DELETE"],
            // Configures the Access-Control-Allow-Headers CORS header.
            allowedHeaders: ["Content-Type"],
            // Configures the Access-Control-Expose-Headers CORS header.
            exposedHeaders: [],
            // Configures the Access-Control-Allow-Credentials CORS header.
            credentials: false,
            // Configures the Access-Control-Max-Age CORS header.
            maxAge: 3600
        },

		routes: [

			{
				path: "/status/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				aliases: {
					"GET server": "application.configuration",
					"GET health": "application.health",
					"GET database": "application.database",
					"GET reset": "application.reset"
				}
			},
			{
				//Allowing to request with json body on the path
				bodyParsers: {
	                json: true,
	            },

				path: "/api/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				
				//Methods
				aliases: {
					
						"POST authentification": "authentification.create",

						"GET channeluser": "channel.get",
					
						"POST channel": "channel.create",	
						"GET channels/:id_user": "channel.getChannel",
						"GET channel/:id_channel": "channel.getMessage",
						"POST channel/:id_channel": "channel.postMessage",
						"PUT channel/:id": "channel.edit",
						"DELETE channel/:id": "channel.delete",
										
						
				}
			}, 
			{
				//Allowing to request with json body on the path
				bodyParsers: {
	                json: true,
	            },
				path: "/client/",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				aliases: {
					//	Example project
				}
			}
		]

	}
};
