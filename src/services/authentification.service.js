"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
	name: "authentification",

	settings: {
 		state: {

 		}
	},

	actions: {

		create: {
			params: {
				email: "string",
				lastname: "string",
				firstname: "string"
			},
			handler(ctx) {
                var user = new Models.User(ctx.params).create();
                
                if (user) {
					return Database()
						.then((db) => {
							var allUsers = db.get("users");

                            if(allUsers.find({ "email": user.email }).value()) {

                                if(allUsers.find({ "isAdmin": true }).value()) {

                                        var userf = db.get("users").find({ email: ctx.params.email }).value();
                                        return userf.id;

                                }
                                else{
                                    throw new MoleculerError("users", 401, "ERR_CRITICAL", { code: 401, message: "Email already exists."} )
                                }	
                            }                            
							return allUsers
								.push(user)
								.write()
								.then(() => {
									ctx.call("channel.create", { id_user: user.id, firstname: user.firstname, lastname: user.lastname });
									return user.id;
								})
								.catch(() => {
									throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("users", 417, "ERR_CRITICAL", { code: 417, message: "User is not valid." } )
				}
			}
		},

		

	}
};
